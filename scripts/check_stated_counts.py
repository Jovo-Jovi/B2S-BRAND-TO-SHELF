#!/usr/bin/env python3
"""Mechanises PR-15: a stated count is verified against what a document's own
contents enumerate. Also enforces that every CALC_SPEC.md R1-nn block carries
a Rounding: line, and that DATA_MODEL.md §3's table and enum counts match the
authoritative schema.

PR-27 — this check states the minimum it expected to examine and fails when it
examined less. A missing scan target used to raise FileNotFoundError, which is
an exit code without a message; now it is named and counted, and a run that
made fewer than MINIMUM_ASSERTIONS assertions fails whatever those assertions
concluded.
"""
import os
import re
import sys

FAIL = False

EM_DASH = "\u2014"

MINIMUM_ASSERTIONS = 6

ASSERTIONS = 0

WORD_NUMBERS = {
    "zero": 0, "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    "eleven": 11, "twelve": 12,
}


def fail(msg):
    global FAIL
    print(f"FAIL: {msg}")
    FAIL = True


def asserted():
    """One scan target successfully examined. The floor counts these, not
    findings: a check that concluded nothing because it read nothing has not
    run, however clean its output looks."""
    global ASSERTIONS
    ASSERTIONS += 1


def to_number(token):
    """A count written as digits or as an English word. This repository writes
    small totals in prose, and a parser that only accepts digits would report a
    correct document as unparseable."""
    t = token.strip().lower()
    if t.isdigit():
        return int(t)
    return WORD_NUMBERS.get(t)


def read(path):
    if not os.path.isfile(path):
        fail(f"{path} does not exist — it is one of this check's scan targets (PR-27)")
        return None
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def check_domain_model():
    path = "docs/product/DOMAIN_MODEL.md"
    text = read(path)
    if text is None:
        return
    asserted()

    m = re.search(r"Total:\s*(\d+)\s*entities", text)
    if not m:
        fail(f"{path}: could not find the stated total (\"Total: N entities\")")
        return
    stated_total = int(m.group(1))

    sec2 = re.search(r"\n## 2\..*?\n(.*?)\n## 3\.", text, re.S)
    if not sec2:
        fail(f"{path}: could not isolate §2 (the entity set)")
        return
    body = sec2.group(1)

    heading_re = re.compile(
        r"### 2\.(\d+) .*?" + EM_DASH + r"\s*(\d+)\s*\n"
    )
    headings = list(heading_re.finditer(body))
    if len(headings) != 9:
        fail(f"{path}: expected 9 tier headings (§2.1-§2.9), found {len(headings)}")

    subtotal_sum = 0
    enumerated_sum = 0
    for i, hm in enumerate(headings):
        tier_num = hm.group(1)
        stated_subtotal = int(hm.group(2))
        subtotal_sum += stated_subtotal
        block_start = hm.end()
        block_end = headings[i + 1].start() if i + 1 < len(headings) else len(body)
        block = body[block_start:block_end]
        names = re.findall(r"`([^`]+)`", block)
        actual = len(names)
        if actual != stated_subtotal:
            fail(f"{path} §2.{tier_num}: stated {stated_subtotal}, enumerates {actual} names")
        enumerated_sum += actual

    if subtotal_sum != stated_total:
        fail(f"{path}: §1 states {stated_total}, tier subtotals sum to {subtotal_sum}")
    if enumerated_sum != stated_total:
        fail(f"{path}: §1 states {stated_total}, enumerated entity names total {enumerated_sum}")


def check_decisions():
    path = "docs/product/DECISIONS.md"
    text = read(path)
    if text is None:
        return
    asserted()

    m = re.search(r"## 2\. Decision register\s*\n+(\d+) decisions, all signed", text)
    if not m:
        fail(f"{path}: could not find the stated decision total")
        return
    stated_total = int(m.group(1))

    sec = re.search(r"## 2\. Decision register(.*?)\n## 3\.", text, re.S)
    if not sec:
        fail(f"{path}: could not isolate §2 (the decision register)")
        return
    body = sec.group(1)

    rows = re.findall(r"^\|\s*\*{0,2}([A-Z]\d{1,3})\*{0,2}\s*\|", body, re.M)
    actual = len(rows)
    if actual != stated_total:
        fail(f"{path}: stated {stated_total}, OD table rows counted {actual}")


def check_session_context_register():
    """CF-120: `SESSION_CONTEXT.md` stated the decision-register total twice in
    the present tense, at two different figures, and nothing tied either one to
    `DECISIONS.md` itself. This asserts there is exactly one present-tense
    statement of the total left, and that it agrees with `DECISIONS.md` §2 —
    the file that actually enumerates the register.
    """
    path = "SESSION_CONTEXT.md"
    text = read(path)
    if text is None:
        return
    asserted()

    matches = re.findall(
        r"`DECISIONS\.md`\s+now carries \*\*(\d+)\*\*\s+signed ODs", text
    )
    if len(matches) == 0:
        fail(f"{path}: no line states the decision-register total in the "
             f"present tense (expected exactly 1)")
        return
    if len(matches) > 1:
        fail(f"{path}: {len(matches)} lines state the decision-register total "
             f"in the present tense, expected exactly 1")
        return

    stated_total = int(matches[0])

    dec_path = "docs/product/DECISIONS.md"
    dec_text = read(dec_path)
    if dec_text is None:
        return
    m = re.search(
        r"## 2\. Decision register\s*\n+(\d+) decisions, all signed", dec_text
    )
    if not m:
        fail(f"{dec_path}: could not find the stated decision total")
        return
    dec_total = int(m.group(1))

    if stated_total != dec_total:
        fail(f"{path}: states {stated_total} signed ODs, {dec_path} §2 states "
             f"{dec_total} decisions — the two must agree")


