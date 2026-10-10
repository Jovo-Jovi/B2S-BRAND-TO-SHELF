#!/usr/bin/env python3
"""MCP containment. `.cursor/mcp.json` encodes which database an agent may
write to. Tracked, it can be checked; ignored, it sits outside every guard
including `check_credentials.py`.

Wired into docs-integrity.yml (Python), not the six .mjs application-code
guards. Reasoning: the premises are a JSON MCP config and the method ledger,
the check reuses `check_credentials.py`'s PATTERNS, and it is a containment
control of the same family as that scan — not a scan of `app/` / `lib/` /
`features/`.

How a server entry is identified as Supabase, by shape, never a whole-file
string scan (PR-22):

  * it has a `url` whose hostname, parsed by urllib.parse.urlparse, is
    `mcp.supabase.com`; or
  * it has an `args` list containing an npx package spec whose name is
    `@supabase/mcp-server-supabase` (exact, or followed by `@<version>`).

An entry that is neither is not checked for project_ref or read_only, because
an entry we fail to recognise as Supabase is an entry we fail to check. It is
still walked for an `env` block and for credential patterns, because those
risks are not Supabase-specific.

Project refs are named constants with provenance CF-160 and PR-40. Every
Supabase entry's project_ref must be one of exactly those two, both must
appear as Supabase entries, and both must appear in
`docs/method/CARRY_FORWARDS.md`. A third ref in either file fails.

The production entry (the one whose project_ref is PRODUCTION_PROJECT_REF)
must structurally carry read_only=true: a URL query param, a `--read-only`
arg, or a boolean `read_only` field. This check asserts nothing about the
staging entry's read-only posture (CF-165).

No entry may carry an `env` block. The stdio form commonly puts
SUPABASE_ACCESS_TOKEN there; a committed file with one is a leak. `envFile`
is a different key and is not this assertion.

PR-27 — floors on servers examined and on Supabase entries examined. A guard
that examined zero entries and exited 0 is the defect, not the pass.
"""
from __future__ import annotations

import json
import os
import re
import sys
from urllib.parse import parse_qs, urlparse

# Reuse check_credentials.py's PATTERNS rather than inventing a second set.
# python scripts/<name>.py puts this directory on sys.path[0].
from check_credentials import PATTERNS

FAIL = False

MCP_PATH = os.path.join(".cursor", "mcp.json")
LEDGER_PATH = os.path.join("docs", "method", "CARRY_FORWARDS.md")

# CF-160 records both refs. PR-40: the named production project is not
# renamed or demoted when staging is created. Production keeps
# akpvvydmltmfmkmwivgn; staging is bnjrgoaoujnrlvuxicca.
PRODUCTION_PROJECT_REF = "akpvvydmltmfmkmwivgn"  # CF-160, PR-40
STAGING_PROJECT_REF = "bnjrgoaoujnrlvuxicca"  # CF-160
ALLOWED_REFS = frozenset({PRODUCTION_PROJECT_REF, STAGING_PROJECT_REF})

SUPABASE_MCP_HOST = "mcp.supabase.com"
SUPABASE_MCP_PACKAGE = "@supabase/mcp-server-supabase"

MINIMUM_SERVERS = 2
MINIMUM_SUPABASE_ENTRIES = 2

# Ledger mentions of a project ref: `project_ref=`, `--project-ref=`,
# or `ref <20-char>` as CF-160 writes them. A 20-char English word that
# is not in that shape is not a project ref.
LEDGER_REF_RE = re.compile(
    r"(?:project[_-]ref=|--project-ref=|[Rr]ef\s+)([a-z0-9]{20})"
)


def fail(msg):
    global FAIL
    print(f"FAIL: {msg}")
    FAIL = True


