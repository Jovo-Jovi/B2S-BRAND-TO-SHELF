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

```
app/                              route surface only, thin
  [locale]/
    (public)/                     unauthenticated: sign-in, invitation accept
    (app)/                        authenticated tenant surface
      onboarding/
      brand/
      packaging/
      catalog/
      inventory/
      sales/
      settings/
    (operator)/                   the B2S operator surface, OD-G10
  api/                            only where a route handler is unavoidable

features/                         one folder per SCOPE.md module
  onboarding/
  brand/
  assets/
  packaging/
  print/
  catalog/
  inventory/
  sales/
  import/
  settings/
  operator/

  each holding, as needed:
    actions.ts                    mutations, zod-validated at entry (ADR-010)
    queries.ts                    reads, executed as the member
    schema.ts                     the zod schemas for this module
    components/                   module-private components, composed from ui/
    __tests__/

components/
  ui/                             DESIGN SURFACE — primitives
  shared/                         DESIGN SURFACE — composed, cross-module

lib/
  supabase/
    client.ts                     browser client, acts as the member
    server.ts                     server client, acts as the member
    server-only/                  QUARANTINE — ADR-005
      service.ts                  the only construction of the privileged client
  i18n/                           locale resolution, dictionary loading
  money/                          exact decimal, ADR-011
  print/                          the print engine, ADR-009

supabase/
  migrations/                     split verbatim from the authoritative source
  schema.sql                      the authoritative source, ADR-006

types/
  database.ts                     GENERATED from staging. Never hand-edited

scripts/                          CI guards and integrity checks
docs/                             product, method, requirements, archive
```

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
4. **No literal anywhere outside `lib/i18n` dictionaries, configuration, or the
   token stylesheet** (OD-D6, OD-D7).
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
