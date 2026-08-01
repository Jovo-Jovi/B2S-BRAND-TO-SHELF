# CALC SPEC — B2S

**Status:** AUTHORED. Tier 2, precedence slot 4.
**Drafted:** 2026-08-01 by the reviewer surface, from the extracts.
**Calculation choices CS-01 … CS-15 SIGNED 2026-08-01 by the owner.**

**Closes:** CF-45, CF-62, CF-70. **Amends:** CF-47.
**Depends on:** `GLOSSARY.md`, `DECISIONS.md`, `DOMAIN_MODEL.md`, `TENANCY_MODEL.md`.

> **This document is the money gate.** Every figure the platform computes is
> checkable against a row here, or it is unverifiable. `DOMAIN_MODEL.md` says what
> exists and what is true of it; this says what the number is.
>
> **Nothing here is inherited.** The retiring tools have no tax, no freight, no
> money rounding and no real payment record. Eleven of the twenty-five Release 1
> rows below cite `Legacy source: NONE`. That is not a gap in the extraction — it
> is the extraction reporting, correctly, that these numbers have never existed
> and had to be authored.

---

## 0. How to read a row

```
### R1-nn — <name>
Legacy source: <extract §, file:line>   |   NONE
Invariant:  what is true for any business, in any country
Policy:     what another tenant would choose differently — therefore configuration
Inputs:     named values with their source entity and field
Expected:   the exact result, to the stored precision
Rounding:   mode, precision, and the point at which it is applied
Remainder:  where the odd minor unit lands, when a split does not divide evenly
Edge:       zero, negative, missing, divide-by-zero
```

`Invariant` and `Policy` are not decoration. `Policy` rows are what `Settings`
must expose; an invariant hardcoded is correct, a policy hardcoded is the
white-label failure this platform exists to prevent.

---

## 1. Signed calculation choices

Fifteen forks, each a tenant-policy choice that changes stored numbers
permanently. All fifteen signed 2026-08-01. CS-15 was signed separately,
after the reviewer found it had been omitted from the list originally put to the
owner. Choices are cited as `CS-nn`
throughout §2–§6. They sit alongside the 79 ODs in `DECISIONS.md` rather than
inside the register: an OD decides what the platform does, a CS decides what a
number is.

---

**CS-01 · Rounding mode — half-up, half away from zero.**

The retiring tools present through `toFixed(2)`, which is half-away-from-zero
(`EXTRACT_STOCK_COSTS.md` Part 2 preamble, `:1631`). Every figure the business
has read on screen or on a printout rounded this way, so no historical number
changes direction.

*Forecloses:* half-even. Its aggregate-bias advantage needs volumes this platform
will not see for years, and it would silently move numbers the owner recognises.

---

**CS-02 · Rounding point — after every named step.**

The only choice under which `Invoice.total == Σ InvoiceLine.netValue` holds
**exactly** rather than to a tolerance.

*Forecloses:* full-precision carry with rounding only at storage, and rounding
only at the grand total. Both force an epsilon back into every comparison, which
is the legacy failure — `1e-9`, `1e-6` and `1e-4` coexisting in one file.

---

**CS-03 · Stored money precision — the `Currency`'s own minor-unit count.**

EGP and USD 2, KWD 3, JPY 0. OD-C9 makes currency tenant-selectable.

*Forecloses:* a fixed two decimal places, which breaks the first tenant billing
in a three- or zero-decimal currency; and a hidden four-decimal internal
precision, which produces documents that disagree with the values behind them.

---

**CS-04 · Tax scope — per `InvoiceLine`, one tenant-level rate in R1, the rate
stored on the line.**

Per-line is the only basis on which a partial `Return` can reverse the right tax,
and returns are R1. Storing the rate on the line makes per-`ProductCategory`
rates a later additive change.

*Forecloses:* computing tax once on an invoice-level taxable base, which makes
return tax underivable and would have to be restated to add returns later.

---

**CS-05 · Tax base — discount first; tax computed on the discounted net.**

The buyer is taxed on what they actually pay.

*Forecloses:* taxing the undiscounted gross. `EXTRACT_INVOICE_PRO.md` §2.4
records that this question has **no legacy answer** — the tool had a discount and
no tax, so the two never met. If a regulatory regime later requires the gross
basis, that is a signed amendment and a restatement, not a setting.

