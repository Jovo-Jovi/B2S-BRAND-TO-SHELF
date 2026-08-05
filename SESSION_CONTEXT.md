# SESSION CONTEXT
Updated: 2026-08-05 · By: Sonnet · Phase: P02
Last task: P02-T01 · Verdict: pending. Land task on `main` per BRANCHING §3.2:
OD-G13 to OD-G16 signed, register 84 → **88**; `TENANCY_MODEL.md` §3 rule 1
amended to at-least-one-active-owner (OD-G15). Ledger reconciled — CF-93 and
CF-103 amended, CF-99 closed, CF-120 opened and closed, CF-121 opened.
`check_stated_counts.py` gained the SESSION_CONTEXT-register check (CF-120)

## Read these too
- `docs/method/PRECEDENTS.md` — binding rulings and environment quirks.
  MANDATORY every session.
- `docs/method/CARRY_FORWARDS.md` — the full carry-forward ledger. Open it
  when your task names a CF, when you land or amend rows, or at a gate.
- `DEVELOPMENT_JOURNAL.md` — append-only narrative history.

This file carries state and open ids only. Narrative belongs in the journal.
Keep it short: if a paragraph is growing here, it belongs elsewhere.

## Where we are
Gate 3 passed 2026-08-01 and the prepare phase is closed. Eight blocking
documents are frozen. Architecture is decided: `ARCHITECTURE.md` and twelve
append-only ADRs, signed by the owner — Next.js App Router on Vercel, Supabase
Postgres, row-level tenancy with default-deny RLS as the authorization boundary,
the privileged client physically quarantined, exact-decimal money end to end.
`BUILD_PHASES.md` sequences eight phases delivering Release 1; one branch per
phase per `BRANCHING.md`. P01 Foundation is in progress on `phase/01-foundation`
— no features: application shell, `DATA_MODEL.md` authored just-in-time, the
tenancy-spine schema with RLS on every table, generated types, and the nine CI
guards. P01-T01 landed the shell and three guards. P01-T02 landed `DATA_MODEL.md`
and `MODULE_SPEC.md`, **one** Supabase project under ADR-012, the Platform tier
applied to it — six tables plus the `role` enum, RLS on all six, 16 policies,
three helper functions, five §4 indexes, the active-owner trigger — the three
Supabase clients with the privileged one quarantined, generated types, and two
more guards with the drift job. Five of the nine §6 guards are live; four await
the phase that lands their target. **Tenant isolation is now proven.** P01-T03
ran twenty-one assertions against the live catalog and the live policies —
DATA_MODEL §5's eight, five adversarial additions, four more the gate authored
itself, and a verified teardown. All PASS, none LOST. Two synthetic tenants were
seeded under ADR-012's reserved prefix and removed, with zero rows and zero
`auth.users` left behind, proven by query. The gate produced four findings, none
of them a breach of `SECURITY_MODEL.md` §1: CF-103, CF-104, CF-105 and CF-106.
P01-T04 closed all four and re-ran the whole gate: **31 assertions, 31 PASS, 0
FAIL, 0 LOST**, teardown verified at zero again. The schema now carries 18
policies and 6 functions. CF-103's exploit is closed — an owner invites, only
the invitee accepts — and its remaining half, the session-to-membership binding,
is retargeted to P02. Operator reach into tenant business data is behind a live
consent grant, logged, and cannot return `payload`. `SECURITY_MODEL.md` §1 has a
fourth guarantee, availability. **P01-GATE ran the exit verification and the
phase FAILED it** — 17 of 23 criteria PASS, 5 FAIL, 1 unprovable as written.
Isolation is not among the failures: re-proven here at 31 PASS, 0 FAIL, 0 LOST,
all 18 policies reached by a firing assertion and all 24 table/operation cells
covered. What failed is enforcement and bookkeeping — the §1 tree does not match
the tree that exists, two guards whose targets now exist were never written, four
RLS-bypassing roles are named in no document, eleven open rows name an owner
whose moment has passed, and CF-95 and CF-98 still name P01. All five are
reported, none fixed. **P01-T05-FIX closed all five and did not run the gate.**
Both missing guards exist and both are proven by planted violation, not by
reading: `check-enum-keys` asserts the shape of all 12 values across the four
live enums, and the HTML-injection rule is six AST selectors that catch the
gate's own probe. `MODULE_SPEC.md` follows the tree. `SECURITY_MODEL.md` §11 is
the bypass inventory, re-derived from the live catalog rather than copied from
the gate report, and it carries the standing rule that every phase exit gate
re-derives it. Twelve stale owners were retargeted, not eleven — the new
reachable-owner assertion in `check_ledger.py` found CF-54, which the gate did
not name — and that check is proven on three positives and three negative
controls. CF-95 is closed on a green `types-drift` and a passing Vercel status
at two commits; **CF-98 is deliberately left open**, because its four advisories
re-derive unchanged and D2's own condition says so. **P01-GATE-RERUN re-ran the
whole verification and the phase FAILED it again** — 22 of 25 criteria PASS,
3 FAIL, every one of them re-derived here and none carried over from the first
run. All five of the first run's failures are genuinely closed and none
regressed. Isolation is re-proven a fourth time: 31 assertions, 31 PASS, 0 FAIL,
0 LOST, zero tenant rows before and after by a query the suite does not run, all
18 policies reached and all 24 table/operation cells covered. Every guard with a
live target is proven by a planted violation and reverted, 12 of 12, tree clean
after. What failed is three things the first run could not have caught, because
two of the checks are new in this prompt. **§11's standing re-derivation, on its
first execution, found six live bypass mechanisms the document does not name** —
three `security definer` functions outside `public` and three role paths into a
bypass role — which §11.5 makes a hard failure not waivable by OD. **Four checks
report success on an empty set** when their scan roots are removed, which is
PR-21's exact failure shape. **`MODULE_SPEC.md` §1 still does not name the root
`__tests__/`**, which holds the P01 deliverable it governs. **P01-T06-FIX closed
all three and did not run the gate.** `SECURITY_MODEL.md` §11 is now two tiers:
§11a is B2S-owned and individually justified, §11b is platform-owned and its
requirement is enumeration and change detection rather than justification — the
ambiguity was the reviewer's and the remedy is structural, not a longer list. The
re-derivation at closure exceeded the gate's own findings twice: `authenticator`
does reach both `vault` functions, by `SET ROLE service_role`, which the gate's
two measurements could not see; and the catalog holds ten `MEMBER` paths into a
bypass role, not four. `cli_login_postgres` is investigated and **not dropped** —
nothing depends on it, its password expired 2026-08-03, and revocation is
recommended as an owner decision. The six event triggers are ruled: not a bypass,
since no API role can issue DDL and none is `security definer`, but a
`supabase_admin` code-execution surface, stated as one. **All thirteen sandbox
cases now error and none reports success on an empty set** — the four named plus
a fifth the gate's own sandbox missed, `check_ledger` on an emptied row set —
with seven controls proving detection intact and a legitimately-zero ledger still
green. PR-27 landed. `MODULE_SPEC.md` §1 names the root `__tests__/`; both
staging casualties are retired and a 110-file sweep found three survivors, landed
as CF-114; `DATA_MODEL.md` §3's enum count is corrected to four and mechanised in
`check_stated_counts.py`. **CF-98 is closed** — `postcss` 8.4.31 → 8.5.25 and
`sharp` 0.34.5 → 0.35.3 by transitive override, `npm audit` 3 high → 0, the whole
pipeline green. **P01-GATE-RUN3 ran the whole verification a third time and the
phase PASSED it** — 27 criteria, 26 PASS, one documentation correction, zero hard
failures, nothing carried over from either earlier run and no prior report cited.
All three of the second run's failures are genuinely closed and none of the first
run's five regressed. Isolation is proven a fifth time: 31 assertions, 31 PASS, 0
FAIL, 0 LOST, zero tenant rows and zero `auth.users` before and after by a query
the suite does not run, all 18 policies reached and 24 of 24 table/operation cells
covered. **132 live objects in schema `public` traced one by one to
`DATA_MODEL.md` with nothing unspecified** — 6 tables, 51 columns, 12 enum values,
25 constraints, 13 indexes, 6 functions, 1 trigger, 18 policies, 0 views, 0
sequences — and the document landed at `22b233f`, four days ahead of the first
migration at `f29c0d9`. §11 re-derives clean against both tiers on the three-way
measurement §11.0.1 requires. **Every check errors on a removed target and on an
emptied one, 13 of 13 both ways**, each stating its PR-27 floor, and
`check_credentials` still widens to a whole-tree scan on an absent diff. 12 of 12
guards with a live target caught a planted violation and every snapshot restored,
tree clean after. The two outstanding guards are confirmed target-free by scan
rather than by assumption. The single correction is `MODULE_SPEC.md` §1 in the
reverse direction only: all 20 paths that should exist do, and §1 names **no**
repository-root file and none of the six infrastructure directories. **The phase
exits. PR #2 is eligible and merging it is the owner's decision.**

