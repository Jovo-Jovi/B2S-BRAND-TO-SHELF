# SECURITY MODEL — B2S

**Status:** AUTHORED. Tier 3a, precedence slot 5.
**Authored:** 2026-08-01 by the reviewer surface.
**Closes:** CF-31.
**Depends on:** `TENANCY_MODEL.md`, `DOMAIN_MODEL.md`, `DECISIONS.md`.

> `TENANCY_MODEL.md` says who owns what. This document states the isolation
> guarantee in **testable** terms and names the evidence that closes its gate.
> Mechanism is `ARCHITECTURE.md`'s, after Gate 3. Nothing here names a library,
> a policy syntax, or a folder.

---

## 1. The guarantee

> **No request executed in the authorisation context of tenant A can read, infer
> the existence of, or modify any record belonging to tenant B — regardless of
> the request's shape, the role held, or the identifier supplied.**

Four parts, each independently testable.

**Read.** No response body ever contains a tenant B record.

**Existence.** No response *distinguishes* "does not exist" from "exists but
belongs to another tenant." Status codes, timings, error text and validation
messages are identical for both. An enumerable identifier that returns a
different response for a foreign record is a breach even when it returns no data.

**Modify.** No write, delete, archive or state transition reaches a tenant B
record, including writes that supply a foreign identifier as a foreign key on an
otherwise valid own-tenant record.

**Availability.** No request executed in tenant A's context can cause a member
of tenant B to lose access to tenant B. *Testably:* take any member of tenant B
and record what they read. Let tenant A do anything the API permits — every
write, on every table, with every identifier belonging to that member. Read
again. **The two counts are equal, on every table, always.** A single row that
falls to zero is a breach, whether or not anything of tenant B was read,
inferred or modified.

> Availability was added by P01-T04, and it was added because the first three
> parts were all true of a live exploit. A tenant owner could bind a member of
> another tenant into their own tenant as a second `active` membership, and
> `current_tenant_id()` — which fails closed on more than one, deliberately —
> then returned null, so the victim read nothing anywhere. Every record created
> lived in the attacker's tenant. Read, existence and modify were each satisfied
> while the victim was locked out of their own company by a stranger. A
> guarantee that a proven attack satisfies is not yet the guarantee.

**This gate cannot be waived by OD.** Every other standard in this platform can
be traded against schedule by a signed decision. This one cannot, because a
failure is not recoverable by a later fix: data disclosed is disclosed.

---

## 2. Default deny

**Authorisation is enforced at the data layer. Every other check is convenience.**

1. **The data layer denies by default.** Access is granted by explicit rule, never
   assumed by absence of a rule.
2. **UI gates and request-layer checks are UX and defence in depth, never the
   boundary.** A missing UI check is a bug. A missing data-layer rule is a breach.
3. **Enabling protection without a rule fails closed and silent** — permitted data
   silently returns empty. Therefore every gate tests the **positive** path too:
   the tenant's own data must actually come back. A test suite that only proves
   "A cannot read B" passes trivially against a system that returns nothing to
   anyone.
4. **Rules and grants compose.** A rule that looks harmless in isolation can widen
   reach when combined with a broad grant. Both are reviewed together, always.
5. **Any privileged path that bypasses tenant rules is physically quarantined**,
   reachable from exactly one place, and every use writes an `ActivityEvent`.

**§11 is the exceptions list.** Every mechanism that can bypass the data layer's
rules is enumerated there with its reachability, and the enumeration is
re-derived from the live catalog at every phase exit gate.

---

## 3. The five testable properties

Each is a claim a test can fail. These are the acceptance criteria for the
tenant-isolation standard.

**P1 — Cross-tenant read returns nothing.** For every entity type, a request in
tenant A's context supplying a valid tenant B identifier returns no record.
*Evidence:* one automated test per entity type, run against the live environment.

**P2 — Cross-tenant existence is indistinguishable.** For every entity type, the
response for a foreign identifier is byte-identical in status and shape to the
response for a non-existent one.
*Evidence:* paired assertions, foreign versus nonexistent, per entity type.

