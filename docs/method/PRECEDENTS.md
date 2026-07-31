# PRECEDENTS — B2S

Binding procedural rulings and environment quirks. Read this file at the
start of every session, alongside `SESSION_CONTEXT.md`.

A precedent is a procedural question decided once that binds every later
task. It is not a product decision (those are signed ODs in the decision
register) and not an architecture decision. It exists because this project
re-derived the same procedural answers repeatedly when they lived nowhere.

Append only. Never rewrite an entry — supersede it with a new one and say
which it replaces.

---

## 1. Procedural rulings

**PR-01 — Session-end file updates are always authorised.**
A task prompt saying "create exactly one file" never overrides the
session-end obligation. The state, ledger, precedent and journal files may
always be written. Origin: CF-34, P-01.

**PR-02 — Platform-appended commit trailers are accepted.**
A `Co-authored-by` trailer added by the IDE surface does not violate an
"exact commit message" instruction. Subject-line match is sufficient. Never
amend or rewrite history to strip one. Origin: CF-35, P-01.

**PR-03 — Files that must parse carry no inline banner.**
JSON, JavaScript and any other machine-parsed file gets no prepended
banner, because the banner breaks it. The directory `README.md` carries the
notice instead and names the file explicitly. Origin: CF-37, P-01b;
re-applied to `backup-browser-data.js` at P-04c.

**PR-04 — Carry-forward landing is count-checked.**
A prompt landing carry-forward rows states the count AND the explicit id
list. The builder counts the rows, compares to the stated count, checks the
ids match and that any gap in the sequence is declared, and HALTS on
mismatch — it does not resolve the mismatch, land a partial set, or invent
text for a missing id. Origin: CF-40, four occurrences before it held.

**PR-05 — STOP blocks separate HALT from REDACT-AND-CONTINUE.**
A prompt never files a redact-and-continue condition under a "report and
halt" heading. Discovering a redactable value is not a reason to discard a
completed read. Origin: CF-43, P-02/P-03.

**PR-06 — Corrective second commits are permitted and must be declared.**
One commit for the deliverable. If a defect is found after pushing, land a
corrective second commit whose subject states what it corrects, and declare
it in the report. Never leave a known-false claim in place to preserve a
single-commit instruction, and never amend or rewrite pushed history.
Origin: CF-51, P-04; first live use P-04c.

**PR-07 — Requirements evidence is annotated, never rewritten.**
When a claim in `docs/requirements/` proves false, the original claim stays
intact and visible. The correction is inserted immediately below it, dated,
naming who verified it and against which source line. The evidentiary value
of the record is what makes it evidence. Origin: P-04b and P-04c on
`AUDIT_STICKER.md`.

**PR-08 — Redaction preserves structure.**
Only the sensitive span becomes `<REDACTED>`. Drive letters, separators,
folder names, surrounding prose and line citations survive unchanged, so
the record still proves what it was cited to prove. Origin: CF-14, P-04b.

**PR-09 — The reviewer reads the repository directly. SIGNED 2026-07-31.**
The reviewer surface fetches the public repo and verifies claims against
the artifact rather than against a description of it. Every verdict states
what was fetched and which commands were run. This does not change write
access: the builder still builds, the reviewer still verifies. A build
report remains required — it carries intent, deviations and judgement that
no diff shows. Origin: CF-59.

**PR-10 — Report hygiene is a step, not a request.**
Before submitting a report, grep it for the owner's OS account name and any
credential, key or absolute local path. Replace with a description. Chat
transcripts are not in the repo, so nothing needs remediating, but the
habit is what protects the repo when it later holds real secrets. Origin:
three failures as a request across P-04, P-04b and P-04c.

**PR-11 — `git add` aborts on a missing pathspec.**
Calling `git add` with several paths where one no longer exists — after a
`git mv`, for example — aborts staging for ALL of them. Verify with
`git show --stat HEAD` after every commit that spans a rename. Origin:
P-04c, caught and corrected in-task.

**PR-12 — A prompt is self-contained.**
Every payload a prompt refers to sits inside the same fenced block. A phrase like
"reviewer-supplied text, supplied in this task's message" is a defect, not a
pointer — a fresh window sees only the fence. Origin: P-02-FIX halted at TASK 4
and TASK 5 for exactly this, one task after CF-40 closed on the same failure
class.

