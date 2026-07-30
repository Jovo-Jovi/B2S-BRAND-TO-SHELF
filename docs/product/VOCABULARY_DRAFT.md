# B2S — VOCABULARY DRAFT + COMPLETE MODULE SET

**Status:** PROVISIONAL. Authored 2026-07-30 by the reviewer surface.
**Commit as:** `docs/product/VOCABULARY_DRAFT.md`
**Superseded by:** `GLOSSARY.md` at `P-05` and `SCOPE.md` at `P-06`, once the extractions have catalogued the legacy vocabulary.

**Why this exists now, ahead of its tier.** The three extraction prompts (`P-02`, `P-03`, `P-04`) each ask the builder to catalogue vocabulary collisions. Without an agreed target vocabulary they will invent their own, and three windows will invent three different ones. This document gives them one target.

**What this document is not.** It names entities and states what each one *is*, in one line. It does not define fields, types, keys, cardinality or relationships. Those are `DOMAIN_MODEL.md` (Tier 2) and `DATA_MODEL.md` (Tier 3), and both need the extracts first. Anything here that the extracts contradict loses.

---

# PART 1 — VOCABULARY

## 1.1 The naming rules

1. **Entity names are singular PascalCase.** `Invoice`, not `Invoices`.
2. **No bare ambiguous noun may be an entity name.** If a word means two things anywhere in this product, both uses get a qualifier. `SalesOrderLine` and `InvoiceLine`, never `Line`.
3. **B2S itself is "the platform."** Never "the product" — `Product` is a domain entity.
4. **Every entity name is language-neutral in the code.** Arabic lives in `TranslationEntry`, never in an identifier. Category-specific words are avoided so the platform serves food and garment brands equally: `Component`, not `Ingredient`.
5. **The never-use column is enforceable.** A grep for a forbidden word in a schema, type name or API path is a defect.

## 1.2 The fifteen collisions this resolves

| # | Word | Meant | Resolved as |
|---|---|---|---|
| 1 | customer | the paying company / the brand's buyer | `Tenant` / `Buyer` |
| 2 | user | the tenant / a person with access | `Tenant` / `Member` |
| 3 | admin | B2S staff / the tenant's top role | `Operator` / role `Owner` |
| 4 | brand | the tenant / its visual identity | `Tenant` / `Brand` |
| 5 | product | B2S itself / a catalog item | "the platform" / `Product` |
| 6 | line | product family / a row on a document | `BrandLine` / `InvoiceLine`, `SalesOrderLine`, `PurchaseOrderLine`, `ReturnLine` |
| 7 | order | a sale / a purchase | `SalesOrder` / `PurchaseOrder` |
| 8 | template | packaging layout / CSV import / document layout | `PackagingTemplate` / `ImportTemplate` / `DocumentTemplate` |
| 9 | label | a packaging type / a UI caption | `PackagingType` value / never in domain code |
| 10 | design | a reusable layout / one product's artwork | `PackagingTemplate` / `Artwork` |
| 11 | stock | a quantity / a change to it | `StockLevel` / `StockMovement` |
| 12 | asset | brand media / a financial asset | `MediaAsset` / not modelled |
| 13 | lot | a produced batch | `Batch` — `lot` is never used |
| 14 | export | the act / the file produced | `PrintJob` / `PrintArtifact` |
| 15 | studio | — | module names only, never an entity |

## 1.3 Platform tier — B2S's own concerns

| Entity | Is | Never called |
|---|---|---|
| `Tenant` | The company using B2S. One per company. Holds exactly one `Brand` (per A3). | customer, user, client, account, organisation |
| `Member` | A person with access to one `Tenant`. | user, employee, staff, seat |
| `Membership` | The link binding a `Member` to a `Tenant` with a `Role`. | — |
| `Role` | A named permission set. Values: `Owner`, `Manager`, `Designer`, `Approver`, `Viewer`. | permission, group |
| `Operator` | A B2S platform administrator. Sees account metadata, usage and billing only — never tenant business data (G10). | admin, superuser, staff |
| `Subscription` | A tenant's plan and entitlements. Free at launch (A3). | plan, billing |
| `FeatureFlag` | An entitlement gate, tenant- or plan-scoped. | toggle |
| `ActivityEvent` | One audit-trail entry: who, what, when, which tenant (C15). | log, history, audit |
| `ConsentGrant` | A tenant's explicit, time-boxed permission for Operator support access to their data. | override, impersonation |

