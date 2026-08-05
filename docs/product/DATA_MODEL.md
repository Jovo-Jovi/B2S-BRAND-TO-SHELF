# DATA MODEL — B2S

**Status:** AUTHORED, Platform tier. Precedence slot 6.
**Authored:** 2026-08-01 by the reviewer surface.
**Depends on:** `DOMAIN_MODEL.md` (87 entities, 9 tiers), `TENANCY_MODEL.md`,
`SECURITY_MODEL.md`, `GLOSSARY.md`, `ARCHITECTURE.md`.

> **Scope of this revision.** `DOMAIN_MODEL.md` says what exists. This says how it
> is stored. Under OD-H7 it is authored one tier ahead of the phase that needs it.
> **This revision covers the Platform tier only** — the tenancy spine that
> Phase 01 builds and that every later table hangs from. The remaining eight tiers
> land as signed amendments, each one phase ahead of its module. That is
> deliberate: a storage shape authored six phases early is rewritten before it is
> used.
>
> This document specifies the schema. It does not contain the SQL. The builder
> authors `supabase/schema.sql` from it (ADR-006), and the exit gate verifies the
> live catalog against this document, not against the migration file.

---

## 1. Universal rules, and the three tables that depart from them

These rules govern every table unless §3 states otherwise for a table by name.
§3 departs three times, each departure deliberate and reasoned where it is
declared, and the live schema matches §3 exactly. Rules 1, 2, 5, 6, 7 and 8 are
departed from nowhere; only rules 3 and 4 carry exceptions, and these are all of
them:

| Table | Departs from | Why |
|---|---|---|
| `operator` | rule 3 and rule 4 | A platform administrator is not tenant data. The grant's own lifecycle is `granted_at`, `granted_by` and `revoked_at` — provenance and retirement stated in the terms that apply to it (§3.4) |
| `activity_event` | rule 3 and rule 4 | Append-only under rule 5. An immutable row has no `updated_at` to maintain and nothing to archive, so it carries `occurred_at` (§3.6) |
| `consent_grant` | rule 3 | Provenance per rule 4, but retirement is `revoked_at`: a grant is revoked or lapses and is never extended, and archiving it would hide the record an operator access is audited against (§3.5) |

A departure not listed here is a defect and not a decision. §3 states each in
full; this table exists so that a rule below is never read as a claim §3
contradicts.

1. **Tenant scope.** Every table except `tenant`, `member` and `operator` carries
   a non-null `tenant_id` referencing `tenant(id)`. There is no global collection.
2. **Identity is a generated key.** `uuid` primary key, database-generated. No
   name, code, email or Arabic string is ever an identifier (DOMAIN_MODEL §3.2,
   CF-65).
3. **Soft retirement.** `archived_at timestamptz null`. Rows are archived, never
   deleted. `brand_profile` and `artwork_version` may never be archived either
   (OD-D5) — that constraint arrives with the Brand tier.
4. **Provenance.** `created_at timestamptz not null default now()`,
   `updated_at timestamptz not null default now()`,
   `created_by uuid null references member(id)`.
5. **Immutable once issued.** Enforced by policy absence — no UPDATE policy is
   written for an immutable table, so no caller can update it. Applies to
   `activity_event` here; to `invoice`, `credit_note`, `artwork_version`,
   `print_artifact` and `document_artifact` in later tiers.
6. **Money is `numeric`.** Never `float`, `real` or `double precision`, anywhere,
   for any purpose (ADR-011). No money column exists in this tier.
7. **Enumerations store a language-neutral key.** A Postgres enum or a check
   constraint over lowercase ASCII identifiers. Display text is a
   `translation_entry`, never the stored value (OD-D7, CF-65).
8. **Naming.** `snake_case`, singular table names, matching the `GLOSSARY.md`
   entity name. `membership`, not `memberships`, and never `user`, `customer`,
   `admin`, `order`, `template` or any other §5 forbidden noun.

---

## 2. The RLS pattern

