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

**PR-26 — A plant-and-revert probe restores from its own snapshot, never from
git.**
Proving a guard by planting a violation into a tracked file and reverting is the
right technique, and `git checkout -- <path>` is the wrong revert for it.
Checkout restores the **committed** content, so it silently discards every
uncommitted edit the current task has made to the same file — the probe reverts
its own plant and the session's work with it, and the damage shows up only as a
later check failing against text that was correct ten minutes earlier. The probe
reads the file into memory before planting and writes those exact bytes back
afterwards, then asserts the restored content is byte-identical to the snapshot.
Origin: P01-T05-FIX, where a prover for `check_ledger.py` reverted both
`CARRY_FORWARDS.md` and `SESSION_CONTEXT.md` to HEAD and destroyed twelve
unstaged ledger amendments, which had to be re-authored. The probes in the same
task that touched only `supabase/schema.sql` — a file the task had **not**
edited — were safe by luck, not by design.

**PR-27 — A check asserts a floor, or it is not a check.**
Every guard and integrity check states the minimum it expected to examine and
fails when it examined less. `OK: 0 file(s) scanned` and exit 0 is PR-21's shape
produced by the check itself: it ran, it concluded nothing, and it reported
success. The failure arrives silently the day a scan root is renamed, a glob stops
matching, or a directory moves — the check keeps passing and stops guarding.
Origin: CF-112, four of thirteen checks passing over an empty set at the second
P01 exit gate, found by a probe that removed each target rather than by reading
any of them.

**PR-28 — A gate's probe outlives the gate.**
An adversarial probe that finds something is landed as a permanent check by the
fix task that follows, and an adversarial probe that finds nothing is landed too,
because a probe that passes today is the one that catches tomorrow's regression.
A gate's rigour must not depend on whoever runs it having the same idea twice.
Origin: OD-H11, and the two-way empty-target probe that found four checks passing
on nothing at one gate and a fifth at the next.

**PR-29 — A record of another project is annotated, never corrected.**
`DEV_OS_REFERENCE.md` records the BETK method as it was practised, and BETK had
a staging environment. A sentence in it that is false of B2S is still true of
its subject; rewriting it falsifies the record rather than correcting it. Where
a B2S decision contradicts such a document, a dated annotation names the
decision and its scope and the original sentence stands. Extends PR-07's
reasoning from `docs/requirements/` to any record of a project or state other
than the current one. Origin: CF-114.

**PR-30 — A negative result is evidence only if the request reached the thing
under test.**
"It returned nothing" and "it was never asked" are the same observation at the
client and opposite facts about the system. A probe asserting that hostile input
is handled safely must show the input arrived: a non-answer from an intermediary
— a proxy, a WAF, a gateway, a client-side validation error — proves the
intermediary's behaviour and nothing whatever about the component the proof
names. This is PR-21's shape produced by infrastructure rather than by omission,
and it is more dangerous because the probe genuinely ran and genuinely passed.
Where a hostile-input proof crosses a network boundary it exercises the
in-process path as well, and reports the two counts separately so a change in the
intermediary cannot quietly empty the proof. Origin: P02-T04, where two malformed
tenant selectors shaped like SQL injection were answered 403 by Cloudflare at the
Supabase edge; the assertion that `current_tenant_id()` resolves them to null
without raising had, for those two values, tested Cloudflare.

**PR-31 — No repository document is attached as a project file.**
The reviewer fetches the repository every session (PR-09). An attached copy is
an unasserted restatement of a source of truth, outside the reach of every
check, and it rots silently — at P02-T03, four of six attached files differed
from `HEAD` and `AGENTS.md` still described a port to a stack with no database.
Where the network is unavailable the fallback is a paste of `SESSION_CONTEXT.md`
and `PRECEDENTS.md`, nothing more. This ruling was first allocated PR-30 in a
verdict and never landed; P02-T04 landed a different PR-30 from the branch, and
the repository outranks the conversation. Origin: CF-127.

**PR-32 — While a phase branch is open, method arising from phase work lands on
that branch.**
`BRANCHING.md` §3.2 sends a decision, a precedent, a lifecycle or a conformance
check to `main` directly. That holds when no phase branch is open. While one is,
a rule discovered by phase work lands with the work that found it and reaches
`main` with the phase pull request — a ledger split across two heads reconciles
nowhere, and `check_ledger.py` would pass on both while agreeing with neither.
P02-T04 already did this correctly with PR-30. Method unrelated to the open
phase still lands on `main`. Refines §3.2; supersedes nothing. Origin: CF-127.

