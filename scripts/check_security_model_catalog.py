#!/usr/bin/env python3
"""SECURITY_MODEL.md §11a names against supabase/schema.sql, both directions.

§11.5: a public object this document does not name is a hard failure. §11a.2
names the final public tables. §11a.1 and §11a.4 together name the final
public functions. schema.sql is the authoritative schema (ADR-006).

  tables     the §11a.2 roster equals the tables alive after every create and
             drop, and each row states owner postgres, RLS enabled, FORCE off
  functions  the §11a.1 rows and the §11a.4 rows together equal the functions
             alive after every create and drop; §11a.4's rows are the ones
             that are not security definer
  counts     the Final set line in §11a.2 equals both rosters and the schema

PR-27 — floors are the live counts. A removed target, an emptied schema, or a
roster shorter than the floor errors rather than reporting a clean zero.
"""
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOC_REL = "docs/product/SECURITY_MODEL.md"
SCHEMA_REL = "supabase/schema.sql"

MINIMUM_TABLES = 22
MINIMUM_FUNCTIONS = 16

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
        die(f"{rel} does not exist — it is one of this check's two scan "
            f"targets, and §11 cannot be compared against a file that is not "
            f"there (PR-27)")
    with open(path, encoding="utf-8") as handle:
        return handle.read()


def subsection(text, number):
    match = re.search(
        rf"^#### {re.escape(number)} .*?$(.*?)(?=^#{{3,4}} |\Z)",
        text, re.M | re.S)
    if not match:
        die(f"{DOC_REL}: could not isolate §{number}. This check asserts that "
            f"subsection and found no `#### {number}` heading for it (PR-27)")
    return match.group(1)


def normalise_args(raw):
    args = [a.strip() for a in re.split(r",(?![^(]*\))", raw) if a.strip()]
    types = []
    for arg in args:
        parts = arg.split()
        types.append(" ".join(parts[1:]) if len(parts) > 1 else parts[0])
    return ", ".join(types)


def _argument_list(code, open_paren_end):
    depth, i = 1, open_paren_end
    while depth and i < len(code):
        if code[i] == "(":
            depth += 1
        elif code[i] == ")":
            depth -= 1
        i += 1
    return code[open_paren_end:i - 1], i


def blank_comments(schema):
    return "\n".join(
        line[:line.find("--")] if line.find("--") >= 0 else line
        for line in (
            "" if raw.lstrip().startswith("--") else raw
            for raw in schema.split("\n")
        )
    )


def function_rows(section):
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


def table_rows(section):
    rows = []
    for line in section.split("\n"):
        stripped = line.strip()
        if not stripped.startswith("|"):
            continue
        cells = [cell.strip().strip("`") for cell in stripped.split("|")]
        cells = [cell for cell in cells if cell != ""]
        if len(cells) < 4:
            continue
        name = cells[0]
        if not re.fullmatch(r"[a-z][a-z0-9_]*", name):
            continue
        if name in ("Table",):
            continue
        rows.append((name, cells[1], cells[2], cells[3]))
    return rows


def schema_tables(schema):
    code = blank_comments(schema)
    events = []
    for match in re.finditer(
            r"create\s+table\s+(?:if\s+not\s+exists\s+)?public\.(\w+)",
            code, re.I):
        events.append((match.start(), "create", match.group(1)))
    for match in re.finditer(
            r"drop\s+table\s+(?:if\s+exists\s+)?public\.(\w+)",
            code, re.I):
        events.append((match.start(), "drop", match.group(1)))
    alive = []
    for _pos, kind, name in sorted(events, key=lambda event: event[0]):
        if kind == "create":
            if name not in alive:
                alive.append(name)
        elif name in alive:
            alive.remove(name)
    enabled = set(re.findall(
        r"alter\s+table\s+public\.(\w+)\s+enable\s+row\s+level\s+security",
        code, re.I))
    forced = set(re.findall(
        r"alter\s+table\s+public\.(\w+)\s+force\s+row\s+level\s+security",
        code, re.I))
    return alive, enabled, forced