**Every table has RLS enabled and at least one policy.** RLS enabled with no
policy fails closed and silent — embedded selects resolve to empty for every
caller with no error anywhere. That is a documented incident in the method
reference and it is the single easiest way to ship a broken read path.

Four helper functions, `security definer`, pinned `search_path`, owned by the
schema owner. The first two are the tenancy spine; the third exists because a
policy on `membership` cannot read `membership` without recursing; the fourth is
the operator rule's predicate.

| Helper | Returns |
|---|---|
| `current_tenant_id()` | The tenant this request acts in, resolved per §2.1, or null |
| `is_operator()` | Whether the calling identity has an `operator` row |
| `is_current_tenant_owner()` | Whether the caller's membership in the tenant `current_tenant_id()` resolved carries role `owner` |
| `has_live_consent_grant(tenant_id)` | Whether that tenant has a `consent_grant` that is neither revoked nor lapsed, evaluated now |

### 2.1 `current_tenant_id()` — the resolution contract

OD-G14. The tenant a session acts in is **supplied by the caller as a selector
and resolved server-side against an active `Membership`, on every request.**
This table is the specification, not an illustration of it. Each row is asserted
by a named assertion in the tenant-isolation suite, cited in the last column.

| Caller-supplied selector | Caller's active memberships | Result | Asserted by |
|---|---|---|---|
| absent | 0 | null | 23o |
| absent | exactly 1 | that tenant | 23a |
| absent | 2 or more | null | 23b |
| present, malformed | any | null — **and it must not raise** | 23h |
| present, names a tenant with no active membership for the caller | any | null | 23e, 23f, 23g, 23i, 23j, 23n |
| present, names a tenant the caller holds active | any | that tenant | 23c, 23d |

**Held means `status = 'active' and archived_at is null`.** A membership that is
`invited`, `suspended` or archived is not held: it does not resolve when it is
selected, and it does not count toward the "exactly 1" above. An `active` row
carrying an `archived_at` is not held either — a predicate reading `status`
alone gets that case wrong, which is why 23g exists.

**Explicit beats implicit, and a wrong explicit fails closed.** A caller holding
exactly one active membership who supplies a selector naming a tenant they do
not hold resolves **null**. It does not fall back to the held one. Silently
acting in a tenant the caller did not ask for is worse than acting in none, and
23j is the assertion that stops the fallback being reintroduced as a
convenience.

**Malformed, unheld and nonexistent are one code path, not three.** The selector
is compared against the text form of the tenants the caller holds, so a value
that is not a uuid, a uuid naming a tenant they do not hold, and a uuid naming
no tenant at all are the same non-match. That makes §1's existence property
structural here rather than a matter of three branches agreeing: 23i asserts the
nonexistent and the unheld answers are byte-identical.

**The transport is an ordinary request header,** `x-b2s-tenant`, read
server-side out of the per-request settings PostgREST exposes. OD-G14
forecloses the two alternatives: a token claim would make the client the tenant
of record, and a stored per-person value would be shared across every session
and device that person has open. A header is neither — it is supplied per
request, by the caller, and nothing persists it. The name is matched
case-insensitively; an absent, empty or whitespace-only value is `absent`.

**A forged selector is harmless, and that is structural.** The value never
selects rows. It can only narrow the set of memberships re-derived from
`membership` on every call, and there is no value that adds one. The most a
caller achieves by forging it is to name a tenant they do not hold, whose answer
is null: they lose their own reach for that request and gain nothing anywhere.
23o asserts it from outside — anon, an unaffiliated member and an operator each
selecting a real tenant.

**The helper stays `stable`** even though it now reads a per-request value.
`current_setting()` is itself stable and the request settings are established
once per transaction before the statement runs, so the value cannot change
within a statement — which is exactly what `stable` promises. `volatile` would
be wrong in the other direction, forcing re-evaluation per row inside every
policy that calls it.

**The standard tenant policy**, applied to every tenant-scoped table:

```
USING       ( tenant_id = current_tenant_id() )
WITH CHECK  ( tenant_id = current_tenant_id() )
```

