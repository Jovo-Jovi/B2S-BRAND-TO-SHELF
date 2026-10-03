-- ===== migration: 20261003120001_tenant_business_data =====

-- OD-G26 and OD-A9, signed 2026-10-03. Three tables, and provision_tenant
-- replaced: the four-argument form is dropped in this same migration and the
-- three-argument form generates the slug. No caller supplies, chooses or
-- changes one.
--
-- legal_entity is the registered company behind a tenant, 1:1 with tenant.
-- It is not columns on tenant, because tenant's row holds status, which a
-- business must never be able to edit. onboarding_draft is onboarding's one
-- store: the step to resume at. onboarding_draft_color holds a colour set
-- before all seven roles exist; a theme cannot be saved with fewer (§4).
--
-- No operator policy on any of the three. No DELETE policy. Bilingual text
-- is a translation_key, never a text column.
--
-- Independently revertible: drop the three triggers, the policies, the
-- grants, the three tables, then restore the four-argument function from
-- the previous migration.

-- §3.22 legal_entity
create table public.legal_entity (
  id                        uuid primary key default gen_random_uuid(),
  tenant_id                 uuid not null references public.tenant (id),
  legal_name_key_id         uuid,
  trading_name_key_id       uuid,
  tax_registration_number   text,
  registered_address_key_id uuid,
  contact_email             text,
  contact_phone             text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  created_by                uuid references public.member (id),
  archived_at               timestamptz,
  unique (tenant_id),
  unique (id, tenant_id),
  constraint legal_entity_tax_registration_number_shape check (
    tax_registration_number ~ '^[0-9A-Za-z]{1,32}$'
  ),
  constraint legal_entity_contact_email_shape check (
    char_length(contact_email) <= 254
    and contact_email ~ '^[^[:space:]@]+@[^[:space:]@]+$'
  ),
  constraint legal_entity_contact_phone_e164 check (
    contact_phone ~ '^\+[1-9][0-9]{6,14}$'
  ),
  foreign key (legal_name_key_id, tenant_id)
    references public.translation_key (id, tenant_id),
  foreign key (trading_name_key_id, tenant_id)
    references public.translation_key (id, tenant_id),
  foreign key (registered_address_key_id, tenant_id)
    references public.translation_key (id, tenant_id)
);

create trigger legal_entity_set_updated_at
before update on public.legal_entity
for each row
execute function public.set_updated_at();

alter table public.legal_entity enable row level security;
revoke all on table public.legal_entity from anon;
revoke all on table public.legal_entity from authenticated;
grant select, insert, update on table public.legal_entity to authenticated;

create policy legal_entity_select_tenant on public.legal_entity
  for select to authenticated
  using (tenant_id = public.current_tenant_id());

create policy legal_entity_insert_owner on public.legal_entity
  for insert to authenticated
  with check (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  );

create policy legal_entity_update_owner on public.legal_entity
  for update to authenticated
  using (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  )
  with check (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  );

-- §3.23 onboarding_draft — one per tenant. Archived when onboarding completes.
create table public.onboarding_draft (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenant (id),
  resume_step text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid references public.member (id),
  archived_at timestamptz,
  unique (tenant_id),
  unique (id, tenant_id),
  constraint onboarding_draft_resume_step_permitted check (
    resume_step in ('brand', 'typography', 'company', 'guidelines', 'review')
  )
);

create trigger onboarding_draft_set_updated_at
before update on public.onboarding_draft
for each row
execute function public.set_updated_at();

alter table public.onboarding_draft enable row level security;
revoke all on table public.onboarding_draft from anon;
revoke all on table public.onboarding_draft from authenticated;
grant select, insert, update on table public.onboarding_draft to authenticated;

create policy onboarding_draft_select_owner on public.onboarding_draft
  for select to authenticated
  using (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  );

create policy onboarding_draft_insert_owner on public.onboarding_draft
  for insert to authenticated
  with check (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  );

create policy onboarding_draft_update_owner on public.onboarding_draft
  for update to authenticated
  using (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  )
  with check (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  );

-- §3.24 onboarding_draft_color — a colour before all seven roles hold a value.
create table public.onboarding_draft_color (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenant (id),
  draft_id    uuid not null,
  role        public.color_role not null,
  srgb        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid references public.member (id),
  archived_at timestamptz,
  unique (draft_id, role),
  unique (id, tenant_id),
  constraint onboarding_draft_color_srgb_shape check (
    srgb ~ '^#[0-9a-f]{6}$'
  ),
  foreign key (draft_id, tenant_id)
    references public.onboarding_draft (id, tenant_id)
);

create trigger onboarding_draft_color_set_updated_at
before update on public.onboarding_draft_color
for each row
execute function public.set_updated_at();

alter table public.onboarding_draft_color enable row level security;
revoke all on table public.onboarding_draft_color from anon;
revoke all on table public.onboarding_draft_color from authenticated;
grant select, insert, update on table public.onboarding_draft_color to authenticated;

create policy onboarding_draft_color_select_owner on public.onboarding_draft_color
  for select to authenticated
  using (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  );

create policy onboarding_draft_color_insert_owner on public.onboarding_draft_color
  for insert to authenticated
  with check (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  );

create policy onboarding_draft_color_update_owner on public.onboarding_draft_color
  for update to authenticated
  using (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  )
  with check (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  );

-- OD-G26. Drop the four-argument identity, then create the three-argument
-- one. CREATE OR REPLACE with a different argument list would add an
-- overload and leave the old identity callable. The slug is twelve
-- lowercase hexadecimal characters from gen_random_uuid(), retried on a
-- unique violation up to five times.
drop function public.provision_tenant(text, text, text, text);

create function public.provision_tenant(
  p_name           text,
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
  v_slug   text;
  v_try    integer := 0;
begin
  if v_caller is null then
    raise exception
      'tenant provisioning refused: the caller is not an authenticated identity'
      using errcode = 'insufficient_privilege';
  end if;

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

  if p_name is null or btrim(p_name) = '' then
    raise exception
      'tenant provisioning refused: a tenant must carry a name'
      using errcode = 'check_violation';
  end if;

  <<generate_slug>>
  loop
    v_try := v_try + 1;
    if v_try > 5 then
      raise exception
        'tenant provisioning refused: a unique slug could not be generated'
        using errcode = 'unique_violation';
    end if;
    v_slug := substr(replace(pg_catalog.gen_random_uuid()::text, '-', ''), 1, 12);
    begin
      insert into public.tenant
        (name, slug, base_currency, default_locale, status, created_by)
      values
        (btrim(p_name), v_slug, p_base_currency, p_default_locale, 'active', v_caller)
      returning id into v_tenant;
      exit generate_slug;
    exception
      when unique_violation then
        null;
    end;
  end loop generate_slug;

  insert into public.membership
    (tenant_id, member_id, role, status, accepted_at, created_by)
  values
    (v_tenant, v_caller, 'owner', 'active', now(), v_caller);

  insert into public.activity_event
    (tenant_id, actor_member_id, action, entity_type, entity_id)
  values
    (v_tenant, v_caller, 'tenant.provisioned', 'Tenant', v_tenant);

  return v_tenant;
end
$$;

revoke execute on function public.provision_tenant(text, text, text) from public;
revoke execute on function public.provision_tenant(text, text, text) from anon;
revoke execute on function public.provision_tenant(text, text, text) from service_role;
grant  execute on function public.provision_tenant(text, text, text) to authenticated;
