> **REQUIREMENTS EVIDENCE.** Extracted from a retiring tool. Records what the
> tool did and what its owner expects. NOT a specification, NOT current truth,
> NOT a parity target. Where this conflicts with a frozen document in
> docs/product/, the frozen document wins.

# AUDIT — `legacy/balance-bites-sticker.html`

**Pass:** DELTA_RUN_01 Pass 1 · **Date:** 2026-07-29 · **Model class:** HEAVYWEIGHT (Opus, extended reasoning)
**Mode:** READ-ONLY audit + supersession analysis. No fixes proposed. No `.html` file touched.
**Citation convention:** a bare `:NNN` is a line in `legacy/balance-bites-sticker.html`. Any other file is named in full.
**Reference for the removed tool:** `docs/REPORT.md` §2.2 only. Where §2.2 is silent, this report says **not recorded**.

---

## 0. LIVE DATA-LOSS RISK — read before anything else

Two paths in this file destroy data that no other artifact holds. Both run without a confirmation prompt.

### RISK-1 — `migrateLegacyPresets()` deletes the `bbbacklabel_*` localStorage keys, and silently drops any preset whose name collides

`migrateLegacyPresets()` (`:3613-3643`) runs **unconditionally on every page load**, from the init IIFE at `:3673`.

- `:3615` sweeps `['bbbacklabel_pb3','bbbacklabel_pb','bbbacklabel_pb2']` — the exact fallback order REPORT.md §2.2D records for label-v3 (`label-v3:2011-2021`).
- `:3618` reads each key from `localStorage`.
- `:3621` **skips** any preset whose `name` already exists in `bb_label_templates`: `if(LabelTemplateMgr.findByName(p.name||'')) continue;`
- `:3628` then deletes the whole key: `if(old.length) localStorage.removeItem(oldKeys[ki]);`

The skip at `:3621` is not an error — it is a silent `continue`. The `removeItem` at `:3628` is gated only on `old.length`, **not** on whether every preset in that key was actually migrated. So any legacy preset whose name collides with an existing template is discarded and its source key is deleted in the same pass. There is no undo, no log, and no surviving copy.

`:3629` is `}catch(e){}` — an exception mid-key aborts that key's loop *before* `removeItem`, so the key survives. That is the safer failure mode, but it is accidental, not designed.

**Trigger in the UI:** none. Opening the file is sufficient.

### RISK-2 — `tmplSave()` overwrites an existing template when the name matches, with no prompt

`tmplSave()` (`:3226-3270`), when no template is currently loaded:

- `:3252` `var existing=LabelTemplateMgr.findByName(name);`
- `:3253` `if(existing) currentTemplateId=existing.id;`
- `:3255` `LabelTemplateMgr.update(currentTemplateId, …{state: …})`

Typing an existing template's name into `#tmplNameInp` (`:442`) and pressing 💾 Save (`:443`) replaces that template's entire state. Name is the de-facto identity key throughout: import dedupe (`:3390`, `:3484`), migration dedupe (`:3621`, `:3635`), and the folder filename (`:1152`, `:3295`).

**Trigger in the UI:** 💾 Save (`:443`) or the quick-bar save.

### What is NOT destroy-capable

`BBLabelDB` is opened **read-only**. `dbInit` (`:1267`) and `_dbList` (`:1268`) are the only two functions that touch it. There is no `put`, no `delete`, no `clear`, and no `deleteDatabase` anywhere in the file (verified by exhaustive grep — the only `indexedDB.` call sites are `:1142` for `bb_filestore_v1` and `:1267` for `BBLabelDB`). See §1.3 for the full trace.

---

## 1. Pre-flight verification

### 1.a `legacy/` manifest — PASS

Seven entries, exactly as required:

| Entry | On-disk bytes |
|---|---|
| `FREEZE.md` | 1,090 |
| `balance-bites-carton (2).html` | 37,279 |
| `balance-bites-invoice-pro.html` | 222,321 |
| `balance-bites-label-editor- latest.html` | 94,933 |
| `balance-bites-stand.html` | 65,520 |
| `balance-bites-sticker.html` | 225,001 |
| `bb-stock-costs.html` | 347,339 |

No extra entries, no missing entries.

### 1.b `balance-bites-label-v3.html` — ABSENT, confirmed

Not present anywhere in the working tree (recursive filesystem search including hidden files) and not present in git history under any path (`git log --all --diff-filter=A --name-only -- "*label-v3*"` returns empty). It was never committed. Not opened, not recovered, not reconstructed.

### 1.c `bb-browser-data-backup-*.json` — ABSENT, confirmed

No such file anywhere in the repository. This is the expected state per the owner decision recorded in `legacy/FREEZE.md`; no escalation is triggered.

### 1.d `legacy/FREEZE.md` MISSING section — quoted verbatim

> MISSING: balance-bites-label-v3.html — deleted permanently 2026-07-29, replaced by
> balance-bites-sticker.html. Its only surviving record is docs/REPORT.md §2.2.
>
> NO BROWSER BACKUP EXISTS. The browser-data backup (RUNBOOK §1.1) was deliberately
> SKIPPED by owner decision on 2026-07-29. bb-browser-data-backup-*.json was never
> created and is not in this repo. The bbbacklabel_* localStorage keys and the
> BBLabelDB IndexedDB database may still exist in the owner's Brave profile, but
> this is UNVERIFIED and those presets are accepted as potentially unrecoverable.
> The P02 preset importer (T02.2) still sweeps these keys; an empty result is
> expected and is not a failure. Business data is unaffected — it lives as
> bb_*.json in the shared folder.
>
> The bbbacklabel_pb3 -> bbbacklabel_pb -> bbbacklabel_pb2 fallback order survives
> ONLY in docs/REPORT.md §2.2D. Do not lose it. Carried as CF-08.

**Document-defect check:** FREEZE.md does **not** claim a browser backup exists. It states the opposite, correctly and in full, and its claim matches the filesystem. **No document defect found in FREEZE.md.** Its statement that the fallback order "survives ONLY in docs/REPORT.md §2.2D" is now factually stale in one direction — the order also survives in live code at `:3615` — but that is a fact about the new file, not a defect in FREEZE.md, which was written before this audit read the new file. Recorded as a finding for Pass 3, not acted on here.

### 1.e Read completeness

**10 sequential chunks**, no sampling:

| Chunk | Lines | Chunk | Lines |
|---|---|---|---|
| 1 | 1–400 | 6 | 2001–2400 |
| 2 | 401–800 | 7 | 2401–2800 |
| 3 | 801–1200 | 8 | 2801–3200 |
| 4 | 1201–1600 | 9 | 3201–3500 |
| 5 | 1601–2000 | 10 | 3501–3701 |

**The final chunk reached line 3701, confirmed.** Line 3699 is `</body>`, line 3700 is `</html>`, line 3701 is the trailing empty line after the file's final CRLF.

### 1.f Size reconciliation — the brief's byte figure is correct, not a defect

The brief states 3,701 lines / 221,301 bytes. On disk the file is **225,001 bytes**; git's blob is **221,301 bytes** (`git cat-file -s 8612d8c`). The difference is exactly 3,700 bytes — one CR per line terminator. The file has 3,700 CRLF terminators and zero bare LFs, so the LF-normalized (git) size is 221,301 and the CRLF (disk) size is 225,001. Both figures are right; they measure different things. No `.gitattributes` exists, so git stored the file byte-for-byte and normalization is a display artifact of `cat-file -s` on the stored blob.

The same off-by-one line convention applies throughout: `System.IO.File.ReadAllLines` yields 3,700 entries; the editor shows 3,701 lines because it counts the empty final line. REPORT.md §1 uses the editor convention (label-v3 = 2041), so this report does too, and all `:NNN` citations are editor/reader line numbers, which agree 1:1 for lines 1–3700.

---

# PART 1 — SUPERSESSION ANALYSIS

## 1.1 Capability delta

Every label-v3 capability below is quoted or paraphrased from REPORT.md §2.2 and cited to §2.2's own line references. No claim about label-v3 originates anywhere else.

### Verdict table

| # | label-v3 capability (per REPORT §2.2) | Verdict | Where in sticker tool |
|---|---|---|---|
| 1a | Rectangular back label, `sW`×`sH` cm (`label-v3:436-437`) | **PRESENT** | `:736-737` (`sW`, `sH`) |
| 1b | Tapered/conical cup unwrap (`label-v3:448-456`) | **PRESENT** | `:748-757` (all five variables + a sixth) |
| 1c | Circular seal/dimension sticker, `tSz`, logo `BB` (`label-v3:684-697`) | **CHANGED** | split into two modes: `:974-979` + `:992`, and `:1011-1020` |
| 1d | Custom size, `cW`/`cH` (`label-v3:724-725`) | **ABSENT as a mode** | `cW`/`cH` survive at `:1019-1020` but are the Circle mode's own dimensions |
| 2 | Conical unwrap math + live debug readout (`label-v3:911-962`) | **PRESENT** | `calcTaper()` `:2218-2263`; readout `:2256-2261` |
| 3 | Exact-cm `@page` printing + PPC approach (`label-v3:1590-1600`) | **PRESENT** | `:2894-2901`; PPC `:2219`, `:2519`, `:2842`, `:2874` |
| 4 | PNG export via `dom-to-image` (`label-v3:1756-1767`) | **PRESENT** | `exportPNG()` `:3063-3123`; CDN `:6` |
| 5 | Crop modes incl. exact crop with 3 mm safety buffer (`label-v3:467`) | **CHANGED** | `:766-772` (5 options); buffer `:2899` |
| 6 | IndexedDB preset storage `BBLabelDB` / `presets` / keyPath `name` (`label-v3:856-857`) | **CHANGED** | `:1267` — same schema, **read-only, migration source only** |
| 7 | 30-slot preset bar with single + bulk export (`bbbacklabel` / `bbbacklabel_bulk`) | **CHANGED (single) / ABSENT (30-slot cap, bulk export)** | single `:2138`, `:3366-3383`; no cap; no bulk export |
| 8 | Legacy migration sweep `bbbacklabel_pb3 → _pb → _pb2` (`label-v3:2011-2021`) | **PRESENT** | `:3613-3643`, key order at `:3615` |
| 9 | Bilingual paired EN/AR fields with per-field `dir="rtl"` | **PRESENT** | `:647-649`, `:676-678`, `:689-690`, `:702-708`, `:914` |
| 10 | Defaults: back 17×4.5 cm; cup Ø9 top / Ø7 bot / H9 / label 7 cm | **PRESENT** | `:736-737` = 17 / 4.5; `:748-753` = 9.0 / 7.0 / 9.0 / 7.0 |

### Per-item detail

**1a — Rectangular back label: PRESENT.** `:736` `id="sW" value="17"` range 8–40 step 0.5; `:737` `id="sH" value="4.5"` range 2–12 step 0.5. Same variable names as §2.2 records, same defaults. Consumed by `getDims()` at `:2848`.

**1b — Tapered/conical cup unwrap: PRESENT.** All five variables §2.2 names survive with identical ids: `tpDTop` `:748`, `tpDBot` `:749`, `tpCupH` `:752`, `tpLblH` `:753`, `tpOffsetBot` `:756`. A sixth control is new: `tpWrap` (`:757`), a 20–100 % slider for "Label Wrap % of circumference", default 85. Mode entered via the `chkTapered` toggle at `:727`, handler `onTaperedToggle()` `:2176-2183`.

**1c — Circular seal: CHANGED.** label-v3 had one circular mode driven by `tSz` with logo text `BB` (§2.2B, `label-v3:684-697`). The sticker tool splits that into two independent modes:
- **Top Label** (`:467` button, `:970-1005` panel): `tShape` round/square `:974-977`, `tSz` default **4.0 cm** `:979`, logo text `tLogoTxt` default `BB` `:992`. Rendered by `buildTopLabel()` `:2645-2669`, sized square from `tSz` at `:2843`.
- **Circle Label** (`:468` button, `:1007-1101` panel): `cShape` circle/square-rectangle `:1011-1014`, independent `cW`/`cH` `:1019-1020` (default 6×6 cm), plus a border-radius slider `:1016`. Rendered by `buildCircleLabel()` `:2672-2749`, sized at `:2845-2846`.

So `tSz` and the `BB` logo text both survive, but the mode they belonged to has been divided, and the Circle mode gained a substantial independent feature set (product photo `:1046`, flavour text `:1059`, product name `:1063`, two dates `:1094-1095`, its own QR block `:1086-1090`).

**1d — Custom size: ABSENT as a mode.** There are exactly three modes (`:466-468`, enumerated in `DESIGN_SPECS` `:1128-1132` as `circle`/`back`/`top`). There is no fourth free-form mode. The variable names `cW`/`cH` that §2.2 attributes to label-v3's custom mode (`label-v3:724-725`) exist at `:1019-1020` but belong to the Circle mode and are constrained to 3–25 cm. The rectangular mode's `sW`/`sH` are constrained to 8–40 × 2–12 cm (`:736-737`). See §1.2 for the consequence.

**2 — Conical unwrap math: PRESENT, and more fully instrumented than §2.2 records.** `calcTaper()` `:2218-2263` computes, in order:
- slant height of the full cup `L_cup` `:2228`
- apex distance `R_apex_cm` `:2230`
- radii at the label's bottom and top edges by linear interpolation `:2236-2237`
- inner/outer arc radii **`R2_cm`** `:2240` and **`R1_cm`** `:2241`
- label slant height `:2242`
- **arc degrees** `:2244`
- pixel radii `:2246`, chord widths `:2250-2251`
- **bounding box** `bbW_cm` `:2252`, `bbH_cm` `:2253`

The **live debug readout** is `#tpCalcBox` (`:759`), written at `:2256-2261` with R1, R2, arc degrees, top chord in px and cm, BBox, label slant height and wrap %. A second live readout, `#sizeInfo` (`:474`), shows the tapered BBox at `:2906-2909`. The derivation is documented in a comment block at `:2210-2217`. A degenerate-geometry guard exists at `:2225` (`if(dTop<=dBot+0.01){dTop=dBot+0.1;}`), which silently mutates the user's top diameter rather than reporting the problem.

**3 — Exact-cm `@page` + PPC: PRESENT.** `render()` injects a `#dynPrint` style element (`:2867-2868`) and writes one of four `@page` rules: A4 portrait `:2894`, US Letter portrait `:2895`, A3 portrait `:2896`, or exact `@page{size:<bw>cm <bh>cm;margin:0}` `:2901`. `page-break-inside:avoid` is applied to the label boxes at `:2891`, matching what §2.2F records for `label-v3:1590`. PPC is `37.795`, defined **four separate times** as a function-local constant: `:2219`, `:2519`, `:2842`, `:2874`.