def check_calc_spec():
    path = "docs/product/CALC_SPEC.md"
    text = read(path)
    if text is None:
        return
    asserted()

    m = re.search(r"## 4\. The Release 1 rows " + EM_DASH + r" (\d+)", text)
    if not m:
        fail(f"{path}: could not find the stated Release 1 row total")
        return
    stated_total = int(m.group(1))

    sec = re.search(r"## 4\. The Release 1 rows.*?\n(.*?)\n## 5\.", text, re.S)
    if not sec:
        fail(f"{path}: could not isolate §4 (the Release 1 rows)")
        return
    body = sec.group(1)

    headings = list(re.finditer(r"### (R1-\d{2}) " + EM_DASH + r" ", body))
    actual = len(headings)
    if actual != stated_total:
        fail(f"{path}: stated {stated_total}, ### R1-nn headings counted {actual}")

    for i, hm in enumerate(headings):
        rid = hm.group(1)
        block_start = hm.end()
        block_end = headings[i + 1].start() if i + 1 < len(headings) else len(body)
        block = body[block_start:block_end]
        if not re.search(r"^Rounding:", block, re.M):
            fail(f"{path} {rid}: block has no 'Rounding:' line")


def check_adr():
    path = "docs/product/ADR.md"
    text = read(path)
    if text is None:
        return
    asserted()

    ids = re.findall(r"^## (ADR-(\d{3})) " + EM_DASH + r" ", text, re.M)
    nums = sorted(int(n) for _, n in ids)
    if not nums:
        fail(f"{path}: no ADR headings found")
        return
    if len(set(nums)) != len(nums):
        fail(f"{path}: duplicate ADR ids among {[i for i, _ in ids]}")
    if nums != list(range(nums[0], nums[0] + len(nums))):
        fail(f"{path}: ADR ids not contiguous: {[i for i, _ in ids]}")


def check_data_model():
    """DATA_MODEL.md §3 states a table count and an enum count. Both are
    asserted against supabase/schema.sql, which ADR-006 makes authoritative and
    check_migration_split.py holds equivalent to the applied migrations.

    This one is not a self-enumeration like the others: the document's total is
    compared against the schema rather than against its own prose, because the
    schema is where the answer actually lives. Origin: §3 read "one enum" while
    four were live. All four were specified inline, so nothing was missing and
    nothing was wrong in the schema — only the stated total, which is the exact
    class PR-15 exists for and the exact class two proof-reads walked past.
    """
    path = "docs/product/DATA_MODEL.md"
    schema_path = "supabase/schema.sql"
    text = read(path)
    schema = read(schema_path)
    if text is None or schema is None:
        return
    asserted()

    m = re.search(
        r"\n## 3\. The Platform tier\s*\n+(\w+) tables? and (\w+) enums?\b",
        text,
    )
    if not m:
        fail(f"{path}: could not find §3's stated counts "
             f'("<n> tables and <n> enums" at the head of the section)')
        return

    stated_tables = to_number(m.group(1))
    stated_enums = to_number(m.group(2))
    if stated_tables is None or stated_enums is None:
        fail(f"{path} §3: stated counts are not readable as numbers: "
             f"{m.group(1)!r} tables, {m.group(2)!r} enums")
        return

    actual_tables = sorted(set(re.findall(
        r"^\s*create\s+table\s+(?:if\s+not\s+exists\s+)?public\.(\w+)",
        schema, re.M | re.I)))
    actual_enums = sorted(set(re.findall(
        r"^\s*create\s+type\s+public\.(\w+)\s+as\s+enum",
        schema, re.M | re.I)))

    if stated_tables != len(actual_tables):
        fail(f"{path} §3: states {stated_tables} tables, {schema_path} declares "
             f"{len(actual_tables)}: {actual_tables}")
    if stated_enums != len(actual_enums):
        fail(f"{path} §3: states {stated_enums} enums, {schema_path} declares "
             f"{len(actual_enums)}: {actual_enums}")

    # A count can be right for the wrong reason. Every enum the schema declares
    # is also named in the document, so a swap cannot pass on arithmetic alone.
    for name in actual_enums:
        if not re.search(r"`" + re.escape(name) + r"`", text):
            fail(f"{path} §3: {schema_path} declares enum `{name}` and the "
                 f"document never names it")
    for name in actual_tables:
        if not re.search(r"`" + re.escape(name) + r"`", text):
            fail(f"{path} §3: {schema_path} declares table `{name}` and the "
                 f"document never names it")


def main():
    check_domain_model()
    check_decisions()
    check_session_context_register()
    check_calc_spec()
    check_adr()
    check_data_model()

    if FAIL:
        sys.exit(1)

    if ASSERTIONS < MINIMUM_ASSERTIONS:
        print(f"FAIL: {ASSERTIONS} scan target(s) examined, minimum "
              f"{MINIMUM_ASSERTIONS}. A stated-count check that read fewer "
              f"documents than it has assertions has not run (PR-27)")
        sys.exit(1)

    print(f"OK: all stated counts verified against their own enumerations and "
          f"against the authoritative schema; {ASSERTIONS} scan target(s) "
          f"examined, minimum {MINIMUM_ASSERTIONS}")


if __name__ == "__main__":
    main()
