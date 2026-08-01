# PRODUCT BRIEF — B2S

**B2S | Brand to Shelf** · *build.package.sell*
**Status:** AUTHORED. Tier 0, precedence slot 1.
**Authored:** 2026-08-01 by the reviewer surface. Supersedes the stub.
**Source:** the 79 signed decisions in `docs/method/B2S_PREPARE_PHASE.md` §2, and the three requirements extracts in `docs/requirements/extracts/`.

---

## 1. What B2S is

A multi-tenant, white-label web platform on which a brand owner runs the whole
path from identity to invoice.

A brand owner signs up, completes an onboarding wizard capturing brand identity,
logo, typography, colours and business data, and the platform produces on-brand
packaging — labels, stickers, boxes, cups, stands and garment tickets — from a
constrained template library. Alongside that sits the business half: product
catalog, stock, purchasing, sales, invoicing, payments and returns, all linked
through one entity model.

**The two halves are one product, not two.** A `Product` in the catalog is the
same `Product` the packaging references; the `Batch` a `ProductionRun` creates is
the same `Batch` a `TraceLink` resolves to an `Invoice`. Nothing is orphaned.

B2S is **"the platform."** It is never called "the product" — `Product` is a
domain entity (`GLOSSARY.md`).

---

## 2. Who it is for

**The customer is the brand owner** — often a food producer, but the platform is
category-neutral by design and serves garment brands on the same model (OD-A2,
OD-E7).

**Balance Bites is a customer of B2S, not its owner** (OD-A4). Six HTML tools
built for that one brand are being retired. Their requirements have been
extracted; they are now read-only evidence and nothing more.

### Tenancy

One account = one company = one master `Brand`, holding many `BrandLine` records
and many `Product` records (OD-A3). Unrelated companies require separate
accounts.

**Explicitly excluded:** agencies serving unrelated clients from one login
(OD-A5). That is a different product with a different isolation model, and
admitting it would compromise the tenancy guarantee for everyone else.

Scale target: **1,000 tenants**, each with multiple `Member` records (OD-G1, G2).

---

## 3. Jobs to be done

A brand owner comes to B2S with one of these and must be able to finish it
without leaving:

| Job | What the platform must do |
|---|---|
| **Look like a real brand** | Capture identity once; apply it everywhere, consistently, in print and on screen |
| **Get packaging made** | Produce a print-shop-ready file that measures correctly on paper, without a designer |
| **Know what I have** | Stock that is accurate because there is one write path into it |
| **Know what it costs** | Component-level costing that reaches a defensible margin |
| **Get paid** | Invoice, take partial payment, and know what is outstanding |
| **Handle it coming back** | Process a return correctly on both the stock side and the money side |
| **Bring my existing data** | CSV import for products and buyers, with a dry run before anything commits |
| **Work in my language** | Full Arabic and English, RTL and LTR, with no string left untranslated |

---

## 4. The core loop

```
onboard brand → define products → generate on-brand packaging →
manage stock → sell → invoice → collect payment → handle returns
```

**Any release that cannot complete this loop has not validated the product.**
This is why returns are in Release 1: an invoicing system that cannot process a
return cannot run a real business.

---

## 5. The acceptance event

**Done when many brands run their business from it** (OD-A6).

Not "when the features ship." A single brand completing the core loop end to end,
on real data, with printed output that measures correctly, is the first real
signal. Many brands doing so is the acceptance event.

---

## 6. What makes this hard

Four things, each of which has already produced a documented failure in the
retiring tools:

**Print is physical.** Someone cuts material to these files. A 2 mm error costs
money. Screen fidelity proves nothing; only a measured, photographed printout
does. The tolerance in `PRINT_CONTRACT.md` is a fresh physical measurement, never
a legacy printout (OD-B4, OD-E2).

**Money has no legacy precedent.** The extracts establish that **no tax, no
freight and no money rounding rule exists anywhere in any retiring tool**, and
that payments were a binary `paid|pending` flag with no amount. Returns were
valued at list price against a discounted invoice total, so every historical
net-revenue figure is overstated. `CALC_SPEC.md` is therefore authored from
scratch by the owner and is the money gate.

**Isolation cannot be retrofitted.** Proof that tenant A cannot read tenant B is
required on every gate touching data access, and **that gate is not waivable by
OD**.

**Nothing may be hardcoded.** Brand, business and locale values live in
configuration and translation resources. The retiring tools shipped a corrupted
Arabic literal on every printed sales report containing a full return, undetected
for the life of the tool, precisely because the string was inline (CF-73).

---

## 7. Non-goals

| Not doing | Why |
|---|---|
| Agency multi-client from one login | OD-A5. Different isolation model |
| Compliance guarantees | OD-F2. The brand owner is responsible; B2S provides expression, not assurance. Stated in terms of service |
| Retail GTIN generation | OD-H5. GTINs are GS1-allocated and entered, never minted |
| Legacy data migration as a feature | OD-A5. CSV import replaces it |
| Maintaining the retiring tools in parallel | OD-B2 |
| Parity with any legacy output | OD-B1, CLOSED. Legacy defects are requirements the new build must **not** reproduce (OD-B3) |
| Operator access to tenant business data | OD-G10. Metadata, usage and billing only, with `ConsentGrant` as the audited exception |

---

## 8. Standing rules

1. **Bilingual by rule.** Arabic and English, RTL and LTR, zero literals.
2. **Zero hardcoded brand, business or locale values.**
3. **Every entity related, nothing orphaned.**
4. **Template-driven with constrained customisation, never a free canvas.**
5. **No document creates stock. Only a confirmation event does.**
   `PurchaseOrder → GoodsReceipt → stock` · `SalesOrder → Shipment → stock` ·
   `PrintJob → ProductionRun → stock` · `Return → StockMovement + CreditNote`.
   `StockLevel` is derived from `StockMovement` and has exactly one write path.

---

## 9. Acceptance standards

Four, by domain. **No evidence means FAIL.**

| Domain | Standard |
|---|---|
| **Money & quantity** | Exact match against the signed worked examples in `CALC_SPEC.md`. Zero drift. A rounding rule stated per calculation |
| **Print** | The measured physical tolerance in `PRINT_CONTRACT.md`, plus byte-identical `PrintArtifact` output across platforms (OD-E11) |
| **Features & entities** | Conformance to `FEATURE_INVENTORY.md` and `DOMAIN_MODEL.md` |
| **Tenant isolation** | Proof that tenant A cannot read tenant B, on every gate touching data access. **Not waivable by OD** |

---

*Tier 0. Read with `GLOSSARY.md`. Superseded only by formal amendment.*
