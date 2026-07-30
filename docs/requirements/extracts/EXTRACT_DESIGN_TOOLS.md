> **REQUIREMENTS EVIDENCE.** Extracted from a retiring tool. Records what the
> tool did and what its owner expects. NOT a specification, NOT current truth,
> NOT a parity target. Where this conflicts with a frozen document in
> docs/product/, the frozen document wins.

# EXTRACT — the three remaining design tools

**Pass:** P-04 · **Date:** 2026-07-31 · **Model class:** HEAVYWEIGHT (Opus, extended reasoning)
**Mode:** READ-ONLY requirements extraction. No fix proposed. No design authored. No `.html` file touched.
**Sources (all read completely this session):**

| Short name used below | File |
|---|---|
| **LE** | `legacy/balance-bites-label-editor- latest.html` |
| **ST** | `legacy/balance-bites-stand.html` |
| **CA** | `legacy/balance-bites-carton (2).html` |

**Citation convention.** A citation is written `LE:1702`, `ST:462`, `CA:380`. Every
one is a line read in this session. Where `REPORT.md` is quoted it is written
`REPORT.md claims X at :NNNN; actual :MMMM`, per the P-04 citation rule.

**Fourth tool.** The sticker tool (`legacy/balance-bites-sticker.html`) is
referenced throughout Parts 2 and 3 **via `AUDIT_STICKER.md`**, not via a read of
the file. Eleven of its citations were spot-checked directly under Part 2's
bounded-verification clause; those eleven, and only those eleven, carry a
`SK:NNNN` citation of my own. Everything else attributed to the sticker tool is
attributed to `AUDIT_STICKER.md` by section.

**Fifth tool.** `balance-bites-label-v3.html` is permanently deleted.
`REPORT.md` §2.2 is the sole record of its behaviour. Where a question depends
on label-v3 behaviour not recorded there, this document says **unresolvable**
and does not reason it out.

**Vocabulary discipline.** Legacy identifiers are quoted verbatim in backticks
and are facts: `bb_presets`, `bbcarton_pb`, `template`, `CARTON_PRESETS`. B2S-side
naming uses the `VOCABULARY_DRAFT.md` §1.2 resolved terms: PackagingTemplate,
Artwork, PackagingType, PrintJob / PrintArtifact, MediaAsset, Tenant, Buyer.
Where the tool's word and the B2S word disagree the pair is recorded as a
finding in §5.4, not silently translated.

---

## PART 0 — Provenance, line counts, chunk log, redaction

### 0.1 Line counts — verified, against `REPORT.md`

Measured with `wc -l` via `C:\Program Files\Git\bin\bash.exe`. The "displayed"
column is `wc -l` + 1, the convention CF-12 established at P-02 and P-03: every
one of these three files ends with a newline, so an editor shows one more line
than `wc -l` counts.

| File | `wc -l` | Displayed | `REPORT.md` figure | Delta | Verdict |
|---|---|---|---|---|---|
| **LE** `balance-bites-label-editor- latest.html` | **2,180** | 2,181 | §2.4 gives **2,180** | **0** | **CONFIRMED** |
| **ST** `balance-bites-stand.html` | **774** | 775 | §2.6 gives **774** | **0** | **CONFIRMED** |
| **CA** `balance-bites-carton (2).html` | **459** | 460 | §2.5 gives **459** | **0** | **CONFIRMED** |

**This is the opposite result to P-02 and P-03 and it is the significant finding
of §0.1.** `REPORT.md`'s line counts for the three design tools are **exact**.
Its counts for the two business tools were wrong by 1,506 lines
(`bb-stock-costs.html`) and 785 lines (`balance-bites-invoice-pro.html`). So
`REPORT.md` is not uniformly stale — it is stale **for the two files that kept
being edited after it was written** and accurate for the three that did not. The
P-04 prompt's expectation of "a mismatch is expected" is not borne out, and no
halt condition arises: the prompt states a mismatch is not a halt condition, and
neither is a match.

The practical consequence for Gate 1 is narrower than CF-12 assumed:
`REPORT.md`'s design-tool citations are **not** presumptively drifted. Every
`REPORT.md` §2.4/§2.5/§2.6 citation this document re-derived landed on the same
line. Two are recorded in §7.4 as content errors rather than drift errors.

**These three counts complete CF-12's evidence.** Full ledger, all six tools:

| File | Verified `wc -l` | Displayed | `REPORT.md` | Drift |
|---|---|---|---|---|
| `bb-stock-costs.html` | 7,083 | 7,084 | 5,577 | **+1,506** |
| `balance-bites-invoice-pro.html` | 4,283 | 4,284 | 3,498 | **+785** |
| `balance-bites-sticker.html` | not measured this session | — | unlisted | — |
| `balance-bites-label-editor- latest.html` | 2,180 | 2,181 | 2,180 | 0 |
| `balance-bites-stand.html` | 774 | 775 | 774 | 0 |
| `balance-bites-carton (2).html` | 459 | 460 | 459 | 0 |

`balance-bites-sticker.html` was not measured — measuring it is a read of the
file outside the bounded spot-check and is not authorised by this prompt.
CF-12's "3701 unlisted" figure for it therefore remains unverified and is the
one remaining gap in the ledger.

### 0.2 Chunk log

| File | Chunks | Ranges | Final chunk reached | File's last line |
|---|---|---|---|---|
| **LE** | 4 | 1–560, 560–1119, 1119–1678, 1678–2180 | **2180** | `</html>` at :2180 ✓ |
| **ST** | 2 | 1–470, 470–774 | **774** | `</html>` at :774 ✓ |
| **CA** | 1 | 1–459 | **459** | `</html>` at :459 ✓ |

Each final chunk reached that file's last line and the last line is the closing
`</html>` tag in all three. No sampling; ranges are contiguous with a
one-line overlap at each seam.

### 0.3 Redaction sweep — **NEGATIVE for all three files**

Swept for: `C:\`, `C:/`, `Users\`, `/Users/`, any OS account name, `Desktop`,
`password`, `passwd`, `secret`, `token`, `api_key` / `api-key` / `apikey`,
`Bearer `, `connectionstring`, `Data Source=`, `sk-`, `ghp_`. Case-insensitive,
all three files.

**Result: `No matches found`.** Zero hits across all three files.

A second sweep for phone-number and email patterns returned four hits, none
sensitive:

| Hit | File:line | Assessment |
|---|---|---|
| Google Fonts CSS URL | `ST:7`, `CA:7`, `LE:9` | Public CDN URL. Not a credential. Recorded as a hardcoded value in §5 and a defect in §7. |
| `+20 123 456 7890` | `ST:161` | Placeholder. Sequential digits `1234567890` behind the Egypt country code. Not a real number. Recorded as brand-identity seed data in §5. |

`@balancebites.eg` (`ST:160`) and `balancebites.com` (`ST:155`, `CA:97`,
`CA:223`, `LE:1308`, `LE:1956`) are the owner's own public brand handles, not
third-party PII.

**Contrast with P-02.** `bb-stock-costs.html:1178` and `:902` carry the owner's
OS account name in a `SHARED_DATA_PATH` and a `file://` anchor. The P-04 prompt
predicted "expect the same class of value in the shared-folder paths here."
**That prediction does not hold — none of these three files has a shared-folder
path at all.** That absence is not just a redaction result; it is the load-bearing
evidence for Part 8, and it is why the answer there is what it is.

**One redaction was required, and it came from the Part 2 spot-check, not from
the three files.** `balance-bites-sticker.html:1138` declares:

```
var SHARED_DATA_PATH='C:\\Users\\<REDACTED>\\Desktop\\BALANCE BITES\\invoices customers\\saved data';
```

The `<REDACTED>` span is the owner's OS account name. The structure is recorded;
the verbatim value is not transcribed here. This is the same exposure class
CF-14 tracks and the same one P-02 found in `bb-stock-costs.html`. It is
recorded here because I read the line this session, not because the sticker tool
is in scope.

### 0.4 What "read completely" bought that a grep would not have

Three facts in this document cannot be reached by search and are the reason the
full read was required:

1. **LE's screen and print geometries disagree with each other by up to 0.9%**, and
   the disagreement is only visible by reading the screen CSS block (`LE:293–741`)
   and the print CSS block (`LE:998–1129`) together and dividing. Neither block
   contains a conversion constant. See §3.4 G-24.
2. **LE's barcode is a fixed SVG that ignores the barcode number entirely**
   (`LE:1576`). A grep for `barcode` finds the input, the variable and the
   caption; only reading the SVG shows the twenty `<rect>` elements are literals.
3. **ST's `getVals()` captures eleven fields that no renderer ever reads**
   (`ST:512–514`, `:525`). Establishing that required reading all three build
   functions to completion.

---

## PART 1 — PER-FILE CAPABILITY INVENTORY

### 1.1 `legacy/balance-bites-label-editor- latest.html` (LE) — 2,180 lines

#### 1.1.a Purpose

A single-Artwork editor for one physical object: a **continuous wrap strip** that
folds over the top of a pouch, carrying five printed segments in one uncut piece.
The document title is `Balance Bites — Label Editor` (`LE:7`); the on-screen
subtitle is `Seal Sticker Label Editor` (`LE:1184`). It produces one strip per
session, previewed live and printed at real size onto A4.

The strip is **not** a set of independent labels. It is one object, and its
segments have a fixed order and a fixed shared width. That is the single most
important requirement in this file and §3.1 records it as its own PackagingType.

#### 1.1.b Shapes and modes

**There is exactly one shape and there are no modes.** No shape selector, no mode
buttons, no dimension inputs. The strip's five segments are hardcoded in CSS at
two scales (screen px and print cm) and cannot be resized by the operator.

| # | Segment | Screen (px) | Print (real units) | Notes |
|---|---|---|---|---|
| 1 | Back panel | 189 × 113 (`LE:334-335`) | 5 cm × 3 cm (`LE:1005-1006`) | `transform: rotate(180deg)` (`LE:340`) — printed upside down so it reads right way up after the fold |
| 2 | Neck (top) | 38 × 170 (`LE:654-655`) | 1 cm × 4.5 cm (`LE:1109-1110`) | Vertical text, `writing-mode: vertical-lr` + `rotate(180deg)` (`LE:671-672`) |
| 3 | Seal | 113 × 113 (`LE:680-681`) | 3 cm × 3 cm (`LE:1115-1116`) | Square, centred monogram |
| 4 | Neck (bottom) | 38 × 170 (same class) | 1 cm × 4.5 cm (same class) | Carries the production-date box |
| 5 | Front panel | 189 × 113 (`LE:731-732`) | 5 cm × 3 cm (`LE:1121-1122`) | Arch + flavour + badges |

Emission order in `buildLabel()`: back (`LE:1541`), neck (`LE:1601`), seal
(`LE:1605`), neck (`LE:1615`), front (`LE:1625`). The order is a literal
sequence of string concatenations and is not data.

**Strip totals, never stated anywhere in the file:** 5 cm wide (`LE:999`), and
3 + 4.5 + 3 + 4.5 + 3 = **18 cm** tall. The on-screen dimension readout
(`LE:1466-1471`) lists four cards — `5×3cm Front`, `1×4.5cm Neck`, `3×3cm Seal`,
`5×3cm Back` — and therefore **under-reports the strip: it names one neck where
the artifact has two, and gives no total.** An operator reading the readout would
compute 13.5 cm for an 18 cm object.

#### 1.1.c Geometry calculations

Every expression in LE, with units and rounding. The full cross-tool geometry
specification is §3.4; this is the per-file inventory.

| ID | Expression | File:line | In | Out | Rounding |
|---|---|---|---|---|---|
| LE-g1 | `bcW + 6` | `LE:1575` | px | px | none stated in source |
| LE-g2 | `bcW * 0.1` | `LE:1577` | px | px | none stated in source |
| LE-g3 | `parseFloat(v.tyNtS) + 0.5` | `LE:1588` | px | px | none stated in source |
| LE-g4 | `pdFS * 0.75` | `LE:1618` | px | px | none stated in source |
| LE-g5 | `parseInt(v.bcW) \|\| 40`, `parseInt(v.bcH) \|\| 10` | `LE:1570-1571` | string | int px | `parseInt` truncates |
| LE-g6 | `parseFloat(v.wtNumS) \|\| 6`, `parseFloat(v.wtLblS) \|\| 3` | `LE:1572-1573` | string | float px | none |
| LE-g7 | `parseInt(v.pdW) \|\| 60`, `parseInt(v.pdH) \|\| 14`, `parseFloat(v.pdFS) \|\| 5` | `LE:1611-1613` | string | px | `parseInt` truncates |
| LE-g8 | `patOp = parseFloat(G('ePatOp')) / 100` | `LE:1666` | 0–30 | 0–0.30 | none stated in source |
| LE-g9 | `drk(h,a)`: per channel `max(0, min(255, c - a))`, hex-padded to 2 | `LE:1483` | hex, int | hex | clamp; integer by construction |
| LE-g10 | `ltn(h,a) = drk(h, -a)` | `LE:1484` | hex, int | hex | as LE-g9 |
| LE-g11 | `h2r(h)` → `R,G,B` decimal triple | `LE:1485` | hex | string | none needed |
| LE-g12 | `scale(value/100)` on `#screenStrip` | `LE:1462` | 30–150 | 0.3–1.5 | none stated in source |
| **LE-g13** | **implicit screen-px ↔ print-cm ratio** | see below | px | cm | **no constant exists** |

**LE-g13 is the one that matters and it is not written down anywhere in the
file.** There is no `PPC`, no `PX`, no px-per-cm constant. The screen geometry and
the print geometry are two independent hardcoded sets, and dividing them yields
four different effective ratios:

| Segment | Screen px | Print cm | Effective px/cm |
|---|---|---|---|
| Back / front width | 189 (`LE:334`) | 5 (`LE:1005`) | 37.800 |
| Back / front height | 113 (`LE:335`) | 3 (`LE:1006`) | 37.667 |
| Neck width | 38 (`LE:654`) | 1 (`LE:1109`) | 38.000 |
| Neck height | 170 (`LE:655`) | 4.5 (`LE:1110`) | 37.778 |
| Seal | 113 (`LE:680`) | 3 (`LE:1115`) | 37.667 |

Spread 37.667 → 38.000 = **0.88%**. On the 18 cm strip that is 1.6 mm of
accumulated screen-to-print disagreement, which is eight times the ±0.2 mm print
tolerance the platform is held to. The screen preview is therefore not a
faithful proxy for the printed object, and no line in the file acknowledges this.

#### 1.1.d Print paths and page rules

Two print triggers, both bare `window.print()`:

| Trigger | File:line | Path |
|---|---|---|
| `doPrint()` — sidebar `🖨 Print Label` | `LE:1434` → `LE:1706` | `upd(); window.print();` — re-renders both DOMs first |
| Preset-bar `🖨 طباعة` | `LE:2174` | `window.print()` — **no re-render** |

Both reach the same CSS. The second bypasses `upd()`, so if any input changed
without firing its `oninput` handler the printed strip is stale. Recorded in §7.

Page rules:

| Rule | File:line | Value |
|---|---|---|
| `@page` | `LE:970-973` | `size: A4 portrait; margin: 0` — **zero margin** |
| `@media print` block 1 | `LE:969-1130` | The whole print stylesheet |
| `@media print` block 2 | `LE:1177` | Hides `#presetBar`, `#pbToast`; `body{padding-bottom:0}` |
| Colour forcing | `LE:975-978` | `-webkit-print-color-adjust: exact !important` |
| Screen DOM suppression | `LE:986-991` | `.app-header, .editor-panel, .preview-panel, .app-layout { display:none !important }` |
| Print DOM reveal | `LE:993-996` | `#printRoot { display: block !important }` |
| Strip placement | `LE:998-1002` | `width: 5cm; margin: 0 auto; padding-top: 1cm` |

`padding-top: 1cm` (`LE:1001`) is the **only** page-level offset in the file. It is
not a bleed, not a trim allowance and not a safety buffer — it is a top margin
inside a zero-margin page. There is no crop mark, no registration mark and no
cut guide anywhere in LE.

**Print typography is sub-millimetre.** `LE:1033-1105` sets thirteen font sizes in
mm, the smallest being `0.6mm` (`LE:1048`, nutrition table cells) and `0.62mm`
(`LE:1038`, back-panel body text). 0.6 mm ≈ **1.7 pt**. Full list in §4.3.

#### 1.1.e Export formats

| Format | Mechanism | File:line |
|---|---|---|
| **Print (A4)** | `window.print()` | `LE:1706`, `LE:2174` |
| **JSON, one preset** | `data:application/json;charset=utf-8,` + `encodeURIComponent`, `<a download>` | `LE:2102-2110` |

Download filename: `'bblabel-' + name.replace(/[^\w\u0600-\u06FF\- ]/g,'_') + '.json'`
(`LE:2107`). The character class **preserves Arabic** (`\u0600-\u06FF`).

JSON envelope (`LE:2104`): `{ name, template: 'bblabel', date, state }`.

**No PNG export, no image export of any kind, no clipboard path.** This is a
capability the sticker tool has and LE does not — see §2.

#### 1.1.f Preset / template mechanisms — there are **two**, and they are unrelated

LE is the only one of the three with two independent preset subsystems that
neither read nor write each other's storage. This is a requirement signal, not
just an oddity: the operator needed *both* a per-flavour content library and a
whole-Artwork snapshot, and got them as two disconnected features.

**Mechanism A — "Quick Flavor Presets"** (`LE:1440-1454`, `LE:1708-1937`)

Six built-in buttons: Zaatar, Paprika, Pepper, Cinnamon, Herb, Sesame
(`LE:1443-1448`). Backed by the `presetsData` object literal (`LE:1708-1751`),
overlaid at load from `localStorage['bb_presets']` via `Object.assign`
(`LE:1756-1764`).

Typed field list — the **full** shape a Mechanism-A record can carry, from
`savePreset()` (`LE:1893-1933`):

| Field | Type | Meaning | Source line |
|---|---|---|---|
| `f` | string | Flavour name | `LE:1895` |
| `e` | string | Emoji glyph | `LE:1895` |
| `t` | string | Sub-type | `LE:1895` |
| `a` | hex string | Arch accent colour | `LE:1895` |
| `id` | data-URI string | Uploaded PNG icon, **Base64** | `LE:1896` |
| `is` | numeric string | Icon size px | `LE:1896` |
| `ie` / `ia` | string | Ingredients EN / AR | `LE:1897` |
| `se` / `sa` | string | Storage EN / AR | `LE:1898` |
| `ve` / `va` | string | Validity EN / AR | `LE:1899` |
| `wt` | string | Approx weight | `LE:1900` |
| `ne` / `na` | string | Serving size EN / AR | `LE:1901` |
| `nr` | string | Nutrition rows, `\n`-delimited, `\|`-delimited | `LE:1902` |
| `bg`, `gold`, `c1`, `c2` | hex string | Background, gold, badge-1, badge-2 | `LE:1904` |
| `pat` | enum `none\|diag\|cross\|dots` | Pattern | `LE:1905` |
| `patOp` | numeric string | Pattern opacity 0–30 | `LE:1905` |
| `archMono`, `archMonoS`, `archMonoC`, `archSub`, `archSubS` | string / numeric string / hex | Arch block | `LE:1907` |
| `prem` | string | Premium bar text | `LE:1908` |
| `badge1`–`badge4` | string | Front badges | `LE:1909` |
| `weight`, `footer` | string | Front weight, footer | `LE:1910` |
| `prodLabel`, `prodDate`, `pdW`, `pdH`, `pdFS` | string / numeric string | Date box | `LE:1911` |
| `sMono`, `sBrand` | string | Seal | `LE:1913` |
| `neck` | string | Neck vertical text | `LE:1915` |
| `bMono`, `bSub` | string | Back header | `LE:1917` |
| `barcode`, `web` | string | Back barcode number, website | `LE:1918` |
| `bcW`, `bcH`, `wtNumS`, `wtLblS` | numeric string | Back sizing | `LE:1919` |
| `tyFlavorF`…`tyFtS` | 24 fields, string / numeric string | 12 font families + 12 font sizes | `LE:1921-1932` |

**Total: 74 fields** (counted field-by-field over `LE:1895-1932`). Storage key:
`bb_presets` (`LE:1935`). No `id`, no version, no timestamp, no schema marker.

**The six built-ins are not uniformly shaped.** Zaatar (`LE:1709-1721`), Paprika
(`LE:1722-1734`) and Pepper (`LE:1735-1747`) each carry 14 fields. Cinnamon
(`LE:1748`), Herb (`LE:1749`) and Sesame (`LE:1750`) carry **4** — `f`, `e`, `t`,
`a` only. `ps()` applies fields conditionally (`if (d.ie) sv(...)`, `LE:1845-1854`),
so **selecting Cinnamon after Zaatar leaves Zaatar's ingredients, storage,
validity, weight and nutrition table in place.** The Artwork silently becomes a
Cinnamon front panel over a Za'atar regulatory back panel. Recorded in §7.

`savePreset()` (`LE:1885-1937`) **requires** an already-selected built-in
(`LE:1886-1889`, `alert` and return) and then **overwrites it**. There is no
save-as-new, no rename, no delete and no list. The built-in six are the only
slots that exist.

**Mechanism B — the preset bar** (`LE:1976-2160`, `LE:2164-2177`)

Eight fixed slots, FIFO eviction at capacity (`_PBMAX = 8`, `LE:1978`; eviction
`_PBS.shift()`, `LE:2084`). Storage key: `bblabel_pb` (`_PBK = 'bblabel'`,
`LE:1976`; `_PBK+'_pb'`, `LE:1980-1981`).

Typed field list of a Mechanism-B record (`LE:2083`):

| Field | Type | Source |
|---|---|---|
| `name` | string, also the identity key | `LE:2082-2083` |
| `date` | string, `toLocaleDateString('ar-EG')` | `LE:2081` |
| `state` | object, below | `LE:2083` |

`state` (`presetGetState()`, `LE:1990-1997`):

| Field | Type | Source |
|---|---|---|
| `vals` | object — the entire 74-field `getVals()` return (`LE:1663-1697`) | `LE:1993` |
| `activeKey` | string \| null — which Mechanism-A flavour was selected | `LE:1994` |
| `presetsData` | object — a **deep clone of the whole Mechanism-A library** | `LE:1995` |

So **a Mechanism-B slot embeds a full copy of Mechanism A.** Eight slots each
carrying six flavour records each potentially carrying a Base64 PNG. `pbSave()`
writes it to `localStorage` through `_pbSav()` (`LE:1981`), whose `catch(e){}` is
empty — a quota failure is silent and the user is told `✓ تم حفظ` (`LE:2087`).

Identity is by `name` string match (`LE:2082`): saving under an existing name
overwrites without confirmation.

#### 1.1.g Complete storage footprint

| Key | Store | Direction | Written at | Read at | Shape |
|---|---|---|---|---|---|
| `bb_presets` | `localStorage` | R + W | `LE:1935` | `LE:1756` | Object keyed by flavour name → up-to-74-field record |
| `bblabel_pb` | `localStorage` | R + W | `LE:1981` | `LE:1980` | Array ≤ 8 of `{name, date, state}` |

**That is the entire footprint. Two `localStorage` keys and nothing else.** No
IndexedDB, no File System Access API, no shared folder, no `sessionStorage`, no
cookie, no network write. Confirmed by targeted search across the file for
`indexedDB`, `showDirectoryPicker`, `showSaveFilePicker`, `showOpenFilePicker`,
`FileSystemHandle`, `SHARED_DATA_PATH`, `bb_filestore`, `bb_color_presets`,
`bb_products`, `bb_stickers`, `bb_label_templates`, `bb_active_theme`,
`bb_invoices`, `bb_customers` — **zero matches**.

Two transient in-memory objects that never persist independently: `presetsData`
(`LE:1708`, `LE:1753` `activePresetKey`) and `_PBS` (`LE:1977`).

**`bb_presets` is the collision hazard.** It is the only `bb_*`-prefixed key any
of the three design tools writes, and its name claims the whole `bb_` namespace
for "presets" generally while holding flavour records specific to one Artwork
type. §8.4 develops this.

### 1.2 `legacy/balance-bites-stand.html` (ST) — 774 lines

#### 1.2.a Purpose

An editor for a **counter display stand** — a four-panel cardboard retail
fixture. The on-screen identifier is `CDS 140 Counter Display Stand` (`ST:434`);
the document title is `Balance Bites — Counter Display Stand Editor` (`ST:6`).
Unlike LE it is dimension-driven: every panel's real-world size is an operator
input in millimetres.

#### 1.2.b Shapes and modes

**Four panels, always the same four; a view filter, not a mode selector.**

| Panel | Build function | Dimensions (mm, operator-set) | Defaults | Range |
|---|---|---|---|---|
| ① Mirror Face | `buildMirrorFace()` `ST:544-569` | `dFaceW` × `dFaceH` | 400 × 190 | W 250–500, H 100–300 (`ST:355-356`) |
| ② Shelf | `buildShelf()` `ST:571-619` | `dShelfW` × `dShelfH` | 400 × 85 | W 250–500, H 30–150 (`ST:360-361`) |
| ③ Side L | `buildSide(v,"L")` `ST:621-663` | `dSideW` × `dSideBH` | 320 × 290 | depth 150–400, back H 100–500 (`ST:365`, `ST:369`) |
| ④ Side R | `buildSide(v,"R")` `ST:621-663` | same | same | same |

A fifth dimension, `dSideFH` (front height, default 85 mm, range 40–200,
`ST:366`), is not a panel size — it is the **taper input**: the difference
`backH - frontH` defines the sloped cut on the side panels. See §1.2.c and §3.5.

The `#controls` row (`ST:435-438`) offers `All Panels` / `Mirror Face` / `Shelf` /
`Sides`. `setPanel()` (`ST:703`) sets `currentPanel` and `render()` (`ST:689-698`)
emits only the matching `.panel-group` blocks. **This filters what is rendered and
therefore what prints** — selecting `Shelf` and printing yields a one-page
PrintJob. It is a print-scope control disguised as a view control.

Six sidebar tabs (`ST:135-140`): Brand, Prod, Style, Badge, Size, Font.
`switchTab()` (`ST:704`) toggles `display` on `#tab-*` containers. Pure UI.

#### 1.2.c Geometry calculations

| ID | Expression | File:line | In | Out | Rounding |
|---|---|---|---|---|---|
| ST-g1 | `PX = 3.78` | `ST:457` | — | px/mm | Declared constant. **Truncated from 3.7795…** |
| ST-g2 | `mm(v) = Math.round(v * PX)` | `ST:462` | mm | px | `Math.round` → integer px |
| ST-g3 | Side clip L: `polygon(0 0, 100% P%, 100% 100%, 0 100%)` where `P = (backH-frontH)/backH*100` | `ST:624` | mm | % | none stated in source |
| ST-g4 | Side clip R: `polygon(0 P%, 100% 0, 100% 100%, 0 100%)`, same `P` | `ST:625` | mm | % | none stated in source |
| ST-g5 | Mask L polygon `0,0 W,0 W,(backH-frontH)` in a `viewBox="0 0 W totalH"` | `ST:636` | mm | viewBox units | none stated in source |
| ST-g6 | Mask R polygon `0,0 W,0 0,(backH-frontH)` | `ST:637` | mm | viewBox units | none stated in source |
| **ST-g7** | `logoSzMM = (v.sideLogoSz / 3.7795).toFixed(2)` | `ST:641` | px | mm string | `toFixed(2)` → 2 dp |
| **ST-g8** | `qrSzMM = (v.qrSz / 3.7795).toFixed(2)` | `ST:642` | px | mm string | `toFixed(2)` → 2 dp |
| ST-g9 | `cx = (W * pctX / 100).toFixed(2)` | `ST:643` | mm, % | mm string | `toFixed(2)` |
| ST-g10 | `cy = (totalH * pctY / 100).toFixed(2)` | `ST:644` | mm, % | mm string | `toFixed(2)` |
| ST-g11 | `qx`, `qy` — as ST-g9/g10 with the QR percentages | `ST:645-646` | mm, % | mm string | `toFixed(2)` |
| ST-g12 | Logo box top `cy - logoSzMM/2 - 10`, left `cx - logoSzMM/2` | `ST:649` | mm strings | mm | none stated in source |
| ST-g13 | QR box top `qy - qrSzMM/2`, left `qx - qrSzMM/2` | `ST:658` | mm strings | mm | none stated in source |
| ST-g14 | Flavour dot `dotSz = Math.round(H * 0.06)`, emitted with a `mm` suffix | `ST:562-564` | mm | mm | `Math.round` |
| ST-g15 | Shelf logo circle `smLogo = Math.round(H * 0.4)` mm | `ST:578` | mm | mm | `Math.round` |
| ST-g16 | Shelf logo glyph `Math.round(smLogo * 0.38)` mm | `ST:582` | mm | mm | `Math.round` |
| ST-g17 | Shelf brand `Math.round(v.prodFS * 1.2)` px | `ST:583` | px | px | `Math.round` |
| ST-g18 | Side logo glyph `Math.round(v.sideLogoSz * 0.4)` px | `ST:651` | px | px | `Math.round` |
| ST-g19 | Side web caption `Math.round(v.sideBrandFS * 0.35)` px | `ST:660` | px | px | `Math.round` |
| ST-g20 | Screen wrapper `pxW = mm(w)`, outer `pxW * s`, `s = scale/100` | `ST:682-684` | mm, % | px | ST-g2 then none |
| ST-g21 | Pattern alpha `a = min(1, max(0, opacity/100))` | `ST:482` | 1–50 | 0–0.5 | clamp only |
| ST-g22 | Pattern half-alpha `a * 0.75` | `ST:484` | — | — | none stated in source |
| ST-g23 | `hexA(hex, a)` → `rgba(R,G,B,a)` | `ST:463` | hex, float | string | none needed |

**Two px-per-mm constants in one file.** `PX = 3.78` (`ST:457`) drives the screen
wrapper. `3.7795` (`ST:641-642`) drives the side-panel logo and QR conversions.
They differ by 0.013%, which is negligible in isolation, but the file declares
one as a named constant and then bypasses it twice with a literal. That is the
precedent the platform must not inherit; §3.4 records it as a specification, not
as a bug to fix.

**ST-g14 is a unit error with a visible consequence.** `Math.round(190 * 0.06) = 11`,
emitted as `width: 11mm; height: 11mm` (`ST:564`). Five 11 mm dots on a 190 mm-tall
face panel. The `0.06` factor and the `Math.round` both read as if `H` were a px
value. The dots are 5.8% of panel height each. Recorded in §7 as a defect, and in
§3.3 as evidence that proportional sizing needs a declared basis unit.

**ST-g12's `- 10` is unexplained.** The logo box is offset 10 mm above its
computed centre with no comment and no corresponding term in the QR path
(`ST:658`), which has no offset. Two positioning primitives that should be
identical are not.

**ST-g7 through ST-g13 operate on strings.** `toFixed(2)` returns a string;
`cy - logoSzMM/2` coerces both back to numbers via `-` and `/`. It works, but the
declared type of a position in this file is "a string that happens to be
arithmetic-coercible".

