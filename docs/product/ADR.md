# ADR — B2S

**Append-only.** An entry is never edited. A decision is superseded by a new
entry that names the one it replaces, and the original stays where it is with a
superseded marker. Numbering collisions are tracked as carry-forwards, never
quietly renumbered.

**ADR-001 to ADR-011 signed by the owner, 2026-08-01**, immediately after Gate 3.

---

## ADR-001 — Next.js App Router

**Decision.** The client and its server surface are one Next.js application using
the App Router, deployed on Vercel.

**Context.** OD-G9 fixes Vercel and OD-G4 fixes a PWA client over Supabase.
The open question was whether the server surface is part of the application or a
separate set of functions behind a static client.

**Consequences.** Privileged operations have a first-class home in the same
codebase as the pages that call them, rather than being rebuilt as a parallel set
of edge functions with their own deployment. Server Components read through RLS
as the member. The PWA requirement is met by the application shell, not by the
framework choice.

**Forecloses.** A static client where every privileged path is an out-of-band
function, and the split repository that shape produces.

---

## ADR-002 — Generated types over SQL, no data-access abstraction layer

**Decision.** Data access is the Supabase client and PostgREST, typed by types
generated from the live staging schema. No ORM. No hand-written repository layer
duplicating what RLS already expresses.

**Context.** The owner removed the ORM question from the decision set. This entry
records what is used in its place, since "no ORM" alone does not describe a
data-access strategy.

**Consequences.** The schema is the contract, and generated types make a schema
change break the build rather than break production. Every query is legible as
SQL, which matters because the policy that governs it is also SQL.

**Forecloses.** A second migration ledger competing with Supabase's, and an
abstraction that hides which policy a query is subject to.

---

## ADR-003 — Row-level tenancy, RLS as the boundary

**Decision.** Every table carries a `tenant_id`. Row-level security is enabled on
every table with default deny, and policies are written per table. Helper
functions resolve the caller's tenant and operator status. One database, one
schema.

**Context.** OD-G1 targets 1,000 tenants, each with several members. The
alternatives were a schema per tenant and a database per tenant.

**Consequences.** A migration is applied once, not a thousand times. A query
without a tenant predicate returns nothing rather than everything. Cross-tenant
references become impossible by construction rather than by check.

**Forecloses.** Per-tenant DDL, and the operational surface of a thousand schemas.

**This is the mechanism of the one acceptance standard no OD can waive.** Every
gate touching data access proves that tenant A cannot read tenant B, against the
live policies, by catalog query — not by reading the code.

---

## ADR-004 — Supabase Auth is canonical

**Decision.** Identity is Supabase Auth. A `Membership` record binds an identity
to a `Tenant` with a `Role`. Authorization derives from `Membership`, never from
a claim the client can set.

**Consequences.** Password reset, session handling, provider sign-in and token
rotation are not this project's to build or to get wrong.

**Forecloses.** Custom authentication, and a role stored anywhere the client can
influence.

---

## ADR-005 — The privileged client is physically quarantined

**Decision.** The `service_role` client is constructed in exactly one server-only
module. A CI guard fails the build on any import of that module from application,
feature or component code. It is used for tenant provisioning and operator
functions only.

**Context.** The repository is public (OD-G7). A leaked `service_role` key is
rotated, never removed from history.

**Consequences.** The RLS bypass exists in one auditable place. Reviewing "what
can bypass isolation" is reading one file, not searching a codebase.

**Forecloses.** Convenience use of the privileged client from a page or an
action, which is how default-deny is silently defeated.

---

## ADR-006 — One authoritative SQL source, one applier per environment

**Decision.** The schema lives as authoritative SQL. Migration files are split
from it verbatim, in source order. The Supabase CLI is the single applier per
environment. Any exception is authorised explicitly by the owner and followed
immediately by an alignment check and a repair.

**Consequences.** The builder never interprets the data model. A migration ledger
divergence is detected at the next schema task rather than discovered by a failed
deployment.

**Forecloses.** Two tools applying migrations to one environment, which produces
a ledger that disagrees with the committed filenames.

---

## ADR-007 — Split internationalisation

**Decision.** Interface chrome lives in bundled message catalogs resolved at
build time. Tenant-authored and business content lives in `TranslationEntry`,
resolved at runtime per tenant. No literal appears in either surface.

**Context.** OD-D7 makes the platform bilingual by rule with no literals.
`GLOSSARY.md` §4.8 defines `TranslationEntry` as what makes that achievable.

**Consequences.** Chrome costs no database round trip and survives offline, which
the PWA requirement needs. Tenant content is editable by the tenant, which code
cannot be.

**Forecloses.** Every string in the database, which is slow and breaks offline;
and every string in code, which makes tenant content impossible.

**Locale is normalised before any authorization gate.** Every gate verdict is
identical in Arabic and English, and that is provable per gate.

---

## ADR-008 — Supabase Storage with tenant-isolated paths

**Decision.** Binary files are objects in Supabase Storage under tenant-isolated
paths, governed by storage policies. Table rows hold references, never content.
`MediaAsset` records the logical file; `AssetRendition` records each derivative,
tiered display or print.

**Context.** OD-G11 states this directly: base64 in rows is what broke the
retiring tools.

**Forecloses.** Binary content in a row, and a shared bucket whose isolation
depends on nobody guessing a path.

---

## ADR-009 — One server-side print engine

**Decision.** A `PrintArtifact` is generated server-side by one engine and is
byte-identical across platforms. The browser print dialog is desk preview only,
labelled as such, and is never the print-shop handoff. No module implements its
own print path; gaps route back to the engine.

**Context.** OD-E11 requires determinism across all platforms (OD-H3). A browser
cannot promise it — font availability, rasterisation and page handling all vary.

**Consequences.** The determinism requirement becomes testable: the same inputs
produce the same bytes, and that is a gate artifact.

**Forecloses.** Per-feature print CSS, and a production deliverable whose fidelity
depends on which browser produced it.

---

## ADR-010 — zod at every mutation boundary

**Decision.** Every input that reaches storage — a form submission, an import
row, a brand-configuration write, an inbound payload — is schema-validated before
any database access. A CI guard measures coverage.

**Forecloses.** Validation that lives in the interface only, and therefore does
not exist.

---

## ADR-011 — Money is exact decimal, end to end

**Decision.** Money is Postgres `numeric` in storage and an exact decimal type in
application code. A JavaScript number never holds a money value at any point.
Stored precision is the `Currency`'s minor-unit count (CS-03). Rounding is half-up
after every named step (CS-01, CS-02). There is no comparison epsilon (CS-G4).

**Context.** `CALC_SPEC.md` G1 states the requirement. The retiring tools used
IEEE-754 doubles throughout, rounded nothing, and carried three different
comparison tolerances at once.

**Consequences.** The eight identities in `CALC_SPEC.md` §5 are assertable at zero
tolerance, which is the Money and quantity acceptance standard.

**Forecloses.** A float anywhere in the money path, which would make every one of
those identities fail intermittently and unreproducibly.
