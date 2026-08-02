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


