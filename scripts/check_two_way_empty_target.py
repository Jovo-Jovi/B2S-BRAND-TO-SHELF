#!/usr/bin/env python3
"""P02-T09-FIX — the two-way empty-target probe, landed permanently (PR-28).

PR-28: "An adversarial probe that finds something is landed as a permanent
check by the fix task that follows, and an adversarial probe that finds
nothing is landed too, because a probe that passes today is the one that
catches tomorrow's regression." This probe found nothing new to fix — every
premise it tested already fails correctly on a removed and an emptied
target — but the probe itself had never actually been *run* before this task:
`SESSION_CONTEXT.md` had been carrying a number (85) that measured `fail()`
call sites, a static proxy, and calling it "the two-way (check, premise)
total" without ever dynamically removing or emptying a single premise. That
is the defect this file fixes. It is not wired into `docs-integrity.yml`:
several premises need a git shim, a scratch repository, or several seconds of
directory copy-and-restore per case, which is too slow and too
platform-specific (see the Windows notes below) for every push. It is run by
hand at a phase exit gate, per PR-28, and `check_stated_counts.py` asserts
`SESSION_CONTEXT.md`'s stated PROVEN_PAIRS count against this file's own
enumeration on every push — cheaply, by parsing this file's source rather
than by re-running the probe.

**CADENCE — this file is invoked by no workflow, on purpose, so the cadence is
stated rather than scheduled.** It is run by hand:

  * at **every phase exit gate**, as one of that gate's five standards — every
    check proven to error on both a removed and an emptied target; and
  * at **every FIX task**, because a FIX task is where a check is added,
    widened or given a new premise, and a new premise is a new pair.

**Its result is cited in that task's report**: the pair count proven, the
count enumerated, every KNOWN_GAPS entry with its reason, and any pair found
passing on nothing. Running it and not reporting it is the same as not running
it — PR-21's shape, since an unreported probe cannot be distinguished from an
absent one. A task that adds or widens a check reconciles PROVEN_PAIRS in the
same commit, or `check_stated_counts.py` fails the push on the figure.

`SESSION_CONTEXT.md` states this same cadence beside the figure, and states
the task id that last proved it. `check_stated_counts.py` asserts that the id
is present and that it names a row of the done-steps table, so the published
figure can never again be a number with no provenance (P02-T10).

PROVEN_PAIRS is the complete, ordered list of (check, premise) pairs proven
this task: for each, the premise was removed and the check produced a
one-line `FAIL:` at non-zero exit with no traceback; the premise was restored
byte-identical; the premise was then emptied (zero bytes, or an empty
directory) and the check again produced a one-line `FAIL:` at non-zero exit
with no traceback; the premise was restored byte-identical a second time. A
pair belongs on this list only when BOTH cases held.

KNOWN_GAPS is the list of (check, premise, reason) triples enumerated as a
premise this task could not dynamically substitute, with the reason recorded
rather than silently dropped or folded into PROVEN_PAIRS by assumption
(PR-21's shape reversed: an absent proof is never recorded as a passing one).

Re-running this file executes real file-system mutations against the
repository it is run from (always from an in-memory snapshot, restored
byte-for-byte before the next step — PR-26, never `git checkout --`). Run it
from a clean working tree; it restores what it touches, but a tree that was
already dirty before the run makes "byte-identical to what?" ambiguous.
"""
import json
import os
import shutil
import stat
import subprocess
import sys
import tempfile
import time

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ---------------------------------------------------------------------------
# The enumeration. This is the check_stated_counts.py derivation target: it
# parses this list's length via AST, never by importing and running this
# file (which would mutate the tree on every `docs-integrity` push).
# ---------------------------------------------------------------------------

