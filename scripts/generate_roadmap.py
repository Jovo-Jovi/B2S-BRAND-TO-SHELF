#!/usr/bin/env python3
"""Generates docs/ROADMAP.md and docs/roadmap.html from committed inputs alone.
PR-35.

Reads, and reads ONLY, these committed files:

  docs/method/BUILD_PHASES.md   phase ids, names, one-line content, exit
                                 standards, and the entry/exit lines OD-H12
                                 added to P03 and P05
  SESSION_CONTEXT.md            the done-steps table (task id, description,
                                 commit) and the current phase, from the
                                 header's "Phase: P0N" token
  docs/method/CARRY_FORWARDS.md total rows, open count, open ids, and each
                                 open row's own text (for the owner clause)
  docs/product/DECISIONS.md     the register total (§2)
  docs/product/SCOPE.md         §2's release assignment (signed date, the
                                 release item blocks: Release 1's item list
                                 plus every "**Release N:**" paragraph)
  docs/product/ROLE_JOURNEY.md  the Role/Capability/Owning phase/Note table
                                 (OD-H9 — see scripts/check_roadmap.py for the
                                 conformance assertions this document owes)

Emits, overwriting wholly:

  docs/ROADMAP.md    the readable roadmap
  docs/roadmap.html  the same content as a self-contained page — no external
                      stylesheet, no network reference

**Pure function of the inputs above. No commit sha, no branch name, no
timestamp, no "generated on" line, and nothing else that changes between
generation and commit.** Embedding any of those would make
scripts/check_roadmap.py's byte-comparison against its own regeneration
permanently fail the moment the file is committed, since the value changes at
commit time and the file cannot commit ahead of its own commit. Commits belong
in the done-steps table (an input); this generator only reads that table, it
never writes one of its own.

**Status derivation — stated once, in code, so both outputs agree on the same
rule.** For a phase P0N:

  DONE          the done-steps table carries a row whose Step matches
                `P0N-GATE` (any suffix, e.g. `-RERUN`, `-RUN3`) and whose
                Verdict column reads PASS. A gate that ran and FAILED has not
                exited the phase — BUILD_PHASES.md's own lifecycle re-runs the
                gate in full after the FIX task, which is exactly the shape
                the table already holds for P01 (P01-GATE FAIL,
                P01-GATE-RERUN FAIL, P01-GATE-RUN3 PASS: DONE only once the
                third row exists).
  IN PROGRESS   not DONE, and it is the phase named by SESSION_CONTEXT.md's
                header ("Phase: P0N").
  QUEUED        neither of the above.

DONE is checked first, so a phase that is somehow both current and already
gated PASS reads DONE, never IN PROGRESS. No fourth phase status exists.

**A role-journey capability's status (Task 5)** re-uses the same phase-status
answer, then narrows it further:

  DONE               the owning phase's status is DONE.
  IN PROGRESS         not DONE, and the owning phase's status is IN PROGRESS.
  PENDING A DECISION  neither of the above, and the row's Note names an open
                      carry-forward (a `CF-nn` token that is open in
                      docs/method/CARRY_FORWARDS.md) or an unsigned decision
                      (the literal word "unsigned" beside an `OD-` token).
  QUEUED              none of the above.

**An open carry-forward's status**, shown beside its id, is derived from its
own row text in docs/method/CARRY_FORWARDS.md, never from a second ledger kept
here:

  PENDING A DECISION  the row's live `owner:` clause names one of the nine
                      phases (a `P0N` token) or a numbered gate.
  NOT IN THE PLAN     the row is VOID, or its owner clause names neither — the
                      "blind spot" SESSION_CONTEXT.md's Next Action section
                      already describes in prose, made visible here instead.

Five statuses in total across the whole page, and only five: DONE, IN
PROGRESS, QUEUED, PENDING A DECISION, NOT IN THE PLAN. A phase is never PENDING
A DECISION or NOT IN THE PLAN; a carry-forward is never DONE, IN PROGRESS or
QUEUED; a role-journey capability is never NOT IN THE PLAN, because OD-H9's
conformance check (scripts/check_roadmap.py) refuses to land a row whose
owning phase does not exist in BUILD_PHASES.md in the first place.

STOP and flag, rather than guess, if a later edit to any input file removes a
value this script depends on — every parsing step below dies loudly with a
`FAIL:` line naming what it expected and did not find, rather than falling
back to a default.
"""
import html
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

BUILD_PHASES_REL = "docs/method/BUILD_PHASES.md"
SESSION_CONTEXT_REL = "SESSION_CONTEXT.md"
CARRY_FORWARDS_REL = "docs/method/CARRY_FORWARDS.md"
DECISIONS_REL = "docs/product/DECISIONS.md"
SCOPE_REL = "docs/product/SCOPE.md"
ROLE_JOURNEY_REL = "docs/product/ROLE_JOURNEY.md"

