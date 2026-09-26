# ADR — B2S

**Append-only.** An entry is never edited. A decision is superseded by a new
entry that names the one it replaces, and the original stays where it is with a
superseded marker. Numbering collisions are tracked as carry-forwards, never
quietly renumbered.

**ADR-001 to ADR-011 signed by the owner, 2026-08-01**, immediately after Gate 3.
**ADR-012 signed by the owner, 2026-08-02**, at the P01 foundation task.
**ADR-013 signed by the owner, 2026-09-17**, at the P03-T01 resume. Supersedes
ADR-012 in full. ADR-006 otherwise stands.
**ADR-014 signed by the owner, 2026-09-23**, at the P03-T07 land task.

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

---

## ADR-012 — One Supabase environment until the first real tenant

**SUPERSEDED 2026-09-17 by ADR-013.** The decision, context, consequences,
reinstatement trigger, compensating controls and forecloses below are the
original text, unedited.

**Supersedes the two-environment clause of ADR-006.** ADR-006 otherwise stands
in full: one authoritative SQL source, migrations split verbatim in source order,
one applier per environment.

**Decision.** B2S runs a single Supabase project, named for production. Types are
generated from it, migrations are applied to it, and the isolation suite runs
against it.

**Context.** The organisation's plan allows two active projects and both slots
are held. The choice was one project or none. Naming the survivor production is
the reversible direction: adding staging later costs nothing, while promoting a
staging project to production costs a data migration.

**Consequences.** There is no environment in which to rehearse a destructive
migration, and no environment in which the isolation suite may seed and tear down
without care. Neither matters while the project holds no real tenant. Both matter
immediately once it does.

**Reinstatement trigger, and it is not a preference.** The isolation suite may
run against this project **only while it holds zero real tenants.** Before the
first real tenant is onboarded, a staging project is created and this ADR is
superseded. The trigger is a row count, not a judgement.

**Compensating controls, in force from now.** Synthetic test tenants carry a
reserved slug prefix and are torn down by the same task that seeds them. Once any
non-synthetic tenant exists, no migration is applied without the schema diff
reviewed and a backup snapshot taken first.

**Forecloses.** Treating one project as two by convention, which is how a
migration meant for staging reaches real data.

---

## ADR-013 — Two Supabase environments

**Supersedes ADR-012 in full.** ADR-006 stands: one authoritative SQL source,
migrations split verbatim in source order, one applier per environment.

**Decision.** B2S runs two Supabase projects on a Pro organisation, staging
and production. Migrations are applied to staging first and to production
under review per `BRANCHING.md`. Types are generated from staging. The
isolation suite runs against staging only and is a required job on any pull
request touching schema.

**Context.** ADR-012's constraint was a plan slot, not a preference — the
free organisation allowed two active projects and both were held, so the
choice was one project or none. The organisation is now on Pro and that
constraint is gone. ADR-012 named adding staging later as the reversible
direction and set a row count as its trigger; the trigger has not fired, and
creating staging while both counts read zero is the cheapest this move will
ever be. Free-tier staging was considered and rejected: free projects
auto-pause after a week of inactivity, and a project touched only on
schema-touching pull requests is idle most weeks, which would convert a
required CI job into an intermittent failure people learn to re-run. A
paused environment is worse than a declared absent one. PR-40 fixes that
production keeps its name and its ref.

The ambiguity ADR-012 left is deleted, not adjudicated. `BUILD_PHASES.md`
§P03 named the wizard's first real content as the trigger; ADR-012 and
CF-92 named the first non-synthetic tenant. Which comes first no longer
matters: production never runs the isolation suite again, from this ADR
forward, at any row count. ADR-012's permission is withdrawn in the same
commit that lands this, not on a later condition.

**Consequences.** A destructive migration can be rehearsed. The suite seeds
and tears down against an environment that will never hold a buyer's data.
CF-109 closes — an isolation regression is caught at the pull request rather
than at the next phase gate. `types-drift` reads staging, because a phase
branch's committed types describe the schema staging holds and production
has not yet received; that production's catalog and migration ledger match
the repository remains the phase exit gate's assertion, where it already
is.

**Known gap.** Staging runs a newer Postgres patch than production (CF-161),
so until the levels match the rehearsal is not faithful in that one
dimension. This does not block. The owner's production upgrade is the
closing act.

**Compensating controls, amended.** The reserved synthetic slug prefix and
same-task teardown move to staging. The rule that no migration reaches
production without a reviewed schema diff and a backup snapshot is not
retired — it becomes unconditional rather than conditional on a
non-synthetic tenant existing, because production is now the environment
nothing rehearses on.

**Forecloses.** Running the isolation suite against production on any
argument, including a zero row count; treating staging as a second
production; generating types from an environment other than the one
migrations reach first.

