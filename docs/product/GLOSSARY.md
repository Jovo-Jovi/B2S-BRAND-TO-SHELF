# GLOSSARY — B2S

**Status:** AUTHORED. Tier 0, precedence slot 1. **Supersedes `VOCABULARY_DRAFT.md`.**
**Authored:** 2026-08-01 by the reviewer surface.
**Closes:** CF-28.
**Source:** `VOCABULARY_DRAFT.md` Part 1, plus the vocabulary sections of all three extracts — which supplied the Arabic and the file:line evidence the draft could not.

> **Binding.** A bare ambiguous noun in a table name, type name, API path or field
> name is a **defect**, not a style preference. §5 is greppable.

---

## 1. The naming rules

1. **Entity names are singular PascalCase.** `Invoice`, not `Invoices`.
2. **No bare ambiguous noun may be an entity name.** If a word means two things
   anywhere in this platform, both uses take a qualifier. `SalesOrderLine` and
   `InvoiceLine`, never `Line`.
3. **B2S itself is "the platform."** Never "the product" — `Product` is an entity.
4. **Every identifier is language-neutral.** Arabic lives in `TranslationEntry`,
   never in an identifier, a key, or an enumeration value (CF-65).
5. **Category-neutral wins.** `Component`, not `Ingredient`, so the platform
   serves food and garment brands equally.
6. **One concept, one term.** If two words mean one thing, one of them is retired.

---

## 2. CF-28 — the "customer" collision, resolved

The retiring tools used one word for two entities, and the evidence is
unambiguous:

| Evidence | Sense |
|---|---|
| `bb-stock-costs.html:1178` — the shared folder path contains `invoices customers` | **TENANT** — the business that owns the data |
| `:902` — the same path as a `file://` link | **TENANT** |
| `:1182` — `READ_KEYS` includes `bb_customers` | **BUYER** — a directory of who the tenant sells to |
| `:3264`, `:3265` — `customerName`, `customerId` on a `Return` | **BUYER** |
| `:3276-3277` — `toCustomerId`, `toCustomerName` in `outAllocations` | **BUYER** — the *receiving* buyer |
| `:3320`, `:3389`, `:3411` | **BUYER** |

**Resolution — `Tenant` and `Buyer`. The word "customer" is never used again**, in
code, in documents, in prompts, or in verdicts. In prose, if the word is
unavoidable, it is always qualified.

---

## 3. The collision table

| # | Legacy word | Meant | Resolved as |
|---|---|---|---|
| 1 | customer | the paying company / who the brand sells to | `Tenant` / `Buyer` |
| 2 | user | the tenant / a person with access | `Tenant` / `Member` |
| 3 | admin | B2S staff / the tenant's top role | `Operator` / role `Owner` |
| 4 | brand | the tenant / its visual identity | `Tenant` / `Brand` |
| 5 | product | B2S itself / a catalog item | "the platform" / `Product` |
| 6 | line | a product family / a row on a document | `BrandLine` / `InvoiceLine`, `SalesOrderLine`, `PurchaseOrderLine`, `ReturnLine` |
| 7 | order | a sale / a purchase | `SalesOrder` / `PurchaseOrder` |
| 8 | template | packaging layout / CSV contract / document layout | `PackagingTemplate` / `ImportTemplate` / `DocumentTemplate` |
| 9 | label | a packaging class / a UI caption | `PackagingType` value / never in domain code |
| 10 | design | a reusable layout / one product's artwork | `PackagingTemplate` / `Artwork` |
| 11 | stock | a quantity / a change to it | `StockLevel` / `StockMovement` |
| 12 | asset | brand media / a financial asset | `MediaAsset` / not modelled |
| 13 | lot | a produced batch | `Batch` — `lot` is never used |
| 14 | export | the act / the file produced | `PrintJob` / `PrintArtifact` |
| 15 | preset | a colour theme / a print margin set | `BrandTheme` / `DocumentTemplate` |
| 16 | item | a row on a document / a catalog entry | `InvoiceLine` etc. / `Product` |
| 17 | ingredient | a recipe input | `Component` |
| 18 | studio | — | module names only, never an entity |

**Collision 15 is new to this glossary.** `VOCABULARY_DRAFT.md` §1.2 had fifteen;
the extracts found `preset` naming two unrelated entities — `bb_color_presets`
(a colour theme) and `INV_PRINT_PRESETS` (a print margin set) —
`EXTRACT_STOCK_COSTS.md` §1.5.3.

---

## 4. Terms, with Arabic

Arabic here is the UI term the retiring tools used, recorded as evidence of what
the owner expects to read. It is **not** an identifier and never becomes one.