`ConsentGrant` exists because G10 promises admin cannot see tenant data. A promise with no mechanism is marketing. This is the mechanism, and every use of it writes an `ActivityEvent`.

## 1.4 Brand tier

| Entity | Is | Never called |
|---|---|---|
| `Brand` | The tenant's master identity container. | tenant, company, account |
| `BrandLine` | A product family under the `Brand` — Balance Fit, Balance Fun (A3). | line, sub-brand, category, division |
| `BrandProfile` | A versioned snapshot of identity values. Archived, never deleted (D5). | version, config, theme, settings |
| `LogoVariant` | One logo rendition: primary, mono, reversed, print-safe, favicon (D2). | logo, image |
| `ColorRole` | A semantic slot — primary, surface, accent, on-surface. | color, swatch |
| `ColorValue` | One `ColorRole`'s value in one space: RGB, CMYK or Pantone (D3). | hex, color |
| `Typeface` | A font family with weights, fallbacks and a licence note (D4). | font |
| `BrandGuideline` | Clear-space, minimum-size and usage rules the tenant authors (D9). | rules, spec |

**D10 open.** `BrandProfile` attaches to `Brand`. Whether a `BrandLine` may carry its own overriding `BrandProfile` is D10. The vocabulary supports either outcome without renaming.

## 1.5 Asset tier

| Entity | Is | Never called |
|---|---|---|
| `MediaAsset` | One logical uploaded item — a logo, photo, icon (D8). | asset, image, file, upload |
| `AssetRendition` | One derivative of a `MediaAsset`, tier `display` or `print`. | version, thumbnail, size |

`AssetRendition` names your two-tier answer. `display` is web-optimised; `print` is the high-resolution master. Both live in tenant-scoped object storage, never in table rows (G11) — the legacy quota failure came from base64 in rows.

## 1.6 Catalog tier

| Entity | Is | Never called |
|---|---|---|
| `Product` | A master catalog item (C7). | item, SKU, article |
| `ProductVariant` | A sellable, stockable variant of a `Product` — size, flavour, pack (C7). | variant, option, SKU |
| `Component` | A stockable input that is not sold on its own (A7). Category-neutral: covers food ingredients, packaging materials, fabric. | ingredient, material, part, raw |
| `BillOfMaterials` | The `Component` composition of a `Product` or `ProductVariant`. | recipe, formula, BOM |
| `ProductCategory` | A tenant-defined classification. | category, type, group |
| `UnitOfMeasure` | A tenant-selectable unit (C8). | unit, UOM |
| `UnitConversion` | A factor between two `UnitOfMeasure` records. | conversion |
| `ProductCode` | One code on a `ProductVariant`. Type `gtin` is entered by the tenant; `internal`, `sku` and `qr` are generated (H4, H5). | barcode, SKU, EAN, UPC |

**`ProductCode` carries the H5 constraint.** Type `gtin` is enter-only, sourced from the tenant's GS1 allocation. Generated codes are Code 128 / Code 39, or EAN-13 restricted to the `02`, `04`, `20`–`29` in-store prefixes, and are flagged not-for-retail in the UI. The platform never mints a general-space retail GTIN.

## 1.7 Packaging tier

| Entity | Is | Never called |
|---|---|---|
| `PackagingType` | A physical output class: label, sticker, box, cup, stand, garment ticket (E7). Extensible per brand category. | mode, shape, format |
| `PackagingTemplate` | A reusable, constrained layout for one `PackagingType`. | template, design, preset |
| `TemplateSlot` | One place in a `PackagingTemplate` where content goes — text, image, code, colour. Seeds `CONTENT_MODEL.md`. | field, placeholder, zone |
| `TemplateConstraint` | What a tenant may and may not change on a slot or a dimension. The heart of "constrained customisation." | rule, lock |
| `DimensionVariant` | A size configuration of a `PackagingTemplate`. | size, dimension |
| `Artwork` | A `PackagingTemplate` bound to a `ProductVariant` and a `BrandProfile`. **This is the thing that gets approved and printed.** | design, label, template, layout |
| `ArtworkVersion` | An immutable snapshot of an `Artwork`. What went to print in March stays reproducible. | revision |
| `ApprovalRequest` | A request to approve one `ArtworkVersion` (F6). | approval, review |
| `ApprovalStep` | One stage: designer, owner, or an added approver (F6). | stage, signoff |
| `DieLine` | A cut or fold path for a `PackagingTemplate` (E5). | cutline, outline |