#### 1.2.d Print paths and page rules

Two triggers, both bare `window.print()`: sidebar `🖨 Print` (`ST:426`) and
preset-bar `🖨` (`ST:451`). Neither re-renders first — but ST's `@page` rules are
regenerated inside `render()` (`ST:665-678`), so **the page size in force is
whatever the last `render()` produced.** Any input change fires `render()`
(`ST:769`), so in practice they stay in step; the coupling is implicit, not
enforced.

**Static print block** (`ST:111-122`):

| Rule | File:line | Value |
|---|---|---|
| Colour forcing | `ST:112` | `-webkit-print-color-adjust: exact !important` |
| Page reset | `ST:113` | `body, #pageWrap, #main { background:#fff; margin:0; padding:0 }` |
| Chrome suppression | `ST:114` | `.editor-toggle, .editor-panel, #controls, #presetBar, #pbToast, .panel-title { display:none !important }` |
| Panel pagination | `ST:117` | `.panel-group { page-break-after:always; break-after:page; page-break-inside:avoid; break-inside:avoid-page; margin:0; padding:0; width:100%; min-height:100vh }` |
| Print DOM reveal | `ST:118` | `.sw-p { display:block !important; width:100%; height:auto; overflow:visible }` |
| Screen DOM suppression | `ST:119` | `.sw-o { display:none !important }` |
| Effect flattening | `ST:121` | `div, img { box-shadow:none; filter:none; text-shadow:none }` |

`.sw-p { display:none }` on screen (`ST:110`) is the other half of the dual-DOM.

**Dynamic `@page` rules,** injected into a `<style id="dynPrint">` element created
on demand (`ST:667-668`) and rewritten on every `render()`:

| `sPrintSize` | File:line | Emitted rule |
|---|---|---|
| `a2` | `ST:672` | `@page{size:A2 landscape;margin:0;} .panel-group{height:420mm;}` |
| `a3` | `ST:673` | `@page{size:A3 landscape;margin:0;} .panel-group{height:297mm;}` |
| `actual` (default) | `ST:676-677` | Three **named** pages — see below |

The `actual` branch is the most capable print mechanism in the entire legacy
design family:

```
@page face  {size: {faceW}mm  {faceH}mm;  margin:0;}
@page shelf {size: {shelfW}mm {shelfH}mm; margin:0;}
@page side  {size: {sideW}mm  {sideBH}mm; margin:0;}
.pg-face {page:face;  height:{faceH}mm;}
.pg-shelf{page:shelf; height:{shelfH}mm;}
.pg-side {page:side;  height:{sideBH}mm;}
```

Three differently-sized pages in one PrintJob, each matching its panel exactly,
via the CSS named-page mechanism. **All three carry `margin: 0`.** Every `@page`
rule in ST is zero-margin — five in total across the three branches.

**The dual-DOM is real here and it is the pattern the platform's own print
contract requires.** `sw()` (`ST:680-687`) emits both DOMs from one `inner` string:

```
screen: <div class="sw-o" style="width:{mm(w)*s}px;height:{mm(h)*s}px">
          <div class="sw-i" style="transform:scale({s});width:{mm(w)}px;height:{mm(h)}px">{inner}</div>
        </div>
print:  <div class="sw-p {cls}" style="width:{w}mm;height:{h}mm;margin:0 auto">{inner}</div>
```

Screen is px and scaled; print is raw mm and unscaled. That is exactly the
dual-DOM discipline. **But `inner` is one shared string**, and its interior
dimensions are a mixture: panel geometry in mm (`ST:547`, `ST:574`, `ST:634`),
gaps and rules in mm (`ST:551`, `ST:557`, `ST:563`), and every font size and the
logo circle in **px** (`ST:554-556`, `ST:558-560`, `ST:601-602`, `ST:650-652`).
So the print DOM contains px lengths that do not scale with the mm-sized panel:
enlarging the face panel from 400 mm to 500 mm leaves the 36 px brand text at
36 px. The dual-DOM is structurally correct and dimensionally mixed.

#### 1.2.e Export formats

| Format | Mechanism | File:line |
|---|---|---|
| **Print** | `window.print()`, page size per `sPrintSize` | `ST:426`, `ST:451` |
| **JSON, one preset** | `data:` URI + `<a download>` | `ST:764` |

Filename: `"bbstand-" + name.replace(/[^\w\- ]/g,"_") + ".json"` (`ST:764`).
**The character class omits `\u0600-\u06FF`, so every Arabic character in a
preset name becomes `_`.** CA (`CA:437`) and LE (`LE:2107`) both preserve Arabic.
ST is the outlier.

JSON envelope (`ST:764`): `{ name, template: "bbstand", state }`.

**Two envelope defects, both visible only by comparing files.** First, the
envelope's `template` value is `"bbstand"` while the storage key prefix is
`"bbstand3"` (`ST:706`) — a file exported from ST does not name the key it came
from. Second, **ST's envelope has no `date` field**; CA's (`CA:437`) and LE's
(`LE:2104`) both do. Re-importing an ST export therefore always stamps today's
date (`ST:765`), losing the original.

No PNG export.

#### 1.2.f Preset mechanism

One mechanism: the preset bar. Eight slots (`_PBMAX = 8`, `ST:706`), FIFO
eviction (`ST:710`), key `bbstand3_pb` (`_PBK = "bbstand3"`, `ST:706`).

Typed field list of a stored record (`ST:710`):

| Field | Type | Source |
|---|---|---|
| `name` | string, identity key | `ST:710` |
| `date` | string, `toLocaleDateString("en-GB")` | `ST:710` |
| `state` | `{ vals: <the getVals() return> }` | `ST:710` |

`state.vals` is the full `getVals()` return (`ST:502-542`) — **98 fields**, counted
field-by-field over `ST:508-540`. The complete typed list, grouped as the source
groups them:

| Group | Fields | Type | Line |
|---|---|---|---|
| Flavour colours | `cZ`, `cP`, `cR`, `cB`, `cCin` | hex string ×5 | `ST:508` |
| Brand | `brand1`, `brand2`, `logoTxt` | string ×3 | `ST:509` |
| Brand text | `tagline`, `taglineAr`, `cta`, `web` | string ×4 | `ST:510` |
| Social | `socIG`, `socWA`, `socExtra` | string ×3 | `ST:511` |
| Products | `prod1`–`prod5`, `p1Ar`–`p5Ar` | string ×10 | `ST:512-514` |
| Pricing | `wt`, `price` | string ×2 | `ST:514` |
| Panel colours | `bgFace`, `bgShelf`, `bgSideL`, `bgSideR` | hex ×4 | `ST:515` |
| Patterns | `patFace`, `patShelf`, `patSideL`, `patSideR` | enum ×4 | `ST:516` |
| Background images | `imgFace`, `imgShelf`, `imgSideL`, `imgSideR` | **Base64 data URI** ×4 | `ST:517` |
| QR images | `qrShelf`, `qrSideL`, `qrSideR` | **Base64 data URI** ×3 | `ST:518` |
| QR positions | `qrXL`, `qrYL`, `qrXR`, `qrYR` | number ×4 (percent) | `ST:519-520` |
| Logo colours | `logoBg`, `logoTxtC` | hex ×2 | `ST:521` |
| Visibility | `showDots`, `showLines`, `showShelfSoc`, `showShelfBd`, `showShelfQr`, `showShelfBrand` | boolean ×6 | `ST:522-524` |
| Print options | `printTitles`, `printCenter` | boolean ×2 | `ST:525` |
| BG image fit | `bgSzFace`, `bgSzShelf`, `bgSzSideL`, `bgSzSideR` | enum ×4 | `ST:526` |
| BG image opacity | `opFace`, `opShelf`, `opSideL`, `opSideR` | float 0–1 ×4 | `ST:527` |
| Pattern | `patCol`, `patOpac` | hex, number | `ST:528` |
| **Dimensions** | `faceW`, `faceH`, `shelfW`, `shelfH`, `sideW`, `sideFH`, `sideBH` | **number, mm** ×7 | `ST:529-530` |
| Screen | `scale` | float 0.3–1.5 | `ST:530` |
| Face typography | `brandFS`, `tagFS`, `logoSz`, `logoFS`, `ctaFS` | number px ×5 | `ST:531` |
| Shelf typography | `prodFS`, `prodArFS`, `priceFS`, `socFS` | number px ×4 | `ST:532` |
| Side typography | `sideBrandFS`, `sideLogoSz` | number px ×2 | `ST:533` |
| Side logo position | `sideLogoXL`, `sideLogoYL`, `sideLogoXR`, `sideLogoYR` | number percent ×4 | `ST:534-535` |
| QR size | `qrSz` | number px | `ST:536` |
| Badges | `bdIconSz`, `bdFS`, `badges` | number, number, **array** | `ST:537` |
| Text colours | `txtMain`, `txtSub` | hex ×2 | `ST:538` |
| Fonts | `fntH`, `fntB` | string ×2 | `ST:539` |
| Print size | `pSize` | enum `actual\|a3\|a2` | `ST:540` |

`badges` is an array of ≤ 6 objects, built at `ST:503-506`:

| Field | Type | Source |
|---|---|---|
| `label` | string, default `"Badge"` | `ST:505` |
| `icon` | string (emoji), default `"⭐"` | `ST:505` |
| `png` | **Base64 data URI** or `""` | `ST:505` |

**Fourteen captured fields are never rendered.** All fourteen appear in
`getVals()`, are restored by `pbLoad()` and are persisted in every preset — and
**no build function reads any of them:**

| Dead field(s) | Captured at | Restored at | Control that writes it |
|---|---|---|---|
| `prod1`–`prod5` | `ST:512-514` | `ST:716` | `eProd1`–`eProd5` (`ST:182-190`) |
| `p1Ar`–`p5Ar` | `ST:512-514` | `ST:716` | `eProd1Ar`–`eProd5Ar` (`ST:183-191`) |
| `wt` | `ST:514` | `ST:717` | `eWt` (`ST:195`) |
| `price` | `ST:514` | `ST:717` | `ePrice` (`ST:196`) |
| `printTitles` | `ST:525` | `ST:733` | `chkPrintTitles` (`ST:275`) |
| `printCenter` | `ST:525` | `ST:734` | `chkPrintCenter` (`ST:276`) |

`buildShelf()` (`ST:571-619`) renders brand, social, badges and QR; it never
touches the product list. The tab is labelled `🫙 SHELF PRODUCTS` (`ST:180`) and
the panel it names does not display them. `printTitles` and `printCenter` are
overridden by unconditional static CSS: `.panel-title` is hidden by `ST:114`
regardless of the checkbox, and the print wrapper carries `margin: 0 auto`
unconditionally at `ST:685`. So both print toggles are inert controls with a
persisted value.

That is **fourteen dead fields out of 98**, and it is a requirements signal
rather than only a defect: the operator asked for per-product shelf strips, for
a price on the fixture, and for two print-layout options, and the tool captured
all of it without ever finishing the renderers. §3.2 records the product and
price slots as real content slots on that basis, and §3.3 records the two print
toggles as real degrees of freedom.

**Base64 image payloads live in `localStorage`.** Up to seven images per preset
(4 backgrounds + 3 QR codes), plus up to six badge PNGs — thirteen possible
Base64 blobs per slot, eight slots. Against a ~5 MB `localStorage` quota this is
the file most likely to hit `QuotaExceededError`, and `_pbSav()`'s `catch(e){}`
(`ST:708`) is empty, so the failure is silent and `pbToast("✓ Saved: "+name)`
(`ST:710`) fires anyway.

#### 1.2.g Complete storage footprint

| Key | Store | Direction | Written | Read | Shape |
|---|---|---|---|---|---|
| `bbstand3_pb` | `localStorage` | R + W | `ST:708` | `ST:707` | Array ≤ 8 of `{name, date, state:{vals}}` |

**One key. Nothing else.** No IndexedDB, no File System Access API, no shared
folder, no `bb_*` key of any kind. Confirmed by the same targeted search as
§1.1.g — zero matches.

### 1.3 `legacy/balance-bites-carton (2).html` (CA) — 459 lines

#### 1.3.a Purpose

An editor for a **shipping carton** — the outer case that ships a fixed count of
retail units. Title `Balance Bites — Carton Template` (`CA:6`). It is the only
one of the three whose UI is Arabic-primary: `<html lang="ar" dir="rtl">`
(`CA:2`).

#### 1.3.b Shapes and modes

**Two pack sizes × four style presets. Four faces, always all four.**

Pack size — `SIZES` (`CA:168-171`), selected by two tabs (`CA:149-150`):

| Key | Label | Real carton | Total weight | front | top | side | bottom |
|---|---|---|---|---|---|---|---|
| `24` | `24 عبوة — 300×200×150 mm` | 300 × 200 × 150 mm | `960G` | 700 × 360 | 700 × 230 | 230 × 360 | 700 × 230 |
| `48` | `48 عبوة — 400×220×200 mm` | 400 × 220 × 200 mm | `1920G` | 920 × 420 | 920 × 270 | 270 × 420 | 920 × 270 |

**The face dimensions are px and the carton dimensions are mm, and they are not
related by any conversion.** The mm figures live only inside the display label
string (`CA:169-170`); the px figures drive the rendered boxes. 300 mm at
3.7795 px/mm would be 1134 px, not 700. **The rendered artwork is at no defined
scale to the physical carton it describes.** This is the single most consequential
fact about CA and §4.4 develops it.

The mm figures are also internally inconsistent with the px ones: 24-pack is
declared 300 × 200 × 150 mm, so front should be 300 × 150 and side 200 × 150 in
some consistent ratio — the px pairs are 700 × 360 and 230 × 360, giving
aspect 1.944 and 0.639 against the mm-implied 2.0 and 1.333.

Style — `CARTON_PRESETS` (`CA:172-177`), selected by `cType` (`CA:77`):

| Key | Label | `bg` | `gold` | `acc` | `txt` |
|---|---|---|---|---|---|
| `dark` | Dark Luxury | `#12100a` | `#c9a84c` | `#3a8a7a` | `#e8e0cc` |
| `brown` | Brown Kraft | `#7a5c1e` | `#f5d26a` | `#a0522d` | `#fdf5e6` |
| `white` | White Clean | `#f5f0e8` | `#a07820` | `#2d6a4f` | `#1a1208` |
| `custom` | Custom | identical to `dark` | | | |

`applyCartonPreset()` (`CA:387-392`) writes the four colours into the pickers and
returns early for `custom` (`CA:388`), leaving whatever is there. So `custom` is
not a fifth palette — it is "stop overwriting my pickers".

Four faces, emitted unconditionally by `render()` (`CA:377-385`) in a fixed
order: Top (`CA:381`), then Front + Side side-by-side in one flex row
(`CA:383`), then Bottom (`CA:384`). Build functions `buildTop()` (`CA:286-311`),
`buildFront()` (`CA:236-284`), `buildSide()` (`CA:313-341`), `buildBottom()`
(`CA:343-375`).

**There is no view filter.** All four faces always render and always print.

#### 1.3.c Geometry calculations

Every one is a proportional derivation from a panel dimension in px. There is no
mm anywhere in the executable path.

| ID | Expression | File:line | Rounding |
|---|---|---|---|
| CA-g1 | `mw = W - sw` (main width = face width − units-strip width) | `CA:238` | none stated in source |
| CA-g2 | `PAD = 16`, `p4 = PAD + 4` | `CA:239` | integer literals |
| CA-g3 | Front watermark `Math.round(H * 1.15)` | `CA:246` | `Math.round` |
| CA-g4 | Brand letter-spacing `Math.round(v.brandFS * .45)` | `CA:251` | `Math.round` |
| CA-g5 | `UNITS` caption `Math.round(v.unitsFS * .2)` | `CA:279` | `Math.round` |
| CA-g6 | Unit-weight caption `Math.round(v.unitsFS * .15)` | `CA:280` | `Math.round` |
| CA-g7 | Top watermark `Math.round(H * 2.2)`, letter-spacing `-14px` | `CA:293` | `Math.round` |
| CA-g8 | Top units numeral `Math.round(H * .48)` | `CA:296` | `Math.round` |
| CA-g9 | Top `UNITS` caption `Math.round(H * .1)` | `CA:297` | `Math.round` |
| CA-g10 | Top brand `Math.round(H * .13)`, letter-spacing `Math.round(H * .05)` | `CA:301` | `Math.round` |
| CA-g11 | Top flavour `Math.round(H * .3)` | `CA:303` | `Math.round` |
| CA-g12 | Top web `Math.round(H * .09)` | `CA:307` | `Math.round` |
| CA-g13 | Side bottom strip `bottomH = Math.round(H * .17)` | `CA:316` | `Math.round` |
| CA-g14 | Side mono `Math.round(W*.22)`, flavour `Math.round(W*.16)`, type `Math.round(W*.085)` | `CA:322` | `Math.round` |
| CA-g15 | Side divider height `Math.round(W * .35)` | `CA:326` | `Math.round` |
| CA-g16 | Side units `uSz = Math.round(W*.22)`; `PCS` `Math.round(uSz*.28)`; pad `Math.round(uSz*.06)` | `CA:334`, `CA:337` | `Math.round` |
| CA-g17 | Barcode column width `bw = Math.round(v.bcH * 1.7 + 24)` | `CA:348` | `Math.round` |
| CA-g18 | Date caption `Math.round(v.dateFS * .7)` | `CA:357` | `Math.round` |
| CA-g19 | Ingredients heading `Math.round(v.ingFS * .88)`; web `Math.round(v.ingFS * .78)` | `CA:364`, `CA:367` | `Math.round` |
| CA-g20 | Barcode checksum `s = Σ num.charCodeAt(i) * (i+1)` | `CA:209` | integer by construction |
| CA-g21 | Bar width `ws[(j + s) % 32]` ∈ {1,2} px, 32 bars | `CA:210-211` | modulo |
| CA-g22 | Bar height `Math.round(barH * (j%4===0 ? 1 : j%3===0 ? .85 : .75))` | `CA:211` | `Math.round` |
| CA-g23 | Luminance `(R*299 + G*587 + B*114)/1000 > 145` | `CA:197` | none; threshold **145** |
| CA-g24 | `darken(hex,amt)` per channel `max(0,min(255, ch − amt))`, hex-padded | `CA:191` | clamp; integer |
| CA-g25 | `lighten(hex,amt) = darken(hex, −amt)` | `CA:193` | as CA-g24 |
| CA-g26 | `hexA(hex,a)` → `rgba()`; 3-digit hex expanded | `CA:183-187` | none needed |
| CA-g27 | Pattern tile `background-size: 16px 16px`, alpha `light ? 0.09 : 0.05` | `CA:201` | literals |
| CA-g28 | Corner ornaments at `6px` inset, default glyph size `9px` | `CA:202-207` | literals |

**CA-g23's `145` threshold is a hardcoded perceptual constant.** It selects
`isLight` (`CA:197`), which flips the pattern alpha (`CA:201`, `CA:241`) and the
barcode's foreground/background derivation (`CA:346-347`). It is the ITU-R BT.601
luma coefficient set with a non-standard midpoint — 145 rather than 128 or 186.
No comment explains the choice.

**There is no px↔mm conversion anywhere in CA.** No `PPC`, no `PX`, no `3.78`, no
`3.7795`, no `mm()` function. The mm values at `CA:169-170` are inert display text.

#### 1.3.d Print paths and page rules

Two triggers, both bare `window.print()`: sidebar `🖨 طباعة` (`CA:143`) and
preset-bar `🖨 طباعة` (`CA:162`). Neither re-renders.

**One static print rule, on a single line** (`CA:68`):

```
@media print{
  @page{size:A3 landscape;margin:8mm;}
  *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}
  #sidebar,#edToggle,#sizeTabs,#presetBar,#pbToast,.face-lbl{display:none!important;}
  body{background:#fff!important;padding-bottom:0;}
  #canvas{margin-right:0!important;padding:0;}
  .carton-wrap{gap:0;}
}
```

| Property | Value |
|---|---|
| Page size | A3 landscape — **fixed, not selectable** |
| Margin | **`8mm`** |
| Dynamic rules | **none** |
| Named pages | **none** |
| Page breaks | **none declared** |
| Print DOM | **none — there is no dual-DOM** |

**`margin: 8mm` is the only non-zero page margin in the entire legacy design
family.** Every other `@page` rule across LE, ST and the sticker tool is
`margin: 0`. Nothing in the file explains the 8 mm; it is not referenced by any
calculation and is not a bleed or trim allowance — it is a printer-safe inset
that shrinks the imageable area.

**CA prints the screen DOM.** There is no `.sw-p` equivalent, no `#printRoot`, no
second render. The same px-dimensioned `<div>`s that `render()` wrote to
`#cartonWrap` (`CA:380`) are what the browser paginates. Combined with §1.3.b's
finding that those px dimensions bear no defined relation to the mm carton, the
printed output's scale is determined entirely by how the browser fits a
920 × 420 px flex column onto A3 landscape minus 8 mm. Nothing in the file
controls or records it.

**No page-break control at all.** The four faces plus the flex row total roughly
920 px wide and 360 + 420 + 270 = 1050 px tall for the 48-pack. Where A3 breaks
that stack is undefined and undeclared. ST declares
`page-break-inside: avoid` on every panel (`ST:117`); CA declares nothing.

#### 1.3.e Export formats

| Format | Mechanism | File:line |
|---|---|---|
| **Print (A3 landscape)** | `window.print()` | `CA:143`, `CA:162` |
| **JSON, one preset** | `data:` URI + `<a download>` | `CA:437` |

Filename: `'bbcarton-' + name.replace(/[^\w\u0600-\u06FF\- ]/g,'_') + '.json'`
(`CA:437`) — **preserves Arabic**, matching LE and diverging from ST.

Envelope: `{ name, template: 'bbcarton', date, state }` (`CA:437`) — carries
`date`, matching LE and diverging from ST.

No PNG export.

#### 1.3.f Preset mechanism

One mechanism, the preset bar. Eight slots (`_PBMAX = 8`, `CA:396`), FIFO
eviction (`CA:430`), key `bbcarton_pb` (`_PBK = 'bbcarton'`, `CA:396`).

Typed field list of a stored record (`CA:429`):

| Field | Type | Source |
|---|---|---|
| `name` | string, identity key | `CA:428-429` |
| `date` | string, `toLocaleDateString('ar-EG')` | `CA:427` |
| `state` | `{ vals, size }` | `CA:401` |

`state.size` is `currentSize` — the integer `24` or `48` (`CA:401`, `CA:167`).
`state.vals` is the `getVals()` return (`CA:215-234`) — **32 fields**, counted
field-by-field over `CA:219-232`:

| Field | Type | Meaning | Line |
|---|---|---|---|
| `bg`, `gold`, `acc`, `txt` | hex string ×4 | Palette, resolved from `cType` then overridden by pickers | `CA:216-219` |
| `light` | boolean | `isLight(bg)` — **derived, stored anyway** | `CA:219` |
| `mono` | string | Monogram, default `BB` | `CA:220` |
| `brand` | string | Brand name | `CA:220` |
| `flavor` | string | Flavour | `CA:221` |
| `type` | string | Product type | `CA:221` |
| `slogan` | string | Slogan | `CA:222` |
| `web` | string | Website | `CA:223` |
| `unitWt` | string | Per-unit weight, e.g. `40G` | `CA:223` |
| `barcode` | string | Barcode digits | `CA:224` |
| `prodDate`, `expDate` | string | Dates, free text | `CA:225` |
| `ingEn`, `ingAr` | string ×2 | Ingredients EN / AR | `CA:226` |
| `badge1`, `badge2`, `badge3` | string ×3 | Badges | `CA:227` |
| `flavorFS`, `brandFS`, `typeFS`, `badgeFS`, `unitsFS`, `wtFS`, `sloganFS` | number px ×7 | Typography | `CA:228-230` |
| `stripW` | number px | Units-strip width | `CA:230` |
| `dateBoxW`, `dateFS` | number px ×2 | Date column | `CA:231` |
| `bcH`, `ingFS` | number px ×2 | Barcode height, ingredients size | `CA:232` |

**`cType` is captured nowhere.** `getVals()` reads `cType` at `CA:216` to resolve
the palette and then discards it; the returned object has no `cType` field.
`presetSetState()` (`CA:402-422`) restores the four colours (`CA:407`) but never
restores the style selector. **Loading a preset therefore leaves the `ستايل`
dropdown showing whatever was previously selected while the colours are the
loaded ones** — and the next `input` event on `cType` fires
`applyCartonPreset()` (`CA:451`), which overwrites the loaded colours with the
stale dropdown's palette. This is the sharpest state defect in the three files
and it is recorded in §7.

`light` (`CA:219`) is the inverse problem — a derived value persisted as if it
were state. On load it is not restored (`CA:405-420` never touches it) and is
recomputed, so the stored copy is dead weight that will silently disagree with
`bg` if either is ever edited independently.

#### 1.3.g Complete storage footprint

| Key | Store | Direction | Written | Read | Shape |
|---|---|---|---|---|---|
| `bbcarton_pb` | `localStorage` | R + W | `CA:398` | `CA:397` | Array ≤ 8 of `{name, date, state:{vals, size}}` |

**One key. Nothing else.** Same targeted search, zero matches for IndexedDB, FSA,
shared folder or any `bb_*` business key.

---
## PART 2 — CF-22: LABEL-EDITOR vs STICKER TOOL CAPABILITY DELTA

### 2.1 Bounded verification of `AUDIT_STICKER.md` — eleven citations, eleven hold

The P-04 prompt permits opening `legacy/balance-bites-sticker.html` **only** to
spot-check the specific line numbers the verdict rests on. Eleven were checked.
No other line of that file was read, no chunk pass was made, and it contributes
no Part of its own.

| # | `AUDIT_STICKER.md` claim | Cited line | Checked — what is actually there | Result |
|---|---|---|---|---|
| 1 | Rectangular back-label mode with `sW` / `sH` defaulting to 17 cm × 4.5 cm | `:736-737` | `id="sW" value="17" min="8" max="40" step=".5"`; `id="sH" value="4.5" min="2" max="12" step=".5"` | **HOLDS** |
| 2 | Exactly three canvas mode buttons: back, top, circle | `:466-468` | `btnModeBack` → `setMode('back')`, `btnModeTop` → `setMode('top')`, `btnModeCircle` → `setMode('circle')` | **HOLDS** |
| 3 | `DESIGN_SPECS` declares exactly three specs | `:1128-1132` | `circular`, `rect_top`, `taper_top`; each with `modes`, `tabs`, `defaultMode`, `isTapered`, `lockTaper` | **HOLDS** |
| 4 | `bb_color_presets` seeds are seven-colour records under ids `cp_def1…` | `:1273-1275` | `KEY='bb_color_presets'` (`:1271`); `DEFAULTS` = exactly three records, each `{id, name, bg, gold, txt, mut, row, tot, grand}`; ids `cp_def1`, `cp_def2`, `cp_def3` | **HOLDS on structure — see the name defect below** |
| 5 | `calcTaper()` is the conical unwrap | `:2218-2263` | Function present; `PPC=37.795`; slant-height, apex-distance, arc-angle and bounding-box maths as described | **HOLDS** |
| 6 | Four `@page` branches, one per page-size mode | `:2894-2901` | `a4`, `letter`, `a3`, else exact/ISO — all four emit `margin:0` | **HOLDS** |
| 7 | A 0.6 cm safety buffer on the exact-size page | `:2899` | `var buffer = isIsoMode ? 0 : 0.6;` then `bw = pWidth + buffer` | **HOLDS** |
| 8 | `SHARED_DATA_PATH` plus `WRITE_KEYS` / `READ_KEYS` | `:1136-1140` | `FileStore` IIFE; `SHARED_DATA_PATH` (redacted, §0.3); `WRITE_KEYS=['bb_label_templates','bb_color_presets','bb_active_color_preset_id','bb_active_theme','bb_label_open']`; `READ_KEYS=['bb_products','bb_stickers']` | **HOLDS** |
| 9 | `bb_label_templates` is the primary Artwork store | `:1315` | `var KEY='bb_label_templates';` | **HOLDS** |
| 10 | Nutrition Facts panel exists as its own tab | `:587-633` | `<div id="tab-nut">`, `📊 NUTRITION FACTS`, `nSrv`, `nCal`, per-macro enable checkboxes and DV% fields | **HOLDS** |
| 11 | `buildQR()` renders a hardcoded 17 × 17 matrix, not an encoder | `:2278-2283` | A literal 17-row array of 17 binary cells, emitted as a CSS grid | **HOLDS** |

**Eleven of eleven hold on the substance the Part 2 verdict rests on. No
material citation is stale, so no HALT condition arises** and the verdict below
proceeds on `AUDIT_STICKER.md`.

**One name-level defect found, in a citation the Part 2 verdict does not rest
on.** Spot-check #4 confirms `AUDIT_STICKER.md` §C-3's *field set* exactly —
`{id, name, bg, gold, txt, mut, row, tot, grand}`, three seeded records, ids
`cp_def1`–`cp_def3`. But `AUDIT_STICKER.md` §3.4 additionally transcribes the
three preset **names** as `cp_def1` "Balance Bites", `cp_def2` "Dark Mode",
`cp_def3` "Ocean Blue". Read directly at `SK:1273-1275`, they are:

| id | `AUDIT_STICKER.md` §3.4 claims | Actually at `SK:1273-1275` |
|---|---|---|
| `cp_def1` | "Balance Bites" | **`Dark Gold`** |
| `cp_def2` | "Dark Mode" | **`Obsidian Blue`** |
| `cp_def3` | "Ocean Blue" | **`Forest Night`** |

**All three names are wrong.** This is not a halt condition — the Part 2 verdict
turns on capability presence and absence, not on colour-preset names, and §C-3's
structural claim holds exactly. It is recorded because it is load-bearing
elsewhere: §3.4 uses those names to argue that `bb-stock-costs.html` seeds a
fourth preset, "Warm Ivory", that the sticker tool lacks. **Since §3.4's
sticker-side names are falsified on all three, its cross-tool name claim is
unverified and §8.6 does not rely on it.** The id-count divergence — three seeded
here against four there — is a separate claim and is untouched by this defect.

Two of the eleven are load-bearing beyond Part 2: #4 supplies the CF-49
comparison basis in §8.6, and #8 supplies the contrast that makes §8.2's answer
possible.

### 2.2 The delta — every LE capability, against the sticker tool

`SK` in the citation column means a line I verified in §2.1. Everything else
attributed to the sticker tool is attributed to `AUDIT_STICKER.md` by section.

#### Physical output and geometry