### 4.1 Platform tier

| Term | Arabic (legacy UI) | Is | NEVER call it |
|---|---|---|---|
| `Tenant` | — | The company using B2S. One per company, holds exactly one `Brand` | customer, user, client, account, organisation |
| `Member` | — | A person with access to one `Tenant` | user, employee, staff, seat |
| `Membership` | — | The link binding a `Member` to a `Tenant` with a `Role` | — |
| `Role` | — | A named permission set: `Owner`, `Manager`, `Designer`, `Approver`, `Viewer` | permission, group |
| `Operator` | — | A B2S platform administrator. Account metadata, usage and billing only | admin, superuser, staff |
| `ConsentGrant` | — | A tenant's explicit, time-boxed permission for `Operator` support access | override, impersonation |
| `ActivityEvent` | — | One audit-trail entry: who, what, when, which tenant | log, history, audit |
| `Subscription` | — | A tenant's plan and entitlements. Free at launch | plan, billing |
| `FeatureFlag` | — | An entitlement gate, tenant- or plan-scoped | toggle |

### 4.2 Brand tier

| Term | Arabic | Is | NEVER call it |
|---|---|---|---|
| `Brand` | `علامة تجارية` | The tenant's master identity container | tenant, company, account |
| `BrandLine` | — | A product family under the `Brand` | line, sub-brand, category, division |
| `BrandProfile` | — | A versioned snapshot of identity values. Archived, never deleted | version, config, theme, settings |
| `BrandTheme` | — | A named colour set applied to output | preset, theme, palette |
| `LogoVariant` | — | One logo rendition: primary, mono, reversed, print-safe, favicon | logo, image |
| `ColorRole` | — | A semantic slot: primary, surface, accent, on-surface | color, swatch |
| `ColorValue` | — | One `ColorRole`'s value in one space: RGB, CMYK or Pantone | hex, color |
| `Typeface` | — | A font family with weights, fallbacks and a licence note | font |
| `BrandGuideline` | — | Clear-space, minimum-size and usage rules the tenant authors | rules, spec |
| `MediaAsset` | — | One logical uploaded item — a logo, photo, icon | asset, image, file, upload |
| `AssetRendition` | — | One derivative of a `MediaAsset`, tier `display` or `print` | version, thumbnail, size |

### 4.3 Catalog tier

| Term | Arabic | Is | NEVER call it |
|---|---|---|---|
| `Product` | `منتج` | A master catalog item | item, SKU, article |
| `ProductVariant` | — | A sellable, stockable variant — size, flavour, pack | variant, option, SKU |
| `Component` | `مادة` · `عبوة` · `مكون` | A stockable input not sold on its own. Covers raw material, packaging, fabric | ingredient, material, part, raw |
| `Recipe` | `وصفة` | The `Component` composition of a `Product` or `ProductVariant` | BOM, formula, bill of materials |
| `ProductCategory` | `تصنيف` | A tenant-defined classification | category, type, group |
| `UnitOfMeasure` | `وحدة` | A tenant-selectable unit | unit, UOM |
| `UnitConversion` | — | A factor between two `UnitOfMeasure` records | conversion |
| `ProductCode` | — | One code on a `ProductVariant`. `gtin` is entered; `internal`, `sku`, `qr` are generated | barcode, SKU, EAN, UPC |

> **`Recipe` is kept, not renamed to `BillOfMaterials`.** `VOCABULARY_DRAFT.md`
> proposed the latter; the extracts show `وصفة` is the owner's word and it collides
> with nothing. Category-neutral for garments too — a garment has a recipe of
> fabric and trim.

### 4.4 Inventory tier

| Term | Arabic | Is | NEVER call it |
|---|---|---|---|
| `Location` | `موقع` | A place stock is held | warehouse, site, store |
| `StockLevel` | `مخزون` | Quantity of one `ProductVariant` or `Component` at one `Location`. **Derived, never authoritative** | stock, inventory, quantity, balance |
| `StockMovement` | *(no legacy word)* | **Every** quantity change, typed. The single source of truth | transaction, adjustment, entry |
| `MovementReason` | — | `purchase`, `production`, `sale`, `return_restock`, `return_writeoff`, `adjustment`, `transfer`, `opening_balance`, `stocktake` | type, kind |
| `Batch` | `دفعة` | A produced batch with production date and expiry | lot, batch number |
| `ProductionRun` | `إنتاج` · `دورة إنتاج` | An event producing `Batch` records, including printed material | production, run, job |
| `TraceLink` | — | A resolvable edge from a `Batch` to the `Invoice` records that shipped it | trace, lineage |

