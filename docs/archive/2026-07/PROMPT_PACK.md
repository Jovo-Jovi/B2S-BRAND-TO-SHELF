> **ARCHIVED 2026-07-30.** Written for a port that is no longer the project.
> Retained for history. Not authoritative. Do not cite as current truth.

# PROMPT PACK

> Copy-paste prompts, in execution order. `[BUILDER]` runs in Antigravity/Cursor. `[REVIEWER]` runs in the Claude Project.
>
> Every builder session opens with the session opener. No exceptions.

---

## Session opener `[BUILDER]` — every window, every time

```
Read SESSION_CONTEXT.md and AGENTS.md, then execute T0n.
Do not begin until you have restated: the current phase, the active
carry-forwards, and this task's model class. If the model I selected
does not match the task's class, stop and tell me.
```

---

# § B — Delta audit (Stage B)

> **Which prompt to use.** `P-DELTA-00` is file-agnostic — run it whenever any legacy file changes after the audit. `P-DELTA-01` is the returns-specific deep dive for `bb-stock-costs.html` + `balance-bites-invoice-pro.html`. If returns are involved, run **both**: P-DELTA-00 for breadth, P-DELTA-01 for the returns math.

## P-DELTA-00 `[BUILDER]` · Opus · read-only · **re-runnable**

```
ROLE: Senior software auditor. READ-ONLY. Do not modify, create, or delete any
file except the report file named at the end.

CONTEXT: docs/REPORT.md audited six single-file HTML tools. Since that audit,
the files listed below were changed by the owner. The audit is therefore stale
on them. Everything else in REPORT.md remains authoritative.

CHANGED FILES (audit these completely, in chunks if needed — no sampling):
  1. <filename>
  2. <filename>
  ...

OWNER'S DESCRIPTION OF THE CHANGES (a claim to verify, NOT truth — the code
wins wherever they disagree):
  <paste your own notes here, or write "none provided">

TASK — for each changed file:

A. CHANGE MAGNITUDE. Estimate what fraction of the file differs from what
   REPORT.md §2.<n> describes. If it exceeds roughly 40%, say so explicitly and
   recommend a full re-audit of that file instead of a delta — a delta audit is
   the wrong instrument past that point.

B. SECTION-BY-SECTION DIFF. For every subsection of that file's REPORT.md entry
   (A purpose · B features · C data model · D persistence · E hardcoded values ·
   F print · G bilingual/RTL · H bugs · I dependencies · J security), state
   STILL-ACCURATE / CHANGED / NEW, with file:line for every change.

C. DATA MODEL DELTA. Any entity added, removed, or reshaped. Any new field on an
   existing entity. Any new localStorage key, IndexedDB store, or JSON file.
   Any change to what is stored vs derived. Give the exact current shape.

D. CALCULATION DELTA. Any formula added or changed — quote the exact
   expression, its inputs, and its rounding behaviour, with file:line. This
   section is the highest-value part of the audit: a changed formula that goes
   unrecorded becomes a silent parity failure later.

E. PRINT DELTA. Any change to @page rules, page sizes, margins, real-unit
   dimensions, or the print DOM. State old value → new value.

F. HARDCODED VALUES DELTA. Extend the REPORT §2E registry format for anything
   new: value · proposed BrandConfig key · wizard input type · file:line.
   Include Arabic literals, list defaults, colours, labels, dimensions. This
   table is the onboarding wizard's field list — a miss here becomes a value
   that cannot be white-labelled.

G. BACKWARD COMPATIBILITY. If a data shape changed, document how the code
   handles records saved under the OLD shape. Name any path that can throw,
   silently drop a field, or double-count.

H. CROSS-FILE IMPACT. Invoice Pro and Stock & Costs are coupled through shared
   bb_*.json keys and the bb_filestore_v1 IndexedDB handle. State whether this
   change alters anything the other tool reads or writes. If it does, that other
   file must be re-audited too — say so.

I. NEW BUGS. Severity-ranked with file:line. Check specifically for: unescaped
   innerHTML in new renderers, swallowed catch blocks, floating-point drift in
   new math, paths producing negative or double-counted quantities, and
   duplicate element IDs.

J. PARITY IMPACT. List every parity test id in PARITY_MATRIX.md that this change
   invalidates or newly requires. If PARITY_MATRIX.md does not exist yet, list
   the behaviours that will need parity tests.

OUTPUT — create exactly one file:
  docs/DELTA_REPORT_<NN>.md   (increment NN for each delta audit; never
                               overwrite a previous one — deltas are
                               append-only history)

RULES: Read every changed file completely. Cite file:line for every claim.
Quote Arabic verbatim. Do not propose fixes; this is analysis only. If the
owner's description claims something the code does not do, say so explicitly.
```

