# DECISIONS — B2S

**Status:** AUTHORED. Tier 1, precedence slot 2.
**Landed:** 2026-08-01 by P-05-LAND.

The 80 signed operational decisions, promoted verbatim from
`docs/method/B2S_PREPARE_PHASE.md` §2, which remains the record of where
they were signed. **This file is now the authoritative copy.** Rows are
byte-identical to the register as signed; no rationale has been added after
the fact, because the signatures cover the decisions, not a later
reconstruction of the reasoning.

New decisions are authored here in full — decision, date, rationale, and
what it forecloses. Existing rows are amended only by formal amendment,
never edited in place.

## 2. Decision register

80 decisions, all signed. None open.

### Group A — Product identity

| OD | Decision | Status |
|---|---|---|
| A1 | Multi-brand multi-product. Wizard captures brand name, logo, type, numbers, data, colours; system optimises output to suit. | SIGNED |
| A2 | Customer is the brand owner, possibly a food producer. | SIGNED |
| A3 | One account = one company = one master brand + many lines + many products. Free at launch, subscription later. | SIGNED |
| A4 | Balance Bites is a customer. Product is B2S. | SIGNED |
| A5 | **Exclusions:** agencies serving unrelated clients from one login. Compliance guarantees (F2). Retail GTIN generation (H5). Legacy data migration as a built-in feature — CSV import replaces it. | SIGNED (derived) |
| A6 | Done when many brands run their business from it. | SIGNED |
| A7 | Every product links to business management, design, preparation, packaging and invoicing. Stock reaches component level. | SIGNED |

### Group B — Legacy relationship

| OD | Decision | Status |
|---|---|---|
| B1 | **Void.** Parity is dead; replaced by the three-standard model in §7. | CLOSED |
| B2 | Legacy tools frozen and retiring. Not maintained in parallel. | SIGNED |
| B3 | Nothing is "fixed" — everything is configured. Legacy defects are requirements the new build must not reproduce. | SIGNED |
| B4 | No legacy print output is a reference. Print standard is a fresh physical measurement. | SIGNED |
| B5 | Harvest specifications, relationships and feature ideas only. No code. | SIGNED |
| B6 | Keep none of the six tools. Retiring them is the point of the project. | SIGNED |
| B7 | All legacy data loss accepted once replaced by configurable tools. | SIGNED |

### Group C — Domain & data

| OD | Decision | Status |
|---|---|---|
| C1 | Canonical entity list + one definition per concept. Authored in `DOMAIN_MODEL.md`. | SIGNED (scope) |
| C2 | Returns are first-class and must be correctly processed. | SIGNED |
| C3 | Returns are **stock movements**. | SIGNED |
| C4 | Batch/lot tracking for produced products, produced stickers and produced labels. | SIGNED |
| C5 | Traceability required — a bad batch resolves to the invoices that shipped it. | SIGNED |
| C6 | Multi-location stock: IN. | SIGNED |
| C7 | Product variants: IN. **Master items + variant items, customer chooses.** | SIGNED |
| C8 | Units of measure: customer-selectable. | SIGNED |
| C9 | Multi-currency: customer-selectable. | SIGNED |
| C10 | Tax: customer toggles on/off during configuration, with rate(s) configurable. | SIGNED |
| C11 | Invoice numbering scoped per A3 (account → line). | SIGNED |
| C12 | Payments IN: full / partial / underpaid; type cash / card / other; receipt attachment when available. | SIGNED |
| C13 | Purchase orders and supplier management: IN. | SIGNED |
| C14 | Data retention, ownership, portability, deletion: yes. | SIGNED |
| C15 | Audit trail: yes. | SIGNED |
| C16 | A `Return`'s money effect creates a `CreditNote`. An issued `Invoice` is immutable. Outstanding = Invoice - Payments - CreditNotes. | SIGNED |
| C17 | Printed labels and stickers are `Component` records of kind `packaging`, with an optional link to the `ArtworkVersion` that produced them. Not a new entity. | SIGNED |
| C18 | `Shipment` is a distinct entity, R1 at data level. R1 auto-creates one per `Invoice`; standalone management is R2. | SIGNED |
| C19 | `PriceList` in scope, R2. R1 is one price per `ProductVariant` in the tenant's base currency. | SIGNED |