**PR #2 is MERGED** at `eda0f45` and `main` now carries P01. `phase/01-foundation`
is deleted locally and on origin, on `BRANCHING.md` §4's verified containment:
`git log main..phase/01-foundation` returned empty at 0 commits after local `main`
was fast-forwarded from `04a503b` to `eda0f45`. **M-01 then amended the method on
`main` directly**, which `BRANCHING.md` §3.2 now admits. Four decisions are
signed: OD-H8 puts a STANDARD-class readiness task before every heavyweight exit
gate, OD-H9 requires a specification to land with the check that asserts it,
OD-H10 fixes `MODULE_SPEC.md` §1 as the application tree, OD-H11 makes a gate's
adversarial probes additive. The register is **84** ODs, verified by count. The
lifecycle carries READINESS. CF-115 to CF-118 are opened and closed — §1 has its
OD-H10 scope statement, `docs/ADRs/` is deleted, `DATA_MODEL.md` §1 names its
three departures instead of contradicting them, and the two traceback-only checks
now fail in one line like the other eleven. Two conformance checks are live in
`docs-integrity` and **the probe that proves them found two things a reading would
not**: a root dropped from §1's `In scope:` line silently narrowed the new check
itself, and `check-service-import` reported OK over an existing-but-empty
quarantine, landed as CF-119 and closed. PR-28 is landed.

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
| P02-T01 | P02 entry: land task on `main` per BRANCHING §3.2. Four signed decisions — OD-G13 to OD-G16 — appended to `DECISIONS.md` §2 Group G and authored in full in §3; register 84 → **88**, verified by count. `TENANCY_MODEL.md` §3 rule 1 amended to match OD-G15 — at least one active `Owner`, may have several — nothing else in §3 touched. Ledger reconciled per PR-24: CF-93 amended (gaps 1, 2, 5 and 7 found already closed and recorded so; gap 3 resolved at the decision level by OD-G14; gap 4 by OD-G15; gap 6 alone stays open, owner P03), CF-99 closed on the owner's merge at `eda0f45` with verified branch containment, CF-103 amended (remainder resolved at the decision level by OD-G14, implementation and proof still owed), CF-120 opened and closed in the same task, CF-121 opened (invitation-by-email resolved at the design level by OD-G16, implementation still owed). Ledger now 106 rows, 35 open. `check_stated_counts.py` gained a sixth check — `SESSION_CONTEXT.md` states the register total in the present tense exactly once and it must equal `DECISIONS.md` §2 — proven by a planted wrong figure reverted from an in-memory snapshot (PR-26) and by removed/emptied-target cases, taking the two-way empty-target set from fifteen cases to sixteen (PR-28). `SESSION_CONTEXT.md`:228 reworded to carry no bare total, closing CF-120. No application code, no migration, no schema change | pending | pending |