| # | LE capability | LE citation | Sticker tool | Sticker citation | Verdict |
|---|---|---|---|---|---|
| 1 | Five-segment continuous wrap strip in one uncut piece | `LE:1541`, `:1601`, `:1605`, `:1615`, `:1625` | No multi-segment output. Three single-face die shapes only | `SK:466-468`, `SK:1128-1132` | **ABSENT** |
| 2 | Square centre seal panel, 3 × 3 cm | `LE:680-681`, `:1115-1116` | No seal concept in any mode | `SK:1128-1132` | **ABSENT** |
| 3 | Two neck panels, 1 × 4.5 cm, vertical text | `LE:654-655`, `:671-672`, `:1109-1110` | No neck concept | `SK:1128-1132` | **ABSENT** |
| 4 | Back panel rotated 180° for fold-over reading | `LE:340` | Not recorded in `AUDIT_STICKER.md` | — | **ABSENT** |
| 5 | Rectangular back label | `LE:334-335` (fixed 5 × 3 cm) | `sW`/`sH`, operator-set, 8–40 × 2–12 cm | `SK:736-737` | **CHANGED** — same shape class, LE's is fixed, SK's is parametric with a 32 cm range |
| 6 | Circular output | — | `cW`/`cH`, 6 × 6 cm default, 3–25 cm | `SK:1019-1020` | **ABSENT from LE** |
| 7 | Round top label | — | `tSz`, 4.0 cm default, 2–15 cm | `SK:979` | **ABSENT from LE** |
| 8 | Conical / tapered cup unwrap | — | `calcTaper()` — slant height, apex radius, arc angle, bounding box | `SK:2218-2263` | **ABSENT from LE** |
| 9 | Any operator-settable dimension at all | **none exists** | Six taper inputs plus `sW`,`sH`,`tSz`,`cW`,`cH` | `SK:736-737`, `:979`, `:1019-1020`, `:2220-2223` | **ABSENT from LE** |

#### Content model

| # | LE capability | LE citation | Sticker tool | Verdict |
|---|---|---|---|---|
| 10 | Bilingual ingredients (EN + AR) | `LE:1292-1297`, rendered `:1557-1559` | Bilingual info panel — `AUDIT_STICKER.md` §1.1, §1.4 | **PRESENT** |
| 11 | Bilingual storage instructions | `LE:1298-1302`, rendered `:1562-1563` | Info sections — `AUDIT_STICKER.md` §1.4 | **PRESENT** |
| 12 | Bilingual validity statement | `LE:1303-1306`, rendered `:1566` | Info sections — `AUDIT_STICKER.md` §1.4 | **PRESENT** |
| 13 | Nutrition table | `LE:1326-1338`, rendered `:1587-1594` | Dedicated tab with per-macro enable checkboxes and DV% columns | `SK:587-598` | **CHANGED** — see §2.3 |
| 14 | Brand monogram + brand name, back panel | `LE:1288-1289`, rendered `:1553-1554` | Brand fields — `AUDIT_STICKER.md` §1.4 | **PRESENT** |
| 15 | Barcode number + rendered bars | `LE:1291`, rendered `:1576-1577` | Not recorded as a barcode; the code widget is a faux QR | `SK:2278-2283` | **CHANGED** — both faux, different symbology |
| 16 | QR code | **none** | `buildQR()` plus QR upload | `SK:2278-2283`, `AUDIT_STICKER.md` H-7 | **ABSENT from LE** |
| 17 | Net weight / approx weight | `LE:1254`, `:1307`, rendered `:1579`, `:1654` | Weight fields — `AUDIT_STICKER.md` §1.4 | **PRESENT** |
| 18 | Front badges — four, text-only | `LE:1250-1253`, rendered `:1641-1652` | Sections system — `AUDIT_STICKER.md` §1.1 (`sections` tab) | **CHANGED** — LE's four are fixed slots |
| 19 | Production-date box, operator-sized | `LE:1260-1267`, rendered `:1616-1621` | Not recorded in `AUDIT_STICKER.md` | **ABSENT from SK** |
| 20 | Flavour icon: emoji **or** uploaded PNG | `LE:1232-1247`, `:1505-1520`, rendered `:1532-1538` | Image upload exists (QR, logo) — `AUDIT_STICKER.md` §1.1 | **CHANGED** — LE's is a flavour glyph slot with an emoji fallback |
| 21 | Premium bar, arch monogram, arch sub-text, footer | `LE:1218-1230`, `:1249`, `:1255`, rendered `:1630-1631`, `:1637-1638`, `:1658` | Not recorded in `AUDIT_STICKER.md` | **ABSENT from SK** |

#### Styling and typography

| # | LE capability | LE citation | Sticker tool | Verdict |
|---|---|---|---|---|
| 22 | Per-element font **family** override, 12 elements | `LE:1343-1429` | Not recorded at this granularity in `AUDIT_STICKER.md` | **ABSENT from SK** (as recorded) |
| 23 | Per-element font **size** override, 12 elements | `LE:1343-1429` | Not recorded at this granularity | **ABSENT from SK** (as recorded) |
| 24 | Colour set — 5 pickers | `LE:1194-1202` | ColorPreset system, 7 roles, named and shared | `SK:1273-1275` | **CHANGED** — see below |
| 25 | Named, reusable colour themes | **none** | `bb_color_presets` + `bb_active_color_preset_id` + `bb_active_theme` | `SK:1136-1140`, `SK:1273-1275` | **ABSENT from LE** |
| 26 | Pattern overlay — 4 types + opacity | `LE:1204-1212`, `:1487-1494` | `style` tab — `AUDIT_STICKER.md` §1.1 | **PRESENT** |

#### Persistence, sharing and lifecycle

| # | LE capability | LE citation | Sticker tool | Verdict |
|---|---|---|---|---|
| 27 | Named Artwork library, unbounded | **none** — 6 fixed flavour slots + 8 FIFO slots | `bb_label_templates` | `SK:1315` | **ABSENT from LE** |
| 28 | Flavour content library, overwrite-in-place | `LE:1708-1751`, `:1885-1937`, key `bb_presets` `:1935` | Not recorded as a separate mechanism | **ABSENT from SK** (as recorded) |
| 29 | Eight-slot FIFO preset bar with JSON in/out | `LE:1976-2160` | `AUDIT_STICKER.md` §3.1 records the preset bar as duplicated family-wide | **PRESENT** |
| 30 | Shared on-disk folder participation | **none** — §1.1.g | `SHARED_DATA_PATH`, `showDirectoryPicker`, `bb_filestore_v1` | `SK:1136-1140` | **ABSENT from LE** |
| 31 | Reads business entities (`bb_products`, `bb_stickers`) | **none** | `READ_KEYS=['bb_products','bb_stickers']` | `SK:1140` | **ABSENT from LE** |
| 32 | IndexedDB | **none** | `BBLabelDB` / `bb_filestore_v1` — `AUDIT_STICKER.md` §D, §E | **ABSENT from LE** |
| 33 | Legacy-preset migration on load | **none** | `migrateLegacyPresets()`, unconditional at init — `AUDIT_STICKER.md` §0 RISK-1, `:3613-3643` | **ABSENT from LE** |
| 34 | Schema version marker on stored records | **none** — `LE:1935`, `:2083` | Not recorded as present | **ABSENT from both** |

#### Output

| # | LE capability | LE citation | Sticker tool | Verdict |
|---|---|---|---|---|
| 35 | Print at real cm | `LE:998-1129` | Exact-size mode with a 0.6 cm buffer | `SK:2899-2901` | **CHANGED** — LE has no buffer and no size choice |
| 36 | Page-size selection | **none** — A4 only | Four branches: A4, letter, A3, exact/ISO | `SK:2894-2901` | **ABSENT from LE** |
| 37 | PNG / raster export | **none** | `exportPNG` via `dom-to-image` — `AUDIT_STICKER.md` §1.1 item 4, §I | **ABSENT from LE** |
| 38 | JSON preset export / import | `LE:2102-2130` | `AUDIT_STICKER.md` §3.1 | **PRESENT** |
| 39 | Zoom preview | `LE:1459-1464` | Not recorded | **ABSENT from SK** (as recorded) |
| 40 | Reset to defaults | `LE:1435`, `:1939-1969` | Not recorded | **ABSENT from SK** (as recorded) |

**Tally over 40 capabilities: PRESENT 8 · CHANGED 7 · ABSENT from the sticker
tool 9 · ABSENT from LE 16.**

### 2.3 The nutrition divergence, stated precisely

Row 13 is CHANGED rather than PRESENT and the difference is a modelling
difference, not a feature-count difference.

**LE authors nutrition as free text.** One `<textarea>` (`LE:1332-1337`) holding
`\n`-delimited rows, each `\|`-delimited into exactly four fields —
`Name EN | Value EN | Name AR | Value AR`. `parseNutRows()` (`LE:1496-1503`)
splits on `\n`, splits each line on `\|`, and **pushes the row only if
`p.length >= 4`.** A row with three fields is silently dropped: no error, no
count, no marker. The operator's only feedback is that the row is missing from
the preview.

There is no nutrient vocabulary, no unit field, no daily-value column, no
ordering rule, no required-nutrient set, and no numeric type — `443 kcal` and
`٤٤٣ سعرة` are both opaque strings.

**The sticker tool models nutrition as fields.** `SK:590-596` shows
`nSrv` (serving size), `nCal` (calories), and per-macro pairs each consisting of
an **enable checkbox** (`cNFat`) plus a **value** (`nFat`, `step=".5"`) plus a
**daily-value percent** (`nFatDV`). Each nutrient is an addressable, typed,
individually-suppressible field.

For a PackagingTemplate this is the difference between a nutrition **slot** that
accepts a blob and a nutrition **structure** the platform can validate,
localise, order and reuse. §3.2 records both and §3.3 judges it.

### 2.4 What depends on label-v3 and is therefore unresolvable

`balance-bites-label-v3.html` is permanently deleted. `REPORT.md` §2.2 is the
sole record of its behaviour, and `AUDIT_STICKER.md` §1.1 / §1.2 compare against
it. Four questions the CF-22 verdict would ideally answer cannot be answered
from those sections and are **marked unresolvable rather than reasoned out**:

| Question | Why unresolvable |
|---|---|
| Did label-v3 have a multi-segment strip, a seal or a neck? | `REPORT.md` §2.2 lists its modes as rectangular, tapered cup, circular and custom size. It says nothing about segments, seals or necks. Silence is not evidence of absence. **Unresolvable.** |
| Did label-v3 have per-element typography? | Not mentioned in `REPORT.md` §2.2. **Unresolvable.** |
| Is LE descended from label-v3, a sibling, or independent? | No provenance is recorded in `REPORT.md` §2.2 or `AUDIT_STICKER.md` §1.1/§1.2. **Unresolvable.** |
| Did label-v3's conical unwrap match `calcTaper()`? | `REPORT.md` §2.2 records that label-v3 had "conical unwrap math" but gives no expression, no inputs and no constant. **Unresolvable.** §3.4 records this as the reason the unwrap has exactly one recoverable version. |

**One label-v3 fact is recorded and is worth carrying forward, without
inference.** `REPORT.md` §2.2 gives label-v3 **four** modes — rectangular,
tapered cup, circular and **custom size**. The sticker tool has **three**,
verified at `SK:466-468` and `SK:1128-1132`, and "custom size" is not among them.
Both statements are evidenced. What that implies about the label-v3 → sticker
transition is not stated in either source and is not inferred here; it is logged
as an untriaged finding in §C.4.

### 2.5 CF-22 verdict

> **Overlapping-but-neither.** The label editor is **not** a strict subset — it
> produces a five-segment fold-over wrap strip with a seal and two necks that no
> sticker-tool mode can produce, and it holds sixteen capabilities the sticker
> tool is not recorded as having. It is **not** cleanly a distinct class either —
> eight of its capabilities are present in the sticker tool unchanged and seven
> more are the same capability in a different shape, so roughly 80% of its
> **content model** is the sticker tool's content model. The honest reading is
> that the two tools are **one content model rendered onto two incompatible
> physical geometries, with the label editor carrying strictly weaker
> infrastructure** — no folder participation, no theming, no raster output, no
> named library, no page-size choice, no migration, and no dimension control at
> all.

**Justification, three axes, each from evidence above.**

1. **Physical output — distinct.** LE's artifact is 5 cm × 18 cm in five ordered
   segments with a 180° back rotation (`LE:340`) and a square seal
   (`LE:1115-1116`). The sticker tool's three modes are a parametric rectangle
   (`SK:736-737`), a round top label (`SK:979`) and a circle (`SK:1019-1020`),
   optionally warped by a conical unwrap (`SK:2218-2263`). There is no mode, and
   no combination of modes, that yields LE's artifact. Rows 1–9.
2. **Content model — overlapping, near-identical.** Bilingual ingredients,
   storage, validity, nutrition, brand monogram, weight, a code widget and
   badges appear in both. Rows 10–21: eight PRESENT, seven CHANGED. The one
   structural divergence is nutrition (§2.3), and it favours the sticker tool.
3. **Infrastructure — LE is a strict subset.** Every persistence, sharing,
   lifecycle and output capability LE has, the sticker tool also has; the
   sticker tool has nine more that LE has none of. Rows 27–40. There is no
   infrastructure capability in LE that the sticker tool lacks, with the single
   exception of the flavour content library (row 28), which is a content feature
   wearing a persistence key.

**What turns on this for the merge decision, stated without making it.** A merge
on the content and infrastructure axes is supported by the evidence: the models
overlap and one side dominates. A merge on the geometry axis is not — the two
artifacts are different physical objects and neither tool's geometry can express
the other's. This document does not choose; §3.1 records both geometries as
separate PackagingTypes so that whichever way the decision goes, nothing is
forgotten.

**CF-22's evidentiary requirement is met by §2.2 (all 40 capabilities with
citations on both sides), §2.3 (the one structural divergence) and §2.5 (an
explicit verdict).** Per the P-04 prompt, no carry-forward is closed by this
task; CF-22 closes at Gate 1.

---
## PART 3 — THE TEMPLATE REQUIREMENT

Derived across all four design tools: LE, ST, CA read completely this session,
plus the sticker tool as documented in `AUDIT_STICKER.md` and spot-checked at the
eleven lines in §2.1.

This Part inventories. It does not design. The B2S packaging half is
**template-driven with constrained customisation and a library of presets, not a
free canvas** — a frozen decision — so the value of the inventory is not the
list of controls but the judgement in §3.3 about which of them a template must
expose and which exist only because these tools had no template layer at all.

### 3.1 Physical output types

**Seven distinct physical output types across the four tools.** Each is a
candidate PackagingType value; none can be expressed as a parameterisation of
another.

#### PT-1 · Fold-over wrap strip (LE)

One uncut piece that folds over the top of a pouch. Five ordered segments
sharing a single width.

| Parameter | Value | Constraint | Default | Citation |
|---|---|---|---|---|
| Strip width | 5 cm | **Fixed. No control exists.** | 5 cm | `LE:999`, `LE:1005` |
| Strip height | 18 cm (3 + 4.5 + 3 + 4.5 + 3) | **Fixed. Derived, never stated in source.** | 18 cm | sum of `LE:1006`, `:1110`, `:1116` |
| Segment count and order | 5: back, neck, seal, neck, front | **Fixed. Literal concatenation order.** | — | `LE:1541`, `:1601`, `:1605`, `:1615`, `:1625` |
| Back panel | 5 × 3 cm, rotated 180° | Fixed | — | `LE:1005-1006`, `LE:340` |
| Neck panel (×2) | 1 × 4.5 cm | Fixed | — | `LE:1109-1110` |
| Seal panel | 3 × 3 cm | Fixed | — | `LE:1115-1116` |
| Front panel | 5 × 3 cm | Fixed | — | `LE:1121-1122` |
| Arch width (front) | 1.6 cm | Fixed | — | `LE:1128` |

The seal is narrower than the strip (3 cm on a 5 cm strip) and the necks are
narrower still (1 cm). **The strip is therefore not a rectangle — it is a
cruciform**, and nothing in LE declares that. It is inferable only from the three
widths.

#### PT-2 · Counter display stand (ST)

Four panels of a die-cut cardboard fixture, printed one per page and assembled.

| Parameter | Unit | Range | Default | Citation |
|---|---|---|---|---|
| Mirror-face width | mm | 250–500 | 400 | `ST:355` |
| Mirror-face height | mm | 100–300 | 190 | `ST:356` |
| Shelf width | mm | 250–500 | 400 | `ST:360` |
| Shelf height | mm | 30–150 | 85 | `ST:361` |
| Side depth | mm | 150–400 | 320 | `ST:365` |
| Side **front** height | mm | 40–200 | 85 | `ST:366` |
| Side **back** height | mm | 100–500 | 290 | `ST:369` |

Panel count is fixed at four (`ST:689-698`). **No constraint links the panels**:
face width and shelf width are independent inputs that a physical stand requires
to be equal, and nothing enforces it. Likewise `sideFH` may exceed `sideBH`,
producing an inverted taper and a negative clip percentage (`ST:624`) with no
guard. See §3.5.

#### PT-3 · Shipping carton (CA)

Four faces of a corrugated shipping case, at one of two discrete pack sizes.

| Pack | Real carton (mm) | Total weight | front (px) | top (px) | side (px) | bottom (px) | Citation |
|---|---|---|---|---|---|---|---|
| 24 | 300 × 200 × 150 | `960G` | 700 × 360 | 700 × 230 | 230 × 360 | 700 × 230 | `CA:169` |
| 48 | 400 × 220 × 200 | `1920G` | 920 × 420 | 920 × 270 | 270 × 420 | 920 × 270 | `CA:170` |

**Constraint: exactly two, discrete, not interpolable.** There is no width, depth
or height input; the pack count is the only dimensional control (`CA:149-150`).
**The mm and px figures are unrelated** (§1.3.b) — the mm string is display text
and the px pairs are the rendered geometry.

#### PT-4 · Rectangular back label (sticker tool)

| Parameter | Unit | Range | Step | Default | Citation |
|---|---|---|---|---|---|
| Width | cm | 8–40 | 0.5 | 17 | `SK:736` |
| Height | cm | 2–12 | 0.5 | 4.5 | `SK:737` |

#### PT-5 · Round top label (sticker tool)

| Parameter | Unit | Range | Step | Default | Citation |
|---|---|---|---|---|---|
| Dimension | cm | 2–15 | 0.1 | 4.0 | `SK:979` |

#### PT-6 · Circular label (sticker tool)

| Parameter | Unit | Range | Step | Default | Citation |
|---|---|---|---|---|---|
| Width | cm | 3–25 | 0.1 | 6 | `SK:1019` |
| Height | cm | 3–25 | 0.1 | 6 | `SK:1020` |

Width and height are independent, so PT-6 is an **ellipse**, not a circle,
despite the mode name.

#### PT-7 · Conical wrap label for a tapered cup (sticker tool)

The only output type whose printed shape is *computed* rather than declared.

| Parameter | Symbol | Unit | Default | Citation |
|---|---|---|---|---|
| Cup top diameter | `dTop` | cm | 9 | `SK:2220` |
| Cup bottom diameter | `dBot` | cm | 7 | `SK:2220` |
| Cup height | `hCup` | cm | 9 | `SK:2221` |
| Label height | `hLbl` | cm | 7 | `SK:2221` |
| Offset from cup bottom | `offsetBot` | cm | 0.5 | `SK:2222` |
| Wrap fraction | `wrapFrac` | % → fraction | 85 → 0.85 | `SK:2223` |

Constraint, enforced in code: `if (dTop <= dBot + 0.01) dTop = dBot + 0.1;`
(`SK:2225`) — a degenerate or inverted cone is silently corrected to a
0.1 cm taper. This is **the only dimensional guard in the entire design family.**

#### PT-8 · Not present — and worth recording

`REPORT.md` §2.2 records a fourth label-v3 mode, **custom size**. It has no
counterpart in the sticker tool's three modes (`SK:466-468`, `SK:1128-1132`) and
none in LE, ST or CA. Recorded as an untriaged finding in §C.4.

### 3.2 Content slots

A content slot is a place a text, an image, a code or a colour can go. Grouped by
output type. This is the seed of `CONTENT_MODEL.md`.

#### 3.2.a PT-1 wrap strip (LE) — 44 slots

**Back panel (5 × 3 cm), left column**

| Slot | Type | Bilingual | Default | Citation |
|---|---|---|---|---|
| Brand monogram | text | no | `BB` | `LE:1288`, rendered `:1553` |
| Brand name | text | no | `Balance Bites` | `LE:1289`, rendered `:1554` |
| Ingredients heading | text, **hardcoded** | EN + AR fused in one literal | `Ingredients / المكونات:` | `LE:1557` |
| Ingredients body | long text | **EN + AR, separate fields** | see §6 | `LE:1292-1297`, rendered `:1558-1559` |
| Storage heading | text, **hardcoded** | EN + AR fused | `Storage / التخزين:` | `LE:1562` |
| Storage body | long text | EN + AR, **fused at render** with ` / ` | see §6 | `LE:1298-1302`, rendered `:1563` |
| Validity | text | EN + AR, **fused at render** | see §6 | `LE:1303-1306`, rendered `:1566` |
| Barcode symbol | **fixed SVG** | — | 20 literal `<rect>` bars | `LE:1576` |
| Barcode number | text | no | `1615012` | `LE:1291`, rendered `:1577` |
| Approx weight value | text | no | `150G` | `LE:1307`, rendered `:1579` |
| Weight caption | text, **hardcoded** | EN + AR fused | `WEIGHT / الوزن` | `LE:1580` |

**Back panel, right column**

| Slot | Type | Bilingual | Default | Citation |
|---|---|---|---|---|
| Nutrition heading | text, **hardcoded** | EN + AR fused | `Nutrition / حقائق التغذية` | `LE:1588` |
| Serving size | text | EN + AR, separate fields, fused at render | `Serving per size 100g` / `حجم الحصة ١٠٠ جم` | `LE:1328-1331`, rendered `:1589` |
| Nutrition rows | **delimited blob** | EN + AR inside the blob | 4 rows | `LE:1332-1337`, parsed `:1496-1503`, rendered `:1591-1593` |

**Neck (top)**

| Slot | Type | Default | Citation |
|---|---|---|---|
| Vertical text | text | `SEALED · FRESHNESS` | `LE:1281`, rendered `:1602` |

**Seal**

| Slot | Type | Default | Citation |
|---|---|---|---|
| Monogram | text | `BB` | `LE:1273`, rendered `:1606` |
| Brand name | text | `Balance Bites` | `LE:1274`, rendered `:1608` |

**Neck (bottom) — date box**

| Slot | Type | Default | Citation |
|---|---|---|---|
| Date label | text | `Production Date:` | `LE:1260`, rendered `:1618` |
| Date value | text | empty → renders `___________` | `LE:1261`, rendered `:1619` |

**Front panel**

| Slot | Type | Default | Citation |
|---|---|---|---|
| Arch monogram | text | `BB` | `LE:1220`, rendered `:1630` |
| Arch sub-text | text | `BALANCE BITES` | `LE:1227`, rendered `:1631` |
| Flavour name | **multi-line** text | `Cinnamon` | `LE:1231`, rendered `:1634` |
| Flavour icon | **emoji glyph or uploaded PNG** | `🍂` | `LE:1234`, `:1242`, rendered `:1532-1538` |
| Sub-type | text, force-uppercased | `Peanut` | `LE:1248`, rendered `:1636` |
| Premium bar | text | `P R E M I U M` | `LE:1249`, rendered `:1638` |
| Badge 1–4 | text ×4, force-uppercased | `100% Natural`, `No Preservations`, `Whole Wheat`, `No Added Sugar` | `LE:1250-1253`, rendered `:1642`, `:1645`, `:1649`, `:1652` |
| Badge icon 1/3 | **fixed SVG** — square + tick | — | `LE:1641`, `:1648` |
| Badge icon 2/4 | **fixed SVG** — circle + cross | — | `LE:1644`, `:1651` |
| Net weight | text | `30g` | `LE:1254`, rendered `:1654` |
| Footer | text | `✦  BALANCEBITES.COM  ✦` | `LE:1255`, rendered `:1658` |

**Colour slots (apply to every segment)**

| Slot | Type | Default | Citation |
|---|---|---|---|
| Background | colour | `#1a1208` | `LE:1194` |
| Gold / border | colour | `#c9a84c` | `LE:1196` |
| Arch accent | colour | `#3a8a7a` | `LE:1198` |
| Badge-1 colour | colour | `#c9a84c` | `LE:1200` |
| Badge-2 colour | colour | `#c9a84c` | `LE:1202` |
| Arch monogram colour | colour, **optional override** | `#c9a84c` | `LE:1222`, applied `:1629` |

**One captured slot renders nowhere.** `web` (`LE:1308`, captured `LE:1680`) is
persisted in both preset mechanisms and read by no build path — `buildLabel()`
(`LE:1522-1661`) never references `v.web`. The footer (`LE:1255`) carries the URL
as literal text instead. A second, `eProd` (`LE:1290`, "Prod. Date"), is present
in the DOM and reset by `rst()` (`LE:1948`) but is **not in `getVals()` at all**
(`LE:1663-1697`), so it is neither rendered nor persisted. Two dead slots.

#### 3.2.b PT-2 counter display stand (ST) — 41 slots

**Brand (used on all four panels)**

| Slot | Type | Bilingual | Default | Citation | Rendered? |
|---|---|---|---|---|---|
| Brand line 1 | text | no | `BALANCE` | `ST:149` | yes — `:556`, `:583`, `:652` |
| Brand line 2 | text | no | `BITES` | `ST:150` | yes — same |
| Logo text | text | no | `BB` | `ST:151` | yes — `:555`, `:582`, `:651` |
| Tagline EN | text | **paired** | `WHOLE FOOD SNACKS · NATURALLY POWERFUL` | `ST:152` | yes — `:558` |
| Tagline AR | text | **paired** | `وجبات خفيفة طبيعية · قوية بالطبيعة` | `ST:153` | yes — `:559` |
| Call to action | text | no | `Try Our Natural Crackers!` | `ST:154` | yes — `:560` |
| Website | text | no | `balancebites.com` | `ST:155` | yes — `:593`, `:660` |

**Social**

| Slot | Type | Default | Citation | Rendered? |
|---|---|---|---|---|
| Instagram | text | `@balancebites.eg` | `ST:160` | yes — `:590` |
| WhatsApp | text | `+20 123 456 7890` | `ST:161` | yes — `:591` |
| Extra line | text | empty | `ST:162` | yes — `:592` |

**Products — captured, never rendered (§1.2.f)**

| Slot | Type | Default | Citation | Rendered? |
|---|---|---|---|---|
| Product 1–5 EN | text ×5 | `Za'atar Crackers`, `Paprika Crackers`, `Rosemary & Basil`, `Black Pepper & Sea Salt`, `Cinnamon Roasted Peanuts` | `ST:182`, `:184`, `:186`, `:188`, `:190` | **no** |
| Product 1–5 AR | text ×5 | `كراكرز زعتر`, `كراكرز بابريكا`, `كراكرز روزماري و ريحان`, `كراكرز فلفل اسود و ملح بحر`, `فول سوداني بالقرفة` | `ST:183`, `:185`, `:187`, `:189`, `:191` | **no** |
| Weight | text | `40G` | `ST:195` | **no** |
| Price | text | `EGP 45` | `ST:196` | **no** |

**Badges — six slots, each a triple**

| Slot | Type | Defaults | Citation |
|---|---|---|---|
| Badge 1–6 label | text ×6 | `100% Natural`, `Whole Wheat`, `For Diet`, `For Diabetes`, `Custom Badge`, `Custom Badge 2` | `ST:315`, `:320`, `:325`, `:330`, `:335`, `:340` |
| Badge 1–6 emoji | text ×6 | `🌿`, `🌾`, `🥗`, `💊`, `⭐`, `✨` | `ST:316`, `:321`, `:326`, `:331`, `:336`, `:341` |
| Badge 1–6 PNG | **uploaded image, Base64** ×6 | empty | `ST:317`, `:322`, `:327`, `:332`, `:337`, `:342` |

The PNG **supersedes** the emoji when present (`ST:601`).

**Images**

| Slot | Type | Applies to | Citation |
|---|---|---|---|
| Background image ×4 | uploaded image, Base64 | face, shelf, side L, side R | `ST:230-233`, rendered `:548`, `:575`, `:639` |
| QR code ×3 | uploaded image, Base64 | shelf, side L, side R | `ST:237-239`, rendered `:609`, `:658` |

**No QR is generated.** All three are operator-supplied bitmaps. The sticker
tool's `buildQR()` (`SK:2278-2283`) is a hardcoded matrix. **Neither tool encodes
anything.**

**Colour slots — 11**