ROADMAP_MD_REL = "docs/ROADMAP.md"
ROADMAP_HTML_REL = "docs/roadmap.html"

EM_DASH = "\u2014"
MIDDOT = "\u00b7"

FIELD_LABELS = ["Exit standard", "Entry", "Exit, additionally"]

GATE_RE = re.compile(r"^P0*(\d+)-GATE\b", re.I)


def die(msg):
    print(f"FAIL: {msg}")
    sys.exit(1)


def read(rel):
    path = os.path.join(REPO, rel)
    if not os.path.isfile(path):
        die(f"{rel} does not exist — it is one of this generator's scan "
            f"targets and there is nothing to read")
    with open(path, encoding="utf-8") as handle:
        return handle.read()


def split_paragraphs(text):
    return [p.strip() for p in re.split(r"\n\s*\n", text.strip()) if p.strip()]


def collapse_space(text):
    """Multi-line source prose, one item's worth, folded to a single line —
    done explicitly so a bullet split out of a wrapped paragraph never carries
    the source file's own line-wrap as a literal break."""
    return re.sub(r"\s+", " ", text).strip()


# ---------------------------------------------------------------------------
# docs/method/BUILD_PHASES.md
# ---------------------------------------------------------------------------

def extract_field(body, label):
    m = re.search(
        re.escape(f"**{label}:**") + r"\s*(.+?)(?=\n\s*\n|\Z)", body, re.S
    )
    return m.group(1).strip() if m else None


def parse_phase_body(pid, name, body):
    positions = [body.find(f"**{label}:**") for label in FIELD_LABELS]
    positions = [p for p in positions if p != -1]
    cutoff = min(positions) if positions else len(body)
    content = body[:cutoff].strip()
    if not content:
        die(f"{BUILD_PHASES_REL} {pid}: no content paragraph found before its "
            f"first field marker")
    return {
        "id": pid,
        "name": name,
        "content": content,
        "exit_standard": extract_field(body, "Exit standard"),
        "entry": extract_field(body, "Entry"),
        "exit_additional": extract_field(body, "Exit, additionally"),
    }


def parse_phases(text):
    m = re.search(r"\n## The phases\n(.*?)\n## The design surface\n", text, re.S)
    if not m:
        die(f"{BUILD_PHASES_REL}: could not isolate '## The phases' section "
            f"(bounded by the next '## The design surface' heading)")
    section = m.group(1)

    headings = list(re.finditer(
        r"^### (P\d{2}) " + EM_DASH + r" (.+)$", section, re.M
    ))
    if not headings:
        die(f"{BUILD_PHASES_REL}: no '### P0N {EM_DASH} Name' phase heading "
            f"found inside '## The phases'")

    phases = []
    for i, hm in enumerate(headings):
        pid, name = hm.group(1), hm.group(2).strip()
        start = hm.end()
        end = headings[i + 1].start() if i + 1 < len(headings) else len(section)
        phases.append(parse_phase_body(pid, name, section[start:end]))
    return phases


def content_bullets(content):
    """Task 3's QUEUED bullets: the phase's own content, split into one bullet
    per item. A paragraph written with middot-separated items ('a · b · c')
    yields one bullet per item; a paragraph with no middot is one bullet in
    its own right. Never re-worded, never truncated — a bullet is exactly the
    source text between separators."""
    bullets = []
    for para in split_paragraphs(content):
        if MIDDOT in para:
            parts = re.split(r"\s*" + MIDDOT + r"\s*", para)
        else:
            parts = [para]
        bullets.extend(collapse_space(p) for p in parts if p.strip())
    return bullets


# ---------------------------------------------------------------------------
# SESSION_CONTEXT.md
# ---------------------------------------------------------------------------

def parse_done_steps(text):
    m = re.search(r"## Done steps\n(.*?)\n## ", text, re.S)
    if not m:
        die(f"{SESSION_CONTEXT_REL}: could not isolate the done-steps table")
    lines = [l for l in m.group(1).splitlines() if l.strip().startswith("|")]
    if len(lines) < 3:
        die(f"{SESSION_CONTEXT_REL}: done-steps table has no data rows")
    rows = []
    for line in lines[2:]:
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) < 4:
            die(f"{SESSION_CONTEXT_REL}: malformed done-steps row (fewer than "
                f"4 columns): {line!r}")
        rows.append({
            "step": cells[0],
            "task": cells[1],
            "verdict": cells[2],
            "commit": cells[3],
        })
    return rows


def parse_current_phase(text):
    m = re.search(r"Phase:\s*(P\d+)", text)
    if not m:
        die(f"{SESSION_CONTEXT_REL}: no 'Phase: P0N' token found in the header")
    return m.group(1)