> Commit column: one or more comma-separated backticked shas, or `—` where no
> single commit tracks the step (P-00 through P-01c predate the one-task-one-commit
> convention). Several shas mean the step's deliverable, its PR-17 follow-up and,
> where the owner has merged it, the merge commit. The most recent row may read
> `pending` until its follow-up commit fills it (PR-17); `check_done_steps_shape.py`
> exempts the last row for exactly that reason.

## Open carry-forwards — ids only
Full text in `docs/method/CARRY_FORWARDS.md`.

- CF-01 — Reinstate deferred Dev OS security/migration rule layer at P10 — owner: the P02 entry checklist, subject by subject as each mechanism arrives (retargeted P01-T05-FIX; Gate 3 has passed)
- CF-02 — Unescaped innerHTML in all legacy tools — owner: FEATURE_INVENTORY.md must-not-reproduce at P-07
- CF-03 — Legacy catch(e){} swallowing — owner: FEATURE_INVENTORY.md must-not-reproduce at P-07
- CF-05 — Print calibration unresolved until OD-5 signed — owner: PRINT_CONTRACT.md, authored just-in-time per OD-H7; the measurement is B2S_PREPARE_PHASE.md Step 15
- CF-11 — REPORT.md §3.3 "design tools are independent islands" is FALSIFIED for the sticker tool — owner: the REPORT.md annotation task at P02, batched with CF-72 (retargeted P01-T05-FIX)
- CF-14 — Public repo: owner's given name and local folder path are permanently in git history — owner: RISK_REGISTER.md, authored just-in-time per OD-H7; its gate is the pre-relaunch audit, B2S_PREPARE_PHASE.md §10
- CF-22 — Label-editor vs sticker-tool capability delta — owner: reviewer — verify closure against EXTRACT_DESIGN_TOOLS.md Part 2 at the TEMPLATE_MODEL.md authoring
- CF-32 — CSV import resequenced from void to post-DATA_MODEL feature — owner: IMPORT_SPEC.md, P-10
- CF-39 — `B2S_PREPARE_PHASE.md` §3/§4 now run together with no `---` separator — owner: the P08 pre-relaunch audit, the next write task that opens the file (retargeted P01-T05-FIX)
- CF-41 — `B2S_PREPARE_PHASE.md` §1's product-definition table gives the wrong repo URL — owner: the write task that lands CF-39 — P-12
- CF-44 — VOID. Never issued; reviewer numbering error at the P-02 verdict — owner: none — void, retained as a numbering record. Exempt from the reachable-owner test by its VOID status
- CF-46 — EXTRACT_STOCK_COSTS.md §C.4 lists ten findings awaiting accept/reject — owner: the FEATURE_INVENTORY.md authoring, P08 (retargeted P01-T05-FIX)
- CF-47 — Costing is last-purchase-price-wins by unconditional overwrite — owner: the R2 amendment to CALC_SPEC.md
- CF-50 — AUDIT_STICKER.md §3.4 names the three bb_color_presets seeds wrong — owner: the AUDIT_STICKER.md annotation task at P08, batched with CF-56 (retargeted P01-T05-FIX)
- CF-51 — Prompt-template defect: "one commit" collides with "do not amend or rewrite history" — owner: reviewer, standing
- CF-53 — `docs/method/PROJECT_RECONFIG.md` was byte-identical to `CLAUDE_PROJECT_INSTRUCTIONS.md`. The three-copy half is settled at P01-T04 — builder charter, pivot record, reviewer reference, each now naming its own role; what remains open is the lost reconfiguration record behind the STATUS stub — owner: reviewer, decide at P-12
- CF-54 — Stub count stated three ways — owner: the P08 pre-relaunch audit, batched with CF-39 (retargeted P01-T05-FIX — the twelfth stale owner, found by the new check rather than named by the gate)
- CF-56 — The falsified sticker preset names appear at two locations in AUDIT_STICKER.md — owner: P08, the same task as CF-50 (retargeted P01-T05-FIX)
- CF-58 — `tools/backup-browser-data.js` serves the abandoned browser-data backup workflow — owner: owner decision, retire or keep; landing at the next repo-maintenance task
- CF-69 — Invoice history is capped at 100 records with silent destruction — owner: FEATURE_INVENTORY.md must-not-reproduce
- CF-71 — A parse failure is indistinguishable from an empty collection, then saved over real data — owner: FEATURE_INVENTORY.md must-not-reproduce
- CF-72 — REPORT.md citations into the two business tools need re-derivation before use — owner: the REPORT.md annotation task at P02, batched with CF-11 (retargeted P01-T05-FIX)
- CF-73 — bb-stock-costs.html:5645 ships a corrupted Arabic "full return" string on every printed report — owner: FEATURE_INVENTORY.md must-not-reproduce, UX_PRINCIPLES.md
- CF-74 — Report engine has no resource bundle outside the invoice template; two strings re-declared eight times — owner: DOMAIN_MODEL.md and UX_PRINCIPLES.md
- CF-75 — AGENTS.md and .cursor/rules/b2s-devos.mdc carried folder paths and a named library ahead of ARCHITECTURE.md; rewritten by P-05-PRE — owner: the P02 entry checklist; ARCHITECTURE.md now exists, so the rules files can cite it (retargeted P01-T05-FIX)
- CF-83 — Reviewer state assertions are not stamped to a commit — owner: PRECEDENTS.md, PR-18
- CF-84 — A verdict-logged carry-forward is opened as a stub, then re-opened as new by the next prompt — owner: PRECEDENTS.md, PR-19
- CF-92 — ADR-012's reinstatement trigger: the isolation suite may run against production only while it holds zero real tenants, and a staging project exists before the first one — owner: the task onboarding the first non-synthetic tenant, and the Phase 02 exit gate
- CF-93 — Seven specification gaps in DATA_MODEL.md's Platform tier, found by building it; none resolved by invention — owner: P02 for gaps 1, 2, 3, 4 and 7; P03 for gaps 5 and 6, each at its phase entry checklist (split P01-T05-FIX)
- CF-94 — `check-no-runtime-cdn` and `check-no-hardcoded-literals` scan `app/` and `proxy.ts` only, so `lib/` is unguarded — owner: the P02 entry checklist for `lib/`; the task that creates each of `components/` and `features/` for those roots (split P01-T05-FIX)
- CF-97 — The credential scanner fired on `process.env.SUPABASE_SERVICE_ROLE_KEY`, the safe form ADR-005 requires; the value side now rejects an environment indirection — owner: reviewer, to ratify the narrowing or reject it
- CF-103 — **Exploit closed at P01-T04 and re-tested as proof 19; the row stays open for the other half.** An owner may only invite and only the invitee may accept, enforced by a restrictive table-wide rule rather than a per-policy one. What remains is that `current_tenant_id()` returns null on more than one active membership, contradicting `DOMAIN_MODEL.md` §5.1, so a person who accepts a second invitation locks themselves out — owner retargeted: **P02, with authentication**
- CF-109 — The isolation suite is deliberately outside `npm test` and no CI job runs it. Originally forced by absent secrets, the decision now stands on ADR-012: one environment means a per-push job would seed and tear down against production on every commit. Consequence held consciously — a regression introduced between gates is not caught until the next gate — owner: CF-92's reinstatement trigger; when staging exists the suite becomes a required CI job on any schema-touching pull request
- CF-114 — ADR-012 retired staging and three documents still describe it as an environment that exists: `BUILD_PHASES.md`:25/:37/:41, `DEV_OS_REFERENCE.md`:95/:118/:205, and `ARCHITECTURE.md`:118, which sits just below an ADR-012 amendment note that covers the table above it but not that sentence. Found by a 110-file sweep at P01-T06-FIX; the two named casualties are retired and these three are not in that task's write set — owner: the P02 entry checklist, batched as one task opening all three
- CF-121 — The invitation model had no way to invite anyone who had not already signed up, and no way to find them if they had — resolved at the design level by **OD-G16**; implementation and proof are owed — owner: **the P02 task that writes the invitation flow**

