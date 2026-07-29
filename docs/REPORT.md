# Balance Bites — Template Audit Report

> **Scope:** Static analysis only. No source files were modified. This report documents six single-file HTML business tools built for **Balance Bites** (an Egyptian healthy-snacks brand, bilingual AR/EN, gold + dark-brown identity) ahead of unifying them into one white-label web app.
>
> **Method:** Every file was read in full (no sampling). Claims cite `file:line`. Arabic strings are quoted verbatim.
> **Auditor pass date:** 2026-07-16.

---

## 0. Executive Summary

Six tools were analysed (14,529 source lines total). They fall into two families:

1. **Design/artwork tools** (client-side only, `localStorage` presets, print-to-paper): `balance-bites-label-v3.html`, `balance-bites-label-editor- latest.html`, `balance-bites-carton (2).html`, `balance-bites-stand.html`.
2. **Business/data tools** (share one on-disk data folder via the File System Access API + IndexedDB handle): `balance-bites-invoice-pro.html` (the data producer) and `bb-stock-costs.html` (the data consumer/analytics).

**Headline findings**

- **The "Balance Bytes" typo IS present — once — in `balance-bites-label-v3.html:698-699`.** The Top-Label mode default reads `BALANCE` (`:698`) / `BYTES` (`:699`, `value="BYTES"`), i.e. it renders "BALANCE BYTES" on the top/lid sticker unless the user edits it. The all-caps `BYTES` is why a naive case-sensitive grep for `Bytes` misses it. **Every other brand occurrence across all six files is the correct `Balance Bites`/`BITES`.** Fix the one default value at `label-v3:699`.
- **The reported "Illegal return statement" in Stock & Costs is NOT present in this version.** The init routine is a properly wrapped `async` IIFE with `try/catch` (`bb-stock-costs.html:5541-5574`). The IndexedDB/FSA calls are individually guarded. That specific crash appears already fixed; the remaining Brave `file://` risk is graceful-degradation, not a crash.
- **The real blocker for deployment is the shared-folder architecture.** Two tools hardcode an absolute Windows path and a `file:///` link and coordinate through the **File System Access API** + a persisted **IndexedDB directory handle**. None of this exists on Vercel. See `bb-stock-costs.html:1012`, `:762`; `balance-bites-invoice-pro.html` FSA block.
- **Massive hardcoding of brand identity** across all six files (brand name, `BB` monogram, `#c9a84c` gold, `EGP`, `balancebites.com`, product/flavor lists, Arabic UI, label dimensions). Extracted into the registry in §2E / the combined table in §4.
- **Heavy code duplication** of the same subsystems (preset save/load bar, JSON import/export, color/hex helpers, toast, print scaffolding). Estimated 45–60% conceptual duplication. See §3.
- **Schema drift**: "product", "customer", and "preset" are shaped differently in almost every tool; there is no shared data contract. See §3.2.
- **Security posture is "personal tool", not "deployed app"**: customer names/phones sit in plain `localStorage`/JSON; on-screen renderers inject user data into `innerHTML` without escaping (invoice *print* output is escaped, but the live tables are not).

**Verdict (one line, full version in UNIFICATION.md):** Unification is feasible and the tools are conceptually consistent enough to merge; the single biggest blocker is replacing the `file://` + File System Access + shared-folder data layer with a real hosted datastore.

---

## 1. Phase 1 — Inventory

| # | File | Size | Lines | Family | One-line purpose |
|---|------|------|-------|--------|------------------|
| 1 | `bb-stock-costs.html` | 269.6 KB | 5577 | Business/data | Inventory, COGS/BOM, purchases, production, returns, op-costs, profit & stock reports; **consumes** Invoice Pro's data folder. |
| 2 | `balance-bites-invoice-pro.html` | 177.1 KB | 3498 | Business/data | Invoice builder + customer/product catalog + reports dashboard; **produces** the shared data folder. |
| 3 | `balance-bites-label-editor- latest.html` | 92.7 KB | 2180 | Design | Multi-panel wrap-label set (front/neck/seal/back) with bilingual regulatory text + nutrition; `localStorage` presets. |
| 4 | `balance-bites-label-v3.html` | 129.9 KB | 2041 | Design | Flexible label/sticker/cup designer (rect/tapered-cup/circle) with IndexedDB presets + PNG export. |
| 5 | `balance-bites-stand.html` | 64.0 KB | 774 | Design | Counter Display Stand (CDS 140) editor: mirror face, shelf, tapered sides. |
| 6 | `balance-bites-carton (2).html` | 36.4 KB | 459 | Design | Shipping-carton (24/48-pack) 4-face template. |
| — | `cursor-audit-prompt.md` | 9.5 KB | 86 | (prompt) | The audit brief (not a tool). |

> **Line counts** are from `System.IO.File.ReadAllLines` (authoritative; an earlier `Measure-Object -Line` pass undercounted every file). All `file:line` citations below were taken from the line-numbered file reader and remain accurate.

**Working plan used:** files >1500 lines read in chunks; `bb-stock-costs`, `carton`, and `stand` were read line-by-line by the lead auditor; `invoice-pro` and the two label editors were deep-read by parallel analysis passes and cross-checked with targeted greps.

---

## 2. Phase 2 — Per-file deep analysis

### 2.1 `balance-bites-invoice-pro.html` (3498 lines)

**A. Purpose & workflow.** The invoicing front-end and **data producer** for the shared folder. A shop user opens the tool → the live A4 "page" is an editable invoice → they pick a customer (`openCustomerPicker`, `:811`) and add products from a catalog picker (`:756-780`) → set qty/price/discount → `💾 حفظ` saves to invoice history (`saveInvoiceToHistory`, `:2476`) → `🖨 طباعة` prints (`window.print()`, `:677`). It also owns customer/category/product CRUD, a price-list printout, a reports dashboard, and can absorb "prep drafts" pushed from Stock & Costs. When "ربط مجلد" (connect folder) is used, every managed key is mirrored to `<key>.json` in the shared folder for Stock & Costs to read.

**B. Feature list (exhaustive).**
- Editor panel with 7 accordions (`:467-672`): Theme/colours, Brand & texts (incl. price-list settings), Customers, Categories, Products catalog, Pending drafts, Invoice history.
- Live invoice page: header/monogram/brand/doc-title, meta bar (customer + `#INV-001` number, `:806-816`), editable line-items table, subtotal/discount/total, notes, footer.
- Customer CRUD + search (`CustomerMgr`, `:1243`), form fields name/phone/address/notes (`:573-576`).
- Category CRUD with colour, quick-add row (`CategoryMgr`, `:1370`; `:597-601`).
- Product catalog CRUD + search + category filter tabs (`ProductMgr`, `:1432`; `:614-641`).
- Product picker modal with per-category bulk add and multi-category selection (`:756-780`).
- Customer picker + per-customer history overlay showing prior invoices, click-to-load (`:723-754`, `loadInvoiceFromCustHist` `:2613`).
- Price-List print: select products, print a branded price list (`PriceListPrint`, `:616-620`, `:1626`).
- Reports dashboard overlay, 4 tabs: Total / per-Customer / Top-product / per-Product, with date range + sort (`:687-722`, `switchReport`/`runReport`).
- Pending/draft invoices from Stock & Costs prep, "issue draft" flow (`:646-658`, `completePendingInvoice` `:454`).
- Invoice history search, duplicate invoice (`:1909-1918`), delete.
- Colour-preset grid (4 built-ins + custom save/delete), folder connect status, settings save.
- Preset bar (`_PBK='bbinv'`) save/load/export/import of the whole tool state (`:2975-3011`).