**P3 — Cross-tenant write is rejected.** For every mutable entity type, a write
in tenant A's context targeting a tenant B record fails, and no partial effect
persists. Includes supplying a foreign foreign-key on an own-tenant record.
*Evidence:* one test per mutable entity type, asserting both rejection and
absence of side effect.

**P4 — The positive path works.** For every entity type, a tenant reading its own
data receives it. Non-empty, correct, complete.
*Evidence:* seeded fixtures asserted to return. **Required — this is what catches
fail-closed-and-silent.**

**P5 — Every rule is exercised.** No entity type ships without P1–P4 covering it.
An entity with no isolation test is treated as having failed, not as untested.
*Evidence:* a coverage assertion mapping every entity in `DOMAIN_MODEL.md` §2 to
its four tests. **87 entities, 4 properties.**

---

## 4. What closes the gate — CF-31

CF-31 recorded that isolation correctness was an *ungated gate*: asserted,
never proven. It closes here, with this definition.

**The gate is closed by, and only by:**

1. **P1–P5 green against the live environment**, not against a local stub and not
   against code review. Rules are read from the live catalog, not from source.
2. **A coverage report** mapping all 87 entities to their four properties, with no
   gaps and no exemptions.
3. **A written adversarial review** of the rule set and the grant set *together*,
   by the heavyweight model class, asking what combination widens reach.
4. **Zero privileged-path uses outside the quarantined location**, proven by an
   automated check, not by inspection.

**Re-run conditions.** Every one of these re-runs the full gate, not a subset:
a new entity type · a change to any access rule · a change to any grant · a new
privileged path · a role definition change · any change to the `Operator` surface.

**No evidence means FAIL.** A gate closed on partial evidence has not been closed.

---

## 5. Operator access controls

`TENANCY_MODEL.md` §5 states the policy. This states the enforcement.

| Control | Requirement |
|---|---|
| Default reach | Metadata, usage and billing only. Business data is out of reach by construction, not by policy |
| Elevation | Only through a live `ConsentGrant` created by a tenant `Owner`, scoped and time-boxed |
| Expiry | Lapses automatically. Cannot be extended, only replaced by a new grant |
| Logging | An `ActivityEvent` for the grant and for **every access under it**, readable in full by the tenant |
| Revocation | Immediate, by the `Owner`, at any time |
| Emergency override | **None exists.** An override that exists is an override that will be used |

**Testable:** an `Operator` request for tenant business data with no live
`ConsentGrant` is indistinguishable from a cross-tenant request — it returns
nothing and reveals nothing. That is P1–P3 applied to the operator surface, and
it is covered by P5.

---

## 6. PII handling

Per OD-G6. B2S holds two classes: **`Member` PII** (platform-scoped identity) and
**`Buyer` PII** (tenant-scoped business data, and the tenant's responsibility to
its own buyers).

| Rule | Applies |
|---|---|
| PII is never a natural key | Both — identity is always a generated key (`DOMAIN_MODEL.md` invariant 2) |
| PII never enters a log, an error message, or an `ActivityEvent` payload | Both. Events record the record's key and the action, never its contents |
| PII never enters a `PrintArtifact` filename or object-storage path | Both |
| Buyer PII is exportable and deletable on the tenant's instruction | `Buyer` |
| Member PII survives tenant deletion | `Member` — a person is not a tenant's property |
| **No real buyer data ever enters the repository, including test fixtures. Fixtures are synthetic** | Absolute, per OD-G7 |

---

## 7. Audit trail

Per OD-C15. `ActivityEvent` is append-only and never edited or deleted.

**Every event records:** who (`Member` or `Operator`), what action, which entity
type and key, when, which tenant, and — where an elevation was used — which
`ConsentGrant`.

**Mandatory events:** every write to an immutable document · every `Payment` and
`CreditNote` · every `StockMovement` · every role or membership change · every
`ConsentGrant` lifecycle step and every access under one · every `ImportRun` ·
every `BackupSnapshot` and every deletion request · every privileged-path use.

**Never recorded:** PII values, secrets, or full record contents. The event names
the record; the record holds the data.

**The audit trail is tenant-readable.** A tenant that cannot inspect who touched
its data has not been given ownership of it.

---

## 8. Public-repository prevention rules

Per OD-G7. **Prevention, not later removal — history is permanent.**