## Frozen decisions in force
- Freeze point 2026-07-29 (`legacy/FREEZE.md`) — tools RETIRING, not port
  targets.
- Decision register: now authoritative at `docs/product/DECISIONS.md`,
  promoted P-05-LAND from `docs/method/B2S_PREPARE_PHASE.md` §2, which is
  annotated PROMOTED and retained as the signing record. §5 Release 1 SIGNED
  2026-07-30. The current total lives at `DECISIONS.md` §2, not restated here,
  and `check_stated_counts.py` asserts the two agree (CF-120).
- Reviewer direct repo read SIGNED 2026-07-31 — PR-09.
- Memory guard restructure SIGNED 2026-07-31 — this file, CF-55.
- `PRODUCT_BRIEF.md`, `GLOSSARY.md`, `SCOPE.md` AUTHORED 2026-08-01 —
  P-05-LAND. `VOCABULARY_DRAFT.md` archived, superseded by `GLOSSARY.md`.
- `TENANCY_MODEL.md` and `SECURITY_MODEL.md` AUTHORED 2026-08-01 — P-06b-LAND.
  CF-31 closed against `SECURITY_MODEL.md` §4.
- `CALC_SPEC.md` AUTHORED 2026-08-01 — P-07-LAND. Calculation choices CS-01
  through CS-15 SIGNED 2026-08-01 by the owner (CS-15 signed separately by
  P-08-PRE, 2026-08-01).