`WITH CHECK` is not optional. Without it a member can insert a row carrying
another tenant's `tenant_id` — the read is protected and the write is not.

**Operator reach — the rule, stated once here.** OD-G10 is a promise in the
terms of service; this is what makes it true rather than aspirational. §3's
per-table entries reference this and never restate it. Two classes, and a table
belongs to exactly one:

**Account metadata — `tenant` and `consent_grant`.** An unconditional
`is_operator()` SELECT policy. No consent grant is required and no access is
logged. This is G10's "account metadata, usage and billing" half. `consent_grant`
sits here because it is the authorisation record rather than the tenant's
business: an operator who cannot read it cannot tell whether the access they
hold is live, revoked or lapsed. `subscription` and `feature_flag` join this
class when billing lands.

**Tenant business data — `activity_event`, and every table in every tier after
this one.** **No operator policy on the table at all.** An operator reaches a
business row only through a *declared read path* — a `security definer` function
that (1) refuses a caller who is not an operator, (2) refuses unless
`has_live_consent_grant(tenant_id)` is true at that moment, (3) writes an
`activity_event` carrying `actor_operator_id` before returning anything, and
(4) projects away every column a support session does not need, `payload` first
among them. `operator_read_activity_event(tenant_id)` is the first such path.
Every later tier adds its own, or its tables stay out of operator reach entirely.

**Why a function and not a policy, for the business half.** Two mechanisms do
not exist at the granularity the rule needs, and pretending otherwise is how a
guarantee becomes decoration:

- *A policy cannot log.* PostgREST runs `GET` inside a `READ ONLY` transaction,
  so a policy expression that wrote an audit row would abort the very read it
  was auditing. "Every access under a grant is logged" (`SECURITY_MODEL.md` §5)
  is unreachable on a policy-mediated read.
- *A column grant cannot separate an operator from a member.* Both arrive as one
  database role, and column privileges are role-scoped. Dropping `payload` from
  that grant would drop it from the tenant's own audit trail too, which §7 gives
  the tenant in full. Excluding it from the operator alone is a projection, and
  a projection needs a function.

Because the function is the *whole* of the operator's business-data reach, both
properties are structural rather than trusted: no path returns `payload` to an
operator, and no path returns a business row to an operator without writing the
log.

**Grants and policies compose.** A permissive policy over a table-wide column
grant lets a member rewrite their own `role`. Column-scoped grants are used
wherever a self-referencing UPDATE policy exists — `membership.role` is
explicitly not member-writable.

---

## 3. The Platform tier

Six tables and four enums for Release 1. §3.7 is `role`, which is an enum,
deliberately not a table, and the only one of the four with a subsection of its
own. The other three — `tenant_status`, `membership_status` and `consent_scope`
— are declared inline in the column tables of §3.1, §3.3 and §3.5. That is why
this line read "one enum" until P01-T06-FIX: every value was specified and only
the stated total was wrong, which is PR-15's exact shape. The count is now
asserted against `supabase/schema.sql` by `scripts/check_stated_counts.py`.
`subscription` and `feature_flag` are Release 3 (`SCOPE.md`) and land with
billing.

**The four enums:** `role` · `tenant_status` · `membership_status` ·
`consent_scope`

That roster restates the paragraph above in one parseable line so a script can
read it. `scripts/check_data_model_schema.py` asserts this section against
`supabase/schema.sql` in both directions on every push (OD-H9): the stated table
and enum counts, the enum names on this line, and the table names in the §3.n
headings below, each of which must exist in the schema and be accounted for by it.

### 3.1 `tenant`
One company. One master `brand`. The root of every scope chain.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid pk | |
| `name` | text not null | The company's own name. Not an identifier |
| `slug` | text not null unique | URL-safe, lowercase, immutable after creation |
| `base_currency` | text not null | ISO 4217. Drives money precision, CS-03 |
| `default_locale` | text not null | `en` or `ar` at R1 |
| `status` | enum not null | `active`, `suspended`, `closed` |
| provenance + `archived_at` | | per §1 |

