-- ===== migration: 20260922120001_brand_asset_enums =====

-- DATA_MODEL.md §3. Brand, Asset and TranslationKey enumerations.
-- Every value is a lowercase ASCII key (§1 rule 7, OD-D7). Display text is
-- never the stored value.
--
-- Independently revertible: drop the six types, in reverse dependency
-- order none, because no table in this migration references them.

-- §3.14 color_role — not a table. Seven values fixed by BRAND_CONFIG.md §4.
-- Closes the storage half of CF-49: a semantic set cannot be redefined by
-- whichever writer got there first.
create type public.color_role as enum (
  'primary',
  'secondary',
  'accent',
  'background',
  'foreground',
  'muted',
  'critical'
);

-- §3.15 typeface.role
create type public.typeface_role as enum (
  'heading',
  'body'
);

-- §3.15 typeface.script
create type public.script_kind as enum (
  'latin',
  'arabic'
);

-- §3.16 logo_variant.kind
create type public.logo_kind as enum (
  'full',
  'mark',
  'wordmark'
);

-- §3.16 logo_variant.ground
create type public.logo_ground as enum (
  'light',
  'dark'
);

-- §3.19 asset_rendition.tier
create type public.rendition_tier as enum (
  'display',
  'print'
);