**4 — PNG export via `dom-to-image`: PRESENT and improved.** `exportPNG()` `:3063-3123` calls `domtoimage.toPng` at `:3090` (tapered/SVG path) and `:3101` (HTML path) at `quality: 1.0`, matching §2.2B. Improvements over what §2.2 records: a 4× supersampling factor `:3075`, `await document.fonts.ready` before capture `:3074`, a separate SVG path that scales the SVG's own `width`/`height` attributes so `foreignObject` content re-renders at 4× rather than being bitmap-scaled `:3080-3095`, and a real error path (`console.error` + user toast) at `:3119-3122` instead of a silent failure. The CDN dependency at `:6` is unchanged, so the offline break §2.2H records is unchanged.

**5 — Crop modes: CHANGED.** §2.2B records label-v3's crop modes including `Exact Label Crop (with 3mm safety buffer)` (`label-v3:467`). The sticker tool's `#sPrintSize` (`:766-772`) carries five options:
- `exact` — **`Exact Label Crop (with 3mm safety buffer)`** `:767`, the string preserved verbatim
- `tapered` — `Tapered BBox (Exact dimensions for Curve)` `:768`, **new**
- `a4` `:769`, `letter` `:770`, `a3` `:771`

The 3 mm buffer is implemented at `:2899-2900`: `var buffer = isIsoMode ? 0 : 0.6;` then `bw = pWidth + buffer`. 0.6 cm added to each dimension = 3 mm per side, and the label is centred inside it (`margin:auto` plus flex centring, `:2891`). §2.2 records label-v3's option label but not its buffer arithmetic, so whether 0.6 cm matches label-v3 exactly is **not recorded**. Verdict is CHANGED rather than PRESENT because the option set grew and because Isolated-Output mode zeroes the buffer (`:2899`), a behaviour §2.2 does not record for label-v3.

**6 — `BBLabelDB` IndexedDB preset storage: CHANGED — demoted to a read-only migration source.** The schema is byte-identical to what §2.2D records: `:1267` opens `BBLabelDB` at version 1 and its `onupgradeneeded` creates object store `presets` with `{keyPath:'name'}` — same DB name, same store, same keyPath as `label-v3:856-857`. But the code comment at `:1265` reads `// Legacy IndexedDB (migration only)`, and only two functions exist: `dbInit` `:1267` and `_dbList` `:1268` (a `getAll` on a `readonly`-default transaction). §2.2D records label-v3 having both `_dbList` **and `_dbPut`**; `_dbPut` has no counterpart here. Primary storage moved to the `bb_label_templates` localStorage key (`:1315`). Full destruction analysis in §1.3.

**7 — 30-slot preset bar with single + bulk export: CHANGED (single export) / ABSENT (30-slot cap, bulk export).**
- The **30-slot cap is gone.** There is no `_PBMAX` or equivalent anywhere in the file. `LabelTemplateMgr.add()` `:1320` unshifts into an unbounded array. The template library (`:345`, rendered `:3551-3611`) is a card grid with no capacity limit. A stale comment at `:3147` still refers to "the 30 internal slots" — vestigial, and the only textual trace of the cap.
- **Single export is CHANGED, not absent.** `tmplExportCurrent()` `:3366-3383` downloads one JSON, but the envelope changed: `template:'bb_label_template_v2'` (`:2138`) with `schemaVersion:2` (`:2139`), replacing §2.2B's `template:'bbbacklabel'` (`label-v3:1932`). Filename is `bbLabel-<name>.json` (`:3380`).
- **Bulk export is ABSENT.** No path emits multiple templates in one artifact. The `bbbacklabel_bulk` envelope §2.2B records (`label-v3:1940-1943`) has no counterpart and no reader — `normalizeLegacyImport` (`:1701-1724`) requires a single `data.state` object and **throws** on anything else (`:1702`), so an existing `bbbacklabel_bulk` file cannot be re-imported by this tool.
- Import is *broader* than label-v3's: multi-file `:340` and whole-directory `webkitdirectory` `:341`, both handled by `tmplImport()` `:3400-3421`.
- The "wipe" §2.2B records is CHANGED in meaning: `tmplClearLibrary()` (`:3537-3549`, button `:342`) only hides the list from the panel and resets the canvas. Its confirm text says so explicitly (`:3540`): "Does NOT delete saved data or folder files". Actual deletion is per-template via `tmplDelete()` `:3315-3340`.

**8 — Legacy migration sweep: PRESENT, key order intact.** `:3615` is `var oldKeys=['bbbacklabel_pb3','bbbacklabel_pb','bbbacklabel_pb2'];` — the same three keys in the same order §2.2D records for `label-v3:2011-2021`, and the order CF-08 exists to protect. It also does something label-v3 did not: after the localStorage sweep it reads `BBLabelDB` via `_dbList()` and migrates those records too (`:3631-3641`). The destination is `bb_label_templates`, not IndexedDB. `:3629` reproduces the swallowed-error smell §2.2H records at `label-v3:2020`.

**9 — Bilingual paired EN/AR with per-field `dir="rtl"`: PRESENT and extended.** Per-field `dir="rtl"` at `:647`, `:649`, `:676`, `:677`, `:678`, `:689`, `:690`, `:702`, `:705`, `:708`, `:914`. Every Arabic string is an editable field value or placeholder — none is baked into a renderer. Extended beyond what §2.2G records: four independent **language-mode selects** (`English Only` / `Arabic Only` / `Both (EN + AR)`, default `both`) scoping tips `:640-644`, ingredients `:670-674`, product name `:683-687`, and dates `:695-699`. The renderers honour them at `:2350`/`:2355`, `:2435`/`:2441`, `:2464`/`:2468`, `:2486`/`:2491`.

**10 — Default dimensions: PRESENT, exact.** Back label `:736` `value="17"` × `:737` `value="4.5"` cm. Cup: `:748` top Ø `value="9.0"`, `:749` bottom Ø `value="7.0"`, `:752` cup height `value="9.0"`, `:753` label height `value="7.0"` cm. All four match §2.2E's recorded defaults exactly. `tpOffsetBot` defaults to 0.5 cm (`:756`); §2.2 records the variable's existence (`label-v3:448-456`) but **not** its default value.

## 1.2 Every ABSENT item, its consequence, and a candidate Operational Decision

Four items are ABSENT. Each is a decision the owner must make now, not a default to be discovered during the port.

### ABSENT-1 — Custom size as an independent shape mode (`label-v3:724-725`)

**What the owner can no longer do.** Produce a rectangular label outside 8–40 cm wide × 2–12 cm tall (`:736-737`), or any free-form rectangle that is not routed through the Circle mode's 3–25 cm `cW`/`cH` box (`:1019-1020`). label-v3's custom mode was a fourth first-class mode; the sticker tool has exactly three (`:466-468`, `DESIGN_SPECS` `:1128-1132`).

**Second-order consequence — a silent import failure.** REPORT.md §2.2 does not record the state field name label-v3 used to store the active mode, so this cannot be traced end-to-end and the following is a conditional, not a finding: *if* label-v3 stored a mode string under `labelMode`, then `normalizeLegacyImport` (`:1705`) will carry a value of `custom` through, `inferDesignType` (`:1331-1339`) will fall through to `rect_top` (`:1338`), and `tmplLoadById` (`:3282`) will silently substitute `spec.defaultMode` = `back`. The preset would load as a back label with its `cW`/`cH` values stranded in Circle state, with no warning. If label-v3 used a different field name, the mode is simply lost on import. Either way the failure is silent. **Field name: not recorded.**

**Candidate OD.** *Is a free-form custom label size required, or is the three-mode set (back 8–40×2–12 cm, top 2–15 cm square/round, circle 3–25 cm) the complete production set? If required, does it need its own mode or only a widened range on an existing mode?*

### ABSENT-2 — The 30-slot preset cap (`_PBMAX=30`, `label-v3:853`)

