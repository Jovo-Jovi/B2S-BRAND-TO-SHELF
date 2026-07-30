> **REQUIREMENTS EVIDENCE.** Extracted from a retiring tool. Records what the
> tool did and what its owner expects. NOT a specification, NOT current truth,
> NOT a parity target. Where this conflicts with a frozen document in
> docs/product/, the frozen document wins.

# EXTRACT — `legacy/balance-bites-invoice-pro.html`

**Task:** P-03 · **Role:** Requirements analyst · **Mode:** read-only on `legacy/`

**Purpose.** This tool is being retired, not ported. No code is reused, no output
is a parity target. This document extracts the *requirements it encodes* —
entities, relationships, calculations, workflows, payments, and the
configurable-versus-hardcoded split — so B2S can be specified without losing
anything the tool taught its owner to expect. Where the tool does something
badly, this records **what it achieves**. Where it is inconsistent, this records
the inconsistency as **a decision B2S must make**. No fixes are proposed. No
schema, stack, framework, layering or folder structure is recommended.

Part 9 reconciles this extraction against `EXTRACT_STOCK_COSTS.md` (P-02). No
DIVERGENT item is resolved here; choosing a winner is not this task's authority.

---

## 0. Provenance and reading record

### 0.1 Verified line count

Counted this session via `C:\Program Files\Git\bin\bash.exe`:

| Method | Result |
|---|---|
| `wc -l legacy/balance-bites-invoice-pro.html` | **4283** |
| `wc -c` (bytes) | **222321** |
| `tail -c 1 \| od -c` | `\n` — file is newline-terminated |
| Read tool, final chunk | last content line is **4283** = `</html>`; a trailing newline yields a 4284th display position |

**Verified: 4283 newline-terminated lines; 4284 as displayed by an editor that
counts the trailing empty position.**

**Reconciliation against the two supplied figures:**

| Figure | Source | Verdict |
|---|---|---|
| **4,284** | session carry-forward **CF-12** | **SUPPORTED.** Exact match to the displayed count. |
| **3,498** | `REPORT.md` §2.1 heading (`REPORT.md:56`) | **FALSIFIED.** Understates by **785 lines (−18.3%)**. |

No HALT condition. The prompt's HALT trigger requires the count to differ
materially from *both* figures; it matches one exactly.

### 0.2 Reading record

Read **completely, sequentially, no sampling**, in **11 chunks**:

| # | Range | # | Range |
|---|---|---|---|
| 1 | 1–400 | 7 | 2401–2800 |
| 2 | 401–800 | 8 | 2801–3200 |
| 3 | 801–1200 | 9 | 3201–3600 |
| 4 | 1201–1600 | 10 | 3601–4000 |
| 5 | 1601–2000 | 11 | **4001–4283** |
| 6 | 2001–2400 | | |

**The final chunk reached the last line.** Chunk 11 terminates at `:4283`
(`</html>`), preceded by `:4281` (`</script>`) and `:4282` (`</body>`). Targeted
re-reads were performed over `:1211–1335`, `:2237–2336` and `:2396–2555` to fix
exact line numbers before citation; those are re-reads of already-read ranges,
not additional coverage.

Every `file:line` in this document was read in this session. No line number is
inherited from `REPORT.md` or any other document. Where `REPORT.md` is quoted,
it is quoted as a *claim* and the actual location is given beside it (§0.4).

### 0.3 Redaction sweep — result: nothing required redaction

Searched the full file for credentials, keys, tokens, connection strings, OS
account names, absolute local paths and real buyer PII.

| Pattern class | Result |
|---|---|
| `password` / `secret` / `token` / `api_key` / `apikey` / `bearer` / `Authorization` | **0 matches** |
| Windows absolute paths (`C:\…`) | **0 matches** |
| `file:///` | **0 matches** |
| OS account name | **0 matches** |
| Any URL scheme (`://`) | **3 matches, all identical Google Fonts CSS URLs** — `:7`, `:1886`, `:2155` |
| Real buyer PII (names, phones, addresses) | **0 matches.** The tool ships no seeded buyer records. `bb_customers` has no defaults — `CustomerMgr.getAll()` returns `[]` when unseeded (`:1369`), unlike categories (`:1514`) and products (`:1576`) which seed. The only phone-shaped literal is the input placeholder mask `+20 1xx xxx xxxx` (`:648`), which is a mask, not a number. |

**No `<REDACTED>` span appears anywhere in this document, because none was
needed.** Grep of this output file for `REDACTED` is reported in the closing
section.

**A PII requirement does nonetheless fall out of this file and is recorded in
Part 6 §6.4 and Part 8 §8.14:** the tool *stores* buyer names, phones and
addresses in plaintext `localStorage` and plaintext `bb_customers.json` on disk,
and the whole-app preset export (`:3743-3751`, `:3803-3804`) writes buyer name
and phone into a downloadable JSON. That is a property of the *data at runtime*,
not of the *source*, so nothing in the source needed redacting.

### 0.4 `REPORT.md` §2.1 citation drift — re-derived, non-linear, confirmed

CORRECTION 2 instructed that `REPORT.md`'s citation drift for this family is
non-linear and that no offset repairs a citation. **Confirmed for this file.**
Every `REPORT.md` §2.1 citation was re-derived against a line read this session.

| `REPORT.md` claims | Claimed | **Actual** | Drift |
|---|---|---|---|
| `<html lang="ar" dir="rtl">` (`REPORT.md:120`) | `:2` | **`:2`** | **0** |
| `فاتورة جديدة` (`REPORT.md:113`) | `:453` | **`:491`** | +38 |
| `@page` invoice rule (`REPORT.md:116`) | `:260-261` | **`:265-266`** | +5 |
| `BB` monogram in DOM (`REPORT.md:97`) | `:509`, `:792` | **`:547`**, **`:866`** | +38, +74 |
| `EGP` currency field (`REPORT.md:101`) | `:516` | **`:554`** | +38 |
| Editor panel, 7 accordions (`REPORT.md:61`) | `:467-672` | **`:486-755`** (accordion heads `:506`, `:539`, `:623`, `:662`, `:681`, `:721`, `:735`) | +19 / +83 |
| Meta bar (`REPORT.md:62`) | `:806-816` | **`:880-900`** | +74 / +84 |
| `MANAGED` key list (`REPORT.md:86`) | `:953` | **`:1064`** | +111 |
| IndexedDB `bb_filestore_v1` (`REPORT.md:87`) | `:959-960` | **`:1070-1071`** | +111 |
| `showDirectoryPicker` (`REPORT.md:88`) | `:1020` | **`:1131`** | +111 |
| `getFileHandle(key+'.json')` read (`REPORT.md:88`) | `:1033-1037` | **`:1144-1148`** | +111 |
| Per-key write (`REPORT.md:88`) | `:1046` | **`:1157-1160`** | +111 |
| `Store` abstraction (`REPORT.md:89`) | `:1087-1096` | **`:1196-1209`** | +109 |
| Colours `C` (`REPORT.md:82`) | `:1103-1104` | **`:1214-1215`** | +111 |
| Settings `S` (`REPORT.md:81`) | `:1106-1119` | **`:1217-1239`** | +111 |
| Colour preset defaults (`REPORT.md:82`) | `:1137-1142` | **`:1257-1262`** | +120 |
| Unescaped preset `innerHTML` (`REPORT.md:123`) | `:1181-1190` | **`:1301-1310`** | +120 |
| `DEFAULT_CATEGORIES` (`REPORT.md:77`) | `:1200-1204` | **`:1320-1324`** | +120 |
| `DEFAULT_PRODUCTS` (`REPORT.md:83`) | `:1207-1211` | **`:1327-1331`** | +120 |
| `CustomerMgr` / `KEY='bb_customers'` (`REPORT.md:63`,`:76`) | `:1243` | **`:1367`** / **`:1368`** | +124 |
| `CategoryMgr` / `KEY='bb_categories'` (`REPORT.md:64`,`:77`) | `:1370` | **`:1509`** / **`:1510`** | +139 |
| `ProductMgr` / `KEY='bb_products'` (`REPORT.md:65`,`:78`) | `:1432` | **`:1571`** / **`:1572`** | +139 |
| Product record literal (`REPORT.md:78`) | `:1444` | **`:1584`** | +140 |
| `PriceListPrint` `@page` (`REPORT.md:68`,`:117`) | `:1626` | **`:1766`** | +140 |
| `esc()` in print builders (`REPORT.md:117`) | `:1698` | **`:1740-1742`** | +42 |
| Price-list `window.open` self-print (`REPORT.md:117`) | `:1749-1750` | **`:1889-1890`** | +140 |
| Invoice save (`REPORT.md:58`,`:80`) | `saveInvoiceToHistory` `:2476` / `:1854-1861` | **`saveCurrentInvoice` `:2244-2284`**, record literal **`:2260-2274`**; the named function `saveInvoiceToHistory` is a *different* wrapper at **`:3128`** | +390 / +652 |
| Duplicate invoice (`REPORT.md:71`,`:126`) | `:1909-1918`, `:1909-1912` | **`:2313-2328`**, **`:2317-2321`** | +404 / +409 |
| Per-buyer numbering (`REPORT.md:90`,`:126`) | `:2600-2609` | **`:3330-3342`** | +730 |
| `loadInvoiceFromCustHist` (`REPORT.md:67`) | `:2613` | **`:3345`** | +732 |
| Preset bar `bbinv_pb` (`REPORT.md:86`) | `:2979-2980` | **`:3712`, `:3716-3717`** | +733 |
| Whole-state export (`REPORT.md:73`,`:127`) | `:2975-3011`, `:3008-3011` | **`:3709-3838`**, **`:3743-3751`** | +734 / +735 |
| Init async IIFE (`REPORT.md:128`) | `:1129` | **`:4164`** | **+3035** |

**Drift profile: 0 → +38 → +111 → +140 → +390 → +652 → +735 → +3035.** Strictly
non-linear and monotonically widening except at the head. The `+3035` outlier is
the same class of failure `EXTRACT_STOCK_COSTS.md` §0.4 recorded at bootstrap.
**No single offset repairs any citation.** Every `REPORT.md` §2.1 line number is
unusable as given.

**Substantive `REPORT.md` §2.1 content errors found while re-deriving** (recorded
as facts about `REPORT.md`, not as defects in the legacy tool):

1. **`REPORT.md:86` lists 8 `MANAGED` keys. There are 10** (`:1064`). It omits
   **`bb_invoice_payments`** and **`bb_returns`** — the two keys that carry the
   entire payments and returns surface. Those two omissions are why §2.1 contains
   no payments or returns discussion at all.
2. **`REPORT.md:76`** gives Buyer as `{id, name, phone, address, notes}`. The
   record also carries **`createdAt`** (`:1377`).
3. **`REPORT.md:80`** gives the Invoice field list with a trailing `…`. The
   omitted field is **`savedAt`** (`:2273`). There is no other.
4. **`REPORT.md:58`** calls this tool "the invoicing front-end and **data
   producer**". For `bb_customers`, `bb_products`, `bb_categories`,
   `bb_invoices`, `bb_color_presets`, `bb_active_color_preset_id` and `bb_inv2`
   that is correct. For **`bb_returns` and `bb_invoice_payments` it is wrong** —
   this tool never writes either (§1.0.4, Part 4, Part 5). This matters for
   PART 9 R4, whose premise is that invoice-pro produces returns. It does not.
5. **`REPORT.md:117`** says "User content escaped with `esc()` in the table
   builders". True, but there are **three** independent escape functions
   (`:1342-1344`, `:1740-1742`, `:1962-1964`) and escaping is applied **only** in
   the two print-document builders and the return-details block. Every on-screen
   report, card and banner renderer concatenates raw (Part 8 §8.1).
6. **`REPORT.md:70`** cites `completePendingInvoice` at `:454`. `:454` is not
   that function; the function is at **`:3274`**.

### 0.5 Method notes and scope observations

- **Vocabulary discipline.** Tool identifiers are quoted verbatim in backticks
  and are never translated. B2S-side analysis, headings and table columns use the
  `VOCABULARY_DRAFT.md` §1.2 resolved terms: **Buyer** (not customer),
  **InvoiceLine** (not line/item), **ProductCategory** (not category),
  **BrandTheme** (not preset), **DocumentTemplate** (not template),
  **StockMovement** (not stock). Every disagreement between the two is recorded
  in §1.5, not silently resolved.
- **Field lists are complete.** Every entity in §1.1 carries a complete typed
  field list derived from the record literal that constructs it, plus every field
  read anywhere in the file that the literal does not construct. Where a field is
  read but never written by this tool, it is marked *(read-only, foreign)*.
  **This is stated explicitly per the done-when criterion.**
- **Rounding is stated for every calculation in Part 2**, including the many
  where the answer is the literal phrase *"none stated in source"*.
- **No correctness audit.** Where behaviour is surprising it is recorded as a
  requirement, a policy choice, or a Part 8 item — never as a bug to be fixed.
- **`legacy/` was not modified.** `EXTRACT_STOCK_COSTS.md` was read, not modified.
  No design tool was read; those are P-04's.

---

## PART 1 — ENTITY AND RELATIONSHIP MODEL

### 1.0 Storage topology (the substrate all entities sit on)

Understanding the three-layer substrate is a precondition for reading §1.1,
because *where* an entity lives determines who may write it.

#### 1.0.1 Layer 1 — `localStorage`, wrapped by `Store` (`:1193-1208`)

```
Store.get(key, fallback)  :1197-1200   JSON.parse; catch → return fallback   :1199
Store.set(key, val)       :1201-1205   JSON.stringify; catch(e){}  :1202
                                       then FileStore.writeKey(key, val)     :1204
Store.remove(key)         :1206-1208   catch(e){}                            :1207
```

`Store.set` is the **only** path that mirrors to disk (`:1204`). Every manager
writes through it — with one exception (§1.0.5).

#### 1.0.2 Layer 2 — IndexedDB, handle persistence only (`:1067-1092`)

Database **`bb_filestore_v1`**, version 1, object store **`h`** (`:1070-1071`),
single record under key **`'dir'`** (`:1098`, `:1133`). It stores **only** the
File System Access directory handle. **No business data is ever placed in
IndexedDB.**

#### 1.0.3 Layer 3 — File System Access API, the shared folder (`:1061-1191`)

```
FSA supported?   'showDirectoryPicker' in window                      :1065
restore()        idbGet('dir') → queryPermission({mode:'readwrite'})  :1095-1107
requestAccess()  requestPermission({mode:'readwrite'}) — needs gesture:1110-1122
connect()        showDirectoryPicker({mode:'readwrite',
                                      startIn:'documents'})           :1131
                 then idbSet('dir', handle)                           :1133
loadAll()        for every MANAGED key: read <key>.json,
                 JSON.parse to validate, write into localStorage      :1139-1151
writeKey(k,v)    guard MANAGED.indexOf(k)<0 → return                  :1155
                 createWritable → write(JSON.stringify(v,null,2))     :1157-1159
```

**`MANAGED` (`:1064`) — ten keys:**

```
bb_customers · bb_products · bb_invoices · bb_categories · bb_color_presets
bb_inv2 · bb_active_color_preset_id · bb_pending_invoices
bb_invoice_payments · bb_returns
```

#### 1.0.4 The pull/push asymmetry — load-bearing, and a Part 9 divergence

`loadAll()` (`:1139-1151`) pulls **all ten** `MANAGED` keys from disk into
`localStorage`. `writeKey()` (`:1154-1162`) is reachable **only** from
`Store.set` (`:1204`).

Enumerating every `Store.set` call site in the file (`:1266`, `:1269`, `:1283`,
`:1284` *(remove)*, `:1371`, `:1514`, `:1517`, `:1576`, `:1579`, `:2185`,
`:2242`, `:2553`, `:4231`) gives the set of keys this tool can ever write:

| Key | Pulled by `loadAll` | Pushed by this tool | Writer |
|---|---|---|---|
| `bb_customers` | yes | **yes** (`:1371`) | this tool |
| `bb_products` | yes | **yes** (`:1576`, `:1579`) | this tool |
| `bb_categories` | yes | **yes** (`:1514`, `:1517`) | this tool |
| `bb_invoices` | yes | **yes** (`:2242`) | this tool |
| `bb_color_presets` | yes | **yes** (`:1266`, `:1269`) | this tool |
| `bb_active_color_preset_id` | yes | **yes** (`:1283-1284`) | this tool |
| `bb_inv2` | yes | **yes** (`:2553`, `:4231`) | this tool |
| `bb_pending_invoices` | yes | **yes** (`:2185`) | shared — created by `bb-stock-costs`, updated here |
| **`bb_invoice_payments`** | **yes** | **NO** | `bb-stock-costs` only |
| **`bb_returns`** | **yes** | **NO** | `bb-stock-costs` only |

**There is no `syncAllToFolder` in this file.** The mirror discipline is
*pull-all-on-connect, push-per-key-on-write*. Because `Store.set` is never called
with `bb_returns` or `bb_invoice_payments`, **this tool cannot overwrite either
file.** It is a strict consumer of both.

This is the single most consequential structural fact in the extraction. It
inverts the premise of PART 9 R4 and it is a direct divergence from
`bb-stock-costs`, which has a whole-set writer. Recorded as DIVERGENT in §9.3.1.

#### 1.0.5 The one storage path that bypasses `Store`

`_pbLG()` (`:3716`) and `_pbSav(a)` (`:3717`) call `localStorage.getItem` /
`localStorage.setItem` **directly** on key `bbinv_pb` (`_PBK='bbinv'`, `:3712`).
This key is **not in `MANAGED`**, so the whole-app BrandTheme snapshot is never
mirrored, never shared, and never recovered by a folder reconnect. It is the only
entity in the tool that is local to one browser profile.

#### 1.0.6 Tenancy shape of the substrate

Every key is a **bare global string**. There is no tenant, business, branch or
account segment in any key, in any filename, or in any record. `bb_inv2` is a
**singleton settings record** — one `{C, S, items}` object for the entire
installation (`:2553`). One folder is one business; two businesses require two
folders and two browser profiles. Enumerated as a tenancy requirement in §6.5.

---

### 1.1 Business entities

Eleven entities are created, read or referenced. Each field list below is
**complete**: derived from the constructing record literal, then extended with
every field read anywhere in the file that the literal does not construct.

---

#### 1.1.1 Buyer — the tool calls it `customer` (`bb_customers`)

**Module** `CustomerMgr` `:1367-1504` · **Key** `'bb_customers'` `:1368` ·
**Identity** `id` · **Storage** `localStorage` + `bb_customers.json`

| Field | Type | Source | Default / note |
|---|---|---|---|
| `id` | string | `:1377` | `genId('c')` → `'c_' + Date.now() + '_' + base36(3)` (`:1349-1351`) |
| `name` | string | `:1377` | `data.name \|\| ''` |
| `phone` | string | `:1377` | `data.phone \|\| ''` — free text, no format validation |
| `address` | string | `:1377` | `data.address \|\| ''` |
| `notes` | string | `:1377` | `data.notes \|\| ''` |
| `createdAt` | string (ISO 8601) | `:1377` | `new Date().toISOString()` |

**`createdAt` is the only creation timestamp on any entity in this tool.**
There is no `updatedAt`: `update()` (`:1383-1389`) does
`Object.assign({}, arr[idx], data)` and adds no stamp.

- **Insertion order:** `unshift` (`:1378`) — newest first, and this ordering *is*
  the display order; there is no sort anywhere.
- **Update semantics:** merge, not replace (`:1387`). Unknown fields on an
  existing record survive an edit.
- **Delete:** hard, unconditional filter (`:1391-1393`). A `confirm()` guards the
  UI (`:1482`) but no referential scan runs.
- **No defaults are seeded.** `getAll()` (`:1369`) returns `[]`. Contrast
  `:1514` and `:1576`.
- **Validation:** name required, enforced only in the form handler
  (`'الاسم مطلوب!'`, `:3655`). `add()` itself accepts an empty name.

---

#### 1.1.2 ProductCategory — the tool calls it `category` (`bb_categories`)

**Module** `CategoryMgr` `:1509-1566` · **Key** `'bb_categories'` `:1510` ·
**Identity** `id` · **Storage** `localStorage` + `bb_categories.json`

| Field | Type | Source | Default / note |
|---|---|---|---|
| `id` | string | `:1522` | `genId('cat')`; seeded records use `'cat_def_1'..'cat_def_3'` (`:1321-1323`) |
| `name` | string | `:1522` | `(name\|\|'').trim() \|\| 'تصنيف'` — bilingual by convention, `AR · EN` |
| `color` | string (hex) | `:1522` | `color \|\| '#c9a84c'` |

- **Seeded on first read** with `DEFAULT_CATEGORIES` (`:1320-1324`) via
  `if(arr === null){ Store.set(KEY, DEFAULT_CATEGORIES); return DEFAULT_CATEGORIES.slice(); }`
  (`:1514`). Note the `.slice()`.
- **Insertion order:** `push` (`:1523`) — append.
- **There is no `update()`.** The module exposes `getAll, saveAll, find, add,
  remove, getLabel, getColor, populateSelect, renderCards` — no edit path. A
  ProductCategory's name and colour are immutable once created. This is a
  **capability the owner has learned to live without**, and B2S must decide
  whether to add it (§6.6).
- **Delete:** hard filter (`:1525`), `confirm()` at `:1557`, no referential scan.

---

#### 1.1.3 Product (`bb_products`)

**Module** `ProductMgr` `:1571-1683` · **Key** `'bb_products'` `:1572` ·
**Identity** `id` · **Storage** `localStorage` + `bb_products.json`

| Field | Type | Source | Default / note |
|---|---|---|---|
| `id` | string | `:1584` | `genId('p')`; seeded records use `'p_def_1'..'p_def_3'` (`:1328-1330`) |
| `name` | string | `:1584` | `data.name \|\| ''` — bilingual by convention, `AR · EN` |
| `packType` | string | `:1584` | `data.packType \|\| ''` — **free text**, e.g. `'Pack'` |
| `weight` | string | `:1584` | `data.weight \|\| ''` — **free text with the unit inside the string**, e.g. `'40g'`. Not a number; not a quantity; never parsed. |
| `unitPrice` | number | `:1584` | `parseFloat(data.unitPrice) \|\| 0` |
| `categoryId` | string \| null | `:1584` | `data.categoryId \|\| null` — FK → `bb_categories` |

- **Seeded on first read** with `DEFAULT_PRODUCTS` (`:1327-1331`) at `:1576`.
  **`:1576` returns `DEFAULT_PRODUCTS` itself, not `DEFAULT_PRODUCTS.slice()`** —
  unlike `:1514` (categories) and `:1266` (themes), which both `.slice()`. The
  seeded array is shared-mutable on the first call. Recorded in Part 8 §8.10.
- **Insertion order:** `unshift` (`:1585`) — newest first.
- **Update semantics:** `Object.assign(arr[idx], {name, packType, weight,
  unitPrice, categoryId})` (`:1592`) — rewrites exactly five fields onto the
  existing object; `id` and any unknown field survive.
- **No `createdAt`, no `updatedAt`.**
- **There is no cost field.** A Product carries a **sale price only**. This is
  central to PART 9 R3 and is answered there.
- **There is no stock field, no reorder point, no SKU, no barcode, no batch, no
  expiry, no supplier, no tax class, no active/archived flag.**

---

#### 1.1.4 InvoiceLine — the tool calls it an `item`

**Not a stored collection.** It exists in three places: the module-level `items`
array (`:1242`), embedded inside each `Invoice.items` (`:2267`), and inside
`bb_inv2.items` (`:2553`).

Constructed at three sites — `addToInvoice` (`:1600`), `addManyToInvoice`
(`:1610`), `addManualRow` (`:3077`) — and normalised on four load paths
(`:2301-2303`, `:3261-3263`, `:3828-3830`, `:4179-4189`). All seven agree on the
shape.

| Field | Type | Source | Default / note |
|---|---|---|---|
| `productId` | string \| null | `:1600`, `:3077` | FK → `bb_products`. **`null` for a manual row** (`:3077`). |
| `name` | string | `:1600` | Snapshot of the Product name at add time |
| `packType` | string | `:1600` | Snapshot |
| `weight` | string | `:1600` | Snapshot |
| `categoryId` | string \| null | `:1600` | Snapshot of the Product's category at add time |
| `qty` | number | `:1600` | `1` |
| `price` | number | `:1600` | Snapshot of `Product.unitPrice` at add time |

- **Snapshot, not reference.** Changing a Product's name or price later does not
  restate a saved Invoice. This is a real and desirable requirement.
- **No `id` on a line.** Lines are positional. `renderItems` (`:3005-3070`)
  addresses them by array index, and edits write straight back to
  `items[idx]` (`:3030`, `:3042`, `:3054`).
- **No `lineTotal` is stored.** It is recomputed at every render (`:3062`) and at
  every save (`:2254`). Contrast the *Return* line, which does carry `lineTotal`
  (§1.1.7) — a direct DIVERGENT (§9.2.4).
- **No line-level discount. No line-level tax. No unit-of-measure.** `weight` is
  descriptive text, not a UoM.

---

#### 1.1.5 Invoice (`bb_invoices`)

**Module** `InvoiceMgr` `:2237-2393` · **Key** `'bb_invoices'` `:2238` ·
**Identity** `id` · **Cap** `MAX = 100` `:2239` ·
**Storage** `localStorage` + `bb_invoices.json`

Record literal `:2260-2274` — complete:

| Field | Type | Source | Note |
|---|---|---|---|
| `id` | string | `:2261` | `currentLoadedInvoiceId \|\| genId('inv')` — **upsert key** |
| `customerId` | string \| null | `:2262` | FK → `bb_customers`, from module state; **null if the buyer was typed, not picked** |
| `invoiceNumber` | string | `:2263` | Free text from `#mvInv` (`:890`). Not unique-checked. |
| `date` | string (`YYYY-MM-DD`) | `:2264` | From `<input type="date">` (`:894`) |
| `customerName` | string | `:2265` | **Denormalised snapshot** from the free-text field |
| `customerPhone` | string | `:2266` | **Denormalised snapshot** |
| `items` | InvoiceLine[] | `:2267` | `JSON.parse(JSON.stringify(items))` — deep clone |
| `subtotal` | number | `:2268` | Σ qty×price (`:2253-2254`) |
| `discount` | number | `:2269` | **The percent**, 0–100 |
| `discountAmount` | number | `:2270` | **The money** |
| `total` | number | `:2271` | `subtotal − discountAmount` |
| `notes` | string | `:2272` | Free text |
| `savedAt` | string (ISO 8601) | `:2273` | `new Date().toISOString()` — **rewritten on every save**, so it is a *last-modified*, not a *created* |

