-- B2S — authoritative schema. ADR-006.
--
-- Source of truth: docs/product/DATA_MODEL.md, Platform tier revision.
-- This file is the single authoritative SQL source. The files in
-- supabase/migrations/ are split from it verbatim, in source order, at the
-- "===== migration:" markers below. Nothing is reinterpreted between the two.
--
-- Scope of this revision: the Platform tier only. DATA_MODEL.md §3 specifies
-- SIX tables (§3.1 tenant, §3.2 member, §3.3 membership, §3.4 operator,
-- §3.5 consent_grant, §3.6 activity_event) and ONE enum that is deliberately
-- not a table (§3.7 role). §3's lead sentence counts seven Release 1 Platform
-- entities, of which role is stored as an enum; §3.7 records that divergence as
-- deliberate and asks that the two counts never be reconciled by mistake.
--
-- Statement order below is driven by foreign-key dependency, not by DATA_MODEL's
-- presentation order: member precedes tenant because tenant.created_by
-- references member(id), and both provenance chains terminate at member.


-- ===== migration: 20260802120001_extensions_and_enums =====

create extension if not exists citext with schema extensions;

-- DATA_MODEL §1.7 — every enumeration stores a language-neutral key.
-- Display text is a translation_entry, never the stored value.

-- §3.7 — role is a Postgres enum, not a table. Five values, fixed by
-- TENANCY_MODEL.md §3, not tenant-configurable at Release 1.
create type public.role as enum (
  'owner',
  'manager',
  'designer',
  'approver',
  'viewer'
);

-- §3.1 tenant.status
create type public.tenant_status as enum (
  'active',
  'suspended',
  'closed'
);

-- §3.3 membership.status
create type public.membership_status as enum (
  'invited',
  'active',
  'suspended'
);

-- §3.5 consent_grant.scope — read_only at Release 1.
create type public.consent_scope as enum (
  'read_only'
);


-- ===== migration: 20260802120002_platform_tables =====

-- §3.2 member — a person. Not tenant-scoped: one identity is global to the
-- platform and may hold a membership in several tenants over time.
-- id equals the Supabase Auth user id (ADR-004), so it carries no default;
-- the reference to auth.users is what makes "equals" structural.
create table public.member (
  id                uuid primary key references auth.users (id),
  email             extensions.citext not null unique,
  display_name      text,
  preferred_locale  text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  created_by        uuid references public.member (id),
  archived_at       timestamptz
);

-- §3.1 tenant — one company, one master brand, the root of every scope chain.
-- No INSERT, UPDATE or DELETE policy is written for members: provisioning is a
-- privileged path (ADR-005), and slug immutability after creation follows from
-- the absence of an UPDATE policy rather than from a trigger (§1.5).
create table public.tenant (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text not null unique,
  base_currency   text not null,
  default_locale  text not null,
  status          public.tenant_status not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  created_by      uuid references public.member (id),
  archived_at     timestamptz
);

-- §3.3 membership — binds a member to a tenant with a role. The join that
-- carries data of its own, and therefore an entity.
create table public.membership (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenant (id),
  member_id    uuid not null references public.member (id),
  role         public.role not null,
  status       public.membership_status not null,
  invited_by   uuid references public.member (id),
  accepted_at  timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  created_by   uuid references public.member (id),
  archived_at  timestamptz
);

-- §3.4 operator — a B2S platform administrator. Not tenant-scoped.
-- Column list per §3.4: no provenance block and no archived_at; granted_at and
-- granted_by carry the provenance, revoked_at carries the retirement.
create table public.operator (
  id          uuid primary key references auth.users (id),
  granted_at  timestamptz not null,
  granted_by  uuid references public.operator (id),
  revoked_at  timestamptz
);

-- §3.5 consent_grant — a tenant's explicit, time-boxed permission for operator
-- support access (OD-G10). expires_at is not null: there is no open-ended grant.
-- Column list per §3.5: provenance, and deliberately no archived_at.
create table public.consent_grant (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenant (id),
  granted_by  uuid not null references public.member (id),
  scope       public.consent_scope not null,
  expires_at  timestamptz not null,
  revoked_at  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid references public.member (id)
);

-- §3.6 activity_event — the audit trail (OD-C15). Append-only: no UPDATE or
-- DELETE policy is written, and that absence is the immutability (§1.5).
-- Column list per §3.6: occurred_at, and deliberately no provenance block and
-- no archived_at.
create table public.activity_event (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null references public.tenant (id),
  actor_member_id    uuid references public.member (id),
  actor_operator_id  uuid references public.operator (id),
  action             text not null,
  entity_type        text not null,
  entity_id          uuid,
  payload            jsonb,
  occurred_at        timestamptz not null default now(),
  -- §3.6 — exactly one actor. An event with no actor is not an audit trail.
  constraint activity_event_one_actor check (
    (actor_member_id is not null) <> (actor_operator_id is not null)
  )
);


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


-- ===== migration: 20260802120006_row_level_security =====

