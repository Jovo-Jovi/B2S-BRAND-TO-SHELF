# B2S — PREPARE PHASE RUNBOOK

**Product:** B2S | Brand to Shelf · *build.package.sell*
**Document:** the complete sequence from today to "documents frozen, build may begin"
**Authored:** 2026-07-30 by the reviewer surface
**Status:** LIVE. This is the only sequencing document. `docs/archive/2026-07/PHASE_PLAN.md` is void.

---

## 0. How to use this document

Steps run **in order**. Each is either `MANUAL` (only you can do it) or `PROMPT` (paste into a fresh builder window, or into the Claude Project for reviewer tasks).

Three gates. A gate that does not PASS stops the sequence — it does not get waived by moving on.

**The prepare phase ends when Gate 3 passes.** Architecture, stack, framework and layering decisions are deliberately absent from this entire document. They begin after Gate 3 and not before.

Nothing in `legacy/` is ever deleted.

---

## 1. Product definition — FROZEN

| | |
|---|---|
| **Name** | B2S — Brand to Shelf |
| **Tagline** | build.package.sell |
| **Repo** | `github.com/Jovo-Jovi/b2s` |
| **What it is** | A multi-tenant white-label web product. A brand owner onboards through a wizard capturing identity, logo, type, colours and business data; the system produces on-brand packaging, labels, stickers, cartons, stands and garment tickets from a constrained template library — alongside product catalog, stock, purchasing, invoicing, payments and returns, all linked through one entity model. |
| **Customer** | Brand owner, often a food producer |
| **Tenancy** | One account = one company = one master brand, holding many product lines (e.g. Balance Bites / Balance Fit / Balance Fun) and many products. Unrelated companies require separate accounts. |
| **Balance Bites** | A customer of B2S, not its owner |
| **Done when** | Many brands run their business from it |
| **Relationship to legacy** | **Greenfield.** Six HTML tools are retiring. Requirements are extracted, then the tools become read-only evidence. No code ported. No output is a parity target. |
| **Rules** | Bilingual by rule. Zero hardcoded brand, business or locale values. Every entity related, nothing orphaned. |

### The core loop this product must prove

```
onboard brand → define products → generate on-brand packaging →
manage stock → sell → invoice → collect payment → handle returns
```

Any release that cannot complete this loop has not validated the product.

---

## 2. Decision register

All 56 decisions from the freeze surface. `SIGNED` = answered by you and binding. `PROPOSED` = my recommendation, needs your signature. `OPEN` = unanswered.

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
| **D10** | **Brand identity is master-level with per-line inherit-or-override.** Same master/variant pattern as products. | **PROPOSED — my reading of your answer 2. Confirm.** |

### Group E — Print & production

| OD | Decision | Status |
|---|---|---|
| E1 | Print shop receives all variants: PNG, PDF, cutout, and others. | SIGNED |
| E2 | Calibration approach: reviewer decides what is best. | DELEGATED |
| E3 | Bleed / trim / safe-area fully configurable, with library presets. | SIGNED |
| E4 | Output colour space: customer-selectable. | SIGNED |
| E5 | Die-lines: required and selectable. | SIGNED |
| E6 | Imposition / gang-up: reviewer decides what is best. | DELEGATED |
| E7 | Outputs customer-selectable, some or all. **Garment tickets added** for cloth brands; extensible to other brand categories. | SIGNED |
| E8 | Tolerance customised per output type. | SIGNED |
| E9 | Substrate / material: customer-selectable. | SIGNED |
| E10 | Proofing and print sign-off record: yes. | SIGNED |
| **E11** | **Print deliverable is a deterministically generated file, identical across platforms. The browser print dialog is a preview only, never the deliverable.** Forced by your answer 3 + H3. | **PROPOSED. Confirm.** |

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
| **G10** | **Admin role sees account metadata, usage and billing — not tenant business data.** Support access to tenant data requires tenant consent and is logged. Future: subscription-gated feature flags. | **PROPOSED — answer 3 gave capability, not visibility. This is a promise to paying brands. Confirm.** |
| **G11** | **Print masters and large assets live in tenant-isolated object storage, not in table rows.** Base64-in-rows is what broke the legacy tools. | **PROPOSED. Confirm.** |

### Group H — Quality & acceptance

| OD | Decision | Status |
|---|---|---|
| H1 | Professional standard; reviewer defines. | DELEGATED |
| H2 | Accessibility: yes. | SIGNED |
| H3 | All platforms supported — which forces E11. | SIGNED |
| H4 | QR: upload or generate, derived from brand name, product brand type, product category, product batch. | SIGNED |
| H5 | **Barcodes scannable, with one constraint: retail GTIN is ENTERED (GS1-allocated by the brand), never generated.** Generator produces Code 128 / Code 39 for internal and batch use, or EAN-13 on restricted-circulation prefixes (`02`, `04`, `20`–`29`), both labelled not-for-retail. | SIGNED (constrained) |
| H6 | Gate evidence: reviewer defines per domain. | DELEGATED |

---

## 3. Still open — 4 items

These block document authoring. Everything else can proceed.

| # | Question | Blocks |
|---|---|---|
| **1** | **Confirm D10** — brand identity master-level with per-line override? | `BRAND_CONFIG.md`, `DATA_MODEL.md` |
| **2** | **Confirm G10** — what admin can see | `SECURITY_MODEL.md`, terms of service |
| **3** | **Confirm E11** — generated file as deliverable, browser print as preview only | `PRINT_CONTRACT.md`, `PRINT_PRODUCTION_SPEC.md` |
| **4** | **Sign the Release 1 scope in §5** | `SCOPE.md` |

Plus, needed before Step 1: **search "B2S" in retail/packaging** — it is widely used for "Back to School." "Brand to Shelf" spelled out is clean.

---

## 4. Module map — reviewed

Your tree, corrected against your own signed decisions.

### 4.1 The terminology bug — fix before any schema exists

Your tree has `Sales → Customers`, meaning the people a brand sells to. But throughout the freeze, "customer" has meant the tenant paying for B2S. **Two entities, one word.** This is the same failure class as legacy `templateKey` meaning two things.

Proposed vocabulary, to be frozen in `GLOSSARY.md`:

| Term | Means | Never called |
|---|---|---|
| **Tenant** / **Account** | The company using B2S | customer, user |
| **Brand** | The tenant's master identity | account |
| **Line** | A product family under the brand | brand, category |
| **Member** | A person with access to a tenant | user, customer |
| **Buyer** | Who the brand sells to | customer, client |
| **Admin** | B2S platform operator (you) | owner |
| **Owner** | The tenant's own top role | admin |

Also: "Studio" appears three times in your list. Proposed — `Brand`, `Packaging`, `Design Assistant`.

### 4.2 Gaps against your signed answers

