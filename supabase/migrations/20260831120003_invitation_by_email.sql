-- ===== migration: 20260831120003_invitation_by_email =====

-- OD-G16, closing CF-121. An invitation names an email address, not an existing
-- Member. membership.member_id is not null references public.member(id), so an
-- invitation to a person with no member row cannot be a membership row as the
-- table stands. The shape chosen here is a tenant-scoped invitation table:
-- the Owner writes an offer addressed to an email; the invitee, having signed
-- in and proven that address (OD-G13), activates a Membership in the same
-- motion. No Owner write produces an active Membership for anyone but the
-- writer; membership_active_is_self_only is untouched.
--
-- Names (GLOSSARY.md §5): invitation, email, role, expires_at, accepted_at,
-- accepted_by, accept_invitation, caller_email_is_verified. None is a
-- forbidden noun.
--
-- Single-use and expiry are columns, not a status enum: pending is
-- accepted_at is null and expires_at > now() and archived_at is null; spent
-- is accepted_at is not null; expired is derived from expires_at. A CHECK
-- here supersedes the same way G17 does, and adding an enum would be a fifth
-- type for two states the columns already distinguish.
--
-- Acceptance cannot be a policy. The invitee holds no membership in the
-- inviting tenant, so current_tenant_id() does not resolve it and RLS would
-- hide the row. accept_invitation(uuid) is security definer so it can read
-- the invitation, confirm the caller's verified email matches, insert the
-- caller's own active membership, and spend the invitation, in one
-- transaction. member_id is auth.uid(); there is no member parameter.
--
-- OD-G13's acceptance invariant — control of the invited identity, satisfied
-- today by a verified email and nothing else — had no enforcement point.
-- caller_email_is_verified() reads auth.users.email_confirmed_at. The existing
-- membership_accept_invitation policy (invite-then-accept for a person who
-- already holds a member row) gains it as well, so both accept paths enforce
-- the same invariant. An unverified identity cannot accept by any path.
--
-- Existence (SECURITY_MODEL.md §1): every invitation-side refusal of
-- accept_invitation — missing, spent, expired, archived, email mismatch,
-- already a member — raises the same SQLSTATE and the same message, so a
-- guessed uuid belonging to another tenant is indistinguishable from one that
-- does not exist.
--
-- Independently revertible: drop the policies, the grants, the two functions,
-- and the table. membership_accept_invitation is dropped and recreated; a
-- revert restores the prior definition from migration 1 of the invite
-- lifecycle.

-- §3.8 invitation — a tenant-scoped offer addressed to an email. Follows
-- §1 rules 1-4 (tenant_id, generated key, archived_at, provenance). No
-- departure from §1.
create table public.invitation (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenant (id),
  email        extensions.citext not null,
  role         public.role not null,
  expires_at   timestamptz not null,
  accepted_at  timestamptz,
  accepted_by  uuid references public.member (id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  created_by   uuid references public.member (id),
  archived_at  timestamptz,
  constraint invitation_email_present check (length(btrim(email::text)) > 0),
  constraint invitation_accepted_by_when_spent check (
    (accepted_at is null) = (accepted_by is null)
  )
);

comment on table public.invitation is
  'OD-G16. Tenant-scoped offer addressed to an email. Spent by accept_invitation; withdrawn by archived_at.';

alter table public.invitation enable row level security;

-- Default privileges grant table-wide UPDATE to authenticated. The revoke is
-- the same load-bearing one every later table repeats (migration 7).
revoke all on table public.invitation from anon;
revoke all on table public.invitation from authenticated;

grant select, insert on public.invitation to authenticated;
-- Owners may withdraw a pending invitation. They cannot mark it accepted,
-- change the address, or change the role: those columns are absent from the
-- grant, which is what makes single-use structural rather than trusted.
grant update (archived_at) on public.invitation to authenticated;

-- Tenant business data under §2's operator rule: no operator policy. An
-- operator reaches no invitation row, which is what keeps the invited
-- address out of a support session.
create policy invitation_select_tenant on public.invitation
  for select to authenticated
  using ( tenant_id = public.current_tenant_id() );

create policy invitation_insert_owner on public.invitation
  for insert to authenticated
  with check (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
    and accepted_at is null
    and accepted_by is null
    and archived_at is null
    and expires_at > now()
  );

create policy invitation_withdraw_owner on public.invitation
  for update to authenticated
  using (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
    and accepted_at is null
  )
  with check (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
    and accepted_at is null
    and accepted_by is null
  );

-- OD-G13. Reads auth.users.email_confirmed_at, which no authenticated caller
-- can select. Stable: the confirmation timestamp does not change inside a
-- statement. Granted to authenticated so the membership_accept_invitation
-- policy can name it; the function returns false for a null auth.uid() rather
-- than raising, so an unauthenticated evaluation is a denial, not an error.
create or replace function public.caller_email_is_verified()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from auth.users u
     where u.id = auth.uid()
       and u.email_confirmed_at is not null
  )