-- §2 — every table has RLS enabled and at least one policy. RLS enabled with no
-- policy fails closed and silent: embedded selects resolve to empty for every
-- caller with no error anywhere, which is indistinguishable from an empty
-- table.
--
-- WITH CHECK accompanies every policy that can carry one. PostgreSQL permits
-- WITH CHECK only on INSERT, UPDATE and ALL policies; SELECT and DELETE
-- policies take USING alone by grammar, not by choice.

alter table public.tenant         enable row level security;
alter table public.member         enable row level security;
alter table public.membership     enable row level security;
alter table public.operator       enable row level security;
alter table public.consent_grant  enable row level security;
alter table public.activity_event enable row level security;

-- §3.1 tenant — SELECT where id = current_tenant_id() or is_operator().
-- No INSERT, UPDATE or DELETE policy: a tenant cannot create or rename a
-- tenant through the API.
create policy tenant_select_own on public.tenant
  for select to authenticated
  using ( id = public.current_tenant_id() );

create policy tenant_select_operator on public.tenant
  for select to authenticated
  using ( public.is_operator() );

-- §3.2 member — SELECT and UPDATE where id = auth.uid(), plus SELECT where the
-- row shares a membership tenant with the caller. Colleagues are visible to
-- each other, strangers are not. email is never updatable here; it is auth's,
-- and the column-scoped grant below is what enforces that.
create policy member_select_self on public.member
  for select to authenticated
  using ( id = auth.uid() );

create policy member_select_colleague on public.member
  for select to authenticated
  using (
    exists (
      select 1
      from public.membership m
      where m.member_id = member.id
        and m.tenant_id = public.current_tenant_id()
        and m.archived_at is null
    )
  );

create policy member_update_self on public.member
  for update to authenticated
  using ( id = auth.uid() )
  with check ( id = auth.uid() );

-- §3.3 membership — SELECT where tenant_id = current_tenant_id(). INSERT and
-- UPDATE restricted to callers whose own membership in that tenant is owner.
-- No DELETE policy: rows are archived, never deleted (§1.3).
create policy membership_select_tenant on public.membership
  for select to authenticated
  using ( tenant_id = public.current_tenant_id() );

create policy membership_insert_owner on public.membership
  for insert to authenticated
  with check (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  );

create policy membership_update_owner on public.membership
  for update to authenticated
  using (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  )
  with check (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  );

-- §3.4 operator — SELECT where is_operator(). No INSERT, UPDATE or DELETE
-- policy at all: operator grants are a privileged path only, and there is
-- deliberately no API path to become one.
create policy operator_select_operator on public.operator
  for select to authenticated
  using ( public.is_operator() );

-- §3.5 consent_grant — SELECT and INSERT where tenant_id = current_tenant_id()
-- and the caller is owner; SELECT also where is_operator(). Not generally
-- updatable: the UPDATE path exists only so an owner may set revoked_at, and
-- the column-scoped grant below is what narrows it to that column. A lapsed
-- grant is never extended, only replaced.
create policy consent_grant_select_owner on public.consent_grant
  for select to authenticated
  using (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  );

create policy consent_grant_select_operator on public.consent_grant
  for select to authenticated
  using ( public.is_operator() );

create policy consent_grant_insert_owner on public.consent_grant
  for insert to authenticated
  with check (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  );

create policy consent_grant_revoke_owner on public.consent_grant
  for update to authenticated
  using (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  )
  with check (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  );

-- §3.6 activity_event — SELECT where tenant_id = current_tenant_id() or
-- is_operator(); INSERT permitted for the tenant's own members. No UPDATE
-- policy and no DELETE policy exist, and that absence is the immutability.
create policy activity_event_select_tenant on public.activity_event
  for select to authenticated
  using ( tenant_id = public.current_tenant_id() );

create policy activity_event_select_operator on public.activity_event
  for select to authenticated
  using ( public.is_operator() );

create policy activity_event_insert_member on public.activity_event
  for insert to authenticated
  with check ( tenant_id = public.current_tenant_id() );


-- ===== migration: 20260802120007_grants =====

-- §2 — grants and policies compose. A permissive policy over a table-wide
-- column grant lets a member rewrite their own role, so the grant set is
-- reviewed together with the policy set, always.
--
-- The blanket revoke is deliberate and load-bearing. A Supabase project grants
-- anon and authenticated broad table privileges by default privilege, so every
-- table below would otherwise arrive with table-wide UPDATE and the
-- column-scoped grants that follow would be decoration. Any later migration
-- adding a table repeats this revoke.

revoke all on all tables in schema public from anon;
revoke all on all tables in schema public from authenticated;

-- anon receives nothing. An unauthenticated caller reads no row of any table.

-- §3.1 — read only. Provisioning is the privileged path.
grant select on public.tenant to authenticated;

-- §3.2 — UPDATE is column-scoped to display_name and preferred_locale. email is
-- absent by construction: it is sourced from auth and never separately
-- editable. No INSERT and no DELETE.
grant select on public.member to authenticated;
grant update (display_name, preferred_locale) on public.member to authenticated;