def read(path):
    if not os.path.isfile(path):
        fail(
            f"{path} does not exist — it is one of this check's scan targets "
            f"(PR-27)"
        )
        return None
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def is_supabase_mcp_package(arg):
    if not isinstance(arg, str):
        return False
    return arg == SUPABASE_MCP_PACKAGE or arg.startswith(
        SUPABASE_MCP_PACKAGE + "@"
    )


def is_supabase_entry(entry):
    if not isinstance(entry, dict):
        return False
    url = entry.get("url")
    if isinstance(url, str):
        host = (urlparse(url).hostname or "").lower()
        if host == SUPABASE_MCP_HOST:
            return True
    args = entry.get("args")
    if isinstance(args, list):
        for arg in args:
            if is_supabase_mcp_package(arg):
                return True
    return False


def project_refs_of(entry):
    refs = []
    url = entry.get("url")
    if isinstance(url, str):
        qs = parse_qs(urlparse(url).query, keep_blank_values=True)
        for value in qs.get("project_ref", []):
            refs.append(value)
    args = entry.get("args")
    if isinstance(args, list):
        i = 0
        while i < len(args):
            arg = args[i]
            if isinstance(arg, str) and arg.startswith("--project-ref="):
                refs.append(arg.split("=", 1)[1])
            elif arg == "--project-ref" and i + 1 < len(args):
                nxt = args[i + 1]
                if isinstance(nxt, str):
                    refs.append(nxt)
                i += 1
            i += 1
    return refs


def carries_read_only_true(entry):
    if entry.get("read_only") is True:
        return True
    url = entry.get("url")
    if isinstance(url, str):
        qs = parse_qs(urlparse(url).query, keep_blank_values=True)
        if any(v.lower() == "true" for v in qs.get("read_only", [])):
            return True
    args = entry.get("args")
    if isinstance(args, list):
        for arg in args:
            if not isinstance(arg, str):
                continue
            if arg in ("--read-only", "--read-only=true"):
                return True
            if arg.startswith("--read-only=") and arg.split("=", 1)[1].lower() == "true":
                return True
    return False


def walk_strings(obj):
    if isinstance(obj, str):
        yield obj
    elif isinstance(obj, dict):
        for value in obj.values():
            yield from walk_strings(value)
    elif isinstance(obj, list):
        for value in obj:
            yield from walk_strings(value)


def check_no_env_or_credentials(name, entry):
    if "env" in entry:
        fail(
            f"{MCP_PATH} server {name!r} carries an `env` block. A committed "
            f"MCP stdio config with env is the classic token-leak shape; "
            f"envFile is a different key and is not this assertion"
        )
    for value in walk_strings(entry):
        for pattern_name, pattern in PATTERNS.items():
            if pattern.search(value):
                fail(
                    f"{MCP_PATH} server {name!r}: {pattern_name} matched a "
                    f"value. The matched text is not printed (PR-10)"
                )


def check_ledger(ledger_text):
    if PRODUCTION_PROJECT_REF not in ledger_text:
        fail(
            f"{LEDGER_PATH} does not contain PRODUCTION_PROJECT_REF "
            f"(CF-160, PR-40). The guard and the ledger cannot drift apart"
        )
    if STAGING_PROJECT_REF not in ledger_text:
        fail(
            f"{LEDGER_PATH} does not contain STAGING_PROJECT_REF "
            f"(CF-160). The guard and the ledger cannot drift apart"
        )
    found = set(LEDGER_REF_RE.findall(ledger_text))
    extra = found - ALLOWED_REFS
    if extra:
        fail(
            f"{LEDGER_PATH} names a project_ref that is not one of the two "
            f"allowed values (a third project). Count of extras: {len(extra)}. "
            f"The values are not printed"
        )


