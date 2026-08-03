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

**PR-13 — A write task states its push, and its report proves the push.**
Every write task's commit block states `Push to origin/main` explicitly, and the
report states the remote comparison (`old..new main -> main`), not just local
`git status`. A commit that is not on origin does not exist for verification: the
reviewer reads origin, not the workspace. Origin: P-05-PRE landed correctly and
was not pushed, because the prompt omitted the push line.

**PR-14 — Reviewer drafts stage outside the working tree.**
A reviewer-authored document is delivered to `~/Desktop/b2s-inbox/` and copied
into the repository only by the land task, only to its final path. A draft placed
inside the working tree becomes an untracked byte-identical duplicate of the
committed file, which is the CF-53 failure in a new place. The staging folder is
never committed and never referenced by an absolute path in a report.

**PR-15 — A stated count is verified against its own list before landing.**
Any document stating a total that its own contents enumerate — entity counts,
decision counts, module counts, stub counts — has that total verified
programmatically by the land task, not by eye. HALT on mismatch; do not correct
it. Origin: CF-38's 56-versus-79, CF-54's 20/22/23, and DOMAIN_MODEL.md's
58-versus-87, which the reviewer caught in its own draft.

**PR-16 — Verification measurements are commanded, not chosen.**
A task that proves a copy by byte size and SHA-256 runs the exact commands named
in the prompt and reports their raw output. `(Get-Content).Length` counts
characters, not bytes; `-Raw` normalises; hashing a string held in memory is not
hashing the file. Use `(Get-Item <path>).Length` and
`Get-FileHash -Algorithm SHA256 <path>`, or `wc -c` and `sha256sum` under
git-bash. Where git tracks the file, `git status --porcelain <path>` outranks
both — git's content hash is authoritative over any external reading. Origin:
CF-78 and CF-81, a false byte-and-digest reading on an unmodified tracked file.

**PR-17 — A prompt never hands the builder a value the builder cannot know.**
The done-steps commit column and its verdict column are two such values: the sha
does not exist until after the commit, and the verdict is the reviewer's and
arrives later. A prompt supplying `<this commit>` as literal text gets it
committed as literal text. Fill the commit column in a stated post-commit step
using `git rev-parse --short HEAD`, and leave the verdict column to the next land
task, which carries the reviewer's verdict for the previous one. Origin: CF-80.

**PR-18 — Reviewer state assertions are stamped and re-verified.**
Every factual claim a prompt makes about repo state — counts, highest ids, byte
sizes, which rows exist, which files are stubs — is stamped with the commit the
reviewer verified it at, and grouped where the builder reads it before acting.
The builder re-verifies at execution and reports the actual value. A divergence
is a HALT unless the prompt names it as expected. Origin: P-08-PRE, where the
reviewer asserted CF-79 as the highest id from commit 9079a2e while a61359a had
since opened CF-80 through CF-82 — the builder halted correctly on the reviewer's
own drift.

**PR-19 — A carry-forward named in a verdict is already open.**
The step that records a reviewer verdict opens every carry-forward that verdict
logged, as a one-line stub carrying the id and the owner. Every later prompt
therefore **amends** that row — expanding the claim, then closing it — and never
opens it. A prompt that instructs a builder to create an id a verdict has already
logged will fire its own duplicate-id guard. Origin: CF-84, the direct cause of
the P-08-PRE Task 6 halt.

**PR-20 — Ceremony is budgeted by subject, not applied uniformly.**
Full ceremony — its own task, its own window, its own ledger row, its own
reviewer round trip — is reserved for money arithmetic, tenant isolation, print
generation, schema, and `BrandConfig`. Document hygiene is not: stale
cross-references, wrong counts, placeholder text, owner strings, vocabulary slips
in prose and dead paragraphs are **batched into the next task that already
touches the file**, reported as one line, and never given a task or a round trip
of their own. A hygiene finding that genuinely cannot wait is fixed inside the
task that found it. Origin: four consecutive turns spent on ledger bookkeeping
rather than product, and the owner's correct objection to it. The carry-forward
protocol still applies — nothing is silently patched — but a row and a line in a
report is the whole of the ceremony a hygiene finding earns.

**PR-21 — The absence of a check is never reported as a passing check.**
A report distinguishes "checked, found nothing" from "no check exists."
Recording `0` where the correct answer is `N/A — not enabled` converts an
absence of scanning into a clean result, and that is the most dangerous shape a
gate report can take: it closes an item that was never examined. Where an
item's evidence lives outside the repository, the report names the surface or
endpoint consulted and its actual response, verbatim. Origin: the Gate 3 item
11 check, where the secret-scanning alerts endpoint returned "disabled on this
repository" and the builder correctly refused to record it as zero alerts.

