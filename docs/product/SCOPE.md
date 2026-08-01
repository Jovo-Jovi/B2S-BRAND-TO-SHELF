# SCOPE — B2S

**Status:** AUTHORED. Tier 1, precedence slot 2.
**Authored:** 2026-08-01 by the reviewer surface.
**Closes:** CF-29.
**Depends on:** `PRODUCT_BRIEF.md`, `GLOSSARY.md`, and the 79 signed decisions.

---

## 1. The module set — 22 modules

Every module traces to at least one signed decision. `R1` / `R2` / `R3` is the
release assignment.

| # | Module | R | Responsibility | Boundary — what it does **not** own | Decisions |
|---|---|---|---|---|---|
| 01 | **Auth & Access** | R1 | Sign-in, sessions, `Membership`, `Role`, invitations, recovery | Does not own tenant business data | G2, G3 |
| 02 | **Onboarding** | R1 | The wizard: identity, logo, typography, numbers, colours, business data | Writes through Brand and Settings; owns no storage of its own | A1 |
| 03 | **Brand** | R1 | `Brand`, `BrandProfile`, `BrandLine`, `LogoVariant`, `ColorRole`/`ColorValue`, `Typeface`, `BrandGuideline`, `BrandTheme` | Does not own uploaded binaries — that is Assets | D1–D10 |
| 04 | **Assets** | R1 | `MediaAsset`, `AssetRendition` in `display` and `print` tiers, object storage, size governance | Does not interpret brand meaning | D8, G11 |
| 05 | **Catalog** | R1 | `Product`, `ProductVariant`, `Component`, `Recipe`, `ProductCategory`, `UnitOfMeasure`, `UnitConversion`, `ProductCode` | Holds no quantities — that is Inventory | C7, C8, A7, H4, H5 |
| 06 | **Templates** | R1 | `PackagingTemplate`, `TemplateSlot`, `TemplateConstraint`, `DimensionVariant`, versioning | Does not bind to a product — that is Packaging | answer 9 |
| 07 | **Packaging** | R1 labels+stickers · R2 rest | `Artwork`, `ArtworkVersion`, `PackagingType` | Does not generate files — that is Print | E7 |
| 08 | **Approvals** | R2 | `ApprovalRequest`, `ApprovalStep` | Cross-cutting; owns no subject entity | F6 |
| 09 | **Print** | R1 PDF+PNG · R2 rest | `PrintProfile`, `Substrate`, `PrintJob`, `PrintArtifact`, `Imposition`, `DieLine`, `CalibrationRecord` | **Produces a file, never stock** (E12) | E1–E11, CF-05 |
| 10 | **Inventory** | R1 basic · R2 depth | `StockMovement` as the single write path, `StockLevel` derived, `Location`, `Batch`, `TraceLink` | Never written directly by a document | C3–C6 |
| 11 | **Production** | R2 | `ProductionRun`, recipe execution, produced `Batch` records including printed material | Consumes Catalog and Print; owns neither | C4, A7, E12 |
| 12 | **Purchasing** | R2 | `Supplier`, `SupplierContact`, `PurchaseOrder`, `PurchaseOrderLine`, `GoodsReceipt` | Stock arrives via `GoodsReceipt`, never via the order | C13 |
| 13 | **Sales** | R1 | `Buyer`, `SalesOrder`, `Shipment`, `Invoice`, `Payment`, `Receipt`, `Return`, `CreditNote`, `PriceList` | Renders nothing — that is Documents | C2, C3, C11, C12, C16–C19 |
| 14 | **Documents** | R1 | `DocumentTemplate`, `DocumentArtifact` — brand-themed invoice, receipt, PO, delivery note | Owns no business data | C11, C12 |
| 15 | **Costing** | R2 | `CostRecord`, `OperatingCost`, `CostAllocation`, COGS, margin | Reads Inventory and Purchasing; writes neither | A7 |
| 16 | **Analytics** | R2 | Sales, inventory, profit, production reporting | Read-only over every other module | — |
| 17 | **Import** | R1 products+buyers · R2 rest | `ImportTemplate`, `ImportRun` with dry-run, `ImportRowError`, partial-import policy | Validates against the owning module's rules, never its own | answer 8, CF-32 |
| 18 | **Settings** | R1 | Members & roles, `TaxRule`, `Currency`, `ExchangeRate`, `Locale`, `TranslationEntry`, `RegulatoryProfile`, `BackupSnapshot` | Holds tenant policy, not tenant data | C8–C10, D6, D7, G8, C14 |
| 19 | **Audit** | R1 | `ActivityEvent`, append-only. Records every `ConsentGrant` use | Cross-cutting; never mutable | C15 |
| 20 | **Notifications** | R2 | Approval waiting, low stock, failed import, expiring batch | Owns no triggering logic | F6 |
| 21 | **Design Assistant** | R3 | `DesignSuggestion`. Reads brand config, template metadata, product names **only** | Never reads buyer, invoice, payment or financial data | G12 |
| 22 | **Dashboard** | R1 | The role-aware landing surface | Reads everything, owns nothing | — |
| — | **Operator Console** | R1 | Tenants, usage, billing, `FeatureFlag`, `ConsentGrant` | **Never tenant business data** — separate surface, not a tenant module | G10 |