def main():
    text = read(MCP_PATH)
    if text is None:
        sys.exit(1)
    if text.strip() == "":
        fail(f"{MCP_PATH} is empty, so no server was examined (PR-27)")
        sys.exit(1)
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        fail(f"{MCP_PATH} is not valid JSON, so no server was examined (PR-27)")
        sys.exit(1)
    if not isinstance(data, dict):
        fail(f"{MCP_PATH} root is not a JSON object")
        sys.exit(1)
    servers = data.get("mcpServers")
    if not isinstance(servers, dict):
        fail(
            f"{MCP_PATH} has no mcpServers object, so no server was examined "
            f"(PR-27)"
        )
        sys.exit(1)

    servers_examined = 0
    supabase_entries = []
    for name, entry in servers.items():
        servers_examined += 1
        if not isinstance(entry, dict):
            fail(f"{MCP_PATH} server {name!r} is not a JSON object")
            continue
        check_no_env_or_credentials(name, entry)
        if is_supabase_entry(entry):
            supabase_entries.append((name, entry))

    if servers_examined < MINIMUM_SERVERS:
        fail(
            f"{MCP_PATH}: {servers_examined} server(s) examined, minimum "
            f"{MINIMUM_SERVERS}. A containment check that opened fewer "
            f"entries than it names has not run (PR-27)"
        )
    if len(supabase_entries) < MINIMUM_SUPABASE_ENTRIES:
        fail(
            f"{MCP_PATH}: {len(supabase_entries)} Supabase MCP entries "
            f"examined, minimum {MINIMUM_SUPABASE_ENTRIES}. Identified by "
            f"mcp.supabase.com hostname or npx @{SUPABASE_MCP_PACKAGE.lstrip('@')}. "
            f"Zero recognised entries exiting 0 is the defect (PR-27)"
        )

    seen_refs = set()
    production_entry = None
    for name, entry in supabase_entries:
        refs = project_refs_of(entry)
        distinct = set(refs)
        if not refs:
            fail(
                f"{MCP_PATH} Supabase server {name!r} has no project_ref "
                f"(URL query project_ref or --project-ref)"
            )
            continue
        if len(distinct) != 1:
            fail(
                f"{MCP_PATH} Supabase server {name!r} carries "
                f"{len(distinct)} distinct project_ref value(s); expected 1"
            )
        ref = next(iter(distinct))
        if ref not in ALLOWED_REFS:
            fail(
                f"{MCP_PATH} Supabase server {name!r} project_ref is not one "
                f"of the two allowed values (a third project). The value is "
                f"not printed"
            )
            continue
        seen_refs.add(ref)
        if ref == PRODUCTION_PROJECT_REF:
            production_entry = (name, entry)

    missing = ALLOWED_REFS - seen_refs
    if missing:
        fail(
            f"{MCP_PATH} Supabase entries do not cover both allowed "
            f"project_refs ({len(missing)} missing). Both staging and "
            f"production must appear as entries, or the two-way link with "
            f"the ledger is one-sided"
        )

    if production_entry is None:
        fail(
            f"{MCP_PATH}: no Supabase entry carries PRODUCTION_PROJECT_REF, "
            f"so read_only on production was not asserted (PR-27)"
        )
    else:
        name, entry = production_entry
        if not carries_read_only_true(entry):
            fail(
                f"{MCP_PATH} server {name!r} is the production entry and "
                f"does not carry read_only=true (URL query, --read-only, or "
                f"boolean field). 'the file contains read_only=true "
                f"somewhere' is not this assertion"
            )

    ledger = read(LEDGER_PATH)
    if ledger is None:
        sys.exit(1)
    if ledger.strip() == "":
        fail(f"{LEDGER_PATH} is empty, so the two-way ref link was not checked")
    else:
        check_ledger(ledger)

    if FAIL:
        sys.exit(1)

    print(
        f"OK: examined {servers_examined} server(s), minimum {MINIMUM_SERVERS}; "
        f"{len(supabase_entries)} Supabase MCP entries, minimum "
        f"{MINIMUM_SUPABASE_ENTRIES}; production entry carries "
        f"read_only=true; both project refs present in {LEDGER_PATH}; "
        f"no env block; no credential pattern"
    )


if __name__ == "__main__":
    main()
