> **ARCHIVED 2026-07-30.** Written for a port that is no longer the project.
> Retained for history. Not authoritative. Do not cite as current truth.

# PHASE PLAN — Balance Bites Unified App

> All six modules in one unified build. Full ceremony. Every phase: **ENTRY → TASKS → EXIT VERIFICATION → PARITY LEDGER → SIGN-OFF → HANDOFF.**
>
> `H` = heavyweight model class (Opus) · `S` = standard (Sonnet). One task per fresh agent window.

---

## Phase order and rationale

```
P00 Scope & Decisions ──► P01 Foundation ──► P02 Migration + Parity Harness
                                                      │
        ┌─────────────────────────────────────────────┘
        ▼
P03 Invoicing ──► P04 Inventory/COGS/Returns ──► P05 Reports
        │
        ▼
P06 Label (merged) ──► P07 Carton + Stand ──► P08 Wizard + Multi-brand
        │
        ▼
P09 Deploy hardening ──► P10 Multi-tenant (post-MVP)
```

**Why P02 sits third.** You cannot parity-test without real data in the new store. The importer is not a cleanup task at the end; it is the instrument that makes every later gate possible.

**Why Invoicing before Inventory.** Invoice Pro is the data producer; Stock & Costs consumes its entities and layers returns math on top. Building the consumer first would mean mocking the producer twice.

**Why Label after the business modules.** The label module is the largest merge (two complementary tools) and the most geometry-heavy. It benefits from a mature print engine, which P03–P05 will have stress-tested.

---

## P00 — Scope & Decisions
**Gate only. No code. Model: H.**

**Tasks**
| T | Task | Class | Output |
|---|---|---|---|
| T00.1 | Author `SCOPE.md`, freeze it | H | Frozen scope + exclusions |
| T00.2 | Author `DECISIONS.md` with OD-1…OD-12 | H | Unsigned ODs |
| T00.3 | **You sign the ODs** | — | Signed, dated |
| T00.4 | Author `PARITY_MATRIX.md` from `REPORT.md` §2 + delta audit | H | Every feature → keep/merge/drop + module + test id |
| T00.5 | Author `DATA_MODEL.md` (incl. corrected returns) | H | Canonical entities + `DataStore` interface + counting methodology |
| T00.6 | Author `BRAND_CONFIG.md` | H | zod schema, wizard steps, theming mechanics, validation |
| T00.7 | Author `ARCHITECTURE.md` + ADR-001…008 | H | Stack + "NOT used" list |
| T00.8 | Author `PRINT_CONTRACT.md` | H | Per-output page/margin/unit table + verification procedure |
| T00.9 | Author `MODULE_SPEC.md` | H | Route table, components, states per module |
| T00.10 | Author `MASTER_PROMPT.md` + both rules files | H | Builder truth pointers |

**The ODs to sign at T00.3**

| OD | Question | Why it blocks |
|---|---|---|
| OD-1 | QR: uploaded image (as today) or generated from a URL? | Changes label + stand modules |
| OD-2 | Barcode: keep decorative/faux, or real scannable EAN/UPC? | Adds a dependency + validation |
| OD-3 | Offline/PWA required after Vercel? | Service worker + local-first store choice |
| OD-4 | PII/data residency before Supabase (Egypt/EU hosting, retention) | Blocks P10 design |
| OD-5 | Print calibration authority — whose scaling is canonical, yours or the print shop's? | Defines the print contract tolerance |
| OD-6 | Multi-device sync: acceptable to stay single-device until P10? | Defines MVP boundary |
| **OD-7** | **Returns semantics: canonical `Return` shape, `outAllocations`, and exactly how expired vs restock affects stock, COGS, and net revenue** | **Blocks the data model and every report** |
| OD-8 | Legacy tools: frozen at cutover, or maintained in parallel during the port? | Defines whether fixes are double-applied |
| OD-9 | i18n contract: is AR primary everywhere, and where (if anywhere) is a hardcoded literal permitted? | Defines the `no-hardcoded-brand` guard's strictness |
| OD-10 | Entity-counting methodology + the frozen canonical entity list | Prevents the "28 vs 43 tables" class of drift |
| OD-11 | Tax: legacy has none (discount only). Does the white-label product need a configurable tax/VAT field for other brands? | Changes `Invoice` + `BrandConfig` |
| OD-12 | Invoice numbering for multi-brand: global, per-customer, or per-brand-configurable? | Changes `Invoice` + wizard |