## P-DELTA-01 `[BUILDER]` · Opus · read-only

```
ROLE: Senior software auditor. READ-ONLY. Do not modify, create, or delete any
file except the two report files named at the end.

CONTEXT: docs/REPORT.md and docs/UNIFICATION.md audited six single-file HTML
tools. Since that audit, a returns workflow was added to TWO files. The audit is
therefore stale on them. RETURNS_ADDENDUM.md contains the owner's own notes on
what was added; treat it as a claim to verify against the code, not as truth.

SCOPE — read these two files completely, in chunks if needed. No sampling:
  1. bb-stock-costs.html
  2. balance-bites-invoice-pro.html

TASK:
A. DIFF vs the audit. For every section of REPORT.md §2.1 and §2.3, state
   STILL-ACCURATE / CHANGED / NEW, with file:line for each change.

B. RETURNS DATA MODEL. Document the exact current stored shape of:
   - Return (all fields, including per-line items with qty/price and
     expired/restock disposition)
   - outAllocations (shape, when written, which flow produces it)
   - Invoice status/grouping (pending, paid, partial-return, full-return):
     is this stored or derived? Cite the code.
   - Any new localStorage keys or JSON files (bb_returns.json and others)

C. RETURNS CALCULATION SURFACE. Find and quote, with file:line, every formula
   that returns now affect:
   - net revenue / sales aggregation
   - COGS
   - product summary
   - ingredient usage
   - monthly profit
   - stock value (restock re-entry vs expired write-off)
   - the sales print report (partial = net, full = struck through)
   For each: the exact expression, its inputs, and its rounding behaviour.

D. RETURN CALCULATOR. Document the full algorithm: customer/invoice selection,
   adding other customers' invoices one at a time, تحديد الكل line selection,
   the متبقي = مرتجع − مسلّم computation, the expired/restock split, and how
   سعر تالف / إجمالي تالف are derived. State every edge case the code handles
   and every one it does not.

E. INVOICE PRO RETURNS DISPLAY. Document the status banner, the Return Details
   section, the per-item chips (📤 sold-to · 🗑 تالف · 📦 مخزون), the
   returned/net totals box, and returns awareness in invoice history, customer
   history, customer list print, and the reports dashboard.

F. BACKWARD COMPATIBILITY. Returns logged before the calculator lack
   outAllocations. Document exactly how the code handles both shapes, and
   whether any path can throw on the older shape.

G. NEW HARDCODED VALUES. Extend the REPORT §2E registry format (value ·
   proposed BrandConfig key · wizard input type · file:line) for anything the
   returns work introduced — Arabic literals, reason lists, colours, labels.

H. NEW BUGS. Severity-ranked, with file:line. Check specifically for:
   unescaped innerHTML in the new renderers, swallowed catch blocks, floating
   point drift in the split math, and any path that can produce a negative or
   double-counted quantity.

OUTPUT — create exactly two files, and nothing else:
  docs/DELTA_REPORT.md   — everything above, every claim citing file:line
  docs/DELTA_SCHEMA.md   — the corrected canonical Return / ReturnAllocation /
                           Invoice shapes, as a proposed replacement for
                           UNIFICATION.md §3

RULES: Read both files completely. Cite file:line for every claim. Quote Arabic
verbatim. If RETURNS_ADDENDUM.md claims something the code does not do, say so
explicitly — the code wins. Do not propose fixes; this is analysis only.
```