def phase_status(pid, done_rows, current_phase):
    num = int(pid[1:])
    passed = False
    for row in done_rows:
        gm = GATE_RE.match(row["step"])
        if gm and int(gm.group(1)) == num and row["verdict"].strip().upper() == "PASS":
            passed = True
            break
    if passed:
        return "DONE"
    if pid == current_phase:
        return "IN PROGRESS"
    return "QUEUED"


def phase_done_bullets(pid, done_rows):
    """Task 3's DONE bullets: every done-steps row whose Step belongs to this
    phase (a 'P0N-' prefix, e.g. 'P02-T04' or 'P02-GATE'), task id and
    description exactly as the table carries them. 'P-01', the pre-phase
    numbering, does not match and is excluded by construction."""
    prefix = pid + "-"
    return [row for row in done_rows if row["step"].startswith(prefix)]


# ---------------------------------------------------------------------------
# docs/method/CARRY_FORWARDS.md
# ---------------------------------------------------------------------------

PHASE_MENTION_RE = re.compile(r"\bP0*([1-9])\b|\bPhase\s+0*([1-9])\b", re.I)
GATE_MENTION_RE = re.compile(r"\bGate\s+\d+\b", re.I)
VOID_FIRST_LINE_RE = re.compile(r"^- \[ \] CF-\d+ " + EM_DASH + r"\s*VOID\b")


def carry_forward_row_status(row_text):
    """A carry-forward's own row text says whether its owner reaches the
    nine-phase plan at all. VOID rows (CF-44) carry no owner and are NOT IN
    THE PLAN by construction. Otherwise: the row's own last 'owner:' clause is
    read (later text amends earlier text in this ledger, so the last clause is
    the live one), and it is PENDING A DECISION if that clause names a phase
    or a gate, NOT IN THE PLAN if it names neither."""
    first_line = row_text.splitlines()[0] if row_text else ""
    if VOID_FIRST_LINE_RE.match(first_line):
        return "NOT IN THE PLAN"
    owners = list(re.finditer(r"owner:", row_text, re.I))
    clause = row_text[owners[-1].end():] if owners else row_text
    if PHASE_MENTION_RE.search(clause) or GATE_MENTION_RE.search(clause):
        return "PENDING A DECISION"
    return "NOT IN THE PLAN"


def parse_carry_forwards(text):
    all_ids = re.findall(r"^- \[[ x]\] (CF-\d+)", text, re.M)
    open_matches = list(re.finditer(r"^- \[ \] (CF-\d+)", text, re.M))
    if not all_ids:
        die(f"{CARRY_FORWARDS_REL}: no carry-forward row found "
            f"('- [ ] CF-nn' or '- [x] CF-nn')")

    row_starts = [m.start() for m in re.finditer(r"^- \[[ x]\] CF-\d+", text, re.M)]
    row_starts_sorted = sorted(row_starts)

    def row_text_at(start):
        later = [s for s in row_starts_sorted if s > start]
        end = min(later) if later else len(text)
        return text[start:end]

    open_rows = []
    for m in open_matches:
        cf_id = m.group(1)
        body = row_text_at(m.start())
        open_rows.append({
            "id": cf_id,
            "status": carry_forward_row_status(body),
        })
    open_rows.sort(key=lambda r: int(r["id"].split("-")[1]))

    return {
        "total": len(all_ids),
        "open_count": len(open_matches),
        "open": [r["id"] for r in open_rows],
        "open_rows": open_rows,
    }


# ---------------------------------------------------------------------------
# docs/product/DECISIONS.md
# ---------------------------------------------------------------------------

def parse_decisions(text):
    m = re.search(r"## 2\. Decision register\s*\n+(\d+) decisions, all signed", text)
    if not m:
        die(f"{DECISIONS_REL}: could not find the stated decision-register total "
            f'("<n> decisions, all signed" under "## 2. Decision register")')
    return int(m.group(1))


# ---------------------------------------------------------------------------
# docs/product/SCOPE.md
# ---------------------------------------------------------------------------

RELEASE_MARKER_RE = re.compile(r"^\*\*Release (\d+):\*\*")