PROVEN_PAIRS = [
    ("scripts/check_credentials.py", "tracked file set (git ls-files, scratch repo)"),
    ("scripts/check_data_model_schema.py", "docs/product/DATA_MODEL.md"),
    ("scripts/check_data_model_schema.py", "supabase/schema.sql"),
    ("scripts/check_done_steps_shape.py", "SESSION_CONTEXT.md"),
    ("scripts/check_ledger.py", "SESSION_CONTEXT.md"),
    ("scripts/check_ledger.py", "docs/method/CARRY_FORWARDS.md"),
    ("scripts/check_migration_split.py", "supabase/schema.sql"),
    ("scripts/check_migration_split.py", "supabase/migrations/ (directory)"),
    ("scripts/check_module_spec_tree.py", "docs/product/MODULE_SPEC.md"),
    ("scripts/check_roadmap.py", "docs/method/BUILD_PHASES.md"),
    ("scripts/check_roadmap.py", "SESSION_CONTEXT.md"),
    ("scripts/check_roadmap.py", "docs/method/CARRY_FORWARDS.md"),
    ("scripts/check_roadmap.py", "docs/product/DECISIONS.md"),
    ("scripts/check_roadmap.py", "docs/product/SCOPE.md"),
    ("scripts/check_roadmap.py", "docs/product/ROLE_JOURNEY.md"),
    ("scripts/check_roadmap.py", "docs/product/TENANCY_MODEL.md"),
    ("scripts/check_roadmap.py", "supabase/schema.sql"),
    ("scripts/check_roadmap.py", "docs/ROADMAP.md"),
    ("scripts/check_roadmap.py", "docs/roadmap.html"),
    ("scripts/check_security_model_bypass.py", "docs/product/SECURITY_MODEL.md"),
    ("scripts/check_security_model_bypass.py", "supabase/schema.sql"),
    ("scripts/check_session_context_shape.py", "SESSION_CONTEXT.md"),
    ("scripts/check_stated_counts.py", "docs/product/DOMAIN_MODEL.md"),
    ("scripts/check_stated_counts.py", "docs/product/DECISIONS.md"),
    ("scripts/check_stated_counts.py", "SESSION_CONTEXT.md"),
    ("scripts/check_stated_counts.py", "docs/product/CALC_SPEC.md"),
    ("scripts/check_stated_counts.py", "docs/product/ADR.md"),
    ("scripts/check_stated_counts.py", "docs/product/DATA_MODEL.md"),
    ("scripts/check_stated_counts.py", "supabase/schema.sql"),
    ("scripts/check_stated_counts.py", "scripts/check_two_way_empty_target.py (this file's own PROVEN_PAIRS)"),
    ("scripts/check-data-boundary.mjs", "lib/supabase/ (directory)"),
    ("scripts/check-enum-keys.mjs", "supabase/schema.sql"),
    ("scripts/check-no-hardcoded-literals.mjs", "scan roots [app, proxy.ts, lib, features]"),
    ("scripts/check-no-runtime-cdn.mjs", "scan roots [app, proxy.ts, lib, docs, features]"),
    ("scripts/check-service-import.mjs", "lib/supabase/server-only/ (quarantine directory)"),
    ("scripts/check-service-import.mjs", "scan roots [app, features, components]"),
    ("scripts/check-zod-coverage.mjs", "features/ (directory)"),
]

KNOWN_GAPS = [
    (
        "scripts/check_module_spec_tree.py",
        "tracked directory tree (git ls-files, reverse direction)",
        "On Windows, a bare `git` invocation from `subprocess.run([...], "
        "shell=False)` resolves through Win32 CreateProcess, which appends "
        "only `.exe` to an extensionless command name — never `.bat`/`.cmd` "
        "from PATHEXT, that resolution belongs to cmd.exe's own shell parsing "
        "only. A PATH-shadowing `git.bat` shim placed ahead of the real git "
        "on PATH is therefore silently skipped and the real, populated "
        "repository's `git ls-files` output reaches the check unchanged — "
        "confirmed directly: the shimmed run still printed this repository's "
        "real ~115-file tracked set. Substituting this one premise would "
        "require either mutating the real repository's git index (rejected — "
        "no probe touches the index it will submit its own recovery from) or "
        "building a genuine PE-format stub binary (disproportionate to a "
        "STANDARD-class fix task). The check's own `die()` calls for a zero "
        "and a below-floor tracked-directory count were read instead "
        "(scripts/check_module_spec_tree.py's `tracked_directories()` and "
        "its `MINIMUM_TRACKED_DIRS` guard) and confirmed to cover both cases "
        "unambiguously by inspection. Not folded into PROVEN_PAIRS: read, "
        "not run.",
    ),
]


