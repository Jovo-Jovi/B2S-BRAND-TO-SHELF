#!/usr/bin/env python3
"""Done-steps shape assertion. For every data row in SESSION_CONTEXT.md's
done-steps table except the last, the commit column must be either one or
more backticked hex shas (comma-separated if several) or the declared
sentinel em-dash. The last row is exempt: its commit cannot exist before the
commit that contains it (PR-17).
"""
import re
import sys

FAIL = False

EM_DASH = "\u2014"
SHA_CELL = re.compile(r"^(`[0-9a-f]{7,40}`)(,\s*`[0-9a-f]{7,40}`)*$")


def fail(msg):
    global FAIL
    print(f"FAIL: {msg}")
    FAIL = True


def read(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def split_row(line):
    cells = line.strip().strip("|").split("|")
    return [c.strip() for c in cells]


def main():
    path = "SESSION_CONTEXT.md"
    text = read(path)

    m = re.search(r"## Done steps\n(.*?)\n## ", text, re.S)
    if not m:
        fail(f"{path}: could not isolate the done-steps table")
        sys.exit(1)
    section = m.group(1)

    table_lines = [l for l in section.splitlines() if l.strip().startswith("|")]
    if len(table_lines) < 3:
        fail(f"{path}: done-steps table has no data rows")
        sys.exit(1)

    data_lines = table_lines[2:]  # skip header row and the --- separator row
    if not data_lines:
        fail(f"{path}: done-steps table has no data rows")
        sys.exit(1)

    for i, line in enumerate(data_lines):
        is_last = i == len(data_lines) - 1
        cells = split_row(line)
        if len(cells) < 4:
            fail(f"{path}: malformed row (fewer than 4 columns): {line!r}")
            continue
        if is_last:
            continue
        commit_cell = cells[3]
        if commit_cell == EM_DASH or SHA_CELL.match(commit_cell):
            continue
        fail(f"{path}: commit column is neither a sha nor '{EM_DASH}': {line!r}")

    if FAIL:
        sys.exit(1)
    print(f"OK: {len(data_lines)} done-steps rows checked, commit column well-formed")


if __name__ == "__main__":
    main()
