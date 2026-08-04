#!/usr/bin/env python3
"""MODULE_SPEC.md §1 conformance, both directions. OD-H9, OD-H10, CF-115.

§1 is the application tree and nothing else (OD-H10). This check asserts it
against the tracked tree in both directions, inside that scope:

  forward  every path §1 names, whose parent directory exists, exists too —
           unless its annotation says `deferred`
  reverse  every tracked directory inside the nine roots is named by §1

**The scope comes from the document, never from a list in here.** §1 carries an
`In scope:` line naming its roots and a `Specified at directory granularity:`
line naming the roots whose internals §1 does not enumerate. Out of scope is the
complement of the first list, so a repository-root file or an infrastructure
directory such as `.github/` is excluded by not being a root — not by a
hardcoded exception, which would be a second place to forget and would let a
genuinely missing root pass as excluded.

**Why the forward direction is conditioned on the parent existing.** §1's own
lead says only Release 1 folders are created and each is created by the task that
first needs it. A named path whose parent does not exist has not been reached
yet, and asserting it would make this check permanently red for the whole build.
A named path whose parent *does* exist is a different thing: the tree at that
level is built, so a name that is not there is a rename, a typo, or a folder
somebody forgot. That is the defect class this catches — §1 said `tests/` while
the tree held `__tests__/` at P01-T06-FIX, and three consecutive gate runs found
§1 disagreeing with the tree by hand.

**Why the reverse direction is directories only.** §1 names directories plus the
individual files it calls out; it never enumerated every file and does not claim
to. A file-level reverse assertion would fail on `app/[locale]/layout.tsx` and
every other ordinary source file, so it would be a check nobody could keep green.
A directory is the granularity at which §1 makes a claim, and it is the
granularity at which all three P01 gate findings landed.

**The scope statement is itself asserted against the tree block.** Reading the
roots out of the document and then trusting them is PR-21's shape one level up:
dropping `types/` from the `In scope:` line makes every path under it out of
scope, and the reverse direction goes quiet on a whole root while still reporting
success. So the two must agree — every root on that line is a top-level entry of
the tree block below, and every top-level entry of the block is on that line.
Found by planting exactly that, which the first draft of this check passed.

PR-27 — this check states the minimum it expected to examine and fails when it
examined less: an unparseable scope statement, an emptied tree block and an
emptied repository each error rather than reporting a clean zero.
"""
import os
import re
import subprocess
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPEC = os.path.join(REPO, "docs", "product", "MODULE_SPEC.md")
SPEC_REL = "docs/product/MODULE_SPEC.md"

MINIMUM_SCOPE_ROOTS = 5
MINIMUM_NAMED_PATHS = 20
MINIMUM_TRACKED_DIRS = 8

FAIL = False


def fail(msg):
    global FAIL
    print(f"FAIL: {msg}")
    FAIL = True


def die(msg):
    print(f"FAIL: {msg}")
    sys.exit(1)


def read_spec():
    if not os.path.isfile(SPEC):
        die(f"{SPEC_REL} does not exist — it is this check's only scan target, "
            f"so there is no tree to assert (PR-27)")
    with open(SPEC, encoding="utf-8") as handle:
        return handle.read()


def section_one(text):
    match = re.search(r"\n## 1\. The tree\n(.*?)\n## 2\.", text, re.S)
    if not match:
        die(f"{SPEC_REL}: could not isolate §1 (the tree). This check asserts "
            f"that section and found no heading for it (PR-27)")
    return match.group(1)


def labelled_names(section, label):
    """The backticked names on a `**Label:**` paragraph. The paragraph holds the
    list and nothing else, so it ends at the first blank line — prose about the
    list lives in its own paragraph and cannot be mistaken for a member of it."""
    match = re.search(
        r"^\*\*" + re.escape(label) + r":\*\*(.*?)(?:\n\s*\n|\Z)",
        section, re.M | re.S)
    if not match:
        die(f"{SPEC_REL} §1: no '**{label}:**' paragraph. The scope of §1 is "
            f"read from the document, never from a list inside this check, so "
            f"an absent scope statement is a failure and not an empty scope "
            f"(OD-H10, PR-27)")
    return [n.strip().strip("/") for n in re.findall(r"`([^`]+)`", match.group(1))]


def tree_block(section):
    match = re.search(r"```\n(.*?)```", section, re.S)
    if not match:
        die(f"{SPEC_REL} §1: no fenced tree block found (PR-27)")
    return match.group(1)


def is_path_token(name):
    """A tree line names a path when its first token is a directory (trailing
    slash) or a file (a dot in the name). Anything else is prose — §1 carries a
    `each holding, as needed:` template under `features/`, whose entries are a
    shape every module repeats rather than paths that exist."""
    return name.endswith("/") or "." in name


def parse_tree(block):
    """Every path §1 names, paired with its annotation, in document order.

    Descendants of a prose line, of a glob, and of a file are not paths and are
    not returned. `*.test.tsx` is a pattern, not a path, and asserting it would
    be asserting a filename nobody wrote.
    """
    named = []
    stack = []  # (indent, path or None); None marks "inside a non-path block"
    for raw in block.split("\n"):
        if not raw.strip():
            continue
        indent = len(raw) - len(raw.lstrip(" "))
        parts = raw.strip().split(None, 1)
        name = parts[0]
        annotation = parts[1] if len(parts) > 1 else ""

        while stack and stack[-1][0] >= indent:
            stack.pop()
        parent = stack[-1][1] if stack else ""

        if parent is None or "*" in name or not is_path_token(name):
            stack.append((indent, None))
            continue

        path = parent + name
        named.append((path, annotation))
        stack.append((indent, path if name.endswith("/") else None))
    return named