## P-DELTA-02 `[BUILDER]` · Opus · reconciliation

```
Read every docs/DELTA_REPORT_*.md not yet reconciled, plus docs/DELTA_SCHEMA.md
if it exists, then reconcile the audit.

Update in place:
  - docs/REPORT.md §2.1 and §2.3 — replace stale content, keep the existing
    format and citation style
  - docs/REPORT.md §4 — add any new bugs to the consolidated severity table
  - docs/inventory.json — entities, storage keys, hardcoded values, bugs
  - docs/UNIFICATION.md §3 — replace the canonical Return entity; update
    Invoice if status/grouping changed
  - docs/UNIFICATION.md §8 — add any new open question as a numbered item

Add a changelog block at the top of REPORT.md stating what changed, when, and
why. Do not touch any .html file. Do not restructure documents that did not
change.
```

## P-DELTA-03 `[REVIEWER]` · verdict

```
Here is DELTA_REPORT.md, DELTA_SCHEMA.md, and the reconciliation diff. [paste]

Verify against BB_DEV_OS.md. Specifically check:
  - Is every returns-affected calculation named, with its formula and file:line?
  - Is the Return/ReturnAllocation/Invoice schema complete enough to build on?
  - Are both return shapes (with and without outAllocations) handled?
  - Did the reconciliation actually update inventory.json, not just the prose?
  - Does anything here contradict a claim in the original audit that we should
    now distrust more broadly?

Issue a VERDICT in the standard format. If PASS, emit the T00.1 prompt.
If FAIL, emit the FIX prompt.
```

---

# § C — Document pipeline (Stage C)

> Each prompt is `[REVIEWER]`-authored, then committed to the repo by a `[BUILDER]` land task. Run them in order; each consumes the previous.

## C1 — Scope + Decisions

```
Author SCOPE.md and DECISIONS.md.

SCOPE.md: vision; actors (brand owner, staff, print shop); the six modules with
their included features traced to PARITY_MATRIX ids; explicit exclusions
(name what we are NOT building: multi-user auth, cloud sync, e-commerce,
mobile apps, real-time collaboration); and the open-decisions section.

DECISIONS.md: OD-1 through OD-12 exactly as listed in PHASE_PLAN.md §P00, each
with: the question, the options with consequences, my recommendation with
reasoning, the blast radius (which docs/modules change per option), and a
signature line.

Base it on docs/REPORT.md, docs/UNIFICATION.md, docs/DELTA_REPORT.md.
Anything not traceable to those is out of scope by definition — flag it rather
than including it.
```

## C2 — Parity matrix

```
Author PARITY_MATRIX.md.

One row per feature across all six legacy tools, from REPORT.md §2B and the
delta report. Columns:
  ID | Feature | Source tool + file:line | Decision (KEEP / MERGE / DROP /
  DEFER) | Target module | Parity test id | Tolerance class (money / quantity /
  print-mm / visual) | Notes

Rules:
  - DROP requires a one-line justification and becomes an OD amendment if it
    removes user-visible behaviour.
  - MERGE rows must name what wins where the two sources conflict (especially
    the two label tools).
  - Every KEEP and MERGE row must have a parity test id. No exceptions.

End with counts per decision and per module, and a list of every row whose
tolerance class is "money" — that set is the highest-risk surface in the build.
```

## C3 — Data model

```
Author DATA_MODEL.md from UNIFICATION.md §3 as amended by DELTA_SCHEMA.md and
the signed OD-7, OD-10, OD-11, OD-12.

Include: every canonical entity with full field list and types; the
entity-counting methodology (frozen, per OD-10); relationships; the DataStore
interface; the storage contract (what is stored where, what is derived vs
persisted, migration/versioning strategy); and a mapping table from every
legacy localStorage key to its canonical destination.

Call out explicitly: which returns values are stored and which are derived.
The audit found the legacy tools disagreeing on this class of question across
five different "preset" shapes — do not repeat it.
```

