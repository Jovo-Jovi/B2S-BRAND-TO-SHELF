#!/usr/bin/env python3
"""The five wizard write paths are security invoker. P03-T22.

schema.sql is the enumeration. SECURITY_MODEL.md §11a.4 names these five
and may also name a public function that is not one of them.
`set_updated_at()` is that extra row: a trigger function, not a wizard
write path. This check requires the five to be present. The catalog check
holds the whole public function set equal to the schema. A function in
this list that is security definer, or a definer wearing one of these
names, fails. The grant lines are part of the same enumeration: each
function is revoked from public, anon and service_role, and granted to
authenticated.

PR-27 — the floors are the length of the stated list. An emptied schema or a
section with no table examines nothing and does not report success.
"""
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOC_REL = "docs/product/SECURITY_MODEL.md"
SCHEMA_REL = "supabase/schema.sql"

# The stated set. The floor is this list's length, checked against the
# list before the schema is read, so a shortened list cannot lower the bar.
FUNCTIONS = [
    "save_brand_name(text, text)",
    "save_brand_theme(uuid, text, text, text, text, text, text, text)",
    "save_legal_entity(text, text, text, text, text, text, text, text, text)",
    "save_guideline(uuid, uuid, text, text, text, text, integer)",
    "complete_onboarding(uuid)",
]
MINIMUM_INVOKERS = 5
MINIMUM_GRANT_BLOCKS = 5

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
            f"targets (PR-27)")
    with open(path, encoding="utf-8") as handle:
        return handle.read()


def normalise_args(raw):
    args = [a.strip() for a in re.split(r",(?![^(]*\))", raw) if a.strip()]
    types = []
    for arg in args:
        parts = arg.split()
        types.append(" ".join(parts[1:]) if len(parts) > 1 else parts[0])
    return ", ".join(types)


def subsection(text):
    match = re.search(
        r"^#### 11a\.4 .*?$(.*?)(?=^#{3,4} |\Z)",
        text, re.M | re.S)
    if not match:
        die(f"{DOC_REL}: could not isolate §11a.4. This check asserts that "
            f"subsection and found no heading for it (PR-27)")
    return match.group(1)


def documented(section):
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


def _argument_list(code, open_paren_end):
    depth, i = 1, open_paren_end
    while depth and i < len(code):
        if code[i] == "(":
            depth += 1
        elif code[i] == ")":
            depth -= 1
        i += 1
    return code[open_paren_end:i - 1], i


def schema_functions(schema):
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
        signature, after = _argument_list(code, match.end())
        body = re.compile(r"\bas\s+(\$\w*\$)", re.I).search(code, after)
        if not body:
            continue
        options = code[after:body.start()]
        identity = f"{name}({normalise_args(signature)})"
        if identity in FUNCTIONS or name in {row.split("(")[0] for row in FUNCTIONS}:
            found[identity] = options
    return found


def grant_block(schema, identity):
    """True when the four grant statements for this identity are present
    and EXECUTE is not granted to anon."""
    body = schema.lower()
    target = f"function public.{identity}".lower()
    needed = [
        f"revoke execute on {target} from public",
        f"revoke execute on {target} from anon",
        f"revoke execute on {target} from service_role",
        f"grant execute on {target} to authenticated",
    ]
    missing = [line for line in needed if line not in body]
    granted_anon = f"grant execute on {target} to anon" in body
    return missing, granted_anon


def main():
    if len(FUNCTIONS) < MINIMUM_INVOKERS:
        die(f"the stated function list has {len(FUNCTIONS)} row(s), minimum "
            f"{MINIMUM_INVOKERS}")

    doc = read(DOC_REL)
    schema = read(SCHEMA_REL)
    if not schema.strip():
        die(f"{SCHEMA_REL} is empty — an emptied schema makes this check "
            f"vacuous (PR-27)")
    if not doc.strip():
        die(f"{DOC_REL} is empty — an emptied document makes this check "
            f"vacuous (PR-27)")

    section = subsection(doc)
    rows = documented(section)
    if len(rows) < MINIMUM_INVOKERS:
        die(f"{DOC_REL} §11a.4 holds {len(rows)} table row(s), minimum "
            f"{MINIMUM_INVOKERS} (PR-27)")

    found = schema_functions(schema)
    if len(found) < MINIMUM_INVOKERS:
        die(f"{SCHEMA_REL} declares {len(found)} of the wizard write-path "
            f"function(s), minimum {MINIMUM_INVOKERS} (PR-27)")

    missing = [name for name in FUNCTIONS if name not in rows]
    if missing:
        fail(f"{DOC_REL} §11a.4 does not name wizard write path(s) {missing}")
    if sorted(found) != sorted(FUNCTIONS):
        fail(f"{SCHEMA_REL} wizard functions are {sorted(found)}, stated set "
             f"is {sorted(FUNCTIONS)}")

    grant_blocks = 0
    for identity in FUNCTIONS:
        options = found.get(identity, "")
        if re.search(r"security\s+definer", options, re.I):
            fail(f"{SCHEMA_REL}: public.{identity} is security definer; it "
                 f"must be security invoker")
        elif not re.search(r"security\s+invoker", options, re.I):
            fail(f"{SCHEMA_REL}: public.{identity} is not security invoker")
        if not re.search(r"set\s+search_path\s*=\s*''", options, re.I):
            fail(f"{SCHEMA_REL}: public.{identity} does not pin search_path "
                 f"to ''")
        missing, granted_anon = grant_block(schema, identity)
        if missing:
            fail(f"{SCHEMA_REL}: public.{identity} is missing grant "
                 f"statement(s) {missing}")
        elif granted_anon:
            fail(f"{SCHEMA_REL}: public.{identity} grants EXECUTE to anon")
        else:
            grant_blocks += 1

    if grant_blocks < MINIMUM_GRANT_BLOCKS:
        die(f"{SCHEMA_REL} has {grant_blocks} complete grant block(s) for the "
            f"wizard functions, minimum {MINIMUM_GRANT_BLOCKS} (PR-27)")

    if FAIL:
        sys.exit(1)

    print(
        f"OK: {DOC_REL} §11a.4 and {SCHEMA_REL} agree. "
        f"the {len(FUNCTIONS)} wizard write path(s) are named among "
        f"{len(rows)} §11a.4 row(s) and match {len(found)} security invoker "
        f"function(s) {FUNCTIONS}; "
        f"{grant_blocks} grant block(s), each revoked from public, anon and "
        f"service_role and granted to authenticated; "
        f"minimum {MINIMUM_INVOKERS} function(s), minimum "
        f"{MINIMUM_GRANT_BLOCKS} grant block(s); none is security definer"
    )


if __name__ == "__main__":
    main()
