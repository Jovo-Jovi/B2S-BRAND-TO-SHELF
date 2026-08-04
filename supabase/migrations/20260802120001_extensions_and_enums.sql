-- ===== migration: 20260802120001_extensions_and_enums =====

create extension if not exists citext with schema extensions;

-- DATA_MODEL §1.7 — every enumeration stores a language-neutral key.
-- Display text is a translation_entry, never the stored value.

-- §3.7 — role is a Postgres enum, not a table. Five values, fixed by
-- TENANCY_MODEL.md §3, not tenant-configurable at Release 1.
create type public.role as enum (
  'owner',
  'manager',
  'designer',
  'approver',
  'viewer'
);

-- §3.1 tenant.status
create type public.tenant_status as enum (
  'active',
  'suspended',
  'closed'
);

-- §3.3 membership.status
create type public.membership_status as enum (
  'invited',
  'active',
  'suspended'
);

-- §3.5 consent_grant.scope — read_only at Release 1.
create type public.consent_scope as enum (
  'read_only'
);