**RLS.** SELECT where `id = current_tenant_id()` or `is_operator()`.
No INSERT, UPDATE or DELETE policy for members — provisioning is a privileged
path (ADR-005). **A tenant cannot create or rename a tenant through the API.**

### 3.2 `member`
A person. Not tenant-scoped: one person may belong to several tenants over time,
and identity is global to the platform.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid pk | **Equals the Supabase Auth user id.** One identity, one row |
| `email` | citext not null unique | Sourced from auth, never separately editable |
| `display_name` | text null | |
| `preferred_locale` | text null | |
| provenance + `archived_at` | | per §1 |

**RLS.** SELECT and UPDATE where `id = auth.uid()`, UPDATE column-scoped to
`display_name` and `preferred_locale` only. Additionally SELECT where the row
shares a `membership` tenant with the caller — colleagues are visible to each
other, strangers are not. `email` is never updatable here; it is auth's.

### 3.3 `membership`
Binds a `member` to a `tenant` with a `role`. The join that carries data of its
own, and therefore an entity.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid pk | |
| `tenant_id` | uuid not null → tenant | |
| `member_id` | uuid not null → member | |
| `role` | enum not null | `owner`, `manager`, `designer`, `approver`, `viewer` |
| `status` | enum not null | `invited`, `active`, `suspended` |
| `invited_by` | uuid null → member | |
| `accepted_at` | timestamptz null | |
| provenance + `archived_at` | | per §1 |

**Unique** `(tenant_id, member_id)` where `archived_at is null`.
**At least one `active` `owner` per tenant** — enforced by a constraint trigger,
not by application code. A tenant with no owner is unreachable.

**RLS.** SELECT where `tenant_id = current_tenant_id()`, **or where the row is
the caller's own** (`member_id = auth.uid()`). INSERT and UPDATE restricted to
callers whose own membership in that tenant is `owner`.
**`role` is never self-writable** — no policy path lets a member raise their own
role, and the grant is column-scoped to make that structural rather than trusted.

The second SELECT clause is load-bearing for the rule below, and it has to be
this wide. PostgreSQL applies the SELECT policies to an UPDATE twice: to the old
row, because `UPDATE ... WHERE` reads existing values, and again to the new row,
so that no UPDATE can push a row out of the caller's own visibility. An invitee
therefore needs to see the row both as `invited` and as `active`, and a clause
restricted to `invited` refuses the exact transition it exists to permit — found
by measurement at the P01-T04 gate, not by reading the migration. Read on its
own terms the clause says something obvious anyway: a person may know which
tenants claim them, and in what role. No other member is exposed by it —
`membership_select_tenant` is still the only way to see somebody else's row, and
it still requires an active membership in that tenant.

**What it concedes.** An owner can put one row into a stranger's result set,
because inviting someone is how anyone joins a second tenant at all. It confers
nothing: the row is `invited`, it does not change what the stranger's session
resolves to, and ignoring it is a complete defence. §5 proof 9 asserts that from
the victim's side rather than assuming it.

**Invite, then accept. An owner may invite anyone; an owner may never make
anyone active.** An owner's INSERT must carry `status = 'invited'`, and the only
transition into `active` available to any caller is the invitee moving *their
own* row. Stated as the rule the policies enforce: **no write may leave an
unarchived `active` membership belonging to anyone but the caller.** An owner
keeps suspend and archive on their own tenant's rows, because neither produces
one. Provisioning the first `active` `owner` of a new tenant is therefore a
privileged path (ADR-005) and could not be anything else — there is no owner yet
to do the inviting.

**Why, and it is not tidiness.** The rule was written against a live exploit.
An owner who can force a stranger active can force a *second* active membership
onto a member of another tenant, and `current_tenant_id()` then returned null
for anyone holding more than one — so that member was locked out of the tenant
they actually belong to, by a stranger, through the ordinary API, needing
nothing but their `member.id`. Nothing of the victim's tenant is read, inferred
or modified, so the three parts of `SECURITY_MODEL.md` §1 did not cover it; §1
now carries a fourth, availability. Found live by the P01-T03 gate and recorded
as CF-103.

