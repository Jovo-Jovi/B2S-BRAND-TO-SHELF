# SESSION CONTEXT
Updated: 2026-07-30 · By: agent · Phase: PREPARE Step 3 · Last task: P-01c · Verdict: pending

## Where we are
Greenfield pivot: parity against the six legacy HTML tools is void (OD B1
CLOSED). B2S — Brand to Shelf is a new multi-tenant white-label product; the
legacy tools are retiring, not being ported, and their audit docs are demoted
to requirements evidence. The repo was renamed from `balance-bites-unified` to
`B2S-BRAND-TO-SHELF` (github.com/Jovo-Jovi/B2S-BRAND-TO-SHELF), branch `main`,
public. P-01 restructured the tree: `docs/requirements/`,
`docs/requirements/extracts/`, `docs/archive/2026-07/` and `docs/product/`
created; stale/void method docs and audit outputs archived with an ARCHIVED
banner; requirements-evidence files carry a REQUIREMENTS EVIDENCE banner;
`RETURNS_ADDENDUM.md` → `RETURNS_REQUIREMENTS.md`, `BB_DEV_OS.md` → `DEV_OS.md`,
`.cursor/rules/bb-*.mdc` → `.cursor/rules/b2s-*.mdc`; `RUNBOOK.md` and the old
Claude Project Instructions archived, the new instructions landed at
`docs/method/CLAUDE_PROJECT_INSTRUCTIONS.md`, and `VOCABULARY_DRAFT.md` landed
at `docs/product/`. 23 stub files created under `docs/product/` and
`docs/method/`, pending reviewer authorship. `legacy/FREEZE.md` rewritten to
state the tools are retiring, not port targets. P-01 verdict: PASS. P-01b
closed CF-36 and CF-37: `docs/archive/2026-07/inventory.json`'s banner was
reverted so it parses as valid JSON again, with a new
`docs/archive/2026-07/README.md` covering the whole directory instead;
`B2S_PREPARE_PHASE.md` §2's decision register was updated — D10, E11, G10,
G11 (PROPOSED) and E2, E6, H1, H6 (DELEGATED) are now SIGNED, and C16-C19,
E12, G12 were added SIGNED, at that point with the opening line reading "62
decisions" and placeholder Decision text ("SIGNED — see DECISIONS.md") on the
six new rows. P-01b verdict: PASS, with the 56/62 header-vs-row-count
mismatch logged as CF-38. P-01c closed CF-38: root cause was that the
original "56" count summed Groups A-F only and omitted G and H (true
pre-existing total was 73; 79 with the six vocabulary-pass rows). The
register's opening line, the P-06 authoring prompt, and the Gate 3 checklist
now all read 79, matching an independently recomputed row count of 79. §3
("Still open") now reads "none" — its prior four items (D10, G10, E11,
§5 sign-off) are all resolved elsewhere in the document. §5 (Release 1) is
now headed "SIGNED 2026-07-30", with `CreditNote` added to the IN list and
`Shipment` (R1 at data level, R2 UI) confirmed in the OUT-R2 list. The six
C16-C19/E12/G12 placeholder cells now carry real decision text. §7 gained a
stock-creation invariant naming the one write path into `StockLevel`. The
untracked reconfiguration record landed at `docs/method/PROJECT_RECONFIG.md`.
All commits through P-01c are pushed to `origin/main`.

## Active carry-forwards
- [ ] CF-01 — Reinstate deferred Dev OS security/migration rule layer at P10
- [ ] CF-02 — Unescaped innerHTML in all legacy tools; every ported renderer escapes
- [ ] CF-03 — Legacy catch(e){} swallowing; ported paths surface errors
- [ ] CF-04 — Older returns lack outAllocations; both shapes must render
- [ ] CF-05 — Print calibration unresolved until OD-5 signed
- [ ] CF-11 — REPORT.md §3.3 "design tools are independent islands" is FALSIFIED
      for the sticker tool: legacy/balance-bites-sticker.html carries the shared
      folder path (:1138), bb_filestore_v1, showDirectoryPicker, bb_stickers,
      BBLabelDB, bbbacklabel. Mechanism undocumented. Owner: Pass 1 §3.1/§3.2
      documents it; Pass 3 rewrites §3.3; Pass 4 verifies.
- [ ] CF-12 — REPORT.md §1 and inventory.json meta line counts are wrong by ~3,953
      lines (stock 5577→7084, invoice-pro 3498→4284, sticker 3701 unlisted;
      total 14529→~18482). Owner: Pass 3.
- [x] CF-13 — CLOSED (P-01). RUNBOOK.md was uncommitted and carried stale/void
      steps contradicting current decisions (§1.1 backup, §1.3 PRIVATE +
      `master`, §2.4 backup diff). Superseded by `docs/method/B2S_PREPARE_PHASE.md`
      and archived at `docs/archive/2026-07/RUNBOOK.md` with an ARCHIVED banner.
- [ ] CF-14 — Public repo: owner's given name and local folder path are permanently
      in git history across 4 files. Not remediable by going private. Owner: OD-13.
