-- ===== migration: 20260922120005_brand_asset_policies_and_grants =====

-- DATA_MODEL.md §2. Every new table has RLS enabled and at least one
-- policy. WITH CHECK on every policy with a write side. The standard
-- tenant policy: tenant_id = current_tenant_id(). No operator policy —
-- every table in this tier is tenant business data under §2's operator
-- rule.
--
-- brand_profile carries no UPDATE policy and no UPDATE grant. Its
-- immutability is the absence (§1 rule 5), the same mechanism
-- activity_event uses.
--
-- No DELETE policy and no DELETE grant on any of these tables: rows are
-- archived, never deleted (§1.3). brand_profile is never archived either.
--
-- The blanket revoke is load-bearing. A newly created table arrives with
-- table-wide UPDATE already granted to authenticated by default privilege
-- (PRECEDENTS §2). Column-scoped or verb-scoped grants are decoration
-- unless the revoke runs first.
--
-- Independently revertible: drop the policies, then revoke the grants.

-- translation_key
alter table public.translation_key enable row level security;
revoke all on table public.translation_key from anon;
revoke all on table public.translation_key from authenticated;
grant select, insert, update on table public.translation_key to authenticated;

create policy translation_key_select_tenant on public.translation_key
  for select to authenticated
  using (tenant_id = public.current_tenant_id());

create policy translation_key_insert_tenant on public.translation_key
  for insert to authenticated
  with check (tenant_id = public.current_tenant_id());

create policy translation_key_update_tenant on public.translation_key
  for update to authenticated
  using (tenant_id = public.current_tenant_id())
  with check (tenant_id = public.current_tenant_id());

-- translation_entry
alter table public.translation_entry enable row level security;
revoke all on table public.translation_entry from anon;
revoke all on table public.translation_entry from authenticated;
grant select, insert, update on table public.translation_entry to authenticated;

create policy translation_entry_select_tenant on public.translation_entry
  for select to authenticated
  using (tenant_id = public.current_tenant_id());

create policy translation_entry_insert_tenant on public.translation_entry
  for insert to authenticated
  with check (tenant_id = public.current_tenant_id());

create policy translation_entry_update_tenant on public.translation_entry
  for update to authenticated
  using (tenant_id = public.current_tenant_id())
  with check (tenant_id = public.current_tenant_id());

-- media_asset
alter table public.media_asset enable row level security;
revoke all on table public.media_asset from anon;
revoke all on table public.media_asset from authenticated;
grant select, insert, update on table public.media_asset to authenticated;

create policy media_asset_select_tenant on public.media_asset
  for select to authenticated
  using (tenant_id = public.current_tenant_id());

create policy media_asset_insert_tenant on public.media_asset
  for insert to authenticated
  with check (tenant_id = public.current_tenant_id());

create policy media_asset_update_tenant on public.media_asset
  for update to authenticated
  using (tenant_id = public.current_tenant_id())
  with check (tenant_id = public.current_tenant_id());

-- asset_rendition
alter table public.asset_rendition enable row level security;
revoke all on table public.asset_rendition from anon;
revoke all on table public.asset_rendition from authenticated;
grant select, insert, update on table public.asset_rendition to authenticated;

create policy asset_rendition_select_tenant on public.asset_rendition
  for select to authenticated
  using (tenant_id = public.current_tenant_id());

create policy asset_rendition_insert_tenant on public.asset_rendition
  for insert to authenticated
  with check (tenant_id = public.current_tenant_id());

create policy asset_rendition_update_tenant on public.asset_rendition
  for update to authenticated
  using (tenant_id = public.current_tenant_id())
  with check (tenant_id = public.current_tenant_id());

-- brand
alter table public.brand enable row level security;
revoke all on table public.brand from anon;
revoke all on table public.brand from authenticated;
grant select, insert, update on table public.brand to authenticated;

create policy brand_select_tenant on public.brand
  for select to authenticated
  using (tenant_id = public.current_tenant_id());

create policy brand_insert_tenant on public.brand
  for insert to authenticated
  with check (tenant_id = public.current_tenant_id());

create policy brand_update_tenant on public.brand
  for update to authenticated
  using (tenant_id = public.current_tenant_id())
  with check (tenant_id = public.current_tenant_id());

