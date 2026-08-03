# SESSION CONTEXT
Updated: 2026-08-03 · By: Opus · Phase: BUILD — P01 Foundation, in progress ·
Last task: P01-T03 · Verdict: pending

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

> Commit column: one or more comma-separated backticked shas, or `—` where no
> single commit tracks the step (P-00 through P-01c predate the one-task-one-commit
> convention). Several shas mean the step's deliverable, its PR-17 follow-up and,
> where the owner has merged it, the merge commit. The most recent row may read
> `pending` until its follow-up commit fills it (PR-17); `check_done_steps_shape.py`
> exempts the last row for exactly that reason.

## Open carry-forwards — ids only
Full text in `docs/method/CARRY_FORWARDS.md`.

- CF-01 — Reinstate deferred Dev OS security/migration rule layer at P10 — owner: ARCHITECTURE.md, immediately after Gate 3 — the P10 it named does not exist in this plan
- CF-02 — Unescaped innerHTML in all legacy tools — owner: FEATURE_INVENTORY.md must-not-reproduce at P-07
- CF-03 — Legacy catch(e){} swallowing — owner: FEATURE_INVENTORY.md must-not-reproduce at P-07
- CF-05 — Print calibration unresolved until OD-5 signed — owner: PRINT_CONTRACT.md, authored just-in-time per OD-H7; the measurement is B2S_PREPARE_PHASE.md Step 15
- CF-11 — REPORT.md §3.3 "design tools are independent islands" is FALSIFIED for the sticker tool — owner: the REPORT.md annotation task, before Gate 3
- CF-14 — Public repo: owner's given name and local folder path are permanently in git history — owner: RISK_REGISTER.md, authored just-in-time per OD-H7; its gate is the pre-relaunch audit, B2S_PREPARE_PHASE.md §10
- CF-22 — Label-editor vs sticker-tool capability delta — owner: reviewer — verify closure against EXTRACT_DESIGN_TOOLS.md Part 2 at the TEMPLATE_MODEL.md authoring
- CF-32 — CSV import resequenced from void to post-DATA_MODEL feature — owner: IMPORT_SPEC.md, P-10
- CF-39 — `B2S_PREPARE_PHASE.md` §3/§4 now run together with no `---` separator — owner: reviewer, next light edit to `B2S_PREPARE_PHASE.md`
- CF-41 — `B2S_PREPARE_PHASE.md` §1's product-definition table gives the wrong repo URL — owner: the write task that lands CF-39 — P-12
- CF-44 — VOID. Never issued; reviewer numbering error at the P-02 verdict — owner: none — void, retained as a numbering record. Exempt from the reachable-owner test by its VOID status
- CF-46 — EXTRACT_STOCK_COSTS.md §C.4 lists ten findings awaiting accept/reject — owner: reviewer — adjudicate the ten findings at the FEATURE_INVENTORY.md authoring, which is where accepted findings land
- CF-47 — Costing is last-purchase-price-wins by unconditional overwrite — owner: the R2 amendment to CALC_SPEC.md
- CF-50 — AUDIT_STICKER.md §3.4 names the three bb_color_presets seeds wrong — owner: the AUDIT_STICKER.md annotation task, before Gate 3
- CF-51 — Prompt-template defect: "one commit" collides with "do not amend or rewrite history" — owner: reviewer, standing
- CF-53 — `docs/method/PROJECT_RECONFIG.md` was byte-identical to `CLAUDE_PROJECT_INSTRUCTIONS.md` — owner: reviewer, decide at P-12
- CF-54 — Stub count stated three ways — owner: reviewer, verify at Gate 3
- CF-56 — The falsified sticker preset names appear at two locations in AUDIT_STICKER.md — owner: the AUDIT_STICKER.md annotation task, before Gate 3 — same task as CF-50
- CF-58 — `tools/backup-browser-data.js` serves the abandoned browser-data backup workflow — owner: owner decision, retire or keep; landing at the next repo-maintenance task
- CF-60 — Four open rows carry no explicit `Owner:` field (CF-01, CF-05, CF-27, CF-44) — owner: reviewer, before Gate 3
- CF-69 — Invoice history is capped at 100 records with silent destruction — owner: FEATURE_INVENTORY.md must-not-reproduce
- CF-71 — A parse failure is indistinguishable from an empty collection, then saved over real data — owner: FEATURE_INVENTORY.md must-not-reproduce
- CF-72 — REPORT.md citations into the two business tools need re-derivation before use — owner: the REPORT.md annotation task, before Gate 3 — same task as CF-11
- CF-73 — bb-stock-costs.html:5645 ships a corrupted Arabic "full return" string on every printed report — owner: FEATURE_INVENTORY.md must-not-reproduce, UX_PRINCIPLES.md
- CF-74 — Report engine has no resource bundle outside the invoice template; two strings re-declared eight times — owner: DOMAIN_MODEL.md and UX_PRINCIPLES.md
- CF-75 — AGENTS.md and .cursor/rules/b2s-devos.mdc carried folder paths and a named library ahead of ARCHITECTURE.md; rewritten by P-05-PRE — owner: ARCHITECTURE.md, immediately after Gate 3
- CF-83 — Reviewer state assertions are not stamped to a commit — owner: PRECEDENTS.md, PR-18
- CF-84 — A verdict-logged carry-forward is opened as a stub, then re-opened as new by the next prompt — owner: PRECEDENTS.md, PR-19
- CF-92 — ADR-012's reinstatement trigger: the isolation suite may run against production only while it holds zero real tenants, and a staging project exists before the first one — owner: the task onboarding the first non-synthetic tenant, and the Phase 02 exit gate
- CF-93 — Seven specification gaps in DATA_MODEL.md's Platform tier, found by building it; none resolved by invention — owner: reviewer, at the next DATA_MODEL.md amendment
- CF-94 — `check-no-runtime-cdn` and `check-no-hardcoded-literals` scan `app/` and `proxy.ts` only, so `lib/` is unguarded — owner: the next task touching either guard, at the latest the Phase 02 entry checklist
- CF-95 — The deployment and drift pipeline is wired but not live: the Vercel GitHub App is unauthorised and both `types-drift` secrets are unset — owner: the owner, before the Phase 01 exit gate
- CF-96 — `docs/method/REVIEWER_CHAT_INSTRUCTIONS.md` sits untracked in the working tree against PR-14 — owner: the owner, to land it or remove it
- CF-97 — The credential scanner fired on `process.env.SUPABASE_SERVICE_ROLE_KEY`, the safe form ADR-005 requires; the value side now rejects an environment indirection — owner: reviewer, to ratify the narrowing or reject it
- CF-98 — Four open Dependabot alerts on the default branch (3 high, 1 moderate; `postcss` ×3 and `sharp`, both transitive through Next.js), unrecorded since G3-CLOSE enabled alerts — owner: the owner, to authorise a dependency-bump task; at the latest the Phase 01 exit gate
- CF-99 — PR #2 (`main` ← `phase/01-foundation`) exists although P01-T02 forbade a pull request; opened by the owner's account, not the builder, and left untouched. Merging it before T03 lands the tenancy schema on `main` with tenant isolation unproven — owner: the owner, to leave it open until T03 and the phase gate pass, or close and re-open at the gate
- CF-103 — A tenant owner can lock a member of another tenant out of that tenant: `membership_insert_owner` constrains `tenant_id` and the caller's role but not `member_id`, so a second active membership drives the victim's `current_tenant_id()` to null. Proven live by proof 17. Not a `SECURITY_MODEL.md` §1 breach — a cross-tenant availability effect, which §1 does not cover — owner: the session-to-membership binding decision named in CF-93 gap (3)
- CF-104 — `DATA_MODEL.md` §2 narrows operator reach to "metadata columns only" while §3.1, §3.5 and §3.6 specify row-level operator reads, and row-level is what was built; an operator therefore reads every column of `tenant`, `consent_grant` and `activity_event`, `payload` included, for every tenant — owner: reviewer, at the next `DATA_MODEL.md` amendment
- CF-105 — `EXECUTE` on `public` functions defaults to `PUBLIC` and the grants migration's blanket revoke covers tables only, so every `public` function is an RPC endpoint callable by `anon`. All four present today were proven to answer only for their caller; the next one added ships publicly callable unless its migration revokes `execute` — owner: the next migration adding a function to `public`; at the latest the Phase 02 entry checklist
- CF-106 — `@types/node` is pinned to major 20 while the toolchain now declares Node 24, so `typecheck` validates against a standard library four majors behind the runtime. Found while landing CF-102's closure, which fixes the runtime skew and leaves the type skew. Not covered by PR-25 — an alignment, not an advisory — so it flags rather than being bumped here — owner: the next task authorised to change a dependency, naturally CF-98's

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
  assertions, 21 PASS. Re-run with `npm run test:isolation`; it is excluded from
  `npm test` because `ci.yml`'s `unit` job holds no Supabase secrets and a suite
  that skipped there would read as green. `SECURITY_MODEL.md` §4's re-run
  conditions apply: a new entity, any policy or grant change, a new privileged
  path, a role change, or any change to the operator surface re-runs the whole
  gate.