---

**CS-06 · Tax mode — both inclusive and exclusive, tenant-toggled, in R1.**

OD-C10 already makes tax a tenant toggle, and a tenant pricing tax-inclusive at
retail cannot use an exclusive-only platform at all.

*Forecloses:* deferring inclusive mode to R2. Retro-fitting it would restate
every stored `InvoiceLine`, because net and tax split differently under it.

---

**CS-07 · Freight — out of Release 1 entirely. No row, no field.**

No signed decision in the register mentions freight, and `EXTRACT_STOCK_COSTS.md`
§2.6 confirms zero occurrences of `shipping` / `شحن` in either business tool.

*Forecloses:* inventing a delivery charge without an OD. Adding one later
requires an OD first, then a row here, then a decision on whether it is taxable.

---

**CS-08 · Discount allocation basis — proportional to each `InvoiceLine`'s gross.**

The only basis on which the discount a buyer perceives on a row matches the
discount that row actually carries.

*Forecloses:* allocation by quantity, which over-discounts cheap high-volume
rows; and an equal split, which is arbitrary.

---

**CS-09 · Allocation remainder — largest remainder.**

Floor every share, then assign leftover minor units one each to the rows with the
largest fractional parts. Tie-break: higher gross first, then lower ordinal.

*Forecloses:* first-row, last-row and largest-row absorption. Under all three the
arithmetic depends on row sequence, so re-sorting a document changes its numbers.
Largest-remainder distorts no single row by more than one minor unit and is
sequence-independent given the stated tie-break.

---

**CS-10 · Return valuation — at the stored `InvoiceLine.netValue`, proportional
to returned quantity.**

This is why `DOMAIN_MODEL.md` D13 exists. `EXTRACT_INVOICE_PRO.md` §2.9 works the
legacy case: on a 100 subtotal with a 10% discount, returning a row worth 50
yields net 40 though the buyer paid 45.

*Forecloses:* list-price valuation, which is the mechanism behind CF-70 — **every
historical net-revenue figure in the legacy data is overstated by exactly this.**
In §3's worked example the gap is 9.10 on a single row.

---

**CS-11 · Partial-return residual — the tranche that exhausts a row takes the
residual, being `netValue` less everything already returned.**

*Forecloses:* always-proportional tranches. Returning 1 of 3 units three times
against a 100.00 row gives 33.33 + 33.33 + 33.33 = 99.99 and orphans a minor unit
that can never be credited. Under CS-11 a fully returned row credits back exactly
its `netValue`, always, by construction.

---

**CS-12 · Write-off stock effect — two movements: `return_restock` +q, then
`adjustment` −q with reason `writeOff`.**

Preserves `StockLevel = Σ StockMovement` exactly (`DOMAIN_MODEL.md` §5.2) and
records both physical facts: the goods came back, and they were destroyed.

*Forecloses:* a quantity fact living on `ReturnLine` outside the single write
path, which §5.2 forbids. A quarantine `Location` is the more correct model and
waits for OD-C6 multi-location in R2.

---

**CS-13 · Overpayment — accepted and recorded. Outstanding goes negative and
reads as credit on account.**

*Forecloses:* clamping at zero. `EXTRACT_INVOICE_PRO.md` §5.4 records overpayment
as not modelled, not detectable, not displayable, and §2.9 records
`Math.max(0, …)` silently absorbing over-returns. A clamp here would reproduce
precisely that blindness in a new place.

---

**CS-14 · `Invoice` numbering — gapless sequential per `Tenant` per `BrandLine`,
allocated at issue.**

OD-C11 and `TENANCY_MODEL.md` §4 fix the scope; gaplessness was open. Many tax
regimes require a gapless series, and an unexplainable gap is an audit finding.
Allocation at issue means a draft `SalesOrder` never consumes a number.

*Forecloses:* gap-permitting sequences and date-prefixed composites. The legacy
tools carried **three disagreeing numbering implementations**
(`EXTRACT_INVOICE_PRO.md` §2.12–§2.14), so nothing was inherited.

**CS-15 · Return recognition period — the month of the `Return`.**