def run(cmd, cwd=None, env=None):
    r = subprocess.run(cmd, cwd=cwd or REPO, env=env, capture_output=True, text=True)
    return r.returncode, r.stdout, r.stderr


def classify(returncode, stdout, stderr):
    out = stdout + stderr
    lines = [l for l in out.splitlines() if l.strip()]
    fail_lines = [l for l in lines if l.strip().startswith("FAIL:")]
    has_traceback = "Traceback (most recent call last)" in out
    has_node_stack = any(l.strip().startswith("at ") for l in lines)
    has_unhandled = "node:internal" in out or "ReferenceError" in out
    crashed = has_traceback or has_node_stack or has_unhandled
    ok = (returncode != 0) and (len(fail_lines) >= 1) and (not crashed)
    return ok, crashed, out


def _copy_tree(src, dst):
    shutil.copytree(src, dst, symlinks=True)


def _chmod_and_retry(func, path, _exc_info):
    """git marks its object files read-only; Windows refuses to unlink one
    without this. Learned at M-01."""
    os.chmod(path, stat.S_IWRITE)
    func(path)


def _rmtree_retry(path):
    """Windows AV/indexer contention makes a freshly-copied tree's rmtree
    fail intermittently with WinError 5, and a `.git` directory's read-only
    object files need the chmod-and-retry handler on top of that (M-01).
    Retry with backoff rather than renaming anything in place."""
    last_err = None
    for attempt in range(8):
        try:
            shutil.rmtree(path, onexc=_chmod_and_retry)
            return
        except (PermissionError, OSError) as e:
            last_err = e
            time.sleep(0.5 * (attempt + 1))
    raise last_err


class FileProbe:
    def __init__(self, path):
        self.path = os.path.join(REPO, path)
        self.rel = path
        self.snapshot = None

    def snap(self):
        with open(self.path, "rb") as f:
            self.snapshot = f.read()

    def remove(self):
        os.remove(self.path)

    def empty(self):
        with open(self.path, "wb") as f:
            f.write(b"")

    def restore(self):
        with open(self.path, "wb") as f:
            f.write(self.snapshot)

    def verify_restored(self):
        with open(self.path, "rb") as f:
            return f.read() == self.snapshot

    def cleanup(self):
        pass


class DirProbe:
    """Never renamed in place — a live-directory rename races AV/indexer
    locks on Windows and can leave neither the original nor a usable backup.
    The real directory is copied aside, the live one is removed or emptied,
    and restoration re-copies from the holding area."""

    def __init__(self, path):
        self.path = os.path.join(REPO, path)
        self.rel = path
        self.holding = None

    def snap(self):
        self.holding = tempfile.mkdtemp(prefix="dirprobe_")
        _rmtree_retry(self.holding)
        _copy_tree(self.path, self.holding)

    def remove(self):
        _rmtree_retry(self.path)

    def empty(self):
        _rmtree_retry(self.path)
        os.makedirs(self.path, exist_ok=True)

    def restore(self):
        if os.path.isdir(self.path):
            _rmtree_retry(self.path)
        _copy_tree(self.holding, self.path)

    def _manifest(self, root):
        out = {}
        for dirpath, _, filenames in os.walk(root):
            for fn in filenames:
                fp = os.path.join(dirpath, fn)
                rel = os.path.relpath(fp, root)
                with open(fp, "rb") as f:
                    out[rel] = f.read()
        return out

    def verify_restored(self):
        return self._manifest(self.path) == self._manifest(self.holding)

    def cleanup(self):
        if self.holding and os.path.isdir(self.holding):
            _rmtree_retry(self.holding)