**Definition of done:** all nine documents exist, all twelve ODs signed and dated, no code written.

---

## P01 — Foundation
**Skeleton + contracts + gates. No features.**

| T | Task | Class |
|---|---|---|
| T01.1 | Repo init: Vite + React + TS, folder tree per `ARCHITECTURE.md` §5, Vercel connected with preview deploys | S |
| T01.2 | `SESSION_CONTEXT.md` + `DEVELOPMENT_JOURNAL.md` from `BB_DEV_OS.md` §6 templates | S |
| T01.3 | Design tokens + RTL shell (AR-first, `dir` switching), bundled fonts — **no CDN** | S (design surface hand-off) |
| T01.4 | `BrandConfig` type + zod schema + `presets/balance-bites.json` from `BRAND_CONFIG.md` | H |
| T01.5 | `ThemeProvider`: BrandConfig → CSS custom properties; live re-theme | S |
| T01.6 | `DataStore` interface + `IndexedDbStore` adapter + localStorage fallback | H |
| T01.7 | Print engine core: `<PrintDoc>`, px↔mm helper, `@page` injection, dual-DOM per `PRINT_CONTRACT.md` | H |
| T01.8 | CI: lint, typecheck, unit, build + the five guards (`no-hardcoded-brand`, `no-direct-storage`, `no-runtime-cdn`, `check-print-containment`, `check-zod-coverage`) | H |
| T01.9 | App shell: nav, module routing per `MODULE_SPEC.md`, toast, brand switcher stub | S |
| T01.EXIT | Exit verification ledger | H |

**Done when:** CI green on all guards; a throwaway test page renders in two different brand profiles with zero code change; a printed A4 test sheet measures within ±0.2 mm.

---

## P02 — Migration importer + parity harness
**The instrument phase. Highest leverage in the plan.**

| T | Task | Class |
|---|---|---|
| T02.1 | Legacy key sweep importer: `bb_products, bb_invoices, bb_inv2, bb_categories, bb_customers, bb_materials, bb_packages, bb_stickers, bb_recipes, bb_purchases, bb_production, bb_invoice_payments, bb_returns, bb_operation_costs, bb_pending_invoices, bb_color_presets` | H |
| T02.2 | Preset-key importer incl. the `bbbacklabel_pb3 → bbbacklabel_pb → bbbacklabel_pb2` fallback order (`balance-bites-label-v3.html:2011-2021`), plus `bb_presets`, `bbcarton_pb`, `bbstand3_pb`, `bbinv_pb` | H |
| T02.3 | JSON-folder importer for existing File System Access users (ingest `bb_*.json` from the shared folder) | H |
| T02.4 | Idempotency + import report (counts per entity, keyed by original ids) | H |
| T02.5 | **Freeze the golden dataset** into `test/fixtures/golden/` from your real exported data, returns included | H |
| T02.6 | Parity harness: runner that executes a calculation in both the legacy tool logic and the new module, and diffs | H |
| T02.EXIT | Exit verification + first parity ledger (entity counts only) | H |

**Done when:** your real data round-trips with zero loss; import is idempotent; the harness runs and reports; the golden dataset is committed and documented.

---

## P03 — Invoicing module
| T | Task | Class |
|---|---|---|
| T03.1 | `Invoice`/`Customer`/`Product`/`Category` CRUD on `DataStore` | S |
| T03.2 | Invoice editor: line items, qty/price/discount, totals | S |
| T03.3 | Invoice numbering per OD-12 (incl. per-customer mode) + **collision fix** — the audit flagged `max+1`-at-save-time as a real collision risk (`invoice-pro:1909-1912`, `:2600-2609`) | H |
| T03.4 | Customer picker + per-customer history | S |
| T03.5 | Product catalog + picker modal + category filters | S |
| T03.6 | **Returns display**: status banner (full vs partial), Return Details section, per-item chips (📤 sold-to · 🗑 تالف · 📦 مخزون), returned/net totals box | H |
| T03.7 | Invoice history + customer history with return badges and struck-through full returns | S |
| T03.8 | `InvoicePrint` template on the shared engine (retires the new-window path) | H |
| T03.9 | Price-list print template | S |
| T03.EXIT | Exit ledger + **parity ledger** (totals, numbering, net-after-return) | H |