-- §3.3 — role is absent from the UPDATE grant. That absence, not a policy that
-- trusts the caller, is what makes "role is never self-writable" structural: no
-- caller acting as authenticated can write the column at all, whatever policy
-- they satisfy. A role is set when an owner creates the membership, and changed
-- only through the privileged path. No DELETE: rows are archived.
grant select, insert on public.membership to authenticated;
grant update (status, accepted_at, archived_at) on public.membership to authenticated;

-- §3.4 — read only, and only for operators by policy. No INSERT, UPDATE or
-- DELETE privilege exists to pair with the absent policies.
grant select on public.operator to authenticated;

-- §3.5 — UPDATE is column-scoped to revoked_at, which is the whole of the
-- revocation path. expires_at is absent, so a grant cannot be extended.
grant select, insert on public.consent_grant to authenticated;
grant update (revoked_at) on public.consent_grant to authenticated;

-- §3.6 — append only. No UPDATE and no DELETE privilege, matching the absent
-- policies. The audit trail is tenant-readable in full (SECURITY_MODEL.md §7).
grant select, insert on public.activity_event to authenticated;


-- ===== migration: 20260803120001_membership_invite_lifecycle =====

-- CF-103 — §3.3's invite-then-accept rule, enforced.
--
-- The defect: membership_insert_owner constrained tenant_id and the caller's
-- role and said nothing about member_id or status, so tenant A's owner could
-- insert an ACTIVE membership naming any member of any other tenant. That
-- member then held two active memberships, current_tenant_id() returned null by
-- design, and they lost access to their own tenant. Nothing of tenant B was
-- read, inferred or modified, so SECURITY_MODEL.md §1's three parts did not
-- cover it; §1 now carries a fourth, availability.
--
-- The rule: an owner may INVITE anyone. An owner may never MAKE anyone active.
-- Only the invitee moves their own row to active. An invitation is an offer,
-- and an offer the offeree cannot decline is not an offer.

-- §3.3 — INSERT is invite-only. status = 'invited' is what makes "invite" the
-- only thing an owner can do here; without it the WITH CHECK is a rule about
-- which tenant the row lands in and not about what the row does.
drop policy membership_insert_owner on public.membership;

create policy membership_insert_owner on public.membership
  for insert to authenticated
  with check (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
    and status = 'invited'
  );

-- §3.3 — the invitee's own move, and the only status transition available to
-- them: invited -> active, on their own row. USING reads the old row and
-- WITH CHECK the new one, so the pair states the transition exactly.
-- archived_at is null in USING because a withdrawn invitation is not an
-- invitation (§1.3).
create policy membership_accept_invitation on public.membership
  for update to authenticated
  using (
    member_id = auth.uid()
    and status = 'invited'
    and archived_at is null
  )
  with check (
    member_id = auth.uid()
    and status = 'active'
  );

-- The rule stated once, RESTRICTIVE so it ANDs with every UPDATE policy on this
-- table — the two that exist and any later one, which is the difference between
-- fixing membership_update_owner and fixing the table. Without it the exploit
-- survives the INSERT fix in one more move: an owner inserts the invitation the
-- new WITH CHECK permits, then updates it to active under membership_update_owner.
--
-- No update may leave an unarchived ACTIVE membership belonging to anyone but
-- the caller. An owner keeps suspend and archive, on their own tenant's rows,
-- because neither produces one.
create policy membership_active_is_self_only on public.membership
  as restrictive for update to authenticated
  using ( true )
  with check (
    status <> 'active'
    or archived_at is not null
    or member_id = auth.uid()
  );


-- ===== migration: 20260803120002_operator_consent_reach =====

-- CF-104 — OD-G10, enforced rather than promised.
--
-- G10: an operator sees account metadata, usage and billing, never tenant
-- business data; support access requires a ConsentGrant and is logged. What was
-- built gave an operator an unconditional row read of activity_event, payload
-- included, for every tenant, with nothing logged anywhere.
--
-- §2 now states the rule once, in two classes:
--
--   Account metadata — `tenant` and `consent_grant`. Unconditional operator
--   SELECT policy, no grant required and no log written. These are the
--   "account metadata" half of G10, and an operator who cannot read the consent
--   record cannot tell whether the access they hold is live or lapsed.
--
--   Tenant business data — `activity_event` here, every later tier's tables
--   after it. NO operator policy on the table at all. Reachable only through
--   the declared read path below, which requires a live consent grant, writes
--   an activity_event naming the operator, and never returns `payload`.
--
-- Why the business-data half is a function and not a policy. Two mechanisms
-- the requirement asks for do not exist at this granularity:
--
--   A policy cannot log. PostgREST runs GET in a READ ONLY transaction, so a
--   policy expression that inserted an audit row would abort the read it was
--   auditing. "Every access under a grant is logged" (SECURITY_MODEL.md §5)
--   therefore cannot be satisfied on a policy-mediated read.
--
--   A column grant cannot separate an operator from a member. Both arrive as
--   the `authenticated` role, and column privileges are role-scoped. Excluding
--   `payload` by grant would exclude it from the tenant's own audit trail too,
--   which §7 gives the tenant in full. Excluding it from the operator alone is
--   a projection, and a projection needs a function.
--
-- The function is therefore the whole of the operator's business-data reach,
-- which makes both properties structural: there is no path that returns
-- `payload` to an operator, and there is no path that returns a business row to
-- an operator without writing the log.