def parse_scope_releases(text):
    m = re.search(r"\n## 2\. Release 1.*?\n(.*?)\n## 3\.", text, re.S)
    if not m:
        die(f"{SCOPE_REL}: could not isolate §2 (Release 1), bounded by the "
            f"next '## 3.' heading")
    paragraphs = split_paragraphs(m.group(1))
    if len(paragraphs) < 3:
        die(f"{SCOPE_REL} §2: {len(paragraphs)} paragraph(s) found, expected "
            f"at least 3 (the signed line, at least one further paragraph, "
            f"and the Release 1 item list)")

    signed_m = re.search(r"\*\*SIGNED (\d{4}-\d{2}-\d{2})\.\*\*", paragraphs[0])
    if not signed_m:
        die(f"{SCOPE_REL} §2: first paragraph is not the "
            f"'**SIGNED <date>.**' line")

    marker_idxs = [i for i, p in enumerate(paragraphs) if RELEASE_MARKER_RE.match(p)]
    if not marker_idxs:
        die(f"{SCOPE_REL} §2: no '**Release N:**' paragraph found — this "
            f"generator has nothing to anchor the Release 1 item list against")

    r1_idx = marker_idxs[0] - 1
    if r1_idx < 0:
        die(f"{SCOPE_REL} §2: no paragraph precedes the first '**Release N:**' "
            f"marker to serve as the Release 1 item list")

    blocks = [paragraphs[r1_idx]] + [paragraphs[i] for i in marker_idxs]

    return {
        "signed": signed_m.group(1),
        "blocks": blocks,
    }


# ---------------------------------------------------------------------------
# docs/product/ROLE_JOURNEY.md
# ---------------------------------------------------------------------------

def parse_role_journey(text):
    m = re.search(
        r"^\|\s*Role\s*\|\s*Capability\s*\|\s*Owning phase\s*\|\s*Note\s*\|\s*\n"
        r"\|[-\s|]+\|\s*\n"
        r"(.*?)(?=\n\s*\n|\Z)",
        text, re.M | re.S,
    )
    if not m:
        die(f"{ROLE_JOURNEY_REL}: could not isolate the "
            f"'| Role | Capability | Owning phase | Note |' table")
    body = m.group(1)
    rows = []
    for line in body.splitlines():
        line = line.strip()
        if not line.startswith("|"):
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        if len(cells) != 4:
            die(f"{ROLE_JOURNEY_REL}: table row does not have exactly 4 "
                f"columns (Role | Capability | Owning phase | Note): {line!r}")
        role, capability, phase, note = cells
        phase_m = re.match(r"^(P\d{2})\b", phase)
        if not phase_m:
            die(f"{ROLE_JOURNEY_REL}: row for {role!r} has an unreadable "
                f"'Owning phase' cell (expected a leading 'P0N' token): "
                f"{phase!r}")
        rows.append({
            "role": role,
            "capability": capability,
            "phase": phase_m.group(1),
            "note": note,
        })
    if not rows:
        die(f"{ROLE_JOURNEY_REL}: the table was isolated but has no data rows")
    return rows


def role_journey_status(row, phases_by_id, open_cf_ids):
    phase = phases_by_id.get(row["phase"])
    if phase is None:
        die(f"{ROLE_JOURNEY_REL}: row for {row['role']!r} names owning phase "
            f"{row['phase']!r}, which does not exist in {BUILD_PHASES_REL} — "
            f"this should already have been caught by "
            f"scripts/check_roadmap.py's conformance assertion")
    if phase["status"] == "DONE":
        return "DONE"
    if phase["status"] == "IN PROGRESS":
        return "IN PROGRESS"
    cf_mentions = set(re.findall(r"CF-\d+", row["note"]))
    if cf_mentions & open_cf_ids:
        return "PENDING A DECISION"
    if re.search(r"\bunsigned\b", row["note"], re.I) and "OD-" in row["note"]:
        return "PENDING A DECISION"
    return "QUEUED"


def role_journey_order(rows):
    """The document's own row order, deduplicated to one entry per role, for
    'one card per actor, in the ROLE_JOURNEY order' (Task 5)."""
    seen = []
    for row in rows:
        if row["role"] not in seen:
            seen.append(row["role"])
    return seen


# ---------------------------------------------------------------------------
# Assembly
# ---------------------------------------------------------------------------

def collect():
    phases_text = read(BUILD_PHASES_REL)
    session_text = read(SESSION_CONTEXT_REL)
    carry_text = read(CARRY_FORWARDS_REL)
    decisions_text = read(DECISIONS_REL)
    scope_text = read(SCOPE_REL)
    role_journey_text = read(ROLE_JOURNEY_REL)

    phases = parse_phases(phases_text)
    done_rows = parse_done_steps(session_text)
    current_phase = parse_current_phase(session_text)
    carry = parse_carry_forwards(carry_text)
    decisions_total = parse_decisions(decisions_text)
    releases = parse_scope_releases(scope_text)
    role_journey_rows = parse_role_journey(role_journey_text)

    for phase in phases:
        phase["status"] = phase_status(phase["id"], done_rows, current_phase)
        phase["done_bullets"] = phase_done_bullets(phase["id"], done_rows)
        phase["queued_bullets"] = content_bullets(phase["content"])

    phases_by_id = {p["id"]: p for p in phases}
    open_cf_ids = set(carry["open"])
    for row in role_journey_rows:
        row["status"] = role_journey_status(row, phases_by_id, open_cf_ids)

    actor_order = role_journey_order(role_journey_rows)
    role_journeys = [
        {
            "role": actor,
            "rows": [r for r in role_journey_rows if r["role"] == actor],
        }
        for actor in actor_order
    ]

    return {
        "phases": phases,
        "done_rows": done_rows,
        "current_phase": current_phase,
        "carry": carry,
        "decisions_total": decisions_total,
        "releases": releases,
        "role_journey_rows": role_journey_rows,
        "role_journeys": role_journeys,
    }