| Slot | Default | Citation |
|---|---|---|
| Flavour colour ×5 (Za'atar, Paprika, Rosemary, B.Pepper, Cinnamon) | `#2e7d32`, `#c62828`, `#f9a825`, `#1565c0`, `#bf360c` | `ST:166-174` |
| Panel background ×4 | `#1a1a1a` each | `ST:204-209` |
| Pattern colour | `#ffffff` | `ST:225` |
| Main text | `#ffffff` | `ST:261` |
| Sub text | `#cccccc` | `ST:262` |
| Logo circle background | `#ffffff` | `ST:265` |
| Logo text | `#1a1a1a` | `ST:266` |

The five flavour colours drive two gradient strips (`ST:551-552`, `:577`) and
five dots (`ST:564`). **They are a colour *sequence*, not five independent
colours** — order is positional in the gradient.

**Fixed literal**

| Slot | Value | Citation | Editable? |
|---|---|---|---|
| Fixture model | `CDS 140 Counter Display Stand` | `ST:434` | **no** |

#### 3.2.c PT-3 shipping carton (CA) — 21 slots

| Slot | Type | Bilingual | Default | Face(s) | Citation |
|---|---|---|---|---|---|
| Monogram | text | no | `BB` | front watermark, top watermark, side | `CA:89`, rendered `:246`, `:293`, `:325` |
| Brand name | text | no | `Balance Bites` | front, top | `CA:93`, rendered `:251`, `:301` |
| Flavour | text | no | `Za'atar` | front, top, side | `CA:94`, rendered `:256`, `:303`, `:328` |
| Type | text | no | `Crackers` | front, side | `CA:95`, rendered `:257`, `:329` |
| Slogan | text | no | `Natural · Wholesome · Delicious` | front | `CA:96`, rendered `:270` |
| Website | text | no | `balancebites.com` | top, bottom | `CA:97`, rendered `:307`, `:367` |
| Unit weight | text | no | `40G` | front (×2) | `CA:90`, rendered `:269`, `:280` |
| Badge 1–3 | text ×3 | no | `100% Natural`, `Whole Wheat`, `No Preservatives` | front | `CA:101-103`, rendered `:262` |
| Production date | text | no | `2025/06/01` | bottom | `CA:107`, rendered `:358` |
| Expiry date | text | no | `2025/09/01` | bottom | `CA:108`, rendered `:358` |
| Date captions | text, **hardcoded** | EN only | `PROD DATE`, `EXP DATE` | bottom | `CA:357` |
| Barcode number | text | no | `1615012` | bottom | `CA:110`, rendered `:212` |
| Barcode symbol | **derived from the number** | — | 32 bars | bottom | `CA:208-213` |
| Ingredients EN | long text | **paired** | see §6 | bottom | `CA:121`, rendered `:365` |
| Ingredients AR | long text | **paired** | see §6 | bottom | `CA:122`, rendered `:366` |
| Ingredients heading | text, **hardcoded** | AR + EN fused | `المكونات · INGREDIENTS` | bottom | `CA:364` |
| Unit count | **derived** from pack size | — | `24` / `48` | front strip, top, side | `CA:277`, `:296`, `:336` |
| `UNITS` / `PCS` captions | text, **hardcoded** | EN only | `UNITS`, `PCS`, `each` | front, top, side | `CA:279-280`, `:297`, `:337` |
| Net-weight line | **derived** | EN only | `NET WT {totalWt} ({sz}×{unitWt})` | front | `CA:269` |
| Corner ornament | fixed glyph `✦` ×4 | — | — | all four faces | `CA:202-207` |
| Colour ×4 | bg / gold / accent / text | — | per `CARTON_PRESETS` | all | `CA:80-85` |

**CA's barcode is the only code widget in the family that responds to its
input.** `barcode()` (`CA:208-213`) computes a checksum from the digits
(`CA:209`) and phase-shifts a 32-entry width table by it (`CA:211`). Different
numbers give different bar patterns. It still encodes nothing — the widths come
from a literal table, not from a symbology — but it is not a constant image.
Contrast LE's twenty literal `<rect>` elements (`LE:1576`) and the sticker
tool's literal 17 × 17 matrix (`SK:2279`).

#### 3.2.d PT-4 to PT-7 sticker tool

From `AUDIT_STICKER.md` plus the two panels verified in §2.1. Not re-derived —
the file was not read.

| Slot group | Detail | Citation |
|---|---|---|
| Nutrition — serving size | `nSrv`, default `5 crackers (20g)` | `SK:590` |
| Nutrition — calories | `nCal`, default `130` | `SK:591` |
| Nutrition — per macro | **triple**: enable checkbox + value (`step=".5"`) + daily-value % | `SK:595-596` |
| Brand, info, sections, size, style tabs | Tab set varies by `DESIGN_SPECS` entry | `SK:1129-1131` |
| QR widget | Hardcoded 17 × 17 matrix, `bg`/`fg` parameterised | `SK:2278-2283` |
| Colour roles | 7: `bg`, `gold`, `txt`, `mut`, `row`, `tot`, `grand` | `SK:1273-1275` |
| Everything else | `AUDIT_STICKER.md` §1.1, §1.4 | — |

#### 3.2.e Cross-cutting slot observations for `CONTENT_MODEL.md`

1. **Bilingual pairs are expressed three different ways in three files, and one
   of them is not a pair at all.** LE keeps separate EN and AR fields and fuses
   them at render with ` / ` (`LE:1563`, `:1566`, `:1589`). CA keeps separate
   fields and renders them as separate stacked lines with `direction:rtl` on the
   Arabic one (`CA:365-366`). ST keeps separate fields for the tagline only
   (`ST:152-153`) and renders them stacked (`ST:558-559`). And **eight bilingual
   *headings* are single hardcoded literals with both languages baked into one
   string** — `Ingredients / المكونات:` (`LE:1557`), `Storage / التخزين:`
   (`LE:1562`), `Nutrition / حقائق التغذية` (`LE:1588`), `WEIGHT / الوزن`
   (`LE:1580`), `المكونات · INGREDIENTS` (`CA:364`). Those cannot be localised at
   all; they can only be replaced wholesale.
2. **Three code widgets, zero encoders.** §3.2.c.
3. **Two image-slot models.** ST and the sticker tool accept operator uploads as
   Base64 into `localStorage`. LE accepts one upload (the flavour icon,
   `LE:1235-1242`). CA accepts none.
4. **Derived slots are rendered but not stored as content.** CA's unit count, net
   weight line and total weight come from `SIZES` (`CA:168-171`); LE's `___________`
   placeholder appears when the date value is empty (`LE:1619`).
5. **Force-uppercase is applied to five slots and is lossy for Arabic.**
   `v.type.toUpperCase()` (`LE:1636`) and the four badges (`LE:1642`, `:1645`,
   `:1649`, `:1652`). Arabic has no case, so the call is a no-op there — but it
   silently destroys deliberate lower-case in Latin text.

### 3.3 Layout degrees of freedom

**Forty degrees of freedom.** Every one carries an explicit judgement:
**MUST** (a brand has to be able to change this) or **ARTIFACT** (it exists only
because these tools had no template layer). Each judgement is justified from the
evidence above.

This is the seed of `TEMPLATE_MODEL.md`'s constraint set.

#### Move — 2

| # | Degree of freedom | Tools | Citation | Judgement | Justification |
|---|---|---|---|---|---|
| 1 | Side-panel logo X/Y, as a percentage of panel width/height | ST | `ST:243-248`, `:412-417`, applied `:643-644`, `:649` | **ARTIFACT** | Free 2-D placement of a brand mark on a die-cut panel is exactly the free-canvas surface the frozen decision removes. Its own implementation argues against it: the control is duplicated with **different ranges** (10–90 at `:243-248`, 10–95 at `:412-417`) under **duplicate element ids**, so only one of the two is reachable and which one depends on DOM order. A template should offer named anchor positions, not a coordinate plane. |
| 2 | Side-panel QR X/Y, as a percentage | ST | `ST:252-257`, applied `:645-646`, `:658` | **ARTIFACT** | Same reasoning as #1. Reinforced by the fact that the logo path carries an unexplained `- 10` mm offset (`ST:649`) that the QR path does not (`ST:658`) — two supposedly identical positioning primitives already disagree, which is what unconstrained coordinates produce. |

#### Resize — the physical substrate — 10

| # | Degree of freedom | Tools | Citation | Judgement | Justification |
|---|---|---|---|---|---|
| 3 | Mirror-face width and height (mm) | ST | `ST:355-356` | **MUST** | The fixture is cut from board to these dimensions. A brand with a different counter depth needs a different face. This is the physical object, not its decoration. |
| 4 | Shelf width and height (mm) | ST | `ST:360-361` | **MUST** | Same. Note the missing constraint: nothing forces shelf width to equal face width, and a real stand requires it. A template must express the **constraint**, which is why this is a MUST at the template layer rather than a free input. |
| 5 | Side depth and back height (mm) | ST | `ST:365`, `:369` | **MUST** | Determines the fixture's footprint and standing height. |
| 6 | Side **front** height (mm) — the taper | ST | `ST:366`, consumed `:624-625`, `:636-637` | **MUST** | This is the only shape control in ST: `backH − frontH` is the slope of the cut. §3.5. |
| 7 | Pack size, discrete 24 / 48 | CA | `CA:149-150`, `:168-171` | **MUST** | The pack count is a real business fact that changes the carton, the printed unit count, the net weight and all four face sizes at once. A template must model it as a **variant**, not as four independent dimensions — CA already does. |
| 8 | Back-label width and height (cm) | SK | `SK:736-737` | **MUST** | Different pouch sizes need different labels. |
| 9 | Top-label dimension (cm) | SK | `SK:979` | **MUST** | Same, for lids. |
| 10 | Circle/ellipse width and height (cm) | SK | `SK:1019-1020` | **MUST** | Same. Note W and H are independent, so the "circle" mode makes ellipses — a template must decide whether that is a feature or an unguarded input. |
| 11 | Cup geometry — 6 inputs | SK | `SK:2220-2223` | **MUST** | These describe the physical cup the label wraps. Getting them wrong produces a label that does not meet itself. The strongest MUST in the list. |
| 12 | Wrap-strip dimensions | LE | **no control exists** | **MUST** (as an absence) | LE's 5 × 18 cm is hardcoded in CSS at two scales (`LE:334-335`, `:999-1128`). A single-tenant tool can hardcode its one pouch size; a multi-tenant platform cannot. This is recorded as a degree of freedom the tools **lack** and a template must add. |

#### Resize — an element within the substrate — 7

| # | Degree of freedom | Tools | Citation | Judgement | Justification |
|---|---|---|---|---|---|
| 13 | Per-element font size override | LE (12), ST (12), CA (7) | `LE:1343-1429`; `ST:387-420`; `CA:126-139` | **ARTIFACT** | 31 independent font-size sliders across three tools is the definition of a free canvas. The evidence that it is compensation rather than a requirement: LE's print stylesheet has to **override the operator entirely** with thirteen `!important`-adjacent mm sizes (`LE:1033-1105`) because operator-set px sizes are meaningless at print scale. The tool gives a control it then ignores. A template sets type by role. |
| 14 | Logo / monogram circle diameter | ST | `ST:391` (face), `:409` (side) | **ARTIFACT** | Ranges are 10–300 px on a panel that is 190–500 mm. The range is not calibrated to anything. A template sizes the mark relative to its panel. |
| 15 | Badge icon size and badge text size | ST | `ST:346-347` | **ARTIFACT** | Ranges 5–300 px and 2–300 px for elements rendered at 16 px and 6 px by default. A 300 px badge on an 85 mm shelf is not a use case; it is an unbounded slider. |
| 16 | Flavour-icon size | LE | `LE:1245` | **MUST** | Unlike #14 and #15 this one is bounded (5–60 px) and has a real purpose: an uploaded PNG and a 1-character emoji need different optical sizes in the same slot (`LE:1532-1538`). A template must let the icon be sized because the *content* of that slot varies in kind. |
| 17 | Code-widget dimensions | LE (`bcW`, `bcH`), CA (`bcH`), ST (`qrSz`) | `LE:1309-1313`; `CA:116`; `ST:420` | **MUST** | A scannable code has a minimum physical size. The tools expose it as a free px slider with no minimum, which is the wrong shape — but the underlying need (fit a code into a constrained panel) is real and a template must express it, with a floor. |
| 18 | Date-box dimensions | LE (`pdW`,`pdH`,`pdFS`), CA (`dateBoxW`,`dateFS`) | `LE:1262-1267`; `CA:112-113` | **ARTIFACT** | Two tools independently grew a sizeable date box because the date is the one field printed after the artwork is designed. The requirement is "reserve space for a variable-length date", not "let the operator drag its edges". |
| 19 | Units-strip width | CA | `CA:138`, consumed `:238` | **ARTIFACT** | 120–300 px on a 700–920 px face. It is a layout split ratio exposed as an absolute pixel count. A template expresses it as a proportion or not at all. |

#### Reorder — 1

| # | Degree of freedom | Tools | Citation | Judgement | Justification |
|---|---|---|---|---|---|
| 20 | Element or segment reordering | **none of the four** | LE's order is literal concatenation (`LE:1541`→`:1625`); ST's is a fixed `if` chain (`ST:689-698`); CA's is a fixed template string (`CA:380-384`) | **ARTIFACT** (as an absence) | **Not one of the four tools permits reordering anything.** Four tools, 388 controls between them, and zero reordering. That is strong evidence that element order is a property of the PackagingTemplate and not a customisation the brand needs. Recording the zero is the finding. |

#### Hide — 7

| # | Degree of freedom | Tools | Citation | Judgement | Justification |
|---|---|---|---|---|---|
| 21 | Named render toggles | ST — 7 checkboxes | `ST:270-276`, `:156`, consumed `:522-525`, `:550`, `:561`, `:579`, `:588`, `:598`, `:608` | **MUST** (5 of 7) | Show/hide of whole content blocks — social, badges, QR, brand, colour lines, flavour dots — is a real brand choice: not every tenant has an Instagram handle or a QR programme. Two of the seven (`printTitles`, `printCenter`) are **dead** (§1.2.f), which is itself evidence: the operator asked for print-layout toggles and never got them. |
| 22 | Per-badge on/off | ST — 6 checkboxes | `ST:306-311`, consumed `:504-505` | **MUST** | Badges are regulatory and marketing claims. Which ones apply is per product, and a brand must be able to turn one off without deleting its text. |
| 23 | Implicit hide-by-empty | CA badges, LE date box, ST tagline/CTA/social/web | `CA:259` (`filter(Boolean)`); `LE:1614`; `ST:558-560`, `:590-593` | **ARTIFACT** | Emptying a field to hide an element is a side effect, not a control. It conflates "no value" with "not shown" and makes the two unrecoverable from each other in storage. A template needs an explicit visibility flag — which #21 and #22 already show the operator wanted. |
| 24 | Pattern off | ST per-panel, LE global | `ST:214-222` (`none` option), `:498`; `LE:1204-1209`, `:1489` | **MUST** | A background texture is a brand-identity decision and turning it off must not require deleting the pattern configuration. Both tools already model it correctly, as an enum member rather than an absence. |
| 25 | Image layer absent → hidden | ST backgrounds and QR | `ST:548`, `:575`, `:608`, `:639`, `:657` | **ARTIFACT** | Same defect as #23 in image form: `if (v.imgFace)` conflates "no image uploaded" with "background image layer disabled". |
| 26 | Panel / page scope filter | ST | `ST:435-438`, `:689-698`, `:703` | **MUST** | This is not a view control — it determines which pages the PrintJob contains (§1.2.b). Reprinting one damaged panel of a four-panel fixture is a real operation. |
| 27 | Per-nutrient inclusion | SK explicit; LE by editing the blob | `SK:595` (`cNFat` checkbox); `LE:1332-1337` | **MUST** | Which nutrients are declared is a regulatory decision that varies by market. The sticker tool models it correctly with a checkbox per macro; LE requires deleting a line from a textarea, which loses the value. §2.3. |

#### Restyle — 7

| # | Degree of freedom | Tools | Citation | Judgement | Justification |
|---|---|---|---|---|---|
| 28 | Free colour pickers | CA (4), ST (11), LE (5) | `CA:80-85`; `ST:166-174`, `:204-209`, `:225`, `:261-266`; `LE:1194-1202` | **MUST** | Colour is the primary axis of white-label differentiation. Twenty pickers across three tools with no shared vocabulary is the wrong *shape* — §5.2 and §8.6 record the collision — but the freedom itself is the product's reason to exist. |
| 29 | Named palette selection | CA `CARTON_PRESETS` (4), SK ColorPreset | `CA:172-177`, `:387-392`; `SK:1273-1275` | **MUST** | Two independent tools grew a named-palette layer over the raw pickers. That is convergent evidence for a first-class colour-theme entity. CA's `custom` escape hatch (`CA:388`) shows the operator also needed to break out of the named set. |
| 30 | Pattern type per surface | ST (4–5 options, per panel), LE (4, global) | `ST:214-222`; `LE:1204-1209` | **MUST**, but per-template not per-surface | Pattern choice is brand identity. **Per-panel** pattern choice is the artifact part: ST offers `wheat` on the face only (`ST:214`) and the other three panels get four options (`ST:216`, `:220`, `:222`) for no stated reason. A template offers one pattern vocabulary; which surfaces carry it is the template's business. |
| 31 | Pattern colour and opacity | ST, LE | `ST:225-226`, `:482-484`; `LE:1210-1212`, `:1666` | **MUST** | Opacity ranges differ between the two tools — 1–50% in ST (`ST:226`) against 0–30% in LE (`LE:1211`) — with no stated reason. The freedom is real; the range is a template constraint. |
| 32 | Global font pair (header + body) | ST | `ST:382-383` | **MUST** | Typeface is brand identity. Two roles with four options each is close to the right granularity for a template. |
| 33 | Per-element font family | LE — 12 selects | `LE:1343-1429` | **ARTIFACT** | Twelve independent family pickers on one 5 × 18 cm strip. The option lists are not even consistent: `tyFlavorF` offers 8 families (`LE:1343-1351`) and `tyBadgeF` offers 4 (`LE:1369-1373`), with no rule behind the difference. This is #13's twin and gets the same judgement for the same reason. |
| 34 | Background image, fit mode and opacity | ST — per panel | `ST:230-233`, `:280-297` | **MUST** | Uploading brand artwork onto a panel is a core white-label need. Four fit modes (`cover`/`contain`/`stretch`/`auto`, `ST:281`) and an opacity are the minimum controls that make an uploaded image usable. |

#### Print scope — 3

| # | Degree of freedom | Tools | Citation | Judgement | Justification |
|---|---|---|---|---|---|
| 35 | Page size selection | ST (3), SK (4), CA (0), LE (0) | `ST:374`, `:672-677`; `SK:2894-2901` | **MUST** | Two of four tools expose it and two do not, and the two that do not are the two with the worst print behaviour (§4.4). Printing an exact-size artifact and printing a proof sheet are different jobs. |
| 36 | Panel titles in print | ST | `ST:275` — **dead**, overridden by `ST:114` | **MUST** | A proof sheet needs labels; a production print must not have them. The operator asked for the toggle; the tool captured it and never wired it. |
| 37 | Centre panels on page | ST | `ST:276` — **dead**, overridden by `ST:685` | **MUST** | Same. Registration and position on the sheet matter when the output is cut. |

#### View only — not artifact-affecting — 3

| # | Degree of freedom | Tools | Citation | Judgement | Justification |
|---|---|---|---|---|---|
| 38 | Screen scale / zoom | ST 30–150%, LE 30–150% | `ST:373`, applied `:683-684`; `LE:1461-1462` | **MUST** | A 400 mm panel does not fit on a screen. Both tools converged on the same range independently, which is a usable default. It affects the preview only — ST's print DOM is unscaled (`ST:685`) and LE's `#printRoot` is outside the transform (`LE:1476-1478`). |
| 39 | Sidebar open / closed | all three | `LE` implicit; `ST:128`, `:469-479`; `CA:72`, `:394` | **ARTIFACT** | Editor chrome. Not a property of the Artwork. |
| 40 | Sidebar tab / section | ST 6 tabs, LE collapsible sections, CA single scroll | `ST:135-140`, `:704`; `LE:1192`, `:1481`; `CA:75-141` | **ARTIFACT** | Editor chrome. Three tools, three different navigation models, none of which reaches the output. |

#### Rollup

| Category | Count | MUST | ARTIFACT |
|---|---|---|---|
| Move | 2 | 0 | 2 |
| Resize — substrate | 10 | 10 | 0 |
| Resize — element | 7 | 2 | 5 |
| Reorder | 1 | 0 | 1 |
| Hide | 7 | 5 | 2 |
| Restyle | 7 | 6 | 1 |
| Print scope | 3 | 3 | 0 |
| View only | 3 | 1 | 2 |
| **Total** | **40** | **27** | **13** |

**Every one of the 40 carries a judgement and a justification.** The shape of the
result is the finding: **every substrate dimension is a MUST and every free
positioning and per-element typography control is an ARTIFACT.** The tools were
right about what the physical object needs to be able to vary and wrong about
what its contents need to be able to vary. That is precisely the division the
frozen template-driven decision draws, and the legacy set supports it rather than
contradicting it.

### 3.4 Geometry calculations that must survive

Specified as inputs, expression, units, rounding. Where the source states no
rounding rule this section says **"none stated in source"** explicitly, per the
P-04 requirement.

#### 3.4.a The conical unwrap — and why there is only one version of it

**None of the three tools read this session contains a conical unwrap.**
Confirmed by full read: LE has no taper of any kind; CA has no taper; ST's side
panels use a **linear trapezoid clip** (§3.4.c G-4), which is a 2-D slope, not a
cone development.

The only recoverable implementation is the sticker tool's `calcTaper()`,
verified at `SK:2218-2263`. `REPORT.md` §2.2 records that label-v3 also had
"conical unwrap math" but gives no expression, no inputs and no constant, and
label-v3 is permanently deleted. **So there is nothing to diverge from: one live
version, one unrecoverable version, no comparison possible.** Marked
unresolvable per §2.4.

The specification, transcribed from `SK:2218-2263`:

| Step | Expression | Units | Rounding |
|---|---|---|---|
| Constant | `PPC = 37.795` | px per cm | Declared literal. **Note: 37.795, against ST's `PX = 3.78` px/mm = 37.8 px/cm.** |
| Guard | `if (dTop <= dBot + 0.01) dTop = dBot + 0.1` | cm | none stated in source |
| Radii | `rTop = dTop/2`, `rBot = dBot/2` | cm | none stated in source |
| Cup slant height | `L_cup = √(hCup² + (rTop − rBot)²)` | cm | none stated in source |
| Apex distance | `R_apex = rTop · L_cup / (rTop − rBot)` | cm | none stated in source — **and the value is computed and never used** |
| Label bottom height | `heightFromBottom_bot = offsetBot` | cm | none stated in source |
| Label top height | `heightFromBottom_top = offsetBot + hLbl` | cm | none stated in source |
| Radius at label bottom | `r_at_bot = rBot + (rTop − rBot)·(heightFromBottom_bot / hCup)` | cm | none stated in source |
| Radius at label top | `r_at_top = rBot + (rTop − rBot)·(heightFromBottom_top / hCup)` | cm | none stated in source |
| Slant per cm | `slantPerCm = L_cup / hCup` | ratio | none stated — **computed and never used** |
| Outer arc radius | `R1_cm = r_at_top · L_cup / (rTop − rBot)` | cm | none stated in source |
| Inner arc radius | `R2_cm = r_at_bot · L_cup / (rTop − rBot)` | cm | none stated in source |
| Label slant height | `labelSlant = R1_cm − R2_cm` | cm | none stated in source |
| Arc angle | `arcDeg = 360 · r_at_top · wrapFrac / R1_cm` | degrees | none stated in source |
| Pixel radii | `R1 = R1_cm · PPC`, `R2 = R2_cm · PPC` | px | none stated in source |
| Half-angle | `haRad = (arcDeg / 2) · π / 180` | radians | none stated in source |
| Top chord | `chordTop = 2 · R1 · sin(haRad)` | px | none stated in source |
| Bottom chord | `chordBot = 2 · R2 · sin(haRad)` | px | none stated in source |
| Bounding box width | `bbW_cm = 2 · R1_cm · sin(haRad)` | cm | none stated in source |
| Bounding box height | `bbH_cm = R1_cm − R2_cm · cos(haRad)` | cm | none stated in source |
| Readout only | `.toFixed(2)` on radii and bbox; `.toFixed(1)` on arc degrees and chord px | display | **2 dp / 1 dp — display only, not applied to the returned values** |

The returned object (`SK:2262`) carries **unrounded** floats. The `.toFixed()`
calls at `SK:2258-2260` write the info box only. **So the calculation has no
rounding rule at any point that matters** — the geometry consumers receive full
double precision, and where that becomes a physical dimension is not stated.

Two intermediates, `R_apex_cm` (`SK:2230`) and `slantPerCm` (`SK:2239`), are
computed and never referenced. Recorded, not corrected.

#### 3.4.b The px ↔ real-unit conversions — four constants, no agreement

This is the single most important geometry finding in the pass, because the
platform's print contract requires one constant from one place.

| Constant | Value | Implied px/cm | Where | How declared |
|---|---|---|---|---|
| ST screen wrapper | `PX = 3.78` px/mm | **37.80** | `ST:457`, used `ST:462` | Named `var`, truncated from 37.795 |
| ST side-panel conversions | `3.7795` px/mm | **37.795** | `ST:641`, `ST:642` | **Inline literal, twice, bypassing `PX`** |
| Sticker tool | `PPC = 37.795` px/cm | **37.795** | `SK:2219` | Function-local `var`, re-declared per call |
| LE screen ↔ print | **none exists** | 37.667 – 38.000 (five effective values) | derived, §1.1.c LE-g13 | Not declared anywhere |
| CA | **none exists** | undefined — no conversion is performed | §1.3.c | Not declared anywhere |

Four tools, four answers, one of which is "no answer". Within a single file, ST
declares a constant and then contradicts it twice. Within LE, the effective ratio
varies by 0.88% between segments of the same artifact.

Re-implementable specification of the two conversions that do exist:

| ID | Inputs | Expression | Units | Rounding |
|---|---|---|---|---|
| **C-1** | `v` in mm | `Math.round(v × 3.78)` | mm → px | **`Math.round` to integer px.** Stated. |
| **C-2** | `px` value | `(px / 3.7795).toFixed(2)` | px → mm | **`toFixed(2)` → 2 dp, returned as a string.** Stated. |

C-1 and C-2 are **not inverses**. `C-2(C-1(100 mm))` = `(378/3.7795).toFixed(2)`
= `100.01`. A 0.01 mm round-trip error, from a 0.013% constant mismatch plus an
integer rounding step.

#### 3.4.c Shape geometry that must survive

| ID | Purpose | Inputs | Expression | Units | Rounding |
|---|---|---|---|---|---|
| **G-1** | Wrap-strip segment stack | 5 fixed segment heights | `3 + 4.5 + 3 + 4.5 + 3` | cm | none stated in source — the total is never computed |
| **G-2** | Wrap-strip cruciform | 3 fixed widths | strip 5 cm, seal 3 cm, neck 1 cm | cm | none stated in source |
| **G-3** | Carton face set from pack size | pack ∈ {24, 48} | table lookup in `SIZES` | **px** | none — literal table (`CA:168-171`) |
| **G-4** | Stand side taper, left | `backH`, `frontH` (mm) | `polygon(0 0, 100% P%, 100% 100%, 0 100%)`, `P = (backH − frontH)/backH × 100` | mm → % | **none stated in source** |
| **G-5** | Stand side taper, right | same | `polygon(0 P%, 100% 0, 100% 100%, 0 100%)`, same `P` | mm → % | **none stated in source** |
| **G-6** | Stand side taper mask, left | `W`, `backH`, `frontH` | SVG `<polygon points="0,0 W,0 W,(backH−frontH)">` in `viewBox="0 0 W totalH"` | mm → viewBox units | **none stated in source** |
| **G-7** | Stand side taper mask, right | same | `<polygon points="0,0 W,0 0,(backH−frontH)">` | mm → viewBox units | **none stated in source** |
| **G-8** | Element centring from a percentage anchor | panel dim (mm), anchor (%), element size (px) | `(dim × pct / 100).toFixed(2) − (px/3.7795).toFixed(2)/2` | mm | `toFixed(2)` on both operands, **none on the result** |
| **G-9** | Stand logo vertical offset | G-8 result | `G-8 − 10` | mm | **none stated in source.** The `−10` is unexplained and has no counterpart in the QR path. |
| **G-10** | Conical unwrap | §3.4.a | §3.4.a | cm / px / deg | **none stated in source** at any consumed value |
| **G-11** | Print page size, exact mode (stand) | `faceW/H`, `shelfW/H`, `sideW`, `sideBH` (mm) | `@page X {size: {w}mm {h}mm; margin:0}` ×3 | mm | **none stated in source** — values interpolated raw |
| **G-12** | Print page size, exact mode (sticker) | `pWidth`, `pHeight` (cm), `isIsoMode` | `bw = pWidth + (isIsoMode ? 0 : 0.6)`; `@page{size: bw.toFixed(2)cm bh.toFixed(2)cm}` | cm | **`toFixed(2)` → 2 dp.** Stated. |

**G-12 is the only page-size calculation in the family with a stated rounding
rule.** Every other dimension that reaches a `@page` rule or a physical length is
interpolated at whatever precision the arithmetic produced.

#### 3.4.d Proportional derivations

Forty-one expressions across the three files size an element as a fraction of its
container: `Math.round(H × 0.06)`, `Math.round(W × 0.22)`, `bcW × 0.1` and so on.
They are inventoried per file at §1.1.c, §1.2.c and §1.3.c and are not repeated
here. Two facts about the set as a whole:

1. **Rounding is stated in 33 of 41** — those wrapped in `Math.round`. The other
   eight carry **none stated in source**: `LE:1575`, `LE:1577`, `LE:1588`,
   `LE:1618`, `CA:238`, `ST:482`, `ST:484`, `ST:683-684`.
2. **The basis unit is not stated in any of the 41.** `Math.round(H × 0.06)`
   (`ST:562`) reads as a px calculation and is emitted with a `mm` suffix
   (`ST:564`); `Math.round(H × 2.2)` (`CA:293`) is px throughout. Nothing in the
   source records which. §7 records the ST case as a defect; the general
   requirement — that a proportional size declare its basis unit — belongs to
   `TEMPLATE_MODEL.md`.

#### 3.4.e Colour maths that must survive

| ID | Purpose | Expression | Rounding |
|---|---|---|---|
| **CM-1** | Perceptual lightness test | `(R×299 + G×587 + B×114)/1000 > 145` | **none stated in source.** Threshold `145` is a literal (`CA:197`). |
| **CM-2** | Darken | per channel `max(0, min(255, c − amt))`, hex-padded to 2 | Clamp; integer by construction. `CA:191`, `LE:1483` |
| **CM-3** | Lighten | `darken(hex, −amt)` | As CM-2. `CA:193`, `LE:1484` |
| **CM-4** | Alpha compositing | `hexA(hex, a)` → `rgba(R,G,B,a)`; 3-digit hex expanded to 6 | none needed. `CA:183-187`, `ST:463` |
| **CM-5** | Pattern alpha clamp | `min(1, max(0, opacity/100))` | Clamp only. `ST:482` |

CM-1 drives a visible branch: `isLight` flips the pattern alpha between 0.09 and
0.05 (`CA:201`) and inverts the barcode's foreground and background derivation
(`CA:346-347`). Two tools implement CM-2 and CM-3 identically in different
files (`CA:188-193`, `LE:1483-1484`) — duplicated, not shared.

### 3.5 Die-line and cut-path concepts

**There is no die-line in any of the four tools.** No crop mark, no registration
mark, no fold line, no bleed, no trim box, no cut layer, no dashed guide, no
separate cut colour. What exists is five informal, undeclared surrogates.

| # | Concept | How it is expressed | Citation | What it stands in for |
|---|---|---|---|---|
| **D-1** | **Tapered cut on the stand's side panels** | A CSS `clip-path: polygon(...)` that removes the corner (`ST:624-625`), plus a **white SVG triangle** painted over the same corner at `z-index: 999` (`ST:636-638`) | `ST:624-625`, `:636-638` | The only true shape-cut in the family. It is drawn twice — once as a clip and once as an opaque white overlay — because `clip-path` does not survive print reliably. The white triangle **is** the cut line, expressed as an absence of ink. |
| **D-2** | **Panel boundary = page boundary** | Each `.panel-group` gets `page-break-after: always` and its own named `@page` sized exactly to the panel | `ST:117`, `:676-677` | The page edge is the cut edge. There is no margin, no mark and no allowance — the operator cuts to the paper edge. |
| **D-3** | **Border stroke as a cut guide** | A 1.5–2 px gold border on every LE segment and every CA face | `LE:337`, `:684`, `:735`; `CA:240`, `:289`, `:317`, `:349` | A visible line at the artifact's edge that a human can cut along. It is 0.3 mm wide in print (`LE:1007`) and prints **inside** the artifact, so cutting on it loses 0.15 mm of artwork. |
| **D-4** | **Segment adjacency as a fold line** | LE's five segments are emitted as adjacent siblings with `border-radius` only on the outer corners (`LE:338`, `:737`) and `border-top: none` on the front (`LE:736`) | `LE:336-341`, `:730-741` | The joins between segments are folds, and the only thing marking them is where one border ends and the next begins. The 180° back rotation (`LE:340`) is meaningful **only** if the strip folds — so the fold is a hard requirement encoded nowhere. |
| **D-5** | **Safety buffer** | `buffer = isIsoMode ? 0 : 0.6` cm added to both page dimensions in exact mode | `SK:2899-2901` | The family's **only** numeric safety allowance. 0.6 cm, applied to the page, not to the artwork. It is not a bleed — the artwork does not extend into it — it is clearance so the printer does not clip the artifact. |

**Numeric inventory of every buffer, bleed and trim value in the family:**

| Value | What | Where | Kind |
|---|---|---|---|
| **0.6 cm** | Added to page width and height in the sticker tool's exact-size mode | `SK:2899-2900` | Safety clearance |
| **0 cm** | The same buffer in ISO mode | `SK:2899` | Explicitly none |
| **8 mm** | `@page margin` on CA's A3 landscape | `CA:68` | Printer-safe inset. The only non-zero page margin in the family. |
| **1 cm** | `padding-top` on LE's print strip | `LE:1001` | Top offset inside a zero-margin page |
| **0** | Every other `@page margin`: `LE:972`, `ST:672`, `:673`, `:676` ×3, `SK:2894-2897`, `SK:2901` | — | Zero-margin |

**That is the complete list. Five numbers.** No bleed value exists anywhere —
not 3 mm, not 1/8", not any value. No trim box, no crop mark and no registration
mark exists in any of the four tools.

For a platform whose print parity requirement is ±0.2 mm on a physical printout,
the legacy set supplies **no precedent at all** for bleed or trim. §4.5 states the
consequence.

---
## PART 4 — PRINT REQUIREMENTS

### 4.1 Every `@page` rule in the three files

Nine `@page` rules across the three tools. The sticker tool's four
(`SK:2894-2901`) are included for completeness because they were verified in §2.1.

| # | Tool | Page size | Margin | Static or dynamic | Named | Citation |
|---|---|---|---|---|---|---|
| 1 | **LE** | `A4 portrait` | **`0`** | Static | no | `LE:970-973` |
| 2 | **ST** | `A2 landscape` | **`0`** | Dynamic — injected on `render()` | no | `ST:672` |
| 3 | **ST** | `A3 landscape` | **`0`** | Dynamic | no | `ST:673` |
| 4 | **ST** | `{faceW}mm {faceH}mm` | **`0`** | Dynamic | **`face`** | `ST:676` |
| 5 | **ST** | `{shelfW}mm {shelfH}mm` | **`0`** | Dynamic | **`shelf`** | `ST:676` |
| 6 | **ST** | `{sideW}mm {sideBH}mm` | **`0`** | Dynamic | **`side`** | `ST:676` |
| 7 | **CA** | `A3 landscape` | **`8mm`** | Static | no | `CA:68` |
| 8–11 | SK | `A4 portrait` / `letter portrait` / `A3 portrait` / `{bw}cm {bh}cm` | **`0`** ×4 | Dynamic | no | `SK:2894-2897`, `:2901` |

**Zero-margin rules: ten of eleven.** Every rule in LE, ST and the sticker tool
is `margin: 0`. **`CA:68`'s `margin: 8mm` is the sole exception in the entire
legacy design family**, and nothing in CA explains it, references it or
compensates for it.

Rules 4–6 are the family's high-water mark: three differently-sized named pages
in one document, each matching its panel exactly, selected per element by
`.pg-face{page:face}` / `.pg-shelf{page:shelf}` / `.pg-side{page:side}`
(`ST:677`). That is the CSS mechanism for an exact-size multi-artifact PrintJob
and only one of the four tools uses it.

### 4.2 Every print mechanism and trigger

| Tool | Trigger | Citation | Re-renders first? | Reaches |
|---|---|---|---|---|
| LE | Sidebar `🖨 Print Label` → `doPrint()` | `LE:1434` → `LE:1706` | **yes** — `upd()` then `window.print()` | Rule 1 |
| LE | Preset bar `🖨 طباعة` | `LE:2174` | **no** — bare `window.print()` | Rule 1 |
| ST | Sidebar `🖨 Print` | `ST:426` | no — but `render()` rewrites the `@page` rules on every input | Rules 2–6 |
| ST | Preset bar `🖨` | `ST:451` | no | Rules 2–6 |
| CA | Sidebar `🖨 طباعة` | `CA:143` | no | Rule 7 |
| CA | Preset bar `🖨 طباعة` | `CA:162` | no | Rule 7 |

**All six triggers are a bare `window.print()`.** There is no intermediate
artifact, no serialisation, no headless render and no file. The browser's print
subsystem is the renderer, and the print dialog is where the PrintJob is
composed, not previewed.

ST's dynamic rules are written into a `<style id="dynPrint">` element that
`render()` creates on first call and rewrites on every subsequent call
(`ST:667-668`). The rule in force at print time is therefore whatever the last
`render()` produced. Every sidebar input is bound to `render()` (`ST:769`), so
they stay in step in practice — but the coupling is a convention, not an
invariant, and neither print trigger asserts it.

### 4.3 Every dimension by unit, and where conversion happens

#### LE — px on screen, cm/mm in print, no conversion between them

| Where | Unit | Values | Citation |
|---|---|---|---|
| Screen segment geometry | **px** | 189×113, 38×170, 113×113, 189×113 | `LE:334-335`, `:654-655`, `:680-681`, `:731-732` |
| Screen typography | **px** | ~40 values, 2.3 px – 32 px | `LE:413-902` |
| Print segment geometry | **cm** | 5×3, 1×4.5, 3×3, 5×3; strip 5 cm; arch 1.6 cm | `LE:999`, `:1005-1006`, `:1109-1110`, `:1115-1116`, `:1121-1122`, `:1128` |
| Print strip offset | **cm** | `padding-top: 1cm` | `LE:1001` |
| Print borders and padding | **mm** | 0.3, 0.25, 0.15, 1.5, 1.3, 1, 0.8, 0.5, 0.4 | `LE:1007-1124` |
| Print typography | **mm** | 13 values — see below | `LE:1033-1105` |
| Operator-set sizes | **px** | every slider and number input | `LE:1221-1428` |

**Conversion location: nowhere.** The two geometries are independent literals.
The implied ratio spans 37.667–38.000 px/cm (§1.1.c LE-g13).

**LE's thirteen print font sizes, in mm:**

| Size | Selector | Citation | Approx. pt |
|---|---|---|---|
| **0.6 mm** | `.nut-table th, .nut-table td` | `LE:1048` | **1.7 pt** |
| **0.62 mm** | `.bk-txt` — back-panel body | `LE:1038` | **1.8 pt** |
| **0.65 mm** | `.nut-table th` | `LE:1053` | **1.8 pt** |
| **0.7 mm** | `.validity-sec p` | `LE:1043` | **2.0 pt** |
| **0.75 mm** | `.bk-hdr span` | `LE:1034` | **2.1 pt** |
| **0.85 mm** | `.wt-label` | `LE:1101` | 2.4 pt |
| **0.9 mm** | `.wt-label`, `.bc-num` | `LE:1069`, `:1105` | 2.6 pt |
| **1 mm** | `.b-sub`, `.bc-num` | `LE:1061`, `:1073` | 2.8 pt |
| **1.6 mm** | `.wt-val` | `LE:1065`, `:1097` | 4.5 pt |
| **1.8 mm** | `.b-mono` | `LE:1057` | 5.1 pt |

The regulatory content of the back panel — ingredients, storage, validity and
the entire nutrition table — prints between **1.7 pt and 2.1 pt**. That is below
the resolution of any office printer and below every food-labelling legibility
minimum. §7 records it.

#### ST — mm for substrate, px for content, both in the print DOM

| Where | Unit | Citation |
|---|---|---|
| Panel dimensions, operator input | **mm** | `ST:355-369` |
| Print wrapper | **mm** | `ST:685` — `width:{w}mm; height:{h}mm` |
| `@page` sizes, exact mode | **mm** | `ST:676` |
| `@page` heights, A2/A3 mode | **mm** | `ST:672-673` — 420 mm, 297 mm |
| Panel interiors — background, gaps, rules, gradients | **mm** | `ST:547`, `:551-552`, `:557`, `:563-564`, `:574`, `:577`, `:580-582`, `:634` |
| Element positions on side panels | **mm** | `ST:649`, `:658` |
| **All typography** | **px** | `ST:554-556`, `:558-560`, `:582-583`, `:590-593`, `:601-602`, `:651-652`, `:660` |
| Logo circle, QR image, badge icons | **px** | `ST:554`, `:601`, `:609`, `:650` |
| Screen wrapper | **px** | `ST:683-684` |

**Conversion locations: two, with two different constants.**

| Conversion | Where | Constant | Rounding |
|---|---|---|---|
| mm → px, screen wrapper only | `mm()` at `ST:462`, called `ST:682` | `PX = 3.78` (`ST:457`) | `Math.round` |
| px → mm, side-panel logo and QR only | `ST:641-642` | `3.7795` inline | `toFixed(2)` |

**The print DOM contains unconverted px lengths.** `sw()` (`ST:685`) sizes the
print wrapper in mm and then fills it with the same `inner` string the screen
uses, which carries px font sizes and a px logo circle. Enlarging the mirror face
from 400 mm to 500 mm leaves the brand text at 36 px. The dual-DOM separates the
*containers* correctly and shares the *contents* verbatim.

#### CA — px only, throughout, with mm as decoration

| Where | Unit | Citation |
|---|---|---|
| Face dimensions | **px** | `CA:169-170` |
| Every interior dimension, position, padding, font size | **px** | `CA:236-375` |
| `@page` size | A3 landscape (named size) | `CA:68` |
| `@page` margin | **mm** — the only mm in the executable path | `CA:68` |
| Carton dimensions | **mm**, inside a display-label string | `CA:169-170` |

**Conversion location: none. There is no px↔mm conversion anywhere in CA.**
The mm figures at `CA:169-170` are substrings of a UI label rendered to
`#sizeLabel` (`CA:379`) and are never parsed.

### 4.4 What each tool's print approach could and could not deliver

The platform's requirement: **a deterministically generated PrintArtifact,
identical across all platforms, with the browser print dialog as preview only.**
Assessed against that, per tool. No replacement mechanism is named — that is
withheld until Gate 3.

#### LE

**Could deliver:** the intent. LE is the only tool of the three that expresses its
entire printed geometry in real units and nothing else — 5 cm, 3 cm, 4.5 cm,
0.3 mm, 0.6 mm. Every printed length is absolute. If the browser honours the
declared units, two machines print the same physical object. It also isolates
the print rendering into a dedicated subtree, `#printRoot` (`LE:965-967`,
`:993-996`, `:1476-1478`), hidden on screen and revealed only in print.

**Could not deliver:**

1. **Determinism.** The artifact is produced by the browser at print time from
   live DOM and live CSS. `window.print()` (`LE:1706`) hands off to the platform
   print subsystem; nothing is serialised, nothing is captured and nothing is
   comparable between two runs.
2. **Platform identity.** Three of its six fonts are fetched from a CDN at
   runtime (`LE:9`). A machine with no network, or a machine where the CDN is
   blocked, prints in a fallback face at different metrics. The 5 cm width holds;
   the text inside it reflows.
3. **Preview-only status.** The dialog is not a preview. Background-graphics
   printing is off by default in every major browser, and LE's own UI concedes
   this: `Tip: Enable "Background graphics" in print dialog` (`LE:1436`). Every
   colour, pattern, gradient and the gold border are backgrounds. **With the
   default dialog setting the artifact prints as black text on white paper.** The
   operator is instructed to change a dialog setting to get the intended output,
   which is the exact inversion of "dialog as preview only".
4. **Legibility at the declared size.** §4.3 — 1.7 pt to 2.1 pt regulatory text.
   The geometry is deterministic and the content in it is not printable.
5. **Screen–print agreement.** §1.1.c LE-g13 — the preview is off by up to 0.88%
   from the print, so the preview cannot be used to verify the artifact.
6. **One page size.** A4 portrait only (`LE:972`). An 18 cm strip fits, but there
   is no exact-size option and no multi-up.

#### ST

**Could deliver:** the most of the three, and by a wide margin.

1. **Exact-size output.** Rules 4–6 (`ST:676`) size each page to its panel in mm
   with zero margin. That is a true exact-size PrintArtifact per panel.
2. **A real dual-DOM.** `sw()` (`ST:680-687`) emits a px-scaled screen node and a
   raw-mm print node from one source, with `.sw-o`/`.sw-p` visibility flipped by
   media (`ST:110`, `:118-119`). The screen preview cannot contaminate the print
   geometry.
3. **Deterministic pagination.** `page-break-after: always` plus
   `page-break-inside: avoid` on every `.panel-group` (`ST:117`) fixes one panel
   per page.
4. **Print scope control.** `setPanel()` (`ST:703`) determines which panels exist
   in the document and therefore which pages the PrintJob contains.

**Could not deliver:**

1. **Determinism.** Same root cause as LE — `window.print()` (`ST:426`, `:451`)
   with no serialised artifact.
2. **Platform identity.** Six CDN fonts (`ST:7`).
3. **Internal dimensional consistency.** The print DOM mixes mm containers with
   px contents (§4.3), so the artifact does not scale as one object. Two
   different px-per-mm constants are in use (§3.4.b).
4. **Named-page support is not universal.** `@page face`, `@page shelf`,
   `@page side` (`ST:676`) is a CSS Paged Media feature with materially different
   support across browser engines. The mechanism that makes ST's exact-size mode
   work is the least portable thing in the file. Where it is unsupported, all
   three pages fall back to the default page size and the exact-size guarantee
   silently evaporates — with no error and no fallback path.
5. **Background graphics.** Same default-off problem; ST does not even carry LE's
   warning.
6. **No safety allowance.** Zero margin on a page sized exactly to the panel
   means any printer's unprintable border clips the artifact edge. The sticker
   tool solved this with a 0.6 cm buffer (`SK:2899`); ST has no equivalent.

#### CA

**Could deliver:** an approximate proof sheet. Colour, layout, content and the
four-face arrangement are all correct in relative terms. As a visual check that
the artwork is right, it works.

**Could not deliver:** essentially everything the requirement asks for.

1. **Any defined physical size.** This is the disqualifying fact. The rendered
   faces are px (`CA:169-170`) with **no conversion to any real unit anywhere in
   the file**. The printed size is whatever the browser's fit-to-page produces
   for a ~920 × 1050 px stack on A3 landscape minus 8 mm, which depends on the
   engine, the dialog's scale setting and the paper. **The same file printed on
   two machines produces two different physical sizes, and the file contains no
   value that would let anyone detect it.**
2. **Correspondence to the object it describes.** The 24-pack is labelled
   `300×200×150 mm` (`CA:169`) and drawn 700 × 360 px. At any plausible scale
   those disagree, and the aspect ratios disagree too (§1.3.b).
3. **Any dual-DOM.** CA prints the screen DOM. `render()` writes
   `#cartonWrap.innerHTML` (`CA:380`) and the print CSS only hides chrome
   (`CA:68`).
4. **Pagination control.** No `page-break` declaration of any kind. Where A3
   breaks the four-face stack is undefined.
5. **Page-size choice.** A3 landscape, fixed (`CA:68`).
6. **Margin consistency.** `8mm` against the family's universal `0` — so even the
   imageable area differs from every sibling tool.
7. **Platform identity.** Five CDN fonts (`CA:7`).

**Ranking, on this requirement only:** ST > LE > CA. ST has the mechanism and the
units; LE has the units without the mechanism; CA has neither.

### 4.5 Cross-cutting print findings

1. **No tool produces an artifact.** All six triggers are `window.print()`
   (`LE:1706`, `:2174`; `ST:426`, `:451`; `CA:143`, `:162`). Nothing is
   serialised to a file, a buffer or a canvas. The sticker tool is the only
   member of the family that produces a durable output object at all, via
   `exportPNG` (`AUDIT_STICKER.md` §1.1 item 4) — and that is a raster, at screen
   scale, through a CDN library.
2. **Every tool depends on a runtime CDN for its fonts.** `LE:9`, `ST:7`,
   `CA:7`. All three request the same Google Fonts host; the family lists differ.
   With the CDN unreachable, every text metric in every artifact changes.
3. **Background graphics are the family's silent single point of failure.** All
   three set `-webkit-print-color-adjust: exact !important` (`LE:976-977`,
   `ST:112`, `CA:68`), which is a request the print dialog can and by default
   does override. Only LE tells the operator (`LE:1436`).
4. **Ten of eleven `@page` rules are zero-margin**, and no tool other than the
   sticker tool provides any clearance. The one non-zero margin (`CA:68`, 8 mm)
   is on the tool that has no defined size to protect.
5. **The entire family's bleed, trim and safety vocabulary is five numbers**
   (§3.5): 0.6 cm, 0 cm, 8 mm, 1 cm, 0. There is no bleed value, no trim box and
   no crop mark anywhere. Against a ±0.2 mm print-parity requirement the legacy
   set supplies **no precedent** — every bleed, trim and registration rule in
   `PRINT_CONTRACT.md` will be owner-authored with no extraction backing. This
   is the print-side counterpart to CF-45's finding about money rounding, and it
   is logged as an untriaged finding in §C.4.

---
## PART 5 — CONFIGURABLE vs HARDCODED

One table, all three files, with a file column. Ownership uses four categories:
**brand config** (the Tenant's identity), **business policy** (how the Tenant
operates), **product catalog** (what the Tenant sells), **system constant** (the
platform's, not the Tenant's).

"Wizard input" names the input type a configuration wizard would need. **`—
not exposed`** means the value is hardcoded in the source today with no control.

### 5.1 Brand identity

| Value | File:line | What it represents | Owner in B2S | Wizard input |
|---|---|---|---|---|
| `Balance Bites` | `LE:1183`, `:1274`, `:1289`, `:1947`, `:1948`; `CA:93`, `:220` | Brand name | brand config | text |
| `BALANCE` / `BITES` | `ST:149-150` | Brand name, **two-line form** | brand config | text ×2 — the two-line split is itself a brand property |
| `BALANCE BITES` | `LE:1227`, `:1943` | Brand name, arch sub-text form | brand config | text |
| `BB` | `LE:1220`, `:1273`, `:1288`, `:1943`, `:1947`, `:1948`; `ST:151`; `CA:89`, `:220` | Monogram | brand config | text, max ~3 chars |
| `balancebites.com` | `ST:155`; `CA:97`, `:223`; `LE:1308`, `:1956` | Website | brand config | text (URL) |
| `✦  BALANCEBITES.COM  ✦` | `LE:1255`, `:1946` | Footer — **the URL again, uppercased, with ornaments baked in** | brand config | text |
| `@balancebites.eg` | `ST:160` | Instagram handle | brand config | text |
| `+20 123 456 7890` | `ST:161` | WhatsApp — placeholder, §0.3 | brand config | text (phone) |
| `WHOLE FOOD SNACKS · NATURALLY POWERFUL` | `ST:152` | Tagline EN | brand config | text |
| `وجبات خفيفة طبيعية · قوية بالطبيعة` | `ST:153` | Tagline AR | brand config | text |
| `Try Our Natural Crackers!` | `ST:154` | Call to action | brand config | text |
| `Natural · Wholesome · Delicious` | `CA:96`, `:222` | Slogan | brand config | text |
| `SEALED · FRESHNESS` | `LE:1281`, `:1947` | Neck vertical text | brand config | text |
| `P R E M I U M` | `LE:1249`, `:1944` | Premium bar — **letter-spacing faked with literal spaces** | brand config | text |
| `✦` | `LE:1545-1546`; `CA:205` | Corner ornament glyph | brand config | select from a glyph set — **not exposed** |
| `CDS 140 Counter Display Stand` | `ST:434` | Fixture model designation | product catalog | text — **not exposed** |
| `Balance Bites — Label Editor` | `LE:7` | Document title | system constant | derived |
| `Balance Bites — Counter Display Stand Editor` | `ST:6` | Document title | system constant | derived |
| `Balance Bites — Carton Template` | `CA:6` | Document title | system constant | derived |
| `✦ Carton Editor — Balance Bites` | `CA:74` | Sidebar heading | system constant | derived |
| `✦ Editor — Balance Bites` | `ST:133` | Sidebar heading | system constant | derived |
| `Seal Sticker Label Editor` | `LE:1184` | App subtitle | system constant | derived |

### 5.2 Colours

| Value | File:line | What it represents | Owner in B2S | Wizard input |
|---|---|---|---|---|
| `#c9a84c` | `LE:1196`, `:1200`, `:1202`, `:1941`; `ST` chrome throughout; `CA:81`, `:173`, `:176` | **Gold — the one colour every tool agrees on** | brand config | colour picker |
| `#1a1208` | `LE:1194`, `:1941` | LE background | brand config | colour picker |
| `#12100a` | `CA:80`, `:173`, `:176` | CA background, `dark` preset | brand config | colour picker |
| `#3a8a7a` | `LE:1198`, `:1941`, `:1748`; `CA:84`, `:173`, `:176` | Accent — teal | brand config | colour picker |
| `#e8e0cc` | `CA:85`, `:173`, `:176` | CA text | brand config | colour picker |
| `#1a1a1a` | `ST:204-209`, `:266` | ST panel backgrounds ×4 and logo text | brand config | colour picker ×5 |
| `#ffffff` / `#cccccc` | `ST:225`, `:261-262`, `:265` | ST pattern, main text, sub text, logo circle | brand config | colour picker ×4 |
| `#7a5c1e` / `#f5d26a` / `#a0522d` / `#fdf5e6` | `CA:174` | `brown` — Brown Kraft palette | brand config | named palette |
| `#f5f0e8` / `#a07820` / `#2d6a4f` / `#1a1208` | `CA:175` | `white` — White Clean palette | brand config | named palette |
| `#2e7d32` Za'atar | `ST:166` | **Flavour colour** | product catalog | colour on the product record |
| `#c62828` Paprika | `ST:167` | Flavour colour | product catalog | colour on the product record |
| `#f9a825` Rosemary | `ST:170` | Flavour colour | product catalog | colour on the product record |
| `#1565c0` B.Pepper | `ST:171` | Flavour colour | product catalog | colour on the product record |
| `#bf360c` Cinnamon | `ST:174` | Flavour colour | product catalog | colour on the product record |
| `#286030` / `#c04820` / `#5030a0` / `#3a8a7a` / `#2e8040` / `#a07010` | `LE:1710`, `:1723`, `:1736`, `:1748`, `:1749`, `:1750` | **The same six flavours' accent colours — different values** | product catalog | see §5.6 |
| `145` | `CA:197` | Luminance threshold for `isLight` | **system constant** | — not exposed |
| `299` / `587` / `114` | `CA:197` | Luma coefficients | **system constant** | — not exposed |
| `0.09` / `0.05` | `CA:201` | Pattern alpha, light vs dark background | system constant | — not exposed |
| `0.4`, `0.45`, `0.5`, `0.55`, `0.6`, `0.65`, `0.7`, `0.8`, `0.85`, `0.88`, `0.9`, `0.04`, `0.1`, `0.15`, `0.2`, `0.22`, `0.3`, `0.35`, `0.38` | `CA:240-371` passim | ~30 alpha literals in `hexA()` calls | system constant | — not exposed |
| `18` / `28` / `52` / `10` / `20` / `25` / `160` / `180` | `LE:1523`, `:1528`, `:1605`; `CA:191`, `:346-347` | Darken/lighten amounts | system constant | — not exposed |

**The gold `#c9a84c` appears in all three files as an independent literal.**
Changing the brand's gold requires editing three files. That is the clearest
single illustration of the one-brand assumption; §5.7.

### 5.3 Fonts

| Value | File:line | What it represents | Owner in B2S | Wizard input |
|---|---|---|---|---|
| Google Fonts CDN URL | `LE:9`; `ST:7`; `CA:7` | **Runtime font source** | system constant | — not exposed. §7. |
| `Playfair Display` | `LE:9`, `:414`, `:709`, `:770`; `ST:7`, `:382`; `CA:7`, `:246` | Display serif | brand config | font select |
| `DM Sans` | `LE:9`, `:20`; `ST:7`, `:383`; `CA:7`, `:10` | Body sans — **the default in all three** | brand config | font select |
| `Syne` | `LE:9`, `:36`; `ST:7`, `:382`; `CA:7`, `:15` | Label/eyebrow sans | brand config | font select |
| `Caveat` | `LE:9`, `:809`; `ST:7`, `:383`; `CA:7`, `:256` | Script — **the flavour-name face in LE and CA** | brand config | font select |
| `Amiri` | `LE:9`, `:190`, `:469`, `:482` | **Arabic serif** | brand config | font select, Arabic |
| `Tajawal` | `ST:7`, `:383`, `:559`; `CA:7`, `:366` | **Arabic sans** | brand config | font select, Arabic |
| `Inter` | `LE:9`, `:1348` | Sans, LE only | brand config | font select |
| `Montserrat` | `ST:7`, `:382` | Sans, ST only | brand config | font select |
| `Arial`, `Georgia` | `LE:1350-1351`, `:1359` | System fallbacks offered as choices | system constant | font select |

**The three files load three different font sets from the same CDN.** LE loads
7 families (`LE:9`), ST loads 6 (`ST:7`), CA loads 5 (`CA:7`). Only four —
Playfair Display, DM Sans, Syne, Caveat — are common to all three. **Arabic is
served by two different faces**: LE uses `Amiri` (serif), ST and CA use `Tajawal`
(sans). The same Arabic ingredient text renders in a different typeface depending
on which tool printed it.

### 5.4 Units, currency and numbering

| Value | File:line | What it represents | Owner in B2S | Wizard input |
|---|---|---|---|---|
| `EGP 45` | `ST:196` | **Price — currency code and amount in one string** | business policy | money input + currency from brand config |
| `40G` | `ST:195`; `CA:90`, `:223` | Per-unit net weight | product catalog | number + unit select |
| `30g` | `LE:1254`, `:1946` | Front net weight — **lower-case `g`, same quantity class** | product catalog | number + unit select |
| `150G` | `LE:1307`, `:1956` | Back approx weight | product catalog | number + unit select |
| `960G` / `1920G` | `CA:169-170` | Carton total weight — **derived from pack × unit weight but stored as a literal** | product catalog | derived |
| `mm` | `ST:355-369` sliders; `CA:169-170` label; `CA:68` margin | Length unit for substrate | system constant | — |
| `cm` | `LE:999-1128`; `SK:736-737`, `:979`, `:1019-1020`, `:2220-2223` | Length unit for substrate | system constant | — |
| `px` | everywhere in CA; all typography in all three | Length unit for content | system constant | — |
| `%` | `ST:243-257`, `:373`, `:282-297`; `LE:1211`, `:1461` | Proportional unit | system constant | — |
| `1615012` | `LE:1291`, `:1948`; `CA:110`, `:224` | **Barcode number — identical literal in two files** | product catalog | text, validated |
| `2025/06/01` | `LE:1290`, `:1948`; `CA:107`, `:225` | Production date — `YYYY/MM/DD` | business policy | date |
| `2025/09/01` | `CA:108`, `:225` | Expiry date | business policy | date, or derived from shelf life |
| `e.g. 2025/06/01` | `LE:1261` | Date format hint, placeholder | system constant | — |
| `___________` | `LE:1619` | Blank-date fill, 11 underscores | system constant | — not exposed |
| `ar-EG` | `CA:427`, `:434`, `:438`; `LE:2081`, `:2120` | **Date/time locale** | brand config (locale) | locale select |
| `en-GB` | `ST:710`, `:765` | **Date locale — different tool, different locale** | brand config (locale) | locale select |
| *(no locale)* | `ST:711` | `toLocaleTimeString()` — machine locale | brand config (locale) | locale select |
| `24` / `48` | `CA:149-150`, `:168-170` | Pack size | product catalog | select |
| `300×200×150 mm` / `400×220×200 mm` | `CA:169-170` | Carton dimensions, **inside a display string** | product catalog | number ×3 + unit |
| `8` | `LE:1978`; `ST:706`; `CA:396` | `_PBMAX` — preset slot count | system constant | — not exposed |
| `2400` ms | `LE:1987`; `ST:709`; `CA:399` | Toast duration | system constant | — |
| `100` / `120` ms | `CA:454`; `LE:2160`; `ST:770` | Preset-bar init delay — **three files, two values** | system constant | — |

**Three locales across three tools for the same operation.** CA stamps preset
dates `ar-EG`, LE stamps them `ar-EG`, ST stamps them `en-GB`, and ST's
quick-save timestamp uses no locale at all (`ST:711`), so it follows the
machine. A preset list is therefore not sortable or comparable across tools.

**Currency appears exactly once in the three files** — `EGP 45` (`ST:196`) — and
it is a free-text string with the code and the amount fused, on a field that no
renderer reads (§1.2.f). There is no currency formatting, no separator, no
decimal policy and no symbol anywhere in the design family.

### 5.5 Product, flavour and badge lists

| Value | File:line | What it represents | Owner in B2S | Wizard input |
|---|---|---|---|---|
| `Za'atar`, `Paprika`, `Pepper`, `Cinnamon`, `Herb`, `Sesame` | `LE:1443-1448`, keys at `:1709-1750` | **Flavour list — 6** | product catalog | repeatable list |
| `Za'atar`, `Paprika`, `Rosemary`, `B.Pepper`, `Cinnamon` | `ST:166-174` | **Flavour list — 5** | product catalog | repeatable list |
| `Za'atar` | `CA:94`, `:221` | Flavour — **1, free text, no list** | product catalog | text or select |
| `Za'atar Crackers`, `Paprika Crackers`, `Rosemary & Basil`, `Black Pepper & Sea Salt`, `Cinnamon Roasted Peanuts` | `ST:182-190` | **Product list — 5** | product catalog | repeatable list |
| `كراكرز زعتر`, `كراكرز بابريكا`, `كراكرز روزماري و ريحان`, `كراكرز فلفل اسود و ملح بحر`, `فول سوداني بالقرفة` | `ST:183-191` | Product list AR — 5 | product catalog | repeatable list |
| `Crackers` | `CA:95`, `:221`; `LE:1710`, `:1723` | Product type | product catalog | select |
| `Peanut` | `LE:1248`, `:1748`, `:1944` | Sub-type | product catalog | text |
| `& Sea Salt`, `& Honey` | `LE:1736`, `:1750` | Sub-type — **a fragment, not a type** | product catalog | text |
| `100% Natural`, `Whole Wheat`, `No Preservatives` | `CA:101-103` | Badge list — 3 | business policy | multi-select from a claim library |
| `100% Natural`, `No Preservations`, `Whole Wheat`, `No Added Sugar` | `LE:1250-1253`, `:1944-1945` | Badge list — 4. **`No Preservations` is a misspelling of CA's `No Preservatives`** | business policy | multi-select |
| `100% Natural`, `Whole Wheat`, `For Diet`, `For Diabetes`, `Custom Badge`, `Custom Badge 2` | `ST:315-340` | Badge list — 6 | business policy | multi-select |
| `🌿`, `🌾`, `🥗`, `💊`, `⭐`, `✨` | `ST:316-341` | Badge icons | business policy | emoji or upload |
| `🟢`, `🔴`, `⚫`, `🍂`, `🌿`, `🍯` | `LE:1443-1448`, `:1710-1750` | Flavour emoji | product catalog | emoji or upload |
| `dark`, `brown`, `white`, `custom` | `CA:77`, `:172-177` | Carton style names | brand config | named palette list |
| `none`, `diag`, `cross`, `dots` | `LE:1204-1209` | Pattern vocabulary — 4 | system constant | select |
| `none`, `diag`, `dots`, `cross`, `wheat` | `ST:214` (face) / `ST:216`, `:220`, `:222` (others) | Pattern vocabulary — **5 on one panel, 4 on the other three** | system constant | select |
| `cover`, `contain`, `100% 100%`, `auto` | `ST:281`, `:286`, `:291`, `:296` | Image fit modes | system constant | select |
| `actual`, `a3`, `a2` | `ST:374` | Print layout options | system constant | select |

**Three tools, three different flavour lists, three different badge lists, and
the two that overlap disagree on spelling.** `Rosemary` is a flavour in ST and
`Herb` is the nearest equivalent in LE; `Sesame` exists only in LE;
`Rosemary & Basil` is a *product* in ST and `Rosemary` is a *colour* in the same
file (`ST:170`).

### 5.6 Document-template content — the bilingual regulatory blocks

These are the highest-value hardcoded values in the three files: they are
regulatory text a Tenant must be able to own, and they are seeded per flavour.

| Value | File:line | What it represents | Owner in B2S | Wizard input |
|---|---|---|---|---|
| `Whole wheat flour, peanuts, cinnamon, sunflower oil, salt, natural flavors. Contains: Wheat, Peanuts.` | `LE:1293`, `:1949` | Ingredients EN, default | product catalog | long text, per product |
| `دقيق القمح الكامل، فول سوداني، قرفة، زيت عباد الشمس، ملح، نكهات طبيعية. يحتوي على: قمح، فول سوداني.` | `LE:1296`, `:1950` | Ingredients AR, default | product catalog | long text, per product |
| `Whole wheat flour, olive oil, sea salt, za'atar. Contains: Wheat.` | `CA:121` | Ingredients EN — **a different product's, in a different tool** | product catalog | long text |
| `دقيق قمح كامل، زيت زيتون، ملح بحر، زعتر. يحتوي على: قمح.` | `CA:122` | Ingredients AR | product catalog | long text |
| `Whole wheat flour, olive oil, thyme, salt, baking powder. Contains: Wheat.` | `LE:1711` | Ingredients EN — Zaatar preset | product catalog | long text |
| `دقيق قمح كامل، زيت زيتون، زعتر، ملح، بيكنج بودر. يحتوي على: قمح.` | `LE:1712` | Ingredients AR — Zaatar | product catalog | long text |
| `Whole wheat flour, olive oil, paprika, salt, garlic powder, baking powder. Contains: Wheat.` | `LE:1724` | Ingredients EN — Paprika | product catalog | long text |
| `دقيق قمح كامل، زيت زيتون، بابريكا، ملح، بودرة ثوم، بيكنج بودر. يحتوي على: قمح.` | `LE:1725` | Ingredients AR — Paprika | product catalog | long text |
| `Whole wheat flour, olive oil, black pepper, sea salt, baking powder. Contains: Wheat.` | `LE:1737` | Ingredients EN — Pepper | product catalog | long text |
| `دقيق قمح كامل، زيت زيتون، فلفل أسود، ملح بحري، بيكنج بودر. يحتوي على: قمح.` | `LE:1738` | Ingredients AR — Pepper | product catalog | long text |
| `Store in a dry, well-ventilated place away from direct sunlight.` | `LE:1299`, `:1951` | Storage EN, default | business policy | long text, brand-level |
| `يخزن في مكان جاف جيد التهوية بعيدا عن أشعة الشمس المباشرة.` | `LE:1302`, `:1952` | Storage AR, default | business policy | long text |
| `Store in a cool, dry place away from direct sunlight.` | `LE:1713`, `:1726`, `:1739` | Storage EN — **a second, different wording in the same file** | business policy | long text |
| `يحفظ في مكان جاف وبارد بعيدًا عن أشعة الشمس المباشرة.` | `LE:1714`, `:1727`, `:1740` | Storage AR — second wording | business policy | long text |
| `Valid for 3 months from date of production` | `LE:1304`, `:1953` | Validity EN, default — **no full stop** | business policy | derived from a shelf-life number |
| `صالح لمدة ٣ شهور من تاريخ الانتاج` | `LE:1306`, `:1954` | Validity AR — **Arabic-Indic `٣`** | business policy | derived |
| `Valid for 3 months from date of production.` | `LE:1715`, `:1728`, `:1741` | Validity EN — **same sentence with a full stop** | business policy | derived |
| `صالح لمدة 3 أشهر من تاريخ الإنتاج.` | `LE:1716`, `:1729`, `:1742` | Validity AR — **Western `3`, different word for months, hamza restored** | business policy | derived |
| `Serving per size 100g` | `LE:1328`, `:1957` | Serving size EN — **ungrammatical** | product catalog | text |
| `حجم الحصة ١٠٠ جم` | `LE:1331`, `:1957` | Serving size AR — Arabic-Indic `١٠٠` | product catalog | text |
| `Serving size 40g\nServings per pack: 1` | `LE:1718`, `:1731`, `:1744` | Serving size EN — **grammatical, two lines, different quantity** | product catalog | text |
| `حجم الحصة 40 جم\nعدد الحصص في العبوة: 1` | `LE:1719`, `:1732`, `:1745` | Serving size AR — Western numerals | product catalog | text |
| Nutrition rows, default | `LE:1333-1336`, `:1960` | 4 rows, Arabic-Indic numerals, per 100 g | product catalog | structured table |
| Nutrition rows, Zaatar | `LE:1720` | **8 rows, Western numerals, per 40 g** | product catalog | structured table |
| Nutrition rows, Paprika | `LE:1733` | 8 rows, Sodium `165 mg` | product catalog | structured table |
| Nutrition rows, Pepper | `LE:1746` | 8 rows, Sodium `170 mg` | product catalog | structured table |

**Every regulatory sentence in LE exists in two incompatible versions**, one in
the default/`rst()` set and one in the flavour-preset set, differing in wording,
punctuation, numeral system and serving basis. Which one prints depends on
whether the operator clicked a flavour button. §6.4 enumerates the pairs.

### 5.7 Every place a tool assumes exactly one business or one brand exists

Fifteen structural single-tenant assumptions. This is the list a multi-tenant
product has to break.

| # | Assumption | Evidence | Why it is structural, not cosmetic |
|---|---|---|---|
| 1 | **One brand's gold** | `#c9a84c` as an independent literal in `LE:1196`, `ST` chrome throughout, `CA:81`/`:173`/`:176` | The colour is not a variable in any of the three. It is also the **editor chrome** colour, so the tool's own UI is branded to the tenant. |
| 2 | **One brand's name, three different shapes** | `Balance Bites` (`LE:1274`), `BALANCE`/`BITES` (`ST:149-150`), `BALANCE BITES` (`LE:1227`) | Each tool bakes in a *layout* assumption about the name — one-line, two-line, spaced caps. A different tenant's name may not decompose the same way. |
| 3 | **One monogram of exactly two characters** | `BB` in six places across all three files; `LE:711` sets `.s-mono` to 32 px with `letter-spacing: -3px`; `LE:772` sets `.arch-mono` to 22 px with `-2px` | The negative letter-spacing is tuned to two glyphs. A three-letter monogram overflows. |
| 4 | **One website, hardcoded twice in one file** | `LE:1308` (`eWeb`, unrendered) and `LE:1255` (`eFooter`, rendered, uppercased, ornamented) | The URL a tenant edits is not the URL that prints. |
| 5 | **One product catalog** | `ST:182-191` five products; `LE:1709-1750` six flavours; `CA:94` one flavour | Three hardcoded catalogs that disagree (§5.5). None is loaded from anywhere. |
| 6 | **One barcode number** | `1615012` in `LE:1291` and `CA:110` | The same literal in two files means one tenant, one product, one code. |
| 7 | **One currency** | `EGP 45` (`ST:196`) as a fused string | No currency field, no formatter, no separator policy. |
| 8 | **One language pair** | `Amiri`/`Tajawal` loaded unconditionally; `dir="rtl"` hardcoded per element (`ST:153`, `:183-191`; `CA:2`, `:366`; `LE:189`, `:481`, `:507`, `:543`) | RTL is applied element by element, not by a document-level direction. A tenant with a third language has no path. |
| 9 | **Bilingual headings fused into single literals** | `Ingredients / المكونات:` (`LE:1557`), `Storage / التخزين:` (`LE:1562`), `Nutrition / حقائق التغذية` (`LE:1588`), `WEIGHT / الوزن` (`LE:1580`), `المكونات · INGREDIENTS` (`CA:364`) | These five cannot be localised at all — they can only be replaced wholesale. §3.2.e. |
| 10 | **One fixture model** | `CDS 140 Counter Display Stand` (`ST:434`), not exposed | The stand's own identity is a literal. |
| 11 | **One pack size pair** | `24` and `48` (`CA:168-171`) with their four face geometries as a literal table | Another tenant's carton is not expressible. |
| 12 | **One set of flavour colours** | `ST:166-174` — five pickers named after five specific flavours | The *labels* on the colour pickers are product names. Adding a sixth flavour requires editing the HTML. |
| 13 | **One storage namespace** | `bb_presets` (`LE:1935`) claims the `bb_` prefix for one tool's flavour records | §8.3. |
| 14 | **One editor chrome language per tool** | CA is `<html lang="ar" dir="rtl">` (`CA:2`); ST is `<html lang="en">` (`ST:2`) with one Arabic button (`ST:128`); LE is `<html lang="en">` (`LE:2`) with an Arabic preset bar (`LE:2169-2174`) | The operator's UI language is a compile-time property, and the three tools disagree about it. §6. |
| 15 | **One regulatory regime** | Every storage, validity and nutrition literal in §5.6 is written for one market with no market field anywhere | Serving basis (100 g vs 40 g), numeral system and required nutrients are all baked in. |

### 5.8 Absolute paths

**None. Zero absolute paths in all three files.** Confirmed by the §0.3 sweep.

This is a positive finding and it is the direct evidence for §8.2: a tool with no
absolute path has no shared folder, and a tool with no shared folder cannot
participate in the shared data layer. The contrast is
`balance-bites-sticker.html:1138`, which has one (redacted, §0.3), and
`bb-stock-costs.html:1178` and `:902`, which P-02 found.

---
## PART 6 — BILINGUAL CONTENT INVENTORY

Classification: **UI chrome** (editor interface), **business data** (a Tenant's
own content), **document template** (text printed onto the Artwork), **validation
message** (feedback on an operation).

**Standard applied.** Every literal classified **business data** or **document
template** is individually enumerated with `file:line` in both languages.
Bilingual pairs, stored data keys and English-only strings are individually
enumerated. Arabic-only **UI chrome** would be eligible for classification-level
rollup under the P-03 standard; it is **enumerated individually anyway** — all 50
of it — so §9 of the report can state that nothing was rolled up.

### 6.1 Language posture — three tools, three incompatible answers

| | LE | ST | CA |
|---|---|---|---|
| `<html>` | `lang="en"` (`LE:2`) | `lang="en"` (`ST:2`) | **`lang="ar" dir="rtl"`** (`CA:2`) |
| Sidebar language | English | English | **Arabic** |
| Preset-bar language | **Arabic** (`LE:2169-2174`) | English (`ST:448-449`) | Arabic (`CA:159-162`) |
| Toast language | **Arabic** (`LE:2079-2126`) | **English** (`ST:709-765`) | Arabic (`CA:426-438`) |
| `alert()` language | **English** (`LE:1887`, `:1936`) | none | none |
| Arabic font | `Amiri` — serif (`LE:9`, `:190`) | `Tajawal` — sans (`ST:7`, `:559`) | `Tajawal` — sans (`CA:7`, `:366`) |
| Preset-date locale | `ar-EG` (`LE:2081`) | **`en-GB`** (`ST:710`) | `ar-EG` (`CA:427`) |
| RTL applied by | per-element `direction:rtl` / `dir="rtl"` (`LE:189`, `:481`, `:507`, `:543`) | per-element `dir="rtl"` (`ST:153`, `:183-191`) and inline `direction:rtl` (`ST:559`) | document-level `dir="rtl"` (`CA:2`) plus inline (`CA:366`) |

**LE is the sharpest case: an English editor with an Arabic preset bar and Arabic
toasts, and English `alert()` dialogs.** A single operator sees three language
regimes in one screen.

### 6.2 Bilingual pairs — DOCUMENT TEMPLATE

Text printed onto the Artwork, present in both languages as separate fields.
Individually enumerated.

| # | English | EN line | Arabic | AR line | Rendered at | File |
|---|---|---|---|---|---|---|
| DT-1 | `Whole wheat flour, peanuts, cinnamon, sunflower oil, salt, natural flavors. Contains: Wheat, Peanuts.` | `LE:1293` | `دقيق القمح الكامل، فول سوداني، قرفة، زيت عباد الشمس، ملح، نكهات طبيعية. يحتوي على: قمح، فول سوداني.` | `LE:1296` | `LE:1558-1559` | LE |
| DT-2 | same as DT-1 | `LE:1949` | same as DT-1 | `LE:1950` | `rst()` defaults | LE |
| DT-3 | `Store in a dry, well-ventilated place away from direct sunlight.` | `LE:1299` | `يخزن في مكان جاف جيد التهوية بعيدا عن أشعة الشمس المباشرة.` | `LE:1302` | `LE:1563` — **fused with ` / `** | LE |
| DT-4 | same as DT-3 | `LE:1951` | same as DT-3 | `LE:1952` | `rst()` defaults | LE |
| DT-5 | `Valid for 3 months from date of production` | `LE:1304` | `صالح لمدة ٣ شهور من تاريخ الانتاج` | `LE:1306` | `LE:1566` — **fused with ` / `** | LE |
| DT-6 | same as DT-5 | `LE:1953` | same as DT-5 | `LE:1954` | `rst()` defaults | LE |
| DT-7 | `Serving per size 100g` | `LE:1328` | `حجم الحصة ١٠٠ جم` | `LE:1331` | `LE:1589` — **fused with ` / `** | LE |
| DT-8 | same as DT-7 | `LE:1957` | same as DT-7 | `LE:1957` | `rst()` defaults | LE |
| DT-9 | `Calories\|443 kcal` | `LE:1333` | `السعرات الحرارية\|٤٤٣ سعرة` | `LE:1333` | `LE:1592` | LE |
| DT-10 | `Protein\|12.3 g` | `LE:1334` | `بروتين\|١٢.٣ جم` | `LE:1334` | `LE:1592` | LE |
| DT-11 | `Total Fat\|6.49 g` | `LE:1335` | `الدهون الكلية\|٦.٤٩ جم` | `LE:1335` | `LE:1592` | LE |
| DT-12 | `Total Carbohydrate\|77.5 g` | `LE:1336` | `الكربوهيدرات الكلية\|٧٧.٥ جم` | `LE:1336` | `LE:1592` | LE |
| DT-13 | DT-9 to DT-12 repeated | `LE:1960` | same | `LE:1960` | `rst()` defaults | LE |
| DT-14 | `Whole wheat flour, olive oil, thyme, salt, baking powder. Contains: Wheat.` | `LE:1711` | `دقيق قمح كامل، زيت زيتون، زعتر، ملح، بيكنج بودر. يحتوي على: قمح.` | `LE:1712` | Zaatar preset | LE |
| DT-15 | `Store in a cool, dry place away from direct sunlight.` | `LE:1713` | `يحفظ في مكان جاف وبارد بعيدًا عن أشعة الشمس المباشرة.` | `LE:1714` | Zaatar preset | LE |
| DT-16 | `Valid for 3 months from date of production.` | `LE:1715` | `صالح لمدة 3 أشهر من تاريخ الإنتاج.` | `LE:1716` | Zaatar preset | LE |
| DT-17 | `Serving size 40g\nServings per pack: 1` | `LE:1718` | `حجم الحصة 40 جم\nعدد الحصص في العبوة: 1` | `LE:1719` | Zaatar preset | LE |
| DT-18 | `Calories \| 168 kcal` | `LE:1720` | `السعرات الحرارية \| 168 سعرة` | `LE:1720` | Zaatar preset | LE |
| DT-19 | `Protein \| 4.8 g` | `LE:1720` | `البروتين \| 4.8 جم` | `LE:1720` | Zaatar preset | LE |
| DT-20 | `Total Fat \| 4 g` | `LE:1720` | `الدهون الكلية \| 4 جم` | `LE:1720` | Zaatar preset | LE |
| DT-21 | `Saturated Fat \| 0.6 g` | `LE:1720` | `دهون مشبعة \| 0.6 جم` | `LE:1720` | Zaatar preset | LE |
| DT-22 | `Total Carbohydrate \| 26 g` | `LE:1720` | `الكربوهيدرات الكلية \| 26 جم` | `LE:1720` | Zaatar preset | LE |
| DT-23 | `Dietary Fiber \| 4 g` | `LE:1720` | `الألياف الغذائية \| 4 جم` | `LE:1720` | Zaatar preset | LE |
| DT-24 | `Total Sugars \| <0.5 g` | `LE:1720` | `السكريات \| أقل من 0.5 جم` | `LE:1720` | Zaatar preset | LE |
| DT-25 | `Sodium \| 160 mg` | `LE:1720` | `الصوديوم \| 160 مجم` | `LE:1720` | Zaatar preset | LE |
| DT-26 | `Whole wheat flour, olive oil, paprika, salt, garlic powder, baking powder. Contains: Wheat.` | `LE:1724` | `دقيق قمح كامل، زيت زيتون، بابريكا، ملح، بودرة ثوم، بيكنج بودر. يحتوي على: قمح.` | `LE:1725` | Paprika preset | LE |
| DT-27 | DT-15 wording | `LE:1726` | DT-15 wording | `LE:1727` | Paprika preset | LE |
| DT-28 | DT-16 wording | `LE:1728` | DT-16 wording | `LE:1729` | Paprika preset | LE |
| DT-29 | DT-17 wording | `LE:1731` | DT-17 wording | `LE:1732` | Paprika preset | LE |
| DT-30 | DT-18 to DT-24 identical; `Sodium \| 165 mg` | `LE:1733` | identical; `الصوديوم \| 165 مجم` | `LE:1733` | Paprika preset | LE |
| DT-31 | `Whole wheat flour, olive oil, black pepper, sea salt, baking powder. Contains: Wheat.` | `LE:1737` | `دقيق قمح كامل، زيت زيتون، فلفل أسود، ملح بحري، بيكنج بودر. يحتوي على: قمح.` | `LE:1738` | Pepper preset | LE |
| DT-32 | DT-15 wording | `LE:1739` | DT-15 wording | `LE:1740` | Pepper preset | LE |
| DT-33 | DT-16 wording | `LE:1741` | DT-16 wording | `LE:1742` | Pepper preset | LE |
| DT-34 | DT-17 wording | `LE:1744` | DT-17 wording | `LE:1745` | Pepper preset | LE |
| DT-35 | DT-18 to DT-24 identical; `Sodium \| 170 mg` | `LE:1746` | identical; `الصوديوم \| 170 مجم` | `LE:1746` | Pepper preset | LE |
| DT-36 | `Whole wheat flour, olive oil, sea salt, za'atar. Contains: Wheat.` | `CA:121` | `دقيق قمح كامل، زيت زيتون، ملح بحر، زعتر. يحتوي على: قمح.` | `CA:122` | `CA:365-366` | CA |

**36 bilingual document-template pairs, all individually enumerated.**

### 6.3 Bilingual pairs — BUSINESS DATA

Tenant content that is not printed as regulatory text.

| # | English | EN line | Arabic | AR line | Rendered at | File |
|---|---|---|---|---|---|---|
| BD-1 | `WHOLE FOOD SNACKS · NATURALLY POWERFUL` | `ST:152` | `وجبات خفيفة طبيعية · قوية بالطبيعة` | `ST:153` | `ST:558-559` | ST |
| BD-2 | `Za'atar Crackers` | `ST:182` | `كراكرز زعتر` | `ST:183` | **not rendered** (§1.2.f) | ST |
| BD-3 | `Paprika Crackers` | `ST:184` | `كراكرز بابريكا` | `ST:185` | **not rendered** | ST |
| BD-4 | `Rosemary & Basil` | `ST:186` | `كراكرز روزماري و ريحان` | `ST:187` | **not rendered** | ST |
| BD-5 | `Black Pepper & Sea Salt` | `ST:188` | `كراكرز فلفل اسود و ملح بحر` | `ST:189` | **not rendered** | ST |
| BD-6 | `Cinnamon Roasted Peanuts` | `ST:190` | `فول سوداني بالقرفة` | `ST:191` | **not rendered** | ST |

**Six bilingual business-data pairs, all individually enumerated. Five of the six
are never rendered** — the tool captures and persists the Arabic product names
and displays none of them.

**BD-4's pair is not a translation.** `Rosemary & Basil` renders in Arabic as
`كراكرز روزماري و ريحان` — "Rosemary and Basil **crackers**". The Arabic adds a
product-type noun the English omits. BD-6 is the reverse: `Cinnamon Roasted
Peanuts` → `فول سوداني بالقرفة`, "peanuts with cinnamon", dropping "roasted".
Neither is a defect; both are evidence that the pair is two authored strings, not
one string in two languages, and a content model must treat them that way.

### 6.4 The regulatory text exists in two incompatible versions

Every regulatory sentence in LE is authored twice — once in the field defaults
and `rst()` set, and once in the three fully-populated flavour presets. Which one
prints depends on whether the operator clicked a flavour button. Individually
enumerated because all of it is document template.

| Sentence | Default / `rst()` version | Preset version | Difference |
|---|---|---|---|
| Storage EN | `Store in a dry, well-ventilated place away from direct sunlight.` (`LE:1299`, `:1951`) | `Store in a cool, dry place away from direct sunlight.` (`LE:1713`, `:1726`, `:1739`) | **Different claim** — "well-ventilated" vs "cool" |
| Storage AR | `يخزن في مكان جاف جيد التهوية بعيدا عن أشعة الشمس المباشرة.` (`LE:1302`, `:1952`) | `يحفظ في مكان جاف وبارد بعيدًا عن أشعة الشمس المباشرة.` (`LE:1714`, `:1727`, `:1740`) | Different verb (`يخزن` vs `يحفظ`); `بعيدا` vs `بعيدًا` (tanwīn restored) |
| Validity EN | `Valid for 3 months from date of production` (`LE:1304`, `:1953`) | `Valid for 3 months from date of production.` (`LE:1715`, `:1728`, `:1741`) | **Trailing full stop** |
| Validity AR | `صالح لمدة ٣ شهور من تاريخ الانتاج` (`LE:1306`, `:1954`) | `صالح لمدة 3 أشهر من تاريخ الإنتاج.` (`LE:1716`, `:1729`, `:1742`) | **Arabic-Indic `٣` vs Western `3`**; `شهور` vs `أشهر`; `الانتاج` vs `الإنتاج` (hamza restored); full stop |
| Serving size EN | `Serving per size 100g` (`LE:1328`, `:1957`) | `Serving size 40g\nServings per pack: 1` (`LE:1718`, `:1731`, `:1744`) | **Different basis (100 g vs 40 g)**; the default is ungrammatical; the preset adds a servings-per-pack line |
| Serving size AR | `حجم الحصة ١٠٠ جم` (`LE:1331`, `:1957`) | `حجم الحصة 40 جم\nعدد الحصص في العبوة: 1` (`LE:1719`, `:1732`, `:1745`) | **Arabic-Indic `١٠٠` vs Western `40`**; different basis; extra line |
| Nutrition rows | 4 rows, per 100 g, **Arabic-Indic numerals** (`LE:1333-1336`, `:1960`) | 8 rows, per 40 g, **Western numerals** (`LE:1720`, `:1733`, `:1746`) | **Row count, basis and numeral system all differ** |

**The numeral-system split is the finding with the widest reach.** The default
set uses Arabic-Indic digits (`٤٤٣`, `١٢.٣`, `٦.٤٩`, `٧٧.٥`, `١٠٠`, `٣`); the
preset set uses Western digits (`168`, `4.8`, `0.6`, `40`, `3`) inside otherwise
Arabic sentences. Both are valid in Egyptian labelling practice, and no field,
flag or comment records which the brand intends. It is a per-Tenant, per-locale
decision the platform must carry and the legacy set does not.

### 6.5 Fused bilingual literals — DOCUMENT TEMPLATE, unlocalisable

Both languages baked into one string. Individually enumerated.

| # | Literal | File:line | Rendered as | Problem |
|---|---|---|---|---|
| FL-1 | `Ingredients / المكونات:` | `LE:1557` | Back-panel section heading | Single string; cannot be localised or reordered |
| FL-2 | `Storage / التخزين:` | `LE:1562` | Back-panel section heading | Same |
| FL-3 | `Nutrition / حقائق التغذية` | `LE:1588` | Nutrition table header | Same |
| FL-4 | `WEIGHT / الوزن` | `LE:1580` | Weight caption | Same |
| FL-5 | `المكونات · INGREDIENTS` | `CA:364` | Bottom-face heading | Same, **Arabic first** — the opposite order to FL-1 to FL-4 |

Three further fusions happen **at render time** rather than in the literal, from
two separate fields: storage (`LE:1563`, `v.storEn + ' / ' + v.storAr`), validity
(`LE:1566`), serving size (`LE:1589`), and every nutrition row
(`LE:1592`, `r.ne + ' / ' + r.na` and `r.ve + ' / ' + r.va`). Those are
recoverable — the fields exist separately — but the ` / ` separator and the
EN-then-AR order are hardcoded in the renderer.

### 6.6 Arabic-only literals — UI chrome (enumerated, not rolled up)

**CA — 42.** CA's editor is Arabic-primary.

| # | Literal | Line | Meaning |
|---|---|---|---|
| 1 | `⚙ تعديل` | `CA:72` | Edit — sidebar toggle |
| 2 | `📦 نوع الكرتون` | `CA:76` | Carton type — section |
| 3 | `ستايل` | `CA:77` | Style — field label |
| 4 | `🎨 الألوان` | `CA:78` | Colours — section |
| 5 | `خلفية` | `CA:80` | Background |
| 6 | `ذهبي` | `CA:81` | Gold |
| 7 | `تمييز` | `CA:84` | Accent |
| 8 | `نص` | `CA:85` | Text |
| 9 | `🏷 البراند` | `CA:87` | Brand — section |
| 10 | `وزن العبوة` | `CA:90` | Pack weight |
| 11 | `📋 البادجات` | `CA:99` | Badges — section |
| 12 | `📅 التواريخ والباركود` | `CA:105` | Dates and barcode — section |
| 13 | `تاريخ الإنتاج` | `CA:107` | Production date |
| 14 | `تاريخ الانتهاء` | `CA:108` | Expiry date |
| 15 | `الباركود` | `CA:110` | Barcode |
| 16 | `عرض صندوق التواريخ` | `CA:112` | Date-box width |
| 17 | `حجم خط التاريخ` | `CA:113` | Date font size |
| 18 | `ارتفاع الباركود` | `CA:116` | Barcode height |
| 19 | `حجم خط المكونات` | `CA:117` | Ingredients font size |
| 20 | `🌾 المكونات` | `CA:119` | Ingredients — section |
| 21 | `المكونات AR` | `CA:122` | Ingredients AR — **mixed-script label** |
| 22 | `Flavor (حجم)` | `CA:126` | Flavour (size) — **mixed** |
| 23 | `Brand (حجم)` | `CA:127` | Brand (size) — **mixed** |
| 24 | `Type (حجم)` | `CA:130` | Type (size) — **mixed** |
| 25 | `Badges (حجم)` | `CA:131` | Badges (size) — **mixed** |
| 26 | `Units رقم (حجم)` | `CA:134` | Units number (size) — **mixed** |
| 27 | `Net Weight (حجم)` | `CA:135` | Net weight (size) — **mixed** |
| 28 | `عرض شريط Units` | `CA:138` | Units-strip width — **mixed** |
| 29 | `Slogan (حجم)` | `CA:139` | Slogan (size) — **mixed** |
| 30 | `🖨 طباعة` | `CA:143` | Print — sidebar |
| 31 | `💾 حفظ سريع` | `CA:144` | Quick save |
| 32 | `📦 24 عبوة` | `CA:149` | 24 packs — size tab |
| 33 | `📦 48 عبوة` | `CA:150` | 48 packs — size tab |
| 34 | `اسم الإعداد...` | `CA:159` | Preset name… — placeholder |
| 35 | `💾 حفظ` | `CA:160` | Save |
| 36 | `🖨 طباعة` | `CA:162` | Print — preset bar |
| 37 | `↑ الوجه العلوي (Top)` | `CA:381` | Top face — **mixed**, screen only |
| 38 | `الواجهة الأمامية (Front) + الجانب (Side)` | `CA:382` | Front + side — **mixed**, screen only |
| 39 | `↓ الوجه السفلي (Bottom)` | `CA:384` | Bottom face — **mixed**, screen only |
| 40 | `تحميل: ` | `CA:443` | Load: — tooltip |
| 41 | `تصدير` | `CA:444` | Export — tooltip |
| 42 | `حذف` | `CA:445` | Delete — tooltip |

**Eight of CA's 42 are mixed-script** (#21–#29 excluding #28's inverse), pairing an
English noun with an Arabic qualifier. That is not a translation gap — it is an
untranslated technical vocabulary embedded in an Arabic UI.