-- The live-grant predicate, separate because every later tier's business table
-- reaches for the same test. §3.5: a consent grant is live when it has not been
-- revoked and has not lapsed, evaluated at read time, never cached.
create or replace function public.has_live_consent_grant(p_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.consent_grant g
    where g.tenant_id = p_tenant_id
      and g.revoked_at is null
      and now() < g.expires_at
  )
$$;

-- §3.6 — the operator loses the unconditional row read. What remains on the
-- table is the tenant's own SELECT and the tenant's own INSERT; the absence of
-- an operator policy here is what makes the declared path the only one.
drop policy activity_event_select_operator on public.activity_event;

-- The declared operator read path. VOLATILE because it writes: PostgREST runs
-- POST /rpc in a read-write transaction, which is the whole reason the log can
-- be written here and not in a policy.
--
-- `payload` is absent from the return type. That absence is the exclusion, and
-- it holds whether or not a grant is live, because there is no argument and no
-- caller that adds a column to a function's signature.
create or replace function public.operator_read_activity_event(p_tenant_id uuid)
returns table (
  id                uuid,
  tenant_id         uuid,
  actor_member_id   uuid,
  actor_operator_id uuid,
  action            text,
  entity_type       text,
  entity_id         uuid,
  occurred_at       timestamptz
)
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  -- Refused, not empty. SECURITY_MODEL.md §5 makes an operator request with no
  -- live grant indistinguishable from a cross-tenant one; both end here, and
  -- neither says whether the tenant exists.
  if not public.is_operator() then
    raise exception 'operator read refused: the caller is not an operator'
      using errcode = 'insufficient_privilege';
  end if;

  if not public.has_live_consent_grant(p_tenant_id) then
    raise exception 'operator read refused: no live consent grant for this tenant'
      using errcode = 'insufficient_privilege';
  end if;

  -- Written before the rows are returned, so a read that is interrupted after
  -- the log is still a read that happened. The tenant reads this row like any
  -- other event: §7 makes the audit trail theirs.
  insert into public.activity_event
    (tenant_id, actor_operator_id, action, entity_type, entity_id)
  values
    (p_tenant_id, auth.uid(), 'operator.activity_event.read', 'ActivityEvent', null);

  return query
    select e.id, e.tenant_id, e.actor_member_id, e.actor_operator_id,
           e.action, e.entity_type, e.entity_id, e.occurred_at
      from public.activity_event e
     where e.tenant_id = p_tenant_id
     order by e.occurred_at desc, e.id;
end
$$;


-- ===== migration: 20260803120003_function_execute_grants =====

-- CF-105 — EXECUTE on a function in `public` defaults to PUBLIC, and
-- 20260802120007's blanket revoke covers tables only. Every function in this
-- schema was therefore a PostgREST RPC endpoint callable by `anon`, including
-- ones that had not been written yet.
--
-- Revoking PUBLIC and `anon` is not enough, and the reason is the same one
-- 20260802120007 records for tables. A Supabase project ships ALTER DEFAULT
-- PRIVILEGES granting EXECUTE on new functions in `public` to anon,
-- authenticated and service_role, so each function arrives holding three
-- explicit grants of its own. Revoking PUBLIC removes a default that was never
-- what carried them. Every role is therefore revoked and only the ones that
-- need a given function are granted it back.
--
-- The same shape as the table revoke, and the same obligation: any later
-- migration that adds a function to `public` repeats this revoke and states its
-- own grant, or the function ships callable by every signed-in identity.

revoke execute on all functions in schema public from public;
revoke execute on all functions in schema public from anon;
revoke execute on all functions in schema public from authenticated;
revoke execute on all functions in schema public from service_role;

-- The three tenancy helpers are evaluated inside policies, and a policy
-- expression is executed with the privileges of the caller, so `authenticated`
-- needs EXECUTE for its own policies to work. `anon` evaluates none of them:
-- every policy in this schema is `to authenticated`.
grant execute on function public.current_tenant_id()        to authenticated;
grant execute on function public.is_operator()              to authenticated;
grant execute on function public.is_current_tenant_owner()  to authenticated;

-- The consent predicate and the declared operator read path. Granting the read
-- path to `authenticated` rather than to some narrower role is correct: there
-- is no operator role, an operator is an ordinary authenticated identity with
-- an `operator` row, and the function refuses anyone else on its first line.
grant execute on function public.has_live_consent_grant(uuid)      to authenticated;
grant execute on function public.operator_read_activity_event(uuid) to authenticated;