- OD-H7 SIGNED 2026-08-01 — P-08-PRE. Gate 3 verifies the blocking set only
  (`PRODUCT_BRIEF`, `GLOSSARY`, `SCOPE`, `DECISIONS`, `DOMAIN_MODEL`,
  `TENANCY_MODEL`, `SECURITY_MODEL`, `CALC_SPEC`); the other thirteen frozen
  documents are just-in-time, each carrying its Gate 3 item to its own module
  gate. `CALC_SPEC.md`'s Gate 3 item covers its 25 Release 1 rows only.
  `DECISIONS.md` now carries **88** signed ODs, verified by count — 80 promoted
  plus OD-H7, OD-H8 to OD-H11 signed 2026-08-04 at M-01, and OD-G13 to OD-G16
  signed 2026-08-04 at P02-T01.
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
  slots were held, so the choice was one project or none. Reinstatement is CF-92
  and its trigger is a row count, not a judgement.
- `ARCHITECTURE.md` precedence slot 11, `BUILD_PHASES.md` slot 13.
  `B2S_PREPARE_PHASE.md` is superseded as a plan; its §9 and §10 remain in force.
- PR-25 landed 2026-08-03 — P01-T03. Raising the version of a package already
  present, to close a published advisory, is maintenance and not a new
  dependency. It needs a task and a green pipeline, not an OD. This unblocks
  CF-98's four transitive advisories.
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
- ADR-006's "verbatim" DEFINED 2026-08-03 — P01-GATE, CF-110. A migration split
  is verbatim when the concatenation of `supabase/migrations/*.sql` in filename
  order is **whitespace-normalised identical** to `supabase/schema.sql` from its
  first marker: blank lines and trailing whitespace differ freely, any changed
  statement fails. `scripts/check_migration_split.py` asserts it on every push,
  so the standard is mechanical rather than a matter of which task last measured
  it.