**PR-22 — A guard asserts the shape a value must have, never the strings a file
must not contain.**
Negative string scans false-positive on the documentation of their own
anti-pattern, and this repository documents its anti-patterns by rule — PR-07
preserves original claims, the journal is append-only, and every precedent quotes
the defect that produced it. A guard forbidding a literal will eventually fire on
the precedent explaining why it exists. Assert instead what the value must be, at
the structural location where the defect occurs: not "this file must not contain
`<this commit>`" but "this table column must hold a sha or a declared em-dash."
The positive form is narrower in scope, broader in what it catches, and cannot be
defeated by rewording. Origin: CF-87.

**PR-23 — A universal claim is verified over the whole set, never a sample.**
When a prompt asserts "every row", "all files", "none of", or "the highest id",
the reviewer enumerates the entire set programmatically and states the count
examined alongside the claim. A universal drawn from the visible portion of a
table, the tail of a file, or a snapshot taken at an earlier commit is a guess
wearing the grammar of a fact, and the builder pays for it in a halt. Where a
mechanised check for the property exists, the reviewer cites its output instead
of asserting. Origin: CF-88, and CF-83 before it.

**PR-24 — A prompt supplies the full text of every carry-forward it names, and
says open-or-amend rather than close.**
PR-19 assumes a verdict-recording step always runs. It does not when the owner
merges and proceeds directly, so a row logged in a verdict may not exist when the
next task reaches for it. Every prompt therefore carries the complete claim text
for each id it touches and instructs the builder to open it if absent and amend
it if present, reporting which. A builder must never be asked to close a row it
cannot find, and must never invent text to fill one. Origin: CF-91.

**PR-25 — A security bump of an existing dependency is not a new dependency.**
`AGENTS.md` §2 requires a stop-and-flag before adding a dependency. Raising the
version of a package already present — direct or transitive — to close a
published advisory is maintenance, not scope: it needs a task, a green pipeline
and a journal line, not an OD. Introducing a package that was not there before
still stops and flags. Origin: CF-98, four transitive advisories held up behind a
rule written for a different act.

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
- `gh api --input -` with a shell heredoc fails with HTTP 400 in this
  environment: PowerShell mangles the heredoc before git-bash receives it. Write
  the JSON body to a temporary file and pass `--input <file>`, then delete it.
  Discovered at G3-CLOSE Task 1b.
- Learned at P01-T01: PowerShell's `Get-ChildItem` (and other cmdlets that take
  a `-Path`) treat `[` and `]` as wildcard characters, so a path containing a
  literal bracket segment — `app/[locale]/...`, which the App Router's own
  routing convention requires — silently matches nothing instead of erroring.
  Use `-LiteralPath` whenever a path under `app/[locale]/` (or any other
  bracketed route segment) is addressed directly; `git`, `rg` and the Read/Grep
  tools are unaffected, only native PowerShell path cmdlets.
- Learned at P01-T01: this shell is stateful across calls (documented, but easy
  to forget mid-task). A bare `cd $env:TEMP` issued once for a throwaway
  scaffold left the working directory changed for every later command in the
  same session, including `npm install`, which silently ran against an
  unrelated directory instead of failing. Pass `working_directory` explicitly
  on every Shell call that must run in the repository rather than relying on a
  prior `cd`.
- Learned at P01-T02: `supabase link` and `supabase db push` need **no database
  password**. The CLI provisions a temporary login role through the Management
  API using the access token, printing "Initialising login role...". Only
  `supabase login` (or `SUPABASE_ACCESS_TOKEN`) is required, so a schema apply
  never needs the owner to reset the database password. The CLI is not installed
  globally here; `npx supabase@latest` works and reports 2.111.0.
- Learned at P01-T02: `supabase db push` prints `Warning: failed to cache
  migrations catalog: ... failed to run docker. Docker Desktop is a
  prerequisite`. It is a **local cache** warning only. Every migration applied
  and the remote ledger was correct. Docker is not needed to push to a remote
  project; do not install it in response to this line.
- Learned at P01-T02: `vercel link` rewrites two files without asking. It appends
  `VERCEL_OIDC_TOKEN` to `.env.local`, and appends `.vercel` **and a duplicate
  `.env*`** to `.gitignore` even when `.env*` is already matched. Run
  `git diff -- .gitignore` immediately after linking and tidy the duplicate.
- Learned at P01-T02: `vercel whoami` with no stored credentials does **not**
  report "not authenticated". It starts a device-login flow, and that flow can
  complete silently against an existing browser session — so a read-only probe
  for authentication state authenticated the machine as a side effect. Probe for
  credentials with something that cannot mutate state, or expect the login.
