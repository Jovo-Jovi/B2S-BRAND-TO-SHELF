# SESSION CONTEXT
Updated: 2026-07-29 · By: human · Phase: PRE-P00 · Last task: repo freeze · Verdict: —

## Where we are
Legacy tools frozen in legacy/. Audit docs present but STALE on three files.
Delta audit not yet run. No code exists.

## Active carry-forwards
- [ ] CF-01 — Reinstate deferred Dev OS security/migration rule layer at P10
- [ ] CF-02 — Unescaped innerHTML in all legacy tools; every ported renderer escapes
- [ ] CF-03 — Legacy catch(e){} swallowing; ported paths surface errors
- [ ] CF-04 — Older returns lack outAllocations; both shapes must render
- [ ] CF-05 — Print calibration unresolved until OD-5 signed

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

## Next action
DELTA_RUN_01.md — Pass 1.
