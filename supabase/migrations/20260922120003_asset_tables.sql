-- ===== migration: 20260922120003_asset_tables =====

-- DATA_MODEL.md §3.18 and §3.19. The logical uploaded file and each
-- derivative. Landed before Brand because typeface.font_asset_id and
-- logo_variant.media_asset_id reference media_asset. Suggested prompt
-- order was Brand then Asset; that order cannot create those foreign
-- keys. Independently revertible: drop the two triggers, then the two
-- tables.
--
-- GLOSSARY §5: media_asset is the qualified form of asset; there is no
-- bare asset identifier. provider / bucket / object_key carry no vendor
-- name (OD-G20 rider 1). Rows hold references, never content (OD-G11).

create table public.media_asset (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null references public.tenant (id),
  provider           text not null,
  bucket             text not null,
  object_key         text not null,
  content_type       text not null,
  byte_size          bigint not null,
  checksum           text not null,
  original_filename  text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  created_by         uuid references public.member (id),
  archived_at        timestamptz,
  unique (id, tenant_id),
  unique (provider, bucket, object_key),
  constraint media_asset_byte_size_positive check (byte_size > 0)
);

create trigger media_asset_set_updated_at
before update on public.media_asset
for each row
execute function public.set_updated_at();

create table public.asset_rendition (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenant (id),
  media_asset_id  uuid not null,
  tier            public.rendition_tier not null,
  provider        text not null,
  bucket          text not null,
  object_key      text not null,
  width_px        integer,
  height_px       integer,
  content_type    text not null,
  byte_size       bigint not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  created_by      uuid references public.member (id),
  archived_at     timestamptz,
  unique (id, tenant_id),
  unique (media_asset_id, tier),
  constraint asset_rendition_byte_size_positive check (byte_size > 0),
  foreign key (media_asset_id, tenant_id)
    references public.media_asset (id, tenant_id)
);

create trigger asset_rendition_set_updated_at
before update on public.asset_rendition
for each row
execute function public.set_updated_at();
