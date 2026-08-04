-- ===== migration: 20260802120003_indexes =====

-- §3.3 — unique (tenant_id, member_id) where archived_at is null. A constraint
-- from §3.3, not one of §4's five read-path indexes.
create unique index membership_tenant_member_live_key
  on public.membership (tenant_id, member_id)
  where archived_at is null;

-- §4 — five indexes, each with its stated reason. No other index at this tier:
-- an index without a query is a write cost with no reader.

-- 1. Resolving current_tenant_id() on every request. The hottest read.
create index membership_member_status_idx
  on public.membership (member_id, status);

-- 2. Owner checks, and the at-least-one-active-owner constraint.
create index membership_tenant_role_idx
  on public.membership (tenant_id, role);

-- 3. The audit view is always tenant-scoped and time-ordered.
create index activity_event_tenant_occurred_idx
  on public.activity_event (tenant_id, occurred_at desc);

-- 4. Evaluating live grants.
create index consent_grant_tenant_expires_idx
  on public.consent_grant (tenant_id, expires_at);

-- 5. tenant (slug) — unique constraint, and route resolution. Served by the
-- index the UNIQUE constraint on tenant.slug already creates
-- (tenant_slug_key); a second index on the same column would be the write cost
-- §4's closing sentence forbids.