### Group D — Brand & identity

| OD | Decision | Status |
|---|---|---|
| D1 | Complete brand field inventory required. | SIGNED (scope) |
| D2 | Full logo variant set. | SIGNED |
| D3 | All colour models offered (RGB, CMYK, Pantone); customer selects. | SIGNED |
| D4 | Font licensing: customer selects and is responsible. | SIGNED |
| D5 | Brand versioning: customer archives; **no deletion, ever**. | SIGNED |
| D6 | No hardcoded values — enforced as a checkable rule. | SIGNED |
| D7 | i18n contract: no literals; bilingual by rule. | SIGNED |
| D8 | Customer uploads icons and images, all formats supported, size-constrained. | SIGNED |
| D9 | Customer authors their own guidelines; optional templates offered. | SIGNED |
| **D10** | **Brand identity is master-level with per-line inherit-or-override, per field.** Same master/variant pattern as products. | SIGNED |

### Group E — Print & production

| OD | Decision | Status |
|---|---|---|
| E1 | Print shop receives all variants: PNG, PDF, cutout, and others. | SIGNED |
| E2 | **Calibration is a measured physical tolerance recorded at Step 15. Not an assumed value.** | SIGNED |
| E3 | Bleed / trim / safe-area fully configurable, with library presets. | SIGNED |
| E4 | Output colour space: customer-selectable. | SIGNED |
| E5 | Die-lines: required and selectable. | SIGNED |
| E6 | **Imposition required, R2, labels and stickers only. R1 exports one PrintArtifact per Artwork. Sheet parameters specified in PRINT_PRODUCTION_SPEC.md at P-10.** | SIGNED |
| E7 | Outputs customer-selectable, some or all. **Garment tickets added** for cloth brands; extensible to other brand categories. | SIGNED |
| E8 | Tolerance customised per output type. | SIGNED |
| E9 | Substrate / material: customer-selectable. | SIGNED |
| E10 | Proofing and print sign-off record: yes. | SIGNED |
| **E11** | **BOTH paths. PrintArtifact (PDF/PNG/cutout) is the production deliverable and must be byte-identical across platforms. Browser print dialog is desk preview only, labelled as such, never the print-shop handoff.** Forced by your answer 3 + H3. | SIGNED |
| E12 | A `PrintJob` produces a file, never stock. Physical output is recorded by a `ProductionRun` of kind `printing`, which references the `PrintJob` and generates the `StockMovement`. | SIGNED |

### Group F — Regulatory

| OD | Decision | Status |
|---|---|---|
| F1 | Applicable regimes: customer-selectable. | SIGNED |
| F2 | **Compliance is the brand owner's responsibility, not a B2S guarantee.** Must appear in terms of service. | SIGNED |
| F3 | Allergen data model: yes. | SIGNED |
| F4 | Nutrition declaration rules: customer-selectable. | SIGNED |
| F5 | Mandatory label elements: customer-selectable. | SIGNED |
| F6 | Multi-stage approval: designer + owner + additional approvers. | SIGNED |

### Group G — Platform & access