`Artwork` is the load-bearing name here. It separates the reusable template from one product's specific instance, and it is what a print shop already calls the thing. `PackagingTemplate` is what a brand starts from; `Artwork` is what they end up with.

## 1.8 Print tier

| Entity | Is | Never called |
|---|---|---|
| `PrintPreset` | A named bundle: bleed, trim, safe area, substrate, colour space, tolerance (E3, E8). | preset, profile, settings |
| `Substrate` | Material and finish — matte, gloss, foil (E9). Affects colour. | material, paper, stock |
| `PrintJob` | A request to produce output from one or more `ArtworkVersion` records. | print, export, render |
| `PrintArtifact` | One generated file: PDF, PNG, cutout (E1). Deterministic — identical bytes on every platform (E11). | export, output, file, download |
| `Imposition` | A sheet layout placing many `Artwork` instances on one sheet (E6). | sheet, gangup, nesting |
| `CalibrationRecord` | A measured physical deviation for one printer and paper. Closes CF-05 and CF-17. | calibration, tolerance |

`PrintArtifact` separated from `PrintJob` is what makes E11 testable: the same job on two platforms must produce byte-identical artifacts, and that is an assertion something can hold.

## 1.9 Inventory tier

| Entity | Is | Never called |
|---|---|---|
| `Location` | A place stock is held (C6). | warehouse, site, store |
| `StockLevel` | The quantity of one `ProductVariant` or `Component` at one `Location`. Derived, never authoritative. | stock, inventory, quantity, balance |
| `Batch` | A produced lot with a production date and expiry (C4). | lot, batch number |
| `StockMovement` | **Every** quantity change, typed. The single source of truth; `StockLevel` is its sum. | transaction, adjustment, entry |
| `MovementReason` | Why a `StockMovement` happened: `purchase`, `production`, `sale`, `return_restock`, `return_writeoff`, `adjustment`, `transfer`. | type, kind |
| `ProductionRun` | An event producing `Batch` records — of `ProductVariant`, and also of printed labels and stickers (C4). | production, run, job |
| `TraceLink` | A resolvable edge from a `Batch` to the `Invoice` records that shipped it (C5). | trace, lineage |

Two things this settles. Returns are `StockMovement` records with reason `return_restock` or `return_writeoff` — C3, expressed structurally rather than as a special case. And `StockLevel` being derived from `StockMovement` is why the legacy tools' silent stock drift cannot recur: there is one write path.

**Open for `DOMAIN_MODEL.md`:** C4 says produced labels and stickers are batch-tracked. That means a `PrintJob` can result in stock. Whether printed material is a `Component`, a `ProductVariant`, or its own kind is a real modelling question and it is not mine to settle here.

## 1.10 Purchasing tier

| Entity | Is | Never called |
|---|---|---|
| `Supplier` | Who the tenant buys from (C13). | vendor, seller |
| `SupplierContact` | A person at a `Supplier`. | contact |
| `PurchaseOrder` | An order the tenant places (C13). | order, PO |
| `PurchaseOrderLine` | One row on a `PurchaseOrder`. | line, item |
| `GoodsReceipt` | Confirmation that ordered quantities arrived. Generates `StockMovement`. | receipt, delivery, GRN |

`GoodsReceipt` separated from `PurchaseOrder` matters because ordered and received quantities differ in practice, and a `PurchaseOrder` alone cannot represent a partial delivery.

## 1.11 Sales tier

| Entity | Is | Never called |
|---|---|---|
| `Buyer` | Who the tenant sells to. | customer, client, account |
| `BuyerContact` | A person at a `Buyer`. | contact |
| `SalesOrder` | An order a `Buyer` places. | order |
| `SalesOrderLine` | One row on a `SalesOrder`. | line, item |
| `Shipment` | Goods leaving, against a `SalesOrder`. Generates `StockMovement` and the `TraceLink`. | delivery, dispatch |
| `Invoice` | A billing document (C11). | bill |
| `InvoiceLine` | One row on an `Invoice`. | line, item |
| `Payment` | Money received against an `Invoice`. Full, partial or underpaid (C12). | transaction |
| `PaymentMethod` | `cash`, `card`, `other` (C12). | type |
| `Receipt` | Proof of a `Payment`, attachment optional (C12). | proof, voucher |
| `Return` | Goods coming back from a `Buyer` (C2). | refund, RMA |
| `ReturnLine` | One returned item with its disposition. | line, item |
| `ReturnDisposition` | `restock` or `writeoff` — each with a distinct stock and money effect. | reason, action |
| `PriceList` | Tenant-defined pricing, optionally per `Buyer` and per `Currency`. | pricing, tariff |

