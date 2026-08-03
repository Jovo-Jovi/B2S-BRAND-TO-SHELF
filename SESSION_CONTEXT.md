# SESSION CONTEXT
Updated: 2026-08-03 · By: Opus · Phase: BUILD — P01 Foundation, exit gate re-run ·
Last task: P01-GATE-RERUN · Verdict: **FAIL** — 22 of 25 criteria PASS, 3 FAIL.
Isolation is not among them. The phase does not exit and PR #2 does not merge

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
`__tests__/`**, which holds the P01 deliverable it governs. **The phase still
does not exit and PR #2 still does not merge.**

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
| P01-GATE-RERUN | Phase 01 exit verification, second run, read-only but for CF-98 and the ceremony. 25 criteria re-derived from the live catalog and the committed tree, citing no prior report: 22 PASS, 3 FAIL. None of the first run's five regressed and all five are genuinely closed. Isolation re-run in full — 31 assertions, 31 PASS, 0 FAIL, 0 LOST, zero tenant rows before and after by an independent query, 18 policies and 24 cells covered. 12 of 12 plant-and-revert probes caught, tree clean. Every live schema object traced to `DATA_MODEL.md`; `schema.sql` whitespace-normalised identical to the 12 migrations and the remote ledger matches them one for one; generated types byte-identical to live at 15,474 bytes. FAILs: §11's first standing re-derivation found six undocumented bypass mechanisms (three `security definer` functions outside `public`, three role paths into a bypass role) — hard, not waivable; four checks report success on an empty set, PR-21's shape; `MODULE_SPEC.md` §1 does not name the root `__tests__/`. CF-98 amended with its acceptance and with the finding that `postcss@8.5.25` and `sharp@0.35.3` are published, so the remedy is a resolution bump and not a wait | FAIL | pending |

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
- CF-98 — Four open Dependabot alerts on the default branch (3 high, 1 medium; `postcss` ×3 and `sharp`, both transitive through Next.js). AMENDED P01-GATE-RERUN: accepted risk, not a blocker; `npm audit` offers only a semver-major framework downgrade, but `postcss@8.5.25` and `sharp@0.35.3` are published, so a non-regressive resolution bump does exist under PR-25 — owner: every phase exit gate until an upstream Next.js release consumes them
- CF-99 — PR #2 (`main` ← `phase/01-foundation`) exists although P01-T02 forbade a pull request; opened by the owner's account, not the builder, and left untouched. Merging it before T03 lands the tenancy schema on `main` with tenant isolation unproven — owner: the owner, to leave it open until T03 and the phase gate pass, or close and re-open at the gate
- CF-103 — **Exploit closed at P01-T04 and re-tested as proof 19; the row stays open for the other half.** An owner may only invite and only the invitee may accept, enforced by a restrictive table-wide rule rather than a per-policy one. What remains is that `current_tenant_id()` returns null on more than one active membership, contradicting `DOMAIN_MODEL.md` §5.1, so a person who accepts a second invitation locks themselves out — owner retargeted: **P02, with authentication**
- CF-109 — The isolation suite is deliberately outside `npm test` and no CI job runs it. Originally forced by absent secrets, the decision now stands on ADR-012: one environment means a per-push job would seed and tear down against production on every commit. Consequence held consciously — a regression introduced between gates is not caught until the next gate — owner: CF-92's reinstatement trigger; when staging exists the suite becomes a required CI job on any schema-touching pull request

## Frozen decisions in force
- Freeze point 2026-07-29 (`legacy/FREEZE.md`) — tools RETIRING, not port
  targets.
- Decision register: **79 decisions, all SIGNED, none open**, now
  authoritative at `docs/product/DECISIONS.md` (promoted P-05-LAND from
  `docs/method/B2S_PREPARE_PHASE.md` §2, which is annotated PROMOTED and
  retained as the signing record). §5 Release 1 SIGNED 2026-07-30.
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
  `DECISIONS.md` now carries 80 signed ODs, verified by count.
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
- PR-26 landed 2026-08-03 — P01-T05-FIX. A plant-and-revert probe restores from
  its own in-memory snapshot, never with `git checkout --`, which discards the
  session's uncommitted work in the same file. Learned by doing it.

## Next action
**A named FIX task, then a third full gate run.** `BUILD_PHASES.md`'s lifecycle
is explicit: one hard failure blocks sign-off, spawns a FIX task, and the
verification re-runs in full. Two of the three failures are hard. The FIX task
lands the four items below; it does not grade itself.

