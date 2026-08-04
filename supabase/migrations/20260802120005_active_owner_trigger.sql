-- ===== migration: 20260802120005_active_owner_trigger =====

-- §3.3 — at least one active owner per tenant, enforced by a constraint
-- trigger rather than by application code. A tenant with no owner is
-- unreachable.
--
-- Deferred to commit so that a provisioning transaction may insert several
-- memberships in any order, and so that an owner transfer that replaces one
-- owner row with another passes as a single unit.
create or replace function public.enforce_tenant_active_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  affected_tenants uuid[];
  affected_tenant  uuid;
  active_owners    integer;
begin
  -- OLD and NEW are each unassigned for the operations that do not supply
  -- them, so the branches are explicit rather than a coalesce.
  if tg_op = 'INSERT' then
    affected_tenants := array[new.tenant_id];
  elsif tg_op = 'DELETE' then
    affected_tenants := array[old.tenant_id];
  else
    affected_tenants := array[old.tenant_id, new.tenant_id];
  end if;

  foreach affected_tenant in array affected_tenants loop
    select count(*)
    into active_owners
    from public.membership m
    where m.tenant_id = affected_tenant
      and m.role = 'owner'
      and m.status = 'active'
      and m.archived_at is null;

    if active_owners = 0 then
      raise exception 'tenant % would be left with no active owner', affected_tenant
        using errcode = 'check_violation';
    end if;
  end loop;

  return null;
end;
$$;

create constraint trigger membership_active_owner_required
after insert or update or delete on public.membership
deferrable initially deferred
for each row
execute function public.enforce_tenant_active_owner();


