#!/usr/bin/env python3
"""Done-steps shape assertion. Every data row in SESSION_CONTEXT.md's done-steps
table has exactly four columns, and for every row except the last the commit
column must be either one or more backticked hex shas (comma-separated if
several) or the declared sentinel em-dash. Only the **commit column** assertion
exempts the last row: its commit cannot exist before the commit that contains it
(PR-17). The column count is asserted on every row, last included.

P02-READINESS / CF-151 — the **verdict column** is asserted on every row,
last included. A non-last row must hold a real verdict (`PASS` or `FAIL`),
or `pending` only if its Step id is in the closed historical list
ALLOWED_PENDING_STEPS. The last row may hold PASS, FAIL, or the declared
placeholder em-dash: the follow-up commit fills the sha only, and the next
land task writes the reviewer's actual verdict. `pending` is frozen to the
Step ids that already held it at P02-T15 so existing cells are not rewritten
(PR-07 applied to this project's own history). A new row written with
`pending` fails. The placeholder on a non-last row is a defect: it means
the land task that added the next row did not fill the reviewer's verdict,
which is the mechanism that makes a pre-filled PASS unfalsifiable.

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

# CF-151 — real verdicts. `pending` is not in this set: it is frozen to the
# Step ids below rather than permitted as a token on any row.
REAL_VERDICTS = frozenset({"PASS", "FAIL"})
VERDICT_PLACEHOLDER = EM_DASH

# P02-T15 / CF-153. Closed list. Derived from SESSION_CONTEXT.md's done-steps
# table at this task, command:
#   python -c "import re; t=open('SESSION_CONTEXT.md',encoding='utf-8').read();
#   m=re.search(r'## Done steps\n(.*?)\n## ', t, re.S);
#   rows=[l for l in m.group(1).splitlines() if l.strip().startswith('|')][2:];
#   ids=[[c.strip() for c in l.strip().strip('|').split('|')][0]
#        for l in rows
#        if [c.strip() for c in l.strip().strip('|').split('|')][2]=='pending'];
#   print(len(ids)); print(','.join(ids))"
# Count: 25. The prompt supplied 23; the table enumerates 25 (PR-33). The
# list is closed: a new row written with `pending` must fail. PR-07 forbids
# rewriting these twenty-five historical cells.
ALLOWED_PENDING_STEPS = frozenset({
    "P-04d",
    "P-04e",
    "P-02-FIX",
    "P-05-PRE",
    "P-08-PRE-FIX",
    "G3-FIX",
    "G3-CLOSE",
    "P-09-LAND-FIX2",
    "P01-T02",
    "P01-T03",
    "P01-T04",
    "P01-T05-FIX",
    "P01-T06-FIX",
    "M-01",
    "P02-T01",
    "P02-T02",
    "P02-T02-FIX",
    "P02-T03",
    "P02-T04",
    "P02-T05",
    "P02-T06",
    "P02-T07",
    "P02-T08",
    "P02-T09",
    "P02-T09-FIX",
})
MINIMUM_PENDING_STEPS = 25

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

    if len(ALLOWED_PENDING_STEPS) < MINIMUM_PENDING_STEPS:
        fail(f"ALLOWED_PENDING_STEPS holds {len(ALLOWED_PENDING_STEPS)} "
             f"id(s), minimum {MINIMUM_PENDING_STEPS}. The frozen list is "
             f"closed; shrinking it would fail historical rows or, worse, "
             f"silently un-freeze `pending` (PR-27, CF-153)")

    for i, line in enumerate(data_lines):
        is_last = i == len(data_lines) - 1
        cells = split_row(line)
        if len(cells) != 4:
            fail(f"{path}: malformed row — {len(cells)} column(s), expected "
                 f"exactly 4 (Step, Task, Verdict, Commit). An unescaped `|` "
                 f"inside a cell splits it, which is broken GFM as well as "
                 f"unparseable here. Step: {cells[0]!r}")
            continue
        verdict_cell = cells[2]
        step_id = cells[0]
        if verdict_cell == "pending":
            if step_id not in ALLOWED_PENDING_STEPS:
                fail(f"{path}: verdict is 'pending' on Step {step_id!r}, "
                     f"which is not in the closed historical list of "
                     f"{len(ALLOWED_PENDING_STEPS)} Step ids (CF-153). "
                     f"`pending` means no verdict has been issued; a new "
                     f"row must not carry it")
            if is_last:
                continue
        elif is_last:
            allowed_last = REAL_VERDICTS | {VERDICT_PLACEHOLDER}
            if verdict_cell not in allowed_last:
                fail(f"{path}: last-row verdict is {verdict_cell!r}, expected "
                     f"PASS, FAIL, or the placeholder '{EM_DASH}' "
                     f"(CF-151). Step: {cells[0]!r}")
            continue
        elif verdict_cell not in REAL_VERDICTS:
            fail(f"{path}: non-last verdict is {verdict_cell!r}, expected "
                 f"PASS or FAIL (CF-151). A leftover placeholder means the "
                 f"next land task did not write the reviewer's verdict. "
                 f"Step: {cells[0]!r}")
        if is_last:
            continue
        commit_cell = cells[3]
        if commit_cell == EM_DASH or SHA_CELL.match(commit_cell):
            continue
        fail(f"{path}: commit column is neither a sha nor '{EM_DASH}': {line!r}")

    if FAIL:
        sys.exit(1)
    print(f"OK: {len(data_lines)} done-steps rows checked, minimum "
          f"{MINIMUM_DONE_STEPS_ROWS}, commit column well-formed, "
          f"verdict column well-formed")


if __name__ == "__main__":
    main()
