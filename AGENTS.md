# AGENTS.md — B2S

> Antigravity variant. Place at repo root. Always-on for every agent in this workspace.
> The Cursor equivalent is `.cursor/rules/b2s-devos.mdc` — identical rules, different activation syntax. Keep both in sync; changing one without the other is a defect.

---

## 0. Session opener — mandatory

Before any work, read **both**:
- `SESSION_CONTEXT.md` — state, done steps, open carry-forward ids, next action
- `docs/method/PRECEDENTS.md` — binding procedural rulings and environment quirks

Restate: current phase, this task's model class, and any precedent that
governs it. If the selected model does not match the task's declared class,
**stop and say so**.

Open `docs/method/CARRY_FORWARDS.md` when your task names a carry-forward,
when you are landing or amending rows, or at a gate. It holds the full
ledger; `SESSION_CONTEXT.md` holds only the open ids.

`SESSION_CONTEXT.md`, `docs/method/PRECEDENTS.md` and committed code
**outrank your memory and outrank this conversation**. If they conflict
with anything you believe, the repo wins.

---

## 1. One task per window

Execute exactly **one task per fresh agent session**. Do not batch, do not "also fix while I'm here", do not continue into the next task because it seems obvious.

**Antigravity-specific:** the Manager surface supports parallel agents. **Parallel agents are permitted for read-only analysis and verification only.** Never dispatch parallel agents for gated build tasks — it breaks the one-task-per-window rule that the exit ledgers depend on.

---

## 2. Never invent scope

If it is not in `SCOPE.md`, `MODULE_SPEC.md`, or a signed OD in `DECISIONS.md`, **it does not exist**. Flag it and stop; do not implement it "since it's small."

Stop and flag before doing any of these, even if the task seems to imply them:
- Changing any entity shape in `DATA_MODEL.md`
- Changing `BrandConfig` (`BRAND_CONFIG.md`)
- Changing the print engine or any `@page` rule (`PRINT_CONTRACT.md`)
- Adding a dependency
- Touching the shared component library (design surface territory)
- Editing anything in `test/fixtures/golden/`

---

## 3. Hard rules — principles now, enforcement named

These are signed decisions and are in force today. The mechanism that enforces
each one is named in the Guard column, derived from `scripts/` and
`.github/workflows/`. Where no guard exists, the row says NOT YET ENFORCED and
names the owner. Do not invent a folder path, a library or a guard name to
satisfy a rule here.

| Rule | Signed by | Guard |
|---|---|---|
| No hex colour, brand string, currency code, URL, phone, or Arabic UI literal outside brand configuration, translation resources, or design tokens | D6, D7 | `scripts/check-no-hardcoded-literals.mjs` (`.github/workflows/ci.yml`) |
| Persistence is reached through one declared boundary, never touched directly from feature code | G11 | `scripts/check-data-boundary.mjs` (`.github/workflows/ci.yml`) |
| No runtime CDN dependency. Fonts and libraries are bundled | E11 determinism | `scripts/check-no-runtime-cdn.mjs` (`.github/workflows/ci.yml`) |
| Print output is produced by one engine. Nothing else emits page geometry | E11, and CF-64's cross-tool overwrite | NOT YET ENFORCED — owner P06 (`lib/print/` per `MODULE_SPEC.md` §1); no guard file exists in `scripts/` and no workflow invokes one |
| Every import, brand-configuration write and inbound record is schema-validated before it reaches storage | C14, G6 | `scripts/check-zod-coverage.mjs` (`.github/workflows/ci.yml`) |
| No user-derived value reaches an HTML-injection sink | CF-02 | lint rule `b2s/no-html-injection-sink` in `eslint.config.mjs`, invoked by the `lint` job (`npm run lint`) in `.github/workflows/ci.yml` |
| Every enumeration stores a language-neutral key. Display text lives in translation resources | D6, D7, CF-65 | `scripts/check-enum-keys.mjs` (`.github/workflows/ci.yml`) |

### Arrived security and migration subjects (CF-01)

Mechanisms that have been decided. Each names its guard or precedent. Subjects
whose mechanism is still undecided are in the deferred table below, not here.

| Subject | Mechanism | Guard or precedent |
|---|---|---|
| Migration discipline: one authoritative SQL source, migrations split verbatim in source order, one applier per environment, one environment | ADR-006, ADR-012 | `scripts/check_migration_split.py` (`.github/workflows/docs-integrity.yml`) |
| Privileged-client quarantine: the `service_role` client is constructed in one server-only module | ADR-005 | `scripts/check-service-import.mjs` (`.github/workflows/ci.yml`) |
| Staging discipline: every commit stages by explicit path; `git add -A` and `git commit -a` are never used | PR-36 | PR-36 |
| Generated types match the live schema; an absent secret fails the job rather than skipping | ADR-002, ARCHITECTURE.md §5 | `types-drift` job in `.github/workflows/ci.yml` |

### Deferred security and migration subjects (CF-01)

No mechanism is invented here. Each waits on what is named.