- [ ] CF-22 — Label-editor vs sticker-tool capability delta. Owner: P-04.
- [x] CF-25 — CLOSED (confirmed by P-01). `.gitattributes` exists at repo root
      with the exact required content; `git add --renormalize .` verified to
      produce zero diff. No line-ending commit needed.
- [ ] CF-27 — Minor Pass 1 scope bleed. Noted, no action.
- [ ] CF-28 — Terminology collision: "customer" means tenant and buyer. Owner:
      GLOSSARY.md, P-05.
- [ ] CF-29 — 13 modules missing from the module map. Owner: SCOPE.md, P-06.
- [ ] CF-30 — Design Assistant has no OD. Owner: P-06.
- [ ] CF-31 — RLS correctness is an ungated gate today. Owner: SECURITY_MODEL.md, P-08.
- [ ] CF-32 — CSV import resequenced from void to post-DATA_MODEL feature. Owner:
      IMPORT_SPEC.md, P-10.
- [ ] CF-33 — `docs/method/DEV_OS.md` §3 (renamed from `BB_DEV_OS.md` by P-01)
      defines a parity gate that is void, but P-01 explicitly changes no rule
      substance so the void gate is still live text in an in-force document.
      Overridden in the new `CLAUDE_PROJECT_INSTRUCTIONS.md` Instructions field;
      the file itself still needs amendment and re-upload. Owner: reviewer,
      before Gate 2.
- [x] CF-34 — CLOSED (reviewer verdict on P-01; P-01 amendment A6). The P-00
      report correctly flagged an unresolved conflict between the canonical
      P-01 "author no document content" restriction and AGENTS.md §0/§9's
      mandatory session-end update of `SESSION_CONTEXT.md` and
      `DEVELOPMENT_JOURNAL.md`. Resolved: P-01's amended prompt explicitly
      authorizes and requires both updates.
- [x] CF-35 — CLOSED (reviewer verdict on P-01; P-01 amendment A7). The P-00
      report flagged that a platform-appended `Co-authored-by: Cursor` trailer
      could not be stripped without a blocked `git commit --amend`, in tension
      with an "exact commit message" instruction. Resolved: platform trailers
      are accepted; subject-line match is sufficient. No history rewrite
      performed or required.
- [x] CF-36 — CLOSED (P-01b). `B2S_PREPARE_PHASE.md` §2's decision register
      was stale: four PROPOSED and four DELEGATED items plus six missing ODs
      (C16-C19, E12, G12) raised in `VOCABULARY_DRAFT.md` §2.2. All eleven
      status changes applied and the six new rows added; opening line now
      reads "62 decisions, all signed. None open." The six new rows' Decision
      column cites the open question from `VOCABULARY_DRAFT.md` §2.2 rather
      than a resolution, and their Status column reads "SIGNED — see
      DECISIONS.md" — the actual reviewer-verdict resolution text for
      C16-C19/E12/G12 was not available to this task, per its own fallback
      instruction. Flagged, not fabricated.
- [x] CF-37 — CLOSED (P-01b). `docs/archive/2026-07/inventory.json` was
      invalid JSON after P-01's banner prepend. Banner reverted (verified with
      a Python `json.load` parse check — valid), and
      `docs/archive/2026-07/README.md` added to cover the whole archive
      directory, explicitly noting `inventory.json` carries no inline banner.
      The six archived `.md` files keep their banners unchanged.
- [x] CF-38 — CLOSED (P-01c). Raised by the P-01b reviewer verdict (recorded
      there only as "CF-38 new", no description landed in this file until
      now — inferred from context and closed in the same edit). The decision
      register's own header undercounted its row count: "56" pre-P-01b and
      "62" post-P-01b against an actual 73-row-then-79-row table. Root cause:
      the original count summed Groups A-F only, omitting Groups G and H.
      Fixed by correcting the header, the P-06 prompt, and the Gate 3
      checklist to "79", independently verified against the actual row count.

## Environment quirks (never re-discover)
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

## Frozen decisions in force
- Freeze point set 2026-07-29 (legacy/FREEZE.md, rewritten by P-01 — tools are
  RETIRING, not port targets).
- Decision register in `docs/method/B2S_PREPARE_PHASE.md` §2: 79 decisions,
  all SIGNED, none open (closed by P-01b / CF-36, header corrected by P-01c /
  CF-38). D10, E11, G10, G11 (was PROPOSED) and E2, E6, H1, H6 (was DELEGATED)
  are SIGNED; C16-C19, E12, G12 added SIGNED with real decision text (P-01c).
  The header now reads "79 decisions, all signed. None open." — matches an
  independently recomputed row count of 79. §3 now reads "Still open — none";
  its prior four items (D10, G10, E11, §5 sign-off) are each resolved
  elsewhere in the document. §5 (Release 1) is SIGNED 2026-07-30. OD-13
  (repository visibility) is superseded: the repo is now G7 SIGNED **public**
  by design, not a private/public toggle under owner discretion.
- Still open: none. `CALC_SPEC.md` (Step 11) remains the only owner-authored
  document; it blocks the build, not the freeze.

## Next action
Reviewer verdict on P-01c, then P-02.
