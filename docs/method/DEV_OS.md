# BB Dev OS — the method, adapted

> Derived from `DEV_OS_REFERENCE.md` (the BETK method: Next.js 15 + Supabase, 43 tables, RLS, auth, OTP). This project is a different animal: **a client-side port with no server, no auth, and no database until Phase 10**, where the product risk is *print fidelity and calculation parity*, not authorization.
>
> This document says what is kept, what is deferred, and what is added.

---

## 1. What is kept, unchanged

The four pillars transfer wholesale:

1. **Frozen, written scope.** Every scope question becomes a numbered, signed decision before code. Nothing enters the build that doesn't trace to a module in `MODULE_SPEC.md` and a signed OD.
2. **A document pipeline where each doc derives from the previous.** Conflicts resolve upward to the earlier doc, or produce a formal amendment — never an improvisation.
3. **Three surfaces with non-overlapping authority.** Reviewer (chat, never writes code) · Builder (IDE agent, never invents scope) · Design (owns the visual contract exclusively).
4. **Verification gates with written PASS/FAIL verdicts and explicit debt tracking.** "Done" is a ledger, not a feeling.

Also kept verbatim: Operational Decisions (ODs), append-only ADRs, canonical-vs-expanded prompts with as-built annotations, the FIX → RE-RUN pattern, the carry-forward protocol, the memory guard (`SESSION_CONTEXT.md` + `DEVELOPMENT_JOURNAL.md`), one task per fresh window, model classes, the ceremony budget rule, and the credentials rule (never in chat; a pasted credential is treated as compromised and rotated immediately).

---

## 2. What is deferred to Phase 10

These BETK rules are real, but they guard a surface that does not exist yet. Importing them now is pure overhead — and Dev OS's own ceremony budget rule says so.

| BETK rule | Status here | Activates at |
|---|---|---|
| RLS strategy per table; default-deny at the DB | **Deferred** — no database until P10 | P10 (Supabase) |
| Migration discipline; one applier per environment | **Deferred** — no migrations until P10 | P10 |
| Types generated from live schema; drift job | **Deferred** — types are hand-authored from `DATA_MODEL.md` until P10 | P10 |
| Privileged-client physical quarantine (`service.ts` + CI guard) | **Deferred** — no privileged client exists | P10 |
| Zod-on-every-server-action CI guard | **Adapted** — zod validates `BrandConfig`, imported legacy data, and preset JSON instead (see §5) | P01 |
| Auth gates, verified-phone, OAuth | **Out of scope** for MVP | P10 |

**Standing carry-forward, logged from day one:** *"When P10 begins, re-read `DEV_OS_REFERENCE.md` §4 and §6 in full and reinstate the deferred rule layer before the first schema task."* This item lives in every phase's entry checklist so it cannot be lost.

---

## 3. What is added — the parity gate

> **VOID.** This section defines a parity gate against the six legacy tools.
> Parity is dead: OD-B1 closed it and the four-standard acceptance model in
> `B2S_PREPARE_PHASE.md` §7 replaced it. No legacy output is a target. Retained
> for history; never cite as current truth. Every other section of this file
> remains in force.

**This is the most important adaptation.** BETK was greenfield; every acceptance criterion was invented. This project is a **port**: six working tools already produce correct output that a real business depends on. Therefore:

> **Every module's exit verification includes a parity ledger: the new module, run on the same golden dataset, must reproduce the legacy tool's output.**

**Parity tolerances (frozen — a change requires an ADR):**

| Class | Tolerance | Verified by |
|---|---|---|
| Money (invoice totals, subtotals, discount, net-after-return, COGS per unit, profit) | **Exact to the stored precision. Zero drift.** | Automated diff over the golden dataset |
| Stock quantities, ingredient usage, unit counts | **Exact.** | Automated diff |
| Print dimensions (label cm, panel mm, carton faces, stand panels) | **±0.2 mm on a physical printout**, measured | Physical measurement, logged with a photo artifact |
| Layout/visual | No regression the owner rejects on sight | Screenshot artifact, owner verdict |

**The golden dataset** is real exported Balance Bites data — invoices, customers, products, materials, recipes, purchases, production runs, **and returns including `outAllocations`** — frozen as fixtures in `test/fixtures/golden/` at P02 and never edited casually. Changing a fixture requires a journal entry stating why.

**Consequence for sequencing:** the migration importer and parity harness are **P02, not last**. You cannot parity-test without real data in the new store. This is the single biggest structural difference from a normal build order and it is deliberate.

---

## 4. What is added — the print contract

Print fidelity is business-critical here in a way it never was for BETK: these files drive a print shop producing physical labels, cartons, and display stands. Wrong by 2 mm means wasted material.

`PRINT_CONTRACT.md` (doc C6) is therefore a first-class document, equal in standing to the data model. It freezes:

- The single px↔mm constant and helper (generalising `PX=3.78` / `mm()` from `balance-bites-stand.html:457-462` — the strongest existing implementation).
- The **dual-DOM real-unit approach** as the only permitted print mechanism. New-window printing (`bb-stock-costs.html:3898`) and hidden-iframe printing (`:4388-4424`) are both retired: they carry a popup-blocker dependency and diverge from screen.
- A page/orientation/margin table per output, ported from the audit: invoice A4 portrait 16/14/16/14 mm; reports A4 10/12 mm; price list A4 12/14 mm; carton A3 landscape 8 mm; stand actual-mm or A3/A2; label exact-cm or A4/Letter/A3; wrap-set panels front 5×3, neck 1×4.5, seal 3×3, back 5×3 cm.
- The verification procedure: print, measure with a steel rule, photograph, attach as a gate artifact.