## C4 — Brand config

```
Author BRAND_CONFIG.md from UNIFICATION.md §2, extended with anything the
delta audit added to the hardcoded-values registry.

Include: the full BrandConfig JSON schema with types and defaults; the zod
schema; the seven wizard steps with field types and validation; the theming
mechanism (CSS custom properties, the exact variable names); logo storage
strategy; multi-profile storage + switching + export/import with schemaVersion;
validation rules including WCAG contrast thresholds; and presets/balance-bites.json
in full.

Every key must trace to at least one file:line in the audit registries. A key
with no legacy source is new scope — flag it for an OD.
```

## C5 — Architecture + ADRs

```
Author ARCHITECTURE.md and ADRs/ADR-001..008.

ARCHITECTURE.md: stack, an explicit "NOT used" list, request/data flow, folder
tree where feature folders map 1:1 to MODULE_SPEC areas, and the build/deploy
pipeline.

ADRs (append-only format, one file each):
  ADR-001 Vite + React + TS static SPA, not Next.js — with the rejected options
  ADR-002 DataStore abstraction with IndexedDB adapter; File System Access
          retired
  ADR-003 Dual-DOM real-unit print engine as the only print mechanism
  ADR-004 BrandConfig + CSS custom properties as the single styling source
  ADR-005 zod validation scope
  ADR-006 Model classes: heavyweight vs standard
  ADR-007 No runtime CDN; everything bundled
  ADR-008 The two label tools merge into one module with format templates
```

## C6 — Print contract

```
Author PRINT_CONTRACT.md — this project's most load-bearing technical document.

Include: the single px↔mm constant and helper; the dual-DOM pattern with a
worked example; a per-output table (page size, orientation, margins, units,
source file:line) covering invoice, reports, price list, label exact-cm,
label wrap-set panels, carton A3 landscape, stand actual/A3/A2; the tolerance
table from BB_DEV_OS.md §3; the physical verification procedure (print,
measure with a steel rule, photograph, attach as gate artifact); and the
containment rule that no module may implement its own print path.

Flag OD-5 (print calibration authority) as unresolved if it is still unsigned —
the tolerance numbers are provisional until it is.
```

## C7 — Module spec

```
Author MODULE_SPEC.md.

Per module (Invoicing, Inventory/COGS/Returns, Reports, Label, Carton, Stand,
Wizard, Shell): route, purpose, components used, data requirements (which
entities, read or write), all states (loading, empty, error, populated),
print outputs, and the parity test ids it must satisfy.

This is the ground truth when building a screen. If a builder asks "what should
this do?", the answer must already be here.
```

## C8 — Master prompt + rules

```
Author MASTER_PROMPT.md — the pointers wired into every builder session:
product truth (SCOPE, PARITY_MATRIX, MODULE_SPEC), technical truth
(DATA_MODEL, ARCHITECTURE, ADRs, PRINT_CONTRACT), brand truth (BRAND_CONFIG),
code standards, the model-class convention, and the stop-and-flag conditions.

Then emit both rules files ready to commit:
  AGENTS.md                    (repo root, Antigravity)
  .cursor/rules/bb-devos.mdc   (Cursor)
Both must carry identical rules; only the format and activation syntax differ.
```

---

# § T — The task loop

## Task prompt template `[REVIEWER]` emits

```
## T0n — <task name>
- Phase: <Pnn> · Model class: <heavyweight | standard>
- Read first: <docs by name and section>
- Prompt (canonical):
  <what to build, citing authoritative doc sections by name.
   Explicit STOP-and-flag conditions for anything outside this task's class —
   especially: schema changes, BrandConfig changes, print engine changes,
   new dependencies.>
- Done when:
  <verifiable criteria: commands that must pass, states that must hold,
   parity test ids that must be green>
- Tests: <layer + parity ids>
- Do NOT: <the specific out-of-scope temptations for this task>
- On completion: update SESSION_CONTEXT.md and append to DEVELOPMENT_JOURNAL.md,
  then report back with: what shipped, what deviated from the canonical prompt
  and why, and any carry-forwards discovered.
```

