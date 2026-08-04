#!/usr/bin/env python3
"""DATA_MODEL.md §3 against supabase/schema.sql, both directions. OD-H9.

§3 is the Platform tier specification and `schema.sql` is the authoritative
schema (ADR-006), which `check_migration_split.py` holds equivalent to the
applied migrations. This check asserts one against the other:

  counts   §3's stated table count and enum count match what the schema declares
  tables   every §3.n subsection names a table the schema creates, and every
           table the schema creates has a §3.n subsection
  enums    §3's enum roster and the schema's `create type ... as enum` set are
           the same set, not merely the same size

**Why both directions and not just the count.** `check_stated_counts.py` already
asserts §3's two totals and that every live table and enum is named *somewhere*
in the document. Somewhere is not the same as specified: a table named only in
passing in §2's prose would satisfy that and carry no column list, no RLS
paragraph and no owner. This check asks the stronger question — does §3 give the
table a subsection of its own, and does the schema create every table that has
one. A count is right for the wrong reason the moment two names swap.

**§3.7 is `role` and is deliberately not a table.** A subsection whose heading
says `not a table` is read as the enum it declares rather than as a table, which
is what makes the six-tables-four-enums split checkable instead of a discrepancy
somebody has to remember the reason for.

PR-27 — this check states the minimum it expected to examine. A removed target, a
§3 with no subsections and a schema declaring nothing each error rather than
reporting a clean zero.
"""
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOC_REL = "docs/product/DATA_MODEL.md"
SCHEMA_REL = "supabase/schema.sql"

MINIMUM_SUBSECTIONS = 2
MINIMUM_SCHEMA_TABLES = 1
MINIMUM_SCHEMA_ENUMS = 1

WORD_NUMBERS = {
    "zero": 0, "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    "eleven": 11, "twelve": 12,
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
            f"and §3 cannot be compared against a schema that is not there "
            f"(PR-27)")
    with open(path, encoding="utf-8") as handle:
        return handle.read()


def to_number(token):
    t = token.strip().lower()
    return int(t) if t.isdigit() else WORD_NUMBERS.get(t)


def section_three(text):
    match = re.search(r"\n## 3\. The Platform tier\n(.*?)\n## 4\.", text, re.S)
    if not match:
        die(f"{DOC_REL}: could not isolate §3 (the Platform tier). This check "
            f"asserts that section and found no heading for it (PR-27)")
    return match.group(1)


def stated_counts(section):
    match = re.search(r"^(\w+) tables? and (\w+) enums?\b", section.strip())
    if not match:
        die(f"{DOC_REL} §3: the stated counts are not at the head of the section "
            f'("<n> tables and <n> enums"), so there is nothing to assert '
            f"against the schema (PR-27)")
    tables = to_number(match.group(1))
    enums = to_number(match.group(2))
    if tables is None or enums is None:
        die(f"{DOC_REL} §3: stated counts are not readable as numbers: "
            f"{match.group(1)!r} tables, {match.group(2)!r} enums")
    return tables, enums


def documented(section):
    """The §3.n subsections, split into tables and the enums that live there.

    A subsection heading is `### 3.n `name`` and carries the entity it specifies
    as its only backticked name. `not a table` in the heading marks a subsection
    that declares an enum instead — §3.7 `role` is the one.
    """
    tables, enums = [], []
    headings = re.findall(r"^### 3\.\d+ `([^`]+)`(.*)$", section, re.M)
    for name, tail in headings:
        (enums if "not a table" in tail.lower() else tables).append(name)
    return tables, enums


def enum_roster(section):
    """§3's `**The four enums:**`-style roster: a single parseable line stating
    the enum set the paragraph above it describes in prose. The label's count
    word is not trusted as the total — `stated_counts` owns that — so the label
    is matched loosely and only the backticked names are read."""
    match = re.search(r"^\*\*The \w+ enums:\*\*(.*?)(?:\n\s*\n|\Z)",
                      section, re.M | re.S)
    if not match:
        die(f"{DOC_REL} §3: no '**The <n> enums:**' roster line. The enum names "
            f"are read from the document, and prose naming them among other "
            f"backticked terms is not parseable — which is why the roster "
            f"exists (OD-H9, PR-27)")
    return re.findall(r"`([^`]+)`", match.group(1))