- **The RLS-bypass inventory is a standing check as of 2026-08-03 —
  P01-T05-FIX.** `SECURITY_MODEL.md` §11 enumerates every mechanism that can
  bypass row-level security: the five `rolbypassrls` roles with their `SET ROLE`
  reachability, the six `security definer` functions with their pinned
  `search_path`, table ownership and its `FORCE` state, and `service_role` with
  ADR-005's quarantine. **It is re-derived from the live catalog at every phase
  exit gate, and a mechanism that appears in the derivation but not in the
  document is a hard failure of that gate.** Not waivable by OD, on §1's ground.
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
- **CF-98 CLOSED 2026-08-04 — P01-T06-FIX**, under PR-25. `postcss` 8.4.31 →
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
- **The static conformance set is still seven `docs-integrity` checks and five
  `guards`, twelve in total, as of 2026-08-05 — P02-T01.** The two-way
  empty-target probe covers **sixteen** (check, premise) cases, up from
  fifteen, because `check_stated_counts.py`'s new SESSION_CONTEXT-register
  assertion (CF-120) joins it — proven on a wrong figure, zero matching lines,
  two matching lines, a removed target and an emptied target, all five
  reverted byte-identical to snapshot, per PR-26. A new check adds a case to
  it, per PR-28. Live-catalog conformance belongs to the readiness task
  (OD-H8) and is not implemented yet.