**The lockout is gone and the rule stays** (OD-G14). §2.1 resolves a selection
rather than failing closed on ambiguity, so a second active membership no longer
costs anyone their first: the member selects, and 23k asserts they read exactly
what they read before it existed. The restrictive rule is not vestigial. It
holds on the restated ground that **forcing a `Membership` onto another person
is a write against their identity**, which is sufficient on its own and was
always the better reason. What removing it would restore is not the lockout —
it is an owner who can make a stranger a member of their tenant without asking.

**A person who accepts a second invitation keeps both.** They resolve null while
they name neither and either one while they name it, which is §2.1's second and
third rows and is the whole of the session-to-membership binding
`TENANCY_MODEL.md` §2 requires. This is no longer deferred: the migration is
`20260805120001_session_tenant_selector`, the contract is §2.1, and CF-103 and
CF-93 gap (3) close on it.

### 3.4 `operator`
A B2S platform administrator. Not tenant-scoped.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid pk | Equals the Supabase Auth user id |
| `granted_at` | timestamptz not null | |
| `granted_by` | uuid null → operator | |
| `revoked_at` | timestamptz null | |

**RLS.** SELECT where `is_operator()`. No INSERT, UPDATE or DELETE policy at all
— operator grants are a privileged path only, and there is deliberately no API
path to become one.

### 3.5 `consent_grant`
A tenant's explicit, time-boxed permission for operator support access (OD-G10).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid pk | |
| `tenant_id` | uuid not null → tenant | |
| `granted_by` | uuid not null → member | Must hold role `owner` |
| `scope` | enum not null | `read_only` at R1 |
| `expires_at` | timestamptz not null | Bounded. There is no open-ended grant |
| `revoked_at` | timestamptz null | |
| provenance | | per §1 |

**RLS.** SELECT and INSERT where `tenant_id = current_tenant_id()` and the caller
is `owner`. SELECT also where `is_operator()`, unconditionally: `consent_grant`
is **account metadata** under §2's operator rule, which is where the reasoning
lives. Never updatable — revocation sets `revoked_at` through a narrow column
grant, and a lapsed grant is never extended, only replaced.

**A consent grant does not itself widen any policy.** It is the record that
authorises an operator action and the thing an audit reads. Any policy consulting
it checks `now() < expires_at and revoked_at is null` at evaluation time.

### 3.6 `activity_event`
The audit trail (OD-C15). Append-only.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid pk | |
| `tenant_id` | uuid not null → tenant | |
| `actor_member_id` | uuid null → member | Null when the actor is an operator |
| `actor_operator_id` | uuid null → operator | |
| `action` | text not null | Language-neutral key, e.g. `invoice.issued` |
| `entity_type` | text not null | The `GLOSSARY.md` entity name |
| `entity_id` | uuid null | |
| `payload` | jsonb null | **No credential, no full row copy, no PII beyond ids** |
| `occurred_at` | timestamptz not null default now() | |

**Exactly one of** `actor_member_id`, `actor_operator_id` is non-null — a check
constraint, because an event with no actor is not an audit trail.

**RLS.** SELECT where `tenant_id = current_tenant_id()`. INSERT permitted for the
tenant's own members. **No UPDATE policy and no DELETE policy exist** — that
absence is the immutability, per §1.5. **There is no operator policy on this
table**: `activity_event` is **tenant business data** under §2's operator rule,
so an operator reaches it only through `operator_read_activity_event(tenant_id)`
— live consent required, the access logged, `payload` never returned. The
absence of an operator policy here is what makes that path the only one, and
§2 is where the reasoning lives.

