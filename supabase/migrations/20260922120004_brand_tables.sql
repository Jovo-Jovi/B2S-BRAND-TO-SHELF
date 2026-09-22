-- ===== migration: 20260922120004_brand_tables =====

-- DATA_MODEL.md §3.9 through §3.17. The Brand tier.
--
-- brand.current_profile_id is nullable and the foreign key is added after
-- brand_profile exists, which is how the brand ↔ brand_profile cycle
-- resolves. There is no deferred constraint and no third table.
--
-- brand_profile declares no updated_at and carries no trigger — the
-- departure tabulated in §1. unique (id, tenant_id) on every table so
-- child foreign keys are composite: a brand_line in tenant A cannot
-- reference a brand_profile in tenant B, by construction (DOMAIN_MODEL §6).
--
-- GLOSSARY §5: brand_line is the qualified form of line.
--
-- Independently revertible: drop the seven triggers, drop the current-
-- profile foreign key, then drop the eight tables in reverse dependency
-- order (color_value, typeface, logo_variant, brand_guideline,
-- brand_theme, brand_line, brand_profile, brand).

create table public.brand (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references public.tenant (id),
  name_key_id         uuid not null,
  current_profile_id  uuid,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  created_by          uuid references public.member (id),
  archived_at         timestamptz,
  unique (id, tenant_id),
  unique (tenant_id),
  foreign key (name_key_id, tenant_id)
    references public.translation_key (id, tenant_id)
);

create trigger brand_set_updated_at
before update on public.brand
for each row
execute function public.set_updated_at();

create table public.brand_profile (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenant (id),
  brand_id       uuid not null,
  version        integer not null,
  supersedes_id  uuid,
  created_at     timestamptz not null default now(),
  created_by     uuid references public.member (id),
  unique (id, tenant_id),
  unique (brand_id, version),
  foreign key (brand_id, tenant_id)
    references public.brand (id, tenant_id),
  foreign key (supersedes_id, tenant_id)
    references public.brand_profile (id, tenant_id)
);

-- The cycle closer. Nullable so the first profile can be inserted before
-- it is made current, and so a brand with no current profile is representable
-- (BRAND_CONFIG.md §11).
alter table public.brand
  add constraint brand_current_profile_fk
  foreign key (current_profile_id, tenant_id)
  references public.brand_profile (id, tenant_id);

create table public.brand_line (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenant (id),
  brand_id     uuid not null,
  name_key_id  uuid not null,
  profile_id   uuid,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  created_by   uuid references public.member (id),
  archived_at  timestamptz,
  unique (id, tenant_id),
  foreign key (brand_id, tenant_id)
    references public.brand (id, tenant_id),
  foreign key (name_key_id, tenant_id)
    references public.translation_key (id, tenant_id),
  foreign key (profile_id, tenant_id)
    references public.brand_profile (id, tenant_id)
);

create trigger brand_line_set_updated_at
before update on public.brand_line
for each row
execute function public.set_updated_at();

create index brand_line_brand_id_idx
  on public.brand_line (brand_id);

create table public.brand_theme (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenant (id),
  profile_id   uuid not null,
  name_key_id  uuid not null,
  is_default   boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  created_by   uuid references public.member (id),
  archived_at  timestamptz,
  unique (id, tenant_id),
  foreign key (profile_id, tenant_id)
    references public.brand_profile (id, tenant_id),
  foreign key (name_key_id, tenant_id)
    references public.translation_key (id, tenant_id)
);

create unique index brand_theme_one_default_per_profile
  on public.brand_theme (profile_id)
  where is_default;

create trigger brand_theme_set_updated_at
before update on public.brand_theme
for each row
execute function public.set_updated_at();

create table public.color_value (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenant (id),
  theme_id    uuid not null,
  role        public.color_role not null,
  srgb        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid references public.member (id),
  unique (id, tenant_id),
  unique (theme_id, role),
  constraint color_value_srgb_lowercase_hex check (srgb ~ '^#[0-9a-f]{6}$'),
  foreign key (theme_id, tenant_id)
    references public.brand_theme (id, tenant_id)
);

create trigger color_value_set_updated_at
before update on public.color_value
for each row
execute function public.set_updated_at();

create table public.typeface (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenant (id),
  profile_id     uuid not null,
  role           public.typeface_role not null,
  script         public.script_kind not null,
  family         text not null,
  weight         integer not null,
  is_italic      boolean not null default false,
  font_asset_id  uuid,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  created_by     uuid references public.member (id),
  archived_at    timestamptz,
  unique (id, tenant_id),
  unique (profile_id, role, script),
  constraint typeface_weight_range check (weight >= 100 and weight <= 900),
  foreign key (profile_id, tenant_id)
    references public.brand_profile (id, tenant_id),
  foreign key (font_asset_id, tenant_id)
    references public.media_asset (id, tenant_id)
);

create trigger typeface_set_updated_at
before update on public.typeface
for each row
execute function public.set_updated_at();

create table public.logo_variant (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenant (id),
  profile_id      uuid not null,
  kind            public.logo_kind not null,
  ground          public.logo_ground not null,
  media_asset_id  uuid not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  created_by      uuid references public.member (id),
  archived_at     timestamptz,
  unique (id, tenant_id),
  unique (profile_id, kind, ground),
  foreign key (profile_id, tenant_id)
    references public.brand_profile (id, tenant_id),
  foreign key (media_asset_id, tenant_id)
    references public.media_asset (id, tenant_id)
);

create trigger logo_variant_set_updated_at
before update on public.logo_variant
for each row
execute function public.set_updated_at();

create table public.brand_guideline (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenant (id),
  profile_id    uuid not null,
  title_key_id  uuid not null,
  body_key_id   uuid not null,
  ordinal       integer not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  created_by    uuid references public.member (id),
  archived_at   timestamptz,
  unique (id, tenant_id),
  unique (profile_id, ordinal),
  foreign key (profile_id, tenant_id)
    references public.brand_profile (id, tenant_id),
  foreign key (title_key_id, tenant_id)
    references public.translation_key (id, tenant_id),
  foreign key (body_key_id, tenant_id)
    references public.translation_key (id, tenant_id)
);

create trigger brand_guideline_set_updated_at
before update on public.brand_guideline
for each row
execute function public.set_updated_at();