**Open for `DOMAIN_MODEL.md`:** C3 makes returns stock movements, which settles the stock side. The **money** side still has to land somewhere — reducing the original `Invoice`, or a separate credit document. Not resolved here; the extracts must show what the business actually does before it is decided.

**`Shipment` is a new entity your module list did not have.** C5 requires resolving a batch to the invoices that shipped it. Something must record that shipping happened, distinct from invoicing, because the two do not always coincide.

## 1.12 Costing tier

| Entity | Is | Never called |
|---|---|---|
| `CostRecord` | The cost of a `Component` or `ProductVariant` at a point in time. | cost, price |
| `OperatingCost` | A business cost not attributable to one item — rent, utilities, salaries. | expense, overhead |
| `CostAllocation` | The policy spreading `OperatingCost` across products. Configurable — it is tenant policy, not an invariant. | allocation, distribution |

## 1.13 Documents tier

| Entity | Is | Never called |
|---|---|---|
| `DocumentTemplate` | A layout for a business document: invoice, receipt, purchase order, delivery note. Brand-themed. | template, form, layout |
| `DocumentArtifact` | A rendered, immutable business document — the PDF a buyer receives. | PDF, export, file |

**This module was missing from your list entirely.** A brand-themed invoice PDF is not `Artwork` and not a `PrintArtifact`; it is a business document, and the legacy Invoice Pro spent most of its 4,284 lines on it. Without this module, invoicing has no output.

## 1.14 System tier

| Entity | Is | Never called |
|---|---|---|
| `TaxRule` | A rate and its mode, inclusive or exclusive. Toggleable per tenant (C10). | tax, VAT |
| `Currency` | A tenant-selectable currency (C9). | money |
| `ExchangeRate` | A rate between two `Currency` records. | rate, fx |
| `Locale` | A language and region pairing, with direction (D7). | language, lang |
| `TranslationEntry` | One string in one `Locale`. The store that makes "no hardcoded literals" achievable (D6, D7). | string, i18n, label |
| `RegulatoryProfile` | A tenant's selected regime and its declaration rules (F1, F4, F5). | compliance, regulation |
| `ImportTemplate` | A CSV column contract for one entity, derived from the frozen schema (answer 8). | template, csv |
| `ImportRun` | One import attempt, with mode `dry_run` or `commit`. | import, upload |
| `ImportRowError` | One row-level validation failure with its reason. | error |
| `BackupSnapshot` | A point-in-time tenant export (G8, C14). | backup, export |
| `Notification` | A message to a `Member` — an approval waiting, low stock, a failed import. | alert, message |
| `DesignSuggestion` | Output of the Design Assistant. **Needs an OD (CF-30).** | suggestion, AI |

## 1.15 The enforcement list

A grep for any of these in a table name, type name, API path or field name is a defect:

```
customer   user      admin     line      order     template
label      design    stock     asset     lot       export
ingredient studio    output    item      preset
```

Each has a qualified replacement above. `Buyer` not customer. `Member` not user. `Operator` not admin. `InvoiceLine` not line. `SalesOrder` or `PurchaseOrder` not order. `PackagingTemplate`, `ImportTemplate` or `DocumentTemplate` not template. `Artwork` not design. `StockLevel` or `StockMovement` not stock. `MediaAsset` not asset. `Batch` not lot. `PrintArtifact` not export. `Component` not ingredient. `ProductCode` not barcode.

---

# PART 2 — THE COMPLETE MODULE SET

Twenty-two modules. Your list had nine; §4.3 of the prepare-phase runbook extended it to fourteen; this is the full set traced against all 56 signed decisions, plus the modules no decision named but which the signed set requires.

`R1` / `R2` / `R3` is the proposed release assignment from the runbook §5, awaiting your signature.

