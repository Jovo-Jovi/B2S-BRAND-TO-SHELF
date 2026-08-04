-- ===== migration: 20260802120004_helper_functions =====

-- §2 — the tenancy helpers. security definer and stable, owned by the schema
-- owner, so that reading membership to resolve a caller's tenant is not itself
-- subject to the policies it exists to evaluate.

-- current_tenant_id() — the tenant_id of the calling identity's active
-- membership, or null.
--
-- Fails closed when the caller holds more than one active membership. §3.2
-- allows a person to belong to several tenants, and TENANCY_MODEL.md §2 binds a
-- session to exactly one membership at a time, but DATA_MODEL.md specifies no
-- storage for that binding and no rule for choosing among several. Returning
-- null denies rather than guessing, which is the only safe direction for the
-- tenancy spine: picking one arbitrarily would silently serve a caller the
-- wrong tenant's rows.
create or replace function public.current_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select resolved.tenant_id
  from (
    select m.tenant_id,
           count(*) over () as active_memberships
    from public.membership m
    where m.member_id = auth.uid()
      and m.status = 'active'
      and m.archived_at is null
  ) resolved
  where resolved.active_memberships = 1
$$;

-- is_operator() — whether the calling identity has an operator row.
-- revoked_at is honoured: a revoked operator is not an operator, which is the
-- only reading under which the column has a purpose.
create or replace function public.is_operator()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.operator o
    where o.id = auth.uid()
      and o.revoked_at is null
  )
$$;

-- is_current_tenant_owner() — whether the caller's membership in their own
-- active tenant carries role owner.
--
-- §3.3 requires membership INSERT and UPDATE to be restricted to callers whose
-- own membership in that tenant is owner, and §3.5 requires the same of
-- consent_grant. A policy on membership cannot read membership directly:
-- PostgreSQL raises "infinite recursion detected in policy for relation
-- membership". A security definer function is the only legal expression of the
-- requirement, so this is mechanism for a stated policy, not a new rule.
-- DATA_MODEL.md §2 tabulates two helpers and does not list this one.
create or replace function public.is_current_tenant_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.membership m
    where m.member_id = auth.uid()
      and m.tenant_id = public.current_tenant_id()
      and m.role = 'owner'
      and m.status = 'active'
      and m.archived_at is null
  )
$$;


