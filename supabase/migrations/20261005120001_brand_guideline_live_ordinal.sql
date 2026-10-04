-- ===== migration: 20261005120001_brand_guideline_live_ordinal =====

-- Order is unique among live guidelines only. The table constraint
-- unique (profile_id, ordinal) counted archived rows, so archiving a
-- guideline blocked its position. Drop that constraint. Uniqueness of
-- (profile_id, ordinal) holds where archived_at is null. An archived
-- guideline keeps its ordinal.

alter table public.brand_guideline
  drop constraint brand_guideline_profile_id_ordinal_key;

create unique index brand_guideline_profile_ordinal_live_key
  on public.brand_guideline (profile_id, ordinal)
  where archived_at is null;