| # | Missing module | Required by |
|---|---|---|
| 1 | **Onboarding** — the wizard | A1, the core mechanic, absent from your tree |
| 2 | **Templates** — the constrained library | Answer 9 |
| 3 | **Purchasing** — POs, suppliers | C13 |
| 4 | **Production** — batches, lots, BOM/recipe | C4, A7 |
| 5 | **Returns** | C2, C3 |
| 6 | **Costing** — COGS, operating costs, margin | A7, Analytics→Profit needs a source |
| 7 | **Approvals** | F6 |
| 8 | **Settings** — units, currency, tax, locales, roles | C8, C9, C10, D6, G2 |
| 9 | **Assets** — media library, two tiers | D8, answer 4, G11 |
| 10 | **Locations** | C6 |
| 11 | **Garment tickets** under Packaging | E7 |
| 12 | **Import** — CSV per entity | Answer 8 |
| 13 | **Traceability** — batch → invoice resolution | C5 |

`Design Assistant` (your 🤖 Studio) appears in your flat list but not your tree, and has no decision behind it. Needs its own OD: what it does, and whether it is Release 1 or a paid tier.

### 4.3 Corrected map

```
B2S | BRAND TO SHELF
│
├── Onboarding                  ← wizard: identity, logo, type, colours, business data
│
├── Brand                       ← master identity + per-line overrides (D10)
│   ├── Identity · Logo Variants · Colours & Fonts
│   ├── Guidelines · Versions (archive, never delete — D5)
│   └── Assets                  ← media library, display + print tiers (G11)
│
├── Packaging                   ← template-driven, constrained customisation
│   ├── Templates               ← the library
│   ├── Labels · Stickers · Boxes · Cups · Stands · Garment Tickets
│   └── Approvals               ← designer → owner → others (F6)
│
├── Print
│   ├── Presets                 ← bleed, trim, safe area, substrate (E3, E9)
│   ├── Sheets                  ← imposition (E6)
│   ├── Die-lines (E5)
│   └── Export                  ← PDF, PNG, cutout, colour space (E1, E4, E11)
│
├── Catalog
│   ├── Products                ← master + variant (C7)
│   ├── Components / BOM        ← A7 "product components in stock"
│   ├── Codes                   ← GTIN entry + internal generator + QR (H4, H5)
│   └── Categories · Units (C8)
│
├── Inventory
│   ├── Stock · Locations (C6)
│   ├── Batches & Lots (C4)
│   ├── Movements               ← purchase, production, sale, return, adjustment
│   └── Traceability (C5)
│
├── Purchasing
│   └── Suppliers · Purchase Orders (C13)
│
├── Production
│   └── Runs · Recipes · Produced Labels & Stickers (C4)
│
├── Sales
│   ├── Orders · Buyers
│   ├── Invoices (C11) · Payments (C12) · Receipts
│   └── Returns                 ← stock movements (C2, C3)
│
├── Costing
│   └── COGS · Operating Costs · Margin
│
├── Analytics
│   └── Sales · Inventory · Profit · Production
│
├── Import                      ← CSV per entity, templates from final schema
│
├── Settings
│   └── Members & Roles (G2) · Tax (C10) · Currency (C9) · Locales (D7) · Backups (G8)
│
├── Design Assistant            ← needs an OD
│
└── [ADMIN — separate surface]  ← tenants, usage, billing, feature flags (G10)
```

---

## 5. Release 1 — PROPOSED, needs signature

`a6` as written makes all 14 modules blocking. R1 is the smallest set that completes the core loop in §1.

**IN — Release 1**

Onboarding wizard · Brand identity (master, one line) · Assets (two tiers) · Templates: Labels + Stickers · Print export: PDF + PNG with bleed/trim presets · Catalog: products master+variant, GTIN entry, QR generation · Inventory: stock in/out, single location · Sales: orders, buyers, invoices, payments (full/partial/underpaid, cash/card/other, receipts) · **Returns as stock movements** · Auth + roles + tenant isolation · CSV import: products, buyers · Settings: units, currency, tax on/off, locales · Admin: tenants, usage

**OUT — Release 2**

Boxes · Cups · Stands · Garment tickets · Multi-line brand overrides · Batches, lots, traceability · Production runs, recipes, BOM · Purchasing, suppliers, POs · Multi-location · Approvals · Costing · Analytics · Die-lines · Imposition · CMYK/Pantone depth

**OUT — Release 3**

Design Assistant · Subscriptions and billing · Advanced colour management · Admin feature flags

**Why returns are in R1:** an invoice system that cannot process a return cannot run a real business, and `a6` is the acceptance bar. Everything else deferred is additive.

---

## 6. The sequence

| # | Step | Type | Produces |
|---|---|---|---|
| 1 | GitHub setup | MANUAL | Repo renamed, protections on |
| 2 | Answer the 4 open items in §3 | MANUAL | Unblocks authoring |
| 3 | `P-01` repo restructure | PROMPT | Clean tree, 22 doc stubs |
| 4 | Update Project Instructions | MANUAL | Reviewer configured for greenfield |
| 5 | `P-02` extract stock-costs | PROMPT | `EXTRACT_STOCK_COSTS.md` |
| 6 | `P-03` extract invoice-pro | PROMPT | `EXTRACT_INVOICE_PRO.md` |
| 7 | `P-04` extract design tools | PROMPT | `EXTRACT_DESIGN_TOOLS.md` |
| — | **GATE 1** — extraction complete | REVIEWER | Verdict |
| 8 | `P-05` author Tier 0 | PROMPT (reviewer) | `PRODUCT_BRIEF`, `GLOSSARY`, `RISK_REGISTER` |
| 9 | `P-06` author Tier 1 | PROMPT (reviewer) | `DECISIONS`, `SCOPE` |
| — | **GATE 2** — scope frozen | MANUAL | You sign |
| 10 | `P-07` author Tier 2 | PROMPT (reviewer) | `DOMAIN_MODEL`, `FEATURE_INVENTORY`, `CONTENT_MODEL`, `REGULATORY` |
| 11 | **Author `CALC_SPEC.md`** | MANUAL | The worked examples |
| 12 | `P-08` author Tier 3a | PROMPT (reviewer) | `TENANCY_MODEL`, `SECURITY_MODEL` |
| 13 | `P-09` author Tier 3b | PROMPT (reviewer) | `DATA_MODEL`, `BRAND_CONFIG`, `TEMPLATE_MODEL` |
| 14 | `P-10` author Tier 3c | PROMPT (reviewer) | `PRINT_CONTRACT`, `PRINT_PRODUCTION_SPEC`, `IMPORT_SPEC` |
| 15 | Print calibration measurement | MANUAL | Physical tolerance |
| 16 | `P-11` author Tier 3d | PROMPT (reviewer) | `UX_PRINCIPLES`, `ACCEPTANCE` |
| 17 | `P-12` land all documents | PROMPT | Everything committed |
| — | **GATE 3 — PREPARE PHASE ENDS** | REVIEWER | Build may begin |