| OD | Decision | Status |
|---|---|---|
| G1 | Scale target: **1000 tenants**, each a brand, each with multiple members (per G2/F6). | SIGNED |
| G2 | Roles and permissions: yes. | SIGNED |
| G3 | Auth: yes. Per-customer private data and database isolation. | SIGNED |
| G4 | PWA client, online database (Supabase). | SIGNED |
| G5 | Responsive across devices. | SIGNED |
| G6 | PII handling: yes. | SIGNED |
| G7 | **Repo public now.** Pre-relaunch audit required (§10). Prevention, not later-removal (§9). | SIGNED |
| G8 | Backup and restore policy: yes. | SIGNED |
| G9 | Hosted on Vercel. | SIGNED |
| **G10** | **Operator sees account metadata, usage and billing only. Never tenant business data.** Support access requires ConsentGrant and is logged. Future: subscription-gated feature flags. | SIGNED |
| **G11** | **Print masters and large assets in tenant-isolated object storage, never table rows.** Base64-in-rows is what broke the legacy tools. | SIGNED |
| G12 | Design Assistant: R3, paid tier. May read brand config, template metadata and product names only. Never buyer, invoice, payment or financial data. | SIGNED |

### Group H — Quality & acceptance

| OD | Decision | Status |
|---|---|---|
| H1 | **Professional standard defined by ACCEPTANCE.md, authored at P-11.** | SIGNED |
| H2 | Accessibility: yes. | SIGNED |
| H3 | All platforms supported — which forces E11. | SIGNED |
| H4 | QR: upload or generate, derived from brand name, product brand type, product category, product batch. | SIGNED |
| H5 | **Barcodes scannable, with one constraint: retail GTIN is ENTERED (GS1-allocated by the brand), never generated.** Generator produces Code 128 / Code 39 for internal and batch use, or EAN-13 on restricted-circulation prefixes (`02`, `04`, `20`–`29`), both labelled not-for-retail. | SIGNED (constrained) |
| H6 | **Gate evidence: the four-standard acceptance model, §7.** | SIGNED |
| **H7** | **Gate 3 verifies the blocking set only: `PRODUCT_BRIEF`, `GLOSSARY`, `SCOPE`, `DECISIONS`, `DOMAIN_MODEL`, `TENANCY_MODEL`, `SECURITY_MODEL`, `CALC_SPEC`. Every other frozen document is authored just-in-time, one step ahead of the module that needs it, and is verified by that module's own gate. `CALC_SPEC.md`'s Gate 3 item covers its 25 Release 1 rows; the fourteen Release 2 rows in its §6 land as signed amendments.** | SIGNED 2026-08-01 |

## 3. Decisions authored after the promotion

### OD-H7 — Gate 3 scope

**Decision.** Gate 3 verifies eight documents: `PRODUCT_BRIEF.md`,
`GLOSSARY.md`, `SCOPE.md`, `DECISIONS.md`, `DOMAIN_MODEL.md`,
`TENANCY_MODEL.md`, `SECURITY_MODEL.md`, `CALC_SPEC.md`. The thirteen remaining
frozen documents are authored just-in-time, one step ahead of the module that
needs them, and each carries the Gate 3 line item originally written for it,
moved verbatim to its own module gate. `CALC_SPEC.md`'s Gate 3 item covers its
25 Release 1 rows only.

**Date.** Signed 2026-08-01.

**Rationale.** The compression was already in force — it governed which
documents were authored and in what order — but it lived in a reviewer
configuration and never reached `B2S_PREPARE_PHASE.md`, which is the document a
gate is run from. The committed checklist therefore demanded seven documents
that the compression had deliberately deferred: `PRINT_CONTRACT`,
`PRINT_PRODUCTION_SPEC`, `TEMPLATE_MODEL`, `IMPORT_SPEC`, `FEATURE_INVENTORY`,
`RISK_REGISTER` and `ACCEPTANCE`. Over-preparation is its own failure mode; a
document authored eight steps before the module that consumes it is rewritten by
the time it is used.

**Forecloses.** A gate that cannot pass, and the reverse failure — quietly
running Gate 3 against a checklist known to be stale, which would make every
later citation of "Gate 3 passed" untrue. It does not foreclose any verification:
every deferred item survives, attached to the gate that can actually evidence it.