def tracked_directories():
    result = subprocess.run(["git", "ls-files"], cwd=REPO,
                            capture_output=True, text=True, check=False)
    files = [f for f in result.stdout.splitlines() if f]
    if not files:
        die("`git ls-files` returned nothing, so the tree this check compares "
            "§1 against is empty or unreadable. Zero paths scanned is not a "
            "pass (PR-27)")
    dirs = set()
    for path in files:
        parts = path.split("/")
        for i in range(1, len(parts)):
            dirs.add("/".join(parts[:i]))
    return sorted(dirs), len(files)


def main():
    text = read_spec()
    section = section_one(text)

    roots = labelled_names(section, "In scope")
    granular = labelled_names(section, "Specified at directory granularity")
    if len(roots) < MINIMUM_SCOPE_ROOTS:
        die(f"{SPEC_REL} §1: the 'In scope' line names {len(roots)} root(s), "
            f"minimum {MINIMUM_SCOPE_ROOTS}. A scope this small means the line "
            f"was emptied or its format changed, and every path in the "
            f"repository would fall outside it (PR-27)")
    unknown = [g for g in granular if g not in roots]
    if unknown:
        fail(f"{SPEC_REL} §1: 'Specified at directory granularity' names "
             f"{unknown}, which the 'In scope' line does not. A root cannot be "
             f"exempted from enumeration without being in scope")

    block = tree_block(section)
    top_level = [n.rstrip("/") for n in
                 re.findall(r"^(\S+)", block, re.M)
                 if is_path_token(n) and "*" not in n]
    missing_from_scope = sorted(set(top_level) - set(roots))
    missing_from_tree = sorted(set(roots) - set(top_level))
    if missing_from_scope:
        fail(f"{SPEC_REL} §1: the tree block has top-level entries "
             f"{missing_from_scope} that the 'In scope' line does not name. A "
             f"root missing from that line puts its whole subtree outside this "
             f"check, which is a silent narrowing rather than a decision")
    if missing_from_tree:
        fail(f"{SPEC_REL} §1: the 'In scope' line names {missing_from_tree} and "
             f"the tree block has no top-level entry for "
             f"{'them' if len(missing_from_tree) > 1 else 'it'}")

    named = parse_tree(block)
    if len(named) < MINIMUM_NAMED_PATHS:
        die(f"{SPEC_REL} §1: the tree block names {len(named)} path(s), minimum "
            f"{MINIMUM_NAMED_PATHS}. A tree this small means the block was "
            f"emptied or its indentation changed, and both directions of this "
            f"check would pass over nothing (PR-27)")

    named_set = {p.rstrip("/") for p, _ in named}

    # Forward. A named path whose parent exists must exist or say `deferred`.
    asserted = deferred = unreached = 0
    for path, annotation in named:
        target = path.rstrip("/")
        if "deferred" in annotation.lower():
            deferred += 1
            continue
        parent = os.path.dirname(target)
        parent_abs = os.path.join(REPO, parent) if parent else REPO
        if not os.path.isdir(parent_abs):
            unreached += 1
            continue
        asserted += 1
        if not os.path.exists(os.path.join(REPO, target)):
            fail(f"{SPEC_REL} §1 names `{path}` and it does not exist, while its "
                 f"parent `{parent or '.'}/` does. Create it, mark it `deferred` "
                 f"in the annotation column, or correct the name")

    if asserted < 1:
        die(f"{SPEC_REL} §1: {len(named)} path(s) named and none asserted — "
            f"{deferred} deferred, {unreached} whose parent does not exist. The "
            f"forward direction examined nothing (PR-27)")

    # Reverse. Every tracked directory inside the roots is named by §1.
    dirs, file_count = tracked_directories()
    if len(dirs) < MINIMUM_TRACKED_DIRS:
        die(f"{len(dirs)} tracked directory/ies found across {file_count} "
            f"tracked file(s), minimum {MINIMUM_TRACKED_DIRS}. The reverse "
            f"direction had almost nothing to compare against (PR-27)")

    in_scope = out_of_scope = 0
    for directory in dirs:
        top = directory.split("/")[0]
        if top not in roots:
            out_of_scope += 1
            continue
        if top in granular and directory != top:
            out_of_scope += 1
            continue
        in_scope += 1
        if directory not in named_set:
            fail(f"`{directory}/` is tracked and inside §1's scope, and "
                 f"{SPEC_REL} §1 does not name it. Name it, or take its root "
                 f"out of the 'In scope' line (OD-H10)")

    if in_scope < 1:
        die(f"no tracked directory fell inside §1's scope out of {len(dirs)} "
            f"examined. The reverse direction examined nothing, which is what a "
            f"renamed root looks like (PR-27)")

    if FAIL:
        sys.exit(1)

    print(
        f"OK: {SPEC_REL} §1 conforms both ways within OD-H10's scope. "
        f"{len(roots)} root(s) in scope (minimum {MINIMUM_SCOPE_ROOTS}) and all "
        f"{len(top_level)} top-level tree entries agree with them, "
        f"{len(granular)} at directory granularity; {len(named)} path(s) named "
        f"(minimum {MINIMUM_NAMED_PATHS}) of which {asserted} asserted, "
        f"{deferred} deferred, {unreached} not yet reached; {in_scope} of "
        f"{len(dirs)} tracked directory/ies in scope (minimum "
        f"{MINIMUM_TRACKED_DIRS} tracked) and every one named, "
        f"{out_of_scope} outside it"
    )


if __name__ == "__main__":
    main()