---

## 2. Environment quirks — never re-discover
- Brave isolates IndexedDB per file:// origin. Legacy data is only visible from
  a tool file in its original folder.
- balance-bites-label-v3.html deleted permanently. REPORT.md §2.2 is the sole
  record of its behaviour. Do not infer beyond it.
- Browser-data backup deliberately skipped 2026-07-29 (owner decision). Design-tool
  presets (bbcarton_pb, bbstand3_pb, bb_presets, BBLabelDB) are accepted as
  potentially unrecoverable. Business data is unaffected — it lives as bb_*.json in
  the shared folder. P02 preset importer still sweeps these keys; empty results are
  expected and not a failure.
- PowerShell is the only configured shell for this workspace. For commands that
  need bash syntax (heredocs, `$(...)` command substitution, etc.), invoke
  git-bash directly at `C:\Program Files\Git\bin\bash.exe` rather than trying to
  translate the syntax into PowerShell.
- Refinement of the above, learned at P-03: PowerShell parses the git-bash
  argument string *before* bash sees it, so `<`, `$(...)` and nested double
  quotes are intercepted and fail with "The '<' operator is reserved" or an
  unterminated-quote error. Use `& 'C:\Program Files\Git\bin\bash.exe' -c '...'`
  with the whole script in **single** quotes, no inner single quotes, no `<`
  redirection and no `$(...)`. Pass filenames as arguments (`wc -l FILE`) rather
  than redirecting (`wc -l < FILE`). Chain with `&&` inside the single-quoted
  string. Four attempts were burned on this at P-03.
- Writing a very large deliverable in one `Write` call risks context exhaustion.
  P-03 wrote `EXTRACT_INVOICE_PRO.md` (~3,900 lines) incrementally: an initial
  `Write` ending in an HTML-comment sentinel, then successive `StrReplace` calls
  that swap the sentinel for `new content + sentinel`, with a final replace that
  drops it. Verify the sentinel is gone before committing.
- Learned at P-04: a repo-wide grep glob such as `legacy/*.html` will match files
  a task is explicitly scoped away from. Scope key-name and pattern searches to
  the exact files in the task's read set, or expect to have to declare an
  incidental out-of-scope match as a deviation. P-04 hit this once, on
  `_PBK =`, which returned a line from `balance-bites-invoice-pro.html`.
- Learned at P-04: `REPORT.md`'s line counts are **not** uniformly stale. They
  are exact for the three design tools and wrong only for the two business tools,
  which kept growing after the report was written. Do not apply a blanket
  "re-derive everything" assumption — check per file, because the answer differs.
- PowerShell rejects the heredoc commit form, and `git-bash -c` fails
  non-interactively on `git commit -m` with EDITOR unset. Working path:
  `git add` the paths, write the subject line to a temporary file, commit with
  `git commit -F <tempfile>`, delete the temp file. Subject line comes out
  byte-identical.
- `api.github.com` rate-limits unauthenticated requests and will fail
  mid-verification. The reliable read path is
  `curl -sL -o r.tar.gz "https://codeload.github.com/Jovo-Jovi/B2S-BRAND-TO-SHELF/tar.gz/refs/heads/main"`
  then `tar xzf`. `raw.githubusercontent.com` works for individual
  committed files.
- `git add` with multiple pathspecs aborts entirely if any one path is
  missing — see PR-11.
- PowerShell here is 5.1, where `&&` is not a valid statement separator. Chain
  with `;`, or invoke git-bash directly. Combines with the existing commit quirk:
  `git add` the paths, write the subject to a temp file, `git commit -F <file>`.
- Refinement of the above, learned at P-02-FIX: `Set-Content -Encoding UTF8` in
  PowerShell 5.1 writes a **BOM**, and `git commit -F` carries it into the
  subject line, so the subject is no longer byte-exact. Write the message with
  `[System.IO.File]::WriteAllText($path, $msg, (New-Object
  System.Text.UTF8Encoding $false))` instead. Verify with
  `git log -1 --format=%s` before pushing — the BOM is invisible in most output.