**LE — 7.**

| # | Literal | Line | Meaning |
|---|---|---|---|
| 43 | `اسم الإعداد...` | `LE:2169` | Preset name… — placeholder |
| 44 | `💾 حفظ` | `LE:2170` | Save |
| 45 | `استيراد ملف JSON` | `LE:2171` | Import JSON file — tooltip |
| 46 | `🖨 طباعة` | `LE:2174` | Print |
| 47 | `تحميل: ` | `LE:2142` | Load: — tooltip |
| 48 | `تصدير` | `LE:2147` | Export — tooltip |
| 49 | `حذف` | `LE:2151` | Delete — tooltip |

**ST — 1.**

| # | Literal | Line | Meaning |
|---|---|---|---|
| 50 | `⚙ إعدادات` | `ST:128` | Settings — the **only** Arabic string in ST's UI |

**Total Arabic-only UI chrome: 50, all enumerated. Nothing rolled up.**

### 6.7 Arabic-only literals — VALIDATION MESSAGES

| # | Literal | File:line | Trigger | English equivalent exists? |
|---|---|---|---|---|
| V-1 | `اكتب اسماً أولاً` | `CA:426` | Save with an empty name | **No** — ST's equivalent is `Enter a name` (`ST:710`) |
| V-2 | `✓ تم حفظ "{name}"` | `CA:432` | Save succeeded — **or silently failed, §7** | No — ST: `✓ Saved: {name}` |
| V-3 | `✓ تم تحميل "{name}"` | `CA:435` | Load succeeded | No — ST: `✓ Loaded: {name}` |
| V-4 | `خطأ: {e.message}` | `CA:435` | Load threw | No |
| V-5 | `🗑 حُذف "{name}"` | `CA:436` | Deleted | No — ST: `Deleted: {name}` |
| V-6 | `📥 تم تصدير "{name}"` | `CA:437` | Exported | No — ST: `Exported` |
| V-7 | `ملف غير صالح` | `CA:438` | **Thrown `Error` message** on import with no `state` | No — ST throws `Invalid` |
| V-8 | `✓ تم استيراد "{name}"` | `CA:438` | Imported | No — ST: `Imported: {name}` |
| V-9 | `ملف غير صالح: {err.message}` | `CA:438` | Import threw | No — ST: `Invalid file` |
| V-10 | `اكتب اسماً أولاً` | `LE:2079` | Save with an empty name | No |
| V-11 | `✓ تم حفظ "{name}"` | `LE:2087` | Save succeeded or silently failed | No |
| V-12 | `✓ تم تحميل "{name}"` | `LE:2092` | Load succeeded | No |
| V-13 | `خطأ في التحميل: {e.message}` | `LE:2093` | Load threw | No |
| V-14 | `🗑 حُذف "{name}"` | `LE:2099` | Deleted | No |
| V-15 | `📥 تم تصدير "{name}"` | `LE:2109` | Exported | No |
| V-16 | `ملف غير صالح` | `LE:2118` | Thrown `Error` message | No |
| V-17 | `✓ تم استيراد "{name}"` | `LE:2125` | Imported | No |
| V-18 | `ملف غير صالح: {err.message}` | `LE:2126` | Import threw | No |

