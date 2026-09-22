-- ===== migration: 20260922120002_translation_tables =====

-- DATA_MODEL.md §3.20 and §3.21. The identity of one translatable string,
-- and one string in one locale. Landed before Brand because brand,
-- brand_line, brand_theme and brand_guideline reference translation_key.
--
-- unique (id, tenant_id) exists so child foreign keys can be composite:
-- a translation_entry in tenant A cannot reference a translation_key in
-- tenant B, by construction (DOMAIN_MODEL §6), not by a check.
--
-- Independently revertible: drop the two triggers, then the two tables.

create table public.translation_key (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenant (id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid references public.member (id),
  archived_at timestamptz,
  unique (id, tenant_id)
);

create trigger translation_key_set_updated_at
before update on public.translation_key
for each row
execute function public.set_updated_at();

create table public.translation_entry (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenant (id),
  key_id      uuid not null,
  locale      text not null,
  value       text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid references public.member (id),
  archived_at timestamptz,
  unique (id, tenant_id),
  unique (key_id, locale),
  constraint translation_entry_locale_permitted check (locale in ('en', 'ar')),
  foreign key (key_id, tenant_id)
    references public.translation_key (id, tenant_id)
);

create trigger translation_entry_set_updated_at
before update on public.translation_entry
for each row
execute function public.set_updated_at();
