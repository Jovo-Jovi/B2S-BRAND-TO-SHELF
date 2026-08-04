#!/usr/bin/env python3
"""Migration-split fidelity. ADR-006, CF-110.

`supabase/schema.sql` is the authoritative source and the files in
`supabase/migrations/` are split from it verbatim, in source order. CF-110
closes on what "verbatim" means, because two tasks measured it two ways: P01-T03
compared byte-for-byte, P01-T04 compared whitespace-normalised, and a word with
two meanings is not a rule anyone can enforce.

The standard, stated here as a mechanism rather than as a measurement somebody
takes: concatenating the migrations in filename order reproduces `schema.sql`
from its first marker, **whitespace-normalised**. A trailing newline at a file
boundary is not a divergence. A changed statement is.

Asserted positively, per PR-22: this compares the value the split must have
against the value it does have, at the structural location where a divergence
occurs. It does not scan for forbidden strings.
"""
import glob
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCHEMA = os.path.join(REPO, "supabase", "schema.sql")
MIGRATIONS = os.path.join(REPO, "supabase", "migrations", "*.sql")

MARKER = re.compile(r"^-- ===== migration: (.+?) =====\s*$", re.M)


def fail(message):
    print(f"FAIL: {message}")
    sys.exit(1)


def normalise(text):
    """Right-strip every line and drop the blank ones. Returns the surviving
    lines paired with their 1-based line number in the original text, so a
    divergence can be reported where a human will find it."""
    kept = []
    for number, raw in enumerate(text.replace("\r\n", "\n").split("\n"), start=1):
        line = raw.rstrip()
        if line:
            kept.append((number, line))
    return kept


def statement_around(lines, index):
    """The SQL statement containing lines[index], recovered by walking out to
    the surrounding semicolons. A line number alone says where the two sides
    stopped agreeing; the statement says what disagreed."""
    start = index
    while start > 0 and not lines[start - 1][1].rstrip().endswith(";"):
        start -= 1
    end = index
    while end < len(lines) - 1 and not lines[end][1].rstrip().endswith(";"):
        end += 1
    return lines[start:end + 1]


def main():
    if not os.path.exists(SCHEMA):
        fail(f"{SCHEMA} does not exist — it is the authoritative source (ADR-006)")

    with open(SCHEMA, encoding="utf-8") as handle:
        schema_text = handle.read()

    markers = list(MARKER.finditer(schema_text))
    if not markers:
        fail("schema.sql carries no '-- ===== migration: ... =====' marker, "
             "so there is nothing to split it at")

    paths = sorted(glob.glob(MIGRATIONS))
    if not paths:
        fail("supabase/migrations/ holds no .sql file, and schema.sql declares "
             f"{len(markers)} migration marker(s)")

    # Every marker names a migration, and every migration file answers to a
    # marker. A count match alone would let two files swap places unnoticed.
    declared = [match.group(1).strip() for match in markers]
    on_disk = [os.path.splitext(os.path.basename(p))[0] for p in paths]
    if declared != on_disk:
        only_declared = [n for n in declared if n not in on_disk]
        only_on_disk = [n for n in on_disk if n not in declared]
        fail(
            "the markers in schema.sql and the files in supabase/migrations/ do "
            "not correspond in order.\n"
            f"  declared in schema.sql : {declared}\n"
            f"  on disk, filename order: {on_disk}\n"
            f"  declared but absent    : {only_declared or 'none'}\n"
            f"  present but undeclared : {only_on_disk or 'none'}"
        )

    body = schema_text[markers[0].start():]
    concatenated = ""
    for path in paths:
        with open(path, encoding="utf-8") as handle:
            concatenated += handle.read()

    left = normalise(body)
    right = normalise(concatenated)
    offset = schema_text[:markers[0].start()].count("\n")

    limit = min(len(left), len(right))
    for index in range(limit):
        if left[index][1] != right[index][1]:
            schema_line = left[index][0] + offset
            print("FAIL: schema.sql and the concatenated migrations diverge.")
            print("ADR-006 splits the migrations from schema.sql verbatim, which "
                  "CF-110 fixes as")
            print("whitespace-normalised identical: a blank line at a file "
                  "boundary is not a")
            print("divergence, a changed statement is. This is a changed statement.\n")
            print(f"  first divergence at schema.sql:{schema_line}\n")
            print("  schema.sql:")
            for _, line in statement_around(left, index):
                print(f"    {line}")
            print("\n  concatenated migrations:")
            for _, line in statement_around(right, index):
                print(f"    {line}")
            sys.exit(1)

    if len(left) != len(right):
        longer, label = (left, "schema.sql") if len(left) > len(right) \
            else (right, "the concatenated migrations")
        extra = longer[limit]
        print("FAIL: schema.sql and the concatenated migrations diverge in length.")
        print(f"  schema.sql non-blank lines            : {len(left)}")
        print(f"  concatenated migrations non-blank lines: {len(right)}")
        print(f"  first unmatched statement, in {label}:")
        for _, line in statement_around(longer, limit):
            print(f"    {line}")
        print(f"  ({label} line {extra[0] + (offset if longer is left else 0)})")
        sys.exit(1)

    print(
        f"OK: {len(paths)} migration(s) concatenate to schema.sql from its first "
        f"marker, {len(left)} non-blank lines identical on both sides"
    )


if __name__ == "__main__":
    main()
