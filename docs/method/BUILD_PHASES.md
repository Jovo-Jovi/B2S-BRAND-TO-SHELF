# BUILD PHASES — B2S

**Status:** LIVE. Precedence slot 13, succeeding `B2S_PREPARE_PHASE.md`, which is
now history and is not a sequencing document.
**Authored:** 2026-08-01 by the reviewer surface, after Gate 3.

Eight phases, dependency-ordered, delivering Release 1 as signed in `SCOPE.md` §2.
One branch per phase per `BRANCHING.md`. Every phase ends with an exit-verification
gate run by the heavyweight class, on the branch, before the pull request.

---

## The lifecycle, every phase

```
ENTRY ──► TASKS ──► EXIT VERIFICATION ──► SIGN-OFF ──► HANDOFF
```

**ENTRY.** Read the prior phase's carry-forwards. Verify preconditions. Resolve any
decide-and-document task first — an architectural fork is decided explicitly,
never improvised by the build.

**EXIT VERIFICATION.** A dedicated read-only heavyweight task producing a
line-by-line PASS/FAIL ledger against the definition of done and the acceptance
standards, verified against the **live** staging database and real policies by
catalog query, never against a prior summary. One hard failure blocks sign-off,
spawns a named FIX task, and the verification is re-run in full.

**HANDOFF.** Carry-forwards into the next phase's entry checklist. One consolidated
pull request. Branch deleted only on verified containment.

---

## The phases

### P01 — Foundation
*No features.* Skeleton, data contract live in staging, gates.

`DATA_MODEL.md` authored just-in-time, landed no later than the first migration ·
`MODULE_SPEC.md` with the folder tree · Next.js application shell with RTL and
the token system · Supabase staging and production projects · the authoritative
schema for the tenancy spine with RLS on every table · generated types and the
drift job · the nine CI guards from `ARCHITECTURE.md` §6 · the privileged-client
quarantine and its guard · the RLS test harness.

**Exit standard:** tenant isolation, proven by catalog query against live policies.

> **The `DATA_MODEL.md` criterion, restated so it can be checked.** This clause
> read "authored just-in-time **before** the first migration", and the P01 exit
> gate could not prove or disprove it: the document's content and the first
> migrations both landed in commit `f29c0d9`, so it is satisfied by authorship
> date and unprovable by commit order. Landing together is what just-in-time
> authoring produces and is not a defect. The checkable form is:
>
> **`DATA_MODEL.md` is landed in the same commit as the first migration or
> earlier, and the migration implements no table, column, policy or constraint
> the document does not specify.**
>
> The second half is the real requirement — the point of authoring first was
> never the ordering, it was that the schema is not invented by the migration —
> and it is provable by reading the migration against the document.

### P02 — Tenancy and access
`Tenant`, `Member`, `Membership`, `Role`, provisioning, Supabase Auth wiring,
`Operator` reach limited to metadata per OD-G10, `ConsentGrant`, `ActivityEvent`.

**Exit standard:** tenant isolation. The heaviest security scrutiny of the build.
**Not waivable.**

### P03 — Brand and onboarding
`BRAND_CONFIG.md` authored just-in-time · the onboarding wizard · `Brand`,
`BrandProfile`, `BrandTheme`, `LogoVariant`, `ColorRole`, `ColorValue`,
`Typeface` · `MediaAsset` and `AssetRendition` on Supabase Storage · archive,
never delete (OD-D5).

### P04 — Catalog and inventory
`Product`, `ProductVariant`, `ProductCode`, `ProductCategory`, `UnitOfMeasure` ·
`StockMovement` as the single write path, `StockLevel` derived, one `Location` ·
`CALC_SPEC.md` rows R1-20 through R1-24.

**Exit standard:** money and quantity, against R1-20 to R1-24.

### P05 — Sales and money
`Buyer`, `SalesOrder`, `Shipment`, `Invoice`, `InvoiceLine`, `Payment`,
`Receipt`, `Return`, `ReturnLine`, `ReturnAllocation`, `CreditNote`.
`CALC_SPEC.md` rows R1-01 through R1-19 implemented, with the eight identities in
§5 as assertions.

**Exit standard:** money and quantity, exact, zero drift. The discount allocation
and the return valuation (R1-04, R1-15) carry full ceremony.

### P06 — Packaging and print
`CONTENT_MODEL.md`, `TEMPLATE_MODEL.md`, `PRINT_CONTRACT.md` and
`PRINT_PRODUCTION_SPEC.md` authored just-in-time · `PackagingTemplate`,
`TemplateSlot`, `TemplateConstraint`, `DimensionVariant` for labels and stickers ·
`Artwork`, `ArtworkVersion` · the print engine and `PrintArtifact` in PDF and PNG.

**Exit standard:** print. Measured physical tolerance, plus byte-identical output
across platforms.

### P07 — Import and settings
`IMPORT_SPEC.md` authored just-in-time · CSV import for products and buyers with
dry-run, per-row errors and a partial-import policy · settings for units,
currency, tax on/off, locales.

### P08 — Operator surface and release readiness
`FEATURE_INVENTORY.md`, `RISK_REGISTER.md` and `ACCEPTANCE.md` authored
just-in-time · the operator surface, metadata and usage only · the pre-relaunch
audit in `B2S_PREPARE_PHASE.md` §10 · CF-86's secret-scanning confirmation.

---

## The design surface

`components/ui` and `components/shared` belong to the design surface exclusively.
Builders compose and wire; they never restyle. A visual gap routes back to design,
never patched in a feature folder.

The catalog is designed after the P01 shell and before P03 composes pages, and is
landed by a mechanical builder task with its own consolidated pull request.

---

## Standing rules for every phase

One task per fresh builder window. Model class per `AGENTS.md` §8 — anything
touching tenant isolation is heavyweight regardless of size. `SESSION_CONTEXT.md`
and `DEVELOPMENT_JOURNAL.md` updated at the end of every session. Findings never
silently patched. Ceremony budgeted per PR-20.

**No document creates stock. Only a confirmation event does.**

---

*Precedence slot 13. Read with `ARCHITECTURE.md`, `ADR.md` and `BRANCHING.md`.*
