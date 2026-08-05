# SESSION CONTEXT
Updated: 2026-08-05 · By: Sonnet (standard) · Phase: P02
Last task: P02-T07 · Verdict: pending. A land task, no application code, no
migration, no schema change: OD-G17 (permitted locales and currencies), OD-G18
(provisioning is bounded, and the bound is policy) and OD-H12 (nine build
phases, three items pulled forward) signed, `DECISIONS.md` register 88 → **91**.
`BUILD_PHASES.md` gains P09 — launch and operations — and moves staging to
P03's entry and a rehearsed backup restore to P05's exit. `DEV_OS.md` §2 was
verified row by row against the live tree rather than rewritten from a
description: **five** of its six rows were false or materially stale, not the
four the task named, because migration discipline was false the same way as
the database row and had gone unnoticed. `SECURITY_MODEL.md` §9 gains P09 as
its named owner and three legal items; `SCOPE.md` §2 records Release 1 as a
pilot with a real brand. Two supplied figures in this file's own frozen
decisions ("twelve checks / sixteen cases") were checked against the artifact
and found already correct at fourteen and twenty-six, landed by P02-T06 itself
— reported rather than rewritten, per PR-33 run the other direction. Ledger:
CF-109 amended and stays open; two rows closed on the two new decisions; one
new row opened, and one further finding opened then closed in this task. Full
detail in the done-steps row below and in `docs/method/CARRY_FORWARDS.md`.

## Read these too
- `docs/method/PRECEDENTS.md` — binding rulings and environment quirks.
  MANDATORY every session.
- `docs/method/CARRY_FORWARDS.md` — the full carry-forward ledger. Open it
  when your task names a CF, when you land or amend rows, or at a gate.
- `DEVELOPMENT_JOURNAL.md` — append-only narrative history.

This file carries state and open ids only. Narrative belongs in the journal.
Keep it short: if a paragraph is growing here, it belongs elsewhere.

## Done steps