```
B2S | BRAND TO SHELF                                    build.package.sell
│
├── 01 Auth & Access                                    R1   G3, G2
│   Sign-in, sessions, Membership, Role, invitations, password recovery
│
├── 02 Onboarding                                       R1   A1  ← absent from your list
│   The wizard: identity, logo, type, numbers, colours, business data.
│   The core mechanic of the entire product.
│
├── 03 Brand                                            R1   D1-D10
│   ├── Identity ....... Brand, BrandProfile, versions, archive-never-delete
│   ├── Lines .......... BrandLine, inherit-or-override (D10 pending)
│   ├── Logos .......... LogoVariant set
│   ├── Colours ........ ColorRole + ColorValue across RGB/CMYK/Pantone
│   ├── Type ........... Typeface, weights, fallbacks, licence notes
│   └── Guidelines ..... clear-space, minimum-size, tenant-authored
│
├── 04 Assets                                           R1   D8, G11  ← absent
│   MediaAsset library, AssetRendition display+print tiers, object storage,
│   size governance
│
├── 05 Catalog                                          R1   C7, C8, A7, H4, H5
│   ├── Products ....... Product + ProductVariant, master/variant
│   ├── Components ..... stockable inputs, category-neutral
│   ├── BOM ............ BillOfMaterials
│   ├── Categories
│   ├── Units .......... UnitOfMeasure + UnitConversion
│   └── Codes .......... GTIN entry, internal generation, QR
│
├── 06 Templates                                        R1   answer 9  ← absent
│   PackagingTemplate library, TemplateSlot, TemplateConstraint,
│   DimensionVariant, versioning. The constrained-customisation engine.
│
├── 07 Packaging                                        R1 labels+stickers · R2 rest
│   ├── Artwork ........ per ProductVariant, per BrandProfile
│   ├── Labels · Stickers ......................... R1
│   ├── Boxes · Cups · Stands · Garment Tickets ... R2   E7
│   └── ArtworkVersion — immutable, reproducible
│
├── 08 Approvals                                        R2   F6  ← absent
│   ApprovalRequest, ApprovalStep, designer → owner → added approvers.
│   Cross-cutting: may later govern PurchaseOrder and Invoice too.
│
├── 09 Print                                            R1 PDF+PNG · R2 rest
│   ├── Presets ........ bleed, trim, safe area, substrate, tolerance   R1
│   ├── Export ......... PrintArtifact, deterministic (E11)             R1
│   ├── Die-lines ...................................................... R2   E5
│   ├── Imposition ..................................................... R2   E6
│   └── Calibration .... CalibrationRecord, measured not assumed        R1   CF-05
│
├── 10 Inventory                                        R1 basic · R2 depth
│   ├── Stock .......... StockLevel derived from StockMovement          R1
│   ├── Movements ...... the single write path                          R1
│   ├── Locations ...................................................... R2   C6
│   ├── Batches ........ Batch, expiry ................................. R2   C4
│   └── Traceability ... TraceLink, batch → invoice .................... R2   C5
│
├── 11 Production                                       R2   C4, A7  ← absent
│   ProductionRun, recipes, produced ProductVariant batches,
│   produced labels and stickers as stock
│
├── 12 Purchasing                                       R2   C13  ← absent
│   Supplier, SupplierContact, PurchaseOrder, PurchaseOrderLine,
│   GoodsReceipt
│
├── 13 Sales                                            R1   C11, C12, C2, C3
│   ├── Buyers ......... Buyer, BuyerContact                            R1
│   ├── Orders ......... SalesOrder, SalesOrderLine                     R1
│   ├── Shipments ...... Shipment ...................................... R2   ← absent, C5 needs it
│   ├── Invoices ....... Invoice, InvoiceLine                           R1
│   ├── Payments ....... full/partial/underpaid, cash/card/other        R1
│   ├── Receipts ....... attachment optional                            R1
│   ├── Returns ........ as StockMovement, restock or writeoff          R1
│   └── Pricing ........ PriceList ..................................... R2   ← needs an OD
│
├── 14 Documents                                        R1   ← absent, load-bearing
│   DocumentTemplate + DocumentArtifact. Brand-themed invoice, receipt,
│   purchase order, delivery note. Without this, invoicing has no output.
│
├── 15 Costing                                          R2   A7  ← absent
│   CostRecord, OperatingCost, CostAllocation policy, COGS, margin
│
├── 16 Analytics                                        R2
│   Sales, inventory, profit, production. Reads Costing and Inventory.
│
├── 17 Import                                           R1 products+buyers · R2 rest
│   ImportTemplate per entity, ImportRun with dry-run, ImportRowError,
│   partial-import policy. The onboarding path for every new brand.
│
├── 18 Settings                                         R1   C8-C10, D6, D7, G2, G8
│   ├── Members & Roles
│   ├── Tax ............ TaxRule, on/off per tenant
│   ├── Currency ....... Currency, ExchangeRate
│   ├── Locales ........ Locale, TranslationEntry
│   ├── Regulatory ..... RegulatoryProfile .............................. R2   F1,F4,F5
│   └── Backups ........ BackupSnapshot, export, deletion              R1   C14,G8
│
├── 19 Audit                                            R1   C15  ← absent
│   ActivityEvent. Cross-cutting, append-only. Also records every
│   ConsentGrant use, which is what makes G10 a real promise.
│
├── 20 Notifications                                    R2   ← absent, F6 requires it
│   Approval waiting, low stock, failed import, expiring batch.
│   F6's multi-stage approval cannot function without it.
│
├── 21 Design Assistant                                 R3   ← needs an OD, CF-30
│   DesignSuggestion. No decision behind it yet: what it does, whether it
│   is a paid tier, what data it may read.
│
└── 22 Dashboard                                        R1
    The landing surface. What a Member sees on sign-in, per Role.

────────────────────────────────────────────────────────────────────────
[ OPERATOR CONSOLE — a separate surface, not a tenant module ]      R1   G10
    Tenants, usage, billing, FeatureFlag, ConsentGrant.
    Sees account metadata only. Never tenant business data.
```