$$;

-- The existing invite-then-accept path, same invariant. An invitee whose
-- email is not confirmed cannot move their own row to active. Fixture
-- identities used by proofs 18c and 19 are created with email_confirm true,
-- so those assertions are unchanged.
drop policy membership_accept_invitation on public.membership;

create policy membership_accept_invitation on public.membership
  for update to authenticated
  using (
    member_id = auth.uid()
    and status = 'invited'
    and archived_at is null
    and public.caller_email_is_verified()
  )
  with check (
    member_id = auth.uid()
    and status = 'active'
    and public.caller_email_is_verified()
  );

-- OD-G16's single act: prove the address and activate the Membership.
-- member_id is auth.uid(); there is no argument that names anyone else.
-- SELECT ... FOR UPDATE serialises two accepts of the same invitation so the
-- second sees accepted_at already set.
create or replace function public.accept_invitation(p_invitation_id uuid)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_caller uuid := auth.uid();
  v_inv    public.invitation%rowtype;
  v_email  extensions.citext;
  v_membership uuid;
begin
  if v_caller is null then
    raise exception
      'invitation acceptance refused: the caller is not an authenticated identity'
      using errcode = 'insufficient_privilege';
  end if;

  if not exists (
    select 1
      from public.member m
     where m.id = v_caller
       and m.archived_at is null
  ) then
    raise exception
      'invitation acceptance refused: the caller holds no live member record'
      using errcode = 'insufficient_privilege';
  end if;

  -- OD-G13: control of the invited identity, satisfied by a verified email
  -- and nothing else. Checked before the invitation is read, so an unverified
  -- caller learns nothing about whether the id exists.
  if not public.caller_email_is_verified() then
    raise exception
      'invitation acceptance refused: the caller has not verified this email address'
      using errcode = 'insufficient_privilege';
  end if;

  select u.email::extensions.citext
    into v_email
    from auth.users u
   where u.id = v_caller;

  select *
    into v_inv
    from public.invitation i
   where i.id = p_invitation_id
   for update;

  -- SECURITY_MODEL.md §1 existence. Missing, spent, expired, archived, and
  -- addressed-to-someone-else are one refusal. A guessed uuid that belongs to
  -- another tenant is indistinguishable from one that does not exist.
  if v_inv.id is null
     or v_inv.archived_at is not null
     or v_inv.accepted_at is not null
     or v_inv.expires_at <= now()
     or v_inv.email <> v_email then
    raise exception
      'invitation acceptance refused'
      using errcode = 'insufficient_privilege';
  end if;

  begin
    insert into public.membership
      (tenant_id, member_id, role, status, invited_by, accepted_at, created_by)
    values
      (v_inv.tenant_id, v_caller, v_inv.role, 'active', v_inv.created_by, now(), v_caller)
    returning id into v_membership;
  exception
    when unique_violation then
      raise exception
        'invitation acceptance refused'
        using errcode = 'insufficient_privilege';
  end;

  update public.invitation
     set accepted_at = now(),
         accepted_by = v_caller,
         updated_at = now()
   where id = v_inv.id;

  return v_membership;
end
$$;

-- CF-105's standing obligation: every new public function is revoked from
-- public, anon and service_role, then granted only to the caller that needs it.
revoke execute on function public.caller_email_is_verified() from public;
revoke execute on function public.caller_email_is_verified() from anon;
revoke execute on function public.caller_email_is_verified() from service_role;
grant  execute on function public.caller_email_is_verified() to authenticated;

revoke execute on function public.accept_invitation(uuid) from public;
revoke execute on function public.accept_invitation(uuid) from anon;
revoke execute on function public.accept_invitation(uuid) from service_role;
grant  execute on function public.accept_invitation(uuid) to authenticated;