A reduction in net revenue falls in the period the `Return` occurred in, not the
period its `Invoice` was issued in. Each period reports what actually happened
in it, and a closed month never moves.

*Forecloses:* recognition at invoice date, under which a late `Return` restates
a closed month — the same failure class as CF-47, which D4 and R1-05 exist to
prevent on the pricing side.

---

## 2. Global rules

| # | Rule |
|---|---|
| G1 | Money is an exact decimal type. **Never a binary float.** The legacy tools used IEEE-754 doubles throughout and rounded nothing (`EXTRACT_STOCK_COSTS.md` Part 2 preamble). |
| G2 | Stored money precision = the `Currency`'s minor-unit count (CS-03). All examples below use 2. |
| G3 | Rounding is **half-up**, applied after every named step (CS-01, CS-02). |
| G4 | **No comparison epsilon.** With G1 and G3, equality is exact. The legacy set carried three tolerances at once; B2S carries none. |
| G5 | Quantity precision is a property of `UnitOfMeasure` (`DOMAIN_MODEL.md` D9), validated at write. |
| G6 | Formatting is a `Locale` concern and is never stored (`DOMAIN_MODEL.md` D8). Digit system, separator and grouping resolve at render. |
| G7 | A money value on an issued document is a historical fact and never recomputes (`DOMAIN_MODEL.md` D4). |
| G8 | Every calculation states its `Invariant` / `Policy` split. Policy is exposed by `Settings`; invariant is not configurable. |

---

## 3. WE-1 — the canonical worked example

One invoice threads through most rows below. Tenant base currency 2 dp, tax **on**,
**exclusive**, single rate 14%, invoice-level discount 10%.

**Lines as entered**

| # | Qty | Unit price | Gross |
|---|---|---|---|
| L1 | 3 | 45.50 | 136.50 |
| L2 | 7 | 12.25 | 85.75 |
| L3 | 1 | 99.99 | 99.99 |

```
subtotal        = 136.50 + 85.75 + 99.99            = 322.24
discountTotal   = round(322.24 × 10 / 100)          =  32.22
```

**Allocation (CS-08 + CS-09)**

| # | Raw share | Floored | Final | netValue |
|---|---|---|---|---|
| L1 | 13.648305… | 13.64 | **13.65** | 122.85 |
| L2 | 8.573935… | 8.57 | 8.57 | 77.18 |
| L3 | 9.997758… | 9.99 | **10.00** | 89.99 |
| | | **32.20** | **32.22** | **290.02** |

Floors sum to 32.20; two minor units remain; largest-remainder assigns them to L3
(.9977) and L1 (.9483). `Σ netValue = 290.02 = subtotal − discountTotal`, exactly.

**Tax and total**

| # | netValue | tax @14% |
|---|---|---|
| L1 | 122.85 | 17.20 |
| L2 | 77.18 | 10.81 |
| L3 | 89.99 | 12.60 |
| | **290.02** | **40.61** |

```
Invoice.total = 290.02 + 40.61 = 330.63
```

> **Cross-check.** L1 lands on subtotal 136.50, discount 13.65, taxable 122.85,
> tax 17.20 — line for line the worked example already written into
> `B2S_PREPARE_PHASE.md` §Step 11. The allocation rule reproduces the number you
> had already reasoned to by hand, on a line where the naive proportional split
> would have produced 13.64.

**A return: 2 of L1's 3 units, disposition `restock`**

```
returnedValue = round(122.85 × 2 / 3)   =  81.90        (CS-10)
taxReversed   = round( 17.20 × 2 / 3)   =  11.47        (CS-11)
CreditNote    =  81.90 + 11.47          =  93.37
```

Legacy would have valued that return at **91.00** — list price, `3 → 2` of 136.50 —
overstating the credit by **9.10 on one line of one invoice.** That is CF-70,
in numbers.

**A partial payment of 200.00**

```
outstanding = 330.63 − 200.00 − 93.37 = 37.26
```

---

## 4. The Release 1 rows — 25

### R1-01 — `InvoiceLine` gross

```
Legacy source: EXTRACT_INVOICE_PRO.md §2.2 (C1)
Invariant:  quantity × unit price
Policy:     none
Inputs:     InvoiceLine.quantity, InvoiceLine.unitPrice
Expected:   3 × 45.50 = 136.50
Rounding:   half-up to currency precision, after multiplication
Edge:       qty 0 → 0.00 and the line is still valid. Negative qty → rejected;
            a negative line is a Return, not an Invoice.
```

