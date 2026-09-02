# DOMAIN MODEL — B2S

**Status:** AUTHORED. Tier 2, precedence slot 3.
**Authored:** 2026-08-01 by the reviewer surface.
**Closes:** OD-C1. **Resolves:** all 13 DIVERGENT items from `EXTRACT_INVOICE_PRO.md` Part 9.
**Depends on:** `PRODUCT_BRIEF.md`, `GLOSSARY.md`, `SCOPE.md`, `DECISIONS.md`.

> Naming is `GLOSSARY.md`. This document says what exists, how it relates, and
> what is true of it. Storage shape is `DATA_MODEL.md`. Arithmetic is
> `CALC_SPEC.md`.

---

## 1. Counting methodology

**An entity is a thing with independent identity and its own lifecycle.** It is
counted if it can be created, referenced and retired on its own.

Not counted: value objects with no independent identity (an address, a money
amount), enumerations, derived projections, and join records that carry no data
of their own beyond the two keys they join.

`MovementReason` and `ReturnDisposition` are enumerations and are not counted.

Counted even though they look derivative: `StockLevel` (a derived projection with
its own identity per variant-location pair, materialised for query) and
`ArtworkVersion` (immutable, independently referenced by `PrintJob`).

**Total: 88 entities across 9 tiers.** Where a later document disagrees with this
count, this document wins and the other is amended.

---

## 2. The entity set

### 2.1 Platform tier — 10
`Tenant` · `Member` · `Membership` · `Role` · `Operator` · `ConsentGrant` ·
`ActivityEvent` · `Invitation` · `Subscription` · `FeatureFlag`

### 2.2 Brand tier — 9
`Brand` · `BrandLine` · `BrandProfile` · `BrandTheme` · `LogoVariant` ·
`ColorRole` · `ColorValue` · `Typeface` · `BrandGuideline`

### 2.3 Asset tier — 2
`MediaAsset` · `AssetRendition`

### 2.4 Catalog tier — 9
`Product` · `ProductVariant` · `Component` · `Recipe` · `RecipeLine` ·
`ProductCategory` · `UnitOfMeasure` · `UnitConversion` · `ProductCode`

### 2.5 Inventory tier — 6
`Location` · `StockLevel` · `StockMovement` · `Batch` · `ProductionRun` ·
`TraceLink`

### 2.6 Purchasing tier — 5
`Supplier` · `SupplierContact` · `PurchaseOrder` · `PurchaseOrderLine` ·
`GoodsReceipt`

### 2.7 Sales tier — 14
`Buyer` · `BuyerContact` · `SalesOrder` · `SalesOrderLine` · `Shipment` ·
`Invoice` · `InvoiceLine` · `Payment` · `Receipt` · `Return` · `ReturnLine` ·
`ReturnAllocation` · `CreditNote` · `PriceList`

### 2.8 Packaging and print tier — 18
`PackagingType` · `PackagingTemplate` · `TemplateSlot` · `TemplateConstraint` ·
`DimensionVariant` · `Artwork` · `ArtworkVersion` · `ApprovalRequest` ·
`ApprovalStep` · `DieLine` · `PrintProfile` · `Substrate` · `PrintJob` ·
`PrintArtifact` · `Imposition` · `CalibrationRecord` · `DocumentTemplate` ·
`DocumentArtifact`

### 2.9 System tier — 15
`CostRecord` · `OperatingCost` · `CostAllocation` · `TaxRule` · `Currency` ·
`ExchangeRate` · `Locale` · `TranslationEntry` · `RegulatoryProfile` ·
`ImportTemplate` · `ImportRun` · `ImportRowError` · `BackupSnapshot` ·
`Notification` · `DesignSuggestion`

---

## 3. The universal invariants

Every entity, without exception.

1. **Tenant scope.** Every entity carries a `Tenant` reference. There is no
   global collection. A query without a tenant predicate is a defect.
2. **Identity is a generated key, never a natural key.** No name, no code, no
   Arabic string is ever an identifier (CF-65, resolves **D11** and **D12**).
3. **Soft retirement, not deletion.** Entities are archived. `BrandProfile` and
   `ArtworkVersion` are never deleted under any circumstance (OD-D5).
4. **Every relationship is declared, and ownership is declared with it** (D1,
   CF-64). No module writes a collection it does not own.
5. **Immutable once issued.** `Invoice`, `CreditNote`, `ArtworkVersion`,
   `PrintArtifact`, `DocumentArtifact`, `ActivityEvent`. Correction is a new
   record, never an edit.

---

## 4. The thirteen resolutions

Each names the choice, the reason, and what it forecloses.

### D1 — Collection ownership

