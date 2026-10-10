-- ===== migration: 20261004120001_tenant_media_bucket =====

-- P03-T20. One private bucket and the checks that keep a row from pointing
-- at another tenant's object. OD-G20 rider 1: no column, type or function
-- name contains a vendor. The stored provider value does, because a row
-- has to say where the object lives. A second provider is a CHECK
-- amendment, not a schema change.
--
-- Independently revertible: drop the two policies, delete the bucket
-- (it refuses while an object remains), then drop the seven constraints.
-- No UPDATE policy and no DELETE policy: an object is immutable, and a
-- row is archived rather than deleted.

alter table public.media_asset
  add constraint media_asset_provider_permitted
    check (provider = 'supabase-storage'),
  add constraint media_asset_bucket_permitted
    check (bucket = 'tenant-media'),
  add constraint media_asset_object_key_tenant_prefix
    check (split_part(object_key, '/', 1) = tenant_id::text),
  add constraint media_asset_checksum_sha256
    check (checksum ~ '^[0-9a-f]{64}$');

alter table public.asset_rendition
  add constraint asset_rendition_provider_permitted
    check (provider = 'supabase-storage'),
  add constraint asset_rendition_bucket_permitted
    check (bucket = 'tenant-media'),
  add constraint asset_rendition_object_key_tenant_prefix
    check (split_part(object_key, '/', 1) = tenant_id::text);

insert into storage.buckets (id, name, public)
values ('tenant-media', 'tenant-media', false);

create policy tenant_media_select_member
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'tenant-media'
    and split_part(name, '/', 1) = public.current_tenant_id()::text
  );

create policy tenant_media_insert_member
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'tenant-media'
    and split_part(name, '/', 1) = public.current_tenant_id()::text
  );