class RootsProbe:
    """A scan surface made of several roots, some directories, one a single
    file (proxy.ts). Compares raw bytes for a file root rather than a
    basename-keyed dict — an earlier version of this probe keyed a file
    root's manifest by `os.path.basename(root)`, which differs between the
    real path and its holding-area copy (a `tempfile.mkdtemp()` name with no
    extension), so two byte-identical files compared unequal under different
    dict keys and reported a false "not restored". Content only, here."""

    def __init__(self, roots):
        self.roots = roots
        self.rel = "[" + ", ".join(roots) + "]"
        self.holdings = {}

    def _abspath(self, r):
        return os.path.join(REPO, r)

    def snap(self):
        for r in self.roots:
            p = self._abspath(r)
            if not os.path.exists(p):
                continue
            was_dir = os.path.isdir(p)
            holding = tempfile.mkdtemp(prefix="rootsprobe_")
            _rmtree_retry(holding)
            if was_dir:
                _copy_tree(p, holding)
            else:
                shutil.copy2(p, holding)
            self.holdings[r] = (holding, was_dir)

    def remove(self):
        for r, (_holding, was_dir) in self.holdings.items():
            p = self._abspath(r)
            if was_dir:
                _rmtree_retry(p)
            else:
                os.remove(p)

    def empty(self):
        self.remove()
        for r, (_holding, was_dir) in self.holdings.items():
            p = self._abspath(r)
            if was_dir:
                os.makedirs(p, exist_ok=True)
            else:
                open(p, "wb").close()

    def restore(self):
        for r, (holding, was_dir) in self.holdings.items():
            p = self._abspath(r)
            if os.path.isdir(p):
                _rmtree_retry(p)
            elif os.path.isfile(p):
                os.remove(p)
            if was_dir:
                _copy_tree(holding, p)
            else:
                shutil.copy2(holding, p)

    def _manifest_one(self, root, was_dir):
        if not was_dir:
            if not os.path.exists(root):
                return None
            with open(root, "rb") as f:
                return f.read()
        out = {}
        for dirpath, _, filenames in os.walk(root):
            for fn in filenames:
                fp = os.path.join(dirpath, fn)
                rel = os.path.relpath(fp, root)
                with open(fp, "rb") as f:
                    out[rel] = f.read()
        return out

    def verify_restored(self):
        for r, (holding, was_dir) in self.holdings.items():
            p = self._abspath(r)
            if self._manifest_one(p, was_dir) != self._manifest_one(holding, was_dir):
                return False
        return True

    def cleanup(self):
        for holding, _was_dir in self.holdings.values():
            if os.path.isdir(holding):
                _rmtree_retry(holding)
            elif os.path.isfile(holding):
                os.remove(holding)


def do_pair(results, check_label, cmd, probe):
    entry = {"check": check_label, "premise": probe.rel}
    probe.snap()
    try:
        probe.remove()
        rc, out, err = run(cmd)
        ok, crashed, full = classify(rc, out, err)
        entry["removed_ok"] = ok
    finally:
        probe.restore()
    entry["removed_restored"] = probe.verify_restored()

    try:
        probe.empty()
        rc, out, err = run(cmd)
        ok, crashed, full = classify(rc, out, err)
        entry["emptied_ok"] = ok
    finally:
        probe.restore()
    entry["emptied_restored"] = probe.verify_restored()

    entry["proven"] = bool(
        entry.get("removed_ok") and entry.get("emptied_ok")
        and entry.get("removed_restored") and entry.get("emptied_restored")
    )
    results.append(entry)
    print(f"{'PASS' if entry['proven'] else 'FIND'} {check_label} / {probe.rel}")
    probe.cleanup()


