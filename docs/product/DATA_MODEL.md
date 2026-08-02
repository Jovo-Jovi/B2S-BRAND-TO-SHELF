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

## 1. Universal rules — every table, without exception

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

Two helper functions, `security definer`, `stable`, owned by the schema owner:

| Helper | Returns |
|---|---|
| `current_tenant_id()` | The `tenant_id` of the calling identity's active `membership`, or null |
| `is_operator()` | Whether the calling identity has an `operator` row |

**The standard tenant policy**, applied to every tenant-scoped table:

```
USING       ( tenant_id = current_tenant_id() )
WITH CHECK  ( tenant_id = current_tenant_id() )
```

`WITH CHECK` is not optional. Without it a member can insert a row carrying
another tenant's `tenant_id` — the read is protected and the write is not.

**Operator reach is separate and narrow.** `is_operator()` grants read on
`tenant`, `subscription` and `activity_event` metadata columns only. It grants
nothing on any business table. OD-G10 is a promise in the terms of service, and
the policy set is what makes it true rather than aspirational.

**Grants and policies compose.** A permissive policy over a table-wide column
grant lets a member rewrite their own `role`. Column-scoped grants are used
wherever a self-referencing UPDATE policy exists — `membership.role` is
explicitly not member-writable.

---

## 3. The Platform tier

Seven tables for Release 1. `subscription` and `feature_flag` are Release 3
(`SCOPE.md`) and land with billing.

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

**RLS.** SELECT where `tenant_id = current_tenant_id()`. INSERT and UPDATE
restricted to callers whose own membership in that tenant is `owner`.
**`role` is never self-writable** — no policy path lets a member raise their own
role, and the grant is column-scoped to make that structural rather than trusted.

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
is `owner`. SELECT also where `is_operator()`. Never updatable — revocation sets
`revoked_at` through a narrow column grant, and a lapsed grant is never extended,
only replaced.

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

**RLS.** SELECT where `tenant_id = current_tenant_id()` or `is_operator()`.
INSERT permitted for the tenant's own members. **No UPDATE policy and no DELETE
policy exist** — that absence is the immutability, per §1.5.

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

Against the **live** staging catalog, by query — never by reading the migration.

1. Every table has `rowsecurity = true`. Zero exceptions.
2. Every table has at least one policy. **An RLS-enabled table with no policy is
   a hard failure**, not a warning.
3. Every tenant-scoped policy carries `WITH CHECK`, not only `USING`.
4. Seeded as two tenants with distinct members: tenant A's member reads exactly
   A's rows and **zero** of B's, on every table, for select, insert, update and
   delete. The positive path is asserted too — permitted rows must actually come
   back, because default-deny failing silently looks identical to an empty table.
5. No member can raise their own `membership.role`, attempted directly.
6. A member cannot insert a row carrying another tenant's `tenant_id`.
7. `is_operator()` returns no business row on any table.
8. Generated types match the live schema; the drift job fails loudly if not.

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
