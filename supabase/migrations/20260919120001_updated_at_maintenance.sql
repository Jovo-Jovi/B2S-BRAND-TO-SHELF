-- ===== migration: 20260919120001_updated_at_maintenance =====

-- DATA_MODEL.md §1 rule 4. `updated_at` is specified `not null default now()`
-- and without a maintenance trigger it never changes after insert, and a
-- caller who holds UPDATE on the column can write any timestamp into it.
-- This function and the five triggers close both.
--
-- Not `security definer`: it touches no table, only the candidate row, and
-- a definer here would be privilege nobody needs. `search_path` is pinned
-- to '' like every other function in `public`. The assignment is
-- unconditional: a no-op UPDATE is still a write against the row.
--
-- Trigger name is the rule, not ad hoc: `{table}_set_updated_at`. One
-- trigger per table that declares the column. `operator` and
-- `activity_event` declare none (departures table, rule 4) and carry none.
--
-- Independently revertible: drop the five triggers, then drop the function.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger member_set_updated_at
before update on public.member
for each row
execute function public.set_updated_at();

create trigger tenant_set_updated_at
before update on public.tenant
for each row
execute function public.set_updated_at();

create trigger membership_set_updated_at
before update on public.membership
for each row
execute function public.set_updated_at();

create trigger consent_grant_set_updated_at
before update on public.consent_grant
for each row
execute function public.set_updated_at();

create trigger invitation_set_updated_at
before update on public.invitation
for each row
execute function public.set_updated_at();

-- CF-105's standing obligation: a new public function is revoked from
-- public, anon and service_role. This one is also revoked from
-- authenticated: it is a trigger function, granted to nobody, the same
-- shape as materialise_member. EXECUTE is checked when the trigger is
-- created, never when it fires.

revoke execute on function public.set_updated_at() from public;
revoke execute on function public.set_updated_at() from anon;
revoke execute on function public.set_updated_at() from authenticated;
revoke execute on function public.set_updated_at() from service_role;