# ---------------------------------------------------------------------------
# Markdown rendering
# ---------------------------------------------------------------------------

def render_markdown(data):
    lines = []
    lines.append("# ROADMAP — B2S")
    lines.append("")
    lines.append(
        "Generated by `scripts/generate_roadmap.py`. **Never hand-edit** — edit "
        "the source documents it reads and regenerate; `scripts/check_roadmap.py` "
        "fails any push where this file differs from its own regeneration (PR-35)."
    )
    lines.append("")
    lines.append(
        "Status is derived, never asserted here by hand. **DONE** means "
        "`SESSION_CONTEXT.md`'s done-steps table carries a PASS row for that "
        "phase's exit gate; **IN PROGRESS** means it is the current phase per "
        "that file's header; everything else is **QUEUED**. A role-journey "
        "capability additionally reads **PENDING A DECISION**, and an open "
        "carry-forward reads **PENDING A DECISION** or **NOT IN THE PLAN**. "
        "See `scripts/generate_roadmap.py`'s docstring for the exact rules."
    )
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Phases")
    lines.append("")
    for phase in data["phases"]:
        lines.append(f"### {phase['id']} — {phase['name']} — {phase['status']}")
        lines.append("")
        lines.append(phase["content"])
        lines.append("")
        if phase["entry"]:
            lines.append(f"`TAG: MOVED IN, OD-H12 — ENTRY` {collapse_space(phase['entry'])}")
            lines.append("")
        if phase["exit_standard"]:
            lines.append(f"`TAG: EXIT STANDARD` {collapse_space(phase['exit_standard'])}")
            lines.append("")
        if phase["exit_additional"]:
            lines.append(
                f"`TAG: MOVED IN, OD-H12 — EXIT, ADDITIONALLY` "
                f"{collapse_space(phase['exit_additional'])}"
            )
            lines.append("")
        lines.append("**Done:**")
        lines.append("")
        if phase["done_bullets"]:
            for row in phase["done_bullets"]:
                lines.append(f"- **{row['step']}** — {row['task']}")
        else:
            lines.append("- *(no done-steps row recorded for this phase yet)*")
        lines.append("")
        lines.append("**Queued:**")
        lines.append("")
        if phase["queued_bullets"]:
            for bullet in phase["queued_bullets"]:
                lines.append(f"- {bullet}")
        else:
            lines.append("- *(no content bullet found for this phase)*")
        lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Progress log")
    lines.append("")
    lines.append(
        "Every row of `SESSION_CONTEXT.md`'s done-steps table — task id, "
        "description, commit — unedited."
    )
    lines.append("")
    for row in data["done_rows"]:
        lines.append(f"- **{row['step']}** — {row['task']} — commit: {row['commit']}")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Decisions")
    lines.append("")
    lines.append(
        f"`docs/product/DECISIONS.md` §2's register: "
        f"**{data['decisions_total']}** signed decisions."
    )
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Open carry-forwards")
    lines.append("")
    carry = data["carry"]
    lines.append(
        f"`docs/method/CARRY_FORWARDS.md` holds **{carry['total']}** row(s) in "
        f"total, of which **{carry['open_count']}** are open. Each open row "
        f"below carries its own derived status — see the generator's docstring."
    )
    lines.append("")
    for row in carry["open_rows"]:
        lines.append(f"- {row['id']} — **{row['status']}**")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Release plan")
    lines.append("")
    releases = data["releases"]
    lines.append(f"`docs/product/SCOPE.md` §2, signed {releases['signed']}.")
    lines.append("")
    for i, block in enumerate(releases["blocks"]):
        if i == 0:
            lines.append(f"**Release 1** — {block}")
        else:
            lines.append(block)
        lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Role journeys")
    lines.append("")
    lines.append(
        f"`docs/product/ROLE_JOURNEY.md`, {len(data['role_journey_rows'])} "
        f"capability row(s) across {len(data['role_journeys'])} actor(s), in "
        f"the document's own order."
    )
    lines.append("")
    for journey in data["role_journeys"]:
        lines.append(f"### {journey['role']}")
        lines.append("")
        for row in journey["rows"]:
            lines.append(f"- **[{row['status']}]** {row['capability']} "
                          f"({row['phase']}) — {row['note']}")
        lines.append("")
    return "\n".join(lines).rstrip("\n") + "\n"