Reviewer authoring happens in the Claude Project chat; `P-12` commits the output. Steps 1–2 and 4 are the only ones blocking the start.

---

## 7. The acceptance standard

Replaces the void parity gate. Four standards, no evidence means FAIL.

| Domain | Standard |
|---|---|
| **Money & quantity** | Exact match against signed worked examples in `CALC_SPEC.md`. Zero drift. Rounding rule stated per calculation. |
| **Print** | Measured physical tolerance in `PRINT_CONTRACT.md`, plus byte-identical generated output across platforms (E11). Legacy printouts are not a reference. |
| **Features & entities** | Conformance to `FEATURE_INVENTORY.md` and `DOMAIN_MODEL.md`. |
| **Tenant isolation** | Proof that tenant A cannot read tenant B, on every gate touching data access. **Not waivable by OD.** |

---

## 8. Step 1 — GitHub setup (MANUAL)

| Action | Note |
|---|---|
| Search "B2S" in retail/packaging | "Back to School" collision |
| Check `b2s` / `brandtoshelf` on GitHub, `.com`, `.app`, npm; trademark EG + EU | |
| Rename repo → `b2s` | GitHub redirects the old URL |
| Rename default branch `master` → `main` | **Do it now.** Nothing depends on it yet; later it breaks CI and Vercel hooks |
| **Enable secret scanning + push protection** | Non-negotiable — this is what enforces G7 |
| Enable Dependabot alerts | |
| Branch protection on `main`: block force-push | Skip required reviews, solo dev |
| Add `LICENSE` | No license = all rights reserved. Make it a choice |
| Add `SECURITY.md` | Required for a public repo |
| Set description + topics | |
| Verify `.gitignore` covers `.env*` | It does today. Confirm before Supabase |

---

## 9. Public repo — prevention rules (G7)

Enforced, not remembered.

1. **Never commit** any `.env`, service-role key, Supabase connection string, or credential.
2. Supabase `anon` key is designed to be public — **safe only if RLS is correct.** RLS correctness becomes a gate, not a nicety.
3. `service_role` key exists **only** in Vercel environment variables. Never in the repo, never in a client bundle, never in a migration file.
4. Push protection is the enforcement mechanism. Do not disable it.
5. Add a pre-commit hook blocking `.env`, `service_role`, and long base64 blobs.
6. **Accepted as public:** schema, RLS policies, method docs, legacy tools. If any of these should be private, say so before Step 3.
7. No real buyer data, invoice, or customer list ever enters the repo — including in test fixtures. Fixtures are synthetic.
8. The absolute path containing a personal name is already in four committed files and permanently in history. It cannot be undone. Do not let it into new files.

---

## 10. Pre-relaunch audit (G7)

Run before public launch. **This is an audit, not a removal** — history is permanent.

- [ ] Full-history secret scan (not just working tree)
- [ ] Confirm no service-role key ever committed — if one was, **rotate it**, do not just delete it
- [ ] Confirm no real buyer/invoice data in any commit
- [ ] Confirm no absolute filesystem paths in new files
- [ ] RLS policy review against `SECURITY_MODEL.md`
- [ ] Confirm the admin role's actual reach matches G10 and the terms of service
- [ ] Decide whether the app repo stays public at commercial launch
- [ ] If going private: understand that already-pushed content stays disclosed

---

## 11. Carry-forward register

**Void** — protected a port or migration that no longer exists:
`CF-02` `CF-03` `CF-04` `CF-06` `CF-08` `CF-12` `CF-15` `CF-21` `CF-26`

**Reclassified** — from defects-to-fix to *requirements the new build must not reproduce* (B3). Land in `FEATURE_INVENTORY.md` §"must not reproduce":

| ID | Must not reproduce |
|---|---|
| CF-16 | Writes that never reach durable storage |
| CF-17 | Zero page margin against a printer's unprintable area |
| CF-18 | Batch output inheriting the open item's geometry and values |
| CF-19 | Presentation markup stored in data fields with no parser |
| CF-20 | Two surfaces seeding the same shared key with different defaults |
| CF-23 | Print geometry in mixed units between container and content |
| CF-24 | Undocumented dimensional padding in a print path |

**Active:**

| ID | Item | Owner |
|---|---|---|
| CF-05 | Print calibration unresolved | Step 15 |
| CF-07 | No backup of design-tool presets; accepted loss | closed by B7 |
| CF-13 | RUNBOOK.md uncommitted and stale | superseded by this file |
| CF-14 | Personal name permanently in git history | §9 item 8 |
| CF-22 | Label-editor capability delta | `P-04` |
| CF-25 | `.gitattributes` absent | `P-01` |
| CF-27 | Minor Pass 1 scope bleed | noted, no action |
| **CF-28** | **Terminology collision: "customer" means tenant and buyer** | `GLOSSARY.md`, `P-05` |
| **CF-29** | **13 modules missing from the module map** | `SCOPE.md`, `P-06` |
| **CF-30** | **Design Assistant has no OD** | `P-06` |
| **CF-31** | **RLS correctness is an ungated gate today** | `SECURITY_MODEL.md`, `P-08` |
| **CF-32** | **CSV import resequenced from void to post-DATA_MODEL feature** | `IMPORT_SPEC.md`, `P-10` |

---

## 12. Step 4 — Project Instructions edits (MANUAL)

Five blocks in what you pasted into the Claude Project.

**(a) Replace the project paragraph** with §1's "What it is" plus the Rules row.

**(b) Delete "Parity is a gate" entirely.** Replace with §7's four-standard table under the heading `## Acceptance is a gate`.

**(c) Replace the authoritative-documents precedence list:**

```
1.  PRODUCT_BRIEF.md + GLOSSARY.md
2.  DECISIONS.md (signed ODs) + SCOPE.md
3.  DOMAIN_MODEL.md
4.  CALC_SPEC.md
5.  TENANCY_MODEL.md + SECURITY_MODEL.md
6.  DATA_MODEL.md
7.  CONTENT_MODEL.md + TEMPLATE_MODEL.md
8.  PRINT_CONTRACT.md + PRINT_PRODUCTION_SPEC.md
9.  BRAND_CONFIG.md
10. IMPORT_SPEC.md
11. ARCHITECTURE.md + ADRs
12. MODULE_SPEC.md
13. this file (B2S_PREPARE_PHASE.md), then its successor phase plan
14. docs/requirements/** — requirements evidence only. Never current truth.
                           Never a parity target.
```

**(d) Model class rule.** Heavyweight for: domain model · calculation implementation · tenancy and RLS · print generation · template engine · `BrandConfig` schema · CSV importer · every exit gate. Remove "migration importer." Add: *anything touching tenant isolation is heavyweight regardless of size.*

**(e) Add to "what you never do":**
- never approve a data-access change without tenant-isolation evidence
- never accept a hardcoded brand, business or locale value
- never treat a `docs/requirements/` extract as current truth
- never use "customer" without qualifying tenant or buyer

