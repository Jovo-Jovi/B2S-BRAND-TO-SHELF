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
  MINIMUM_RELEASE_BLOCKS       3  — docs/product/SCOPE.md §2: the Release 1
                                    item list plus every "**Release N:**"
                                    paragraph. Without this floor, a §2 whose
                                    prose shape changed so that only the
                                    Release 1 block still parsed would still
                                    regenerate — both sides empty of Release
                                    2/3 content alike — and the byte-comparison
                                    below would pass over the loss (P02-T09).
  MINIMUM_ROLE_JOURNEY_ROWS    17 — docs/product/ROLE_JOURNEY.md's table
                                    (P02-T09, OD-H9)

Each of the two removed-target and emptied-target failure modes is proven by
this repository's own plant-and-revert probe set (PR-26): removing or
emptying either scan target's inputs, or `docs/ROADMAP.md` /
`docs/roadmap.html` themselves, must fail loudly rather than pass over
nothing — `scripts/generate_roadmap.py`'s own `die()` calls cover the input
side, and the byte-comparison below covers the two committed outputs.

**ROLE_JOURNEY.md conformance, both ways (OD-H9, P02-T09).** A
reviewer-authored specification lands with the check that asserts it against
reality, or it does not land. Three assertions, each naming the short side:

  actors    every Role cell in the table is one of the five values
            `supabase/schema.sql`'s `public.role` enum declares, or one of the
            two named non-enum actors, Operator and Buyer — an actor spelled
            any other way is unrecognised by construction
  coverage  every one of the five enum values has at least one table row —
            an enum value the table never mentions is a role this
            specification says nothing about
  phases    every Owning phase cell names a phase `BUILD_PHASES.md` actually
            carries — already enforced by `scripts/generate_roadmap.py`'s own
            `die()` at generation time, and re-asserted here as a `fail()` so
            a violation is reported the same way as the other two rather than
            aborting generation entirely