**Fields that do not exist and that B2S will need:** no `status`, no
`paymentStatus`, no `currency` (the currency is read live from global `S.cur`
at render time — a historical invoice reprints in today's currency code), no tax
field of any kind, no freight, no `createdAt`, no `dueDate`, no `terms`, no
`salesperson`, no `tenantId`.

- **Upsert:** `:2276-2278`. If `id` exists, replace in place; else `unshift` and
  **`if(arr.length > MAX) arr = arr.slice(0, MAX)`**. The 101st invoice silently
  destroys the oldest. Part 8 §8.2.
- **Guard:** save is refused only when *both* buyer name is empty *and* there are
  no lines (`:2251`). A named buyer with zero lines saves a zero-total invoice.
- **Delete:** hard filter (`:2331`), `confirm()` at `:2384`.

---

#### 1.1.6 PaymentStatus map (`bb_invoice_payments`) — *(read-only, foreign)*

**Read at** `:1966-1969`. Never written by this tool (§1.0.4).

```
function getPaymentStatus(invoiceId){
  var payments = Store.get('bb_invoice_payments', {});      :1967
  var p = payments[invoiceId];                              :1968
  return (p && p.status==='paid') ? 'paid' : 'pending';     :1968
}
```

| Field | Type | Read at | Note |
|---|---|---|---|
| *(map key)* | string | `:1968` | The `Invoice.id` |
| `.status` | string | `:1968` | Compared against the literal `'paid'`. **Every other value, and absence, collapses to `'pending'`.** |

**That is the entire shape this tool observes.** No amount, no date, no method,
no reference. Whatever richer structure `bb-stock-costs` writes, this tool reads
one string and reduces it to a boolean. Full treatment in Part 5.

---

#### 1.1.7 Return (`bb_returns`) — *(read-only, foreign)*

**Module** `ReturnsMgr` `:2398-2548` · **Key** `'bb_returns'` `:2399` ·
**Read via** `getAll()` `:2400`. **Never written by this tool** (§1.0.4). The
module header says so in the source: `MODULE 5b — RETURNS (read from Stock Costs
· bb_returns)` (`:2396`).

**Return record — every field this tool reads:**

| Field | Type | Read at | Consumed by |
|---|---|---|---|
| `invoiceId` | string | `:2411`, `:2479`, `:2506` | FK → `bb_invoices`. **Falsy ⇒ the whole record is skipped** (`:2411`, `:2479`). |
| `fullReturn` | boolean | `:2417` | Forces `salesStatus:'full'` |
| `amount` | number | `:2418` | Accumulated into `totalExpiredAmt` |
| `items` | array | `:2419`, `:2480`, `:2507` | Line detail |
| `outAllocations` | array | `:2515` | Resale attribution |
| `disposition` | string | `:2511`, `:3202` | **Record-level** fallback |
| `date` | string | `:3196` | Return-details header |
| `reason` | string | `:3197` | Return-details header, **escaped** |
| `notes` | string | `:3198` | Return-details header, **escaped** |

**`Return.items[]` — every field this tool reads:**

| Field | Type | Read at |
|---|---|---|
| `productId` | string \| null | `:2481`, `:2493`, `:2090`… , `:4090` |
| `name` | string | `:2481`, `:2493`, `:2509`, `:3205` |
| `qty` | number | `:2420`, `:2484`, `:2510`, `:4091` |
| `price` | number | `:2405` |
| `lineTotal` | number | `:2403` — **preferred over `qty×price` when `> 0`** |
| `disposition` | string | `:2511`, `:3202` — **item-level**, takes precedence |

**`Return.outAllocations[]` — every field this tool reads:**

| Field | Type | Read at | Note |
|---|---|---|---|
| `productId` | string \| null | `:2516` via `itemRetKey` | |
| `name` | string | `:2516`, `:2517` via `itemRetKey` | |
| `qty` | number | `:2518` | `<= 0` ⇒ allocation skipped (`:2519`) |
| `toCustomerName` | string | `:2520` | Display snapshot, `\|\| '—'` |
| `toInvoiceNumber` | string | `:2521` | Display snapshot, `\|\| ''` |

**Never read: `toCustomerId`, `toInvoiceId`.** `bb-stock-costs` writes id fields
alongside the display snapshots; this tool consumes **only the snapshots**. The
resale attribution is therefore **unnavigable** — the chip says "sold to X on
invoice #Y" as text, and cannot link to either. Recorded as DIVERGENT §9.2.5 and
as a B2S requirement in Part 4 §4.6.

---

#### 1.1.8 SalesOrder draft — the tool calls it a `pending invoice` (`bb_pending_invoices`)

**Module** `PendingInvoiceMgr` `:2181-2232` · **Key** `'bb_pending_invoices'`
`:2182`. **Created by `bb-stock-costs`; read and updated here.**

| Field | Type | Written here | Read here | Note |
|---|---|---|---|---|
| `id` | string | — | `:2204`, `:2226` | Identity |
| `title` | string | — | `:2215`, `:2223`, `:3237` | Draft label |
| `items` | array | — | `:2217`, `:3261-3263` | Copied into `items` on load |
| `status` | string | **`:2197`** → `'completed'` | `:2204` | Only non-`'completed'` drafts render (`:2204`) |
| `completedInvoiceId` | string \| null | **`:2197`** | — | FK → `bb_invoices`, set at handoff |
| `customerId` | string \| null | **`:1411`** | `:3251` | Assigned when a Buyer is picked |
| `customerName` | string | **`:1412`** | `:2217`, `:3237`, `:3253` | |
| `customerPhone` | string | **`:1413`** | `:3254` | |
| `notes` | string | — | `:3257` | |
| `createdAt` | string (ISO) | — | `:2217` | Set by the producing tool |
| `updatedAt` | string (ISO) | **`:2191`** | — | Added by `update()` here |
| `prepSummary.stockOk` | boolean | — | `:2211-2212` | Renders `'✓ مخزون كافٍ'` / `'⚠ نقص مخزون'` |

`markCompleted(id, invoiceId)` (`:2196-2198`) sets
`{status:'completed', completedInvoiceId: invoiceId || null}`.

**`markCompleted` has a live caller here at `:3136`** — inside
`saveInvoiceToHistory`, guarded by `if(currentPendingInvoiceId)`. This closes the
production→sale loop that `EXTRACT_STOCK_COSTS.md` recorded as open from the
producing side. Recorded as a resolved cross-tool link in §9.3.3.

---

#### 1.1.9 BrandTheme — the tool calls it a `color preset` (`bb_color_presets`)

**Module** `ColorPresetMgr` `:1254-1317` · **Key** `'bb_color_presets'` `:1255`

| Field | Type | Source | Note |
|---|---|---|---|
| `id` | string | `:1273` | **`'cp_' + Date.now()`** — no random suffix, unlike `genId` (`:1349-1351`). Two themes saved in the same millisecond collide. |
| `name` | string | `:1273` | `name \|\| 'بريسيت'` |
| `bg` | string (hex) | `:1274` | Page background |
| `gold` | string (hex) | `:1274` | Accent — the field name encodes one brand's accent colour |
| `txt` | string (hex) | `:1274` | Body text |
| `mut` | string (hex) | `:1274` | Muted text |
| `row` | string (hex) | `:1275` | Table row |
| `tot` | string (hex) | `:1275` | Totals band |
| `grand` | string (hex) | `:1275` | Grand-total band |

**Four built-ins, `:1257-1262`,** seeded via `.slice()` at `:1266`:

| `id` | `name` | `bg` | `gold` | `txt` | `mut` | `row` | `tot` | `grand` |
|---|---|---|---|---|---|---|---|---|
| `cp_def1` | Dark Gold | `#0a0804` | `#c9a84c` | `#e8e0cc` | `#6b5e3a` | `#12100a` | `#12100a` | `#1e1a0f` |
| `cp_def2` | Obsidian Blue | `#04060c` | `#6ba3d4` | `#d0dce8` | `#3a5070` | `#070b14` | `#070b14` | `#0c1220` |
| `cp_def3` | Forest Night | `#040804` | `#7dab6e` | `#d0e8cc` | `#3a5c38` | `#080e06` | `#080e06` | `#0e1a0c` |
| `cp_def4` | Warm Ivory | `#faf6ef` | `#8a6010` | `#2a1a06` | `#8a7050` | `#f4ede0` | `#f0e8d4` | `#e8dcc0` |

**Active selection** lives in a separate key, `bb_active_color_preset_id`
(`:1281-1285`) — a bare string, not a boolean on the record.

**Cross-tool collision:** these four ids and names are shared with
`bb-stock-costs`, but **the field sets differ** — this tool's seven-slot
`{bg, gold, txt, mut, row, tot, grand}` is not the other tool's slot list. Both
write the same `bb_color_presets.json`. Recorded as DIVERGENT §9.2.7.

---

#### 1.1.10 DocumentTemplate settings — the tool calls it `S`, stored inside `bb_inv2`

Declared `:1217-1239`. **Forty keys.** Persisted only as part of the `bb_inv2`
singleton (`:2553`, `:4231`), never as its own key.

`bb_inv2` shape: **`{ C, S, items }`** (`:2553`).

| Group | Keys | Line |
|---|---|---|
| Brand identity | `mono`, `brand`, `web` | `:1218-1219` |
| Invoice document | `docTitle`, `footNote` | `:1218-1219` |
| Money policy | `cur`, `discount`, `discLabel` | `:1220` |
| Invoice table headers | `hItem`, `hQty`, `hPrice`, `hSub` | `:1221` |
| Invoice totals labels | `lSubtotal`, `lTotal` | `:1222` |
| Price-list document | `plTitle`, `plFootNote`, `plDefaultNote`, `plHProduct`, `plHPack`, `plHWeight`, `plHPrice`, `plLblProducts`, `plLblCategories`, `plLblOther`, `plCatSuffix` | `:1223-1229` |
| Customer-list document | `clTitle`, `clFootNote`, `clDefaultNote`, `clHNum`, `clHName`, `clHPhone`, `clHAddress`, `clHNotes`, `clHLatestInv`, `clHLatestVal`, `clHPayStatus`, `clHPendingList`, `clLblCustomers`, `clLblWithInv`, `clLblPendingCount`, `clPaid`, `clPending`, `clNoInv` | `:1230-1238` |

**`S.discount` is a settings key that holds transaction data.** It is the
invoice's discount percent, living in the same object as the brand name and the
column headers, and it is persisted into the singleton `bb_inv2` and read back
by `bb-stock-costs`. A **document-template concern and a per-transaction money
input share one record.** Recorded in §1.3.3.

**Default duplication:** `mergePriceListDefaults` (`:2859-2871`) and
`mergeCustomerListDefaults` (`:2879-2895`) re-declare **29 of these 40 defaults a
second time**, verbatim, at `:2861-2867` and `:2883-2891`. Two sources of truth
for the same string. Recorded in §1.3.5 and enumerated in Part 7.

---

#### 1.1.11 Whole-app snapshot — the tool calls it a `preset` (`bbinv_pb`)

`_PBK = 'bbinv'` (`:3712`) → actual key **`'bbinv_pb'`** (`:3716-3717`).
`_PBMAX = 8` (`:3714`). **Not in `MANAGED`; bypasses `Store`** (§1.0.5).

| Field | Type | Source |
|---|---|---|
| `name` | string | `:3725` |
| `date` | string | `:3725` — `toLocaleDateString('ar-EG')` |
| `state.C` | object | `:3797` — deep clone of the seven colours |
| `state.S` | object | `:3798` — deep clone of all forty settings |
| `state.items` | InvoiceLine[] | `:3799` — deep clone |
| `state.meta.cust` | string | `:3801` — **buyer name** |
| `state.meta.inv` | string | `:3802` |
| `state.meta.date` | string | `:3803` |
| `state.meta.phone` | string | `:3804` — **buyer phone** |
| `state.meta.notes` | string | `:3805` |

`pbExport` (`:3743-3751`) writes `{name, template:'bbinv', date, state}` to a
downloadable `.json`. **That download carries buyer name and phone.** Part 8
§8.14. `pbImport` (`:3754-3768`) parses arbitrary user-supplied JSON and applies
it with no schema validation beyond a truthiness check on `.state` (`:3759`).

---

### 1.2 Relationships

Legend — **RI** = referential integrity enforced.

| # | Relationship | Cardinality | FK held by | RI | On delete of the parent |
|---|---|---|---|---|---|
| R1 | Invoice → Buyer | many-to-one | `Invoice.customerId` (`:2262`) | **No** | Dangling id. Card still renders from `customerName` (`:2370`), but `getInvoiceCount` (`:1395-1397`), buyer history (`:3354`), `getCustomerInvoices` (`:1976-1980`) and the per-Buyer report (`:3996`) all silently drop it. Revenue disappears from per-Buyer views while remaining in the totals view. |
| R2 | Invoice → InvoiceLine | composition, one-to-many | embedded array (`:2267`) | n/a | Cascades — the lines are inside the record |
| R3 | InvoiceLine → Product | many-to-one, **optional** | `InvoiceLine.productId` (`:1600`, null at `:3077`) | **No** | Line survives intact on its `name`/`packType`/`weight`/`price` snapshots. The single-product report (`:4079`) matches on `productId` only, so that history becomes unreachable there; top-products (`:4034`) keys on `productId \|\| name` and still counts it under the name. **The same sale appears in one report and not the other.** |
| R4 | Product → ProductCategory | many-to-one, **optional** | `Product.categoryId` (`:1584`) | **No** | Dangling id. `getLabel` returns `''` (`:1527`), `getColor` returns `'#888'` (`:1528`) — a silent unnamed grey badge. Price-list grouping (`:1747-1752`) emits a group with an empty heading. |
| R5 | Return → Invoice | many-to-one | `Return.invoiceId` (`:2411`) | **No** | A Return whose Invoice was deleted is skipped from every aggregate but persists in `bb_returns.json`. Conversely `removeInvoice` (`:2330`) does not touch returns. |
| R6 | Return line → InvoiceLine | many-to-one, **by composite key not id** | `itemRetKey(it)` = `productId \|\| ('name:' + trim(name))` (`:1341`, `:2493`) | **No** | Match is by product id, falling back to **trimmed name string**. Renaming a Product breaks the fallback for every historical manual line. |
| R7 | Invoice → PaymentStatus | one-to-one, optional | map key = `Invoice.id` (`:1968`) | **No** | Status for a deleted invoice persists in the other tool's file. Absence is indistinguishable from `'pending'`. |
| R8 | SalesOrder draft → Invoice | one-to-one, optional | `completedInvoiceId` (`:2197`) | **No** | One-way. Deleting the invoice leaves a completed draft pointing at nothing; the draft is already hidden by the `status` filter (`:2204`) so nothing surfaces it. |
| R9 | SalesOrder draft → Buyer | many-to-one | `customerId` (`:1411`) | **No** | Assigned at Buyer pick |
| R10 | Return `outAllocation` → Buyer / Invoice | many-to-one | **`toCustomerName`, `toInvoiceNumber` — display strings, not ids** (`:2520-2521`) | **No** | Ids are written by the producer but never read here (§1.1.7). The link is textual and unnavigable. |
| R11 | Invoice → BrandTheme | **none** | — | — | **No theme is stored on an Invoice.** A historical invoice reprints in whatever theme is active now. §1.3.6. |
| R12 | Invoice → currency | **none** | — | — | Currency is read from global `S.cur` at render (`:1996`, `:2465`, `:3177`). Changing the currency code restates every historical printout. §1.3.6. |

**Relationships to entities owned by other tools.** Three exist:
`bb_returns` (R5, R6, R10), `bb_invoice_payments` (R7), `bb_pending_invoices`
(R8, R9). All three are consumed here; only `bb_pending_invoices` is also
written.

**`bb_label_templates` and `bb_stickers`: absent.** Searched; zero occurrences.
The `templateKey` overload recorded in `AUDIT_STICKER.md` §3.4 **has no
counterpart in this file** — this tool has no sticker or label surface at all.
ONE-SIDED, recorded in §9.3.4.

---

### 1.3 The same real-world concept modelled more than once

Each of these is a canonicalisation decision for B2S. None is resolved here.

**§1.3.1 — Buyer identity is modelled three ways at once.**
On one Invoice: `customerId` (`:2262`), `customerName` (`:2265`) and
`customerPhone` (`:2266`). The tool then picks a *different* one depending on
which view you are in — the per-Buyer report filters on **`customerId`**
(`:3996`), while the top-customers chart groups on **`customerName`**
(`:3975`). Two buyers with the same name merge in one view and not the other;
one buyer renamed splits in one view and not the other. B2S must decide whether a
Buyer is the id, the name, or a snapshot pair.

**§1.3.2 — The product aggregation key is modelled two ways, in one module.**
`itemRetKey` (`:1341` and again `:2493`) yields `productId || 'name:'+trim(name)`.
`subtractReturnsFromProdMap` (`:2481`) yields `productId || name` — **no prefix,
no trim**. The report path (`:4034`) matches `:2481`; the per-line chip path
(`:2504`, `:2508`) matches `:2493`. Both are internally consistent and mutually
incompatible. A manual line named `'Za'atar '` with a trailing space keys
differently in the two.

**§1.3.3 — Transaction data lives inside the settings record.**
`S.discount` (`:1220`) is a per-invoice money input stored in the
document-template object and persisted to the singleton `bb_inv2` (`:2553`). It
is written from the form on every keystroke (`:3111`), forced to `0` when a new
invoice starts (`:3259`, `:3286`), and restored from the Invoice record on load
(`:2306`). A transaction field and a brand-config field share one storage record.

**§1.3.4 — Line value is modelled two ways across the two tools' line types.**
An `InvoiceLine` stores **no** `lineTotal` and is always recomputed
(`:2254`, `:3062`). A `Return.items[]` line **does** store `lineTotal`, and the
reader prefers it over recomputation whenever it is `> 0` (`:2403-2405`). The
same business concept — the money value of one line — is derived in one place
and stored in the other. §9.2.4.

**§1.3.5 — Forty document-template defaults are declared twice.**
`S` (`:1217-1239`) and the two merge helpers (`:2861-2867`, `:2883-2891`)
independently declare the same 29 strings. A change to one does not reach the
other; whichever runs last wins for a user whose stored `S` predates the key.

**§1.3.6 — Presentation state is global where the data is historical.**
Colours (`C`, `:1214`), currency (`S.cur`, `:1220`) and every document label are
one global record. Invoices are historical. Reprinting a year-old invoice applies
today's brand, today's currency code and today's column headers. The tool
achieves *"my documents all look current"*; it cannot achieve *"reprint exactly
what I sent"*. Both are legitimate requirements and B2S must choose. R11, R12.

**§1.3.7 — Invoice numbering is implemented four times, in three variants.**
`calcNextInvNum` (`:3330-3342`), the init auto-number (`:4199-4204`),
`duplicateInvoice` (`:2317-2321`), and the DOM default `#INV-001` (`:890`). Two
scopes (per-Buyer and global) share one numeric namespace. Detailed as C11–C13.

**§1.3.8 — Three escape functions, one body.**
`htmlEsc` (`:1342-1344`), `PriceListPrint.esc` (`:1740-1742`),
`CustomerListPrint.esc` (`:1962-1964`). All three replace `& < > "` and all
three omit `'`. One concept, three implementations, two of them module-private
copies of the global.

**§1.3.9 — Id generation is implemented twice.**
`genId(pfx)` (`:1349-1351`) = prefix + `Date.now()` + 3 random base-36 chars.
`ColorPresetMgr.add` (`:1273`) = `'cp_' + Date.now()`, **no random component**.

---

### 1.4 Relationship diagram

```
                        ┌──────────────────────────┐
                        │  bb_inv2  (SINGLETON)    │
                        │  { C, S, items }         │
                        │  one per installation    │
                        └───────────┬──────────────┘
                                    │ read by bb-stock-costs
                                    │ for invoice reprint
                                    ▼
   ProductCategory ◄──────────── Product ──────snapshot──────┐
   (bb_categories)   categoryId  (bb_products)               │
        │            [nullable,                              │ productId
        │             no RI]                                 │ [nullable,
        │                                                    │  no RI]
        │ colour+label                                       ▼
        │ used by price-list grouping                  InvoiceLine
        │                                              (embedded, no id)
        │                                                    │
        │                                                    │ composition
        ▼                                                    ▼
   [dangling id ⇒ '' label, '#888' colour]            ┌─────────────┐
                                                      │   Invoice   │
   Buyer ◄──────────customerId [nullable, no RI]──────┤(bb_invoices)│
 (bb_customers)                                       │  CAP = 100  │
        │  ▲                                          └──┬───┬───┬──┘
        │  │                                             │   │   │
        │  └───── customerName / customerPhone           │   │   │
        │         denormalised snapshots ────────────────┘   │   │
        │                                                    │   │
        │                                        invoiceId   │   │ id
        │                            ┌───────────────────────┘   │
        │                            │                           │
        │                            ▼                           ▼
        │                    ┌──────────────┐        ┌────────────────────────┐
        │                    │    Return    │        │  PaymentStatus map     │
        │                    │ (bb_returns) │        │ (bb_invoice_payments)  │
        │                    │  READ ONLY   │        │      READ ONLY         │
        │                    └──┬────────┬──┘        │  { <invId>: {status} } │
        │                       │        │           └────────────────────────┘
        │        items[]        │        │  outAllocations[]
        │        productId ─────┘        └──── toCustomerName : STRING
        │        name                          toInvoiceNumber: STRING
        │        qty, price, lineTotal         ( toCustomerId / toInvoiceId
        │        disposition                     are written by the producer
        │                                        but NEVER read here )
        │                                                │
        │  ◄───── textual, unnavigable ──────────────────┘
        │
        │ customerId / customerName / customerPhone   (written here, :1411-1413)
        ▼
   ┌────────────────────────┐   completedInvoiceId    ┌──────────────┐
   │ SalesOrder draft       ├────────────────────────►│   Invoice    │
   │ (bb_pending_invoices)  │      set at :3136       └──────────────┘
   │ created by stock-costs │
   │ updated here           │
   └────────────────────────┘

   BrandTheme (bb_color_presets)  ──┐
   active id (bb_active_color_...)  ├──► global C · NOT linked to any Invoice
   whole-app snapshot (bbinv_pb) ───┘    (bbinv_pb is local-only, unmirrored)

   ABSENT ENTIRELY: bb_label_templates · bb_stickers · Batch · Supplier
                    Purchase · StockLevel · Cost · Tax · Freight
```

**Labelled edges, linear form:**

```
Invoice            --customerId[0..1, no RI]-->        Buyer
Invoice            --customerName/Phone[snapshot]-->   Buyer
Invoice            --composition[1..*]-->              InvoiceLine
InvoiceLine        --productId[0..1, no RI]-->         Product
Product            --categoryId[0..1, no RI]-->        ProductCategory
Return             --invoiceId[1, no RI]-->            Invoice          (READ ONLY)
Return.items       --itemRetKey[fuzzy, no RI]-->       InvoiceLine
Return.outAlloc    --toCustomerName[string]-->         Buyer            (unnavigable)
Return.outAlloc    --toInvoiceNumber[string]-->        Invoice          (unnavigable)
PaymentStatus      --mapKey[1, no RI]-->               Invoice          (READ ONLY)
SalesOrderDraft    --completedInvoiceId[0..1]-->       Invoice          (written here)
SalesOrderDraft    --customerId[0..1]-->               Buyer            (written here)
bb_inv2            --singleton{C,S,items}-->           entire installation
BrandTheme         --(no edge)-->                      Invoice
```

---

### 1.5 Vocabulary

#### 1.5.1 Term register — tool word vs B2S resolved term

| Arabic (tool) | English (tool) | Tool identifier | B2S term (`VOCABULARY_DRAFT.md` §1.2) | Disagreement? |
|---|---|---|---|---|
| العميل / العملاء | Customer | `bb_customers`, `customerId`, `customerName`, `CustomerMgr` | **Buyer** | **YES** — §1.5.2 |
| المنتج / المنتجات | Product / Item | `bb_products`, `productId`, `ProductMgr` | **Product** | No for `Product`; **YES** for `Item` — §1.5.3 |
| التصنيف / تصنيفات | Category | `bb_categories`, `categoryId`, `CategoryMgr` | **ProductCategory** | Minor — bare `category` is on the §1.15 forbidden list by way of `label`/`design` adjacency; the resolved term is qualified |
| الفاتورة / الفواتير | Invoice | `bb_invoices`, `invoiceNumber`, `InvoiceMgr` | **Invoice** | No |
| — | *(line, unnamed)* | `items[]`, `it` | **InvoiceLine** | **YES** — the tool calls a line an `item`, which is on the §1.15 forbidden list |
| مسودة تحضير / مسودات التحضير | *(no English)* | `bb_pending_invoices`, `PendingInvoiceMgr` | **SalesOrder** (draft state) | **YES** — the tool calls a pre-sale draft a *pending invoice*, colliding with "unpaid invoice". §1.5.4 |
| مرتجع / المرتجعات | Return | `bb_returns`, `ReturnsMgr` | **Return** modelled as **StockMovement** | Concept agrees; B2S adds the movement framing |
| بريسيت | Preset | `bb_color_presets`, `ColorPresetMgr`, `_PBK='bbinv'` | **BrandTheme** | **YES** — `preset` is §1.15-forbidden, and the tool uses one word for two unrelated things. §1.5.5 |
| المظهر | Theme | `applyTheme`, `C` | **BrandTheme** | No |
| قائمة الأسعار | Price List | `PriceListPrint`, `plTitle` | **DocumentTemplate** + **PrintJob** | **YES** — `export`/`print` split |
| قائمة العملاء | Customer List | `CustomerListPrint`, `clTitle` | **DocumentTemplate** + **PrintJob** | **YES** |
| خصم | Discount | `discount`, `discAmt`, `discLabel` | **Discount** | No |
| المجموع | Subtotal | `subtotal`, `lSubtotal` | **Subtotal** | No |
| الإجمالي | Total | `total`, `lTotal`, `hSub` | **Total** | **YES** — one Arabic word, two senses. §1.5.6 |
| صافي | Net | `net`, `salesStatus` | **NetRevenue** | No |
| مدفوعة / معلقة | Paid / Pending | `clPaid`, `clPending`, `getPaymentStatus` | **PaymentState** | **YES** — `pending` overloaded. §1.5.4 |
| تالف | *(no English)* | `totalExpiredAmt`, `expiredQty` | **write-off disposition** | **YES** — §1.5.7 |
| مخزون | Stock | `stockOk`, `'⚠ نقص مخزون'` | **StockLevel** | **YES** — bare `stock` is §1.15-forbidden |
| التغليف | Pack | `packType`, `plHPack` | **PackagingTemplate** *(name only)* | Concept is a free-text label here, not an entity |
| الوزن | Weight | `weight`, `plHWeight` | *(no B2S term — see below)* | `weight` here is **display text**, not a measurement |
| وحدة | *(unit)* | literal `'وحدة'` `:4047` | **UoM** | **YES** — one hardcoded unit word for every product |
| المنتج · Item | Item | `hItem` | **InvoiceLine** label | **YES** |

#### 1.5.2 CF-28 evidence — "customer" meaning both the Tenant and the Buyer

The collision is **present, and it is asymmetric in this tool.** Every
`customer`-rooted identifier in the *data model* means **Buyer**. The **Tenant**
sense appears not as a word but as an **absence**: the tenant is the unnamed
implicit owner of every unscoped global key.

**Sense A — Buyer (the party being invoiced).** Every occurrence below:

| Site | Identifier / literal | Line |
|---|---|---|
| Storage key | `bb_customers` | `:1064`, `:1368` |
| Module | `CustomerMgr` | `:1367` |
| Invoice FK | `customerId` | `:2262`, `:2298`, `:3251`, `:3996` |
| Invoice snapshot | `customerName` | `:2265`, `:2370`, `:3975`, `:4119` |
| Invoice snapshot | `customerPhone` | `:2266`, `:2292` |
| Module state | `currentCustomerId` | `:1244`, `:1405`, `:2262` |
| Draft assignment | `customerId` / `customerName` / `customerPhone` | `:1411-1413` |
| Picker | `openCustomerPicker`, `renderCustPickerList`, `_custPickerSuppressFocus` | `:3456`, `:3466`, `:1246` |
| History overlay | `showCustHist`, `closeCustHist`, `loadInvoiceFromCustHist` | `:3350`, `:3421`, `:3345` |
| Print document | `CustomerListPrint`, `clTitle`, `clHName`… | `:1912`, `:1230`, `:1233` |
| Report | `renderRptCustomer`, `rptCustSel` | `:3990`, `:3849` |
| Return allocation | `toCustomerName` | `:2520` |
| Form | `custFormName`, `custFormPhone`, `custFormAddress`, `custFormNotes` | `:4215` |
| UI label | `العملاء` | `:625` |
| UI label | `اختر عميل · Select Customer` | `:800` |
| UI label | `قائمة العملاء · Customer List` | `:595`, `:998`, `:1230` |
| Doc column | `الاسم · Name` etc. | `:601-608` |
| Report label | `أفضل العملاء` | `:3982` |
| Report label | `-- كل العملاء --` | `:3849` |
| Stat label | `عميل` | `:1237` |

**Sense B — Tenant (the business operating the tool).** The word `customer` is
**never** used in this sense here. The Tenant is expressed instead as:

| Expression of the Tenant | Line |
|---|---|
| `S.brand = 'Balance Bites'` — the operating business's own name | `:1218` |
| `S.mono = 'BB'` — its monogram | `:1218` |
| `S.web = 'balancebites.com'` — its domain | `:1219` |
| `S.cur = 'EGP'` — its currency | `:1220` |
| The singleton `bb_inv2` record itself | `:2553` |
| Every unscoped `bb_*` key | `:1064` |
| Report subtitle `Reports Dashboard · Balance Bites` | `:768` |

**The finding for B2S:** in this tool the two senses do not collide *lexically*,
because the Tenant has no noun at all. The collision `CF-28` describes is
therefore **latent here and will become active the moment a second business
exists** — at which point `bb_customers` must become *Buyer scoped by Tenant*,
and `S.brand` must become *Tenant.brandName*. The evidence this file contributes
is that **the legacy vocabulary has no word for the Tenant**, which is why the
collision was never noticed. §6.5.

#### 1.5.3 One word, two meanings

| Word | Sense 1 | Sense 2 | Evidence |
|---|---|---|---|
| **`item`** | An **InvoiceLine** — `items[]` (`:1242`), `Invoice.items` (`:2267`), `renderItems` (`:3005`) | A **Product**, in the UI label `المنتج · Item` on the line-table header (`:912`, `hItem` `:1221`) and in `'حدّد منتجاً واحداً على الأقل'` selection counts | `:1242` vs `:1221` |
| **`preset`** | A **BrandTheme** — 7 colours (`bb_color_presets`, `:1255`) | A **whole-app snapshot** — colours + all settings + invoice lines + buyer name/phone (`bbinv_pb`, `:3712`) | `:1255` vs `:3712`. Both are called `بريسيت` in Arabic (`:1273`, `:3721`). Two entities, one word, two storage keys, two max-counts, two UIs. |
| **`pending`** | A **SalesOrder draft** not yet invoiced — `bb_pending_invoices`, `'مسودات التحضير'` (`:723`) | An **unpaid invoice** — `getPaymentStatus` → `'pending'` (`:1968`), `clPending: 'معلقة · Pending'` (`:1238`), `'فواتير معلقة · Pending Invoices'` (`:1236`) | `:2182` vs `:1968`. **Both appear in the customer-list printout at once** — a column headed `فواتير معلقة` listing *unpaid* invoices (`:1982-1988`), in a tool whose editor panel has an accordion of *unissued drafts*. |
| **`total`** | The **line extension** qty×price — `hSub: 'الإجمالي'` is the per-line column header (`:1221`, `:915`) | The **invoice grand total** — `lTotal: 'الإجمالي · Total'` (`:1222`, `:949`) | `:1221` vs `:1222`. The identical Arabic word `الإجمالي` heads the line column *and* labels the grand total on the same printed page. |
| **`amount`** | On a Return record, the **write-off value** as this tool reads it — accumulated into `totalExpiredAmt` (`:2418`) and displayed as `تالف` (`:3185`) | On a Return record as the producing tool may write it, the **total returned value** regardless of disposition | `:2418`. This is a **live cross-tool semantic divergence**, not a naming quibble. §9.2.2. |
| **`discount`** | A **brand/document setting** — `S.discount` (`:1220`), persisted in `bb_inv2` | A **per-invoice transaction value** — `Invoice.discount` (`:2269`) | `:1220` vs `:2269` |

#### 1.5.4 Two words, one meaning

| Meaning | Word 1 | Word 2 | Evidence |
|---|---|---|---|
| HTML-escape a string | `htmlEsc` (global) | `esc` (×2, module-private) | `:1342`, `:1740`, `:1962` — identical bodies |
| The money value of one returned line | `lineTotal` (stored) | `qty × price` (derived) | `:2403` vs `:2405` — same concept, two representations, preference logic between them |
| Return disposition "restock" | `it.disposition` | `ret.disposition` | `:2511` — item-level and record-level fields carrying the same enum |
| The next invoice number | `calcNextInvNum` | inline block in `duplicateInvoice`; inline block in `init` | `:3341` vs `:2321` vs `:4203` |
| A generated identity | `genId(pfx)` | `'cp_'+Date.now()` | `:1349` vs `:1273` |
| "This invoice is fully returned" | `Return.fullReturn` (stored flag) | `totalQty >= invQty − 0.0001` (derived) | `:2444` vs `:2446` — stored and derived tests OR'd together |
| Product display name | `p.name` | `p.name.split('·')[0].trim()` | `:3599` vs `:4035`, `:4107` — the bilingual middot is load-bearing punctuation |

#### 1.5.5 Terms present in B2S vocabulary and absent here

`Tenant` · `Batch` · `Lot` · `Component` · `StockLevel` · `StockMovement` ·
`PurchaseOrder` · `Supplier` · `Cost` · `COGS` · `Margin` · `Tax` · `Freight` ·
`PrintJob` · `PrintArtifact` · `PackagingTemplate` · `ImportTemplate` ·
`Sticker` · `Label` · `UoM`. Each is a requirement B2S adds, not a gap in this
extraction.

#### 1.5.6 Language coverage of the vocabulary itself

Of the concept terms above, **10 exist as bilingual `AR · EN` pairs** because
they are printed on a customer-facing document (`docTitle`, `discLabel`,
`hItem`, `lSubtotal`, `lTotal`, price-list and customer-list headers). **Every
purely internal concept is Arabic-only** — `مسودات التحضير` (draft), `تالف`
(write-off), `مخزون` (stock), `بريسيت` (theme) have no English form anywhere.
The bilingual boundary in this tool is exactly the **printed-document boundary**.
That is itself a requirement: B2S's translation set must cover the internal
vocabulary that this tool never translated. Enumerated in Part 7.

#### 1.5.7 `تالف` — the word that carries a policy

`تالف` ("damaged/spoiled") is the on-screen label for the non-restock
disposition (`:3151`, `:3185`). The stored enum values are English —
`'restock'` and `'expired'` (`:2511-2512`). So the disposition is written as
*expired*, read as *expired*, and shown as *damaged*. Three words, one state.
B2S must decide whether the write-off reason is part of the disposition enum or a
separate field. Recorded, not resolved.

---

## PART 2 — CALCULATION EXTRACTION

**Scope statement, up front, because it determines how the rest of this Part
reads.** This tool performs **twenty-two** distinct money or quantity
calculations. It performs **no** tax calculation, **no** freight calculation,
**no** cost, COGS, margin, stock-level, stock-movement, recipe, component-usage,
operating-cost or profit calculation. Those concepts do not exist in this file.
The P-02 prompt's minimum list is answered item by item in §2.23.

**Rounding, stated once and then per calculation.** The tool has exactly **one**
value-rounding site — `Math.round` on a chart bar's width percentage (`:3907`),
which is presentation geometry, not money. Every money and quantity value is
computed, stored and compared in **raw IEEE-754 double precision with no
rounding, no truncation and no epsilon**, except the two `0.0001` comparison
epsilons at `:2446` and `:4043`. Formatting to 0–2 decimal places happens only at
the moment of display, in `fmt` (`:1339`). **No money value is ever rounded
before storage.** Each calculation below restates this explicitly, as required.

---

### 2.1 `fmt` — money and quantity presentation

**What it computes and why.** The single presentation rule for every monetary and
most quantity values the business sees. It exists so the owner reads figures in
Arabic-Indic digits with local grouping.

```
function fmt(n){ return Number(n).toLocaleString('ar-EG',
                        {minimumFractionDigits:0, maximumFractionDigits:2}); }   :1339
function fmtQty(n){ return Number(n).toLocaleString('ar-EG',
                        {maximumFractionDigits:2}); }                            :1340
```

| Aspect | Behaviour |
|---|---|
| **Inputs** | Any number. No source entity — it is applied to every computed money value at the display boundary. |
| **Digit system** | Arabic-Indic (`ar-EG`), e.g. `٤٥` |
| **Decimals** | **Minimum 0, maximum 2.** `45` renders `٤٥`, not `٤٥٫٠٠`. **Money is not shown to a fixed 2 dp.** |
| **Rounding** | Half-expand at 2 dp, applied by `Intl.NumberFormat`. **Display only — the underlying value is unchanged.** This is the tool's only money rounding of any kind. |
| **Grouping** | `ar-EG` thousands separator |
| **`fmtQty` difference** | Omits `minimumFractionDigits`, which for `ar-EG` defaults to 0 — behaviourally identical to `fmt` in every observed call |
| **Edge: `undefined` / `null` / `''`** | `Number(undefined)` → `NaN` → renders as the locale's NaN string. **`fmt` has no internal `\|\|0` guard.** Call sites guard inconsistently: `fmt(parseFloat(inv.total)\|\|0)` (`:1996`) guards; `fmt(e.net)` (`:2364`) relies on an upstream guard; `fmt(p.unitPrice)` (`:3599`) does not guard at all. |
| **Edge: negative** | Renders with the locale's minus sign. Reachable — see §2.4. |

- **BUSINESS-INVARIANT:** money must be presented in a stable, readable form.
- **THIS BUSINESS'S POLICY:** Arabic-Indic digits; `ar-EG` locale; **0–2 decimal
  places rather than a currency-fixed 2**; grouping style; and the decision to
  format at the display boundary only rather than to round on store. All four are
  choices another business would make differently, and the third has accounting
  consequences — a stored `44.999999999999996` prints as `٤٥` and sums as
  `44.999999999999996`.

---

### 2.2 C1 — InvoiceLine extension (line total)

**What it computes and why.** The money value of one line on the invoice. The
business needs it to show the buyer what each product costs in aggregate on this
document.

```
s = (item.qty || 0) * (item.price || 0)                        :3090
sub.textContent = fmt(item.qty * item.price)                   :3062   ← initial render, UNGUARDED
```

| Input | Source entity.field |
|---|---|
| `item.qty` | `InvoiceLine.qty` (`:1600`, live-edited `:3046`) |
| `item.price` | `InvoiceLine.price` (`:1600`, live-edited `:3058`) |

- **Rounding: none stated in source.** Raw double multiply. Not rounded before
  being summed into the subtotal, and never stored.
- **Order of operations:** not applicable — a single product.
- **Edge cases.** `:3090` coerces both operands with `|| 0`; **`:3062` does
  not** — two expressions for one concept, differing in their zero-guard. A
  freshly added manual row (`:3077`) has `qty:1, price:0` → `0`. Negative qty or
  price is accepted by the arithmetic; the inputs carry `min='0'` (`:3046`,
  `:3057`) which the browser enforces on spinner use but not on typed or
  programmatic entry. No divide-by-zero is possible.
- **BUSINESS-INVARIANT:** a line's value is quantity times unit price.
- **POLICY:** that there is **no line-level discount**, **no line-level tax**,
  and **no unit-of-measure conversion** between the price basis and the quantity
  basis. Another business selling by weight would need all three.

---

### 2.3 C2 — Invoice subtotal

**What it computes and why.** The sum of all lines before any reduction — the
figure the buyer checks against their own count.

```
subtotal = Σ over items of (it.qty || 0) * (it.price || 0)
```

**Computed twice, in two functions, from the same array:**

| Site | Purpose | Line |
|---|---|---|
| `calcTotals` | display | `:3088-3092` |
| `saveCurrentInvoice` | persistence | `:2253-2254` |

The two expressions are textually identical and cannot drift in value, but they
are two implementations of one rule.

- **Rounding: none stated in source.** Accumulated as a running raw double, so
  the result carries the full accumulated floating-point error of the line count.
- **Order of operations:** summation order is array order, which is the order
  products were added. **Floating-point addition is not associative**, so
  reordering lines can change the last bits of the subtotal. Not observable at
  2 dp display, but it is a real property of the stored `subtotal` (`:2268`).
- **Edge cases.** Empty `items` → `0`. Save is refused only if the buyer name is
  *also* empty (`:2251`), so a named buyer with no lines stores `subtotal: 0`.
- **BUSINESS-INVARIANT:** the subtotal is the sum of line values.
- **POLICY:** that the subtotal is **pre-discount and pre-everything** — there is
  no other adjustment for it to be defined against.

---

### 2.4 C3 — Discount  ·  *the tool's only money-side policy*

**What it computes and why.** A whole-invoice percentage reduction. The business
needs it to grant a negotiated price to a buyer without editing every line.

```
disc    = parseFloat(gv('tDiscount')) || 0     // a PERCENT, not a fraction
discAmt = subtotal * disc / 100
total   = subtotal - discAmt
```

| Site | Lines |
|---|---|
| Display | `:3093-3095` |
| Persistence | `:2255-2257` |

| Input | Source |
|---|---|
| `subtotal` | C2 |
| `disc` | DOM field `#tDiscount` (`:555`), mirrored into `S.discount` (`:3093`, `:3111`) and stored as `Invoice.discount` (`:2269`) |

**Basis.** The discount applies to the **invoice subtotal**. There is no
line-level discount anywhere. There is no per-Buyer default discount, no
volume-break table, no promotion, and no discount reason field.

**Order of application.** **There is nothing to order it against.** The discount
is the only adjustment between subtotal and total. No tax, no freight, no
rounding adjustment, no deposit. Order-of-operations questions that dominate real
invoicing — tax on the discounted or undiscounted base, discount before or after
freight — **have no legacy answer in this tool.** This is the core of R1.

**Rounding: none stated in source**, at any of the three steps. `discAmt` is a
raw double and is **stored unrounded** as `Invoice.discountAmount` (`:2270`).

**Precision.** `subtotal * disc / 100` evaluates left to right: multiply first,
then divide. On a subtotal of `100` at `disc = 3`, this gives exactly `3`. Had it
been written `subtotal * (disc/100)` it would give `3.0000000000000004`. **The
order chosen is the more accurate one, and it is load-bearing** — a
re-implementation that reorders it produces different stored bytes.

**Edge cases.**

| Case | Behaviour |
|---|---|
| Empty / non-numeric input | `parseFloat('')` → `NaN` → `\|\| 0` → no discount |
| `disc = 0` | `discAmt = 0`; **the discount row is hidden** (`:3099-3100`), so a stored `discountAmount` of 0 is invisible on the document |
| `disc > 100` | **`total` goes negative. No guard.** The DOM carries `max="100"` (`:555`), which constrains the spinner but not typed entry, not a restored whole-app snapshot (`:3821`), and not a loaded Invoice (`:2296`). |
| `disc < 0` | **Negative discount = a surcharge.** `min="0"` (`:555`) has the same limits. `disc>0` is false so the row stays hidden — **the surcharge is applied to the total and not shown**. |
| Missing `subtotal` | Impossible; C2 always yields a number |
| Divide-by-zero | Impossible; the divisor is the literal `100` |

**Round-trip asymmetry — which of the two stored fields is authoritative.**
`Invoice.discount` (percent) and `Invoice.discountAmount` (money) are both
stored. On load, **only the percent is restored** (`:2296` → `#tDiscount`, and
`:2306` → `S.discount`); `discountAmount` is never read back anywhere in the
file. It is then **recomputed and overwritten** on the next save (`:2256`,
`:2270`). So the money field is write-only: **the percent is authoritative and
the amount is a derived echo.** If a stored pair is ever inconsistent, the amount
loses silently.

**Lifecycle asymmetry.** Discount is forced to `0` when starting a new invoice
(`:3285-3286`) and when loading a production draft (`:3258-3259`), but is
**restored** when loading a saved invoice (`:2296`). Three entry paths, two
behaviours.

- **BUSINESS-INVARIANT:** a discount reduces the amount owed.
- **THIS BUSINESS'S POLICY — all of the following:** invoice-level rather than
  line-level; expressed as a **percent** rather than an absolute amount;
  applied to the subtotal; **unrounded**; permitted to exceed 100% and to go
  negative; **stored twice with the percent authoritative**; hidden from the
  document when zero or negative; reset on some load paths and preserved on
  others; and carrying **no reason, approver or audit field**. Every one of these
  is a configuration point B2S must expose or deliberately close.

---

### 2.5 C4 — Invoice grand total

```
total = subtotal − discAmt          :2257  (persist)   ·   :3095  (display)
```

- **There is no tax term. There is no freight term.** The grand total is a
  two-term expression.
- **Rounding: none stated in source.** Stored raw as `Invoice.total` (`:2271`).
  Every downstream net-revenue figure reads this unrounded value
  (`parseFloat(inv.total)||0`, `:2451`).
- **Edge cases:** negative when `disc > 100` (§2.4); zero for an empty invoice.
- **BUSINESS-INVARIANT:** total = subtotal − reductions.
- **POLICY:** which reductions and additions exist. Here: exactly one reduction,
  zero additions.

---

### 2.6 C5 — Return line value

**What it computes and why.** The money value of one returned line, needed to
reduce revenue. **This is the boundary calculation between the two tools** — the
value is produced by `bb-stock-costs` and interpreted here.

```
function getReturnLineTotal(it){                                 :2402
  var lt = parseFloat(it.lineTotal);                             :2403
  if(!isNaN(lt) && lt > 0) return lt;                            :2404
  return (parseFloat(it.qty)||0) * (parseFloat(it.price)||0);    :2405
}
```

| Input | Source |
|---|---|
| `it.lineTotal` | `Return.items[].lineTotal` — foreign, written by `bb-stock-costs` |
| `it.qty`, `it.price` | `Return.items[]` — foreign |

- **Order of operations — matters, and is the point of the function.** The
  **stored** value wins over the **derived** value, but only when it is strictly
  positive. This encodes a real requirement: *the returning tool may have valued
  the line at something other than qty×price, and that valuation is
  authoritative.*
- **Rounding: none stated in source.**
- **Edge cases.** `lineTotal` exactly `0` → falls through to recomputation
  (`> 0`, not `>= 0`), so a **deliberate zero-value return is silently
  re-priced**. `lineTotal` negative → falls through. `lineTotal` absent or
  non-numeric → falls through. Both fallback operands are `||0`-guarded, so a
  missing price yields `0` rather than `NaN`. No divide-by-zero.
- **BUSINESS-INVARIANT:** a returned line has a money value.
- **POLICY:** that a stored valuation overrides a computed one; that the override
  threshold is `> 0` rather than *present*; and — critically — **that the return
  is valued at the line's own price rather than at the price actually charged
  after the invoice discount.** See §2.9.

**Cross-tool note:** this function is byte-identical to the same-named function
in `bb-stock-costs`. Recorded IDENTICAL in §9.2.1.

---

### 2.7 C6 — Per-invoice return aggregate

**What it computes and why.** Rolls every Return record up by invoice so any view
can ask "what came back on this invoice".

```
function aggregateReturnedDeductions(){                                     :2408
  per return in bb_returns:
    if(!ret.invoiceId) skip                                                 :2411
    seed { records:[], totalQty:0, totalRevenue:0,
           totalExpiredAmt:0, fullReturn:false }                            :2413
    info.records.push(ret)                                                  :2416
    if(ret.fullReturn) info.fullReturn = true                               :2417
    info.totalExpiredAmt += parseFloat(ret.amount) || 0                     :2418
    per it in (ret.items || []):                                            :2419
      info.totalQty     += parseFloat(it.qty) || 0                          :2420,:2422
      info.totalRevenue += getReturnLineTotal(it)                           :2421,:2423
}
```

- **Rounding: none stated in source.** Three raw accumulators.
- **Order of operations:** accumulation order is `bb_returns` array order.
  Non-associative addition again; not observable at display precision.
- **Edge cases.** A Return with a falsy `invoiceId` is **dropped entirely**
  (`:2411`) — its quantities and money vanish from every view. `ret.items`
  missing → the record still contributes `amount` to `totalExpiredAmt` and still
  sets `fullReturn`, but contributes nothing to `totalQty`/`totalRevenue`.
  `ret.amount` missing → `0`.

**The semantic hazard, and it is a live one.** The accumulator for `ret.amount`
is named **`totalExpiredAmt`** (`:2413`, `:2418`) and is rendered to the user as
**`تالف`** — *damaged* — at `:3185`. This tool therefore reads `Return.amount`
as meaning **"value written off"**. Whether that is what the producing tool
wrote depends on which return path created the record. **The consumer's
interpretation is fixed; the producer's is path-dependent.** Recorded as
DIVERGENT §9.2.2. It is not a defect in either tool — it is an unstated contract.

- **BUSINESS-INVARIANT:** returns must be attributable to the sale they reverse.
- **POLICY:** that a return with no invoice link is discarded rather than
  recorded as an unattributed credit; and that `amount` means write-off value.

**Performance property worth recording as a requirement, not a defect.** This
function re-reads and re-aggregates the **entire** `bb_returns` collection on
every call. It is called from `getInvoiceReturnInfo` (`:2430`), which is called
from `enrichInvoice` (`:2450`), which is called **once per invoice card**
(`:2357`), **once per history row** (`:3357`), **once per report row** (`:3915`,
`:4002`, `:4032`) and **twice per invoice** in the single-product report
(`:4076`, `:4086`). The requirement it reveals: **every list view in B2S needs
return-adjusted figures**, so return aggregation is a hot path, not a detail view.

---

### 2.8 C7 — Full-return test

**What it computes and why.** Decides whether an invoice counts as a sale at all.
Drives revenue exclusion, badges and report filters.

```
function isInvoiceFullyReturned(invoice, info){                        :2442
  if(!info) return false;                                              :2443
  if(info.fullReturn) return true;                                     :2444
  var invQty = Σ over (invoice.items||[]) of parseFloat(it.qty)||0;    :2445
  return info.totalQty >= invQty - 0.0001;                             :2446
}
```

| Input | Source |
|---|---|
| `info.fullReturn` | `Return.fullReturn`, OR-folded across all returns for the invoice (`:2417`) |
| `info.totalQty` | C6 |
| `invoice.items[].qty` | `Invoice.items` (`:2267`) |

- **Order of operations — matters.** The **stored flag short-circuits before the
  quantity comparison** (`:2444` precedes `:2445`). A return explicitly marked
  full is full regardless of quantities.
- **Rounding: none. One explicit epsilon of `0.0001`** on the comparison
  (`:2446`) — the only tolerance in the file besides `:4043`. It exists to absorb
  floating-point drift when returned quantities are summed back to the invoice
  quantity.
- **Edge cases.**
  - `invoice.items` missing or empty → `invQty = 0` → `totalQty >= -0.0001` →
    **any return at all marks the invoice fully returned.** Reachable:
    `getInvoiceReturnInfo` passes `invoice || {}` (`:2438`), so a lookup by id
    with no invoice object produces exactly this.
  - **Quantities are compared across products.** `totalQty` is a bare sum over
    all returned lines and `invQty` a bare sum over all invoice lines. Returning
    10 units of a cheap product against an invoice of 10 units spread over three
    products **satisfies the test**. The business meaning is *"as many units came
    back as went out"*, not *"every line came back"*.
- **BUSINESS-INVARIANT:** an invoice fully reversed is not revenue.
- **POLICY:** the `0.0001` tolerance; comparing **units** rather than **money**
  or **per-line completeness**; and letting a stored flag override the arithmetic.

**Cross-tool note:** byte-identical to the same-named function in
`bb-stock-costs`, epsilon included. IDENTICAL, §9.2.1.

---

### 2.9 C8 — Net revenue after returns  ·  *the most consequential expression in the file*

**What it computes and why.** Converts a gross invoice into the revenue the
business actually kept. Every revenue figure the owner sees is this number.

```
function enrichInvoice(inv){                                                  :2449
  var info  = getInvoiceReturnInfo(inv.id, inv);                              :2450
  var gross = parseFloat(inv.total) || 0;                                     :2451
  if(!info)                        return {gross, net: gross,  status:'active'};   :2452
  if(isInvoiceFullyReturned(...))  return {gross, net: 0,      status:'full'};     :2453
  return {gross, net: Math.max(0, gross - info.totalRevenue), status:'partial'};   :2454
}
```

| Input | Source |
|---|---|
| `inv.total` | `Invoice.total` (`:2271`) — **post-discount** |
| `info.totalRevenue` | C6 → C5 — Σ returned line values at **undiscounted line price** |

- **Order of operations — matters.** Three branches evaluated in order: no
  returns, then full, then partial. The full branch precedes the arithmetic
  branch, so a full return never reaches the subtraction.
- **Rounding: none stated in source.**
- **Edge cases.** `inv.total` missing → `0`. `Math.max(0, …)` **clamps at zero**,
  so an over-return can never produce negative revenue — and can never be
  detected either. A full return returns a **hard `0`**, not `gross − returned`.

**The unreconciled interaction, recorded as a fact.** `gross` is post-discount
(`:2271`). `info.totalRevenue` is the sum of returned lines at their own
undiscounted price (`:2405`). Subtracting the second from the first at `:2454`
**deducts more than the buyer was charged for those lines** whenever a discount
was applied. On a 100 subtotal with a 10% discount (total 90), returning a line
worth 50 yields `net = 40`, though the buyer paid 45 for it. `Math.max(0, …)`
absorbs the extreme case silently. **This is not recorded as a defect** — it is
the unavoidable consequence of an invoice-level discount meeting a line-level
return, and **B2S must choose a policy**: value returns at list price, or at the
effective post-discount price, or store a per-line effective price at invoice
time. The choice changes every net-revenue figure in the product.

- **BUSINESS-INVARIANT:** net revenue is gross less what came back.
- **THIS BUSINESS'S POLICY:** returns valued at **list** price against a
  **discounted** total; clamping at zero; forcing a full return to exactly zero
  rather than to the arithmetic result; and treating the three statuses as
  derived-on-read rather than stored.

---

### 2.10 C9 — Return subtraction from a product aggregate

**What it computes and why.** Removes returned units and money from the
top-products report so a heavily-returned product does not look like a winner.

```
function subtractReturnsFromProdMap(prodMap, invoiceIds){          :2477
  per ret in bb_returns:
    if(!ret.invoiceId || invoiceIds.indexOf(ret.invoiceId)<0) skip :2479
    per it in (ret.items||[]):                                     :2480
      key = it.productId || it.name                                :2481
      if(!prodMap[key]) return                                     :2482
      prodMap[key].qty = Math.max(0, prodMap[key].qty - qty)       :2485
      prodMap[key].rev = Math.max(0, prodMap[key].rev - lineRev)   :2486
}
```

- **Rounding: none stated in source.**
- **Order of operations — matters, because of the clamp.** `Math.max(0, …)` is
  applied **per return record**, not once at the end. Two returns of 6 units each
  against a product with 10 sold gives `max(0,10−6)=4` then `max(0,4−6)=0`. Had
  the clamp been applied once at the end the result would also be 0, but the
  **money** accumulator can diverge: a large return processed before a small one
  clamps the revenue to zero and the second return then subtracts from zero. **The
  result depends on `bb_returns` array order.**
- **Edge cases.** `:2482` — a return line whose key is not already in the map is
  **silently discarded**. Reachable whenever a product was returned but its
  originating invoice fell outside the report's date window, or when the key
  forms disagree (below).
- **The key form differs from `itemRetKey`.** Here: `it.productId || it.name`
  (`:2481`) — no `'name:'` prefix, no `trim`. In `itemRetKey`:
  `it.productId || ('name:'+trim(name))` (`:1341`, `:2493`). The report builder
  (`:4034`) uses the `:2481` form, so that pairing is consistent. §1.3.2.
- **BUSINESS-INVARIANT:** returned units are not sold units.
- **POLICY:** clamping per record; discarding unmatched returns; keying on a name
  string when no product id exists.

---

### 2.11 C10 — Per-line return breakdown  ·  *the CF-04 renderer*

**What it computes and why.** Produces the per-product chips on a returned
invoice: how many went to waste, how many went back to stock, and who the
restocked units were subsequently sold to.

```
function getItemReturnBreakdown(invoiceId, invoiceItems){                    :2496
  if(!invoiceId) return {};                                                  :2497
  seed a row per invoice line, keyed itemRetKey(it):
      { name, expiredQty:0, restockQty:0, soldTo:[] }                        :2500,:2503-2505
  per ret where ret.invoiceId === invoiceId:                                 :2506
    per it in (ret.items || []):                                             :2507
      k    = itemRetKey(it)                                                  :2508
      qty  = parseFloat(it.qty) || 0                                         :2510
      disp = it.disposition || ret.disposition || 'expired'                  :2511
      disp === 'restock' ? row.restockQty += qty : row.expiredQty += qty     :2512-2513
    per a in (ret.outAllocations || []):                                     :2515
      qty = parseFloat(a.qty) || 0;  if(qty <= 0) skip                       :2518-2519
      merge into row.soldTo by (toCustomerName||'—', toInvoiceNumber||'')    :2520-2524
}
```

- **Rounding: none stated in source.** Quantities only; no money in this function.
- **Order of operations — matters twice.**
  1. **Disposition resolution is a three-level fallback** (`:2511`):
     item-level, then record-level, then the hard default **`'expired'`**.
  2. **Only `'restock'` is truthy-tested; everything else is a write-off**
     (`:2512`). A future third disposition would be silently counted as waste.
- **Edge cases — this is the CF-04 answer.** `(ret.items||[])` (`:2507`) and
  `(ret.outAllocations||[])` (`:2515`) are both guarded, so **a Return record
  with no `outAllocations` key at all renders without throwing** and simply
  produces no `soldTo` chips. `qty <= 0` allocations are skipped (`:2519`).
  Full treatment in Part 4 §4.5.
- **Merge key for resale attribution:** the pair
  `(toCustomerName, toInvoiceNumber)` — **display strings, not ids** (`:2522`).
  Two different buyers with the same name merge into one chip.
- **BUSINESS-INVARIANT:** a returned unit has a disposition, and the business
  must know which.
- **THIS BUSINESS'S POLICY:** exactly **two** dispositions; **write-off is the
  default** when unstated; resale attribution by display name rather than id.

**Default-direction divergence.** This consumer defaults an unmarked return line
to **write-off** (`:2511`). The producing tool's item-level normaliser defaults
the other way. Recorded DIVERGENT §9.2.3.

---

### 2.12 C11 — Next invoice number (`calcNextInvNum`)

```
function calcNextInvNum(customerId){                                       :3330
  all    = InvoiceMgr.getAll()                                             :3332
  source = customerId ? all.filter(i => i.customerId === customerId) : all :3333-3335
  maxNum = 0
  per inv in source:
     m = (inv.invoiceNumber||'').match(/(\d+)/)                            :3338
     if(m) maxNum = Math.max(maxNum, parseInt(m[1]))                       :3339
  return '#INV-' + String(maxNum+1).padStart(3,'0')                        :3341
}
```

- **Rounding: not applicable** — integer sequence. `parseInt` truncates by
  definition.
- **Order of operations — matters.** The scope is chosen *before* the maximum is
  taken. **Per-Buyer when a Buyer is known, global when not** — and the two share
  **one numeric namespace**. A Buyer's first invoice is `#INV-001`, which is also
  the global first invoice's number. Duplicate numbers are not merely possible;
  the design produces them.
- **Edge cases.** Regex `(\d+)` takes the **first** digit run, so
  `#INV-2024-007` yields `2024` and the next number becomes `#INV-2025`.
  `padStart(3,'0')` only pads — the 1000th invoice is `#INV-1000`, four digits.
  No invoice with a digit anywhere → `maxNum = 0` → `#INV-001`.
  **Uniqueness is never checked at save**: the upsert keys on `id` (`:2276`), not
  on `invoiceNumber`, and the field is free text (`:890`).
- **BUSINESS-INVARIANT:** an invoice needs a human-facing identifier.
- **THIS BUSINESS'S POLICY:** the `#INV-` prefix; 3-digit zero padding;
  first-digit-run parsing; **per-Buyer versus global scope**; and that the number
  is advisory rather than enforced.

---

### 2.13 C12 — Init auto-number *(a second implementation)*

```
maxN = 1                                                                  :4201
per inv: m = (inv.invoiceNumber||'').match(/(\d+)/)
         if(m) maxN = Math.max(maxN, parseInt(m[1]) + 1)                  :4202
mInv.value = '#INV-' + String(maxN).padStart(3,'0')                       :4203
```

Differs from C11 in **two** places: the seed is `1` not `0`, and the `+1` sits
**inside** the `Math.max` rather than outside. The two agree on every input
(both yield `max(existing)+1`, floored at 1), but they are independent
expressions. Scope is always **global**. Runs only when the field is empty
(`:4200`).

- **Rounding: not applicable.** **Edge cases:** as C11.

---

### 2.14 C13 — Duplicate-invoice numbering *(a third implementation)*

```
maxNum = 0                                                                :2317
per inv in ALL invoices: maxNum = Math.max(maxNum, parseInt(first \d+))   :2318
newInv.invoiceNumber = '#INV-'+String(maxNum+1).padStart(3,'0')           :2321
newInv.id            = genId('inv')                                       :2320
newInv.savedAt       = new Date().toISOString()                           :2322
newInv.date          = todayISO()                                         :2323
```

- **Always global scope**, never per-Buyer. **Duplicating a per-Buyer-numbered
  invoice therefore jumps its number to the global maximum**, breaking that
  Buyer's sequence.
- The duplicate is a full deep clone (`:2319`) — **including `subtotal`,
  `discount`, `discountAmount` and `total`**. No money is recomputed. Correct
  behaviour for a duplicate, and worth recording as the requirement it is.
- **Rounding: not applicable.**

---

### 2.15 C14 — Report: total overview

```
enriched  = invoices.map(enrichInvoice)                                    :3915
salesOnly = enriched.filter(e => e.salesStatus !== 'full')                 :3918
fullRetN  = count of salesStatus === 'full'                                :3937
partRetN  = count of salesStatus === 'partial'                             :3938
totalRev  = Σ e.net over salesOnly                                         :3939
avgInv    = salesOnly.length ? totalRev / salesOnly.length : 0             :3940
custSet   = distinct e.inv.customerName over salesOnly                     :3941-3942
monthly[YYYY-MM] = { count++, total += e.net }                             :3954-3959
custTotals[customerName] = { total += e.net, count++ }                     :3973-3978
topCusts  = sort desc by total, take 5                                     :3979
bar pct   = maxVal > 0 ? Math.round(value/maxVal*100) : 0                  :3907
```

- **Rounding: none on any money value.** `Math.round` at `:3907` applies **only
  to a CSS width percentage** — the tool's sole `Math.round`.
- **Divide-by-zero: guarded twice.** `avgInv` guards on `salesOnly.length`
  (`:3940`); the bar percentage guards on `maxVal > 0` (`:3907`).
- **Order of operations — matters.** Full returns are removed **before** the
  average is taken, so `avgInv` is the mean over **selling** invoices, not over
  all invoices in the period. A period of ten invoices of which four were fully
  returned reports an average over six.
- **Edge cases.** An invoice with an empty `date` is **dropped from the monthly
  chart** (`:3956` `if(!key) return`) while remaining in the headline totals —
  the chart and the headline disagree by design. An invoice with an empty
  `customerName` is excluded from the active-buyer count (`:3942`) but grouped
  under `'—'` in the top-buyers chart (`:3975`).
- **Grouping key: `customerName`, a display string** (`:3975`), **not
  `customerId`.** Two Buyers with the same name merge; one Buyer renamed splits
  into two rows. §1.3.1.
- **BUSINESS-INVARIANT:** period revenue is the sum of net invoice values.
- **POLICY:** excluding full returns from the average's denominator; grouping
  buyers by name; a fixed top-5 cut (`:3979`); dropping undated invoices from the
  time series but not the total.

**Date filtering (`runReport`, `:3883-3890`)** — the input to every report:

```
if(from && (inv.date||'') < from) return false                            :3887
if(to   && (inv.date||'') > to)   return false                            :3888
```

**Inclusive at both ends**, by lexicographic comparison on `YYYY-MM-DD` strings —
correct for that format. **Asymmetric on a missing date:** `'' < from` is true so
an undated invoice is **excluded** when a start date is set, but `'' > to` is
false so it is **included** when only an end date is set. Recorded as a fact.

---

### 2.16 C15 — Report: per-Buyer

```
invoices  = filtered to inv.customerId === selected                        :3996
enriched / salesOnly                                                       :4002-4003
totalRev  = Σ e.net over salesOnly                                         :4004
avgInv    = salesOnly.length ? totalRev/salesOnly.length : 0               :4005
lastDate  = salesOnly sorted desc by (b.inv.date||'') → [0].inv.date, else '—'  :4006
```

- **Rounding: none.** **Divide-by-zero: guarded** (`:4005`).
- **Filters on `customerId`** (`:3996`) — the *opposite* key from C14's
  `customerName` (`:3975`). The two reports disagree for renamed or
  same-named Buyers, and an invoice saved with a typed-not-picked Buyer
  (`customerId: null`, `:2262`) appears in C14 and **never** in C15.
- The invoice **table** below the stats lists **all** enriched invoices including
  full returns (`:4018`), while the stats above use `salesOnly`. Both figures are
  correct and they do not add up; the discrepancy is the requirement — the owner
  wants to see the returned invoice *and* exclude it from the total.
- **Edge case:** `lastDate` uses `localeCompare` on the date string (`:4006`);
  undated invoices sort last and yield `''`.

---

### 2.17 C16 — Report: top products

```
prodMap[it.productId || it.name] ||= { name: it.name.split('·')[0].trim() || it.name,
                                       qty:0, rev:0, count:0 }              :4034-4035
qty   += it.qty || 0                                                        :4036
rev   += (it.qty||0) * (it.price||0)                                        :4037
count += 1                                                                  :4038
ReturnsMgr.subtractReturnsFromProdMap(prodMap, invIds)                      :4041
sorted = values filtered (qty > 0.0001 || rev > 0.0001), sorted desc        :4043
maxVal = sorted[0][sortBy]                                                  :4046
suffix = sortBy==='rev' ? S.cur : 'وحدة'                                    :4047
```

- **Rounding: none.** **A second epsilon, `0.0001`** (`:4043`), used here as a
  *visibility floor* rather than an equality tolerance — a fully returned product
  clamped to exactly 0 by `:2485-2486` is hidden from the table.
- **Order of operations — matters.** Gross figures are accumulated **first**, and
  returns subtracted **after** (`:4041`), which is what makes the per-record
  clamp in C9 order-sensitive.
- **Revenue here is `Σ qty × price`** (`:4037`) — **line values, not
  `Invoice.total`.** The invoice-level discount therefore **never reaches this
  report**. C14's headline uses `net` (post-discount, post-return); this table
  uses gross line value less returns. **Whenever any discount was applied in the
  period, the two cannot be reconciled.** This is a structural consequence of
  modelling the discount at the invoice level and reporting at the line level,
  and it is a decision B2S must make deliberately.
- **`count` counts lines, not invoices** (`:4038`). The same product added twice
  to one invoice counts 2.
- **`it.name.split('·')[0].trim()`** (`:4035`) makes the bilingual middot
  **load-bearing punctuation inside an aggregation payload**: a product named
  without a `·` keeps its full name via the `|| it.name` fallback; one named with
  two middots silently loses everything after the first.
- **Edge cases.** `sortBy` from `#rptSortSel`, defaulting to `'rev'` (`:4028`).
  Empty result → an empty-state message (`:4044`). `maxVal` is taken from the
  already-sorted head, so it is never zero unless every value is zero, which the
  `:4043` filter has already excluded.
- **BUSINESS-INVARIANT:** product performance is units and revenue, net of
  returns.
- **POLICY:** revenue measured at list line value rather than at realised
  post-discount value; counting lines rather than invoices; the `0.0001`
  visibility floor; truncating the display name at the first middot.

---

### 2.18 C17 — Report: single product

```
skip invoice if fully returned                                              :4076
per line with it.productId === prodId:                                      :4079
    lineQty += it.qty||0 ;  lineRev += (it.qty||0)*(it.price||0)            :4080-4081
then per return record on that invoice, per return item with productId === prodId:
    lineQty = Math.max(0, lineQty - (parseFloat(it.qty)||0))                :4091
    lineRev = Math.max(0, lineRev - getReturnLineTotal(it))                 :4092
keep the invoice only if lineQty > 0                                        :4097
totalQty / totalRev accumulate the kept rows                                :4099-4100
avg = matched.length ? totalQty/matched.length : 0                          :4112
```

- **Rounding: none.** **Divide-by-zero: guarded** (`:4112`).
- **Order of operations — matters.** Gross first, returns second, then the
  `lineQty > 0` gate. Because the gate tests **quantity only**, an invoice whose
  units all came back is dropped **even if `lineRev` is still positive** (which
  happens whenever `lineTotal` valued the return below `qty × price`). Revenue
  that C16 still counts disappears here.
- **Matches on `productId` only** (`:4079`, `:4090`). A **manual line**
  (`productId: null`, `:3077`) can never appear in this report, and neither can
  a line whose Product was deleted — while both still appear in C16 under the
  name key. **The same sale is visible in one report and invisible in the other.**
- **Edge cases.** `Math.max(0, …)` clamps per return record, same order
  sensitivity as C9. No product selected → an empty-state message (`:4068`).
- **BUSINESS-INVARIANT:** a product's sales history is its lines less its returns.
- **POLICY:** identity by product id only; the quantity-only inclusion gate.

---

### 2.19 C18 — Outstanding-invoice count *(the closest thing to a balance)*

**What it computes and why.** The customer-list printout tells the owner which
Buyers owe them something. **This is the only place payment status enters any
calculation in the file.**

```
function getPendingInvoices(customerId){                                   :1982
  return getCustomerInvoices(customerId).filter(function(inv){
    if(getPaymentStatus(inv.id) === 'paid') return false;                  :1984
    var e = ReturnsMgr.enrichInvoice(inv);
    return e.salesStatus !== 'full';                                       :1985
  });
}
pendingTotal = Σ over printed customers of pending.length                  :2059
withInv      = count of customers having ≥1 invoice                        :2058
```

- **Rounding: not applicable — these are counts, not money.**
- **Order of operations — matters and is correct.** Paid is excluded first, then
  fully-returned. **A fully returned invoice is not outstanding even if it was
  never paid.** That is a real and non-obvious business rule, and it is the
  clearest requirement in this part of the file.
- **No money is ever summed here.** The printout lists the *count* of unpaid
  invoices (`:2059`) and the *numbers and dates* of them (`:1999-2007`). **It
  never totals what a Buyer owes.** Part 5.
- **Edge cases.** Absent payment record → treated as unpaid (`:1968`). Buyer with
  no invoices → empty list, contributes `0`.
- **BUSINESS-INVARIANT:** a reversed sale is not a receivable.
- **POLICY:** binary paid/unpaid; counting rather than totalling.

---

### 2.20 C19 — Customer-list amount display

```
function formatInvAmount(inv){                                             :1990
  if(typeof ReturnsMgr !== 'undefined'){                                   :1991
    e = ReturnsMgr.enrichInvoice(inv);
    if(full)    return struck-through fmt(e.gross) + cur + '↩️'            :1993
    if(partial) return fmt(e.net) + cur + struck fmt(e.gross) + '🔄'       :1994
  }
  return fmt(parseFloat(inv.total)||0) + ' ' + esc(S.cur||'EGP')           :1996
}
```

- **Rounding: none beyond `fmt`.**
- **Both figures are printed for a partial return** — the net in full weight and
  the gross struck through. The document requirement is *show what it was and
  what it became*, not *show one number*.
- The `typeof ReturnsMgr !== 'undefined'` guard (`:1991`, and again `:1985`)
  defends against a module declared **later in the same file** (`:2398`). It is
  always defined by the time these run.

---

### 2.21 C20 — Buyer history totals

```
enriched   = invs.map(enrichInvoice)                                       :3357
totalSpent = Σ e.net over enriched where salesStatus !== 'full'            :3358
retCount   = count where salesStatus !== 'active'                          :3359
```

- **Rounding: none.** Displayed via `fmt` at `:3368`, labelled `'صافي: '`.
- **`retCount` counts partial *and* full** (`!== 'active'`), whereas C14 reports
  them as two separate figures (`:3937-3938`). Two summarisations of one concept.

---

### 2.22 C21 — Colour arithmetic *(non-money, recorded for completeness)*

```
function hexA(hex, a){                                                     :1345
  r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16),
  b = parseInt(hex.slice(5,7),16)
  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'                   :1347
}
```

- **Rounding: none.** `parseInt` base 16.
- **Edge case: unguarded.** A malformed or short hex yields `NaN`, which is
  interpolated into the CSS string as the literal `NaN` and silently ignored by
  the renderer. Reachable via an imported whole-app snapshot (`:3754-3768`),
  which performs no validation.
- `drawPattern` (`:2963-2974`) draws diagonal rules at a fixed 14-px pitch using
  `C.gold`; pure presentation, no business quantity.

---

### 2.23 The prompt's minimum calculation list, answered item by item

| Required calculation | Present? | Where / why not |
|---|---|---|
| Invoice line totals | **Yes** | C1 §2.2 |
| Discounts | **Yes** | C3 §2.4 — invoice-level percent, the only money policy in the file |
| **Tax** | **NO** | **Absent entirely.** Zero occurrences of `tax`, `VAT`, `ضريبة`. R1. |
| Invoice grand total | **Yes** | C4 §2.5 |
| Net revenue after returns | **Yes** | C8 §2.9 |
| **COGS per unit** | **NO** | No cost field exists on any entity. R3. |
| **Margin** | **NO** | Requires cost. Absent. |
| Product summary | **Yes** | C16 §2.17, C17 §2.18 |
| **Component usage** | **NO** | No recipe, BOM or component concept. |
| **Recipe costing** | **NO** | Same. |
| **Monthly profit** | **NO** | Monthly **revenue** exists (C14 `:3954-3959`); profit requires cost. |
| **Gross / net / cash profit** | **NO** | Absent. |
| **Stock value** | **NO** | No stock quantity is held. The only stock signal is a **read** of the foreign boolean `prepSummary.stockOk` (`:2211-2212`). |
| **Stock after purchase** | **NO** | No purchase concept. |
| **Stock after production** | **NO** | No production concept; drafts arrive pre-computed. |
| **Stock after sale** | **NO** | Saving an invoice moves no stock. |
| **Stock after return** (restock / write-off) | **Partly — quantities only, no stock effect** | C10 §2.11 splits returned units into `restockQty` and `expiredQty` **for display**. Neither figure updates any stock level, because none exists here. |
| **Low-stock thresholds** | **NO** | No threshold. `stockOk` arrives pre-decided. |
| **Operating-cost allocation** | **NO** | No operating-cost concept. |
| *Additional found* | | Return line value C5 · return aggregate C6 · full-return test C7 · product-map subtraction C9 · four numbering variants C11–C13 · report aggregates C14–C18 · outstanding count C19 · display formatter §2.1 · colour maths C21 |

**Summary of the invariant/policy split across all 22.** Only three expressions
are purely business-invariant: line extension (C1), subtotal (C2) and
total = subtotal − reductions (C4). **Every other calculation carries at least
one policy choice**, and the four that carry the most — discount (C3), net after
returns (C8), the full-return test (C7) and top-products revenue (C16) — are
exactly the four where this tool and `bb-stock-costs` can disagree about the same
invoice. Those are Part 9's subject.

---

## PART 3 — WORKFLOWS

Sixteen complete workflows. For each: ordered steps, entities touched, state
transitions, and every point at which the workflow can be abandoned together with
the state that abandonment leaves behind.

**A note that governs this whole Part.** There is **no transaction boundary
anywhere in this tool.** Every write is an independent `Store.set` (`:1201`).
Nothing is staged, nothing is rolled back, and no workflow is atomic. The
abandonment column below is therefore not an edge-case list — it is the normal
operating characteristic of every multi-step flow.

---

### W1 — Connect the shared folder

**Entities:** IndexedDB handle · all ten `MANAGED` keys · `localStorage`

| # | Step | Line |
|---|---|---|
| 1 | On load, `restore()` reads the stored handle and calls `queryPermission({mode:'readwrite'})` | `:1095-1107` |
| 2 | If already granted, `loadAll()` pulls all ten `MANAGED` keys from disk into `localStorage` | `:4167-4170`, `:1139-1151` |
| 3 | Status dot updated after a 150 ms delay so the DOM is painted | `:4172`, `:1165-1176` |
| 4 | If not granted, the user clicks the folder button → `requestAccess()` re-prompts on the stored handle | `:4135-4137`, `:1110-1122` |
| 5 | If that fails, `connect()` opens `showDirectoryPicker({mode:'readwrite', startIn:'documents'})` and persists the new handle | `:4140`, `:1131-1133` |
| 6 | `loadAll()`, then every panel re-renders | `:4145-4152` |

**State transitions:** *disconnected* → *restored-silently* → *connected*, or
*disconnected* → *prompted* → *connected* / *refused*.

**Abandonment.**

| Abandoned at | State left behind |
|---|---|
| User dismisses the directory picker | `catch(e){ return false; }` (`:1135`) — **silent**. The tool runs entirely on `localStorage` and the owner has no signal that cross-tool sync is off beyond a status dot. |
| Permission denied on restore | `resolve(false)` (`:1104`) — silent, same outcome |
| One `<key>.json` is malformed or absent | `catch(e){ /* file not there yet — first run */ }` (`:1149`) — **that key is skipped and the loop continues**. A corrupt `bb_invoices.json` leaves the tool running on stale `localStorage` invoices with no warning. |
| Browser is Brave/Firefox on `file://` | `FSA` is false (`:1065`), `alert('⚠ هذه الميزة تحتاج Chrome أو Brave أو Edge (إصدار حديث).')` (`:1127`) |

**Requirement this encodes:** the business expects **silent, automatic
reconnection to shared data at startup**, with an explicit reconnect available,
and expects the tool to remain fully usable when the folder is unavailable.

---

### W2 — Issue an invoice from scratch  *(the primary workflow)*

**Entities:** Buyer (read) · Product (read) · InvoiceLine (create) ·
Invoice (create) · `bb_inv2` (update)

| # | Step | Line |
|---|---|---|
| 1 | `newInvoice()` — `confirm()`, then clear pending mode and reset the form | `:3298-3303` |
| 2 | `resetInvoiceFormForNew(null)` — `items=[]`, `currentLoadedInvoiceId=null`, discount → 0, date → today, number → `calcNextInvNum(null)` | `:3279-3296` |
| 3 | Buyer chosen: focus on `#mvCust` opens the picker | `:3448-3453`, `:3456` |
| 4 | `selectCustomer(id)` sets `currentCustomerId`, fills name/phone, sets date to today | `:1399-1404` |
| 5 | **`resetInvoiceFormForNew(id)` runs again — clearing every line already added** | `:1423` |
| 6 | If the Buyer has prior invoices, the history overlay opens automatically | `:1425-1427`, `:3350` |
| 7 | Lines added: product picker (`:3494`), bulk-by-category (`:3541`), multi-category (`:3550`), or a manual row (`:3076`) | |
| 8 | Quantity and price edited in place; `calcTotals()` on every keystroke | `:3046`, `:3058`, `:3086` |
| 9 | Discount typed; `syncAndRender` → `calcTotals` | `:3111`, `:3093` |
| 10 | Notes typed | `:967` |
| 11 | `saveInvoiceToHistory()` → `InvoiceMgr.saveCurrentInvoice()` | `:3128`, `:2244` |
| 12 | Record built and upserted; `currentLoadedInvoiceId` set; cards re-render; toast | `:2260-2283` |
| 13 | Print via `window.print()` on the live page | `:751`, `:1045` |

**State transitions:** *empty form* → *buyer assigned* → *lines present* →
*saved (`currentLoadedInvoiceId` set)* → *printed*.

**Abandonment — five distinct points, four of them lossy.**

| Abandoned at | State left behind |
|---|---|
| **Step 5 — picking a Buyer after adding lines** | **Every line is destroyed** (`:1423` → `:3280`). There is **no `confirm()` on this path** — the `confirm()` at `:3299` guards `newInvoice()`, not `selectCustomer()`. Silent loss of unsaved work. Recorded in Part 8 §8.3. |
| Steps 7–10, tab closed | Lines are lost. `items` is module state; only `bb_inv2` persists it (`:2553`), and `syncInv2Template` runs on `saveSettings()` (`:3124`) and at init (`:4231`) — **not on line edits**. |
| Step 11, name and lines both empty | Save refused with `'الفاتورة فارغة!'` (`:2251`). A named Buyer with **zero lines saves a zero-total invoice**. |
| Step 12, `localStorage` quota exceeded | `catch(e){}` (`:1202`) — **the toast at `:2283` still says saved**. The owner is told the invoice is saved when it is not. Part 8 §8.4. |
| Step 12, folder write fails | `catch(e){ /* silent */ }` (`:1161`) — `localStorage` holds the invoice, the shared file does not. `bb-stock-costs` never sees it. |

**Requirements this encodes:** invoice number auto-assigned and editable; date
defaults to today; the Buyer's history is offered at selection time; lines
editable in place with live totals; a whole-invoice discount; free-text notes;
save and print are separate acts.

---

### W3 — Add products to an invoice  *(four sub-paths)*

| Path | Steps | Line |
|---|---|---|
| **Single** | Picker → click a product → `ProductMgr.addToInvoice(id)` → push `{productId, name, packType, weight, categoryId, qty:1, price:unitPrice}` → `renderItems` → `calcTotals` → picker closes | `:1598-1606` |
| **All in the active category** | `addAllProductsInPickerCategory()` → filter by `_activeProdPickerCat` → `addManyToInvoice(list, true)` | `:3541-3548`, `:1608-1618` |
| **All in several categories** | `addAllProductsInSelectedCategories()` → read the checkbox set → `addManyToInvoice` | `:3550-3560` |
| **Manual line** | `addManualRow()` → push `{productId:null, …, qty:1, price:0}` → focus the name input | `:3076-3081` |

**Entities:** Product (read) · InvoiceLine (create)

**State transition:** each add appends to `items`; **no duplicate check** — adding
the same product twice yields two independent lines, which C16 then counts as
`count += 1` twice (`:4038`).

**Abandonment:** the picker closes on ESC (`:4266-4270`) or an overlay click
(`:3703`); lines already added remain. Nothing is staged.

**Requirement:** bulk add by category is a first-class need, not a convenience —
three of the four paths exist to add many products at once.

---

### W4 — Load a saved invoice

| # | Step | Line |
|---|---|---|
| 1 | From the history accordion (`confirm()` at `:2378`) or the Buyer history overlay (`confirm()` at `:3346`) | |
| 2 | `InvoiceMgr.loadInvoice(id)` — not found → toast and stop | `:2286-2289` |
| 3 | Fields restored: name, phone, number, date, notes, **discount percent** | `:2291-2296` |
| 4 | `currentCustomerId` and `currentLoadedInvoiceId` set — **the form is now in upsert mode** | `:2298-2299` |
| 5 | `items` rebuilt from the stored array with per-field defaults | `:2301-2303` |
| 6 | `renderItems()` **before** `syncAndRender()` — the source comments this as a fix | `:3305` |
| 7 | `S.discount` set, `syncAndRender()`, editor panel closes | `:2306-2310` |

**State transition:** *any* → *editing an existing invoice*. The next save
**overwrites** rather than creates (`:2261`, `:2277`).

**Abandonment.** Loading discards the current unsaved invoice — guarded by
`confirm()` on both entry paths. Once loaded, closing the tab loses edits but
leaves the stored invoice untouched. **`discountAmount` is not restored**
(§2.4) and is recomputed on the next save.

---

### W5 — Duplicate an invoice

`duplicateInvoice(id)` (`:2313-2328`): deep-clone, new `genId('inv')`, invoice
number from the **global** maximum + 1, `savedAt` now, `date` today, `unshift`,
save, re-render, toast.

**All money is copied verbatim** — subtotal, discount, discountAmount, total are
not recomputed. Correct for a duplicate.

**No `confirm()`.** The duplicate is written immediately. **Abandonment is
impossible** — the operation is a single write. Recorded because it is the only
flow in the tool with that property.

---

### W6 — Delete an invoice

`confirm('حذف الفاتورة '+inum+'؟')` (`:2384`) → `removeInvoice(id)` (`:2330`) →
hard filter → if it was the loaded invoice, clear `currentLoadedInvoiceId` and
the return banner (`:2332-2335`) → re-render.

**Referential fallout, none of it handled:** any `Return` pointing at the invoice
is orphaned in the other tool's file (R5); any `bb_invoice_payments` entry is
orphaned (R7); any completed draft's `completedInvoiceId` dangles (R8). **The
invoice number is not retired** — `calcNextInvNum` derives from surviving
invoices only (`:3337-3340`), so deleting the highest-numbered invoice causes the
next one to **reuse that number**.

---

### W7 — Buyer create / edit / delete

**Create/edit:** `openCustForm(cust)` (`:3634`) → fields → `saveCustForm()`
(`:3653`) → name required (`'الاسم مطلوب!'`, `:3655`) → `update(id, data)`
(`:1383`) or `add(data)` (`:1375`) → re-render → toast.
**Delete:** `confirm('حذف "'+c.name+'"؟')` (`:1482`) → `remove(id)` (`:1391`).

**State transition on delete:** *referenced* → *deleted*, with **no cascade and
no warning**. Every invoice keeps `customerId` pointing at nothing (R1). The
Buyer's revenue vanishes from the per-Buyer report (`:3996`) and from history
(`:3354`), but remains in the total report — which groups by `customerName`
(`:3975`) and so **still shows the deleted Buyer by name**. The card even
displays the invoice count before deletion (`:1395-1397`), so the information
needed to warn exists and is not used.

**Requirement:** B2S must decide between soft-delete, cascade, and refusal.

---

### W8 — ProductCategory create / delete  *(no edit path exists)*

**Create:** `addCategoryQuick()` (`:3626`) → name required (`'أدخل اسم
التصنيف'`, `:3628`) → `CategoryMgr.add(name, color)` (`:1520`) → re-render the
cards, the filter bar and the form dropdown.
**Delete:** `confirm('حذف التصنيف؟')` (`:1557`) → `remove(id)` (`:1525`).

**There is no edit.** §1.1.2. Correcting a category name requires delete plus
re-add, which **orphans every product's `categoryId`** (R4) — those products then
render with an empty label and the `#888` fallback colour (`:1527-1528`) and are
grouped under an unnamed heading on the price list (`:1747-1752`).

**Requirement:** the ability to rename a ProductCategory without orphaning its
Products — a capability this tool lacks and whose absence the owner has been
absorbing manually.

---

### W9 — Product create / edit / delete

**Create/edit:** `openProdForm(prod)` (`:3665`) → name required
(`'اسم المنتج مطلوب!'`, `:3683`) → `add` (`:1583`) / `update` (`:1588`) →
re-render.
**Delete:** `confirm('حذف هذا المنتج؟')` (`:1668`) → `remove(id)` (`:1596`).

**Price edits do not restate history** — `InvoiceLine.price` is a snapshot
(`:1600`). Correct, and a real requirement.
**Deletion orphans lines** (R3): they survive on their snapshots, remain in C16
under the name key, and vanish from C17 which matches on `productId` (`:4079`).

---

### W10 — Production draft → invoice  *(the cross-tool handoff)*

**Entities:** SalesOrder draft (read, update) · Buyer (read) · InvoiceLine
(create) · Invoice (create)

| # | Step | Line |
|---|---|---|
| 1 | Drafts arrive in `bb_pending_invoices`, written by `bb-stock-costs`, pulled by `loadAll` | `:1064`, `:1139` |
| 2 | Only non-`'completed'` drafts render, showing `prepSummary.stockOk` as `'✓ مخزون كافٍ'` / `'⚠ نقص مخزون'` | `:2204`, `:2211-2212` |
| 3 | `loadPendingInvoice(id)` — refuses if missing or already completed (`'المسودة غير موجودة أو أُصدرت مسبقاً'`) | `:3243-3245` |
| 4 | `confirm('تحميل المسودة؟ ستُستبدل الأصناف الحالية.')` if lines exist | `:3246` |
| 5 | `currentPendingInvoiceId = id`; `currentLoadedInvoiceId = null`; return banner cleared | `:3248-3250` |
| 6 | Buyer, date (today), number, notes filled; **discount forced to 0** | `:3251-3259` |
| 7 | `items` rebuilt from `pend.items` | `:3261-3263` |
| 8 | Draft banner shown; the "issue draft" button appears | `:3268`, `:3229-3241` |
| 9 | If no Buyer yet, `selectCustomer` **writes the Buyer back onto the draft** and returns early — it does **not** clear the lines on this path | `:1409-1419` |
| 10 | `completePendingInvoice()` → `saveInvoiceToHistory()` | `:3274-3277` |
| 11 | **Buyer is mandatory here** — `'⚠ عيّن العميل أولاً (👤) قبل إصدار المسودة'`, and the picker opens | `:3129-3133` |
| 12 | `saveCurrentInvoice()` creates the Invoice | `:3134` |
| 13 | `markCompleted(draftId, currentLoadedInvoiceId)` → `{status:'completed', completedInvoiceId}` | `:3136`, `:2196-2198` |
| 14 | Draft mode cleared, cards re-render | `:3138-3139` |

**State transitions:** draft *open* → *loaded* (`currentPendingInvoiceId` set) →
*buyer assigned* (written back to the draft) → *completed* (invoice created,
draft closed and hidden).

**This is the only workflow in the tool with a mandatory field** (`:3129`) and
the only one that writes to a foreign entity (`:1410`, `:2185`).

**Abandonment — the most consequential in the tool.**

| Abandoned at | State left behind |
|---|---|
| After step 5, tab closed | `currentPendingInvoiceId` is module state and is **lost**. The draft is still `status !== 'completed'`, so it reappears. **Safe.** |
| After step 9, tab closed | The draft now carries `customerId`, `customerName`, `customerPhone` and an `updatedAt` (`:2191`) **but no invoice**. It reappears in the list, now pre-assigned. Recoverable, and arguably desirable. |
| **Between step 12 and step 13** | **The invoice exists and the draft is still open.** Two writes, no transaction. Re-loading the draft creates a **second invoice for the same production run**. Nothing detects it. Part 8 §8.5. |
| Step 13 fails silently | Same as above — `saveAll` swallows (`:1202`). |
| Draft deleted while loaded | `confirm('حذف "'+p.title+'"؟')` (`:2223`) → `remove` (`:2200`). `currentPendingInvoiceId` still points at it; `updatePendingBanner` returns early on `!pend` (`:3233`) but the button stays visible (`:3240` already ran), and `saveInvoiceToHistory` will call `markCompleted` on a deleted id — `update` finds nothing and returns `null` (`:2189`). Silent no-op. |

**Requirement this encodes:** production and sale are separate acts by separate
tools; the draft carries a stock-sufficiency verdict computed elsewhere; the
Buyer may be unknown at production time and is assigned at invoice time; and a
draft must be closed exactly once.

---

### W11 — Price-list print

| # | Step | Line |
|---|---|---|
| 1 | Tick products in the catalog accordion; `_selected` map maintained | `:1693-1700` |
| 2 | Select-all applies to **visible** (search + category filtered) products only | `:1717-1722`, `:1703-1712` |
| 3 | Toolbar shows the count | `:1714-1716` |
| 4 | `openPreview()` — refuses on zero selection (`'حدّد منتجاً واحداً على الأقل ☑'`) | `:1858-1867` |
| 5 | `groupProducts()` groups by ProductCategory; uncategorised → `S.plLblOther` | `:1745-1755`, `:1760` |
| 6 | `buildDocumentHtml()` — header, summary counts, one table per category, footer note. **All content passed through `esc()`** | `:1775-1855`, `:1740-1742` |
| 7 | `print()` → `window.open('', '_blank')` → write → self-print | `:1875-1893`, `:1889-1890` |

**Entities:** Product (read) · ProductCategory (read) · `S` (read)

**Abandonment:** selection is module state (`:1691`) — closing the overlay keeps
it, reloading loses it. Popup blocked → `'⚠ اسمح بالنوافذ المنبثقة للطباعة'`
(`:1891`) and the flow ends cleanly.

**Requirement:** a branded, categorised, selectively-scoped price list is a
distinct deliverable from the invoice, with its own title, footer, column
headers and free-text note (`:1223-1229`).

---

### W12 — Customer-list print

Same shape as W11 (`:1912-2176`) over Buyers, **plus payment and returns data**:

| Column | Source | Line |
|---|---|---|
| Name / phone / address / notes | `bb_customers` | `:2104-2107` |
| Last invoice number and date | `getLatestInvoice` | `:1971-1974` |
| Last invoice value | `formatInvAmount` — net/gross for returns | `:1990-1997` |
| Payment status | `getPaymentStatus` → `S.clPaid` / `S.clPending` | `:1966-1969` |
| **Outstanding invoice list** | `getPendingInvoices` — unpaid **and** not fully returned | `:1982-1988`, `:1999-2007` |
| Summary | total Buyers · Buyers with invoices · total outstanding **count** | `:2057-2059` |

**This printout is the closest thing the business has to a receivables
statement**, and it reports **counts, never amounts** (§2.19). Part 5.

---

### W13 — Reporting

`openReports()` (`:3847`) populates the Buyer and Product selectors →
`switchReport(type)` (`:3868`) shows the relevant filter and calls `runReport()`
→ `runReport()` (`:3883`) filters `bb_invoices` by the date range → dispatches to
one of four renderers (`:3893-3896`).

**Entities:** Invoice (read) · Return (read) · Buyer (read) · Product (read)

**Read-only.** No state transition, nothing written, nothing to abandon.
The date filter's asymmetric handling of undated invoices is recorded at §2.15.

**Requirement:** four fixed report shapes — period totals, one Buyer, product
ranking, one product — all **net of returns**, all date-filterable.

---

### W14 — BrandTheme save / apply / delete

**Apply:** dropdown (`:2593`) or card click (`:1311`) → `applyColorPreset` →
copy the seven fields into `C`, set the active id, sync the pickers, `applyTheme`,
`drawPattern`, `syncInv2Template`.
**Save:** `saveColorPreset()` (`:2613`) → name required (`'أدخل اسم البريسيت'`,
`:2615`) → `add(name, C)` (`:1271`) → set active → re-render.
**Delete:** `deleteColorPreset(id)` (`:2630`) → `remove` (`:1279`) → if it was
active, clear the active id.
**Manual colour edit clears the active selection** (`:4245-4253`).

**Cross-tool effect:** every apply calls `syncInv2Template()` (`:2551`), writing
`bb_inv2` — **so changing the theme here changes how `bb-stock-costs` reprints
invoices.** R11.

---

### W15 — Whole-app snapshot save / load / export / import

`pbSave()` (`:3719`) captures `presetGetState()` (`:3796-3808`) — colours,
settings, lines, **and the buyer name, phone, invoice number, date and notes** —
into slot 0 of `bbinv_pb`, capped at 8 (`:3714`).
`pbLoad(idx)` (`:3728`) applies `presetSetState`, with the whole body wrapped in
`catch(e){ toast('خطأ في التحميل: '+e.message); }` (`:3734`) — **one of only two
error paths in the file that reach the user**.
`pbExport(idx)` (`:3743-3751`) downloads `{name, template:'bbinv', date, state}`.
`pbImport(evt)` (`:3754-3768`) parses an arbitrary file, checks only
`if(!obj.state) throw` (`:3759`), then applies it.

**Abandonment / hazards:** the store is **unmirrored and browser-local**
(§1.0.5); the export **carries buyer PII** (Part 8 §8.14); the import applies
unvalidated third-party JSON into `C`, `S` and `items` (Part 8 §8.15).

---

### W16 — Viewing returns  *(read-only; there is no return workflow here)*

**Stated plainly: this tool cannot create, edit or delete a return.** It has no
return form, no disposition control, no allocation UI. `ReturnsMgr` exposes
eleven functions (`:2535-2547`) and **every one is a reader**.

What the workflow *is*: load an invoice (W4) → `updateReturnBanner()` (`:3169`)
runs inside `syncAndRender` (`:3118`) → if the invoice has returns, a status
banner, a per-record detail list, a deduction row and a net-total row appear
(`:3179-3226`). Independently, `renderItems` (`:2979-3074`) draws per-line chips
from `getItemReturnBreakdown`.

**State transitions: none.** Full treatment in Part 4.

---

### W17 — Workflows the prompt names that do not exist here

| Workflow | Status |
|---|---|
| **Purchase** | **Absent.** No supplier, no purchase, no inbound movement. |
| **Production** | **Absent as an act.** Consumed as a *result* via `bb_pending_invoices` (W10). |
| **Stock adjustment** | **Absent.** No stock quantity is held or changed. |
| **Operating-cost entry** | **Absent.** No cost concept of any kind. |
| **Return (both dispositions)** | **Absent as an act** (W16). Both dispositions are *displayed* (`:2511-2513`, `:3202-3207`); neither is *performed*. |
| Sale | **Present** — W2, W10 |
| Reporting | **Present** — W13 |

Each absence is a requirement B2S adds, not a gap in this extraction.

---

## PART 4 — RETURNS, IN FULL

`docs/requirements/RETURNS_REQUIREMENTS.md` is treated here as a **requirements
statement**, not a claim to be verified against code. Where the two differ, both
are recorded and the difference is marked a **decision for the new design**.

### 4.0 The producer/consumer fact that frames everything below

**This tool does not produce returns. It consumes them.**

- `ReturnsMgr` is declared `MODULE 5b — RETURNS (read from Stock Costs ·
  bb_returns)` (`:2396`).
- Its only storage access is `getAll(){ return Store.get(KEY, []); }` (`:2400`).
- `Store.set` is **never** called with `'bb_returns'` (§1.0.4), so `writeKey`
  (`:1154`) can never fire for it.
- Every one of the eleven exported functions (`:2535-2547`) is a reader.

**PART 9 R4's premise — "Invoice-pro is the data PRODUCER" — is false for
returns.** It is the producer for `bb_customers`, `bb_products`,
`bb_categories`, `bb_invoices`, `bb_color_presets` and `bb_inv2`; it is a strict
**consumer** for `bb_returns` and `bb_invoice_payments`. R4 is answered on that
corrected basis in §9.4.4. This is not an error in either tool — it is a
mis-stated premise in the reviewer prompt, reported honestly per AGENTS.md §10.

### 4.1 The Return entity as this tool observes it

The complete observed shape, with every field enumerated in §1.1.7. Restated as a
structure:

```
Return {
  invoiceId      : string          // FK → bb_invoices. FALSY ⇒ record ignored entirely  :2411
  date           : string          // displayed, '—' if absent                           :3196
  reason         : string?         // displayed, HTML-escaped                            :3197
  notes          : string?         // displayed, HTML-escaped                            :3198
  fullReturn     : boolean?        // OR-folded across all returns for the invoice        :2417
  amount         : number?         // read as WRITE-OFF VALUE → totalExpiredAmt           :2418
  disposition    : string?         // RECORD-LEVEL fallback disposition                   :2511
  items          : [ {
      productId   : string?        //                                                     :2481,:2493
      name        : string?        //                                                     :2493,:3205
      qty         : number?        //                                                     :2420
      price       : number?        //                                                     :2405
      lineTotal   : number?        // preferred over qty×price when > 0                   :2403
      disposition : string?        // ITEM-LEVEL, takes precedence                        :2511
  } ]
  outAllocations : [ {             // MAY BE ABSENT ENTIRELY — see §4.5
      productId       : string?    //                                                     :2516
      name            : string?    //                                                     :2516
      qty             : number?    // <= 0 ⇒ allocation skipped                           :2518
      toCustomerName  : string?    // DISPLAY SNAPSHOT, '—' if absent                     :2520
      toInvoiceNumber : string?    // DISPLAY SNAPSHOT, ''  if absent                     :2521
  } ]
}
```

**Fields the producer writes that this tool never reads: `toCustomerId` and
`toInvoiceId`.** The resale attribution is therefore **textual and
unnavigable** — the chip reads "sold to X on #Y" and cannot link to either.
§4.6.

### 4.2 Per-line item structure

Two parallel line arrays with **different shapes and different jobs**:

| | `items[]` | `outAllocations[]` |
|---|---|---|
| Answers | *what came back* | *where the restocked units went* |
| Carries money | yes — `price`, `lineTotal` | **no** |
| Carries disposition | yes | no |
| Keyed by | `itemRetKey` (`:2508`) | `itemRetKey` (`:2516`) |
| Missing-array guard | `(ret.items\|\|[])` (`:2507`, `:2419`, `:2480`) | `(ret.outAllocations\|\|[])` (`:2515`) |
| Zero-quantity handling | counted (adds 0) | **skipped** (`:2519`) |

Both merge into the same per-product row (`:2500`), so one product shows an
expired count, a restock count, and a list of onward sales together.

### 4.3 Dispositions — stock effect and money effect, separately

**Two dispositions.** The enum values are English (`'restock'`, `'expired'`); the
labels are Arabic (`'📦 مخزون'`, `'🗑 تالف'`, `:3151-3154`).

**Resolution order (`:2511`, `:3202`) — identical in both consumers:**

```
disp = it.disposition || ret.disposition || 'expired'
```

Item-level, then record-level, then a hard default of **write-off**.

| Disposition | Stock effect **in this tool** | Money effect **in this tool** | Line |
|---|---|---|---|
| `'restock'` | **None.** Accumulated into `row.restockQty` for display only. No stock level exists here to change. | **None distinct** — the line's value is already in `totalRevenue` and deducted from net regardless of disposition. | `:2512` |
| `'expired'` (and every other value) | **None.** Accumulated into `row.expiredQty` for display only. | **A second, separate figure.** `ret.amount` accumulates into `totalExpiredAmt` (`:2418`) and is shown as `'تالف <amount>'` (`:3185`) — **displayed alongside, never subtracted from, net revenue.** | `:2513`, `:2418` |

**The two critical facts about disposition in this tool:**

1. **Disposition does not change the money.** `enrichInvoice` (`:2454`) subtracts
   `info.totalRevenue`, which sums **every** returned line via `getReturnLineTotal`
   (`:2423`) **irrespective of disposition**. A unit written off and a unit
   restocked reduce net revenue identically. The write-off value is reported as a
   *separate figure* (`totalExpiredAmt`), never netted.
2. **Disposition is per line, not per return.** The item-level field wins
   (`:2511`), so one return can restock some lines and write off others.

- **BUSINESS-INVARIANT:** a returned unit must have a known disposition, and a
  reversed sale reduces revenue.
- **THIS BUSINESS'S POLICY:** exactly two dispositions; **write-off as the
  default when unstated**; revenue reduced identically for both; write-off value
  reported as a separate figure rather than as a cost.

### 4.4 `outAllocations` — what it is, what it allocates, what consumes it

**What it is.** A per-return list recording that restocked units were
subsequently sold on to another Buyer.

**What it allocates.** A **quantity** of a returned product to a
`(Buyer, Invoice)` pair — carried as the **display strings**
`toCustomerName` and `toInvoiceNumber` (`:2520-2521`). It allocates **no money**;
there is no price or value field.

**What consumes it — and this is the answer to a question P-02 left open.**
**`getItemReturnBreakdown` at `:2515-2525` is the consumer.** It is the only
reader of `outAllocations` in this file, and this file is the only place the
resale chip is rendered:

```
(ret.outAllocations||[]).forEach(function(a){                    :2515
  var k = itemRetKey(a);                                         :2516
  var row = ensure(k, a.name);                                   :2517
  var qty = parseFloat(a.qty)||0;                                :2518
  if(qty<=0) return;                                             :2519
  var cust  = a.toCustomerName || '—';                           :2520
  var invNo = a.toInvoiceNumber || '';                           :2521
  var found = row.soldTo.filter(s => s.customerName===cust
                                  && s.invoiceNumber===invNo)[0]; :2522
  if(found) found.qty += qty;                                    :2523
  else row.soldTo.push({customerName:cust, invoiceNumber:invNo, qty:qty});  :2524
});
```

Rendered by `appendItemReturnLine` (`:2981-3003`) as a chip per destination on
the invoice line, and gated by `hasItemReturnInfo` (`:2530-2533`).

**Merge semantics:** duplicates are merged on the **string pair**, so two distinct
Buyers with the same name and no invoice number collapse into one chip.

**It affects no calculation.** `outAllocations` never enters revenue, net,
quantity or any report. **It is purely an audit-trail display.** That is itself
the requirement: the owner wants to answer *"where did the returned goods go?"*
and does not want that answer to move the money.

### 4.5 CF-04 — both Return shapes, and what each requires of a renderer

**Both shapes exist in live data, and this tool renders both without failing.**

| | **Shape A — with `outAllocations`** | **Shape B — without `outAllocations`** |
|---|---|---|
| Origin | Written after the Return Calculator existed | Written before it |
| `outAllocations` | present, array | **key absent entirely** |
| `:2515` guard | `(ret.outAllocations\|\|[])` — iterates | `(ret.outAllocations\|\|[])` — **coerces `undefined` to `[]`, iterates zero times** |
| `row.soldTo` | populated | stays `[]` (`:2500`) |
| Chip output | resale chips rendered | **no resale chips; expired/restock chips still render** |
| `hasItemReturnInfo` | true | true if either quantity > 0 (`:2532`) |
| Throws? | no | **no** |

**A third latent variation, orthogonal to A/B — the disposition source.** The
three-level fallback at `:2511` means a renderer must handle all three of:

| Variant | `it.disposition` | `ret.disposition` | Result |
|---|---|---|---|
| B1 | present | either | item-level wins |
| B2 | absent | present | record-level applies to **every** line in that return |
| B3 | absent | absent | **every line is counted as a write-off** (`'expired'`) |

**What a renderer must handle — the complete list, as evidenced by this tool's
own defences:**

1. `ret.items` absent → `(ret.items||[])` (`:2419`, `:2480`, `:2507`)
2. `ret.outAllocations` absent → `(ret.outAllocations||[])` (`:2515`)
3. `ret.invoiceId` falsy → skip the whole record (`:2411`, `:2479`)
4. `ret.amount` absent → `parseFloat(...)||0` (`:2418`)
5. `it.qty` absent → `parseFloat(...)||0` (`:2420`, `:2510`, `:2518`)
6. `it.price` absent → `parseFloat(...)||0` (`:2405`)
7. `it.lineTotal` absent, zero or negative → fall back to `qty × price` (`:2403-2405`)
8. `it.productId` absent → key on the trimmed name with a `'name:'` prefix (`:2493`)
9. `it.name` absent → `'—'` at display (`:3205`), `''` in the key (`:2493`)
10. Disposition absent at both levels → default `'expired'` (`:2511`)
11. `a.qty <= 0` → skip the allocation (`:2519`)
12. `a.toCustomerName` / `a.toInvoiceNumber` absent → `'—'` / `''` (`:2520-2521`)
13. `ret.date` absent → `'—'` (`:3196`); `reason` / `notes` absent → omit the span (`:3197-3198`)
14. `invoice.items` absent → `(invoice.items||[])`, **which makes the invoice
    fully returned** (`:2445-2446`, §2.8)

**Every one of these is defended.** The tool never throws on a malformed Return.
That total defensiveness is itself the requirement CF-04 encodes: **B2S's return
renderer must tolerate every historical shape**, because the owner's live data
contains them and the data "may all be lost and that is accepted" only for this
tool — not for the requirement it proves.

### 4.6 The three-way invoice grouping — **derived, never stored**

The three states are `'active'`, `'partial'` and `'full'`, produced by
`enrichInvoice` (`:2452-2454`).

| State | Condition | `net` | Line |
|---|---|---|---|
| `'active'` | no Return record for this invoice id | `gross` | `:2452` |
| `'full'` | `Return.fullReturn` **or** `totalQty >= invQty − 0.0001` | **hard `0`** | `:2453`, `:2442-2447` |
| `'partial'` | otherwise | `max(0, gross − totalRevenue)` | `:2454` |

**Stored or derived? Derived, every time, on every read.** There is **no status
field on the Invoice record** (`:2260-2274`). The only stored input is the
producer's `fullReturn` boolean, and even that is only *one* of the two
disjuncts at `:2444-2446`.

**Consequences, recorded as facts:**

- **Deleting a return silently promotes an invoice back to `'active'`.** No audit
  trail, because there is nothing to audit.
- The grouping is recomputed in **six** places (`:2357`, `:3357`, `:3915`,
  `:4002`, `:4032`, `:4076`), each re-aggregating all of `bb_returns` (§2.7).
- Because it is derived from the **current** `bb_returns` file, an invoice's
  status changes retroactively when the other tool writes a return — the invoice
  record itself is never touched.

**Rendering of the three states, by surface:**

| Surface | `'active'` | `'partial'` | `'full'` | Line |
|---|---|---|---|---|
| History card | plain total | net + struck gross | struck gross only | `:2363-2367` |
| Badge | none | `'🔄 مرتجع جزئي · −<amt>'` | `'↩️ مرتجع كامل'` | `:2457-2462` |
| Buyer history | plain | net + struck gross + badge | struck + badge | `:2464-2474` |
| Report status cell | `'—'` | `'🔄 مرتجع جزئي'` | `'↩️ مرتجع كامل'` | `:3925-3929` |
| Report amount cell | gross | net + struck gross | `'↩️ 0 <cur>'` | `:3920-3924` |
| Live invoice banner | hidden | `'🔄 مرتجع جزئي'` + figures | `'↩️ مرتجع كامل'` + figures | `:3179-3188` |
| Customer-list print | plain | net + struck gross | struck + `'↩️'` | `:1990-1997` |

**A consistent presentation requirement across seven surfaces: show the original
amount struck through, show the net beside it, and mark the state with a
distinct symbol.**

### 4.7 How a partially-returned invoice is represented

Four simultaneous representations, none stored:

1. **Header banner** (`:3179-3188`) — status word, `−<totalRevenue> <cur>`,
   `<totalQty> وحدة`, and `تالف <totalExpiredAmt> <cur>` when that figure is
   positive.
2. **Totals block** — two extra rows revealed: `rowReturnDeduct` showing
   `'− <totalRevenue>'` (`:3217-3221`) and `rowNetTotal` showing `net`
   (`:3222-3226`). The original `total` row is left untouched, so **the document
   shows subtotal, discount, total, deduction and net as five rows**.
3. **Per-line chips** (`:2981-3003`, from `getItemReturnBreakdown`) — per product:
   `expiredQty`, `restockQty`, and one chip per resale destination.
4. **Per-return detail blocks** (`:3193-3214`) — one block per Return record:
   date, escaped reason, escaped notes, then one row per returned line with name,
   `×qty`, disposition label and `−<lineTotal>`.

**The invoice record itself is unchanged.** `subtotal`, `discount`,
`discountAmount` and `total` are exactly what was invoiced. **All return
information is an overlay computed at render time.** That is a clean and
deliberate separation and it is worth carrying forward as a requirement.

### 4.8 Code versus `RETURNS_REQUIREMENTS.md` — both recorded, neither judged

| # | `RETURNS_REQUIREMENTS.md` states | This file does | Decision for B2S |
|---|---|---|---|
| D1 | Two `Return` shapes exist in live data, with and without `outAllocations` | Confirmed. Both render; the guard is `(ret.outAllocations\|\|[])` (`:2515`) | Whether B2S migrates old records to one shape or keeps the renderer tolerant |
| D2 | Returns affect net revenue, COGS, product summary, component usage, monthly profit and stock value | **Only net revenue and product summary exist here** (`:2454`, `:2477`). COGS, component usage, profit and stock value have no representation in this tool at all | Nothing to reconcile — the other four live entirely in the other tool. Named as ONE-SIDED in §9.3 |
| D3 | Invoice list grouping is three-way | Confirmed, **derived not stored** (`:2452-2454`) | Whether B2S stores the state or derives it. Deriving means a deleted return silently rewrites history |
| D4 | Per-item chips show disposition and onward sale | Confirmed (`:2981-3003`, `:2496-2528`) | — |
| D5 | Returns are first-class and modelled as **StockMovement** in B2S | This tool has **no stock concept**; `restockQty` is a display counter (`:2512`) | The whole movement model is new. This tool contributes the *display* requirement only |
| D6 | A calculator-logged return carries `outAllocations`; a legacy return does not | Confirmed by the guard's existence | — |

**No disagreement rises to a contradiction.** Where `RETURNS_REQUIREMENTS.md`
describes capabilities this tool lacks (D2, D5), the capabilities live in
`bb-stock-costs` or are new. Recorded as scope facts, not as errors.

### 4.9 What B2S must add for returns

Stated plainly, per the prompt's instruction to say so where a capability is
absent:

- **No return can be created, edited or deleted here** (§4.0).
- **No stock movement occurs** — `restockQty` and `expiredQty` are display
  counters (`:2512-2513`).
- **No credit note, refund or money-back path exists.** A return reduces a
  computed revenue figure; it never creates a payable, a credit balance or a
  refund record.
- **No return is linked to a Batch** — no batch concept exists (§9.3.5).
- **Resale attribution is unnavigable** — ids are written by the producer and
  never read (§4.1).
- **No approval, authorisation or reversal-of-a-reversal exists.**
- **A return carries no cost**, so the margin impact of a write-off is
  uncomputable here.

---

## PART 5 — PAYMENTS, IN FULL

*(This Part replaces P-02's PART 5 — Batch and Traceability — per the P-03
substitution. Batch is nonetheless answered as a one-line absence in §9.3.5,
because Part 9 requires the comparison.)*

### 5.1 The headline answer

**There is no Payment entity in this tool.** Nothing here records that money was
received. What exists is a **read of one boolean-equivalent string** from a
foreign file, used in exactly two places on one printed document.

Every B2S payment requirement below is therefore either **absent** or
**partially present in a reduced form**, and each is stated plainly as such.

### 5.2 What exists — the complete surface, three call sites

```
function getPaymentStatus(invoiceId){                                    :1966
  var payments = Store.get('bb_invoice_payments', {});                   :1967
  var p = payments[invoiceId];                                           :1968
  return (p && p.status==='paid') ? 'paid' : 'pending';                  :1968
}
```

| # | Consumer | Purpose | Line |
|---|---|---|---|
| 1 | `getPendingInvoices` | excludes paid invoices from the outstanding list | `:1984` |
| 2 | `buildDocumentHtml` (customer list) | renders the payment column | `:2094-2100` |
| 3 | `MANAGED` | the key is pulled from disk by `loadAll` | `:1064` |

**That is the entire payments surface of this file.** There is no fourth site.

`Store.set` is never called with `'bb_invoice_payments'` (§1.0.4), so **this tool
cannot create, alter or clear a payment.** `bb-stock-costs` is the writer.

### 5.3 The Payment entity's exact shape, as observed here

```
bb_invoice_payments : {                    // a MAP, not an array               :1967
    [invoiceId: string] : {
        status : string                    // compared === 'paid'               :1968
    }
}
```

**Two fields observed in total: the map key, and `.status`.** Whatever richer
structure the producing tool writes, **this tool reads one string and reduces it
to a boolean.** Any amount, date, method or reference the producer stores is
invisible here and cannot reach the printed document.

**Default when absent:** `Store.get(…, {})` (`:1967`) yields an empty map, and an
unknown id yields `undefined` → `'pending'` (`:1968`). **Absence is
indistinguishable from a deliberate unpaid state.** There is no "unknown" or "not
yet invoiced" third value.

### 5.4 Requirement-by-requirement answer

| B2S requirement | Present? | Evidence |
|---|---|---|
| **Full payment state** | **Partially.** `'paid'` exists as a string comparison (`:1968`) and prints as `S.clPaid` = `'مدفوعة · Paid'` (`:1238`, `:2097`). No amount, no date, no proof. | `:1968`, `:2094-2100` |
| **Partial payment** | **ABSENT.** No amount is stored or read anywhere, so a part-payment cannot be expressed. Any non-`'paid'` value collapses to `'pending'` (`:1968`). | `:1968` |
| **Underpaid state** | **ABSENT.** Requires an amount to compare against the total. Neither exists. | — |
| **Overpayment** | **ABSENT.** Not modelled, not detectable, not displayable. | — |
| **Refund** | **ABSENT.** No refund record, no credit note, no negative payment. A return reduces a *computed revenue figure* (`:2454`); it never creates a payable or a refund. | `:2454` |
| **Payment type — cash** | **ABSENT.** No method field is read. | — |
| **Payment type — card** | **ABSENT.** | — |
| **Payment type — other** | **ABSENT.** | — |
| **Receipt attachment** | **ABSENT.** No file, blob, URL or attachment concept exists anywhere in the file. | — |
| **Payment reference** | **ABSENT.** No reference, transaction id or note is read. | — |
| **Payment date** | **ABSENT.** | — |
| **Outstanding balance** | **ABSENT as an amount.** §5.5 |
| **Multiple payments per invoice** | **ABSENT.** The map holds **one object per invoice id** (`:1968`), so the model is structurally single-payment. | `:1967-1968` |
| **Payment allocated across invoices** | **ABSENT.** | — |
| **Buyer credit balance / statement** | **ABSENT as an amount.** §5.5 |

### 5.5 How the outstanding balance is computed — **it is counted, never totalled**

The nearest thing the business has to a receivables view is the customer-list
printout (W12). It computes:

```
getPendingInvoices(customerId):                                          :1982
    invoices for this buyer
      where getPaymentStatus(inv.id) !== 'paid'                          :1984
        and enrichInvoice(inv).salesStatus !== 'full'                    :1985

buildPendingListHtml(pending):                                           :1999
    per invoice → esc(inv.invoiceNumber) + esc(inv.date)                 :2001-2006
                  ← NO AMOUNT IS RENDERED

pendingTotal = Σ over printed buyers of pending.length                   :2059
               ← A COUNT OF INVOICES, NOT A SUM OF MONEY
```

**No money is summed anywhere in the payments path.** The owner is told *how many*
invoices are outstanding and *which numbers and dates*, and must add the amounts
by hand from the invoice history. **Stated plainly: computing an outstanding
balance is a capability B2S adds.**

**One genuine and non-obvious business rule does exist here and is worth
preserving:** the order at `:1984-1985` excludes paid **first**, then excludes
fully-returned. **A fully returned invoice is not outstanding even when it was
never paid.** That is correct receivables logic and it is the single most
valuable payments requirement this file contributes.

### 5.6 What states an invoice can hold

**No `status` field exists on the Invoice record** (`:2260-2274`). Every state is
derived at read time, from **two independent and never-combined axes**:

| Axis | Values | Derived from | Line |
|---|---|---|---|
| **Sales status** | `'active'` · `'partial'` · `'full'` | `bb_returns` | `:2452-2454` |
| **Payment status** | `'paid'` · `'pending'` | `bb_invoice_payments` | `:1968` |

**The two axes are orthogonal, which yields six logical states — and the tool
renders only three of the six, on one document:**

| Sales × Payment | Rendered anywhere? |
|---|---|
| active × paid | yes — customer-list payment column (`:2097`) |
| active × pending | yes — payment column **and** the outstanding list (`:1984`) |
| partial × paid | **payment column only.** The partial return is shown in the *amount* cell (`:1994`) but the two facts are never combined into one state |
| partial × pending | appears in the outstanding list at **full face value in count terms**, with no indication that part of it came back |
| full × paid | payment column shows paid; the amount shows struck-through gross (`:1993`) |
| full × pending | **deliberately excluded from the outstanding list** (`:1985`) — the one place the two axes *are* combined |

**The requirement this reveals:** the business needs a **combined** state
(*what is still owed, on what is still sold*), and the legacy tool computes that
intersection **exactly once**, at `:1984-1985`, and only as a filter — never as a
displayable state and never as an amount.

### 5.7 Where payment appears on the printed document

| Element | Source | Line |
|---|---|---|
| Column header | `S.clHPayStatus` = `'الدفع · Payment'` | `:1236`, `:607` |
| Paid cell | `S.clPaid` = `'مدفوعة · Paid'` | `:1238`, `:614` |
| Pending cell | `S.clPending` = `'معلقة · Pending'` | `:1238`, `:615` |
| Outstanding column header | `S.clHPendingList` = `'فواتير معلقة · Pending Invoices'` | `:1236`, `:608` |
| Outstanding summary label | `S.clLblPendingCount` = `'فاتورة معلقة'` | `:1237` |
| Empty-state | `S.clNoInv` = `'—'` | `:1238` |

All six are **editable brand settings**, not literals — the owner can rename the
payment states on the printed document. That is a real configuration requirement
and it is one of the few places this tool already gets tenancy right.

### 5.8 Summary — what B2S adds

Everything except: a binary paid flag, a per-Buyer outstanding **count**, an
outstanding **list** of invoice numbers and dates, editable state labels on the
printed document, and the rule that a fully-returned invoice is not outstanding.
**Amounts, partial states, methods, dates, references, receipts, refunds,
overpayment and multi-payment allocation are all new.**

---

## PART 6 — CONFIGURABLE vs HARDCODED

**Ownership column key.** `BC` = brand config · `BP` = business policy ·
`PC` = product catalog · `SC` = system constant.

**A distinction that runs through this whole Part.** This tool has an unusual
property for a legacy artefact: **a large fraction of its user-facing text is
already editable at runtime** through the Brand accordion, which writes into `S`
and persists to `bb_inv2`. Those values are *hardcoded as defaults* but *not
hardcoded in use*. The tables below separate the two, because the requirement
they encode is different: an editable default is **a wizard field B2S must
provide**; a true literal is **a value B2S must extract**.

### 6.1 Brand identity — hardcoded defaults, runtime-editable

| Value | Represents | Owner | Wizard input | file:line |
|---|---|---|---|---|
| `Balance Bites` | Tenant trading name | **BC** | text | `:548` (default), `:870` (DOM), `:1218` (`S.brand`) |
| `BB` | Tenant monogram | **BC** | text (2–3 chars) | `:547`, `:866`, `:1218` |
| `balancebites.com` | Tenant web address | **BC** | text (domain) | `:550`, `:988`, `:1219` |
| `فاتورة · Invoice` | Invoice document title | **BC** | bilingual text pair | `:549`, `:871`, `:1218` |
| `شكراً لثقتكم · Thank you for your order` | Invoice footer note | **BC** | bilingual text pair | `:551`, `:987`, `:1219` |

**Not runtime-editable — true literals carrying the brand:**

| Value | Represents | Owner | Wizard input | file:line |
|---|---|---|---|---|
| `Balance Bites — Invoice Pro` | Browser tab title | **BC** | derived from `brand.name` | **`:6`** |
| `✦ Invoice Pro — Balance Bites` | Editor panel heading | **BC** | derived | **`:489`** |
| `Reports Dashboard · Balance Bites` | Reports subtitle | **BC** | derived | **`:768`** |

**Three sites where the brand name is baked into chrome the owner cannot reach.**

### 6.2 Colour, font and print — the design surface

| Value | Represents | Owner | Wizard input | file:line |
|---|---|---|---|---|
| `#0a0804` | Page background | **BC** | colour picker | `:514`(field), `:1214` (`C.bg`) |
| `#c9a84c` | Accent (`gold`) | **BC** | colour picker | `:1214`; **also 40+ raw CSS literals** — §6.3 |
| `#e8e0cc` | Body text | **BC** | colour picker | `:1214` |
| `#6b5e3a` | Muted text | **BC** | colour picker | `:1214` |
| `#12100a` | Table row / totals band | **BC** | colour picker | `:1215` |
| `#1e1a0f` | Grand-total band | **BC** | colour picker | `:1215` |
| `#888` | Fallback colour for an orphaned ProductCategory | **SC** | none | `:1528`, `:1760` |
| 4 built-in palettes (`cp_def1`–`cp_def4`) | Theme starter set | **BC** | repeatable list | `:1257-1262` (full values tabulated at §1.1.9) |
| `Playfair Display` | Display / numeral face | **BC** | font picker | `:7`, `:25`, `:75`, `:97`, `:223`, `:254`, `:335`, `:1795`, `:2041` |
| `DM Sans` | Latin body face | **BC** | font picker | `:7`, `:13`, `:27`, and ~35 further CSS rules |
| `Syne` | Label / heading face | **BC** | font picker | `:7`, `:26`, `:49`, `:106`, `:1796`, `:2042` |
| `Tajawal` | **Arabic** face | **BC** | font picker | `:7`, `:40`, `:63`, `:107`, `:172`, `:184`, `:224`, `:252`, `:256`, `:318`, `:356` |
| `Caveat` | Loaded but **never used** in any rule | **BC** | — | `:7` only |
| Google Fonts CDN URL | Runtime font source | **SC** | — | `:7`, `:1886`, `:2155` |
| `A4 portrait`, `16mm 14mm` | Invoice page geometry | **BP** | page size + margins | `:266` |
| `A4`, `12mm 14mm` | Price-list page geometry | **BP** | page size + margins | `:1766` |
| `A4`, `12mm 14mm` | Customer-list page geometry | **BP** | page size + margins | `:2011` |
| `820px` | On-screen page width | **SC** | — | `:16` |

**Three independent `@page` rules** (`:266`, `:1766`, `:2011`), the latter two
byte-identical in two module scopes. **A4 is the only paper size the tool can
produce.**

### 6.3 The colour-literal problem, quantified

`#c9a84c` and its `rgba(201,168,76,…)` equivalent appear as **raw CSS literals
outside the theme system** at `:195`, `:202`, `:204`, `:210`, `:277`, `:296`,
`:298`, `:305`, `:310`, `:320`, `:329`, `:337`, `:350`, `:371`, `:395`, `:402`,
`:404` and further. **97 six-digit hex literals** occur in the file in total.

`applyTheme()` (`:2643-2857`) regenerates a large stylesheet from `C` on every
change, so most of the *invoice* surface is themed — but the **preset bar, toast,
folder-status strip, picker chrome and report chrome carry the brand accent as
frozen literals** and do not follow a theme change. A tenant with a different
accent colour gets a correctly themed invoice inside incorrectly themed chrome.

### 6.4 Locale, currency, units and formats

| Value | Represents | Owner | Wizard input | file:line |
|---|---|---|---|---|
| `EGP` | Currency code | **BC** | dropdown | `:554` (field), `:1220` (`S.cur`), and **`\|\| 'EGP'` fallback literal at** `:1993`, `:1994`, `:1996`, `:2364`, `:2366`, `:2367`, `:2460`, `:2465`, `:3177`, `:3368`, `:3599` |
| `'ar-EG'` | Number formatting locale | **BC** | locale picker | `:1339`, `:1340` |
| `'ar-EG'` | Date formatting locale | **BC** | locale picker | `:3725` |
| `lang="ar"` `dir="rtl"` | Document language and direction | **BC** | locale picker | `:2` |
| `dir="ltr"` on phone inputs | Phone-number direction override | **SC** | — | `:648`, `:898` |
| `+20 1xx xxx xxxx` | Phone placeholder mask — **encodes the Egypt country code** | **BC** | text | `:648` |
| `#INV-` prefix | Invoice number prefix | **BC** | text | `:890`, `:2321`, `:3341`, `:4203` |
| `padStart(3,'0')` | Invoice number width | **BC** | number | `:2321`, `:3341`, `:4203` |
| `YYYY-MM-DD` | Internal date format | **SC** | — | `:1359-1361` |
| `'وحدة'` | **The unit-of-measure word, hardcoded for every product** | **PC** | per-product UoM | `:3184`, `:4047` |
| `'منتج'` | The "products" counter noun | **BC** | text | `:1228`, `:1229`, `:2372` |
| `'تصنيف'` | The "categories" counter noun / default category name | **BC** / **PC** | text | `:1228`, `:1522` |
| `'بريسيت'` | Default theme name | **BC** | text | `:1273` |
| `'—'` | Universal empty marker | **SC** | — | `:1238`, `:2520`, `:3196`, `:3205`, `:3928`, `:3975`, `:4006`, `:4119` |
| `'·'` | **Bilingual separator — load-bearing in `split('·')`** | **SC** | — | `:4035`, `:4107`; present in ~50 literals |

**`'وحدة'` is the sharpest single finding in this table.** Every quantity in the
tool is counted in one hardcoded Arabic word meaning "unit". A business selling
by kilogram, litre or metre has no representation. `Product.weight` is free text
(`'40g'`, `:1328`) and is **never parsed** — it is decoration on a document, not
a measurement.

### 6.5 Tax rate, thresholds and every other missing configurable

| Value the prompt asks about | Status |
|---|---|
| **Tax rate** | **Does not exist.** No field, no literal, no calculation. |
| **Freight / shipping rate** | **Does not exist.** |
| **Low-stock threshold** | **Does not exist.** `prepSummary.stockOk` arrives pre-decided (`:2211`). |
| **Payment terms / due days** | **Does not exist.** |
| **Rounding rule** | **Does not exist as configuration.** `maximumFractionDigits:2` (`:1339`) is the only expression of precision, and it is display-only. |
| **Absolute file paths** | **None.** `showDirectoryPicker({startIn:'documents'})` (`:1131`) is a *hint*, not a path. §0.3. |
| Invoice history cap | `MAX = 100` — **SC**, should be **BP**, `:2239` |
| Theme snapshot cap | `_PBMAX = 8` — **SC**, `:3714` |
| Top-customers cut | `5` — **BP**, `:3979` |
| Toast duration | `2600` ms — **SC**, `:1356` |
| Status-dot delay | `150` ms — **SC**, `:4172` |
| Preset-render delay | `80` ms — **SC**, `:4277` |
| Full-return epsilon | `0.0001` — **BP**, `:2446` |
| Report visibility floor | `0.0001` — **BP**, `:4043` |
| Product price step | `0.5` — **BP**, `:709`, `:3057` |
| Quantity step | `1`, min `0` | `:3046` |
| Discount bounds | `min=0 max=100 step=1` — **BP**, **UI-only, unenforced** (§2.4) | `:555` |
| Pattern pitch | `14` px — **SC**, `:2968` |
| IndexedDB name / store / key | `bb_filestore_v1` / `h` / `dir` — **SC** | `:1070-1071`, `:1098` |
| Ten `MANAGED` key names | **SC** | `:1064` |
| Whole-app snapshot key | `bbinv_pb` — **SC** | `:3712` |
| Export marker | `template:'bbinv'` — **SC** | `:3746` |

### 6.6 Product catalog seed data

| Value | Owner | Wizard input | file:line |
|---|---|---|---|
| `كراكرز · Crackers` (`cat_def_1`, `#c9a84c`) | **PC** | repeatable list | `:1321` |
| `وجبات خفيفة · Snacks` (`cat_def_2`, `#7dab6e`) | **PC** | repeatable list | `:1322` |
| `مشروبات · Beverages` (`cat_def_3`, `#5b9bd5`) | **PC** | repeatable list | `:1323` |
| `كراكرز زعتر · Za'atar Crackers` — Pack, 40g, 45, `cat_def_1` | **PC** | repeatable list | `:1328` |
| `كراكرز بابريكا · Paprika Crackers` — Pack, 40g, 45, `cat_def_1` | **PC** | repeatable list | `:1329` |
| `كراكرز فلفل أسود · Black Pepper Crackers` — Pack, 40g, 45, `cat_def_1` | **PC** | repeatable list | `:1330` |
| `'Pack'` — the only pack type shipped | **PC** | text / picklist | `:1328-1330` |
| `'40g'` — the only weight shipped | **PC** | text | `:1328-1330` |
| `45` — the only price shipped | **PC** | number | `:1328-1330` |
| `'45'` — price field placeholder | **BC** | number | `:709` |

**Seeded on first read** (`:1514`, `:1576`), so a fresh tenant inherits another
business's flavour list and price point until they delete it. **There is no
"start empty" option.** Contrast Buyers, which seed nothing (`:1369`).

**No flavour list exists as an entity.** Flavour is encoded inside the product
name string (`زعتر`, `بابريكا`, `فلفل أسود`). Recorded as a modelling decision.

### 6.7 Document templates — three, all partly configurable

| Template | Configurable via `S` | Hardcoded structure | file:line |
|---|---|---|---|
| **Invoice** (live DOM) | title, footer, 4 column headers, 2 total labels, discount label, currency, brand, monogram, web | Layout, the pattern canvas, the 5-row totals block, the return overlay rows | `:860-990`, `:1218-1222` |
| **Price list** (generated) | title, footer, 4 column headers, "other" label, 2 counter nouns, free-text note | Table structure, per-category grouping, summary block, CSS | `:1745-1855`, `:1223-1229` |
| **Customer list** (generated) | title, footer, 8 column headers, 3 counter nouns, paid/pending labels, empty marker, free-text note | Table structure, summary block, the outstanding sub-list, CSS | `:1912-2176`, `:1230-1238` |

**No template is a stored entity.** All three are code. A tenant cannot add a
fourth document, reorder columns, or remove one.

### 6.8 Tenancy — every place the tool assumes exactly one business

**This is the section that matters most for B2S.** Eleven findings.

| # | Assumption | Evidence | What B2S must add |
|---|---|---|---|
| **T1** | **`bb_inv2` is a singleton settings record.** One `{C, S, items}` for the whole installation. | `:2553`, `:4231`, `:4175` | Tenant-scoped brand config |
| **T2** | **Every storage key is a bare unscoped global.** Ten `MANAGED` keys, no tenant segment. | `:1064` | Tenant scoping on every collection |
| **T3** | **One folder = one business.** A single directory handle under IndexedDB key `'dir'`. | `:1070-1071`, `:1098`, `:1133` | Tenant-scoped storage root |
| **T4** | **One IndexedDB database name shared with another tool.** `bb_filestore_v1`, store `h`. | `:1070-1071` | Namespacing |
| **T5** | **The active theme is a global scalar.** `bb_active_color_preset_id` is one string. | `:1281-1285` | Per-tenant active theme |
| **T6** | **The brand appears in three unreachable literals.** Tab title, panel heading, report subtitle. | `:6`, `:489`, `:768` | Every brand string from config |
| **T7** | **The currency fallback is a literal in eleven places.** `S.cur \|\| 'EGP'`. | `:1993`, `:1994`, `:1996`, `:2364`, `:2366`, `:2367`, `:2460`, `:2465`, `:3177`, `:3368`, `:3599` | Currency from config, no fallback literal |
| **T8** | **Locale is hardcoded in three formatters.** `'ar-EG'` ×3. | `:1339`, `:1340`, `:3725` | Locale from config |
| **T9** | **Seed catalog belongs to one business.** 3 categories + 3 products auto-created. | `:1320-1331`, `:1514`, `:1576` | Optional, tenant-chosen seed |
| **T10** | **The Buyer collection is unscoped.** Two tenants sharing a folder share `bb_customers`. | `:1368` | Tenant-scoped Buyers |
| **T11** | **The whole-app snapshot is browser-profile-local and unmirrored**, so tenant state cannot follow a user to another machine. | `:3712`, `:3716-3717` | Tenant-scoped, server-side or mirrored |

**Additionally, and worth stating separately: there is no user, role, permission,
audit trail or authentication of any kind.** Anyone with the folder has full
read-write access to every Buyer's name, phone, address and complete purchase
history. No `user`, `role`, `auth`, `login` or `permission` identifier exists in
the file.

---

## PART 7 — BILINGUAL CONTENT INVENTORY

**Method and compliance statement.** CORRECTION 3 permits classification-level
rollup **only** for Arabic-only literals classified as UI chrome. Accordingly:

- §7.2 **DOCUMENT TEMPLATE** — **every literal individually enumerated**, in both
  languages where both exist, with every `file:line` at which it occurs.
- §7.3 **BUSINESS DATA** — **every literal individually enumerated.**
- §7.4 **VALIDATION MESSAGE** — **every literal individually enumerated.**
- §7.5 **English-only** — **every literal individually enumerated.**
- §7.6 **Arabic-only UI chrome** — **rolled up by area**, as permitted.

**368 of 4283 lines contain Arabic script.** Every literal below was read this
session.

**The tool's bilingual convention: `عربي · English`, joined by U+00B7 MIDDLE
DOT.** It is applied **only** to strings that reach a printed document. It is
also **load-bearing punctuation**: `name.split('·')[0].trim()` (`:4035`,
`:4107`) truncates a product name at the first middot for report display.

---

### 7.2 DOCUMENT TEMPLATE — every literal, individually enumerated

These are the content requirements a B2S document must satisfy. All are
**runtime-editable defaults** persisted in `bb_inv2.S` — a real configuration
capability this tool already has.

#### 7.2.1 Invoice document

| # | Arabic | English | `S` key | DOM default | Rendered | Duplicate declaration |
|---|---|---|---|---|---|---|
| 1 | `فاتورة` | `Invoice` | `docTitle` `:1218` | `:549` | `:871` | — |
| 2 | `شكراً لثقتكم` | `Thank you for your order` | `footNote` `:1219` | `:551` | `:987` | — |
| 3 | `خصم` | `Discount` | `discLabel` `:1220` | `:558` | `:945` | — |
| 4 | `المنتج` | `Item` | `hItem` `:1221` | `:561` | `:912` | — |
| 5 | `الكمية` | *(none)* | `hQty` `:1221` | `:562` | `:913` | — |
| 6 | `سعر الوحدة` | *(none)* | `hPrice` `:1221` | `:563` | `:914` | — |
| 7 | `الإجمالي` | *(none)* | `hSub` `:1221` | `:564` | `:915` | — |
| 8 | `المجموع` | `Subtotal` | `lSubtotal` `:1222` | `:567` | `:941` | — |
| 9 | `الإجمالي` | `Total` | `lTotal` `:1222` | `:568` | `:949` | — |
| 10 | `مرتجع` | `Returned` | *(no `S` key)* | *(no field)* | `:953` | **NOT CONFIGURABLE** |
| 11 | `صافي بعد المرتجع` | `Net` | *(no `S` key)* | *(no field)* | `:957` | **NOT CONFIGURABLE** |
| 12 | `ملاحظات` | `Notes` | *(no `S` key)* | *(no field)* | `:965` | **NOT CONFIGURABLE** |
| 13 | `تفاصيل المرتجع` | `Return Details` | *(no `S` key)* | *(no field)* | `:931` | **NOT CONFIGURABLE** |

**Rows 10–13 are the finding: four bilingual labels printed on the invoice
document are hard literals with no settings key.** Rows 5, 6 and 7 are
configurable but **Arabic-only**, so the invoice's own column headers are
partially bilingual and partially not.

#### 7.2.2 Price-list document

| # | Arabic | English | `S` key | DOM default | Duplicate declaration |
|---|---|---|---|---|---|
| 14 | `قائمة الأسعار` | `Price List` | `plTitle` `:1223` | `:574` | **`:2861`** |
| 15 | `الأسعار قابلة للتغيير` | `Prices subject to change` | `plFootNote` `:1224` | `:575` | **`:2862`** |
| 16 | *(empty)* | *(empty)* | `plDefaultNote` `:1225` | `:576` | **`:2863`** |
| 17 | `المنتج` | `Product` | `plHProduct` `:1226` | `:579` | **`:2864`** |
| 18 | `التغليف` | `Pack` | `plHPack` `:1226` | `:580` | **`:2864`** |
| 19 | `الوزن` | `Weight` | `plHWeight` `:1227` | `:581` | **`:2865`** |
| 20 | `السعر` | `Price` | `plHPrice` `:1227` | `:582` | **`:2865`** |
| 21 | `منتج` | *(none)* | `plLblProducts` `:1228` | `:585` | **`:2866`** |
| 22 | `تصنيف` | *(none)* | `plLblCategories` `:1228` | `:586` | **`:2866`** |
| 23 | `أخرى` | `Other` | `plLblOther` `:1229` | `:587` | **`:2867`**, fallback literal **`:1760`** |
| 24 | `منتج` | *(none)* | `plCatSuffix` `:1229` | `:588` | **`:2867`** |
| 25 | `قائمة الأسعار` | `Price List` | *(panel heading)* | `:572` | also `:1017` |
| 26 | `تظهر كـ placeholder عند الطباعة...` | *(none)* | *(placeholder)* | `:576` | — |

#### 7.2.3 Customer-list document

| # | Arabic | English | `S` key | DOM default | Duplicate declaration |
|---|---|---|---|---|---|
| 27 | `قائمة العملاء` | `Customer List` | `clTitle` `:1230` | `:595` | **`:2883`** |
| 28 | `بيانات العملاء` | `Customer directory` | `clFootNote` `:1231` | `:596` | **`:2884`** |
| 29 | *(empty)* | *(empty)* | `clDefaultNote` `:1232` | `:597` | **`:2885`** |
| 30 | `#` | `#` | `clHNum` `:1233` | `:600` | **`:2886`** |
| 31 | `الاسم` | `Name` | `clHName` `:1233` | `:601` | **`:2886`** |
| 32 | `الهاتف` | `Phone` | `clHPhone` `:1233` | `:602` | **`:2886`** |
| 33 | `العنوان` | `Address` | `clHAddress` `:1234` | `:603` | **`:2887`** |
| 34 | `ملاحظات` | `Notes` | `clHNotes` `:1234` | `:604` | **`:2887`** |
| 35 | `آخر فاتورة` | `Last Invoice` | `clHLatestInv` `:1235` | `:605` | **`:2888`** |
| 36 | `قيمة آخر فاتورة` | `Last Value` | `clHLatestVal` `:1235` | `:606` | **`:2888`** |
| 37 | `الدفع` | `Payment` | `clHPayStatus` `:1236` | `:607` | **`:2889`** |
| 38 | `فواتير معلقة` | `Pending Invoices` | `clHPendingList` `:1236` | `:608` | **`:2889`** |
| 39 | `عميل` | *(none)* | `clLblCustomers` `:1237` | `:611` | **`:2890`** |
| 40 | `لديهم فواتير` | *(none)* | `clLblWithInv` `:1237` | `:612` | **`:2890`** |
| 41 | `فاتورة معلقة` | *(none)* | `clLblPendingCount` `:1237` | `:613` | **`:2890`** |
| 42 | `مدفوعة` | `Paid` | `clPaid` `:1238` | `:614` | **`:2891`** |
| 43 | `معلقة` | `Pending` | `clPending` `:1238` | `:615` | **`:2891`** |
| 44 | `—` | `—` | `clNoInv` `:1238` | **no DOM field** | **`:2891`** |
| 45 | `قائمة العملاء` | `Customer List` | *(panel heading)* | `:593` | also `:998` |
| 46 | `تظهر عند الطباعة...` | *(none)* | *(placeholder)* | `:597` | — |

**Two structural findings across §7.2.2–7.2.3.** First, **29 of these strings are
declared twice** — once in `S` and once in a merge helper (`:2861-2867`,
`:2883-2891`); §1.3.5. Second, **`clNoInv` has no DOM field** (`:1238`), so it is
configurable in storage but unreachable in the UI.

#### 7.2.4 Return overlay on the invoice document

| # | Arabic | English | Configurable? | Line |
|---|---|---|---|---|
| 47 | `مرتجع كامل` | *(none)* | no | `:2459`, `:3181`, `:3926` |
| 48 | `مرتجع جزئي` | *(none)* | no | `:2460`, `:3181`, `:3927` |
| 49 | `تالف` | *(none)* | no | `:3185`, `:3153` |
| 50 | `مخزون` | *(none)* | no | `:3152` |
| 51 | `وحدة` | *(none)* | no | `:3184`, `:4047` |

**All five are Arabic-only and none is configurable**, yet all five print on a
customer-facing invoice. This is the largest single gap between the tool's
bilingual promise and its delivery.

---

### 7.3 BUSINESS DATA — every literal, individually enumerated

Values that become **stored records** on first run.

| # | Arabic | English | Entity + field | Line |
|---|---|---|---|---|
| 52 | `كراكرز` | `Crackers` | `ProductCategory.name`, id `cat_def_1` | `:1321` |
| 53 | `وجبات خفيفة` | `Snacks` | `ProductCategory.name`, id `cat_def_2` | `:1322` |
| 54 | `مشروبات` | `Beverages` | `ProductCategory.name`, id `cat_def_3` | `:1323` |
| 55 | `كراكرز زعتر` | `Za'atar Crackers` | `Product.name`, id `p_def_1` | `:1328` |
| 56 | `كراكرز بابريكا` | `Paprika Crackers` | `Product.name`, id `p_def_2` | `:1329` |
| 57 | `كراكرز فلفل أسود` | `Black Pepper Crackers` | `Product.name`, id `p_def_3` | `:1330` |
| 58 | *(none)* | `Pack` | `Product.packType` ×3 | `:1328`, `:1329`, `:1330` |
| 59 | *(none)* | `40g` | `Product.weight` ×3 | `:1328`, `:1329`, `:1330` |
| 60 | *(none)* | `Dark Gold` | `BrandTheme.name`, id `cp_def1` | `:1258` |
| 61 | *(none)* | `Obsidian Blue` | `BrandTheme.name`, id `cp_def2` | `:1259` |
| 62 | *(none)* | `Forest Night` | `BrandTheme.name`, id `cp_def3` | `:1260` |
| 63 | *(none)* | `Warm Ivory` | `BrandTheme.name`, id `cp_def4` | `:1261` |
| 64 | `تصنيف` | *(none)* | `ProductCategory.name` **fallback on empty input** | `:1522` |
| 65 | `بريسيت` | *(none)* | `BrandTheme.name` **fallback on empty input** | `:1273` |

**All fourteen become rows in a tenant's database.** Rows 52–57 are bilingual;
rows 58–63 are **English-only**; rows 64–65 are **Arabic-only**. **Three
different language policies inside one seed set.**

---

### 7.4 VALIDATION MESSAGE — every literal, individually enumerated

**All Arabic-only. None has an English form. None is configurable.**

| # | Literal | Kind | Line |
|---|---|---|---|
| 66 | `⚠ هذه الميزة تحتاج Chrome أو Brave أو Edge (إصدار حديث).` | `alert` — capability | `:1127` |
| 67 | `حذف "<name>"؟` | `confirm` — Buyer delete | `:1482` |
| 68 | `حذف التصنيف؟` | `confirm` — Category delete | `:1557` |
| 69 | `حذف هذا المنتج؟` | `confirm` — Product delete | `:1668` |
| 70 | `حدّد منتجاً واحداً على الأقل ☑` | validation — price-list preview | `:1867` |
| 71 | `حدّد منتجاً واحداً على الأقل` | validation — price-list print | `:1882` |
| 72 | `⚠ اسمح بالنوافذ المنبثقة للطباعة` | error — popup blocked | `:1891` |
| 73 | `حدّد عميلاً واحداً على الأقل ☑` | validation — customer-list preview | `:2136` |
| 74 | `حدّد عميلاً واحداً على الأقل` | validation — customer-list print | `:2151` |
| 75 | `⚠ اسمح بالنوافذ المنبثقة للطباعة` | error — popup blocked (**duplicate of 72**) | `:2160` |
| 76 | `حذف "<title>"؟` | `confirm` — draft delete | `:2223` |
| 77 | `الفاتورة فارغة!` | validation — empty invoice | `:2251` |
| 78 | `لم يتم إيجاد الفاتورة` | error — invoice not found | `:2289` |
| 79 | `تحميل هذه الفاتورة؟ ستُستبدل البيانات الحالية.` | `confirm` — destructive load | `:2378` |
| 80 | `حذف الفاتورة <num>؟` | `confirm` — invoice delete | `:2384` |
| 81 | `أدخل اسم البريسيت` | validation — theme name required | `:2615` |
| 82 | `⚠ عيّن العميل أولاً (👤) قبل إصدار المسودة` | validation — **the only mandatory field** | `:3130` |
| 83 | `المسودة غير موجودة أو أُصدرت مسبقاً` | error — draft unavailable | `:3245` |
| 84 | `تحميل المسودة؟ ستُستبدل الأصناف الحالية.` | `confirm` — destructive load | `:3246` |
| 85 | `لا توجد مسودة محمّلة` | error — no draft loaded | `:3275` |
| 86 | `إنشاء فاتورة جديدة؟\nستُفقد البيانات غير المحفوظة.` | `confirm` — destructive reset | `:3299` |
| 87 | `تحميل الفاتورة <num>؟\nستُستبدل البيانات الحالية.` | `confirm` — destructive load | `:3346` |
| 88 | `اختر تصنيفاً من الأعلى` | validation — no category active | `:3545` |
| 89 | `لا يوجد منتجات في هذا التصنيف` | info — empty category | `:3547` |
| 90 | `حدد تصنيفاً واحداً على الأقل` | validation — no category ticked | `:3554` |
| 91 | `لا يوجد منتجات في التصنيفات المحددة` | info — empty selection | `:3557` |
| 92 | `أدخل اسم التصنيف` | validation — category name required | `:3628` |
| 93 | `الاسم مطلوب!` | validation — Buyer name required | `:3655` |
| 94 | `اسم المنتج مطلوب!` | validation — Product name required | `:3683` |
| 95 | `اكتب اسماً أولاً` | validation — snapshot name required | `:3721` |
| 96 | `خطأ في التحميل: <e.message>` | error — **surfaces a raw exception** | `:3734` |
| 97 | `ملف غير صالح: <err.message>` | error — **surfaces a raw exception** | `:3767` |

**Six confirmations guard destructive acts** (67, 68, 69, 76, 79, 80, 84, 86,
87). **Notably absent: any confirmation on `selectCustomer`'s line-clearing
reset** (`:1423`) — the one silent destructive path (Part 8 §8.3).

**Success and status toasts — Arabic-only, individually enumerated:**

| Literal | Line |
|---|---|
| `👤 <name> · مُعيَّن للمسودة <num>` | `:1417` |
| `👤 <name> · فاتورة جديدة <num>` | `:1429` |
| `📦 <product>` | `:1604` |
| `🗑 تم الحذف` | `:2223`, `:2637` |
| `✓ تم حفظ الفاتورة <num>` | `:2283` |
| `✓ تم تحميل الفاتورة <num>` | `:2308` |
| `📄 تم نسخ الفاتورة → <num>` | `:2327` |
| `🗑 تم حذف الفاتورة` | `:2337` |
| `🎨 <theme>` | `:2609` |
| `💾 تم حفظ البريسيت: <name>` | `:2619` |
| `✓ تم حفظ الإعدادات` | `:3125` |
| `✓ تم حفظ الفاتورة — أُغلقت المسودة` | `:3137` |
| `✓ <title> — عيّن العميل (👤) ثم احفظ لدمجها مع الفواتير` | `:3271` |
| `📄 فاتورة جديدة <num>` | `:3302` |
| `👤 <buyer> · <num>` | `:3429` |
| `📦 تمت إضافة <n> منتج` | `:3549` |
| `📦 تمت إضافة <n> منتج من <m> تصنيف` | `:3559` |
| `✓ <name>` | `:3634` |
| `✓ تم تحديث العميل` | `:3658` |
| `✓ تم إضافة <name>` | `:3659`, `:3691` |
| `✓ تم تحديث المنتج` | `:3690` |
| `✓ تم حفظ الإعداد "<name>"` | `:3728` |
| `✓ تم تحميل "<name>"` | `:3733` |
| `🗑 حُذف "<name>"` | `:3740` |
| `📥 تم تصدير "<name>"` | `:3750` |
| `✓ تم استيراد "<name>"` | `:3766` |
| `⏳ جاري تحميل البيانات من المجلد...` | `:4144` |
| `✓ تم ربط المجلد — البيانات محملة` | `:4153` |

---

### 7.5 ENGLISH-ONLY — every literal, individually enumerated

| # | Literal | Classification | Line |
|---|---|---|---|
| 98 | `Balance Bites — Invoice Pro` | UI chrome (tab title), **brand** | `:6` |
| 99 | `✦ Invoice Pro — Balance Bites` | UI chrome (panel heading), **brand** | `:489` |
| 100 | `Monogram` | UI chrome (field label) | `:547` |
| 101 | `BB` | business data / brand | `:547`, `:866`, `:1218` |
| 102 | `Balance Bites` | business data / brand | `:548`, `:870`, `:1218` |
| 103 | `balancebites.com` | business data / brand | `:550`, `:988`, `:1219` |
| 104 | `EGP` | business data / locale | `:554`, `:1220`, + 11 fallback sites (§6.4) |
| 105 | `Reports Dashboard · Balance Bites` | UI chrome, **brand** | `:768` |
| 106 | `Pack` | business data | `:1328-1330` |
| 107 | `40g` | business data | `:1328-1330` |
| 108 | `Dark Gold` | business data | `:1258` |
| 109 | `Obsidian Blue` | business data | `:1259` |
| 110 | `Forest Night` | business data | `:1260` |
| 111 | `Warm Ivory` | business data | `:1261` |
| 112 | `Za'atar Crackers` / `Paprika Crackers` / `Black Pepper Crackers` | business data (English half of a pair) | `:1328-1330` |
| 113 | `+20 1xx xxx xxxx` | UI chrome (placeholder), **locale-bearing** | `:648` |
| 114 | `45` | UI chrome (placeholder), business-bearing | `:709` |
| 115 | `0` | UI chrome (placeholder) | `:3057` |

---

### 7.6 ARABIC-ONLY UI CHROME — rolled up by area *(permitted by CORRECTION 3)*

Every literal below is Arabic-only, non-configurable, and classified **UI
chrome** — it never reaches a printed document.

| Area | Line range | Approx. count | Representative literals |
|---|---|---|---|
| Editor panel header and action buttons | `:486-505` | 8 | `فاتورة جديدة` `:491`, `جاري الفحص...` `:498` |
| Accordion headings ×7 | `:506`, `:539`, `:623`, `:662`, `:681`, `:721`, `:735` | 7 | `🎨 المظهر`, `🏷 البراند والنصوص`, `👥 العملاء` `:625`, `📁 التصنيفات`, `📦 كتالوج المنتجات` `:683`, `📋 مسودات التحضير` `:723`, `🧾 سجل الفواتير` `:737` |
| Theme accordion field labels | `:514-534` | ~12 | colour-picker labels |
| Buyer form field labels and buttons | `:645-660` | ~9 | `الاسم`, `الهاتف`, `العنوان`, `ملاحظات` |
| Category quick-add row | `:669-678` | ~4 | `اسم التصنيف` |
| Product form field labels and buttons | `:689-718` | ~11 | `اسم المنتج`, `نوع التغليف`, `الوزن`, `التصنيف` |
| Price-list / customer-list toolbars | `:571-616` *(labels only)*, `:995-1030` | ~14 | `تحديد الكل`, `معاينة`, `طباعة` |
| Reports overlay chrome — 4 tab names, filter labels, sort options, empty states | `:757-796`, `:3933`, `:3944`, `:3962`, `:3982`, `:3998`, `:4000`, `:4008`, `:4016`, `:4027`, `:4044`, `:4049`, `:4057`, `:4068`, `:4105`, `:4107`, `:4115` | ~34 | `نظرة عامة · صافي بعد المرتجعات` `:3944`, `مبيعات شهرية` `:3962`, `أفضل العملاء` `:3982`, `الأعلى إيراداً` `:4049`, `تفاصيل كاملة` `:4057` |
| Report stat labels | `:3946-3950`, `:4010-4013`, `:4109-4112` | ~13 | `فواتير مبيعات`, `صافي الإيرادات`, `متوسط الفاتورة`, `عملاء نشطون`, `مرتجعات` |
| Report table column headers | `:4017`, `:4058`, `:4116` | ~14 | `رقم الفاتورة`, `التاريخ`, `المنتجات`, `الحالة`, `الإجمالي`, `العميل`, `الكمية المباعة`, `الإيراد` |
| Picker modal chrome | `:797-856` | ~8 | `اختر عميل · Select Customer` `:800` *(bilingual)*, `تصنيفات متعددة · Multi categories` `:843` *(bilingual)* |
| Buyer history overlay | `:3385-3410` | ~6 | `لا يوجد فواتير سابقة لهذا العميل` `:3385`, `📂 اختر فاتورة للتحميل · أو تابع بالأسفل لفاتورة جديدة` `:3387` |
| Empty states across managers | `:1293`, `:1445`, `:1533`, `:1547`, `:1629`, `:2207`, `:2353`, `:3472`, `:3536`, `:3588` | 10 | `لا يوجد عملاء بعد`, `لا يوجد منتجات`, `لا يوجد تصنيفات`, `لا يوجد فواتير محفوظة`, `لا يوجد بريسيت — احفظ مظهرك الحالي`, `لا توجد مسودات — أنشئها من Stock Costs → 🥣 التحضير` |
| Draft banner and stock verdict | `:3235-3237` | 4 | `✓ المخزون كافٍ`, `⚠ ينقص مكونات — راجع Stock Costs`, `📋 مسودة تحضير:`, `— لم يُعيَّن بعد (👤)` |
| Draft card labels | `:2211-2217` | 3 | `✓ مخزون كافٍ`, `⚠ نقص مخزون` |
| Preset bar and folder-status strip | `:1035-1058` | ~7 | `ربط مجلد`, `حفظ`, `تحميل` |
| Delete/tooltip micro-labels | `:1310`, `:3065`, and card buttons | ~10 | `حذف` |

**Approximate Arabic-only UI-chrome total: ~174 literals**, none configurable,
none translated.

---

### 7.7 Findings for the translation resource set

1. **The bilingual boundary is exactly the printed-document boundary.** Screen
   chrome is Arabic-only; document text is bilingual. That is a *deliberate and
   coherent* policy, and B2S's rule of full bilingualism supersedes it.
2. **Four bilingual invoice labels are hard literals** (rows 10–13) — the returns
   overlay was added after the settings system and never wired into it.
3. **Five Arabic-only labels print on a customer-facing invoice** (rows 47–51).
4. **Three language policies inside one seed set** (§7.3).
5. **Every validation and error message is Arabic-only**, including two that
   surface a raw JavaScript exception message (`:3734`, `:3767`) — which will be
   in English, producing a mixed-language error.
6. **The `·` separator is data, not decoration** — `split('·')` at `:4035` and
   `:4107` gives it semantics. A translation system that changes the joiner
   breaks report display names.
7. **29 document strings are declared twice** (§1.3.5) — a translation extractor
   would find and must reconcile both.
8. **Emoji are embedded in the literals themselves** (`✓`, `⚠`, `📦`, `🗑`, `👤`,
   `↩️`, `🔄`, `📅`, `💰`, `📊`, `🧾`, `📭`, `☑`, `✦`, `🎨`, `📥`, `📄`, `📂`,
   `⏳`, `🖨`, `🏷`, `📁`, `📋`, `🥣`), not applied by a renderer. The
   translation set inherits them.

---

## PART 8 — WHAT B2S MUST NOT REPRODUCE

Behaviours that are defects rather than requirements. One sentence each, plus
what the correct behaviour should have been. **No fix is designed.**

### 8.1 CF-02 EVIDENCE — unescaped `innerHTML` from user-derived input

**Three escape functions exist** — `htmlEsc` (`:1342-1344`), `PriceListPrint.esc`
(`:1740-1742`), `CustomerListPrint.esc` (`:1962-1964`) — with **identical bodies
covering `& < > "` and all three omitting `'`**. Escaping is applied **only** in
the two print-document builders and the return-details block.

**Every site where user-derived text reaches `innerHTML` unescaped — complete
enumeration:**

| # | Line | Unescaped value | Origin of the value |
|---|---|---|---|
| 1 | `:1301-1308` | `p.name` (theme name) — into element content | typed at `:1040` / `:2613` |
| 2 | **`:1310`** | `p.id` — **interpolated into an `onclick` attribute string** | generated, but concatenated into executable markup |
| 3 | `:2372` | `inv.date` | `<input type="date">` (`:894`) |
| 4 | `:3237` | `pend.title` **and** `custLbl` (= `pend.customerName \|\| gv('mvCust')`) | foreign draft title; **Buyer name from a free-text field** |
| 5 | `:3394-3403` | `inv.invoiceNumber`, `inv.date` | **`invoiceNumber` is free text** (`:890`) |
| 6 | `:3781` | `p.name` (whole-app snapshot name) | typed at `:1040`; **may arrive from an imported file** (`:3754`) |
| 7 | `:4008` | `custName` (Buyer name) | `bb_customers` |
| 8 | `:4020` | `inv.invoiceNumber`, `inv.date` | free text |
| 9 | `:4035` → `:4053` | `p.name` (product name) via `_rptBarRow`'s `label` | `bb_products` |
| 10 | `:4060` | `p.name` (product name) — report table cell | `bb_products` |
| 11 | `:4107` | `prodName.split('·')[0].trim()` | `bb_products` |
| 12 | `:4119` | `inv.invoiceNumber`, `inv.date`, `inv.customerName` | free text + `bb_customers` |
| 13 | `:3967` | month key `m` — derived from `inv.date` | `<input type="date">` |
| 14 | `:3984` | `c.name` (Buyer name) via `_rptBarRow` | `bb_customers` |

**Sites that DO escape, for contrast:** `:3197`, `:3198`, `:3205`
(`htmlEsc`); the price-list builder throughout (`:1775-1855`); the customer-list
builder throughout (`:2001-2107`).

**Correct behaviour:** every user-derived value entering markup should have been
escaped at the single point of insertion, with one escape routine covering `'`
as well, and no value should ever have been interpolated into an attribute
string (`:1310`).

**Why it matters more than it looks:** `bb_*.json` files are **shared between
tools through a folder**, and `pbImport` (`:3754`) applies **arbitrary
third-party JSON** into `S`, `C` and `items`. The input is not confined to one
trusted typist.

### 8.2 Invoice history is silently capped at 100

`if(arr.length > MAX) arr = arr.slice(0, MAX)` (`:2278`, `MAX = 100` at `:2239`).
The 101st invoice **destroys the oldest with no warning, no archive and no
count shown anywhere**. Every historical figure — reports, buyer history,
lifetime spend — silently becomes "the last 100 invoices".
**Correct behaviour:** retain all records, or make the cap visible and
configurable, and never discard financial history as a side effect of a save.

### 8.3 Picking a Buyer destroys the invoice in progress, without confirmation

`selectCustomer` calls `resetInvoiceFormForNew(id)` (`:1423`), which sets
`items = []` (`:3280`). **Every line already added is lost.** The `confirm()`
that guards `newInvoice()` (`:3299`) does not guard this path, and the
draft path deliberately returns before it (`:1419`) — so the tool already knows
the reset is sometimes wrong.
**Correct behaviour:** assigning a Buyer should not clear the lines, or should
confirm first.

### 8.4 A failed save reports success

`Store.set` wraps `localStorage.setItem` in `catch(e){}` (`:1202`) and returns
nothing. `saveCurrentInvoice` then toasts `'✓ تم حفظ الفاتورة'` (`:2283`)
unconditionally. **On a quota error the owner is told the invoice is saved when
it is not.**
**Correct behaviour:** the write should have reported failure, and the success
message should have been conditional on it.

### 8.5 The draft handoff is two unguarded writes

`saveCurrentInvoice()` (`:3134`) and `markCompleted()` (`:3136`) are separate
writes with nothing between them. **Interruption leaves an invoice created and
the draft still open**, so the draft can be issued again and produce a second
invoice for the same production run.
**Correct behaviour:** the two writes should have been atomic, or the second
should have been idempotent and self-healing.

### 8.6 CF-03 EVIDENCE — swallowed errors

**Truly empty `catch(e){}` — 3 sites:**

| # | Line | Swallows |
|---|---|---|
| 1 | `:1202` | `localStorage.setItem` — **every business write in the tool** |
| 2 | `:1207` | `localStorage.removeItem` |
| 3 | `:3717` | `localStorage.setItem` for the whole-app snapshot |

**Comment-only `catch(e){ /* … */ }` — 2 sites:**

| # | Line | Swallows |
|---|---|---|
| 4 | `:1149` | Reading `<key>.json` — a corrupt file is skipped, the loop continues |
| 5 | `:1161` | Writing `<key>.json` — **the folder mirror fails silently** |

**Swallow-and-substitute — 5 sites:**

| # | Line | Substitutes |
|---|---|---|
| 6 | `:1104` | `resolve(false)` — permission query failure looks like "not connected" |
| 7 | `:1119` | `resolve(false)` — permission request failure, same |
| 8 | `:1135` | `return false` — picker cancel and a genuine error are indistinguishable |
| 9 | `:1199` | `return fallback` — **a corrupt `bb_invoices` value silently becomes `[]`** |
| 10 | `:3716` | `return []` — a corrupt snapshot store becomes empty |

**Only 2 of 12 `catch` blocks reach the user:** `:3734` and `:3767`, both in the
snapshot system, both surfacing a raw exception message.

**Correct behaviour:** a failed persistence write, a corrupt data file and a
cancelled picker are three different events and should have been distinguishable
to the user. Site 9 (`:1199`) is the most serious: **a parse failure is
indistinguishable from an empty collection**, so a corrupted invoice file
presents as a business with no invoices — and the next save writes `[]` over it.

### 8.7 Every escape function omits `'`

All three (`:1343`, `:1741`, `:1963`) cover `& < > "` and omit the apostrophe,
while `:1310` interpolates into a single-quoted attribute.
**Correct behaviour:** one escape routine, complete coverage, no attribute
interpolation.

### 8.8 A discount over 100% produces a negative total, unguarded

`disc` is read with `parseFloat(...)||0` (`:2255`, `:3093`); the `max="100"`
and `min="0"` on the field (`:555`) are not enforced in code and are bypassed by
a loaded invoice (`:2296`) or a restored snapshot (`:3821`).
**Correct behaviour:** bounds should have been validated where the value is
consumed.

### 8.9 Deleting a record silently orphans every reference

Buyer (`:1391`), ProductCategory (`:1525`), Product (`:1596`) and Invoice
(`:2331`) all hard-delete with no referential scan, though `getInvoiceCount`
(`:1395`) proves the tool can count the references.
**Correct behaviour:** warn with the reference count, or soft-delete.

### 8.10 `ProductMgr.getAll()` returns the shared defaults array

`:1576` returns `DEFAULT_PRODUCTS` itself, where `:1266` and `:1514` both return
`.slice()`. On the seeding call the caller receives the module-level array and
any mutation writes through to the constant.
**Correct behaviour:** return a copy, consistently, as the other two managers do.

### 8.11 Theme ids can collide

`'cp_' + Date.now()` (`:1273`) has no random component, unlike `genId`
(`:1349-1351`). Two themes saved in the same millisecond share an id, and
`remove(id)` (`:1279`) filters **both**.
**Correct behaviour:** one id generator.

### 8.12 Two product keys in one module

`:2481` (`productId || name`) versus `:2493` (`productId || 'name:'+trim(name)`).
**Correct behaviour:** one key function.

### 8.13 Invoice numbers are neither unique nor retired

Four numbering implementations (§1.3.7), two scopes sharing one namespace, no
uniqueness check at save (`:2276` keys on `id`), and deleting the
highest-numbered invoice causes the next one to reuse that number (`:3337-3340`).
**Correct behaviour:** a single monotonic issuer with a uniqueness constraint.

### 8.14 The whole-app export writes buyer PII into a shareable file

`presetGetState` captures `meta.cust` and `meta.phone` (`:3803-3804`) and
`pbExport` downloads the object (`:3743-3751`). A file whose purpose is
*"share my invoice styling"* carries a named buyer's phone number.
**Correct behaviour:** a styling export should have contained styling only.

### 8.15 `pbImport` applies unvalidated third-party JSON

`:3754-3768` parses an arbitrary file, checks only `if(!obj.state) throw`
(`:3759`), then writes into `C`, `S` and `items` (`:3810-3838`). A malformed hex
propagates `NaN` into CSS (`:1345`); a hostile string reaches `innerHTML`
(`:3781`).
**Correct behaviour:** validate the payload against a known shape before applying
any part of it.

### 8.16 `enrichInvoice` re-aggregates all returns per invoice

`:2450` → `:2430` → `:2408` re-reads and re-folds the entire `bb_returns`
collection for **each** invoice, in six render paths (§2.7).
**Correct behaviour:** aggregate once per render pass.

### 8.17 A missing `items` array marks an invoice fully returned

`(invoice.items||[])` yields `invQty = 0`, and `totalQty >= -0.0001` is true for
any return (`:2445-2446`); `getInvoiceReturnInfo` passes `invoice||{}` (`:2438`).
**Correct behaviour:** an unknown invoice should not resolve to *fully returned*.

### 8.18 Report identity is inconsistent across four surfaces

Top-customers groups by `customerName` (`:3975`); per-Buyer filters by
`customerId` (`:3996`); top-products keys on `productId || name` (`:4034`);
single-product matches on `productId` only (`:4079`). **Four reports, three
identity rules — the same sale appears in some and not others.**
**Correct behaviour:** one identity rule.

### 8.19 Two report revenue bases that cannot reconcile

C14's headline uses `net` (post-discount, post-return, `:3939`); C16's table uses
`Σ qty×price` less returns (`:4037`, `:4041`). Whenever a discount was applied
the two disagree and neither is labelled.
**Correct behaviour:** one revenue definition, or both labelled.

### 8.20 `subtotal` is computed in two functions and `discountAmount` is write-only

`:2253-2254` duplicates `:3088-3092`; `discountAmount` is stored (`:2270`) and
never read (§2.4).
**Correct behaviour:** compute once; do not store a field nothing reads.

### 8.21 29 document strings are declared twice

`S` (`:1217-1239`) versus the merge helpers (`:2861-2867`, `:2883-2891`).
**Correct behaviour:** one declaration.

### 8.22 The brand is baked into three unreachable literals

`:6`, `:489`, `:768` — the tab title, the panel heading and the report subtitle
cannot be changed by the owner though every other brand string can.
**Correct behaviour:** every brand string from one source.

### 8.23 `line-through` is the only signal that a total was superseded

`:1993`, `:2366`, `:3922` render a struck-through gross with no textual
equivalent — invisible to a screen reader and to a monochrome fax or photocopy of
the printout.
**Correct behaviour:** a textual state label alongside the visual treatment.

### 8.24 Money is displayed with 0–2 decimals rather than a fixed 2

`minimumFractionDigits:0` (`:1339`) renders `45` as `٤٥` and `45.5` as `٤٥٫٥` in
the same column of the same invoice.
**Correct behaviour:** currency-appropriate fixed precision on a financial
document.

### 8.25 A category cannot be renamed

No `update` exists on `CategoryMgr` (`:1509-1566`), so correcting a typo requires
delete plus re-add, orphaning every product's `categoryId`.
**Correct behaviour:** rename in place.

### 8.26 Runtime CDN dependency for fonts

`:7`, `:1886`, `:2155` load Google Fonts at runtime, in all three documents.
Offline or on a restricted network the invoice renders in fallback faces —
**changing the printed layout of a financial document**.
**Correct behaviour:** bundled fonts.

### 8.27 Not defects — deliberate behaviours recorded so they are not "fixed"

To prevent the new build from mistaking these for bugs:

- **Line snapshots do not follow product edits** (`:1600`) — correct.
- **Duplicating an invoice copies the money verbatim** (`:2319`) — correct.
- **Return state is derived, not stored** (`:2452-2454`) — a design choice with
  consequences (§4.6), not an error.
- **A fully-returned invoice is excluded from outstanding** (`:1985`) — correct
  and valuable.
- **The `0.0001` epsilon** (`:2446`) — a deliberate floating-point tolerance.
- **`lineTotal` preferred over `qty×price`** (`:2403-2405`) — a deliberate
  producer-authority rule.
- **Both gross and net printed for a partial return** (`:1994`, `:3217-3226`) —
  a deliberate document requirement.
- **`renderItems()` before `syncAndRender()`** (`:3305`) — the source marks this
  as a fix; the ordering is load-bearing.

---

## PART 9 — RECONCILIATION against `EXTRACT_STOCK_COSTS.md`

**Method.** Every entity, calculation and term appearing in both extractions is
classified **IDENTICAL**, **DIVERGENT** or **ONE-SIDED**. Citations of the form
`bb-stock-costs.html:NNNN` are **quoted from `EXTRACT_STOCK_COSTS.md`**, which
verified them in P-02; citations of the form `:NNNN` alone are into
`balance-bites-invoice-pro.html` and were read this session. **No DIVERGENT item
is resolved and no winner is chosen** — that is explicitly outside this task.

---

### 9.1 IDENTICAL

| # | Element | Invoice-pro | Stock-costs | Note |
|---|---|---|---|---|
| I1 | `getReturnLineTotal` | `:2402-2406` | `:3304-3308` | **Byte-identical.** `parseFloat(lineTotal)`, prefer if `> 0`, else `(qty\|\|0)×(price\|\|0)` |
| I2 | `isInvoiceFullyReturned` | `:2442-2447` | `:3343-3348` | **Byte-identical**, including the `0.0001` epsilon and the cross-product quantity comparison |
| I3 | Disposition fallback chain | `:2511`, `:3202` | item-level then record-level | Same two-tier lookup; **the default differs** — D3 |
| I4 | IndexedDB substrate | `:1070-1071`, `:1098` | `:1187-1188`, `:1200` | Same database `bb_filestore_v1`, same store `'h'`, same key `'dir'` |
| I5 | File-mirror pattern | `:1139-1151`, `:1154-1162` | `:1247-1252`, picker `:1223` | Pull-on-load, `<key>.json`, FSA + IndexedDB handle |
| I6 | `Store` wrapper shape | `:1196-1209` | `:1333-1338` | `get(k, fallback)` / `set` / `remove`, JSON in `localStorage`, mirror on set |
| I7 | Four built-in theme names | `:1258-1261` | `:1347-1350` | `Dark Gold`, `Obsidian Blue`, `Forest Night`, `Warm Ivory` — **names and ids match; the field sets do not** — D7 |
| I8 | Storage keys are bare unscoped globals | `:1064` | `:1180`, `:1182` | No tenant dimension in either tool. Invoice-pro T1–T11 ≍ stock-costs T1–T11 |
| I9 | `bb_pending_invoices` handoff contract | `:2181-2232` | `:3162-3247` | Same record, same `status`/`completedInvoiceId` protocol |
| I10 | `bb_invoice_payments` is a map, default `'pending'` | `:1967-1968` | `:3130`, `:3135` | Same key shape, same default, same binary semantics |
| I11 | Buyer is unscoped and shared | `:1368` | `:1182`, `:3464` | Both treat `bb_customers` as one global list |
| I12 | Arabic-Indic display formatting exists | `fmt` `:1339` | `fmtInv` `:4786` | Both use `toLocaleString('ar-EG', …)` — **but invoice-pro has only this one formatter** — D8 |
| I13 | Empty `catch(e){}` on `Store.set`/`remove` | `:1202`, `:1207` | `:1333-1338` | Same silent-write failure mode |
| I14 | Bilingual convention `عربي · English` on document text only | throughout | throughout | Same policy, same middot |
| I15 | No user, role, auth, permission or audit concept | — | — | Absent in both |
| I16 | Returns keyed to an invoice by `invoiceId` | `:2411` | `:3271`+ | Same FK, no RI either side |

---

### 9.2 DIVERGENT — canonicalisation decisions for B2S

**No winner is chosen. Each entry states what turns on the choice.**

#### D1 — Read/write governance: one list versus two

| | Invoice-pro | Stock-costs |
|---|---|---|
| Mechanism | **One `MANAGED` list of 10 keys** (`:1064`). The read/write split is *emergent* — a key is written only if some code path calls `Store.set` with it | **Two explicit lists**: `WRITE_KEYS` (14 keys, `:1180`) and `READ_KEYS` (4 keys, `:1182`) |
| Effect on `bb_returns` | Pulled, **never pushed** (§1.0.4) — cannot be corrupted by this tool | In `WRITE_KEYS` — pushed |
| Effect on `bb_invoice_payments` | Pulled, **never pushed** | In `WRITE_KEYS` — pushed |
| Failure mode | An intended writer that forgets `Store.set` silently never syncs | A declared writer that only reads **overwrites the other tool's file** — the `bb_label_templates` finding (`EXTRACT_STOCK_COSTS.md` §8.23, stock-costs `:1180` vs `:6016`) |

**What turns on the choice:** whether B2S's collection ownership is **declared**
(explicit, auditable, and wrong when the declaration drifts from the code) or
**emergent** (always consistent with the code, and invisible). Invoice-pro's
accident is safer; stock-costs' declaration is more legible.

#### D2 — `Return.amount`: what it means

| | Invoice-pro | Stock-costs |
|---|---|---|
| Reads it as | **Write-off value.** Accumulated into a variable named `totalExpiredAmt` (`:2413`, `:2418`) and printed as `تالف` — *damaged* (`:3185`) | Written by two different paths with two different meanings (`EXTRACT_STOCK_COSTS.md` §4.3) |
| Consequence | The consumer's interpretation is **fixed**; the producer's is **path-dependent** | |

**What turns on the choice:** whether a Return carries **one** money field whose
meaning depends on how it was created, or **two** explicit fields (total returned
value, and value written off). Every `تالف` figure the owner has ever read
depends on the answer.

#### D3 — Unmarked disposition defaults in opposite directions

| | Invoice-pro | Stock-costs |
|---|---|---|
| Expression | `it.disposition \|\| ret.disposition \|\| 'expired'` (`:2511`, `:3202`) | item-level normaliser defaults toward **restock** (`EXTRACT_STOCK_COSTS.md` §4.5) |
| Result for a legacy line with no disposition | counted as **write-off** | counted as **restock** |

**What turns on the choice:** the same historical Return record produces
**opposite** waste-versus-recovery figures in the two tools. For B2S this decides
whether an unstated disposition is a write-off, a restock, or **an error that
must be resolved before the record is accepted**.

#### D4 — Line value: derived here, stored there

| | Invoice-pro | Stock-costs |
|---|---|---|
| `InvoiceLine` | **No `lineTotal` stored.** Recomputed at `:2254` and `:3062` | — |
| `Return.items[]` | reads a stored `lineTotal`, preferring it (`:2403`) | writes it |
| `Purchase` line | — | `totalCost` **stored not derived** (`:3010`) |

**What turns on the choice:** whether a line's money value is a stored fact that
survives a later price edit, or a derivation that always reflects current inputs.
The two tools already disagree **within one shared data set**.

#### D5 — Resale attribution: ids written, snapshots read

| | Invoice-pro | Stock-costs |
|---|---|---|
| `outAllocations` fields | reads **`toCustomerName`, `toInvoiceNumber`** only (`:2520-2521`) | writes **`toCustomerId`, `toCustomerName`, `toInvoiceId`, `toInvoiceNumber`** (`:3271-3281`) |
| Consequence | attribution is **textual and unnavigable**; two same-named buyers merge (`:2522`) | the ids exist and are never used by anyone |

**What turns on the choice:** whether B2S's return-resale trail is a
**navigable link** or a **printed statement**. The data to make it navigable has
been written all along and never read.

#### D6 — `outAllocations` producer/consumer, and P-02's open question closed

| | Invoice-pro | Stock-costs |
|---|---|---|
| Role | **The consumer.** `:2515-2525`, rendered at `:2981-3003` | The producer. `logFromCalc` writes it (`:3948-3960`); the manual path omits it (`:6955-6966`) |
| P-02 recorded | — | *"Nothing in this file consumes `outAllocations`"* (`EXTRACT_STOCK_COSTS.md` §4.4, §8.16) |

**This is not a disagreement — it is the missing half.** P-02 correctly reported
that the producer never reads it back. **This extraction identifies the consumer:
`getItemReturnBreakdown` at `:2515`.** Recorded here so the field is not
mistaken for dead data.

#### D7 — `bb_color_presets`: same file, same ids, **different field sets, both writing**

| | Invoice-pro | Stock-costs |
|---|---|---|
| Fields | `{id, name, bg, gold, txt, mut, row, tot, grand}` — **7 colours** (`:1274-1275`) | `{id, name, bg, panel, ink, muted, gold, line}` — **6 colours** (`EXTRACT_STOCK_COSTS.md` §1.1.11) |
| Shared fields | **`bg` and `gold` only** | |
| Built-in ids/names | `cp_def1`–`cp_def4` (`:1258-1261`) | same four names (`:1347-1350`) |
| Writes the file? | **Yes** (`:1266`, `:1269`) | **Yes** — in `WRITE_KEYS` (`:1180`) |
| Also writes the active id? | **Yes** (`:1283-1284`) | **Yes** — in `WRITE_KEYS` |

**Both tools write the same two files with incompatible record shapes.** A theme
saved in one tool is read by the other as a record missing five or four of its
colour slots. **This is the sharpest data collision the reconciliation found**,
and unlike D1 it is active on every save from either side.

**What turns on the choice:** whether B2S has **one** BrandTheme entity with a
superset of slots, **two** entities for two surfaces, or a **semantic slot model**
(surface, text, accent, border) that both surfaces map onto.

#### D8 — Money formatting: two formatters there, one here

| | Invoice-pro | Stock-costs |
|---|---|---|
| Formatters | **One** — `fmt` (`:1339`), `ar-EG`, 0–2 dp | **Two** — `fmt` (`:1631`) Western digits, **fixed 2 dp**; `fmtInv` (`:4786`) `ar-EG` |
| Same amount, both tools | `٤٥` | `45.00` in the dashboard, `٤٥` on a reprinted invoice |

**What turns on the choice:** whether the digit system and decimal count are a
property of the **document type** (stock-costs' answer) or of the **application**
(invoice-pro's answer). The owner currently sees the same money three ways.

#### D9 — Quantity rounding: present there, absent here

| | Invoice-pro | Stock-costs |
|---|---|---|
| Value-level rounding | **None.** The only `Math.round` is a chart bar's width percentage (`:3907`) | `roundQty(n)` — 6 dp with an integer snap (`:1633-1640`), applied to stock levels, purchase and production quantities |
| Epsilons | `0.0001` ×2 (`:2446`, `:4043`) | `1e-6` and `1e-9` inside `roundQty` |

**What turns on the choice:** a quantity that survives `roundQty` in one tool is
compared, unrounded, against invoice quantities in the other — including at
`:2446`, the full-return test, whose `0.0001` tolerance is **1,000× coarser** than
`roundQty`'s `1e-6`. Answers R2 in part.

#### D10 — `bb_categories` exists on one side only, and is mirrored

Invoice-pro writes `bb_categories` to the shared folder (`:1064`, `:1514`,
`:1517`). Stock-costs has it in **neither** `WRITE_KEYS` nor `READ_KEYS`
(`:1180`, `:1182`). **A file is produced into the shared folder that no other
tool in the family reads.**

**What turns on the choice:** whether ProductCategory is a catalog-wide entity
(and therefore belongs to whichever tool owns the catalog) or a
presentation-layer grouping local to invoicing.

#### D11 — Product identity in aggregation

| | Invoice-pro | Stock-costs |
|---|---|---|
| Keys observed | **Two**: `productId \|\| name` (`:2481`, `:4034`) and `productId \|\| 'name:'+trim(name)` (`:1341`, `:2493`) | Two, at `:4183` and `:3311` (`EXTRACT_STOCK_COSTS.md` §1.3.4) |

**Four key forms across two tools for one concept.** What turns on the choice:
whether a Product without an id is identifiable at all, and whether name
normalisation (trim, case, the `·` split) is part of identity.

#### D12 — Buyer identity in reporting

Invoice-pro uses **`customerName`** for top-customers (`:3975`) and
**`customerId`** for the per-Buyer report (`:3996`) — two rules in one tool
(§1.3.1). Stock-costs treats `bb_customers` as a read-only inbound list
(`:1182`). **What turns on the choice:** whether a renamed Buyer keeps their
history.

#### D13 — Where the Invoice total comes from

| | Invoice-pro | Stock-costs |
|---|---|---|
| Role | **Produces** `Invoice.total` (`:2271`) as `subtotal − discountAmount` | **Consumes** `bb_invoices` read-only (`:1182`) |
| Net-revenue basis | `parseFloat(inv.total)\|\|0` (`:2451`) | reads the same field |
| Product-level revenue | **`Σ qty×price`** (`:4037`) — bypasses the discount | its own product aggregation |

**What turns on the choice:** whether B2S's revenue is invoice-level or
line-level. Today they differ by exactly the discount, and **only invoice-pro
knows a discount was applied** — the discount percent lives in
`Invoice.discount` (`:2269`) and in the singleton `S.discount` (`:1220`), and
stock-costs' per-line aggregation cannot see either.

---

### 9.3 ONE-SIDED

#### 9.3.1 Present in invoice-pro only

| Element | Line |
|---|---|
| **Discount** — the only money-side policy in the entire family | `:2255-2257`, `:3093-3095` |
| `Invoice` as a **produced** entity (11 fields + lines) | `:2260-2274` |
| `InvoiceLine` shape | `:1600`, `:3077` |
| `ProductCategory` entity and its mirrored file | `:1509-1566` |
| Product **create/edit/delete** (stock-costs reads `bb_products`) | `:1571-1683` |
| Buyer **create/edit/delete** (stock-costs reads `bb_customers`) | `:1367-1504` |
| **Invoice numbering** — four implementations, two scopes | `:2321`, `:3341`, `:4203`, `:890` |
| **Price-list document** | `:1688-1907` |
| **Customer-list document**, incl. the receivables view | `:1912-2176` |
| **Four-report dashboard** | `:3843-4122` |
| Buyer history overlay | `:3350-3419` |
| **Whole-app snapshot** (`bbinv_pb`), export/import | `:3709-3838` |
| `outAllocations` **consumer** | `:2515-2525` |
| `bb_inv2` as a **written** singleton | `:2553`, `:4231` |
| Invoice history **cap of 100** | `:2239`, `:2278` |
| The rule *"fully returned ⇒ not outstanding"* | `:1984-1985` |

#### 9.3.2 Present in stock-costs only

| Element | Stock-costs |
|---|---|
| Material / Component, Recipe, Purchase, Production, OperatingCost, Package, Sticker | `:1180` and each `var KEY=` |
| **All stock quantity** — `currentStock`, `minStock`, the movement ledger | `:2654-2655`, `:2728-2729` |
| **All cost** — `costPerUnit`, `totalCost`, COGS, margin | `:2994-2999`, `:3010` |
| **All profit** — gross, net, cash, monthly | §2 |
| **Low-stock thresholds** | `:2655` |
| **Operating-cost allocation** | `bb_operation_costs` |
| **Return creation** — both dispositions, the Return Calculator, `outAllocations` production | `:3948-3960`, `:6955-6966` |
| **Payment writing** — `bb_invoice_payments`, `getTotalPaid` | `:3135`, `:3150-3152` |
| `bb_stickers`, `bb_label_templates`, `bb_label_open` — the CF-11 link | `:1180`, `:6016` |
| `roundQty` | `:1633-1640` |
| WCAG-derived accent colours | `:1666-1692` |
| A hardcoded absolute path (**redacted in P-02**) | `:1178` |
| Machine-local third tier (`bb_active_theme`, print margins, etc.) | `:1561`, `:4661`, `:4886` |

#### 9.3.3 Cross-tool links, and one that P-02 left open

| Link | Status |
|---|---|
| `bb_pending_invoices` — production request → invoice | **Closed.** `markCompleted` has a live caller here at `:3136`, setting `{status:'completed', completedInvoiceId}` (`:2196-2198`). P-02 documented the producing side; this is the consuming side. |
| `bb_returns` — return → invoice display | **Closed.** Producer stock-costs, consumer `:2398-2548`. |
| `bb_invoice_payments` — payment flag → outstanding list | **Closed.** Producer stock-costs `:3135`, consumer `:1966-1969`. |
| `bb_inv2` — brand/theme → invoice reprint | **Closed.** Producer `:2553`, consumer stock-costs (`READ_KEYS`, `:1182`). |
| `bb_customers`, `bb_products`, `bb_invoices` | **Closed.** Producer invoice-pro, consumer stock-costs `READ_KEYS`. |
| `bb_color_presets`, `bb_active_color_preset_id` | **Contested — both write.** D7. |
| `bb_categories` | **Orphan — invoice-pro writes, nobody reads.** D10. |
| `bb_stickers` / `bb_label_templates` | **ONE-SIDED.** Zero occurrences in invoice-pro. The `templateKey` overload of `AUDIT_STICKER.md` §3.4 has no counterpart here. P-04 owns the other side. |

#### 9.3.4 The `templateKey` overload — searched for, not present

`AUDIT_STICKER.md` §3.4 records `templateKey` holding either a template id or a
sticker id. **Searched this file: `templateKey`, `bb_label_templates` and
`bb_stickers` have zero occurrences.** The nearest analogue is
`template:'bbinv'` (`:3746`) — a **format marker string** in the snapshot export,
not an id and not overloaded. The invoice-pro-side equivalents of that
canonicalisation problem are D11 (four product-key forms) and §1.3.7 (four
numbering implementations).

#### 9.3.5 Batch and traceability — absent, stated plainly

*(P-03 replaced P-02's Part 5 with Payments; the comparison is answered here
because Part 9 requires it.)*

**No batch, lot, expiry, production-date or serial concept exists anywhere in
`balance-bites-invoice-pro.html`.** Searched: no `batch`, `lot`, `expiry` or
`expiryDate` identifier. The word `'expired'` (`:2511-2513`) is a **return
disposition**, not a date and not a shelf-life. `Product` has no batch attribute
(`:1584`); `InvoiceLine` has none (`:1600`); `Return.items[]` has none
(§1.1.7). **No path could resolve a batch to a shipment**, because no batch
exists to resolve. **Batch tracking, and resolving a bad Batch to the invoices
that shipped it, is a capability B2S adds.**

---

### 9.4 The four named reconciliations

#### R1 — TAX, DISCOUNT, FREIGHT

**Answered in three parts, unambiguously.**

**TAX — `balance-bites-invoice-pro.html` has no tax of any kind.** Searched
case-insensitively for `tax`, `VAT` and `ضريبة`: **zero matches.** There is no
tax field on any entity, no tax rate constant, no tax line on any of the three
documents, and no tax term in any expression. The grand total is
`subtotal − discountAmount` (`:2257`, `:3095`) and has exactly two terms.

**FREIGHT / SHIPPING — none.** Searched for `freight`, `shipping`, `شحن`,
`توصيل` and `مصاريف`: **zero matches.** No delivery charge, no handling fee, no
carriage.

**DISCOUNT — present, and it is the only one of the three that exists anywhere in
the family.**

| Property | Value |
|---|---|
| **Expression** | `disc = parseFloat(gv('tDiscount'))\|\|0` ; `discAmt = subtotal * disc / 100` ; `total = subtotal − discAmt` |
| **Sites** | `:2255-2257` (persist) · `:3093-3095` (display) |
| **Basis** | The **invoice subtotal**. Invoice-level only; no line-level discount exists |
| **Form** | A **percent** (0–100 by UI attribute, unenforced in code) |
| **Inclusive / exclusive** | **The question does not apply — there is no tax for it to be inclusive or exclusive of.** |
| **Order of application against tax and freight** | **No order exists.** The discount is the sole adjustment between subtotal and total |
| **Rounding** | **None stated in source**, at any of the three steps. `discountAmount` is stored raw (`:2270`) |
| **Precision detail** | `subtotal * disc / 100` multiplies before dividing — the more accurate ordering, and load-bearing (§2.4) |
| **Storage** | Both the percent (`:2269`) and the money (`:2270`). **Only the percent is read back** (`:2296`); the money is write-only |
| **Guards** | None. `>100` yields a negative total; `<0` yields a hidden surcharge (§2.4) |

**CF-45's condition, answered directly.** CF-45 asks whether `CALC_SPEC.md`'s
money-side policy has any legacy source at all. **Partially, and less than the
carry-forward assumed:**

- **Tax basis: no legacy source. Owner-authored in full.**
- **Freight: no legacy source. Owner-authored in full.**
- **Discount order against tax: no legacy source** — the ordering question is
  unanswerable from legacy because only one of the two operands ever existed.
- **Discount itself: a legacy source exists**, and it is specific — invoice-level,
  percent-based, applied to the subtotal, unrounded, stored twice with the
  percent authoritative.
- **Every money rounding rule: no legacy source.** §9.4.2.

**CF-45 therefore narrows rather than closes.** One of its four named items —
discount — now has an extraction backing. The other three do not.

#### R2 — MONEY ROUNDING

**Answered: `balance-bites-invoice-pro.html` rounds no money value anywhere,
except at the display boundary.**

| Question | Answer |
|---|---|
| Is any money value rounded before storage? | **No.** `subtotal` (`:2268`), `discountAmount` (`:2270`) and `total` (`:2271`) are all stored as raw doubles |
| Is any money value rounded before comparison? | **No.** The only two epsilons — `0.0001` at `:2446` and `:4043` — are applied to **quantities**, not money |
| Is any money value rounded before aggregation? | **No.** Every accumulator (`:2418`, `:2423`, `:3939`, `:3958`, `:3977`, `:4037`, `:4100`) sums raw |
| Is `Math.round` used on money? | **No.** The file's **only** `Math.round` is `Math.round(value/maxVal*100)` at `:3907` — a **CSS bar width percentage** |
| Is `toFixed` used anywhere? | **No.** Zero occurrences |
| Is money rounded at display? | **Yes, and only there.** `fmt` (`:1339`) applies `toLocaleString('ar-EG', {minimumFractionDigits:0, maximumFractionDigits:2})` |

**The display rule is itself a divergence.** `minimumFractionDigits: 0` means
money is shown to **0–2** decimals, not a fixed 2 — `45` prints `٤٥` and `45.5`
prints `٤٥٫٥` **in the same column of the same invoice** (§8.24).

**Comparison with P-02:** P-02 found no money value rounded before storage, and
`roundQty` on quantities as the only value-level rounding.
**Invoice-pro agrees on money and diverges on quantity** — it has **no `roundQty`
equivalent at all** (D9). So across the family: **money is never rounded in
either tool; quantities are normalised in one and not the other.**

**Consequence for `CALC_SPEC.md`:** every rounding rule in B2S is owner-authored.
The extraction's contribution is the **negative finding**, stated for both tools:
no legacy rounding rule exists to inherit, and the two tools' *display* precision
already disagrees (D8).

#### R3 — COSTING BASIS

**Answered: `balance-bites-invoice-pro.html` has no concept of what a unit
costs.**

| Question | Answer |
|---|---|
| What does invoice-pro believe a unit costs? | **Nothing. It has no cost concept.** `Product` carries `unitPrice` (`:1584`) — a **sale price**, not a cost. There is no `cost`, `costPerUnit`, `unitCost` or `totalCost` field on any entity |
| Where does that value come from? | `unitPrice` is typed into the product form (`:709`) and snapshotted onto the line at add time (`:1600`) |
| Is cost ever computed, displayed or stored here? | **No.** No COGS, no margin, no profit anywhere (§2.23) |

**Can the two tools disagree about cost? No — because only one of them has a
cost.** But the reconciliation surfaces something more useful:

**They can and do disagree about *price*, and the disagreement runs the opposite
way to the one CF-47 describes.**

| | Invoice-pro | Stock-costs |
|---|---|---|
| Sale price | **Snapshotted onto the line at add time** (`:1600`), so a saved Invoice is immune to later catalogue edits | Reads `product.unitPrice` else `recipe.unitPrice` **live** (`:3199`) |
| Cost | absent | **Last-purchase-price-wins, unconditional overwrite** (`:2994-2999`) — restates every closed month |

**The two tools apply opposite temporal policies to the two halves of the same
margin.** Revenue is **frozen at the moment of sale**; cost is **live and
retroactively restated**. A margin computed from both is therefore **partly
historical and partly current**, and it changes whenever a new purchase is
entered — even for a month closed a year ago.

**This sharpens CF-47 and does not contradict it.** CF-47 correctly identifies
retroactive cost restatement as the policy needing an OD. This extraction adds
the other half: **the revenue side already implements the opposite policy**, so
B2S's decision is not "snapshot or live for cost" but **"which of the two
existing, contradictory policies becomes the rule for both sides."**

#### R4 — RETURNS SHAPE

**The premise must be corrected before the question can be answered.**

**R4 states: "Invoice-pro is the data PRODUCER." For returns, this is false.**
`ReturnsMgr` is declared *read from Stock Costs* (`:2396`), its only storage
access is `getAll()` (`:2400`), `Store.set` is never called with `'bb_returns'`
(§1.0.4), and all eleven exported functions are readers (`:2535-2547`).
**Invoice-pro is the returns CONSUMER; `bb-stock-costs` is the producer.**
Reported per AGENTS.md §10 rather than answered on a false basis.

**R4 answered on the corrected basis:**

| R4 asks | Answer |
|---|---|
| **The shape it writes** | **It writes none.** Zero return records originate here |
| **Did it ever write a shape lacking `outAllocations`?** | **No — it has never written any return shape.** Both shapes originate in `bb-stock-costs`: `logFromCalc` (`:3948-3960`) writes Shape A **with** `outAllocations`; the manual path (`:6955-6966`) omits it, producing Shape B |
| **What must a renderer handle?** | **Fourteen enumerated conditions — §4.5.** All fourteen are defended in this file; it never throws on a malformed Return |

**Cross-reference to `EXTRACT_STOCK_COSTS.md` Part 4 — agreement and
divergence:**

| Point | P-02 (`EXTRACT_STOCK_COSTS.md` §4.5) | This extraction (§4.5) | Verdict |
|---|---|---|---|
| Both shapes exist in live data | Yes — A, B1, B2 distinguished | Confirmed from the consumer side | **AGREE** |
| Shape B2 requires a `\|\|[]` guard or throws `TypeError` | Stated | **Confirmed empirically**: `(ret.outAllocations\|\|[])` at `:2515` is exactly that guard | **AGREE — this extraction supplies the evidence** |
| A latent fourth variation from a missing `items[].disposition` | Identified | Confirmed, and **the default direction differs** | **DIVERGENT — D3** |
| Nothing consumes `outAllocations` | True within `bb-stock-costs` | **The consumer is `:2515-2525` in this file** | **Not a disagreement — the missing half. D6** |
| `outAllocations` carries four destination fields | `toCustomerId`, `toCustomerName`, `toInvoiceId`, `toInvoiceNumber` | **Only the two name/number fields are read** | **DIVERGENT — D5** |
| `Return.amount` semantics | Path-dependent | **Read as write-off value, always** | **DIVERGENT — D2** |

**P-02 is confirmed on every point of fact.** The two divergences (D2, D3) and
the two completions (D5, D6) are contributions of this pass, not corrections of
the previous one.

---

### 9.5 What the reconciliation establishes, in one place

1. **The family has exactly one money-side policy: an invoice-level percentage
   discount.** No tax, no freight, in either tool. (R1)
2. **No money value is rounded before storage in either tool.** Every rounding
   rule in `CALC_SPEC.md` will be owner-authored. (R2)
3. **Revenue is snapshotted; cost is live.** The two halves of margin already
   follow opposite temporal policies. (R3)
4. **Invoice-pro consumes returns and payments; it produces neither.** The
   `outAllocations` consumer is identified. (R4)
5. **Thirteen DIVERGENT items** (D1–D13) require canonicalisation. **D7 —
   `bb_color_presets` written by both tools with incompatible field sets — is
   active on every save from either side** and is the sharpest of them.
6. **Sixteen IDENTICAL elements** (I1–I16), including two byte-identical return
   functions, establish that the return-reading contract is already shared and
   should survive canonicalisation intact.

---

## C. Closing record

### C.1 Part completeness

| Part | Status | Note |
|---|---|---|
| **0 — Provenance** | Complete | Line count verified 3 ways; 11 chunks; redaction sweep; 34 `REPORT.md` citations re-derived |
| **1 — Entity and relationship model** | Complete | 11 entities with complete typed field lists; 12 relationships; 9 duplicate-modelling findings; diagram; vocabulary with CF-28 evidence |
| **2 — Calculations** | Complete | 22 calculations, each with expression, named inputs, **explicit rounding statement**, order of operations, edge cases, `file:line` and the **invariant/policy split**; the prompt's minimum list answered item by item |
| **3 — Workflows** | Complete | 16 workflows + 6 named-but-absent, each with ordered steps, entities, transitions and abandonment states |
| **4 — Returns** | Complete | Entity, line shapes, dispositions with separated stock/money effects, `outAllocations`, CF-04 both shapes + 3 disposition variants + 14 renderer conditions, three-way grouping, partial representation, `RETURNS_REQUIREMENTS.md` alignment |
| **5 — Payments** *(replacement)* | Complete | Entity shape, 3 call sites, 15 requirements answered, outstanding-balance analysis, 6 invoice states |
| **6 — Configurable vs hardcoded** | Complete | 8 tables + 11 tenancy findings |
| **7 — Bilingual inventory** | Complete | **Every business-data and document-template literal individually enumerated** (rows 1–65) per CORRECTION 3; validation messages (66–97) and English-only (98–115) individually enumerated; Arabic-only UI chrome rolled up by area as permitted |
| **8 — Must not reproduce** | Complete | 26 items + 8 explicitly-not-defects; CF-02 (14 sites) and CF-03 (12 sites) fully enumerated |
| **9 — Reconciliation** | Complete | 16 IDENTICAL, 13 DIVERGENT, 3 ONE-SIDED sets, cross-tool link table; **R1–R4 each answered explicitly** |

**No Part is incomplete. No HALT condition was met.**

### C.2 Done-when criteria

| Criterion | Status |
|---|---|
| Verified line count reported and reconciled against 3,498 and 4,284 | ✅ §0.1 — 4283 / 4284 displayed; supports CF-12, falsifies `REPORT.md` |
| Chunk count stated, final chunk confirmed at the last line | ✅ §0.2 — 11 chunks, final at `:4283` |
| Parts 1–4, 5 (Payments), 6, 7, 8, 9 all present | ✅ C.1 |
| R1–R4 each answered explicitly | ✅ §9.4 |
| Every calculation carries the invariant/policy split | ✅ Part 2 |
| Every calculation carries an explicit rounding statement, including "none stated in source" | ✅ Part 2 — the phrase appears verbatim wherever it applies |
| **Every entity carries a complete typed field list, and this is stated** | ✅ **Stated at §0.5 and delivered in §1.1.1–§1.1.11.** Each list is derived from the constructing record literal and extended with every field read elsewhere; foreign read-only fields are marked as such |
| Part 7 individually enumerates every business-data and document-template literal | ✅ §7.2 (rows 1–51), §7.3 (rows 52–65) |
| Every claim carries a `file:line` read this session | ✅ §0.5 |
| Exactly three files written | ✅ C.5 |
| One commit pushed | ✅ reported in the task report |

### C.3 Redaction

**Nothing in the source required redaction.** §0.3 records the full sweep:
no credential, key, token, connection string, OS account name or absolute local
path; no seeded buyer PII; the only URLs are three identical Google Fonts links
(`:7`, `:1886`, `:2155`).

**Verification grep of this output file for `REDACTED`: 3 matches, all
meta-references** — two in §0.3 and one in this section, each describing the
sweep itself. **Zero redaction spans**, consistent with there having been
nothing to redact.

**Recorded, not redacted:** the tool *stores* buyer names, phones and addresses
in plaintext and exports name and phone in the whole-app snapshot
(`:3743-3751`, `:3803-3804`). That is a runtime-data property, documented at
§6.8 and §8.14. No live buyer value exists in the source and none appears here.

### C.4 Findings raised by this pass, for reviewer triage

Not carry-forwards — this task may not open them. Listed so Gate 1 can.

| # | Finding |
|---|---|
| F-1 | **`bb_color_presets` and `bb_active_color_preset_id` are written by both tools with incompatible record shapes** (D7). Active on every theme save from either side. The sharpest data collision found. |
| F-2 | **`REPORT.md` §2.1's `MANAGED` list omits `bb_invoice_payments` and `bb_returns`** (`REPORT.md:86` vs `:1064`), which is why §2.1 contains no payments or returns discussion. |
| F-3 | **`REPORT.md` §2.1 calls invoice-pro the "data producer"**; it is a strict consumer for returns and payments (§1.0.4). This is the source of R4's mis-stated premise. |
| F-4 | **`REPORT.md` §2.1 citation drift is 0 → +38 → +111 → +140 → +390 → +652 → +735 → +3035** (§0.4). Non-linear, as CORRECTION 2 predicted. All 34 re-derived. |
| F-5 | **Revenue is snapshotted and cost is live** (R3) — the two halves of margin follow opposite temporal policies across the family. Sharpens CF-47. |
| F-6 | **CF-45 narrows rather than closes**: discount now has an extraction backing; tax, freight and all rounding do not (R1, R2). |
| F-7 | **`bb_categories` is written into the shared folder and read by nobody** (D10). |
| F-8 | **`outAllocations`' consumer is identified** at `:2515-2525`, closing a question P-02 left open (D6). Its `toCustomerId` / `toInvoiceId` are written and never read (D5). |
| F-9 | **Unmarked return dispositions default in opposite directions** in the two tools (D3) — the same legacy record yields opposite waste figures. |
| F-10 | **Invoice history is capped at 100 with silent destruction** (§8.2). Every historical figure is silently "the last 100 invoices". |
| F-11 | **Picking a Buyer destroys the invoice in progress without confirmation** (§8.3). |
| F-12 | **The draft→invoice handoff is two unguarded writes** (§8.5), so a production run can be invoiced twice. |
| F-13 | **Returns are valued at list price against a discounted invoice total** (§2.9) — every net-revenue figure over-deducts by the discount share of returned lines. |
| F-14 | **Four bilingual invoice labels and five Arabic-only labels print on a customer-facing document with no settings key** (§7.2.1 rows 10–13, §7.2.4 rows 47–51). |
| F-15 | **A parse failure is indistinguishable from an empty collection** (`:1199`), and the next save writes `[]` over the corrupt file (§8.6 site 9). |

### C.5 Files written by this task — exactly three

1. `docs/requirements/extracts/EXTRACT_INVOICE_PRO.md` *(new — this file)*
2. `SESSION_CONTEXT.md`
3. `DEVELOPMENT_JOURNAL.md`

`legacy/` was not modified. `EXTRACT_STOCK_COSTS.md` was read, not modified. No
design tool was read. No schema, stack, framework, library, layering or folder
structure is recommended anywhere in this document. No DIVERGENT item is
resolved. No carry-forward is closed.