## 2.1 What changed against your list

**Nine modules kept, renamed for the vocabulary:** Brand · Packaging · Print · Inventory (was Inventory) · Sales · Invoices → folded into Sales + Documents · Analytics · Design Assistant · plus your Labels/Stickers as Packaging children.

**Thirteen added, each traced to a decision you already signed:**

| Module | Required by | Why it cannot be omitted |
|---|---|---|
| Auth & Access | G2, G3 | Tenant isolation begins here |
| Onboarding | A1 | The core product mechanic, absent from your tree |
| Assets | D8, G11 | Two-tier storage has no home otherwise |
| Templates | answer 9 | Template-driven is the frozen design decision |
| Approvals | F6 | Multi-stage approval, no home |
| Production | C4, A7 | Batch tracking of produced goods |
| Purchasing | C13 | Suppliers and POs, signed IN |
| Documents | C11, C12 | **Invoicing has no output without it** |
| Costing | A7 | Analytics→Profit needs a source |
| Import | answer 8 | CSV onboarding for every brand |
| Settings | C8, C9, C10, D6, D7, G8 | Six signed decisions with nowhere to live |
| Audit | C15 | Signed, and it is what makes G10 enforceable |
| Notifications | F6 | Approvals cannot function without it |

**Three added that no decision named, but the signed set requires:**

- **Shipment** (in Sales) — C5 requires resolving a batch to the invoices that shipped it. Something must record shipping, distinct from invoicing.
- **PriceList** (in Sales) — C9 multi-currency plus multiple buyers implies price variation. **Needs an OD.**
- **Dashboard** — a role-aware landing surface. Not strictly required; recommended.

## 2.2 New ODs this raises

| OD | Question |
|---|---|
| **OD-C16** | Does a `Return`'s money effect reduce the original `Invoice`, or create a separate credit document? C3 settled the stock side only. |
| **OD-C17** | Are produced labels and stickers a `Component`, a `ProductVariant`, or their own kind? C4 batch-tracks them; their nature is undecided. |
| **OD-C18** | Is `Shipment` a distinct entity, or is invoicing the shipping event? C5 needs one of these to be true. |
| **OD-C19** | `PriceList` — in scope, and if so per-buyer, per-currency, or both? |
| **OD-E12** | Does a `PrintJob` produce stock? If printed stickers are inventory, Print and Inventory are coupled. |
| **OD-G12** | Design Assistant: what it does, which release, which tier, and what tenant data it may read. Closes CF-30. |

Six new decisions, all surfaced by tracing your own answers to their consequences rather than by adding scope. They go into `DECISIONS.md` at `P-06`.

---

# PART 3 — HOW TO USE THIS BEFORE THE EXTRACTIONS

Commit this file, then add one paragraph to each of `P-02`, `P-03` and `P-04`, inside the context section:

```
VOCABULARY TARGET: docs/product/VOCABULARY_DRAFT.md is the provisional entity
vocabulary for B2S. When Part 1.5 / 1.5 / 1.6 of your prompt asks you to catalogue
the legacy tool's vocabulary, MAP each legacy term to a VOCABULARY_DRAFT entity
name and report the mapping. Where a legacy term has no target entity, say so —
that is a gap in the vocabulary, not a gap in your extraction, and it is a finding.
Where the legacy tool's concept does not fit its apparent target, say that too.
Do not adopt legacy names. Do not invent new entity names.
```

That turns three independent extractions into three passes against one target, and it converts vocabulary drift from something discovered later into something reported now.