## Task report template `[BUILDER]` returns

```
## T0n — AS-BUILT
- Files touched: <list>
- Deviations from canonical prompt: <what and why, or "none">
- Done-when status: <criterion → met/not met + evidence>
- Tests: <run + results>
- Parity: <test ids + diffs, or N/A>
- Carry-forwards discovered: <named items>
- SESSION_CONTEXT + journal updated: <yes/no>
```

---

# § G — Gates

## Exit verification `[BUILDER]` · Opus · read-only

```
Read SESSION_CONTEXT.md, then execute T-exit for Phase <Pnn>. READ-ONLY.

Verify every line of the phase Definition of Done and every parity test id in
PARITY_MATRIX.md scoped to this phase — against the committed tree AND the
running build. Do not trust prior task reports; re-verify independently.

For print criteria: state what must be physically measured and by whom. Do not
mark a print criterion PASS on screen evidence alone.

Output a PASS/FAIL ledger, one line per criterion, with evidence. Classify
anything not PASS as:
  HARD FAILURE (blocks sign-off) | DOC CORRECTION | CARRY-FORWARD (name owner)

Attack the build. Your job is to find what is wrong, not to confirm what is
right. Make no changes.
```

## Parity ledger `[BUILDER]` · Opus · read-only

```
Run the parity harness for Phase <Pnn> against test/fixtures/golden/.

For every parity test id scoped to this phase, output:
  id | legacy value | new value | delta | tolerance class | PASS/FAIL

Money and quantity: exact match required, zero drift.
Print: report computed dimensions; flag which need physical measurement.

Include at minimum these returns cases if in scope: a partial return, a full
return, a calculator-logged return with outAllocations, and a legacy return
without outAllocations.

Any FAIL blocks phase sign-off. Make no changes; report only.
```

## Phase sign-off `[REVIEWER]`

```
Here is the exit ledger and parity ledger for Phase <Pnn>. [paste]

Verify both against PHASE_PLAN.md's definition of done for this phase. Then:
  - Issue a VERDICT in the standard format
  - If PASS: list the carry-forwards to copy into Phase <Pnn+1>'s entry
    checklist, give me the SESSION_CONTEXT.md update text, and emit the first
    task prompt of the next phase
  - If FAIL: name the FIX task, emit its prompt, and state that the exit
    verification must be re-run in full afterward — not spot-checked
```

## FIX task `[REVIEWER]` emits

```
## T<nn>-FIX — <name of the issue it closes>
- Phase: <Pnn> · Model class: <heavyweight for anything money/print/schema>
- Closes: <ledger line that hard-failed>
- Prompt (canonical): <the narrowest possible change that closes it>
- Done when: <the failed criterion, restated verbatim>
- Do NOT: fix anything else, refactor, or improve adjacent code. Scope creep in
  a FIX task invalidates the re-run.
- After this: T-exit is re-run IN FULL.
```

---

# § X — Utility prompts

## When the reviewer and the repo disagree `[REVIEWER]`

```
The repo says <X>. You said <Y>. The repo wins.
Update your understanding, state what else in your model this invalidates,
and tell me whether any signed document now needs a correction.
```

## Mid-project scope change (the OD-7 pattern) `[REVIEWER]`

```
I want to add <feature>. Treat this as a scope amendment, not a request.

Produce: a numbered OD with explicit scope authority and hard constraints
(what it may NOT touch); its own task track with ids; the gate it must pass;
the blast radius across signed documents; and a close-out template listing
where carry-forwards will land.

Do not begin any implementation prompt until I sign it.
```

## End-of-session close `[BUILDER]`

```
Update SESSION_CONTEXT.md (running state, active carry-forwards, environment
quirks learned this session, next action) and append one line to
DEVELOPMENT_JOURNAL.md in the format:
Date | Model | Phase/Task | Files | Issues | Next

Then show me both diffs. Change nothing else.
```