---

# 13. THE PROMPTS

---

## P-01 — Repo restructure

**Model: Sonnet · Effort: normal · Read-write, mechanical**

```
## P-01 — Repo restructure for B2S
- Phase: PREPARE Step 3 · Model class: STANDARD
- Context to read first: SESSION_CONTEXT.md; AGENTS.md
- Prompt (canonical):

ROLE: Repo maintenance. Mechanical file moves and scaffolding only. Write no
application code. Author no document content beyond the stub headers specified.

CONTEXT: this project pivoted from porting six legacy HTML tools to building a
new multi-tenant white-label product named B2S (Brand to Shelf). Parity against
legacy is void. The legacy tools are retiring; their audit documents are demoted
to requirements evidence. Nothing is deleted — everything moves.

TASK:

1. CREATE directories: docs/requirements/, docs/requirements/extracts/,
   docs/archive/2026-07/, docs/product/

2. GIT MOVE (use `git mv`, preserve history, never copy-and-delete):
     docs/REPORT.md              -> docs/requirements/extracts/REPORT.md
     docs/AUDIT_STICKER.md       -> docs/requirements/extracts/AUDIT_STICKER.md
     docs/RETURNS_ADDENDUM.md    -> docs/requirements/RETURNS_REQUIREMENTS.md
     docs/UNIFICATION.md         -> docs/archive/2026-07/UNIFICATION.md
     docs/inventory.json         -> docs/archive/2026-07/inventory.json
     docs/method/DELTA_RUN_01.md -> docs/archive/2026-07/DELTA_RUN_01.md
     docs/method/PHASE_PLAN.md   -> docs/archive/2026-07/PHASE_PLAN.md
     docs/method/PROMPT_PACK.md  -> docs/archive/2026-07/PROMPT_PACK.md
     docs/method/BB_DEV_OS.md    -> docs/method/DEV_OS.md
     .cursor/rules/bb-devos.mdc   -> .cursor/rules/b2s-devos.mdc
     .cursor/rules/bb-returns.mdc -> .cursor/rules/b2s-returns.mdc
     .cursor/rules/bb-print.mdc   -> .cursor/rules/b2s-print.mdc
   If a path does not exist, report it and continue. Invent no moves.

3. PREPEND to every file now under docs/archive/2026-07/ — change no other line:
     > **ARCHIVED 2026-07-30.** Written for a port that is no longer the project.
     > Retained for history. Not authoritative. Do not cite as current truth.

4. PREPEND to every file under docs/requirements/:
     > **REQUIREMENTS EVIDENCE.** Extracted from a retiring tool. Records what the
     > tool did and what its owner expects. NOT a specification, NOT current truth,
     > NOT a parity target. Where this conflicts with a frozen document in
     > docs/product/, the frozen document wins.

5. REWRITE legacy/FREEZE.md. Preserve its existing MISSING and NO BROWSER BACKUP
   sections VERBATIM. Replace only the opening paragraph with:
     # FREEZE POINT — RETIRING TOOLS
     Frozen 2026-07-29. These six tools are being RETIRED, not ported. No code
     from them will be reused and no output of them is a parity target. They are
     read-only requirements evidence for docs/requirements/extracts/.
     Do not modify, run, or delete any file in this directory.

6. CREATE .gitattributes at repo root:
     * text=auto eol=lf
     *.html text eol=lf
     *.md   text eol=lf
     *.json text eol=lf
     *.js   text eol=lf
     *.png binary
     *.jpg binary
     *.pdf binary
   Report `git status`. A large whitespace-only diff is expected and correct.
   Commit it SEPARATELY, titled "Normalize line endings" — never together with
   the moves.

7. CREATE stub files. Each contains ONLY an H1 title, a one-line purpose
   statement, and `> STATUS: not authored. Blocked by <blocker>.`
   Author no other content.
     docs/product/PRODUCT_BRIEF.md         (blocked by: open items 1-4)
     docs/product/GLOSSARY.md              (blocked by: PRODUCT_BRIEF)
     docs/product/RISK_REGISTER.md         (blocked by: nothing)
     docs/product/DECISIONS.md             (blocked by: PRODUCT_BRIEF)
     docs/product/SCOPE.md                 (blocked by: DECISIONS)
     docs/product/DOMAIN_MODEL.md          (blocked by: P-02, P-03, P-04)
     docs/product/FEATURE_INVENTORY.md     (blocked by: P-02, P-03, P-04)
     docs/product/CALC_SPEC.md             (blocked by: owner-authored worked examples)
     docs/product/CONTENT_MODEL.md         (blocked by: DOMAIN_MODEL)
     docs/product/REGULATORY.md            (blocked by: DECISIONS group F)
     docs/product/TENANCY_MODEL.md         (blocked by: DECISIONS groups A + G)
     docs/product/SECURITY_MODEL.md        (blocked by: TENANCY_MODEL)
     docs/product/DATA_MODEL.md            (blocked by: DOMAIN_MODEL + TENANCY_MODEL)
     docs/product/BRAND_CONFIG.md          (blocked by: DATA_MODEL)
     docs/product/TEMPLATE_MODEL.md        (blocked by: CONTENT_MODEL)
     docs/product/PRINT_CONTRACT.md        (blocked by: DECISIONS group E)
     docs/product/PRINT_PRODUCTION_SPEC.md (blocked by: PRINT_CONTRACT)
     docs/product/IMPORT_SPEC.md           (blocked by: DATA_MODEL)
     docs/product/UX_PRINCIPLES.md         (blocked by: PRODUCT_BRIEF)
     docs/product/ACCEPTANCE.md            (blocked by: SCOPE + CALC_SPEC)
     docs/method/EXTRACT_RUN.md            (blocked by: reviewer)
     docs/method/FREEZE_CHECKLIST.md       (blocked by: reviewer)

8. UPDATE every internal cross-reference in AGENTS.md, the three .cursor/rules
   files, README.md, SESSION_CONTEXT.md and DEVELOPMENT_JOURNAL.md pointing at a
   moved or renamed file, and replace product-name references (Balance Bites as
   the project, bb- prefixes in rule names) with B2S. Report every change with
   old and new value.
   Change the SUBSTANCE of no rule — paths and product name only. Where a rule
   cites PARITY_MATRIX.md, a parity gate, a migration importer, or PHASE_PLAN
   P02/P06, leave the text UNTOUCHED and list it under a heading
   "RULES REQUIRING REVIEWER REWRITE".

9. REPORT, then stop:
   - every move performed; every one skipped, with the reason
   - `git status` after the moves, and separately after .gitattributes
   - every cross-reference and name change
   - everything under RULES REQUIRING REVIEWER REWRITE
   - any remaining file referencing a parity gate, PARITY_MATRIX.md, a migration
     importer, or PHASE_PLAN P02/P06 that you did not change

- Done when: all moves via `git mv` with history intact · every archived and
  requirements file carries its banner and is otherwise byte-unchanged ·
  FREEZE.md rewritten with both original sections verbatim · .gitattributes
  present, its whitespace diff in a separate commit · all 22 stubs exist with
  title, purpose and STATUS line and nothing more · every cross-reference
  reported · no application code · no document content beyond stubs
- Tests: `git status`; `git log --follow` on two moved files; repo-wide grep for
  old paths returns zero hits outside docs/archive/
- Do NOT: delete any file · modify legacy/*.html · rewrite the substance of any
  rule · author stub content · write application code · commit the line-ending
  diff with the moves · alter requirements-extract content beyond the banner
```

