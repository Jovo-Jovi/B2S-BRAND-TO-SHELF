# The Dev OS — A Doc-Driven, Gate-Verified Method for Solo + AI Product Development

> **What this is.** A reusable methodology reference for building production software as a solo founder orchestrating three AI surfaces. Written generically so it can bootstrap any future project; every mechanism is illustrated with its worked example from **BETK** (an Arabic-first, bilingual RTL marketplace on Next.js 15 + Supabase, 43 tables, 56 pages, built by one person).
>
> **The one-line thesis:** the human owns *decisions and verdicts*; documents own *truth*; AI surfaces own *execution* — and nothing ships without a written gate.

---

## 0. The four pillars

1. **Frozen, written scope.** Every scope question becomes a numbered, signed decision *before* code. Nothing enters the build that doesn't trace to a wireframed page and a signed decision.
2. **A document pipeline where each doc derives from the previous.** Scope → requirements → data model → architecture → UI spec → phase plan → task packs. Any conflict resolves upward to the earlier doc, or produces a formal amendment — never an improvisation.
3. **Three AI surfaces with distinct, non-overlapping authority.** A reviewer surface (chat) that never writes code; a builder surface (IDE agent) that never invents scope; a design surface that owns the visual contract exclusively.
4. **Verification gates with written PASS/FAIL verdicts and explicit debt tracking.** "Done" is a ledger, not a feeling. Findings are never silently patched; they are named, owned, and scheduled.

---

## 1. The three-surface AI model

| Surface | Role | Owns | Never does |
|---|---|---|---|
| **Chat LLM — the reviewer/brain** | Generates task prompts, verifies pasted outputs against the docs, issues PASS/FAIL verdicts, tracks carry-forwards, hands back the exact next step | Verdicts, prompt packs, phase sequencing | Executes code; trusts its own memory over the repo |
| **IDE agent — the builder/hands** | Executes exactly one task per fresh window against the repo, under always-on rules files | Code, migrations, tests, wiring | Invents scope, restyles the design system, applies unreviewed security/schema changes |
| **Design agent — the visual owner** | Design system: tokens, shared components, shells, all three UI states per component | `components/ui` + `components/shared` (the visual contract) | Wires data or business logic; invents routes not in the frozen route table |

**Model classes inside the builder.** Two tiers: a *heavyweight* class for anything touching migrations, security, architecture, or verification gates; a *standard* class for implementation, wiring, and tests. Picking the class is the human's **only** manual step per task — an always-on rule file flags a mismatch.

> **BETK:** Opus for DB/security/architecture/review gates; Sonnet for UI/actions/tests/wiring (recorded as ADR-007). Every journal entry logs `Date | Model | Phase/Task | Files | Issues | Next`, so the model-per-task-class convention is auditable, not folklore.

**The authority rule.** Repo state (`SESSION_CONTEXT.md` + committed code) always outranks chat memory. Every session — on any surface — starts by restoring state from the repo, never from recollection.

**The loop, one cycle:**

```
Chat: generate task prompt (from phase pack)
        │
        ▼
Human: open FRESH IDE-agent window → pick model class →
       "Read SESSION_CONTEXT.md, then execute T0n"
        │
        ▼
IDE agent: execute one task → update SESSION_CONTEXT + journal → report
        │
        ▼
Human: paste the task report back into chat
        │
        ▼
Chat: verify vs docs → PASS/FAIL ledger → log carry-forwards →
      hand back the next prompt (or a FIX prompt)
```

Design-system work runs the same loop but through the design surface, with a **hand-off step**: the design agent produces components; a builder task *lands* them mechanically (copy, token patch, no restyle); visual gaps found later are **flagged back to design, never patched in a feature folder**.

---

## 2. The document pipeline (build order)

Each step consumes the previous. Numbers are the canonical Dev OS steps.

