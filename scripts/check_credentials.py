#!/usr/bin/env python3
"""Credential pattern scan. Scans the files touched by this run's diff, or
every tracked file when there is no prior commit to diff against (a first
run). Reports only the file and line number of a match, never the matched
text (PR-10).

PR-27 — this check states the minimum it expected to examine and fails when it
examined less. It used to print "OK: scanned 0 file(s)" and exit 0 wherever
`git ls-files` returned nothing: outside a repository, in an empty one, or when
git refuses the directory. A credential scan that opened no file is the most
dangerous shape a green check can take.
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
#
# The assignment pattern excludes an environment indirection on the value side.
# Reading the key from the environment is the prescribed safe form (ADR-005), and
# `serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY` is a 37-character token
# by shape while carrying no secret. Without the exclusion the guard fails on the
# one construction the architecture requires, and a permanently red guard is read
# by nobody. A quoted value is still matched: the exclusion sits before the
# optional quote, so only a bare env read is let through.
PATTERNS = {
    "Supabase privileged-role key assignment": re.compile(
        r"service[_-]?role(?:[_-]?key)?[\"']?\s*[:=]\s*"
        r"(?!process\.env|import\.meta\.env|Deno\.env|os\.environ|os\.getenv)"
        r"[\"']?[A-Za-z0-9._+/=-]{20,}",
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

MINIMUM_FILES = 1


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
        changed = [p for p in r.stdout.splitlines() if p]
        if changed:
            return changed
        # An empty diff is not an empty scan set. It means this run has no
        # scope narrower than the whole tree — an empty commit, or a push whose
        # tree is unchanged — so widen rather than report a clean zero.
        return None

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
    tracked = tracked_files()
    if not tracked:
        fail(
            "no tracked file found. `git ls-files` returned nothing, so this "
            "check's scan root — the repository working tree — is empty or "
            "unreadable. Zero files scanned is not a pass (PR-27)"
        )
        sys.exit(1)

    files = changed_files()
    scope = "diff" if files is not None else "whole tree (no diff scope)"
    targets = files if files is not None else tracked

    for path in tracked:
        if ENV_FILE.search(path):
            fail(f".env file tracked at {path}")

    opened = 0
    for path in targets:
        if os.path.isfile(path):
            scan_file(path)
            opened += 1

    if FAIL:
        sys.exit(1)

    if opened < MINIMUM_FILES:
        fail(
            f"{opened} file(s) opened out of {len(targets)} target(s) [{scope}], "
            f"minimum {MINIMUM_FILES}. Every target named by this scan's root is "
            f"absent from disk, so nothing was examined (PR-27)"
        )
        sys.exit(1)

    print(
        f"OK: scanned {opened} file(s) [{scope}], minimum {MINIMUM_FILES}, "
        f"{len(tracked)} tracked, no credential pattern found"
    )


if __name__ == "__main__":
    main()
