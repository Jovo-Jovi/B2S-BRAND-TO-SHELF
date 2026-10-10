-- ===== migration: 20261004120002_wizard_write_paths =====

-- P03-T22. The wizard's multi-table writes. Five functions, each
-- SECURITY INVOKER, so every statement runs under the caller's own
-- policies. None is security definer. search_path is pinned empty.
-- EXECUTE is granted to authenticated only. The count of security
-- definer functions in public stays ten.
--
-- Independently revertible: revoke the five grants, then drop the
-- five functions. No table, policy or existing function is touched.

create function public.save_brand_name(p_name_en text, p_name_ar text)
returns table (brand_id uuid, profile_id uuid)
language plpgsql
volatile
security invoker
set search_path = ''
as $fn$
declare
  v_caller uuid := auth.uid();
  v_tenant uuid := public.current_tenant_id();
  v_en text := nullif(btrim(p_name_en), '');
  v_ar text := nullif(btrim(p_name_ar), '');
  v_brand uuid;
  v_key uuid;
  v_profile uuid;
  v_version integer;
begin
  if v_caller is null then
    raise exception 'save_brand_name refused: the caller is not authenticated'
      using errcode = 'insufficient_privilege';
  end if;
  if v_tenant is null then
    raise exception 'save_brand_name refused: the caller has no tenant'
      using errcode = 'insufficient_privilege';
  end if;
  if v_en is null and v_ar is null then
    raise exception 'save_brand_name refused: at least one name, trimmed, must be non-empty'
      using errcode = 'check_violation';
  end if;

  select b.id, b.name_key_id
    into v_brand, v_key
    from public.brand b
   where b.tenant_id = v_tenant;

  if v_brand is null then
    insert into public.translation_key (tenant_id, created_by)
    values (v_tenant, v_caller)
    returning id into v_key;

    if v_en is not null then
      insert into public.translation_entry (tenant_id, key_id, locale, value, created_by)
      values (v_tenant, v_key, 'en', v_en, v_caller);
    end if;
    if v_ar is not null then
      insert into public.translation_entry (tenant_id, key_id, locale, value, created_by)
      values (v_tenant, v_key, 'ar', v_ar, v_caller);
    end if;

    insert into public.brand (tenant_id, name_key_id, created_by)
    values (v_tenant, v_key, v_caller)
    returning id into v_brand;

    insert into public.brand_profile (tenant_id, brand_id, version, created_by)
    values (v_tenant, v_brand, 1, v_caller)
    returning id into v_profile;
  else
    if v_en is not null then
      update public.translation_entry
         set value = v_en
       where tenant_id = v_tenant and key_id = v_key and locale = 'en';
      if not found then
        insert into public.translation_entry (tenant_id, key_id, locale, value, created_by)
        values (v_tenant, v_key, 'en', v_en, v_caller);
      end if;
    end if;
    if v_ar is not null then
      update public.translation_entry
         set value = v_ar
       where tenant_id = v_tenant and key_id = v_key and locale = 'ar';
      if not found then
        insert into public.translation_entry (tenant_id, key_id, locale, value, created_by)
        values (v_tenant, v_key, 'ar', v_ar, v_caller);
      end if;
    end if;

    select p.id
      into v_profile
      from public.brand_profile p
     where p.brand_id = v_brand
       and p.tenant_id = v_tenant
     order by p.version desc
     limit 1;

    if v_profile is null then
      select coalesce(max(p.version), 0) + 1
        into v_version
        from public.brand_profile p
       where p.brand_id = v_brand
         and p.tenant_id = v_tenant;
      insert into public.brand_profile (tenant_id, brand_id, version, created_by)
      values (v_tenant, v_brand, v_version, v_caller)
      returning id into v_profile;
    end if;
  end if;

  return query select v_brand, v_profile;
end
$fn$;

revoke execute on function public.save_brand_name(text, text) from public;
revoke execute on function public.save_brand_name(text, text) from anon;
revoke execute on function public.save_brand_name(text, text) from service_role;
grant execute on function public.save_brand_name(text, text) to authenticated;

