> **REQUIREMENTS EVIDENCE.** Extracted from a retiring tool. Records what the
> tool did and what its owner expects. NOT a specification, NOT current truth,
> NOT a parity target. Where this conflicts with a frozen document in
> docs/product/, the frozen document wins.

# EXTRACT — `legacy/bb-stock-costs.html`

**Task:** P-02 · **Role:** Requirements analyst · **Mode:** read-only on `legacy/`

**Purpose.** This tool is being retired, not ported. No code is reused, no output
is a parity target. This document extracts the *requirements it encodes* —
entities, relationships, calculations, workflows, and the configurable-versus-
hardcoded split — so B2S can be specified without losing anything the tool taught
its owner to expect. Where the tool does something badly, this records **what it
achieves**. Where it is inconsistent, this records the inconsistency as **a
decision B2S must make**. No fixes are proposed. No schema, stack, framework,
layering or folder structure is recommended.

---

## 0. Provenance and reading record

### 0.1 Verified line count

Counted this session, four independent methods, via `C:\Program Files\Git\bin\bash.exe`:

| Method | Result |
|---|---|
| `wc -l` | **7083** |
| `awk 'END{print NR}'` | **7083** |
| `grep -c ''` | **7083** |
| Last line reached by sequential read | line **7083** = `</html>` |

File size: 347,339 bytes.

**Verified line count: 7083 newline-terminated lines.** The file ends with a
newline after `</html>`, so an editor that renders a trailing empty line will
display 7084. Both numbers describe the same file.

### 0.2 Discrepancy against the two given figures

| Claim | Source | Verdict |
|---|---|---|
| **5577** | `REPORT.md` §2.3 heading (`REPORT.md:40`, repeated `:181`) | **Wrong by −1506 lines.** Not a counting convention — the figure is stale. Every `bb-stock-costs.html` line citation in `REPORT.md` derives from that stale read and is void. |
| **7084** | carry-forward CF-12 | **Correct**, under the trailing-newline display convention. Reconciles with 7083. Not a conflict. |

**No STOP condition triggered on line count** — the actual file matches one of
the two figures. Suggest CF-12 be restated as "7083 lines (7084 as displayed)".

### 0.3 Drift measured against `AUDIT_STICKER.md` §3.2.a

`AUDIT_STICKER.md` §3.2.a estimates `REPORT.md`'s drift into this file at
"roughly 319 lines". **That estimate is locally true and globally wrong.** The
drift is not constant — it grows through the file, because content was inserted
at several points rather than appended at one:

| Concept | `REPORT.md` claims | Actual (read this session) | Drift |
|---|---|---|---|
| `file://` link in markup | `:762` | `:902` | +140 |
| Shared-folder absolute path | `:1012` | `:1178` | +166 |
| Storage / FSA block | `:1009-1122` | `:1175-1327` | +166 … +205 |
| Empty `catch(e){}` sites | `:1073, :1084, :1092` | `:1239, :1250, :1258` (+6 more) | +166 |
| Sticker record write | `:2391-2415` | `:2725-2731` | **+334** |
| Recipe record write | `:2488-2502` | `:2824-2831` | **+336** |
| Arabic-locale number format | `:3649` | `:4786` | **+1137** |
| Bootstrap IIFE | `:5541-5574` | `:7047-7080` | **+1506** |
| `innerHTML` sites | `:1595, :1665, :2352, :2437` | none of those four is a user-data `innerHTML` today | **all four void** |

`UNIFICATION.md` and `PHASE_PLAN.md` inherit the same stale numbers:
`UNIFICATION.md:139` cites theme hex at `:1199-1338` (actual theme CSS block
`:1404-1549`); `UNIFICATION.md:142` cites `:root{--inv-…}` at `:3803-3809`
(actual `:4940-4946`); `UNIFICATION.md:156` and `PHASE_PLAN.md:202` cite the
WCAG contrast math at `:1465-1481` (actual `:1666-1692`).

**Every `file:line` below was read in this session.** No line number is inherited.

### 0.4 Reading record

Read completely in **15 sequential chunks**, no sampling:

| Chunk | Lines | Chunk | Lines | Chunk | Lines |
|---|---|---|---|---|---|
| 1 | 1–500 | 6 | 2501–3000 | 11 | 5001–5500 |
| 2 | 501–1000 | 7 | 3001–3500 | 12 | 5501–6000 |
| 3 | 1001–1500 | 8 | 3501–4000 | 13 | 6001–6500 |
| 4 | 1501–2000 | 9 | 4001–4500 | 14 | 6501–7000 |
| 5 | 2001–2500 | 10 | 4501–5000 | 15 | **7001–7083** |

**Final chunk reached the last line: confirmed.** Chunk 15 terminates at line
7083 (`</html>`). Targeted re-reads were performed afterwards to verify exact
field lists and expressions before transcription; those are re-reads of already-
read regions, not substitutes for the sequential pass.

### 0.5 Redaction — path / PII disclosure

**STOP-AND-FLAG condition triggered: reported and redacted, not transcribed.**

| Location | What it is |
|---|---|
| `:1178` | `SHARED_DATA_PATH` — an absolute Windows path string constant containing the machine owner's OS account name |
| `:902` | an `href="file:///…"` anchor in the markup pointing at the same directory, same account name |

Redacted form (structure preserved, account name removed):

```
C:\Users\<REDACTED>\Desktop\BALANCE BITES\invoices customers\saved data
```

The verbatim value is **not** transcribed into this document. The path is
display-and-guidance only: it is rendered as help text and as a `file://` link,
and is never used to open anything programmatically — directory access goes
through the File System Access API picker (`:1223`).

**No credential, key, token, connection string or password exists in the file.**
Searched: `key`, `token`, `secret`, `password`, `apikey`, `bearer`,
`Authorization`, `://`. The only network URLs are Google Fonts (`:7`, `:5031`,
`:5542`). No real Buyer PII is embedded in source; Buyer names arrive at runtime
from `bb_inv2` / `bb_customers`.

### 0.6 Scope boundaries observed

- No fix, remedy or correction is proposed anywhere below.
- No schema, stack, framework, layering or folder structure is recommended.
  Unavoidable forks are recorded as **"Decision for B2S"** and left open.
- The sticker tool's side of the `bb_stickers` link is **not** re-derived. Only
  what this file writes, reads and assumes is recorded (§1.2.9, CF-11 evidence).

---

# PART 1 — ENTITY AND RELATIONSHIP MODEL

## 1.1 Business entities

### 1.1.0 Persistence topology — and a declared/actual mismatch

Storage is `localStorage` (`Store.get/set/remove`, `:1333-1338`) with an optional
mirror to a user-picked directory through the File System Access API. The
directory handle is persisted in IndexedDB database `bb_filestore_v1`, object
store `'h'` (`:1187-1188`); the picker is at `:1223`; the pull-on-load at
`:1247-1252`.

Two key lists govern the mirror:

**`WRITE_KEYS` (`:1180`)** — declared as mirrored out:
`bb_materials`, `bb_packages`, `bb_stickers`, `bb_recipes`, `bb_purchases`,
`bb_production`, `bb_color_presets`, `bb_invoice_payments`, `bb_returns`,
`bb_operation_costs`, `bb_active_color_preset_id`, `bb_pending_invoices`,
`bb_label_templates`, `bb_label_open`.

**`READ_KEYS` (`:1182`)** — declared as read-only inbound:
`bb_products`, `bb_invoices`, `bb_inv2`, `bb_customers`.

**Finding — `bb_label_templates` is declared as a write key but used only as a
read.** The only access to it is `Store.get('bb_label_templates', [])` at `:6016`.
It is owned by the sticker tool. Being in `WRITE_KEYS` means this tool will
**overwrite the sticker tool's template catalogue file** with whatever its own
`localStorage` happens to hold — including an empty array on a fresh profile.
Recorded as a finding, not fixed. This is CF-11-adjacent; see §1.2.9.

**Third tier — local-only.** Written through `Store.set` but absent from
`WRITE_KEYS`, so they never reach the shared folder: `bb_active_theme`
(`:1561`, `:1583`), `bb_prep_lines` (`:2387`), `bb_prep_ing_view` (`:2404`),
`bb_prep_prod_mode` (`:2419`), `bb_prep_print_mode` (`:2449`),
`bb_inv_print_margins` (`:4661`), `bb_inv_print_preset_id` (`:4886`, `:4908`),
`bb_print_fit_one` (`:5568`), `bb_ret_last_customer` (`:6635`).

**Finding — `bb_active_theme` and `bb_active_color_preset_id` split one setting
across two tiers.** The active theme id is mirrored (`:1560`); the resolved theme
object is not (`:1561`). Two machines sharing a folder agree on which theme is
selected but each re-derives it locally.

> **Requirement B2S inherits:** the owner expects a *shared data surface* across
> the tool family, with an explicit producer/consumer split per collection, and
> expects some preferences to stay machine-local. The tier split is a real
> requirement. The mechanism is not.

---

### 1.1.1 Component — Material · tool calls it `material` / `مادة` (`bb_materials`)

A raw input consumed by production. Built by the shared factory
`makeInventoryMgr` (`:2645-2699`); `MaterialMgr` instantiated at `:2701`.

| Field | Type | Notes | Evidence |
|---|---|---|---|
| `id` | string | `genId(key.slice(3))` → prefix `materials` | `:2653` |
| `name` | string | free text, Arabic in practice; **uniqueness not enforced** | `:2653` |
| `unit` | string | free text, **default `'قطعة'`**; no unit registry, no conversion | `:2653` |
| `costPerUnit` | number | `parseFloat`, default `0`. **Overwritten by every purchase** — §2.4 | `:2654` |
| `currentStock` | number | `roundQty(parseFloat(…))`, default `0`. **Derived-but-stored**; overwritten wholesale by the ledger (§2.14) | `:2654` |
| `minStock` | number | `roundQty(parseFloat(…))`, default `0`. `0` disables the threshold | `:2655` |
| `supplier` | string | free text. **Supplier is not an entity** — no collection exists | `:2655` |
| `notes` | string | free text | `:2655` |

Identity: `id`. **No `createdAt`, no `updatedAt`** — Components carry no
timestamps at all. Update at `:2659-2665` replaces the same field set.

---

### 1.1.2 Component — Packaging · tool calls it `package` / `عبوة` (`bb_packages`)

**Byte-identical shape to Material.** Same factory, same fields, different
collection key and emoji. `PackageMgr` at `:2702` (`genId` prefix `packages`).

> **Modelling fact:** Material and Packaging are one shape stored twice, rendered
> by the same generic renderers (`renderInvTabView` `:1938-2008`,
> `makeInventoryMgr.renderList` `:2675-2697`). The only differences are the
> collection key, the emoji and the tab label. §1.3.1.

---

### 1.1.3 Component — Sticker · tool calls it `sticker` (`bb_stickers`)

A consumable stocked and costed like a Material, **and simultaneously** the join
record to the sticker tool. `StickerMgr` at `:2710-2792`; own factory (not the
shared one) at `:2725-2732`.

| Field | Type | Notes | Evidence |
|---|---|---|---|
| `id` | string | `genId('stickers')` | `:2727` |
| `name` | string | | `:2727` |
| `unit` | string | default `'قطعة'` | `:2727` |
| `costPerUnit` | number | | `:2728` |
| `currentStock` | number | **not** `roundQty`-normalised here, unlike Material | `:2728` |
| `minStock` | number | **not** `roundQty`-normalised here, unlike Material | `:2729` |
| `supplier` | string | | `:2729` |
| `notes` | string | | `:2729` |
| `productId` | string \| `''` | FK → `bb_products[].id`, owned by another tool | `:2730` |
| `templateKey` | string \| `''` | **Overloaded — holds a template id *or* a sticker id.** §1.3.2 | `:2730` |

**Finding — Sticker and Material diverge on quantity normalisation.** Material
applies `roundQty` to `currentStock`/`minStock` (`:2654-2655`); Sticker does not
(`:2728-2729`). Same concept, two precision policies. §1.3.3.

`findByProduct(productId, templateKey)` at `:2716-2723` is direct in-code proof
of the overload: it accepts a match when `s.templateKey === templateKey` **or**
`s.id === templateKey` (`:2720`). The tool itself does not know which kind of id
it was handed.

---

### 1.1.4 Recipe — tool calls it `recipe` / `وصفة` (`bb_recipes`)

The bill of materials for one produced product. `RecipeMgr` at `:2818-2892`.

| Field | Type | Notes | Evidence |
|---|---|---|---|
| `id` | string | `genId('rec')` | `:2826` |
| `name` | string | | `:2826` |
| `batchSize` | int | `parseInt`, **default `100`**. Yield in units per batch | `:2826` |
| `ingredients` | array | Component lines, below | `:2827` |
| `productId` | string \| `''` | FK → `bb_products[].id` | `:2828` |
| `productWeight` | string | **free text**, e.g. `'250g'` — not numeric, not a unit | `:2828` |
| `unitPrice` | number | selling-price snapshot, default `0` | `:2829` |

No `createdAt`. Update (`:2833-2838`) replaces the same set.

**Component line** (element of `ingredients`), built at `:6455-6459`, consumed at
`:2846-2852` and `:2865-2888`:

| Field | Type | Notes |
|---|---|---|
| `itemType` | `'bb_materials'` \| `'bb_packages'` \| `'bb_stickers'` | **the collection key doubles as the type discriminator** |
| `itemId` | string | FK into that collection |
| `qty` | number | quantity **per batch**, not per unit |

The line stores **no name and no cost snapshot**. Both are resolved live at
`:2847-2851`. Consequences, stated as facts:

- Renaming a Material retroactively renames it in every historical Recipe view.
- Re-pricing a Material retroactively re-prices **every historical COGS figure**,
  including profit for months already closed.

**Decision for B2S:** snapshot at time of use versus live resolution. The owner's
current expectation is live resolution — a price correction "fixes history".

---

### 1.1.5 PurchaseOrderLine — tool calls it `purchase` / `شراء` (`bb_purchases`)

A stock-in event, and **the most overloaded entity in the tool**. `PurchaseMgr`
at `:2984-3064`; canonical factory `makeRecord` at `:3001-3013`.

| Field | Type | Notes | Evidence |
|---|---|---|---|
| `id` | string | `genId('pur')` | `:3003` |
| `date` | ISO date | defaults `todayISO()` | `:3004` |
| `itemId` | string | FK | `:3005` |
| `itemType` | collection key | discriminator | `:3006` |
| `itemName` | string | **name snapshot at purchase time** — diverges from the live Component name | `:3007` |
| `qty` | number | `roundQty(parseFloat(…))`. **May be negative** | `:3008` |
| `costPerUnit` | number | | `:3009` |
| `totalCost` | number | `roundQty(qty) × costPerUnit`, **stored not derived** | `:3010` |
| `supplier` | string | snapshot | `:3011` |

**No `createdAt`. No `unit`. No `notes`.**

**Finding — `notes` is accepted by callers and silently discarded.**
`addStockAdjustmentPurchase` (`:4424-4435`) passes a `notes` value describing the
stocktake correction; `makeRecord` has no `notes` field, so the audit trail for
every manual stock correction is destroyed at the moment it is written. §8.4.

**Finding — every purchase rewrites the Component's cost.** `syncItemCost`
(`:2994-2999`) is called on both `add` (`:3020`) and `update` (`:3031`) and
overwrites `Component.costPerUnit` with the purchase price. **The costing policy
is "last purchase price wins"** — not weighted average, not FIFO. This is
policy, not invariant. §2.4.

**Four distinct real-world events share this one entity:**

| Real event | Written at | Distinguishing marker |
|---|---|---|
| Actual procurement — money left the business | `:6807-6819` (purchase form) | none |
| Opening balance — no money moved | `:6079-6083` | `supplier === 'رصيد افتتاحي'` (`:6081`) |
| Stocktake correction — no money moved | `:4424-4435` | `supplier === 'تسوية جرد'` (`:4432`), `costPerUnit` `0`, `qty` may be negative |
| Sticker-catalogue migration seed | `:6200-6211` | bypasses `makeRecord`; object literal **includes `notes`** |

The only discriminators are Arabic string sentinels in a free-text field. The
money cycle (§2.20) sums `totalCost` across all four.

**Decision for B2S:** movement type as a first-class attribute, or separate
entities. Recorded, not resolved.

---

### 1.1.6 ProductionRun — tool calls it `production` / `إنتاج` (`bb_production`)

A manufacturing event: consumes Components, yields finished units.
`ProductionMgr` at `:3069-3120`; factory `addDelta` at `:3078-3099`.

| Field | Type | Notes | Evidence |
|---|---|---|---|
| `id` | string | `genId('run')` | `:3094` |
| `date` | ISO date | | `:3094` |
| `recipeId` | string | FK → `bb_recipes[].id` | `:3094` |
| `recipeName` | string | **name snapshot** | `:3094` |
| `unitsProduced` | number | signed — `addDelta` accepts negatives | `:3095` |
| `notes` | string | **this entity does persist notes** | `:3095` |
| `deductions` | array | `{itemId, itemType, name, qty}` — the actual Component draw-down, snapshotted | `:3095`, built `:3086-3093` |
| `isAdjustment` | boolean | **hardcoded `true` on every run**, including normal production | `:3095` |

**No `createdAt`, no `cogsPerUnit`, no `totalCost`** — a ProductionRun does not
record what it cost. Cost is always re-derived from the *current* Recipe and
*current* Component prices.

**Finding — `isAdjustment:true` is a constant, not a flag.** `add()` (`:3074-3076`)
delegates straight to `addDelta`, so the field can never be `false` and cannot
distinguish a real production run from a correction. §8.5.

`deductions` is the tool's **one genuine immutable stock-movement record**: it
snapshots `name` and `qty` at the moment of production (`:3089-3092`), so it
survives Recipe edits and Component renames. It is, however, **not what the
ledger reads** — see §2.14 and §8.6.

> **Requirement B2S inherits:** the owner expects a production event to stay
> truthful about what it consumed even after the Recipe changes.

---

### 1.1.7 Return — tool calls it `return` / `مرتجع` (`bb_returns`)

`ReturnsMgr` at `:3252-3422`; factory at `:3257-3302`. **Full treatment in Part 4.**

---

### 1.1.8 OperatingCost — tool calls it `opcost` / `مصروف تشغيلي` (`bb_operation_costs`)

Overhead not attributable to a unit. `OpCostMgr` at `:3992-4034`; factory
`:3998-4010`.

| Field | Type | Notes | Evidence |
|---|---|---|---|
| `id` | string | `genId('opc')` | `:4001` |
| `date` | ISO date | | `:4002` |
| `name` | string | | `:4003` |
| `category` | string | **the stored value is an Arabic literal**, default `'أخرى'` | `:4004` |
| `amount` | number | **may be negative** when category is `'تعويض'` (`:2017-2026`) | `:4005` |
| `notes` | string | | `:4006` |

No `createdAt`.

**Finding — the category enum's primary key is an Arabic display string.** The
eight categories at `:2011` are `'إيجار'`, `'مرافق'`, `'أجور'`, `'صيانة'`, `'نقل'`,
`'تسويق'`, `'تعويض'`, `'أخرى'`. There is no stable code, no English key, and no
enum constant — the Arabic word *is* the identifier, stored on every record and
compared by string equality (`isOpCostCompensation` `:2015`). Translating the UI
would orphan every historical record. §6.6, §7.

**Finding — income is modelled as a negative cost.** `'تعويض'` (compensation)
enables negative amounts via a UI hint and placeholder (`:2021-2024`); nothing
enforces the sign, so any category can hold a negative. **Decision for B2S:**
signed cost versus a distinct income entity.

---

### 1.1.9 PaymentStatus map — tool calls it `bb_invoice_payments` (single object, not an array)

`PaymentMgr` at `:3123-3157`. Shape: a plain object keyed by invoice id.

| Key | Value | Evidence |
|---|---|---|
| `<invoiceId>` | `{ status: 'paid' \| 'pending', updatedAt: ISO date }` | `:3135` |

Default when absent is `'pending'` (`:3130`). **This tool writes it** — it is in
`WRITE_KEYS` (`:1180`).

**Finding — payment is a binary flag, not a ledger.** There are no payment
amounts, no partial payments, no payment dates beyond `updatedAt`, and no
payment records. "Cash collected" is therefore *the full invoice total of every
invoice someone ticked as paid* (`getTotalPaid` `:3150-3152`). §2.19.

> **Requirement B2S inherits:** the owner wants paid-versus-pending revenue split.
> **Decision for B2S:** binary flag versus a real payment ledger with partials.

---

### 1.1.10 SalesOrder draft — tool calls it `pending invoice` (`bb_pending_invoices`)

A production request created here and consumed by the invoice tool.
`PendingInvoiceMgr` at `:3162-3247`; factory `addFromPrep` at `:3205-3228`.

| Field | Type | Notes | Evidence |
|---|---|---|---|
| `id` | string | `genId('pend')` | `:3211` |
| `status` | `'pending'` \| `'completed'` | `:3212` |
| `title` | string | default `'طلب تحضير · '+todayISO()` | `:3213` |
| `createdAt` / `updatedAt` | ISO string | **the only entity with both** | `:3214-3215` |
| `customerId` | `null` | **always `null` — never populated in this tool** | `:3216` |
| `customerName` | `''` | **always empty** | `:3217` |
| `customerPhone` | `''` | **always empty** | `:3218` |
| `notes` | string | | `:3219` |
| `items` | array | Buyer-facing lines, built `:3185-3203` | `:3220` |
| `prepLines` | array | deep clone of the internal `{recipeId, units}` plan | `:3221` |
| `prepSummary` | object | `{stockOk, totalCost, totalUnits, totalToProduce, prodMode, lineCount, productCount, deficits[]}` | `:3222`, built `:3169-3183` |
| `completedInvoiceId` | string \| `null` | set by `markCompleted` (`:3240-3242`) | `:3223` |

**Item line** (`prepLinesToItems`, `:3185-3203`): `{productId, name, packType,
weight, categoryId, qty, price}`. Every field falls back from the linked Product
to the Recipe: `name` ← `product.name` else `recipe.name` (`:3194`); `weight` ←
`product.weight` else `recipe.productWeight` (`:3196`); `price` ←
`product.unitPrice` else `recipe.unitPrice` (`:3199`). `qty` is `roundQty(line.units)`
(`:3198`).

**Finding — three Buyer fields exist on the entity and are permanently empty.**
`customerId`, `customerName`, `customerPhone` are hardcoded to null/empty at
creation (`:3216-3218`) and there is no UI to populate them. The receiving tool
must supply the Buyer. Recorded as a boundary fact, not a bug to fix.

**Finding — `markCompleted` exists but has no caller in this file.** The
`'pending' → 'completed'` transition (`:3240-3242`) is exported (`:3245`) but
never invoked here; the other tool is assumed to drive it, across a
`localStorage` file with no protocol. §3.8.

---

### 1.1.11 BrandTheme — tool calls it `preset` (`bb_color_presets`)

`ColorPresetMgr` at `:1344`+; key at `:1345`. Active id in
`bb_active_color_preset_id` (`:1361`, `:1560`), resolved theme object cached in
`bb_active_theme` (`:1561`, `:1583`).

| Field | Type |
|---|---|
| `id` | string |
| `name` | string (user-supplied) |
| `bg`, `gold`, `txt`, `mut`, `row`, `tot`, `grand` | hex colour strings — **seven** |

> **CORRECTION — landed by P-02-FIX, HF-1 at Gate 1.** The field list
> previously given here (`panel`, `ink`, `muted`, `line`) does not occur in
> the source. Four names are wrong, in two different ways: `panel`, `ink` and
> `line` do not appear anywhere in the source, and `muted` is the wrong name
> for the field that does exist — it is `mut`. The true record is
> `{id, name, bg, gold, txt, mut, row, tot,
> grand}` — seven hex values — at `:1346-1350`, identical in shape to
> `EXTRACT_INVOICE_PRO.md` §1.1.9 and to `balance-bites-sticker.html:1273-1275`.
> The four built-in names given here are correct.