1. Never commit any environment file, service-role key, connection string, or
   credential.
2. A publishable client key is safe **only if the data-layer rules are correct**.
   That makes rule correctness a gate, not a nicety — which is §4.
3. Privileged keys exist only in the host platform's secret store. Never in the
   repository, never in a client bundle, never in a migration.
4. Push protection is the enforcement mechanism and is never disabled.
5. A pre-commit hook blocks environment files, privileged key patterns, and long
   base64 blobs.
6. **Accepted as public:** schema, access rules, method documents, retiring tools.
7. **No real buyer data, invoice, or buyer list ever enters the repository** —
   including fixtures.
8. **A credential pasted into any AI surface is treated as compromised and
   rotated immediately.** No exceptions, no assessment of likelihood.

**Known residual, accepted and tracked:** the owner's OS account name is
permanently in git history at three locations under `legacy/`, which
`legacy/FREEZE.md` forbids modifying. Current-content occurrences are redacted.
This cannot be fully removed while `legacy/` is preserved verbatim in a public
repository. Tracked as CF-14, with a four-option OD pending. It is an identifier,
not a credential; it is disclosed, not exploitable.

---

## 9. Pre-launch audit

Run before public launch. **An audit, not a removal** — history is permanent.

- [ ] Full-history secret scan, not just the working tree
- [ ] Confirm no privileged key was ever committed — if one was, **rotate it**;
      deleting it is not remediation
- [ ] Confirm no real buyer, invoice or payment data in any commit
- [ ] P1–P5 green against production, with the 87-entity coverage report
- [ ] Adversarial rule-and-grant review, written, by the heavyweight class
- [ ] Confirm the `Operator` surface's actual reach matches `TENANCY_MODEL.md` §5
      and the terms of service — tested, not asserted
- [ ] Confirm every privileged-path use is quarantined and logged
- [ ] Decide whether the repository stays public at commercial launch. If it goes
      private, understand that already-pushed content stays disclosed

---

## 10. What this forecloses

| Failure | Foreclosed by |
|---|---|
| A tenant reading another's data | §1, proven by P1 |
| A tenant locking another tenant's member out of their own tenant | §1 availability — the read count before equals the read count after |
| Support staff reading a business row with no live grant, or reading one unlogged | §5, and the declared read path `DATA_MODEL.md` §2 requires |
| Inferring a record's existence without reading it | §3 P2 |
| A foreign key smuggling a foreign record into a valid write | §3 P3 |
| Protection enabled with no rule, returning silence to everyone | §3 P4 — the positive path is mandatory |
| An entity shipping with no isolation test | §3 P5 — untested is failed |
| A harmless-looking rule widening reach through a broad grant | §2.4, §4.3 |
| Support staff browsing tenant data | §5 — no ambient reach, no override |
| PII in a log, a filename, or a fixture | §6 |
| An unauditable data touch | §7 |
| A credential in a public repository | §8 |
| Isolation asserted but never proven | §4 — CF-31 |
| A bypass mechanism nobody wrote down, and therefore nobody re-checks | §11 — enumerated, and re-derived from the live catalog at every phase exit gate |

---

## 11. What can bypass RLS

ADR-005 promises that reviewing "what can bypass isolation" is reading one file
rather than searching a codebase. The P01 exit gate found that it was not: four
roles carrying `rolbypassrls` were named in no document in this repository. None
was reachable from the API, so this was a documentation gap and not a hole — but
an undocumented bypass is one nobody is watching, and nobody can re-check a list
that does not exist. This section is that one file.

Every entry is derived from the live catalog of the one Supabase project
(ADR-012), never from source. A bypass that exists in the database and not in
the schema file is exactly the kind this section is for.

The second P01 exit gate ran that re-derivation for the first time and found six
mechanisms this section did not name. It was restructured in response, at
P01-T06-FIX, and the restructure is the subject of §11.0.

### 11.0 Two tiers, because the requirement differs

The section was not wrong about what it described. It was ambiguous about what
it was describing, and the ambiguity was its own. §11.2 read "Six exist, all in
schema `public`" — a claim about the objects **this project created**, phrased as
a claim about **the whole catalog**, which holds nine. A re-derivation reads the
catalog, and the catalog does not know the difference, so it cannot make the
distinction the sentence silently assumed.