**Resolved: ownership is declared, single-writer, and enforced.** Every
collection has exactly one owning module. Any other module reads through a
declared interface and can never write.

*Forecloses:* the `WRITE_KEYS` failure, where a tool listed a collection it only
read and could overwrite the owner's catalogue with an empty array (CF-64).

### D2 — `Return` money semantics

**Resolved: two explicit fields, never one path-dependent field.**
`ReturnLine` carries `returnedValue` (the value of goods coming back) **and**
`writeOffValue` (the portion not recoverable). `restock` sets `writeOffValue` to
zero; `writeOff` sets it equal to `returnedValue`. Both are always present.

*Forecloses:* a single `amount` whose meaning depends on which code path wrote
it. Every damaged-goods figure the owner has read was produced by that ambiguity.

### D3 — Unstated disposition

**Resolved: an unstated `ReturnDisposition` is an error, not a default.** A
`ReturnLine` cannot be accepted without one. On CSV import the row fails with an
`ImportRowError` naming the missing field.

*Forecloses:* both legacy defaults. The two tools defaulted in **opposite**
directions, so the same record produced opposite waste-versus-recovery figures.
Neither answer is correct; the question is.

### D4 — Line value stored or derived

**Resolved: stored at commit, on immutable documents only.** `InvoiceLine`,
`ReturnLine`, `PurchaseOrderLine` and `CreditNote` lines store their computed
money values permanently. `SalesOrderLine`, being a draft, derives.

The rule: **a money value on a document that has been issued is a historical
fact and never recomputes.** A later price change must not restate an issued
invoice.

*Forecloses:* CF-47's retroactive restatement, where entering one new purchase
price silently restated COGS and profit for every closed month.

### D5 — Resale attribution

**Resolved: navigable link plus stored snapshot.** Return resale allocation
carries both the `Buyer` and `Invoice` references **and** name/number snapshots
taken at the time. The references make it navigable; the snapshots make the
historical document reproducible.

*Forecloses:* the textual-only trail, where two same-named buyers merged. The ids
were being written all along and never read.

### D6 — `outAllocations` producer/consumer

**Resolved by D1 and D5 together.** No separate decision; the concept becomes
`ReturnAllocation`, owned by Sales.

### D7 — `BrandTheme`

**Resolved: one `BrandTheme` entity with a fixed `ColorRole` set.** Roles are
named semantically, not by surface. A theme provides one `ColorValue` per role.

*Forecloses:* the live collision where three tools wrote the same key with the
same ids and same names but different values — `cp_def1` "Dark Gold" differed on
6 of 7 values between the sticker tool and the business tools, so whichever tool
seeded an empty store first silently defined what the name meant (CF-49).

### D8 — Money formatting

**Resolved: formatting is a `Locale` concern and is never stored.** Digit system,
decimal separator and grouping derive from the `Locale` at render time. The
stored value is a single canonical numeric.

*Forecloses:* formatting drift between surfaces, and formatted strings entering
storage.

### D9 — Quantity precision

**Resolved: precision is a property of `UnitOfMeasure`.** Each unit declares its
decimal places; every `StockMovement` quantity is validated against its unit's
precision at write time.

*Forecloses:* a quantity that rounds in one surface and not another. `CALC_SPEC.md`
states the rounding rule per calculation; this states where the precision lives.

### D10 — `ProductCategory`

**Resolved: a first-class catalog-wide entity**, tenant-scoped, referenced by
`Product`. Not a free-text field, not mirrored between modules.

*Forecloses:* the one-sided mirrored list that existed in one tool and was copied
into the other.

### D11 — `Product` identity

**Resolved: identity is the generated key, always. There is no name fallback.**
A `Product` without a key does not exist. Name normalisation is a search
convenience and is never part of identity.

*Forecloses:* four key forms for one concept across two tools, and the merging of
distinct products that happened to share a trimmed name.

### D12 — `Buyer` identity

**Resolved: identity is the generated key. A renamed `Buyer` keeps their entire
history.** Reporting joins on the key, never on the name.

### D13 — Revenue basis, and where discount lives

**Resolved: revenue is line-level, and discount is allocated to lines at issue.**

When an `Invoice` is issued, any invoice-level discount is allocated across its
`InvoiceLine` records proportionally and **stored per line**. From that moment:

```
Invoice.total  ==  Σ InvoiceLine.netValue      (exactly, always)
```

*Forecloses two things at once.* Invoice-level and line-level revenue can no
longer differ — in the legacy set they differed by exactly the discount, and only
one tool could see that a discount existed. And it fixes **CF-70**: a return can
be valued against the line's actual net value rather than its list price, which
is why every historical net-revenue figure in the legacy data is overstated.