create function public.save_brand_theme(
  p_profile_id uuid,
  p_primary text,
  p_secondary text,
  p_accent text,
  p_background text,
  p_foreground text,
  p_muted text,
  p_critical text
)
returns void
language plpgsql
volatile
security invoker
set search_path = ''
as $fn$
declare
  v_caller uuid := auth.uid();
  v_tenant uuid := public.current_tenant_id();
  v_profile uuid;
  v_theme uuid;
  v_name_key uuid;
  v_role text;
  v_srgb text;
  v_bad text := '';
begin
  if v_caller is null then
    raise exception 'save_brand_theme refused: the caller is not authenticated'
      using errcode = 'insufficient_privilege';
  end if;
  if v_tenant is null then
    raise exception 'save_brand_theme refused: the caller has no tenant'
      using errcode = 'insufficient_privilege';
  end if;

  select p.id
    into v_profile
    from public.brand_profile p
   where p.id = p_profile_id
     and p.tenant_id = v_tenant;
  if v_profile is null then
    raise exception 'save_brand_theme refused: the profile is not visible'
      using errcode = 'insufficient_privilege';
  end if;

  for v_role, v_srgb in
    select * from (values
      ('primary'::text, p_primary),
      ('secondary'::text, p_secondary),
      ('accent'::text, p_accent),
      ('background'::text, p_background),
      ('foreground'::text, p_foreground),
      ('muted'::text, p_muted),
      ('critical'::text, p_critical)
    ) as colours(role, srgb)
  loop
    if v_srgb is null then
      v_bad := v_bad || v_role || ' missing; ';
    elsif v_srgb !~ '^#[0-9a-f]{6}$' then
      v_bad := v_bad || v_role || ' malformed; ';
    end if;
  end loop;
  if v_bad <> '' then
    raise exception 'save_brand_theme refused: %', btrim(v_bad)
      using errcode = 'check_violation';
  end if;

  select t.id
    into v_theme
    from public.brand_theme t
   where t.profile_id = v_profile
     and t.tenant_id = v_tenant
     and t.is_default
   limit 1;

  if v_theme is null then
    insert into public.translation_key (tenant_id, created_by)
    values (v_tenant, v_caller)
    returning id into v_name_key;
    insert into public.translation_entry (tenant_id, key_id, locale, value, created_by)
    values
      (v_tenant, v_name_key, 'en', 'Main colours', v_caller),
      (v_tenant, v_name_key, 'ar', 'الألوان الرئيسية', v_caller);
    insert into public.brand_theme (tenant_id, profile_id, name_key_id, is_default, created_by)
    values (v_tenant, v_profile, v_name_key, true, v_caller)
    returning id into v_theme;
  end if;

  for v_role, v_srgb in
    select * from (values
      ('primary'::text, p_primary),
      ('secondary'::text, p_secondary),
      ('accent'::text, p_accent),
      ('background'::text, p_background),
      ('foreground'::text, p_foreground),
      ('muted'::text, p_muted),
      ('critical'::text, p_critical)
    ) as colours(role, srgb)
  loop
    update public.color_value
       set srgb = v_srgb
     where tenant_id = v_tenant
       and theme_id = v_theme
       and role = v_role::public.color_role;
    if not found then
      insert into public.color_value (tenant_id, theme_id, role, srgb, created_by)
      values (v_tenant, v_theme, v_role::public.color_role, v_srgb, v_caller);
    end if;
  end loop;

  update public.onboarding_draft_color
     set archived_at = pg_catalog.now()
   where tenant_id = v_tenant
     and archived_at is null
     and draft_id in (
       select d.id
         from public.onboarding_draft d
        where d.tenant_id = v_tenant
          and d.archived_at is null
     );
end
$fn$;

revoke execute on function public.save_brand_theme(uuid, text, text, text, text, text, text, text) from public;
revoke execute on function public.save_brand_theme(uuid, text, text, text, text, text, text, text) from anon;
revoke execute on function public.save_brand_theme(uuid, text, text, text, text, text, text, text) from service_role;
grant execute on function public.save_brand_theme(uuid, text, text, text, text, text, text, text) to authenticated;