## Next action
**P02 entry — the preconditions below, verified by query, not by reading this
file.** OD-G13 to OD-G16 are now signed (P02-T01) and CF-103's remainder is
resolved at the decision level by OD-G14; both await implementation by the P02
task that writes session resolution.

Two owner decisions are waiting and neither blocks P02:

- **`cli_login_postgres`**, §11b.4. Revocation was recommended at P01-T06-FIX and
  deliberately not performed. Its password expired 2026-08-03, nothing depends on
  it, and the CLI re-provisions one on the next link, so a reappearance is
  expected rather than a regression.
- **CF-97**, the credential-scanner narrowing, still awaiting ratification or
  rejection.

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
- **CF-114 is open and was never P01's to fix.** Three documents still describe
  staging as an environment that exists: `BUILD_PHASES.md`:33/:47/:51 —
  **re-cited at M-01**, which shifted them by inserting READINESS above —
  `DEV_OS_REFERENCE.md`:95/:118/:205 and `ARCHITECTURE.md`:118, both unmoved.
  Seven lines, documentation rather than behaviour. No code path, config or CI job
  points at a staging project.
- **`check-print-containment` and `check-zod-coverage` are the two guards P01
  does not owe.** Both were confirmed target-free by scan this run: zero
  page-geometry signals anywhere, and zero `zod` imports with every candidate
  mutation-boundary site inside the test harness. Owners are **P06** for print,
  whose target is `lib/print/` per `MODULE_SPEC.md` §100, and **P02** for zod,
  whose target is the first `features/<module>/actions.ts` under ADR-010.
- **The 15 open rows whose owner names neither a gate nor a phase are the
  ledger's blind spot.** `check_ledger.py` proves an owner clause is present and
  reachable; it cannot tell whether "the reviewer" or "the next repo-maintenance
  task" ever arrives. That is a judgement each phase entry checklist re-makes,
  not a mechanism.

**P02 entry checklist — the inherited rows, each with its owner:**

- **CF-92** — owner: the task onboarding the first non-synthetic tenant, **and
  the P02 exit gate**. ADR-012's condition still holds: zero real tenants,
  verified at this gate. P02 must re-verify it before its first task and again
  at its exit, because P02 is where authentication arrives and the first real
  tenant becomes possible.
- **CF-95** — CLOSED at P01-T05-FIX. `types-drift` and all seven `ci` jobs
  concluded success on both `c08fb1b` and `057ae11`, and both carry a `Vercel`
  status of `success`. No longer inherited.
- **CF-103's remainder** — owner: **P02, with authentication**. The exploit half
  is closed and re-tested. What remains is that `current_tenant_id()` returns
  null on more than one active membership, contradicting `DOMAIN_MODEL.md` §5.1,
  so a person who accepts a second invitation locks themselves out. This is a
  design decision P02 must make before it writes a session, not after.
- **CF-109** — owner: CF-92's reinstatement trigger. One environment means a
  per-push isolation job would seed and tear down against production, so no CI
  job runs the suite and a regression between gates is not caught until the next
  gate. P02 holds that consequence consciously or ends it by standing up
  staging.