### R1-02 — `Invoice` subtotal

```
Legacy source: EXTRACT_INVOICE_PRO.md §2.3 (C2)
Invariant:  Σ InvoiceLine gross
Policy:     none
Expected:   136.50 + 85.75 + 99.99 = 322.24
Rounding:   inputs already rounded; the sum introduces none
Edge:       an Invoice with zero lines cannot be issued.
```

### R1-03 — Invoice-level discount total

```
Legacy source: EXTRACT_INVOICE_PRO.md §2.4 (C3)
Invariant:  a discount reduces what the buyer owes
Policy:     percent vs absolute; whether a per-Buyer default exists (R2);
            whether a reason is required
Inputs:     Invoice.discountPercent (0–100), subtotal
Expected:   round(322.24 × 10 / 100) = 32.22
Rounding:   half-up, immediately
Edge:       0 → 32.22 becomes 0.00 and R1-04 is skipped. >100 rejected.
            Absolute discount exceeding subtotal rejected.
```

### R1-04 — Discount allocation to `InvoiceLine` ★

```
Legacy source: NONE — the concept does not exist in either tool
Invariant:  the parts sum to the whole
Policy:     the basis (CS-08) and the remainder rule (CS-09)
Inputs:     discountTotal, each line's gross
Method:     rawShare_i   = discountTotal × gross_i / subtotal
            floor_i      = truncate(rawShare_i) to currency precision
            remainder    = discountTotal − Σ floor_i, in minor units
            assign one minor unit each to the lines with the largest
            fractional part; tie-break higher gross, then lower ordinal
Expected:   13.65 · 8.57 · 10.00, summing to 32.22
Remainder:  two minor units, to L3 (.9977) then L1 (.9483)
Edge:       one line → it takes the whole discount. A zero-gross line receives
            a zero share and is skipped by the tie-break.
```

**This is the highest-consequence row in the document.** Every return valuation,
every net-revenue figure and every credit note depends on the per-line net it
produces.

### R1-05 — `InvoiceLine.netValue`, stored at issue

```
Legacy source: NONE — DOMAIN_MODEL.md D4 + D13
Invariant:  an issued document's money is a historical fact
Policy:     none
Expected:   gross_i − allocatedShare_i → 122.85 · 77.18 · 89.99
Rounding:   none; both inputs are already at stored precision
Edge:       written once, at issue. A later price change never restates it.
            This is what forecloses CF-47's retroactive restatement of closed months.
```

### R1-06 — Tax per `InvoiceLine`, exclusive

```
Legacy source: NONE — zero occurrences of tax / VAT / ضريبة in either tool
Invariant:  tax is a rate applied to a base
Policy:     the rate; the base (CS-05); the scope (CS-04)
Expected:   round(122.85 × 0.14) = 17.20
Rounding:   half-up, per line
Edge:       rate 0 → 0.00. Tax toggled off (OD-C10) → the field is absent, not zero.
```

### R1-07 — Tax per `InvoiceLine`, inclusive

```
Legacy source: NONE
Invariant:  an inclusive price already contains its tax
Policy:     the rate; whether the tenant prices inclusive at all (CS-06)
Method:     net = round(grossInclusive / (1 + rate))
            tax = grossInclusive − net        ← subtraction, never a second round
Expected:   114.00 → net 100.00, tax 14.00
Rounding:   half-up on the net; the tax is the exact residual
Edge:       deriving the tax by a second rounding instead of subtraction is how
            an inclusive invoice fails to add up. It is forbidden here.
```

### R1-08 — `Invoice` tax total

```
Legacy source: NONE
Invariant:  Σ line tax
Policy:     none
Expected:   17.20 + 10.81 + 12.60 = 40.61
Edge:       mixed rates across lines are summed, never averaged.
```

### R1-09 — `Invoice` grand total

```
Legacy source: EXTRACT_INVOICE_PRO.md §2.5 (C4)
Invariant:  net plus tax
Policy:     none
Expected:   290.02 + 40.61 = 330.63
Assertion:  Invoice.total − Invoice.taxTotal == Σ InvoiceLine.netValue, exactly
```