**CF-29 closed.** The original map had 9 modules; 13 were missing and 3 more were
required by decisions already signed. All 22 are now traced.

---

## 2. Release 1 — the smallest set that completes the core loop

**SIGNED 2026-07-30.**

Onboarding wizard · Brand identity, master with one line · Assets, two tiers ·
Templates for labels and stickers · Print export PDF + PNG with bleed/trim
profiles · Catalog with master+variant, GTIN entry, QR generation · Inventory
with movements and a single location · Sales: buyers, orders, invoices, payments
(full/partial/underpaid, cash/card/other, receipts) · **Returns as
`StockMovement`** · `CreditNote` · Documents: invoice, receipt · Auth, roles,
tenant isolation · CSV import for products and buyers · Settings: units,
currency, tax on/off, locales · Audit · Dashboard · Operator Console: tenants,
usage.

**Release 2:** boxes, cups, stands, garment tickets · multi-line brand overrides ·
batches, traceability · production runs and recipes · purchasing · multi-location
· approvals · costing · analytics · die-lines · imposition · CMYK/Pantone depth ·
`Shipment` UI (R1 at data level) · `PriceList` · notifications · regulatory
profiles.

**Release 3:** Design Assistant · subscriptions and billing · advanced colour
management · Operator feature flags.

**Why returns are in R1:** an invoicing system that cannot process a return
cannot run a real business, and OD-A6 is the acceptance bar. Everything else
deferred is additive.

---

## 3. Exclusions — permanent

| Excluded | Decision |
|---|---|
| Agencies serving unrelated clients from one login | A5 |
| Compliance guarantees of any kind | F2 |
| Retail GTIN generation | H5 |
| Legacy data migration as a built-in feature | A5 — CSV import replaces it |
| Maintaining any retiring tool in parallel | B2 |
| Parity with any legacy output | B1, CLOSED |
| Operator visibility into tenant business data | G10 |
| The browser print dialog as a print-shop deliverable | E11 — preview only, labelled as such |

---

## 4. Cross-cutting invariants

These bind every module. A module that violates one is defective regardless of
its own acceptance criteria.

1. **No document creates stock. Only a confirmation event does.**
   `PurchaseOrder → GoodsReceipt` · `SalesOrder → Shipment` ·
   `PrintJob → ProductionRun` · `Return → StockMovement + CreditNote`.
2. **`StockLevel` is derived from `StockMovement` and has one write path.**
3. **An issued `Invoice` is immutable.** Outstanding = Invoice − Payments −
   CreditNotes (C16).
4. **Every entity is tenant-scoped.** No collection is global.
5. **Every enumeration stores a language-neutral key** (CF-65).
6. **Every producer/consumer relationship between modules is declared.** No module
   writes a collection it does not own (CF-64).
7. **Every `Operator` access to tenant data requires a `ConsentGrant` and writes
   an `ActivityEvent`** (G10).

---

## 5. Module dependency order

```
Auth & Access
  └─ Settings ── Brand ── Assets
                   └─ Catalog ── Templates ── Packaging ── Print
                        └─ Inventory ── Sales ── Documents
                                          └─ Import
     Audit, Dashboard: cross-cutting, land alongside
```

Anything left of an arrow must exist before anything right of it. This is a
dependency statement, not a build plan; the phase plan is authored after Gate 3.

---

*Tier 1. Read with `DECISIONS.md`.*