**Done when:** every golden invoice reproduces byte-identical totals; a printed invoice measures to contract; return chips match the legacy rendering for both calculator-logged and legacy returns.

> **Carry-forward from your notes:** 📤 sold-to chips only exist for returns logged via the Return Calculator. Older returns show تالف/مخزون only. The unified module must render both shapes without erroring — this is a named parity case, not a bug.

---

## P04 — Inventory, COGS & Returns
**The heaviest business logic in the codebase. Full ceremony throughout.**

| T | Task | Class |
|---|---|---|
| T04.1 | Materials / packaging / stickers CRUD | S |
| T04.2 | Recipes / BOM | H |
| T04.3 | Purchases + production runs (incl. deductions, adjustments) | H |
| T04.4 | **Returns tab**: per-line 📦 مخزون / 🗑 تالف disposition, linked to invoice | H |
| T04.5 | **Return Calculator**: return customer + invoice, add other customers' invoices one at a time, تحديد الكل per invoice, `متبقي = مرتجع − مسلّم`, split remainder expired vs restock, سعر تالف / إجمالي تالف columns, log directly or apply to modal | H |
| T04.6 | `outAllocations` persistence + the three-way invoice grouping (pending/paid · partial returns · full returns) | H |
| T04.7 | COGS per unit + margin | H |
| T04.8 | Stock value reconciliation (purchases − sold, restock re-entry) | H |
| T04.9 | Profit: gross/net/cash, monthly bars, per-product, **net of returns** | H |
| T04.10 | Operating costs | S |
| T04.11 | Prep/BOM calculator + draft invoices flowing to P03 | H |
| T04.EXIT | Exit ledger + **parity ledger** (COGS, stock value, profit, ingredient usage, all net-of-returns) | H |

**Done when:** every figure matches the legacy tool exactly on the golden dataset, including a partial-return case, a full-return case, and a calculator case with `outAllocations`.

---

## P05 — Reports
| T | Task | Class |
|---|---|---|
| T05.1 | Reports dashboard: total / per-customer / top-product / per-product, date range + sort | S |
| T05.2 | Full returns excluded from sales KPIs; partial uses net — per OD-7 | H |
| T05.3 | Sales print report (partial = net, full = struck through) | H |
| T05.4 | Customer list print (pending excludes full returns; optional invoice info columns) | S |
| T05.5 | Low-stock alerts, money-cycle summary, recent activity | S |
| T05.EXIT | Exit ledger + parity ledger | H |

---

## P06 — Label module (merged)
**Merges `balance-bites-label-v3.html` + `balance-bites-label-editor- latest.html`. The audit confirmed these are complementary tools, not versions.**

| T | Task | Class |
|---|---|---|
| T06.1 | Geometry engine from v3: rect / **tapered cup (cone frustum)** / circular / custom, with the debug readout | H |
| T06.2 | Wrap-set format from the editor: front 5×3, neck 1×4.5, seal 3×3, back 5×3 cm | H |
| T06.3 | Bilingual regulatory content: ingredients, storage, validity, allergen, serving tip, dates | S |
| T06.4 | Nutrition facts table (bilingual 4-column) | S |
| T06.5 | Per-element typography controls | S |
| T06.6 | Flavour presets → `DataStore`; **fix the `BYTES` typo** (`label-v3:699`) at the data level, not by patching a default string | S |
| T06.7 | PNG export with `dom-to-image` **bundled locally** (kills the offline break) | H |
| T06.8 | `LabelPrint` templates: exact-cm `@page` + A4/Letter/A3 fallback | H |
| T06.9 | Cup/sticker sub-module reusing the engine, linked to `Sticker` entities (`productId`, `templateKey`) | H |
| T06.EXIT | Exit ledger + **physical print parity** (measure a cup wrap and a back label) | H |

