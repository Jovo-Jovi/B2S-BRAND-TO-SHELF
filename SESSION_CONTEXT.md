# SESSION CONTEXT
Updated: 2026-08-01 · By: Sonnet · Phase: PREPARE — blocking set complete ·
Last task: P-07-LAND · Verdict: pending

## Read these too
- `docs/method/PRECEDENTS.md` — binding rulings and environment quirks.
  MANDATORY every session.
- `docs/method/CARRY_FORWARDS.md` — the full carry-forward ledger. Open it
  when your task names a CF, when you land or amend rows, or at a gate.
- `DEVELOPMENT_JOURNAL.md` — append-only narrative history.

This file carries state and open ids only. Narrative belongs in the journal.
Keep it short: if a paragraph is growing here, it belongs elsewhere.

## Where we are
Greenfield. All eight Gate 3 blocking documents are landed: `PRODUCT_BRIEF`,
`GLOSSARY`, `SCOPE`, `DECISIONS`, `DOMAIN_MODEL`, `TENANCY_MODEL`,
`SECURITY_MODEL` and `CALC_SPEC`. `CALC_SPEC.md` carries 25 Release 1
calculation rows, 15 signed calculation choices (CS-15 open), and 8 assertable
identities; eleven of the 25 rows cite no legacy source at all, because tax,
freight, money rounding and real payments never existed in the retiring tools.
Every other frozen document is authored just-in-time, one step ahead of the
module that needs it. Next is Gate 3 on the blocking set.

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
| P-05-LAND | Land PRODUCT_BRIEF, GLOSSARY, SCOPE; promote DECISIONS; archive VOCABULARY_DRAFT | pending | <this commit> |
| P-06a-LAND | Land DOMAIN_MODEL (87 entities); repair 6 stale VOCABULARY_DRAFT refs in CLAUDE_PROJECT_INSTRUCTIONS.md | pending | <this commit> |
| P-06b-LAND | Land TENANCY_MODEL and SECURITY_MODEL; CF-31 closed, CF-77 opened and closed, CF-53 amended | pending | <this commit> |
| P-07-LAND | Land CALC_SPEC (25 rows, CS-01..CS-14 signed); CF-45/62/70 closed, CF-47 amended, CF-78/79 landed | pending | <this commit> |

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
- CF-32 — CSV import resequenced from void to post-DATA_MODEL feature — owner: IMPORT_SPEC.md, P-10
- CF-33 — `docs/method/DEV_OS.md` §3 defines a parity gate that is void — owner: reviewer, before Gate 2
- CF-39 — `B2S_PREPARE_PHASE.md` §3/§4 now run together with no `---` separator — owner: reviewer, next light edit to `B2S_PREPARE_PHASE.md`
- CF-41 — `B2S_PREPARE_PHASE.md` §1's product-definition table gives the wrong repo URL — owner: the write task that lands CF-39 — P-12
- CF-44 — VOID. Never issued; reviewer numbering error at the P-02 verdict — owner: none, no action
- CF-46 — EXTRACT_STOCK_COSTS.md §C.4 lists ten findings awaiting accept/reject — owner: reviewer, Gate 1
- CF-47 — Costing is last-purchase-price-wins by unconditional overwrite — owner: the R2 amendment to CALC_SPEC.md
- CF-50 — AUDIT_STICKER.md §3.4 names the three bb_color_presets seeds wrong — owner: Gate 1, then P-07
- CF-51 — Prompt-template defect: "one commit" collides with "do not amend or rewrite history" — owner: reviewer, standing
- CF-52 — The owner's OS account name appears in mutable public files beyond AUDIT_STICKER.md:651 — owner: reviewer, closes on P-04c verdict
- CF-53 — `docs/method/PROJECT_RECONFIG.md` was byte-identical to `CLAUDE_PROJECT_INSTRUCTIONS.md` — owner: reviewer, decide at P-12
- CF-54 — Stub count stated three ways — owner: reviewer, verify at Gate 3
- CF-56 — The falsified sticker preset names appear at two locations in AUDIT_STICKER.md — owner: reviewer, closes on P-04c verdict
- CF-58 — `tools/backup-browser-data.js` serves the abandoned browser-data backup workflow — owner: reviewer, closes on P-04c verdict
- CF-60 — Four open rows carry no explicit `Owner:` field (CF-01, CF-05, CF-27, CF-44) — owner: reviewer, before Gate 3
- CF-69 — Invoice history is capped at 100 records with silent destruction — owner: FEATURE_INVENTORY.md must-not-reproduce
- CF-71 — A parse failure is indistinguishable from an empty collection, then saved over real data — owner: FEATURE_INVENTORY.md must-not-reproduce
- CF-72 — REPORT.md citations into the two business tools need re-derivation before use — owner: annotate REPORT.md at P-05
- CF-73 — bb-stock-costs.html:5645 ships a corrupted Arabic "full return" string on every printed report — owner: FEATURE_INVENTORY.md must-not-reproduce, UX_PRINCIPLES.md
- CF-74 — Report engine has no resource bundle outside the invoice template; two strings re-declared eight times — owner: DOMAIN_MODEL.md and UX_PRINCIPLES.md
- CF-75 — AGENTS.md and .cursor/rules/b2s-devos.mdc carried folder paths and a named library ahead of ARCHITECTURE.md; rewritten by P-05-PRE — owner: ARCHITECTURE.md, immediately after Gate 3

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
  through CS-14 SIGNED 2026-08-01 by the owner. CS-15 (return recognition
  period) is OPEN and affects R1-19 only.
- Gate 3's `CALC_SPEC.md` checklist item still reads as written in
  `B2S_PREPARE_PHASE.md`. Whether it covers the fourteen R2 rows in
  `CALC_SPEC.md` §6 or only the 25 R1 rows is UNSIGNED and must be resolved
  before the Gate 3 verdict.

## Next action
GATE 3 on the blocking set. Two items must be resolved first, both owner
signatures: CS-15, and whether Gate 3's `CALC_SPEC.md` item covers R2 rows.