# ---------------------------------------------------------------------------
# HTML rendering
# ---------------------------------------------------------------------------

PHASE_STATUS_CLASS = {
    "DONE": "status-done",
    "IN PROGRESS": "status-in-progress",
    "QUEUED": "status-queued",
}

CF_STATUS_CLASS = {
    "PENDING A DECISION": "status-decide",
    "NOT IN THE PLAN": "status-gap",
}

ROLE_STATUS_CLASS = {
    "DONE": "status-done",
    "IN PROGRESS": "status-in-progress",
    "PENDING A DECISION": "status-decide",
    "QUEUED": "status-queued",
}

ALL_STATUS_CLASSES = {
    "DONE": "status-done",
    "IN PROGRESS": "status-in-progress",
    "QUEUED": "status-queued",
    "PENDING A DECISION": "status-decide",
    "NOT IN THE PLAN": "status-gap",
}

CSS = """
:root {
  --paper:#EDF0F2; --card:#FFFFFF; --ink:#14171C; --soft:#5A6470; --rule:#D4DAE0;
  --done:#1F9254; --now:#3B4FC4; --queued:#8792A2;
  --decide:#E09000; --gap:#CE2C63; --new:#7B3FC4;
}
* { box-sizing: border-box; }
html { background: var(--paper); }
body {
  margin: 0 auto;
  max-width: 690px;
  padding: 20px 14px 60px;
  background: var(--paper);
  color: var(--ink);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.5;
}
code, .mono {
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
}
h1 { font-size: 1.35rem; margin: 0 0 .3rem; }
p.lede { color: var(--soft); font-size: .92rem; }
h2.section-heading {
  font-size: 1.04rem;
  font-weight: 700;
  border-bottom: 2px solid var(--ink);
  padding-bottom: .35rem;
  margin: 2.2rem 0 1rem;
}
.chip-legend { display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0 22px; }
.chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px 4px 8px;
  border-radius: 999px;
  background: var(--card);
  border: 1px solid var(--rule);
  text-transform: uppercase;
  letter-spacing: .04em;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: .64rem;
  color: var(--ink);
}
.chip .swatch { width: 9px; height: 9px; border-radius: 3px; display: inline-block; flex: none; }
.swatch.status-done { background: var(--done); }
.swatch.status-in-progress { background: var(--now); }
.swatch.status-queued { background: var(--queued); }
.swatch.status-decide { background: var(--decide); }
.swatch.status-gap { background: var(--gap); }

.card {
  display: flex;
  background: var(--card);
  border: 1px solid var(--rule);
  border-radius: 9px;
  border-left: 7px solid var(--queued);
  margin: 12px 0;
  overflow: hidden;
}
.card.status-done { border-left-color: var(--done); }
.card.status-in-progress { border-left-color: var(--now); }
.card.status-queued { border-left-color: var(--queued); }
.card .tick {
  flex: 0 0 36px;
  width: 36px;
  padding: 14px 0;
  text-align: center;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: .68rem;
  color: var(--soft);
  border-right: 1px solid var(--rule);
  background: var(--paper);
}
.card .body { padding: 12px 16px; flex: 1; min-width: 0; }
.card h3 { margin: 0 0 .4rem; font-size: 1rem; display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; }

.badge {
  display: inline-block;
  padding: 2px 9px;
  border-radius: 999px;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: .62rem;
  text-transform: uppercase;
  letter-spacing: .03em;
  color: #fff;
}
.badge.status-done { background: var(--done); }
.badge.status-in-progress { background: var(--now); }
.badge.status-queued { background: var(--queued); }
.badge.status-decide { background: var(--decide); }
.badge.status-gap { background: var(--gap); }

.tag {
  display: inline-block;
  background: #EEF1F4;
  color: var(--ink);
  padding: 2px 9px;
  border-radius: 5px;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: .64rem;
  margin: 2px 6px 2px 0;
}
.tag.moved {
  background: #F3ECFF;
  color: #5B2AA0;
  border-left: 3px solid var(--new);
  padding-left: 6px;
}

.sub-label {
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: .64rem;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: var(--soft);
  margin: .7rem 0 .2rem;
}
ul.bullets { list-style: none; margin: 4px 0 0; padding: 0; }
ul.bullets li {
  position: relative;
  padding-left: 18px;
  margin: 5px 0;
  font-size: .9rem;
}
ul.bullets li::before {
  content: "";
  position: absolute;
  left: 0; top: .35em;
  width: 7px; height: 7px;
  border-radius: 2px;
  background: var(--queued);
}
ul.bullets.done li::before { background: var(--done); }
.empty-state { color: var(--soft); font-style: italic; font-size: .88rem; margin: 4px 0 0; }

ul.progress-log, ul.cf-list, ul.role-caps { list-style: none; padding: 0; margin: 0; }
ul.progress-log li { padding: .4rem 0; border-bottom: 1px solid var(--rule); font-size: .9rem; }
ul.cf-list li {
  padding: .35rem .6rem; margin: .3rem 0;
  background: var(--card); border: 1px solid var(--rule); border-radius: 7px;
  display: flex; align-items: center; gap: .5rem; font-size: .9rem;
}
ul.role-caps li {
  padding: .4rem 0; border-bottom: 1px solid var(--rule); font-size: .9rem;
}
ul.role-caps li:last-child { border-bottom: none; }
ul.role-caps .cap-note { display: block; color: var(--soft); font-size: .82rem; margin-top: 2px; }

footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid var(--rule); font-size: .8rem; color: var(--soft); }
"""