---

## P-02 — Extract: bb-stock-costs.html

**Model: Opus · Effort: maximum extended thinking · Fresh window · Read-only**

```
## P-02 — Requirements extraction: bb-stock-costs.html
- Phase: PREPARE Step 5 · Model class: HEAVYWEIGHT
- Context to read first: SESSION_CONTEXT.md; AGENTS.md;
  docs/requirements/extracts/AUDIT_STICKER.md §C, §D, §3.1, §3.2, §3.4;
  docs/requirements/RETURNS_REQUIREMENTS.md;
  docs/requirements/extracts/REPORT.md §2.3
- Prompt (canonical):

ROLE: Requirements analyst. READ-ONLY. Create exactly one file, named at the end.

CONTEXT AND PURPOSE — read carefully, it changes what you are doing.
This tool is being RETIRED, not ported. No code from it will be reused. No
output of it is a parity target. Its data may all be lost and that is accepted.
Your job is NOT to audit it for correctness and NOT to catalogue its bugs
for fixing.

Your job is to extract, completely, the REQUIREMENTS it encodes — business
entities, relationships, calculations, workflows, and the configurable-versus-
hardcoded distinction — so a new multi-tenant white-label product (B2S) can be
specified without forgetting anything this tool taught its owner to expect.

Where the tool does something badly, record WHAT IT ACHIEVES, not how. Where it
is inconsistent, record the inconsistency as a decision the new product must
make. Propose no fixes. Design nothing. Recommend no stack, framework, schema
or architecture.

FILE: legacy/bb-stock-costs.html — 7,084 lines. Read COMPLETELY in sequential
chunks. No sampling. State your chunk count and confirm the final chunk reached
the last line.

TASK:

PART 1 — ENTITY AND RELATIONSHIP MODEL
  1.1 Every business entity this tool creates, reads or references. For each:
      exact stored field list with types, identity/key, storage location, file:line.
  1.2 Every relationship: cardinality, which side holds the foreign key, whether
      referential integrity is enforced, what happens on delete. Include
      relationships to entities owned by OTHER tools (bb_products,
      bb_label_templates, bb_stickers).
  1.3 Every place the SAME real-world concept is modelled more than once, or
      differently from another tool. AUDIT_STICKER.md §3.4 already found
      templateKey overloaded to hold either a template id or a sticker id — find
      the rest. Each is a canonicalisation decision for the new model.
  1.4 A relationship diagram in text form: entity -> entity, labelled edges.
  1.5 VOCABULARY. Every term the tool uses for a business concept, in Arabic and
      English. Flag every case where one word means two things or two words mean
      one thing. The new product has a known collision — "customer" means both
      the tenant and the buyer — so this section seeds the glossary.

PART 2 — CALCULATION EXTRACTION
  For EVERY money or quantity calculation, a specification a developer could
  re-implement with no access to this source:
    - plain-language statement of what it computes and why the business needs it
    - the exact expression, every input named with its source entity and field
    - rounding, truncation and precision behaviour, including where there is none
    - order of operations where it matters
    - edge cases handled (zero, negative, missing, divide-by-zero)
    - file:line
  Cover at minimum: invoice line totals, discounts, tax, invoice grand total,
  net revenue after returns, COGS per unit, margin, product summary, ingredient
  usage, recipe costing, monthly profit, gross/net/cash profit, stock value,
  stock after purchase, stock after production, stock after sale, stock after
  return (restock AND expired write-off separately), low-stock thresholds,
  operating-cost allocation, and anything else you find.

  CRITICAL — CONFIGURABILITY. For each calculation state which parts are
  BUSINESS-INVARIANT (true for any business) and which are THIS BUSINESS'S
  POLICY (a choice another business would make differently). Policy examples:
  tax inclusive vs exclusive, whether returns restock at cost or sale price, how
  operating costs are allocated, what counts as low stock. B2S must expose policy
  as configuration, so this split is the most important column in the deliverable.

PART 3 — WORKFLOWS
  Every complete business workflow, as ordered steps with entities touched and
  state transitions. Cover at minimum: purchase, production, sale, return (both
  dispositions), stock adjustment, operating-cost entry, reporting. Note every
  place a workflow can be abandoned mid-way and what state is left behind.

PART 4 — RETURNS, IN FULL
  Returns are first-class in B2S and are modelled as stock movements. Treat
  docs/requirements/RETURNS_REQUIREMENTS.md as a REQUIREMENTS STATEMENT, not a
  claim to verify against code.
  Document: the complete Return entity as stored; per-line item structure; every
  disposition and its distinct stock effect and money effect; outAllocations —
  what it is, what it allocates, what consumes it; the three-way invoice
  grouping; how a partially-returned invoice is represented. Where the code and
  RETURNS_REQUIREMENTS.md differ, record BOTH and mark it a decision for the new
  design rather than an error in either.

PART 5 — BATCH, LOT AND TRACEABILITY
  B2S requires batch/lot tracking for produced products, labels and stickers, and
  requires resolving a bad batch to the invoices that shipped it. Record what
  this tool has today: any batch, lot, expiry or production-date concept, whether
  it is an entity or an attribute, whether stock is tracked per batch, and whether
  any path could resolve a batch to a shipment. If the capability is absent, say
  so plainly — that is a requirement B2S adds, not a gap in the extraction.

PART 6 — CONFIGURABLE vs HARDCODED
  B2S forbids hardcoded brand, business or locale values. Table:
  value | what it represents | who owns it in B2S (brand config / business policy
  / product catalog / system constant) | wizard input type | file:line.
  Cover brand identity, colours, fonts, currency, tax rates, units, flavour and
  category lists, thresholds, Arabic and English UI strings, document templates,
  absolute paths, numbering formats.

PART 7 — BILINGUAL CONTENT INVENTORY
  Every user-facing string, in both languages where both exist, with file:line.
  Mark each: UI chrome / business data / document template / validation message.
  Note every place only one language exists. B2S is bilingual by rule with no
  literals, so this seeds the translation resource set.

PART 8 — WHAT B2S MUST NOT REPRODUCE
  Behaviours that are clearly defects rather than requirements. One sentence each,
  plus what the correct behaviour should have been. Design no fix. This exists so
  the new build does not re-derive them.

OUTPUT — create exactly one file:
  docs/requirements/extracts/EXTRACT_STOCK_COSTS.md

- Done when: only that file created or modified · chunk count stated and final
  chunk confirmed at the last line · Parts 1-8 all present · every calculation
  carries the invariant-vs-policy split · every entity carries a complete typed
  field list · every claim carries file:line · Part 7 covers both languages with
  one-language gaps marked
- Tests: N/A — read-only extraction
- Do NOT: modify any file except the output · propose fixes, refactors, schemas
  or architecture · recommend a stack, framework or library · design the new data
  model · read the other legacy tools · audit for correctness · write code
```