Four built-ins are hardcoded in source: `Dark Gold`, `Obsidian Blue`,
`Forest Night`, `Warm Ivory` (`:1347-1350`). Applied by injecting a stylesheet at
`:1394-1549`. Derived accent/emphasis colours are computed by WCAG relative-
luminance contrast at `:1666-1692`.

**Finding — appearance configuration is mirrored with business data.**
`bb_color_presets` and `bb_active_color_preset_id` are in `WRITE_KEYS` (`:1180`),
so the theme travels in the shared business-data folder.

---

### 1.1.12 DocumentTemplate margins — tool also calls these `preset` (`bb_inv_print_*`)

Local-only tier. `bb_inv_print_margins` = `{t,r,b,l}` in millimetres (`:4661`);
`bb_inv_print_preset_id` (`:4886`, `:4908`); `bb_print_fit_one` boolean (`:5568`).
The preset catalogue itself is hardcoded, §6.8.

**The word `preset` therefore names two unrelated entities** (§1.5.3).

---

### 1.1.13 Entities read but never written (owned elsewhere)

| Collection | Owner | Fields this tool depends on | Evidence |
|---|---|---|---|
| `bb_products` | product/invoice tool | `id`, `name`, `unitPrice`, `packType`, `weight`, `categoryId`; price also probed under other names | `:3191-3199`, `:5208-5216`, `:6104` |
| `bb_inv2` | invoice tool | `id`, `invoiceNumber`, `customerName`, `date`, `items[]{productId,name,qty,price}`, `total` | `:4852-4859`, `:4180-4209`, `:4558-4571` |
| `bb_invoices` | invoice tool | same shape; the **legacy** invoice key | `:3463`, `:4047`, `:5121`, `:6575` |
| `bb_customers` | invoice tool | Buyer directory for the return form | `:3464`, `:6576` |
| `bb_label_templates` | sticker tool | `id`, `name` only | `:6016` |

**Finding — two invoice collections are read, and the fallback chain differs by
call site.** `bb_inv2` is read at `:4852`; `bb_invoices` is read at `:3463`,
`:4047`, `:4574`, `:5048`, `:5121`, `:6575`. Some sites try the shared folder
first then fall back to `localStorage` (`:4046-4047`); `:5121` reads
`localStorage` only. **Which invoices a report sees depends on which function
loaded them.** §1.3.4, §8.11.

> **Consequence B2S must account for:** net revenue, monthly profit, cash profit,
> product summary and the entire stock ledger depend on collections this tool
> does not own and cannot validate. With no shared folder connected, they render
> as zeros with no error and no indication anything is missing.

---

### 1.1.14 PackagingTemplate handoff — tool calls it `bb_label_open` (single object)

Not business data: a **transient inter-tool command, persisted as if it were an
entity.** Written at `:6048-6053` immediately before `window.open` (`:6054`).

| Field | Type | Notes |
|---|---|---|
| `stickerId` | string | which Sticker to open (`:6049`) |
| `templateId` | string | **renamed on the wire** from the Sticker's `templateKey` (`:6050`); still overloaded, §1.3.2 |
| `productId` | string | FK → `bb_products[].id` (`:6051`) |
| `ts` | number | `Date.now()` (`:6052`) |

It is in `WRITE_KEYS` (`:1180`), so a one-shot UI handshake is mirrored to the
shared folder as `bb_label_open.json` and **never cleared by this tool**. The
consumer is assumed to clear it. Full CF-11 treatment at §1.2.9.

---

## 1.2 Relationships

Notation: **A → B** means A holds the foreign key. "RI" = referential integrity.

### 1.2.1 Recipe → Component (Material / Packaging / Sticker)

- **Cardinality:** one Recipe to many Component lines; each line to one Component.
- **FK holder:** Recipe, `ingredients[].itemId` + `ingredients[].itemType` (`:2827`).
- **RI enforced:** **no.** `deleteItem` (`:2808-2813`) confirms and deletes without scanning Recipes.
- **On delete:** the Recipe keeps a dangling `itemId`. `calcCOGS` resolves `null` and **skips the line** (`:2848-2849`), so the Recipe silently becomes cheaper and reported profit silently rises. `calcPrep` displays `'؟'` and treats stock as `0` (`:2878`, `:2871`). §8.1.

### 1.2.2 Recipe → Product (`bb_products`)

- **Cardinality:** intended one-to-one; **not enforced** — two Recipes may claim one `productId`.
- **FK holder:** Recipe, `productId` (`:2828`).
- **RI enforced:** **no.** `bb_products` is inbound; deletion there is invisible here.
- **On delete:** falls through to the fuzzy name join, §1.2.3.

### 1.2.3 InvoiceLine → Recipe — the fuzzy join

**There is no stored FK from a sold line to a Recipe.** The link is recomputed by
string matching on every calculation, `findRecipeForItem` `:4049-4063`:

1. Normalise both sides (lowercase, trim) `:4050`.
2. Exact match on the normalised name.
3. Else substring containment **in either direction** (`:4058`).
4. Else `null` → the line contributes **zero COGS** and is silently omitted from usage (`:4215`, `:4282`).

This join decides COGS, margin, profit, and every Component usage figure for the
whole business. Two products whose names contain one another match by array
order. §8.2.

> **Requirement B2S inherits:** a sold line must resolve to its Recipe. The owner
> expects this to work by name today. **Decision for B2S:** stored FK versus matching.

### 1.2.4 Return → Invoice

- **FK holder:** Return, `invoiceId` (`:3262`), with denormalised `invoiceNumber` (`:3263`) and `customerName` (`:3264`).
- **RI enforced:** **no.** Deleting the invoice in the other tool orphans the Return, which keeps subtracting revenue from an invoice that no longer exists. §8.12.
- **Cardinality:** one Invoice to many Returns — `aggregateReturnedDeductions` (`:3314-3341`) groups them.
- **Guard:** returns with an empty `invoiceId` are **skipped entirely** by the grouping (`:3317`), so a Return logged without an invoice still reduces revenue (§2.11) but never appears in invoice classification.

### 1.2.5 Return line → Product

Return items carry `productId` and `name` (`:3284-3285`). The aggregation key is
`it.productId || ('name:'+it.name)` (`:3310-3312`) — so **the same product
occupies two buckets** depending on whether the record was created with a
product link or not. §1.3.4.

### 1.2.6 PurchaseOrderLine → Component

- **FK holder:** purchase, `itemId` + `itemType` (`:3005-3006`).
- **RI enforced:** **no**, in either direction.
- **On delete of the Component:** purchases survive and still render from the `itemName` snapshot, and still count toward money spent, but the ledger drops them because it iterates live Components (`:4354-4367`). **Stock value falls; money spent does not.** §8.3.

### 1.2.7 ProductionRun → Recipe

- **FK holder:** production, `recipeId` (`:3094`), name snapshotted (`:3094`).
- **RI enforced:** **no.** Deleting the Recipe leaves the run's `deductions` intact and still truthful.
- **But:** the ledger does **not** read `deductions` — it re-derives usage from the *live* Recipe (`:4308-4322`), so deleting the Recipe silently zeroes that run's historical consumption. §8.6.

### 1.2.8 OperatingCost → nothing

Deliberately unattached. Never allocated to a unit, product or Recipe; subtracted
only in monthly aggregate (`:4268-4272`). **The tool's operating-cost allocation
policy is: none.** §2.17.

### 1.2.9 Sticker → sticker tool — **CF-11 EVIDENCE**

Recording only this file's side, as instructed.

**What it writes.**
- `bb_stickers` — array of Sticker records (§1.1.3), in `WRITE_KEYS` (`:1180`). This tool is a **writer** of the collection the sticker tool owns for design purposes.
- `bb_label_open` — in `WRITE_KEYS` (`:1180`); written at `:6048-6053` as
  **`{stickerId, templateId, productId, ts}`** immediately before
  `window.open(getLabelDesignerUrl(),'_blank')` at `:6054`.
  **The field is renamed on the wire.** The Sticker stores `templateKey`
  (`:2730`); the handshake emits it as **`templateId`** (`:6050`). One value, two
  names, and the receiving tool must know that `templateId` may hold a
  PackagingTemplate id *or* a legacy sticker id (§1.3.2). Recorded as a distinct
  finding from the overload itself.
- `bb_label_templates` — **in `WRITE_KEYS` (`:1180`) though the tool only ever reads it** (`:6016`). It will mirror its own `localStorage` copy over the sticker tool's file, including an empty array. See §1.1.0.

**What it reads.**
- `bb_label_templates` (`:6016`) — used only to build a `<select>` of `{id, name}` at `:6015-6021`. **No geometry, size, DPI, bleed or artwork is read or understood.**
- `bb_products` (`:6104`) — to populate the product `<select>`.

**What it assumes** — none of it verified by this file:

1. **A fixed filename inside a fixed folder name.** `getLabelDesignerUrl()`
   (`:6040-6044`) lowercases `location.pathname` and returns
   `'balance-bites-sticker.html'` when the path already contains `/costs/`,
   otherwise `'costs/balance-bites-sticker.html'`. **Both the sibling filename
   and the directory name `costs` are hardcoded**, and the whole scheme breaks
   if either tool is renamed, moved or served from a different layout. §6.9.
2. **The other tool polls `bb_label_open` on load.** Nothing here waits, confirms, retries or times out.
3. **The other tool clears `bb_label_open`.** This file never clears it, so a one-shot UI handshake persists in the shared folder indefinitely as `bb_label_open.json`.
4. **`templateKey` means the same thing on both sides.** §1.3.2 shows it does not mean one thing even on this side — `findByProduct` (`:2720`) matches it against *either* `s.templateKey` *or* `s.id`.
5. **Both tools have the same directory connected.** If only one does, the handshake lands in `localStorage` alone and the other tool never sees it.
6. **`bb_stickers` may be safely co-written** by a tool whose model of a sticker is "a consumable with a cost and a stock level" while the other tool's model is "a design". The file acknowledges the conflict itself: `splitSharedStickersToProducts` (`:6180-6220`) exists specifically to convert one shape into the other, and it writes `templateKey: legacyId` (`:6186`) — a *design* id into the field.
7. **Three specific legacy record ids exist.** `LEGACY_SHARED_STICKER_IDS` (`:2704-2708`) hardcodes three primary keys — `stickers_1782730981416_ywg0`, `stickers_1782730931444_a0we`, `stickers_1782730836803_5nw8` — and `needsSplit()` (`:2786-2788`) triggers a data migration when any is present. **Specific data rows are compiled into the program.** §6.10.

**Failure mode: entirely silent.** `window.open` (`:6054`) is not checked for a
popup block; there is no acknowledgement channel and no error path.

### 1.2.10 Invoice → PaymentStatus

- **FK holder:** the map key is the invoice id (`:3135`).
- **RI enforced:** **no.** Statuses for deleted invoices persist forever; `getStatus` on a missing id silently returns `'pending'` (`:3130`).

### 1.2.11 Component ← ledger ← (purchases + usage)

Not a stored relationship but the tool's most consequential dependency:
`refreshInventoryLedger` (`:4341-4371`) recomputes and **overwrites** every
`currentStock` from movement history, then persists the overwrite (`:4364-4368`).
See §2.14 and §1.3.3.

---

## 1.3 The same concept modelled more than once

### 1.3.1 Consumable, modelled three times

Material, Packaging and Sticker are one shape in three collections with three
tabs and three managers (`:2701-2702`, `:2710`). Sticker adds `productId` and
`templateKey`, uses its own factory (`:2725-2732`) rather than the shared one
(`:2651-2657`), and **diverges on quantity normalisation** (§1.1.3). Every
generic renderer takes the collection key as a parameter to paper over the split
(`:1938-2008`, `:2795-2800`).
**Canonicalisation decision for B2S.**

### 1.3.2 `templateKey` — overloaded, confirmed from this side

`AUDIT_STICKER.md` §3.4 found this from the sticker side. This file's own evidence:

| Site | What is stored in `templateKey` | Evidence |
|---|---|---|
| Sticker create/edit form | an id chosen from `bb_label_templates` — a **PackagingTemplate id** | `:2730`, options `:6015-6021` |
| Migration `splitSharedStickersToProducts` | `templateKey: legacyId` — the id of the **legacy sticker record itself** | `:6186` |
| `bb_label_open` handshake | whatever the Sticker currently holds — either of the above | `:6051` |
| `findByProduct` lookup | tests the argument against **both** `s.templateKey` and `s.id` | `:2720` |

One field, two entity types, no discriminator, and a lookup written to tolerate
either. **Canonicalisation decision for B2S.**

### 1.3.3 StockLevel, modelled three times and in disagreement

| Model | Where | Behaviour |
|---|---|---|
| Stored attribute | `Component.currentStock` (`:2654`, `:2728`) | Hand-editable in the item form and inline (`:4415-4417`) |
| Derived ledger | `refreshInventoryLedger` (`:4341-4371`) | Recomputed from movements and **written back over** the stored value |
| Synthetic movement | `addStockAdjustmentPurchase` (`:4424-4435`) | Converts a manual edit into a zero-cost purchase so the ledger will preserve it |

Reconciliation is by destruction: the ledger wins whenever it runs. The third
path exists solely to survive the second. Additionally, Material normalises the
stored value with `roundQty` and Sticker does not (§1.1.3), and
`getDisplayStock` (`:4377-4381`) picks between ledger and stored depending on
whether the ledger has a `source`. **Four code paths, one number.**
**Canonicalisation decision for B2S.**

### 1.3.4 Product identity, modelled five ways

| Representation | Where |
|---|---|
| `bb_products[].id` | canonical, owned elsewhere |
| `Recipe.productId` | `:2828` |
| `Sticker.productId` | `:2730` |
| Invoice line `name` string | the actual join key in practice, `:4049-4063` |
| Return key `productId \|\| 'name:'+name` | `:3310-3312` |

Aggregations across these do not reliably reconcile. The product-summary key
(`it.productId||it.name`, `:4183`) and the return key (`it.productId||'name:'+it.name`,
`:3311`) are **not the same key** — one prefixes with `name:` and the other does
not, so a Return without a `productId` can never match its product-summary row.
**Canonicalisation decision for B2S.**

### 1.3.5 Invoice source, modelled twice

`bb_inv2` (`:4852`) and `bb_invoices` (`:3463`, `:4047`, `:4574`, `:5048`,
`:5121`, `:6575`) are both read as "the invoices". Different reports use
different keys and different fallback chains. §1.1.13.

### 1.3.6 PurchaseOrderLine, four events one shape

§1.1.5 — procurement, opening balance, stocktake correction and migration seed,
distinguishable only by Arabic sentinel strings in `supplier`.

### 1.3.7 Product weight and unit, both free text

`Recipe.productWeight` is free text (`:2828`, e.g. `'250g'`) and rendered as-is
(`:2362`). `Component.unit` is separately free text (`:2653`). Pending-invoice
lines carry a third `weight` (`:3196`). No unit system, no conversion, no
validation. **Canonicalisation decision for B2S.**

### 1.3.8 Money formatting, modelled twice

`fmt()` (`:1631`) uses `toFixed(2)` with thousands separators — Western digits.
`fmtInv()` (`:4786`) uses `toLocaleString('ar-EG', …)` — **Arabic-Indic digits**,
`minimumFractionDigits:0`. Both appear on screen; the invoice print path uses the
second. The same amount renders in two digit systems with two decimal policies.
§8.9.

### 1.3.9 Stock value, computed twice with different clamping

The dashboard sums `currentStock × costPerUnit` **without clamping** (`:5137`),
so a negative balance *reduces* total inventory value. The stock report clamps
each line with `Math.max(0, …)` (`:5943-5950`). The two totals disagree whenever
any Component is oversold. §8.10.

### 1.3.10 Return disposition, stored at two levels

Per-item `disposition` (`:3289`) plus a roll-up `ret.disposition` that can be
`'mixed'` (`:3293-3298`). Readers must consult both, per-item winning
(`:3332`, `:3380`). Part 4.

### 1.3.11 Component usage, computed from two incompatible sources

`calcIngredientUsageFromInvoices` (`:4277-4306`) and
`calcIngredientUsageFromProduction` (`:4308-4322`) compute the same quantity from
different evidence, and the ledger picks **one or the other** based on whether
any invoices exist (`:4346`, `:4360`). They are never combined and never
reconciled. §2.14, §8.7.

---

## 1.4 Relationship diagram

```
┌── OWNED ELSEWHERE — read-only inbound (READ_KEYS :1182) ─────────────────┐
│  bb_products · bb_invoices · bb_inv2 · bb_customers                      │
└──────────────────────────────────────────────────────────────────────────┘

Recipe ──ingredients[]{itemId,itemType}── no RI (:2827) ──▶ Material  (bb_materials)
   │                                                     ├──▶ Packaging (bb_packages)
   │                                                     └──▶ Sticker   (bb_stickers)
   │
   ├──productId ── no RI (:2828) ────────────────────────────▶ bb_products.id
   │
   ◀──── FUZZY NAME MATCH, no stored FK (:4049-4063) ──── bb_inv2/bb_invoices
   │                                                        .items[].name
   ◀──recipeId + name snapshot (:3094)──── ProductionRun

ProductionRun ──deductions[]{itemId,itemType,name,qty}  (:3095)
        snapshot written but NOT read by the ledger (:4308-4322)  ──▶ Component

PurchaseOrderLine ──itemId + itemType ── no RI (:3005-3006) ──▶ Component
        └── syncItemCost (:2994-2999) ── OVERWRITES ──▶ Component.costPerUnit

Return ──invoiceId ── no RI (:3262) ──────────────────────▶ Invoice.id
   ├──items[]{productId ‖ 'name:'+name}  (:3310-3312) ────▶ bb_products.id (weak)
   └──outAllocations[]{toInvoiceId,toCustomerId,qty}  (:3271-3281) ──▶ Invoice.id (many)

Sticker ──productId (:2730)───────────────────────────────▶ bb_products.id
   └──templateKey  ══ OVERLOADED (:2730 / :6186 / :2720) ══▶ bb_label_templates.id
                                                          ‖ legacy sticker id

bb_label_open {stickerId, templateId, productId, ts}  (:6048-6053)
   ══ one-shot handshake, written then window.open(…) (:6054) ══▶ sticker tool
      templateKey RENAMED to templateId on the wire (:6050)
      never cleared here · no ack · no timeout · popup-block unchecked

bb_pending_invoices ──prepLines[]{recipeId,units} (:3221)──▶ Recipe
   ══ produced here, consumed by the invoice tool ══▶
      markCompleted (:3240) exported but never called in this file

Invoice.id ──key──▶ bb_invoice_payments{ status, updatedAt }  (:3135)   [WRITTEN HERE]

OperatingCost ── deliberately unattached (:3998-4010) ── monthly aggregate only

── DERIVED, NOT STORED ──
refreshInventoryLedger (:4341-4371)
    purchased  = Σ purchase.qty                                    (:4348-4351)
    used       = usageFromInvoices  XOR  usageFromProduction       (:4346, :4360)
    balance    = purchased − used                                  (:4361)
                      └── OVERWRITES and PERSISTS Component.currentStock (:4364-4368)
```

---

## 1.5 Vocabulary

### 1.5.1 Core vocabulary

| Concept | Arabic in UI | Tool's identifier | §1.2 B2S resolved term | Disagreement |
|---|---|---|---|---|
| Raw input | `مادة` / `المواد الخام` | `material`, `bb_materials` | **Component** | one of three Component types |
| Packaging | `عبوة` / `التغليف` | `package`, `bb_packages` | **Component** | same shape as Material |
| Sticker | `ستيكر` | `sticker`, `bb_stickers` | **Component** + PackagingTemplate link | one word, two roles |
| Bill of materials | `وصفة` | `recipe`, `bb_recipes` | **Recipe** | agrees |
| Recipe line | `مكون` (`:2362`) | `ingredient`, `ingredients[]` | **Component** | **`ingredient` is §1.15-forbidden** |
| Batch yield | `دفعة` (`:1001`) | `batchSize` (`:2826`) | **Recipe yield** | **`batch` here means yield, never traceability** — Part 5 |
| Stock level | `مخزون` | `currentStock` (`:2654`) | **StockLevel** | **`stock` forbidden**; also §1.3.3 |
| Stock movement | — *(no word exists)* | *(no entity)* | **StockMovement** | **concept implicit only** |
| Purchase | `شراء` / `المشتريات` | `purchase`, `bb_purchases` | **PurchaseOrderLine** | conflates 4 events §1.1.5 |
| Stocktake correction | `تسوية جرد` (`:4432`) | *(sentinel in `supplier`)* | **StockMovement type** | a data value used as a type |
| Opening balance | `رصيد افتتاحي` (`:6081`) | *(sentinel in `supplier`)* | **StockMovement type** | same |
| Production run | `إنتاج` / `دورة إنتاج` (`:5181`) | `production`, `bb_production` | **ProductionRun** | agrees |
| Invoice | `فاتورة` | `bb_inv2` / `bb_invoices` | **Invoice** | **two collections** §1.3.5 |
| Invoice line | — | `items[]` | **InvoiceLine** | **`item` forbidden**, and collides with Component "item" |
| Return | `مرتجع` / `المرتجعات` | `return`, `bb_returns` | **Return** (a StockMovement) | agrees |
| Restock disposition | `مخزون` (`:790`) | `restock` (`:3289`) | **disposition: restock** | Arabic word = "stock", collides |
| Write-off disposition | `تالف` (`:790`) | `expired` (`:3289`) | **disposition: writeOff** | **Arabic says "damaged", code says "expired"** |
| Operating cost | `مصروف تشغيلي` | `opcost`, `bb_operation_costs` | **OperatingCost** | agrees |
| Compensation | `تعويض` (`:2011`) | *(category value)* | **income / negative cost** | income modelled as negative cost |
| Product | `منتج` | `product`, `bb_products` | **Product** | owned elsewhere |
| Design template | — | `templateKey`, `bb_label_templates` | **PackagingTemplate** | **`template` forbidden**; overloaded §1.3.2 |
| Colour theme | — | `preset`, `bb_color_presets` | **BrandTheme** | **`preset` forbidden** |
| Print margin set | — | `preset`, `INV_PRINT_PRESETS` | **DocumentTemplate** | **same word, unrelated entity** |
| Production request | `طلب تحضير` (`:3213`) | `pending invoice`, `bb_pending_invoices` | **SalesOrder** (draft) | a production request named an *invoice* |
| Payment state | — | `bb_invoice_payments` | **PaymentStatus** | a flag named like a ledger §1.1.9 |
| Supplier | `مورد` | `supplier` (string) | **Supplier** | **not an entity** — free text |
| Buyer directory | — | `bb_customers` | **Buyer** | **`customer` forbidden** — §1.5.2 |

### 1.5.2 CF-28 EVIDENCE — `customer` means both Tenant and Buyer

Every occurrence in this file, with the sense each carries:

| Site | Literal | Sense |
|---|---|---|
| `:1178` | `…\Desktop\BALANCE BITES\invoices customers\saved data` *(redacted)* | **TENANT** — "customers" names **the owner's own business-data folder** |
| `:902` | the same path as a `file://` link | **TENANT** |
| `:1182` | `READ_KEYS` includes `'bb_customers'` | **BUYER** — a directory of buyers |
| `:3264` | `customerName: data.customerName \|\| ''` on the Return | **BUYER** |
| `:3265` | `customerId: data.customerId \|\| ''` on the Return | **BUYER** |
| `:3276-3277` | `toCustomerId` / `toCustomerName` in `outAllocations` | **BUYER** — the *receiving* buyer |
| `:3320` | `customerName` in the invoice grouping | **BUYER** |
| `:3389` | `getByCustomer(customerId, customerName)` | **BUYER** |
| `:3411` | `(r.customerName\|\|'—')` in the returns log | **BUYER** |
| `:3464`, `:6576` | `Store.get('bb_customers',[])` | **BUYER** |
| `:3216-3217` | `customerId: null, customerName: ''` on the pending invoice | **BUYER** (never populated) |
| `:4558` | `inv.customerName` on the invoice card | **BUYER** |
| `:5319` | `r.customerName` in the printed returns report | **BUYER** |
| `:6586`, `:6635` | `bb_ret_last_customer` — remembers the last Buyer selected | **BUYER** |
| `:19-20`, `:194-195` | `Balance Bites` masthead | **TENANT**, spelled as the brand, not as "customer" |