-- enforce_tenant_active_owner() receives no grant, deliberately. A trigger
-- function's EXECUTE privilege is checked when the trigger is created, never
-- when it fires, so the constraint keeps working while the function stops
-- being an RPC endpoint. It is the one function here that no caller should
-- ever invoke directly.
--
-- service_role receives no grant either. It bypasses row-level security, so it
-- evaluates none of these policies, and ADR-005's quarantined client uses it
-- for provisioning writes alone. A privilege with no reader is exposure with no
-- purpose.


-- ===== migration: 20260803120004_membership_invitation_visibility =====

-- This task's own gate finding, one layer beneath CF-103's fix. It is recorded
-- as a separate migration rather than folded into 20260803120001 because that
-- one is applied: an applied migration is history, and history that gets edited
-- to look correct is the thing ADR-006's single-applier rule exists to prevent.
--
-- 20260803120001 gave the invitee an UPDATE policy and nothing to update.
-- PostgreSQL applies the SELECT policies on top of an UPDATE policy's USING
-- whenever the statement reads existing row values, and `UPDATE ... WHERE` —
-- the only shape PostgREST emits for a PATCH — always does. membership's one
-- SELECT policy is membership_select_tenant, `tenant_id = current_tenant_id()`,
-- and an invitee holds no ACTIVE membership in the inviting tenant, because
-- that is what being invited means. The row was invisible to the single person
-- entitled to act on it. Their acceptance matched zero rows and PostgREST
-- answered 204, so the defect presented as success.
--
-- A right nobody can exercise is not a right. An invitation the invitee cannot
-- see is the availability defect wearing its other face: SECURITY_MODEL.md §1's
-- fourth guarantee says an owner may not force a stranger active, and A2's
-- answer to that was to make acceptance the invitee's to give. Withholding the
-- row withholds the giving.
--
-- Scoped to the invitation and to nothing else. Without `status = 'invited'`
-- this would read "see your own membership rows in every tenant", and then any
-- owner anywhere could make a row appear in a stranger's result set at will and
-- keep it there. What the invitee gains sight of is one offer addressed to them
-- by name, which they accept or leave to lapse; the moment they accept, the row
-- leaves this policy and is covered by membership_select_tenant like any other.
create policy membership_select_own_invitation on public.membership
  for select to authenticated
  using (
    member_id = auth.uid()
    and status = 'invited'
    and archived_at is null
  );


-- ===== migration: 20260803120005_membership_self_visibility =====

-- 20260803120004 was half right, and the gate said so on the next run. This is
-- the other half, kept as its own migration because 004 is applied and an
-- applied migration is history (ADR-006).
--
-- 004 scoped the invitee's new SELECT policy to `status = 'invited'`, reasoning
-- that an invitee needs to see the offer and nothing more. The offer became
-- visible and acceptance was still refused, now with 42501 rather than a silent
-- zero-row match.
--
-- Measured rather than guessed: with the accept policy's WITH CHECK replaced by
-- literal `true` and both other UPDATE policies dropped, the refusal survived.
-- A WITH CHECK that cannot fail was failing, so the check being violated was
-- never the UPDATE policy's.
--
-- PostgreSQL applies the SELECT policies to an UPDATE **twice**: to the old row,
-- which is why 004 was needed at all, and again to the NEW row, so that no
-- UPDATE can push a row out of the caller's own visibility. An `invited`-only
-- SELECT policy does exactly that: the row the invitee is permitted to write is
-- `active`, and `active` is what the policy stops covering. Accepting an
-- invitation under 004 meant updating a row into a state its owner could no
-- longer see, and the server is right to refuse it.
--
-- So the rule is not "an invitee may see their invitation". It is the plainer
-- thing that was true all along: **a member may see the membership rows that
-- are theirs**, wherever they are, in whatever state. A person is entitled to
-- know which tenants claim them and in what role, and no other member is
-- exposed by it — `membership_select_tenant` remains the only way to see anyone
-- else's row, and it still requires an active membership in that tenant.
--
-- What this concedes, stated rather than buried: an owner can now put one row
-- into a stranger's result set, since inviting someone is how anyone ever joins
-- a second tenant. It confers nothing. The row is `invited`, it does not move
-- what the stranger resolves to, and ignoring it is a complete defence.
-- DATA_MODEL.md §5 proof 9 asserts exactly that, from the victim's side.

drop policy membership_select_own_invitation on public.membership;

create policy membership_select_own on public.membership
  for select to authenticated
  using ( member_id = auth.uid() );


-- ===== migration: 20260805120001_session_tenant_selector =====