**PR-33 — A supplied figure is verified against the artifact before it is
landed, and a correction that changes nothing is a correction, not a halt.**
PR-24 makes a prompt carry the full text of every carry-forward it names, and
PR-15 and PR-18 make a stated figure verifiable and a divergence a halt. Between
them sits a case neither answers: prose the builder is asked to land verbatim,
carrying a count **about a third artifact**, where the count is wrong and the
finding survives being corrected. Landing it verbatim puts a false figure in a
permanent record that every later reader will trust; halting spends a round trip
on a number that changes nothing about what the task should do. Neither is
right. The builder measures the figure against the artifact, lands the measured
one, records the supplied wording immediately beside it so the record still
shows what was claimed and by whom, and reports the correction as a deviation.
**The halt is reserved for a divergence that changes the task** — a premise that
makes the work unnecessary, impossible, or different in kind — which is what
PR-18 is for and what this does not weaken. Origin: P02-T06, where CF-132's
supplied text read "stated six and enumerated five" and §11a.1's table held six
rows; the section was short of the schema by two either way, so the finding, the
owner and the remedy were all unaffected. Verified programmatically, not by eye:
the new check's stated-total-versus-table-rows assertion did not fire against
the unedited document, and does fire when the total is planted at seven.

**PR-34 — A method change that must touch the ledger or the state file lands on
the open phase branch, whatever its origin.**
PR-32 sends method arising from phase work to the branch and leaves unrelated
method on `main`. Origin is the wrong test where the write set decides. A row
opened on a branch cannot be closed on `main` — it is not there — and
`SESSION_CONTEXT.md` and `CARRY_FORWARDS.md` are written by every branch task,
so any `main` edit to either guarantees a conflict at the phase pull request.
Where a method change touches either file while a phase branch is open, it lands
on the branch. Refines PR-32; supersedes nothing. Origin: OD-H12, whose rows
CF-129 and CF-130 exist only on `phase/02-tenancy-and-access`.

**PR-35 — `docs/ROADMAP.md` and `docs/roadmap.html` are generated, never edited.**
A roadmap that restates `BUILD_PHASES.md`, the ledger and the done-steps table
is a second copy of four sources of truth, and a second copy rots — CF-122 and
CF-93 are the same disease at smaller scale. Both files are emitted by
`scripts/generate_roadmap.py` from committed inputs alone, and
`scripts/check_roadmap.py` fails any push where either differs from its own
regeneration. A hand edit is a defect, not a shortcut. Every task that changes
phase state, closes a carry-forward, or adds a done-steps row regenerates both
in the same commit. The generator embeds no commit sha, branch or timestamp,
because a value that changes at commit time makes the check unsatisfiable.

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
- Learned at P01-T04: **PostgreSQL applies a table's SELECT policies to an
  UPDATE twice** — to the old row, because `UPDATE ... WHERE` reads existing
  values, and again to the **new** row, so that no UPDATE can push a row out of
  the caller's own visibility. An UPDATE policy is therefore never sufficient on
  its own: the caller must be able to see the row in both the state it starts in
  and the state it ends in, or the write is refused. The two failures look
  nothing alike and neither names the cause. Invisible **old** row: PostgREST
  answers `204` under `return=minimal` and the row is unchanged — a silent
  no-op that reads as success. Invisible **new** row: `42501 new row violates
  row-level security policy for table "x"`, with no policy name, which points at
  a WITH CHECK that may be perfectly correct. Diagnose it by substitution, not
  by reading: replace the UPDATE policy's WITH CHECK with literal `true` and
  drop every other UPDATE policy. If the refusal survives a check that cannot
  fail, the SELECT policies are the cause.
- Learned at P01-T04: the isolation harness reads `SUPABASE_ACCESS_TOKEN` from
  the process environment or `.env.local`, and the Supabase CLI's own copy lives
  in Windows Credential Manager where the harness cannot reach it. A CLI that
  pushes migrations happily is therefore no evidence that the suite can run. The
  variable is the owner's to supply and is never requested in a chat surface.
- P01-T04's two techniques — PostgreSQL applying a table's SELECT policies to
  both the old and the new row of an UPDATE, and the substitution diagnostic
  that isolates which clause refused — were already recorded above when the
  P01-GATE session checked for them. Nothing was appended for either. Recorded
  here only so the next task does not check a third time.
- Learned at P01-GATE, a refinement of the two git-bash entries above: the
  PowerShell parse of a `bash -c` argument also intercepts `<`, `>` and bare
  `(` `)`. A redaction placeholder written with angle brackets and a heading
  written with parentheses each silently truncated the command to nothing and
  returned exit 0 with partial output — the worst shape, since a truncated
  probe reads as a probe that found nothing. Three calls were burned on it.
  Keep `bash -c` strings to plain words, or put the script in a file under
  `$env:TEMP` and invoke `bash <file>` by path, which has none of these
  problems and is what the rest of this session used.