| Step | Document | Contract it establishes |
|---|---|---|
| 1 | **Scope (FROZEN)** | Vision, actors, use cases, included features (each = a wireframed page), explicit exclusions, and the open-decisions section (ODs) awaiting sign-off |
| 2 | **PRD** | One functional requirement per page; acceptance criteria by ID; business rules quoted by ID |
| 3 | **ERD + executable schema** | Table inventory with a counting methodology, row-ownership model, RLS strategy *per table*, index justifications, soft-delete decisions, and the SQL itself |
| 4 | **Architecture** | Stack (with explicit "NOT used" list), request/data flow, and ADRs — changing any of it requires a new ADR |
| 5 | **Codebase architecture** | Folder tree where feature folders map 1:1 to UI-spec areas — the repo *is* the spec's index |
| 6 | **UI Spec** | Every page: route, auth gate, components, data requirements, all states — the ground truth when building a page |
| 7–13 | Security guidelines, API standards, testing strategy, config, CI/CD, monitoring standards | The rule layer the CI guards later codify |
| 14 | **Master execution prompt** | The "brain" pasted/wired into every builder session: pointers to product truth, technical truth, security truth, code standards |
| 15 | **Phase plan → phase packs** | Dependency-ordered phases; each pack holds per-task canonical prompts, model class, and done-when criteria |
| — | **SESSION_CONTEXT.md + DEVELOPMENT_JOURNAL.md** | The memory guard: running state + append-only history, updated every session |

**Key properties.**
- **Traceability chain:** feature ↔ page ↔ FR ↔ tables ↔ phase task. Anything that can't be traced is out of scope by definition.
- **The schema is executable, not descriptive.** Migrations are split *verbatim* from the authoritative SQL, in source order — the builder never "interprets" the data model.
- **Counting methodologies are written down.** When two docs disagree on a headline number, one doc is declared authoritative and the methodology is frozen.
  > **BETK:** the "28 tables" stale headline vs the real 43 was resolved by OD-6, which froze both the count *and* how to count (any runtime `CREATE TABLE` across both schemas; enums/functions/triggers/views excluded).

---

## 3. Governance mechanics

### 3.1 Operational Decisions (ODs)
Every open scope question gets a numbered decision, signed by the human, *before* any dependent code. The freeze rule: **no feature exists without an OD amendment.** Mid-project changes are legal — but only as a formally signed OD with explicit scope authority, its own execution track, and a close-out.
> **BETK:** OD-1…OD-6 signed at Phase 00 (low-stock derived, deactivate-only accounts, no campaign entity, Google OAuth + verified-phone gate, sessions UI out, table count = 43). OD-7 (bilingual AR/EN + theming) arrived *mid-Phase-03* and was handled correctly: signed amendment, presentation-layer-only constraint written into the decision ("no new pages/tables/content columns, no new dependency beyond two libs, no translation service"), its own branch and task track (BL-00…BL-05), a consolidated gate, merge, and a close-out that surfaced 3 named carry-forwards.

### 3.2 ADRs (Architecture Decision Records)
Append-only. A decision is superseded by a new ADR, never edited. Numbering is tracked; collisions are flagged and renumbered at the next docs-touch.
> **BETK:** ADR-001 (no ORM) … ADR-010 (GoTrue-canonical auth). ADR-003 (phone-OTP-only) superseded by ADR-008 (OAuth added) — the history of the reversal is preserved. A live numbering collision (two ADR-002s across two docs) is tracked as a carry-forward rather than quietly fixed — even *doc hygiene* goes through the ledger.

### 3.3 Canonical vs expanded prompts, and as-built annotations
The phase-pack prompt is the **spec of record**. It may be expanded at execution time **only** when a concrete repo-state fact requires it (a file that already exists, an auth mechanism the default omits) — otherwise it runs verbatim. After execution, an **as-built annotation** records what actually shipped plus any carry-forward, next to the canonical prompt. The pack therefore reads as both plan and history.