**English-only validation messages:**

| # | Literal | File:line | Kind |
|---|---|---|---|
| V-19 | `Enter a name` | `ST:710` | Toast |
| V-20 | `✓ Saved: {name}` | `ST:710` | Toast |
| V-21 | `✓ Loaded: {name}` | `ST:762` | Toast |
| V-22 | `Deleted: {name}` | `ST:763` | Toast |
| V-23 | `Exported` | `ST:764` | Toast |
| V-24 | `Invalid` | `ST:765` | Thrown `Error` message |
| V-25 | `Invalid file` | `ST:765` | Toast |
| V-26 | `Imported: {name}` | `ST:765` | Toast |
| V-27 | `Please select one of the flavor presets first to save changes to it.` | `LE:1887` | **`alert()`** — blocking |
| V-28 | `✅ All settings saved to '{key}' preset!` | `LE:1936` | **`alert()`** — blocking |
| V-29 | `Failed to load presets` | `LE:1762` | `console.error` — **not user-visible** |

**29 validation messages. Eighteen exist only in Arabic, eleven only in English,
and none in both.** The same nine operations — empty name, save, load, load
error, delete, export, invalid import, import, import error — are messaged in
Arabic by CA and LE and in English by ST. **There is no message in this family
that exists in two languages.**

### 6.8 English-only strings — UI chrome

