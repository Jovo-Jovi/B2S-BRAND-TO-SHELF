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

PR-27 — this check states the minimum it expected to examine. The floor is on
rows of EITHER kind, not on open ones: closing the last carry-forward is a
legitimate end state and must not turn CI red. A ledger holding no row at all is
a different thing entirely — the file has moved, or the row syntax has changed
out from under both patterns — and used to print "OK: 0 open ids reconcile
id-for-id" at exit 0. Found at P01-T06-FIX by the same probe that found the four
named at the second P01 exit gate; this one the gate's own sandbox missed,
because its case deleted the file rather than emptying the row set.

CF-118 — a removed scan target is reported as one `FAIL:` line naming the file,
never as a traceback. Detection and the exit code were already right; a traceback
reads as a broken check rather than as a caught violation, and it does not tell
the operator which of the two targets went missing.

CF-122 — SESSION_CONTEXT.md restated carry-forward content (gap lists, line
citations, open/closed status) that this file never asserted, and the
restatements went stale between amendments while every check stayed green,
because reconciling ids is not the same property as reconciling content. Two
assertions close the class rather than the three found instances: the open-ids
section may carry an id and an owner and nothing else, so there is no content
left to go stale; and any carry-forward id named anywhere else in the file,
outside the done-steps table, must be OPEN in the ledger — a closed id has
nothing to say there that the ledger and the journal do not already say
permanently.
"""
import os
import re
import sys

FAIL = False

EM_DASH = "\u2014"

MINIMUM_LEDGER_ROWS = 1

# CF-122 — the open-ids section shape. Every line is either the fixed pointer
# sentence, blank, or exactly "- CF-nn <em-dash> owner: <owner>" with no
# description, no citation and no line number.
OPEN_IDS_LINE_RE = re.compile(r"^- (CF-\d+) " + EM_DASH + r" owner: .+$")

# CF-122 — the floor for the outside-done-steps scan. The open-ids section
# alone always names at least one id while any carry-forward is open, so
# finding zero ids outside the done-steps table means this check examined the
# wrong span rather than a file with nothing to say.
MINIMUM_IDS_OUTSIDE_DONE_STEPS = 1


def fail(msg):
    global FAIL
    print(f"FAIL: {msg}")
    FAIL = True


def read(path):
    if not os.path.isfile(path):
        print(f"FAIL: {path} does not exist — it is one of this check's two scan "
              f"targets, and no reconciliation is possible without it (PR-27, "
              f"CF-118)")
        sys.exit(1)
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def open_ids_section_span(text):
    m = re.search(r"## Open carry-forwards.*?\n(.*?)\n## ", text, re.S)
    if not m:
        fail("SESSION_CONTEXT.md: could not isolate the open carry-forwards section")
        return None
    return m.span(1)


def done_steps_span(text):
    m = re.search(r"## Done steps\n(.*?)\n## ", text, re.S)
    if not m:
        fail("SESSION_CONTEXT.md: could not isolate the done-steps table")
        return None
    return m.span(1)


def check_open_ids_shape(ledger_ids):
    """CF-122, assertion (i). Every line in the open-ids section is blank, the
    fixed pointer sentence, or exactly '- CF-nn <em-dash> owner: <owner>' — and
    the id set that shape yields equals the ledger's open set, id-for-id. A
    row's substance (gap lists, line citations) has nowhere to go stale here
    because this check does not let it land in the first place.

    Returns the id set found, or None if the section could not be isolated at
    all (already reported by open_ids_section_span).
    """
    text = read("SESSION_CONTEXT.md")
    span = open_ids_section_span(text)
    if span is None:
        return None
    section = text[span[0]:span[1]]

    ids_seen = []
    for line in section.splitlines():
        stripped = line.strip()
        if stripped == "" or stripped.startswith("Full text in"):
            continue
        m = OPEN_IDS_LINE_RE.match(line)
        if not m:
            fail(
                "SESSION_CONTEXT.md open-ids section line does not match "
                f"'- CF-nn {EM_DASH} owner: <owner>': {line!r}"
            )
            continue
        ids_seen.append(m.group(1))

    seen_ids = set(ids_seen)
    if len(ids_seen) != len(seen_ids):
        dupes = sorted({i for i in ids_seen if ids_seen.count(i) > 1})
        fail(f"SESSION_CONTEXT.md open-ids section repeats id(s): {dupes}")

    only_session = sorted(seen_ids - ledger_ids)
    only_ledger = sorted(ledger_ids - seen_ids)
    if only_session or only_ledger:
        fail(
            "open-id mismatch between SESSION_CONTEXT.md and CARRY_FORWARDS.md — "
            f"only in SESSION_CONTEXT.md: {only_session}; "
            f"only in CARRY_FORWARDS.md (open): {only_ledger}"
        )
    return seen_ids


def check_ids_outside_done_steps_are_open(ledger_open_ids, ledger_all_ids):
    """CF-122, assertion (ii). The done-steps table is historical and may name
    a closed id — that is what a record of a past task is for. Every other
    carry-forward id in SESSION_CONTEXT.md — the header, "Where we are",
    "Frozen decisions in force", "Next action", the open-ids section itself —
    must be OPEN in the ledger. A closed id has a permanent home in the ledger
    and the journal; naming it again anywhere else in a file that is state,
    not narrative, is exactly the restatement CF-122 closes.
    """
    text = read("SESSION_CONTEXT.md")
    span = done_steps_span(text)
    if span is None:
        return
    start, end = span
    outside = text[:start] + text[end:]
    found = re.findall(r"CF-\d+", outside)

    if len(found) < MINIMUM_IDS_OUTSIDE_DONE_STEPS:
        fail(
            f"SESSION_CONTEXT.md: {len(found)} carry-forward id mention(s) found "
            f"outside the done-steps table, minimum {MINIMUM_IDS_OUTSIDE_DONE_STEPS}. "
            "The open-ids section alone always names at least one while any "
            "carry-forward is open, so finding none means this check examined "
            "the wrong span (PR-27)"
        )
        return

    mentioned = set(found)
    closed_mentions = sorted(mentioned & (ledger_all_ids - ledger_open_ids))
    unknown_mentions = sorted(mentioned - ledger_all_ids)
    if closed_mentions:
        fail(
            "SESSION_CONTEXT.md names CLOSED carry-forward id(s) outside the "
            f"done-steps table, where only OPEN ids may appear: {closed_mentions}"
        )
    if unknown_mentions:
        fail(
            "SESSION_CONTEXT.md names carry-forward id(s) with no ledger row at "
            f"all, outside the done-steps table: {unknown_mentions}"
        )
    return len(found)


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


def ledger_all_rows():
    """Every carry-forward row, open or closed. This is the floor's scan set."""
    text = read("docs/method/CARRY_FORWARDS.md")
    return re.findall(r"^- \[[ x]\] (CF-\d+)", text, re.M)


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
    all_rows = ledger_all_rows()
    if len(all_rows) < MINIMUM_LEDGER_ROWS:
        fail(
            f"docs/method/CARRY_FORWARDS.md holds {len(all_rows)} carry-forward "
            f"row(s) of any kind, minimum {MINIMUM_LEDGER_ROWS}. Zero OPEN rows is "
            f"a legitimate end state; zero rows at all means the ledger has moved "
            f"or its row syntax has changed, and this check reconciled nothing "
            f"while reporting success (PR-27)"
        )
        sys.exit(1)

    ledger_rows = ledger_open_rows()
    ledger_ids = set(ledger_rows.keys())
    ledger_all_ids = set(all_rows)

    seen_ids = check_open_ids_shape(ledger_ids)
    outside_count = check_ids_outside_done_steps_are_open(ledger_ids, ledger_all_ids)

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
        f"OK: {len(ledger_ids)} open ids reconcile id-for-id out of "
        f"{len(all_rows)} ledger row(s), minimum {MINIMUM_LEDGER_ROWS}; every open "
        f"row names an owner; {checked} owner(s) checked against "
        f"{len(gates)} passed gate(s) {sorted(gates)} and "
        f"{len(phase_gates)} passed phase-exit gate(s) {sorted(phase_gates)}; "
        f"open-ids section shape-checked at {len(seen_ids)} line(s); "
        f"{outside_count} id mention(s) outside the done-steps table, all OPEN, "
        f"minimum {MINIMUM_IDS_OUTSIDE_DONE_STEPS}"
    )


if __name__ == "__main__":
    main()