- Learned at P01-GATE: `python` on this machine writes stdout as cp1252, so
  printing any repository text containing `—`, `§` or `→` raises
  `UnicodeEncodeError` and kills the script mid-report, after it has already
  printed the part that looked fine. Set `$env:PYTHONIOENCODING="utf-8"` before
  any script that echoes document content. A subprocess captured with
  `text=True` decodes with the same locale, so a wrapper that runs a checker and
  prints its output will mojibake even when the checker itself is clean.
- Learned at P01-GATE: the Grep tool is ripgrep and honours `.gitignore`, so
  `.next/` is invisible to it. A scan of build output for a leaked secret — the
  exact scan a gate owes — finds nothing through Grep and reports a clean
  result, which is PR-21's failure shape arriving through a tool default rather
  than a decision. Walk the build tree with a script instead, and state the file
  count scanned so the zero is attributable.
- Learned at P01-T05-FIX: **ESLint reads directive comments wherever they
  appear, including inside explanatory prose in `eslint.config.mjs` itself.**
  A comment describing the exemption path — the words "eslint", "disable" and
  "next-line" run together — is parsed as a live directive, and the words after
  it are registered as rule names. The failure reads
  `Definition for rule '<the rest of your sentence>' was not found`, pointing at
  the config, which is baffling until you see it. Describe a disable directive
  in prose; never spell one out.
- Learned at P01-T05-FIX: **`pg_has_role(role, target, 'MEMBER')` is the
  `SET ROLE` test. `'USAGE'` is not, and answers the opposite way here.** USAGE
  reports automatic privilege inheritance; Supabase grants `service_role` to
  `authenticator` with `NOINHERIT`, so a USAGE audit says `authenticator` cannot
  reach `service_role` — false, and reassuring in the worst possible way for a
  question about what can bypass RLS. MEMBER is also transitive, so it is the
  one that answers "can this role become that role by any chain". Both were run
  side by side at P01-T05-FIX and they disagree on the single most important
  cell in the table.
- Learned at P01-T05-FIX: `api.supabase.com` answers **403 with a body of
  `error code: 1010`** to Python's default `urllib` User-Agent. That is a
  Cloudflare browser-signature block at the edge, not a Supabase refusal and not
  an   authentication failure: it carries no SQLSTATE, so it is not a result and
  the P01-T03 "never retry a 4xx" rule does not apply to it. Set any ordinary
  User-Agent header and it goes away. Node's `fetch`, which the isolation
  harness uses, sends one already, which is why this had not been hit before.
- Found at P01-GATE-RERUN, landed here at P01-T06-FIX: the Management API's
  `GET /v1/projects/<ref>/types/typescript` defaults to schema `public` **alone**,
  while the pinned CLI's `supabase gen types typescript` emits `public` and
  `graphql_public`. Ask the endpoint with
  `?included_schemas=public,graphql_public` or the two outputs differ by the
  whole `graphql_public` block, and a `types-drift` check that is in fact clean
  reports a difference nobody can fix by regenerating. The CLI is what `ci.yml`
  runs, so the CLI's schema set is the correct one and the endpoint is what has
  to be told.
- Found at P01-GATE-RERUN, landed here at P01-T06-FIX: `npm audit --json 2>&1`
  in PowerShell merges npm's stderr warning into the same stream as the JSON
  document, so the result fails to parse at character 0 and the error names the
  parser rather than npm. Redirect stderr away (`2>$null`) or capture stdout
  alone, then parse. The same applies to any npm command whose machine-readable
  output is consumed in this shell.
- Found at P01-GATE-RUN3, landed here at M-01: PowerShell strips the backticks a
  JavaScript template literal needs out of a `node -e` argument, because the
  backtick is PowerShell's own escape character. An independent probe therefore
  goes in a file and is invoked by path, never written on the command line —
  which is the same conclusion the `bash -c` entries above reach for a different
  reason.
- Found at P01-GATE-RUN3, landed here at M-01, a companion to the
  `Set-Content -Encoding UTF8` BOM entry above: the BOM it writes also makes
  `JSON.parse` reject the file at character 0, so a probe that reads back its own
  output strips a leading `\uFEFF` first. The better fix is not to write one —
  `[System.IO.File]::WriteAllText` with `UTF8Encoding $false`.
