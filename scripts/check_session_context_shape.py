#!/usr/bin/env python3
"""SESSION_CONTEXT.md heading-shape assertion. Its `## ` headings must be
exactly, and only, these five:

    Read these too
    Done steps
    Open carry-forwards — ids only
    Frozen decisions in force
    Next action

Origin: CF-123. DEV_OS.md §6 says this file is short by design and that a
growing paragraph belongs in the journal or the ledger. "Where we are" grew
to 123 lines carrying restated carry-forward content instead — CF-122 fixed
the restatement, not the section, so CF-123 retires the section itself. This
check is what stops a replacement narrative heading growing back in its
place: any `## ` heading outside the fixed five is a failure, not a judgment
call for the next task to make.

PR-27 — this check states the minimum it expected to examine and fails when
it examined less. CF-118 — a removed scan target is reported as one `FAIL:`
line naming the file, never as a traceback.
"""
import os
import re
import sys

FAIL = False

MINIMUM_HEADINGS = 5

EXPECTED_HEADINGS = [
    "Read these too",
    "Done steps",
    "Open carry-forwards \u2014 ids only",
    "Frozen decisions in force",
    "Next action",
]


def fail(msg):
    global FAIL
    print(f"FAIL: {msg}")
    FAIL = True


def read(path):
    if not os.path.isfile(path):
        print(f"FAIL: {path} does not exist — it is this check's only scan "
              f"target, so there is no heading set to assert (PR-27, CF-118)")
        sys.exit(1)
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def main():
    path = "SESSION_CONTEXT.md"
    text = read(path)

    headings = re.findall(r"^## (.+?)\s*$", text, re.M)

    if len(headings) < MINIMUM_HEADINGS:
        fail(
            f"{path}: {len(headings)} '## ' heading(s) found, minimum "
            f"{MINIMUM_HEADINGS}. A shape check that examined fewer headings "
            f"than it expects has not run (PR-27)"
        )
        sys.exit(1)

    expected_set = set(EXPECTED_HEADINGS)
    seen_counts = {}
    for h in headings:
        seen_counts[h] = seen_counts.get(h, 0) + 1

    missing = sorted(expected_set - set(headings))
    extra = sorted(set(headings) - expected_set)
    dupes = sorted(h for h, c in seen_counts.items() if c > 1)

    if missing:
        fail(f"{path}: missing heading(s): {missing}")
    if extra:
        fail(f"{path}: unexpected heading(s): {extra}")
    if dupes:
        fail(f"{path}: duplicate heading(s): {dupes}")

    if FAIL:
        sys.exit(1)

    print(
        f"OK: {len(headings)} '## ' heading(s) examined, minimum "
        f"{MINIMUM_HEADINGS}; exactly {EXPECTED_HEADINGS}, no extras, no "
        f"duplicates"
    )


if __name__ == "__main__":
    main()