### 3.4 PASS/FAIL ledgers and the FIX → RE-RUN pattern
Every phase ends with a dedicated **exit-verification task** run by the heavyweight model class: a line-by-line ledger of the definition-of-done and acceptance criteria, verified against the **live systems** (staging DB, real policies via catalog queries), not just the code. One hard failure blocks sign-off and spawns a named FIX task; the exit verification is then **re-run in full** before sign-off.

> **B2S annotation, 2026-08-05 — P02-T02.** The sentence above is true of
> BETK, which had a staging database. B2S has one environment under
> ADR-012, named production; this file records BETK's method as practised
> and the sentence stands unchanged (PR-29).

> **BETK:** Phase 02's T08 exit gate found a subtle OTP-limiter defect (19-line ledger, 18 PASS / 1 HARD FAIL) → T08-FIX → T08 RE-RUN (all 19 PASS, no regression) → sign-off. The gate's job is to *attack* the build, not to confirm it.

### 3.5 The carry-forward protocol
Findings are **never silently patched**. Each becomes a named item with an owner (a specific future phase/task or a pre-launch gate), recorded in the running state, and copied into the next phase's **entry checklist** so it cannot be lost between phases. Resolved items are struck through in place — the audit trail of debt is itself preserved.
> **BETK:** the entry checklist pattern carried items like "Phase 04 must add the permissive INSERT policy to `seller_profiles`", "handset SMS delivery is THE hard pre-launch gate", and "the stock trigger is owed to source" across three phase boundaries without loss.

### 3.6 The memory guard
`SESSION_CONTEXT.md` (running state) and `DEVELOPMENT_JOURNAL.md` (append-only history) are updated at the end of **every** session. One task per fresh agent window; the opener is always: *"Read SESSION_CONTEXT.md, then execute T0n."* Environment quirks discovered once are institutionalized as rules in the context file so they are never re-discovered.
> **BETK:** "`npx supabase` hangs on this Windows environment — always use the direct binary" was learned once, recorded, and obeyed by every subsequent session.

---

## 4. The technical rule layer

Generic principles, each enforced by *structure or CI* rather than discipline alone:

| Principle | Generic rule | BETK instantiation |
|---|---|---|
| **Authorization lives in the data layer** | Default-deny at the database; UI and middleware gates are UX convenience + defence-in-depth, never the boundary | Postgres RLS on all 43 tables; `is_admin()` / `my_store_id()` helpers; RESTRICTIVE policies for cross-cutting gates (verified-phone) layered over permissive ownership policies |
| **Validate before persist** | Schema-validate every mutation input before any DB access | Zod on every Server Action / API route — enforced by a CI guard, not convention |
| **Privileged paths are quarantined** | The RLS-bypassing client is physically importable only from one directory | `service.ts` behind a `server-only` guard; CI guard fails the build if `app/`, `features/`, or `components/` imports it |
| **Rules become CI guards** | Any rule worth stating is worth a script that fails the pipeline | `check-service-import`, `check-zod-coverage`, `check-no-hardcoded-arabic` (added mid-project when the bilingual rule was born) |
| **Types are generated; drift is a failure** | Regenerate types from the live schema; a diff fails CI loudly (including when secrets are missing — no silent skip) | `types-drift` job regenerates from staging and `git diff --exit-code`s |
| **Migration discipline** | One authoritative SQL source; ordered files split verbatim; one applier per environment; alignment verified after any exception | CLI-first (`db push`) as the pattern; MCP apply allowed only by explicit human authorization, with the committed file as source-of-truth — and any resulting ledger divergence repaired immediately (see incident 7) |
| **Design ownership boundary** | The visual contract has one owner; builders compose and wire, never restyle; gaps route back to the owner | `components/ui` + `components/shared` owned by the design surface; token-only styling; land tasks are mechanical |
| **Server/client module split is physical** | Server-only code lives in separate files, guarded, never behind runtime checks in shared modules | `posthog.ts` (client-safe) vs `posthog.server.ts` (`server-only`) after the webpack-require incident (see incident 4) |