**Split: 2 Tenant, 13 Buyer, one word.** The Tenant sense is the more dangerous
of the two because it is baked into a filesystem path shared by every tool in the
family — renaming it breaks the data surface for all of them.
**This is CF-28's evidence from this file. It seeds GLOSSARY.md at P-05.**

### 1.5.3 One word, two meanings

| Word | Meaning A | Meaning B |
|---|---|---|
| `customer` | the Tenant's own data folder (`:1178`) | a Buyer (`:3264`) |
| `preset` | colour theme (`:1345`) | print margin set (`:4886`) |
| `templateKey` | PackagingTemplate id (`:2730`) | legacy sticker id (`:6186`) |
| `item` | a Component (`:2653`) | an InvoiceLine (`:4182`) |
| `batch` | Recipe yield, `batchSize` (`:2826`) | **never** a traceability Batch — Part 5 |
| `stock` | stored `currentStock` (`:2654`) | derived ledger balance (`:4361`) |
| `مخزون` | the stock level itself | the *restock* disposition (`:790`) |
| `purchase` | procurement | opening balance / stocktake / migration (§1.1.5) |
| `unit` | unit of measure, `'قطعة'` (`:2653`) | a countable finished product, `unitsProduced` (`:3095`) |
| `payment` | a status flag (`:3135`) | *(no payment amount exists anywhere)* |
| `invoice` | `bb_inv2` | `bb_invoices` | 
| `pending` | invoice not yet paid (`:3130`) | production request not yet fulfilled (`:3212`) |

### 1.5.4 Two words, one meaning

| Words | The one meaning |
|---|---|
| `تالف` ("damaged") · `expired` (`:3289`) · `.ret-disp-expired` (`:354`) | one disposition: written off, not restocked |
| `مخزون` ("stock") · `restock` (`:3289`) | one disposition: returned to sellable stock |
| `name` (`:2653`) · `itemName` (`:3007`) · `recipeName` (`:3094`) | the display name of a thing |
| `costPerUnit` (`:2654`) · `cogsPerUnit` (`:2890`) | unit cost at two layers |
| `qty` · `units` · `unitsProduced` · `unitsNeeded` · `unitsToProduce` | a quantity |
| `add` (`:3074`) · `addDelta` (`:3078`) | the same function — `add` merely delegates |
| `refreshInventoryLedger` (`:4341`) · `reconcileInventoryStock` (`:4373`) | the same function — the second only calls the first |

### 1.5.5 Arabic-only concepts with no English identifier

Four business concepts exist **only** as Arabic string literals, with no
constant, enum or English name anywhere:

| Concept | Literal | Site | Role |
|---|---|---|---|
| Opening balance | `'رصيد افتتاحي'` | `:6081` | sentinel discriminating a movement type |
| Stocktake settlement | `'تسوية جرد'` | `:4432` | sentinel discriminating a movement type |
| The eight cost categories | `'إيجار'`, `'مرافق'`, `'أجور'`, `'صيانة'`, `'نقل'`, `'تسويق'`, `'تعويض'`, `'أخرى'` | `:2011` | **the stored primary key of the enum** |
| Compensation test | `cat === 'تعويض'` | `:2015` | branch condition on a display string |

Translating any of these strings orphans every historical record that stores it.
§6.6, §7.

---

# PART 2 — CALCULATION EXTRACTION

**Reading the "Configurability" column.** `INVARIANT` = true for any business.
`POLICY` = a choice another business would make differently, and therefore
something B2S must expose as configuration. Where a calculation mixes both, the
split is stated per-term.

**Global precision facts, established once and referenced throughout:**

- **There is no decimal or money type.** Every value is an IEEE-754 double.
  All arithmetic below inherits binary floating-point error. **No calculation
  rounds its result.** Rounding happens only at the display boundary.
- **`fmt(n)` (`:1631`)** — `(parseFloat(n)||0).toFixed(2)` plus thousands
  separators by regex. Display only, half-away-from-zero at 2 dp, Western digits.
- **`roundQty(n)` (`:1633-1640`)** — the only *value* rounding in the tool:
  `NaN → 0`; `|v| < 1e-9 → 0`; else round to **6 decimal places**; then if the
  result is within `1e-6` of an integer, **snap to that integer**. Applied to
  quantities at `:2654-2655`, `:3008`, `:3198`, `:4359-4361`, `:4394`, `:4405-4406`.
  **Not applied to any money value anywhere.**
- **`fmtQtyInput(n)` (`:1652-1658`)** — display: `roundQty`, then integers plain,
  else `toFixed(6)` with trailing zeros stripped.
- **Comparison epsilon is `0.0001`** where one exists (`:2872`, `:3347`, `:3891`,
  `:4363`, `:4425`); `roundQty` internally uses `1e-6` and `1e-9`. **Three
  different tolerances coexist.**

---

## 2.1 Component line cost within a Recipe

**What it computes.** The cost contributed by one Component to one full batch.
Needed so the owner can see which input drives a product's cost.

**Expression** (`:2850`):

```
lineCost = ingredient.qty × component.costPerUnit
```

| Input | Source |
|---|---|
| `ingredient.qty` | `Recipe.ingredients[].qty` (`:2827`) — quantity **per batch** |
| `component.costPerUnit` | live lookup on `bb_materials` / `bb_packages` / `bb_stickers` (`:2847-2848`) |

**Rounding:** **none stated in source.** Raw double multiplication.

**Order of operations:** the Component is resolved *live* at calculation time, so
the cost used is today's price, never the price at any historical moment.

**Edge cases.** Missing Component (`!item`) → the line is **skipped entirely**
(`:2849`), silently reducing the batch cost. `ing.qty` falsy → `(ing.qty||0)`
→ contributes `0`. No negative guard.

**Configurability.** `qty × price` is **INVARIANT**. *Which* price — current
versus purchase-time versus weighted average — is **POLICY**; this tool uses
current. §2.4.

**`:2850`**

---

## 2.2 Recipe batch cost and COGS per unit

**What it computes.** The manufacturing cost of one sellable unit. This is the
single most load-bearing number in the tool: margin, profit, product summary and
finished-goods stock value all derive from it.

**Expression** (`:2843-2855`):

```
totalBatch = Σ lineCost   over all resolvable ingredient lines     (:2852)
cogsPerUnit = totalBatch ÷ recipe.batchSize                        (:2854)
```

| Input | Source |
|---|---|
| `lineCost` | §2.1 |
| `recipe.batchSize` | `Recipe.batchSize` (`:2826`), integer, default `100` |

**Rounding:** **none stated in source** for either the sum or the division.
Displayed via `fmt` at 2 dp (`:5232`).

**Order of operations:** sum all lines first, divide once at the end. Not
per-line division — this matters, because per-line rounding would drift.

**Edge cases.**
- `!recipe`, `!batchSize`, or `batchSize <= 0` → **early return `{total:0, lines:[]}`** (`:2844`). Divide-by-zero is guarded, but by returning a **COGS of zero**, which reads downstream as "this product costs nothing to make" and inflates profit. There is no error, no flag and no distinction from a genuinely free product.
- Unresolvable Component → line dropped (§2.1), batch total silently lower.
- Empty `ingredients` → `total = 0`.

**Configurability.**
- `Σ inputs ÷ yield` is **INVARIANT**.
- **POLICY:** that COGS contains *only* direct Components. Labour, machine time,
  energy, wastage/yield-loss and overhead are **excluded by design** — operating
  costs are subtracted separately at the monthly level (§2.17) and never enter
  unit cost. Another business would absorb some overhead into unit cost.
- **POLICY:** no wastage or yield factor exists. `batchSize` is assumed to be
  achieved exactly, every time.

**`:2843-2855`**

---

## 2.3 Production requirement plan (`calcPrep`)

**What it computes.** For a target quantity of a product, how much of each
Component is needed, whether stock covers it, and the shortfall if not.

**Expression** (`:2857-2892`):

```
batchSize = parseInt(recipe.batchSize) || 1 ; if (batchSize <= 0) batchSize = 1   (:2860-2861)
ratio     = unitsNeeded ÷ batchSize                                              (:2862)
perUnit   = ingredient.qty ÷ batchSize                                           (:2869)
needed    = ingredient.qty × ratio                                               (:2870)
ok        = stock >= needed − 0.0001                                             (:2872)
shortfall = ok ? 0 : max(0, needed − stock)                                       (:2886)
lineCost  = needed × component.costPerUnit                                       (:2874)
totalCost = Σ lineCost                                                           (:2875)
stockOk   = AND over all lines of ok                                             (:2873)
```

**Rounding:** **none stated in source.** `ratio` is deliberately fractional —
`batches` is set equal to `ratio` (`:2863`), so the tool plans **partial
batches** rather than rounding up to whole ones.

**Edge cases.**
- `!recipe` or `unitsNeeded <= 0` → early return with all zeros (`:2858`).
- `batchSize` zero, negative or unparseable → **coerced to `1`** (`:2860-2861`), a
  different guard from §2.2's early-return-zero. **Two guards, two behaviours,
  same condition.**
- Missing Component → `stock = 0`, `ok = false`, `cost = 0`, name `'؟'`
  (`:2871`, `:2874`, `:2878`). The line is counted as short but contributes no
  cost, so `totalCost` understates.
- Comparison uses epsilon `0.0001` to absorb float error (`:2872`).

**Configurability.**
- Proportional scaling is **INVARIANT**.
- **POLICY:** partial batches allowed. A business with a physical minimum batch
  (an oven, a vat, a mould) would need `ceil(ratio)` and would carry the
  overproduction as stock.
- **POLICY:** the `0.0001` sufficiency tolerance.

**`:2857-2892`**

---

## 2.4 Component cost update on purchase — "last price wins"

**What it computes.** The current unit cost of a Component, used by every COGS
calculation.

**Expression** (`:2994-2999`, invoked at `:3020` and `:3031`):

```
component.costPerUnit ← purchase.costPerUnit
```

**Unconditional overwrite** on every purchase `add` and every purchase `update`.

**Rounding:** none — direct assignment.

**Edge cases.** A stocktake correction is written as a purchase with
`costPerUnit: 0` (`:4431`), and `addStockAdjustmentPurchase` passes
`costPerUnit || 0`. Callers at `:4442` and `:4470` pass the item's existing cost,
so in the observed paths the value round-trips rather than zeroing. **No guard
exists** — a purchase genuinely entered at zero cost would silently zero the
Component's cost and therefore zero every Recipe that uses it.

**Configurability.**
- That a Component has a current cost is **INVARIANT**.
- **The costing method is PURE POLICY, and this is one of the most consequential
  policy choices in the tool.** "Last purchase price wins" is neither weighted
  average, nor FIFO, nor LIFO, nor standard cost. Because §2.1 resolves price
  live, **entering one purchase at a new price retroactively restates COGS,
  margin and profit for every past month.**

> **Requirement B2S inherits:** the owner expects entering a new purchase price to
> immediately update product costing everywhere. **Decision for B2S:** which
> costing method, and whether history is restated or frozen.

**`:2994-2999`, `:3020`, `:3031`**

---

## 2.5 Purchase line total

**Expression** (`:3010`):

```
totalCost = roundQty(parseFloat(qty) || 0) × (parseFloat(costPerUnit) || 0)
```

**Rounding:** the **quantity** is `roundQty`-normalised (6 dp, integer snap); the
**product is not rounded**. Stored, not derived, so it never re-derives if either
factor is later edited — but `update` (`:3024-3033`) rebuilds the whole record, so
edits through the UI do recompute.

**Edge cases.** Non-numeric → `0`. **Negative `qty` is permitted and meaningful**
— it is how a downward stocktake correction is recorded (`:4430`). A negative
`qty` with a positive `costPerUnit` produces a **negative `totalCost`**, which
then reduces "total spent" in §2.20.

**Configurability.** `qty × unitPrice` is **INVARIANT**. **POLICY:** that
purchases carry no tax, no freight, no discount and no landed-cost component —
there is no field for any of them (§2.6).

**`:3010`**

---

## 2.6 Tax, discount, freight — **absent**

Searched the whole file for `tax`, `VAT`, `ضريبة`, `discount`, `خصم`, `shipping`,
`شحن`. **No tax calculation, no tax rate, no tax field, no discount calculation
and no freight cost exists anywhere in this tool.**

Consequences, recorded as facts:

- Purchases capture `qty × costPerUnit` only (`:3010`).
- Revenue is taken from `invoice.total` (`:4093`) — a **pre-computed number
  supplied by the invoice tool**. Whatever tax or discount policy exists lives
  there, not here, and is invisible to every calculation in this file.
- Line-level revenue is recomputed as `qty × price` (`:4108`, `:4192`) with **no
  discount term**, so it cannot reconcile with `invoice.total` whenever the
  invoice tool applied an invoice-level discount. §2.9.

**Configurability.** Tax treatment (inclusive/exclusive, rate, registration
threshold, per-line versus per-invoice) is **entirely POLICY** and is **entirely
absent** from the extraction source. **B2S cannot inherit a tax requirement from
this tool because none exists.** Flagged as a gap in the *source*, not in this
extraction — the requirement must come from the owner, not from the code.

---

## 2.7 Invoice line revenue

**Expression** (`:4108`, identically at `:4192`):

```
lineRev = (parseFloat(item.qty) || 0) × (parseFloat(item.price) || 0)
```

Inputs are `bb_inv2` / `bb_invoices` `items[].qty` and `items[].price` — **owned
by another tool** (§1.1.13). No discount, no tax, no rounding.

**Rounding:** **none stated in source.**

**Edge cases.** Missing or non-numeric → `0`, silently.

**Configurability.** `qty × price` is **INVARIANT**. The absence of a
line-discount term is **POLICY** (§2.6).

**`:4108`, `:4192`**

---

## 2.8 Invoice grand total — **not computed here**

The tool **reads** `invoice.total` (`:4093`, `:4244`) and never derives it. There
is no subtotal, no discount and no tax roll-up in this file.

**Requirement recorded:** the tool assumes an authoritative invoice total exists
upstream and is trustworthy. **B2S must own this calculation itself.**

**`:4093`, `:4244`**

---

## 2.9 Sales aggregation — and the two-totals divergence

**What it computes.** Total revenue, split paid/pending, plus a per-product
breakdown. Drives the profit view and the money cycle.

**Expression** (`aggregateSales`, `:4089-4119`):

```
per invoice:
    status       = PaymentMgr.getStatus(inv.id)          (:4092)   → 'paid' | 'pending'
    invTotal     = parseFloat(inv.total) || 0             (:4093)
    totalRevenue += invTotal                              (:4094)
    totalPaid    += invTotal   if status === 'paid'       (:4095)
    totalPending += invTotal   otherwise                  (:4096)

  per line of that invoice:
    pid          = item.productId || ('name:' + item.name)   (:4098)
    lineRev      = qty × price                                (:4108)
    byProduct[pid].revenue += lineRev                         (:4110)
    totalQty     += qty                                       (:4111)
```

**The divergence.** `totalRevenue` is a sum of **invoice-level** totals;
`byProduct[*].revenue` is a sum of **line-level** `qty × price`. These are
different quantities whenever the invoice tool applied any invoice-level
adjustment. **Nothing reconciles them and nothing detects the gap.** The profit
header uses the first (`:5265`); the per-product table uses the second (`:5336`).

**Rounding:** **none stated in source** at any step.

**Edge cases.** `inv.total` missing → `0`, so the invoice contributes nothing to
revenue but its lines still contribute to `byProduct`. Product name is truncated
at the first `·` and trimmed (`:4102`) — a **display convention embedded in an
aggregation key's payload**.

**Configurability.**
- Summation is **INVARIANT**.
- **POLICY:** that unpaid invoices count as revenue at all — this is accrual
  recognition. A cash-basis business would exclude them. The tool reports both,
  which is the owner's real requirement.
- **POLICY:** the paid/pending split being binary rather than partial (§1.1.9).

**`:4089-4119`**

---

## 2.10 Return deductions applied to sales

**What it computes.** Reduces sales figures by what was returned, so revenue
reflects goods actually kept.

**Expression** (`applyReturnDeductionsToSales`, `:4066-4087`), for every item of
every Return that **has an `invoiceId`** (`:4068`):

```
lineRev = getReturnLineTotal(item)                                     (:4073)
byProduct[key].qty     = max(0, byProduct[key].qty     − item.qty)      (:4075)
byProduct[key].revenue = max(0, byProduct[key].revenue − lineRev)       (:4076)
totalQty               = max(0, totalQty     − item.qty)                (:4080)
totalRevenue           = max(0, totalRevenue − lineRev)                 (:4081)
   … and the same for totalPaid / totalPending by invoice status        (:4082-4083)
```

where **`getReturnLineTotal(it)` (`:3304-3308`)**:

```
lt = parseFloat(it.lineTotal)
return (!isNaN(lt) && lt > 0) ? lt : (qty × price)
```

— i.e. **the stored `lineTotal` wins if positive, otherwise it is recomputed.**
A `lineTotal` of exactly `0` falls through to recomputation.

**Rounding:** **none stated in source.**

**Order of operations — significant.** Deductions are applied *after* the full
sales pass, and each is independently clamped at zero.

**Edge cases — and a systematic bias.**
- **`max(0, …)` clamping on every subtraction (`:4075-4083`) is not
  order-independent.** Once any running total reaches zero it cannot go negative,
  so subsequent deductions are silently discarded. Over-returning a product
  understates the deduction rather than producing a visible negative.
- Returns with no `invoiceId` are **skipped entirely** (`:4068`), so they never
  reduce sales here — but they **do** reduce monthly revenue (§2.11), which uses
  no such guard. **Two return-handling paths, two different filters.**
- The product key here is `productId || ('name:'+name)` (`:4071`); the
  key in §2.12's COGS pass is `productId || name` (`:4183`) — **without the
  `name:` prefix**. A Return with no `productId` therefore matches in one
  aggregation and misses in the other.

**Configurability.**
- That returns reduce revenue is **INVARIANT**.
- **POLICY:** returns are deducted at **sale price**, not at cost (`:4073`).
- **POLICY:** clamping at zero instead of permitting a negative.
- **POLICY:** that a return reduces the *original* month's revenue rather than
  being recognised in the month it occurred. §2.13.

**`:4066-4087`, `:3304-3308`**

---

## 2.11 Total returns value

**Expression** (`:3398-3400`):

```
totalReturns = Σ return.amount   over all returns
```

**No `parseFloat`, no `||0` guard** — unlike every comparable reduction in the
file. A non-numeric `amount` yields `NaN`, which propagates to the profit view
(`:5250`, `:5281`) and the money cycle (`:5094`).

**Critical semantic — `amount` means two different things** depending on which
form created the record:

| Written by | `amount` is | Evidence |
|---|---|---|
| Return Calculator | **sum of `lineTotal` for `expired` lines only** | `:3946` |
| Manual return form | **sum of `lineTotal` for all selected lines**, both dispositions | `:6838-6842`, `:6953` |

So `getTotalReturns()` sums a field that means "value written off" in some
records and "value returned" in others. The profit view labels the result
`مرتجعات` (returns) and shows it as a negative (`:5281`). **This is a
canonicalisation decision for B2S, recorded per instruction as a decision and
not as an error.**

**Configurability.** **POLICY** throughout: whether the headline "returns" figure
means goods-returned value or goods-written-off value.

**`:3398-3400`, `:3946`, `:6838-6842`**

---

## 2.12 COGS of goods sold, and per-product COGS

**Expression** (`calcCOGSFromInvoices`, `:4178-4234`):

```
per invoice line:
    month     = invoice.date.slice(0,7)                        (:4181)  → 'YYYY-MM'
    key       = item.productId || item.name                    (:4183)
    rec       = findRecipeForItem(item, recipes)               (:4198)  → fuzzy, §1.2.3
    if rec:
        lineCogs           = calcCOGS(rec).total × item.qty    (:4200)
        total             += lineCogs                          (:4202)
        monthlyCOGS[month]+= lineCogs                          (:4205)
    if not rec:
        contributes ZERO — silently                            (:4199)

per return item:
    rec = findRecipeForItem(item, recipes)                     (:4214)
    if not rec: skip                                           (:4215)
    lineCogs = calcCOGS(rec).total × item.qty                  (:4216)
    total              = max(0, total − lineCogs)              (:4217)
    monthlyCOGS[month] = max(0, monthlyCOGS[month] − lineCogs) (:4230)
```

**Rounding:** **none stated in source.**

**Order of operations.** `calcCOGS(rec)` is called **once per invoice line**
(`:4200`) — for N lines of the same product it recomputes the identical figure N
times from live Component prices. Correctness is unaffected; determinism is not,
if prices change mid-session.

**Edge cases.**
- **No matching Recipe → zero COGS, silently** (`:4199`). A product sold without
  a Recipe appears to have **100 % margin**. The UI hints at this only in the
  per-product table, showing `—` instead of `0 EGP` when a Recipe exists but COGS
  is zero (`:5332`).
- Return COGS reversal is clamped at zero (`:4217`, `:4220`, `:4230`), same
  order-dependence as §2.10.
- **The return COGS reversal does not check `disposition`.** An `expired` return
  — goods destroyed, cost genuinely incurred — reverses its COGS exactly like a
  restocked one. §2.16, §8.13.
- `month` derived by string slice (`:4181`) — a malformed date yields a garbage
  month key with no validation.

**Configurability.**
- `COGS = unit cost × quantity sold` is **INVARIANT**.
- **POLICY:** reversing COGS for *all* returns regardless of disposition.
- **POLICY:** treating an unmatched product as zero-cost rather than as an error.

**`:4178-4234`**

---

## 2.13 Monthly profit

**Expression** (`buildMonthlyProfit`, `:4236-4275`). Four passes over one
`monthly[YYYY-MM]` accumulator initialised to
`{revenue, paid, pending, cogs, opcost, returns}` all zero:

```
PASS 1 — invoices                                              (:4240-4248)
    month = invoice.date.slice(0,7)   ; skip if empty
    t = parseFloat(inv.total) || 0
    revenue += t ;  paid += t  if paid  else  pending += t

PASS 2 — COGS                                                  (:4250-4253)
    monthly[m].cogs = cogsData.monthlyCOGS[m]        ← ASSIGNMENT, not accumulation

PASS 3 — returns                                               (:4255-4266)
    month  = return.date.slice(0,7)
    retRev = Σ getReturnLineTotal(item)  over the return's items
    revenue = max(0, revenue − retRev)
    returns += parseFloat(return.amount) || 0
    paid / pending reduced by retRev per the invoice's status

PASS 4 — operating costs                                       (:4268-4272)
    month    = opcost.date.slice(0,7)
    opcost  += parseFloat(o.amount) || 0

DISPLAY                                                        (:5299)
    netMonth = revenue − cogs − opcost
```

**Rounding:** **none stated in source.**

**Order of operations — the passes are not interchangeable:**
- Pass 2 **assigns** rather than accumulates (`:4252`), so it must run before any
  other writer of `.cogs`. Nothing else writes it, so it holds — but the
  invariant is implicit.
- Pass 3 subtracts return revenue from a month key derived from **the return's
  own date**, while the COGS reversal inside `calcCOGSFromInvoices` uses the same
  return date (`:4229`). Both therefore land in the return's month, not the
  sale's month.
- `revenue` clamps at zero per return (`:4259`); `returns` accumulates unclamped.

**Edge cases.**
- Empty or missing date → the record is **silently dropped from monthly
  reporting entirely** (`:4241`, `:4256`, `:4269`), while still counting in the
  all-time totals of §2.14. Monthly figures need not sum to the headline.
- A return dated in a later month than its invoice reduces **that later month's**
  revenue — which can drive a month negative before clamping, and hides the
  reduction from the month that recognised the sale.