**What changed.** The library is unbounded (`:1320`, `:3551-3611`). This reads as a gain, but it removes the only backstop against the localStorage quota problem described in §2.H — when the shared folder is not connected, every uploaded image stays inline as base64 inside `bb_label_templates` (see ABSENT-2's interaction with H-2 below), and the write that fails is swallowed at `:1185`.

**Consequence.** Unbounded template count × up to 15 inline base64 image slots per template × a swallowed quota error = silent preset loss with no upper bound and no warning. label-v3's cap of 30 bounded the exposure; nothing bounds it now.

**Candidate OD.** *Does the unified Label module cap the template library, and what is the storage budget per template? This decision gates whether image assets may ever be stored inline or must always be offloaded to blob/file storage.*

### ABSENT-3 — Bulk export (`template:'bbbacklabel_bulk'`, `label-v3:1940-1943`)

**What the owner can no longer do.** Emit the whole template library as one file. Backup and print-shop handoff are now one-file-at-a-time via `tmplExportCurrent()` (`:3366-3383`). With an unbounded library (ABSENT-2) this is the operation whose absence scales worst.

**Second-order consequence — existing bulk files are unreadable.** `normalizeLegacyImport` throws on any payload without a single `data.state` (`:1702`). Any `bbbacklabel_bulk` file the owner already holds cannot be imported by this tool, by either the file picker (`:340`) or the directory picker (`:341`); `tmplImport` catches the throw and reports it as a per-file error string (`:3410`, surfaced at `:3420`, truncated to the first two). A partial substitute exists but only when the shared folder is connected: `FileStore.syncAllToFolder()` (`:1149`) writes the whole `bb_label_templates` array to `bb_label_templates.json`, which is a full-library artifact by side effect, not an export feature.

**Candidate OD.** *Is whole-library export required for backup or print-shop handoff, and must the unified importer read the legacy `bbbacklabel_bulk` envelope? If yes, its shape must be captured before any remaining copies are lost — the source tool is gone and REPORT §2.2 records only the envelope's `template` string, not its field layout.*

### ABSENT-4 — `_dbPut` / `BBLabelDB` as a writable primary store (`label-v3:856-857`, §2.2D)

**What changed.** §2.2D records label-v3 using `BBLabelDB` as its live preset store with both `_dbList` and `_dbPut`. The sticker tool keeps the identical schema (`:1267`) but only reads (`:1268`). Primary storage is now the `bb_label_templates` localStorage key (`:1315`).

**Consequence.** Templates moved from IndexedDB (large quota) to localStorage (~5 MB, shared with every other `bb_*` key on that origin) — a quota *regression*, and the direct cause of the exposure in ABSENT-2. It also means `BBLabelDB` is now a frozen, orphaned artifact: nothing writes it, nothing prunes it, and it is read exactly once per page load (`:3631`).

**Candidate OD.** *Confirm that abandoning IndexedDB for localStorage as the primary template store is intended and not an accident of the rewrite. This is the storage-layer decision that P02's importer and the `DataStore` adapter both depend on.*

### One further item requiring a decision although its verdict is CHANGED, not ABSENT

**The `BALANCE` / `BYTES` typo did not just survive — it propagated from 2 sites to 6.** REPORT.md §2.2E and §4 record it at `label-v3:698-699` as the only occurrence in the codebase. In the sticker tool it appears at `:376` and `:386` (master-text placeholders), `:994` and `:1033` (default input values), and `:2821` (twice, as the `getVals` fallback defaults for `cBrand1`/`cBrand2`). Two of those are live default `value=` attributes, so both the Top sticker and the Circle sticker render **"BALANCE BYTES"** until edited. All six are all-caps, so the case-sensitive `Bytes` grep REPORT §4 warns about still misses every one. `PHASE_PLAN.md` T06.6 ("fix the BYTES typo (label-v3:699)") is therefore **not moot** — it has four more sites than before. Not proposing the fix here; flagging that the scope grew.

## 1.3 Migration continuity

### Evidence limitation — stated verbatim as required

> the Pass 0 browser-data backup and its before/after two-run diff were deliberately SKIPPED by owner decision on 2026-07-29, and no backup file exists in the repository. You therefore have no empirical evidence of what has already happened to that data.

Everything in this section is derived from code paths only. Where the code does not settle a question, this section says **cannot determine statically** and does not resolve it in either direction.

### Complete occurrence list

Exhaustive grep for `BBLabelDB`, `bbbacklabel`, `indexedDB.`, and `localStorage.` across all 3,700 lines. Every occurrence:

| Line | Identifier | Code | Reachability |
|---|---|---|---|
| `:1267` | `BBLabelDB` | `indexedDB.open('BBLabelDB',1)`; `onupgradeneeded` → `createObjectStore('presets',{keyPath:'name'})` | `dbInit`, called once from the init IIFE at `:3668` |
| `:1268` | (`BBLabelDB`) | `_dbList()` → `db.transaction('presets').objectStore('presets').getAll()` | called once, from `:3631` |
| `:3615` | `bbbacklabel_pb3`, `bbbacklabel_pb`, `bbbacklabel_pb2` | `var oldKeys=[…]` | `migrateLegacyPresets`, called from `:3673` |
| `:3618` | (all three) | `localStorage.getItem(oldKeys[ki])` | per-key read |
| `:3628` | (all three) | **`localStorage.removeItem(oldKeys[ki])`** | per-key delete, gated only on `old.length` |
| `:1142` | — | `indexedDB.open('bb_filestore_v1',1)`; `createObjectStore('h')` | the *other* database — the shared FSA handle store, not a preset store |

There are exactly two `indexedDB.` call sites in the file (`:1142`, `:1267`) and no others. There is no `deleteDatabase` anywhere. There is no `clear()`, `delete()`, or `put()` on the `presets` store anywhere.

### Q1 — Does it read the old keys or the old database, and on which paths?

**Yes, both, on one path each, and both run automatically on page load.**

The init IIFE (`:3667-3697`) executes `dbInit(async function(){…})` — so the whole body runs inside `dbInit`'s success-or-error callback (`:1267`). Order of operations:

1. `:3669` `restoreActiveTheme()`
2. `:3671-3672` `FileStore.restore()`; if a directory handle was persisted and permission is still granted, `FileStore.loadAll()`
3. `:3673` **`await migrateLegacyPresets()`** ← both reads happen here
4. `:3674` `migrateLibraryProductIdentity()`
5. `:3682` `await handleDeepLink()`

Inside `migrateLegacyPresets` (`:3613-3643`):
- **localStorage path** `:3616-3630`: for each of the three keys in `:3615` order, parse (`:3618`), then per preset — skip if falsy or stateless (`:3620`), skip if the name already exists (`:3621`), else normalize (`:3622`), insert (`:3623`), offload large assets (`:3624`), patch state (`:3625`), count (`:3626`). Then `:3628` deletes the key.
- **IndexedDB path** `:3631-3641`: `await _dbList()` then the same per-record logic (`:3634` stateless skip, `:3635` name skip, `:3636-3639` insert). **No delete, no removal from `BBLabelDB`.**
- `:3642` reports a count via toast if anything migrated. If nothing migrated, there is no message at all — indistinguishable from "no legacy data existed".

No user action is required to reach either path. There is no opt-in, no dry run, and no preview.

### Q2 — Does it migrate forward, ignore, or overwrite?

**It migrates forward, with a name-collision rule that silently drops rather than overwrites — and, on the localStorage side only, then deletes the source.**

- **Forward**: yes. Both sources are read into `bb_label_templates` via `LabelTemplateMgr.add()` (`:3623`, `:3637`), through `normalizeLegacyImport` (`:1701-1724`) which fills in `designType` defaulting to `rect_top` (`:1715`), infers taper from `data.isTapered || st._isTapered || st.chkTapered` (`:1704`), derives a product identity from state (`:1706`, via `extractProductIdentityFromState` `:1793-1808`), and stamps `schemaVersion: data.schemaVersion || (data.template==='bb_label_template_v2' ? 2 : 1)` (`:1720`) — so migrated label-v3 presets are marked `schemaVersion: 1`, which is the one durable marker distinguishing them.
- **Overwrite**: no. Both paths `continue` on a name collision (`:3621`, `:3635`). An existing template is never overwritten *by migration*. (It can be overwritten by `tmplSave()` — RISK-2, §0 — but that is not the migration path.)
- **Ignore**: only in the collision case, and that "ignore" is destructive on the localStorage side because `:3628` still fires.

Two migrations run in sequence, and the order matters: because the localStorage sweep (`:3616-3630`) completes before the `BBLabelDB` sweep (`:3631-3641`), and because label-v3 itself moved localStorage presets *into* `BBLabelDB` (§2.2D, `label-v3:2011-2021`), any preset present in both places is claimed by the localStorage copy and the `BBLabelDB` copy is then skipped by name at `:3635`. Whether those two copies were ever identical is **not recorded** and, absent the backup, **cannot be determined statically**.

### Q3 — Can any path destroy old label-v3 preset data?

**`BBLabelDB`: no. The `bbbacklabel_*` localStorage keys: yes.**

**`BBLabelDB` — not destroy-capable.** Checked against every mechanism named in the brief:

| Mechanism | Finding |
|---|---|
| Same DB name | Yes — `BBLabelDB` (`:1267`), identical to `label-v3:856` |
| Same store | Yes — `presets` (`:1267`), identical to `label-v3:857` |
| Same keyPath | Yes — `name` (`:1267`), identical to `label-v3:857` |
| `clear` / `deleteDatabase` | **None in the file.** Zero occurrences |
| Upgrade handler dropping a store | **No.** `onupgradeneeded` (`:1267`) only *creates* `presets`. It carries no `deleteObjectStore`. It also will not fire at all against an existing v1 database, since the requested version equals the existing one |
| A `put` overwriting by key | **No `put` on this store exists.** `_dbList` (`:1268`) is the only operation, and it is a `getAll` |

One benign side effect: if `BBLabelDB` does *not* exist, `:1267` creates an empty one with an empty `presets` store. That fabricates a database but destroys nothing. If IndexedDB is blocked — the Brave `file://` quirk recorded in SESSION_CONTEXT and in §2.2H for label-v3 — `r.onerror` (`:1267`) still invokes the callback, `db` stays undefined, and `_dbList` returns `[]` at `:1268`. The app proceeds normally and reports nothing. In that scenario the IndexedDB presets are never read **while the localStorage keys are still deleted**, because the two paths are independent.

**The `bbbacklabel_*` keys — destroy-capable. Two distinct loss modes.**

- **Loss mode A (by design, inherited).** `:3628` deletes each key after its sweep. §2.2D records label-v3 doing the same ("moves any presets into IndexedDB, then deletes the old keys"), so the delete itself is inherited behaviour, not new. What *is* new is the destination: label-v3 moved them into `BBLabelDB`; the sticker tool moves them into the `bb_label_templates` localStorage key (`:1315`) in a v2 schema (`:1320`). **Trigger: page load. No UI action.**
- **Loss mode B (a genuine defect).** The name-collision `continue` at `:3621` combined with the unconditional `removeItem` at `:3628`. Any legacy preset whose `name` matches an already-present template is neither migrated nor retained — and its source key is deleted in the same iteration. **Trigger: page load, when `bb_label_templates` already holds a name that also exists in a `bbbacklabel_*` key.** Whether that condition has ever been met on the owner's profile **cannot be determined statically** and, absent the backup, cannot be determined empirically either.

**A third, adjacent risk worth recording even though it is not label-v3 data.** `FileStore.loadAll()` (`:1150`) iterates `WRITE_KEYS.concat(READ_KEYS)` and executes `localStorage.setItem(key, text)` for every file it finds in the shared folder — overwriting the in-browser copy from disk with no merge and no timestamp comparison. It runs at `:1207` (Connect folder), `:1215` (`ensureFileStoreConnected`), and `:3672` (page load when a handle was restored). `bb_stickers` is in `READ_KEYS` (`:1140`), and `bb_stickers` is exactly where this tool writes the sticker→template links (`:1243`, `:2168`, `:3262`, `:3312`). But `FileStore.writeKey` returns early for any key not in `WRITE_KEYS` (`:1151`), and `bb_stickers` is not in `WRITE_KEYS` (`:1139`). **Net effect: the sticker tool writes `templateKey` to localStorage only, and the next `loadAll()` overwrites it from `bb_stickers.json` on disk.** Links survive only if `bb-stock-costs.html` — which does have `bb_stickers` in its `WRITE_KEYS` (`bb-stock-costs.html:1180`) — happens to flush them to disk first. This is a silent, repeating loss of cross-family link data. Detailed in §3.1.

### Are the old presets stranded?

**Partly, and the answer differs by source.**

- **`BBLabelDB` presets: not stranded, and still intact.** They remain in the database (nothing deletes them, Q3) and they are readable by both this tool (`:1268`) and any future importer. They remain a valid P02 source.
- **`bbbacklabel_*` localStorage presets: stranded or gone, and the code cannot tell you which.** If the sticker tool has been opened even once on the owner's profile, `:3628` has already deleted every key that held data. Their content then exists only inside `bb_label_templates`, re-shaped into the v2 template schema (`:1320`) and marked `schemaVersion: 1` (`:1720`) — except for any collision-dropped preset (loss mode B), which exists nowhere. Whether the tool has been opened, and whether any collision occurred, **cannot be determined statically.**

**Both sources remain required inputs for the P02 migration importer (T02.2) regardless of what this tool does.** The `bbbacklabel_pb3 → bbbacklabel_pb → bbbacklabel_pb2` order (CF-08) must stay in the importer, and the importer now needs a **fourth** source it did not previously have: the `bb_label_templates` key, in whichever of the two shapes it holds — `schemaVersion: 1` records migrated from label-v3, and `schemaVersion: 2` records authored natively. That is new scope for T02.2.

## 1.4 New capabilities, and where the 1,660 lines went

### 1.4.a New capabilities — every one is new scope needing a parity-matrix row

REPORT.md §2.2 records none of the following for label-v3. Each is listed with the evidence that it is genuinely new (i.e. §2.2 is silent on it, not merely terse).

| # | New capability | Evidence |
|---|---|---|
| N-1 | **Structured Nutrition Facts panel** — serving size, calories, 9 toggleable macro rows with %DV, 4 micronutrients | markup `:587-633`; renderer `:2375-2427`; auto-scale `:2381-2385` |
| N-2 | **Product-catalog link** — template carries a real `productId` FK into Invoice Pro's `bb_products` | `:353`, `:1320`, `getProducts` `:2158`, `populateLbProductSel` `:2160` |
| N-3 | **Master shared text ("product identity") with per-field sync and drift detection** | panel `:355-421`; engine `:1747-2130`; drift `:2078-2116` |
| N-4 | **Design families with a lock** — 3 named families that restrict which modes and tabs are reachable | `DESIGN_SPECS` `:1128-1132`; locks `:1602-1632`; UI `:318-326` |
| N-5 | **Per-mode state isolation** — back/top/circle each keep their own field state in one template | `_modeStates` `:1126`; `:1341-1359`, `:1512-1550` |
| N-6 | **Batch view** — render many templates at once for comparison/printing | markup `:1105-1111`; logic `:3003-3046`; render branch `:2913-2935` |
| N-7 | **Isolated Output mode** — checkerboard background, zero print buffer, auto-PNG | CSS `:276-288`; logic `:3048-3061`; buffer `:2899` |
| N-8 | **Per-section background images** with opacity + zoom, for 5 sections | markup `:925-966`; rect renderer `:2330-2332`; SVG renderer `:2595-2604` |
| N-9 | **Section reordering and visibility**, 6 sections incl. a user-defined custom section | markup `:898-916`; `moveSec` `:2185-2192`; order applied `:2302-2311` |
| N-10 | **Section width budget with a live 100 % meter** | markup `:776-785`; `updateSecPct` `:2194-2203` |
| N-11 | **6 badge slots** with emoji-or-PNG per slot, shown in two sections independently | markup `:519-576`; renderers `:2363-2369`, `:2450-2456` |
| N-12 | **Shared-folder sync (FSA) + shared IndexedDB handle store** — the coupling in §3.1 | `:1136-1183` |
| N-13 | **Asset offloading** — base64 >400 chars moved to `label_assets/<templateId>/<field>.txt` in the shared folder | `isAssetField` `:1745`; `:2155-2156` |
| N-14 | **App theme engine + colour-preset grid**, sharing `bb_color_presets` with the business tools | `:1270-1312`; UI `:426-435` |
| N-15 | **Deep-link handshake** — accepts `?template=`/`?product=` and the `bb_label_open` payload from bb-stock-costs | `handleDeepLink` `:2173` |
| N-16 | **Load/delete templates directly from the shared folder**, incl. listing legacy `bbLabel-*.json` files | `:327-337`; `:3423-3498`; `listLegacyLabelFiles` `:1163-1172` |
| N-17 | **Multi-file and whole-directory JSON import** | `:340-341`; `tmplImport` `:3400-3421` |
| N-18 | **Tapered rendering via SVG annular sectors + `foreignObject`**, one clipped sector per section | `sectorPath` `:2266-2275`; `buildTaperedLabel` `:2516-2640` |
| N-19 | **Faux QR generator** (17×17 fixed bit pattern) as the fallback when no QR image is uploaded | `buildQR` `:2278-2283`; used `:2498` |
| N-20 | **Per-section scale and X/Y nudge** for ingredients, nutrition, dates/QR, logo, weight, QR | `:797-799`, `:806-813`, `:830-839` |
| N-21 | **Font family + weight selectors** for headings, body and Arabic separately | `:840-894` |
| N-22 | **Circle-mode product photo** with size, scale and X/Y placement | `:1044-1055`; renderer `:2706-2712` |
| N-23 | **Two independent sticker geometries** (Top and Circle) replacing one circular mode | see §1.1 item 1c |
| N-24 | **`escHtml` output escaping** — partial, but label-v3 had none per §2.2H | `:1326`; used `:2114`, `:3439`, `:3448`, `:3580-3599` |
| N-25 | **Template schema versioning** (`schemaVersion:2`) and a forward-migration for library records | `:1320`, `:1720`, `:2139`; `migrateLibraryProductIdentity` `:3645-3664` |

N-2, N-3, N-12, N-13, N-14, N-15 and N-16 are not merely new features — they are the mechanism by which a design tool became a participant in the business data layer. See Part 3.

### 1.4.b Accounting for the 1,660-line increase

3,701 (this file, editor convention) − 2,041 (label-v3, REPORT.md §1 line 38) = **+1,660 lines**.

**Method and its limit.** The label-v3 side of this arithmetic cannot be decomposed: the source is gone and REPORT.md §2.2 records no structural line budget for it — only individual `file:line` citations. So the increase is accounted for by measuring the sticker tool's own structure and attributing the growth to subsystems that §2.2 does not record for label-v3 at all. **label-v3's internal composition: not recorded.**

**Structural split of the 3,700 content lines:**

| Region | Lines | Count |
|---|---|---|
| Head: CDN script, title, Google Fonts | `:1-8` | 8 |
| `<style>` block | `:9-289` | 281 |
| `</head>`, `<body>`, toast, shell open | `:290-295` | 6 |
| HTML markup (left panel, tabs, canvas, right panel, batch panel) | `:296-1115` | 820 |
| `<script>` | `:1116-3698` | 2,583 |
| `</body></html>` | `:3699-3700` | 2 |

**Attribution of the growth** — measured spans of subsystems that are new per §1.4.a:

| New subsystem | Span | Lines |
|---|---|---|
| Template library: manager, cards, save/load/delete, folder list | `:1314-1324`, `:1650-1744`, `:3226-3611` | ≈ 492 |
| Product identity / master text / drift, incl. its panel markup | `:348-421`, `:1747-2130` | ≈ 458 |
| Per-mode state machinery (split, merge, hydrate, persist, locks) | `:1341-1450`, `:1512-1600`, `:1602-1669` | ≈ 268 |
| Circle mode: panel + renderer | `:1007-1101`, `:2672-2749` | ≈ 173 |
| Tapered SVG renderer (sector clipping + `foreignObject`) | `:2515-2640` | 126 |
| Nutrition Facts: panel + renderer | `:587-633`, `:2375-2427` | ≈ 100 |
| Design families, locks, pills, per-card type switching | `:318-326`, `:1128-1132`, `:1602-1632` | ≈ 82 |
| Isolated Output + PNG export | `:3048-3123` | 76 |
| Batch view: panel + logic + render branch | `:1105-1111`, `:2913-2935`, `:3003-3046` | ≈ 74 |
| `calcTaper` + `sectorPath` + `buildQR` | `:2210-2283` | 74 |
| Top mode: panel + renderer | `:970-1005`, `:2645-2669` | ≈ 61 |
| Badge slots 1–6 | `:519-576` | 58 |
| FileStore (FSA, handle store, assets, legacy files) + `Store` | `:1136-1185` | 50 |
| Theme engine + colour-preset grid + its panel | `:426-435`, `:1270-1312` | ≈ 53 |
| Migration (localStorage + IndexedDB + library identity) | `:3613-3664` | 52 |
| Per-section background images | `:925-966` | 42 |
| Section ordering + custom section | `:898-916`, `:2185-2203` | ≈ 38 |
| Font families + weights | `:840-894` | 55 |
| Per-section scale/nudge controls | `:797-799`, `:806-813`, `:830-839` | ≈ 25 |
| **Sum of new subsystems** | | **≈ 2,357** |

The new subsystems total roughly 2,357 lines — comfortably more than the 1,660-line increase. The two figures reconcile because the sticker tool is not label-v3 plus additions; it is a rewrite that also *shed* code. Specifically, capabilities that carried code in label-v3 and carry less or none here: the 30-slot preset bar and its DOM (ABSENT-2 — §2.2B cites `label-v3:853-2038` for the preset subsystem, a span of ~1,185 lines by REPORT §3.1's own duplication-matrix entry), bulk export (ABSENT-3, `label-v3:1940-1943`), and `_dbPut` plus the writable IndexedDB layer (ABSENT-4). Net: roughly 2,357 lines of new subsystems, less the preset-bar subsystem and the writable-IndexedDB layer that were removed, arriving at +1,660.

**Sanity check on the density claim.** CSS grew to 281 lines for a UI that now has three main panel tabs (`:306-310`), eight design tabs (`:449-456`), a card-grid template library, a batch panel and an isolation mode. Markup is 820 lines for **388 uniquely-identified form controls** (388 `id=` attributes, zero duplicates — verified programmatically). Script is 2,583 lines. The proportions are consistent with a tool that carries three renderers (`buildLabel` `:2286`, `buildTopLabel` `:2645`, `buildCircleLabel` `:2672`) plus a fourth SVG path (`buildTaperedLabel` `:2516`), where §2.2 records label-v3 having one geometry engine and four modes.

---

# PART 2 — FULL ANALYSIS

Structured to match REPORT.md §2's A–J order so Pass 3 can insert it as a numbered section in the design family.

## A. Purpose & workflow

A **bilingual label, sticker and cup-wrap designer that is also a client of the business data layer.** It supersedes label-v3's geometry role and adds a product-linked template library synchronised through the same shared folder Invoice Pro and Stock & Costs use.

Two-column shell (`:293-1114`): a fixed 340 px left panel in RTL (`:16`, `:294-438`) and an LTR workspace (`:124`, `:439-1113`) holding the canvas plus a 340 px design panel on the right (`:482-1104`).

**Workflow.**
1. Optionally **connect the shared folder** — `📁 ربط مجلد` (`:301`) → `connectFolder()` (`:1207`) → `FileStore.connect()` (`:1148`) → `showDirectoryPicker` → handle persisted to IndexedDB → `loadAll()` (`:1150`) pulls `bb_products`, `bb_stickers` and the tool's own keys off disk into localStorage. Status dot and label update at `:1181`.
2. **Pick a design family** (`:320-324`): Circular sticker / Rectangular + Top / Tapered cup + Top. Optionally lock it (`:325`) so only that family's modes and tabs are reachable (`:1602-1632`).
3. **Load or create a template** — from the in-browser library (`:345`, `:3551-3611`), from the shared folder (`:330-336`, `:3458-3498`), or by importing JSON files or a whole folder (`:340-341`).
4. **Optionally link a product** (`:353`) from Invoice Pro's catalog, and pull its weight into the master text (`:418` → `fillMasterFromCatalog` `:2028-2040`).
5. **Edit** across eight tabs (`:449-456`) with a live preview (`render()` `:2865`), switching between Back / Top / Circle via the canvas mode buttons (`:466-468`).
6. **Keep text consistent** — enter shared values once in the master-text panel (`:360-400`), tick which fields and which designs they apply to (`:409-413`), then apply to many templates at once (`:417` → `applyMasterToSelected` `:1942-1989`). A drift box (`:414`, `:2103-2116`) reports every field where the open label disagrees with the master.
7. **Output** — print (`:343` → `window.print()`; page geometry from `:2894-2901`), or export a 4× PNG via Isolated Output (`:472` → `toggleIsoMode` `:3048` → `exportPNG` `:3063`).
8. **Save** — 💾 (`:443` → `tmplSave` `:3226-3270`), which writes the library key, mirrors the whole library to the folder, writes a `bbLabel-<name>.json` sidecar, and stamps `templateKey` back onto the linked `bb_stickers` row.

## B. Feature list (exhaustive)

**Left panel — three main tabs** (`:306-310`, switcher `switchPanelTab` `:1198-1205`)

*Templates tab (`:315-347`)*
- Design-family select, 3 options (`:320-324`); lock checkbox (`:325`)
- Saved-data-folder picker (`:330`) with 🔄 Refresh (`:333`), ↩ Load (`:334`), 🗑 Delete (`:335`)
- ↓ Export current (`:339`), 📂 Import JSON multi-file (`:340`), 📁 Import folder (`:341`), 🗑 Clear view (`:342`), 🖨 Print (`:343`)
- Template card grid (`:345`) — each card carries a master-apply checkbox (`:3578`), three colour swatches (`:3580-3582`), name (`:3586`), preview line (`:3587`), five section chips (`:3588`, built `:1671-1683`), a design-type select (`:3590-3594`), a lock checkbox (`:3596`), product + date meta (`:3599`), a family badge (`:3602`, `:1739-1744`), ↩ Open (`:3604`) and 🗑 Delete (`:3605`)

*Product tab (`:349-423`)*
- Invoice Pro catalog select (`:353`) + link meta line (`:354`)
- Nine master-text fields, each with an include checkbox: Brand (`:361-362`), Top logo (`:367-368`), Top line 1 (`:371-372`), Top line 2 (`:375-376`), Circle brand 1 (`:381-382`), Circle brand 2 (`:385-386`), Net weight (`:391-392`), Best before (`:395-396`), Production date (`:398-400`)
- Selection count (`:404`), ☑ All (`:405`), ☐ None (`:406`)
- Three apply-target toggles: Back/Taper, Top, Circle (`:410-412`)
- Drift box (`:414`)
- ↓ Pull from label (`:416`), ↻ Apply to selected (`:417`), 🔗 Weight from catalog (`:418`), 💾 Save master (`:419`)

*Theme tab (`:426-435*)*
- Colour-preset card grid (`:429`, rendered `:1282`), name input + 💾 Save (`:431-432`), per-card ✕ delete (`:1282`)

**Workspace**
- Quick bar: template name input (`:442`), 💾 Save (`:443`), 🗑 Delete loaded (`:444`)
- Eight design tabs (`:449-456`): 🏷 Brand, 🥗 Nutrition, 📋 Info, 🧩 Layout, 📐 Size, 🎨 Typography, 🔴 Top, 🟤 Circle
- Canvas controls: three mode buttons (`:466-468`), 📦 Batch View (`:471`), 🎯 Isolated Output (`:472`), size readout (`:474`)
- Batch select panel (`:1105-1111`) with per-template checkboxes (`:3034`)

**Design tabs — contents**
- **Brand** (`:486-584`): label colour, logo-text colour (`:489-490`), logo-circle colour + style full/ring (`:493-498`), ring thickness (`:501`); brand/logo text (`:504`), product name lines 1–3 (`:505`, `:506`, `:512`), boxed-line-2 toggle + its two colours (`:507-510`), net weight (`:513`), logo X/Y nudge (`:515-516`); two badge-visibility toggles (`:521-522`); **6 badge slots**, each emoji + PNG upload + clear + text (`:523-576`); ingredients title, body, allergen (`:580-582`)
- **Nutrition** (`:587-633`): serving size, calories (`:590-591`); 9 toggleable rows — fat, sat-fat, cholesterol, sodium, carbs, fibre, sugars, added sugars, protein — each with a %DV field (`:595-623`); vitamin D, calcium, iron, potassium (`:624-631`)
- **Info** (`:636-717`): tips language mode (`:640-644`), tip title/body EN+AR (`:646-649`), 2 serving icons with PNG upload (`:650-665`); ingredients language mode (`:670-674`), AR title/body/allergen (`:676-678`); logo language mode (`:683-687`), AR name lines (`:689-690`); dates language mode (`:695-699`), best-before label EN+AR + date (`:701-703`), production label EN+AR + date (`:704-706`), storage EN+AR (`:707-708`), custom QR upload (`:709-714`)
- **Layout** (`:898-916*)*: 6 section rows with visibility checkbox and ▲▼ reorder (`:903-908`), hidden order field (`:901`), custom-section title/body/AR body (`:912-914`)
- **Size** (`:720-895`): shape-mode toggle (`:724-730`); rectangular W/H (`:736-737`); cup panel — top Ø, bottom Ø, cup H, label H, offset from bottom, wrap % (`:748-757`) and the live geometry readout (`:759`); screen scale (`:764`); print layout mode, 5 options (`:766-772`); section-width budget with meter and 4 sliders + auto-fill readout (`:776-785`); font sizes (`:788-793`); ingredients scale + X/Y (`:797-799`)
- **Typography** (`:919-967`) and the rest of Size's font block (`:801-894`): nutrition heading/body sizes (`:803-804`), table scale + X/Y (`:808-812`), calories and tips sizes (`:815-816`), dates and net-weight sizes (`:819-820`), badge icon and text sizes (`:823-824`), QR and tip-icon sizes (`:827-828`), dates/QR section scale + 6 nudges (`:832-838`), heading/body/Arabic font families (`:843-872`), heading and body weights (`:877-892`); primary/secondary text colours (`:922-923`); **5 per-section background images**, each with upload, clear, opacity, zoom (`:927-966`)
- **Top** (`:970-1005`): shape round/square (`:974-977`), dimension size cm (`:979`), logo-circle style + thickness (`:983-988`), logo text (`:992`), title lines 1–2 (`:993-994`), subtitle lines 1–2 (`:995-996`), 4 font-size sliders (`:1000-1003`)
- **Circle** (`:1007-1101`): shape circle/square (`:1011-1014`), border radius (`:1016`), W/H cm (`:1019-1020`), logo size + X/Y (`:1023-1027`), brand lines 1–2 (`:1032-1033`), brand X/Y (`:1036-1037`), flavour X/Y (`:1040-1041`), product photo upload + clear (`:1046`), photo size/scale/X/Y (`:1049-1054`), flavour text + colour (`:1059-1060`), product name (`:1063`), 4 font sizes (`:1068-1073`), bottom Y offset + date size (`:1078-1079`), weight X/Y (`:1082-1083`), QR X/Y (`:1086-1087`), QR size + bottom padding (`:1090-1091`), date 1/2 text (`:1094-1095`), show-date toggles (`:1098-1099`)

**Modals.** None. Every interaction is inline or a native `confirm`/`alert` (`:1148`, `:1213`, `:3321`, `:3356`, `:3540`).

## C. Data model

No business entities are *owned*. Two are *referenced*: `Product` (read-only, by id) and `Sticker` (read-write, by id, one field).

### C-1. `LabelTemplate` — the tool's own entity, stored in `bb_label_templates`

Constructed at `:1320`:

| Field | Type / shape | Source |
|---|---|---|
| `id` | `'lbl_' + Date.now() + '_' + rand36(3)` | `genId` `:1190` |
| `name` | string — **de-facto identity key** | `:442`, `:3227` |
| `productId` | string — FK into `bb_products` | `:353`, `:3236` |
| `flavorKey` | string — derived free text, first non-empty of `eCFlavorTxt`, `eName1`, `tTitle1`, `eCBrand1` | `flavorKeyFromState` `:1776-1779` |
| `designType` | `'circular' \| 'rect_top' \| 'taper_top'` | `:1128-1132` |
| `designLocked` | boolean | `:325` |
| `labelMode` | `'back' \| 'top' \| 'circle'` | `:1119`, `:2950` |
| `isTapered` | boolean | `:1119` |
| `modeStates` | `{back:{},top:{},circle:{}} \| null` | `:1350-1359`; nulled on save `:1697`, `:3242` |
| `state` | flat `{[elementId]: string \| boolean}` | `presetGetState` `:3141-3154` |
| `productIdentity` | 11-field object (C-2) | `:1755-1757` |
| `syncTargets` | `{back:bool, top:bool, circle:bool}` | `:1810-1813` |
| `syncFields` | 9 booleans | `:1815-1817` |
| `schemaVersion` | `2` native, `1` for label-v3 migrations | `:1320`, `:1720` |
| `updatedAt` | ISO 8601 string | `:1320`, `:1321` |

`state` is keyed by **DOM element id**, harvested by `document.querySelectorAll('#sidebar input, #sidebar select, #sidebar textarea')` (`:3143`), skipping file inputs (`:3145`) and — unless `full` is true — every `hx*` base64 field (`:3147`). One synthetic key is added: `_isTapered` (`:3152`). So the persisted shape is a flat mirror of the form, not a domain model: renaming any input id silently orphans that field in every saved template. Asset fields may hold either a raw `data:` URL or the sentinel `'__asset__:' + fieldName` (`ASSET_PREFIX` `:1133`, written `:2155`, resolved `:2156`).

### C-2. `ProductIdentity` — the master shared-text record

`emptyProductIdentity()` `:1755-1757`: `{brand, topLogo, topLine1, topLine2, circleBrand1, circleBrand2, weight, bestBefore, productionDate, dateLabel1:'**Best Before:', dateLabel2:'**Production Date:'}`. Normalised by `slimProductIdentity` (`:1759-1774`) with `topLogo` falling back to `brand` (`:1763`). Projected onto form fields through `IDENTITY_FIELD_MAP` (`:1749-1753`):

- `back`: `eBrand→brand`, `eWeight→weight`, `eDate1→bestBefore`, `eDate2→productionDate`, `eDateLabel1→dateLabel1`, `eDateLabel2→dateLabel2`
- `top`: `tLogoTxt→topLogo`, `tTitle1→topLine1`, `tTitle2→topLine2`
- `circle`: `tLogoTxt→topLogo`, `eCBrand1→circleBrand1`, `eCBrand2→circleBrand2`, `eWeight→weight`, `eCDate1→bestBefore`, `eCDate2→productionDate`

`weight` is the one normalised value: `formatWeightField` (`:1781-1786`) prefixes `NET WEIGHT: ` unless the string already starts with `net weight` (case-insensitive).

### C-3. `ColorPreset` — shared with the business tools

`{id, name, bg, gold, txt, mut, row, tot, grand}` (`:1273-1275`, `:1279`). Identical field set to `bb-stock-costs.html:1347-1350`. Three seeded defaults; see §E and §3.4 for the divergence.

### C-4. Referenced entities

- **`Product`** — read-only, never written. Only `id`, `name` and `weight` are consumed (`:2159`, `:2160`, `:2034`).
- **`Sticker`** — one field written: `templateKey`, plus `productId` on two of four paths (`:1233`, `:2168`). Contract in §3.2.
- **`bb_label_open`** — a one-shot handshake payload `{stickerId, templateId, productId, ts}`, written by bb-stock-costs (`bb-stock-costs.html:6048-6053`), consumed and deleted here (`:2173`).

### C-5. Volatile state (not persisted)

`:1119-1126`: `labelMode`, `isTapered`, `isBatchMode`, `batchSelected[]`, `isIsoMode`, `currentTemplateId`, `_linkedStickerId`, `currentDesignType`, `designLocked`, `_tmplListHidden`, `_productIdentity`, `_syncTargets`, `_syncFields`, `_masterApplySelected[]`, `_modeStates`. Plus `SC` — the live theme colour object (`:1134`).

## D. Persistence layer

### D-1. localStorage keys

| Key | Direction | Sites |
|---|---|---|
| `bb_label_templates` | read/write — **own primary store** | `:1315`, `:1316-1317` |
| `bb_color_presets` | read/write — **shared** | `:1271`, `:1277-1278` |
| `bb_active_color_preset_id` | read/write — **shared** | `:1281`, `:1309`, `:1312` |
| `bb_active_theme` | read/write — **shared** | `:1309`, `:1310` |
| `bb_label_open` | read + **delete** — inbound handshake | `:2173` |
| `bb_products` | **read-only** | `:2158` |
| `bb_stickers` | read/write | read `:1228`, `:2168`, `:2173`, `:3304`; write `:1243`, `:2168`, `:3262`, `:3312` |
| `bbbacklabel_pb3`, `bbbacklabel_pb`, `bbbacklabel_pb2` | read + **delete** — legacy migration | `:3615`, `:3618`, `:3628` |

All access goes through `Store` (`:1185`): `get` JSON-parses inside a try that returns the default on failure; `set` writes localStorage inside a swallowing try **and then** calls `FileStore.writeKey`; `remove` deletes inside a swallowing try.

### D-2. IndexedDB

| Database | Store | Key | Purpose | Sites |
|---|---|---|---|---|
| `bb_filestore_v1` | `h` | `'dir'` | persisted FSA directory handle — **the same database and store `bb-stock-costs.html:1187-1188` uses** | `:1142-1144`, `:1146-1148`, `:1180` |
| `BBLabelDB` | `presets` | keyPath `name` | **read-only** legacy migration source | `:1267-1268`, `:3631` |

### D-3. File System Access API

`FSA` capability probe at `:1141`. Directory handle acquired at `:1148`, persisted at `:1144`, re-validated with `queryPermission` (`:1146`) or `requestPermission` (`:1147`).

| Operation | Function | Line |
|---|---|---|
| `WRITE_KEYS` — mirrored to `<key>.json` | `writeKey` (early-returns for any key not in `WRITE_KEYS`) | `:1151` |
| Pull all keys from disk into localStorage | `loadAll` — `WRITE_KEYS.concat(READ_KEYS)`, then `syncAllToFolder` | `:1150` |
| Push all `WRITE_KEYS` to disk | `syncAllToFolder` | `:1149` |
| Write one template sidecar `bbLabel-<name>.json` | `writeLegacyLabel` | `:1152` |
| Read one key file | `readKey` | `:1153-1157` |
| Read an arbitrary folder file | `readFolderJson` | `:1158-1162` |
| Enumerate `bbLabel-*.json` | `listLegacyLabelFiles` — `/^bbLabel-.+\.json$/i` | `:1163-1172` |
| **Delete a folder file** | `deleteFolderJson` — `removeEntry` | `:1173-1176` |
| Create/traverse subdirectories | `getDirHandle` | `:1177` |
| Write an asset to `label_assets/<templateId>/<field>.txt` | `writeAsset` | `:1178` |
| Read an asset back | `readAsset` | `:1179` |

`WRITE_KEYS` = `['bb_label_templates','bb_color_presets','bb_active_color_preset_id','bb_active_theme','bb_label_open']` (`:1139`). `READ_KEYS` = `['bb_products','bb_stickers']` (`:1140`).

### D-4. JSON export/import format

Export envelope `exportPayloadV2` (`:2132-2153`):

```json
{ "template": "bb_label_template_v2", "schemaVersion": 2, "name": "...", "date": "<ISO>",
  "designType": "...", "designLocked": false, "labelMode": "back", "isTapered": false,
  "productId": "", "flavorKey": "...", "productIdentity": { }, "syncTargets": { },
  "syncFields": { }, "state": { } }
```

Written as a download (`:3378-3381`, filename `bbLabel-<sanitised name>.json`) and as a folder sidecar (`:1152`). Sanitiser is `replace(/[^\w\- ]/g,'_')` in both places (`:1152`, `:3295`, `:3380`).

Import path `normalizeLegacyImport` (`:1701-1724`) — **throws** unless `data.state` exists (`:1702`); derives `isTapered` from three candidate fields (`:1704`); defaults `labelMode` to `'back'` (`:1705`) and `designType` to `'rect_top'` (`:1715`); derives `productIdentity` from the payload or from state (`:1706`); assigns `schemaVersion` 2 only when `template === 'bb_label_template_v2'`, else 1 (`:1720`); retains `legacyDate` and `legacyTemplate` for provenance (`:1721-1722`). Callers: `tmplImportOneFile` `:3388`, `tmplLoadFromSavedSel` `:3482`, `migrateLegacyPresets` `:3622` and `:3636`.

### D-5. Migration logic

Three separate migrations:
1. **Legacy presets** — `migrateLegacyPresets` `:3613-3643`. Full trace in §1.3.
2. **Library forward-migration** — `migrateLibraryProductIdentity` `:3645-3664`, run at `:3674`. Backfills `productIdentity`, `syncTargets`, `syncFields`, `schemaVersion` and `flavorKey` on every existing template; writes only if something changed (`:3658-3663`).
3. **Circle brand backfill** — `migrateCircleBrandFields` `:1566-1571`: if `eCBrand1`/`eCBrand2` are blank, copies `tTitle1`/`tTitle2` into them. Called on every flat-state load (`:1413`, `:1417`, `:1462`, `:1574`) — an implicit, unversioned data mutation on read.

Also `ensureTemplateModes` (`:1371-1378`) lazily derives `modeStates` from a flat `state` and infers a missing `designType` via `inferDesignType` (`:1331-1339`, which falls back to filename/name keyword sniffing at `:1335-1337`).

## E. Hardcoded values registry

Proposed `BrandConfig` keys are **candidates for the P01 schema pass, not decisions.** `BRAND_CONFIG.md` does not exist yet; nothing here is signed.

### E-1. Brand identity, monogram, the typo

| Value | Proposed BrandConfig key | Wizard input | file:line |
|---|---|---|---|
| `BALANCE` (top title line 1 default) | `brand.wordmark.line1` | text | `:993`, `:2821` |
| **`BYTES`** — the typo, live default | `brand.wordmark.line2` | text | `:994`, `:1033`, `:2821` |
| **`BYTES`** — the typo, placeholder ×2 | (same key) | text | `:376`, `:386` |
| `BB` (monogram, top mode) | `brand.monogram` | text (≤3 chars) | `:992` |
| `BB` (monogram fallback in `getVals`) | `brand.monogram` | text | `:2810` |
| `Balance Bites` (document title) | `brand.name` | text | `:7` |
| `BALANCE BITES` (in the absolute path) | `brand.name` (uppercased) | derived | `:1138` |
| `**Best Before:` / `**Production Date:` | `labels.dates.bestBefore` / `.production` | text ×2 | `:1756`, `:701`, `:704` |
| `NET WEIGHT: ` prefix, applied programmatically | `labels.netWeight.prefix` | text | `:1783` |

**The `**` prefix on the two date labels and the allergen line has no parser.** Exhaustive grep finds exactly ten `**` occurrences in the file (`:582`, `:701`, `:704`, `:1756`, `:1771-1772`, `:1805-1806`, `:1830-1831`) and **every one is a data literal — none is a parser, splitter, or replacer.** The value is interpolated raw into `innerHTML` at `:2487`. So a freshly-created label renders the literal text `**Best Before:` and `**Allergen Info: …` onto the printed output. Recorded as H-19; whether label-v3 had a parser for this convention is **not recorded** in REPORT §2.2, so this may be an artifact of the rewrite dropping one.

### E-2. Colours

The theme system is genuinely token-driven at runtime — `SC` (`:1134`) holds the nine live values, `applyTheme` (`:1288-1307`) writes them to CSS custom properties, and the renderers read from `SC`. But the **seed** values and a set of chrome literals are hardcoded.

| Value | Proposed key | Wizard input | file:line |
|---|---|---|---|
| `#6b4423` brown, `#c9a227` gold, `#faf7f2`, `#8a7a68`, `#f5f0e8`, `#efe7d8`, `#e8dcc4` (preset "Balance Bites") | `theme.presets.default.*` | colour ×9 | `:1273` |
| Preset "Dark Mode" — 9 hex values | `theme.presets.dark.*` | colour ×9 | `:1274` |
| Preset "Ocean Blue" — 9 hex values | `theme.presets.ocean.*` | colour ×9 | `:1275` |
| `#4caf50` / `#ff9800` / `#555` — folder status dot | `tokens.status.ok/warn/idle` | colour ×3 | `:1181` |
| **`#2e7d32` (green) — `cLabel` and `cLogoTxt` fallback defaults in `getVals`** | `theme.fallback.labelBg` / `.logoText` | colour ×2 | `:2758` |
| `#ffffff` — `logoCircle` fallback default | `theme.fallback.logoCircle` | colour | `:2759` |
| `#7a6f58` and `rgba(201,168,76,.15)` — batch-row label chrome | `tokens.batch.*` | colour ×2 | `:2931` |
| `#0a0a0a`, `#e8dcc4`, `#1a1a1a` … — panel chrome throughout the `<style>` block | `tokens.chrome.*` | colour | `:9-289` (≈70 literals) |
| Checkerboard grey for Isolated mode | `tokens.iso.checker` | colour | `:277` |

The `getVals` fallbacks at `:2758-2759` are the notable ones: they are hardcoded **inside the value-resolution layer**, so they bypass `SC` and the theme engine entirely, and `#2e7d32` is a **green** — not a colour from any of the three seeded brand presets (`:1273-1275`). Any template whose state lacks `cLabel` renders green rather than brand brown. The batch-row literals at `:2931` will likewise not follow a theme change.

### E-3. Fonts

| Value | Proposed key | Wizard input | file:line |
|---|---|---|---|
| Montserrat, DM Sans, Playfair Display, Syne, Tajawal — the **loaded** set | `typography.families.loaded[]` | multi-select | `:8` |
| `Montserrat` (heading default), `DM Sans` (body default), `Tajawal` (Arabic default) | `typography.heading/body/arabic` | select | `:843-872` |
| **Unloaded families offered in the dropdowns** — every option at `:843-872` beyond the five above | — | — | `:843-872` |

The dropdowns offer families the page never loads. Selecting one silently falls back to the browser default, and — critically — **the PNG export will differ from the screen** only if the fallback resolves differently at 4× scale; `await document.fonts.ready` (`:3074`) waits only for fonts that were actually requested. Recorded as smell H-9.

### E-4. Product, flavour, and content strings

| Value | Proposed key | Wizard input | file:line |
|---|---|---|---|
| Default tip title/body EN + AR | `content.tips.default.*` | textarea ×4 | `:646-649` |
| Default ingredients title/body/allergen EN + AR | `content.ingredients.default.*` | textarea ×6 | `:580-582`, `:676-678` |
| Default storage line EN + AR | `content.storage.*` | text ×2 | `:707-708` |
| 6 default badge emoji + 6 default badge labels | `content.badges[]` | repeatable | `:523-576` |
| Nutrition row labels ×13 (`Total Fat`, `Saturated Fat`, … `Potassium`) | `content.nutrition.rowLabels` | fixed list | `:595-631` |
| `Nutrition Facts` heading | `content.nutrition.heading` | text | `:2377` |
| `% Daily Value` | `content.nutrition.dvLabel` | text | `:2379` |
| Default net weight string | `content.netWeight.default` | text | `:513` |
| Default flavour text (Circle mode) | `content.flavour.default` | text | `:1059` |
| 17×17 faux-QR bit pattern | — (not brand data; see H-7) | — | `:2278-2283` |

**Prices, currency, contact info, real QR/barcode content: none present.** The tool holds no `EGP`, no phone number, no address, no barcode encoder. The only QR is an uploaded image (`:709-714`, `:1086-1090`) or the faux pattern. This is the one respect in which the file is *cleaner* than the business tools REPORT §2 audited.

### E-5. The absolute Windows path — `:1138`

```
var SHARED_DATA_PATH='C:\\Users\\<REDACTED>\\Desktop\\BALANCE BITES\\invoices customers\\saved data';
```

Three consumers: an `alert()` telling the user which folder to select (`:1148`), the `#fsPathHint` label (`:1181`), and an exported `getSharedPath()` accessor (`:1182`).

**BrandConfig disposition: none. This value must not enter BrandConfig.** It is a machine-specific filesystem path, not brand configuration, and it embeds the operator's Windows username. Correct dispositions, in order of preference: (1) drop it — the FSA picker already remembers its handle via `bb_filestore_v1`, so the hint is cosmetic; (2) derive the display string from `_handle.name`, which `:1181` already does for the connected state; (3) if a hint is genuinely required, make it a runtime setting in the persisted store, never a source literal. It is identical in intent to the same constant in `bb-stock-costs.html:1186` and `balance-bites-invoice-pro.html`, so this is a third copy of one defect — see §3.3.

**Privacy note:** on a public repository this line discloses the operator's OS username and desktop layout. It is not customer PII, so it does not meet the escalation bar set for `bb-browser-data-backup-*.json`, but it should be recorded in the privacy findings (§J).

### E-6. Dimensions (cm / mm) and geometry constants

| Value | Proposed key | Wizard input | file:line |
|---|---|---|---|
| `17` × `4.5` cm — back label default | `print.defaults.backLabel.{w,h}` | number ×2 | `:736-737` |
| `9.0` / `7.0` / `9.0` / `7.0` cm — cup Ø top / Ø bot / H / label H | `print.defaults.cup.*` | number ×4 | `:748-753` |
| `0.5` cm — offset from cup bottom | `print.defaults.cup.offsetBottom` | number | `:756` |
| `85` % — label wrap | `print.defaults.cup.wrapPct` | number | `:757` |
| `4.0` cm — Top sticker size | `print.defaults.topLabel.size` | number | `:979` |
| `6` × `6` cm — Circle label | `print.defaults.circleLabel.{w,h}` | number ×2 | `:1019-1020` |
| Control ranges: 8–40, 2–12, 3–25, 2–15 cm | `print.limits.*` | number pairs | `:736`, `:737`, `:1019`, `:979` |
| **`37.795` px/cm — the PPC constant, defined 4×** | `print.pxPerCm` (single source) | derived, not editable | `:2219`, `:2519`, `:2842`, `:2874` |
| `0.6` cm — the 3 mm-per-side safety buffer | `print.safetyBufferCm` | number | `:2899` |
| `0.01` / `0.1` cm — degenerate-taper guard epsilon | `print.taper.epsilon` | — | `:2225` |
| A4 / Letter / A3 page sizes (named, via `@page size`) | `print.pageSizes` | select | `:2894-2896` |
| `400` chars — asset-offload threshold | `storage.assetInlineMaxChars` | number | `:1745` |
| `4` × — PNG supersampling factor | `export.png.scale` | number | `:3075` |

`37.795` is truncated. The exact value is 96 / 2.54 = 37.7952755905…, so each definition carries a −0.00028 px/cm error. Over a 40 cm label that is −0.011 px ≈ −0.003 mm — **well inside the ±0.2 mm print tolerance**, and therefore not a parity risk on its own. The real defect is that it is defined four times: `AGENTS.md` §6 requires one px↔mm constant from `src/print/`, and four local copies are four places for them to drift apart. Recorded as H-6.

## F. Print & rendering logic

### F-1. Single-DOM, but the print path does use real units

There is **one** DOM tree. `#labelWrap` (`:476`) holds the preview; `@media print` hides the chrome and prints that same tree. Print rules live in the static `<style>` block at `:273` plus a dynamically injected `#dynPrint` element rewritten on every `render()` (`:2867-2868`, `:2890-2904`).

The **screen** copy is sized in **pixels** (cm × PPC, `:2842`, `:2874`) and scaled with a CSS `transform:scale()` driven by `#sScale` (`:764`, applied `:2884`). The **print** copy is re-sized in **centimetres** by `pCss` (`:2891`), which sets `.lbl-scale-outer, .lbl-scale-inner, .lbl, .lbl-taper-wrap` to `width:<pWidth>cm!important; height:<pHeight>cm!important; transform:none!important`. So real units *are* used for print geometry.

**It is still not the dual-DOM pattern `AGENTS.md` §6 mandates.** One element tree is re-dimensioned by print CSS rather than a separate print DOM authored in real units. The consequence is that only the *outer* boxes are converted: every internal offset, font size and nudge inside the four renderers stays in px computed against PPC (`:2842`, `:2874`), so the interior scales by whatever ratio the browser resolves between the px layout and the cm-constrained container. That ratio is where print drift will come from, and it is not asserted anywhere. The port needs a real print DOM in mm, which is a re-architecture of `render()`, not a CSS tweak. Recorded as a carry-forward for the print module.

### F-2. Page geometry

`render()` computes the print box then writes one `@page` rule. **All four modes use `margin:0`** (`:2894-2901`):

| `#sPrintSize` | `@page` | Line |
|---|---|---|
| `a4` | `size:A4 portrait;margin:0` | `:2894` |
| `letter` | `size:letter portrait;margin:0` | `:2895` |
| `a3` | `size:A3 portrait;margin:0` | `:2896` |
| `exact` | `size:<pw+0.6>cm <ph+0.6>cm;margin:0` | `:2899-2901` |
| `tapered` | as `exact`, but `pw`/`ph` are the tapered bounding box +0.1 cm each (`:2886-2887`) | `:2899-2901` |

Buffer arithmetic: `buffer = isIsoMode ? 0 : 0.6` (`:2899`), then `bw = pWidth + buffer` (`:2900`), emitted with `toFixed(2)` (`:2901`). In Isolated Output mode the buffer is 0, so `exact` becomes a true trim-to-edge page.

The tapered branch adds `+0.1` cm to each dimension **before** the buffer (`:2886-2887`), so a tapered exact page is 0.7 cm larger than the bounding box per axis, not 0.6. That extra millimetre per side is undocumented in the code and is a parity detail the port must either reproduce or explicitly drop.

### F-3. What breaks on different paper

1. **`exact` / `tapered` on a printer without custom page sizes.** A 17.6 × 5.1 cm page is honoured by PDF targets and by label printers, but a typical office laser silently substitutes A4 and prints the label at the top-left with the driver's own unprintable margin applied. No warning; `#sizeInfo` (`:474`, written `:2906-2909`) reports the intended geometry only.
2. **`margin:0` on every mode, against a hardware unprintable margin.** This is the significant one, and it applies to A4/Letter/A3 as well as `exact` — all four emit `margin:0` (`:2894-2896`, `:2901`). Consumer lasers cannot print within 4–5 mm of the sheet edge. On `exact` the 3 mm buffer (`:2899`) is *less* than that margin, so edge content clips. On A4 the label is flex-centred (`:2891`), so it survives — the risk is confined to the exact modes.
3. **`min-height:100vh` on `#main`, `#layout`, `#labelWrap`** (`:2891`) combined with flex centring. In a paged context `100vh` resolves against the page box; with `margin:0` this is exactly one page, but any UA that resolves it larger emits a second blank page. Worth measuring on the physical printout gate.
4. **A tapered label wider than the sheet.** At the 40 cm rectangular maximum, or a large cup, `bbW_cm` (`:2252`) can exceed A4's 21 cm; with `a4` selected the sector is clipped, not scaled. There is no fit-to-page path.
5. **Batch mode has no page-fitting logic at all.** `:2913-2935` renders the selected templates into a flex container, but the `@page` rule reflects the *open* template's geometry because `:2890-2904` runs before the batch branch. See H-4.
6. **Firefox drops the label's background field.** `pCss` sets `-webkit-print-color-adjust:exact !important` on `*` (`:2891`), so backgrounds **are** forced on the stated targets — Chrome, Edge and Brave (`:1148`). The unprefixed standard `print-color-adjust` is **not** set anywhere, and Firefox honours only the unprefixed property. Printing from Firefox therefore drops the brown/gold background field and the section background images. Consistent with the tool's declared support, so LOW for current use; a real constraint the port must not inherit silently.

### F-4. Renderers

Four distinct paths, selected in `render()` (`:2865-2911`):

| Mode | Function | Output | Line |
|---|---|---|---|
| Back, flat | `buildLabel` | HTML divs, absolutely positioned in px | `:2286-2373` |
| Back, tapered | `buildTaperedLabel` | **SVG** — one annular-sector `<path>` per section as a `clipPath`, content inside `<foreignObject>` | `:2516-2640` |
| Top | `buildTopLabel` | HTML, square/round via `border-radius` | `:2645-2669` |
| Circle | `buildCircleLabel` | HTML, circle via `border-radius:50%` | `:2672-2749` |

`sectorPath()` (`:2266-2275`) generates the annular sector path data from R1, R2 and the arc span. Section order and visibility are applied before rendering (`:2302-2311`), and per-section widths come from the budget sliders (`:776-785`).

The SVG path is the one that matters for print fidelity: `foreignObject` content is laid out by the browser, and Firefox's `foreignObject` handling differs from Chromium's. The tool targets Chromium explicitly (`:1148` alerts "Use Chrome, Edge or Brave"), so this is consistent with its stated support, but the port cannot assume it.

## G. Bilingual / RTL handling

**Chrome is Arabic; content is bilingual and fully editable.**

- The left panel is `dir="rtl"` (`:294`) and the whole `<style>` block is authored for it (`:16`). The workspace is `dir="ltr"` (`:439`). The `<html>` element itself has no `dir` (`:2`).
- **All UI chrome is Arabic literals in markup** — `:297` (`تصميم الملصقات`), `:300-301` (folder controls), `:317`/`:319`, `:328`, `:351`, `:428`, `:447`, `:1181` (`متصل ·`, `إعادة ربط saved data`, `غير متصل`, `📁 ربط saved data`, `🔓 إعادة الربط`, `📁 تغيير`), `:2769`, and throughout. None of it is in a resource table. This is the same finding REPORT §2 records for the other tools; the tool is not internationalised, it is Arabic-chromed.
- **Per-field `dir="rtl"`** on every Arabic content input: `:647`, `:649`, `:676`, `:677`, `:678`, `:689`, `:690`, `:702`, `:705`, `:708`, `:914`.
- **Language modes** scope which side renders, per content group: tips (`:640-644`), ingredients (`:670-674`), product name (`:683-687`), dates (`:695-699`). Default `both` in all four. Honoured at `:2350`/`:2355`, `:2435`/`:2441`, `:2464`/`:2468`, `:2486`/`:2491`.
- **Arabic in the rendered label is data, never baked.** Every Arabic string that reaches the canvas comes from an input value or its default. Verified by reading all four renderers (`:2286-2373`, `:2516-2640`, `:2645-2669`, `:2672-2749`) — none contains an Arabic literal.
- The Arabic font is `Tajawal` (`:8`, default at `:872`), applied via a dedicated `--f-ar` custom property so Arabic and Latin can be styled independently.

### Verbatim Arabic strings (representative, quoted as required)

| Line | String |
|---|---|
| `:297` | `تصميم الملصقات` |
| `:300` | `مجلد البيانات` |
| `:301` | `📁 ربط saved data` |
| `:317` | `عائلة التصميم` |
| `:328` | `ملفات مجلد saved data` |
| `:351` | `ربط المنتج` |
| `:428` | `ثيم التطبيق` |
| `:447` | `اسم القالب` |
| `:1181` | `متصل ·` / `إعادة ربط saved data` / `غير متصل` / `📁 تغيير` / `🔓 إعادة الربط` |
| `:647` | `نصائح التقديم` (default tip title AR) |
| `:676` | `المكونات` (default ingredients title AR) |
| `:702` | `أفضل قبل:` |
| `:705` | `تاريخ الإنتاج:` |
| `:708` | `يحفظ في مكان بارد وجاف` |
| `:2769` | `تم الحفظ` (toast) |

## H. Bugs, smells & fragility — severity-ranked

### CRITICAL

**H-1 — Silent legacy-preset destruction on name collision.** `:3621` `continue` + `:3628` unconditional `removeItem`. Full analysis in §0 RISK-1 and §1.3. Runs on page load with no UI trigger.

**H-2 — `templateKey` written only to localStorage, then overwritten from disk.** The four `bb_stickers` writes (`:1243`, `:2168`, `:3262`, `:3312`) go through `Store.set`, which calls `FileStore.writeKey` (`:1185`) — but `writeKey` early-returns for any key outside `WRITE_KEYS` (`:1151`), and `bb_stickers` is in `READ_KEYS` (`:1140`). Meanwhile `loadAll` (`:1150`) unconditionally overwrites the localStorage copy from `bb_stickers.json`. Every sticker↔template link is therefore lost on the next folder load unless bb-stock-costs writes it to disk first. Detailed in §3.1 and §3.2.

**H-3 — `margin:0` on every page mode, against the printer's unprintable margin.** All four `@page` rules emit `margin:0` (`:2894`, `:2895`, `:2896`, `:2901`). On the `exact` and `tapered` modes the 3 mm safety buffer (`:2899`) is the only bleed and is *smaller* than the 4–5 mm unprintable margin of a typical consumer laser, so edge content clips on a physical printout. This is the finding most likely to cost material, and it can only be confirmed or cleared by the measured printout the print gate requires. §F-3 item 2.

**H-4 — Batch mode renders every template with the open template's geometry, mode and missing-field values.** Three distinct defects in the batch branch (`:2913-2935`):

1. **Wrong page size.** `:2894-2901` computes `@page` from the *open* template's dimensions, before the batch branch runs. Printing from batch mode uses a page geometry computed for a label that is not on the page.
2. **Wrong dimensions and wrong mode per label.** `:2925-2928` pass `d.W, d.H` — the dimensions of the **open** template — to every batch label, and select the renderer from the live `labelMode` (`:2925-2927`) rather than each template's own stored `labelMode` (`C-1`). A 6 × 6 cm circle template selected in batch while a 17 × 4.5 cm back label is open renders as a 17 × 4.5 cm back label. Only `_isTapered` is read per-template (`:2927`).
3. **Per-field live-DOM leakage.** `getVals(st)` *is* correctly passed the template's own state (`:2920`), but `_G` (`:2753`) falls back to `G(id)` — the live DOM — for any field where `src[id] === undefined`. Since `presetGetState` omits every `hx*` asset field unless `full` (`:3147`), and older templates predate newer fields, batch labels silently inherit the open editor's values for exactly those fields.

### HIGH

**H-5 — Unescaped `innerHTML` with user-controlled data.** 18 `innerHTML` assignments. An escaper exists and is used in some places (`:2114`, `:3439`, `:3448`, `:3599`) but not others. Confirmed unescaped, user-controlled sinks:

- **`:1282`** — the colour-preset grid interpolates `p.name` (user-typed at `:431`) raw into the card body: `'<div class="clr-preset-name">'+p.name+'</div>'`. The same line also interpolates `p.bg`, `p.gold` and `p.txt` raw into three inline `style="background:…"` attributes — a CSS-injection sink distinct from the HTML one.
- **`:3035`** — the batch panel interpolates the template name raw: `'<span class="batch-item-nm">'+p.name+'</span>'`.
- **`:2931`** — the batch row header interpolates `modeName.toUpperCase()`, which is built from `tmpl.name` at `:2921-2923`, raw into `innerHTML`.
- **`:2487`** and the surrounding date/ingredient/nutrition renderers interpolate every label content field raw (`v.dateLabel1`, `v.date1`, `v.dateLabel1Ar` at `:2487`, `:2493`).

The `onclick` handlers at `:1282`, `:3034`, `:3604-3605` interpolate only `p.id` / `t.id`, which are machine-generated (`:1190`), so attribute breakout is not reachable through them.

**The escaper is also incomplete.** `escHtml` (`:1326`) replaces `&`, `<` and `"` only — **not `>` and not `'`**. It is adequate for element-body text but unsafe for single-quoted attribute contexts, so it cannot be applied blindly as the fix.

The threat model is narrow — a single-user local file, data authored by the same operator — but every import path (`:3400-3421` multi-file, `:341` whole-directory, `:3482` folder JSON) accepts a template name from a file the operator did not author. A crafted `bbLabel-*.json` dropped into the shared folder yields script execution in a context holding the readwrite FSA directory handle. That elevates it from cosmetic to real.

**H-6 — PPC defined four times.** `:2219`, `:2519`, `:2842`, `:2874`. §E-6.

**H-7 — The faux QR is not a QR code.** `buildQR` (`:2278-2283`) emits a fixed 17×17 bit pattern. It is decorative and unscannable. It renders by default whenever no QR image is uploaded (`:2498`), so a label can go to print carrying what looks like a QR code and is not. Whether label-v3 had the same behaviour is **not recorded**.

**H-8 — Base64 images in localStorage.** Up to 15 image slots per template (6 badges `:523-576`, 2 serving icons `:650-665`, 1 QR `:709-714`, 5 section backgrounds `:927-966`, 1 product photo `:1046`). The `hx*` fields are excluded from the normal save path (`:3147`) and offloaded to the folder above 400 chars (`:1745`, `:2155`), which is a real mitigation — **but only when the folder is connected.** Disconnected, `writeAsset` fails and the base64 stays inline in `bb_label_templates`, in localStorage, with the quota error swallowed at `:1185` and the library uncapped (ABSENT-2). This is H-8's interaction with ABSENT-2 and is the single most likely cause of silent data loss in ordinary use.

**H-9 — Font dropdowns offer families the page does not load.** §E-3. Silent fallback, and the PNG export inherits it.

**H-19 — The `**` prefix convention has no parser and prints literally.** Ten `**` occurrences, all data literals (`:582`, `:701`, `:704`, `:1756`, `:1771-1772`, `:1805-1806`, `:1830-1831`); zero parsers. `v.dateLabel1` reaches `innerHTML` raw at `:2487`. A freshly-created label therefore prints `**Best Before:` and `**Allergen Info: …`. Existing templates may have had the `**` hand-removed in their saved state, which would mask the defect for the owner's current work while every new label reproduces it. Whether label-v3 parsed the convention is **not recorded**.

### MEDIUM

**H-10 — Swallowed catch blocks.** `catch(e){}` with no logging at `:1185` (all three `Store` methods), `:1268`, `:3629`, and ~20 further sites. The `Store.set` case is the consequential one: a quota failure is indistinguishable from success to both the code and the user.

**H-11 — `async render()` called without `await`.** `render()` is `async` (`:2865`) because it awaits asset resolution (`:2156`). Most of the ~200 `oninput="render()"` / `onchange="render()"` handlers ignore the promise, as does `:3685`. Rapid edits can interleave two renders; the later-resolving one wins. Visible as a preview that briefly shows stale assets.

**H-12 — Asset directories are never cleaned up.** `tmplDelete` (`:3315-3340`) deletes the library record and the `bbLabel-<name>.json` sidecar but not `label_assets/<templateId>/`. Orphaned asset files accumulate in the shared folder indefinitely.

**H-13 — Renaming a template orphans its sidecar.** The sidecar filename derives from the name (`:1152`, `:3295`). Renaming writes a new file and leaves the old one, which then appears in `listLegacyLabelFiles` (`:1163-1172`) and in the folder-load dropdown (`:3458-3498`) as a stale duplicate.

**H-14 — `tmplSave` overwrites by name without confirmation.** `:3252-3255`. §0 RISK-2.

**H-15 — Degenerate taper geometry is silently corrected.** `:2225` mutates `dTop` when it is not greater than `dBot`. The user's entered value is discarded without notice.

**H-16 — `clearB64` is called with an empty `inputId`.** `:3133`. The base64 field is cleared but the associated file input keeps its filename, so the UI shows a file that is no longer applied.

**H-17 — `migrateCircleBrandFields` mutates on every read.** `:1566-1571`, called from `:1413`, `:1417`, `:1462`, `:1574`. An unversioned implicit write-on-read; the migration cannot be distinguished from user intent afterwards.

**H-18 — Float drift in the geometry chain.** `calcTaper` (`:2218-2263`) chains ~12 floating-point operations from cm through radians to px, with no rounding discipline until display. `toFixed` appears only in the readouts (`:2256-2261`, `:2906-2909`). Values feed `sectorPath` (`:2266-2275`) as raw floats. Within tolerance for a single render, but there is no invariant asserting that the sector's chord matches the computed label width — exactly the kind of thing the port's parity tests must pin.

### LOW — dead code and stale references

- `#flavorGrid` — referenced, never rendered
- `toggleAcc` and its accordion ids — the accordion was replaced by tabs; handler and ids remain
- `.sb-foot`, `.sbbtn` — CSS with no matching markup
- `.tmpl-lib-item` — CSS for a list layout replaced by the card grid
- `#sw5` — an input with no reader
- "Added Sugars" — the input exists (`:619`) and the renderer emits the row, but the `%DV` field is not wired the way the other eight are
- `:3147` — comment referring to "the 30 internal slots", a concept that no longer exists (ABSENT-2)
- `:1721-1722` — `legacyDate` / `legacyTemplate` are written by `normalizeLegacyImport` and never read

**No duplicate element ids.** 388 `id=` attributes, all unique (verified programmatically). This is worth recording because REPORT §2 flags duplicate ids in the business tools; the sticker tool is clean here.

## I. External dependencies

| Dependency | Line | Purpose | Offline behaviour |
|---|---|---|---|
| `https://cdnjs.cloudflare.com/ajax/libs/dom-to-image/2.6.0/dom-to-image.min.js` | `:6` | PNG export | **Hard break.** `exportPNG` (`:3063`) calls `domtoimage.toPng` at `:3090`/`:3101` with no capability guard, so the reference throws. The `catch` at `:3119-3122` does log and toast, so it fails visibly rather than silently — but PNG export is entirely unavailable, and Isolated Output mode (`:3048`) auto-invokes it |
| `https://fonts.googleapis.com/css2?family=Montserrat…&family=DM+Sans…&family=Playfair+Display…&family=Syne…&family=Tajawal…` | `:8` | 5 families | **Soft break with print consequences.** Text renders in fallback faces at different metrics, so line breaks and overflow differ from the design. For a print tool this is a parity failure, not cosmetic. Arabic is worst affected — `Tajawal` falls back to whatever the OS provides |

Two CDN references, no others. No jQuery, no framework, no polyfill. `AGENTS.md` §3 requires both to be bundled in the port (`check-no-runtime-cdn`); `dom-to-image` becomes an npm dependency, which per §2 requires a stop-and-flag before it is added.

## J. Security & privacy

**No network egress of user data.** No `fetch`, no `XMLHttpRequest`, no `WebSocket`, no form `action`, no analytics. Everything stays on the machine. The two CDN loads are inbound only.

| Finding | Severity | Evidence |
|---|---|---|
| **Unescaped `innerHTML` reachable from imported files** — a crafted `bbLabel-*.json` in the shared folder can execute script in a context holding the readwrite FSA handle | HIGH | `:1282`, `:2487`, `:2931`, `:3035`; import paths `:341`, `:3400-3421`, `:3482`; incomplete escaper `:1326` |
| **The operator's OS username and desktop path are a source literal**, surfaced in an `alert()` and an on-screen hint | MEDIUM (public-repo disclosure) | `:1138`, `:1148`, `:1181` |
| **Read access to the whole business data folder** — the FSA handle is `mode:'readwrite'` on the shared directory, and `loadAll` reads `bb_products` and `bb_stickers` (customer-adjacent business data) into localStorage | MEDIUM | `:1148`, `:1150`, `:1140` |
| **`deleteFolderJson` can `removeEntry` on any file in that folder** — the delete button (`:335`) is scoped to `bbLabel-*.json` by the dropdown's population (`:1163-1172`), but the function itself takes an arbitrary filename | MEDIUM | `:1173-1176`, `:3500-3535` |
| **A persistent readwrite directory handle survives in IndexedDB** across sessions, re-validated with `queryPermission` (`:1146`) but never voluntarily released | LOW | `:1142-1148`, `:3671` |
| **Two CDN loads are un-pinned** — no SRI hash, no `integrity`, no `crossorigin`. A compromised CDN executes in a context holding the FSA handle | MEDIUM | `:6`, `:8` |
| **No third-party analytics, telemetry, or beacons** | — (positive finding) | verified absent |
| **No credentials, tokens or keys anywhere in the file** | — (positive finding) | verified absent |
| **Business data reaches localStorage, which is unencrypted and readable by any script on the origin** | LOW at `file://`, higher once served | `:1150`, `:1185` |

---

# PART 3 — IMPACT ON THE EXISTING AUDIT

## 3.1 Coupling — the mechanism, and what §3.3 must be rewritten to say

REPORT.md §3.3 concluded the design tools are "independent islands" sharing no runtime data. That is false for this file. The mechanism, precisely:

### 3.1.a Three shared channels

**Channel 1 — the shared folder, via the File System Access API.**

`SHARED_DATA_PATH` (`:1138`) is the same absolute path `bb-stock-costs.html:1186` uses. `FileStore.connect()` (`:1148`) calls `showDirectoryPicker({mode:'readwrite'})` on it. Both tools then read and write `<key>.json` files in that one directory.

**Channel 2 — the same IndexedDB handle store.** `bb_filestore_v1`, object store `h`, key `'dir'` (`:1142-1144`). `bb-stock-costs.html:1187-1188` uses the identical database, store and key. **They share the persisted directory handle.** Connecting the folder in either tool means the other reconnects silently on next load without a picker prompt. This is the single most consequential coupling fact and REPORT §3.3 does not have it.

**Channel 3 — localStorage keys on the same origin.** Both tools run from the same directory, so `file://` origin rules permitting, they share the localStorage namespace.

### 3.1.b Key-by-key direction, trigger, and error handling

| Key | Sticker tool | bb-stock-costs | Direction | Trigger in sticker tool | Error handling |
|---|---|---|---|---|---|
| `bb_products` | **read only** (`:2158`) | `READ_KEYS` (`:1182`) — also read-only | Invoice Pro → both | catalog dropdown populate (`:2160`), weight pull (`:2034`) | `Store.get` returns `[]` on any failure (`:1185`) — an empty catalog is indistinguishable from a parse error |
| `bb_stickers` | **read + write** (read `:1228`, `:2168`, `:2173`, `:3304`; write `:1243`, `:2168`, `:3262`, `:3312`) | `WRITE_KEYS` (`:1180`) | **bidirectional, and broken** | template save (`:3262`), template delete (`:3312`), deep-link (`:2168`, `:2173`) | **Writes never reach disk** — `writeKey` early-returns because `bb_stickers` is not in the sticker tool's `WRITE_KEYS` (`:1139`, `:1151`). H-2 |
| `bb_label_templates` | **read + write, primary store** (`:1315-1317`), in `WRITE_KEYS` (`:1139`) | in `WRITE_KEYS` (`:1180`); read at `:6016` | sticker → stock-costs | every save (`:3255`), delete (`:3318`), import (`:3392`), migration (`:3623`) | `Store.set` swallows quota errors (`:1185`); folder write is fire-and-forget |
| `bb_label_open` | **read + delete** (`:2173`), in `WRITE_KEYS` (`:1139`) | **write** (`:6048-6053`), in `WRITE_KEYS` (`:1180`) | stock-costs → sticker | `handleDeepLink()` at `:3682` | consumed then removed; no ack, no error path if the referenced template is missing |
| `bb_color_presets` | **read + write** (`:1271`, `:1277-1278`), in `WRITE_KEYS` (`:1139`) | in `WRITE_KEYS` (`:1180`), same shape (`:1347-1350`) | **bidirectional** | preset save (`:432`), delete, theme switch | swallowed (`:1185`); **the two tools seed different defaults** — §3.4 |
| `bb_active_color_preset_id` | read + write (`:1281`, `:1309`, `:1312`), in `WRITE_KEYS` | in `WRITE_KEYS` (`:1180`) | bidirectional | theme apply (`:1309`) | swallowed |
| `bb_active_theme` | read + write (`:1309-1310`), in `WRITE_KEYS` | not in stock-costs' key list | sticker only | theme apply | swallowed |
| `bbLabel-<name>.json` | **write** (`:1152`, via `:3295`), **read** (`:1158-1172`, `:3458-3498`), **delete** (`:1173-1176`, `:3500-3535`) | **write** (`:1292`) | **bidirectional, file-level** | save, folder load, folder delete | `writeLegacyLabel` failures are swallowed; a name collision silently overwrites |
| `label_assets/<templateId>/<field>.txt` | write (`:1178`), read (`:1179`) | not touched | sticker only | asset offload >400 chars (`:1745`, `:2155`) | never cleaned up (H-12) |

### 3.1.c The load/write asymmetry that breaks the link

This is the mechanism a builder most needs to understand:

- Sticker tool `WRITE_KEYS` (`:1139`) = 5 keys, **`bb_stickers` not among them**.
- Sticker tool `READ_KEYS` (`:1140`) = `bb_products`, `bb_stickers`.
- `FileStore.loadAll()` (`:1150`) iterates `WRITE_KEYS.concat(READ_KEYS)` and does `localStorage.setItem(key, text)` for every file present — **overwrite, no merge, no timestamp check**. It then calls `syncAllToFolder()`, which pushes only `WRITE_KEYS` back.
- `FileStore.writeKey` (`:1151`) returns immediately for any key outside `WRITE_KEYS`.

So the sticker tool's `templateKey` writes (`:1243`, `:2168`, `:3262`, `:3312`) land in localStorage and nowhere else, and the next `loadAll()` — page load with a restored handle (`:3672`), Connect (`:1207`), or `ensureFileStoreConnected` (`:1215`) — replaces them from `bb_stickers.json`. The link survives only if bb-stock-costs (which *does* have `bb_stickers` in `WRITE_KEYS`, `:1180`) flushes it to disk in between. Nothing coordinates that.

### 3.1.d What REPORT.md §3.3 must be rewritten to say

§3.3's "independent islands, no shared runtime data" conclusion must be replaced with, in substance:

1. **The design family is not isolated.** `balance-bites-sticker.html` is a full participant in the shared-folder data layer: same absolute path (`:1138` ≡ `bb-stock-costs.html:1186`), same FSA directory handle in the same IndexedDB database and object store (`:1142` ≡ `bb-stock-costs.html:1187-1188`), and eight shared localStorage keys.
2. **The coupling is bidirectional and includes a write into a business entity.** The sticker tool writes `templateKey` (and sometimes `productId`) onto `bb_stickers` rows — a Stock & Costs entity.
3. **There is a deep-link protocol.** `bb-stock-costs.html:6046-6055` writes `bb_label_open` and opens the sticker tool by a path resolved at `bb-stock-costs.html:6040-6044`; the sticker tool consumes and deletes it at `:2173`. This is an inter-tool RPC, undocumented in the audit.
4. **The coupling is currently defective**, per §3.1.c. Any statement that the tools "share data" must be qualified: they share it in one direction reliably and in the other direction not at all.
5. **The remaining design tools have not been re-audited in this pass.** Whether `balance-bites-label-editor- latest.html`, `balance-bites-stand.html` or `balance-bites-carton (2).html` are also coupled is outside this file's scope. §3.3's claim cannot simply be inverted for the whole family — it must be re-derived per file. Flagged for Pass 3.

I checked `balance-bites-invoice-pro.html` for `bb_label_*` references as a bounding test and found none — Invoice Pro does not participate in the label keys. The coupling is specifically sticker ↔ stock-costs, plus a read-only dependency on Invoice Pro's `bb_products`.

## 3.2 The Sticker entity — actual current line numbers and the link contract

### 3.2.a Actual location — REPORT.md's citation has moved by ~319 lines

REPORT.md cites `:2391-2415` for the Sticker entity. The file is now 7,084 lines and the entity is at:

| Element | Actual current lines |
|---|---|
| `StickerMgr` IIFE opens; `KEY='bb_stickers'`, `CONT='stkList'`, `EMOJI='🏷'` | `bb-stock-costs.html:2710-2711` |
| `getAll` / `saveAll` / `find` | `:2712-2714` |
| **`findByProduct(productId, templateKey)`** — the resolver | `:2716-2723` |
| **`add(data)`** — canonical entity shape | `:2725-2732`, shape at `:2727-2730` |
| **`update(id,data)`** — field-by-field merge incl. `templateKey` | `:2734-2749`, `templateKey` at `:2746` |
| `remove` | `:2751` |
| `adjustStock` | `:2753-2757` |

The full entity shape (`bb-stock-costs.html:2727-2730`):

```
{ id, name, unit ('قطعة' default), costPerUnit, currentStock, minStock,
  supplier, notes, productId, templateKey }
```

`productId` and `templateKey` are the two cross-family fields. Both default to `''`.

### 3.2.b Does `templateKey` point at a template defined in the sticker tool? — Yes

Traced end to end:

**Write side, in the sticker tool.** `tmplSave()` at `:3262` writes `templateKey: currentTemplateId` onto the linked sticker row, where `currentTemplateId` is a `LabelTemplate.id` of the form `lbl_<timestamp>_<rand36×3>` (`genId` `:1190`, assigned `:1320`). `linkStickerToTemplate` (`:1228-1243`) is the shared helper; `:1233` also sets `productId`. `tmplDelete` at `:3312` clears it back to `''`.

**Read side, in bb-stock-costs.** `bb-stock-costs.html:6016` reads the sticker tool's own primary key: `Store.get('bb_label_templates', [])`. That array is exactly what `LabelTemplateMgr.saveAll` writes (`:1316-1317`). So stock-costs resolves `templateKey` against the sticker tool's template library. Consumers: `:1845` (`tmplById[item.templateKey]`), `:1910` (same, with a fallback return), `:5984` (`populateStickerTemplateSel`), `:6068` (form field `itmTemplateKey`), `:6252-6254` (recipe ingredient resolution, with a two-step fallback).

**The dual-identity quirk.** `findByProduct` (`bb-stock-costs.html:2720`) accepts a match on **either** `s.templateKey === templateKey` **or** `s.id === templateKey`. So `templateKey` is overloaded: it may hold a `LabelTemplate.id` (`lbl_*`) or a `Sticker.id` (`stickers_*`). `:6186` confirms the second usage — it assigns `templateKey: legacyId` in a migration path. Any port must handle both, and must not assume the field is a single foreign key.

### 3.2.c The link contract, stated exactly

| Aspect | Contract |
|---|---|
| Storage | `bb_stickers[].templateKey`, a string, `''` when unlinked |
| Referent | `bb_label_templates[].id`, format `lbl_<ms>_<3×base36>` (`:1190`, `:1320`) — **or** a `Sticker.id`, per `bb-stock-costs.html:2720` |
| Written by | sticker tool `:1243`, `:2168`, `:3262`, `:3312`; stock-costs `:6068`, `:6186` |
| Read by | stock-costs `:1845`, `:1910`, `:5984`, `:6050`, `:6252-6254` |
| Reverse link | `LabelTemplate.productId` → `bb_products[].id`; **there is no `LabelTemplate.stickerId`** — the sticker→template edge is one-directional and stored on the sticker |
| Transient link | `_linkedStickerId` (`:1122`), set by the deep-link handshake (`:2173`), lost on reload |
| Referential integrity | **none.** Deleting a template from the library clears only the row the tool knows about (`:3312`, via `_linkedStickerId` / `productId` lookup). Any other sticker referencing that id keeps a dangling `templateKey`; `bb-stock-costs.html:1845` resolves it to `null` and renders without a template |
| Durability | **broken.** Per §3.1.c and H-2, sticker-side writes never reach `bb_stickers.json` and are overwritten by the next `loadAll()` (`:1150`) |

This is a genuine cross-family dependency the audit does not have: **a design-family tool holds a write path into a business-family entity, and a business-family tool depends on the design tool's primary store for display and for recipe costing** (`bb-stock-costs.html:6252-6254`).

## 3.3 Duplication — delta against REPORT.md §3.1

Rows of §3.1's 10-row matrix that this file changes. `−v3` denotes label-v3's removal; `+st` denotes the sticker tool.

| §3.1 row | Impl count before | Delta | After | Note |
|---|---|---|---|---|
| Preset bar / preset system | as recorded | −v3, +st | **net 0, but not equivalent** | The sticker tool's template library (`:1314-1324`, `:3226-3611`) is a different shape from a 30-slot bar (ABSENT-2). Counting it as the same row understates the divergence |
| JSON export/import | as recorded | −v3, +st | **net 0** | New envelope `bb_label_template_v2` / `schemaVersion:2` (`:2138-2139`); gained multi-file + directory import (`:340-341`); **lost bulk export** (ABSENT-3) |
| Colour/theme engine | as recorded | −v3, +st | **net 0** | `:1270-1312`. Now genuinely shared with stock-costs via `bb_color_presets`, so this row shifts from "duplicated" toward "shared with divergent seeds" — see §3.4 |
| Toast | as recorded | −v3, +st | **net 0** | `:2769`, Arabic `تم الحفظ` |
| Print scaffolding | as recorded | −v3, +st | **net 0** | Single-DOM + dynamic `@page` (`:273`, `:2894-2901`) |
| RTL wiring | as recorded | −v3, +st | **net 0** | Extended with 4 language-mode selects — a *new* duplication axis not in §3.1 |
| **FSA shared-folder layer** | 2 (invoice-pro, stock-costs) | **+1** | **3** | `:1136-1183` is a third near-copy of the same `FileStore`. §3.1 does not have this row for the design family at all |
| **`bb_filestore_v1` handle store** | 2 | **+1** | **3** | `:1142-1144` |
| **`SHARED_DATA_PATH` literal** | 2 | **+1** | **3** | `:1138` |
| **`Store` wrapper** | 2 | **+1** | **3** | `:1185` |

**Net across the matrix: every design-family row is unchanged in count (one out, one in), while four business-layer rows each gain an implementation.** The headline is not that duplication grew by a large number — it is that duplication *crossed the family boundary*. Four subsystems previously duplicated only within the business family now have a copy inside a design tool.

### The §3.1 / inventory.json discrepancy

REPORT.md §3.1 has **10 rows**; `docs/inventory.json`'s `duplicationMatrix` has **7**. Delta = **3**. Reported only, not reconciled — that is **CF-06**, Pass 3's job. This audit adds no rows to either artifact and modifies neither file.

## 3.4 Inconsistency — delta against REPORT.md §3.2

| Dimension | Inconsistency introduced or changed |
|---|---|
| **"Preset" shape** | Three incompatible shapes now coexist: label-v3's IndexedDB preset keyed by `name` (`label-v3:856-857`, still live in `BBLabelDB`); the sticker tool's `LabelTemplate` keyed by `id` with `name` as de-facto identity (`:1320`); and the legacy `bbbacklabel_pb*` localStorage arrays (`:3615`), if any survive. The importer must read all three |
| **Storage-key convention** | The sticker tool uses `bb_*` prefixes for its own keys (`:1139-1140`), matching the business tools, while its legacy inputs use the `bbbacklabel_*` convention (`:3615`). Two conventions in one file. Additionally `bb_active_theme` (`:1310`) exists only here — it is in the sticker tool's `WRITE_KEYS` and therefore written to the shared folder, where no other tool reads it |
| **Colour-preset defaults diverge — a live conflict** | The sticker tool seeds **3** presets (`cp_def1` "Balance Bites", `cp_def2` "Dark Mode", `cp_def3` "Ocean Blue", `:1273-1275`). `bb-stock-costs.html:1347-1350` seeds **4** — the same three plus **"Warm Ivory"**. Both write the same `bb_color_presets` key and both mirror it to the shared folder. Whichever tool seeds first wins; whichever loads second sees the other's set. If a user is on "Warm Ivory" and the sticker tool's seeding path runs against an empty store, that preset does not exist here and `bb_active_color_preset_id` dangles. Same field set (`:1273` ≡ `bb-stock-costs.html:1347`), different population. New row for §3.2 |

> **CORRECTION — landed 2026-07-31 by P-04b, verified by P-04 direct read.**
> The three seed names given above are wrong. Read directly from the source,
> they are `Dark Gold`, `Obsidian Blue` and `Forest Night`. The seven-colour
> field structure and the `cp_def1`-`cp_def4` id scheme stated in §C-3 are
> correct and unaffected. The fourth, sticker-absent preset name given in this
> section is UNVERIFIED — §3.4 is its sole record and no direct read confirms
> it. Do not cite this section's naming claims as evidence.

| **Print approach** | §3.2's print-approach row must now record: label-v3's approach is unavailable for comparison (source gone; §2.2F records exact-cm `@page` + PPC only), and the sticker tool is single-DOM with px-sized content and a dynamically rewritten `@page` (`:2867-2868`, `:2894-2901`). PPC is duplicated 4× *within* this one file (`:2219`, `:2519`, `:2842`, `:2874`) — an intra-file inconsistency §3.2 has no row for |
| **`templateKey` semantics** | Overloaded to mean either a `LabelTemplate.id` or a `Sticker.id` (`bb-stock-costs.html:2720`, `:6186`). §3.2 has no row for ambiguous foreign keys |
| **Date formatting** | Templates store `updatedAt` as ISO 8601 (`:1320`); the card meta line renders a locale string (`:3599`); the export envelope uses ISO (`:2140`); user-facing date *content* fields are free text (`:703`, `:706`, `:1094-1095`) with no validation or format contract |
| **The unparsed `**` convention** | Date labels and the allergen line carry a `**` prefix as data (`:582`, `:701`, `:704`, `:1756`) with **no parser anywhere in the file** — it renders literally (`:2487`). No other tool in the audit carries presentation markup in a data field, parsed or otherwise. H-19 |
| **Flavour lists** | `flavorKeyFromState` (`:1776-1779`) derives a flavour string from whichever of four fields is non-empty. There is no enumerated flavour list here, whereas the business tools carry hardcoded flavour lists per REPORT §2. The sticker tool's flavour identity is therefore free text that cannot be joined reliably to any business-side list |

## 3.5 Module plan — recommendation

### Why UNIFICATION.md §6 is stale

§6 planned a merged **Label** module built on label-v3's geometry engine, with a Cup/Sticker Designer extracted later. Both premises are gone: label-v3's geometry engine no longer exists as source (only as REPORT §2.2's description), and the "extract the cup/sticker designer later" sequencing is inverted — the sticker tool *is* the cup/sticker designer, and it now carries the geometry engine (`:2218-2283`, `:2516-2640`) as well as three of the four shape modes.

### Recommendation

**Do not merge the sticker tool into a design-family Label module. Split it in two, along the coupling boundary.**

**Module A — `label-designer` (design family).** The geometry engine, four renderers, print/`@page` layer, PNG export, template library, product-identity/master-text system, theme consumption. This is the sticker tool minus its data-layer participation.

**Module B — `data/adapters` + a `catalog-link` service (shared/business).** The `FileStore` FSA layer (`:1136-1183`), the `bb_filestore_v1` handle store (`:1142`), the `Store` wrapper (`:1185`), the `bb_products` read and the `bb_stickers` `templateKey` write. **None of this belongs in a design module**, and per `AGENTS.md` §3 (`check-no-direct-storage`) none of it may live outside `src/data/adapters/` regardless.

### Justification against Part 1 (capability delta)

- The three surviving shape modes plus the conical unwrap (§1.1 items 1a, 1b, 1c, 2) are one coherent geometry engine with one PPC constant and one `@page` layer. They should not be split across modules. That argues for a **single** design module, not the two §6 envisaged.
- ABSENT-1 (custom size) and ABSENT-3 (bulk export) are capability gaps to be resolved by an OD *before* the module is specified, because both change its public surface: a fourth mode changes the mode enum, and bulk export changes the export envelope.
- ABSENT-2 and ABSENT-4 (uncapped library, localStorage as primary store) are **storage** decisions, not design decisions. They land in Module B. This is the clearest evidence the split is real: the two most consequential regressions in this tool are both in the layer that does not belong to the design family.
- `schemaVersion` (`:1320`, `:1720`) already distinguishes label-v3-descended records from natively authored ones. That versioning belongs in Module B's importer, and it is the hook P02/T02.2 should build on.

### Justification against §3.1 (coupling)

The brief asks whether this tool belongs in the design family at all if it touches business data. **What the code shows: it half-belongs, and the half that does not is the half that is broken.**

- It writes `templateKey` into a Stock & Costs entity (`:3262`), and stock-costs depends on the sticker tool's `bb_label_templates` for recipe costing (`bb-stock-costs.html:6252-6254`). That is a business-data write path and a business-logic dependency.
- The write path is defective in exactly the way a mis-layered design tool would be: a design module reimplemented a partial copy of the business `FileStore` and got the `WRITE_KEYS`/`READ_KEYS` split wrong (§3.1.c, H-2). One shared adapter makes this bug unrepresentable — `bb_stickers` is either writable or it is not, decided once.
- The FSA handle is shared through `bb_filestore_v1` (`:1142` ≡ `bb-stock-costs.html:1187-1188`), so folder connection is already de facto a shared service. Formalising it costs nothing and removes a third copy.

**Conclusion: the design *surface* stays in the design family; the data participation moves to the shared adapter layer.** The tool is not misplaced — it is unseparated.

### On merging with `legacy/balance-bites-label-editor- latest.html`

**Cannot be recommended from this pass.** That file (note the space in the filename) was not read in this audit; it is outside the brief's `FILE:` scope. REPORT.md §2 covers it, but deciding a merge requires a capability delta between *it* and the sticker tool, which no artifact currently contains. Recommending a merge on §2's summary alone would be exactly the kind of inference this report is required not to make.

**What is needed before that decision:** a Pass-1-equivalent read of `balance-bites-label-editor- latest.html` (94,933 bytes, materially smaller than this file's 225,001) and a capability delta against the sticker tool. Two outcomes are plausible from what is known — the editor is a strict subset and folds in, or it serves a distinct label class and stays separate — and the evidence to choose does not exist yet. Recorded as a carry-forward.

---

# Findings summary

| ID | Finding | Severity |
|---|---|---|
| RISK-1 / H-1 | Legacy presets silently destroyed on name collision at page load | **CRITICAL** |
| RISK-2 / H-14 | `tmplSave` overwrites an existing template by name without confirmation | **CRITICAL** |
| H-2 | `templateKey` writes never reach disk and are overwritten by `loadAll` | **CRITICAL** |
| H-3 | `margin:0` on every page mode; 3 mm buffer is under the printer's unprintable margin, so `exact` clips | **CRITICAL** |
| H-4 | Batch mode prints with the wrong `@page` and leaks live-DOM values | **CRITICAL** |
| H-5 | Unescaped `innerHTML` reachable from imported JSON | HIGH |
| H-8 | Base64 assets inline in localStorage when folder disconnected, uncapped, error swallowed | HIGH |
| H-6 | PPC defined four times | HIGH |
| H-7 | Faux QR is unscannable and renders by default | HIGH |
| H-9 | Font dropdowns offer unloaded families | HIGH |
| H-19 | `**` prefix convention has no parser; new labels print `**Best Before:` literally | HIGH |
| ABSENT-1..4 | Four capability losses vs label-v3, each a candidate OD | decision required |
| §1.2 typo | `BALANCE`/`BYTES` typo propagated from 2 sites to 6; T06.6 scope grew | decision required |
| §3.1 | REPORT §3.3 "independent islands" is false; rewrite specified | audit defect |
| §3.2 | REPORT Sticker-entity citation stale by ~319 lines; actual `bb-stock-costs.html:2710-2757` | audit defect |
| §3.4 | Colour-preset defaults diverge 3 vs 4 between tools writing the same key | HIGH |
| CF-06 | REPORT §3.1 (10 rows) vs inventory.json (7 rows) — reported, not reconciled | carry-forward |
| new CF | `balance-bites-label-editor- latest.html` capability delta needed before any merge decision | carry-forward |
| new CF | Single-DOM print path: outer boxes in cm (`:2891`) but all interior geometry in px against PPC. Violates `AGENTS.md` §6 dual-DOM requirement; `render()` needs re-architecture | carry-forward |
| new CF | Tapered exact page adds an undocumented `+0.1` cm per axis before the buffer (`:2886-2887`) — a print-parity detail to reproduce or explicitly drop | carry-forward |
| F-3.6 | Unprefixed `print-color-adjust` absent; Firefox drops the label background field. Prefixed form is present, so Chromium targets are fine | LOW |

**Scope compliance.** This pass created exactly one file (`docs/AUDIT_STICKER.md`). No `.html` file, `legacy/FREEZE.md`, `docs/REPORT.md`, `docs/inventory.json`, `docs/UNIFICATION.md` or `PHASE_PLAN.md` was read-write opened or modified. No fixes were proposed. No browser-storage tool was run. No claim about label-v3 originates outside REPORT.md §2.2.


