#!/usr/bin/env python3
"""Credential pattern scan. Scans the files touched by this run's diff, or
every tracked file when there is no prior commit to diff against (a first
run). Reports only the file and line number of a match, never the matched
text (PR-10).
"""
import json
import os
import re
import subprocess
import sys

FAIL = False

# Each pattern asserts a credential SHAPE, never a bare word. This repository
# discusses the privileged role by name in its own policy documents (ADR.md,
# ARCHITECTURE.md, B2S_PREPARE_PHASE.md) as part of stating why it must never
# appear in code — a bare-word match cannot tell that prose from a leak.
# Matching only "keyword, then an assignment, then a long token" catches the
# actual shape a leaked value takes and leaves the policy prose alone.
PATTERNS = {
    "Supabase privileged-role key assignment": re.compile(
        r"service[_-]?role(?:[_-]?key)?[\"']?\s*[:=]\s*[\"']?[A-Za-z0-9._+/=-]{20,}",
        re.I,
    ),
    "Supabase connection string": re.compile(
        r"postgres(?:ql)?://[^\s'\"]*:[^\s'\"]*@[^\s'\"]*supabase[^\s'\"]*", re.I
    ),
    "JWT-shaped token": re.compile(
        r"eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}"
    ),
    "PEM private-key header": re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
}

ENV_FILE = re.compile(r"(^|/)\.env$")


def fail(msg):
    global FAIL
    print(f"FAIL: {msg}")
    FAIL = True


def run(args):
    return subprocess.run(args, capture_output=True, text=True, check=False)


def tracked_files():
    r = run(["git", "ls-files"])
    return [f for f in r.stdout.splitlines() if f]


def scan_file(path):
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            for lineno, line in enumerate(f, start=1):
                for name, pattern in PATTERNS.items():
                    if pattern.search(line):
                        fail(f"{name} matched at {path}:{lineno}")
    except (IsADirectoryError, FileNotFoundError, PermissionError):
        pass


def changed_files():
    """Files touched by this run's diff. None means: no base to diff against,
    so the caller falls back to a whole-tree scan."""
    event_name = os.environ.get("GITHUB_EVENT_NAME", "")
    event_path = os.environ.get("GITHUB_EVENT_PATH")
    event = {}
    if event_path and os.path.exists(event_path):
        with open(event_path, encoding="utf-8") as f:
            event = json.load(f)

    base = head = None
    if event_name == "pull_request":
        base = event.get("pull_request", {}).get("base", {}).get("sha")
        head = event.get("pull_request", {}).get("head", {}).get("sha")
    elif event_name == "push":
        before = event.get("before")
        after = event.get("after")
        if before and before != "0" * 40:
            base, head = before, after

    if base and head:
        r = run(["git", "diff", "--name-only", "--diff-filter=d", base, head])
        return [p for p in r.stdout.splitlines() if p]

    # No CI event context: a local run. Diff against HEAD plus untracked
    # files, which is what the next commit would actually introduce.
    r = run(["git", "rev-parse", "--verify", "HEAD"])
    if r.returncode == 0:
        r = run(["git", "diff", "--name-only", "--diff-filter=d", "HEAD"])
        diffed = [p for p in r.stdout.splitlines() if p]
        r2 = run(["git", "ls-files", "--others", "--exclude-standard"])
        untracked = [p for p in r2.stdout.splitlines() if p]
        combined = sorted(set(diffed) | set(untracked))
        if combined:
            return combined
    return None


def main():
    files = changed_files()
    scope = "diff" if files is not None else "whole tree (first run)"
    targets = files if files is not None else tracked_files()

    for path in tracked_files():
        if ENV_FILE.search(path):
            fail(f".env file tracked at {path}")

    for path in targets:
        if os.path.isfile(path):
            scan_file(path)

    if FAIL:
        sys.exit(1)
    print(f"OK: scanned {len(targets)} file(s) [{scope}], no credential pattern found")


if __name__ == "__main__":
    main()