-- OD-G14 — session-to-membership binding, implemented. 20260802120004 shipped
-- current_tenant_id() failing closed on more than one active membership, and
-- said why in its own comment: DATA_MODEL.md specified no storage for the
-- binding and no rule for choosing among several, so denying was the only safe
-- direction. The decision now exists, so the function implements it instead of
-- working around its absence. CF-93 gap (3) and CF-103's remainder.
--
-- The contract, which DATA_MODEL.md §2 states as the same table:
--
--   selector absent, 0 active memberships              -> null
--   selector absent, exactly 1 active membership       -> that tenant
--   selector absent, 2 or more active memberships      -> null
--   selector present, malformed                        -> null, never an error
--   selector present, no active membership for it      -> null
--   selector present, held active                      -> that tenant
--
-- Explicit beats implicit, and a wrong explicit fails closed. A caller holding
-- exactly one active membership who supplies a selector naming a tenant they do
-- not hold resolves null; it does NOT fall back to the held one. Acting in a
-- tenant the caller did not ask for is worse than acting in none.

-- THE TRANSPORT — an ordinary HTTP request header, read out of PostgREST's
-- per-request `request.headers` setting.
--
-- OD-G14 forecloses both alternatives. A token claim is out because the client
-- would then hold the tenant of record and a re-issued token would carry a
-- stale one; a stored per-person value is out because it is shared across every
-- session and device that person has open. A request header is neither: it is
-- supplied per request, by the caller, and nothing persists it.
--
-- A forged header is harmless, and that is a property of the join below rather
-- than of any check on the header. The value never selects rows; it can only
-- narrow `held`, which is re-derived from public.membership on every call. The
-- most a caller can do by forging it is name a tenant they do not hold, and the
-- answer to that is null — they lose their own access for that request and gain
-- nothing. There is no value that widens reach, because there is no value that
-- adds a row to `held`.
--
-- STABLE is still correct now that the body reads a per-request value.
-- current_setting() is itself stable, and PostgREST sets the request settings
-- once per transaction, before the statement runs — so the value cannot change
-- within a statement, which is exactly what STABLE promises. VOLATILE would be
-- wrong in the other direction: it would force re-evaluation per row inside
-- every policy that calls this, at no gain.
--
-- Known boundary, recorded rather than discovered later: Supabase Realtime does
-- not carry request headers into its WebSocket handshake, so a policy evaluated
-- there sees no selector. That degrades to "absent", which is denial and not
-- disclosure. Nothing in this schema is subscribed to today.

create or replace function public.current_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  with sent as (
    -- PostgREST always sets valid JSON here, and this still guards the cast: a
    -- security definer function on the tenancy spine does not get to assume its
    -- inputs. An unset setting reads as null and lands in the same empty object.
    select case
             when pg_input_is_valid(current_setting('request.headers', true), 'jsonb')
               then current_setting('request.headers', true)::jsonb
             else '{}'::jsonb
           end as headers
  ),
  selector as (
    -- HTTP header names are case-insensitive, so the lookup lowercases the key
    -- rather than trusting a client to pick a convention. An absent header, an
    -- empty one and a whitespace-only one are all `absent`: a client that has
    -- not chosen a tenant yet sends nothing, and an intermediary that blanks the
    -- value must not lock out every single-membership caller in the process.
    select lower(btrim(entry.value)) as supplied
      from sent, jsonb_each_text(sent.headers) as entry(key, value)
     where lower(entry.key) = 'x-b2s-tenant'
       and btrim(entry.value) <> ''
     order by entry.key
     limit 1
  ),
  held as (
    -- The whole of what the caller holds. `invited`, `suspended` and archived
    -- memberships are not held: the predicate is the one 20260802120004 already
    -- used, unchanged.
    select m.tenant_id
      from public.membership m
     where m.member_id = auth.uid()
       and m.status = 'active'
       and m.archived_at is null
  )
  select case
           when exists (select 1 from selector) then (
             -- Compared as text, deliberately. A uuid cast would raise 22P02 on
             -- a malformed selector, and the contract's fourth row forbids that
             -- outright — inside a policy an exception is a failed request, not
             -- a denied one. Comparing text also collapses three rows of the
             -- contract into one code path: malformed, unheld and nonexistent
             -- are the same non-match and therefore indistinguishable to the
             -- caller, which is SECURITY_MODEL.md §1's existence property
             -- holding by construction rather than by a matching pair of
             -- branches somebody has to keep in agreement.
             select h.tenant_id
               from held h
              where h.tenant_id::text = (select s.supplied from selector s)
           )
           else (
             -- No selector: one active membership resolves implicitly, and any
             -- other number resolves null. Two is ambiguous, zero is nothing.
             select h.tenant_id
               from held h
              where (select count(*) from held) = 1
           )
         end
$$;

-- is_current_tenant_owner() is deliberately not touched. It already reads
-- `m.tenant_id = public.current_tenant_id()`, so it follows the selection for
-- free: an owner of two tenants who selects one is an owner in that one and not
-- in the other. Restating its body here would create a second place for the
-- rule to live.