def schema_objects(schema):
    tables = sorted(set(re.findall(
        r"^\s*create\s+table\s+(?:if\s+not\s+exists\s+)?public\.(\w+)",
        schema, re.M | re.I)))
    enums = sorted(set(re.findall(
        r"^\s*create\s+type\s+public\.(\w+)\s+as\s+enum",
        schema, re.M | re.I)))
    return tables, enums


def compare(kind, doc_names, schema_names):
    only_doc = sorted(set(doc_names) - set(schema_names))
    only_schema = sorted(set(schema_names) - set(doc_names))
    if only_doc:
        fail(f"{DOC_REL} §3 specifies {kind} {only_doc} and {SCHEMA_REL} "
             f"declares no such {kind[:-1]}")
    if only_schema:
        fail(f"{SCHEMA_REL} declares {kind} {only_schema} and {DOC_REL} §3 gives "
             f"{'them' if len(only_schema) > 1 else 'it'} no specification")
    duplicates = sorted({n for n in doc_names if doc_names.count(n) > 1})
    if duplicates:
        fail(f"{DOC_REL} §3 names {kind} {duplicates} more than once")


def main():
    text = read(DOC_REL)
    schema = read(SCHEMA_REL)
    section = section_three(text)

    stated_tables, stated_enums = stated_counts(section)
    doc_tables, heading_enums = documented(section)
    doc_enums = enum_roster(section)

    subsections = len(doc_tables) + len(heading_enums)
    if subsections < MINIMUM_SUBSECTIONS:
        die(f"{DOC_REL} §3 holds {subsections} '### 3.n' subsection(s), minimum "
            f"{MINIMUM_SUBSECTIONS}. Either the section was emptied or its "
            f"heading format changed, and this check would have compared an "
            f"empty specification against a live schema and passed (PR-27)")

    schema_tables, schema_enums = schema_objects(schema)
    if len(schema_tables) < MINIMUM_SCHEMA_TABLES:
        die(f"{SCHEMA_REL} declares {len(schema_tables)} table(s) in schema "
            f"public, minimum {MINIMUM_SCHEMA_TABLES}. An emptied schema makes "
            f"every assertion here vacuous (PR-27)")
    if len(schema_enums) < MINIMUM_SCHEMA_ENUMS:
        die(f"{SCHEMA_REL} declares {len(schema_enums)} enum(s) in schema "
            f"public, minimum {MINIMUM_SCHEMA_ENUMS}. An emptied schema makes "
            f"every assertion here vacuous (PR-27)")

    # Every enum with a subsection of its own must also be on the roster, or the
    # roster is not the enum set it claims to be.
    missing = [e for e in heading_enums if e not in doc_enums]
    if missing:
        fail(f"{DOC_REL} §3: {missing} has a subsection declaring it an enum and "
             f"is absent from the roster line")

    if stated_tables != len(schema_tables):
        fail(f"{DOC_REL} §3 states {stated_tables} tables and {SCHEMA_REL} "
             f"declares {len(schema_tables)}: {schema_tables}")
    if stated_enums != len(schema_enums):
        fail(f"{DOC_REL} §3 states {stated_enums} enums and {SCHEMA_REL} "
             f"declares {len(schema_enums)}: {schema_enums}")
    if stated_tables != len(doc_tables):
        fail(f"{DOC_REL} §3 states {stated_tables} tables and gives "
             f"{len(doc_tables)} of them a subsection: {sorted(doc_tables)}")
    if stated_enums != len(doc_enums):
        fail(f"{DOC_REL} §3 states {stated_enums} enums and its roster line "
             f"names {len(doc_enums)}: {doc_enums}")

    compare("tables", doc_tables, schema_tables)
    compare("enums", doc_enums, schema_enums)

    if FAIL:
        sys.exit(1)

    print(
        f"OK: {DOC_REL} §3 and {SCHEMA_REL} agree both ways. "
        f"{stated_tables} stated tables = {len(doc_tables)} §3.n subsection(s) = "
        f"{len(schema_tables)} in the schema {schema_tables}; "
        f"{stated_enums} stated enums = {len(doc_enums)} on the roster = "
        f"{len(schema_enums)} in the schema {schema_enums}; "
        f"{subsections} subsection(s) examined, minimum {MINIMUM_SUBSECTIONS}"
    )


if __name__ == "__main__":
    main()