Widening the list would not have fixed that. The fix is structural: this section
is in two tiers, and they are held to different standards.

| Tier | What is in it | The requirement |
|---|---|---|
| **§11a — B2S-owned** | Objects this project creates and controls: the `public` functions, the `public` tables, and the privileged key this application holds | **Individual justification.** Each entry states why it must read past the caller's policies and what contains it. An object in this tier that the project did not deliberately create is a **hard failure** — no "the platform put it there" answer is available in this tier |
| **§11b — Platform-owned** | Objects Supabase creates in its own schemas and its own roles. The project does not control them and cannot remove them without breaking the platform | **Enumeration and change detection.** Each entry states owner, schema, measured reachability from `anon`, `authenticated` and `authenticator`, and why it is acceptable. An **unchanged** platform object is not a failure. An **unlisted** one is |

Tier b is not a weaker rule; it is a different one. Justifying
`pgbouncer.get_auth` is not this project's to do, and pretending otherwise
produces a paragraph nobody can maintain and nobody believes. What this project
can do is state that the object exists, state what it can reach, and notice the
day either answer changes. That is the whole of the requirement, and it is met by
re-deriving the tier, never by reading it.

### 11.0.1 How reachability is measured, and the one way to get it wrong

**`pg_has_role(role, target, 'MEMBER')` is the `SET ROLE` test. `'USAGE'` is not,
and here it answers the opposite way.** This is mandatory, not advisory: a gate
that measures reachability with `USAGE` has asked a different question, and its
answer is not evidence of anything this section claims.

`USAGE` reports automatic privilege inheritance. Supabase grants `service_role`
to `authenticator` with `NOINHERIT`, so `authenticator` inherits none of
`service_role`'s privileges automatically and a `USAGE` audit reports that it
cannot reach `service_role`. That is false, and it is reassuring in the worst
possible way for a question about what can bypass RLS: PostgREST reaches
`service_role` by issuing an explicit `SET ROLE`, which is precisely what
`MEMBER` measures. `MEMBER` is also transitive, so it is the only one that
answers "can this role become that role **by any chain**".

Measured live, side by side, on the single most important cell in this section:

| Question | `MEMBER` answers | `USAGE` answers |
|---|---|---|
| Can `authenticator` become `service_role`? | **yes** | no |

**A function is measured three ways, for the same reason.** A role holding no
`EXECUTE` on a function may still call it by first becoming a role that does, so
every function below is measured on schema `USAGE`, on direct `EXECUTE`, and on
reachable-by-`SET ROLE`. The third measurement is what found the `vault` path in
§11b.1 — a path that both of the first two had already reported as unreachable.

A superuser is implicitly a member of every role, so `pg_has_role` answers `true`
for `supabase_admin` against everything. Those rows are an artefact of
superuser-ness rather than a grant, and §11b.3 marks them as such rather than
filtering them out, because a filtered row is one nobody can re-derive.

---

### §11a — B2S-owned

Objects this project created and controls. Each is individually justified. An
entry here that the project did not deliberately create is a hard failure.

#### 11a.1 `security definer` functions in `public`

A `security definer` function executes with its owner's privileges and therefore
reads past the caller's policies by design. **Six exist in schema `public`**, all
owned by `postgres`, and all with `search_path` pinned to the empty string. The
live catalog holds **nine** in total; the other three are Supabase's own and are
enumerated in §11b.1. Stating the count without stating the tier is the defect
§11.0 exists to close.

The pin is the control that matters: without it, a caller who can create a
schema can place their own table ahead of `public` on the search path and have
the function read theirs instead.

| Function | `search_path` | Why it must read past the caller's policies |
|---|---|---|
| `current_tenant_id()` | `''` | Resolves the caller's tenant by reading `membership`. It cannot be subject to the policies it exists to evaluate |
| `is_operator()` | `''` | Reads `operator`, a table no tenant member has any policy to read |
| `is_current_tenant_owner()` | `''` | A policy on `membership` cannot read `membership` — PostgreSQL raises infinite recursion. This is the only legal expression of a stated rule |
| `enforce_tenant_active_owner()` | `''` | Counts a tenant's active owners across rows the acting member may not see, or the constraint could be defeated by hiding one |
| `has_live_consent_grant(uuid)` | `''` | Evaluates the grant that gates operator reach, on a table the operator has no policy to read |
| `operator_read_activity_event(uuid)` | `''` | The one declared operator read path. Refuses without a live grant, writes the log before returning, and omits `payload` from its return type |