### 3.7 `role` — not a table
`role` is a Postgres enum, not a table. The five values are fixed by
`TENANCY_MODEL.md` §3 and are not tenant-configurable at Release 1.
`DOMAIN_MODEL.md` counts `Role` as an entity because it has independent meaning;
storage does not need a row per value. **This is a deliberate divergence between
the domain count and the table count, recorded here so the two are never
reconciled by mistake.**

---

## 4. Indexes, each with its reason

| Index | Reason |
|---|---|
| `membership (member_id, status)` | Resolving `current_tenant_id()` on every request. The hottest read in the system |
| `membership (tenant_id, role)` | Owner checks, and the at-least-one-owner constraint |
| `activity_event (tenant_id, occurred_at desc)` | The audit view is always tenant-scoped and time-ordered |
| `consent_grant (tenant_id, expires_at)` | Evaluating live grants |
| `tenant (slug)` | Unique constraint, and route resolution |

No other index at this tier. An index without a query is a write cost with no
reader.

---

## 5. What the Phase 01 exit gate must prove

Against the **live** catalog, by query — never by reading the migration.

1. Every table has `rowsecurity = true`. Zero exceptions.
2. Every table has at least one policy. **An RLS-enabled table with no policy is
   a hard failure**, not a warning.
3. Every policy with a write side — INSERT, UPDATE, or ALL — carries
   `WITH CHECK`. PostgreSQL rejects `WITH CHECK` on a `FOR SELECT` policy,
   because a read produces no candidate row to check, so read policies
   carry `USING` alone and that is correct rather than a gap. A `FOR ALL`
   policy is not a way to satisfy this rule where a table must carry no
   DELETE path.
4. Seeded as two tenants with distinct members: tenant A's member reads exactly
   A's rows and **zero** of B's, on every table, for select, insert, update and
   delete. The positive path is asserted too — permitted rows must actually come
   back, because default-deny failing silently looks identical to an empty table.
   One class of row crosses by design: a `membership` row that is the caller's
   own, per §3.3. It is asserted, not tolerated — proof 9 below fixes what a
   foreign tenant may put there and what it may cost the caller.
5. No member can raise their own `membership.role`, attempted directly.
6. A member cannot insert a row carrying another tenant's `tenant_id`.
7. `is_operator()` returns no business row on any table.
8. Generated types match the live schema; the drift job fails loudly if not.
9. **No write leaves an unarchived `active` membership belonging to anyone but
   the caller** (§3.3). Proven from both sides: an owner's attempt to insert one
   for a stranger is refused, an owner's attempt to update one into existence is
   refused, and the invitee's own `invited` → `active` move succeeds and is the
   only transition available to them. The invitee's move is proven to *land*,
   not merely to be permitted — an accept policy over a row the invitee cannot
   see never fires and reports success. What the invitee sees is asserted with
   it: their own invitation, and no other row of the inviting tenant. What the
   victim keeps is asserted opposite it: the tenant they resolve to and every
   own-tenant row they read are unchanged by anything a foreign owner can do.
10. **The operator surface obeys §2's rule.** A business-row read with no live
    `consent_grant` is refused; the same read with one succeeds and writes an
    `activity_event` carrying `actor_operator_id`; `payload` is never returned to
    an operator, grant or no grant.
11. **Every function in `public` carries an explicit `EXECUTE` grant.** None is
    reachable by `PUBLIC` or by `anon`, and a function no caller needs is granted
    to no one.

**Not waivable by OD.**

---

## 6. Deferred tiers

| Tier | Entities | Arrives |
|---|---|---|
| Brand | 9 | Phase 03 |
| Asset | 2 | Phase 03 |
| Catalog | 9 | Phase 04 |
| Inventory | 6 | Phase 04 |
| Sales | 14 | Phase 05 |
| Packaging and print | 18 | Phase 06 |
| Purchasing | 5 | Release 2 |
| System | 15 | across Phases 03 to 08 as each is needed |

Each lands as a signed amendment to this document, one phase ahead of its module,
and inherits §1 and §2 without restatement.

---

*Precedence slot 6. Read with `DOMAIN_MODEL.md` and `SECURITY_MODEL.md`.*