## Next action
P01-T03 done and pushed to `phase/01-foundation`, not merged. Tenant isolation is
proven against the live catalog: 21 assertions, 21 PASS, 0 FAIL, 0 LOST, teardown
verified by query at zero rows and zero `auth.users`. The suite is committed and
re-runnable at `__tests__/isolation/`, and Phase 02 inherits it.

**T04 next.** Three findings are its inbox, and none of them is mine to fix —
a gate that repairs what it finds is not a gate:
- CF-103, the only one with a live effect. Decide whether
  `membership_insert_owner` must constrain `member_id`, together with CF-93 gap
  (3)'s session-to-membership binding, which is the same decision seen from the
  other side.
- CF-104 and CF-105 are a specification conflict and a default, both reviewer
  calls rather than code.

Two owner actions still block the phase gate, both in CF-95: authorise the Vercel
GitHub App on the repository, and set `SUPABASE_ACCESS_TOKEN` and
`SUPABASE_PROJECT_ID` as repository secrets. `types-drift` fails on every run
until then, by design. Both secrets now have a second reader — the isolation
suite needs the same two values, so setting them serves the gate as well as the
drift job.

**PR #2 is still open and still must not be merged (CF-99)** until the phase gate
passes. Isolation is proven, which removes the sharpest reason to hold it, but
`BRANCHING.md` §3 wants one consolidated PR per phase at the exit gate, and `ci`
is still red at `types-drift` until CF-95's secrets are set.