Each is `EXECUTE`-revoked from `public` and granted explicitly — CF-105 records
why: `revoke all on all tables` does not cover functions, and a `public`
function defaults to `EXECUTE` for `PUBLIC`, which makes it an RPC endpoint any
anonymous caller can reach.

#### 11a.2 Table ownership

All six `public` tables are owned by `postgres`. A table's owner is exempt from
its own row-level policies unless the table is declared `FORCE ROW LEVEL
SECURITY`, and none of the six is. Ownership is therefore a real bypass and is
listed here as one.

It is not reachable through PostgREST. The API connects as `authenticator`,
which is not `postgres` and — per §11b.3, measured transitively with `MEMBER` —
cannot `SET ROLE` to it. Reaching the owner needs a direct Postgres connection
with the `postgres` credential, which lives outside the application entirely.
RLS is enabled on all six tables; `FORCE` is what would additionally bind the
owner, and its absence is the reason this row exists rather than a defect to fix
here.

#### 11a.3 `service_role`, and what contains it

The role itself is Supabase's and is enumerated in §11b.2. What is B2S-owned,
and what this entry justifies, is that this application **holds its key** —
`service_role` is the one bypass reachable through the API and the only one the
application can hold. It is contained by construction, not by rule:

- **ADR-005** — the privileged client is constructed in exactly one server-only
  module and nowhere else. `check-service-import` fails the build on any import
  of it from `app/`, `features/` or `components/`, and fails if the quarantine
  directory itself disappears rather than passing for want of anything to check.
- **§2.5 of this document** — every use writes an `ActivityEvent`.
- **§8 and OD-G7** — the key exists only in the host platform's secret store,
  never in the repository, never in a client bundle, never in a migration.
- It cannot log in directly (`rolcanlogin` is false) and is `NOINHERIT` from
  `authenticator`, so it is reached only by an explicit `SET ROLE` that PostgREST
  issues only for a request whose key names it.

---

### §11b — Platform-owned

Objects Supabase creates in its own schemas and its own roles. The project did
not create them, cannot justify them on the platform's behalf, and cannot remove
them. The requirement is therefore enumeration and change detection: each entry
below states owner, schema, measured reachability and why it is acceptable, and
the whole tier is re-derived at every phase exit gate. An unchanged platform
object is not a failure; an unlisted one is.

#### 11b.1 `security definer` functions outside `public`

Three, against §11a.1's six. All owned by `supabase_admin`, all with
`search_path` pinned to the empty string — the same control §11a.1 relies on,
applied by the platform rather than by us.

| Function | Schema (owner) | Owner | `search_path` | `anon` | `authenticated` | `authenticator` |
|---|---|---|---|---|---|---|
| `pgbouncer.get_auth(p_usename text)` | `pgbouncer` (`pgbouncer`) | `supabase_admin` | `''` | no | no | no |
| `vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid)` | `vault` (`supabase_admin`) | `supabase_admin` | `''` | no | no | **by `SET ROLE service_role` only** |
| `vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid)` | `vault` (`supabase_admin`) | `supabase_admin` | `''` | no | no | **by `SET ROLE service_role` only** |

Each cell is three measurements, per §11.0.1: schema `USAGE`, direct `EXECUTE`,
and reachable-by-`SET ROLE`. `anon` and `authenticated` fail all three on all
three functions. `authenticator` fails the first two on all three functions —
and passes the third on both `vault` functions, because `service_role` holds
`USAGE` on `vault` and `EXECUTE` on both, and `authenticator` is a member of
`service_role`. The complete `EXECUTE` holder set is `pgbouncer` and
`supabase_admin` for `pgbouncer.get_auth`, and `postgres`, `service_role` and
`supabase_admin` for the two `vault` functions.