**Rule: no module may implement its own print path.** Gaps route back to the print engine owner, never patched in a feature folder — the same containment rule Dev OS applies to the design system.

---

## 5. The technical rule layer (this project's version)

Same philosophy as BETK — *any rule worth stating is worth a script that fails the pipeline* — different rules.

| Principle | Rule | Enforced by |
|---|---|---|
| **Brand values live in config, never in code** | No hex colour, brand string, currency code, phone, URL, or Arabic UI literal outside `BrandConfig` / i18n resources / CSS variables | CI guard `check-no-hardcoded-brand` |
| **Storage is behind one adapter** | Nothing imports `localStorage`, `indexedDB`, or the File System Access API except `src/data/adapters/` | CI guard `check-no-direct-storage` |
| **No runtime network dependency** | No CDN `<script>`/`<link>` at runtime. Fonts and `dom-to-image` are bundled. (The legacy PNG export breaks offline today — `balance-bites-label-v3.html:6`) | CI guard `check-no-runtime-cdn` |
| **Print goes through the engine** | No `window.print()`, `window.open`, or `@page` outside `src/print/` | CI guard `check-print-containment` |
| **Validate before persist** | Every import, preset load, and `BrandConfig` write is zod-validated before it touches the store | CI guard `check-zod-coverage` (scoped to `data/` and `brand/`) |
| **User text is escaped** | No user-derived value reaches `innerHTML`/`dangerouslySetInnerHTML`. (The audit found this in all six tools — High severity, XSS-capable once multi-user) | Lint rule + guard |
| **Design ownership boundary** | `components/ui` + `components/shared` are the design surface's. Builders compose and wire, never restyle. Gaps route back | Review discipline + PR check |
| **Parity is a gate, not a hope** | No module signs off without a green parity ledger | Exit verification |

Add a new guard the moment a new rule is born. Guards are cheap; re-litigating a rule every session is not.

---

## 6. The memory guard

Four files. Two are read every session; two are read on demand.

**`SESSION_CONTEXT.md`** — running state. Short by design. Done-steps table,
current phase and next action, open carry-forward **ids only**, frozen
decisions in force. If a paragraph is growing here, it belongs in the
journal or the ledger. Read every session.

**`docs/method/PRECEDENTS.md`** — binding procedural rulings (`PR-nn`) and
environment quirks. Append-only. A procedural question decided once binds
every later task. Read every session.

**`docs/method/CARRY_FORWARDS.md`** — the full carry-forward ledger, open
and closed, with all amendment text. Rows are append-and-amend; a closed row
keeps its text. Read when a task names a carry-forward, when landing or
amending rows, or at a gate.

**`DEVELOPMENT_JOURNAL.md`** — append-only history. One entry per session:
`Date | Model | Phase/Task | Files touched | Issues | Next`

All four are updated at the end of **every** session, on every surface.
Every session opens with: *"Read SESSION_CONTEXT.md and PRECEDENTS.md, then
execute T0n."*

> **Why the split.** `SESSION_CONTEXT.md` reached 64,723 bytes at P-04c —
> larger than this document and `DEV_OS_REFERENCE.md` combined — because the
> ledger and the running narrative both accumulated inside the file that must
> be read at the start of every session. Monotonic growth in a mandatory-read
> file is a defect in the memory guard itself. Signed 2026-07-31, CF-55.

---

## 7. Governance mechanics

**ODs.** Numbered, signed by you, before any dependent code. No feature exists without an OD amendment. Mid-project changes are legal — as a formally signed OD with explicit scope authority, its own task track, and a close-out. (Your returns workflow is exactly this pattern arriving early: it is handled as OD-7 with a delta audit as its evidence base.)

**ADRs.** Append-only. Superseded, never edited. Numbering collisions are tracked as carry-forwards, not quietly fixed.

**Canonical vs expanded prompts.** The phase-pack prompt is the spec of record. Expand it at execution time **only** when a concrete repo-state fact requires it. After execution, annotate with **AS-BUILT**: what actually shipped plus carry-forwards. The pack reads as both plan and history.

**Exit verification.** A dedicated heavyweight, read-only task per phase producing a line-by-line ledger against the definition of done — verified against the **built artifact and real printouts**, not prior summaries. One hard failure blocks sign-off, spawns a named FIX task, and the exit verification is **re-run in full**. The gate's job is to attack the build, not confirm it.

**Carry-forwards.** Never silently patched. Each becomes a named item with an owner, recorded in `SESSION_CONTEXT.md`, and copied into the next phase's entry checklist. Resolved items are struck through in place.

**Ceremony budget.** Full ceremony for anything touching money math, returns math, the print contract, the storage layer, or `BrandConfig`. Lighter ceremony for compose-only UI tasks. The ledger, the journal, and the carry-forward protocol are never skipped.

---

## 8. Failure modes this prevents, in this project specifically

- **White-label leakage** — a Balance Bites value hardcoded into a "generic" module (guard `no-hardcoded-brand`).
- **Silent number drift** — a ported COGS or net-after-return formula that is subtly wrong (parity ledger, exact tolerance).
- **Print regression** — a label that looks right on screen and prints 3 mm short (print contract + physical measurement gate).
- **Storage lock-in** — modules touching IndexedDB directly, making the Supabase swap a rewrite (adapter guard).
- **Schema drift** — the exact failure the audit documented, where "product" and "preset" ended up shaped five different ways across six tools (one canonical data model + counting methodology).
- **Chat-memory drift** — the reviewer inventing a fact the repo contradicts (authority rule + memory guard).
- **Lost debt at phase boundaries** — carry-forward protocol + entry checklists.