### R1-10 — `Invoice` number allocation

```
Legacy source: EXTRACT_INVOICE_PRO.md §2.12–§2.14 — three disagreeing implementations
Invariant:  a number identifies exactly one issued Invoice
Policy:     format, padding, prefix, and whether gaps are permitted (CS-14)
Method:     next = max(sequence for this Tenant + BrandLine) + 1, allocated
            atomically at issue
Expected:   scoped per Tenant then BrandLine (OD-C11, TENANCY_MODEL.md §4);
            never global; never reused
Edge:       a cancelled Invoice keeps its number and is corrected by CreditNote,
            never by reissue. A draft SalesOrder consumes no number.
```

### R1-11 — `Payment` applied

```
Legacy source: NONE — EXTRACT_INVOICE_PRO.md §5.2–§5.4 (CF-62). What exists is a
               map keyed by invoice id holding one string field compared === 'paid'
Invariant:  money received reduces what is owed
Policy:     whether a Payment may span several Invoices (R2); PaymentMethod set
Inputs:     Payment.amount, Payment.method (cash | card | other), Payment.date,
            optional Receipt
Expected:   200.00 against Invoice 330.63
Rounding:   none — an amount is entered at stored precision
Edge:       zero or negative rejected. A refund is a CreditNote, never a negative
            Payment.
```

### R1-12 — Outstanding balance

```
Legacy source: NONE — OD-C16
Invariant:  Outstanding = Invoice.total − Σ Payments − Σ CreditNotes
Policy:     none — this identity is signed
Expected:   330.63 − 200.00 − 93.37 = 37.26
Rounding:   none; all three inputs are at stored precision
Edge:       computed, never stored. There is no "balance" field to drift.
```

### R1-13 — Overpayment

```
Legacy source: NONE — recorded ABSENT at EXTRACT_INVOICE_PRO.md §5.4
Invariant:  money received in excess of what is owed is still owed back
Policy:     accept, reject, or clamp (CS-13)
Expected:   pay 250.00 → outstanding −12.74, read as credit on account
Edge:       never clamped to zero. The legacy Math.max(0, …) at :2454 made
            over-return undetectable; the same clamp here would make
            overpayment undetectable.
```

### R1-14 — `Payment` state

```
Legacy source: NONE — the legacy value is binary paid | pending, and absence is
               indistinguishable from unpaid (§5.3)
Invariant:  a state derived from outstanding, never stored
Policy:     none in R1
Expected:   outstanding == total          → unpaid
            0 < outstanding < total       → partial
            outstanding == 0              → paid
            outstanding < 0               → overpaid
Edge:       "underpaid" in OD-C12 is `partial` once the buyer has stopped paying;
            it is a business reading of `partial`, not a fifth computed state.
```

### R1-15 — `ReturnLine` value ★

```
Legacy source: EXTRACT_INVOICE_PRO.md §2.6 (C5) - expression recorded,
               basis rejected by CS-10
Invariant:  a return credits what the buyer was charged
Policy:     the basis (CS-10) and the residual rule (CS-11)
Method:     if this tranche exhausts the line:
                returnedValue = InvoiceLine.netValue − Σ already returned
            else:
                returnedValue = round(netValue × returnedQty / invoicedQty)
Expected:   round(122.85 × 2 / 3) = 81.90
Edge:       returned quantity exceeding invoiced quantity is rejected, not clamped.
            DOMAIN_MODEL.md D2: writeOffValue is always present, zero for restock.
```

### R1-16 — `ReturnLine` tax reversal

```
Legacy source: NONE
Invariant:  tax charged on goods that came back is not owed
Policy:     the tranche and residual rule (CS-11)
Method:     same tranche/residual rule as R1-15, applied to InvoiceLine.taxValue
Expected:   round(17.20 × 2 / 3) = 11.47
Edge:       a fully returned line reverses exactly its taxValue, by residual.
```

### R1-17 — `CreditNote` value

```
Legacy source: NONE — no credit note, no refund record exists (§5.4)
Invariant:  the money effect of a Return
Policy:     none
Expected:   81.90 + 11.47 = 93.37
Edge:       immutable once issued (DOMAIN_MODEL.md §3.5). A correction is a
            further CreditNote, never an edit.
```

