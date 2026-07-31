# SESSION CONTEXT
Updated: 2026-07-31 · By: Sonnet · Phase: PREPARE Step 7d ·
Last task: P-04d · Verdict: pending

## Read these too
- `docs/method/PRECEDENTS.md` — binding rulings and environment quirks.
  MANDATORY every session.
- `docs/method/CARRY_FORWARDS.md` — the full carry-forward ledger. Open it
  when your task names a CF, when you land or amend rows, or at a gate.
- `DEVELOPMENT_JOURNAL.md` — append-only narrative history.

This file carries state and open ids only. Narrative belongs in the journal.
Keep it short: if a paragraph is growing here, it belongs elsewhere.

## Where we are
Greenfield. The six legacy HTML tools are retiring, not being ported;
parity is void (B1 CLOSED). Requirements extraction is complete for all
five read tools. The decision register holds 79 signed decisions, none
open. All 23 document stubs await reviewer authorship. Next gate is
GATE 1 — extraction verification.

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
| P-04d | Memory guard restructure | pending | <this commit> |

## Open carry-forwards — ids only
Full text in `docs/method/CARRY_FORWARDS.md`.

- CF-01 — Reinstate deferred Dev OS security/migration rule layer at P10 — owner: none stated
- CF-02 — Unescaped innerHTML in all legacy tools — owner: FEATURE_INVENTORY.md must-not-reproduce at P-07
- CF-03 — Legacy catch(e){} swallowing — owner: FEATURE_INVENTORY.md must-not-reproduce at P-07
- CF-04 — Older returns lack outAllocations; both shapes must render — owner: Gate 1 read, then DOMAIN_MODEL.md at P-07
- CF-05 — Print calibration unresolved until OD-5 signed — owner: none stated
- CF-11 — REPORT.md §3.3 "design tools are independent islands" is FALSIFIED for the sticker tool — owner: P-04 Part 8, closes at Gate 1
- CF-14 — Public repo: owner's given name and local folder path are permanently in git history — owner: RISK_REGISTER.md at P-05, replacement OD at P-06
- CF-22 — Label-editor vs sticker-tool capability delta — owner: P-04
- CF-27 — Minor Pass 1 scope bleed — owner: none stated (no action)
- CF-28 — Terminology collision: "customer" means tenant and buyer — owner: GLOSSARY.md, P-05
- CF-29 — 13 modules missing from the module map — owner: SCOPE.md, P-06
- CF-30 — Design Assistant has no OD — owner: P-06
- CF-31 — RLS correctness is an ungated gate today — owner: SECURITY_MODEL.md, P-08
- CF-32 — CSV import resequenced from void to post-DATA_MODEL feature — owner: IMPORT_SPEC.md, P-10
- CF-33 — `docs/method/DEV_OS.md` §3 defines a parity gate that is void — owner: reviewer, before Gate 2
- CF-39 — `B2S_PREPARE_PHASE.md` §3/§4 now run together with no `---` separator — owner: reviewer, next light edit to `B2S_PREPARE_PHASE.md`
- CF-41 — `B2S_PREPARE_PHASE.md` §1's product-definition table gives the wrong repo URL — owner: the write task that lands CF-39 — P-12
- CF-42 — EXTRACT_STOCK_COSTS.md Part 7 rolls up the Arabic-only remainder as category inventories — owner: reviewer, Gate 1
- CF-44 — VOID. Never issued; reviewer numbering error at the P-02 verdict — owner: none, no action
- CF-45 — No tax, discount or freight calculation exists in bb-stock-costs.html — owner: Step 11
- CF-46 — EXTRACT_STOCK_COSTS.md §C.4 lists ten findings awaiting accept/reject — owner: reviewer, Gate 1
- CF-47 — Costing is last-purchase-price-wins by unconditional overwrite — owner: P-06, with the calculation at Step 11
- CF-48 — The producer of bb_invoice_payments is unidentified — owner: reviewer, Gate 1; then DOMAIN_MODEL.md at P-07
- CF-49 — bb_color_presets is written by both business tools with incompatible field sets — owner: reviewer at Gate 1, then DOMAIN_MODEL.md at P-07
- CF-50 — AUDIT_STICKER.md §3.4 names the three bb_color_presets seeds wrong — owner: Gate 1, then P-07
- CF-51 — Prompt-template defect: "one commit" collides with "do not amend or rewrite history" — owner: reviewer, standing
- CF-52 — The owner's OS account name appears in mutable public files beyond AUDIT_STICKER.md:651 — owner: reviewer, closes on P-04c verdict
- CF-53 — `docs/method/PROJECT_RECONFIG.md` was byte-identical to `CLAUDE_PROJECT_INSTRUCTIONS.md` — owner: reviewer, decide at P-12
- CF-54 — Stub count stated three ways — owner: reviewer, verify at Gate 3
- CF-55 — SESSION_CONTEXT.md grows every task because the full ledger lived inside it — owner: owner signature, then a dedicated task
- CF-56 — The falsified sticker preset names appear at two locations in AUDIT_STICKER.md — owner: reviewer, closes on P-04c verdict
- CF-57 — Extraction density drifted across the three passes — owner: reviewer, Gate 1
- CF-58 — `tools/backup-browser-data.js` serves the abandoned browser-data backup workflow — owner: reviewer, closes on P-04c verdict
- CF-59 — The reviewer surface can read the public repo directly — owner: OD at P-06

## Frozen decisions in force
- Freeze point 2026-07-29 (`legacy/FREEZE.md`) — tools RETIRING, not port
  targets.
- Decision register `docs/method/B2S_PREPARE_PHASE.md` §2: **79 decisions,
  all SIGNED, none open.** §5 Release 1 SIGNED 2026-07-30.
- Reviewer direct repo read SIGNED 2026-07-31 — PR-09.
- Memory guard restructure SIGNED 2026-07-31 — this file, CF-55.
- `CALC_SPEC.md` (Step 11) is the only owner-authored document. It blocks
  the build, not the freeze.

## Next action
GATE 1 — extraction verification, run by the reviewer via direct repo read.
