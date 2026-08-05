#!/usr/bin/env python3
"""docs/ROADMAP.md and docs/roadmap.html are generated, never edited. PR-35.

Regenerates both outputs into memory, using the exact same code path as
`scripts/generate_roadmap.py`, and byte-compares each against the committed
file. This is the only mechanism that keeps the roadmap true, so the
comparison is strict: no normalisation, no whitespace tolerance. A push that
committed a hand edit, a stale regeneration, or a source-document change
without regenerating fails here, naming the file and the first differing
line.

**Floors, per PR-27** — this check states the minimum it expected to examine
and fails when it examined less, rather than reporting a clean zero:

  MINIMUM_PHASES               9  — BUILD_PHASES.md names nine phases (P01-P09)
  MINIMUM_DONE_STEPS_ROWS      1  — SESSION_CONTEXT.md's done-steps table
  MINIMUM_OPEN_CARRY_FORWARDS  1  — docs/method/CARRY_FORWARDS.md's open rows

Each of the two removed-target and emptied-target failure modes is proven by
this repository's own plant-and-revert probe set (PR-26): removing or
emptying either scan target's inputs, or `docs/ROADMAP.md` /
`docs/roadmap.html` themselves, must fail loudly rather than pass over
nothing — `scripts/generate_roadmap.py`'s own `die()` calls cover the input
side, and the byte-comparison below covers the two committed outputs.
"""
import importlib.util
import os
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GENERATOR = os.path.join(REPO, "scripts", "generate_roadmap.py")

ROADMAP_MD_REL = "docs/ROADMAP.md"
ROADMAP_HTML_REL = "docs/roadmap.html"

MINIMUM_PHASES = 9
MINIMUM_DONE_STEPS_ROWS = 1
MINIMUM_OPEN_CARRY_FORWARDS = 1

FAIL = False


def fail(msg):
    global FAIL
    print(f"FAIL: {msg}")
    FAIL = True


def die(msg):
    print(f"FAIL: {msg}")
    sys.exit(1)


def load_generator():
    if not os.path.isfile(GENERATOR):
        die("scripts/generate_roadmap.py does not exist — it is this check's "
            "only source of the regeneration it compares against (PR-27)")
    spec = importlib.util.spec_from_file_location("generate_roadmap", GENERATOR)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def read_committed(rel):
    path = os.path.join(REPO, rel)
    if not os.path.isfile(path):
        die(f"{rel} does not exist. It is one of this check's two scan "
            f"targets and a removed target is a hard failure, never a clean "
            f"pass over nothing (PR-27)")
    with open(path, encoding="utf-8", newline="") as handle:
        return handle.read()


def first_diff_line(expected, actual):
    """1-based line number of the first line the two texts disagree on, plus
    both lines, for a report that names the divergence rather than just its
    existence."""
    exp_lines = expected.split("\n")
    act_lines = actual.split("\n")
    for i, (e, a) in enumerate(zip(exp_lines, act_lines), start=1):
        if e != a:
            return i, e, a
    if len(exp_lines) != len(act_lines):
        i = min(len(exp_lines), len(act_lines)) + 1
        e = exp_lines[i - 1] if i - 1 < len(exp_lines) else "<no line — file ends here>"
        a = act_lines[i - 1] if i - 1 < len(act_lines) else "<no line — file ends here>"
        return i, e, a
    return None, None, None


def compare(rel, expected):
    actual = read_committed(rel)
    if actual == expected:
        return True
    line, exp_line, act_line = first_diff_line(expected, actual)
    fail(
        f"{rel} differs from its own regeneration at line {line}. "
        f"Committed: {act_line!r}. Regenerated: {exp_line!r}. "
        f"Hand edits to a generated file are a defect, not a shortcut (PR-35) "
        f"— run `python scripts/generate_roadmap.py` and commit the result"
    )
    return False


def main():
    generator = load_generator()

    try:
        data = generator.collect()
    except SystemExit:
        die("scripts/generate_roadmap.py could not regenerate its data from "
            "the committed inputs (it already reported which one and why) — "
            "this check has nothing to compare the committed outputs against")

    phase_count = len(data["phases"])
    if phase_count < MINIMUM_PHASES:
        die(f"regeneration parsed {phase_count} phase(s) from "
            f"docs/method/BUILD_PHASES.md, minimum {MINIMUM_PHASES}. A "
            f"BUILD_PHASES.md emptied or reshaped enough to parse fewer than "
            f"nine phases makes every phase-status comparison below vacuous "
            f"(PR-27)")

    done_steps_count = len(data["done_rows"])
    if done_steps_count < MINIMUM_DONE_STEPS_ROWS:
        die(f"regeneration parsed {done_steps_count} done-steps row(s) from "
            f"SESSION_CONTEXT.md, minimum {MINIMUM_DONE_STEPS_ROWS}. An "
            f"emptied done-steps table makes DONE/IN PROGRESS status "
            f"undecidable for every phase (PR-27)")

    open_count = data["carry"]["open_count"]
    if open_count < MINIMUM_OPEN_CARRY_FORWARDS:
        die(f"regeneration found {open_count} open carry-forward(s) in "
            f"docs/method/CARRY_FORWARDS.md, minimum "
            f"{MINIMUM_OPEN_CARRY_FORWARDS}. Zero open rows is not this "
            f"repository's live state and would mean the open-row scan "
            f"examined the wrong file or the wrong pattern (PR-27)")

    expected_md = generator.render_markdown(data)
    expected_html = generator.render_html(data)

    md_ok = compare(ROADMAP_MD_REL, expected_md)
    html_ok = compare(ROADMAP_HTML_REL, expected_html)

    if FAIL:
        sys.exit(1)

    print(
        f"OK: {ROADMAP_MD_REL} and {ROADMAP_HTML_REL} are byte-identical to "
        f"their own regeneration. {phase_count} phase(s) examined (minimum "
        f"{MINIMUM_PHASES}), {done_steps_count} done-steps row(s) (minimum "
        f"{MINIMUM_DONE_STEPS_ROWS}), {open_count} open carry-forward(s) "
        f"(minimum {MINIMUM_OPEN_CARRY_FORWARDS}); md={md_ok}, html={html_ok}"
    )


if __name__ == "__main__":
    main()
