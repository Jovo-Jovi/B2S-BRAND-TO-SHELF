-- ===== migration: 20260802120002_platform_tables =====

-- §3.2 member — a person. Not tenant-scoped: one identity is global to the
-- platform and may hold a membership in several tenants over time.
-- id equals the Supabase Auth user id (ADR-004), so it carries no default;
-- the reference to auth.users is what makes "equals" structural.
create table public.member (
  id                uuid primary key references auth.users (id),
  email             extensions.citext not null unique,
  display_name      text,
  preferred_locale  text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  created_by        uuid references public.member (id),
  archived_at       timestamptz
);

-- §3.1 tenant — one company, one master brand, the root of every scope chain.
-- No INSERT, UPDATE or DELETE policy is written for members: provisioning is a
-- privileged path (ADR-005), and slug immutability after creation follows from
-- the absence of an UPDATE policy rather than from a trigger (§1.5).
create table public.tenant (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text not null unique,
  base_currency   text not null,
  default_locale  text not null,
  status          public.tenant_status not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  created_by      uuid references public.member (id),
  archived_at     timestamptz
);

-- §3.3 membership — binds a member to a tenant with a role. The join that
-- carries data of its own, and therefore an entity.
create table public.membership (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenant (id),
  member_id    uuid not null references public.member (id),
  role         public.role not null,
  status       public.membership_status not null,
  invited_by   uuid references public.member (id),
  accepted_at  timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  created_by   uuid references public.member (id),
  archived_at  timestamptz
);

-- §3.4 operator — a B2S platform administrator. Not tenant-scoped.
-- Column list per §3.4: no provenance block and no archived_at; granted_at and
-- granted_by carry the provenance, revoked_at carries the retirement.
create table public.operator (
  id          uuid primary key references auth.users (id),
  granted_at  timestamptz not null,
  granted_by  uuid references public.operator (id),
  revoked_at  timestamptz
);

-- §3.5 consent_grant — a tenant's explicit, time-boxed permission for operator
-- support access (OD-G10). expires_at is not null: there is no open-ended grant.
-- Column list per §3.5: provenance, and deliberately no archived_at.
create table public.consent_grant (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenant (id),
  granted_by  uuid not null references public.member (id),
  scope       public.consent_scope not null,
  expires_at  timestamptz not null,
  revoked_at  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid references public.member (id)
);

-- §3.6 activity_event — the audit trail (OD-C15). Append-only: no UPDATE or
-- DELETE policy is written, and that absence is the immutability (§1.5).
-- Column list per §3.6: occurred_at, and deliberately no provenance block and
-- no archived_at.
create table public.activity_event (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null references public.tenant (id),
  actor_member_id    uuid references public.member (id),
  actor_operator_id  uuid references public.operator (id),
  action             text not null,
  entity_type        text not null,
  entity_id          uuid,
  payload            jsonb,
  occurred_at        timestamptz not null default now(),
  -- §3.6 — exactly one actor. An event with no actor is not an audit trail.
  constraint activity_event_one_actor check (
    (actor_member_id is not null) <> (actor_operator_id is not null)
  )
);