def probe_check_credentials(results):
    """git ls-files, tested in a disposable scratch repository so the real
    repository's index is never touched."""
    label = "scripts/check_credentials.py"
    script = os.path.join(REPO, "scripts", "check_credentials.py")
    entry = {"check": label, "premise": "tracked file set (git ls-files, scratch repo)"}

    scratch_empty = tempfile.mkdtemp(prefix="cred_scratch_empty_")
    run(["git", "init", "-q"], cwd=scratch_empty)
    rc, out, err = run(["python", script], cwd=scratch_empty)
    ok, crashed, full = classify(rc, out, err)
    entry["removed_ok"] = ok
    entry["removed_restored"] = True
    _rmtree_retry(scratch_empty)

    scratch_repo = tempfile.mkdtemp(prefix="cred_scratch_repo_")
    run(["git", "init", "-q"], cwd=scratch_repo)
    run(["git", "config", "user.email", "probe@example.com"], cwd=scratch_repo)
    run(["git", "config", "user.name", "probe"], cwd=scratch_repo)
    fpath = os.path.join(scratch_repo, "probe.txt")
    with open(fpath, "w") as f:
        f.write("placeholder\n")
    run(["git", "add", "probe.txt"], cwd=scratch_repo)
    run(["git", "commit", "-q", "-m", "seed"], cwd=scratch_repo)
    os.remove(fpath)  # tracked but absent on disk -- open() reads 0 bytes
    rc, out, err = run(["python", script], cwd=scratch_repo)
    ok, crashed, full = classify(rc, out, err)
    entry["emptied_ok"] = ok
    entry["emptied_restored"] = True
    _rmtree_retry(scratch_repo)

    entry["proven"] = bool(entry["removed_ok"] and entry["emptied_ok"])
    results.append(entry)
    print(f"{'PASS' if entry['proven'] else 'FIND'} {label} / tracked file set")