**AMENDED 2026-09-19 (P03-T02).** The Decision sentence "a required job on
any pull request touching schema" stands and is not edited (PR-07). It is
not untrue: the job remains required on those pull requests. P03-T02
additionally fires the same job on `push` to every branch, same path
filter, serialised by concurrency group `tenant-isolation-staging` with
`cancel-in-progress: false`. BRANCHING §3 makes a pull-request-only
trigger gate-only again — the condition CF-109 existed to end — which is
why the push trigger is broad and the concurrency group, not a narrower
branch set, is what prevents two suites seeding one database. The
Consequences clause that an isolation regression is "caught at the pull
request rather than at the next phase gate" is therefore incomplete as a
description of *when* the job fires, and is left standing as the close
reason recorded at P03-T01-RESUME.

**AMENDED 2026-09-22 — the recovery-point control, restated without Docker
and triggered by data.** ADR-013's compensating control — a reviewed schema
diff and a recovery point before any production migration — stands. Its
mechanism is specified here, because the one first attempted
(`supabase db dump`) requires Docker, which is rejected (OD-H14). The
Decision, Context, Consequences, Known gap, Compensating controls and
Forecloses paragraphs above are unedited (PR-07).

A recovery point has two halves.

**Schema — every production migration, without exception.** The migration
chain is the schema backup. P03-T01-RESUME proved it reconstitutes the
schema from nothing on a virgin project, and ADR-006 requires every
migration to be independently revertible. Before each production migration
the remote migration ledger and a catalog fingerprint are recorded.

**Data — from the first non-synthetic row.** Every production-migration
task already measures `public.tenant` and `auth.users` in production by a
path the isolation suite does not use. While both read zero there is no
data to recover, and the schema half is the complete recovery point. The
moment either reads non-zero, the following becomes mandatory immediately
before `supabase db push` to production, and the task HALTS without it
(PR-41):

1. `pg_dump` in custom format (`-Fc`), PostgreSQL 17 client tools installed
   natively, through the session pooler on port 5432 — never the
   transaction pooler on 6543, which breaks `pg_dump`'s COPY protocol.
2. Written to a local path outside the repository. Never committed, never
   uploaded, never a workflow artifact: artifacts on a public repository
   are downloadable by other users, and a production dump there is a
   public copy of buyers' data.
3. Verified with `pg_restore --list`: readable, and its table of contents
   names every table the catalog holds.
4. Never restored into staging to verify it. Staging never holds a buyer's
   data (this ADR).
5. The repository records timestamp, byte size, SHA-256 and
   table-of-contents count — never the file, its contents or the
   connection string.
6. Retained until the migration is proven and superseded by the next dump.

Before the first dump, the client binaries' code signature is verified.
They were obtained after the official installer returned HTTP 403, and a
binary of unverified provenance does not handle a production password.

Supabase's platform daily backup is a physical snapshot, platform-held and
not portable. It is a second layer against losing the project, not this
control: it cannot undo one migration applied hours after it ran.

**Responsibility.** The owner accepts, on the record, that the first real
dump will run on the day real data is at stake rather than being rehearsed
beforehand.

**The record, stated honestly.** P03-T03 and P03-T04 applied to an empty
production database with the schema half recorded and no data snapshot.
Under this amendment that is the complete recovery point for an empty
database, not an exception.

**AMENDED 2026-09-22 — provenance, not signature.** The P03-T05 amendment
requires that "before the first dump, the client binaries' code signature
is verified". The installed `pg_dump.exe` carries no Authenticode signature
(NotSigned, measured at P03-T05), so that clause could never pass and would
halt the first real dump on its own precondition. The requirement was
provenance; a signature is one way to establish it. Restated: before the
first dump, the client binaries' provenance is verified — by a valid
signature where the binary carries one, otherwise by the publisher's
published checksum for the archive the binaries came from. A binary whose
provenance cannot be verified by either route does not handle a production
password. The Decision, Context, Consequences, Known gap, Compensating
controls, Forecloses paragraphs and both earlier amendments above are
unedited (PR-07).

---

## ADR-014 — Component-rendered accessibility tier

**Decision.** Two devDependencies: jsdom, as the DOM implementation, and
axe-core, as the accessibility-rule engine. They are used only by
component-rendered tests, selected per test file; the global vitest
environment stays `node` and `vitest.isolation.config.mts` is untouched.
No matcher-wrapper package: tests assert on the engine's result directly.

**Context.** vitest runs in environment `node`, and the existing component
test asserts `renderToStaticMarkup` output, which is a string, not a
document. An accessibility-rule engine walks a document.
`UX_PRINCIPLES.md` §11 said this tier needed "one dev dependency";
P03-T06's inventory showed it needs two.

**Consequences.** A simulated DOM computes no layout and no rendered
colour, so rules that depend on either — colour contrast among them —
cannot be evaluated in this tier. They are excluded here by an explicit
list that the tier asserts, and the browser-rendered tier (CF-177) owns
them. A pass in this tier is never reported as a contrast pass. Licences:
jsdom MIT; axe-core MPL-2.0, file-level copyleft, acceptable as a
devDependency that never reaches the client bundle.

**Forecloses.** A DOM environment for every unit test; a simulated-DOM
pass reported as a rendered pass; an accessibility claim this tier cannot
observe; a matcher wrapper as a third dependency.