def schema_functions(schema):
    code = blank_comments(schema)
    events = []
    for match in re.finditer(
            r"create\s+(?:or\s+replace\s+)?function\s+public\.(\w+)\s*\(",
            code, re.I):
        name = match.group(1)
        signature, after = _argument_list(code, match.end())
        body = re.compile(r"\bas\s+(\$\w*\$)", re.I).search(code, after)
        if not body:
            die(f"{SCHEMA_REL}: `create function public.{name}` has no "
                f"dollar-quoted body, so its options cannot be read")
        options = code[after:body.start()]
        identity = f"{name}({normalise_args(signature)})"
        definer = bool(re.search(r"security\s+definer", options, re.I))
        events.append((match.start(), "create", identity, definer))
    for match in re.finditer(
            r"drop\s+function\s+(?:if\s+exists\s+)?public\.(\w+)\s*\(",
            code, re.I):
        name = match.group(1)
        signature, _after = _argument_list(code, match.end())
        identity = f"{name}({normalise_args(signature)})"
        events.append((match.start(), "drop", identity, False))
    alive = {}
    for _pos, kind, identity, definer in sorted(events, key=lambda event: event[0]):
        if kind == "create":
            alive[identity] = definer
        else:
            alive.pop(identity, None)
    return alive


def stated_final_set(section):
    match = re.search(
        r"Final set: \*\*(\d+)\*\* public tables and \*\*(\d+)\*\* public functions\.",
        section)
    if not match:
        die(f"{DOC_REL} §11a.2: no Final set line. This check asserts that "
            f"count and there is nothing to assert (PR-27)")
    return int(match.group(1)), int(match.group(2))