- **CF-98** — CLOSED at P01-T06-FIX, under PR-25. No longer inherited. What P02
  does inherit is the maintenance obligation the closure created: two
  `overrides` entries in `package.json`, each removed when an upstream Next.js
  release consumes it. The comment beside them names CF-98 and PR-25.
  **P01-GATE-RUN3 measured the removal condition as met**: `next@16.3.0` fixes
  all three packages as a non-major bump, so both overrides can go at the next
  maintenance task under PR-25. It also reconciled the count, which had read
  three or four depending on who was asked — `npm audit` counts **packages**
  and reports 3 high on `main`; those three carry **5** distinct advisories;
  GitHub Dependabot counts **alerts** and reports **4**, being 3 high and 1
  moderate. All three figures are correct and this branch is **zero** on every
  one of them. State the unit with the number or the disagreement recurs.
- **CF-114** — owner: the P02 entry checklist, batched. Three documents still
  describe staging as an environment that exists. One task opens all three; the
  correction is the same sentence three times.
- Also inherited and already open, several explicitly owned by P02 as of
  P01-T05-FIX: **CF-01** and **CF-75** (the deferred rule layer and the two
  always-on rules files, restorable now that `ARCHITECTURE.md` exists),
  **CF-11** and **CF-72** (one `REPORT.md` annotation task, batched), **CF-93**
  gaps 1, 2, 3, 4 and 7, **CF-94** for the `lib/` root, **CF-97** (the scanner
  narrowing, awaiting ratification) and **CF-99** (PR #2) unchanged.
- **CF-99 is open and its condition is spent.** The owner merged PR #2 at
  `eda0f45`, which is the decision the row was waiting for, and
  `phase/01-foundation` is deleted both places on verified containment. M-01 did
  not close the row: its own text assigns the closure to the owner and no
  instruction here authorises it. Owner: the owner, to close on the merge.
- **CF-115 to CF-118 are LANDED and CLOSED at M-01**, each opened first per
  PR-24 because a read-only gate had written no ledger row for them. **CF-119 is
  landed and closed with them** — an id no instruction asked for, opened because
  M-01's own probe found `check-service-import` reporting OK over an
  existing-but-empty quarantine, and PR-28 puts a probe's finding in the fix task
  that follows. No longer inherited.
- **An owner decision is also waiting on `cli_login_postgres`** — §11b.4
  recommends revoking it and P01-T06-FIX did not, because dropping a
  platform-managed role is not a fix task's call. Not a blocker: its password
  expired 2026-08-03 and nothing depends on it.

Preconditions P02 must verify before its first task, each by query rather than by
reading this file: **zero tenant rows and zero `auth.users`** in `b2s-production`,
which is ADR-012's condition and CF-92's trigger; the isolation suite green at 31,
0 FAIL, 0 LOST; `SECURITY_MODEL.md` §11 re-derived **by tier** and matching the
live catalog on all three reachability measurements, since §11.5 binds every gate
and P02's exit gate inherits it; every guard with a live target present and proven
by a planted violation, **every check proven to error on both a removed and an
emptied target**, and each stating its PR-27 floor; `schema.sql` still
whitespace-normalised identical to the migrations and the remote ledger still
matching them one for one; generated types still byte-identical to live. **`main`
carries P01** as of `eda0f45`, so P02 branches from `main` per `BRANCHING.md` §2
and still verifies which branch it is standing on rather than assuming.

**Both directions of the two new conformance checks are part of that
precondition set now.** `check_module_spec_tree.py` and
`check_data_model_schema.py` run in `docs-integrity` on every push, so P02 creating
`features/` or `components/` must name the directory in `MODULE_SPEC.md` §1 and
drop its `deferred` marker in the same commit, and P02 adding a table or an enum
must land the §3 subsection and the roster line with the migration. That is
OD-H9 working as intended: the document and the schema cannot drift for a phase
and be reconciled at a gate, because the push fails first.