> **`StockMovement` had no word in the legacy tools at all** — the concept was
> implicit. `دفعة` meant *recipe yield*, never a tracked batch
> (`EXTRACT_STOCK_COSTS.md` §1.5.1). Both are requirements B2S adds.
>
> `opening_balance` (`رصيد افتتاحي`) and `stocktake` (`تسوية جرد`) were stored as
> **sentinel strings inside a supplier text field**. They are typed reasons here.

### 4.5 Purchasing tier

| Term | Arabic | Is | NEVER call it |
|---|---|---|---|
| `Supplier` | `مورد` | Who the tenant buys from. **An entity, not free text** | vendor, seller |
| `SupplierContact` | — | A person at a `Supplier` | contact |
| `PurchaseOrder` | `أمر شراء` | An order the tenant places | order, PO |
| `PurchaseOrderLine` | `شراء` | One row on a `PurchaseOrder` | line, item |
| `GoodsReceipt` | `استلام` | Confirmation that ordered quantities arrived. Generates `StockMovement` | receipt, delivery, GRN |

### 4.6 Sales tier

| Term | Arabic | Is | NEVER call it |
|---|---|---|---|
| `Buyer` | `عميل` | Who the tenant sells to | customer, client, account |
| `BuyerContact` | — | A person at a `Buyer` | contact |
| `SalesOrder` | `طلب تحضير` | An order a `Buyer` places | order, pending invoice |
| `SalesOrderLine` | — | One row on a `SalesOrder` | line, item |
| `Shipment` | — | Goods leaving. Generates `StockMovement` and the `TraceLink` | delivery, dispatch |
| `Invoice` | `فاتورة` | A billing document. **Immutable once issued** | bill |
| `InvoiceLine` | — | One row on an `Invoice` | line, item |
| `Payment` | `دفعة` (payment sense) | Money received against an `Invoice`. Full, partial or underpaid | transaction |
| `PaymentMethod` | — | `cash`, `card`, `other` | type |
| `Receipt` | `إيصال` | Proof of a `Payment`, attachment optional | proof, voucher |
| `Return` | `مرتجع` · `المرتجعات` | Goods coming back from a `Buyer` | refund, RMA |
| `ReturnLine` | — | One returned item with its disposition | line, item |
| `ReturnDisposition` | `مخزون` / `تالف` | `restock` or `writeOff` | reason, action, expired |
| `CreditNote` | — | The money effect of a `Return`. Outstanding = Invoice − Payments − CreditNotes | credit, refund |
| `PriceList` | — | Tenant-defined pricing, optionally per `Buyer` and per `Currency` | pricing, tariff |

> **Two warnings the extracts force into this glossary.**
>
> `دفعة` means **three** things in the legacy set — recipe yield, a produced
> batch, and a payment instalment. Only `Payment` and `Batch` survive as entities;
> yield is a field on `Recipe`.
>
> `ReturnDisposition` carries a **legacy mislabel**: the write-off disposition's
> identifier was `expired` while its Arabic label read `تالف` — *damaged*. Two
> different meanings on one value. B2S uses `writeOff`, and the reason for the
> write-off is a separate field. `EXTRACT_STOCK_COSTS.md` §1.5.1, `:790`, `:3289`.

### 4.7 Packaging and print tier

| Term | Arabic | Is | NEVER call it |
|---|---|---|---|
| `PackagingType` | — | A physical output class: label, sticker, box, cup, stand, garment ticket | mode, shape, format |
| `PackagingTemplate` | — | A reusable, constrained layout for one `PackagingType` | template, design, preset |
| `TemplateSlot` | — | One place in a `PackagingTemplate` where content goes | field, placeholder, zone |
| `TemplateConstraint` | — | What a tenant may and may not change. The heart of constrained customisation | rule, lock |
| `DimensionVariant` | — | A size configuration of a `PackagingTemplate` | size, dimension |
| `Artwork` | — | A `PackagingTemplate` bound to a `ProductVariant` and a `BrandProfile`. **This is what gets approved and printed** | design, label, template, layout |
| `ArtworkVersion` | — | An immutable snapshot of an `Artwork` | revision |
| `ApprovalRequest` | — | A request to approve one `ArtworkVersion` | approval, review |
| `ApprovalStep` | — | One stage: designer, owner, or an added approver | stage, signoff |
| `DieLine` | — | A cut or fold path for a `PackagingTemplate` | cutline, outline |
| `PrintPreset` → **`PrintProfile`** | — | A named bundle: bleed, trim, safe area, substrate, colour space, tolerance | preset, profile, settings |
| `Substrate` | — | Material and finish — matte, gloss, foil | material, paper, stock |
| `PrintJob` | — | A request to produce output from one or more `ArtworkVersion` records. **Produces a file, never stock** | print, export, render |
| `PrintArtifact` | — | One generated file: PDF, PNG, cutout. Byte-identical across platforms | export, output, file, download |
| `Imposition` | — | A sheet layout placing many `Artwork` instances on one sheet | sheet, gangup, nesting |
| `CalibrationRecord` | — | A measured physical deviation for one printer and paper | calibration, tolerance |
| `DocumentTemplate` | — | A layout for a business document: invoice, receipt, PO, delivery note | template, form, preset |
| `DocumentArtifact` | — | A rendered, immutable business document | PDF, export, file |