| Step | Task | Verdict | Commit |
|---|---|---|---|
| P-00 | Repo audit and setup | PASS | — |
| P-01 | Repo restructure, 23 stubs, banners, `.gitattributes` | PASS | — |
| P-01b | Decision register: 11 status changes, 6 rows added | PASS | — |
| P-01c | CF-38 closed; register corrected to 79 | PASS | — |
| P-02 | Extract `bb-stock-costs.html` (7,083 lines) | PASS | `1d4eafc` |
| P-03 | Extract `balance-bites-invoice-pro.html` (4,283 lines) | PASS | `7560dba` |
| P-04 | Extract 3 design tools (2,179 / 773 / 458) | PASS | `e1e3124`, `136c2b6` |
| P-04b | CF-39, CF-41, CF-14 redaction, CF-50 annotation | PASS | `d635fe4` |
| P-04c | CF-52 redactions, CF-53/54/56/58, ledger | PASS | `9bfead2`, `e6024bc` |
| P-04d | Memory guard restructure | pending | `e698b2a` |
| P-04e | Sync committed project instructions to split memory guard | pending | `fdc890e` |
| P-02-FIX | Gate 1: HF-1, CF-42, CF-63, AGENTS.md rewrite, ledger | pending | `a95cfb3` |
| P-05-PRE | Defer enforcement mechanism in rules files; land CF-73 to CF-75 | pending | `445d1c9` |
| P-05-LAND | Land PRODUCT_BRIEF, GLOSSARY, SCOPE; promote DECISIONS; archive VOCABULARY_DRAFT | PASS | `4f176a9` |
| P-06a-LAND | Land DOMAIN_MODEL (87 entities); repair 6 stale VOCABULARY_DRAFT refs in CLAUDE_PROJECT_INSTRUCTIONS.md | PASS | `6e98cf5` |
| P-06b-LAND | Land TENANCY_MODEL and SECURITY_MODEL; CF-31 closed, CF-77 opened and closed, CF-53 amended | PASS | `67fa868` |
| P-07-LAND | Land CALC_SPEC (25 rows, CS-01..CS-14 signed); CF-45/62/70 closed, CF-47 amended, CF-78/79 landed | PASS | `9079a2e` |
| P-08-PRE | Tasks 1-5 done: OD-H7 signed (80 ODs); Gate 3 checklist amended to blocking set; CS-15 signed; CF-33 DEV_OS.md annotation; CF-52 grep zero hits. Tasks 6-9 HALTED — CF-80/81/82 already exist, contradicting Task 6's stated premise | PASS | `986c21c` |
| P-08-PRE-FIX | Resume Tasks 6-9: CF-80/81/82 expanded and closed; CF-04/27 void; CF-33/52 closed; 11 owners reassigned; PR-16 to PR-19 | pending | `5fdc2a3` |
| G3-FIX | Gate 3 HARD FAIL closed: 15 missing Rounding lines in CALC_SPEC; module count 14→22 in the Gate 3 checklist; PR-20 ceremony budget | pending | `e6aebf4` |
| G3-CLOSE | Secret scanning, push protection, force-push block and Dependabot enabled and verified; CF-85 closed; PR-21; BRANCHING.md | pending | `2d05635` |
| P-09-LAND-FIX2 | Land ARCHITECTURE, ADR (11 entries), BUILD_PHASES; supersede the prepare runbook; docs-integrity workflow; CF-86, CF-87, CF-88; PR-22, PR-23; open phase/01-foundation | pending | `3918cf4` |
| P01-T01 | Entry checklist (CF-86 closed); Next.js App Router skeleton, locale shell, token stylesheet, message catalogs; ci.yml with 3 guards; CF-89 landed and closed | PASS | `085a862`, `23a6929`, `04a503b` |
| P01-T02 | Resumed after the two-project halt. ADR-012 signed: one Supabase environment, named production. DATA_MODEL and MODULE_SPEC landed; BRANCHING §3.1; ARCHITECTURE §7 rows. Platform tier applied — 6 tables + `role` enum, RLS on all, 16 policies, 3 helpers, 5 indexes, active-owner trigger. Three clients, generated types, `check-service-import` made real, `check-data-boundary` and `types-drift` landed. CF-90/91 closed; CF-92 to CF-98 opened | pending | `f29c0d9` |
| P01-T03 | Tenant-isolation proof. DATA_MODEL §3 and §5 rule 3 repaired; PR-25. Runnable suite at `__tests__/isolation/`, run against the live catalog and live policies: 21 assertions, 21 PASS, 0 FAIL, 0 LOST. Two synthetic tenants seeded and torn down, teardown verified by query at zero. CF-100/101/102 opened and closed; CF-103 to CF-106 opened as findings. `.nvmrc` and `engines` pinned to Node 24 | pending | `257e6a1` |
| P01-T04 | FIX for the four T03 findings, gate re-run in full. Five migrations: invite-then-accept with a restrictive self-only rule, member self-visibility, operator reach behind `has_live_consent_grant` and the logged `operator_read_activity_event` path with `payload` out of its return type, explicit EXECUTE on all six functions. DATA_MODEL §2/§3.3/§3.5/§3.6/§5 and SECURITY_MODEL §1 amended — §1 now has four guarantees. `@types/node` 20→24. REVIEWER_CHAT_INSTRUCTIONS landed. Suite re-run: 31 assertions, 31 PASS, 0 FAIL, 0 LOST, teardown verified at zero. Policy census diffed against f3bbf7b, every one of 18 attributed and covered. CF-96/104/105/106 closed, CF-53/95/103 amended, CF-107/108 landed closed, CF-109 landed open | pending | `740601e` |
| P01-GATE | Phase 01 exit verification, read-only but for four writes. 23 criteria re-derived against the committed tree and the live project: 17 PASS, 5 FAIL, 1 unprovable. Isolation re-run in full — 31 assertions, 31 PASS, 0 FAIL, 0 LOST, zero tenant rows before and after, all 18 policies reached by a firing assertion, all 24 table/operation cells covered. FAILs: MODULE_SPEC §1 tree vs actual; `check-enum-keys` and the HTML-injection lint rule missing with live targets; four `rolbypassrls` roles undocumented; 11 open rows with a passed owner; CF-95 and CF-98 open naming P01. CF-110 landed and closed; `check_migration_split.py` added to docs-integrity; four §2 environment quirks landed | FAIL | `057ae11` |
| P01-T05-FIX | FIX for the gate's five failures; the gate itself was not run. `check-enum-keys` written and wired into `guards` — 12 values across 4 enums, proven by five planted violations including Arabic and space-containing, each reverted. The HTML-injection rule configured as six AST selectors in the existing ESLint setup, proven by the gate's own probe — a route parameter into `dangerouslySetInnerHTML` — plus `innerHTML`/`outerHTML` in every syntactic form, 6 errors at exit 1, probe reverted, and zero hits on existing code. `MODULE_SPEC.md` §1 and §3 rule 4 follow the tree. `SECURITY_MODEL.md` §11 carries the bypass inventory, re-derived live and not copied, with the re-derivation rule. Twelve ledger owners retargeted, not eleven; CF-95 closed, CF-98 left open on unchanged advisories, CF-60 and CF-111 closed. `check_ledger.py` asserts owner reachability, proven on three positives and three negative controls. `BUILD_PHASES.md` §P01's A1 criterion made checkable. PR-26 and three quirks landed | pending | `e0c49f2`, `17d87e4` |
| P01-GATE-RERUN | Phase 01 exit verification, second run, read-only but for CF-98 and the ceremony. 25 criteria re-derived from the live catalog and the committed tree, citing no prior report: 22 PASS, 3 FAIL. None of the first run's five regressed and all five are genuinely closed. Isolation re-run in full — 31 assertions, 31 PASS, 0 FAIL, 0 LOST, zero tenant rows before and after by an independent query, 18 policies and 24 cells covered. 12 of 12 plant-and-revert probes caught, tree clean. Every live schema object traced to `DATA_MODEL.md`; `schema.sql` whitespace-normalised identical to the 12 migrations and the remote ledger matches them one for one; generated types byte-identical to live at 15,474 bytes. FAILs: §11's first standing re-derivation found six undocumented bypass mechanisms (three `security definer` functions outside `public`, three role paths into a bypass role) — hard, not waivable; four checks report success on an empty set, PR-21's shape; `MODULE_SPEC.md` §1 does not name the root `__tests__/`. CF-98 amended with its acceptance and with the finding that `postcss@8.5.25` and `sharp@0.35.3` are published, so the remedy is a resolution bump and not a wait | FAIL | `83ee2a3`, `9bfef5c` |
| P01-T06-FIX | FIX for the second gate's three failures; the gate itself was not run. `SECURITY_MODEL.md` §11 restructured into two tiers — §11a B2S-owned and individually justified, §11b platform-owned and required only to be enumerated with reachability and re-derived, since the ambiguity was the reviewer's. §11b populated from a live re-derivation that exceeded the gate's findings twice: `authenticator` reaches both `vault` functions by `SET ROLE service_role`, and the catalog holds ten `MEMBER` paths into a bypass role rather than four. Event triggers ruled — not a bypass, no API role holds `CREATE` on any schema and none is `security definer`, but a `supabase_admin` code-execution surface. `cli_login_postgres` investigated, nothing depends on it, password expired, revocation recommended and **not** performed. The `MEMBER`-versus-`USAGE` rule made mandatory in §11.0.1. Floors added to the four named checks and to a fifth this task found, `check_ledger`; all thirteen sandbox cases error, seven controls confirm detection intact and a legitimately-zero ledger green; PR-27 landed. `MODULE_SPEC.md` §1 names the root `__tests__/`; both staging casualties retired, sweep of 110 files landed CF-114 for three survivors; `DATA_MODEL.md` §3's enum count corrected to four and asserted against `schema.sql` by `check_stated_counts.py`. CF-98 closed on a transitive override — `npm audit` 3 high → 0, whole pipeline green. CF-112 and CF-113 landed open-then-closed; two parked environment quirks landed in PRECEDENTS §2 | pending | `36af031` |
| P01-GATE-RUN3 | Phase 01 exit verification, third run, read-only but for the ceremony. 27 criteria re-derived from the live catalog and the committed tree, citing no prior report: **26 PASS, 1 DOC CORRECTION, 0 HARD FAILURES → PASS**. `DATA_MODEL.md`'s amended criterion met in both halves — 132 live objects censused and every one traced to the document, nothing unspecified, and the document landed at `22b233f` four days ahead of the first migration at `f29c0d9`. Isolation re-run in full: 31 assertions, 31 PASS, 0 FAIL, 0 LOST, zero tenant rows and zero `auth.users` either side by an independent query, 18 policies and 24 of 24 cells covered. §11 re-derived by tier with all three reachability measurements — §11a clean, §11b matching including the two findings that exceeded the second gate. Helpers held against all six subversion vectors including a forged `request.jwt.claims`. 13 of 13 checks error on both a removed and an emptied target, each stating its PR-27 floor; `check_credentials` widens to the whole tree on an absent diff. 12 of 12 guards proven by plant-and-revert; `check-print-containment` and `check-zod-coverage` confirmed target-free by scan, owners P06 and P02. Privileged-client quarantine sole construction site, one secret read. Carry-forward audit: 35 open, 34 owner assignments reachable, 6 name a gate, 13 a phase, 15 neither and are reachable by judgement rather than mechanically. No open row's owner names P01. The correction is `MODULE_SPEC.md` §1's reverse direction. Four ids parked for the next task, none landed here | PASS | `056ee50`, `f061489`, `eda0f45` |
| M-01 | Method amendment, on `main` per the BRANCHING §3.2 it lands. OD-H8 to OD-H11 signed and authored in §3; register 80 → **84**, verified by count. Lifecycle gains READINESS and the OD-H11 sentence. CF-115 to CF-118 each opened then closed, per PR-24: `MODULE_SPEC.md` §1 carries OD-H10's scope statement with out-of-scope as the complement of `In scope:` and eight `deferred` markers making the forward direction assertable; `docs/ADRs/` deleted and README's row repointed; `DATA_MODEL.md` §1 names its three departures, rules 1-8 byte-identical; `check_ledger.py` and `check_done_steps_shape.py` fail in one line and the latter gains a floor. Two OD-H9 conformance checks landed and wired — `check_module_spec_tree.py` and `check_data_model_schema.py` — each proven on three planted violations reverted from an in-memory snapshot, 6 of 6 caught, every revert byte-identical. The two-way probe re-run over **fifteen** cases: 30 of 30 runs error, all with a `FAIL:` line, none with a traceback, plus three controls. Two findings the probe produced and a reading did not: the new tree check passed a root dropped from its own scope line, now fixed by asserting scope against the tree block both ways; and `check-service-import` passed an emptied quarantine, landed as CF-119 and closed. PR-28 landed; CF-114's `BUILD_PHASES.md` citations amended, row left open | pending | `116d983` |
| P02-T01 | P02 entry: land task on `main` per BRANCHING §3.2. Four signed decisions — OD-G13 to OD-G16 — appended to `DECISIONS.md` §2 Group G and authored in full in §3; register 84 → **88**, verified by count. `TENANCY_MODEL.md` §3 rule 1 amended to match OD-G15 — at least one active `Owner`, may have several — nothing else in §3 touched. Ledger reconciled per PR-24: CF-93 amended (gaps 1, 2, 5 and 7 found already closed and recorded so; gap 3 resolved at the decision level by OD-G14; gap 4 by OD-G15; gap 6 alone stays open, owner P03), CF-99 closed on the owner's merge at `eda0f45` with verified branch containment, CF-103 amended (remainder resolved at the decision level by OD-G14, implementation and proof still owed), CF-120 opened and closed in the same task, CF-121 opened (invitation-by-email resolved at the design level by OD-G16, implementation still owed). Ledger now 106 rows, 35 open. `check_stated_counts.py` gained a sixth check — `SESSION_CONTEXT.md` states the register total in the present tense exactly once and it must equal `DECISIONS.md` §2 — proven by a planted wrong figure reverted from an in-memory snapshot (PR-26) and by removed/emptied-target cases, taking the two-way empty-target set from fifteen cases to sixteen (PR-28). `SESSION_CONTEXT.md`:228 reworded to carry no bare total, closing CF-120. No application code, no migration, no schema change | pending | `917476f` |
| P02-T02 | P02 entry checklist cleared, on `main` per BRANCHING §3.2. Three staging survivors corrected in `BUILD_PHASES.md` (:33, :47, :51 — staging → production, B2S describing B2S); one in `ARCHITECTURE.md` (:118), :104/:105/:110-111/:142/:145 confirmed untouched; three in `DEV_OS_REFERENCE.md` (:95, :118, :205) annotated dated below each, byte-unchanged, per new precedent PR-29 (a record of another project is annotated, never corrected — BETK had staging, this file records BETK). CF-114 CLOSED. `check-no-runtime-cdn.mjs` and `check-no-hardcoded-literals.mjs` add `lib` to `ROOTS`: 4 files (`app`: 3, `proxy.ts`: 1) → 7 (`lib`: 3 more), floor raised 1 → 7 on both, no violation under `lib/`. CF-94 AMENDED, stays OPEN — `components/` and `features/` still owed. CF-122 — the class of defect, not the three instances: `SESSION_CONTEXT.md`'s open-ids section rewritten to bare `- CF-nn — owner: <owner>` (34 lines, id-for-id against the ledger's 34 open rows); the "Where we are" narrative (18 distinct ids enumerated before editing: CF-93, 99, 103, 104, 105, 106, 109, 114, 115-119, 120, 121, 54, 95, 98), `Frozen decisions in force` and `Next action` scrubbed of every closed-id restatement (CF-31, 55, 95, 98, 99, 104-106, 110, 114, 115-119, 120), leaving only open ids outside the done-steps table. `check_ledger.py` gained two assertions — the open-ids section's shape and id-set equality, and every carry-forward id outside the done-steps table must be OPEN (floor 1) — each proven by plant-and-revert from an in-memory snapshot, 8 of 8 cases caught (removed target, emptied target and a content violation for each), all reverts byte-identical, no traceback. Two-way (check, premise) set: sixteen → **eighteen** (PR-28, one case per assertion added). CF-122 OPENED then CLOSED in this task. Ledger: 107 rows, 34 open, reconciling id-for-id. All twelve checks green, each stating its floor. No application code, no migration, no schema change | pending | `12ffaa9` |
| P02-T02-FIX | FIX for CF-122's collision with `DEV_OS.md` §6. `SESSION_CONTEXT.md`'s "Where we are" section retired: 2 paragraphs enumerated over the whole section, not a sample (PR-23); both already recorded in `DEVELOPMENT_JOURNAL.md`'s own per-task entries (P01-T01 through P01-GATE-RUN3 at their individual dated lines, PR #2's merge and M-01 in the M-01 entry) with their real ids intact, so 0 lines were appended. The six de-identified references CF-123 names trace back to real ids by cross-reading this file's own done-steps table, which the de-identification never touched — all six resolvable, not "two...unresolvable without archaeology" as CF-123's text has it; reported as a finding, CF-123 landed unedited per PR-24. Header block and done-steps table now carry the file's whole orientation, unchanged. File: 423 → 296 lines before this row, 18 distinct ids corrected from a wrong 17 in the row above — `python` one-liner expanding `115-119` and counting the resulting set, result 18 (PR-15). `scripts/check_session_context_shape.py` landed as `docs-integrity`'s eighth check: the file's `## ` headings must be exactly the five that remain, floor 5. Proven by four plant-and-revert cases from an in-memory snapshot, never `git checkout --` (PR-26) — added heading, removed heading, removed target, emptied target — 4 of 4 caught, 0 tracebacks, every revert byte-identical, confirmed by `git diff --stat` after. Two-way (check, premise) set: eighteen → **nineteen** (PR-28, one case for the new check). CF-123 and CF-124 opened and closed in this task. Ledger: 109 rows, 34 open, reconciling id-for-id. All thirteen checks green — eight `docs-integrity`, five `guards` — each stating its floor. No application code, no migration, no schema change; tenant isolation N/A, this task touches no data path | pending | `4f2a9b5` |
| P02-T03 | P02 entry preconditions, established by query and by running, never by reading a document that claims it. On `main` per BRANCHING §3.2 — an entry gate is not phase work and opens no phase branch. ADR-012's condition measured against `b2s-production` before anything else ran, through the Management API rather than the suite's own path: `select count(*) from public.tenant` returned `[{"count":0}]` and `select count(*) from auth.users` returned `[{"count":0}]`. Suite size then established from the file rather than from a prior gate report — 31 `record()` call sites, 31 distinct, zero duplicates, set-equal to `harness.ts`'s `EXPECTED_ASSERTIONS` with nothing declared-but-unrecorded and nothing recorded-but-undeclared. Suite run in full: **31 expected — 31 PASS, 0 FAIL, 0 LOST**, 18 live policies enumerated across 6 tables, ledger line D reporting all eleven teardown counters at zero, 190s. vitest's own line reads 32 passed, 0 failed, 0 skipped — one more than the ledger, reconciled from the file and not waved through: 32 `it()` blocks, 31 recording a verdict and the thirty-second the completeness guard at :1903 that asserts no proof exited without one and by design records nothing itself. The two counts re-queried afterwards by the same independent path: `public.tenant` → `[{"count":0}]`, `auth.users` → `[{"count":0}]`. Four results, all zero, so no synthetic row survived the run and no HARD FAILURE arises. CF-92 and CF-109 re-verified live and deliberately left unamended, both owned elsewhere. CF-125 opened and closed. Ledger: 110 rows, 34 open, reconciling id-for-id. All thirteen checks green, each stating its floor. No application code, no migration, no schema change, no row created or left behind | pending | `a4bb442` |
| P02-T04 | Session-to-membership resolution under OD-G14. First P02 build task, on `phase/02-tenancy-and-access` off `main` at `97b5009` per BRANCHING §2; no PR, §3 puts one at the phase exit. ADR-012's condition measured first and again after each of the two suite runs, by a path the suite does not use: `select count(*) from public.tenant` → `[{"count":0}]` and `select count(*) from auth.users` → `[{"count":0}]`, corroborated by PostgREST `Content-Range: */0` and GoTrue admin `total=0`. **Transport: the request header `x-b2s-tenant`**, read inside the function from PostgREST's `request.headers` setting. Chosen against the two alternatives OD-G14 forecloses — not a JWT claim, not a stored per-person column — and against `set_config`, which no PostgREST caller can reach per request. Forgery is inert by construction: the header selects from the caller's own active memberships and can only narrow that set, never extend it, so a forged value reaches at most a tenant the caller already holds and otherwise resolves null; proven by 23o, where anon, an unaffiliated member and an operator each forge all three tenants and reach nothing. `stable` is retained and is correct — `request.headers` is fixed for the statement, which is exactly what `stable` promises, and `volatile` would forbid the function inside an RLS policy. Migration 13, `20260805120001_session_tenant_selector`, replaces the function body only: no table, no enum, no policy, no grant changed, and the six-row contract of `DATA_MODEL.md` §2.1 is implemented literally, uuid parsed without raising and `status = 'active' and archived_at is null` unchanged. `check_migration_split.py` reconciles 13 migrations to `schema.sql`, 831 non-blank lines identical on both sides. `types/database.ts` regenerated by the CLI — **unchanged**, byte-identical, the function's signature having not moved. `DATA_MODEL.md` §2.1 carries the contract as the table itself rather than prose approximating it; §3.3's two stale paragraphs amended; no helper added so §2's "Four helper functions" is untouched, and `check_stated_counts.py` and `check_data_model_schema.py` are green. Proof: 15 new assertions, 23a–23o, each seeded through the privileged path and each asserting reads as well as the resolved id, covering all six contract rows plus five the prompt did not ask for — a suspended selection (23n), an empty and whitespace selector (23l), header- and value-case with a near-miss header name (23m), and forgery by three unentitled callers (23o). All landed permanently per OD-H11. **46 expected — 46 PASS, 0 FAIL, 0 LOST**, ledger line D reporting all eleven teardown counters at zero, 374s; vitest reads 47, one more than the ledger, the completeness guard as reconciled at P02-T03. All 31 prior assertions pass unchanged and none was weakened; proof 17 keeps its assertion and only its evidence prose moved. New precedent PR-30 — a negative result is evidence only if the request reached the thing under test — with the Cloudflare WAF header block, PostgREST's `request.headers` contract and Node's control-character header rejection landed as quirks. CF-93 amended, gap 3 closed, row stays open for gap 6; CF-103 CLOSED. Ledger: 110 rows, 33 open | pending | `a342756` |
| P02-T05 | Member materialisation and Tenant provisioning — OD-G13's two acts, which the schema specified and no live caller could reach. On `phase/02-tenancy-and-access` from `f68c714`; no PR, §3 puts one at the phase exit. ADR-012's condition measured before anything ran and again after each suite run, by a path the suite does not use: `select count(*) from public.tenant` → `[{"count":0}]` and `select count(*) from auth.users` → `[{"count":0}]`, four results, all zero. Migration 14, `20260805120002_member_materialisation_and_tenant_provisioning`, adds two functions and one trigger and touches no table, enum, policy or existing grant. **Act one is a trigger, not an RPC** — `member_materialisation`, `after insert on auth.users for each row`, calling `materialise_member()`: the id and the address are read out of the row `auth` itself wrote, so there is no argument to forge, and a refusal aborts the auth transaction so the second identity is never created either. `EXECUTE` granted to **nobody**, a trigger function's privilege being checked at creation and never at firing. **Act two is one function, therefore one transaction** — `provision_tenant(text,text,text,text)`, `security definer`, `EXECUTE` to `authenticated` alone, revoked from `public`, `anon` and `service_role` per CF-105's standing obligation. Chosen over the ADR-005 `service_role` client for atomicity and not taste: PostgREST gives each request its own transaction, so three round trips cannot be one act and a failure after the tenant insert would leave a tenant with no owner that the deferred `membership_active_owner_required` would never catch, firing as it does at the commit of a transaction that had already succeeded. It has no member parameter, so the caller is the owner by construction. `check_migration_split.py` reconciles **14** migrations, 1086 non-blank lines identical both ways. `types/database.ts` regenerated by the CLI — **changed**, +9 lines, `provision_tenant`'s `Args`/`Returns` added; `materialise_member` is absent because it returns `trigger`, which the generator does not emit. No hand edit. `DATA_MODEL.md` §3.1, §3.2, §3.3 and §3.6 each record the write path that now exists instead of its absence. **Neither total moved, which is the answer to Task 5's question:** no table and no enum was added, so §3's totals hold; and neither new function is a policy predicate, so §2's "Four helper functions" and its four-row table hold too — `check_data_model_schema.py` green both ways, `check_stated_counts.py` green. Proof: 10 new assertions, **46 → 56**, all 46 retained. `56 expected — 56 PASS, 0 FAIL, 0 LOST`, 534s, line D reporting all **thirteen** teardown counters at zero; vitest reads 57, one more than the ledger, the completeness guard as reconciled at P02-T03. 24a-24c materialisation: a fresh `Member` resolves null and reads exactly one row across the six tables, their own, by `member_select_self`; a held address refused on the two routes `users_email_partial_key` does not cover — it is partial on `is_sso_user = false` — with 0 member and 0 `auth.users` rows left for the refused id and the row already held byte-identical as jsonb; and 12 refusals across 4 callers × 3 payload shapes, all on the grant and none on a unique key. 25a-25f provisioning: three rows counted by query and shown to be each other's; **atomicity proven by forcing a failure**, a fault trigger in its own schema gated on one member, injected after the tenant insert and again after tenant + membership, 0 tenants by creator, 0 by slug, 0 memberships and 0 events after each, with the same caller unimpeded writing 1/1/1 as the control; no owner parameter in the catalog and 6 spellings of one rejected; two calls issued together yielding distinct tenants; those two isolated from each other across all six tables both ways; and nothing in the catalog calling the function — 0 triggers, 0 defaults, 0 policy expressions, no other body. 26 closes CF-128 twice over per PR-30: 6 duplicate-header pairs over HTTP by a caller holding exactly one membership, each 200/null, which distinguishes "the selector arrived and did not match" from "the transport dropped it" because that same caller resolves tenant A with no header and with one; plus 4 forged `request.headers` shapes in process. **One pre-existing expectation moved** — proof 7's exact set for `member`, from none to the operator's own id, materialisation being unconditional — landed as a ledger row rather than a report paragraph; the claim is unchanged, the set is still exact, no policy was altered. Harness: `rawHeaders`/`selectingTwice` so the same header can be sent twice, `seed` adopting materialised rows by `on conflict (id)`, and fault-schema teardown with two counters of its own. PR-31 and PR-32 landed verbatim; three quirks landed — P02-T04's PowerShell `rg` quoting, a backtick in a SQL comment inside a template literal, and two catalog typings that each cost a suite run. CF-127, CF-128 and CF-131 opened-or-named and closed; CF-126, CF-129 and CF-130 landed open. **33 open at `f68c714` + 3 landed open − 0 previously-open closed = 36 open**, ledger 110 → 116 rows, reconciling id-for-id. All thirteen checks green, each stating its floor | pending | `87b1b8b` |
| P02-T06 | §11's bypass inventory re-derived and made self-asserting. On `phase/02-tenancy-and-access` from `2be3ee6` per PR-32; no PR, §3 puts one at the phase exit. ADR-012's condition measured before anything ran and again after the suite, by a path the suite does not use: `select count(*) from public.tenant` → `[{"count":0}]` and `select count(*) from auth.users` → `[{"count":0}]`, four results, all zero. **§11a re-derived from `schema.sql`, not from the section**: 9 `create ... function public.*` statements resolving to **8 distinct identities** — `current_tenant_id()` is created at :202 and replaced at :877 by migration 13, one identity — every one `security definer`, every one owned by `postgres`, every one `search_path` pinned to `''`, and 0 with the statements disagreeing on either. The live catalog agrees exactly and puts the whole-catalog total at **11**, not the nine §11a.1 claimed. §11a.1 therefore states eight and eleven, and carries eight rows: `materialise_member()` justified on `member` having no INSERT policy and `supabase_auth_admin` no INSERT privilege, so no non-definer path could materialise; `provision_tenant` on `tenant` having no INSERT policy and `membership_insert_owner` refusing a caller who cannot yet own a tenant that does not exist. The grant paragraph's "each…granted explicitly" corrected to the measured split — **six granted to `authenticated`, two trigger functions granted to nobody**, which assertion 22 independently enumerates ACL by ACL. `provision_tenant`'s containment written in P02-T04's can/cannot shape: it can create unboundedly (CF-129), squat slugs (CF-129) and pass unvalidated currency and locale (CF-130); it cannot name another owner, run unauthenticated, run without a live `member` row, touch a row other than the three it writes, or carry the definer context past its own return. §11a.3 records what the grant moves — `service_role` is still the only *role* a request bypasses RLS as, and no longer the only API-reachable way past a policy. **§11b re-measured against the live catalog with `pg_has_role(role, target, 'MEMBER')`, never `'USAGE'`** (§11.0.1): 3 functions outside `public` with identical owners, pins, three-way reachability and `EXECUTE` holder sets, `authenticator` reaching both `vault` functions by `SET ROLE service_role` and nothing else; 5 `rolbypassrls` roles out of 16 non-`pg_`; **the same ten `MEMBER` paths**, six grants and four superuser-implicit; ten `anon`/`authenticated` cells, all false; 6 event triggers, none `security definer`; 0 schemas carrying `CREATE` for any of the three API roles, across 25. **No platform object appeared that §11b does not list.** One §11b value moved and is CF-133. `scripts/check_security_model_bypass.py` landed as `docs-integrity`'s **ninth** step, asserting §11a.1 against `schema.sql` both ways — stated total, table rows and schema set all three equal, every function with a row and every row with a function — plus the catalog total against its two tiers and §11b.1's back-reference against §11a.1. Run against the **unedited** document it names both missing functions and calls the document the short side, which is the answer to whether it would have caught P02-T05: it would. Proven on **eleven** plant-and-revert cases from an in-memory snapshot, never `git checkout --` (PR-26) — seven content violations, one per assertion, and both scan targets removed and emptied — 11 of 11 caught, 0 tracebacks, every failure a one-line `FAIL:` naming the short side, all 11 reverts byte-identical. Two-way (check, premise) set: nineteen → **twenty-six** (PR-28, one case per assertion; 19 + 7 = 26). Suite re-run in full: **56 expected — 56 PASS, 0 FAIL, 0 LOST**, 336s, line D reporting all thirteen teardown counters at zero; vitest reads 57, the completeness guard as reconciled at P02-T03. No assertion added, none weakened, none lost. PR-33 landed and one quirk. CF-132 opened and CLOSED, with one figure corrected against the artifact before landing and the original recorded; CF-133 landed open. **36 open at `2be3ee6` + 1 landed open − 0 previously-open closed = 37 open**, ledger 116 → 118 rows, reconciling id-for-id. All **fourteen** checks green. No application code, no migration, no schema change, no row created or left behind | pending | `2318d97` |
| P02-T07 | Land task — OD-G17, OD-G18, OD-H12 and the plan amendment. On `phase/02-tenancy-and-access` from `022cabe`; no PR, §3 puts one at the phase exit; per PR-32/PR-34, method arising from open-branch work (OD-H12's own rows CF-129 and CF-130 exist only here) lands on the branch rather than `main`. `DECISIONS.md` §2 gains G17, G18 after G16 and H12 after H11; §3 gains three full entries; register 88 → **91**, verified by count (91 OD table rows). `BUILD_PHASES.md`: "Eight phases" → "Nine"; **P09 — Launch and operations** added after P08 in the existing shape, terminal on `SECURITY_MODEL.md` §9's pre-launch audit; P03 gains an entry line (staging and error visibility before the wizard accepts content, citing CF-109 and OD-H12); P05 gains an exit line (a backup taken and a restore rehearsed against it, citing OD-G8 and OD-H12); R1 recorded as a pilot with a real brand. `DEV_OS.md` §2 verified row by row against the live tree, not rewritten from memory: **five** of six rows were false or materially stale, not the four named — no database (14 migrations live since P01-T02), no migration discipline (same evidence, a fifth finding this task's own), hand-authored types (CLI-generated, `types-drift` wired), no privileged client (`lib/supabase/server-only/service.ts`, ADR-005), and "Auth gates, verified-phone, OAuth — out of scope for MVP" (OAuth is signed in scope by OD-G13; verified-phone alone remains out) — each corrected in place with what delivered it; the zod row restated for precision, not contradicted; §3's VOID banner and `DEV_OS_REFERENCE.md` untouched (PR-29). `SECURITY_MODEL.md` §9 gains P09 as named owner plus three items — Terms of Service, Privacy Policy, a data processing agreement template — the eight existing items unchanged. `SCOPE.md` §2 records Release 1's pilot posture beside the SIGNED line; module set and release assignments untouched. Task 7's two supplied figures ("twelve checks / sixteen cases") did **not** match the artifact: recomputed from `docs-integrity.yml` (`(Select-String -Pattern 'run: python3 scripts/').Count` → 9) and `ci.yml` (5 guard steps) against the bullet already landed at P02-T06, both already read fourteen and twenty-six and needed no correction — reported per PR-33/PR-18 rather than rewritten to match a premise the tree contradicts. `PRECEDENTS.md` gains PR-34, appended after PR-33. Ledger: CF-109 AMENDED, stays open, landing point P03's entry, owner now the P03 entry checklist; CF-129 CLOSED on OD-G18 (numbers are policy hardcoded to the free plan, implementation and the concurrency proof owed by the P02 build task amending `provision_tenant`, slug squatting unsolved); CF-130 CLOSED on OD-G17 (enforcement is in the data layer, implementation owed by the same task); CF-134 opened (the owner's paid-tier product direction, owner the Release 3 subscriptions and billing work); CF-135 opened then CLOSED in this task, one figure corrected against the artifact before landing (PR-33) — `DEV_OS.md` §2 in fact stated **five** things false, not the supplied four, the fifth being migration discipline, original wording recorded per PR-07. **37 open at `022cabe` + 1 landed open (CF-134) − 2 previously-open closed (CF-129, CF-130) = 36 open**, ledger 118 → 120 rows, reconciling id-for-id. All fourteen checks green. No application code, no migration, no schema change; tenant isolation N/A, stated explicitly — this task touches no data-access path | pending | pending |

> Commit column: one or more comma-separated backticked shas, or `—` where no
> single commit tracks the step (P-00 through P-01c predate the one-task-one-commit
> convention). Several shas mean the step's deliverable, its PR-17 follow-up and,
> where the owner has merged it, the merge commit. The most recent row may read
> `pending` until its follow-up commit fills it (PR-17); `check_done_steps_shape.py`
> exempts the last row for exactly that reason.

## Open carry-forwards — ids only
Full text in `docs/method/CARRY_FORWARDS.md`.

- CF-01 — owner: the P02 entry checklist, reinstating the deferred rule layer subject by subject as each arrives, rather than in one pass
- CF-02 — owner: FEATURE_INVENTORY.md must-not-reproduce at P-07
- CF-03 — owner: FEATURE_INVENTORY.md must-not-reproduce at P-07
- CF-05 — owner: PRINT_CONTRACT.md, authored just-in-time per OD-H7; the measurement is B2S_PREPARE_PHASE.md Step 15
- CF-11 — owner: the REPORT.md annotation task at P02, batched with CF-72 per PR-20
- CF-14 — owner: RISK_REGISTER.md, authored just-in-time per OD-H7; its gate is the pre-relaunch audit, B2S_PREPARE_PHASE.md §10
- CF-22 — owner: reviewer, verify closure against EXTRACT_DESIGN_TOOLS.md Part 2 at the TEMPLATE_MODEL.md authoring
- CF-32 — owner: IMPORT_SPEC.md, P-10
- CF-39 — owner: the next write task that touches B2S_PREPARE_PHASE.md, which is the P08 pre-relaunch audit, batched there per PR-20
- CF-41 — owner: the write task that lands CF-39, P-12
- CF-44 — owner: none, void, retained as a numbering record; exempt from the reachable-owner test by its VOID status
- CF-46 — owner: the FEATURE_INVENTORY.md authoring, P08
- CF-47 — owner: the R2 amendment to CALC_SPEC.md, one step ahead of the Costing module
- CF-50 — owner: the AUDIT_STICKER.md annotation task at P08, batched with CF-56 per PR-20
- CF-51 — owner: reviewer, standing, applied from P-04b onward
- CF-53 — owner: reviewer, decide at P-12 whether the record is re-authored or the stub stands
- CF-54 — owner: the P08 pre-relaunch audit, batched with CF-39 per PR-20
- CF-56 — owner: P08, the same task as CF-50
- CF-58 — owner: owner decision, retire or keep, landing at the next repo-maintenance task
- CF-69 — owner: FEATURE_INVENTORY.md must-not-reproduce
- CF-71 — owner: FEATURE_INVENTORY.md must-not-reproduce
- CF-72 — owner: the REPORT.md annotation task at P02, batched with CF-11 per PR-20
- CF-73 — owner: FEATURE_INVENTORY.md must-not-reproduce, and UX_PRINCIPLES.md as the worked justification for the no-literals rule
- CF-74 — owner: UX_PRINCIPLES.md
- CF-75 — owner: the P02 entry checklist, both always-on rules files restored in one pass
- CF-83 — owner: PRECEDENTS.md, PR-18
- CF-84 — owner: PRECEDENTS.md, PR-19
- CF-92 — owner: the task that onboards the first non-synthetic tenant, and the Phase 02 exit gate, which must assert the row count rather than assume it
- CF-93 — owner: P03, at its entry checklist, being the first phase that creates new tables under the rule
- CF-94 — owner: the task that creates components/, for that root; the task that creates features/, for that root
- CF-97 — owner: reviewer, to ratify the narrowing or reject it
- CF-109 — owner: the P03 entry checklist, per OD-H12
- CF-121 — owner: the P02 task that writes the invitation flow, closing on the DATA_MODEL.md §3 amendment landing with its migration
- CF-126 — owner: the task that first subscribes to Realtime, and the P02 exit gate, which re-derives it
- CF-133 — owner: the owner, on SECURITY_MODEL.md §11b.4's standing recommendation, and the P02 exit gate, which re-derives §11b and re-reads this column
- CF-134 — owner: the Release 3 subscriptions and billing work

## Frozen decisions in force
- Freeze point 2026-07-29 (`legacy/FREEZE.md`) — tools RETIRING, not port
  targets.
- Decision register: now authoritative at `docs/product/DECISIONS.md`,
  promoted P-05-LAND from `docs/method/B2S_PREPARE_PHASE.md` §2, which is
  annotated PROMOTED and retained as the signing record. §5 Release 1 SIGNED
  2026-07-30. The current total lives at `DECISIONS.md` §2, not restated here,
  and `check_stated_counts.py` asserts the two agree.
- Reviewer direct repo read SIGNED 2026-07-31 — PR-09.
- Memory guard restructure SIGNED 2026-07-31 — this file.
- `PRODUCT_BRIEF.md`, `GLOSSARY.md`, `SCOPE.md` AUTHORED 2026-08-01 —
  P-05-LAND. `VOCABULARY_DRAFT.md` archived, superseded by `GLOSSARY.md`.
- `TENANCY_MODEL.md` and `SECURITY_MODEL.md` AUTHORED 2026-08-01 — P-06b-LAND.
- `CALC_SPEC.md` AUTHORED 2026-08-01 — P-07-LAND. Calculation choices CS-01
  through CS-15 SIGNED 2026-08-01 by the owner (CS-15 signed separately by
  P-08-PRE, 2026-08-01).
- OD-H7 SIGNED 2026-08-01 — P-08-PRE. Gate 3 verifies the blocking set only
  (`PRODUCT_BRIEF`, `GLOSSARY`, `SCOPE`, `DECISIONS`, `DOMAIN_MODEL`,
  `TENANCY_MODEL`, `SECURITY_MODEL`, `CALC_SPEC`); the other thirteen frozen
  documents are just-in-time, each carrying its Gate 3 item to its own module
  gate. `CALC_SPEC.md`'s Gate 3 item covers its 25 Release 1 rows only.
  `DECISIONS.md` now carries **91** signed ODs, verified by count — 80 promoted
  plus OD-H7, OD-H8 to OD-H11 signed 2026-08-04 at M-01, OD-G13 to OD-G16
  signed 2026-08-04 at P02-T01, and OD-G17, OD-G18, OD-H12 signed 2026-08-05
  at P02-T07.
- PR-16 through PR-19 landed 2026-08-01. PR-18 and PR-19 exist because the
  reviewer's own state assertion went stale between verdict and execution.
- PR-20 landed 2026-08-01. Document hygiene batches into the next task touching
  the file and never earns its own round trip.
- Repository protections enabled 2026-08-01 (G3-CLOSE). Public, no required
  reviews, no PR gate; secret scanning, push protection, force-push block and
  deletion block on. Gate 3 item 11 evidence.
- `docs/method/BRANCHING.md` IN FORCE. One branch per phase, exit gate on the
  branch, one consolidated PR per phase, deletion only on verified containment.
- ADR-001 to ADR-011 SIGNED 2026-08-01. Append-only; superseded, never edited.
- ADR-012 SIGNED 2026-08-02 — P01-T02. **One** Supabase project, named for
  production: types generated from it, migrations applied to it, the isolation
  suite run against it. Supersedes ADR-006's two-environment clause only; the rest
  of ADR-006 stands. The organisation's plan allows two active projects and both
  slots were held, so the choice was one project or none. Reinstatement is
  CF-92 and its trigger is a row count, not a judgement.
- `ARCHITECTURE.md` precedence slot 11, `BUILD_PHASES.md` slot 13.
  `B2S_PREPARE_PHASE.md` is superseded as a plan; its §9 and §10 remain in force.
- PR-25 landed 2026-08-03 — P01-T03. Raising the version of a package already
  present, to close a published advisory, is maintenance and not a new
  dependency. It needs a task and a green pipeline, not an OD. This unblocked
  the four transitive advisories closed at P01-T06-FIX.
- **Tenant isolation PROVEN 2026-08-03 — P01-T03**, against `b2s-production`'s
  live catalog and live policies, at the commit that lands the suite. 21
  assertions, 21 PASS. **Re-proven at P01-T04 after the four findings were
  closed: 31 assertions, 31 PASS, 0 FAIL, 0 LOST**, no prior assertion weakened
  and three restated to measure the property rather than a proxy for it (17, 18c,
  19). Re-run with `npm run test:isolation`; it is excluded from
  `npm test` because `ci.yml`'s `unit` job holds no Supabase secrets and a suite
  that skipped there would read as green. `SECURITY_MODEL.md` §4's re-run
  conditions apply: a new entity, any policy or grant change, a new privileged
  path, a role change, or any change to the operator surface re-runs the whole
  gate. **Re-proven a third time at P01-GATE, independently: 31 PASS, 0 FAIL,
  0 LOST, zero tenant rows before and after.**
- ADR-006's "verbatim" DEFINED 2026-08-03 — P01-GATE. A migration split
  is verbatim when the concatenation of `supabase/migrations/*.sql` in filename
  order is **whitespace-normalised identical** to `supabase/schema.sql` from its
  first marker: blank lines and trailing whitespace differ freely, any changed
  statement fails. `scripts/check_migration_split.py` asserts it on every push,
  so the standard is mechanical rather than a matter of which task last measured
  it.
- **The RLS-bypass inventory is a standing check as of 2026-08-03 —
  P01-T05-FIX.** `SECURITY_MODEL.md` §11 enumerates every mechanism that can
  bypass row-level security: the five `rolbypassrls` roles with their `SET ROLE`
  reachability, every `security definer` function with its pinned `search_path`,
  table ownership and its `FORCE` state, and `service_role` with
  ADR-005's quarantine. **It is re-derived from the live catalog at every phase
  exit gate, and a mechanism that appears in the derivation but not in the
  document is a hard failure of that gate.** Not waivable by OD, on §1's ground.
  The counts are not restated here: they moved at P02-T06 and
  `check_security_model_bypass.py` now asserts §11a.1's against `schema.sql`
  both ways on every push.
- **§11 is TWO TIERS as of 2026-08-04 — P01-T06-FIX.** §11a is B2S-owned: the
  `public` functions, the `public` tables and the privileged key, each
  individually justified, and an object there the project did not deliberately
  create is a hard failure. **§11b is platform-owned and its requirement is
  enumeration and change detection, not justification** — owner, schema and
  measured reachability for each, an unchanged platform object is a pass and an
  unlisted one is a failure. The six categories to enumerate and the
  tier-differentiated verdict are stated in §11.5, which keeps its number.
  §11.0.1 makes the `MEMBER`-versus-`USAGE` measurement **mandatory**, and adds
  that a function is measured three ways — schema `USAGE`, direct `EXECUTE`, and
  reachable-by-`SET ROLE` — because the third found a path the first two called
  unreachable.
- PR-27 landed 2026-08-04 — P01-T06-FIX. A check states the minimum it expected
  to examine and fails when it examined less. `OK: 0 file(s) scanned` at exit 0
  is PR-21's shape produced by the check itself.
- **Dependency override policy IN FORCE 2026-08-04 — P01-T06-FIX**, under
  PR-25. `postcss` 8.4.31 →
  8.5.25 and `sharp` 0.34.5 → 0.35.3 as `overrides` in `package.json`, because
  `next@16.2.12` is the latest release and pins both. `npm audit` 3 high → 0;
  install, lint, typecheck, unit, all five guards and build green. Remove each
  override when an upstream Next.js release consumes it.
- PR-26 landed 2026-08-03 — P01-T05-FIX. A plant-and-revert probe restores from
  its own in-memory snapshot, never with `git checkout --`, which discards the
  session's uncommitted work in the same file. Learned by doing it.
- **OD-H8 to OD-H11 SIGNED 2026-08-04 — M-01.** A STANDARD-class **readiness**
  task precedes every heavyweight exit gate and the gate does not run until it is
  green (H8). A reviewer-authored specification lands with the conformance check
  that asserts it against reality, or it does not land (H9). `MODULE_SPEC.md` §1
  is the **application** tree and says so; repository-root configuration and
  infrastructure directories are outside its scope (H10). Every probe a gate
  invents becomes a permanent CI check or suite assertion in the fix task that
  follows (H11). `BUILD_PHASES.md`'s lifecycle is now ENTRY → TASKS → READINESS →
  EXIT VERIFICATION → SIGN-OFF → HANDOFF.
- **`BRANCHING.md` §3.2 SIGNED 2026-08-04 — M-01.** A change to the method — a
  decision, a precedent, a lifecycle, a conformance check — is not phase work and
  lands on `main` directly. §3's one-branch-one-PR rule governs work that builds
  the product.
- PR-28 landed 2026-08-04 — M-01. A gate's probe outlives the gate: one that
  finds something is landed as a permanent check by the fix task that follows,
  and one that finds nothing is landed too, because a probe that passes today is
  the one that catches tomorrow's regression.
- **The static conformance set is nine `docs-integrity` checks and five
  `guards`, fourteen in total, as of 2026-08-05 — P02-T06.** The two-way
  empty-target probe covers **twenty-six** (check, premise) cases, up from
  nineteen, because `check_security_model_bypass.py` joins it with seven
  assertions — proven on eleven plant-and-revert cases, 11 of 11 caught, every
  revert byte-identical to an in-memory snapshot per PR-26. A new check adds a
  case per assertion, per PR-28. Live-catalog conformance belongs to the
  readiness task (OD-H8) and to §11.5's re-derivation at each phase exit gate,
  and neither is implemented as a script.
- **OD-G17, OD-G18 and OD-H12 SIGNED 2026-08-05 — P02-T07.** `default_locale` is
  constrained to `en`/`ar` and `base_currency` to `EGP`/`USD`/`SAR`/`AED`/`EUR`,
  enforced by the database and not by the wizard (G17). A `Member` may own at
  most three active `Tenant`s and perform at most three provisioning acts per
  rolling 24 hours, both policy values hardcoded to the free plan in Release 1
  (G18). Neither is implemented yet — both are owed by the P02 build task that
  amends `provision_tenant`. **`BUILD_PHASES.md` is now nine phases (H12)**: P09
  — launch and operations — is added, terminal on the pre-launch audit;
  staging and error visibility move to P03's entry and a rehearsed backup
  restore moves to P05's exit, because Release 1 is a pilot with a real brand,
  recorded so in `SCOPE.md` §2. `SECURITY_MODEL.md` §9 is now owned by P09 and
  gains three items: Terms of Service, Privacy Policy and a data processing
  agreement template. PR-34 landed — while a phase branch is open, a method
  change touching the ledger or the state file lands on that branch, whatever
  its origin.
- **`DEV_OS.md` §2 corrected 2026-08-05 — P02-T07.** Its table described a
  client-side port with no server, no database and no auth until a Phase 10
  this project's real phase plan does not contain. Verified row by row against
  the live tree: the database, the migrations, the generated types and the
  privileged-client quarantine are each already delivered by P01, and
  authentication scope is partly superseded by OD-G13's signed OAuth mechanism.
  Corrected in place; `DEV_OS_REFERENCE.md` and §3's VOID banner untouched
  (PR-29).

## Next action
**The next P02 build task, on `phase/02-tenancy-and-access`** — the branch is
open and carries P02-T04, P02-T05, P02-T06 and P02-T07. Do not branch from
`main` again and do not open a pull request; `BRANCHING.md` §3 puts one
consolidated PR at the phase exit, after the gate has run on the branch.

Both of OD-G13's acts now exist in the database, so the invitation flow CF-121
owns is the remaining tenancy write path, and it can assume a `Member` exists for
any address that has authenticated. What is deliberately absent and must not be
assumed: **no UI, route, form or client calls `provision_tenant()` or sets the
`x-b2s-tenant` header** — only the isolation harness does — **nothing persists a
member's last selection**, which OD-G14 forecloses at the storage level, and
**nothing yet enforces the two bounds P02-T07 signed**: OD-G18's three-tenant,
three-provisioning-acts-per-24h caps (with the advisory-lock or partial-unique-
index concurrency proof it names), and OD-G17's `default_locale`/`base_currency`
constraint. Both are owed by the P02 build task that amends `provision_tenant`,
which is the next one due. A sign-up surface is the natural owner of the
sign-in-side error contract for a refused materialisation: the trigger aborts the
auth transaction and no document says what the person is shown.

One owner decision is waiting and does not block P02: `cli_login_postgres`,
§11b.4. Revocation was recommended at P01-T06-FIX and deliberately not
performed. Nothing depends on it — re-measured at zero on every count at
P02-T06 — and the CLI re-provisions one on the next link, so a reappearance is
expected rather than a regression. **What P02-T06 found and CF-133 carries is
that the credential is not permanently dead**: the CLI issues a fresh
short-dated password on every `db push`, so a LOGIN role one `SET ROLE` from
`postgres` is live for the length of each push window. Migrations 13 and 14 both
ran inside one. "Revocation is cosmetic" holds only in the gaps between pushes,
which is the one word of §11b.4 the second reading changes.

What P02 should know before its first task:

- **A READINESS task now runs before P02's exit gate and the gate does not run
  until it is green** (OD-H8). It is STANDARD class, it asserts only what is
  mechanically checkable, and it reports a list rather than a verdict. It is a
  prompt the reviewer emits before each gate and **is not implemented** — M-01
  landed the decision and the lifecycle, not the task.
- **The gate's standard is now five things, not four**: a planted violation for
  every guard with a live target, a removed *and* an emptied target for every
  check, a stated floor per check (PR-27), §11 re-derived by tier with all three
  reachability measurements (§11.0.1), and the isolation suite in full with the
  row count taken by a query the suite does not itself run. A new check adds a
  case to each of the first three — which PR-28 now makes standing rather than
  remembered, and OD-H11 makes every probe a gate invents additive.
- **§11's re-derivation is standing and P02's exit gate inherits it.** §11a asks
  for justification, §11b for enumeration and change detection. Measuring a
  function by schema `USAGE` alone answers falsely, because `authenticator` is
  `NOINHERIT`.
- **`check-print-containment` and `check-zod-coverage` are the two guards P01
  does not owe.** Both were confirmed target-free by scan this run: zero
  page-geometry signals anywhere, and zero `zod` imports with every candidate
  mutation-boundary site inside the test harness. Owners are **P06** for print,
  whose target is `lib/print/` per `MODULE_SPEC.md` §100, and **P02** for zod,
  whose target is the first `features/<module>/actions.ts` under ADR-010.
- **The open rows whose owner names neither a gate nor a phase are the
  ledger's blind spot.** `check_ledger.py` proves an owner clause is present and
  reachable; it cannot tell whether "the reviewer" or "the next repo-maintenance
  task" ever arrives. That is a judgement each phase entry checklist re-makes,
  not a mechanism.

Open carry-forwards and their owners are the "Open carry-forwards — ids only"
section above and `docs/method/CARRY_FORWARDS.md`'s ledger. This file does not
restate a row's content or status — reconciling ids is not the same property
as reconciling content.

Of the preconditions P02 owed before its first task, **two were discharged at
P02-T03 and re-measured at P02-T04, and are not to be re-cited from this file**:
zero `public.tenant` rows and zero `auth.users` in `b2s-production`, which is
ADR-012's condition and CF-92's trigger, measured zero on both sides of every
run; and the isolation suite green, now at 56, 0 FAIL, 0 LOST. Both were taken
by query and by running, and both go stale the moment anything touches the
schema — `SECURITY_MODEL.md` §4's re-run conditions decide when, not the fact
that a task once measured them. P02-T04 changed the schema, which is why it
re-took both rather than citing P02-T03.

Still owed, none of them measured yet: `SECURITY_MODEL.md` §11 re-derived **by
tier** and matching the live catalog on all three reachability measurements,
since §11.5 binds every gate and P02's exit gate inherits it; every guard with a
live target present and proven by a planted violation, **every check proven to
error on both a removed and an emptied target**, and each stating its PR-27
floor; `schema.sql` still whitespace-normalised identical to the migrations and
the remote ledger still matching them one for one; generated types still
byte-identical to live. **`main` carries P01** as of `eda0f45`, so P02 branches
from `main` per `BRANCHING.md` §2 and still verifies which branch it is standing
on rather than assuming.

**Both directions of the three conformance checks are part of that
precondition set now.** `check_module_spec_tree.py`, `check_data_model_schema.py`
and `check_security_model_bypass.py` run in `docs-integrity` on every push, so
P02 creating `features/` or `components/` must name the directory in
`MODULE_SPEC.md` §1 and drop its `deferred` marker in the same commit, P02
adding a table or an enum must land the §3 subsection and the roster line with
the migration, and **P02 adding a `security definer` function in `public` must
land its §11a.1 row and move the two totals with it**. That is OD-H9 working as
intended: the document and the schema cannot drift for a phase and be reconciled
at a gate, because the push fails first. The static half is what those three
cover; the platform half of §11 — §11b's three functions, five roles, ten paths
and six event triggers — has no static premise to check against and is still the
gate's live re-derivation, per §11.5.