**C. Data model (as stored).**
- **Customer** (`KEY='bb_customers'`, `:1243`): `{id, name, phone, address, notes}`.
- **Category** (`KEY='bb_categories'`, `:1370`): `{id, name, color}`; defaults `كراكرز · Crackers` / `وجبات خفيفة · Snacks` / `مشروبات · Beverages` (`:1200-1204`).
- **Product** (`KEY='bb_products'`, `:1432`): `{id, name, packType, weight, unitPrice, categoryId}` (`:1444`).
- **Invoice item** (`:1121`, `:1460`): `{productId, name, packType, weight, categoryId, qty, price}`.
- **Invoice** (`saveInvoiceToHistory`, `:1854-1861`): `{id, invoiceNumber, date, customerId, customerName, customerPhone, items[], subtotal, discount, discountAmount, total, notes, …}` (stored under `bb_invoices`).
- **Settings `S`** (`:1106-1119`): brand/monogram/docTitle/web/footNote, `cur:'EGP'`, `discount`, `discLabel`, all table headers and price-list labels (bilingual).
- **Colours `C`** (`:1103-1104`) + **Color preset** (`:1137-1142`): `{id, name, bg, gold, txt, mut, row, tot, grand}` — **identical defaults to Stock & Costs** (`cp_def1..4`).
- **Default products** (`:1207-1211`): `كراكرز زعتر · Za'atar Crackers`, `كراكرز بابريكا · Paprika Crackers`, `كراكرز فلفل أسود · Black Pepper Crackers` (Pack, 40g, 45).

**D. Persistence layer.**
- **Managed `localStorage` keys** (`MANAGED`, `:953`): `bb_customers`, `bb_products`, `bb_invoices`, `bb_categories`, `bb_color_presets`, `bb_inv2`, `bb_active_color_preset_id`, `bb_pending_invoices`. Extra: `bb_customers`/`bb_products`/`bb_categories` (managers), preset bar `bbinv_pb` (`:2979-2980`).
- **IndexedDB:** `bb_filestore_v1`, store `h` holds the persisted directory handle (`:959-960`) — **same DB/store as Stock & Costs**.
- **File System Access API:** `showDirectoryPicker({mode:'readwrite'})` (`:1020`); reads `getFileHandle(key+'.json')` into localStorage (`:1033-1037`); writes each key back as `<key>.json` (`:1046`).
- **Store abstraction** (`:1087-1096`): localStorage JSON get/set/remove; `set` mirrors to folder when connected. Empty `catch(e){}` on set/remove.
- **Invoice numbering:** `#INV-001` default (`:816`); next = max existing numeric +1, `#INV-'+String(n).padStart(3,'0')` (`:1912`, `:2609`); optional **per-customer** counting so each customer's first invoice is `001` (`:2600-2609`).

**E. Hardcoded values registry.**

