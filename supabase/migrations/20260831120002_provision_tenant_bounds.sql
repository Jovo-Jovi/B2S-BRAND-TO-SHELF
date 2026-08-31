-- ===== migration: 20260831120002_provision_tenant_bounds =====

-- OD-G18. A Member may own at most three active Tenants and perform at most
-- three provisioning acts per rolling 24 hours, counted from activity_event
-- where the action is tenant.provisioned and the actor is the caller. Both
-- numbers are policy, hardcoded to the free plan in Release 1. No new table.
--
-- THE RACE IS THE POINT. A bare count inside the function lets two simultaneous
-- calls both pass: each reads 2, each inserts, the member owns 4. An
-- xact-scoped advisory lock on the member id serialises provisioning for that
-- member, so the waiter sees the first call's committed row. 1818 is a lock
-- namespace derived from OD-G18, not a bound. hashtext(member id) is the key.
-- A partial unique index cannot express "at most three" or a rolling window,
-- which is why the lock is the mechanism and not an index.
--
-- A refusal is not recorded. activity_event is tenant-scoped and a refusal has
-- no tenant; OD-G18 accepts that rather than inventing a platform-scoped audit.
-- The attempt leaves no tenant, no membership and no event, which is what the
-- function's existing atomicity already guarantees on any raise.
--
-- Independently revertible: this is a CREATE OR REPLACE of provision_tenant.
-- Reverting it restores the unbounded body from migration 14; the G17 CHECKs
-- in migration 15 stay, because they live on the table. Raising the cap in
-- Release 1 is a migration, because OD-G10 holds Operator to metadata.
-- Slug squatting is unsolved — OD-G18 bounds tenants, not slugs, and says so.

create or replace function public.provision_tenant(
  p_name           text,
  p_slug           text,
  p_base_currency  text,
  p_default_locale text
)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_caller uuid := auth.uid();
  v_tenant uuid;
  v_owned  integer;
  v_recent integer;
begin
  if v_caller is null then
    raise exception
      'tenant provisioning refused: the caller is not an authenticated identity'
      using errcode = 'insufficient_privilege';
  end if;

  -- The second-act rule, enforced. Authentication materialises the Member;
  -- this path consumes one and never creates one. An authenticated identity
  -- with no live `member` row cannot provision, which also means this function
  -- can never be the thing that repairs a failed materialisation — the two acts
  -- stay separate in the failure direction too.
  if not exists (
    select 1
      from public.member m
     where m.id = v_caller
       and m.archived_at is null
  ) then
    raise exception
      'tenant provisioning refused: the caller holds no live member record'
      using errcode = 'insufficient_privilege',
            hint = 'OD-G13 makes provisioning a second act. Authentication materialises the Member first.';
  end if;

  -- OD-G18. Taken before the counts so a concurrent caller for the same member
  -- blocks here rather than both reading a stale total. Released at commit or
  -- rollback, so a refused call does not hold the lock past its own raise.
  perform pg_advisory_xact_lock(1818, hashtext(v_caller::text));

  select count(*)::integer
    into v_owned
    from public.membership m
   where m.member_id = v_caller
     and m.role = 'owner'
     and m.status = 'active'
     and m.archived_at is null;

  if v_owned >= 3 then
    raise exception
      'tenant provisioning refused: a member may own at most three active tenants'
      using errcode = 'check_violation';
  end if;

  select count(*)::integer
    into v_recent
    from public.activity_event e
   where e.actor_member_id = v_caller
     and e.action = 'tenant.provisioned'
     and e.occurred_at > now() - interval '24 hours';

  if v_recent >= 3 then
    raise exception
      'tenant provisioning refused: at most three provisioning acts are permitted per 24 hours'
      using errcode = 'check_violation';
  end if;

  -- §3.1 fixes the shape of name and slug in prose and the table carries no
  -- constraint for either, so this is the only place that shape can be
  -- established — this function is the only writer `tenant` has. Locale and
  -- currency are constrained on the table (OD-G17, migration 15); a value
  -- outside either set fails the INSERT below, which is the enforcement the
  -- wizard is not.
  if p_name is null or btrim(p_name) = '' then
    raise exception
      'tenant provisioning refused: a tenant must carry a name'
      using errcode = 'check_violation';
  end if;

  if p_slug is null or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    raise exception
      'tenant provisioning refused: slug must be lowercase and URL-safe, alphanumeric groups joined by single hyphens'
      using errcode = 'check_violation';
  end if;

  insert into public.tenant
    (name, slug, base_currency, default_locale, status, created_by)
  values
    (btrim(p_name), p_slug, p_base_currency, p_default_locale, 'active', v_caller)
  returning id into v_tenant;

  -- OD-G15: at least one active owner, and the caller is it. `accepted_at` is
  -- set because there was no invitation to accept — the caller is the tenant's
  -- origin, not an invitee, and leaving it null would model a pending offer
  -- nobody made.
  insert into public.membership
    (tenant_id, member_id, role, status, accepted_at, created_by)
  values
    (v_tenant, v_caller, 'owner', 'active', now(), v_caller);

  -- §3.6 — the audit trail's first row for this tenant. `payload` stays null:
  -- every fact worth recording is already a column, and §3.6 forbids a full row
  -- copy there. This row is also OD-G18's rate-limit source.
  insert into public.activity_event
    (tenant_id, actor_member_id, action, entity_type, entity_id)
  values
    (v_tenant, v_caller, 'tenant.provisioned', 'Tenant', v_tenant);

  return v_tenant;
end
$$;

-- CREATE OR REPLACE preserves a function's ACL. Restated because "should be"
-- is not an assertion, and proof 22 checks the resulting privilege set either
-- way. CF-105's standing obligation.
revoke execute on function public.provision_tenant(text, text, text, text) from public;
revoke execute on function public.provision_tenant(text, text, text, text) from anon;
revoke execute on function public.provision_tenant(text, text, text, text) from service_role;
grant  execute on function public.provision_tenant(text, text, text, text) to authenticated;