### R1-18 — Full-return test

```
Legacy source: EXTRACT_INVOICE_PRO.md §2.8 (C7)
Invariant:  every invoiced unit on every line has come back
Policy:     none
Expected:   Σ returnedQty per line == invoicedQty, for every line
Edge:       under R1-15's residual rule the arithmetic already produces
            Σ returnedValue == Σ netValue == 290.02, so net revenue lands on
            0.00 with no special case. The legacy hard-zero branch at :2453
            existed only to paper over a valuation basis that could not reach
            zero on its own. It is not reproduced.
```

### R1-19 — Net revenue after returns

```
Legacy source: EXTRACT_INVOICE_PRO.md §2.9 (C8) — "the most consequential
               expression in the file"
Invariant:  revenue is what was sold less what came back
Policy:     tax-exclusive basis; recognition in the month of the Return (CS-15)
Expected:   290.02 − 81.90 = 208.12
Rounding:   none; inputs are at stored precision
Edge:       never clamped at zero. If returns exceed sales in a period the figure
            is negative and that is information, not an error.
```

### R1-20 — `StockMovement` on sale

```
Legacy source: EXTRACT_STOCK_COSTS.md §2.17
Invariant:  goods leaving reduce the level
Policy:     none
Method:     written by Shipment, never by Invoice (DOMAIN_MODEL.md §5.3, OD-E12).
            OD-C18: R1 auto-creates one Shipment per Invoice.
Expected:   3 units sold → StockMovement(sale, −3)
Edge:       negative resulting level is permitted and flagged, never blocked —
            blocking it hides a counting error instead of surfacing it.
```

### R1-21 — `StockMovement` on `return_restock`

```
Legacy source: EXTRACT_STOCK_COSTS.md §2.10
Invariant:  goods coming back and fit to sell increase the level
Policy:     none
Expected:   2 units restocked → StockMovement(return_restock, +2)
Edge:       written at Return acceptance, not at CreditNote issue.
```

### R1-22 — `StockMovement` on write-off

```
Legacy source: EXTRACT_STOCK_COSTS.md §2.10 — legacy calls this disposition
               `expired` while labelling it تالف (damaged); GLOSSARY.md §4.6
Invariant:  goods that came back but cannot be sold are not sellable stock
Policy:     the movement shape (CS-12)
Expected:   1 unit written off → StockMovement(return_restock, +1)
                              then StockMovement(adjustment, −1, reason writeOff)
Edge:       net effect on StockLevel is zero, and both physical facts survive.
            The reason for the write-off is a separate field, never the
            disposition value itself.
```

### R1-23 — `StockLevel` derivation

```
Legacy source: EXTRACT_STOCK_COSTS.md §2.17, §1.3.3 — legacy modelled stock
               three times and in disagreement
Invariant:  StockLevel = Σ StockMovement, grouped by (variant|component,
            location, batch)
Policy:     none — this is signed (DOMAIN_MODEL.md §5.2)
Expected:   opening 50 · sale −3 · restock +2 · restock +1 · writeOff −1  →  49
Edge:       one write path. No document writes StockLevel. A correction is a new
            opposing StockMovement, never an edit (DOMAIN_MODEL.md §6).
```

### R1-24 — Quantity precision and validation

```
Legacy source: EXTRACT_STOCK_COSTS.md Part 2 preamble — roundQty at 6 dp with an
               integer snap within 1e-6, applied inconsistently across entities
Invariant:  a quantity is expressed in a unit
Policy:     the decimal places each UnitOfMeasure declares
Seed defaults:      countable units 0 · weight and volume 3 · length 2
            (tenant-overridable per UnitOfMeasure — no signature needed)
Expected:   2.4567 kg on a 3-dp unit → 2.457
            3.4 pieces on a 0-dp unit → REJECTED at write, not rounded
Rounding:   half-up to the unit's declared precision, at write (D9)
Edge:       rejecting a fractional count is deliberate. Silently rounding 3.4
            pieces to 3 loses stock without a record.
```

### R1-25 — Money rendering per `Locale`