create function public.save_legal_entity(
  p_legal_name_en text,
  p_legal_name_ar text,
  p_trading_name_en text,
  p_trading_name_ar text,
  p_registered_address_en text,
  p_registered_address_ar text,
  p_tax_registration_number text,
  p_contact_email text,
  p_contact_phone text
)
returns void
language plpgsql
volatile
security invoker
set search_path = ''
as $fn$
declare
  v_caller uuid := auth.uid();
  v_tenant uuid := public.current_tenant_id();
  v_entity uuid;
  v_legal_en text := nullif(btrim(p_legal_name_en), '');
  v_legal_ar text := nullif(btrim(p_legal_name_ar), '');
  v_trading_en text := nullif(btrim(p_trading_name_en), '');
  v_trading_ar text := nullif(btrim(p_trading_name_ar), '');
  v_address_en text := nullif(btrim(p_registered_address_en), '');
  v_address_ar text := nullif(btrim(p_registered_address_ar), '');
  v_tax text := nullif(btrim(p_tax_registration_number), '');
  v_email text := nullif(btrim(p_contact_email), '');
  v_phone text := nullif(btrim(p_contact_phone), '');
  v_legal_key uuid;
  v_trading_key uuid;
  v_address_key uuid;
begin
  if v_caller is null then
    raise exception 'save_legal_entity refused: the caller is not authenticated'
      using errcode = 'insufficient_privilege';
  end if;
  if v_tenant is null then
    raise exception 'save_legal_entity refused: the caller has no tenant'
      using errcode = 'insufficient_privilege';
  end if;

  select e.id, e.legal_name_key_id, e.trading_name_key_id, e.registered_address_key_id
    into v_entity, v_legal_key, v_trading_key, v_address_key
    from public.legal_entity e
   where e.tenant_id = v_tenant;

  if v_legal_en is not null or v_legal_ar is not null then
    if v_legal_key is null then
      insert into public.translation_key (tenant_id, created_by)
      values (v_tenant, v_caller)
      returning id into v_legal_key;
    end if;
    if v_legal_en is not null then
      update public.translation_entry
         set value = v_legal_en
       where tenant_id = v_tenant and key_id = v_legal_key and locale = 'en';
      if not found then
        insert into public.translation_entry (tenant_id, key_id, locale, value, created_by)
        values (v_tenant, v_legal_key, 'en', v_legal_en, v_caller);
      end if;
    end if;
    if v_legal_ar is not null then
      update public.translation_entry
         set value = v_legal_ar
       where tenant_id = v_tenant and key_id = v_legal_key and locale = 'ar';
      if not found then
        insert into public.translation_entry (tenant_id, key_id, locale, value, created_by)
        values (v_tenant, v_legal_key, 'ar', v_legal_ar, v_caller);
      end if;
    end if;
  end if;

  if v_trading_en is not null or v_trading_ar is not null then
    if v_trading_key is null then
      insert into public.translation_key (tenant_id, created_by)
      values (v_tenant, v_caller)
      returning id into v_trading_key;
    end if;
    if v_trading_en is not null then
      update public.translation_entry
         set value = v_trading_en
       where tenant_id = v_tenant and key_id = v_trading_key and locale = 'en';
      if not found then
        insert into public.translation_entry (tenant_id, key_id, locale, value, created_by)
        values (v_tenant, v_trading_key, 'en', v_trading_en, v_caller);
      end if;
    end if;
    if v_trading_ar is not null then
      update public.translation_entry
         set value = v_trading_ar
       where tenant_id = v_tenant and key_id = v_trading_key and locale = 'ar';
      if not found then
        insert into public.translation_entry (tenant_id, key_id, locale, value, created_by)
        values (v_tenant, v_trading_key, 'ar', v_trading_ar, v_caller);
      end if;
    end if;
  end if;

  if v_address_en is not null or v_address_ar is not null then
    if v_address_key is null then
      insert into public.translation_key (tenant_id, created_by)
      values (v_tenant, v_caller)
      returning id into v_address_key;
    end if;
    if v_address_en is not null then
      update public.translation_entry
         set value = v_address_en
       where tenant_id = v_tenant and key_id = v_address_key and locale = 'en';
      if not found then
        insert into public.translation_entry (tenant_id, key_id, locale, value, created_by)
        values (v_tenant, v_address_key, 'en', v_address_en, v_caller);
      end if;
    end if;
    if v_address_ar is not null then
      update public.translation_entry
         set value = v_address_ar
       where tenant_id = v_tenant and key_id = v_address_key and locale = 'ar';
      if not found then
        insert into public.translation_entry (tenant_id, key_id, locale, value, created_by)
        values (v_tenant, v_address_key, 'ar', v_address_ar, v_caller);
      end if;
    end if;
  end if;

  if v_entity is null then
    insert into public.legal_entity (
      tenant_id, legal_name_key_id, trading_name_key_id, tax_registration_number,
      registered_address_key_id, contact_email, contact_phone, created_by
    ) values (
      v_tenant, v_legal_key, v_trading_key, v_tax,
      v_address_key, v_email, v_phone, v_caller
    );
  else
    update public.legal_entity
       set legal_name_key_id = v_legal_key,
           trading_name_key_id = v_trading_key,
           registered_address_key_id = v_address_key,
           tax_registration_number = v_tax,
           contact_email = v_email,
           contact_phone = v_phone
     where id = v_entity
       and tenant_id = v_tenant;
  end if;