- Learned at P01-T02: Next.js inlines `NEXT_PUBLIC_*` into the client bundle only
  for **literal** member access. `process.env[name]` with a computed key is
  `undefined` in the browser, so a tidy `requiredEnv("NAME")` helper silently
  breaks the browser client while typechecking and building cleanly.
- Learned at P01-T02: write `supabase gen types` output with
  `[System.IO.File]::WriteAllText(..., UTF8Encoding $false)`. PowerShell 5.1's
  `>` redirection produces UTF-16 and `Out-File -Encoding utf8` produces a BOM;
  either makes the committed types differ from a Linux CI regeneration on every
  run, which the `types-drift` job would report as permanent, unfixable drift.
- Learned at P01-T02: a Supabase project grants `anon` and `authenticated` broad
  table privileges by **default privilege**, so a newly created table arrives
  with table-wide UPDATE already granted. Column-scoped grants are therefore
  decoration unless the migration first issues
  `revoke all on all tables in schema public from anon, authenticated`. Every
  later migration that adds a table repeats the revoke, or the grant set silently
  widens and a policy that looked safe in isolation stops being safe.
- Learned at P01-T02: this machine runs **Node v22.12.0** and npm 11.17.0, while
  `ci.yml` pins `NODE_VERSION: "24"`. A local green is therefore evidence on a
  different major version than the one CI uses, which weakens but does not replace
  the verify-before-committing rule — keep doing it, and treat the pipeline's
  conclusion as authoritative. Both were green for P01-T02. Neither the Supabase nor
  the Vercel CLI is installed globally; `npx supabase@latest` reports 2.111.0 and
  `npx vercel@latest` reports 58.4.4.
- Learned at P01-T02: the four `docs-integrity` checks run as `python3`, which is
  correct on the ubuntu runner and **fails on this machine** — Windows ships a
  `python3` App Execution Alias that prints "Python was not found; run without
  arguments to install from the Microsoft Store" and exits 9009 without running
  anything. `python` resolves to 3.13.1 here. Run the guards locally as `python
  scripts/<name>.py`; do not change the workflow to match the local shell.
- Learned at P01-T03: `pg_catalog` is unreachable from any Supabase client.
  PostgREST exposes the `public` schema, so `pg_class`, `pg_policy`, `pg_proc`
  and `pg_roles` cannot be queried through it, and a proof that must read the
  live catalog needs a second path. The one that needs no new dependency is the
  Management API — `POST https://api.supabase.com/v1/projects/{ref}/database/query`
  with a personal access token — which executes as `postgres`. It is also the
  only way to run the DDL teardown needs.
- Learned at P01-T03: that endpoint intermittently answers `503` with
  `upstream connect error or disconnect/reset before headers` under a few hundred
  sequential requests. Retry **gateway 5xx and dropped sockets only, never a
  4xx**: a 4xx carries the SQLSTATE and message that half these proofs assert, so
  retrying one would re-run an operation whose refusal was the result. Treating a
  5xx as a result is worse still — "the write was refused" and "the request never
  arrived" are indistinguishable to a caller that only checks for an error, so a
  negative assertion passes for the wrong reason.
- Learned at P01-T03: the `membership_active_owner_required` constraint trigger
  makes a tenant's membership rows **undeletable by any path**, including
  `service_role`, because every delete order ends with the tenant at zero active
  owners. Teardown must `alter table public.membership disable trigger
  membership_active_owner_required`, delete, and re-enable — which requires table
  ownership and therefore the Management API, not a Supabase client.
- Learned at P01-T03: `revoke all on all tables in schema public` does **not**
  cover functions. `EXECUTE` on a `public` function defaults to `PUBLIC`, so every
  function there is a PostgREST RPC endpoint callable by `anon`. Recorded as
  CF-105; a migration adding a function revokes `execute` explicitly or the
  function ships publicly callable.
- Learned at P01-T03: vitest intercepts `console` output and attributes it to the
  running task, which silently drops whatever a file-level `afterAll` writes. When
  the printed output **is** the deliverable — a gate ledger, a coverage report —
  set `disableConsoleIntercept: true` in that suite's config, or the run passes
  with nothing to read.
- Learned at P01-T03: the Supabase CLI on Windows stores its access token in
  **Windows Credential Manager**, target `Supabase CLI:supabase`, not in a file.
  `~/.supabase` holds only telemetry and traces, so its absence does not mean the
  CLI is logged out. `cmdkey /list` confirms the entry exists without printing the
  secret.
- Learned at P01-T03: a suite that needs live credentials must be excluded from
  `npm test` rather than made to skip. `ci.yml`'s `unit` job holds no Supabase
  secrets, and a suite that skipped there would report green while proving
  nothing, which is PR-21's failure shape. The isolation suite runs on its own
  config through `npm run test:isolation`, and throws by name on an absent
  variable.