**ST — the whole editor.** Enumerated by group.

| Group | Literals | Lines |
|---|---|---|
| Sidebar heading | `✦ Editor — Balance Bites` | `ST:133` |
| Tabs | `🎨 Brand`, `🫙 Prod`, `🖼 Style`, `🏅 Badge`, `📐 Size`, `🔤 Font` | `ST:135-140` |
| Brand section | `🏷 BRAND INFO`, `Brand Line 1`, `Brand Line 2`, `Logo Text`, `Tagline EN`, `Tagline AR`, `Call to Action`, `Website`, `Show Shelf Brand` | `ST:147-156` |
| Social section | `📱 SOCIAL MEDIA`, `Instagram`, `WhatsApp`, `Extra Line` | `ST:158-162` |
| Flavour colours | `🎨 FLAVOR COLORS`, `Za'atar`, `Paprika`, `Rosemary`, `B.Pepper`, `Cinnamon` | `ST:164-174` |
| Products | `🫙 SHELF PRODUCTS`, `Product 1 EN`…`Product 5 AR`, `💰 PRICING`, `Weight`, `Price` | `ST:180-196` |
| Style | `🎨 PANEL BACKGROUND COLORS`, `Mirror Face BG`, `Shelf BG`, `Side L BG`, `Side R BG`, `🔲 PATTERN OVERLAYS`, `None`, `Diagonal Lines`, `Dots`, `Cross-Hatch`, `Wheat Motif`, `Pattern Color`, `Pattern Opacity %` | `ST:202-226` |
| Images | `🖼 BACKGROUND IMAGES`, `Mirror Face BG Image`, `Shelf BG Image`, `Side L BG Image`, `Side R BG Image`, `📎 QR CODES`, `Shelf QR Code`, `Side L QR Code`, `Side R QR Code` | `ST:228-239` |
| Positions | `📍 SIDE LOGO POSITION`, `Logo L X Pos %`, `Logo L Y Pos %`, `Logo R X Pos %`, `Logo R Y Pos %`, `📍 QR POSITION (Sides)`, `QR L X Pos %`, `QR L Y Pos %`, `QR R X Pos %`, `QR R Y Pos %` | `ST:241-257`, `:411-417` |
| Colours | `🎨 TEXT & LOGO COLORS`, `Main Text Color`, `Sub Text Color`, `Logo Circle BG`, `Logo Text Color` | `ST:259-266` |
| Options | `⚙️ OPTIONS`, `Show Flavor Color Dots (Mirror Face)`, `Show Color Lines (Top/Bottom)`, `Show Shelf Social`, `Show Shelf Badges`, `Show Shelf QR`, `Show Panel Titles in Print`, `Center Panels on Page` | `ST:268-276` |
| Image options | `📐 BG IMAGE OPTIONS`, `Face BG Size`, `Cover`, `Contain`, `Stretch`, `Original`, `Face Opacity %`, and the same four for Shelf / Side L / Side R | `ST:278-297` |
| Badges | `🏅 HEALTH BADGES`, `Toggle badges shown on the shelf panel.`, `✏️ BADGE LABELS`, `Badge 1 Label`…`Badge 6 Icon`, `B1 PNG Icon`…`B6 PNG Icon`, `📏 BADGE SIZES`, `Badge Icon Size`, `Badge Text Size` | `ST:303-347` |
| Size | `📏 MIRROR FACE`, `📏 SHELF`, `📏 SIDES`, `Width (mm)`, `Height (mm)`, `Depth (mm)`, `Front H (mm)`, `Back H (mm)`, `🖥 SCREEN & PRINT`, `Screen Scale`, `Print Layout`, `Exact Size (100% Match)`, `A3 Landscape`, `A2 Landscape` | `ST:352-374` |
| Fonts | `🔤 TYPEFACE`, `Header Font`, `Body Font`, `🔤 MIRROR FACE`, `Brand Size`, `Tagline Size`, `Logo Circle`, `Logo Text`, `CTA Size`, `🔤 SHELF`, `Product EN`, `Product AR`, `Price`, `Social`, `🔤 SIDES`, `Side Brand`, `Side Logo`, `QR Size` | `ST:380-420` |
| Footer | `🖨 Print`, `💾 Save`, `✕ Close` | `ST:426-428` |
| Canvas | `CDS 140 Counter Display Stand`, `All Panels`, `Mirror Face`, `Shelf`, `Sides` | `ST:434-438` |
| Preset bar | `⚡ Presets`, `Preset name...`, `💾 Save`, `🖨` | `ST:445-451` |
| Panel titles | `① Mirror Face`, `② Shelf`, `③ Side L`, `④ Side R` | `ST:690`, `:693`, `:696-697` |

**LE — the whole editor except the preset bar.**

| Group | Literals | Lines |
|---|---|---|
| Header | `Balance Bites`, `Seal Sticker Label Editor` | `LE:1183-1184` |
| Sections | `🎨 Colors & Pattern`, `✦ Front Panel`, `⬛ Center Seal`, `🔗 Neck`, `🟦 Back Panel`, `📊 Nutrition Facts`, `🔤 Typography` | `LE:1192`, `:1216`, `:1271`, `:1279`, `:1286`, `:1326`, `:1341` |
| Colours | `Background`, `Gold/Border`, `Arch Accent`, `Badge1 Color`, `Badge2 Color`, `Pattern`, `None`, `Diagonal`, `Crosshatch`, `Dots`, `Pattern Opacity` | `LE:1194-1212` |
| Front | `Arch Monogram`, `Font size px`, `Monogram color`, `Arch Sub Text`, `Flavor Name`, `Emoji / Icon`, `📂 PNG`, `Icon Size:`, `Sub-Type`, `Premium Text`, `Badge 1`–`Badge 4`, `Net Weight`, `Footer`, `— FRONT NECK DATE BOX —`, `Prod. Date Label`, `Prod. Date Value`, `e.g. 2025/06/01`, `Box Length`, `Box Thickness`, `Box Font Size` | `LE:1218-1267` |
| Seal / neck | `Monogram`, `Brand Name`, `Vertical Text` | `LE:1273-1281` |
| Back | `Brand Mono`, `Brand Name`, `Prod. Date`, `Barcode #`, `Ingredients (EN)`, `Ingredients (AR)`, `Storage (EN)`, `Storage (AR)`, `Validity (EN)`, `Validity (AR)`, `Approx Weight`, `Website`, `Barcode W`, `Barcode H`, `Wt. Number Size`, `Wt. Label Size` | `LE:1288-1319` |
| Nutrition | `Serving Size (EN)`, `Serving Size (AR)`, `Nutrition Rows (Name EN \| Value \| Name AR \| Value AR) one per line` | `LE:1328-1332` |
| Typography | `Flavor Name`, `Sub-Type`, `Premium`, `Front Badges`, `Weight`, `Seal Monogram`, `Seal Brand`, `Neck Text`, `Back Headings`, `Back Body`, `Nutrition Text`, `Footer` + 8 font-family option lists | `LE:1343-1429` |
| Actions | `🖨 Print Label`, `↺ Reset`, `Tip: Enable "Background graphics" in print dialog` | `LE:1434-1436` |
| Presets | `Quick Flavor Presets`, `🟢 Zaatar`, `🔴 Paprika`, `⚫ Pepper`, `🍂 Cinnamon`, `🌿 Herb`, `🍯 Sesame`, `💾 Save Current Preset` | `LE:1441-1452` |
| Preview | `Zoom`, `5×3cm`, `Front`, `1×4.5cm`, `Neck`, `3×3cm`, `Seal`, `5×3cm`, `Back` | `LE:1460-1470` |

**CA — 14 English-only labels inside an Arabic UI.**

| Literal | Line |
|---|---|
| `✦ Carton Editor — Balance Bites` | `CA:74` |
| `Dark Luxury`, `Brown Kraft`, `White Clean`, `Custom` | `CA:77` |
| `Monogram` | `CA:89` |
| `Brand Name` | `CA:93` |
| `Flavor` | `CA:94` |
| `Type` | `CA:95` |
| `Slogan` | `CA:96` |
| `Website` | `CA:97` |
| `Badge 1`, `Badge 2`, `Badge 3` | `CA:101-103` |
| `Ingredients EN` | `CA:121` |
| `🔤 Typography` | `CA:124` |
| `⚡ Presets` | `CA:156` |

### 6.9 English-only strings printed onto the Artwork — DOCUMENT TEMPLATE

These print. They have no Arabic counterpart anywhere.

| # | Literal | File:line | Face / segment |
|---|---|---|---|
| EO-1 | `NET WT {totalWt} ({sz}×{unitWt})` | `CA:269` | Carton front |
| EO-2 | `UNITS` | `CA:279` | Carton front strip |
| EO-3 | `{unitWt} each` | `CA:280` | Carton front strip |
| EO-4 | `UNITS` | `CA:297` | Carton top |
| EO-5 | `PCS` | `CA:337` | Carton side |
| EO-6 | `PROD DATE` | `CA:357` | Carton bottom |
| EO-7 | `EXP DATE` | `CA:357` | Carton bottom |
| EO-8 | `📷` `📱` `🌐` prefixes on social lines | `ST:590`, `:591`, `:593` | Stand shelf |
| EO-9 | `100% Natural`, `Whole Wheat`, `For Diet`, `For Diabetes`, `Custom Badge`, `Custom Badge 2` | `ST:315-340` | Stand shelf badges |
| EO-10 | `100% Natural`, `No Preservations`, `Whole Wheat`, `No Added Sugar` | `LE:1250-1253` | Label front badges |
| EO-11 | `100% Natural`, `Whole Wheat`, `No Preservatives` | `CA:101-103` | Carton front badges |
| EO-12 | `P R E M I U M` | `LE:1249` | Label front |
| EO-13 | `SEALED · FRESHNESS` | `LE:1281` | Label neck |
| EO-14 | `Production Date:` | `LE:1260` | Label neck date box |
| EO-15 | `___________` | `LE:1619` | Label neck, empty-date fill |
| EO-16 | `Try Our Natural Crackers!` | `ST:154` | Stand mirror face |
| EO-17 | `Natural · Wholesome · Delicious` | `CA:96` | Carton front |
| EO-18 | `✦  BALANCEBITES.COM  ✦` | `LE:1255` | Label front footer |

**Eighteen English-only printed strings, of which seven are on the carton — the
tool whose entire editor UI is Arabic.** The operator configures in Arabic and
the artifact prints `PROD DATE`, `EXP DATE`, `NET WT`, `UNITS`, `PCS`. Only the
ingredients block (DT-36) and its heading (FL-5) reach the buyer in Arabic.

### 6.10 Where only one language exists — rollup

| Situation | Count | Detail |
|---|---|---|
| Arabic-only UI chrome | **50** | §6.6 — CA 42, LE 7, ST 1 |
| Arabic-only validation messages | **18** | §6.7 V-1 to V-18 |
| English-only validation messages | **11** | §6.7 V-19 to V-29 |
| Validation messages in **both** languages | **0** | — |
| English-only UI chrome | ST's entire editor, LE's entire editor except the preset bar, 14 CA labels | §6.8 |
| English-only **printed** strings | **18** | §6.9 |
| Arabic-only **printed** strings | **0** | Every Arabic printed string has an English partner — DT-1 to DT-36, FL-1 to FL-5 |
| Bilingual document-template pairs | **36** | §6.2 |
| Bilingual business-data pairs | **6** | §6.3 |
| Unlocalisable fused literals | **5** | §6.5 |

**The asymmetry is the requirement.** Arabic never appears on an artifact
without English, but English appears on artifacts eighteen times without Arabic.
The Arabic in these tools is an *addition* to an English original, not a peer
language — and CA proves the pattern is not about the operator, because CA's
operator works entirely in Arabic and still ships an artifact whose captions are
English.

---
## PART 7 — WHAT B2S MUST NOT REPRODUCE

Behaviours that are defects, not requirements. One sentence on the defect, one on
the correct behaviour. **No fix is designed here** — the correct-behaviour column
states an outcome, never a mechanism.

The distinction applied throughout: a **defect** is a behaviour whose own author
would call it wrong. An **inconsistency** — two tools disagreeing — is a decision
for the platform and lives in Parts 3 to 6, not here.

### 7.1 Unescaped `innerHTML` — complete site inventory (CF-02)

**Every `innerHTML` assignment in the three files, all 10 sites.** Sinks
enumerated exhaustively so CF-02 can close on evidence rather than a sample.

| # | Site | File:line | Interpolated content | User-derived? | Verdict |
|---|---|---|---|---|---|
| H-1 | `document.getElementById('screenStrip').innerHTML = html` | `LE:1702` | `buildLabel(v)` — all 74 field values | **Yes** | **UNESCAPED** |
| H-2 | `document.getElementById('printStrip').innerHTML = html` | `LE:1703` | same `html` string, assigned twice | **Yes** | **UNESCAPED** |
| H-3 | `slots.innerHTML = ''` | `LE:2134` | empty string literal | No | Safe — clear operation |
| H-4 | `lb.innerHTML = '<span class="pbs-nm">'+p.name+'</span><span class="pbs-dt">'+p.date+'</span>'` | `LE:2141` | `p.name`, `p.date` | **Yes** | **UNESCAPED** |
| H-5 | `wrap.innerHTML=html` | `ST:699` | `render()` output — all 98 field values | **Yes** | **UNESCAPED** |
| H-6 | `slots.innerHTML=""` | `ST:766` | empty string literal | No | Safe — clear operation |
| H-7 | `lb.innerHTML="<span class=\"pbs-nm\">"+p.name+"</span><span class=\"pbs-dt\">"+p.date+"</span>"` | `ST:766` | `p.name`, `p.date` | **Yes** | **UNESCAPED** |
| H-8 | `document.getElementById('cartonWrap').innerHTML=` | `CA:380` | `render()` output — all 32 field values | **Yes** | **UNESCAPED** |
| H-9 | `slots.innerHTML=''` | `CA:440` | empty string literal | No | Safe — clear operation |
| H-10 | `lb.innerHTML='<span class="pbs-nm">'+p.name+'</span><span class="pbs-dt">'+p.date+'</span>'` | `CA:443` | `p.name`, `p.date` | **Yes** | **UNESCAPED** |

**Seven unescaped user-derived sites; three safe constant assignments; ten total.
No site in any of the three files escapes anything.** There is no escape helper,
no sanitiser and no allow-list in any of the three files.

**Negative result, stated explicitly.** Grepped all three for the rest of the
HTML-sink family — `document.write`, `insertAdjacentHTML`, `outerHTML`, `eval(`,
`new Function`, `srcdoc`. **Zero matches in all three files.** `innerHTML` is the
only HTML sink present, so the seven sites above are the complete surface.

**The reachability chain matters more than the count.** H-4, H-7 and H-10
interpolate `p.name` — and `p.name` is not only operator-typed. The import path
takes it straight from an arbitrary `.json` file:

| Step | LE | ST | CA |
|---|---|---|---|
| File chosen by operator | `LE:2113` | `ST:765` | `CA:438` |
| Parsed | `LE:2117` | `ST:765` | `CA:438` |
| **Only validation** | `if(!data.state) throw` — `LE:2118` | `if(!data.state) throw new Error("Invalid")` — `ST:765` | `if(!data.state) throw new Error('ملف غير صالح')` — `CA:438` |
| `data.name` validated? | **No** | **No** | **No** |
| Persisted to `localStorage` | `LE:2124` | `ST:765` | `CA:438` |
| Reaches `innerHTML` | `LE:2141` | `ST:766` | `CA:443` |

An imported preset file whose `name` is markup is written to storage and rendered
as markup on **every subsequent page load** — `pbRender()` runs at start-up in all
three. The import validator checks one key for presence and nothing for type,
shape or content.

H-1, H-2, H-5 and H-8 are a wider surface but a narrower vector: the values come
from the operator's own form fields, and the fields feed both attribute contexts
(`style="background:'+v.bg+'"` and equivalents throughout the three render
functions) and text contexts. Colour inputs are `<input type="color">` and the
browser normalises them, but `presetSetState` (`LE:2019-2074`) and its ST/CA
equivalents write stored values into those inputs without type checking, so the
normalisation is not a guarantee — a stored string that is not a valid colour is
still concatenated into the markup string before the input ever normalises it.

| Defect | Correct behaviour |
|---|---|
| Every rendered value — form field, stored preset, imported file — is concatenated into a markup string and assigned to `innerHTML` with no escaping, at seven sites. | Text supplied by an operator or read from a file must reach the document as text, and must be incapable of becoming markup regardless of its content. |
| Import validates one key for presence (`data.state`) and nothing else, then persists the record and renders `data.name` as markup on every load. | Anything crossing the boundary into the application must be validated against the shape it is expected to have before it is stored, and rejected in full if it does not match. |

### 7.2 Empty and swallowing `catch` blocks — complete site inventory (CF-03)

**Every `catch` in the three files, all 12 sites.**

| # | Site | File:line | Body | Class |
|---|---|---|---|---|
| C-1 | `_pbSav(a){ try{localStorage.setItem(...)}catch(e){} }` | `LE:1981` | **empty** | **EMPTY** |
| C-2 | `_pbSav(a){try{localStorage.setItem(...)}catch(e){}}` | `ST:708` | **empty** | **EMPTY** |
| C-3 | `_pbSav(a){try{localStorage.setItem(...)}catch(e){}}` | `CA:398` | **empty** | **EMPTY** |
| C-4 | `_pbLG(){ try{return JSON.parse(...)}catch(e){return[];} }` | `LE:1980` | `return []` | SWALLOW-AND-SUBSTITUTE |
| C-5 | `_pbLG(){try{return JSON.parse(...)}catch(e){return[];}}` | `ST:707` | `return []` | SWALLOW-AND-SUBSTITUTE |
| C-6 | `_pbLG(){try{return JSON.parse(...)}catch(e){return[];}}` | `CA:397` | `return []` | SWALLOW-AND-SUBSTITUTE |
| C-7 | preset load from `bb_presets` | `LE:1761-1763` | `console.error("Failed to load presets", e)` | LOG-ONLY — **not user-visible** |
| C-8 | `pbLoad` | `LE:2093` | `pbToast('خطأ في التحميل: '+e.message)` | REPORTED |
| C-9 | `pbImport` | `LE:2126` | `pbToast('ملف غير صالح: '+err.message)` | REPORTED |
| C-10 | `pbImport` | `ST:765` | `pbToast("Invalid file")` | REPORTED — **drops `err.message`** |
| C-11 | `pbLoad` | `CA:435` | `pbToast('خطأ: '+e.message)` | REPORTED |
| C-12 | `pbImport` | `CA:438` | `pbToast('ملف غير صالح: '+err.message)` | REPORTED |

**Exactly three empty `catch(e){}` sites: `LE:1981`, `ST:708`, `CA:398`.** All
three are the same function, `_pbSav`, in three copies of the same preset-bar
component. **Exactly three swallow-and-substitute sites: `LE:1980`, `ST:707`,
`CA:397`** — also the same function, `_pbLG`, in the same three copies.

**C-1 to C-3 are the consequential ones, and the consequence is a false success
message.** The call sequence is identical in all three tools:

| Tool | Save calls `_pbSav` | Then unconditionally toasts |
|---|---|---|
| LE | `LE:2085` | `✓ تم حفظ "{name}"` — `LE:2087` |
| ST | `ST:708` via `pbSave` | `✓ Saved: {name}` — `ST:710` |
| CA | `CA:398` via `pbSave` | `✓ تم حفظ "{name}"` — `CA:432` |

`localStorage.setItem` throws on quota exhaustion. ST's presets embed Base64
images for four panel backgrounds and three QR codes (§1.2.g), which is precisely
the payload that exhausts a 5 MB origin quota. **The operator is told the work is
saved; nothing was written; the failure is unrecorded.** The same applies to
delete (`LE:2098`, `CA:436`) and to import (`LE:2124`, `CA:438`, `ST:765`), each
of which routes through `_pbSav` and then reports success.

**C-4 to C-6 destroy the slot list on any parse failure.** A corrupted
`localStorage` value makes `_pbLG` return `[]`; the next `_pbSav` writes that
empty array over the corrupted-but-possibly-recoverable original. One bad read
becomes a permanent loss of all eight slots, with no message at any point.

**C-7 is silent in a different way.** `bb_presets` is read at module scope on
every page load (`LE:1756`). If it is unparseable — and §8 shows that key is a
collision hazard — the operator gets no indication; the flavour library silently
falls back to built-ins and the tool looks like it is working.

| # | Defect | Correct behaviour |
|---|---|---|
| D-1 | Three empty `catch(e){}` blocks discard `localStorage` write failures, after which every caller reports success unconditionally. | A save that did not happen must be reported to the operator as a save that did not happen. |
| D-2 | Three `catch(e){return[]}` blocks convert an unreadable slot list into an empty one, which the next write then makes permanent. | Data that cannot be read must be preserved and surfaced, never silently replaced with an empty value that the next write commits. |
| D-3 | A `bb_presets` parse failure is logged to a console the operator will not open and reported nowhere in the interface (`LE:1761-1763`). | A failure to load a Tenant's saved content must be visible where the operator is looking. |
| D-4 | ST's import catch drops `err.message` and reports only `Invalid file` (`ST:765`), while LE and CA include it. | A rejection must say enough for the operator to know what to change. |

### 7.3 Silent-failure and false-confirmation defects

| # | Defect | File:line | Correct behaviour |
|---|---|---|---|
| D-5 | Saving with the slot list full silently discards the oldest preset with `_PBS.shift()` and reports only success. | `LE:2084`, `ST:710`, `CA:431` | Destroying a Tenant's stored work must be an explicit, acknowledged act. |
| D-6 | Saving under an existing name overwrites that slot without confirmation. | `LE:2084`, `ST:710`, `CA:431` | Replacing existing stored content must be distinguishable from creating new content. |
| D-7 | Importing a file whose `name` matches an existing slot overwrites it without confirmation. | `LE:2123`, `ST:765`, `CA:438` | Same as D-6, and more so when the name came from a file rather than the operator. |
| D-8 | Delete removes a slot immediately with no confirmation step; the toast is the first the operator hears of it. | `LE:2096-2099`, `ST:763`, `CA:436` | A destructive action must be confirmable or reversible. |
| D-9 | `savePreset()` writes the whole 74-field set into the active flavour preset and reports `✅ All settings saved` — but the write is to `localStorage['bb_presets']`, which §8 shows is a shared, unnamespaced key. | `LE:1885-1937` | A tool's stored content must not be addressable by a name another tool can claim. |
| D-10 | CA's `pbSave` reads the size tab but never `cType`, so a preset restores its saved colours and then has them overwritten by whatever style the dropdown still holds. | `CA:404-434`, applied at `CA:187-196` | Restoring saved content must restore all of it, and must not let unrestored interface state overwrite what was restored. |

### 7.4 Geometry and print defects

| # | Defect | File:line | Correct behaviour |
|---|---|---|---|
| D-11 | CA's artwork is laid out entirely in pixels with no conversion to any physical unit, so the printed carton has no defined scale to the carton it depicts. | `CA:168-171` (mm values inert), `CA:207-378` (all px) | An artifact that will be manufactured must carry a defined physical size. |
| D-12 | CA's mm figures in `SIZES` are rendered as caption text but drive no geometry, so the drawing and its stated dimensions can disagree without any signal. | `CA:168-171`, displayed `CA:151` | A stated dimension must be the dimension the geometry used. |
| D-13 | LE's five segments imply four different px-per-cm ratios (37.667 to 38.000), so no zoom level makes the screen agree with the print. | `LE:975-1063` vs screen rules | One conversion between screen and physical units, applied everywhere. |
| D-14 | ST declares `PX = 3.78` but two side-panel conversions use the literal `3.7795` instead. | `ST:457` vs `ST:641-642` | A conversion constant defined once is used everywhere it applies. |
| D-15 | ST's dual-DOM passes an `inner` markup string containing px font sizes and px logo circles into mm-dimensioned print containers, so the container scales and its contents do not. | `ST:680-687`, contents at `ST:558-663` | If a print DOM is expressed in physical units, everything inside it is too. |
| D-16 | CA prints the screen DOM directly with no print-specific DOM, so screen-fit decisions become print geometry. | `CA:380`, `@page` at `CA:68` | Screen presentation and print artifact must be independently determined. |
| D-17 | CA has no page-break control of any kind, so which faces land on which sheet is left to the browser. | grep: no `break-before`/`break-after`/`break-inside` in CA | Pagination of a manufacturing artifact must be deterministic. |
| D-18 | LE sets printed nutrition values at 0.6 mm (1.7 pt) and nutrition labels at 0.7 mm (2.0 pt), below the size at which consumer-grade printing reliably resolves glyphs. | `LE:1048`, `LE:1043` | Text with a legal purpose must print at a size where it can be read. |
| D-19 | All three depend on a Google Fonts CDN at run time, so the artifact's typography depends on network reachability at the moment of printing. | `LE:9`, `ST:7`, `CA:7` | An artifact must render identically without a network. |
| D-20 | All three require the operator to enable "Background graphics" manually or the artwork prints without its colour fields; only LE says so, in a hint. | `LE:1436`; absent in ST and CA | An artifact must not depend on an operator finding a checkbox in a browser dialog. |
| D-21 | LE's barcode is a fixed SVG path; the `Barcode #` field changes the printed digits but not one bar. | field `LE:1291`, render region `LE:1570-1578` | A machine-readable code must encode the value shown beneath it, or must not present itself as one. |
| D-22 | CA's barcode computes a checksum from the input and varies the bars, but the encoding is not a real symbology, so it scans as nothing while looking scannable. | `CA:209` | Same as D-21. |
| D-23 | ST's QR fields accept an uploaded image and render it as a QR code with no verification that it is one, or that it resolves. | `ST:236-239`, rendered `ST:601`, `:641-642` | A code placed on packaging must be verified to resolve before it is printed. |

### 7.5 Data-model defects

| # | Defect | File:line | Correct behaviour |
|---|---|---|---|
| D-24 | ST captures, persists and restores 14 fields it never renders — `prod1`–`prod5`, `p1Ar`–`p5Ar`, `wt`, `price`, `printTitles`, `printCenter`. | `ST:182-196`, `:275-276`; absent from `render()` `ST:462-699` | Content a Tenant enters is rendered, or is not collected. |
| D-25 | Two of those 14 are toggles that appear to control print behaviour and control nothing, because CSS overrides them unconditionally. | `ST:275-276` vs print CSS | A control that cannot change the outcome must not be presented as one. |
| D-26 | LE offers two website fields — `eWeb`, which is captured, persisted and restored but never rendered, and `eFooter`, which prints — with nothing to tell the operator which one reaches the artifact. | `eWeb` captured `LE:1918`, restored `LE:2042`, absent from every render; `eFooter` `LE:1255`, default `LE:1946` | Every field an operator can fill either reaches the artifact or is not offered. |
| D-27 | LE's six built-in flavour presets carry unequal field sets — three have the full record, three have four fields — so switching from a full preset to a partial one leaves the previous flavour's regulatory text in place. | `LE:1706-1750` | Switching between stored content sets must not leave fragments of the previous one. |
| D-28 | LE's preset-bar record embeds a deep clone of the entire flavour library, so loading one slot silently replaces every flavour definition with that slot's snapshot. | `LE:1965-1975` | Restoring one stored item must not overwrite an unrelated library. |
| D-29 | `bb_presets` is read and merged with `Object.assign` at top level, so a stored 4-field object replaces a 14-field built-in rather than filling it. | `LE:1756-1760` | Merging stored content with defaults must be defined field by field. |
| D-30 | ST exports `template: "bbstand"` but stores under `bbstand3`, so a file exported by an earlier version imports without any version signal. | export `ST:764`, key `ST:706` | Stored and exchanged content must carry a version its reader checks. |
| D-31 | ST's export omits the `date` field that LE and CA both include, so a re-imported ST file is stamped with the import date. | `ST:764` vs `LE:2104`, `CA:437` | An exchanged record keeps its own provenance. |
| D-32 | All three date fields are free text with no format, validation or calendar, and CA prints two of them onto the carton. | `LE:1259-1261`, `CA:107-108`, printed `CA:357` | A date printed on a food package must be a date. |
| D-33 | CA's expiry date is typed independently of the production date, with nothing relating the two. | `CA:107-108` | A derived date is derived, and a contradiction between the two is impossible to enter. |

### 7.6 Content and localisation defects