end
$fn$;

revoke execute on function public.save_legal_entity(text, text, text, text, text, text, text, text, text) from public;
revoke execute on function public.save_legal_entity(text, text, text, text, text, text, text, text, text) from anon;
revoke execute on function public.save_legal_entity(text, text, text, text, text, text, text, text, text) from service_role;
grant execute on function public.save_legal_entity(text, text, text, text, text, text, text, text, text) to authenticated;

create function public.save_guideline(
  p_profile_id uuid,
  p_guideline_id uuid,
  p_title_en text,
  p_title_ar text,
  p_body_en text,
  p_body_ar text,
  p_ordinal integer
)
returns void
language plpgsql
volatile
security invoker
set search_path = ''
as $fn$
declare
  v_caller uuid := auth.uid();
  v_tenant uuid := public.current_tenant_id();
  v_profile uuid;
  v_guideline uuid;
  v_title_key uuid;
  v_body_key uuid;
  v_title_en text := nullif(btrim(p_title_en), '');
  v_title_ar text := nullif(btrim(p_title_ar), '');
  v_body_en text := nullif(btrim(p_body_en), '');
  v_body_ar text := nullif(btrim(p_body_ar), '');
begin
  if v_caller is null then
    raise exception 'save_guideline refused: the caller is not authenticated'
      using errcode = 'insufficient_privilege';
  end if;
  if v_tenant is null then
    raise exception 'save_guideline refused: the caller has no tenant'
      using errcode = 'insufficient_privilege';
  end if;

  select p.id
    into v_profile
    from public.brand_profile p
   where p.id = p_profile_id
     and p.tenant_id = v_tenant;
  if v_profile is null then
    raise exception 'save_guideline refused: the profile is not visible'
      using errcode = 'insufficient_privilege';
  end if;

  if p_guideline_id is not null then
    select g.id, g.title_key_id, g.body_key_id
      into v_guideline, v_title_key, v_body_key
      from public.brand_guideline g
     where g.id = p_guideline_id
       and g.profile_id = v_profile
       and g.tenant_id = v_tenant;
    if v_guideline is null then
      raise exception 'save_guideline refused: the guideline is not visible'
        using errcode = 'insufficient_privilege';
    end if;
  end if;

  if v_title_key is null then
    insert into public.translation_key (tenant_id, created_by)
    values (v_tenant, v_caller)
    returning id into v_title_key;
  end if;
  if v_title_en is not null then
    update public.translation_entry
       set value = v_title_en
     where tenant_id = v_tenant and key_id = v_title_key and locale = 'en';
    if not found then
      insert into public.translation_entry (tenant_id, key_id, locale, value, created_by)
      values (v_tenant, v_title_key, 'en', v_title_en, v_caller);
    end if;
  end if;
  if v_title_ar is not null then
    update public.translation_entry
       set value = v_title_ar
     where tenant_id = v_tenant and key_id = v_title_key and locale = 'ar';
    if not found then
      insert into public.translation_entry (tenant_id, key_id, locale, value, created_by)
      values (v_tenant, v_title_key, 'ar', v_title_ar, v_caller);
    end if;
  end if;

  if v_body_key is null then
    insert into public.translation_key (tenant_id, created_by)
    values (v_tenant, v_caller)
    returning id into v_body_key;
  end if;
  if v_body_en is not null then
    update public.translation_entry
       set value = v_body_en
     where tenant_id = v_tenant and key_id = v_body_key and locale = 'en';
    if not found then
      insert into public.translation_entry (tenant_id, key_id, locale, value, created_by)
      values (v_tenant, v_body_key, 'en', v_body_en, v_caller);
    end if;
  end if;
  if v_body_ar is not null then
    update public.translation_entry
       set value = v_body_ar
     where tenant_id = v_tenant and key_id = v_body_key and locale = 'ar';
    if not found then
      insert into public.translation_entry (tenant_id, key_id, locale, value, created_by)
      values (v_tenant, v_body_key, 'ar', v_body_ar, v_caller);
    end if;
  end if;

  if v_guideline is null then
    insert into public.brand_guideline (
      tenant_id, profile_id, title_key_id, body_key_id, ordinal, created_by
    ) values (
      v_tenant, v_profile, v_title_key, v_body_key, p_ordinal, v_caller
    );
  else
    update public.brand_guideline
       set ordinal = p_ordinal
     where id = v_guideline
       and tenant_id = v_tenant
       and profile_id = v_profile;
  end if;