- `netMonth` (`:5299`) subtracts `opcost` **without sign handling**, so a negative
  compensation entry (§1.1.8) *increases* net profit. That is the intended
  behaviour of modelling income as negative cost.
- `returns` is accumulated into the month but **never subtracted** in `netMonth`
  (`:5299`) — it is display-only, because the revenue reduction already happened
  at `:4259`. Double-counting is avoided; the label is simply informational.

**Configurability.**
- Period bucketing is **INVARIANT**; calendar-month bucketing by ISO prefix is
  **POLICY** (a business on 4-4-5 periods or a non-Gregorian fiscal year needs
  different bucketing).
- **POLICY:** returns recognised in the return's month, not the sale's.
- **POLICY:** operating costs expensed to the month of their date with no accrual,
  amortisation or allocation.
- **POLICY:** `net = revenue − cogs − opcost` with no tax, interest or depreciation.

**`:4236-4275`, `:5299`**

---

## 2.14 Gross, net and cash profit (all-time)

**Expression** (`:5262-5270`):

```
totalRevenue = sales.totalRevenue        (:5265)   Σ invoice.total, less returns (§2.9/2.10)
totalPaid    = sales.totalPaid           (:5266)
totalPending = sales.totalPending        (:5267)
totalCOGS    = cogsData.total            (:5264)   §2.12
totalOpCost  = OpCostMgr.getTotal()      (:5251)   Σ opcost.amount, all time (:4031-4033)
totalReturns = ReturnsMgr.getTotalReturns() (:5250)  §2.11

grossProfit = totalRevenue − totalCOGS                    (:5268)
netProfit   = totalRevenue − totalCOGS − totalOpCost      (:5269)
cashProfit  = totalPaid    − totalCOGS − totalOpCost      (:5270)
```

**Rounding:** **none stated in source.** Display via `fmt` at 2 dp.

**Edge cases and stated asymmetries.**
- **`totalOpCost` is all-time and unfiltered**, so `cashProfit` subtracts every
  operating cost ever recorded from only the cash actually collected. It is a
  cumulative-since-inception figure, not a period figure.
- **`cashProfit` mixes bases.** `totalPaid` is cash-basis; `totalCOGS` is
  accrual (cost of everything sold, paid or not); `totalOpCost` is accrual.
  Recorded as a fact — the owner's intent is evidently "what is actually in
  hand after everything I've spent".
- `totalReturns` is displayed (`:5281`) but appears in **none** of the three
  profit expressions, because §2.10 already removed return revenue from
  `totalRevenue`. Correct, and easy to misread.
- `grossProfit` and `cashProfit` are rendered only in a small legend line
  (`:5290`); `netProfit` gets a stat card (`:5282`).

**Configurability.**
- Revenue − cost = profit is **INVARIANT**.
- **POLICY, and central:** the three-way gross / net / cash split itself. The
  owner needs cash profit because customers pay late. Another business might need
  contribution margin or EBITDA instead.
- **POLICY:** operating costs are not period-matched to revenue.

**`:5262-5270`, `:5290`**

---

## 2.15 Margin percentage

**Expression** (`:5223`):

```
margin = sellPrice > 0 ? ((sellPrice − cogsPerUnit) ÷ sellPrice × 100) : null
```

**Rounding:** displayed `toFixed(1)` — **one decimal place** (`:5225`), unlike
every money value's two. The stored value is unrounded.

**Where `sellPrice` comes from** (`:5216-5222`) — a three-step fallback:
1. `recipe.unitPrice` if set (`:5218`).
2. Else **a fuzzy scan of `bb_products`**: take `recipe.name`, split on space,
   take the **first word**, lowercase it, and select the first Product whose
   lowercased `name` contains it (`:5220`).
3. Else `0`.

**Edge cases.** `sellPrice <= 0` → `null` → renders `—` (`:5226`), no error.
Divide-by-zero is guarded. **`cogsPerUnit > sellPrice` yields a negative margin**,
rendered with a `neg` class — loss-making products are surfaced, which is a real
requirement. The step-2 fallback can attach a completely unrelated Product's
price to a Recipe; §8.2.

**Configurability.**
- `(price − cost) ÷ price` is **INVARIANT** as *gross margin percentage*.
- **POLICY:** margin computed on **sale price** (margin) rather than on cost
  (markup). Different businesses quote different one.
- **POLICY:** which price is "the" selling price when a Recipe and a Product
  disagree (`:5216-5222`).

**`:5216-5226`**

---

## 2.16 Component usage — two incompatible derivations

### 2.16.a From invoices (`:4277-4306`)

```
per invoice line:
    rec = findRecipeForItem(item, recipes) ; skip if none        (:4281-4282)
    batchSize = parseInt(rec.batchSize) || 1 ; if <=0 then 1     (:4283-4284)
    ratio     = (parseFloat(item.qty)||0) ÷ batchSize            (:4285)
    for each ingredient:
        key = ingredient.itemType + '|' + ingredient.itemId      (:4287)
        usage[key] += (parseFloat(ingredient.qty)||0) × ratio    (:4288)

per return item:
    same derivation, then
        usage[key] = max(0, usage[key] − ingredient.qty × ratio) (:4301)
```

### 2.16.b From production runs (`:4308-4322`)

```
per run:
    rec = recipes.find(r => r.id === run.recipeId) ; skip if none  (:4311-4312)
    batchSize = parseInt(rec.batchSize) || 1 ; if <=0 then 1       (:4313-4314)
    ratio     = (parseFloat(run.unitsProduced)||0) ÷ batchSize     (:4315)
    usage[key] += (parseFloat(ingredient.qty)||0) × ratio          (:4318)
```

**Rounding:** **none stated in source** in either. `roundQty` is applied only
later, by the ledger (`:4360`).

**The three differences that matter:**

1. **2.16.b re-derives from the *live* Recipe and ignores `run.deductions`
   entirely** (§1.1.6). The immutable snapshot written at production time
   (`:3089-3092`) is never read by any calculation. Editing a Recipe therefore
   rewrites the material consumption of every historical production run.
2. **2.16.b has no return reversal.** Restocked finished goods release no
   Components back when the ledger is in production mode.
3. **2.16.a's return reversal ignores `disposition`** (`:4292-4303`) — an
   `expired` return releases Components back into available usage exactly like a
   restocked one, even though the goods were destroyed. §8.13.

**Configurability.**
- Exploding sold or produced units through a bill of materials is **INVARIANT**.
- **POLICY:** deriving consumption from *sales* rather than from *production*.
  A business that produces to stock must use production; one that produces to
  order can use sales. **The tool's requirement is that both are supported** —
  which is exactly what §2.17 does, badly.
- **POLICY:** whether an expired return releases Components.

**`:4277-4306`, `:4308-4322`**

---

## 2.17 The inventory ledger — stock after every movement

**What it computes.** The authoritative on-hand quantity for every Component.
This is the tool's single answer to "stock after purchase / production / sale /
return", and it is a **full recomputation, not an incremental movement log.**

**Expression** (`refreshInventoryLedger`, `:4341-4371`):

```
invUsed  = calcIngredientUsageFromInvoices(invoices, recipes)     (:4344)   §2.16.a
prodUsed = calcIngredientUsageFromProduction(recipes)             (:4345)   §2.16.b
useInv   = invoices != null && invoices.length > 0                (:4346)

purchased[itemType|itemId] = Σ (parseFloat(purchase.qty) || 0)    (:4348-4351)

per Component of each of the three collections:
    bought  = roundQty(purchased[k] || 0)                          (:4359)
    used    = roundQty( useInv ? (invUsed[k]||0) : (prodUsed[k]||0) )   (:4360)
    balance = roundQty(bought − used)                              (:4361)

    if |balance − item.currentStock| > 0.0001:                     (:4363)
        item.currentStock = balance          ← OVERWRITE           (:4364)
        …and the collection is PERSISTED     ← WRITE-BACK          (:4368)
```

**Rounding:** `roundQty` (6 dp, integer snap) applied to `bought`, `used` and
`balance` **independently** — so `balance` is the rounded difference of two
rounded values, which can differ from the rounded true difference in the sixth
decimal place. Write-back gated by epsilon `0.0001`.

**Order of operations — critical.** `bought` and `used` are each rounded before
subtraction (`:4359-4361`). This is the only place in the tool where quantities
are rounded at all, and it is the reason integer stock stays integer.

**Stock after each movement type, as this ledger models it:**

| Movement | Effect on `balance` | How |
|---|---|---|
| **Purchase** | `+qty` | included in `purchased` (`:4350`) |
| **Opening balance** | `+qty` | it *is* a purchase (`:6079-6083`) |
| **Stocktake correction** | `±delta` | it *is* a purchase, possibly negative (`:4424-4435`) |
| **Sale** | `−(recipe explosion)` | via `invUsed` (`:4285-4288`), **only when `useInv`** |
| **Production** | `−(recipe explosion)` | via `prodUsed` (`:4315-4318`), **only when `!useInv`** |
| **Return — restock** | `+(recipe explosion)` | via `:4301`, **only when `useInv`** |
| **Return — expired** | `+(recipe explosion)` | **identical to restock** — `:4292-4303` never reads `disposition`. §8.13 |

**Edge cases and structural facts.**
- **`useInv` is exclusive, not additive** (`:4346`, `:4360`). The moment a single
  invoice exists, **all production-run consumption stops counting**. A business
  that both produces to stock and sells will see its Component stock jump the day
  its first invoice appears. This is the tool's largest single behavioural cliff.
- Only Components present in the **live** collections are iterated (`:4354-4357`);
  purchases of deleted Components are silently excluded (§1.2.6).
- **The ledger writes back and persists** (`:4364-4368`), destroying any manual
  edit. That is why `addStockAdjustmentPurchase` exists (§1.3.3).
- Negative balances are permitted and preserved — they are the tool's oversold
  signal (`:5896-5900` renders a deficit block).
- Finished goods are **not** in this ledger at all; they are computed separately
  in §2.18.

**Configurability.**
- `on-hand = received − consumed` is **INVARIANT**.
- **POLICY, and the most important one here:** the invoices-XOR-production source
  choice. B2S must decide whether consumption is evidenced by sales, by
  production, or by both.
- **POLICY:** expired returns releasing Components.
- **POLICY:** allowing negative on-hand rather than blocking the movement.
- **POLICY:** full recomputation versus an append-only movement log. The owner's
  expectation is that stock is always a *derived* figure that self-corrects.

**`:4341-4371`**, single-item variant `:4388-4407`

---

## 2.18 Finished-goods on-hand and stock value

**Expression** (`buildProductSummary`, `:4133-4176`):

```
soldNet   = sales.byProduct[pid].qty                     (:4144)   already net of returns, §2.10
retAll    = ded.byProduct[pid].qty                       (:4145)   ALL returns, both dispositions
soldGross = soldNet + retAll                             (:4146)
produced  = prod.byProduct[pid]                          (:4147)   Σ run.unitsProduced, §2.19
retQty    = returned[pid]                                (:4148)   RESTOCK-ONLY returns (:3376-3387)

onHand     = produced − soldGross + retQty               (:4149)
gap        = max(0, soldGross − produced)                (:4155)
cogsPerUnit= calcCOGS(rec).total                         (:4150)
stockValue = max(0, onHand) × cogsPerUnit                (:4157)
```

**Rounding:** **none stated in source** for any term, including `stockValue`.

**Order of operations.** `soldNet` is re-grossed by adding all returns back
(`:4146`), then only restocked returns are added to on-hand (`:4148`). The net
effect is the correct one: expired returns reduce sellable stock, restocked ones
do not. **This is the one place in the tool where disposition is honoured
correctly** — §2.12 and §2.17 both ignore it.

**Edge cases.**
- `onHand` may be negative (sold more than produced) — `gap` surfaces it and
  `stockValue` clamps to zero (`:4157`), so a negative on-hand contributes no
  negative value here.
- Products sold with **no Recipe** get a synthetic row with `cogsPerUnit: 0`,
  `stockValue: 0`, `onHand: −sold`, `hasRecipe: false` (`:4167-4171`), rendered
  with a `⚠ بلا وصفة` warning (`:5931`). Keys beginning `name:` are skipped
  (`:4163`), so name-keyed sales never produce a row.
- One Recipe per `productId` — later duplicates are skipped via `seen` (`:4141`).

**Configurability.**
- The identity is **INVARIANT**.
- **POLICY:** valuing finished goods at **COGS** rather than at sale price or
  lower-of-cost-and-net-realisable-value.
- **POLICY:** clamping value at zero for negative on-hand.
- **POLICY:** honouring disposition here but not in COGS (§2.12) — B2S must pick
  one rule and apply it everywhere.

**`:4133-4176`**

---

## 2.19 Production aggregation

**Expression** (`:4121-4131`):

```
byRecipe[run.recipeId]  += parseFloat(run.unitsProduced) || 0     (:4124)
byProduct[rec.productId] += byRecipe[rec.id] || 0                 (:4128)
```

**Rounding:** **none stated in source.**

**Edge cases.** Recipes with no `productId` are skipped (`:4127`), so their
production is invisible to the product summary. Two Recipes sharing a
`productId` **accumulate correctly** here (`+=` at `:4128`) — unlike §2.18, which
takes only the first (`:4141`). **The two disagree by construction.**

**`:4121-4131`**

---

## 2.20 Raw-Component stock value — computed twice

### 2.20.a Dashboard (`:5137`)

```
totalValue = Σ over all Components of  (currentStock || 0) × (costPerUnit || 0)
```

Reads the **stored** `currentStock`. **No clamping** — a negative balance
*reduces* total inventory value.

### 2.20.b Stock report (`:5941-5950`)

```
qty = getDisplayStock(bbKey, item.id, item)            (:5942)   ledger balance if available
val = max(0, qty) × (costPerUnit || 0)                 (:5943)
```

Reads the **ledger** balance and **clamps at zero** (`:5943`, and again in
`fmtStockVal` `:1646-1650`, which returns `'—'` for `qty <= 0`).

**The two totals disagree whenever any Component is oversold**, and they can also
disagree simply because the dashboard reads a stored value that the ledger has
not yet overwritten. §1.3.9, §8.10.

**Rounding:** neither rounds the product. `fmtStockVal` applies `roundQty` to the
quantity before multiplying (`:1647`); `:5943` does not.

**Configurability.** `Σ qty × unit cost` is **INVARIANT**. **POLICY:** the
valuation basis (this tool uses current cost, consistent with §2.4's last-price
rule) and the treatment of negative balances.

**`:5137`, `:5941-5950`, `:1646-1650`**

---

## 2.21 Low-stock threshold

**Expression** (`stockStatus`, `:2629-2639`):

```
if minStock is falsy or <= 0:                       (:2630)
      currentStock < 0   → 'crit'                   (:2631)
      currentStock <= 0  → 'low'                    (:2632)
      otherwise          → 'ok'                     (:2633)
else:
      currentStock < 0                   → 'crit'   (:2635)
      currentStock <= 0                  → 'crit'   (:2636)
      currentStock < minStock × 0.5      → 'crit'   (:2637)
      currentStock < minStock            → 'low'    (:2637)
      otherwise                          → 'ok'     (:2638)
```

**Rounding:** none — direct comparison of stored doubles, **no epsilon**. A
balance of `4.999999999` against a threshold of `5` reads as low.

**Order of operations.** The zero checks precede the threshold checks, so a
Component at exactly zero is always `'crit'` when a threshold is set but only
`'low'` when none is.

**Edge cases.** `minStock` of `0` disables the threshold and changes the meaning
of zero stock from `crit` to `low` — the same physical state reported at two
severities depending on configuration. Reads the **stored** `currentStock`, so
alert severity depends on whether the ledger has run.

**Configurability.**
- Having a reorder threshold is **INVARIANT**.
- **The `× 0.5` critical multiplier is hardcoded POLICY** (`:2637`). It is the
  only reorder policy parameter in the tool and it is not configurable.
- **POLICY:** the threshold being an absolute quantity rather than days-of-cover
  or a reorder point derived from lead time and consumption rate.
- **POLICY:** zero stock being `crit` in one branch and `low` in the other.

**`:2629-2639`**

---

## 2.22 Operating-cost total and allocation

**Expression** (`:4031-4033`):

```
total = Σ (opcost.amount || 0)   over all records, all time
```

**Allocation: none.** Operating costs are never apportioned to a product, a
Recipe, a unit or a period other than by their own `date` (§2.13 pass 4). They
enter profit only as an undifferentiated monthly or all-time subtraction.

**Rounding:** **none stated in source.**

**Edge cases.** Negative amounts (compensation, §1.1.8) reduce the total, so
"total operating costs" can be lowered by recording income. Filtered views
recompute the same sum over a date-and-category subset (`:2041`).

**Configurability.**
- Overhead existing is **INVARIANT**.
- **Allocation is PURE POLICY and this tool's policy is "do not allocate".**
  Another business would allocate by revenue share, unit volume, machine hours or
  direct attribution — and that choice changes every per-product profit figure.
  This is the clearest example in the file of a policy B2S must expose.
- **POLICY:** income modelled as a negative cost.

**`:4031-4033`, `:4268-4272`**

---

## 2.23 Money cycle

**Expression** (`buildMoneyCycleSummary`, `:5087-5097`):

```
purchases  = Σ (parseFloat(purchase.totalCost) || 0)   over ALL purchases   (:5088)
opCosts    = OpCostMgr.getTotal()                                            (:5089)
totalSpent = purchases + opCosts                                             (:5090)
paid       = sales.totalPaid                                                 (:5092)
pending    = sales.totalPending                                              (:5093)
returns    = ReturnsMgr.getTotalReturns()                                    (:5094)
netFlow    = paid − totalSpent                                               (:5095)
```

**Rounding:** **none stated in source.**

**Edge cases — the headline number is not cash.** `purchases` sums `totalCost`
across **all four purchase event types** (§1.1.5): real procurement, opening
balances, stocktake corrections and migration seeds. Opening balances and
corrections moved no money. Corrections carry `costPerUnit: 0` so contribute
nothing, but **opening balances carry a real cost and inflate "money spent"**
by the full value of stock that was already owned. `returns` is computed and
displayed (`:5115`) but is **absent from `netFlow`**.

**Configurability.**
- Cash in minus cash out is **INVARIANT**.
- **POLICY:** which movements count as cash. This is precisely the requirement
  §1.1.5 identifies — B2S needs a movement type to make this calculable.
