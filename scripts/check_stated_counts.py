#!/usr/bin/env python3
"""Mechanises PR-15: a stated count is verified against what a document's own
contents enumerate. Also enforces that every CALC_SPEC.md R1-nn block carries
a Rounding: line.
"""
import re
import sys

FAIL = False

EM_DASH = "\u2014"


def fail(msg):
    global FAIL
    print(f"FAIL: {msg}")
    FAIL = True


def read(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def check_domain_model():
    path = "docs/product/DOMAIN_MODEL.md"
    text = read(path)

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


def check_calc_spec():
    path = "docs/product/CALC_SPEC.md"
    text = read(path)

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

    ids = re.findall(r"^## (ADR-(\d{3})) " + EM_DASH + r" ", text, re.M)
    nums = sorted(int(n) for _, n in ids)
    if not nums:
        fail(f"{path}: no ADR headings found")
        return
    if len(set(nums)) != len(nums):
        fail(f"{path}: duplicate ADR ids among {[i for i, _ in ids]}")
    if nums != list(range(nums[0], nums[0] + len(nums))):
        fail(f"{path}: ADR ids not contiguous: {[i for i, _ in ids]}")


def main():
    check_domain_model()
    check_decisions()
    check_calc_spec()
    check_adr()
    if FAIL:
        sys.exit(1)
    print("OK: all stated counts verified against their own enumerations")


if __name__ == "__main__":
    main()
