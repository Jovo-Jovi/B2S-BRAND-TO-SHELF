#!/usr/bin/env python3
"""SECURITY_MODEL.md §11a.1 against supabase/schema.sql, both directions. OD-H9.

§11a is the B2S-owned tier of the RLS-bypass inventory, and §11.0 sets its
standard: every object in it is individually justified, and one this project
created that the section does not name is a hard failure. That standard is only
as good as somebody noticing, and at P02-T05 nobody did — two `security definer`
functions were added to schema `public` and §11a.1 went on stating six and
listing six while the schema held eight. This check is the noticing.

`schema.sql` is the authoritative schema (ADR-006) and `check_migration_split.py`
holds it equivalent to the applied migrations, so a function that exists in the
database exists here.

  count      §11a.1's stated `public` total equals the number of rows in its own
             table, and equals the number of `security definer` functions the
             schema declares in `public`
  forward    every `security definer` function in `public` has a row
  backward   every row names a `security definer` function in `public`
  totals     §11a.1's stated catalog total equals its stated `public` total plus
             §11b.1's stated outside-`public` total, and §11b.1's back-reference
             to §11a.1's figure agrees with §11a.1

**What this check cannot do, stated rather than implied.** The `public` figures
are asserted against reality, because `schema.sql` is reality for objects this
project creates. The platform figures — §11b.1's three, and the catalog total
that contains them — are asserted only for self-consistency, because Supabase's
own functions are not in this repository at all. A fourth platform function
appearing would leave §11b.1 stating three, the catalog total stating eleven,
and this check green. Measuring that side is the live re-derivation §11.5 binds
to every phase exit gate, and nothing static can replace it.

PR-27 — this check states the minimum it expected to examine. A removed target,
an emptied schema and a §11a.1 with no table each error rather than reporting a
clean zero.
"""
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOC_REL = "docs/product/SECURITY_MODEL.md"
SCHEMA_REL = "supabase/schema.sql"

MINIMUM_TABLE_ROWS = 2
MINIMUM_SCHEMA_DEFINERS = 2

WORD_NUMBERS = {
    "zero": 0, "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10, "eleven": 11,
    "twelve": 12, "thirteen": 13, "fourteen": 14, "fifteen": 15,
    "sixteen": 16, "seventeen": 17, "eighteen": 18, "nineteen": 19,
    "twenty": 20,
}

FAIL = False


def fail(msg):
    global FAIL
    print(f"FAIL: {msg}")
    FAIL = True


def die(msg):
    print(f"FAIL: {msg}")
    sys.exit(1)


def read(rel):
    path = os.path.join(REPO, rel)
    if not os.path.isfile(path):
        die(f"{rel} does not exist — it is one of this check's two scan targets, "
            f"and §11a.1 cannot be compared against a schema that is not there "
            f"(PR-27)")
    with open(path, encoding="utf-8") as handle:
        return handle.read()


def to_number(token):
    t = token.strip().lower()
    return int(t) if t.isdigit() else WORD_NUMBERS.get(t)


def subsection(text, number):
    """The body of `#### <number> ...` up to the next `###`-or-deeper heading."""
    match = re.search(
        rf"^#### {re.escape(number)} .*?$(.*?)(?=^#{{3,4}} |\Z)",
        text, re.M | re.S)
    if not match:
        die(f"{DOC_REL}: could not isolate §{number}. This check asserts that "
            f"subsection and found no `#### {number}` heading for it (PR-27)")
    return match.group(1)


def stated(section, pattern, what, number):
    match = re.search(pattern, section)
    if not match:
        die(f"{DOC_REL} §{number}: no readable figure for {what}. This check "
            f"asserts that number and there is nothing to assert (PR-27)")
    value = to_number(match.group(1))
    if value is None:
        die(f"{DOC_REL} §{number}: {what} is stated as {match.group(1)!r}, "
            f"which is not readable as a number")
    return value


def normalise_args(raw):
    """`p_name text, p_slug text` -> `text, text`; `uuid` -> `uuid`.

    A signature is compared on its argument TYPES, which is the identity
    PostgreSQL itself uses. Parameter names are rendered by
    `pg_get_function_identity_arguments()` and written by the schema, and are
    not part of what makes two functions the same function.
    """
    args = [a.strip() for a in re.split(r",(?![^(]*\))", raw) if a.strip()]
    types = []
    for arg in args:
        parts = arg.split()
        types.append(" ".join(parts[1:]) if len(parts) > 1 else parts[0])
    return ", ".join(types)


def documented(section):
    """The first cell of each `| \\`name(args)\\` |` row in §11a.1's table."""
    rows = []
    for line in section.split("\n"):
        line = line.strip()
        if not line.startswith("|"):
            continue
        cell = line.split("|")[1].strip()
        match = re.fullmatch(r"`(\w+)\(([^`]*)\)`", cell)
        if match:
            rows.append(f"{match.group(1)}({normalise_args(match.group(2))})")
    return rows