- **POLICY:** excluding pending receivables from `netFlow` (correct for a cash
  view, and the owner's evident intent).

**`:5087-5097`**

---

## 2.24 Return calculator — remaining quantity

**What it computes.** When a Buyer returns goods that were partly redirected to
other Buyers, how much is actually coming back.

**Expression** (`:3770-3795`):

```
returnAgg = aggregateItems(returnInvoice.items)                (:3775)
outMap    = collectOutQtyMap()                                 (:3776)   Σ per product across
                                                                          selected out-invoices
per aggregated row:
    outQty = outMap[row.key] || 0                              (:3779)
    remain = max(0, row.qty − outQty)                          (:3780)
    expiredQty = 0                                             (:3789)
    restockQty = remain                                        (:3790)   ← DEFAULT: all restock
```

**Split adjustment** (`onSplitChange`, `:3840-3865`) — the two inputs are locked
complements:

```
edit "expired": expiredQty = max(0, input) ; restockQty = max(0, remain − expiredQty)   (:3850-3851)
edit "restock": restockQty = max(0, input) ; expiredQty = max(0, remain − restockQty)   (:3846-3847)
```

**Money** (`:3797-3799`): `expiredLineTotal = expiredQty × price` — **only the
expired portion carries a money value.**

**Validation** (`:3887-3899`): rejects when `expiredQty + restockQty > remain + 0.0001`.
Because the two inputs are locked complements, the sum can only exceed `remain`
transiently; the guard exists because the inputs are independently editable.

**Rounding:** **none stated in source** on any quantity or money value.
`fmtQty` at display only.

**Edge cases.** `outQty` exceeding the returned quantity clamps `remain` to zero
(`:3780`). Rows with `remain = 0` produce no log items (`:3884`). Out-allocation
quantities default to the full line quantity when the input is blank (`:3738`,
`:3762`).

**Configurability.**
- "Returned minus redirected equals coming back" is **INVARIANT** for a business
  that redirects goods.
- **POLICY, and unusual:** that redirection to another Buyer is part of the return
  workflow at all. Most businesses would model that as a separate sale.
- **POLICY:** defaulting the whole remainder to restock (`:3790`).
- **POLICY:** valuing only the expired portion (`:3946`).

**`:3729-3768`, `:3770-3799`, `:3840-3865`, `:3887-3899`**

---

## 2.25 Colour contrast (non-money, included for completeness)

WCAG relative luminance and contrast ratio at `:1666-1692`, used to pick accent
and emphasis colours that remain legible on a user-chosen background. Standard
sRGB linearisation, `(L1+0.05)/(L2+0.05)`. **INVARIANT** (it is a published
standard). The **target ratio** and the candidate palette are **POLICY**.

**`:1666-1692`**

---

## 2.26 Summary — calculations with no stated rounding rule

Per the instruction that a missing rounding rule is an incomplete extraction, the
following is the explicit list. **In every case the source states none**, and
display-time `fmt`/`fmtQty` is the only rounding that occurs:

§2.1 line cost · §2.2 batch cost and COGS per unit · §2.3 all `calcPrep` terms ·
§2.5 purchase total (quantity rounded, product not) · §2.7 invoice line revenue ·
§2.9 all sales aggregates · §2.10 all return deductions · §2.11 total returns ·
§2.12 COGS and monthly COGS · §2.13 all monthly figures · §2.14 gross/net/cash
profit · §2.15 margin (displayed at 1 dp, stored raw) · §2.16 both usage
derivations · §2.18 finished-goods on-hand and stock value · §2.19 production
aggregation · §2.20 both stock-value totals · §2.22 operating-cost total ·
§2.23 money cycle · §2.24 all calculator quantities and money.

**The only value-level rounding in the entire tool is `roundQty`** (`:1633-1640`),
applied to quantities at `:2654-2655`, `:3008`, `:3198`, `:4359-4361`, `:4394`,
`:4405-4406`. **No money value is ever rounded before storage or before
comparison.**

> **Requirement B2S inherits:** the owner has never needed a stated money-rounding
> rule because nothing in this tool compares two independently-computed money
> values for equality. CALC_SPEC.md must supply one; it cannot be extracted.

---

# PART 3 — WORKFLOWS

## 3.1 Connect the shared data folder

1. User clicks connect → `connectFolder()` (`:6900-6919`).
2. `FileStore.requestAccess()` then `FileStore.connect()` (`:6904-6905`) → File System Access API picker (`:1223`), `startIn:'documents'`.
3. Handle persisted to IndexedDB (`:1193`).
4. `FileStore.loadAll()` (`:6908`) — pulls every `READ_KEYS` and `WRITE_KEYS` file into `localStorage` (`:1247-1252`).
5. `FileStore.syncAllToFolder()` (`:6909`) — pushes every `WRITE_KEYS` value out.
6. `restoreActiveTheme()` (`:6910`), then `refreshAll()` (`:6911`).

**Entities touched:** every collection.
**Abandonment.** If the user cancels the picker, `requestAccess` fails silently
and the tool continues in `localStorage`-only mode with no warning banner beyond
the status chip. **Step 4 completing but step 5 failing leaves the folder holding
the tool's old data while `localStorage` holds the folder's new data** — the two
diverge silently. There is no transaction and no rollback.
**Order hazard.** `loadAll` runs before `syncAllToFolder`, so a fresh profile
pulls first and then writes back — but if `loadAll` partially fails (per-key
`try/catch` at `:1249`), the subsequent push **writes the tool's empty arrays over
the folder's real data** for exactly those keys. This is the mechanism by which
`bb_label_templates` (§1.1.0) can be destroyed.

---

## 3.2 Purchase (stock in)

1. Open modal → `openPurchaseModal()`; item `<select>` built at `:6478-6479` as a
   pipe-joined composite `type|id|name|unit|costPerUnit`.
2. `logPurchase()` (`:6865-6883`) validates: item chosen (`:6866`), the composite
   splits into ≥5 parts (`:6867`), `qty > 0` (`:6869`), `cost` numeric and `>= 0`
   (`:6870`).
3. `PurchaseMgr.add(data)` (`:6878`) → `makeRecord` (`:3001-3013`) → `unshift`,
   `saveAll` (`:3018-3019`).
4. **`syncItemCost(pur)` (`:3020`) overwrites `Component.costPerUnit`.**
5. `refreshAfterPurchaseChange()` (`:6844-6850`) → `reconcileInventoryStock()` →
   full ledger recomputation and write-back → re-render.

**State transitions.** `bb_purchases` gains a record; `Component.costPerUnit`
changes; every `Component.currentStock` is recomputed; every COGS, margin and
profit figure in the app silently restates (§2.4).

**Abandonment.** Closing the modal mid-entry leaves nothing behind — the form is
transient. **But step 3 and step 4 are not atomic:** the purchase is saved before
the cost sync, and the ledger refresh (step 5) is a separate async chain
(`:6845`). A failure between them leaves a saved purchase with a stale Component
cost and a stale ledger until the next refresh.

**Edit path.** `editPurchase` → `PurchaseMgr.update` (`:3024-3033`) rebuilds the
record via `makeRecord` and **re-runs `syncItemCost`** (`:3031`), so editing a
historical purchase's price rewrites the Component's *current* cost.

---

## 3.3 Production (manufacture)

1. Choose Recipe and units → `logProduction()` (`:6885-6895`).
2. Validates Recipe chosen (`:6886`) and `parseInt(units) > 0` (`:6887`).
   **`parseInt` — fractional production is rejected at the UI**, though
   `addDelta` accepts floats (`:3081`).
3. `ProductionMgr.add(recId, units, notes, date)` (`:6888`) → `addDelta`
   (`:3078-3099`): resolves the Recipe, computes `ratio = units ÷ batchSize`
   (`:3084`), builds `deductions[]` with a **name snapshot** (`:3086-3093`),
   writes the run.
4. Re-render (`:6891-6893`).

**State transitions.** `bb_production` gains a record. **`Component.currentStock`
is NOT decremented here** — no `adjustStock` call exists in this path. Stock
changes only when the ledger next runs, and then only via §2.16.b, and **only if
no invoices exist** (§2.17).

**Abandonment.** `addDelta` returns `null` if the Recipe is missing (`:3080`) or
`|units| < 0.0001` (`:3082`); `logProduction` toasts and stops (`:6889`). Nothing
partial is written — `unshift`/`saveAll` is the last step.

**Structural note.** `logProduction` does **not** call
`reconcileInventoryStock()`, unlike the purchase path (§3.2 step 5). The
dashboard re-renders from stale stored values. This is why production and
purchase produce different apparent stock behaviour.

---

## 3.4 Sale

**There is no sale workflow in this tool.** Sales arrive as `bb_inv2` /
`bb_invoices` written by the invoice tool (§1.1.13). This tool only reads,
aggregates and marks paid/pending (`PaymentMgr.toggle`, `:3139-3142`).

**Entities touched by the one write:** `bb_invoice_payments` gains or updates
`{status, updatedAt}` for the invoice id (`:3135`).

**Requirement recorded:** the owner expects the sale to originate elsewhere and
its *consequences* — stock depletion, COGS, profit — to appear here automatically.

---

## 3.5 Return — manual path

1. Open the returns modal; pick Buyer, then invoice (`loadReturnModalData`,
   `onRetCustomerChange`, `onRetInvoiceChange`). Last Buyer remembered in
   `bb_ret_last_customer` (`:6586`, `:6635`).
2. Per line: a checkbox and a disposition `<select>` of `📦 مخزون` / `🗑 تالف`
   (`:3929-3932`).
3. `updateRetAmount()` (`:6838-6842`) sets the amount field to
   **`Σ lineTotal` over all checked lines, both dispositions.**
4. `logReturn()` (`:6947-6975`) validates: invoice chosen (`:6948`), cached
   invoice found (`:6949`), ≥1 line selected (`:6952`), **`amount > 0` (`:6953`)**.
5. `ReturnsMgr.add({…})` (`:6955-6966`) — **`outAllocations` is not passed**, so
   it defaults to `[]` (`:3271`).
6. `disposition` roll-up computed from the item dispositions (`:3293-3298`).
7. `refreshAfterReturnLogged()` (`:6938-6944`) → full ledger refresh, invoices
   view, profit view, and conditionally the stock and prep views.

**Abandonment.** Everything before step 5 is transient DOM state. The amount field
is user-editable after step 3, so **the stored `amount` need not equal the sum of
the stored `items`** — nothing reconciles them.

**Blocking edge case.** A return consisting entirely of restocked goods still
requires `amount > 0` (`:6953`). Since step 3 includes restocked lines in the
amount, this passes — but it means a *zero-value* return cannot be logged at all.

---

## 3.6 Return — calculator path

1. Pick the returning Buyer and the returned invoice (`:3771-3774`).
2. Select "out" invoices — other invoices that received some of the same goods —
   with per-line checkboxes and editable quantities (`:3721-3727`).
3. `calculate()` (`:3770-3795`) → `remain = max(0, returnedQty − outQty)` per
   product; defaults **all of `remain` to restock** (`:3790`).
4. User splits expired/restock per row; the two inputs are locked complements
   (`:3840-3865`).
5. Either:
   - **`applyToModal()`** (`:3901-3938`) — opens the manual modal pre-filled, so
     the return is then saved by §3.5's path **and loses `outAllocations`
     entirely** (§3.5 step 5); or
   - **`logFromCalc()`** (`:3940-3970`) — writes directly with
     `outAllocations: collectOutAllocations()` (`:3947`, `:3959`) and
     **`amount = Σ lineTotal of expired lines only`** (`:3946`).

**The two exits produce different records from identical user input.** One
carries allocations and an expired-only amount; the other carries no allocations
and a both-dispositions amount. §4.6.

**Fixed values on the calculator path:** `reason: 'حساب مرتجع'` (`:3955`),
`notes: 'حاسبة: مرتجع − مسلّم لآخرين · N سطر'` (`:3956`), `fullReturn: false`
(`:3957`) — **hardcoded, so a calculator-logged return can never be marked full.**

**Abandonment.** `_results` is module state (`:3777`); navigating away discards
it. After a successful log it is cleared (`:3967`). If `applyToModal` is used and
the user then abandons the manual modal, **the calculator's `_results` survive**
and a later `logFromCalc` would write a return the user thought they had
abandoned.

---

## 3.7 Stock adjustment

Two entry points, both converging on the same synthetic-purchase mechanism.

**Raw Components** — inline input in the stock report (`:4415-4417`):
`saveInlineStock` → `applyInventoryTruthStock(bbKey, itemId, truthStock)`
(`:4438-…`) → `addStockAdjustmentPurchase(…)` (`:4424-4435`) writing
`{qty: delta, costPerUnit: <existing>, supplier: 'تسوية جرد', notes: 'تعديل مخزون يدوي: X → Y'}`.

**Finished goods** — `productStockInput` (`:4419-4421`) → `saveProductStock`,
which adjusts by producing or un-producing through `ProductionMgr.addDelta`
(hence `isAdjustment`, §1.1.6).

**State transitions.** `bb_purchases` gains a zero-cost record with a possibly
negative quantity; the ledger recomputes; `Component.currentStock` reaches the
requested value **by construction rather than by assignment**.

**Guard.** `|delta| < 0.0001` → no record written, returns `null` (`:4425`).

**Abandonment.** Single synchronous write; nothing partial. **But the `notes`
explaining the adjustment are discarded by `makeRecord`** (§1.1.5), so the
adjustment is indistinguishable from a real purchase except by its Arabic
`supplier` sentinel.

---

## 3.8 Production request (prep → pending invoice)

1. Build a plan: add Recipes and quantities to `_prepLines`, persisted to
   `bb_prep_lines` (`:2387`, `:2394`) — **this survives a reload**, so an
   abandoned plan is still there next session.
2. `calcPrepAggregate` (`:2894-…`) computes needs, shortfalls and cost, honouring
   the `all` / `net` production mode (`:2896`) and on-hand finished goods.
3. `PendingInvoiceMgr.addFromPrep(prepLines, meta)` (`:3205-3228`) writes the
   record with `status: 'pending'`, Buyer fields empty (§1.1.10).
4. The invoice tool is expected to consume it and call `markCompleted`
   (`:3240-3242`).

**Abandonment.** Step 1 persists. Step 3 is atomic. **Step 4 has no caller in
this file** — a pending request may remain `'pending'` forever, and nothing in
this tool detects a request that was fulfilled elsewhere. There is no expiry, no
reconciliation and no duplicate detection.

---

## 3.9 Operating-cost entry

1. `openOpCostModal(editId)` (`:6988-…`) — `clearOpCostForm` (`:6980-6986`) sets
   category to `'أخرى'` and date to today.
2. Category change → `onOpCostCategoryChange()` (`:2017-2026`) shows a hint and
   changes the placeholder to `-500.00` for `'تعويض'`.
3. Save → `OpCostMgr.add` / `update` (`:3998-4024`).

**State transitions.** `bb_operation_costs` gains or replaces a record; every
profit figure changes.

**Abandonment.** Transient form; nothing partial.

**Note.** `update` (`:4012-4024`) **replaces the record wholesale** rather than
merging, so any field absent from the form is lost. The field set is closed, so
in practice nothing is lost — but the pattern differs from every other manager,
which use `Object.assign` merges.

---

## 3.10 Reporting

Read-only aggregation, no state change. Entry points: `renderDashboard`
(`:5120-5176`), `renderProfit` (`:5242-5344`), `renderStockValue`
(`:5860-5958`), `renderCOGSTable` (`:5200-5237`), the invoices view
(`:4550-…`), and the print paths (§6.8).

**Every report begins by re-reading invoices** through a different loader with a
different fallback chain (§1.1.13), and several trigger a full ledger
recomputation as a side effect (`:1748`, `:5719`, `:5854`, `:6922`). **A report can therefore change
stored data** — `refreshInventoryLedger` writes back (`:4364-4368`). Reporting is
not side-effect free.

---

## 3.11 Legacy sticker migration

`needsSplit()` (`:2786-2788`) tests whether any of three hardcoded record ids
(`:2704-2708`) is present. If so, `splitSharedStickersToProducts` (`:6180-6220`)
converts each shared sticker into per-product records, writing `templateKey:
legacyId` (`:6186`) and creating seed purchases (`:6200-6211`).

**Abandonment.** The migration writes stickers and purchases in sequence with no
transaction. Interruption leaves a partially split catalogue whose `needsSplit()`
may now return `false`, **so the migration will not resume.**

---

# PART 4 — RETURNS, IN FULL

Treating `docs/requirements/RETURNS_REQUIREMENTS.md` as a **requirements
statement**, not a claim to verify. Where code and that document differ, both are
recorded and the difference is marked a decision for the new design.

## 4.1 The Return entity as stored

`ReturnsMgr.add` (`:3257-3302`). Every field is normalised on write, so records
created by *this* version always have every key present.

| Field | Type | Normalisation | Evidence |
|---|---|---|---|
| `id` | string | `genId('ret')` | `:3260` |
| `date` | ISO date | `data.date \|\| todayISO()` | `:3261` |
| `invoiceId` | string | `\|\| ''` — **may be empty** | `:3262` |
| `invoiceNumber` | string | `\|\| ''` denormalised snapshot | `:3263` |
| `customerName` | string | `\|\| ''` denormalised snapshot (Buyer) | `:3264` |
| `customerId` | string | `\|\| ''` (Buyer) | `:3265` |
| `amount` | number | `parseFloat \|\| 0` — **two meanings**, §4.6 | `:3266` |
| `reason` | string | `\|\| ''` free text | `:3267` |
| `notes` | string | `\|\| ''` free text | `:3268` |
| `disposition` | `'restock'` \| `'expired'` \| `'mixed'` | **recomputed from items, overwriting any supplied value** (`:3293-3298`) | `:3269`, `:3296-3298` |
| `fullReturn` | boolean | `!!data.fullReturn` | `:3270` |
| `outAllocations` | array | `(data.outAllocations \|\| []).map(…)` — **always present on new records** | `:3271-3281` |
| `items` | array | `(data.items \|\| []).map(…)` | `:3282-3291` |

Insertion is `unshift` (`:3299`) — **newest first**, and all "recent" views take
`slice(0, N)` off the front (`:3404`, `:5318`).

## 4.2 Per-line item structure

`items[]` element (`:3283-3290`):

| Field | Type | Normalisation |
|---|---|---|
| `productId` | string | `\|\| ''` |
| `name` | string | `\|\| ''` |
| `qty` | number | `parseFloat \|\| 0` |
| `price` | number | `parseFloat \|\| 0` |
| `lineTotal` | number | `parseFloat \|\| 0` — **stored, and authoritative when `> 0`** |
| `disposition` | `'expired'` \| `'restock'` | **`it.disposition === 'expired' ? 'expired' : 'restock'`** — anything not exactly `'expired'` becomes `'restock'` (`:3289`) |

**The item-level default is `restock`; the record-level default at `:3269` is
`expired`.** Opposite defaults for the same concept at two levels.

`getReturnLineTotal(it)` (`:3304-3308`) resolves the value: **stored `lineTotal`
if it parses and is `> 0`, else `qty × price`.** A stored `lineTotal` of exactly
zero falls through to recomputation.

## 4.3 Dispositions — distinct effects

| | `restock` (`📦 مخزون`) | `expired` (`🗑 تالف`) |
|---|---|---|
| **Finished-goods stock** (§2.18) | **+qty** — added back via `aggregateReturnedByProduct` (`:3376-3387`, filtered to restock at `:3381`) then `:4148-4149` | **no add-back** — reduces sellable stock, correctly |
| **Component stock** (§2.16.a) | **+recipe explosion** (`:4301`) | **+recipe explosion — IDENTICAL** (`:4292-4303` never reads `disposition`) |
| **Revenue** (§2.10) | **−`getReturnLineTotal`** (`:4076`, `:4081`) | **−`getReturnLineTotal` — identical** |
| **COGS** (§2.12) | **−`cogsPerUnit × qty`** (`:4217`) | **−`cogsPerUnit × qty` — identical** (`:4216-4217`) |
| **`return.amount`** | included when logged manually (`:6840`); **excluded** when logged from the calculator (`:3946`) | included on both paths |
| **UI** | `📦 مخزون` (`:3930`) | `🗑 تالف`, CSS class `.ret-disp-expired` (`:354`, `:3931`) |

**Only §2.18 honours the distinction.** Component stock, revenue and COGS treat
the two identically. Recorded as a decision for the new design, per instruction:
**B2S must decide whether a write-off reverses COGS and releases Components.**

## 4.4 `outAllocations`

**What it is.** A record of goods that came back from one Buyer and were
**redirected to other Buyers' invoices** instead of returning to stock.

**Element shape** (`:3272-3280`):

| Field | Type | Meaning |
|---|---|---|
| `productId` | string | which product |
| `name` | string | display snapshot |
| `qty` | number | how many went out |
| `toCustomerId` | string | receiving Buyer id |
| `toCustomerName` | string | receiving Buyer name snapshot |
| `toInvoiceId` | string | receiving invoice id |
| `toInvoiceNumber` | string | receiving invoice number snapshot |

**What it allocates.** Quantity of a returned product against a *different*
invoice. Built by `collectOutAllocations()` (`:3729-3751`) from checked
out-invoice lines, quantity taken from the editable input or defaulting to the
whole line (`:3738`).

**What consumes it.** **Nothing in this file consumes `outAllocations` after it
is written.** Grep of all reads shows it appears only in `ReturnsMgr.add`'s
normaliser (`:3271`). It is written, mirrored to the shared folder, and never
read back by any calculation, renderer or report in this tool.

Its *effect* is applied **before** it is stored: `collectOutQtyMap()`
(`:3753-3768`) — a parallel function reading the same DOM — reduces `remain`
(`:3779-3780`), and only the reduced `remain` reaches `items[]`. So
`outAllocations` is a **provenance record of a deduction already baked into the
quantities**, not an input to anything.

> **Requirement B2S inherits:** the owner needs to know where redirected goods
> went. **Decision for B2S:** whether redirection is part of a Return at all, or
> a separate movement. §2.24.

## 4.5 CF-04 EVIDENCE — the two record shapes

**Shape A — with `outAllocations`.** Written by `logFromCalc` (`:3948-3960`).
`outAllocations` is a non-empty array of the §4.4 shape.

**Shape B — without.** Two distinct sub-cases, and they are **not the same**:

- **B1 — key present, empty array.** Any return written by the *current* code
  through the manual path (`:6955-6966`) omits `outAllocations` from the argument,
  so the normaliser produces `[]` (`:3271`). The key exists.
- **B2 — key absent entirely.** Records written **before the Return Calculator
  existed** have no `outAllocations` property at all. This is CF-04's case.

**What each requires of a renderer.**

| Shape | Safe access | Unsafe access |
|---|---|---|
| A | `ret.outAllocations.forEach(…)` | — |
| B1 | `ret.outAllocations.forEach(…)` — works, iterates zero times | — |
| B2 | **must guard**: `(ret.outAllocations \|\| []).forEach(…)` | `ret.outAllocations.forEach(…)` throws `TypeError` |

A renderer must **not** distinguish "no allocations" from "allocations unknown" by
truthiness alone: B1 and B2 both look empty, but B1 means *the user redirected
nothing* while B2 means *the concept did not exist when this was recorded*. Only
`'outAllocations' in ret` separates them.

**The same guard problem applies to `items[]`.** `ReturnsMgr.add` guarantees it
(`:3282`), but every consumer still writes `(ret.items||[])` (`:3325`, `:3379`,
`:4070`, `:4211`, `:4258`) — evidence that pre-normalisation records without
`items` are also expected to exist in the wild.

**Third latent shape.** Records predating the per-item disposition field would
have `items[].disposition` undefined. Consumers handle this with
`it.disposition || ret.disposition || 'expired'` (`:3332`, `:3380`) — a
**three-level fallback** that is direct evidence of a third historical shape.

## 4.6 The `amount` divergence — code versus `RETURNS_REQUIREMENTS.md`

| Path | `amount` = | Evidence |
|---|---|---|
| Calculator (`logFromCalc`) | `Σ lineTotal` of **`expired` lines only** | `:3946` |
| Manual form (`logReturn`) | `Σ lineTotal` of **all checked lines**, both dispositions, and **user-editable afterwards** | `:6840`, `:6953` |

`RETURNS_REQUIREMENTS.md` describes `bb_returns.json` as recording the return
with its amount, without disambiguating. **Both are recorded here; neither is
called an error.** The field is summed indiscriminately by `getTotalReturns()`
(§2.11) and displayed as the headline returns figure.

**Decision for B2S:** whether the Return's money value means *goods returned* or
*value written off*. They are different numbers and the tool stores both in one
field.

## 4.7 The three-way invoice grouping — derived, not stored

`classifyInvoices(invoices)` (`:3363-3374`) computes it **on every call**:

```
ded = aggregateReturnedDeductions()              (:3364)   full scan of bb_returns
per invoice:
    info = ded.byInvoice[inv.id]
    no info                         → noReturn   (:3368)
    isInvoiceFullyReturned(inv,info)→ full       (:3370)
    otherwise                       → partial    (:3371)
```

`isInvoiceFullyReturned` (`:3343-3348`):

```
if info.fullReturn (any record flagged it)          → true      (:3345)
invQty = Σ invoice.items[].qty                                   (:3346)
return info.totalQty >= invQty − 0.0001                          (:3347)
```

**Nothing is stored.** No status field, no flag on the invoice. The grouping is
recomputed from `bb_returns` every time, which means it self-corrects when a
return is deleted — and also means it is **O(all returns) per render**.

**Two independent routes to "full":** an explicit user tick
(`fullReturn`, `:6954`) or a quantity threshold (`:3347`). The quantity route
compares **summed quantities across all products**, not per-product — so
returning 10 of product A from an invoice of 5 A and 5 B classifies as fully
returned.

**Returns with an empty `invoiceId` are excluded** from grouping entirely
(`:3317`), so they can never make an invoice full or partial, while still
reducing monthly revenue (§2.13).

## 4.8 How a partially-returned invoice is represented

There is no representation on the invoice — the invoice is untouched. A partial
return exists as:

1. One or more `bb_returns` records carrying `invoiceId` (`:3262`).
2. A derived `byInvoice[invoiceId]` aggregate (`:3318-3320`) holding
   `{records[], totalQty, totalRevenue, totalExpiredAmt, fullReturn}`.
3. Membership of the `partial` bucket (`:3371`), used for UI grouping.
4. Reduced figures in every aggregate that applies deductions (§2.10, §2.12, §2.13).

`getInvoiceReturnInfo(invoiceId, invoice)` (`:3350-3361`) is the single read
accessor; it returns `null` when the invoice has no returns (`:3353`), so callers
must handle `null` rather than an empty aggregate.

## 4.9 Alignment with `RETURNS_REQUIREMENTS.md`

| `RETURNS_REQUIREMENTS.md` states | Code | Verdict |
|---|---|---|
| Returns tab with per-line `📦 مخزون` / `🗑 تالف` | `:3929-3932`, `:790` | **matches** |
| Return Calculator for complex returns | `:3770-3795` | **matches** |
| Three-way invoice grouping | `classifyInvoices` `:3363-3374` | **matches**, and is derived not stored |
| Partial and full return handling | `:3343-3348`, `:3370-3371` | **matches**, with two independent full-return routes |
| Returns affect sales aggregation | `:4066-4087` | **matches** |
| Returns affect COGS | `:4210-4232` | **matches**, but **without disposition distinction** — decision for B2S |
| Returns affect profit | `:4255-4266`, `:5268-5270` | **matches** |
| Returns affect stock value | `:4148-4149` | **matches**, and **does** honour disposition |
| Older records lack `outAllocations` | `:3271` normaliser; consumers use `||[]` throughout | **matches** — CF-04, §4.5 |
| Data saved in `bb_returns.json` | key `bb_returns` (`:3253`), in `WRITE_KEYS` (`:1180`) | **matches** |

**Differences recorded as decisions, not errors:** the `amount` semantics (§4.6);
disposition being honoured in stock value but not in COGS or Component usage
(§4.3); `outAllocations` being written but never read (§4.4).

---

# PART 5 — BATCH AND TRACEABILITY

**The capability is absent. Stated plainly, as instructed: this is a requirement
B2S adds, not a gap in this extraction.**

## 5.1 What was searched

Full-file search for `batch`, `lot`, `expiry`, `expire`, `صلاحية`, `انتهاء`,
`تاريخ الإنتاج`, `serial`, `trace`. Every hit was examined.

## 5.2 What `batch` actually means here

| Occurrence | Meaning |
|---|---|
| `Recipe.batchSize` (`:2826`) | **units produced per batch** — a yield divisor, nothing more |
| `دفعة` in the Recipe form (`:1001`) and cards (`:2362`, `:2381`, `:2504`, `:2947`) | the same yield divisor |
| `calcPrep.batches` (`:2863`) | `unitsNeeded ÷ batchSize` — a **fractional multiplier**, explicitly allowed to be non-integer |
| `forBatch` (`:2868`, `:2880`) | ingredient quantity per batch |

**No identified batch instance is ever created.** `batchSize` is a recipe
attribute; there is no batch record, no batch number, no batch id and nothing to
attach one to.

## 5.3 What `expired` means here

`expired` (`:3269`, `:3289`, `:3298`), `.ret-disp-expired` (`:354`),
`retCalcExpiredSum` (`:814`), `expiredQty` (`:3789`), `expiredLineTotal`
(`:3797`) — **all of these are the return disposition "write off"**. The Arabic
label is `تالف` ("damaged"). **None of them is a date, a shelf life or an expiry
calculation.**

## 5.4 Explicit findings

| Capability B2S requires | Present? | Evidence |
|---|---|---|
| Batch as an entity | **No** | no collection, no factory, no id prefix |
| Batch as an attribute on ProductionRun | **No** | fields are `{id, date, recipeId, recipeName, unitsProduced, notes, deductions, isAdjustment}` (`:3094-3095`) |
| Batch on a Component or purchase | **No** | fields at `:2653-2655`, `:3003-3011` |
| Batch on an InvoiceLine or Return line | **No** | `:3283-3290`; invoice lines are read-only and carry none |
| Expiry or best-before date | **No** | no date field anywhere except `date` (an event date) |
| Shelf life on a Recipe or Product | **No** | Recipe fields at `:2826-2829` |
| Production date | **Partial** | `ProductionRun.date` (`:3094`) exists — the *only* traceability-adjacent datum |
| StockLevel tracked per batch | **No** | stock is one scalar per Component (`:4361`) |
| Batch → shipment resolution | **No** | see §5.5 |
| Batch on a sticker or label | **No** | Sticker fields at `:2727-2730`; no serial, no batch, no print-run record |
| Print/label run record | **No** | `bb_label_open` (`:6048-6053`) is a UI handshake with a `ts`, not a print log |

## 5.5 Why no path could resolve a batch to a shipment

Even ignoring the absence of batch identity, the data model cannot support the
query for three independent reasons:

1. **Component consumption is derived, not recorded.** The ledger recomputes usage
   from *current* Recipes (§2.16); it never reads the one snapshot that exists
   (`run.deductions`, `:3095`). There is no persisted link from a specific
   Component quantity to a specific production event.
2. **There is no link from a production run to an invoice.** `bb_production` has
   no invoice reference and `bb_inv2` has no production reference. Finished goods
   are a single scalar per product (`onHand`, `:4149`); units are fungible.
3. **The sale-to-Recipe link is a runtime string match** (§1.2.3), not a stored
   relationship, so even the product-level association is not durable.

A recall would have to be answered by "every invoice containing this product",
with no date bounding beyond the invoice date.

## 5.6 Nearest available approximations

Recorded so B2S knows what the owner can do today, not as a substitute:

- `ProductionRun.date` + `unitsProduced` + `recipeName` (`:3094-3095`) gives
  *what was made and when*.
- `PurchaseOrderLine.date` + `supplier` (`:3004`, `:3011`) gives *which supplier
  delivered a Component around a date* — the closest thing to an upstream trace,
  and it is free text.
- Invoice `date` and `customerName` give *who received a product and when*.

Joining these is a manual, date-window exercise with no guarantee of correctness.

> **Requirement B2S adds:** Batch as a first-class entity, carried on production,
> on StockMovement, on PackagingTemplate and PrintJob output, and resolvable to
> the invoices that shipped it. Nothing here constrains that design; there is
> nothing to be compatible with.

---

# PART 6 — CONFIGURABLE vs HARDCODED

**Ownership column key.** `BRAND` = brand config (identity, look, document
chrome). `POLICY` = business policy (rules and thresholds that change the
numbers). `CATALOG` = product/reference data the Tenant maintains. `SYSTEM` =
genuine system constant, not Tenant-facing.

## 6.1 Brand identity

| Value | Represents | Owner | Wizard input | Evidence |
|---|---|---|---|---|
| `Balance Bites` | Tenant trading name, page title | BRAND | single-line text, required | `:6` |
| `Balance Bites` | on-screen masthead | BRAND | *(same value)* | `:464` |
| `Stock & Costs Manager` | product sub-title in report headers | BRAND | single-line text | `:5413` |
| `Balance Bites` | invoice document brand | BRAND | *(same value)* | `:4652` |
| `BB` | monogram on the invoice document | BRAND | short text, 1–3 chars | `:4652` |
| `balancebites.com` | website in the document footer | BRAND | URL | `:4653` |
| `Balance Bites Invoice` | print-window `<title>` | BRAND | derived | `:5030` |
| `Balance Bites Report` | report print `<title>` | BRAND | derived | `:5541` |
| `طُبع من نظام المخزون والتكاليف` | report footer provenance line | BRAND | localised text | `:5499` |

**The brand string is written literally at six independent sites.** `:5413`
defines `BRAND`/`SUB` constants used by the report engine, but `:6`, `:464`,
`:4652`, `:5030` and `:5541` each repeat the literal rather than referencing them.

## 6.2 Colour

| Value | Represents | Owner | Wizard input | Evidence |
|---|---|---|---|---|
| **304 hex literals, 51 distinct 6-digit values** | the entire visual system | BRAND | token set | throughout the `<style>` block `:8-460` and injected CSS |
| `#060603` / `#e8dfc8` | app background / foreground | BRAND | colour picker | `:12` |
| `#c9a84c` | the gold accent — the brand's primary colour | BRAND | colour picker | `:19`, and as an `rgba` fallback at `:1663` |
| `#7a6f58` | muted text | BRAND | colour picker | `:20` |
| `rgba(201,168,76,…)` | the same gold, pre-decomposed to RGB at 3 sites | BRAND | derived | `:17`, `:18`, `:23` |
| `Dark Gold`, `Obsidian Blue`, `Forest Night`, `Warm Ivory` | four built-in themes, 7 hex values each (bg, gold, txt, mut, row, tot, grand) | BRAND | seeded preset list | `:1347-1350` |
| `DEFAULT_C` = `{bg:'#0a0804', gold:'#c9a84c', txt:'#e8e0cc', mut:'#6b5e3a', row:'#12100a', tot:'#12100a', grand:'#1e1a0f'}` | invoice document palette | BRAND | 7 colour pickers | `:4658` |
| `#7dab6e` / `#d4924a` / `#cc5555` / `#888` | profit-chart semantic colours, **inline in the markup string** | BRAND | semantic token set | `:5286-5289` |
| `#cc5555` | the "expired" disposition colour | BRAND | semantic token | `:354` |

**The gold appears as a hex literal, as three separate `rgba()` decompositions,
and as a JavaScript fallback string.** Changing the brand colour requires editing
all four forms.

## 6.3 Typography

| Value | Represents | Owner | Wizard input | Evidence |
|---|---|---|---|---|
| `Playfair Display` | display serif — brand wordmark | BRAND | font choice | `:7`, `:19` |
| `DM Sans` | Latin body face | BRAND | font choice | `:7`, `:12` |
| `Syne` | uppercase label face | BRAND | font choice | `:7`, `:20` |
| `Tajawal` | **the Arabic face** | BRAND | font choice | `:7` |
| the same four families, re-declared for the invoice print document | document typography | BRAND | derived | `:5031` |
| the same four families, re-declared for the report print document | document typography | BRAND | derived | `:5542` |

**Declared three times, at three different weight sets** (`:7`, `:5031`, `:5542`)
— the print documents request weights the screen does not and vice versa.

## 6.4 Currency

| Value | Represents | Owner | Wizard input | Evidence |
|---|---|---|---|---|
| `EGP` | **the only currency; 156 literal occurrences** | BRAND *(display)* + POLICY *(the money itself)* | currency selector | throughout; `DEFAULT_S.cur` at `:4654` |
| `' EGP'` string-concatenated after `fmt(…)` | currency suffix, always trailing, always spaced, always Latin | BRAND | derived from locale | e.g. `:2053`, `:3053`, `:5232`, `:5336` |
| `'ar-EG'` | number locale for invoice printing → **Arabic-Indic digits** | BRAND/locale | locale selector | `:4786` |
| implicit Western digits | `fmt()` uses `toFixed` | BRAND/locale | locale selector | `:1631` |

**Only `DEFAULT_S.cur` (`:4654`) is a variable.** The other ~155 are literals
concatenated at the point of display. There is no currency code, no symbol
position setting, no decimal-places setting and no exchange rate.

## 6.5 Tax rates — **none exist**

No tax value, rate, field or calculation exists (§2.6). The invoice document
template does carry a **`discLabel: 'خصم · Discount'`** (`:4654`) and renders a
discount row when `disc > 0` (`:5011`), which is direct evidence that the
*upstream* invoice tool has a discount concept this tool never computes.

**B2S requirement:** tax and discount policy must be gathered from the owner —
it cannot be extracted from this source.

## 6.6 Units, categories and enumerated lists

| Value | Represents | Owner | Wizard input | Evidence |
|---|---|---|---|---|
| `'قطعة'` | **default unit of measure**, applied to every new Component | CATALOG | default-unit selector | `:2653`, `:2727` |
| `'وحدة'` | fallback unit label in cost display | CATALOG | localised default | `:1643` |
| free-text `unit` | the unit system | CATALOG | **unit registry with conversions** | `:2653` |
| **8 operating-cost categories, keyed by their Arabic display string** — `'إيجار'`, `'مرافق'`, `'أجور'`, `'صيانة'`, `'نقل'`, `'تسويق'`, `'تعويض'`, `'أخرى'` | overhead classification | CATALOG | editable list with stable codes | `:2011` |
| `'أخرى'` | default category | CATALOG | default selector | `:4004`, `:6981` |
| `'تعويض'` | the category that unlocks negative amounts | **POLICY** | flag per category | `:2015`, `:2021-2024` |
| **5 return reasons, keyed by Arabic** — `تالف`, `خطأ في الطلب`, `جودة`, `رفض العميل`, `أخرى` | return reason codes | CATALOG | editable list with stable codes | `:1113-1117` |
| `'restock'` / `'expired'` | the two dispositions | POLICY | fixed enum + labels | `:3289` |
| **3 collection keys used as a type discriminator** — `bb_materials`, `bb_packages`, `bb_stickers` | Component type | CATALOG | fixed enum | `:2795-2799`, `:4354` |
| **No flavour list exists** | — | — | — | searched; absent |

**The most consequential finding in this section:** two enumerations — cost
categories (`:2011`) and return reasons (`:1113-1117`) — use **the Arabic display
string as the stored primary key**. `<option value="تالف">تالف · Damaged</option>`
(`:1113`) stores the Arabic word. Translating the UI orphans every historical
record. §7.4.

## 6.7 Thresholds and policy constants

| Value | Represents | Owner | Wizard input | Evidence |
|---|---|---|---|---|
| `× 0.5` | **the critical-vs-low stock multiplier** — the tool's entire reorder policy | **POLICY** | number, per-Tenant | `:2637` |
| `minStock` per Component | reorder threshold | POLICY *(per item)* | number on the Component | `:2655` |
| `minStock <= 0` disables alerts | opt-out rule | POLICY | boolean | `:2630` |
| `0.0001` | sufficiency / equality tolerance, **5 sites** | SYSTEM | not Tenant-facing | `:2872`, `:3347`, `:3891`, `:4363`, `:4425` |
| `1e-6`, `1e-9` | `roundQty` precision and zero-snap | SYSTEM | not Tenant-facing | `:1637-1638` |
| `batchSize` default `100` | assumed yield for a new Recipe | POLICY | number | `:2826` |
| `batchSize` fallback `1` | divide-by-zero guard | SYSTEM | — | `:2860`, `:4283`, `:4313` |
| **"last purchase price wins"** | **the costing method** | **POLICY** | costing-method selector | `:2994-2999` |
| **"operating costs are not allocated"** | **the allocation method** | **POLICY** | allocation-method selector | `:4031-4033` |
| **invoices XOR production** | **the consumption evidence source** | **POLICY** | source selector | `:4346`, `:4360` |
| `slice(0,7)` on an ISO date | calendar-month period definition | POLICY | fiscal-calendar setting | `:4181`, `:4241` |
| `slice(0,8)` / `slice(0,20)` / `slice(0,4)` | list truncation lengths | SYSTEM | — | `:5293`, `:5318`, `:5181` |

## 6.8 Document templates and print geometry

| Value | Represents | Owner | Wizard input | Evidence |
|---|---|---|---|---|
| `DEFAULT_MARGINS = {t:16, r:14, b:16, l:14}` mm | invoice page margins | BRAND | 4 mm numbers | `:4660` |
| `@page{size:A4 portrait; margin:<mm>}` | invoice page setup | BRAND | page-size selector | `:4778` |
| `@page{size:A4; margin:10mm 12mm}` | **report page setup, hardcoded and not user-adjustable** | BRAND | page-size selector | `:5416` |
| `max-width:820px` | invoice content width | BRAND | derived | `:4669` |
| `padding:52px 44px 68px` | invoice page padding **in px inside a print document** | BRAND | mm values | `:4669` |
| `width=820,height=960` | print popup window size | SYSTEM | — | `:5035` |
| `'__inv2__'` | sentinel id for "use the invoice tool's template" | SYSTEM | — | `:4891` |
| `'قالب Invoice Pro (ألوان + نصوص)'` | that option's label | BRAND | localised | `:4892` |
| `setTimeout(…, 200)` before `window.print()` | font-load race workaround | SYSTEM | — | `:5034` |
| `120 / 300 / 400 / 80` ms print timings | font-load race workarounds | SYSTEM | — | `:5554-5560` |

**Two independent print engines exist in one file:**
1. **Invoice** — `window.open('', '_blank', 'width=820,height=960')` (`:5035`),
   `document.write` of a full HTML document, with an inline
   `window.print()` on a 200 ms timer (`:5034`).
2. **Reports** — a hidden **iframe** (`:5536-5545`), `win.print()` (`:5548`)
   gated on `doc.fonts.ready` (`:5557-5558`), with an optional shrink-to-one-page
   transform (`:5553`).

They have different page setups, different margin sources (one configurable, one
not), different font-loading strategies and different failure handling — the
iframe path catches and reports print failure (`:5549`), the popup path does not.
**Print geometry is expressed in px inside a print document** (`:4669`).

## 6.9 Paths, URLs and filenames

| Value | Represents | Owner | Wizard input | Evidence |
|---|---|---|---|---|
| `C:\Users\<REDACTED>\…\saved data` | shared-folder guidance text | SYSTEM *(should not exist)* | — | `:1178` **REDACTED, §0.5** |
| the same path as a `file://` link | clickable folder shortcut | SYSTEM *(should not exist)* | — | `:902` **REDACTED, §0.5** |
| `balance-bites-sticker.html` | sibling tool filename | SYSTEM | — | `:6042`, `:6043` |
| `costs/` | assumed directory name | SYSTEM | — | `:6042-6043` |
| `https://fonts.googleapis.com/css2?…` | **runtime CDN font load, 3 sites** | BRAND | bundled fonts | `:7`, `:5031`, `:5542` |
| `bb_filestore_v1` / object store `'h'` | IndexedDB names | SYSTEM | — | `:1187-1188` |
| `'dir'` | IndexedDB key for the directory handle | SYSTEM | — | `:1200` |
| the `bb_` prefix on all 20+ storage keys | namespace | SYSTEM | — | throughout |

## 6.10 Data compiled into the program

| Value | Represents | Evidence |
|---|---|---|
| `LEGACY_SHARED_STICKER_IDS` = three specific record primary keys | a one-off migration trigger | `:2704-2708` |
| `'رصيد افتتاحي'` | opening-balance movement type, as a `supplier` sentinel | `:6081` |
| `'تسوية جرد'` | stocktake-correction movement type, as a `supplier` sentinel | `:4432` |
| `'حساب مرتجع'` | fixed `reason` on calculator-logged returns | `:3955` |
| `'حاسبة: مرتجع − مسلّم لآخرين · N سطر'` | fixed `notes` template on calculator returns | `:3956` |
| `'طلب تحضير · <date>'` | default production-request title | `:3213` |
| `'تعديل مخزون يدوي: X → Y'` | stock-adjustment note — **then discarded**, §1.1.5 | `:4434` |

**Three specific database row identifiers are compiled into the source** and
gate a data migration (`:2786-2788`).

## 6.11 Single-Tenant assumptions — the tenancy requirements B2S adds

Every item below assumes **exactly one business exists**. Each is a place B2S must
introduce a Tenant scope.

| # | Assumption | Evidence |
|---|---|---|
| T1 | **Every storage key is a global singleton.** `bb_materials`, `bb_recipes`, `bb_purchases`, `bb_production`, `bb_returns`, `bb_operation_costs`, `bb_pending_invoices`, `bb_stickers`, `bb_color_presets`, `bb_invoice_payments` — **no Tenant dimension in any key or record.** | `:1180`, and every `var KEY=` |
| T2 | **One shared directory, one handle.** A single IndexedDB entry under key `'dir'` (`:1200`), one `_handle` (`:1176`). A second business would require a second browser profile. | `:1176`, `:1200` |
| T3 | **One absolute path is the canonical data location**, embedded in source. | `:1178` **REDACTED** |
| T4 | **Brand identity is a source literal**, not a record. Six sites. §6.1. | `:6`, `:464`, `:4652`, `:5030`, `:5413`, `:5541` |
| T5 | **One currency, 156 literals.** No currency field on any entity. | §6.4 |
| T6 | **One locale.** `<html dir="rtl" lang="ar">` is fixed in the document element; no language switch exists. | `:2` |
| T7 | **The theme is global and mirrored with business data.** `bb_color_presets` + `bb_active_color_preset_id` are in `WRITE_KEYS`, so appearance travels in the shared business folder. | `:1180`, `:1345`, `:1560` |
| T8 | **Print margins and print preset are one global setting**, not per Tenant and not per document type. | `:4661`, `:4886` |
| T9 | **The sibling tool is at a fixed relative path** — one deployment layout. | `:6040-6044` |
| T10 | **The Buyer directory is unscoped.** `bb_customers` is a flat list with no owning business. | `:1182`, `:3464` |
| T11 | **`bb_products` is a single global catalogue** shared by every tool, with no Tenant partition. | `:1182`, `:6104` |
| T12 | **Cost categories and return reasons are source constants**, identical for every business, and keyed by Arabic strings. | `:2011`, `:1113-1117` |
| T13 | **The reorder policy (`× 0.5`) is a source constant** — every business gets the same rule. | `:2637` |
| T14 | **The costing method is implicit in code**, not a setting. | `:2994-2999` |
| T15 | **`bb_label_open` is a single global mailbox.** Two concurrent handoffs overwrite each other; there is no queue and no addressee. | `:6048-6053` |
| T16 | **`LEGACY_SHARED_STICKER_IDS` hardcodes one business's record ids** into the migration path. | `:2704-2708` |

---

# PART 7 — BILINGUAL CONTENT INVENTORY

## 7.1 Measured scale

| Measure | Count |
|---|---|
| Lines containing Arabic script | **779** of 7083 |
| Single-quoted JavaScript string literals containing Arabic | **501** |
| Distinct hex colour literals | 51 (304 occurrences) |
| `EGP` literals | 156 |

**Zero externalised strings.** There is no resource bundle, no key/value map, no
`t()` function and no language switch anywhere in the file. Every user-facing
string is a literal at its point of use.

## 7.2 Document-level language

`<html dir="rtl" lang="ar">` (`:2`) — **fixed**. Direction and language are
document attributes, not state. LTR content is handled by per-element overrides
such as `dir="ltr"` on the phone field (`:4999`).

## 7.3 The bilingual pattern that does exist

Where both languages appear, they are joined by a middot into **one
inseparable string**: `'Arabic · English'`. This is a presentation convention,
not a translation mechanism — the two languages cannot be selected between.

### 7.3.a Document template strings — the only structured set

`DEFAULT_S` (`:4651-4657`) is the closest thing to a resource bundle in the file:

| Key | Value | Languages | Classification |
|---|---|---|---|
| `mono` | `BB` | neutral | document template |
| `brand` | `Balance Bites` | English only | document template |
| `docTitle` | `فاتورة · Invoice` | **both** | document template |
| `web` | `balancebites.com` | neutral | document template |
| `footNote` | `شكراً لثقتكم · Thank you for your order` | **both** | document template |
| `cur` | `EGP` | neutral | document template |
| `discLabel` | `خصم · Discount` | **both** | document template |
| `hItem` | `المنتج · Item` | **both** | document template |
| `hQty` | `الكمية` | **Arabic only** | document template |
| `hPrice` | `سعر الوحدة` | **Arabic only** | document template |
| `hSub` | `الإجمالي` | **Arabic only** | document template |
| `lSubtotal` | `المجموع · Subtotal` | **both** | document template |
| `lTotal` | `الإجمالي · Total` | **both** | document template |

**Six of thirteen are bilingual; three are Arabic-only; four are
language-neutral.** Even the one structured set is inconsistent.

### 7.3.b Other bilingual strings

| Literal | Classification | Evidence |
|---|---|---|
| `Balance Bites · Stock & Costs` | UI chrome (page title) | `:6` |
| `💰 التكاليف · COGS` | UI chrome (view option) | `:506` |
| `تكلفة الإنتاج لكل وحدة · COGS Per Unit` | UI chrome (section title) | `:602` |
| `🧮 حاسبة المرتجع · Return Calculator` | UI chrome (panel title) | `:778` |
| `الوصفات · BOM` | UI chrome (section title) | `:837` |
| `قالب التصميم · Label Template` | UI chrome (field label) | `:957` |
| `تالف · Damaged` | **business data** (return reason option) | `:1113` |
| `خطأ في الطلب · Wrong Order` | **business data** | `:1114` |
| `مشكلة جودة · Quality Issue` | **business data** | `:1115` |
| `رفض العميل · Customer Refused` | **business data** | `:1116` |
| `أخرى · Other` | **business data** | `:1117` |
| `ملاحظات · Notes` | document template | `:4984` |
| `تقرير التكاليف · COGS` | document template (report title) | `:5604` |
| `قائمة التحضير · BOM` | document template (report title) | `:5824` |

## 7.4 Arabic strings that are also data keys — the critical set

These are **not translatable**. Each is a stored value that a translation would
orphan.

| Literal | Stored as | Evidence |
|---|---|---|
| `تالف`, `خطأ في الطلب`, `جودة`, `رفض العميل`, `أخرى` | `Return.reason` — **the `<option value>` is the Arabic word** | `:1113-1117` |
| `إيجار`, `مرافق`, `أجور`, `صيانة`, `نقل`, `تسويق`, `تعويض`, `أخرى` | `OperatingCost.category` | `:2011`, `:4004` |
| `رصيد افتتاحي` | `Purchase.supplier`, used as a movement-type discriminator | `:6081` |
| `تسوية جرد` | `Purchase.supplier`, same | `:4432` |
| `حساب مرتجع` | `Return.reason` on calculator-logged returns | `:3955` |
| `قطعة` | `Component.unit` default | `:2653`, `:2727` |
| `طلب تحضير · <date>` | `PendingInvoice.title` | `:3213` |
| `تعديل مخزون يدوي: X → Y` | `Purchase.notes` — **then discarded** | `:4434` |
| `حاسبة: مرتجع − مسلّم لآخرين · N سطر` | `Return.notes` | `:3956` |

## 7.5 Arabic-only, by classification

Representative and exhaustive by category rather than line-by-line; 501 literals
cannot be tabulated individually without reproducing the file.

**UI chrome — navigation (Arabic only, 14 tabs).** `:518-531`:
`📊 لوحة التحكم`, `📋 الفواتير`, `💰 COGS`, `📈 الأرباح`, `🏦 المخزون`,
`🛒 المشتريات`, `🌾 المواد الخام`, `📦 التغليف`, `🏷 الملصقات`, `🧪 الوصفات`,
`🥣 التحضير`, `🏭 الإنتاج`, `🔄 المرتجعات`, `⚙ تكاليف التشغيل`.
**`💰 COGS` (`:520`) is the sole English-only tab** — an untranslated acronym in
an otherwise fully Arabic navigation.

**UI chrome — table headers (Arabic only).** e.g. `:664`, `:667`, `:709`, `:729`,
`:889`, `:906`: `المادة`, `الوحدة`, `المخزون`, `سعر الشراء/وحدة`, `قيمة المخزون`,
`حد التنبيه`, `المورد`, `الحالة`, `المكون`, `النوع`, `لكل منتج`,
`المطلوب (مجموع)`, `التكلفة`, `الطلب`, `المنتجات`, `العميل`, `التاريخ`.

**UI chrome — status and empty states (Arabic only).** `لا يوجد بعد` (`:2678`,
`:2763`), `لا يوجد مشتريات` (`:3047`), `لا يوجد دورات إنتاج` (`:3104`),
`لا يوجد مرتجعات` (`:3405`, `:5316`), `لا توجد نتائج` (`:2051`),
`لا توجد منتجات` (`:5327`), `لا توجد أصناف` (`:5906`),
`✓ جميع مستويات المخزون مقبولة` (`:5162`),
`لا توجد بيانات — اربط الفواتير وسجّل الإنتاج` (`:5927`),
`اربط المجلد المشترك لتحميل bb_invoices.json` (`:2095`),
`اربط المجلد لتحميل الفواتير` (`:5257`).

**UI chrome — stat-card labels (Arabic only).** `عناصر المخزون`, `قيمة المخزون`,
`تحتاج إعادة تعبئة`, `وصفة محفوظة`, `مصروف الدورة` (`:5145-5149`); `فاتورة`,
`إجمالي المبيعات`, `مدفوع`, `معلق` (`:5273-5276`); `COGS (مباع)`,
`تكاليف تشغيل`, `مرتجعات`, `صافي الربح` (`:5279-5282`); `سجل`, `إجمالي الفترة`,
`إجمالي الكلي`, `كل السجلات` (`:2044-2047`).

**Validation messages (Arabic only) — all delivered as toasts.**
`اختر الصنف أولاً` (`:6866`), `خطأ في الصنف` (`:6867`), `الكمية مطلوبة`
(`:6869`, `:6887`), `السعر غير صحيح` (`:6870`), `اختر الوصفة أولاً` (`:6886`),
`خطأ: الوصفة غير موجودة` (`:6889`), `اختر الفاتورة أولاً` (`:6948`),
`خطأ في الفاتورة` (`:6950`), `حدد صنفاً واحداً على الأقل` (`:6952`),
`المبلغ غير صحيح` (`:6953`), `اختر فاتورة المرتجع` (`:3772`),
`فاتورة غير موجودة` (`:3774`, `:3944`), `احسب المتبقي أولاً` (`:3888`),
`لا يوجد كمية للتسجيل` (`:3897`),
`⚠ <name>: تالف+مخزون أكبر من المتبقي` (`:3892`),
`⚠ مجموع تالف+مخزون أكبر من المتبقي` (`:3835`), `فشل الطباعة` (`:5549`).

**Confirmation prompts (Arabic only) — native `confirm()`.**
`حذف "<name>"؟` (`:2811`), `حذف الوصفة "<name>"؟` (`:2977`),
`حذف شراء "<name>" (+<qty>)؟` (`:6858`),
`حذف "<name>" (<amount> EGP)؟` (`:7038`).

**Success toasts (Arabic only).** `🗑 تم الحذف` (`:2812`),
`✓ تم تسجيل الشراء: +<qty> <unit>` (`:6881`), `✓ تم تحديث الشراء` (`:6876`),
`🗑 تم حذف الشراء` (`:6862`),
`✓ تم تسجيل إنتاج <n> وحدة من <recipe>` (`:6894`),
`✓ مرتجع −<amount> EGP · <disposition>` (`:6974`, `:3966`),
`✓ تم تطبيق الحساب على نموذج المرتجع` (`:3937`),
`⏳ جاري تحميل البيانات...` (`:6907`),
`✓ متصل بـ saved data — المزامنة: <path>` (`:6913`).

**Business-data labels (Arabic only).** Disposition options `📦 مخزون` /
`🗑 تالف` (`:3930-3931`); the eight cost-category labels with emoji (`:2011`);
`مدفوعة` / `معلقة` payment status (`:5630`, `:5635`); `↩️ مرتجع كامل` (`:5639`);
`🔄 جزئي` (`:5635`); `⚠ بلا وصفة` (`:2109`, `:5931`); `✓ متوفر` /
`⚠ ينقص <n> <unit>` (`:2463`); `دفعة: <n> وحدة · <n> مكون` (`:2362`, `:2947`).

> **SUPERSEDED as the record — see §7.5.b.** This rollup stays visible as the
> original claim (PR-07). CF-42 names this category as one of the two that must
> be enumerated individually; §7.5.b is now the authoritative list.

**Document templates (Arabic only) — report engine.**
`تقرير قيمة المخزون الحالي` (`:5760`),
`المتبقي = مشتريات − مباع · القيمة = max(0, المتبقي) × التكلفة` (`:5760`, and on
screen at `:642`), `تكلفة المواد والتغليف لكل منتج حسب الوصفة` (`:5604`),
`حساب المكونات حسب الوصفة والدفعة` (`:5824`),
`⚠ عجز (كمية سالبة — لا تُحسب في القيمة):` (`:5896`),
`<brand> · <date> · طُبع من نظام المخزون والتكاليف` (`:5499`),
`اسم العميل` / `رقم الفاتورة` / `التاريخ` / `التليفون` (`:4996-4999`),
`دورة الأموال — إجمالي المصروف` (`:5106`), and the money-cycle labels
`🛒 مشتريات`, `⚙ تشغيل`, `💸 مصروف`, `💵 وارد (مدفوع)`, `⏳ معلق`,
`🔄 مرتجعات`, `📊 صافي الدورة` (`:5109-5116`).

> **SUPERSEDED as the record — see §7.5.a.** This rollup stays visible as the
> original claim (PR-07). It was also incomplete: it missed the whole of the
> COGS, sales, profit, stock-value and prep/BOM report bodies. §7.5.a is now the
> authoritative list.

**Tooltips (Arabic only) — `title` attributes.** `تعديل` (`:2692`),
`حذف` (`:2693`), `تصميم الملصق` (`:2778`),
`عدّل واضغط Enter أو غيّر الحقل` (`:4416`),
`عدّل كمية المنتج — يُخصم المواد والتغليف والملصقات` (`:4421`).

### 7.5.a Document-template literals, individually enumerated (CF-42)

**Line range read for this pass: `bb-stock-costs.html:4647-5960`** — MODULE 10b
(invoice print template) through MODULE 12 (stock value view & report),
inclusive of MODULE 11's money-cycle block and the COGS, sales, profit,
stock-value and prep/BOM report builders. No other part of the file was re-read.

Scope: every Arabic-only literal emitted into a printed document by the report
engine — report titles, subtitles, section headings, table column headers,
summary-stat labels, total-row labels, fixed cell text, and footers. The two
on-screen report-surface literals the superseded rollup had classified as
document templates are retained at the end so nothing it claimed is lost.

Row form follows §7.3.a. Its constant `Languages` column is replaced by
`Evidence`, because every row here is Arabic-only by definition of §7.5 and
CF-42 requires file:line. `Classification` carries the sub-role instead.

The three Arabic-only `DEFAULT_S` keys — `hQty`, `hPrice`, `hSub` — are **not**
repeated here; §7.3.a already enumerates them individually.

| Key | Value | Classification | Evidence |
|---|---|---|---|
| Invoice print | `اسم العميل` | meta label | `:4996` |
| Invoice print | `رقم الفاتورة` | meta label | `:4997` |
| Invoice print | `التاريخ` | meta label | `:4998` |
| Invoice print | `التليفون` | meta label | `:4999` |
| Invoice print | `تفاصيل الطلب` | section heading | `:5001` |
| Money cycle | `دورة الأموال — إجمالي المصروف` | block heading | `:5106` |
| Money cycle | `🛒 مشتريات` | line label | `:5109` |
| Money cycle | `⚙ تشغيل` | line label | `:5110` |
| Money cycle | `💸 مصروف` | line label | `:5111` |
| Money cycle | `💵 وارد (مدفوع)` | line label | `:5113` |
| Money cycle | `⏳ معلق` | line label | `:5114` |
| Money cycle | `🔄 مرتجعات` | line label | `:5115` |
| Money cycle | `📊 صافي الدورة` | line label | `:5116` |
| All reports | `طُبع من نظام المخزون والتكاليف` | footer | `:5499` |
| COGS report | `وحدة` | cell suffix (batch size) | `:5590` |
| COGS report | `وصفات` | summary stat | `:5597` |
| COGS report | `متوسط COGS` | summary stat | `:5598` |
| COGS report | `مجموع COGS` | summary stat | `:5599` |
| COGS report | `تكلفة الإنتاج لكل وحدة` | section heading | `:5600` |
| COGS report | `المنتج / الوصفة` | column header | `:5601` |
| COGS report | `حجم الدفعة` | column header | `:5601` |
| COGS report | `COGS/وحدة` | column header | `:5601` |
| COGS report | `سعر البيع` | column header | `:5601` |
| COGS report | `هامش` | column header | `:5601` |
| COGS report | `تقرير التكاليف · COGS` | report title | `:5604` |
| COGS report | `تكلفة المواد والتغليف لكل منتج حسب الوصفة` | report subtitle | `:5604` |
| Sales report | `فواتير مبيعات` | summary stat | `:5644` |
| Sales report | `مرtجع كامل` | summary stat — **corrupted literal** | `:5645` |
| Sales report | `صافي المبيعات` | summary stat | `:5646` |
| Sales report | `صافي مدفوع` | summary stat | `:5647` |
| Sales report | `صافي معلق` | summary stat | `:5648` |
| Sales report | `مدفوعة / معلقة` | summary stat | `:5649` |
| Sales report | `ملخص المنتجات (من الفواتير · بعد المرتجعات)` | section heading | `:5650` |
| Sales report | `المنتج` | column header | `:5651` |
| Sales report | `الكمية` | column header | `:5651` |
| Sales report | `الإيراد` | column header | `:5651` |
| Sales report | `مدفوع` | column header | `:5651` |
| Sales report | `معلق` | column header | `:5651` |
| Sales report | `الإجمالي` | total-row label | `:5652` |
| Sales report | `قائمة الفواتير` | section heading | `:5653` |
| Sales report | `التاريخ` | column header | `:5654` |
| Sales report | `رقم الفاتورة` | column header | `:5654` |
| Sales report | `العميل` | column header | `:5654` |
| Sales report | `الحالة` | column header | `:5654` |
| Sales report | `المبلغ` | column header | `:5654` |
| Sales report | `تقرير المبيعات · الفواتير` | report title | `:5656` |
| Sales report | `فاتورة مبيعات · صافي` | report subtitle | `:5656` |
| Profit report | `إجمالي المبيعات` | summary stat | `:5703` |
| Profit report | `تشغيل` | summary stat | `:5705` |
| Profit report | `مرتجعات` | summary stat | `:5706` |
| Profit report | `صافي الربح` | summary stat | `:5707` |
| Profit report | `ربح نقدي` | summary stat | `:5708` |
| Profit report | `أرباح شهرية` | section heading | `:5709` |
| Profit report | `الشهر` | column header | `:5710` |
| Profit report | `إيراد` | column header | `:5710` |
| Profit report | `تشغيل` | column header | `:5710` |
| Profit report | `مرتجعات` | column header | `:5710` |
| Profit report | `صافي` | column header | `:5710` |
| Profit report | `تفاصيل المنتجات` | section heading | `:5711` |
| Profit report | `المنتج` | column header | `:5712` |
| Profit report | `مباع` | column header | `:5712` |
| Profit report | `إيراد` | column header | `:5712` |
| Profit report | `مدفوع` | column header | `:5712` |
| Profit report | `معلق` | column header | `:5712` |
| Profit report | `مجمل الربح` | column header | `:5712` |
| Profit report | `مرتجعات` | section heading | `:5714` |
| Profit report | `التاريخ` | column header | `:5714` |
| Profit report | `العميل` | column header | `:5714` |
| Profit report | `الفاتورة` | column header | `:5714` |
| Profit report | `السبب` | column header | `:5714` |
| Profit report | `المبلغ` | column header | `:5714` |
| Profit report | `تقرير الأرباح` | report title | `:5715` |
| Profit report | `بعد COGS وتكاليف التشغيل والمرتجعات · مجمل` | report subtitle | `:5715` |
| Stock value report | `منتجات جاهزة` | summary stat | `:5739` |
| Stock value report | `مواد خام` | summary stat | `:5740` |
| Stock value report | `تغليف` | summary stat | `:5741` |
| Stock value report | `ملصقات` | summary stat | `:5742` |
| Stock value report | `الإجمالي` | summary stat | `:5743` |
| Stock value report | `ملخص حسب الفئة` | section heading | `:5744` |
| Stock value report | `الفئة` | column header | `:5745` |
| Stock value report | `أصناف` | column header | `:5745` |
| Stock value report | `مشتريات` | column header | `:5745` |
| Stock value report | `مباع` | column header | `:5745` |
| Stock value report | `متبقي` | column header | `:5745` |
| Stock value report | `قيمة EGP` | column header | `:5745` |
| Stock value report | `الإجمالي` | total-row label | `:5746` |
| Stock value report | `⚠ عجز (كميات سالبة)` | section heading | `:5749` |
| Stock value report | `تفاصيل كل الأصناف` | section heading | `:5753` |
| Stock value report | `الفئة` | column header | `:5754` |
| Stock value report | `الصنف` | column header | `:5754` |
| Stock value report | `الوحدة` | column header | `:5754` |
| Stock value report | `مشتريات` | column header | `:5754` |
| Stock value report | `مباع` | column header | `:5754` |
| Stock value report | `متبقي` | column header | `:5754` |
| Stock value report | `تكلفة/وحدة` | column header | `:5754` |
| Stock value report | `القيمة` | column header | `:5754` |
| Stock value report | `منتجات جاهزة (مُنتَج − مباع)` | section heading | `:5756` |
| Stock value report | `المنتج` | column header | `:5757` |
| Stock value report | `مُنتَج` | column header | `:5757` |
| Stock value report | `مباع` | column header | `:5757` |
| Stock value report | `في المخزون` | column header | `:5757` |
| Stock value report | `COGS/وحدة` | column header | `:5757` |
| Stock value report | `قيمة المخزون` | column header | `:5757` |
| Stock value report | `فاتورة · بعد خصم المباع` | subtitle variant | `:5759` |
| Stock value report | `اربط الفواتير` | subtitle variant | `:5759` |
| Stock value report | `تقرير قيمة المخزون الحالي` | report title | `:5760` |
| Stock value report | `المتبقي = مشتريات − مباع · القيمة = max(0, المتبقي) × التكلفة` | formula caption | `:5760` |
| Prep / BOM report | `بعد خصم الجاهز` | mode label | `:5767` |
| Prep / BOM report | `الكمية كاملة` | mode label | `:5767` |
| Prep / BOM report | `مطلوب` | cell suffix | `:5771` |
| Prep / BOM report | `جاهز` | cell suffix | `:5771` |
| Prep / BOM report | `للإنتاج` | cell suffix | `:5771` |
| Prep / BOM report | `مغطى` | cell text | `:5773` |
| Prep / BOM report | `مطلوب` | summary stat | `:5777` |
| Prep / BOM report | `للإنتاج` | summary stat | `:5778` |
| Prep / BOM report | `تكلفة المكونات` | summary stat | `:5779` |
| Prep / BOM report | `كافٍ` | summary stat value | `:5780` |
| Prep / BOM report | `نقص` | summary stat value | `:5780` |
| Prep / BOM report | `المخزون` | summary stat | `:5780` |
| Prep / BOM report | `المنتجات` | section heading | `:5781` |
| Prep / BOM report | `المنتج` | column header | `:5782` |
| Prep / BOM report | `مطلوب` | column header | `:5782` |
| Prep / BOM report | `جاهز` | column header | `:5782` |
| Prep / BOM report | `للإنتاج` | column header | `:5782` |
| Prep / BOM report | `دفعات` | column header | `:5782` |
| Prep / BOM report | `المكونات` | column header | `:5782` |
| Prep / BOM report | `متعدد` | cell text | `:5789` |
| Prep / BOM report | `✓ متوفر` | cell status | `:5792`, `:5812` |
| Prep / BOM report | `⚠ ينقص` | cell status | `:5792`, `:5812` |
| Prep / BOM report | `مجموع المكونات (الكل)` | section heading | `:5796` |
| Prep / BOM report | `المكون` | column header | `:5797`, `:5817` |
| Prep / BOM report | `النوع` | column header | `:5797`, `:5817` |
| Prep / BOM report | `لكل منتج` | column header | `:5797` |
| Prep / BOM report | `المطلوب` | column header | `:5797`, `:5817` |
| Prep / BOM report | `المخزون` | column header | `:5797`, `:5817` |
| Prep / BOM report | `الحالة` | column header | `:5797`, `:5817` |
| Prep / BOM report | `التكلفة` | column header | `:5797`, `:5817` |
| Prep / BOM report | `الإجمالي` | total-row label | `:5798` |
| Prep / BOM report | `منتج` | title fragment | `:5805` |
| Prep / BOM report | `/دفعة` | title fragment | `:5805` |
| Prep / BOM report | `مكونات` | section heading | `:5816` |
| Prep / BOM report | `لكل وحدة` | column header | `:5817` |
| Prep / BOM report | `المجموع` | total-row label | `:5818` |
| Prep / BOM report | `مجموع + كل منتج` | subtitle variant | `:5823` |
| Prep / BOM report | `كل منتج على حدة` | subtitle variant | `:5823` |
| Prep / BOM report | `مجموع المكونات فقط` | subtitle variant | `:5823` |
| Prep / BOM report | `قائمة التحضير · BOM` | report title | `:5824` |
| Prep / BOM report | `حساب المكونات حسب الوصفة والدفعة` | report subtitle | `:5824` |
| Report surface (screen) | `تاريخ التقرير:` | report date label | `:5867` |
| Report surface (screen) | `⚠ عجز (كمية سالبة — لا تُحسب في القيمة):` | deficit caption — screen twin of `:5749` | `:5896` |

**Finding — a corrupted Arabic literal ships in the sales report.** `:5645`
reads `مرtجع كامل`: a Latin `t` (U+0074) sits inside the Arabic word where `ت`
belongs. It renders as broken text on every printed sales report that has a
full return. Not a translation defect — a character-level corruption in source.

**Finding — the report engine has no resource bundle.** `DEFAULT_S` (`:4651-4657`)
covers the invoice template only. Every literal above is inline at its point of
use, and the same word is re-declared per report — `الإجمالي` at `:5652`,
`:5743`, `:5746`, `:5798`; `المنتج` at `:5651`, `:5712`, `:5757`, `:5782`;
`مباع` at `:5745`, `:5754`, `:5757`, `:5712`. B2S needs one keyed bundle.

### 7.5.b Business-data labels, individually enumerated (CF-42)

Same row form and same read scope caveat: these sit outside the report-engine
region, so only the specific lines cited by the superseded rollup and their
declaration sites were read — `:2011-2015`, `:2109`, `:2362`, `:2463`, `:2947`,
`:3930-3931`, `:5167`, `:5366-5387`, `:5630-5639`, `:5931`. The file was not
re-read in full.

| Key | Value | Classification | Evidence |
|---|---|---|---|
| Op-cost category | `🏠 إيجار` | display label, keyed on `إيجار` | `:2011` |
| Op-cost category | `💡 مرافق` | display label, keyed on `مرافق` | `:2011` |
| Op-cost category | `👷 أجور` | display label, keyed on `أجور` | `:2011` |
| Op-cost category | `🔧 صيانة` | display label, keyed on `صيانة` | `:2011` |
| Op-cost category | `🚚 نقل` | display label, keyed on `نقل` | `:2011` |
| Op-cost category | `📣 تسويق` | display label, keyed on `تسويق` | `:2011` |
| Op-cost category | `💰 تعويض` | display label, keyed on `تعويض` | `:2011` |
| Op-cost category | `📋 أخرى` | display label, keyed on `أخرى` | `:2011` |
| Op-cost behaviour | `تعويض` | **stored value tested in code** | `:2015` |
| Recipe status | `⚠ بلا وصفة` | derived status badge | `:2109`, `:5931` |
| Recipe card | `دفعة: <n> وحدة · <n> مكون` | composed meta line | `:2362`, `:2947` |
| Ingredient status | `✓ متوفر` | derived status | `:2463` |
| Ingredient status | `⚠ ينقص <n> <unit>` | derived status | `:2463` |
| Return disposition | `📦 مخزون` | option label, value `restock` | `:3930` |
| Return disposition | `🗑 تالف` | option label, value `expired` | `:3931` |
| Item type | `🌾 مادة خام` | derived type label | `:5167` |
| Item type | `📦 تغليف` | derived type label | `:5167` |
| Item type | `🏷 ملصق` | derived type label | `:5167` |
| Stock category | `🌾 مواد خام` | **stored aggregation key** | `:5366`, `:5384` |
| Stock category | `📦 تغليف` | **stored aggregation key** | `:5367`, `:5385` |
| Stock category | `🏷 ملصقات` | **stored aggregation key** | `:5368`, `:5386` |
| Stock category | `🍪 منتج جاهز` | **stored aggregation key** | `:5375`, `:5380`, `:5387` |
| Stock category | `مواد خام` | display label | `:5384` |
| Stock category | `تغليف` | display label | `:5385` |
| Stock category | `ملصقات` | display label | `:5386` |
| Stock category | `منتجات جاهزة` | display label | `:5387` |
| Finished-goods unit | `قطعة` | hardcoded unit | `:5377`, `:5380` |
| Payment status | `مدفوعة` | derived from `status==='paid'` | `:5630`, `:5635` |
| Payment status | `معلقة` | derived from `status!=='paid'` | `:5630`, `:5635` |
| Return status | `🔄 جزئي` | derived partial-return marker | `:5635` |
| Return status | `↩️ مرتجع كامل` | derived full-return marker | `:5639` |

**Finding — Arabic display strings are stored keys in two places here.** The
op-cost `map` at `:2011` is keyed on the Arabic category name, and `:2015` tests
`cat==='تعويض'` as a behavioural branch. The four stock categories at
`:5384-5387` are used as object keys into `report.byCat` at `:5739-5742` and
`:5860-5863`. Renaming or translating either set is a data migration. This is
the concrete evidence behind CF-65.

## 7.6 English-only strings in an Arabic UI

| Literal | Where | Note |
|---|---|---|
| `COGS` | tab label (`:520`), stat cards (`:5279`), report title (`:5604`) | untranslated acronym |
| `BOM` | section titles (`:837`, `:5824`) | untranslated acronym |
| `EGP` | 156 sites | currency code, never `ج.م` |
| `Balance Bites` | 6 sites | brand |
| `Stock & Costs Manager` | `:5413` | product name in report headers |
| `balancebites.com` | `:4653` | URL |
| `BB` | `:4652` | monogram |
| `Invoice Pro` | `:4892` | the other tool's product name, inside an Arabic label |
| `bb_invoices.json` | `:2095` | **a storage filename shown to the user** in an empty state |
| `saved data` | `:6913` | **a folder name shown to the user** in a toast |

**Two internal identifiers leak into the user interface** (`:2095`, `:6913`) —
the user is told to connect a folder by its literal filesystem name.

## 7.7 Emoji as semantic carriers

Emoji are used as **the sole distinguishing marker** for entity types and states,
concatenated directly into display strings, never externalised:
`🌾` material, `📦` packaging, `🏷` sticker, `🧪` recipe, `🛒` purchase,
`🏭` production, `🔄` return, `⚙` operating cost, `📊` dashboard, `💰` COGS,
`📈` profit, `🏦` stock, `🥣` prep, `📋` invoices, `🗑` expired/delete,
`✓` success, `⚠` warning, `⏳` pending, `💵` paid, `💸` spent, `↩️` full return,
`🔗` product link, `🎨` design, `🧮` calculator, `📭` empty.

They appear inside `stat_card` calls, `toast` messages, table cells, tab labels
and print output. **A translation resource set must carry them or lose the
semantics**, and several are duplicated across contexts with different meanings
(`📦` = packaging *and* the restock disposition; `💰` = COGS *and* compensation).

## 7.8 Summary for the translation resource set

| Classification | Bilingual | Arabic only | English only |
|---|---|---|---|
| UI chrome | 6 sites (`:6`, `:506`, `:602`, `:778`, `:837`, `:957`) | the overwhelming majority | `COGS` (`:520`), `BOM` (`:837`) |
| Business data | 5 return reasons (`:1113-1117`) | 8 cost categories (`:2011`), dispositions (`:3930-3931`), statuses (`:5630`) | `EGP` |
| Document template | 6 of 13 `DEFAULT_S` keys (`:4651-4657`), `:4984`, `:5604`, `:5824` | report titles, subtitles, footers, column headers | brand, monogram, URL |
| Validation message | **none** | **all** (§7.5) | none |

**No validation message exists in English.** **No string is externalised.**
**Nine Arabic literals are simultaneously stored data keys** (§7.4) and therefore
cannot be translated without a data migration.

---

# PART 8 — WHAT B2S MUST NOT REPRODUCE

Defects rather than requirements. One sentence each plus what correct behaviour
would have been. **No fix is designed.**

## 8.1 Deleting a Component silently makes every Recipe using it cheaper

Deleting a Material, Packaging or Sticker (`:2808-2813`) does not scan Recipes,
and `calcCOGS` skips unresolvable lines (`:2849`), so COGS drops and reported
profit rises with no warning.
**Correct behaviour:** the deletion should have been refused, or the affected
Recipes marked incomplete, so that a missing input never reads as a free input.

## 8.2 Sold lines are matched to Recipes by fuzzy substring

`findRecipeForItem` (`:4049-4063`) matches on containment in either direction
(`:4058`), so `"براوني"` and `"براوني دارك"` match each other and the winner
depends on array order; the margin fallback is worse, matching on the **first
word only** of the Recipe name (`:5220`).
**Correct behaviour:** the sale should have carried a durable product reference,
and an unmatched line should have been surfaced rather than silently costed at zero.

## 8.3 Deleted Components leave their purchases counted as money but not as stock

The ledger iterates live Components (`:4354-4357`) so orphaned purchases
contribute no stock, while the money cycle sums all purchases (`:5088`) so they
still count as spend.
**Correct behaviour:** one rule for both, so inventory value and money spent
cannot silently disagree.

## 8.4 Stock-adjustment notes are captured and then discarded

`addStockAdjustmentPurchase` builds an explanatory note (`:4434`) and passes it to
`makeRecord`, which has no `notes` field (`:3001-3013`), so the reason for every
manual stock correction is destroyed at the moment of writing.
**Correct behaviour:** the field should have been persisted, since the note is
the only audit trail distinguishing a correction from a purchase.

## 8.5 `isAdjustment` is hardcoded `true` on every production run

`addDelta` sets `isAdjustment:true` unconditionally (`:3095`) and `add` merely
delegates to it (`:3074-3076`), so the flag can never be `false` and cannot
distinguish a real production run from a stock correction.
**Correct behaviour:** the two entry points should have set opposite values, since
that is the distinction the field's name promises.

## 8.6 The immutable production snapshot is written but never read

`deductions` records exactly what each run consumed (`:3086-3093`), yet the ledger
re-derives consumption from the *current* Recipe (`:4308-4322`), so editing a
Recipe rewrites the material history of every past run.
**Correct behaviour:** the snapshot should have been the source of truth for
historical consumption, which is why it was written.

## 8.7 Component consumption uses invoices XOR production, never both

`useInv` (`:4346`) switches the entire ledger to invoice-derived usage the moment
one invoice exists (`:4360`), so all production-run consumption stops counting and
stock jumps.
**Correct behaviour:** the two sources should have been reconciled or the choice
made explicit, since a business that both produces to stock and invoices needs both.

## 8.8 `renderInvTabView`'s ledger branch is unreachable

The function takes twelve parameters including `showLedger` (`:1938`), but both
call sites pass only eleven (`:1821`, `:1826`), so `showLedger` is always
`undefined` and the purchased/used ledger columns at `:1976-1992` never render —
which is precisely the purchased-versus-used reconciliation the tool otherwise
has no way to show. The parameter `modalType` is likewise never used in the body.
**Correct behaviour:** the argument should have been passed, since the branch
exists specifically to show the reconciliation the rest of the tool struggles to
convey.

## 8.9 The same amount renders in two digit systems

`fmt` (`:1631`) produces Western digits at two decimals; `fmtInv` (`:4786`)
produces Arabic-Indic digits via `toLocaleString('ar-EG')` with
`minimumFractionDigits:0`, and both appear in the product.
**Correct behaviour:** one locale-aware formatter, so a total on screen and the
same total on the printed invoice are visibly the same number.

## 8.10 Inventory value is computed twice with different clamping

The dashboard sums unclamped `currentStock × costPerUnit` (`:5137`) while the
stock report clamps each line at zero (`:5943`), so the two headline figures
disagree whenever anything is oversold.
**Correct behaviour:** one valuation function, since two numbers labelled
"inventory value" that differ cannot both be right.

## 8.11 Two invoice collections with per-call-site fallback chains

`bb_inv2` is read at `:4852` while `bb_invoices` is read at `:3463`, `:4047`,
`:4574`, `:5048`, `:5121` and `:6575`, some sites trying the shared folder first
and `:5121` reading only `localStorage`, so which sales a report sees depends on
which function loaded them.
**Correct behaviour:** one loader, so every report answers from the same data.

## 8.12 Orphaned returns keep reducing revenue

Deleting an invoice in the other tool leaves its returns in `bb_returns` with a
dangling `invoiceId` (`:3262`), still subtracting revenue (`:4081`) and COGS
(`:4217`) from totals.
**Correct behaviour:** the return should have been invalidated or surfaced,
since a return against a non-existent sale is not a deduction.

## 8.13 Expired returns restock their Components

`calcIngredientUsageFromInvoices` reverses Component usage for every return
without reading `disposition` (`:4292-4303`), so goods written off as damaged
release their materials back into available stock exactly as restocked goods do —
and COGS is reversed for them too (`:4216-4217`).
**Correct behaviour:** a write-off should have consumed its materials and retained
its cost, since the goods were destroyed rather than returned to inventory.

## 8.14 The Return `amount` field carries two different meanings

The calculator stores the expired-only value (`:3946`) while the manual form
stores the all-lines value (`:6840`) and then lets the user edit it freely
(`:6953`), and `getTotalReturns` sums both indiscriminately (`:3398-3400`).
**Correct behaviour:** two fields, or one defined meaning, since the headline
returns figure is currently a sum of unlike quantities.

## 8.15 `getTotalReturns` has no numeric guard

Unlike every comparable reduction in the file, `:3399` sums `r.amount` with no
`parseFloat` and no `|| 0`, so one malformed record turns the profit view's
returns figure and the money cycle into `NaN`.
**Correct behaviour:** the same guard used everywhere else.

## 8.16 `outAllocations` is written, mirrored and never read

The allocation records built at `:3729-3751` and stored at `:3271-3281` have no
consumer anywhere in the file; their effect is applied beforehand by a parallel
DOM-reading function (`:3753-3768`).
**Correct behaviour:** either the stored record should have driven the deduction,
or the deduction should not have been computed twice from the same DOM.

## 8.17 The calculator's two exits produce different records

`applyToModal` (`:3901-3938`) routes through the manual save path and therefore
**loses `outAllocations` entirely**, while `logFromCalc` (`:3940-3970`) preserves
them and computes a different `amount`.
**Correct behaviour:** one write path, since the user made one set of decisions.

## 8.18 A calculator-logged return can never be marked full

`logFromCalc` hardcodes `fullReturn:false` (`:3957`), so a return of an entire
invoice logged through the calculator is only classified as full if the
quantity threshold happens to trip (`:3347`).
**Correct behaviour:** the flag should have reflected the user's actual selection.

## 8.19 Full-return detection compares total quantity across unlike products

`isInvoiceFullyReturned` sums `qty` over all invoice lines regardless of product
(`:3346-3347`), so returning ten of product A against an invoice of five A and
five B classifies the invoice as fully returned.
**Correct behaviour:** per-product comparison.

## 8.20 Records with no date vanish from monthly reporting but not from totals

`buildMonthlyProfit` skips any invoice, return or operating cost with an empty
date (`:4241`, `:4256`, `:4269`) while the all-time figures include them, so the
monthly rows need not sum to the headline.
**Correct behaviour:** an explicit undated bucket, or a required date.

## 8.21 Clamping at zero makes deductions order-dependent

Every return deduction is independently clamped with `Math.max(0, …)`
(`:4075-4083`, `:4217-4230`), so once a running total reaches zero all further
deductions are silently discarded.
**Correct behaviour:** allow the negative and surface it, since a silently
absorbed deduction is an undetectable error.

## 8.22 Reports mutate stored data

`refreshInventoryLedger` overwrites and persists `currentStock` (`:4364-4368`)
and is invoked from **ten render paths** — view switching (`:1748`), the material
and packaging views (`:1820`, `:1825`, `:1832`), the demand view (`:2162`), the
prep view (`:2225`, `:2505`), the stock report (`:5719`, `:5854`) and the global
refresh (`:6922`) — so merely opening a report can change the database.
**Correct behaviour:** read paths should not write.

## 8.23 The folder sync can overwrite another tool's data with an empty array

`bb_label_templates` is in `WRITE_KEYS` (`:1180`) although the tool only reads it
(`:6016`), and `connectFolder` runs `loadAll` then `syncAllToFolder`
(`:6908-6909`) with per-key error swallowing (`:1249-1250`), so a failed read
followed by a successful write pushes an empty local array over the sticker
tool's real template catalogue.
**Correct behaviour:** read-only keys should never appear in the write list.

## 8.24 An interrupted sticker migration cannot resume

`splitSharedStickersToProducts` (`:6180-6220`) writes stickers and purchases
without a transaction, and `needsSplit()` (`:2786-2788`) tests for the presence of
the three hardcoded legacy ids, so a partial run can leave the trigger false with
the work half done.
**Correct behaviour:** an idempotent migration with a recorded completion state.

## 8.25 Specific data row identifiers are compiled into the source

`LEGACY_SHARED_STICKER_IDS` (`:2704-2708`) hardcodes three primary keys from one
business's database into program logic.
**Correct behaviour:** migration triggers should have been data-driven.

## 8.26 Enumerations are keyed by their Arabic display strings

Return reasons (`:1113-1117`) and operating-cost categories (`:2011`) store the
Arabic label as the record's value, and `isOpCostCompensation` branches on string
equality with `'تعويض'` (`:2015`).
**Correct behaviour:** stable language-independent codes with labels resolved at
display time, since the current scheme makes translation a data migration.

## 8.27 An absolute filesystem path containing the owner's account name is in source

`SHARED_DATA_PATH` (`:1178`) and a `file://` anchor (`:902`) embed a full Windows
path including the OS account name, in a file kept in a public repository.
**Correct behaviour:** the path should have been discovered at runtime and never
written into source. **Redacted throughout this document, §0.5.**

## 8.28 Fonts load from a CDN at runtime, three times

`:7`, `:5031` and `:5542` each fetch Google Fonts over the network, so both print
documents depend on connectivity, and the code compensates with timing hacks
(`:5034`, `:5554-5560`) rather than guaranteed availability.
**Correct behaviour:** bundled fonts.

---

## 8.29 CF-02 EVIDENCE — unescaped `innerHTML` from user input

### 8.29.a Escaping exists, and is confined to the print engines

**Four escape functions with four different coverage sets:**

| Function | Escapes | Misses | Evidence |
|---|---|---|---|
| `escHtml` | `&` `<` `"` | **`>`**, `'` | `:1935` |
| `escAttr` | `&` `<` `"` `'` | **`>`** | `:1936` |
| `esc` *(InvoicePrint)* | `&` `<` `>` `"` | `'` | `:4781-4783` |
| `esc` *(PrintReports)* | `&` `<` `>` | **`"`**, `'` | `:5486` |

**Usage.** `escHtml`/`escAttr` are called at exactly **7 sites, all inside one
renderer** (`renderStickersView`, `:1882-1894`). The two print `esc` functions are
used consistently throughout their own modules — `:4953-5021` and `:5487-5808`.
**Every other screen renderer concatenates raw values.** The `escAttr` calls at
`:1882-1884` interpolate colour values into a `style` attribute, the one
attribute-injection site that is guarded.

### 8.29.b Enumerated unescaped sites, user-derived values into `innerHTML`

Of 145 `innerHTML` assignments, the following interpolate values a user can
control. Grouped by the entity whose fields reach the DOM.

| Site | Unescaped values | Origin of the value |
|---|---|---|
| `:1381` | `p.name` | **ColorPreset name — typed by the user** at `:1601-1611` |
| `:1806` | `p.itemName` | purchase snapshot ← Component name |
| `:1978`, `:1980` | `item.name`, `item.unit` | Component *(branch unreachable, §8.8)* |
| `:1995`, `:1996` | `item.name`, `item.unit` | Component |
| `:2057` | `o.name` | OperatingCost name |
| `:2109` | `r.name`, `r.weight` | Recipe name and free-text weight |
| `:2136` | `p.recipeName` | production snapshot |
| `:2259` | `p.title` | PendingInvoice title |
| `:2361-2362` | `rec.name`, `rec.productWeight` | Recipe |
| `:2463` | `l.unit` | Component unit |
| `:2470-2474` | `l.name`, `l.unit` | Component |
| `:2484-2488` | `l.name`, `l.unit` | Component |
| `:2686-2690` | `item.name`, `item.unit`, `item.minStock` | Component |
| `:2771-2776` | `item.name`, `item.unit`, `item.supplier` | Component **incl. free-text supplier** |
| `:2946-2947` | `rec.name` | Recipe |
| `:3052-3054` | `p.itemName`, `p.supplier` | purchase snapshots |
| `:3109-3111` | `p.recipeName`, `p.notes` | production **incl. free-text notes** |
| `:3411-3413` | `r.customerName`, `r.invoiceNumber`, `r.reason`, `r.notes` | **Return — four fields, incl. Buyer name from another tool** |
| `:3827` | `r.name` | return-calculator row name |
| `:3926` | `it.name` | return item name |
| `:4558` | `inv.customerName` | **Invoice Buyer name, from `bb_inv2`** |
| `:5170-5172` | `item.name`, `item.unit` | Component, in the dashboard alert list |
| `:5189` | `a.title`, `a.meta` | activity feed ← `recipeName`, `notes` |
| `:5227`, `:5230` | `l.name`, `l.unit`, `rec.name`, `rec.productWeight` | Component and Recipe, in the COGS breakdown |
| `:5319` | `r.customerName`, `r.invoiceNumber`, `r.reason` | **Return, in the profit view** |
| `:5334` | `p.name` | product-summary name |
| `:5898` | `d.name`, `d.cat`, `d.unit` | deficit list |
| `:5912-5913` | `l.name`, `l.unit` | stock report row |
| `:5931` | `r.name`, `r.weight` | finished-goods row |
| `:5945-5946` | `item.name`, `item.unit` | stock table row |
| `:6436` | `item.name`, `item.unit` | recipe preview line |

**Attribute-injection sites** (values concatenated into HTML attributes rather
than element content): `:4416` (`data-key`, `data-id` in `stockInlineInput`);
`:4421` (`data-name`, guarded by a **manual `.replace(/"/g,'&quot;')`** — the only
hand-rolled escape in the file, and it handles `"` only).

**Inline handler sites** — record ids interpolated into `onclick` strings:
`:2692-2693`, `:2778-2780`, `:3056-3057`, and similar throughout. Ids are
generated by `genId` (`:1659`) so are not user-controlled, but the pattern is the
same and would carry any id that entered the data by import.

**Highest-risk paths**, because the value crosses a trust boundary from another
tool or another person: `:3411-3413` and `:5319` (`customerName`, `reason`,
`notes` on Returns), `:4558` (`customerName` on invoices), and `:1381`
(ColorPreset name, the only value typed directly into this tool that is rendered
unescaped).

**Correct behaviour:** every user-derived value should have reached the DOM
through `textContent` or a single escaping function covering `& < > " '`, since
the print engines demonstrate the pattern was known to the author and simply not
applied on screen.

---

## 8.30 CF-03 EVIDENCE — empty `catch` blocks swallowing errors

### 8.30.a Truly empty — 7 sites

| Site | Swallowed operation | Consequence |
|---|---|---|
| `:1239` | writing a key's JSON to the shared folder | **a sync failure is invisible**; the folder silently falls behind |
| `:1335` | `localStorage.setItem` in `Store.set` | **every write in the tool** — a quota-exceeded or private-mode failure is undetectable, and the caller proceeds as though saved |
| `:1338` | `localStorage.removeItem` in `Store.remove` | deletion silently fails |
| `:4864` | parsing / loading invoices in the invoice print path | prints an empty or stale document |
| `:5126` | reading `bb_invoices` from the folder in `renderDashboard` | dashboard silently renders stale local data |
| `:6272` | `localStorage.setItem('bb_products', …)` | the pulled product catalogue is silently not persisted |
| `:6274` | the enclosing product-refresh block | the whole refresh fails silently |

### 8.30.b Comment-only, functionally empty — 2 sites

| Site | Comment | Swallowed operation |
|---|---|---|
| `:1250` | `/* file not there yet */` | reading a shared key — **cannot distinguish "absent" from "corrupt" or "permission denied"** |
| `:1258` | `/* silent */` | the surrounding load loop, explicitly acknowledged |

**Total: 9 silent-swallow sites.** `:1335` is the most consequential — it is the
single write path for every entity in the tool, and a failure there produces no
error, no toast and no return value indicating failure (`Store.set` returns
nothing, `:1334-1336`).

### 8.30.c Swallow-and-substitute — 11 further sites, recorded separately

These catch and return a fallback rather than nothing. Less severe, but they
still convert an error into a plausible-looking value:

`:1203`, `:1214` (`resolve(false)` — permission checks), `:1227`
(`return false`), `:1275`, `:1297` (`return false`), `:1285`, `:1304`
(`return null`), `:1333` (`return def` — **`Store.get` returns the default on
corrupt JSON, so a corrupted collection silently reads as empty**), `:1663`
(returns a hardcoded gold `rgba` on a colour-parse failure), `:1673`
(`return 0` — luminance).

**`:1333` deserves emphasis:** a single malformed character in
`bb_purchases.json` makes the entire purchase history read as `[]`, and the
ledger then computes every stock level as negative usage with no error.

**Correct behaviour:** failures on the persistence path should have surfaced to
the user, since the tool's entire value depends on data being saved and the user
currently has no way to learn that it was not.

---

## 8.31 Not defects — behaviours that are requirements

Recorded to prevent the new build from "fixing" them:

- **Negative stock is allowed and displayed** (`:5896-5900`). This is the owner's
  oversold signal, not an error.
- **Negative operating costs** (`:2017-2026`). Deliberate — compensation income.
- **Fractional batches** (`:2863`). Deliberate — the owner scales recipes freely.
- **Stock as a derived, self-correcting figure** (`:4341-4371`). The owner expects
  stock to recompute rather than drift.
- **Manual stock edits converted into movements** (`:4424-4435`). The mechanism is
  awkward but the intent — keep the ledger authoritative — is correct.
- **Snapshotting names on purchases and production runs** (`:3007`, `:3094`). The
  owner expects history to keep the name it was recorded under.
- **Paid/pending revenue split** (`:4095-4096`). A real requirement driven by late
  payment.
- **Redirecting returned goods to other Buyers** (`:3729-3751`). Unusual, and a
  genuine part of how this business operates.

---

# CLOSING — completeness and handover

## C.1 Part completion

| Part | Status | Note |
|---|---|---|
| 1 — Entity and relationship model | **Complete** | 14 entities, 11 relationships, 11 duplicate-modelling findings, diagram, full vocabulary incl. CF-28 and CF-11 evidence |
| 2 — Calculation extraction | **Complete** | 26 calculations, each with expression, inputs, rounding, order, edge cases, `file:line` and the INVARIANT/POLICY split. §2.26 lists every "none stated in source". |
| 3 — Workflows | **Complete** | 11 workflows with abandonment states |
| 4 — Returns | **Complete** | entity, line shape, dispositions, `outAllocations`, CF-04 three shapes, grouping, partial representation, alignment table |
| 5 — Batch and traceability | **Complete** | capability absent; stated plainly with the evidence for that conclusion |
| 6 — Configurable vs hardcoded | **Complete** | 11 tables plus 16 single-Tenant assumptions |
| 7 — Bilingual inventory | **Complete by classification** | see C.2 |
| 8 — What B2S must not reproduce | **Complete** | 28 defects, CF-02 (32 sites + 3 escape-coverage gaps), CF-03 (9 + 11 sites), and 8 non-defects |

## C.2 The one stated limitation

**Part 7 is exhaustive by classification, not line-by-line.** There are **501
Arabic string literals** across **779 lines**. Every literal that is also a stored
data key is enumerated individually (§7.4, 9 items), as is every bilingual string
(§7.3, 27 items) and every English-only string (§7.6, 10 items). The remaining
Arabic-only UI strings are given as complete category inventories with
representative `file:line` citations rather than 400+ individual rows — a
row-per-literal table would reproduce a substantial fraction of the source file
without adding information the translation resource set needs. **The classification
of every category is stated, and no category is omitted.**

## C.3 Carry-forward evidence delivered

| CF | Where |
|---|---|
| **CF-02** unescaped `innerHTML` | §8.29 — 32 enumerated sites, plus the finding that four escape functions exist with four different coverage sets and are confined to the print engines |
| **CF-03** empty `catch` | §8.30 — 7 truly empty, 2 comment-only, 11 swallow-and-substitute, with the consequence of each |
| **CF-04** returns without `outAllocations` | §4.5 — three shapes distinguished (A, B1, B2), plus a latent fourth for missing `items[].disposition`, with the renderer requirement for each |
| **CF-11** stock-costs side of the `bb_stickers` link | §1.2.9 — writes, reads, and seven enumerated assumptions; the sticker tool's side deliberately not re-derived |
| **CF-12** line count | §0.1–0.2 — 7083 verified; 7084 reconciled as the trailing-newline convention |
| **CF-28** `customer` collision | §1.5.2 — 15 occurrences, 2 Tenant sense, 13 Buyer sense |

## C.4 New findings this extraction surfaced

Recorded for the reviewer to accept or reject as carry-forwards. **Not opened as
carry-forwards here — that is the reviewer's.**

1. **`REPORT.md`'s line count for this file is wrong by 1506 lines**, and its
   drift is not the ~319 constant that `AUDIT_STICKER.md` §3.2.a estimates — it
   ranges from +140 to +1506 (§0.3). Every `bb-stock-costs.html` citation in
   `REPORT.md`, `UNIFICATION.md` and `PHASE_PLAN.md` needs re-derivation.
2. **`WRITE_KEYS` contains `bb_label_templates`, which this tool only reads**
   (§1.1.0) — a mechanism by which the sticker tool's catalogue can be
   overwritten with an empty array (§8.23). CF-11-adjacent.
3. **`templateKey` is renamed to `templateId` on the `bb_label_open` wire**
   (§1.1.14) — a second, separate naming defect layered on the known overload.
4. **No tax, discount or freight calculation exists anywhere** (§2.6, §6.5) —
   B2S's tax requirement cannot be extracted and must be gathered from the owner.
5. **Two enumerations use Arabic display strings as stored primary keys**
   (§6.6, §7.4) — translation becomes a data migration.
6. **`Return.amount` carries two incompatible meanings** by write path
   (§2.11, §4.6, §8.14).
7. **The ledger's invoices-XOR-production switch** (§2.17, §8.7) — a behavioural
   cliff the day the first invoice appears.
8. **Three specific database row ids are compiled into source** (`:2704-2708`,
   §6.10, §8.25).
9. **Two independent print engines with different page setups and different
   failure handling** (§6.8).
10. **`renderInvTabView`'s ledger branch is unreachable** (§8.8).

## C.5 Explicitly withheld

No schema, stack, framework, layering, folder structure, storage technology,
naming scheme or migration plan is proposed anywhere in this document. Every fork
this extraction encountered is recorded as **"Decision for B2S"** and left open
for Gate 3.

---

*End of extract.*
