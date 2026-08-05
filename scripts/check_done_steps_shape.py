#!/usr/bin/env python3
"""Done-steps shape assertion. Every data row in SESSION_CONTEXT.md's done-steps
table has exactly four columns, and for every row except the last the commit
column must be either one or more backticked hex shas (comma-separated if
several) or the declared sentinel em-dash. Only the **commit column** assertion
exempts the last row: its commit cannot exist before the commit that contains it
(PR-17). The column count is asserted on every row, last included.

P02-T10 — the column count used to read "fewer than 4", which caught a truncated
row and never a split one. A cell containing an unescaped `|` yields *more* than
four columns, passed that test, and then presented some fragment of the
description as the commit column. It was invisible for a whole task because the
row carrying it was the last one, and the last row's commit column is exempt:
P02-T09-FIX's description contained a backticked table-row fragment with two
pipes in it, so the row split into six columns and both roadmap outputs
published a truncated description for it. Asserting exactly four catches the
split direction as well, on the last row too.

PR-27 — this check states the minimum it expected to examine. CF-118 — a removed
scan target is reported as one `FAIL:` line naming the file, never as a traceback:
detection and the exit code were already right, but a traceback reads as a broken
check rather than as a caught violation.
"""
import os
import re
import sys

FAIL = False

EM_DASH = "\u2014"
SHA_CELL = re.compile(r"^(`[0-9a-f]{7,40}`)(,\s*`[0-9a-f]{7,40}`)*$")

MINIMUM_DONE_STEPS_ROWS = 1


def fail(msg):
    global FAIL
    print(f"FAIL: {msg}")
    FAIL = True


def read(path):
    if not os.path.isfile(path):
        print(f"FAIL: {path} does not exist — it is this check's only scan "
              f"target, so there is no done-steps table to assert (PR-27, CF-118)")
        sys.exit(1)
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def split_row(line):
    cells = line.strip().strip("|").split("|")
    return [c.strip() for c in cells]


def main():
    path = "SESSION_CONTEXT.md"
    text = read(path)

    m = re.search(r"## Done steps\n(.*?)\n## ", text, re.S)
    if not m:
        fail(f"{path}: could not isolate the done-steps table")
        sys.exit(1)
    section = m.group(1)

    table_lines = [l for l in section.splitlines() if l.strip().startswith("|")]
    if len(table_lines) < 3:
        fail(f"{path}: done-steps table has no data rows")
        sys.exit(1)

    data_lines = table_lines[2:]  # skip header row and the --- separator row
    if len(data_lines) < MINIMUM_DONE_STEPS_ROWS:
        fail(f"{path}: done-steps table holds {len(data_lines)} data row(s), "
             f"minimum {MINIMUM_DONE_STEPS_ROWS}. A shape assertion over no rows "
             f"reported success (PR-27)")
        sys.exit(1)

    for i, line in enumerate(data_lines):
        is_last = i == len(data_lines) - 1
        cells = split_row(line)
        if len(cells) != 4:
            fail(f"{path}: malformed row — {len(cells)} column(s), expected "
                 f"exactly 4 (Step, Task, Verdict, Commit). An unescaped `|` "
                 f"inside a cell splits it, which is broken GFM as well as "
                 f"unparseable here. Step: {cells[0]!r}")
            continue
        if is_last:
            continue
        commit_cell = cells[3]
        if commit_cell == EM_DASH or SHA_CELL.match(commit_cell):
            continue
        fail(f"{path}: commit column is neither a sha nor '{EM_DASH}': {line!r}")

    if FAIL:
        sys.exit(1)
    print(f"OK: {len(data_lines)} done-steps rows checked, minimum "
          f"{MINIMUM_DONE_STEPS_ROWS}, commit column well-formed")


if __name__ == "__main__":
    main()