`supabase/schema.sql` is the authoritative schema (ADR-006); this is the only
place in this check that departs from generate_roadmap.py's closed input list,
because ROLE_JOURNEY.md's own conformance is a check concern, not a rendering
concern.
"""
import importlib.util
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GENERATOR = os.path.join(REPO, "scripts", "generate_roadmap.py")
SCHEMA_REL = "supabase/schema.sql"

ROADMAP_MD_REL = "docs/ROADMAP.md"
ROADMAP_HTML_REL = "docs/roadmap.html"
BUILD_PHASES_REL = "docs/method/BUILD_PHASES.md"
ROLE_JOURNEY_REL = "docs/product/ROLE_JOURNEY.md"
SCOPE_REL = "docs/product/SCOPE.md"

MINIMUM_PHASES = 9
MINIMUM_DONE_STEPS_ROWS = 1
MINIMUM_OPEN_CARRY_FORWARDS = 1
MINIMUM_RELEASE_BLOCKS = 3
MINIMUM_ROLE_JOURNEY_ROWS = 17

NAMED_NON_ENUM_ACTORS = {"Operator", "Buyer"}

FAIL = False


def fail(msg):
    global FAIL
    print(f"FAIL: {msg}")
    FAIL = True


def die(msg):
    print(f"FAIL: {msg}")
    sys.exit(1)


def read_repo_file(rel):
    path = os.path.join(REPO, rel)
    if not os.path.isfile(path):
        die(f"{rel} does not exist — this check's only source for the "
            f"assertion that reads it")
    with open(path, encoding="utf-8") as handle:
        return handle.read()


def parse_role_enum(schema_text):
    m = re.search(
        r"create type public\.role as enum \((.*?)\)", schema_text, re.S
    )
    if not m:
        die(f"{SCHEMA_REL}: could not find "
            f"'create type public.role as enum (...)' — this check's only "
            f"source for the five tenant-role enum values")
    values = re.findall(r"'([a-z_]+)'", m.group(1))
    if not values:
        die(f"{SCHEMA_REL}: 'public.role' enum statement found but no "
            f"quoted value inside it")
    return values


def check_role_journey_conformance(role_journey_rows, phase_ids, enum_roles):
    """OD-H9, both ways. Three assertions, each naming the short side rather
    than the long one, per the task's own instruction. Returns True if the
    'owning phase' assertion held — the caller must not attempt to call
    generator.collect() when it did not, because
    generate_roadmap.py's own role_journey_status() would die() on the same
    row before this check's accumulated fail()s ever reached the report."""
    enum_set = set(enum_roles)
    recognised = enum_set | {a.lower() for a in NAMED_NON_ENUM_ACTORS}

    unrecognised = sorted({
        row["role"] for row in role_journey_rows
        if row["role"].lower() not in recognised
    })
    if unrecognised:
        fail(
            f"{ROLE_JOURNEY_REL}: {len(unrecognised)} actor(s) named that are "
            f"neither a `public.role` enum value ({', '.join(enum_roles)}) "
            f"nor one of the two named non-enum actors "
            f"({', '.join(sorted(NAMED_NON_ENUM_ACTORS))}): "
            f"{', '.join(unrecognised)}"
        )

    present_roles = {row["role"].lower() for row in role_journey_rows}
    uncovered = sorted(enum_set - present_roles)
    if uncovered:
        fail(
            f"{ROLE_JOURNEY_REL}: {len(uncovered)} `public.role` enum "
            f"value(s) have no row at all in the table: {', '.join(uncovered)}"
        )

    bad_phase_rows = [
        row for row in role_journey_rows if row["phase"] not in phase_ids
    ]
    phases_ok = not bad_phase_rows
    if bad_phase_rows:
        named = sorted({
            f"{row['role']!r} \u2192 {row['phase']!r}" for row in bad_phase_rows
        })
        fail(
            f"{ROLE_JOURNEY_REL}: {len(bad_phase_rows)} row(s) name an "
            f"owning phase that does not exist in {BUILD_PHASES_REL}: "
            f"{', '.join(named)}"
        )

    return phases_ok


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

    schema_text = read_repo_file(SCHEMA_REL)
    enum_roles = parse_role_enum(schema_text)

    phases_text = generator.read(BUILD_PHASES_REL)
    raw_phases = generator.parse_phases(phases_text)
    phase_ids = {p["id"] for p in raw_phases}

    role_journey_text = generator.read(ROLE_JOURNEY_REL)
    raw_role_rows = generator.parse_role_journey(role_journey_text)

    phases_ok = check_role_journey_conformance(raw_role_rows, phase_ids, enum_roles)
    if not phases_ok:
        # generator.collect() would die() on the very row already named above
        # (generate_roadmap.py's own role_journey_status() has no soft-fail
        # path for an owning phase that does not exist) — reported here as a
        # fail() naming the short side and stop, rather than let collect()
        # abort with its own, differently-shaped message.
        sys.exit(1)

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

    release_block_count = len(data["releases"]["blocks"])
    if release_block_count < MINIMUM_RELEASE_BLOCKS:
        die(f"regeneration parsed {release_block_count} release block(s) "
            f"from {SCOPE_REL} §2, minimum {MINIMUM_RELEASE_BLOCKS} (the "
            f"Release 1 item list plus every '**Release N:**' paragraph). A "
            f"§2 whose prose shape changed so that fewer blocks parse would "
            f"otherwise regenerate empty on both sides and pass the "
            f"byte-comparison over the lost content (PR-27, P02-T09 ROW B)")

    role_journey_row_count = len(data["role_journey_rows"])
    if role_journey_row_count < MINIMUM_ROLE_JOURNEY_ROWS:
        die(f"regeneration parsed {role_journey_row_count} row(s) from "
            f"{ROLE_JOURNEY_REL}, minimum {MINIMUM_ROLE_JOURNEY_ROWS}. An "
            f"emptied table would regenerate an empty Role journeys section "
            f"on both sides and pass the byte-comparison over the loss "
            f"(PR-27, P02-T09 ROW B)")

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
        f"(minimum {MINIMUM_OPEN_CARRY_FORWARDS}), {release_block_count} "
        f"release block(s) (minimum {MINIMUM_RELEASE_BLOCKS}), "
        f"{role_journey_row_count} role-journey row(s) (minimum "
        f"{MINIMUM_ROLE_JOURNEY_ROWS}) across {len(enum_roles)} enum role(s) "
        f"and {len(NAMED_NON_ENUM_ACTORS)} named non-enum actor(s), all "
        f"owning-phase references resolved; md={md_ok}, html={html_ok}"
    )


if __name__ == "__main__":
    main()