**Why this is acceptable.** `pgbouncer.get_auth` is the connection pooler's own
credential lookup and is unreachable from the API by every measurement. The two
`vault` functions are Supabase Vault's write path, and the only API-side reach
runs through `service_role` — which already bypasses every policy on every
table, so the path grants a holder of the privileged key nothing it does not
already have. What contains that key is ADR-005's quarantine, stated at §11a.3.
The project calls none of the three.

**The `SET ROLE` column is why §11.0.1 is mandatory.** The second P01 exit gate
measured these functions on schema `USAGE` and `EXECUTE` alone and recorded all
three as unreachable by all three API roles. On direct privilege that is
correct. It is the same class of mistake `USAGE` makes about roles, one level
down, and only the third measurement finds it.

#### 11b.2 Roles carrying `rolbypassrls`

`rolbypassrls` exempts a role from every row-level policy on every table, with
no per-table opt-out. Five roles carry it, out of sixteen non-`pg_` roles in the
cluster. All five are Supabase's; this project creates no role.

| Role | Superuser | Can log in | Inherits | Reachability |
|---|---|---|---|---|
| `postgres` | no | yes | yes | Direct Postgres connection with its own credential |
| `service_role` | no | no | yes | Through the API, and only with the privileged key — §11a.3 |
| `supabase_admin` | yes | yes | yes | Supabase platform internals |
| `supabase_etl_admin` | no | yes | yes | Supabase platform internals |
| `supabase_read_only_user` | no | yes | yes | Supabase platform internals |

#### 11b.3 Every `MEMBER` path into a bypass role

Ten, measured transitively with `MEMBER` per §11.0.1. Six are grants; four are
`supabase_admin`'s implicit superuser membership, marked as such rather than
filtered out.

| Grantee | Bypass role | How | Can log in | Inherits |
|---|---|---|---|---|
| `authenticator` | `service_role` | direct grant | yes | no — `NOINHERIT` |
| `cli_login_postgres` | `postgres` | direct grant | yes | no — `NOINHERIT` |
| `cli_login_postgres` | `service_role` | transitive, via `postgres` | yes | no |
| `postgres` | `service_role` | direct grant, `WITH ADMIN OPTION` | yes | yes |
| `supabase_realtime_admin` | `service_role` | direct grant | no — `NOLOGIN` | no |
| `supabase_storage_admin` | `service_role` | transitive, via `authenticator` | yes | no |
| `supabase_admin` | `postgres` | superuser-implicit | yes | yes |
| `supabase_admin` | `service_role` | superuser-implicit | yes | yes |
| `supabase_admin` | `supabase_etl_admin` | superuser-implicit | yes | yes |
| `supabase_admin` | `supabase_read_only_user` | superuser-implicit | yes | yes |

Only the first row starts at an API-facing role, and it is the one §11a.3
contains. **Neither `anon` nor `authenticated` reaches any of the five bypass
roles by any chain** — ten cells, all false, measured with `MEMBER`. No
escalation runs from an anonymous or an authenticated session to a bypass.

`postgres → service_role` and `cli_login_postgres → service_role` are
consequences of rows already in this table rather than new grants, and both are
listed anyway: §11.5 asks what the catalog holds, not what is novel.

#### 11b.4 `cli_login_postgres` — the only credential on this list

Every other entry in §11b is an internal. This one is a **login role with a
password**, and it is a member of `postgres`, which carries both `rolbypassrls`
and §11a.2's ownership bypass. A live password here would be a full bypass with
a way in attached.

**What created it.** The Supabase CLI. `supabase link` and `supabase db push`
need no database password because the CLI provisions a temporary login role
through the Management API using the access token, printing "Initialising login
role…" — recorded as an environment quirk at P01-T02, before this role was
noticed in the catalog. The name, the `LOGIN` attribute and the short-dated
`VALID UNTIL` all match that origin.

**What depends on it: nothing.** Measured, not assumed — it owns zero relations,
schemas, functions, types and databases; holds zero table privileges; has zero
default-ACL entries; has zero rows in `pg_shdepend`; carries no comment; and has
zero active sessions.

**Its credential is already dead.** `VALID UNTIL 2026-08-03 13:03:08.837799+00`,
measured expired at 2026-08-04 10:50:12 UTC. It cannot authenticate today.