```
Legacy source: EXTRACT_STOCK_COSTS.md §1.3.8 — money formatting modelled twice,
               Western digits hardcoded at :1631
Invariant:  a stored value has one canonical numeric form
Policy:     digit system, decimal separator, grouping, symbol position — all
            resolved from Locale at render (DOMAIN_MODEL.md D8)
Expected:   330.63 → "330.63 EGP" (en) · "٣٣٠٫٦٣ ج.م" (ar), same stored value
Edge:       a formatted string never enters storage, never enters a comparison,
            and never enters an identifier.
```

★ = the two rows where the choice changes every downstream figure.

---

## 5. Identities that must hold

Assertable, on every issued `Invoice`, to the stored precision, zero tolerance.

| # | Identity |
|---|---|
| I1 | `Σ InvoiceLine.grossValue == Invoice.subtotal` |
| I2 | `Σ InvoiceLine.allocatedDiscount == Invoice.discountTotal` |
| I3 | `Σ InvoiceLine.netValue == Invoice.subtotal − Invoice.discountTotal` |
| I4 | `Σ InvoiceLine.taxValue == Invoice.taxTotal` |
| I5 | `Invoice.total == Σ InvoiceLine.netValue + Invoice.taxTotal` |
| I6 | `Outstanding == Invoice.total − Σ Payments − Σ CreditNotes` |
| I7 | A fully returned line credits exactly `netValue + taxValue` |
| I8 | `StockLevel == Σ StockMovement` for every (variant, location, batch) |

I3 and I5 are what `DOMAIN_MODEL.md` D13 was written to make true. I7 is what
CS-11's residual rule was written to make true. Any of the eight failing is a
hard gate failure, not a tolerance question.

---

## 6. Deferred to Release 2

Real rows, whose modules are not in R1. Each lands as a signed amendment one step
ahead of its module, per the just-in-time rule.

| Row | Source | Note |
|---|---|---|
| `Component` cost within a `Recipe` | STOCK_COSTS §2.1 | |
| `Recipe` yield cost and COGS per unit | §2.2 | |
| `Component` cost update on purchase | §2.4 | **CF-47** — legacy overwrites unconditionally, restating closed months. A costing method must be chosen. |
| `PurchaseOrderLine` total, `GoodsReceipt` effect | §2.5, §2.17 | |
| Production requirement plan | §2.3 | |
| `Component` usage | §2.16 | Legacy derives it two incompatible ways |
| Margin percentage | §2.15 | |
| Monthly profit | §2.13 | |
| Gross / net / cash profit | §2.14 | |
| `StockLevel` valuation, raw and finished | §2.18, §2.20 | Legacy computes it twice with different clamping |
| Reorder threshold | §2.21 | The ×0.5 critical multiplier is hardcoded policy in legacy |
| `OperatingCost` allocation | §2.22 | Legacy does not allocate at all — the method is a tenant selector |
| `ExchangeRate` conversion | OD-C9 | |
| `UnitConversion` factors | OD-C8 | |

---

## 7. What has no legacy source at all

Recorded plainly, because a future reader will otherwise assume these were ported.

| Concept | Evidence |
|---|---|
| **Tax** | Zero occurrences of `tax`, `VAT`, `ضريبة` across 7,083 + 4,283 lines. `EXTRACT_STOCK_COSTS.md` §2.6, `EXTRACT_INVOICE_PRO.md` §2.23. **CF-45.** |
| **Freight** | Zero occurrences of `shipping`, `شحن`. §2.6. |
| **Money rounding** | No calculation rounds its result anywhere. `roundQty` exists at 6 dp with an integer snap and is *explicitly never applied to a money value*. Rounding happened only at the display boundary. Part 2 preamble, `:1631`, `:1633-1640`. |
| **Payments** | A map keyed by invoice id holding one string field. No amount, method, date, reference or receipt. Absence indistinguishable from unpaid. §5.2–§5.4. **CF-62.** |
| **Discount meeting tax** | Never met, because tax did not exist. The step sequence has no legacy answer. §2.4. |
| **Per-row net value** | Never stored. This is why returns valued at list price against a discounted total, and why every historical net-revenue figure is overstated. §2.9. **CF-70.** |

---

*Tier 2, precedence slot 4. Read with `DOMAIN_MODEL.md` and `GLOSSARY.md`.*