---

## P07 — Carton & Stand
| T | Task | Class |
|---|---|---|
| T07.1 | Carton: 24/48-pack face templates, styles, badges, typography sliders — **with real px→mm conversion**, which the legacy tool lacks (`carton:68`) | H |
| T07.2 | Faux barcode generator, or real barcode per OD-2 | S |
| T07.3 | Stand: mirror face, shelf, tapered sides (clip-path + SVG masks) | H |
| T07.4 | Stand fixes carried from the audit: duplicate `tSideLogo*`/`vSideLogo*` IDs across Style and Fonts tabs (`stand:243`, `:412`), duplicate `clrB64` (`:465`, `:467`), `bbstand3` vs `bbstand` naming mismatch | S |
| T07.5 | Base64 images → Blob in IndexedDB (retires the localStorage quota failure, `stand:737-738`) | H |
| T07.6 | `CartonPrint` (A3 landscape) + `StandPrint` (actual mm / A3 / A2) | H |
| T07.EXIT | Exit ledger + physical print parity | H |

---

## P08 — Brand wizard & multi-brand
| T | Task | Class |
|---|---|---|
| T08.1 | Wizard steps 1–7 per `BRAND_CONFIG.md`: basics, colours, fonts, locale/tax, catalog, invoice/print, review | S |
| T08.2 | Logo upload → Blob + object URL; size/mime/dimension validation | S |
| T08.3 | Live preview re-theming a sample invoice and a sample label | S |
| T08.4 | WCAG contrast validation (port the existing math, `bb-stock-costs.html:1465-1481`) | S |
| T08.5 | Multi-profile storage, switcher, export/import as `brand-profile.json` with `schemaVersion` | H |
| T08.6 | Balance Bites ships as the default preset; first run with no profile loads it | S |
| T08.EXIT | Exit ledger + **white-label proof**: stand up a fictional second brand end-to-end and print an invoice, a label, and a carton in its identity | H |

---

## P09 — Deployment hardening
| T | Task | Class |
|---|---|---|
| T09.1 | Vercel production config, build optimisation, preview → prod promotion | S |
| T09.2 | PWA / offline per OD-3 | H |
| T09.3 | Data export/backup UX (user-owned JSON) — the safety net that replaces the shared folder | H |
| T09.4 | Error boundaries; replace every swallowed `catch(e){}` from the legacy tools with surfaced errors | S |
| T09.5 | Launch checklist: guards green, parity ledgers all green, print calibration signed by the print shop | H |
| T09.EXIT | Full-system exit verification, read-only, against production | H |

---

## P10 — Multi-tenant (post-MVP)
**Reinstate the deferred Dev OS rule layer before the first schema task.** Re-read `DEV_OS_REFERENCE.md` §4 and §6 in full.

| T | Task | Class |
|---|---|---|
| T10.1 | ADR: Supabase adoption; auth model | H |
| T10.2 | Schema as executable SQL + per-table RLS strategy | H |
| T10.3 | `SupabaseStore` implementing the same `DataStore` interface | H |
| T10.4 | Auth + tenant isolation + RLS harness tests | H |
| T10.5 | Local → cloud migration path | H |
| T10.6 | Reinstated CI guards: service-import quarantine, types-drift, RLS smoke | H |
| T10.EXIT | Security-classed exit verification against the live database | H |

---

## Standing carry-forwards (seeded at P00, carried in every entry checklist)

- **CF-01** — Reinstate the deferred Dev OS security/migration rule layer at P10.
- **CF-02** — Unescaped `innerHTML` was High severity in all six legacy tools; every ported renderer must escape. Verified per phase.
- **CF-03** — Legacy `catch(e){}` swallowing; every ported path surfaces errors.
- **CF-04** — Older returns lack `outAllocations`; both shapes must render.
- **CF-05** — Print calibration is unresolved until OD-5 is signed and the print shop confirms scaling.
