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

If it is not in `SCOPE.md`, `PARITY_MATRIX.md`, `MODULE_SPEC.md`, or a signed OD in `DECISIONS.md`, **it does not exist**. Flag it and stop; do not implement it "since it's small."

Stop and flag before doing any of these, even if the task seems to imply them:
- Changing any entity shape in `DATA_MODEL.md`
- Changing `BrandConfig` (`BRAND_CONFIG.md`)
- Changing the print engine or any `@page` rule (`PRINT_CONTRACT.md`)
- Adding a dependency
- Touching `components/ui/` or `components/shared/` (design surface territory)
- Editing anything in `test/fixtures/golden/`

---

## 3. Hard rules — CI enforces these, don't fight them

| Rule | Guard |
|---|---|
| No hex colour, brand string, currency code, URL, phone, or Arabic UI literal outside `BrandConfig` / i18n resources / CSS variables | `check-no-hardcoded-brand` |
| Nothing imports `localStorage`, `indexedDB`, or the File System Access API except `src/data/adapters/` | `check-no-direct-storage` |
| No CDN `<script>`/`<link>` at runtime. Fonts and libraries are bundled | `check-no-runtime-cdn` |
| No `window.print()`, `window.open` for printing, or `@page` outside `src/print/` | `check-print-containment` |
| Every import, preset load, and BrandConfig write is zod-validated before it reaches the store | `check-zod-coverage` |
| No user-derived value reaches `innerHTML` / `dangerouslySetInnerHTML` | lint + guard |

If a guard blocks you, **the guard is right**. Do not disable, suppress, or work around it. If you believe a rule is wrong, stop and flag it for an ADR.

---

## 4. This is a port, not a greenfield build

Six working HTML tools already produce output a real business depends on. Your job is to reproduce their behaviour exactly, then improve only where a signed decision says so.

- **Money and quantity parity: exact. Zero drift.** Invoice totals, discounts, net-after-return, COGS per unit, stock value, ingredient usage, profit.
- **Print parity: ±0.2 mm** on a physical printout.
- When legacy behaviour looks wrong, **do not silently correct it.** Report it as a finding; it becomes a carry-forward or an OD.
- Legacy source files are **read-only reference**. Never edit them.

---

## 5. Returns are the highest-risk logic in this codebase

Returns affect net revenue, COGS, product summary, ingredient usage, monthly profit, stock value, and print reports. Anything touching them is **heavyweight class**, full ceremony, with parity tests covering at minimum: a partial return, a full return, a calculator-logged return with `outAllocations`, and a legacy return without `outAllocations`.

Never assume `outAllocations` exists. Returns logged before the Return Calculator do not have it.

---

## 6. Print is physical

Someone prints these files and cuts material to them. A 2 mm error costs money.

- Real units only (mm/cm) in the print DOM. The dual-DOM pattern is mandatory: screen version scaled in px, print version in real units.
- One px↔mm constant, from `src/print/`. Never redefine it locally.
- Never mark a print criterion done on screen evidence. It requires a measured, photographed printout.
- Print gaps route back to the print engine. **Never patch print CSS inside a feature folder.**

---

## 7. Design boundary

`components/ui/` and `components/shared/` belong to the design surface. You **compose and wire** them; you never restyle them. Token-only styling. A visual gap is flagged back to design, never patched locally.

---

## 8. Model class

**Heavyweight** — architecture, storage layer, print engine, migration importer, returns/COGS/profit math, `BrandConfig` schema, all exit-verification and parity gates.
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

Vite · React · TypeScript · zod · IndexedDB via an adapter · static deploy on Vercel.

**NOT used:** Next.js, SSR, any backend, any database (until P10), any runtime CDN, any CSS framework outside the token system, `localStorage` as a primary store.