| Value | BrandConfig key | Input | file:line |
|---|---|---|---|
| `Balance Bites` (brand) | `brand.name` | text | `:451`, `:510`, `:796`, `:1107` |
| `BB` monogram | `brand.monogram` | text | `:509`, `:792`, `:1107` |
| `balancebites.com` | `brand.web` | text | `:512`, `:1108` |
| `فاتورة · Invoice` doc title | `invoice.docTitle` | text | `:511`, `:797`, `:1107` |
| `شكراً لثقتكم · Thank you for your order` | `invoice.footNote` | text | `:513`, `:1108` |
| `EGP` currency | `locale.currency` | dropdown | `:516`, `:1109`, + render sites |
| Discount label `خصم · Discount` | `invoice.discountLabel` | text | `:520`, `:1109` |
| Table headers `المنتج · Item`/`الكمية`/`سعر الوحدة`/`الإجمالي` | `invoice.labels.*` | text | `:523-531`, `:1110-1111` |
| Price-list titles/columns (`قائمة الأسعار · Price List`, …) | `invoice.priceList.*` | text | `:536-551`, `:1112-1118` |
| Colours `#0a0804`/`#c9a84c`/`#e8e0cc`/`#6b5e3a`/`#12100a`/`#1e1a0f` | `theme.colors.*` | color picker | `:476-488`, `:1103-1104` |
| Built-in palettes Dark Gold/Obsidian Blue/Forest Night/Warm Ivory | `theme.presets[]` | repeatable list | `:1137-1142` |
| Default categories (Crackers/Snacks/Beverages, bilingual) | `catalog.categories[]` | repeatable list | `:1200-1204` |
| Default products (Za'atar/Paprika/Black Pepper Crackers, 40g, 45) | `catalog.products[]` | repeatable list | `:1207-1211` |
| Invoice number format `#INV-001` (3-digit seq) | `invoice.numberFormat` | text | `:816`, `:1912`, `:2609` |
| Fonts (Playfair/DM Sans/Syne/Caveat) via Google Fonts | `theme.fonts.*` | dropdown | head `<link>` |
| A4 portrait, margins 16mm/14mm (page) & 12mm/14mm (export) | `print.invoice.*` | number | `:261`, `:1626` |

Arabic UI is pervasive and hardcoded (accordion labels, toasts, confirms). Verbatim samples: `فاتورة جديدة` (`:453`), `العملاء` (`:560`), `كتالوج المنتجات` (`:609`), `مسودات التحضير` (`:649`), `سجل الفواتير` (`:663`), `جاري الفحص...` (`:460`).

**F. Print & rendering logic.** Two paths:
1. **On-page invoice:** `window.print()` (`:677`, `:934`) prints the live `#pageWrap`; `@media print{@page{size:A4 portrait; margin:16mm 14mm}}` (`:260-261`) hides the editor/preset bars (`:439`).
2. **Price-list / secondary docs:** builds an HTML string and opens a **new window** (`window.open('', '_blank', …)`, `:1750`) that self-prints on load (`:1749`); its own `@page{size:A4; margin:12mm 14mm}` (`:1626`). User content escaped with `esc()` in the table builders (`:1698`).
- Only A4 assumed; no alternate paper sizing.

**G. Bilingual / RTL.** `<html lang="ar" dir="rtl">` (`:2`); Arabic-first UI with `· English` accents on customer-facing labels. Phone input forced `dir="ltr"` (`:574`). Most Arabic is **editable** via the Brand accordion settings (`S.*`), which is better than the design tools — but default catalog/category names and all editor chrome remain hardcoded Arabic.

**H. Bugs, smells & fragility.**
- **[High] Unescaped `innerHTML` in on-screen card/list renderers.** Colour-preset names and other user strings are concatenated raw (`:1181-1190`); customer/product/invoice cards mostly use `textContent`/`esc()`, but preset names and some list rows are raw. XSS-capable once data is shared. (Print/price-list output *is* escaped, `:1698`.)
- **[Medium] Silent failures.** Empty `catch(e){}` in `Store.set/remove` (`:1091-1096`) and FSA read/write hide quota/permission errors.
- **[Medium] Brave `file://` restrictions** on FSA/IndexedDB — degrades to "no folder", so cross-tool sync silently stops.
- **[Medium] Invoice number collisions** possible: numbering is derived from `max(existing)+1` at save time; two unsaved invoices, or per-customer mode mixing with global history, can duplicate a number (`:1909-1912`, `:2600-2609`).
- **[Low] Whole-app preset export** (`bbinv_pb`) serialises the entire state incl. customer data into a JSON download (`:3008-3011`) — a privacy footgun if shared.
- **[Info] Init is a guarded async IIFE** (state restore, `:1129`), same safe pattern as Stock & Costs — no top-level `await`/`return` bug.

**I. External dependencies.** Google Fonts only (head `<link>`). Fully offline-capable otherwise (all logic inline; FSA/IndexedDB are local).

**J. Security & privacy.** Highest-risk file for PII: stores customer names, phones, addresses, and full invoice history in plain `localStorage` and plaintext `bb_*.json` files on disk. No auth/encryption. Whole-state export can leak PII. Unescaped preset/list `innerHTML` is the main XSS vector before multi-user.

---
### 2.2 `balance-bites-label-v3.html` (2041 lines)

**A. Purpose & workflow.** A geometry-aware **label / sticker / cup-wrap designer**. The user picks a shape mode, edits brand + regulatory text in the sidebar, sees a live preview, then either **prints at exact cm** or **exports a PNG** (for a print shop). It is the most technically advanced of the design tools because it can unwrap a **tapered (conical) cup** into a flat printable arc.

**B. Feature list (exhaustive).**
- Shape modes: **rectangular** back label (`sW`×`sH` cm, `:436-437`), **tapered/conical cup** unwrap (`tpDTop`/`tpDBot`/`tpCupH`/`tpLblH`/`tpOffsetBot`, `:448-456`), **circular** seal/dimension sticker (`tSz`, logo text `BB`, `:684-697`), **custom** size (`cW`/`cH`, `:724-725`).
- Conical unwrap math: computes apex radius, inner/outer arc radii `R1_cm`/`R2_cm`, arc degrees, slant height, bounding box, live-reported in a debug box (`:911-962`).
- Content fields: brand/logo (`BB`), name lines 1–2 EN/AR, ingredients title+body EN/AR, allergen AR, serving-tip title+body EN/AR, best-before/production date labels EN/AR, storage AR (`:204`, `:347-408`).
- Crop modes incl. `Exact Label Crop (with 3mm safety buffer)` (`:467`).
- **PNG export** via `dom-to-image` `toPng` at quality 1.0, multiple crop paths (`:1756-1767`).
- **Print** at dynamic exact-cm `@page` or A4/Letter/A3 (`:1590-1600`), plus a live BBox/size readout (`:1607-1608`).
- **Preset bar** with 30 slots (`_PBMAX=30`, `:853`): save/load/export single (`template:'bbbacklabel'`, `:1932`) / **bulk export** (`template:'bbbacklabel_bulk'`, `:1940-1943`) / import / wipe.

**C. Data model.** No business entities; a flat visual **state** read from inputs and (for cups) derived geometry (`:911-962`). Preset record: `{name, date, state}` stored by `name` (IndexedDB keyPath, `:857`).

**D. Persistence layer.** **IndexedDB-based** (unlike carton/stand): DB `BBLabelDB`, object store `presets` with `keyPath:'name'` (`:856-857`); async list/put/delete (`_dbList`/`_dbPut`). **Migration:** on init it sweeps legacy `localStorage` keys `['bbbacklabel_pb3','bbbacklabel_pb','bbbacklabel_pb2']`, moves any presets into IndexedDB, then deletes the old keys (`:2011-2021`) — this is the `bbbacklabel_pb → v3` lineage noted in the brief. Export = JSON download; import = file read.

**E. Hardcoded values registry.**

| Value | BrandConfig key | Input | file:line |
|---|---|---|---|
| `Balance Bites Label Designer` (title) | `brand.name` | text | `:7` |
| **`BALANCE` / `BYTES` (Top-Label default — TYPO, should be `BITES`)** | `brand.nameLines` | text | `:698-699` |
| `WHOLE FOOD SNACKS` / `NATURALLY POWERFUL` (top subtitles) | `brand.taglineEn` | text | `:700-701` |
| `BB` brand/logo text | `brand.monogram` | text | `:204`, `:697` |
| Default sizes: back 17×4.5 cm; cup Ø9/Ø7, H9, label 7 cm | `print.label.defaults` | number | `:436-456` |
| AR field placeholders (`اقتراح التقديم:`, `المكونات:`, `أفضل قبل:`, `تاريخ الإنتاج:`, `يُحفظ في مكان بارد وجاف.`) | `catalog.labelText.ar` | text | `:347-408` |
| Fonts (Playfair/DM Sans/Syne/Caveat) | `theme.fonts.*` | dropdown | head |
| `dom-to-image` CDN (v2.6.0) | (bundle locally) | — | `:6` |

**F. Print & rendering logic.** Uses **PPC (pixels-per-cm)** for on-screen scaling and real-cm geometry. Print injects a dynamic style tag: exact-size mode emits `@page{size:<bw>cm <bh>cm; margin:0}` (`:1600`), else A4/Letter/A3 portrait (`:1593-1595`); the label element is forced to real cm with `page-break-inside:avoid` (`:1590`). PNG export path uses `dom-to-image` instead of print. This is a strong real-unit approach (comparable to stand's).

**G. Bilingual / RTL.** Rich bilingual support: paired EN/AR fields throughout with `dir="rtl"` on the Arabic inputs/textareas (`:347-408`, `:619`). All Arabic is **editable** (fields, not baked-in) — the best-localised design tool.

**H. Bugs, smells & fragility.**
- **[Medium] Brand typo: `BYTES`.** The Top-Label mode ships the default `value="BYTES"` (`:699`, next to `value="BALANCE"` at `:698`), so the top/lid sticker renders **"BALANCE BYTES"** until edited. This is the "Balance Bytes" issue flagged in the brief — present only here, all-caps.
- **[High] Hard dependency on a CDN for PNG export.** `dom-to-image` is loaded from `cdnjs` (`:6`); offline (the tools' normal `file://` habitat) the `📷` PNG export throws. Printing still works.
- **[Medium] Unescaped `innerHTML`** for preset names in the slot bar (`p.name` concatenated, `:1997`) and label content builders — a `<` in a name/field breaks markup.
- **[Low] Migration swallows errors** (`catch(e){}`, `:2020`) — a corrupt legacy key is silently skipped.
- **[Low] IndexedDB under Brave `file://`** may be isolated/blocked; `dbInit` failure would leave presets unavailable (init still runs `render()`).

**I. External dependencies.** `dom-to-image` 2.6.0 (`:6`) **and** Google Fonts. Offline: PNG export breaks; everything else works.

**J. Security & privacy.** No customer PII (own artwork). Same unescaped-`innerHTML` fragility if presets are shared.

---
### 2.3 `bb-stock-costs.html` (5577 lines)

**A. Purpose & workflow.** A full back-office manager for a small food producer. It does NOT create invoices; it **reads** the invoices/products/settings that Invoice Pro writes into a shared folder, then layers inventory, recipe/BOM costing, production, purchasing, returns, operating costs, and printable reports on top. Flow: user opens the tool → optionally "ربط مجلد" (connect folder) to load `bb_invoices.json`/`bb_products.json`/`bb_inv2.json` (`:1420` connectFolder, `:1078` loadAll) → works across 14 tabs (`:434-449`) → prints A4 reports through a hidden iframe.

**B. Feature list (exhaustive).**
- 14 main tabs (`:434-449`): Dashboard, Invoices (paid/pending), COGS, Profit, Stock value, Purchases, Raw materials, Packaging, Stickers, Recipes, Prep (BOM calculator), Production, Returns, Operating costs.
- Global "print report" dropdown with 5 report types + "fit to one A4 page" toggle (`:421-431`).
- Dashboard: stat cards, "money cycle" cash-flow summary, low-stock alerts, recent activity (`:454-462`, `:3950-3969`).
- Invoices view: paid/pending cards, per-invoice paid/pending toggle, multi-select + batch invoice printing with per-preset colors and adjustable mm margins (`:466-500`, `:3512-3945` `InvoicePrint`).
- COGS table with margin %, sell-price pulled from linked product (`:503-516`, `:4433-4467`).
- Profit view: gross/net/cash profit, monthly profit bars, returns, per-product profit (`:519-535`, `:4513-4570`).
- Stock value report: purchases − sold reconciliation, per-category rollups, finished-goods stock, editable inline stock inputs (`:538-572`, `:4230-4269`).
- Prep/BOM calculator: multi-line product list, aggregate ingredient needs, "full quantity" vs "net of on-hand" modes, per-product or aggregate view, saveable **draft invoices** ("مسودة فاتورة") that can be merged and loaded (`:711-768`, `:2558-2600` `calcPrepAggregate`, `:2826-2911` `PendingInvoiceMgr`).
- Modals: item (material/package/sticker), recipe, purchase, production, return, operating-cost (`:804-998`).
- Appearance: color-preset grid shared with Invoice Pro, 4 built-in themes, save/delete custom presets, live theme engine with WCAG contrast picking (`:1139-1493`).
- Legacy sticker "split by flavor" migration button (`:649`, `:4937-5049`).
- Folder connect/reconnect with status dot (`:384-389`, `:1104-1119`).

**C. Data model (as stored).** All arrays/objects in `localStorage` (mirrored to JSON files when connected).
- **Material/Package** (`makeInventoryMgr`, `:2317-2331`): `{id, name, unit, costPerUnit, currentStock, minStock, supplier, notes}`.
- **Sticker** (`:2391-2415`): material shape **plus** `{productId, templateKey}` (links a sticker to an Invoice-Pro product/flavor).
- **Recipe/BOM** (`:2488-2502`): `{id, name, batchSize, ingredients:[{itemId,itemType,qty}], productId, productWeight, unitPrice}`.
- **Purchase** (`:2665-2676`): `{id, date, itemId, itemType, itemName, qty, costPerUnit, totalCost, supplier}`.
- **Production run** (`:2758-2759`): `{id, date, recipeId, recipeName, unitsProduced, notes, deductions:[{itemId,itemType,name,qty}], isAdjustment}`.
- **Payment status** (`:2799`): map `{ [invoiceId]: {status:'paid'|'pending', updatedAt} }`.
- **Pending/draft invoice** (`:2874-2888`): `{id, status, title, createdAt, updatedAt, customerId, customerName, customerPhone, notes, items:[{productId,name,packType,weight,categoryId,qty,price}], prepLines:[{recipeId,units}], prepSummary, completedInvoiceId}`.
- **Return** (`:2923-2932`): `{id, date, invoiceId, invoiceNumber, customerName, amount, reason, notes}`.
- **Operating cost** (`:2974-2981`): `{id, date, name, category, amount, notes}`.
- **Color preset** (`:1142-1145`): `{id, name, bg, gold, txt, mut, row, tot, grand}`.
- **Consumed (read-only) from Invoice Pro:** `bb_products`, `bb_invoices`, `bb_inv2` (`:1016`).

**D. Persistence layer.**
- `localStorage` keys (own, `WRITE_KEYS` `:1014`): `bb_materials`, `bb_packages`, `bb_stickers`, `bb_recipes`, `bb_purchases`, `bb_production`, `bb_color_presets`, `bb_invoice_payments`, `bb_returns`, `bb_operation_costs`, `bb_active_color_preset_id`, `bb_pending_invoices`.
- `localStorage` keys (read/shared, `READ_KEYS` `:1016`): `bb_products`, `bb_invoices`, `bb_inv2`.
- `localStorage` keys (extra prefs): `bb_active_theme` (`:1350`), `bb_prep_lines` (`:2053`), `bb_prep_ing_view` (`:2070`), `bb_prep_prod_mode` (`:2085`), `bb_prep_print_mode` (`:2115`), `bb_inv_print_margins` (`:3524`), `bb_inv_print_preset_id` (`:3749`), `bb_print_fit_one` (`:4429`).
- **IndexedDB:** database `bb_filestore_v1`, object store `h`, key `dir` stores the persisted directory handle (`:1021-1022`, `:1058`).
- **File System Access API:** `showDirectoryPicker` (`:1057`), `getFileHandle`/`createWritable` write each key as `<key>.json` (`:1089-1093`); `loadAll` reads them back (`:1078-1087`).
- **Shared folder (hardcoded):** `SHARED_DATA_PATH = 'C:\\Users\\Marco\\Desktop\\BALANCE BITES\\invoices customers\\saved data'` (`:1012`) — must match the folder Invoice Pro uses. Also a hardcoded `file:///C:/Users/Marco/Desktop/balance-bites-invoice-pro.html` cross-link (`:762`).
- **Store abstraction** (`:1127-1134`): `Store.get/set/remove` = localStorage JSON, and `set` also mirrors to the folder when connected.

**E. Hardcoded values registry.** (BrandConfig key · wizard input · file:line)

| Value | BrandConfig key | Input type | file:line |
|---|---|---|---|
| `Balance Bites` (brand) | `brand.name` | text | `:381`, `:3515`, `:3893`, `:4275`, `:4403` |
| `Stock & Costs Manager` / `Stock & Costs` (sub) | `brand.tagline` | text | `:382`, `:4275` |
| `BB` (monogram) | `brand.monogram` | text | `:3515` |
| `balancebites.com` (web) | `brand.web` | text | `:3516` |
| `شكراً لثقتكم · Thank you for your order` (foot note) | `invoice.footNote` | text | `:3516` |
| `#c9a84c` gold, `#060603`/`#0a0804` bg, `#e8dfc8`/`#e8e0cc` text, `#7a6f58` muted, `#0e0d0a` row | `theme.colors.*` | color picker | `:1142-1146`, `:1408-1409`, `:1496`, `:3521` |
| Built-in palettes Dark Gold / Obsidian Blue / Forest Night / Warm Ivory | `theme.presets[]` | repeatable list | `:1142-1146` |
| `EGP` currency (pervasive; also `toLocaleString('ar-EG')`) | `locale.currency` | dropdown | `:3517`, `:3649`, and ~120 render sites |
| Fonts Playfair Display / DM Sans / Syne / Tajawal | `theme.fonts.*` | dropdown | `:7`, `:3894`, `:4404` |
| Operating-cost categories (إيجار/مرافق/أجور/صيانة/نقل/تسويق/أخرى) | `catalog.opCostCategories` | repeatable list | `:779-786`, `:978-985` |
| Return reasons (تالف/خطأ في الطلب/جودة/رفض العميل/أخرى) | `catalog.returnReasons` | repeatable list | `:950-954` |
| A4 page + default print margins `{t16,r14,b16,l14}` | `print.page` / `print.margins` | number | `:3523`, `:4278` |
| `SHARED_DATA_PATH` absolute Windows path | (deployment; remove) | — | `:1012` |
| `file:///…/balance-bites-invoice-pro.html` | (deployment; remove) | — | `:762` |
| Doc title `فاتورة · Invoice` etc. (invoice labels) | `invoice.labels.*` | text | `:3515-3519` |

Arabic UI is extensive (all tab labels, table headers, toasts, modal fields). Representative verbatim samples: `لوحة التحكم` (`:435`), `الفواتير` (`:436`), `المواد الخام` (`:441`), `تكلفة الإنتاج لكل وحدة · COGS Per Unit` (`:505`), `جاري الفحص...` (`:386`), `اربط المجلد المشترك لتحميل الفواتير` (`:3465`).

**F. Print & rendering logic.** Two separate print engines:
1. **Invoice reprint** (`InvoicePrint`, `:3512-3945`): opens a **new window** (`window.open` `:3898`), writes a full A4 doc with CSS variables from a color preset (`:3803-3809`), `@page{size:A4 portrait; margin: …mm}` from user margins (`:3641`), `@media print{-webkit-print-color-adjust:exact}` (`:3590`), then `window.print()` on load. User content escaped via `esc()` (`:3644`).
2. **Analytics reports** (`PrintReports`, `:4274-4705`): renders into a hidden **iframe** (`#printFrame`, `:226`, `:4388-4424`); `@page{size:A4; margin:10mm 12mm}` (`:4278`); optional "shrink to one page" transform scaling (`:4325-4346`); waits on `document.fonts.ready` before printing (`:4419-4423`). Content escaped via a local `esc()` (`:4348`).
- Page assumption is A4 portrait; different paper sizes are not parameterised beyond margins and the fit-one toggle.

**G. Bilingual / RTL.** `<html dir="rtl" lang="ar">` (`:2`); the whole UI is Arabic-first with English accents. Print docs also `dir="rtl"`. Numbers formatted with `toLocaleString('ar-EG')` in invoices (`:3649`) but a plain grouping formatter elsewhere (`:1420`). Arabic strings are hardcoded in markup and JS (not editable) — a localization concern for white-labeling.

**H. Bugs, smells & fragility.**
- **[Resolved/Not-present] "Illegal return statement".** Init is `(async function init(){ try{…}catch(e){…} })();` (`:5541-5574`) — no top-level `return`/`await`. Cannot reproduce the reported syntax error in this version. **Severity: N/A (verify against older copies).**
- **[High] Hardcoded absolute path + `file://` link** (`:1012`, `:762`) — breaks on any other machine and on deployment.
- **[High] Unescaped `innerHTML` in on-screen renderers.** User-entered names/suppliers/notes are concatenated directly into table HTML, e.g. `:1595`, `:1665`, `:2352`, `:2437`, `:1930-1938`. A `<` in a supplier/notes field breaks layout; XSS-capable once data is multi-user/shared. (Print output is escaped; the live DOM is not.)
- **[Medium] Silent failures everywhere.** Empty `catch(e){}` blocks in `Store`, `FileStore.writeKey/loadAll/restore`, etc. (`:1073`, `:1084`, `:1092`, `:1128-1133`) hide quota/permission errors.
- **[Medium] Brave `file://` restrictions.** FSA/IndexedDB may be blocked; handled gracefully (returns `false`, shows "connect folder" prompt) but the whole shared-data feature silently no-ops when blocked.
- **[Low] Preset color grid uses raw `preset.id` in an inline `onclick`** (`:1178`) — fine for generated ids but brittle if ids ever contain quotes.
- **[Low] Legacy sticker IDs hardcoded** for the split migration (`:2370-2374`).

**I. External dependencies.** Google Fonts CSS (`:7`) and, for print windows, additional Google Fonts `<link>`s injected into the generated docs (`:3894`, `:4404`). No other CDNs. **Offline:** fonts fall back to system serif/sans; all logic is self-contained and works offline.

**J. Security & privacy.** Customer names, phone numbers, invoice totals and returns are stored in plain `localStorage` and plaintext JSON files on disk (`bb_invoices`, `bb_returns`, `bb_pending_invoices`). No auth, no encryption. On-screen `innerHTML` injection (see H) is the main XSS vector before this becomes multi-user.

---

### 2.4 `balance-bites-label-editor- latest.html` (2180 lines)

**A. Purpose & workflow.** A **multi-panel wrap-label set editor** for a jar/pouch: it lays out four physical panels — **Front (5×3 cm), Neck (1×4.5 cm), Seal (3×3 cm), Back (5×3 cm)** (`:1467-1470`) — with full **bilingual regulatory content** (ingredients, storage, validity) and a **nutrition-facts table**. The user picks/edits a flavour, tweaks text and typography, and prints all panels together. This is a *different tool* from `label-v3` (fixed multi-panel wrap vs. flexible single-shape/cup designer) — see §3.4 (not a newer version of the same tool).

**B. Feature list (exhaustive).**
- Four panels rendered as one strip (`buildLabel`, screen+print copies, `:1701-1703`).
- Front: arch monogram + sub, flavour, emoji or uploaded flavour image, type, "PREMIUM", 4 badges, weight, footer (`:1663-1671`).
- Seal: monogram + brand; Neck: vertical text; Back: monogram + sub, barcode, website, approx weight (`:1273-1308`, `:1674-1680`).
- Bilingual **ingredients / storage / validity** EN+AR (`:1676-1677`).
- **Nutrition facts**: serving line EN/AR + a per-serving table encoded as pipe/newline text `Label|Value|arLabel|arValue` (`:1679`, default at `:1960`).
- **Per-element typography** (font + size) for ~12 elements (`:1684-1695`, defaults `:1963`).
- Built-in **flavour presets** (`presetsData`, e.g. `Zaatar` with full bilingual ingredient/storage/validity/nutrition, `:1708-1719`).
- Save/load user presets, print (`:1706`).

**C. Data model.** Flat `getVals()` object (~60 fields incl. typography) (`:1663-1697`); nutrition stored as delimited text; built-in flavours as an object keyed by flavour name (`presetsData`, `:1708`). User presets: `bb_presets` object in localStorage.

**D. Persistence layer.** `localStorage` single key **`bb_presets`** (read `:1756`, write `:1935`). No IndexedDB, no FSA, **no migration**. Note the key `bb_presets` sits in the same `bb_` namespace as the business tools' data keys (though it does not actually collide) — a naming-hygiene issue (see §3.2).

**E. Hardcoded values registry.**

| Value | BrandConfig key | Input | file:line |
|---|---|---|---|
| `Balance Bites` (title/h1/seal/back) | `brand.name` | text | `:7`, `:1183`, `:1274`, `:1289` |
| `BALANCE BITES` (arch sub default) | `brand.name` | text | `:1943` |
| `BB` monogram (arch/seal/back) | `brand.monogram` | text | `:1220`, `:1273`, `:1288`, `:1947-1948` |
| `SEALED · FRESHNESS` neck text | `brand.sealText` | text | `:1281`, `:1947` |
| `✦  BALANCEBITES.COM  ✦` footer | `brand.web` | text | `:1946` |
| `balancebites.com` website | `brand.web` | text | `:1308`, `:1956` |
| `1615012` barcode number | `product.barcode` | text | `:1291`, `:1948` |
| Default flavour `Cinnamon`/type `Peanut`/emoji `🍂` | `catalog.flavors[]` | dropdown | `:1943-1944` |
| Badges `100% Natural`/`No Preservations`/`Whole Wheat`/`No Added Sugar` | `catalog.badges[]` | repeatable list | `:1944-1945` |
| Panel sizes 5×3 / 1×4.5 / 3×3 cm (in print CSS) | `print.label.panels` | number | `:999-1128`, `:1467-1470` |
| Ingredients/storage/validity EN+AR defaults | `catalog.labelText.*` | text | `:1949-1957` |
| Nutrition defaults (Calories 443 kcal …) | `catalog.nutrition` | repeatable list | `:1960` |
| Fonts (Caveat/Syne/Playfair/DM Sans) per element | `theme.fonts.*` | dropdown | `:1963` |
| Built-in flavour library (`Zaatar` …) | `catalog.flavors[]` | repeatable list | `:1708-1719` |

Verbatim AR samples: ingredients `دقيق قمح كامل، زيت زيتون، زعتر، ملح، بيكنج بودر. يحتوي على: قمح.` (`:1712`); storage `يحفظ في مكان جاف وبارد بعيدًا عن أشعة الشمس المباشرة.` (`:1714`); validity `صالح لمدة 3 أشهر من تاريخ الإنتاج.` (`:1716`); nutrition header `السعرات الحرارية` (`:1960`).

**F. Print & rendering logic.** Single-DOM real-unit: the panels are sized in **cm/mm directly in the print CSS** (`@media print{@page…}`, `:969-970`; panel widths/heights `5cm`/`3cm`/`1cm`/`4.5cm` and sub-mm font sizes, `:999-1128`). `buildLabel` renders identical HTML to a hidden `printStrip` and a visible `screenStrip` (`:1701-1703`); `doPrint()` refreshes then `window.print()` (`:1706`). Fidelity depends on the browser honouring the fixed cm sizes.

**G. Bilingual / RTL.** The most thorough **regulatory** bilingual handling: every consumer-facing block (ingredients, storage, validity, nutrition) has paired EN/AR content, and the nutrition table is bilingual 4-column. No top-level `dir="rtl"`; Arabic is rendered inline within `buildLabel`. All Arabic is **editable** (fields + presets).

**H. Bugs, smells & fragility.**
- **[Medium] Unescaped string-concatenated HTML** throughout `buildLabel` — a `<`/`&` in any field breaks the label. Own data, so low real-world XSS risk.
- **[Medium] Base64 flavour image stored in `bb_presets` in localStorage** (`flavorImgData`, `:1668`) — quota risk if several images saved.
- **[Low] Generic `bb_presets` key** in the shared `bb_` namespace (no tool prefix) (`:1756`, `:1935`).
- **[Low] No migration / no versioning** on the preset blob — a schema change silently drops fields.

**I. External dependencies.** Google Fonts only. Fully offline-capable.

**J. Security & privacy.** No customer PII (own artwork/label content).

---

### 2.5 `balance-bites-carton (2).html` (459 lines)

**A. Purpose & workflow.** A shipping-carton artwork template for 24- or 48-unit boxes. The user edits brand text/colours/sizes in a right-hand sidebar; four carton faces (Top, Front, Side, Bottom) render live; then prints to **A3 landscape**. Presets save to a bottom bar.

**B. Feature list.**
- Two size tabs: 24-pack (300×200×150 mm) and 48-pack (400×220×200 mm) with per-size face dimensions (`:149-150`, `:168-171`).
- Carton style dropdown Dark Luxury / Brown Kraft / White Clean / Custom, each a colour preset (`:77`, `:172-177`, `applyCartonPreset` `:387-392`).
- Colour pickers bg/gold/accent/text (`:80-85`).
- Brand fields: monogram, weight, brand name, flavor, type, slogan, website (`:88-98`).
- Three badge slots (`:100-104`).
- Dates + barcode + typography sliders (date box width, date FS, barcode height, ingredient FS, flavor/brand/type/badge/units/weight/slogan sizes, strip width) (`:105-140`).
- Ingredients EN + AR textareas (`:119-123`).
- Faux barcode generator (deterministic from the number string) (`:208-213`).
- Preset bar: save (named, max 8), quick save, load, delete, export/import JSON (`:155-164`, `:424-447`), print buttons (`:143`, `:162`).

**C. Data model.** No entities; a flat **state** captured by `getVals()` (`:215-234`) — all brand text, colours, and ~14 numeric sizes. Presets: `{name, state:{vals,size}, date}` (`:429`), max 8 (`_PBMAX` `:396`).

**D. Persistence layer.** `localStorage` only. Key `bbcarton_pb` (`_PBK='bbcarton'`, `:396-398`). No IndexedDB, no FSA. Export JSON shape `{name, template:'bbcarton', date, state}` (`:437`); import validates `data.state` (`:438`).

**E. Hardcoded values registry.**

| Value | BrandConfig key | Input | file:line |
|---|---|---|---|
| `Balance Bites` | `brand.name` | text | `:74`, `:93`, `:220` |
| `BB` monogram | `brand.monogram` | text | `:89`, `:220` |
| `Za'atar` flavor | `catalog.flavors[]` | repeatable list | `:94`, `:221` |
| `Crackers` type | `catalog.productTypes[]` | text | `:95`, `:221` |
| `Natural · Wholesome · Delicious` slogan | `brand.slogan` | text | `:96`, `:222` |
| `balancebites.com` | `brand.web` | text | `:97`, `:223` |
| `40G` unit weight / `960G`/`1920G` totals | `catalog.weights` | text | `:90`, `:169-170` |
| `1615012` barcode | `product.barcode` | text | `:110`, `:224` |
| `2025/06/01` / `2025/09/01` dates | (per-run data) | text | `:107-108`, `:225` |
| Badges `100% Natural`/`Whole Wheat`/`No Preservatives` | `catalog.badges[]` | repeatable list | `:101-103` |
| Ingredients EN/AR (verbatim AR: `دقيق قمح كامل، زيت زيتون، ملح بحر، زعتر. يحتوي على: قمح.`) | `catalog.ingredients` | text | `:121-122` |
| Colours `#12100a`,`#c9a84c`,`#3a8a7a`,`#e8e0cc` + 4 presets | `theme.colors.*` / `theme.presets` | color picker | `:80-85`, `:172-177` |
| Carton dimensions (24/48-pack mm) | `product.cartonSizes` | dropdown | `:168-171` |
| Fonts Playfair/DM Sans/Syne/Caveat/Tajawal | `theme.fonts.*` | dropdown | `:7` |

**F. Print & rendering logic.** Single-DOM print: `@media print{@page{size:A3 landscape; margin:8mm} … #sidebar,#edToggle,#sizeTabs,#presetBar{display:none}}` (`:68`). Faces are built as absolutely-positioned px `<div>`s (`buildFront/Top/Side/Bottom`, `:236-375`) and printed at their px sizes — **no px→mm/cm conversion**, so real-world print scale depends on the browser fitting A3. This is a print-fidelity risk on other paper.

**G. Bilingual / RTL.** `<html lang="ar" dir="rtl">` (`:2`); sidebar labels Arabic, artwork mostly Latin; the AR ingredients block is rendered with inline `direction:rtl` (`:366`). Artwork text is editable (good), ingredients bilingual.

**H. Bugs, smells & fragility.**
- **[Info] The reported over-escaped `</div>` (buildFace) bug is NOT present.** Faces are built by `buildFront/buildTop/buildSide/buildBottom` (`:236-375`); the `'</div>'` string literals are clean, unescaped, and render correctly.
- **[Medium] Unescaped user text in `innerHTML`.** All brand/flavor/ingredient values are concatenated raw into markup (`:251`, `:256`, `:365-366`), so a literal `<` breaks the layout; XSS is low-risk (own data) but real if presets are shared.
- **[Low] Preset does not persist `cType` (style dropdown).** `getVals()` stores resolved colours but not the chosen style; `presetSetState` never restores `cType` (`:402-422`).
- **[Low] Empty `catch` in preset save/load** (`:397-398`) — localStorage quota errors are swallowed.
- **[Low] Event listeners bound once in an IIFE with no cleanup** (`:449-456`) — acceptable for a single-page tool.

**I. External dependencies.** Google Fonts only (`:7`). Works offline with fallback fonts.

**J. Security & privacy.** No customer data. Only self-authored artwork text. Main concern is unescaped `innerHTML` if presets become shareable.

---

### 2.6 `balance-bites-stand.html` (774 lines)

**A. Purpose & workflow.** An editor for a **Counter Display Stand (CDS 140)** with four panels: Mirror Face, Shelf, and two tapered Sides (trapezoid via `clip-path`). Tabbed sidebar (Brand / Products / Style / Badges / Size / Fonts); live preview; print at exact mm or A3/A2; presets in a bottom bar.

**B. Feature list.**
- 6 sidebar tabs (`:135-140`) and 4 panel-view buttons All/Face/Shelf/Sides (`:435-438`).
- Brand tab: two-line brand, logo text, EN/AR taglines, CTA, website, "show shelf brand" toggle, social (IG/WhatsApp/extra), 5 flavor colours (`:146-176`).
- Products tab: 5 products EN/AR, weight, price (`:179-198`).
- Style tab: per-panel bg colours, pattern overlays (diag/dots/cross/wheat), pattern colour+opacity, per-panel bg images (base64 upload), QR uploads, logo/QR positions (% sliders), text/logo colours, many toggles, bg image size/opacity (`:201-299`).
- Badges tab: 6 toggleable health badges with label/emoji/PNG-icon, badge sizes (`:302-348`).
- Size tab: face/shelf/side dimensions in mm, screen scale, print layout actual/A3/A2 (`:352-376`).
- Fonts tab: header/body font, per-element sizes and side logo/QR positions (`:379-422`).
- Preset bar: save/quick-save/load/delete/export/import (`:444-453`, `:706-766`).

**C. Data model.** Flat **state** via `getVals()` (`:502-542`): flavor colours, brand lines, taglines, CTA, web, social, 5 products EN/AR, weight/price, per-panel colours/patterns/images/QRs, positions, toggles, dimensions (mm), font sizes, fonts. Badges: `[{label, icon, png}]` (`:503-506`). Preset: `{name, state:{vals}, date}` (`:710`).

**D. Persistence layer.** `localStorage` only. Key `bbstand3_pb` (`_PBK='bbstand3'`, `:706-708`). No IndexedDB/FSA. Export JSON `{name, template:'bbstand', state}` (`:764`) — **note the template name (`bbstand`) differs from the storage key prefix (`bbstand3`)**. Base64 images/QRs are embedded in the preset object → stored in localStorage.

**E. Hardcoded values registry.**

| Value | BrandConfig key | Input | file:line |
|---|---|---|---|
| `BALANCE` / `BITES` (two-line brand) | `brand.name` (split) | text | `:149-150`, `:509` |
| `BB` logo text | `brand.monogram` | text | `:151`, `:509` |
| Tagline EN `WHOLE FOOD SNACKS · NATURALLY POWERFUL` | `brand.taglineEn` | text | `:152` |
| Tagline AR `وجبات خفيفة طبيعية · قوية بالطبيعة` | `brand.taglineAr` | text | `:153` |
| CTA `Try Our Natural Crackers!` | `brand.cta` | text | `:154` |
| `balancebites.com` | `brand.web` | text | `:155`, `:510` |
| IG `@balancebites.eg`, WhatsApp `+20 123 456 7890` | `brand.social.*` | text | `:160-161` |
| Products 1–5 EN/AR (e.g. `Za'atar Crackers`/`كراكرز زعتر`, `فول سوداني بالقرفة`) | `catalog.products[]` | repeatable list | `:182-191` |
| Weight `40G`, Price `EGP 45` | `catalog.weights` / `locale.currency` | text/dropdown | `:195-196` |
| Flavor colours `#2e7d32`,`#c62828`,`#f9a825`,`#1565c0`,`#bf360c` | `catalog.flavorColors[]` | color picker | `:166-174` |
| Badges + emoji (`🌿 100% Natural` etc.) | `catalog.badges[]` | repeatable list | `:306-342` |
| Panel dimensions (face 400×190, shelf 400×85, side 320/85/290 mm) | `product.standDims` | number | `:355-369` |
| Fonts Montserrat/Playfair/Syne/DM Sans/Tajawal/Caveat | `theme.fonts.*` | dropdown | `:7`, `:382-383` |

**F. Print & rendering logic.** Best print engine of the set: **dual-DOM**. `PX=3.78` px-per-mm (`:457`, `mm()` `:462`); `sw()` emits a **screen** version (scaled px, `sw-o`) and a **print** version (real mm, `sw-p`) (`:680-687`). Print CSS toggles which is visible (`:110-122`). Named `@page` rules for exact-size printing (`@page face/shelf/side` with mm sizes) or A3/A2 fallback, injected dynamically per render (`:665-678`). Tapered sides use `clip-path` polygons + white SVG masks (`:624-638`).

**G. Bilingual / RTL.** `<html lang="en">` (no top-level `dir`); Arabic handled per-field via `dir="rtl"` on inputs (`:153`, `:183-191`) and `direction:rtl`/Tajawal in render (`:559`). Mixed-direction by design (EN brand, AR product names). Product/tagline text editable.

**H. Bugs, smells & fragility.**
- **[High] Duplicate element IDs across two tabs.** The side logo/QR position sliders `tSideLogoXL/YL/XR/YR` (and their `vSideLogo*` readouts) are defined in **both** the Style tab (`:243`, with `max=90`) **and** the Fonts tab (`:412`, with `max=95`). Invalid HTML — `getElementById`/`G()` returns only the first (Style) element, so the Fonts-tab copies are dead and the two `max` values conflict.
- **[High] Base64 images stored inside localStorage presets** (`:737-738`, `:764`). Several uploaded panel backgrounds/QRs can exceed the ~5 MB localStorage quota → `_pbSav` swallows the error (`:708`) → silent preset-save failure/data loss.
- **[Low] Duplicate function definition** `clrB64` defined twice, identically (`:465` and `:467`).
- **[Low] Export template name/key mismatch** (`bbstand` vs `bbstand3`) (`:706`, `:764`) — harmless now but a migration trap.
- **[Medium] Unescaped user text in `innerHTML`** across `buildMirrorFace/buildShelf/buildSide` (`:556`, `:583`, `:652`) — a `<` in product/tagline breaks layout.
- **[Low] String/number coercion** in side geometry math (`logoSzMM/2` where `toFixed` returns a string, `:641-649`) — works via coercion but fragile.
- **[Low] Listeners bound once in IIFE, no cleanup** (`:768-771`).

**I. External dependencies.** Google Fonts only (`:7`). Offline-safe with fallback fonts; uploaded images are inlined base64 (no network).

**J. Security & privacy.** No customer data (own artwork + social handles). Same unescaped-`innerHTML` fragility as the other design tools.

---

## 3. Phase 3 — Cross-file analysis

### 3.1 Duplication matrix

Each row is a subsystem re-implemented independently in multiple files. "Impls" = number of separate implementations.

| Subsystem | Impls | Where (file:line) | Notes |
|---|---|---|---|
| Preset save/load bar | 6 | invoice-pro `:2975-3011` (`bbinv`), stock color-preset grid `:1134-1197`, carton `:396-447` (`bbcarton`), stand `:706-766` (`bbstand3`), label-v3 `:853-2038` (IndexedDB), label-editor `:1756-1935` (`bb_presets`) | Same concept (named slots, save/load/delete), 3 different storage backends. |
| JSON export/import of a preset | 5 | carton `:437-447`, stand `:764-765`, invoice-pro `:3008-3011`, label-v3 `:1932-1943`, label-editor `bb_presets` blob | Each emits `{name, template, date, state}`-ish with different field names. |
| Colour/theme engine + hex helpers | 2 full + 3 partial | stock `applyScTheme`/`ColorPresetMgr` `:1139-1493`, invoice-pro `ColorPresetMgr` `:1134-1197`, carton `applyCartonPreset` `:387-392`, stand colour inputs, label colour inputs | **Stock & invoice-pro ship byte-identical preset defaults** (`cp_def1..4`, stock `:1137-1142` = invoice `:1137-1142`). |
| Colour-preset defaults (Dark Gold/Obsidian Blue/Forest Night/Warm Ivory) | 2 identical | stock `:1137-1142`, invoice-pro `:1137-1142` | Pure copy-paste. |
| Folder connection (FSA + IndexedDB handle) | 2 near-identical | stock `:1009-1122`, invoice-pro `:954-1096` | Same DB `bb_filestore_v1`, store `h`, same `<key>.json` mirroring, same graceful-degrade. ~1:1 duplication. |
| Toast / notification helper | 6 | every file (`pbToast`/`toast`) | Trivial but repeated. |
| Currency / number formatting | 3 variants | stock `toLocaleString('ar-EG')` `:3649` + manual grouping; invoice-pro `EGP` inline; design tools plain strings | Inconsistent output for the same currency. |
| Invoice numbering | 1 + 1 consumer | invoice-pro `#INV-###` `:2609`; stock parses the same numbers | Only producer implements it; stock re-parses. |
| Print scaffolding | 4 divergent | new-window (invoice) `:1750`; hidden-iframe (stock reports) `:4388-4424`; single-DOM (carton `:68`, label-editor `:969`); dual-DOM real-unit (stand `:665-687`, label-v3 `:1590-1600`) | No shared engine. |
| RTL/bilingual field wiring | 6 | all files, ad-hoc `dir="rtl"` per input | No shared i18n. |

**Estimated conceptual duplication: ~45–60%** of the design-tool code and a large share of the two business tools' plumbing (folder sync, theme, presets) is repeated logic that a shared shell + data layer would collapse into single implementations.

### 3.2 Inconsistencies

- **"Product" is shaped four ways.** Invoice-pro: `{id, name, packType, weight, unitPrice, categoryId}` (`invoice-pro:1444`). Stock links to it via sticker `{productId, templateKey}` (`bb-stock-costs.html:2391-2415`) and recipe `{productId, productWeight, unitPrice}` (`:2488-2502`). Design tools have **no product id at all** — flavour/type/name are free text (`carton:94-95`, `stand:182-191`, `label-editor:1943`). There is no shared product catalog across the design and business families.
- **"Preset" is shaped five ways.** `{name,state:{vals,size},date}` (carton `:429`); `{name,state:{vals},date}` (stand `:710`); `{name,template,date,state}` (invoice-pro `:3008`); `{name,date,state}` keyed by name in IndexedDB (label-v3 `:857`); an object keyed by flavour (label-editor `bb_presets`).
- **Storage-key conventions clash.** Business entities use `bb_<entity>` (`bb_products`, `bb_invoices`…); preset bars use `<tool>_pb` (`bbcarton_pb`, `bbstand3_pb`, `bbinv_pb`); label-v3 abandons localStorage for IndexedDB `BBLabelDB`; label-editor uses a generic `bb_presets` in the shared `bb_` namespace. **Bug carried over:** stand's storage prefix `bbstand3` ≠ its export `template:'bbstand'` (`stand:706` vs `:764`).
- **Currency/date formatting drift.** Currency is `EGP` everywhere but rendered via `toLocaleString('ar-EG')` in some places and plain concatenation in others (`bb-stock-costs.html:3649`); dates are free-text `YYYY/MM/DD` strings (`carton:107-108`, `label-editor:1948`) with no shared formatter.
- **Category / flavour lists diverge.** Invoice-pro defaults Crackers/Snacks/Beverages (`:1200-1204`); stand lists 5 flavours (`:182-191`); carton defaults Za'atar (`:94`); label-editor defaults Cinnamon/Peanut (`:1943`); stock adds Arabic op-cost categories (`:779-786`). No single source of truth.
- **Palette drift.** Gold `#c9a84c` is consistent, but background differs: `#0a0804` (invoice/stock presets) vs `#060603` (stock root) vs `#1a1208` (label-editor `:1941`) vs carton `#12100a`. Flavour colours exist only in stand (`:166-174`).
- **Brand representation differs.** One-line `Balance Bites` (most) vs two-line `BALANCE`/`BITES` (stand `:149-150`) vs arch-sub `BALANCE BITES` (label-editor `:1943`).

### 3.3 Coupling map

- **Invoice Pro (producer) ⇄ Stock & Costs (consumer)** are tightly coupled through:
  - the **shared on-disk folder** (File System Access API), and
  - the **same IndexedDB handle store** `bb_filestore_v1` / store `h` (invoice `:959-960`, stock `:1021-1022`), and
  - a **shared set of JSON keys**: invoice-pro writes `bb_products`, `bb_invoices`, `bb_inv2`, `bb_categories`, `bb_color_presets` (its `MANAGED`, `:953`); stock reads them as `READ_KEYS` (`:1016`) and writes back `bb_pending_invoices`, which invoice-pro re-reads as "prep drafts" (`invoice-pro:646-658`). So the coupling is **bidirectional** via `bb_pending_invoices`.
- **What breaks if a schema changes:** if invoice-pro changes the `Product` or `Invoice` shape, Stock & Costs' COGS, profit, and stock-value math (which destructure `packType`, `weight`, `unitPrice`, `items[]`, `invoiceNumber`) break silently — there is no shared type or version check. If the folder path (`bb-stock-costs.html:1012`) or the persisted handle is lost, sync silently stops (empty `catch`).
- **Design tools are independent islands.** Carton, stand, and the two label tools share **no runtime data** with each other or with the business tools; they only share *copied* branding constants and *duplicated* preset/theme code. Changing one cannot break another today — but it also means branding must be re-entered in every tool.

### 3.4 Are any two files versions of the same tool?

- **The two label files are NOT versions of one tool** — they are complementary tools with different physical outputs:
  - `balance-bites-label-v3.html` = a flexible single-shape **designer** (rectangular / conical-cup / circular / custom) with IndexedDB presets + legacy migration + PNG export (geometry-heavy).
  - `balance-bites-label-editor- latest.html` = a fixed **4-panel wrap-label set** (front/neck/seal/back) with full bilingual regulatory text + nutrition facts.
  - Neither supersedes the other: v3 is newer on **storage/geometry** (IndexedDB, cup unwrap), the "latest" editor is richer on **regulatory content** (nutrition, EN/AR ingredient/storage/validity). For unification, **merge both into one Label module** with selectable format templates (see UNIFICATION §6), preserving v3's geometry engine and the editor's bilingual/nutrition content.
- **`balance-bites-carton (2).html`** — the `(2)` in the filename implies an earlier copy existed; only this one is present in the workspace, so it is treated as canonical. No other true version-pairs were found.

---

## 4. Consolidated bug & risk list (by severity)

**Reported-but-NOT-present (close-out).** Verified against the current files:
- `Uncaught SyntaxError: Illegal return statement` — **not present**; init is a guarded `async` IIFE (`bb-stock-costs.html:5541-5574`; invoice-pro uses the same pattern).
- Over-escaped `</div>` in a carton `buildFace()` — **not present**; face builders are clean (`balance-bites-carton (2).html:236-375`).

**Confirmed present.** The `"Balance Bytes"` typo **is real** — the Top-Label default in `balance-bites-label-v3.html:698-699` reads `BALANCE` / `BYTES` (all-caps; a case-sensitive grep for `Bytes` misses it). It is the only occurrence; every other brand string is the correct `Balance Bites`.

| Sev | Issue | file:line |
|---|---|---|
| **High** | Deployment blocker: shared-folder data layer = hardcoded absolute Windows path + `file:///` cross-link + FSA/IndexedDB handle (cannot exist on Vercel) | `bb-stock-costs.html:1012`, `:762`, `:1009-1122`; `balance-bites-invoice-pro.html:954-1096` |
| **High** | Customer PII (names/phones/addresses/invoices) in plain `localStorage` + plaintext JSON; whole-state export can leak it | `balance-bites-invoice-pro.html:953`, `:3008-3011`; `bb-stock-costs.html` `bb_returns`/`bb_pending_invoices` |
| **High** | Unescaped `innerHTML` from user input in on-screen renderers (XSS once multi-user/shared) | `bb-stock-costs.html:1595`,`:1665`,`:2352`,`:2437`; `invoice-pro:1181-1190`; `carton:251`,`:256`,`:365-366`; `stand:556`,`:583`,`:652`; `label-editor:buildLabel` |
| **High** | Base64 images embedded in `localStorage` presets → quota overflow → silent save failure/data loss | `balance-bites-stand.html:737-738`,`:764`; `balance-bites-label-editor- latest.html:1668` |
| **High** | PNG export hard-depends on a CDN (`dom-to-image`) → breaks offline (`file://` habitat) | `balance-bites-label-v3.html:6`,`:1756-1767` |
| **Medium** | Silent failures: empty `catch(e){}` around Store/FSA/preset writes hide quota/permission errors | `bb-stock-costs.html:1073`,`:1084`,`:1092`; `invoice-pro:1091-1096`; `carton:397-398`; `stand:708` |
| **Medium** | Brave `file://` isolates/blocks FSA + IndexedDB → cross-tool sync silently no-ops | `bb-stock-costs.html:1009-1122`; `invoice-pro:954-960` |
| **Medium** | Invoice-number collision risk (max+1 at save; per-customer vs global modes) | `balance-bites-invoice-pro.html:1909-1912`,`:2600-2609` |
| **Medium** | Inconsistent currency/number/date formatting for the same `EGP`/date data | `bb-stock-costs.html:3649`; `carton:107-108`; `label-editor:1948` |
| **Medium** | Brand typo `BYTES` on the Top-Label default (renders "BALANCE BYTES") | `balance-bites-label-v3.html:698-699` |
| **Medium** | Duplicate element IDs `tSideLogo*`/`vSideLogo*` in both Style and Fonts tabs (invalid HTML; Fonts-tab copies are dead; conflicting `max`) | `balance-bites-stand.html:243`,`:412` |
| **Low** | Storage prefix ≠ export template name (`bbstand3` vs `bbstand`) — migration trap | `balance-bites-stand.html:706`,`:764` |
| **Low** | Duplicate identical function definition `clrB64` | `balance-bites-stand.html:465`,`:467` |
| **Low** | Preset omits `cType` (carton style dropdown) — not restored on load | `balance-bites-carton (2).html:402-422` |
| **Low** | Generic un-prefixed `bb_presets` key; no schema versioning on the preset blob | `balance-bites-label-editor- latest.html:1756`,`:1935` |
| **Low** | Event listeners bound once in IIFE without cleanup (fine for single-page, noted for React port) | `carton:449-456`; `stand:768-771`; `label-v3:2026-2032` |

---