def inline_html(text):
    escaped = html.escape(text, quote=False)
    escaped = re.sub(r"`([^`]+)`", r"<code>\1</code>", escaped)
    escaped = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", escaped)
    return escaped


def field_html(text):
    return inline_html(collapse_space(text))


def paragraphs_html(text):
    out = []
    for para in split_paragraphs(text):
        out.append(f"<p>{field_html(para)}</p>")
    return "\n".join(out)


def bullets_html(items, done):
    if not items:
        return '<p class="empty-state">(none recorded)</p>'
    cls = "bullets done" if done else "bullets"
    inner = "\n".join(f"<li>{field_html(item)}</li>" for item in items)
    return f'<ul class="{cls}">{inner}</ul>'


def render_html(data):
    parts = []
    parts.append("<!doctype html>")
    parts.append('<html lang="en">')
    parts.append("<head>")
    parts.append('<meta charset="utf-8">')
    parts.append('<meta name="viewport" content="width=device-width, initial-scale=1">')
    parts.append("<title>ROADMAP — B2S</title>")
    parts.append(f"<style>{CSS}</style>")
    parts.append("</head>")
    parts.append("<body>")
    parts.append("<h1>ROADMAP — B2S</h1>")
    parts.append(
        '<p class="lede">Generated by <code>scripts/generate_roadmap.py</code>. '
        "<strong>Never hand-edit</strong> — edit the source documents it reads "
        "and regenerate; <code>scripts/check_roadmap.py</code> fails any push "
        "where this file differs from its own regeneration (PR-35).</p>"
    )

    parts.append('<div class="chip-legend">')
    for label, cls in ALL_STATUS_CLASSES.items():
        parts.append(
            f'<span class="chip"><span class="swatch {cls}"></span>'
            f"{html.escape(label)}</span>"
        )
    parts.append("</div>")

    parts.append('<h2 class="section-heading">Phases</h2>')
    for phase in data["phases"]:
        cls = PHASE_STATUS_CLASS[phase["status"]]
        parts.append(f'<article class="card {cls}">')
        parts.append(f'<div class="tick">{html.escape(phase["id"])}</div>')
        parts.append('<div class="body">')
        parts.append(
            f'<h3>{html.escape(phase["id"])} '
            f'{EM_DASH} {html.escape(phase["name"])} '
            f'<span class="badge {cls}">{html.escape(phase["status"])}</span></h3>'
        )
        parts.append(paragraphs_html(phase["content"]))
        if phase["entry"]:
            parts.append(
                f'<span class="tag moved">MOVED IN, OD-H12 — ENTRY</span>'
                f'<p>{field_html(phase["entry"])}</p>'
            )
        if phase["exit_standard"]:
            parts.append(
                f'<p><span class="tag">EXIT STANDARD</span> '
                f'{field_html(phase["exit_standard"])}</p>'
            )
        if phase["exit_additional"]:
            parts.append(
                f'<span class="tag moved">MOVED IN, OD-H12 — EXIT, ADDITIONALLY</span>'
                f'<p>{field_html(phase["exit_additional"])}</p>'
            )
        parts.append('<div class="sub-label">Done</div>')
        if phase["done_bullets"]:
            inner = "\n".join(
                f"<li><strong>{html.escape(row['step'])}</strong> "
                f"{EM_DASH} {inline_html(row['task'])}</li>"
                for row in phase["done_bullets"]
            )
            parts.append(f'<ul class="bullets done">{inner}</ul>')
        else:
            parts.append(
                '<p class="empty-state">No done-steps row recorded for this '
                "phase yet.</p>"
            )
        parts.append('<div class="sub-label">Queued</div>')
        parts.append(bullets_html(phase["queued_bullets"], done=False))
        parts.append("</div>")
        parts.append("</article>")

    parts.append('<h2 class="section-heading">Progress log</h2>')
    parts.append(
        '<p class="lede">Every row of <code>SESSION_CONTEXT.md</code>\u2019s '
        "done-steps table &mdash; task id, description, commit &mdash; unedited.</p>"
    )
    parts.append('<ul class="progress-log">')
    for row in data["done_rows"]:
        parts.append(
            f"<li><b>{html.escape(row['step'])}</b> "
            f"{EM_DASH} {inline_html(row['task'])} "
            f"{EM_DASH} commit: {inline_html(row['commit'])}</li>"
        )
    parts.append("</ul>")

    parts.append('<h2 class="section-heading">Decisions</h2>')
    parts.append(
        f'<p><code>docs/product/DECISIONS.md</code> \u00a72\u2019s register: '
        f'<strong>{data["decisions_total"]}</strong> signed decisions.</p>'
    )

    parts.append('<h2 class="section-heading">Open carry-forwards</h2>')
    carry = data["carry"]
    parts.append(
        f'<p><code>docs/method/CARRY_FORWARDS.md</code> holds '
        f'<strong>{carry["total"]}</strong> row(s) in total, of which '
        f'<strong>{carry["open_count"]}</strong> are open. Each row below '
        f"carries its own derived status.</p>"
    )
    parts.append('<ul class="cf-list">')
    for row in carry["open_rows"]:
        cls = CF_STATUS_CLASS[row["status"]]
        parts.append(
            f'<li><span class="badge {cls}">{html.escape(row["status"])}</span> '
            f"{html.escape(row['id'])}</li>"
        )
    parts.append("</ul>")

    parts.append('<h2 class="section-heading">Release plan</h2>')
    releases = data["releases"]
    parts.append(
        f'<p><code>docs/product/SCOPE.md</code> \u00a72, signed '
        f'{html.escape(releases["signed"])}.</p>'
    )
    for i, block in enumerate(releases["blocks"]):
        if i == 0:
            parts.append(f'<p><strong>Release 1</strong> \u2014 {field_html(block)}</p>')
        else:
            parts.append(f"<p>{field_html(block)}</p>")

    parts.append('<h2 class="section-heading">Role journeys</h2>')
    parts.append(
        f'<p class="lede"><code>docs/product/ROLE_JOURNEY.md</code>, '
        f'{len(data["role_journey_rows"])} capability row(s) across '
        f'{len(data["role_journeys"])} actor(s), in the document\u2019s own '
        f"order.</p>"
    )
    for journey in data["role_journeys"]:
        parts.append('<article class="card status-queued">')
        parts.append(f'<div class="tick">{html.escape(journey["role"][:3].upper())}</div>')
        parts.append('<div class="body">')
        parts.append(f"<h3>{html.escape(journey['role'])}</h3>")
        parts.append('<ul class="role-caps">')
        for row in journey["rows"]:
            cls = ROLE_STATUS_CLASS[row["status"]]
            parts.append(
                "<li>"
                f'<span class="badge {cls}">{html.escape(row["status"])}</span> '
                f'<span class="tag">{html.escape(row["phase"])}</span> '
                f"{field_html(row['capability'])}"
                f'<span class="cap-note">{field_html(row["note"])}</span>'
                "</li>"
            )
        parts.append("</ul>")
        parts.append("</div>")
        parts.append("</article>")

    parts.append(
        "<footer>No commit sha, branch name or timestamp appears on this page "
        "by construction (PR-35) &mdash; the byte-comparison check would never "
        "pass otherwise.</footer>"
    )
    parts.append("</body>")
    parts.append("</html>")
    return "\n".join(parts) + "\n"


def write(rel, content):
    path = os.path.join(REPO, rel)
    with open(path, "w", encoding="utf-8", newline="\n") as handle:
        handle.write(content)


def main():
    data = collect()
    write(ROADMAP_MD_REL, render_markdown(data))
    write(ROADMAP_HTML_REL, render_html(data))
    print(
        f"OK: wrote {ROADMAP_MD_REL} and {ROADMAP_HTML_REL} from "
        f"{len(data['phases'])} phase(s), {len(data['done_rows'])} done-step "
        f"row(s), {data['carry']['total']} carry-forward row(s) "
        f"({data['carry']['open_count']} open), "
        f"{data['decisions_total']} signed decision(s), "
        f"{len(data['releases']['blocks'])} release block(s), "
        f"{len(data['role_journey_rows'])} role-journey row(s) across "
        f"{len(data['role_journeys'])} actor(s), current phase "
        f"{data['current_phase']}"
    )


if __name__ == "__main__":
    main()
