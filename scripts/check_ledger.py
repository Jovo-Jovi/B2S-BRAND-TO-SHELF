#!/usr/bin/env python3
"""Ledger reconciliation. The open ids in SESSION_CONTEXT.md must match the
open rows in docs/method/CARRY_FORWARDS.md id-for-id, and every open row must
name an owner.
"""
import re
import sys

FAIL = False


def fail(msg):
    global FAIL
    print(f"FAIL: {msg}")
    FAIL = True


def read(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def session_open_ids():
    path = "SESSION_CONTEXT.md"
    text = read(path)
    m = re.search(r"## Open carry-forwards.*?\n(.*?)\n## ", text, re.S)
    if not m:
        fail(f"{path}: could not isolate the open carry-forwards section")
        return set()
    return set(re.findall(r"^-\s*(CF-\d+)\s*" + "\u2014", m.group(1), re.M))


def ledger_open_rows():
    path = "docs/method/CARRY_FORWARDS.md"
    text = read(path)
    matches = list(re.finditer(r"^- \[ \] (CF-\d+)", text, re.M))
    rows = {}
    for i, m in enumerate(matches):
        rid = m.group(1)
        start = m.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        rows[rid] = text[start:end]
    return rows


def main():
    session_ids = session_open_ids()
    ledger_rows = ledger_open_rows()
    ledger_ids = set(ledger_rows.keys())

    only_session = sorted(session_ids - ledger_ids)
    only_ledger = sorted(ledger_ids - session_ids)
    if only_session or only_ledger:
        fail(
            "open-id mismatch between SESSION_CONTEXT.md and CARRY_FORWARDS.md — "
            f"only in SESSION_CONTEXT.md: {only_session}; "
            f"only in CARRY_FORWARDS.md (open): {only_ledger}"
        )

    for rid in sorted(ledger_rows):
        if not re.search(r"owner:", ledger_rows[rid], re.I):
            fail(f"{rid}: open ledger row has no 'owner:' field")

    if FAIL:
        sys.exit(1)
    print(f"OK: {len(ledger_ids)} open ids reconcile id-for-id; every open row names an owner")


if __name__ == "__main__":
    main()