**Recommended: revoke it.** It is residue of CLI linking, nothing needs it, and
the shape it leaves behind — a login role one `SET ROLE` from `postgres` — is
not one to keep for no reason. **Not done here.** Dropping or altering a
platform-managed role is not a fix task's call; it is the owner's. Two things a
later task should know: revocation is cosmetic while the password stays expired,
and the CLI re-provisions one on the next `link` or `db push`, so a
`cli_login_*` role reappearing is expected and is not a regression.

#### 11b.5 Event triggers

Six, all owned by `supabase_admin`, all enabled on origin. Their functions live
in `extensions`, are all owned by `supabase_admin`, are **none of them
`security definer`**, and all carry an unpinned `search_path`.

| Trigger | Fires on | Function |
|---|---|---|
| `issue_graphql_placeholder` | `sql_drop` | `extensions.set_graphql_placeholder` |
| `issue_pg_cron_access` | `ddl_command_end` | `extensions.grant_pg_cron_access` |
| `issue_pg_graphql_access` | `ddl_command_end` | `extensions.grant_pg_graphql_access` |
| `issue_pg_net_access` | `ddl_command_end` | `extensions.grant_pg_net_access` |
| `pgrst_ddl_watch` | `ddl_command_end` | `extensions.pgrst_ddl_watch` |
| `pgrst_drop_watch` | `sql_drop` | `extensions.pgrst_drop_watch` |

**Ruled, not assumed: these are not an RLS bypass.** They fire only on DDL, and
no API role can issue DDL — `anon`, `authenticated` and `authenticator` hold
`CREATE` on **zero** schemas, measured across every schema in the database. None
of the six functions is `security definer`, so none acquires its owner's
privileges when it runs.

**What they are is a code-execution surface owned by `supabase_admin`**, and
that is the characterisation this section records rather than the one it leaves
to the next reader to guess. Every migration this project applies is DDL, so
four of the six fire inside our own transactions and run `supabase_admin`-authored
code with an unpinned `search_path`. Nothing there is reachable from a tenant
session and nothing there is ours to change — which is exactly the tier b shape:
enumerated, measured, and watched for change.

---

### 11.5 The standing rule

**This inventory is re-derived at every phase exit gate. A mechanism that
appears in the derivation and is not in this document is a hard failure of that
gate.**

That is what turns a one-time audit into a standing check. The gate does not
read this list and confirm it; it queries the live catalog and compares.

**What to enumerate**, in six categories:

1. `security definer` functions in **every** schema, with owner and
   `search_path` — §11a.1 and §11b.1.
2. Table ownership and `FORCE` state — §11a.2.
3. Roles carrying `rolbypassrls` — §11b.2.
4. Every `MEMBER` path into a bypass role, **from every role and not only from
   `authenticator`** — §11b.3.
5. Any login role on that list, with its password validity — §11b.4.
6. Event triggers, and any other `supabase_admin`-owned code-execution
   surface — §11b.5.

A mechanism outside all six is also a hard failure. The categories are what has
been found so far, not a closed set.

**The verdict differs by tier**, per §11.0:

- **§11a** — an object present in `public` that the project did not deliberately
  create is a hard failure, and so is one this document does not name.
- **§11b** — an object in the catalog and not in §11b is a hard failure. An
  object in §11b whose owner, schema, reachability and membership are unchanged
  is a **pass**. A change in any of those, unrecorded, is a hard failure. The
  gate re-derives the tier so that a change cannot be silent; it does not ask
  this project to defend Supabase's design.

This failure is not waivable by OD, on the same ground as §1: a bypass nobody
documented is a bypass nobody is watching, and the cost of discovering it late
is not recoverable by a later fix.

> **Numbering.** Before P01-T06-FIX this section ran §11.1 to §11.5. The content
> moved as follows: old §11.1 → §11b.2 and §11b.3; old §11.2 → §11a.1 and
> §11b.1; old §11.3 → §11a.2; old §11.4 → §11a.3. §11.5 keeps its number because
> other documents cite it by it.

---

*Tier 3a. Read with `TENANCY_MODEL.md`. Mechanism is `ARCHITECTURE.md`'s, after Gate 3.*
