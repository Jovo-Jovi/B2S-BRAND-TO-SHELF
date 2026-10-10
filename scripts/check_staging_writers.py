#!/usr/bin/env python3
"""Staging writers share one concurrency group. P03-T25-FIX.

A job receives staging write credentials when one of its env lines maps a
value to secrets.SUPABASE_STAGING_URL, secrets.SUPABASE_STAGING_PUBLISHABLE_KEY,
or secrets.SUPABASE_STAGING_SERVICE_ROLE_KEY. Those are the credentials that
create a member, a tenant, or an object. The types job's project id and
access token are a read, and that job is not in this set.

Every such job declares concurrency group tenant-isolation-staging with
cancel-in-progress false, on the job or on the workflow. The floor is three
jobs: isolation, browser and onboarding-tail. Removing or emptying any one
of those workflows examines fewer and does not report success (PR-27).
"""
import glob
import os
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORKFLOWS = os.path.join(REPO, ".github", "workflows")
GROUP = "tenant-isolation-staging"
MINIMUM_WRITERS = 3
REQUIRED = (
    ".github/workflows/isolation.yml",
    ".github/workflows/browser.yml",
    ".github/workflows/onboarding-tail.yml",
)
WRITE_SECRETS = (
    "secrets.SUPABASE_STAGING_URL",
    "secrets.SUPABASE_STAGING_PUBLISHABLE_KEY",
    "secrets.SUPABASE_STAGING_SERVICE_ROLE_KEY",
)

FAIL = False


def fail(message):
    global FAIL
    print(f"FAIL: {message}")
    FAIL = True


def die(message):
    print(f"FAIL: {message}")
    sys.exit(1)


def indent_of(line):
    return len(line) - len(line.lstrip(" "))


def unquote(value):
    value = value.strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in ("'", '"'):
        return value[1:-1]
    return value


def concurrency_block(lines, at):
    """The group and cancel-in-progress of a concurrency key at this indent.
    None when that key is absent. A present block that omits either field
    returns the fields it has, with the missing one as None."""
    key = " " * at + "concurrency:"
    for index, line in enumerate(lines):
        if line.strip() == "" or line.lstrip().startswith("#"):
            continue
        if line != key and not line.startswith(key):
            continue
        if indent_of(line) != at or line.strip() != "concurrency:":
            continue
        found = {"group": None, "cancel": None}
        for later in lines[index + 1:]:
            if later.strip() == "" or later.lstrip().startswith("#"):
                continue
            if indent_of(later) <= at:
                break
            stripped = later.strip()
            if stripped.startswith("group:"):
                found["group"] = unquote(stripped.split(":", 1)[1])
            elif stripped.startswith("cancel-in-progress:"):
                found["cancel"] = unquote(stripped.split(":", 1)[1])
        return found
    return None


def jobs_of(text):
    """Each job is (name, body lines). A job begins at indent 2 under jobs:."""
    lines = text.splitlines()
    start = None
    for index, line in enumerate(lines):
        if line == "jobs:":
            start = index + 1
            break
    if start is None:
        return []
    jobs = []
    current = None
    body = []
    for line in lines[start:]:
        if line.strip() == "" or line.lstrip().startswith("#"):
            if current is not None:
                body.append(line)
            continue
        if indent_of(line) == 0:
            break
        if indent_of(line) == 2 and line.rstrip().endswith(":") and not line.strip().startswith("-"):
            if current is not None:
                jobs.append((current, body))
            current = line.strip()[:-1]
            body = []
            continue
        if current is not None:
            body.append(line)
    if current is not None:
        jobs.append((current, body))
    return jobs


def receives_write_credentials(body):
    for line in body:
        stripped = line.strip()
        if stripped.startswith("#"):
            continue
        for secret in WRITE_SECRETS:
            if secret in stripped:
                return True
    return False


def covered(workflow_concurrency, job_body):
    own = concurrency_block(job_body, 4)
    chosen = own if own is not None else workflow_concurrency
    if chosen is None:
        return False, "no concurrency group"
    if chosen["group"] != GROUP:
        return False, f"group is {chosen['group']!r}, expected {GROUP!r}"
    if chosen["cancel"] != "false":
        return False, f"cancel-in-progress is {chosen['cancel']!r}, expected 'false'"
    return True, ""


def main():
    if not os.path.isdir(WORKFLOWS):
        die(f"{WORKFLOWS} is not a directory. This check examined nothing (PR-27)")

    paths = sorted(glob.glob(os.path.join(WORKFLOWS, "*.yml")))
    if len(paths) < MINIMUM_WRITERS:
        die(f"{len(paths)} workflow file(s) under .github/workflows, minimum "
            f"{MINIMUM_WRITERS}. A removed workflow is not a pass (PR-27)")

    writers = []
    for path in paths:
        with open(path, encoding="utf-8") as handle:
            text = handle.read()
        if text.strip() == "":
            continue
        lines = text.splitlines()
        workflow_concurrency = concurrency_block(lines, 0)
        relative = os.path.relpath(path, REPO).replace("\\", "/")
        for name, body in jobs_of(text):
            if not receives_write_credentials(body):
                continue
            ok, reason = covered(workflow_concurrency, body)
            writers.append((relative, name, ok, reason))

    if len(writers) < MINIMUM_WRITERS:
        die(f"{len(writers)} staging-writing job(s) found, minimum {MINIMUM_WRITERS}. "
            f"A removed or emptied writer workflow examined nothing (PR-27)")

    found = {relative for relative, _name, _ok, _reason in writers}
    for required in REQUIRED:
        if required not in found:
            die(f"{required} has no staging-writing job. A removed or emptied "
                f"writer workflow is not a pass (PR-27)")

    for relative, name, ok, reason in writers:
        if not ok:
            fail(f"{relative} job {name} receives staging write credentials and {reason}")

    if FAIL:
        sys.exit(1)
    print(f"OK: {len(writers)} staging-writing jobs declare {GROUP} "
          f"with cancel-in-progress false, minimum {MINIMUM_WRITERS}")


if __name__ == "__main__":
    main()
