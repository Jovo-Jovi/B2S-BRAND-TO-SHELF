> **REQUIREMENTS EVIDENCE.** Extracted from a retiring tool. Records what the
> tool did and what its owner expects. NOT a specification, NOT current truth,
> NOT a parity target. Where this conflicts with a frozen document in
> docs/product/, the frozen document wins.

# RETURNS ADDENDUM — owner's notes

> **Status: owner-authored claim, not verified truth.** This is the description of the returns workflow as the owner built it. The delta audit (`DELTA_RUN_01.md` Pass 2) must verify every statement here against the actual code. **Where this document and the code disagree, the code wins** — and the audit must say so explicitly.
>
> Arabic strings below are the owner's description of the UI. The audit must record the exact literals as they appear in source, with `file:line`.

---

## Stock & Costs (`bb-stock-costs.html`)

### Returns workflow

- **🔄 المرتجعات tab** — log returns linked to a specific invoice, with per-line **📦 مخزون / 🗑 تالف** disposition.

- **Return Calculator** — for complex returns:
  - Pick return customer + return invoice
  - Add other customers' invoices **one at a time** (delivered/sold elsewhere)
  - **تحديد الكل** per invoice for line selection
  - **متبقي = مرتجع − مسلّم** → split remainder into expired vs restock
  - **سعر تالف / إجمالي تالف** columns count expired items only
  - Log directly, or apply to the return modal

### Invoice list (📋 الفواتير)

Invoices split into three groups:
- Pending / Paid (no returns)
- **🔄 فواتير بها مرتجعات جزئية**
- **↩️ فواتير مرتجعة بالكامل**

Cards show net totals and return badges.

### Calculations & reports

Returns affect:
- Sales aggregation (net revenue after returns)
- COGS, product summary, ingredient usage
- Monthly profit
- Sales print report (partial = net, full return = struck through)

### Data saved

Returns stored in **`bb_returns.json`** (shared folder), including:
- Returned items (qty, price, expired/restock)
- **`outAllocations`** — qty sold/delivered to other customers + their invoice (produced by the calculator)

---

## Invoice Pro (`balance-bites-invoice-pro.html`)

### When loading a returned invoice on the template

1. **Status banner** — full vs partial return, amount, units, expired total
2. **↩️ Return Details section** — per return log: date, reason, items, disposition, amounts
3. **Per-item chips in 📦 تفاصيل الطلب** (under each product):
   - **📤 qty → customer · invoice** (sold/delivered elsewhere)
   - **🗑 تالف** — expired qty
   - **📦 مخزون** — restock qty
4. **Totals box** — **مرتجع · Returned** and **صافي بعد المرتجع · Net**

### Returns awareness elsewhere

- **🗂 Invoice history** — return badges, net / struck-through totals
- **👤 Customer history** — same return labels
- **👥 Customer list print** — pending invoices exclude full returns; optional invoice info columns
- **📊 Reports dashboard** — full returns excluded from sales KPIs; partial uses net amounts

### Sync

Both apps read **`bb_returns`** from the shared **saved data** folder — connect the folder in both apps and use **Ctrl+F5** after updates.

---

## Known compatibility note

**📤 sold-to customer chips only appear for returns logged via the Return Calculator after the latest update.** Older returns still show **تالف / مخزون** only.

> This is the single most important line in this document for the port. It means two `Return` shapes exist in live data. Both must render without throwing, and both must be covered by parity tests. Carried as **CF-04**.

---

## What the audit must establish beyond these notes

These notes describe behaviour. The audit must produce the contract:

1. The exact stored shape of `Return`, including per-line items and disposition
2. The exact shape of `outAllocations` — fields, when written, which flow produces it
3. Whether invoice grouping (pending / paid / partial-return / full-return) is **stored or derived**
4. The exact expression, inputs, and rounding behaviour for every affected calculation: net revenue, COGS, product summary, ingredient usage, monthly profit, stock value (restock re-entry vs expired write-off), sales print report
5. The full Return Calculator algorithm, including every edge case handled — and every one not handled
6. Every code path that reads a `Return` and could throw, silently drop a field, or double-count on the older shape