def main():
    doc = read(DOC_REL)
    schema = read(SCHEMA_REL)
    if not doc.strip():
        die(f"{DOC_REL} is empty — an emptied document makes this check "
            f"vacuous (PR-27)")
    if not schema.strip():
        die(f"{SCHEMA_REL} is empty — an emptied schema makes this check "
            f"vacuous (PR-27)")

    a1 = subsection(doc, "11a.1")
    a2 = subsection(doc, "11a.2")
    a4 = subsection(doc, "11a.4")

    stated_tables, stated_functions = stated_final_set(a2)
    rows = table_rows(a2)
    names = [name for name, _owner, _rls, _force in rows]
    definers = function_rows(a1)
    invokers = function_rows(a4)
    documented = definers + invokers

    schema_names, enabled, forced = schema_tables(schema)
    functions = schema_functions(schema)
    schema_identities = sorted(functions)
    schema_invokers = sorted(name for name, is_definer in functions.items() if not is_definer)

    if len(schema_names) < MINIMUM_TABLES:
        die(f"{SCHEMA_REL} declares {len(schema_names)} public table(s), "
            f"minimum {MINIMUM_TABLES}. An emptied schema makes every "
            f"assertion here vacuous (PR-27)")
    if len(names) < MINIMUM_TABLES:
        die(f"{DOC_REL} §11a.2 names {len(names)} public table(s), minimum "
            f"{MINIMUM_TABLES}. A short roster would be compared as if it "
            f"were the catalog (PR-27)")
    if len(functions) < MINIMUM_FUNCTIONS:
        die(f"{SCHEMA_REL} declares {len(functions)} public function(s), "
            f"minimum {MINIMUM_FUNCTIONS} (PR-27)")
    if len(documented) < MINIMUM_FUNCTIONS:
        die(f"{DOC_REL} §11a.1 and §11a.4 together name "
            f"{len(documented)} public function(s), minimum "
            f"{MINIMUM_FUNCTIONS} (PR-27)")

    duplicate_tables = sorted({name for name in names if names.count(name) > 1})
    if duplicate_tables:
        fail(f"{DOC_REL} §11a.2 names {duplicate_tables} more than once")

    if stated_tables != len(names):
        fail(f"{DOC_REL} §11a.2 states {stated_tables} public table(s) and "
             f"its roster has {len(names)} row(s)")
    if stated_tables != len(schema_names):
        fail(f"{DOC_REL} §11a.2 states {stated_tables} public table(s) and "
             f"{SCHEMA_REL} declares {len(schema_names)}")

    unlisted_tables = sorted(set(schema_names) - set(names))
    if unlisted_tables:
        fail(f"{SCHEMA_REL} declares public table(s) {unlisted_tables} and "
             f"{DOC_REL} §11a.2 does not name them — the DOCUMENT is the "
             f"short side")
    phantom_tables = sorted(set(names) - set(schema_names))
    if phantom_tables:
        fail(f"{DOC_REL} §11a.2 names {phantom_tables} and {SCHEMA_REL} "
             f"declares no such public table — the SCHEMA is the short side")

    bad_cells = [
        name for name, owner, rls, force in rows
        if owner != "postgres" or rls != "enabled" or force != "off"
    ]
    if bad_cells:
        fail(f"{DOC_REL} §11a.2 ownership, RLS or FORCE cell is not "
             f"postgres / enabled / off for {bad_cells}")

    missing_rls = sorted(set(schema_names) - enabled)
    if missing_rls:
        fail(f"{SCHEMA_REL} does not enable row level security on {missing_rls}")
    forced_tables = sorted(set(schema_names) & forced)
    if forced_tables:
        fail(f"{SCHEMA_REL} forces row level security on {forced_tables} and "
             f"§11a.2 states FORCE off")

    duplicate_functions = sorted({
        name for name in documented if documented.count(name) > 1
    })
    if duplicate_functions:
        fail(f"{DOC_REL} §11a.1 and §11a.4 together name {duplicate_functions} "
             f"more than once")

    overlap = sorted(set(definers) & set(invokers))
    if overlap:
        fail(f"{DOC_REL} names {overlap} in both §11a.1 and §11a.4")

    if stated_functions != len(documented):
        fail(f"{DOC_REL} §11a.2 states {stated_functions} public function(s) "
             f"and §11a.1 plus §11a.4 name {len(documented)}")
    if stated_functions != len(functions):
        fail(f"{DOC_REL} §11a.2 states {stated_functions} public function(s) "
             f"and {SCHEMA_REL} declares {len(functions)}")

    unlisted_functions = sorted(set(schema_identities) - set(documented))
    if unlisted_functions:
        fail(f"{SCHEMA_REL} declares public function(s) {unlisted_functions} "
             f"and {DOC_REL} §11a.1 and §11a.4 do not name them — the "
             f"DOCUMENT is the short side")
    phantom_functions = sorted(set(documented) - set(schema_identities))
    if phantom_functions:
        fail(f"{DOC_REL} §11a.1 and §11a.4 name {phantom_functions} and "
             f"{SCHEMA_REL} declares no such public function — the SCHEMA "
             f"is the short side")

    if sorted(invokers) != schema_invokers:
        fail(f"{DOC_REL} §11a.4 names {sorted(invokers)} and {SCHEMA_REL}'s "
             f"public functions that are not security definer are "
             f"{schema_invokers}")

    if FAIL:
        sys.exit(1)

    print(
        f"OK: {DOC_REL} §11a and {SCHEMA_REL} agree both ways. "
        f"{stated_tables} stated = {len(names)} table row(s) = "
        f"{len(schema_names)} public table(s), each owned by postgres with "
        f"RLS enabled and FORCE off; {stated_functions} stated = "
        f"{len(documented)} function name(s) = {len(functions)} public "
        f"function(s), §11a.4 holding the {len(invokers)} that are not "
        f"security definer; {len(names)} table(s) examined, minimum "
        f"{MINIMUM_TABLES}; {len(functions)} function(s) examined, minimum "
        f"{MINIMUM_FUNCTIONS}"
    )


if __name__ == "__main__":
    main()