-- brand_profile — SELECT and INSERT only. No UPDATE policy. No UPDATE grant.
alter table public.brand_profile enable row level security;
revoke all on table public.brand_profile from anon;
revoke all on table public.brand_profile from authenticated;
grant select, insert on table public.brand_profile to authenticated;

create policy brand_profile_select_tenant on public.brand_profile
  for select to authenticated
  using (tenant_id = public.current_tenant_id());

create policy brand_profile_insert_tenant on public.brand_profile
  for insert to authenticated
  with check (tenant_id = public.current_tenant_id());

-- brand_line
alter table public.brand_line enable row level security;
revoke all on table public.brand_line from anon;
revoke all on table public.brand_line from authenticated;
grant select, insert, update on table public.brand_line to authenticated;

create policy brand_line_select_tenant on public.brand_line
  for select to authenticated
  using (tenant_id = public.current_tenant_id());

create policy brand_line_insert_tenant on public.brand_line
  for insert to authenticated
  with check (tenant_id = public.current_tenant_id());

create policy brand_line_update_tenant on public.brand_line
  for update to authenticated
  using (tenant_id = public.current_tenant_id())
  with check (tenant_id = public.current_tenant_id());

-- brand_theme
alter table public.brand_theme enable row level security;
revoke all on table public.brand_theme from anon;
revoke all on table public.brand_theme from authenticated;
grant select, insert, update on table public.brand_theme to authenticated;

create policy brand_theme_select_tenant on public.brand_theme
  for select to authenticated
  using (tenant_id = public.current_tenant_id());

create policy brand_theme_insert_tenant on public.brand_theme
  for insert to authenticated
  with check (tenant_id = public.current_tenant_id());

create policy brand_theme_update_tenant on public.brand_theme
  for update to authenticated
  using (tenant_id = public.current_tenant_id())
  with check (tenant_id = public.current_tenant_id());

-- color_value
alter table public.color_value enable row level security;
revoke all on table public.color_value from anon;
revoke all on table public.color_value from authenticated;
grant select, insert, update on table public.color_value to authenticated;

create policy color_value_select_tenant on public.color_value
  for select to authenticated
  using (tenant_id = public.current_tenant_id());

create policy color_value_insert_tenant on public.color_value
  for insert to authenticated
  with check (tenant_id = public.current_tenant_id());

create policy color_value_update_tenant on public.color_value
  for update to authenticated
  using (tenant_id = public.current_tenant_id())
  with check (tenant_id = public.current_tenant_id());

-- typeface
alter table public.typeface enable row level security;
revoke all on table public.typeface from anon;
revoke all on table public.typeface from authenticated;
grant select, insert, update on table public.typeface to authenticated;

create policy typeface_select_tenant on public.typeface
  for select to authenticated
  using (tenant_id = public.current_tenant_id());

create policy typeface_insert_tenant on public.typeface
  for insert to authenticated
  with check (tenant_id = public.current_tenant_id());

create policy typeface_update_tenant on public.typeface
  for update to authenticated
  using (tenant_id = public.current_tenant_id())
  with check (tenant_id = public.current_tenant_id());

-- logo_variant
alter table public.logo_variant enable row level security;
revoke all on table public.logo_variant from anon;
revoke all on table public.logo_variant from authenticated;
grant select, insert, update on table public.logo_variant to authenticated;

create policy logo_variant_select_tenant on public.logo_variant
  for select to authenticated
  using (tenant_id = public.current_tenant_id());

create policy logo_variant_insert_tenant on public.logo_variant
  for insert to authenticated
  with check (tenant_id = public.current_tenant_id());

create policy logo_variant_update_tenant on public.logo_variant
  for update to authenticated
  using (tenant_id = public.current_tenant_id())
  with check (tenant_id = public.current_tenant_id());

-- brand_guideline
alter table public.brand_guideline enable row level security;
revoke all on table public.brand_guideline from anon;
revoke all on table public.brand_guideline from authenticated;
grant select, insert, update on table public.brand_guideline to authenticated;

create policy brand_guideline_select_tenant on public.brand_guideline
  for select to authenticated
  using (tenant_id = public.current_tenant_id());

create policy brand_guideline_insert_tenant on public.brand_guideline
  for insert to authenticated
  with check (tenant_id = public.current_tenant_id());

create policy brand_guideline_update_tenant on public.brand_guideline
  for update to authenticated
  using (tenant_id = public.current_tenant_id())
  with check (tenant_id = public.current_tenant_id());