---

## P-03 — Extract: balance-bites-invoice-pro.html

**Model: Opus · Effort: maximum extended thinking · Fresh window · Read-only**

```
## P-03 — Requirements extraction: balance-bites-invoice-pro.html
- Phase: PREPARE Step 6 · Model class: HEAVYWEIGHT
- Context to read first: SESSION_CONTEXT.md; AGENTS.md;
  docs/requirements/extracts/EXTRACT_STOCK_COSTS.md (all of it — this pass must
  reconcile against it); docs/requirements/RETURNS_REQUIREMENTS.md;
  docs/requirements/extracts/REPORT.md §2.1
- Prompt (canonical):

Run P-02's prompt verbatim, with these substitutions and additions.

SUBSTITUTIONS:
  FILE: legacy/balance-bites-invoice-pro.html — 4,284 lines
  OUTPUT: docs/requirements/extracts/EXTRACT_INVOICE_PRO.md
  PART 5 becomes: PAYMENTS, IN FULL (below)

ADDITIONAL PART — RECONCILIATION (do this last, it is the highest-value section):
  EXTRACT_STOCK_COSTS.md documents entities, calculations and vocabulary from the
  other business tool. For every entity, calculation and term that appears in
  BOTH files, state:
    - IDENTICAL — same shape, same expression, same meaning
    - DIVERGENT — describe the difference precisely, with both file:line pairs
    - ONE-SIDED — present in one tool only
  Every DIVERGENT item is a canonicalisation decision for B2S's domain model.
  Do not choose a winner. Record both and state what turns on the choice.

PART 5 REPLACEMENT — PAYMENTS, IN FULL
  B2S requires: full / partial / underpaid states; payment types cash, card and
  other; receipt attachment where available. Document what exists today: the
  Payment entity and its exact shape, how a partial payment is represented, how
  the outstanding balance is computed, what states an invoice can hold, whether
  payment type is recorded, whether any receipt or reference is stored, and how
  overpayment and refund are handled if at all. Where a required capability is
  absent, say so plainly — that is a requirement B2S adds.

Everything else — Parts 1, 2, 3, 4, 6, 7, 8, the Done-when list and the Do-NOT
list — applies unchanged, reading "this tool" as invoice-pro.

ADDITIONAL Do NOT: do not re-extract stock-costs · do not resolve any DIVERGENT
item · do not modify EXTRACT_STOCK_COSTS.md
```

---

## P-04 — Extract: the three design tools

**Model: Opus · Effort: maximum extended thinking · Fresh window · Read-only**

```
## P-04 — Requirements extraction: the three remaining design tools
- Phase: PREPARE Step 7 · Model class: HEAVYWEIGHT
- Context to read first: SESSION_CONTEXT.md; AGENTS.md;
  docs/requirements/extracts/AUDIT_STICKER.md (all of it);
  docs/requirements/extracts/REPORT.md §2.4, §2.5, §2.6, §3.1, §3.2, §3.3
- Prompt (canonical):

ROLE: Requirements analyst. READ-ONLY. Create exactly one file.

CONTEXT: same as P-02 — these tools are RETIRING, not being ported. Extract
requirements, not defects. B2S's packaging half is TEMPLATE-DRIVEN with
constrained customisation and a library of presets, NOT a free canvas. That is a
frozen decision, and it changes what matters here: what a template must be able
to express, and which of these tools' 388-control free-canvas surface is
essential versus incidental.

FILES — read ALL THREE completely, in sequential chunks, no sampling:
  legacy/balance-bites-label-editor- latest.html   2,179 lines (note the space
                                                   in the filename)
  legacy/balance-bites-stand.html                    773 lines
  legacy/balance-bites-carton (2).html                458 lines
State chunk counts per file and confirm each final chunk reached the last line.

TASK:

PART 1 — PER-FILE CAPABILITY INVENTORY
  For each of the three, separately: purpose, every shape/mode, every geometry
  calculation with its expression, every print path and page rule with units,
  every export format, every preset or template mechanism, and its complete
  storage footprint. Cite file:line throughout.

PART 2 — CF-22: LABEL-EDITOR vs STICKER TOOL CAPABILITY DELTA
  This carry-forward exists because no artifact contains this comparison and a
  merge decision cannot be made without it. AUDIT_STICKER.md documents the
  sticker tool in full. For every capability in
  "legacy/balance-bites-label-editor- latest.html", state PRESENT / CHANGED /
  ABSENT in the sticker tool, with file:line on both sides. Then state whether
  the editor is a strict subset of the sticker tool, a distinct label class, or
  overlapping-but-neither. Justify from evidence. This closes CF-22.

PART 3 — THE TEMPLATE REQUIREMENT
  Across all four design tools (these three plus the sticker tool as documented
  in AUDIT_STICKER.md), derive what a B2S template must be able to express:
  3.1 Every distinct PHYSICAL OUTPUT TYPE, with its dimensional parameters,
      constraints and defaults.
  3.2 Every distinct CONTENT SLOT — a place text, an image, a code or a colour
      can go. Group by output type. This is the seed of CONTENT_MODEL.md.
  3.3 Every LAYOUT DEGREE OF FREEDOM — what can move, resize, reorder, hide.
      For each, judge: must a brand be able to change this, or is it an artifact
      of a tool with no templates? Justify each judgement. This is the seed of
      TEMPLATE_MODEL.md's constraint set and it is the most valuable section here.
  3.4 Every GEOMETRY CALCULATION that must survive into B2S, as a re-implementable
      specification: inputs, expression, units, rounding. The conical cup unwrap
      is the significant one — AUDIT_STICKER.md documents the sticker tool's
      version; record these tools' versions and note any divergence.
  3.5 Every DIE-LINE or CUT-PATH concept present, however informal.

PART 4 — PRINT REQUIREMENTS
  Every @page rule, margin, page size, unit, and print mechanism across all
  three, with file:line. Every place a dimension is expressed in px, mm or cm and
  where the conversion happens. Every safety buffer, bleed or trim concept and
  its numeric value. Note every zero-margin page rule.
  B2S requires a deterministically generated print file, identical across all
  platforms, with the browser print dialog as preview only. For each tool, state
  what its print approach could and could not deliver against that requirement.

PART 5 — CONFIGURABLE vs HARDCODED
  As P-02 Part 6, covering all three files in one table with a file column.

PART 6 — BILINGUAL CONTENT INVENTORY
  As P-02 Part 7, all three files.

PART 7 — WHAT B2S MUST NOT REPRODUCE
  As P-02 Part 8, all three files.

PART 8 — CROSS-FILE COUPLING
  AUDIT_STICKER.md §3.1 found the sticker tool participates in the shared
  business data layer, contradicting REPORT.md §3.3's "independent islands"
  conclusion. §3.1 explicitly flagged that the claim cannot simply be inverted
  for the whole family and must be re-derived per file. Do that: for each of
  these three, does it touch the shared folder, bb_filestore_v1, any bb_* key, or
  any business entity? Report per file. State what REPORT.md §3.3 should have
  said about the design family as a whole.

OUTPUT — create exactly one file:
  docs/requirements/extracts/EXTRACT_DESIGN_TOOLS.md

- Done when: only that file created · three chunk counts stated, each confirmed
  at its last line · Parts 1-8 present · Part 2 closes CF-22 with an explicit
  subset/distinct/overlapping verdict · every 3.3 degree of freedom carries a
  justified must-change-or-artifact judgement · every claim carries file:line
- Tests: N/A — read-only extraction
- Do NOT: modify any file except the output · read bb-stock-costs.html or
  invoice-pro.html · propose fixes, schemas, architecture or a stack · design
  the template model (that is the reviewer's, from your inventory) · write code
```