-- CF-105's obligation, restated at the narrowest scope that discharges it.
-- CREATE OR REPLACE preserves a function's ACL, so these two statements should
-- be no-ops; they are here because "should be" is not an assertion, and proof
-- 22 checks the resulting privilege set either way.
revoke execute on function public.current_tenant_id() from public;
revoke execute on function public.current_tenant_id() from anon;
revoke execute on function public.current_tenant_id() from service_role;
grant  execute on function public.current_tenant_id() to authenticated;


-- ===== migration: 20260805120002_member_materialisation_and_tenant_provisioning =====

-- OD-G13's two acts, built. Until this migration nothing in this schema created
-- a `member` row and nothing created a `tenant` row: no INSERT policy, no
-- trigger, no function, no insert path at all. Every proof that needed either
-- one seeded it through the isolation harness's privileged SQL, so the schema
-- specified a tenancy spine that no live caller could ever enter.
--
-- OD-G13 separates the two acts and the separation is the decision:
--
--   Authentication establishes identity and creates at most a Member. It never
--   creates a Membership, never grants a Role, never confers authorization and
--   does not itself create a Tenant.
--
--   A Tenant is created only by an explicit provisioning act on the privileged
--   path, which sign-up may initiate immediately after but never IS, creating
--   the tenant and the caller's active owner Membership atomically and
--   recording an ActivityEvent.
--
-- So: a trigger for the first, a function for the second. The shapes are not
-- interchangeable and the reasons are below each one.

-- WHY BOTH ARE `security definer` AND WHAT THAT BUYS.
--
-- Every table in this schema is owned by `postgres` and none carries FORCE ROW
-- LEVEL SECURITY, so a `security definer` function owned by `postgres` writes
-- past the policies rather than through them. That is the privileged path
-- ADR-005 names, reached in the data layer as ADR-003 requires, and it is the
-- same mechanism `operator_read_activity_event` already uses.
--
-- It is deliberately NOT the `service_role` client at
-- lib/supabase/server-only/service.ts, and the reason is atomicity rather than
-- taste. That client speaks PostgREST, where every request is its own
-- transaction: three round trips cannot be one act, and a failure after the
-- tenant insert would leave a tenant with no owner — which the deferred
-- `membership_active_owner_required` trigger would not even catch, because it
-- fires at the commit of a transaction that had already succeeded. A single
-- function call is one transaction by construction. The privileged client
-- remains the right tool for provisioning work that is not one statement's
-- worth of writes; it is the wrong tool for this one.