def main():
    results = []
    probe_check_credentials(results)

    do_pair(results, "scripts/check_data_model_schema.py",
            ["python", "scripts/check_data_model_schema.py"], FileProbe("docs/product/DATA_MODEL.md"))
    do_pair(results, "scripts/check_data_model_schema.py",
            ["python", "scripts/check_data_model_schema.py"], FileProbe("supabase/schema.sql"))
    do_pair(results, "scripts/check_done_steps_shape.py",
            ["python", "scripts/check_done_steps_shape.py"], FileProbe("SESSION_CONTEXT.md"))
    do_pair(results, "scripts/check_ledger.py",
            ["python", "scripts/check_ledger.py"], FileProbe("SESSION_CONTEXT.md"))
    do_pair(results, "scripts/check_ledger.py",
            ["python", "scripts/check_ledger.py"], FileProbe("docs/method/CARRY_FORWARDS.md"))
    do_pair(results, "scripts/check_migration_split.py",
            ["python", "scripts/check_migration_split.py"], FileProbe("supabase/schema.sql"))
    do_pair(results, "scripts/check_migration_split.py",
            ["python", "scripts/check_migration_split.py"], DirProbe("supabase/migrations"))
    do_pair(results, "scripts/check_module_spec_tree.py",
            ["python", "scripts/check_module_spec_tree.py"], FileProbe("docs/product/MODULE_SPEC.md"))
    do_pair(results, "scripts/check_roadmap.py",
            ["python", "scripts/check_roadmap.py"], FileProbe("docs/method/BUILD_PHASES.md"))
    do_pair(results, "scripts/check_roadmap.py",
            ["python", "scripts/check_roadmap.py"], FileProbe("SESSION_CONTEXT.md"))
    do_pair(results, "scripts/check_roadmap.py",
            ["python", "scripts/check_roadmap.py"], FileProbe("docs/method/CARRY_FORWARDS.md"))
    do_pair(results, "scripts/check_roadmap.py",
            ["python", "scripts/check_roadmap.py"], FileProbe("docs/product/DECISIONS.md"))
    do_pair(results, "scripts/check_roadmap.py",
            ["python", "scripts/check_roadmap.py"], FileProbe("docs/product/SCOPE.md"))
    do_pair(results, "scripts/check_roadmap.py",
            ["python", "scripts/check_roadmap.py"], FileProbe("docs/product/ROLE_JOURNEY.md"))
    do_pair(results, "scripts/check_roadmap.py",
            ["python", "scripts/check_roadmap.py"], FileProbe("docs/product/TENANCY_MODEL.md"))
    do_pair(results, "scripts/check_roadmap.py",
            ["python", "scripts/check_roadmap.py"], FileProbe("supabase/schema.sql"))
    do_pair(results, "scripts/check_roadmap.py",
            ["python", "scripts/check_roadmap.py"], FileProbe("docs/ROADMAP.md"))
    do_pair(results, "scripts/check_roadmap.py",
            ["python", "scripts/check_roadmap.py"], FileProbe("docs/roadmap.html"))
    do_pair(results, "scripts/check_security_model_bypass.py",
            ["python", "scripts/check_security_model_bypass.py"], FileProbe("docs/product/SECURITY_MODEL.md"))
    do_pair(results, "scripts/check_security_model_bypass.py",
            ["python", "scripts/check_security_model_bypass.py"], FileProbe("supabase/schema.sql"))
    do_pair(results, "scripts/check_session_context_shape.py",
            ["python", "scripts/check_session_context_shape.py"], FileProbe("SESSION_CONTEXT.md"))
    do_pair(results, "scripts/check_stated_counts.py",
            ["python", "scripts/check_stated_counts.py"], FileProbe("docs/product/DOMAIN_MODEL.md"))
    do_pair(results, "scripts/check_stated_counts.py",
            ["python", "scripts/check_stated_counts.py"], FileProbe("docs/product/DECISIONS.md"))
    do_pair(results, "scripts/check_stated_counts.py",
            ["python", "scripts/check_stated_counts.py"], FileProbe("SESSION_CONTEXT.md"))
    do_pair(results, "scripts/check_stated_counts.py",
            ["python", "scripts/check_stated_counts.py"], FileProbe("docs/product/CALC_SPEC.md"))
    do_pair(results, "scripts/check_stated_counts.py",
            ["python", "scripts/check_stated_counts.py"], FileProbe("docs/product/ADR.md"))
    do_pair(results, "scripts/check_stated_counts.py",
            ["python", "scripts/check_stated_counts.py"], FileProbe("docs/product/DATA_MODEL.md"))
    do_pair(results, "scripts/check_stated_counts.py",
            ["python", "scripts/check_stated_counts.py"], FileProbe("supabase/schema.sql"))
    do_pair(results, "scripts/check_stated_counts.py",
            ["python", "scripts/check_stated_counts.py"],
            FileProbe("scripts/check_two_way_empty_target.py"))
    do_pair(results, "scripts/check-data-boundary.mjs",
            ["node", "scripts/check-data-boundary.mjs"], DirProbe("lib/supabase"))
    do_pair(results, "scripts/check-enum-keys.mjs",
            ["node", "scripts/check-enum-keys.mjs"], FileProbe("supabase/schema.sql"))
    do_pair(results, "scripts/check-no-hardcoded-literals.mjs",
            ["node", "scripts/check-no-hardcoded-literals.mjs"], RootsProbe(["app", "proxy.ts", "lib", "features"]))
    do_pair(results, "scripts/check-no-runtime-cdn.mjs",
            ["node", "scripts/check-no-runtime-cdn.mjs"], RootsProbe(["app", "proxy.ts", "lib", "docs", "features"]))
    do_pair(results, "scripts/check-service-import.mjs",
            ["node", "scripts/check-service-import.mjs"], DirProbe("lib/supabase/server-only"))
    do_pair(results, "scripts/check-service-import.mjs",
            ["node", "scripts/check-service-import.mjs"], RootsProbe(["app", "features", "components"]))
    do_pair(results, "scripts/check-zod-coverage.mjs",
            ["node", "scripts/check-zod-coverage.mjs"], DirProbe("features"))

    proven = sum(1 for r in results if r["proven"])
    print(f"\n=== {proven}/{len(results)} pairs proven this run ===")
    print(f"Landed PROVEN_PAIRS enumeration: {len(PROVEN_PAIRS)}")
    print(f"Landed KNOWN_GAPS: {len(KNOWN_GAPS)}")

    if proven != len(PROVEN_PAIRS) or len(results) != len(PROVEN_PAIRS):
        print(
            "FAIL: this run's live result does not match the landed "
            "enumeration -- a check or a premise changed since this file "
            "was last updated. Update PROVEN_PAIRS/KNOWN_GAPS to match, or "
            "investigate the regression this run just found."
        )
        for r in results:
            if not r["proven"]:
                print(json.dumps(r, indent=2))
        sys.exit(1)

    print("OK: every landed pair reproved.")


if __name__ == "__main__":
    main()
