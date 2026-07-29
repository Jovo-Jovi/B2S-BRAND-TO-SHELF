# FREEZE POINT
Frozen: 2026-07-29. The port is built and parity-tested against these files.
Any change to a legacy tool after this date requires a numbered delta audit
and a signed OD amendment.

MISSING: balance-bites-label-v3.html — deleted permanently 2026-07-29, replaced by
balance-bites-sticker.html. Its only surviving record is docs/REPORT.md §2.2.

NO BROWSER BACKUP EXISTS. The browser-data backup (RUNBOOK §1.1) was deliberately
SKIPPED by owner decision on 2026-07-29. bb-browser-data-backup-*.json was never
created and is not in this repo. The bbbacklabel_* localStorage keys and the
BBLabelDB IndexedDB database may still exist in the owner's Brave profile, but
this is UNVERIFIED and those presets are accepted as potentially unrecoverable.
The P02 preset importer (T02.2) still sweeps these keys; an empty result is
expected and is not a failure. Business data is unaffected — it lives as
bb_*.json in the shared folder.

The bbbacklabel_pb3 -> bbbacklabel_pb -> bbbacklabel_pb2 fallback order survives
ONLY in docs/REPORT.md §2.2D. Do not lose it. Carried as CF-08.