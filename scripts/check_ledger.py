#!/usr/bin/env python3
"""Ledger reconciliation. The open ids in SESSION_CONTEXT.md must match the
open rows in docs/method/CARRY_FORWARDS.md id-for-id, every open row must
name an owner, and that owner must point at a moment that has not already
passed.

The reachable-owner assertion exists because CF-82 recurred as the P01 exit
gate's D1: the original check asked whether an `owner:` field existed and never
asked whether it pointed anywhere. Eleven open rows passed it while naming a
gate that closed weeks earlier. CF-60 closes on the same reasoning.

The passed-list is derived from SESSION_CONTEXT.md's done-steps table on every
run, never hardcoded here. A list in this file would be a second place to
forget, and forgetting is the whole failure mode.
"""
import re
import sys

FAIL = False

EM_DASH = "\u2014"


def fail(msg):
    global FAIL
    print(f"FAIL: {msg}")
    FAIL = True


def read(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def session_open_ids():
    path = "SESSION_CONTEXT.md"
    text = read(path)
    m = re.search(r"## Open carry-forwards.*?\n(.*?)\n## ", text, re.S)
    if not m:
        fail(f"{path}: could not isolate the open carry-forwards section")
        return set()
    return set(re.findall(r"^-\s*(CF-\d+)\s*" + EM_DASH, m.group(1), re.M))


def ledger_open_rows():
    path = "docs/method/CARRY_FORWARDS.md"
    text = read(path)
    matches = list(re.finditer(r"^- \[ \] (CF-\d+)", text, re.M))
    ends = list(re.finditer(r"^- \[[ x]\] CF-\d+", text, re.M))
    boundaries = [m.start() for m in ends] + [len(text)]
    rows = {}
    for m in matches:
        start = m.start()
        end = next(b for b in boundaries if b > start)
        rows[m.group(1)] = text[start:end]
    return rows


def done_steps_rows():
    """Every data row of SESSION_CONTEXT.md's done-steps table, as cell lists."""
    text = read("SESSION_CONTEXT.md")
    m = re.search(r"## Done steps\n(.*?)\n## ", text, re.S)
    if not m:
        fail("SESSION_CONTEXT.md: could not isolate the done-steps table")
        return []
    lines = [l for l in m.group(1).splitlines() if l.strip().startswith("|")]
    return [[c.strip() for c in l.strip().strip("|").split("|")] for l in lines[2:]]


def passed_moments():
    """The gates and phase-exit gates the done-steps table records as having
    already run, derived from the table itself.

    A step is recorded here once it has been executed and committed. The
    verdict column is not the test: a step whose reviewer verdict is still
    pending has nonetheless happened, and an owner pointing at it is just as
    unreachable as one pointing at a step marked PASS.
    """
    gates = set()
    phase_gates = set()
    for cells in done_steps_rows():
        if not cells:
            continue
        step = cells[0]
        row = " ".join(cells)
        # A step id of the form G<n>-... is a Gate <n> step: G3-FIX, G3-CLOSE.
        m = re.match(r"^G(\d+)\b", step)
        if m:
            gates.add(int(m.group(1)))
        # A gate named in the row's own prose: "Gate 1: HF-1, CF-42, ...".
        # Matched spelled-out only. A bare G<n> elsewhere in a row collides
        # with decision ids such as OD-G10.
        for m in re.finditer(r"\bGate\s+(\d+)\b", row, re.I):
            gates.add(int(m.group(1)))
        # A phase's exit gate has run once its GATE step is recorded, whatever
        # verdict it returned: a FAIL is still a gate that happened.
        m = re.match(r"^P(\d+)-GATE\b", step, re.I)
        if m:
            phase_gates.add(int(m.group(1)))
    return gates, phase_gates


def live_owner_clause(row_text):
    """The last `owner:` in a row is the live one: this ledger appends
    amendments rather than replacing text, so earlier owner clauses are
    history. Reading the whole row instead would fire on a superseded owner
    or on prose that merely mentions a gate.
    """
    owners = list(re.finditer(r"owner:", row_text, re.I))
    if not owners:
        return None
    return row_text[owners[-1].end():]


def is_void(row_text):
    """A row that declares itself VOID carries no owner and is exempt, as
    CF-44 states in its own text. A row that merely mentions the word is not
    void, so only the declaration on the row's first line counts.
    """
    first_line = row_text.splitlines()[0] if row_text else ""
    return re.search(r"^- \[ \] CF-\d+ " + EM_DASH + r"\s*VOID\b", first_line) is not None


def check_owner_reachable(rid, clause, gates, phase_gates):
    for m in re.finditer(r"\bGate\s+(\d+)\b", clause, re.I):
        n = int(m.group(1))
        if n in gates:
            fail(
                f"{rid}: owner names Gate {n}, which SESSION_CONTEXT.md's done-steps "
                f"table records as already run. An owner that has passed is not an owner"
            )
    for pattern in (
        r"\bPhase\s+0*(\d+)\s+exit\s+gate\b",
        r"\bP0*(\d+)\s+exit\s+gate\b",
        r"\bP0*(\d+)-GATE\b",
    ):
        for m in re.finditer(pattern, clause, re.I):
            n = int(m.group(1))
            if n in phase_gates:
                fail(
                    f"{rid}: owner names the Phase {n:02d} exit gate, which "
                    f"SESSION_CONTEXT.md's done-steps table records as already run. "
                    f"An owner that has passed is not an owner"
                )


def main():
    session_ids = session_open_ids()
    ledger_rows = ledger_open_rows()
    ledger_ids = set(ledger_rows.keys())

    only_session = sorted(session_ids - ledger_ids)
    only_ledger = sorted(ledger_ids - session_ids)
    if only_session or only_ledger:
        fail(
            "open-id mismatch between SESSION_CONTEXT.md and CARRY_FORWARDS.md — "
            f"only in SESSION_CONTEXT.md: {only_session}; "
            f"only in CARRY_FORWARDS.md (open): {only_ledger}"
        )

    gates, phase_gates = passed_moments()
    if not gates and not phase_gates:
        fail(
            "no passed gate or phase-exit gate could be derived from "
            "SESSION_CONTEXT.md's done-steps table — the reachable-owner test would "
            "pass for lack of anything to compare against, which is not a result"
        )

    checked = 0
    for rid in sorted(ledger_rows):
        row = ledger_rows[rid]
        clause = live_owner_clause(row)
        if clause is None:
            fail(f"{rid}: open ledger row has no 'owner:' field")
            continue
        if is_void(row):
            continue
        checked += 1
        check_owner_reachable(rid, clause, gates, phase_gates)

    if FAIL:
        sys.exit(1)
    print(
        f"OK: {len(ledger_ids)} open ids reconcile id-for-id; every open row names an "
        f"owner; {checked} owner(s) checked against "
        f"{len(gates)} passed gate(s) {sorted(gates)} and "
        f"{len(phase_gates)} passed phase-exit gate(s) {sorted(phase_gates)}"
    )


if __name__ == "__main__":
    main()
