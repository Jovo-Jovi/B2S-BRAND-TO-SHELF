# MODULE SPEC — B2S

**Status:** AUTHORED. Precedence slot 12.
**Authored:** 2026-08-01 by the reviewer surface.
**Depends on:** `SCOPE.md` (22 modules), `ARCHITECTURE.md`, `GLOSSARY.md`.

> The repository is the specification's index. A feature folder maps one-to-one
> to a module in `SCOPE.md`. A folder that maps to nothing is out of scope by
> definition, and a module with no folder has not been built.

---

## 1. The tree

Only Release 1 folders are created. A folder is created by the task that first
needs it, never in advance — an empty folder is a claim that work exists.

**Scope of §1 — the application tree (OD-H10).** §1 specifies the application and
nothing else. Nine roots are in scope, and every directory the application places
inside them is named here.

**In scope:** `app/` · `features/` · `components/` · `lib/` · `supabase/` ·
`types/` · `scripts/` · `docs/` · `__tests__/`

**Specified at directory granularity:** `scripts/` · `docs/`

Neither of those two holds application code. The annotation beside each below is
the whole of its specification, and its internal organisation is not §1's to fix.

Everything the two lists above do not reach is **out of scope**: every
repository-root file — manifests, lockfiles, tool configuration, the always-on
rules, the state and journal files — and every directory that is not one of the
nine, which today means `.github/`, `.cursor/` and `legacy/`. Each is governed
where it lives: the pipeline by `ARCHITECTURE.md` §6, the retiring tools by
`legacy/FREEZE.md`, the rules files by `AGENTS.md`. A tree that enumerated them
would be a second place to forget, and forgetting is the failure this document
exists to prevent. Out of scope is the complement of **In scope** and is never a
list of its own, so a new root is excluded by not being added rather than by
being named somewhere else.

**A path below that does not exist yet says so.** The word `deferred` in the
annotation column means the folder is not created until the task that first needs
it, naming that task's phase where it is known.

`scripts/check_module_spec_tree.py` asserts this section in both directions on
every push (OD-H9): a named path whose parent exists must itself exist or be
marked deferred, and every tracked directory inside the nine roots must be named
here. §1 names directories, plus the individual files it calls out; it does not
enumerate every file, and the check does not pretend otherwise.

```
app/                              route surface only, thin
  [locale]/
    dictionaries.ts
    dictionaries/                 locale resolution, dictionary loading
    (public)/                     unauthenticated
      sign-in/                    email-and-password and Google (OD-G13)
      callback/                   Google OAuth return
      invitation/                 accept — deferred, P02
    (app)/                        authenticated tenant surface — deferred, P02
      onboarding/
      brand/
      packaging/
      catalog/
      inventory/
      sales/
      settings/
    (operator)/                   the B2S operator surface, OD-G10 — deferred, P08
  api/                            only where a route handler is unavoidable — deferred until one is

features/                         one folder per SCOPE.md module
  access/                         Auth & Access — SCOPE.md §2 "Auth, roles, tenant isolation"
    actions.ts                    mutations, zod-validated at entry (ADR-010)
    schema.ts                     the zod schemas for this module
    components/                   module-private components
    __tests__/
  onboarding/                     deferred, P03
  brand/                          deferred
  assets/                         deferred
  packaging/                      deferred
  print/                          deferred
  catalog/                        deferred
  inventory/                      deferred
  sales/                          deferred
  import/                         deferred
  settings/                       deferred
  operator/                       deferred, P08

  each holding, as needed:
    actions.ts                    mutations, zod-validated at entry (ADR-010)
    queries.ts                    reads, executed as the member
    schema.ts                     the zod schemas for this module
    components/                   module-private components, composed from ui/
    __tests__/

components/                       deferred, the design-surface catalog lands before P03
  ui/                             DESIGN SURFACE — primitives
  shared/                         DESIGN SURFACE — composed, cross-module

lib/
  supabase/
    client.ts                     browser client, acts as the member
    server.ts                     server client, acts as the member
    session.ts                    session refresh, after locale normalisation
    server-only/                  QUARANTINE — ADR-005
      service.ts                  the only construction of the privileged client
  money/                          exact decimal, ADR-011 — deferred, P05
  print/                          the print engine, ADR-009 — deferred, P06

supabase/
  migrations/                     split verbatim from the authoritative source
  schema.sql                      the authoritative source, ADR-006

types/
  database.ts                     GENERATED from the live project. Never hand-edited

__tests__/                        cross-cutting suites only
  isolation/                      the tenant-isolation harness and suite
  *.test.tsx                      shell and cross-cutting tests

scripts/                          CI guards and integrity checks
docs/                             product, method, requirements, archive
```

**Where a test lives is decided by what it covers.** A module-private test lives
in that feature folder's own `__tests__/`, beside the code it tests. A
cross-cutting suite — one that spans modules, or that proves a property of the
whole system rather than of one module — lives in the repository-root
`__tests__/`. `__tests__/isolation/` is the second kind: `BUILD_PHASES.md` §P01
lists the tenant-isolation suite as a phase deliverable, it belongs to no
feature, and ADR-003 makes what it proves a property of the database rather than
of any module.

---

## 2. The boundaries, and who owns each

| Boundary | Owner | Rule |
|---|---|---|
| `components/ui`, `components/shared` | the design surface | Builders compose and wire. Never restyle. A visual gap routes back, never patched in a feature folder |
| `lib/supabase/server-only/` | ADR-005 | The privileged client is constructed here and nowhere else. `check-service-import` fails the build on any import from `app/`, `features/` or `components/` |
| `lib/print/` | ADR-009 | Page geometry is emitted here only. `check-print-containment` enforces it |
| `lib/money/` | ADR-011 | Money arithmetic lives here. No component computes a money value |
| `supabase/schema.sql` | ADR-006 | The authoritative schema. Migrations are split from it verbatim, in source order |
| `types/database.ts` | ADR-002 | Generated. A hand edit is a defect the drift job catches |

---

## 3. Rules that structure enforces

1. **`app/` is thin.** A route file resolves params, checks nothing that matters,
   and renders. Logic lives in `features/`. Authorization lives in the database.
2. **A feature folder never imports another feature folder's internals.**
   Cross-module needs go through `lib/` or are a sign the module boundary is wrong.
3. **Every mutation enters through `actions.ts` and is zod-validated before any
   database call** (ADR-010).
4. **No literal anywhere outside the locale dictionaries under `app/[locale]/`,
   configuration, or the token stylesheet** (OD-D6, OD-D7).
5. **A new folder needs a module in `SCOPE.md`.** If there is no module, there is
   no folder — raise an OD instead.

---

## 4. Deferred folders

`features/purchasing`, `features/production`, `features/costing`,
`features/analytics`, `features/approvals`, `features/traceability` and
`features/locations` are Release 2 modules in `SCOPE.md`. They are not created
until the phase that builds them.

---

*Precedence slot 12. Read with `ARCHITECTURE.md` and `SCOPE.md`.*
