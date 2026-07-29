# SESSION CONTEXT
Updated: 2026-07-29 · By: human · Phase: PRE-P00 · Last task: session-zero SESSION_CONTEXT · Verdict: —

## Where we are
Legacy tools frozen in legacy/. Audit docs present but STALE on three files.
Delta audit not yet run. No code exists.

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
- [ ] CF-13 — RUNBOOK.md is uncommitted and carries three void/incorrect steps:
      §1.1 (backup skipped), §1.3 (says PRIVATE and `git branch -M main`; repo is
      public on master), §2.4 (backup diff impossible). Owner: commit a corrected
      copy at docs/method/RUNBOOK.md.
- [ ] CF-14 — Public repo: owner's given name and local folder path are permanently
      in git history across 4 files. Not remediable by going private. Owner: OD-13.

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

## Frozen decisions in force
- Freeze point set 2026-07-29 (legacy/FREEZE.md). None signed yet — OD-1..OD-12 open.
- OD-13 proposed 2026-07-29 (repository visibility) — UNSIGNED.
  OD-13 — Repository visibility. Is balance-bites-unified public or private for the
  duration of the port? If public: confirm that legacy tool source, business logic,
  and brand assets are acceptable to disclose, and that already-pushed content is
  treated as permanently disclosed. If private: revert now and treat commit 52fa6eb's
  contents as already public.

## Next action
DELTA_RUN_01.md — Pass 1.