**The allocation method and its rounding-remainder rule are `CALC_SPEC.md`'s to
state.** This document fixes only that the allocation happens and that the
identity above must hold.

---

## 5. Relationships

### 5.1 Tenancy spine

```
Tenant ─1:1─ Brand ─1:N─ BrandLine
   │            └─1:N─ BrandProfile ─1:N─ BrandTheme
   ├─1:N─ Membership ─N:1─ Member          (a Member may hold several)
   ├─1:N─ Location · Buyer · Supplier · Product · Component
   └─1:N─ ActivityEvent · ConsentGrant · BackupSnapshot
```

### 5.2 Catalog and stock

```
Product ─1:N─ ProductVariant ─1:N─ ProductCode
   └─N:1─ ProductCategory
ProductVariant ─1:1─ Recipe ─1:N─ RecipeLine ─N:1─ Component
StockMovement ─N:1─ ProductVariant | Component
      ─N:1─ Location · ─N:0..1─ Batch · ─1:1─ MovementReason
StockLevel = Σ StockMovement, grouped by (variant|component, location, batch)
```

**`StockLevel` is derived and has exactly one write path.** No document writes it.

### 5.3 The stock-creating events

Four, and only four:

```
PurchaseOrder → GoodsReceipt  → StockMovement(purchase)
SalesOrder    → Shipment      → StockMovement(sale)
PrintJob      → ProductionRun → StockMovement(production)
Return        → StockMovement(return_restock | return_writeoff) + CreditNote
```

A `PrintJob` produces a file, never stock (OD-E12). A document never creates
stock; only a confirmation event does.

### 5.4 Sales and money

```
Buyer ─1:N─ SalesOrder ─1:N─ SalesOrderLine
SalesOrder ─1:N─ Shipment ─1:N─ Invoice ─1:N─ InvoiceLine
Invoice ─1:N─ Payment ─1:1─ Receipt
Invoice ─1:N─ Return ─1:N─ ReturnLine ─1:1─ ReturnDisposition
Return  ─1:1─ CreditNote
ReturnLine ─0:N─ ReturnAllocation ─N:1─ Buyer, Invoice
```

**Outstanding = Invoice − Σ Payments − Σ CreditNotes** (OD-C16). An issued
`Invoice` is immutable; a correction is a `CreditNote`.

### 5.5 Traceability

```
Batch ─1:N─ TraceLink ─N:1─ Invoice
```

`TraceLink` is written by `Shipment`, which is the only event that knows both
which `Batch` left and which `Invoice` covered it. This is what makes OD-C5
answerable: a bad `Batch` resolves to every `Invoice` that shipped it.

### 5.6 Packaging and print

```
PackagingType ─1:N─ PackagingTemplate ─1:N─ TemplateSlot
                          ├─1:N─ TemplateConstraint
                          ├─1:N─ DimensionVariant
                          └─0:N─ DieLine
Artwork ─N:1─ PackagingTemplate, ProductVariant, BrandProfile
   └─1:N─ ArtworkVersion ─1:N─ ApprovalRequest ─1:N─ ApprovalStep
PrintJob ─N:M─ ArtworkVersion ─1:N─ PrintArtifact
PrintJob ─N:1─ PrintProfile ─N:1─ Substrate
```

`Artwork` is the load-bearing name: `PackagingTemplate` is what a brand starts
from, `Artwork` is what they end up with, `ArtworkVersion` is what went to print.

---

## 6. Referential rules

| Rule | Applies to |
|---|---|
| A referenced entity cannot be hard-deleted while a reference exists | all |
| Archiving a parent archives nothing; children remain queryable | `Brand`, `Product`, `Buyer` |
| An immutable document's references are frozen with it | `Invoice`, `ArtworkVersion`, `DocumentArtifact` |
| A `StockMovement` is never deleted or edited. A correction is a new opposing movement | `StockMovement` |
| Cross-tenant references are impossible by construction, not by check | all |

---

## 7. What this forecloses, collected

The legacy failures that cannot recur under this model:

| Failure | Foreclosed by |
|---|---|
| Silent stock drift | §5.2 — one write path |
| Retroactive restatement of closed months | D4 |
| Opposite return figures from one record | D3 |
| Revenue differing by the discount | D13 |
| Returns overvalued at list price | D13 |
| Same-named entities merging | D11, D12 |
| A theme's meaning depending on write order | D7 |
| A reader overwriting an owner's collection | D1 |
| Untranslatable enumerations | §3.2 |
| A batch that cannot be traced to a shipment | §5.5 |

---

*Tier 2. Read with `GLOSSARY.md` and `CALC_SPEC.md`.*