> **B2S annotation, 2026-08-05 — P02-T02.** The "Types are generated; drift
> is a failure" row above is true of BETK, whose `types-drift` job
> regenerated from a staging project. B2S has one environment under
> ADR-012, named production; this file records BETK's method as practised
> and the row stands unchanged (PR-29).

---

## 5. The phase lifecycle template

```
ENTRY ──► TASKS ──► EXIT VERIFICATION ──► SIGN-OFF ──► HANDOFF
```

**ENTRY.** Read the entry checklist (the prior phase's carry-forwards). Verify preconditions (migrations aligned, CI green, design components available if the phase composes them). Resolve any decide-and-document task *first* — a real architectural fork must be decided explicitly, never improvised by the build.
> **BETK:** Phase 02's T01 was purely "decide the auth model" (GoTrue-canonical vs custom OTP) because T02–T04 all changed shape based on it. The pack said, verbatim: *"Do not let the build improvise it."*

**TASKS.** Each task = model class + canonical prompt + done-when criteria + tests. One task per fresh window. Task classes that recur: *land* tasks (mechanical integration of design hand-offs), *fix* tasks (spawned by gate failures, named after the issue they close), *decide* tasks (produce an ADR, no code).

**EXIT VERIFICATION.** A dedicated heavyweight task producing the full PASS/FAIL ledger against live systems. Findings are classified: hard failure (blocks), doc correction (recorded), carry-forward (owned).

**SIGN-OFF.** Human, explicit, dated, recorded in the running state with the verifying model.

**HANDOFF.** Carry-forwards written into the next phase's entry checklist; docs synced (phase pack as-built annotations, journal, context); branches merged via one gate PR and deleted **only after containment is verified** (`git log main..branch` empty).

---

## 6. Git & CI conventions

- **Branching:** per-phase (or per-initiative) feature branches; task-level commits; **one consolidated gate PR** per phase/initiative into `main`.
- **CI pipeline:** sequential blocking jobs — install → lint → typecheck → unit tests → guards → types-drift → build. Expensive live-DB jobs (RLS smoke) may be opt-in *initially*, but should be promoted to required on migration-touching PRs as soon as the DB surface grows (see Recommendations).
- **Fail loudly:** any job that depends on secrets fails when they're absent — never silently skips.
- **Branch hygiene:** delete only after verified containment; record the verification in the journal.
- **Credentials:** never in chat, ever. A credential pasted into any AI surface is treated as compromised and rotated immediately. Secrets live in `.env.local` / platform secret stores only.

---

## 7. Worked example — the BETK timeline

| Phase / track | Outcome | Shape |
|---|---|---|
| 00 — Scope sign-off | OD-1…OD-6 signed; no code before this gate | Gate only |
| 01 — Foundation | 14 tasks: repo, tokens/RTL shell, Supabase clients, 43-table migration + freeze deltas, types, RLS harness, providers, middleware, services, routes, CI. Signed off via T14 ledger | Skeleton + data contract + gates |
| 02 — Auth & profiles | 8 tasks + fixes: auth-model ADR, phone-OTP, Google OAuth, register, account, deactivate, verified-phone gate. T08 gate → HARD FAIL → T08-FIX → RE-RUN → signed off | First user-facing flows; heaviest security scrutiny |
| DS — Design catalog | 21 shared components + tokens designed in the design surface; landed by a mechanical builder task; merged via its own gate PR | Design surface + land task |
| OD-7 — Bilingual + theme (mid-project amendment) | Signed scope amendment; BL-00…BL-05 on its own branch; DS-I18N routed through the design surface; consolidated gate; merged; close-out with 3 named carry-forwards | The template for a legal mid-project scope change |
| 03 — Catalog & Discovery | In progress: query layer (T01) surfaced a hard-blocking RLS gap → security-classed FIX with one additive migration → resumed. Remaining: Homepage, Search, Category, Listing Detail, Storefront (FR-PUB-1..5) with tsvector search + filters, collections strip, rating aggregates, follow. Tests: integration (search/filter, RLS public read) + E2E browse→listing→storefront | Public read surface |

### The road ahead — Phases 04–14, in dependency order (from `BETK_PHASES.md`)


**Launch runway (after 14):**
- **N-3 — Testing, full coverage pass:** every utility unit-tested, every action/route integration-tested, all critical E2E green (including the deferred live Google OAuth consent round-trip), everything mapped to FR/AC ids.
- **N-2 — Deployment:** Vercel production config, per-environment env (with `NODE_ENV`-conditional requiredness), migrations applied to prod under review, buckets/privacy verified.
- **N-1 — Monitoring:** Sentry across client/server/actions with feature tags; PostHog on key funnels; pg_cron verified in prod; notifications archive job scheduled.
- **N — Launch + post-launch:** run `LAUNCH_CHECKLIST.md` (the 5 mandatory security conditions, per-table RLS review, Zod coverage, Core Web Vitals, Resend flows) — plus the two hard gates that cannot be compressed: **handset SMS delivery with sender `3MS EGY`** and the completed NTRA sender-ID registration. Post-launch: notifications growth (archive at 90d), search/write latency, post-MVP planning (variants, wallet, multi-store).

---

## 8. Incidents that prove the system

Each incident: what happened → what caught it → the generic lesson.

1. **The OTP limiter wall-clock straddle.** The ≤5-attempt limiter bucketed attempts by absolute 60s epoch windows; an OTP issued mid-bucket straddled a boundary into a second counter row → ~10 attempts on one valid code. **Caught by** the phase exit-verification gate reading the source adversarially — every prior test had passed. **Lesson:** anchor counters to the lifecycle of the thing they guard, not to the wall clock; and design exit gates to *attack* the build.
2. **RLS-enabled-no-policy = silent empty results.** Five child tables had RLS enabled but their `CREATE POLICY` statements were omitted from the source SQL → default-deny → embedded selects silently resolved to `[]` for *every* caller. No error anywhere. **Caught by** integration tests asserting the *positive* path (seed data must come back). **Lesson:** enabling a security feature without its policies fails closed and silent; always test that permitted data actually surfaces.
3. **The privilege-escalation grant analysis.** Adding a "harmless" `USING (id = auth.uid())` UPDATE policy would have combined with an all-column table grant to let users rewrite their own `role`/`status` — self-promotion to admin. **Caught by** treating a routine feature (account deactivation) as a decide-and-document security fork, checked against the live grants. **Lesson:** policies and grants *compose*; review both together, and prefer a column-scoped privileged code path over widening the policy surface.
4. **The webpack static-require misconception.** "Lazy `require()` inside a `typeof window` guard keeps server code out of the client bundle" — false; bundlers resolve requires statically. **Caught by** CI hardening. **Lesson:** server-only code is separated *physically* (distinct file + `server-only` guard + import-guard script), never behind runtime checks.
5. **A mid-project scope change done right.** Bilingual + theming landed mid-Phase-03 without destabilizing anything: signed OD with hard constraints, own branch and task track, the security invariant made explicit and provable ("locale normalized *before* auth gates; every gate verdict must be identical AR vs EN"), consolidated gate, close-out with named debt. **Lesson:** the freeze isn't "no change" — it's "no *unwritten* change."
6. **Environment quirks are institutionalized.** A hanging CLI wrapper cost one debugging session, then became a permanent rule in the running state. **Lesson:** the memory guard exists precisely so no lesson is paid for twice.
7. **Migration path divergence.** An emergency security migration was applied through a secondary tool (MCP) under explicit human authorization; the tool recorded a *different version timestamp* in the remote migration ledger than the committed filename. Harmless at rest — but the next CLI `db push` would treat the local file as unapplied and re-run it (failing on duplicate policies). **Caught by** a read-only audit comparing source and live ledgers. **Lesson:** any exception to "one applier per environment" must be followed *immediately* by an alignment check (`migration list`) and a repair (rename the local file to the recorded remote version, or `migration repair`) — before the next schema task, not at some later cleanup.

---

## 9. Failure modes this system prevents

Scope creep (freeze + ODs); silent patches (carry-forward protocol); chat-memory drift (repo-authoritative state + memory guard); unverified "done" (exit ledgers vs live systems); design drift (single visual owner + compose-don't-restyle + diff-verified land tasks); privileged-client leakage (physical quarantine + CI guard); validation gaps (Zod CI guard); type drift (generated types + drift job); lost debt across phase boundaries (entry checklists); big-bang risk (one task per window, per-phase gate PRs); credential exposure (never-in-chat rule + immediate rotation).

---

## 10. Bootstrapping a new project — checklist

1. **Write the scope doc and freeze it** with a numbered open-decisions section. Sign the ODs. *No development before this gate.*
2. **Derive the PRD** — one FR per wireframed page; anything without a page is out.
3. **Design the data model as an executable contract**: table inventory + counting methodology, row-ownership model, per-table authorization strategy, the SQL itself.
4. **Pick the stack and record ADR-001…n**, including the explicit "NOT used" list.
5. **Write the master execution prompt + always-on rules files** for the builder surface: product truth pointers, technical truth pointers, security truth, code standards, and the model-class convention.
6. **Stand up CI with the guards on day one** — service-import quarantine, validation coverage, types-drift, sequential blocking jobs, fail-loudly on missing secrets. Add new guards the moment a new rule is born.
7. **Create `SESSION_CONTEXT.md` + `DEVELOPMENT_JOURNAL.md` before the first task**, with the update template and the session opener convention.
8. **Phase 01 is foundation only** — skeleton, data contract live in staging, generated types, gates. No features.

> **B2S annotation, 2026-08-05 — P02-T02.** Item 8 above is true of BETK,
> which ran its data contract live in staging. B2S has one environment
> under ADR-012, named production; this file records BETK's method as
> practised and the item stands unchanged (PR-29).

9. **Decide the design-system placement** (early: real components before feature pages compose them; or late: polish pass) and record it.
10. **Write phase packs one at a time**, each generated after the prior phase's sign-off so it can absorb the carry-forwards.
11. **Adopt the ceremony budget rule:** full ceremony for anything touching auth, authorization, money, or schema; lighter ceremony for compose-only tasks — but the ledger, the journal, and the carry-forward protocol are never skipped.

---

## 11. Appendix — prompt skeletons

**Session opener (builder surface, every window):**
```
Read SESSION_CONTEXT.md, then execute T0n.
```

**Task prompt skeleton (phase pack entry):**
```
## T0n — <task name>
- Model: <heavyweight | standard> · Skill/rules: <auto-attached>
- Prompt (canonical):
  <what to build, citing the authoritative doc sections by name;
   explicit STOP-and-flag conditions for anything security/schema-classed
   outside this task's class>
- Done when: <verifiable criteria — commands that must pass, states that must hold>
- Tests: <which layer, mapped to FR/AC ids>
▸ EXPANDED FOR EXECUTION: <only if a concrete repo-state fact required it>
▸ AS-BUILT: <what shipped + carry-forwards>
```

**Exit-verification prompt skeleton:**
```
Read SESSION_CONTEXT.md, then execute T-exit (read-only where possible).
Verify every line of the phase Definition of Done and the acceptance criteria
against the committed tree AND the live environment (query the real catalogs/
policies/jobs — do not trust prior summaries). Output a PASS/FAIL ledger,
one line per criterion, with evidence. Classify anything not PASS as:
HARD FAILURE (blocks sign-off) | DOC CORRECTION | CARRY-FORWARD (name an owner).
Make no changes.
```

**Review verdict format (chat surface):**
```
VERDICT: PASS | FAIL
Ledger: <line-by-line vs the task's done-when>
Carry-forwards logged: <named items + owners>
Next prompt: <the exact next task prompt, or the FIX prompt>
```

---

*Generated 2026-07-06 from the AUDIT-DEVOS read-only snapshot of the BETK repository, cross-verified against SESSION_CONTEXT.md and the Dev OS document set.*