def schema_definers(schema):
    """Every `security definer` function `create`d in schema `public`.

    Line comments are blanked first, so `security definer` in prose above a
    function is never read as an option of it. A `create or replace` of a
    function already created — migration 13 does this to `current_tenant_id()` —
    is the same identity and is counted once.
    """
    code = "\n".join(
        line[:line.find("--")] if line.find("--") >= 0 else line
        for line in (
            "" if raw.lstrip().startswith("--") else raw
            for raw in schema.split("\n")
        )
    )

    found = {}
    for match in re.finditer(
            r"create\s+(?:or\s+replace\s+)?function\s+public\.(\w+)\s*\(",
            code, re.I):
        name = match.group(1)
        depth, i = 1, match.end()
        while depth and i < len(code):
            if code[i] == "(":
                depth += 1
            elif code[i] == ")":
                depth -= 1
            i += 1
        signature = code[match.end():i - 1]
        body = re.compile(r"\bas\s+(\$\w*\$)", re.I).search(code, i)
        if not body:
            die(f"{SCHEMA_REL}: `create function public.{name}` has no "
                f"dollar-quoted body, so its options cannot be read and its "
                f"`security definer` status is unknown")
        options = code[i:body.start()]
        identity = f"{name}({normalise_args(signature)})"
        definer = bool(re.search(r"security\s+definer", options, re.I))
        # A later `create or replace` is what the database ends up holding.
        found[identity] = definer

    return sorted(k for k, v in found.items() if v)


def main():
    doc = read(DOC_REL)
    schema = read(SCHEMA_REL)

    a1 = subsection(doc, "11a.1")
    b1 = subsection(doc, "11b.1")

    stated_public = stated(
        a1, r"\*\*(\w+) exist in schema `public`\*\*",
        "the number of `security definer` functions in `public`", "11a.1")
    stated_catalog = stated(
        a1, r"live catalog holds \*\*(\w+)\*\* in total",
        "the catalog total", "11a.1")
    stated_outside = stated(
        b1, r"\*\*(\w+) exist outside schema `public`\*\*",
        "the number of `security definer` functions outside `public`", "11b.1")
    back_reference = stated(
        b1, r"against §11a\.1's (\w+)\b",
        "the back-reference to §11a.1's figure", "11b.1")

    rows = documented(a1)
    if len(rows) < MINIMUM_TABLE_ROWS:
        die(f"{DOC_REL} §11a.1 holds {len(rows)} table row(s), minimum "
            f"{MINIMUM_TABLE_ROWS}. Either the table was emptied or its row "
            f"format changed, and this check would have compared an empty "
            f"inventory against a live schema and passed (PR-27)")

    definers = schema_definers(schema)
    if len(definers) < MINIMUM_SCHEMA_DEFINERS:
        die(f"{SCHEMA_REL} declares {len(definers)} `security definer` "
            f"function(s) in schema public, minimum {MINIMUM_SCHEMA_DEFINERS}. "
            f"An emptied schema makes every assertion here vacuous (PR-27)")

    duplicates = sorted({r for r in rows if rows.count(r) > 1})
    if duplicates:
        fail(f"{DOC_REL} §11a.1 gives {duplicates} more than one row")

    if stated_public != len(rows):
        fail(f"{DOC_REL} §11a.1 states {stated_public} `security definer` "
             f"function(s) in `public` and its own table has {len(rows)} row(s) "
             f"— the {'table' if len(rows) < stated_public else 'stated total'} "
             f"is the short side: {sorted(rows)}")

    if stated_public != len(definers):
        fail(f"{DOC_REL} §11a.1 states {stated_public} `security definer` "
             f"function(s) in `public` and {SCHEMA_REL} declares "
             f"{len(definers)} — the "
             f"{'document' if stated_public < len(definers) else 'schema'} is "
             f"the short side: {definers}")

    unlisted = sorted(set(definers) - set(rows))
    if unlisted:
        fail(f"{SCHEMA_REL} declares `security definer` function(s) {unlisted} "
             f"in `public` and {DOC_REL} §11a.1 gives "
             f"{'them' if len(unlisted) > 1 else 'it'} no row — the DOCUMENT is "
             f"the short side, and §11a's standard is an individual "
             f"justification for each")

    phantom = sorted(set(rows) - set(definers))
    if phantom:
        fail(f"{DOC_REL} §11a.1 gives a row to {phantom} and {SCHEMA_REL} "
             f"declares no such `security definer` function in `public` — the "
             f"SCHEMA is the short side")

    if stated_catalog != stated_public + stated_outside:
        fail(f"{DOC_REL} §11a.1 states a catalog total of {stated_catalog} and "
             f"its own two tiers state {stated_public} in `public` plus "
             f"{stated_outside} outside it = {stated_public + stated_outside}")

    if back_reference != stated_public:
        fail(f"{DOC_REL} §11b.1 cites §11a.1's figure as {back_reference} and "
             f"§11a.1 states {stated_public}")

    if FAIL:
        sys.exit(1)

    print(
        f"OK: {DOC_REL} §11a.1 and {SCHEMA_REL} agree both ways. "
        f"{stated_public} stated = {len(rows)} table row(s) = {len(definers)} "
        f"`security definer` function(s) in `public` {definers}; "
        f"catalog total {stated_catalog} = {stated_public} + §11b.1's "
        f"{stated_outside} outside `public`; {len(rows)} row(s) examined, "
        f"minimum {MINIMUM_TABLE_ROWS}; {len(definers)} schema function(s) "
        f"examined, minimum {MINIMUM_SCHEMA_DEFINERS}"
    )


if __name__ == "__main__":
    main()