1. **`SECURITY_MODEL.md` §11 — six undocumented bypass mechanisms.** Hard, and
   §11.5 makes it not waivable by OD. §11.2 says "Six exist, all in schema
   `public`"; the live catalog holds **nine** `security definer` functions. The
   six in `public` match the table exactly. The other three are
   `vault.create_secret`, `vault.update_secret` and `pgbouncer.get_auth`, all
   owned by `supabase_admin`, all with `search_path` pinned to the empty string,
   and none reachable by `anon`, `authenticated` or `authenticator` — no schema
   `USAGE`, no `EXECUTE`. Separately, §11.1 documents one path into a bypass
   role and the catalog holds **four**: `authenticator → service_role`, which is
   documented, plus `cli_login_postgres → postgres` (a login role, password
   validity expired 2026-08-03 13:03 UTC, and `postgres` carries both
   `rolbypassrls` and the §11.3 ownership bypass), `supabase_storage_admin →
   service_role` (via `authenticator`), and `supabase_realtime_admin →
   service_role` (`NOLOGIN`). Measured with `MEMBER`, and no API-facing role
   reaches any of the three by any chain. Unreachability is not the test §11.5
   sets — the section's own preamble records that four undocumented roles were
   found unreachable at the first gate and were still a failure. **Amend §11,
   re-derive, do not fix the database.** Six platform event triggers, all
   `supabase_admin`-owned, were also found; they fire only on DDL, which no API
   role can issue, and they are offered to the reviewer as a §11 judgement rather
   than asserted as a bypass.
2. **Four checks report success on an empty set** — PR-21's exact shape.
   `check-no-runtime-cdn` and `check-no-hardcoded-literals` say "OK … 0 file(s)"
   with `app/` and `proxy.ts` removed; `check-service-import` says "OK: 0 file(s)
   scanned under []" with every scan root removed, though it correctly fails when
   the quarantine itself is deleted; `check_credentials` says "OK: scanned 0
   file(s)". Nine of thirteen cases already error correctly and are the model.
   Each of the four needs a floor: zero files scanned is a failure, not a pass.
3. **`MODULE_SPEC.md` §1 does not name the root `__tests__/`.** Three tracked
   files live there, one of them the isolation harness, which §P01 lists as a
   phase deliverable. §1's only `__tests__/` is nested under a feature folder.
   Direction one is clean — every folder the tree names that exists is one R1
   needs, and 33 named folders are correctly absent. While the file is open:
   `types/database.ts` is annotated "GENERATED from staging", which ADR-012
   retired, and `DATA_MODEL.md` §5's preamble says "the live staging catalog"
   for the same reason.
4. **CF-98's remedy is available now.** `postcss@8.5.25` and `sharp@0.35.3` clear
   every advisory in the row and are published; `next@16.2.12` is both installed
   and latest and pins `postcss@8.4.31` and `sharp@0.34.5`. PR-25 already
   authorises raising a transitive resolution as maintenance. The gate did not
   take it because this task authorised no dependency work.

Two environment quirks were found and **`PRECEDENTS.md` was not amended**,
because Task E's permitted writes were CF-98, this file and the journal, and it
said "nothing else". They are recorded here so they are not paid for twice, and
the FIX task should land them: the Management API's
`/projects/<ref>/types/typescript` defaults to `public` alone and must be asked
with `?included_schemas=public,graphql_public` to return what the pinned CLI
returns, or a clean drift check reports a false difference; and
`npm audit --json 2>&1` in PowerShell merges npm's stderr warning into the
document, so the JSON fails to parse at character 0.

No new carry-forward rows were landed, for the same reason. Proposed ids for the
FIX task: the §11 gap, the four empty-set checks, and the `__tests__/` omission.

**PR #2 must still not merge**, and the branch is still `phase/01-foundation`.

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
- **CF-98** — owner retargeted at P01-GATE-RERUN to **every phase exit gate**
  until an upstream Next.js release consumes the patched packages. It is no
  longer a P02 bookkeeping act: the acceptance is recorded, and the row now also
  records that a non-regressive remedy exists today under PR-25.
- Also inherited and already open, several explicitly owned by P02 as of
  P01-T05-FIX: **CF-01** and **CF-75** (the deferred rule layer and the two
  always-on rules files, restorable now that `ARCHITECTURE.md` exists),
  **CF-11** and **CF-72** (one `REPORT.md` annotation task, batched), **CF-93**
  gaps 1, 2, 3, 4 and 7, **CF-94** for the `lib/` root, **CF-97** (the scanner
  narrowing, awaiting ratification) and **CF-99** (PR #2) unchanged.
- **CF-99's condition has come due.** Its owner is the owner, to leave PR #2 open
  "until T03 and the phase gate have both passed, or to close it and re-open at
  the gate". T03 has passed; the gate has now run twice and passed neither time.
  This is an owner decision that is now waiting, not a row waiting on a phase.

Preconditions P02 must verify before its first task, each by query rather than by
reading this file: zero tenant rows in `b2s-production`; the isolation suite
green at 31, 0 FAIL, 0 LOST; `SECURITY_MODEL.md` §11 re-derived and matching the
live catalog, since §11.5 binds every gate and P02's exit gate inherits it; every
guard with a live target present and proven by a planted violation; `main` and
`phase/01-foundation` in the state a *passed* gate leaves them, PR #2 unmerged.

**PR #2 must not merge.** The gate has now re-run and returned FAIL, so the
standing verdict is unchanged, and `BRANCHING.md` §3 admits one consolidated PR
per phase at a *passed* exit gate. Isolation being proven is necessary and is not
sufficient. It is still not a draft and still one click from merging, which is
CF-99's amended consequence.