| Subject | Owner | Waits on |
|---|---|---|
| Print-engine containment (page geometry emitted only by the print engine) | P06 | `lib/print/` per `MODULE_SPEC.md` §1, and a guard file in `scripts/` invoked by a workflow |
| Design-surface folder paths (`components/` and the shared library) | the task that creates `components/` (CF-94) | a decided path; CF-75 forbids inventing one |
| Exact-decimal money in application code (no JavaScript number holds a money value) | the first module that holds money | a CI guard asserting ADR-011; none exists today |

Each becomes a CI guard the moment its mechanism is decided. If a rule appears to
block you, **the rule is right** — stop and flag for an ADR.

---

## 4. This is a greenfield build that harvests requirements

Six HTML tools are being RETIRED, not ported. No code from them is reused and
**no output of them is a parity target** — OD B1 is CLOSED. They are read-only
requirements evidence in `docs/requirements/`, and an extract there is never
current truth.

Acceptance is four standards, by domain. No evidence means FAIL.

- **Money & quantity** — exact match against the signed worked examples in
  `CALC_SPEC.md`. Zero drift. A rounding rule is stated per calculation. Legacy
  numbers are not a reference: no tax, no freight and no money rounding exists
  anywhere in the retiring tools.
- **Print** — the measured physical tolerance in `PRINT_CONTRACT.md`, plus
  byte-identical `PrintArtifact` output across platforms (OD-E11). Legacy
  printouts are not a reference.
- **Features & entities** — conformance to `FEATURE_INVENTORY.md` and
  `DOMAIN_MODEL.md`.
- **Tenant isolation** — proof that tenant A cannot read tenant B, on every gate
  touching data access. **Not waivable by OD.**

Legacy defects are requirements the new build must not reproduce (OD B3), listed
in `FEATURE_INVENTORY.md`. Never edit a file under `legacy/`.

---

## 5. Returns are the highest-risk logic in this product

Returns affect net revenue, COGS, product summary, `Component` usage, monthly
profit, `StockLevel`, and every report. Returns are `StockMovement` records with
reason `return_restock` or `return_writeoff` (OD-C3), and their money effect is a
`CreditNote` — an issued `Invoice` is immutable, and outstanding equals
Invoice − Payments − CreditNotes (OD-C16).

Anything touching returns is **heavyweight class**, full ceremony, with tests
covering at minimum: a partial return, a full return, both dispositions, and both
legacy `outAllocations` shapes.

The extracts record two live divergences the new model must settle rather than
inherit: unmarked dispositions default in opposite directions across the two
retiring tools, and returns were valued at list price against a discounted
invoice total. Neither is a target. Both are decisions for `DOMAIN_MODEL.md` and
`CALC_SPEC.md`.

---

## 6. Print is physical

Someone prints these files and cuts material to them. A 2 mm error costs money.

- Real units only (mm/cm) in the print DOM. The dual-DOM pattern is mandatory: screen version scaled in px, print version in real units.
- One px↔mm constant, owned by the print engine. Never redefine it locally.
- Never mark a print criterion done on screen evidence. It requires a measured, photographed printout.
- Print gaps route back to the print engine. **Never patch print CSS inside a feature folder.**

---

## 7. Design boundary

The shared component library belongs to the design surface; its location is
fixed at Gate 3. You **compose and wire** them; you never restyle them. Token-only styling. A visual gap is flagged back to design, never patched locally.

---

## 8. Model class

**Heavyweight** — architecture · storage layer · print engine · document rendering · template engine · CSV importer · returns/COGS/profit math · `BrandConfig` schema · every exit-verification gate · **anything touching tenant isolation, regardless of size**.
**Standard** — UI wiring, forms, tests, mechanical land tasks, CRUD on already-specified entities.

If asked to do heavyweight work under a standard model, say so before starting.

---

## 9. Every session ends the same way

Four files, in this order:

1. `SESSION_CONTEXT.md` — append one row to the done-steps table; update
   phase, last task, verdict and next action; update the open-id list.
   Keep it short. Narrative belongs in the journal.
2. `docs/method/CARRY_FORWARDS.md` — land, amend or close rows. Never close
   one unless your task explicitly authorises it.
3. `docs/method/PRECEDENTS.md` — add any new binding ruling or environment
   quirk. Append only; never rewrite an existing entry.
4. `DEVELOPMENT_JOURNAL.md` — append one line:

```
Date | Model | Phase/Task | Files | Issues | Next
```

An environment quirk discovered once is recorded permanently so it is never
paid for twice. A procedural ruling made once binds every later task.

---

## 10. Report honestly

In your task report, state deviations from the canonical prompt and **why**. State done-when criteria you could not meet. State carry-forwards you discovered. A report that hides a gap wastes the entire gate.

Never put credentials in any chat or agent surface. A pasted credential is treated as compromised and rotated immediately.

---

## Stack

**Withheld until Gate 3.** Architecture, framework, layering and folder structure
are deliberately undecided; they are authored in `ARCHITECTURE.md` and its ADRs
after the prepare phase closes. Do not infer one, and do not add a dependency.

Three constraints are already fixed by signed decisions and are not open:
PWA client with an online database on Supabase (G4) · hosted on Vercel (G9) ·
per-tenant private data with database isolation (G3).

If a task appears to require a stack decision, **stop and flag it**.