end
$fn$;

revoke execute on function public.save_guideline(uuid, uuid, text, text, text, text, integer) from public;
revoke execute on function public.save_guideline(uuid, uuid, text, text, text, text, integer) from anon;
revoke execute on function public.save_guideline(uuid, uuid, text, text, text, text, integer) from service_role;
grant execute on function public.save_guideline(uuid, uuid, text, text, text, text, integer) to authenticated;

create function public.complete_onboarding(p_profile_id uuid)
returns void
language plpgsql
volatile
security invoker
set search_path = ''
as $fn$
declare
  v_caller uuid := auth.uid();
  v_tenant uuid := public.current_tenant_id();
  v_profile uuid;
  v_brand uuid;
  v_name_key uuid;
  v_failures text[] := '{}';
  v_locale text;
  v_key uuid;
  v_label text;
  v_defaults integer;
  v_theme uuid;
  v_role text;
  v_script text;
  v_fg text;
  v_bg text;
  v_ratio numeric;
  v_legal_key uuid;
  v_address_key uuid;
  v_pair text;
begin
  if v_caller is null then
    raise exception 'complete_onboarding refused: the caller is not authenticated'
      using errcode = 'insufficient_privilege';
  end if;
  if v_tenant is null then
    raise exception 'complete_onboarding refused: the caller has no tenant'
      using errcode = 'insufficient_privilege';
  end if;

  select p.id, p.brand_id
    into v_profile, v_brand
    from public.brand_profile p
   where p.id = p_profile_id
     and p.tenant_id = v_tenant;
  if v_profile is null then
    raise exception 'complete_onboarding refused: the profile is not visible'
      using errcode = 'insufficient_privilege';
  end if;

  select b.name_key_id into v_name_key
    from public.brand b
   where b.id = v_brand
     and b.tenant_id = v_tenant;

  foreach v_locale in array '{en,ar}'::text[]
  loop
    if v_name_key is null or not exists (
      select 1 from public.translation_entry e
       where e.key_id = v_name_key
         and e.tenant_id = v_tenant
         and e.locale = v_locale
         and e.archived_at is null
         and btrim(e.value) <> ''
    ) then
      v_failures := array_append(v_failures, 'brand name missing locale ' || v_locale);
    end if;
  end loop;

  for v_key, v_label in
    select t.name_key_id, 'theme name'::text
      from public.brand_theme t
     where t.profile_id = v_profile
       and t.tenant_id = v_tenant
       and t.archived_at is null
    union all
    select g.title_key_id, 'guideline title'::text
      from public.brand_guideline g
     where g.profile_id = v_profile
       and g.tenant_id = v_tenant
       and g.archived_at is null
    union all
    select g.body_key_id, 'guideline body'::text
      from public.brand_guideline g
     where g.profile_id = v_profile
       and g.tenant_id = v_tenant
       and g.archived_at is null
    union all
    select l.name_key_id, 'line name'::text
      from public.brand_line l
     where l.profile_id = v_profile
       and l.tenant_id = v_tenant
       and l.archived_at is null
  loop
    foreach v_locale in array '{en,ar}'::text[]
    loop
      if not exists (
        select 1 from public.translation_entry e
         where e.key_id = v_key
           and e.tenant_id = v_tenant
           and e.locale = v_locale
           and e.archived_at is null
           and btrim(e.value) <> ''
      ) then
        v_failures := array_append(v_failures, v_label || ' missing locale ' || v_locale);
      end if;
    end loop;
  end loop;

  select count(*)::integer
    into v_defaults
    from public.brand_theme t
   where t.profile_id = v_profile
     and t.tenant_id = v_tenant
     and t.is_default
     and t.archived_at is null;
  if v_defaults <> 1 then
    v_failures := array_append(v_failures, 'default theme count is ' || v_defaults::text || ', expected 1');
  end if;

  for v_theme in
    select t.id
      from public.brand_theme t
     where t.profile_id = v_profile
       and t.tenant_id = v_tenant
       and t.archived_at is null
  loop
    foreach v_role in array '{primary,secondary,accent,background,foreground,muted,critical}'::text[]
    loop
      if not exists (
        select 1 from public.color_value c
         where c.theme_id = v_theme
           and c.tenant_id = v_tenant
           and c.role = v_role::public.color_role
      ) then
        v_failures := array_append(v_failures, 'color role ' || v_role);
      end if;
    end loop;

    select c.srgb into v_fg
      from public.color_value c
     where c.theme_id = v_theme
       and c.tenant_id = v_tenant
       and c.role = 'foreground';
    select c.srgb into v_bg
      from public.color_value c
     where c.theme_id = v_theme
       and c.tenant_id = v_tenant
       and c.role = 'background';
    if v_fg is null or v_bg is null then
      v_failures := array_append(v_failures, 'foreground contrast against background: a colour is missing');
    else
      select (greatest(fg_l, bg_l) + 0.05) / (least(fg_l, bg_l) + 0.05)
        into v_ratio
        from (
          select
            0.2126 * case when fr / 255.0 <= 0.04045 then (fr / 255.0) / 12.92 else power((fr / 255.0 + 0.055) / 1.055, 2.4) end
            + 0.7152 * case when fgn / 255.0 <= 0.04045 then (fgn / 255.0) / 12.92 else power((fgn / 255.0 + 0.055) / 1.055, 2.4) end
            + 0.0722 * case when fb / 255.0 <= 0.04045 then (fb / 255.0) / 12.92 else power((fb / 255.0 + 0.055) / 1.055, 2.4) end
            as fg_l,
            0.2126 * case when br / 255.0 <= 0.04045 then (br / 255.0) / 12.92 else power((br / 255.0 + 0.055) / 1.055, 2.4) end
            + 0.7152 * case when bgn / 255.0 <= 0.04045 then (bgn / 255.0) / 12.92 else power((bgn / 255.0 + 0.055) / 1.055, 2.4) end
            + 0.0722 * case when bb / 255.0 <= 0.04045 then (bb / 255.0) / 12.92 else power((bb / 255.0 + 0.055) / 1.055, 2.4) end
            as bg_l
            from (
              select
                get_byte(decode(substr(v_fg, 2, 6), 'hex'), 0)::numeric as fr,
                get_byte(decode(substr(v_fg, 2, 6), 'hex'), 1)::numeric as fgn,
                get_byte(decode(substr(v_fg, 2, 6), 'hex'), 2)::numeric as fb,
                get_byte(decode(substr(v_bg, 2, 6), 'hex'), 0)::numeric as br,
                get_byte(decode(substr(v_bg, 2, 6), 'hex'), 1)::numeric as bgn,
                get_byte(decode(substr(v_bg, 2, 6), 'hex'), 2)::numeric as bb
            ) channels
        ) luminance;
      if v_ratio < 4.5 then
        v_failures := array_append(v_failures, 'foreground contrast against background is below 4.5:1');
      end if;
    end if;
  end loop;

  if not exists (
    select 1
      from public.logo_variant lv
      join public.media_asset ma
        on ma.id = lv.media_asset_id
       and ma.tenant_id = lv.tenant_id
       and ma.archived_at is null
     where lv.profile_id = v_profile
       and lv.tenant_id = v_tenant
       and lv.archived_at is null
       and exists (
         select 1 from public.asset_rendition r
          where r.media_asset_id = ma.id
            and r.tenant_id = ma.tenant_id
            and r.tier = 'display'
            and r.archived_at is null
       )
       and exists (
         select 1 from public.asset_rendition r
          where r.media_asset_id = ma.id
            and r.tenant_id = ma.tenant_id
            and r.tier = 'print'
            and r.archived_at is null
       )
  ) then
    v_failures := array_append(v_failures, 'logo variant missing');
  end if;

  for v_pair in
    select role || '/' || script
      from (values
        ('heading'::text, 'latin'::text),
        ('heading'::text, 'arabic'::text),
        ('body'::text, 'latin'::text),
        ('body'::text, 'arabic'::text)
      ) as pairs(role, script)
  loop
    v_role := split_part(v_pair, '/', 1);
    v_script := split_part(v_pair, '/', 2);
    if not exists (
      select 1 from public.typeface tf
       where tf.profile_id = v_profile
         and tf.tenant_id = v_tenant
         and tf.archived_at is null
         and tf.role = v_role::public.typeface_role
         and tf.script = v_script::public.script_kind
    ) then
      v_failures := array_append(v_failures, 'typeface missing ' || v_pair);
    end if;
  end loop;

  select e.legal_name_key_id, e.registered_address_key_id
    into v_legal_key, v_address_key
    from public.legal_entity e
   where e.tenant_id = v_tenant
     and e.archived_at is null;

  foreach v_locale in array '{en,ar}'::text[]
  loop
    if v_legal_key is null or not exists (
      select 1 from public.translation_entry e
       where e.key_id = v_legal_key
         and e.tenant_id = v_tenant
         and e.locale = v_locale
         and e.archived_at is null
         and btrim(e.value) <> ''
    ) then
      v_failures := array_append(v_failures, 'legal name missing locale ' || v_locale);
    end if;
    if v_address_key is null or not exists (
      select 1 from public.translation_entry e
       where e.key_id = v_address_key
         and e.tenant_id = v_tenant
         and e.locale = v_locale
         and e.archived_at is null
         and btrim(e.value) <> ''
    ) then
      v_failures := array_append(v_failures, 'registered address missing locale ' || v_locale);
    end if;
  end loop;

  if coalesce(cardinality(v_failures), 0) > 0 then
    raise exception 'onboarding incomplete: %', array_to_string(v_failures, '; ')
      using errcode = 'check_violation';
  end if;

  update public.brand
     set current_profile_id = v_profile
   where id = v_brand
     and tenant_id = v_tenant;

  update public.onboarding_draft
     set archived_at = pg_catalog.now()
   where tenant_id = v_tenant
     and archived_at is null;
  if not found then
    raise exception 'onboarding incomplete: the draft is not visible'
      using errcode = 'check_violation';
  end if;
end
$fn$;

revoke execute on function public.complete_onboarding(uuid) from public;
revoke execute on function public.complete_onboarding(uuid) from anon;
revoke execute on function public.complete_onboarding(uuid) from service_role;
grant execute on function public.complete_onboarding(uuid) to authenticated;