---

## GATE 1 — Extraction complete

Paste all three extracts into the Claude Project. Reviewer verdict against:

- three complete reads, chunk-confirmed
- entity model reconciled across both business tools, every DIVERGENT item recorded unresolved
- every calculation carries the invariant-vs-policy split
- returns and payments documented in full
- CF-22 closed with a verdict
- template requirement derived across all four design tools
- vocabulary collisions catalogued
- no file modified except the three outputs

**FAIL on any missing element.** Documents authored on incomplete extraction inherit the gap permanently.

---

## P-05 — Author Tier 0

**Reviewer task. Paste into the Claude Project.**

```
GATE 1 PASSED. Author Tier 0.

SESSION_CONTEXT.md: [paste]

Extracts committed: EXTRACT_STOCK_COSTS.md, EXTRACT_INVOICE_PRO.md,
EXTRACT_DESIGN_TOOLS.md, AUDIT_STICKER.md.

Confirmed decisions: B2S_PREPARE_PHASE.md §2, with open items 1-4 answered as:
  [paste your four answers]
Release 1 scope: [signed / amended as follows: ...]

Author, in full, ready to commit:
  1. docs/product/PRODUCT_BRIEF.md — purpose, customer, jobs-to-be-done,
     tenancy model, the core loop, non-goals, the acceptance event
  2. docs/product/GLOSSARY.md — every business term, Arabic and English, one
     agreed term per concept. Must resolve CF-28 (customer = tenant vs buyer)
     and every collision the extracts catalogued. Include a NEVER-USE column.
  3. docs/product/RISK_REGISTER.md — every product risk with likelihood, impact,
     owner and mitigation. Tenant isolation, print determinism, GTIN legality,
     regulatory liability, asset storage limits, scope size against a6.

Do not author Tier 1 or below in this response.
Do not propose architecture, stack, framework or layering.
```

---

## P-06 — Author Tier 1

```
Tier 0 committed. Author Tier 1.

SESSION_CONTEXT.md: [paste]

Author, in full:
  1. docs/product/DECISIONS.md — all 56 ODs, each with the decision, the date,
     the rationale, and what it forecloses. Include the PROPOSED ones I have now
     signed. Add ODs for: Design Assistant scope (CF-30), Release 1 boundary,
     and the admin visibility promise (G10).
  2. docs/product/SCOPE.md — the corrected 14-module map, every module's
     responsibility and boundary, Release 1 / 2 / 3 assignment per module, and
     the explicit exclusion list. Must close CF-29.

Do not author Tier 2 or below.
Do not propose architecture, stack, framework or layering.
```

---

## GATE 2 — Scope frozen (MANUAL)

Read `SCOPE.md` and `DECISIONS.md` end to end. Sign each OD with a date. **Nothing below this line may be authored until every OD is signed** — an unsigned OD at Tier 2 means rewriting Tier 3 later, which is the failure the whole freeze exists to prevent.

---

## P-07 — Author Tier 2

```
GATE 2 PASSED — all ODs signed. Author Tier 2.

SESSION_CONTEXT.md: [paste]

Author, in full:
  1. docs/product/DOMAIN_MODEL.md — canonical entity list, one definition per
     concept, every relationship with cardinality and integrity rule, the
     counting methodology, and a resolution for every DIVERGENT item the
     extracts recorded. This closes C1.
  2. docs/product/FEATURE_INVENTORY.md — every feature harvested from the
     retiring tools plus every new requirement, each traced to its source and
     assigned to a release. Include the "must not reproduce" section carrying
     CF-16 through CF-24.
  3. docs/product/CONTENT_MODEL.md — the content taxonomy: every field a
     packaging artifact can carry, per output type, independent of layout.
  4. docs/product/REGULATORY.md — the compliance surface, the F2 liability
     position, and what the product must let a brand express to comply without
     B2S guaranteeing compliance.

Do not author Tier 3.
Do not propose architecture, stack, framework or layering.
```

---

## Step 11 — Author `CALC_SPEC.md` (MANUAL — blocks the build)

**Nobody can do this for you.** You are the authority on what the right number is.

For every calculation in the extracts, a row: inputs → expected output → rounding rule. Verified by hand.

Minimum coverage: invoice line total · discount · tax (inclusive and exclusive) · invoice grand total · payment applied · outstanding balance · overpayment · return line value · stock after return (restock) · stock after return (expired write-off) · net revenue after returns · COGS per unit · margin · stock value · low-stock trigger · operating-cost allocation.

Format per calculation:

```
### Invoice line total
Inputs:   qty=3, unitPrice=45.50, discountPct=10, taxRate=14, taxMode=exclusive
Expected: subtotal=136.50, discount=13.65, taxable=122.85, tax=17.20, total=140.05
Rounding: half-up to 2 decimals, applied after each named step
Policy:   discount before tax (configurable per tenant)
```

**This document is the money gate.** Without it, "correct" has no test and `c2` cannot be verified.

---

## P-08 — Author Tier 3a

```
Tier 2 committed. CALC_SPEC.md authored and committed. Author Tier 3a.

SESSION_CONTEXT.md: [paste]

Author, in full:
  1. docs/product/TENANCY_MODEL.md — account/brand/line/product hierarchy,
     member and role model, what is scoped to what, the isolation boundary,
     and the 1000-tenant × N-member target.
  2. docs/product/SECURITY_MODEL.md — the isolation guarantee in testable terms,
     the admin visibility promise (G10) and its break-glass path, the audit trail
     (C15), PII handling (G6), the public-repo prevention rules, and what
     evidence closes the tenant-isolation gate. Must close CF-31.

Model class: HEAVYWEIGHT — both documents touch tenant isolation.
Do not propose architecture, stack, framework or layering.
```

