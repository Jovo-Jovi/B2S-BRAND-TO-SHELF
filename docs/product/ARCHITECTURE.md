# ARCHITECTURE — B2S

**Status:** AUTHORED. Precedence slot 11.
**Authored:** 2026-08-01 by the reviewer surface, immediately after Gate 3.
**Signed:** the owner, 2026-08-01 — eleven decisions, recorded as ADR-001 to ADR-011.
**Depends on:** the eight Gate 3 blocking documents. Where this conflicts with any
of them, they win and this is amended.

> Gate 3 closed on 2026-08-01. This is the first document authored after it.
> It says what the platform is built from and how a request moves through it.
> `ADR.md` says why, and is append-only.

---

## 1. The three fixed constraints

Not decisions. Signed before this document existed and not reopened here.

| Constraint | Signed by |
|---|---|
| PWA client with an online database on Supabase | OD-G4 |
| Hosted on Vercel | OD-G9 |
| Per-tenant private data with database isolation | OD-G3 |

---

## 2. The stack

| Layer | Choice | ADR |
|---|---|---|
| Framework | Next.js, App Router | ADR-001 |
| Hosting | Vercel | OD-G9 |
| Database | Supabase Postgres | OD-G4 |
| Authorization | Postgres row-level security, default deny | ADR-003 |
| Identity | Supabase Auth | ADR-004 |
| Data access | Generated types over SQL and PostgREST | ADR-002 |
| Privileged access | One server-only module, CI-quarantined | ADR-005 |
| Schema change | One authoritative SQL source, Supabase CLI, one applier per environment | ADR-006 |
| Validation | zod at every mutation boundary | ADR-010 |
| Money | Postgres `numeric`, exact decimal in application code | ADR-011 |
| Files | Supabase Storage, tenant-isolated paths | ADR-008 |
| Language | Bundled catalogs for chrome, `TranslationEntry` for content | ADR-007 |
| Print | One server-side engine producing `PrintArtifact` | ADR-009 |

## 3. NOT used — considered and rejected

An explicit list, so a later session does not re-litigate a settled question.

- **No ORM.** Rejected by the owner. Data access is generated types over SQL and
  PostgREST. An ORM abstracts away the policy surface that RLS *is*, and brings a
  second migration ledger competing with Supabase's. Not an ADR because it was
  removed from the decision set rather than decided within it.
- **No custom authentication.** Supabase Auth is canonical (ADR-004).
- **No schema-per-tenant and no database-per-tenant** (ADR-003).
- **No runtime CDN.** Fonts and libraries are bundled — the determinism
  requirement of OD-E11 and the offline half of OD-G4.
- **No browser-generated production print output.** The browser print dialog is
  desk preview only, labelled as such (OD-E11, ADR-009).
- **No base64 binaries in table rows** (OD-G11).
- **No floating-point money, anywhere** (ADR-011).
- **No CSS framework outside the design token system.**

---

## 4. How a request moves

```
Browser (PWA)
   │  session cookie carries the Supabase identity
   ▼
Next.js App Router  ──  middleware: locale normalised BEFORE any gate,
   │                     then the session is resolved
   │
   ├── Server Component / Server Action
   │        │  zod validates the input (ADR-010)
   │        ▼
   │   Supabase client, acting AS THE MEMBER
   │        │
   │        ▼
   │   Postgres  ──  RLS evaluates every row against the member's tenant
   │                  Default deny. No policy means no rows.
   │
   └── the privileged path, and only from server-only/
            service_role, RLS bypassed, used for provisioning and
            operator functions only. CI fails the build on any import
            of this module from app, feature or component code.
```

**The rule this diagram exists to state.** Authorization is evaluated in the
database, once, for every caller. The middleware gate and the interface gate are
convenience and defence in depth. Neither is the boundary. A page that forgets
its check shows an empty result rather than another tenant's data.

**Locale is normalised before any authorization gate.** Every gate verdict must
be identical in Arabic and English. A gate whose answer depends on locale is a
defect.

---

## 5. Environments

| Environment | Purpose |
|---|---|
| Local | Development. Points at the staging Supabase project |
| Staging | The Supabase project that types are generated from and that RLS tests run against |
| Production | Applied to under review, per `BRANCHING.md` |

> **Amended by ADR-012.** Production is the only environment that exists. Types
> are generated from it, migrations are applied to it, and the isolation suite
> runs against it. The Local row's staging pointer and the Staging row are
> dormant until ADR-012's reinstatement trigger fires — a staging project is
> created before the first real tenant is onboarded, and the trigger is a row
> count, not a judgement.

`service_role` exists only in Vercel environment variables, per environment. Never
in the repository, never in a client bundle, never in a migration file (OD-G7 §9).

Types are generated from production. A diff between generated types and the committed
ones fails the pipeline loudly — including when the secret is absent. A job that
skips silently is worse than one that fails.

---

## 6. What CI enforces

The rules in `AGENTS.md` §3 were signed before their mechanism existed. Each now
has one.

| Rule | Guard |
|---|---|
| No brand, business or locale literal outside configuration, translation resources or tokens | `check-no-hardcoded-literals` |
| Persistence is reached through one declared boundary | `check-data-boundary` |
| The privileged client is importable from one directory only | `check-service-import` |
| No runtime CDN | `check-no-runtime-cdn` |
| Page geometry is emitted by the print engine only | `check-print-containment` |
| Every mutation input is schema-validated | `check-zod-coverage` |
| No user-derived value reaches an HTML-injection sink | lint rule |
| Every enumeration stores a language-neutral key | `check-enum-keys` |
| Generated types match the live schema | `types-drift` |

Jobs run sequentially and block: install → lint → typecheck → unit → guards →
types-drift → build. The RLS suite runs against staging and is required on any
pull request touching schema.

> **Amended by ADR-012.** Staging does not exist, so the RLS suite runs against
> production — permitted only while it holds zero real tenants, which is CF-92's
> reinstatement trigger. Everything else in this section stands.

**A guard that blocks you is right.** It is superseded by an ADR, never disabled.

---

## 7. What is deferred, and to when

| Deferred | Arrives at |
|---|---|
| `DATA_MODEL.md` | Phase 01, before the first migration |
| `BRAND_CONFIG.md` | Phase 03 |
| `CONTENT_MODEL.md`, `TEMPLATE_MODEL.md` | Phase 06 |
| `PRINT_CONTRACT.md`, `PRINT_PRODUCTION_SPEC.md` | Phase 06 |
| `IMPORT_SPEC.md` | Phase 07 |
| `FEATURE_INVENTORY.md`, `RISK_REGISTER.md`, `ACCEPTANCE.md` | Phase 08 |
| `MODULE_SPEC.md` | Phase 01, with the folder tree it indexes |
| `UX_PRINCIPLES.md` | Between Phase 01 and Phase 03, before the design catalog |
| `DOCUMENT_SPEC.md` | Phase 05, with the first business document rendered |
| `REGULATORY.md` | Phase 06, with the packaging content it constrains |

Each carries the Gate 3 line item written for it, moved verbatim under OD-H7.

---

*Precedence slot 11. Read with `ADR.md` and `BUILD_PHASES.md`.*