-- §3.2 — MEMBER MATERIALISATION.
--
-- A trigger on `auth.users`, not an RPC the client calls after signing in, and
-- the difference is load-bearing three times over:
--
--   1. OD-G13 says authentication creates the Member. A trigger is that
--      sentence; an RPC is "the client asks for one afterwards", which leaves a
--      window in which an authenticated identity holds no `member` row and
--      every provisioning and invitation path has to handle it.
--   2. There is nothing to call, so there is nothing to call wrongly. The id
--      and the address are read out of the row `auth` itself just wrote, so no
--      caller can name an id or an address that is not their own — not because
--      an argument is validated, but because there is no argument.
--   3. Fail-closed means the identity never comes into being. This trigger
--      fires inside the transaction that inserts into `auth.users`, so raising
--      here takes the auth row with it: no `member` row, no second identity, no
--      linkage, nothing half-written to reconcile later.
--
-- It grants nothing, and that is the whole of what it does. A freshly
-- materialised Member holds no `membership`, so `current_tenant_id()` resolves
-- null for them (§2.1's first contract row) and every policy in this schema
-- reads them zero rows. No `activity_event` is written either, and cannot be:
-- `activity_event.tenant_id` is `not null` and a Member belongs to no tenant.
--
-- `created_by` is left null on purpose. Rule 4's provenance column references
-- `member (id)` and nobody created this row — the person did, by proving an
-- address, and `id` already records that.
create or replace function public.materialise_member()
returns trigger
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_constraint text;
begin
  -- OD-G13 keys the identity invariant to an email address: "one email address
  -- resolves to exactly one member.id, whichever mechanism was used". An
  -- identity carrying no address cannot satisfy that invariant, so it is
  -- refused rather than materialised without the thing the invariant is about.
  -- `member.email` is `not null` and would refuse it anyway; this says so in
  -- one line the caller can read instead of in a constraint name.
  if new.email is null or btrim(new.email) = '' then
    raise exception
      'member materialisation refused: this identity carries no email address'
      using errcode = 'not_null_violation',
            hint = 'OD-G13 resolves one address to exactly one member.id. An identity with no address cannot satisfy that invariant.';
  end if;

  begin
    insert into public.member (id, email)
    values (new.id, new.email::extensions.citext);
  exception
    when unique_violation then
      -- `member.email` is citext unique, so this is the identity invariant
      -- firing: a second authenticating identity for an address the platform
      -- already holds. OD-G13 fails the flow closed and the person uses the
      -- mechanism they registered with. Re-raised with a message that says
      -- which rule refused, because a bare 23505 naming a constraint is a
      -- diagnostic and not an answer.
      get stacked diagnostics v_constraint = constraint_name;
      if v_constraint = 'member_email_key' then
        raise exception
          'member materialisation refused: this email address is already held by a different member'
          using errcode = 'unique_violation',
                hint = 'OD-G13 identity invariant: one address is one member.id. Sign in with the mechanism this address was registered with.';
      end if;
      -- Any other unique violation is not this rule and is not this trigger's
      -- to reinterpret. A bare RAISE re-raises the original, SQLSTATE, message
      -- and constraint name intact.
      raise;
  end;

  -- AFTER trigger: the return value is discarded, and returning null says so
  -- rather than implying the row could still be influenced from here.
  return null;
end
$$;

-- AFTER, not BEFORE. `member.id references auth.users (id)`, so the auth row has
-- to exist before the member row can point at it. FOR EACH ROW because an
-- identity is materialised one at a time, and the admin API can create several
-- in one statement.
create trigger member_materialisation
after insert on auth.users
for each row
execute function public.materialise_member();


-- §3.1, §3.3, §3.6 — TENANT PROVISIONING.
--
-- One act, one transaction, three rows: the `tenant`, the caller's `owner`
-- `active` `membership`, and the `activity_event` that records it. OD-G13
-- requires all three or none.
--
-- ATOMICITY IS THE MECHANISM, not a convention this function observes. A
-- plpgsql function body runs inside the caller's transaction, and PostgREST
-- gives each request exactly one. Any raise — a duplicate slug, a rejected
-- argument, a constraint, a trigger, a disk error — aborts the whole of it, so
-- there is no ordering of these three inserts that can leave a partial tenant.
-- The deferred `membership_active_owner_required` trigger then fires at commit
-- against a tenant that already holds its first active owner, which is exactly
-- the case 20260802120005 deferred itself for.
--
-- IT CANNOT PROVISION FOR ANYBODY ELSE, and again by construction rather than
-- by check: there is no member parameter. The owner is `auth.uid()`, taken from
-- the verified token, so the only tenant a caller can create is one they own.
-- Naming a stranger would require an argument this signature does not have.
--
-- IT IS A SECOND ACT AND NEVER A SIDE EFFECT. Nothing calls this: no trigger,
-- no default, no policy, no other function. A sign-in reaches it only if the
-- caller reaches it, which is what OD-G13's "which sign-up may initiate
-- immediately after but never is" means in a schema.
--
-- NOT RATE-LIMITED, stated rather than left to be discovered. Any authenticated
-- Member may call this as often as they like, and each call is a tenant, a
-- membership and an event. Nothing here bounds that, no mechanism for bounding
-- it has been decided, and inventing one would be a stack decision this task
-- does not hold. Recorded as CF-129 with what remains reachable.
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

  -- §3.1 fixes the shape of these two columns in prose and the table carries no
  -- constraint for either, so this is the only place the shape can be
  -- established — this function is the only writer `tenant` has. Nothing here
  -- invents a rule: `name` is "the company's own name", `slug` is "URL-safe,
  -- lowercase". `base_currency` and `default_locale` are passed through
  -- unvalidated, which is a gap this task found rather than closed: see CF-130.
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
  -- copy there.
  insert into public.activity_event
    (tenant_id, actor_member_id, action, entity_type, entity_id)
  values
    (v_tenant, v_caller, 'tenant.provisioned', 'Tenant', v_tenant);

  return v_tenant;
end
$$;


-- CF-105's standing obligation: a Supabase project ships ALTER DEFAULT
-- PRIVILEGES granting EXECUTE on every new `public` function to anon,
-- authenticated and service_role, so each of these two arrived holding three
-- explicit grants of its own. Every migration adding a function repeats the
-- revoke and states its own grant, or the function ships callable by every
-- signed-in identity.

revoke execute on function public.materialise_member() from public;
revoke execute on function public.materialise_member() from anon;
revoke execute on function public.materialise_member() from authenticated;
revoke execute on function public.materialise_member() from service_role;

-- materialise_member() receives no grant at all, for the reason
-- enforce_tenant_active_owner() receives none: a trigger function's EXECUTE
-- privilege is checked when the trigger is created, never when it fires. The
-- trigger keeps working while the function stops being an RPC endpoint, which
-- is the correct state for the one function here that no caller should ever
-- invoke directly.

revoke execute on function public.provision_tenant(text, text, text, text) from public;
revoke execute on function public.provision_tenant(text, text, text, text) from anon;
revoke execute on function public.provision_tenant(text, text, text, text) from service_role;

-- `authenticated` is the whole of the grant, and the function's own first two
-- checks are what narrow it further: an unauthenticated caller and an
-- authenticated one holding no Member are both refused inside the body. anon is
-- revoked as well as refused, so the endpoint is not merely unproductive for it
-- but absent. service_role receives nothing because it bypasses RLS and would
-- gain nothing from a definer function it could out-write directly.
grant execute on function public.provision_tenant(text, text, text, text) to authenticated;
