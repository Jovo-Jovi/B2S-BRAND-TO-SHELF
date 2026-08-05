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
  docs/method/CARRY_FORWARDS.md total rows, open count, open ids
  docs/product/DECISIONS.md     the register total (§2)
  docs/product/SCOPE.md         §2's release assignment (signed date, the
                                 Release 1/2/3 item lists)

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

"Needs a decision", the html legend's fourth colour, is not a phase status —
it marks an OPEN row (`- [ ] CF-nn`) of docs/method/CARRY_FORWARDS.md's
ledger. Nothing about the ledger's content is asserted here beyond open/closed;
this is a roadmap, not a second ledger.

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

ROADMAP_MD_REL = "docs/ROADMAP.md"
ROADMAP_HTML_REL = "docs/roadmap.html"

EM_DASH = "\u2014"

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


# ---------------------------------------------------------------------------
# docs/method/BUILD_PHASES.md
# ---------------------------------------------------------------------------

def split_paragraphs(text):
    return [p.strip() for p in re.split(r"\n\s*\n", text.strip()) if p.strip()]


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


# ---------------------------------------------------------------------------
# docs/method/CARRY_FORWARDS.md
# ---------------------------------------------------------------------------

def parse_carry_forwards(text):
    all_ids = re.findall(r"^- \[[ x]\] (CF-\d+)", text, re.M)
    open_ids = re.findall(r"^- \[ \] (CF-\d+)", text, re.M)
    if not all_ids:
        die(f"{CARRY_FORWARDS_REL}: no carry-forward row found "
            f"('- [ ] CF-nn' or '- [x] CF-nn')")
    open_sorted = sorted(open_ids, key=lambda cf: int(cf.split("-")[1]))
    return {
        "total": len(all_ids),
        "open_count": len(open_ids),
        "open": open_sorted,
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

def parse_scope_releases(text):
    m = re.search(r"\n## 2\. Release 1.*?\n(.*?)\n## 3\.", text, re.S)
    if not m:
        die(f"{SCOPE_REL}: could not isolate §2 (Release 1), bounded by the "
            f"next '## 3.' heading")
    paragraphs = split_paragraphs(m.group(1))
    if len(paragraphs) < 5:
        die(f"{SCOPE_REL} §2: {len(paragraphs)} paragraph(s) found, expected "
            f"at least 5 (the signed line, the posture note, the Release 1 "
            f"item list, Release 2, Release 3)")

    signed_m = re.search(r"\*\*SIGNED (\d{4}-\d{2}-\d{2})\.\*\*", paragraphs[0])
    if not signed_m:
        die(f"{SCOPE_REL} §2: first paragraph is not the "
            f"'**SIGNED <date>.**' line")

    r2_idx = next((i for i, p in enumerate(paragraphs)
                   if p.startswith("**Release 2:**")), None)
    r3_idx = next((i for i, p in enumerate(paragraphs)
                   if p.startswith("**Release 3:**")), None)
    if r2_idx is None or r3_idx is None:
        die(f"{SCOPE_REL} §2: could not find both the '**Release 2:**' and "
            f"'**Release 3:**' paragraphs")
    r1_idx = r2_idx - 1
    if r1_idx < 0:
        die(f"{SCOPE_REL} §2: no paragraph precedes '**Release 2:**' to serve "
            f"as the Release 1 item list")

    return {
        "signed": signed_m.group(1),
        "release_1": paragraphs[r1_idx],
        "release_2": paragraphs[r2_idx],
        "release_3": paragraphs[r3_idx],
    }


# ---------------------------------------------------------------------------
# Assembly
# ---------------------------------------------------------------------------

def collect():
    phases_text = read(BUILD_PHASES_REL)
    session_text = read(SESSION_CONTEXT_REL)
    carry_text = read(CARRY_FORWARDS_REL)
    decisions_text = read(DECISIONS_REL)
    scope_text = read(SCOPE_REL)

    phases = parse_phases(phases_text)
    done_rows = parse_done_steps(session_text)
    current_phase = parse_current_phase(session_text)
    carry = parse_carry_forwards(carry_text)
    decisions_total = parse_decisions(decisions_text)
    releases = parse_scope_releases(scope_text)

    for phase in phases:
        phase["status"] = phase_status(phase["id"], done_rows, current_phase)

    return {
        "phases": phases,
        "done_rows": done_rows,
        "current_phase": current_phase,
        "carry": carry,
        "decisions_total": decisions_total,
        "releases": releases,
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
        "that file's header; everything else is **QUEUED**. See "
        "`scripts/generate_roadmap.py`'s docstring for the exact rule."
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
            lines.append(f"**Entry:** {phase['entry']}")
            lines.append("")
        if phase["exit_standard"]:
            lines.append(f"**Exit standard:** {phase['exit_standard']}")
            lines.append("")
        if phase["exit_additional"]:
            lines.append(f"**Exit, additionally:** {phase['exit_additional']}")
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
        f"total, of which **{carry['open_count']}** are open. Every open row "
        f"below is status **needs a decision**."
    )
    lines.append("")
    for cf in carry["open"]:
        lines.append(f"- {cf} — needs a decision")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Release plan")
    lines.append("")
    releases = data["releases"]
    lines.append(f"`docs/product/SCOPE.md` §2, signed {releases['signed']}.")
    lines.append("")
    lines.append(f"**Release 1** — {releases['release_1']}")
    lines.append("")
    lines.append(releases["release_2"])
    lines.append("")
    lines.append(releases["release_3"])
    lines.append("")
    return "\n".join(lines).rstrip("\n") + "\n"


# ---------------------------------------------------------------------------
# HTML rendering
# ---------------------------------------------------------------------------

STATUS_CLASS = {
    "DONE": "status-done",
    "IN PROGRESS": "status-in-progress",
    "QUEUED": "status-queued",
}

CSS = """
:root {
  --done: #2e7d32; --progress: #b8860b; --queued: #757575; --decision: #c62828;
  --ink: #1a1a1a; --bg: #ffffff; --panel: #fafafa; --border: #dddddd;
}
* { box-sizing: border-box; }
body {
  font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;
  margin: 0; padding: 2rem 1rem; color: var(--ink); background: var(--bg);
  line-height: 1.55;
}
main { max-width: 960px; margin: 0 auto; }
h1 { border-bottom: 3px solid var(--ink); padding-bottom: 0.5rem; }
h2 { margin-top: 2.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.25rem; }
p.lede { color: #444; }
.legend { display: flex; gap: 1rem; flex-wrap: wrap; margin: 1rem 0 2rem; }
.legend span { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; }
.swatch { width: 0.85rem; height: 0.85rem; border-radius: 50%; display: inline-block; }
.swatch.status-done { background: var(--done); }
.swatch.status-in-progress { background: var(--progress); }
.swatch.status-queued { background: var(--queued); }
.swatch.status-needs-decision { background: var(--decision); }
.phase { border-left: 6px solid var(--queued); padding: 0.75rem 1rem; margin: 1rem 0; background: var(--panel); }
.phase.status-done { border-left-color: var(--done); }
.phase.status-in-progress { border-left-color: var(--progress); }
.phase.status-queued { border-left-color: var(--queued); }
.phase h3 { margin: 0 0 0.5rem; display: flex; align-items: center; gap: 0.6rem; }
.badge { display: inline-block; padding: 0.1rem 0.6rem; border-radius: 999px; font-size: 0.7rem; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 0.04em; }
.badge.status-done { background: var(--done); }
.badge.status-in-progress { background: var(--progress); }
.badge.status-queued { background: var(--queued); }
.badge.status-needs-decision { background: var(--decision); }
.phase p { margin: 0.5rem 0; }
.field { margin-top: 0.5rem; font-size: 0.95rem; }
.field b { color: #333; }
ul.progress-log, ul.cf-list { list-style: none; padding: 0; margin: 0; }
ul.progress-log li { padding: 0.4rem 0; border-bottom: 1px solid var(--border); font-size: 0.92rem; }
ul.progress-log li b { color: #333; }
ul.cf-list li { padding: 0.35rem 0.6rem; margin: 0.3rem 0; background: #fdf2f0; border-left: 4px solid var(--decision); display: flex; align-items: center; gap: 0.5rem; }
code { background: #eee; padding: 0.05rem 0.3rem; border-radius: 3px; font-size: 0.92em; }
footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid var(--border); font-size: 0.85rem; color: #666; }
"""


def collapse_space(text):
    """Multi-line source prose, one field's worth, folded to a single line the
    way a browser would fold it anyway — done explicitly so the output does
    not depend on an HTML renderer's own whitespace handling."""
    return re.sub(r"\s+", " ", text).strip()


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
    parts.append("<main>")
    parts.append("<h1>ROADMAP — B2S</h1>")
    parts.append(
        '<p class="lede">Generated by <code>scripts/generate_roadmap.py</code>. '
        "<strong>Never hand-edit</strong> — edit the source documents it reads "
        "and regenerate; <code>scripts/check_roadmap.py</code> fails any push "
        "where this file differs from its own regeneration (PR-35).</p>"
    )
    parts.append(
        '<div class="legend">'
        '<span><span class="swatch status-done"></span>done</span>'
        '<span><span class="swatch status-in-progress"></span>in progress</span>'
        '<span><span class="swatch status-queued"></span>queued</span>'
        '<span><span class="swatch status-needs-decision"></span>needs a decision</span>'
        "</div>"
    )

    parts.append("<h2>Phases</h2>")
    for phase in data["phases"]:
        cls = STATUS_CLASS[phase["status"]]
        parts.append(f'<article class="phase {cls}">')
        parts.append(
            f'<h3>{html.escape(phase["id"])} '
            f'{EM_DASH} {html.escape(phase["name"])} '
            f'<span class="badge {cls}">{html.escape(phase["status"])}</span></h3>'
        )
        parts.append(paragraphs_html(phase["content"]))
        if phase["entry"]:
            parts.append(
                f'<p class="field"><b>Entry:</b> {field_html(phase["entry"])}</p>'
            )
        if phase["exit_standard"]:
            parts.append(
                f'<p class="field"><b>Exit standard:</b> '
                f'{field_html(phase["exit_standard"])}</p>'
            )
        if phase["exit_additional"]:
            parts.append(
                f'<p class="field"><b>Exit, additionally:</b> '
                f'{field_html(phase["exit_additional"])}</p>'
            )
        parts.append("</article>")

    parts.append("<h2>Progress log</h2>")
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

    parts.append("<h2>Decisions</h2>")
    parts.append(
        f'<p><code>docs/product/DECISIONS.md</code> \u00a72\u2019s register: '
        f'<strong>{data["decisions_total"]}</strong> signed decisions.</p>'
    )

    parts.append("<h2>Open carry-forwards</h2>")
    carry = data["carry"]
    parts.append(
        f'<p><code>docs/method/CARRY_FORWARDS.md</code> holds '
        f'<strong>{carry["total"]}</strong> row(s) in total, of which '
        f'<strong>{carry["open_count"]}</strong> are open. Every open row below '
        f'is status <strong>needs a decision</strong>.</p>'
    )
    parts.append('<ul class="cf-list">')
    for cf in carry["open"]:
        parts.append(
            f'<li><span class="badge status-needs-decision">needs a decision</span> '
            f"{html.escape(cf)}</li>"
        )
    parts.append("</ul>")

    parts.append("<h2>Release plan</h2>")
    releases = data["releases"]
    parts.append(
        f'<p><code>docs/product/SCOPE.md</code> \u00a72, signed '
        f'{html.escape(releases["signed"])}.</p>'
    )
    parts.append(
        f'<p><strong>Release 1</strong> \u2014 {field_html(releases["release_1"])}</p>'
    )
    parts.append(f"<p>{field_html(releases['release_2'])}</p>")
    parts.append(f"<p>{field_html(releases['release_3'])}</p>")

    parts.append(
        "<footer>No commit sha, branch name or timestamp appears on this page "
        "by construction (PR-35) &mdash; the byte-comparison check would never "
        "pass otherwise.</footer>"
    )
    parts.append("</main>")
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
        f"{data['decisions_total']} signed decision(s), current phase "
        f"{data['current_phase']}"
    )


if __name__ == "__main__":
    main()