> **`PrintPreset` is renamed `PrintProfile`.** `VOCABULARY_DRAFT.md` used
> `PrintPreset`, but collision 15 makes `preset` forbidden. `PrintProfile` is the
> replacement.

### 4.8 Costing and system tier

| Term | Arabic | Is | NEVER call it |
|---|---|---|---|
| `CostRecord` | `تكلفة` | The cost of a `Component` or `ProductVariant` at a point in time | cost, price |
| `OperatingCost` | `مصروف تشغيلي` | A business cost not attributable to one item | expense, overhead |
| `CostAllocation` | — | The policy spreading `OperatingCost` across products. Tenant policy, not an invariant | allocation, distribution |
| `TaxRule` | — | A rate and its mode, inclusive or exclusive. Toggleable per tenant | tax, VAT |
| `Currency` | `عملة` | A tenant-selectable currency | money |
| `ExchangeRate` | — | A rate between two `Currency` records | rate, fx |
| `Locale` | `لغة` | A language and region pairing, with direction | language, lang |
| `TranslationEntry` | — | One string in one `Locale`. What makes "no literals" achievable | string, i18n, label |
| `RegulatoryProfile` | — | A tenant's selected regime and its declaration rules | compliance, regulation |
| `ImportTemplate` | — | A CSV column contract for one entity | template, csv |
| `ImportRun` | — | One import attempt, mode `dry_run` or `commit` | import, upload |
| `ImportRowError` | — | One row-level validation failure with its reason | error |
| `BackupSnapshot` | — | A point-in-time tenant export | backup, export |
| `Notification` | `تنبيه` | A message to a `Member` | alert, message |
| `DesignSuggestion` | — | Output of the Design Assistant (R3) | suggestion, AI |

---

## 5. The enforcement list

A grep for any of these in a table name, type name, API path, field name or
enumeration value is a **defect**:

```
customer   user      admin     line      order     template
label      design    stock     asset     lot       export
ingredient studio    output    item      preset    material
recipe*    batch*    inventory
```

\* `Recipe` and `Batch` are **permitted as exact PascalCase entity names only**.
Lowercase `recipe` or `batch` as a field or a bare noun is a defect, because both
carried two meanings in the legacy set.

Each has a qualified replacement in §4. `Buyer` not customer. `Member` not user.
`Operator` not admin. `InvoiceLine` not line. `SalesOrder` or `PurchaseOrder` not
order. `PackagingTemplate`, `ImportTemplate` or `DocumentTemplate` not template.
`Artwork` not design. `StockLevel` or `StockMovement` not stock. `MediaAsset` not
asset. `Batch` not lot. `PrintArtifact` not export. `Component` not ingredient or
material. `BrandTheme` or `PrintProfile` not preset. `ProductCode` not barcode.

---

## 6. What this glossary changed against the draft

| Change | Why |
|---|---|
| Collision 15 added — `preset` names two entities | `EXTRACT_STOCK_COSTS.md` §1.5.3 |
| `PrintPreset` → `PrintProfile` | Consequence of collision 15 |
| `BrandTheme` added as an entity | `bb_color_presets` had no target term in the draft |
| `BillOfMaterials` → `Recipe` | `وصفة` is the owner's word and collides with nothing |
| `material` added to the enforcement list | Legacy `material` and `package` are both `Component` |
| `MovementReason` gained `opening_balance` and `stocktake` | They existed as sentinel strings in a supplier field |
| `ReturnDisposition` value `expired` → `writeOff` | Identifier and Arabic label disagreed |
| Arabic column added throughout | The draft had none; the extracts supplied it |

---

*Tier 0. Supersedes `VOCABULARY_DRAFT.md`, which moves to `docs/archive/2026-08/`.*