| # | Defect | File:line | Correct behaviour |
|---|---|---|---|
| D-34 | Four printed headings fuse English and Arabic into one string literal, so neither language can be changed, reordered or removed. | `LE:1557`, `:1562`, `:1580`, `:1588` | Each language is separately addressable content. |
| D-35 | CA fuses the same way in the opposite order, so the two tools print bilingual headings with opposite language precedence. | `CA:364` | Language order is a stated property of the artifact, not an accident of the literal. |
| D-36 | LE's storage and validity sentences exist in two mutually contradictory versions — "dry, well-ventilated" against "cool, dry" — and which one prints depends on whether a flavour button was clicked. | `LE:1299`/`:1951` vs `LE:1713`/`:1726`/`:1739` | One authoritative version of a regulatory sentence. |
| D-37 | LE's nutrition basis is 100 g in the defaults and 40 g in the presets, so the same tool prints two different serving bases with no indication which is in force. | `LE:1328`/`:1957` vs `LE:1718`/`:1731`/`:1744` | The declared basis for a nutrition panel is explicit and singular. |
| D-38 | LE mixes Arabic-Indic numerals in the default nutrition rows with Western numerals in the preset rows, inside otherwise identical Arabic sentences. | `LE:1333-1336` vs `LE:1720`, `:1733`, `:1746` | Numeral system is a locale setting, applied consistently. |
| D-39 | The nine preset operations are messaged in Arabic by LE and CA and in English by ST, and no message in that family exists in both languages. | §6.7, `LE:2079-2126`, `CA:426-438`, `ST:710-765` | Interface language is one choice applied to the whole interface. |
| D-40 | LE presents an English `alert()` in an interface whose preset bar and toasts are Arabic, and blocks on it. | `LE:1887`, `:1936` | Feedback is in the interface language and does not block. |
| D-41 | CA's operator works entirely in Arabic and the artifact prints `NET WT`, `UNITS`, `PCS`, `PROD DATE`, `EXP DATE` in English with no Arabic anywhere except the ingredients block. | `CA:269`, `:279`, `:297`, `:337`, `:357` | The artifact's language is chosen for the buyer, independently of the operator's. |
| D-42 | LE force-uppercases the Sub-Type field in CSS, and CA force-uppercases brand, type, badges, slogan, weight and both date captions, so none of those can be printed as written. | `LE:840`; `CA:251`, `:257`, `:262`, `:269-270`, `:301`, `:329`, `:357` | Case is the content author's decision. |
| D-43 | LE's Arabic default text uses `بعيدا` and `الانتاج` where the preset text uses the correctly-pointed `بعيدًا` and `الإنتاج`, so the same tool prints two orthographies. | `LE:1302` vs `LE:1714`; `LE:1306` vs `LE:1716` | Orthography is consistent within an artifact. |
| D-44 | CA's editor labels mix an English technical noun with an Arabic qualifier in nine controls — `Flavor (حجم)`, `عرض شريط Units` — leaving the interface half-translated. | `CA:122`, `:126-127`, `:130-131`, `:134-135`, `:138-139` | An interface is translated or it is not. |
| D-45 | The tools use two different Arabic typefaces — Amiri (serif) in LE, Tajawal (sans) in ST and CA — so a brand's Arabic looks different on its label and its carton. | `LE:9`, `:190` vs `ST:7`, `CA:7` | One brand, one Arabic typeface, chosen once. |
| D-46 | Preset dates are formatted `ar-EG` in LE and CA and `en-GB` in ST, so the same list shows two calendars depending on the tool. | `LE:2081`, `CA:427` vs `ST:710` | Date presentation follows the interface locale. |

### 7.7 Interface defects

| # | Defect | File:line | Correct behaviour |
|---|---|---|---|
| D-47 | LE's zoom control rescales the screen preview only and has no relationship to the printed size, so the operator's sense of scale is set by a control that does not affect the artifact. | `LE:1460` | A preview represents the artifact at a known relationship to its true size. |
| D-48 | ST's panel filter is presented as a view control and also silently determines which panels print. | `ST:435-438`, `setPanel` `ST:703` | Choosing what to look at and choosing what to print are different decisions. |
| D-49 | Two print buttons exist per tool with different code paths — LE's sidebar re-renders first and its preset-bar button does not — so the two are not guaranteed equivalent. | `LE:1434`→`:1706` vs `LE:2174`; `ST:426`, `:451`; `CA:143`, `:162` | Every route to printing produces the same artifact. |
| D-50 | Colour inputs offer the full 24-bit space with no contrast relationship between background and text, and CA's `isLight()` threshold of 145 silently flips text colour without telling the operator why. | `CA:197`, colour fields `CA:80-85` | Legibility of a printed artifact is guaranteed, and any automatic adjustment is visible to the operator. |

### 7.8 Explicitly NOT defects

Recorded to stop a later reader from mistaking a decision for a bug.

| Behaviour | Why it is not a defect |
|---|---|
| CA's A3 landscape with an 8 mm margin | A deliberate choice for a large multi-face sheet on a printer with a hardware margin. It is the family's only non-zero margin and therefore an **inconsistency** (§4), not an error. |
| ST's three print layouts (exact / A3 / A2) | A real requirement: proof at a reduced size, manufacture at exact size. |
| LE's segment sizes being fixed | The wrap is a manufactured item with fixed dimensions. Fixity is correct; the absence of any way to state those dimensions as data is the finding (§3.1). |
| Arabic-Indic numerals in LE's defaults | Valid Egyptian labelling practice. The **inconsistency** with the presets is D-38; the numerals themselves are not wrong. |
| Both tools shipping six built-in flavours | A Tenant's product catalogue, correctly seeded. That it is a hardcoded literal is §5, not a defect of behaviour. |
| ST's `clip-path` taper | A correct expression of a real trapezoidal side panel. |

**Tally.** Fifty numbered defects, D-1 to D-50, plus the two unnumbered
markup-handling defects stated in §7.1 — fifty-two in total across the three
files. Of the fifty numbered: four are error handling (D-1 to D-4), six are
silent failure (D-5 to D-10), thirteen are geometry and print (D-11 to D-23), ten
are data model (D-24 to D-33), thirteen are content and localisation (D-34 to
D-46), four are interface (D-47 to D-50).

**Site inventories are exhaustive, not sampled.** §7.1 lists all ten `innerHTML`
assignments — seven unescaped and user-derived, three constant — and confirms by
grep that no other HTML sink exists in any of the three files. §7.2 lists all
twelve `catch` blocks — three empty, three swallow-and-substitute, five
reporting, one log-only. **CF-02 and CF-03 now have complete site-level evidence
for the design family**, which is what those carry-forwards were opened to
collect. Neither closes here; both are owned by `FEATURE_INVENTORY.md` at P-07.

---
## PART 8 — CROSS-FILE COUPLING (CF-11)

### 8.1 Method, and the boundary observed

`AUDIT_STICKER.md` §3.1 found `balance-bites-sticker.html` is a full participant
in the shared business data layer, which falsifies `REPORT.md` §3.3's
"independent islands" conclusion for that file — and explicitly flagged that the
finding **cannot simply be inverted for the whole design family**. This Part
re-derives the question per file for the three tools in scope.

Four channels were tested against each file, by exhaustive grep over the whole
file for every API and key name in the class:

| Channel | Probe |
|---|---|
| Shared folder (File System Access API) | `showDirectoryPicker`, `showOpenFilePicker`, `showSaveFilePicker`, `getDirectoryHandle`, `SHARED_DATA` |
| `bb_filestore_v1` handle store | `indexedDB`, `IDBDatabase`, `bb_filestore` |
| Any `bb_*` localStorage key | `localStorage`, `sessionStorage`, and a literal scan of every key expression |
| Any business entity | `bb_products`, `bb_stickers`, `bb_color_presets`, `bb_label_open`, `bb_invoices`, and the entity names in `AUDIT_STICKER.md` §C |

**Boundary observed.** No line of `bb-stock-costs.html` or
`balance-bites-invoice-pro.html` was read. One key-name grep was scoped to
`legacy/*.html` and returned a single incidental match in `invoice-pro.html`;
that is declared in the report as a deviation and is discussed in §8.5. The
sticker tool's participation is taken from `AUDIT_STICKER.md`, not re-derived.

### 8.2 Per file

#### 8.2.a `legacy/balance-bites-label-editor- latest.html`

| Channel | Result | Evidence |
|---|---|---|
| Shared folder / FSA | **No** | Zero matches for the entire FSA family in 2,180 lines |
| `bb_filestore_v1` / IndexedDB | **No** | Zero matches for `indexedDB`, `IDBDatabase`, `bb_filestore` |
| `bb_*` localStorage keys | **Yes — one** | `bb_presets`: read `LE:1756`, write `LE:1935` |
| Other localStorage keys | One | `bblabel_pb` — read `LE:1980`, write `LE:1981`, key `_PBK='bblabel'` `LE:1976` |
| Business entity | **No** | No `bb_products`, `bb_stickers`, `bb_color_presets`, `bb_label_open`, no product id, no sticker id, no buyer reference anywhere |

**Complete storage footprint: two localStorage keys, nothing else.** No network
call other than the Google Fonts stylesheet (`LE:9`). No file write except the
operator-initiated `data:` URI download (`LE:2106`).

**Verdict: not coupled to the business data layer — but it is the one design tool
that occupies the shared `bb_*` namespace.** See §8.4.

#### 8.2.b `legacy/balance-bites-stand.html`

| Channel | Result | Evidence |
|---|---|---|
| Shared folder / FSA | **No** | Zero matches in 774 lines |
| `bb_filestore_v1` / IndexedDB | **No** | Zero matches |
| `bb_*` localStorage keys | **No** | Its only key is `bbstand3_pb` — prefix `bbstand3`, **not** `bb_` |
| Other localStorage keys | One | `bbstand3_pb` — read `ST:707`, write `ST:708`, key `_PBK="bbstand3"` `ST:706` |
| Business entity | **No** | The five product names (`ST:182-191`) are free-text fields, not references — no id, no lookup, and five of the ten are never rendered (§1.2.f) |

**Complete storage footprint: one localStorage key.** The only other persistence
is Base64 image data embedded inside that key's records (four panel backgrounds,
three QR codes).

**Verdict: fully isolated. Not coupled on any channel, and not even in the shared
namespace.**

#### 8.2.c `legacy/balance-bites-carton (2).html`

| Channel | Result | Evidence |
|---|---|---|
| Shared folder / FSA | **No** | Zero matches in 459 lines |
| `bb_filestore_v1` / IndexedDB | **No** | Zero matches |
| `bb_*` localStorage keys | **No** | Its only key is `bbcarton_pb` — prefix `bbcarton`, **not** `bb_` |
| Other localStorage keys | One | `bbcarton_pb` — read `CA:397`, write `CA:398`, key `_PBK='bbcarton'` `CA:396` |
| Business entity | **No** | No product reference. The pack size (24/48) is a UI mode (`CA:149-150`), not a catalogue link |

**Complete storage footprint: one localStorage key.**

**Verdict: fully isolated. Not coupled on any channel.**

### 8.3 The design family's complete storage surface

| Tool | FSA | IndexedDB | `bb_*` keys | Own keys | Business entities |
|---|---|---|---|---|---|
| LE | No | No | **`bb_presets`** | `bblabel_pb` | none |
| ST | No | No | none | `bbstand3_pb` | none |
| CA | No | No | none | `bbcarton_pb` | none |
| **SK** (per `AUDIT_STICKER.md`) | **Yes** — `showDirectoryPicker({mode:'readwrite'})` on `SHARED_DATA_PATH`, `AUDIT_STICKER.md` §3.1.a citing `sticker:1138`, `:1148` | **Yes** — `bb_filestore_v1`, store `h`, `sticker:1142` | **Eight**, `AUDIT_STICKER.md` §D-1 | `bbbacklabel_pb`, `pb2`, `pb3` (migration only) | **`Product` read, `Sticker` written, `ColorPreset` shared, `bb_label_open` handshake** — `AUDIT_STICKER.md` §C-4 |

**Three of four design tools are isolated; one is a full participant. The split
is not partial or graduated — it is total on both sides.** LE, ST and CA have
exactly one or two localStorage keys each, no IndexedDB, no FSA, no network
beyond a font stylesheet, and no reference to any business entity. SK has three
channels and eight shared keys.

### 8.4 `bb_presets` — namespace occupation without data sharing

LE is the only one of the three that writes a key matching the shared `bb_*`
convention, so it needs a precise answer rather than a category.

| Property | Value | Evidence |
|---|---|---|
| Key | `bb_presets` | `LE:1756`, `LE:1935` |
| Read | Module scope, every page load, before any user action | `LE:1756` |
| Merge | `presetsData = Object.assign({}, presetsData, parsed)` — shallow, top level, **no validation** | `LE:1760` |
| Write | Whole `presetsData` object, on `savePreset()` only | `LE:1935` |
| Value shape | `{ <flavourKey>: { …up to 74 fields… } }` — six built-in keys, non-uniform | `LE:1706-1750` |
| Failure handling | Read wrapped in `catch` → `console.error` only (C-7); write **unguarded** | `LE:1761-1763`; `LE:1935` has no `try` |
| Any other legacy file using this key | **None** | Grep for `'bb_presets'`/`"bb_presets"` across `legacy/*.html`: two matches, both `LE` |

**The collision is latent, not active.** Unlike `bb_color_presets` — where two
tools demonstrably write incompatible records under identical ids today —
`bb_presets` has exactly one writer. The hazard is the name: it is generic,
unversioned, unqualified by tool or entity, and sits in the same origin-wide
namespace the business tools use for `bb_products`, `bb_stickers` and
`bb_color_presets`. It is not in the sticker tool's `WRITE_KEYS` or `READ_KEYS`
(`AUDIT_STICKER.md` §D, quoting `sticker:1139-1140`), so `FileStore.loadAll()`
does not overwrite it from disk — the one mechanism that would have made the
collision active does not reach it.

**The requirement this yields:** stored content must be addressable by a name
that identifies the Tenant, the entity and the schema version, so that "a
preset" is never a claim on a shared word. LE also demonstrates the second half
of it — `LE:1760` merges a parsed blob into the live library with no shape check,
so whatever occupies the key becomes the flavour library.

**One further asymmetry, recorded because it bears on any migration.** LE holds
two unrelated preset systems (§1.1.f): Mechanism A in `bb_presets` and Mechanism
B in `bblabel_pb`. Mechanism B's records embed a deep clone of Mechanism A's
entire library (`LE:1965-1975`), so the same content exists in two keys under two
shapes, and the two can disagree. ST and CA have one mechanism each and no such
duplication.

### 8.5 The preset bar is shared code across the family — and beyond it

A grep for the key-prefix declaration `_PBK =` over `legacy/*.html` returns four
files:

| File | `_PBK` | localStorage key | Line |
|---|---|---|---|
| `balance-bites-label-editor- latest.html` | `'bblabel'` | `bblabel_pb` | `LE:1976` |
| `balance-bites-stand.html` | `"bbstand3"` | `bbstand3_pb` | `ST:706` |
| `balance-bites-carton (2).html` | `'bbcarton'` | `bbcarton_pb` | `CA:396` |
| `balance-bites-invoice-pro.html` | `'bbinv'` | `bbinv_pb` | `invoice-pro:3712` |

**Declared deviation.** The fourth row is a single incidental line returned by a
glob scoped to `legacy/*.html`. `invoice-pro.html` was not read, no other line of
it was seen, and `EXTRACT_INVOICE_PRO.md` remains the authority on that file. The
line is recorded because it materially changes the coupling picture and
suppressing it would hide a finding.

**Two things follow, and they point in opposite directions.**

*No data coupling.* The four keys are distinct — `bblabel_pb`, `bbstand3_pb`,
`bbcarton_pb`, `bbinv_pb`. None matches `bb_*`. None can read another's slots.
The eight-slot FIFO in one tool is invisible to the other three.

*Strong code coupling.* The same component — `_PBMAX = 8`, `_pbLG`, `_pbSav`,
`pbSave`, `pbLoad`, `pbDelete`, `pbExport`, `pbImport`, `pbRender`, `pbToast`,
`#presetBar`, `#pbSlots`, `#pbNameIn`, `.pbs-nm`, `.pbs-dt` — is copied into four
files. The copies have drifted: ST's `pbImport` drops `err.message` where LE's
and CA's keep it (§7.2 C-10); ST's export omits `date` where LE's and CA's
include it (D-31); LE's toasts are Arabic and ST's are English (D-39). **Every
defect in §7.2 exists in three or four copies**, which is why C-1, C-2 and C-3
are the identical empty `catch(e){}` in three files.

This is a duplication axis. `REPORT.md` §3.1's duplication matrix is not in this
task's scope to amend, and `AUDIT_STICKER.md` §3.3 records that the sticker tool
**removed** its 30-slot preset bar, so the axis is four copies and shrinking, not
five. Recorded as a finding for whoever owns that matrix.

### 8.6 REQUIRED SUB-ITEM — `bb_color_presets` (CF-49)

#### Per file — the direct answer

| File | Reads `bb_color_presets`? | Writes it? | Field set | Id scheme |
|---|---|---|---|---|
| `balance-bites-label-editor- latest.html` | **No** | **No** | **n/a — key absent** | **n/a** |
| `balance-bites-stand.html` | **No** | **No** | **n/a — key absent** | **n/a** |
| `balance-bites-carton (2).html` | **No** | **No** | **n/a — key absent** | **n/a** |

**All three: zero occurrences of `bb_color_presets`, zero occurrences of
`bb_active_color_preset_id`, zero occurrences of `bb_active_theme`.** Verified by
grep over each complete file. None of the three has a theme engine, a colour-role
abstraction or a saveable palette of any kind.

**What each does instead.** All three expose raw colour pickers bound directly to
render-time values, with no named roles, no saved sets and no persistence outside
their own preset record:

| Tool | Colour controls | Where they live |
|---|---|---|
| LE | 5 — `Background`, `Gold/Border`, `Arch Accent`, `Badge1 Color`, `Badge2 Color`, plus `Pattern` colour | `LE:1194-1212`; persisted inside `bb_presets` and `bblabel_pb` records |
| ST | 9 — 5 flavour colours, 4 panel backgrounds, plus pattern colour and 4 text/logo colours | `ST:164-174`, `:202-226`, `:259-266`; persisted inside `bbstand3_pb` |
| CA | 4 — `خلفية` (background), `ذهبي` (gold), `تمييز` (accent), `نص` (text), plus 4 named styles | `CA:80-85`, styles `CA:187-196`; persisted inside `bbcarton_pb` |

**So the design family contributes no third `ColorPreset` field set.** CF-49
anticipated one might exist; it does not, from these three. The only design-side
participant is the sticker tool.

#### Comparison against the two business field sets

Stated without resolution, per the prompt.

| Source | Field set | Id scheme | Authority |
|---|---|---|---|
| `invoice-pro.html` | **seven colours** | `cp_def1`–`cp_def4` | CF-49 as landed, from P-03 |
| `bb-stock-costs.html` | **six colours** | `cp_def1`–`cp_def4` | CF-49 as landed, from P-02 |
| Shared between the two | **`bg` and `gold` only** | identical ids | CF-49 as landed |
| `balance-bites-sticker.html` | `{id, name, bg, gold, txt, mut, row, tot, grand}` — **seven colour fields** plus `id` and `name` | seeds **`cp_def1`–`cp_def3`** only: `Dark Gold`, `Obsidian Blue`, `Forest Night` | Field set from `AUDIT_STICKER.md` §C-3; **ids and names read directly at `SK:1271-1276`** under the §2.1 spot-check |
| LE / ST / CA | **absent** | **absent** | this Part |

**A conflict between two artifacts, recorded and not resolved.** CF-49 as landed
states `bb-stock-costs.html` carries **six** colours. `AUDIT_STICKER.md` §C-3
states the sticker tool's set — which contains **seven** colour fields (`bg`,
`gold`, `txt`, `mut`, `row`, `tot`, `grand`) — is an "identical field set to
`bb-stock-costs.html:1347-1350`", and §3.4 repeats it as "same field set
(`:1273` ≡ `bb-stock-costs.html:1347`), different population". Both statements
cannot hold as written unless the two counts were taken over different key sets.

This is not resolvable from within P-04: the prompt forbids reading
`bb-stock-costs.html`, and the bounded clause permits opening the sticker tool
only for the Part 2 verdict, not for Part 8. **Recorded as a discrepancy between
CF-49's text and `AUDIT_STICKER.md` §C-3, for reconciliation at Gate 1 by a
reader who holds both extracts.** No winner chosen. No field list invented.

**The id-count divergence is separately confirmed and is not in dispute.** Both
business tools seed `cp_def1`–`cp_def4` per CF-49; the sticker tool seeds
`cp_def1`–`cp_def3` only, verified directly at `SK:1272-1276` — the `DEFAULTS`
array has exactly three members. `AUDIT_STICKER.md` §3.4 records the consequence:
both tools write the same key, both mirror it to the shared folder, and
"whichever tool seeds first wins"; if the operator is on the fourth preset and
the sticker tool's seeding path runs against an empty store,
`bb_active_color_preset_id` dangles.

**But §3.4's naming of that fourth preset must not be relied upon.** It calls the
fourth "Warm Ivory" and names the sticker tool's three as "Balance Bites", "Dark
Mode" and "Ocean Blue" — and §2.1 shows all three of those sticker-side names are
falsified by direct read. A section that is wrong about the three names it could
have checked is not authority for the one name it is the only record of.
**Recorded: the fourth preset's identity is unverified.** The count divergence
(three against four) stands on CF-49 plus a direct read; the name does not stand
on anything this task could verify.

#### What turns on the choice

Recorded as consequences, not as a recommendation.

| If the canonical `ColorRole` set is… | Then |
|---|---|
| the **larger** set | The smaller writer's records gain roles it never populated; every stored preset from that side needs a defined value for the missing roles, and "unset" must be distinguishable from "set to a default". |
| the **smaller** set | Roles present only in the larger writer are dropped; any artifact that rendered using them changes appearance, and the drop is silent unless it is recorded per record. |
| the **union** | No data is lost, but no writer's stored records are complete, so every consumer must handle absent roles — which is the condition that produced the collision. |
| the **intersection** (`bg` + `gold`) | Reduces the shared vocabulary to two roles, which is smaller than any single tool's palette and smaller than the design family's smallest (CA's four). |

**Three further facts bear on it, all established here:**

1. **The design family's colour controls are not roles.** LE's five, ST's nine and
   CA's four are bound to render sites directly; none carries a semantic name that
   maps onto `bg`/`gold`/`txt`/`mut`/`row`/`tot`/`grand`. CA is the closest — its
   four are `bg`, `gold`, `acc`, `txt` (`CA:219`) — and it shares three names with
   the business set while adding `acc`, which appears in neither.
2. **`ColorPreset` is a document-theme concept, not a packaging one.** `row`,
   `tot` and `grand` are table-row, total and grand-total colours: they belong to
   an invoice or a report, not to a carton. Whatever set is canonicalised, the
   packaging half will use a subset and the document half a superset.
3. **The collision is confined to the tools that opted into the shared key.**
   Three of the four design tools never touch it, which means the canonical
   decision can be made from the business tools plus the sticker tool alone.

### 8.7 CF-11 — what `REPORT.md` §3.3 should have said

`REPORT.md` §3.3 concluded the tools are **independent islands with no shared
runtime data**. `AUDIT_STICKER.md` §3.1 falsified that for one file and warned
against inverting it wholesale. Having now re-derived the other three, the
warning was correct: **inverting it would be as wrong as the original.**

The accurate statement, in substance:

> **The legacy set is not a set of independent islands, and it is not a coupled
> system. It is two isolated tools, one namespace-adjacent tool, and three
> participants in a shared data layer — and the boundary does not follow the
> business/design split it appears to follow.**
>
> 1. **Coupling is per file, not per family.** The design family divides
>    absolutely: `balance-bites-stand.html` and `balance-bites-carton (2).html`
>    hold one localStorage key each, no IndexedDB, no File System Access API and
>    no reference to any business entity; `balance-bites-sticker.html` holds
>    three channels and eight shared keys. There is no middle case. Any
>    statement scoped to "the design tools" is false for one side of that line.
>
> 2. **The shared layer has three participants, not two.** `invoice-pro.html`,
>    `bb-stock-costs.html` and `balance-bites-sticker.html` share one absolute
>    folder path, one `bb_filestore_v1` IndexedDB handle store, and a set of
>    `bb_*` localStorage keys. §3.3 counted the design family out of this layer
>    entirely; one of its members is the third `FileStore` implementation
>    (`AUDIT_STICKER.md` §3.3, `sticker:1136-1183`).
>
> 3. **"No shared runtime data" was false in both directions.** It missed a real
>    channel — the sticker tool reads `bb_products` and writes `Sticker.templateKey`
>    — and it also missed that the channel is **defective**: sticker-side writes
>    to `bb_stickers` never reach disk and are overwritten by the next
>    `loadAll()` (`AUDIT_STICKER.md` §3.1.c, H-2). The tools share data in one
>    direction reliably and in the other not at all. A conclusion of "isolated"
>    and a conclusion of "integrated" are both wrong; the true state is
>    *asymmetrically and unreliably coupled*.
>
> 4. **Namespace occupation is not data sharing, and must be reported
>    separately.** `balance-bites-label-editor- latest.html` writes `bb_presets`
>    (`LE:1935`) — a key in the shared `bb_*` namespace, on the shared origin,
>    with a generic unversioned name — while sharing no data with anything. It is
>    the only latent collision in the set: one writer today, no schema, no
>    validation on read (`LE:1760`), and a name any tool could claim. §3.3's
>    binary framing had no category for this and so recorded it as isolation.
>
> 5. **The real coupling in the design family is code, not data.** The same
>    eight-slot preset-bar component is copied into four files with four distinct
>    keys — `bblabel_pb`, `bbstand3_pb`, `bbcarton_pb`, `bbinv_pb` — crossing the
>    business/design boundary that §3.3 treated as the axis of separation. The
>    copies have drifted in language, in error reporting and in export shape, and
>    every defect in one exists in three or four. Data isolation and code
>    duplication are orthogonal, and §3.3 reported only the first.
>
> 6. **Consequently the axis §3.3 chose was wrong.** The set does not divide into
>    "business tools" and "design tools". It divides into *tools that opted into
>    the shared folder* — `invoice-pro`, `bb-stock-costs`, `sticker` — and *tools
>    that did not* — `label-editor`, `stand`, `carton`. That line runs through
>    the design family, not around it.

**CF-11 is answered. It does not close here** — the prompt directs that it closes
at Gate 1, and this Part supplies the evidence for that closure.

---
## PART 9 — CLOSING: WHAT THIS SUPPLIES AND WHAT IT DOES NOT

### 9.1 Carry-forwards this pass supplies evidence for

**Nothing closes here.** P-04 supplies evidence; Gate 1 closes.

| CF | What P-04 supplies | Closes |
|---|---|---|
| CF-02 | Complete site inventory: all 10 `innerHTML` assignments, 7 unescaped and user-derived; grep-confirmed that no other HTML sink exists in the three files (§7.1) | `FEATURE_INVENTORY.md` at P-07 |
| CF-03 | Complete site inventory: all 12 `catch` blocks — 3 empty, 3 swallow-and-substitute, 5 reporting, 1 log-only (§7.2) | `FEATURE_INVENTORY.md` at P-07 |
| CF-11 | Per-file coupling re-derived for all three; the corrected §3.3 statement (§8.2, §8.7) | Gate 1 |
| CF-12 | The last three line counts: 2,180 / 774 / 459, all **exact** against `REPORT.md` (§0.1) | Gate 1 |
| CF-22 | The full LE↔SK capability delta and an explicit verdict (§2.2, §2.5) | Gate 1 |
| CF-49 | Per-file answer for all three: **none reads or writes `bb_color_presets`**; no third field set exists in the design family (§8.6) | `DOMAIN_MODEL.md` at P-07 |

### 9.2 What this seeds

| Artifact | Section |
|---|---|
| `CONTENT_MODEL.md` | §3.2 — 106 content slots enumerated across the three output types read this session (LE 44, ST 41, CA 21), plus the sticker tool's slot groups carried from `AUDIT_STICKER.md` at §3.2.d rather than re-derived |
| `TEMPLATE_MODEL.md` | §3.3 — 40 degrees of freedom, 27 MUST / 13 ARTIFACT; §3.1 — seven physical output types |
| `PRINT_CONTRACT.md` | §4 — 11 `@page` rules, 10 of them zero-margin; §3.4.b — four disagreeing px↔real-unit constants; §3.5 — no die-line precedent exists |
| `BRAND_CONFIG.md` | §5 — the configurable/hardcoded table and the 15 single-tenant assumptions |
| `FEATURE_INVENTORY.md` | §7 — 50 numbered defects plus the 2 markup defects, and §7.8's explicit not-defects |
| `DOMAIN_MODEL.md` | §1 — typed field lists for every stored record; §8.6 — the `ColorPreset` collision |

### 9.3 Findings this pass could not resolve, and why

Recorded so no later reader mistakes an absence for an oversight.

| # | Question | Why unresolved |
|---|---|---|
| 1 | Four questions in the LE↔SK delta that depend on label-v3 behaviour | `balance-bites-label-v3.html` is permanently deleted; `REPORT.md` §2.2 and `AUDIT_STICKER.md` §1.1/§1.2 do not record them. Marked unresolvable at §2.4, per the bounded-evidence clause. |
| 2 | Whether `bb-stock-costs.html`'s `ColorPreset` carries six colour fields (CF-49 as landed) or seven (`AUDIT_STICKER.md` §C-3's identical-field-set claim) | Reading `bb-stock-costs.html` is forbidden by this prompt, and the bounded clause permits opening the sticker tool only for the Part 2 verdict. Recorded as an artifact-vs-artifact discrepancy at §8.6 for Gate 1. |
| 3 | Which numeral system — Arabic-Indic or Western — a Tenant's Arabic artifact should use | LE uses both, in the same file, with nothing recording intent (§6.4). Owner-specified. |
| 4 | Whether the conical unwrap in label-v3 differed from the sticker tool's | `REPORT.md` §2.2 records that label-v3 had "conical unwrap math" and gives no expression, inputs or constant. One live version, one unrecoverable version, no comparison possible (§3.4.a). |
| 5 | The identity of the fourth `ColorPreset` seed that `bb-stock-costs.html` has and the sticker tool lacks | `AUDIT_STICKER.md` §3.4 calls it "Warm Ivory", but §2.1 falsifies all three of the sticker-side names in that same sentence by direct read, so it is not authority for the fourth. Reading `bb-stock-costs.html` is forbidden by this prompt. The **count** divergence is confirmed; the **name** is not. |

### 9.4 The one-sentence result

**Four retiring tools, 388 controls, and the shape of the answer is that the
tools were right about what the physical substrate must be able to vary and wrong
about what its contents must be able to vary** — every substrate dimension in
§3.3 is a MUST and every free-positioning and per-element-typography control is
an ARTIFACT, which is the same line the frozen template-driven decision draws.

---

*End of `EXTRACT_DESIGN_TOOLS.md`. Read-only extraction; no legacy file was
modified. Three files written this session, per the prompt: this file,
`SESSION_CONTEXT.md`, `DEVELOPMENT_JOURNAL.md`.*