- Learned at M-01: PowerShell rejects a heredoc passed to `python -` exactly as it
  rejects one passed to `git commit`, and fails at parse time with "The '<'
  operator is reserved for future use" before Python is reached. A throwaway
  script goes in a file under `$env:TEMP` and is invoked by path. Related: an
  ad-hoc `python -c` one-liner is safe only while it contains no `<`, `>`, `(`,
  `)` or backtick.
- Learned at M-01: `shutil.rmtree` fails with `PermissionError: [WinError 5]` on a
  `.git` directory, because git marks its object files read-only and Windows
  refuses to unlink a read-only file. Pass an `onexc` handler that does
  `os.chmod(path, stat.S_IWRITE)` and retries. This bites any probe that builds a
  throwaway clone of the tree and then cleans it up, and it surfaces halfway
  through the run rather than at the start.
- Learned at P02-T04, the concrete case behind PR-30: **Cloudflare's WAF sits in
  front of the Supabase REST endpoint and inspects request *headers*, not just
  bodies and query strings.** A header value shaped like SQL injection —
  `' or 1=1--` and `'; drop table tenant;--` were the two that tripped it — is
  answered **403 with an HTML body** and never reaches PostgREST or Postgres. It
  arrives with no SQLSTATE and no JSON, so a harness that treats "no rows and no
  error code" as a clean null gets a false pass. Distinguish it by
  `content-type: text/html` on a 403. This is the same edge that produces the
  `error code: 1010` block recorded above, reached by a different signature.
  **It is not deterministic**: the same twelve values ran twice ten minutes
  apart and were blocked two, then one. Assert the total, count the blocked
  separately, and never fail a proof on which of the two a given value drew.
- Learned at P02-T04: PostgREST exposes request headers to SQL as
  `current_setting('request.headers', true)`, a **JSON text** that must be parsed
  and may be `NULL` or `''`. Header **names arrive lower-cased**, but match them
  case-insensitively anyway; a direct (non-PostgREST) connection has no such
  setting at all, so the `missing_ok` second argument is mandatory and absence
  must be a normal path, not an exception. Reading it does not make a function
  volatile: the value is fixed for the duration of a statement, which is exactly
  what `stable` promises, and `stable` is required for the planner to use the
  function inside an RLS policy.
- Learned at P02-T04: Node's `fetch` rejects a header value containing a NUL or
  other control character with a client-side `TypeError` before any request is
  sent. A malformed-input list intended to reach a server must exclude them, or
  the probe fails in the harness and never tests anything.
- Found at P02-T04, landed here at P02-T05: PowerShell strips the inner double
  quotes out of a single-quoted `rg` pattern argument, so the regex reaches
  ripgrep with a character class that was never written and the error names a
  class the author did not type. Same family as the `bash -c` and `node -e`
  entries above: a pattern containing quotes goes in a file and is passed with
  `-f`, or the quotes are escaped for PowerShell first.
- Learned at P02-T05, the same backtick trap as the `node -e` entry above but
  reached from the other side: a backtick inside a SQL comment written in a
  **JavaScript template literal** terminates the literal, and TypeScript reports
  `TS1005: ',' expected` at a line that looks syntactically fine. Prose inside a
  template literal names types in words — "of type char" — rather than quoting
  them in backticks.
- Learned at P02-T06, and it is the one measurement §11.0.1 does *not* warn
  about: **`has_function_privilege(role, oid, 'EXECUTE')` does not fold in a
  `NOINHERIT` membership.** `authenticator` is a `MEMBER` of `service_role`,
  `service_role` holds `EXECUTE` on both `vault` functions, and
  `has_function_privilege('authenticator', ...)` still answers **false** — which
  is correct and is the same answer reading `aclexplode(proacl)` gives, so the
  two agree and §11b.1's "direct EXECUTE" column can be taken from either. The
  trap is the opposite of the `pg_has_role` one: here the convenient function
  under-reports rather than over-reports, so it is safe for the *direct* question
  and useless for the reachable-by-`SET ROLE` one. That third measurement has to
  be built by hand — `pg_has_role(role, r, 'MEMBER')` joined against the ACL and
  against schema `USAGE` — and it is the only one that finds the `vault` path.
- Learned at P02-T05, two catalog typings that cost a full suite run each:
  `pg_policy.polcmd` is of type `"char"`, not `text`, so concatenating it has no
  unique operator and the query fails 42725 — cast it explicitly. And
  `pg_get_function_identity_arguments()` renders **parameter names as well as
  types** (`p_name text, p_slug text`), not the bare type list the name suggests;
  `proargnames` and `pronargs` are the columns for the name and arity questions.