---

## P-09 — Author Tier 3b

```
Tier 3a committed. Author Tier 3b.

SESSION_CONTEXT.md: [paste]

Author, in full:
  1. docs/product/DATA_MODEL.md — every entity's storage shape, keys, indexes as
     requirements not implementation, tenant scoping on every table, the asset
     two-tier rule (G11), batch/lot/traceability (C4, C5), multi-location (C6),
     master/variant items (C7).
  2. docs/product/BRAND_CONFIG.md — the complete brand schema, master-level with
     per-line override (D10), every wizard step and field type, validation rules,
     export/import, versioning and archive-never-delete (D5).
  3. docs/product/TEMPLATE_MODEL.md — what a template is, what a brand may and
     may not change, dimension variants, versioning, and how a template stays
     print-safe when customised. Derived from EXTRACT_DESIGN_TOOLS.md Part 3.3.

Do not propose architecture, stack, framework or layering.
```

---

## P-10 — Author Tier 3c

```
Tier 3b committed. Author Tier 3c.

SESSION_CONTEXT.md: [paste]

Author, in full:
  1. docs/product/PRINT_CONTRACT.md — units, tolerance per output type (E8),
     bleed/trim/safe-area presets (E3), substrate (E9), colour space (E4),
     die-lines (E5), and the measured physical tolerance from Step 15.
     Closes CF-05, CF-23, CF-24.
  2. docs/product/PRINT_PRODUCTION_SPEC.md — exactly what the print shop
     receives, in which formats (E1), and the determinism requirement (E11) with
     the evidence that closes its gate.
  3. docs/product/IMPORT_SPEC.md — CSV template per entity derived from
     DATA_MODEL.md, validation rules, dry-run mode, per-row error reporting,
     partial-import policy, and the onboarding path for a brand arriving with
     existing product and buyer lists. Closes CF-32.

Model class: HEAVYWEIGHT — print generation.
Do not propose architecture, stack, framework or layering.
```

---

## Step 15 — Print calibration (MANUAL)

Print a calibration sheet with known dimensions. Measure with a ruler. Record deviation per printer and paper. That measurement — not any legacy printout — becomes the tolerance in `PRINT_CONTRACT.md`. Also record each printer's unprintable margin; CF-17 exists because that was never measured.

---

## P-11 — Author Tier 3d

```
Tier 3c committed. Print calibration recorded. Author Tier 3d.

SESSION_CONTEXT.md: [paste]

Author, in full:
  1. docs/product/UX_PRINCIPLES.md — the design surface's charter: bilingual and
     RTL rules, the no-literals rule as a checkable constraint, accessibility
     standard (H2), responsive targets (G5), and the constrained-customisation
     principle that keeps the packaging UI from becoming another 388-control
     screen.
  2. docs/product/ACCEPTANCE.md — what done means per module and per release,
     the four-standard acceptance model, and the evidence that closes each gate.

Do not propose architecture, stack, framework or layering.
```

---

## P-12 — Land all documents

**Model: Sonnet · Effort: normal · Read-write**

```
## P-12 — Land the frozen document set
- Phase: PREPARE Step 17 · Model class: STANDARD
- Context to read first: SESSION_CONTEXT.md; AGENTS.md
- Prompt (canonical):

ROLE: Land task. Commit reviewer-authored documents. Author no content, change
no substance.

TASK:
1. Replace each stub in docs/product/ with the authored content supplied by the
   reviewer. Every one of the 20 stubs must now be authored. Report any still
   carrying a STATUS line.
2. Author docs/method/EXTRACT_RUN.md and docs/method/FREEZE_CHECKLIST.md from
   the reviewer's supplied content.
3. Rewrite AGENTS.md and the three .cursor/rules files to reference the frozen
   document set, replacing every item listed under RULES REQUIRING REVIEWER
   REWRITE in P-01's report with the reviewer's replacement text. Report every
   rule changed, with old and new text.
4. Rewrite README.md: what B2S is, the tagline, the document map, how to
   navigate docs/product/ versus docs/requirements/ versus docs/archive/.
5. Update SESSION_CONTEXT.md: phase = PREPARE COMPLETE, last task = P-12,
   next action = Gate 3 verdict. Carry forward the active carry-forward list.
6. Append to DEVELOPMENT_JOURNAL.md a dated entry recording the greenfield pivot,
   the rename to B2S, and the document freeze.
7. Verify: repo-wide grep for "parity", "PARITY_MATRIX", "Balance Bites" as the
   project name, "bb-" as a rule prefix, and "PHASE_PLAN P02" or "P06" returns
   zero hits outside docs/archive/ and docs/requirements/. Report every hit.
8. Report the full tree of docs/ and stop.

- Done when: no stub retains a STATUS line · every rule rewrite reported with old
  and new text · the grep in step 7 is clean outside archive and requirements ·
  no document content authored by you · no application code
- Do NOT: author or edit document content · change the substance of any rule
  beyond the reviewer's supplied replacement · delete any file · write
  application code · touch legacy/ · begin architecture work
```

---

## GATE 3 — PREPARE PHASE ENDS

Reviewer verdict. Every item must hold:

- [ ] All 56 ODs signed and dated in `DECISIONS.md`
- [ ] `GLOSSARY.md` resolves every vocabulary collision, CF-28 included
- [ ] `SCOPE.md` covers all 14 modules with release assignment; CF-29 closed
- [ ] `DOMAIN_MODEL.md` resolves every DIVERGENT item from the extracts; C1 closed
- [ ] **`CALC_SPEC.md` authored by you, with a rounding rule on every calculation**
- [ ] `SECURITY_MODEL.md` states the isolation guarantee in testable terms; CF-31 closed
- [ ] `PRINT_CONTRACT.md` carries a measured physical tolerance, not an assumed one
- [ ] `PRINT_PRODUCTION_SPEC.md` states the determinism requirement and its evidence
- [ ] `TEMPLATE_MODEL.md` states what a brand may and may not change
- [ ] `IMPORT_SPEC.md` has a CSV template per entity, derived from the frozen schema
- [ ] `FEATURE_INVENTORY.md` carries the must-not-reproduce list
- [ ] `RISK_REGISTER.md` has an owner on every risk
- [ ] `ACCEPTANCE.md` states the evidence that closes each gate
- [ ] No open carry-forward without a named owner
- [ ] GitHub protections on; `.gitattributes` committed; no secret in history

**Only after Gate 3 passes:** `ARCHITECTURE.md`, ADRs, `MODULE_SPEC.md`, the stack, the layering, and the new phase plan.

Nothing before it.
