# SESSION CONTEXT
Updated: 2026-08-01 · By: Sonnet · Phase: PREPARE — Gate 3 closing ·
Last task: G3-CLOSE · Verdict: pending

## Read these too
- `docs/method/PRECEDENTS.md` — binding rulings and environment quirks.
  MANDATORY every session.
- `docs/method/CARRY_FORWARDS.md` — the full carry-forward ledger. Open it
  when your task names a CF, when you land or amend rows, or at a gate.
- `DEVELOPMENT_JOURNAL.md` — append-only narrative history.

This file carries state and open ids only. Narrative belongs in the journal.
Keep it short: if a paragraph is growing here, it belongs elsewhere.

## Where we are
The prepare phase is complete. All eight Gate 3 blocking documents are landed and
authored: `PRODUCT_BRIEF`, `GLOSSARY`, `SCOPE` (22 modules), `DECISIONS` (80
signed ODs), `DOMAIN_MODEL` (87 entities across 9 tiers), `TENANCY_MODEL`,
`SECURITY_MODEL`, and `CALC_SPEC` (25 Release 1 rows, 15 signed calculation
choices, 8 assertable identities). Gate 3 returned one hard failure — missing
rounding rules on 15 of the 25 `CALC_SPEC` rows — and one doc correction, both
closed by G3-FIX. Every other frozen document is authored just-in-time under
OD-H7, one step ahead of the module that needs it.

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
| G3-CLOSE | Secret scanning, push protection, force-push block and Dependabot enabled and verified; CF-85 closed; PR-21; BRANCHING.md | pending | <fill post-commit> |

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

## Next action
GATE 3 VERDICT by the reviewer, on this report. On PASS the prepare phase closes
and `ARCHITECTURE.md`, the first ADRs and the build phase plan begin.
