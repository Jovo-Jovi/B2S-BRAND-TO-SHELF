-- ===== migration: 20260805120002_member_materialisation_and_tenant_provisioning =====

-- OD-G13's two acts, built. Until this migration nothing in this schema created
-- a `member` row and nothing created a `tenant` row: no INSERT policy, no
-- trigger, no function, no insert path at all. Every proof that needed either
-- one seeded it through the isolation harness's privileged SQL, so the schema
-- specified a tenancy spine that no live caller could ever enter.
--
-- OD-G13 separates the two acts and the separation is the decision:
--
--   Authentication establishes identity and creates at most a Member. It never
--   creates a Membership, never grants a Role, never confers authorization and
--   does not itself create a Tenant.
--
--   A Tenant is created only by an explicit provisioning act on the privileged
--   path, which sign-up may initiate immediately after but never IS, creating
--   the tenant and the caller's active owner Membership atomically and
--   recording an ActivityEvent.
--
-- So: a trigger for the first, a function for the second. The shapes are not
-- interchangeable and the reasons are below each one.

-- WHY BOTH ARE `security definer` AND WHAT THAT BUYS.
--
-- Every table in this schema is owned by `postgres` and none carries FORCE ROW
-- LEVEL SECURITY, so a `security definer` function owned by `postgres` writes
-- past the policies rather than through them. That is the privileged path
-- ADR-005 names, reached in the data layer as ADR-003 requires, and it is the
-- same mechanism `operator_read_activity_event` already uses.
--
-- It is deliberately NOT the `service_role` client at
-- lib/supabase/server-only/service.ts, and the reason is atomicity rather than
-- taste. That client speaks PostgREST, where every request is its own
-- transaction: three round trips cannot be one act, and a failure after the
-- tenant insert would leave a tenant with no owner — which the deferred
-- `membership_active_owner_required` trigger would not even catch, because it
-- fires at the commit of a transaction that had already succeeded. A single
-- function call is one transaction by construction. The privileged client
-- remains the right tool for provisioning work that is not one statement's
-- worth of writes; it is the wrong tool for this one.


-- §3.2 — MEMBER MATERIALISATION.
--
-- A trigger on `auth.users`, not an RPC the client calls after signing in, and
-- the difference is load-bearing three times over:
--
--   1. OD-G13 says authentication creates the Member. A trigger is that
--      sentence; an RPC is "the client asks for one afterwards", which leaves a
--      window in which an authenticated identity holds no `member` row and
--      every provisioning and invitation path has to handle it.
--   2. There is nothing to call, so there is nothing to call wrongly. The id
--      and the address are read out of the row `auth` itself just wrote, so no
--      caller can name an id or an address that is not their own — not because
--      an argument is validated, but because there is no argument.
--   3. Fail-closed means the identity never comes into being. This trigger
--      fires inside the transaction that inserts into `auth.users`, so raising
--      here takes the auth row with it: no `member` row, no second identity, no
--      linkage, nothing half-written to reconcile later.
--
-- It grants nothing, and that is the whole of what it does. A freshly
-- materialised Member holds no `membership`, so `current_tenant_id()` resolves
-- null for them (§2.1's first contract row) and every policy in this schema
-- reads them zero rows. No `activity_event` is written either, and cannot be:
-- `activity_event.tenant_id` is `not null` and a Member belongs to no tenant.
--
-- `created_by` is left null on purpose. Rule 4's provenance column references
-- `member (id)` and nobody created this row — the person did, by proving an
-- address, and `id` already records that.
create or replace function public.materialise_member()
returns trigger
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_constraint text;
begin
  -- OD-G13 keys the identity invariant to an email address: "one email address
  -- resolves to exactly one member.id, whichever mechanism was used". An
  -- identity carrying no address cannot satisfy that invariant, so it is
  -- refused rather than materialised without the thing the invariant is about.
  -- `member.email` is `not null` and would refuse it anyway; this says so in
  -- one line the caller can read instead of in a constraint name.
  if new.email is null or btrim(new.email) = '' then
    raise exception
      'member materialisation refused: this identity carries no email address'
      using errcode = 'not_null_violation',
            hint = 'OD-G13 resolves one address to exactly one member.id. An identity with no address cannot satisfy that invariant.';
  end if;

  begin
    insert into public.member (id, email)
    values (new.id, new.email::extensions.citext);
  exception
    when unique_violation then
      -- `member.email` is citext unique, so this is the identity invariant
      -- firing: a second authenticating identity for an address the platform
      -- already holds. OD-G13 fails the flow closed and the person uses the
      -- mechanism they registered with. Re-raised with a message that says
      -- which rule refused, because a bare 23505 naming a constraint is a
      -- diagnostic and not an answer.
      get stacked diagnostics v_constraint = constraint_name;
      if v_constraint = 'member_email_key' then
        raise exception
          'member materialisation refused: this email address is already held by a different member'
          using errcode = 'unique_violation',
                hint = 'OD-G13 identity invariant: one address is one member.id. Sign in with the mechanism this address was registered with.';
      end if;
      -- Any other unique violation is not this rule and is not this trigger's
      -- to reinterpret. A bare RAISE re-raises the original, SQLSTATE, message
      -- and constraint name intact.
      raise;
  end;

  -- AFTER trigger: the return value is discarded, and returning null says so
  -- rather than implying the row could still be influenced from here.
  return null;
end
$$;

-- AFTER, not BEFORE. `member.id references auth.users (id)`, so the auth row has
-- to exist before the member row can point at it. FOR EACH ROW because an
-- identity is materialised one at a time, and the admin API can create several
-- in one statement.
create trigger member_materialisation
after insert on auth.users
for each row
execute function public.materialise_member();


-- §3.1, §3.3, §3.6 — TENANT PROVISIONING.
--
-- One act, one transaction, three rows: the `tenant`, the caller's `owner`
-- `active` `membership`, and the `activity_event` that records it. OD-G13
-- requires all three or none.
--
-- ATOMICITY IS THE MECHANISM, not a convention this function observes. A
-- plpgsql function body runs inside the caller's transaction, and PostgREST
-- gives each request exactly one. Any raise — a duplicate slug, a rejected
-- argument, a constraint, a trigger, a disk error — aborts the whole of it, so
-- there is no ordering of these three inserts that can leave a partial tenant.
-- The deferred `membership_active_owner_required` trigger then fires at commit
-- against a tenant that already holds its first active owner, which is exactly
-- the case 20260802120005 deferred itself for.
--
-- IT CANNOT PROVISION FOR ANYBODY ELSE, and again by construction rather than
-- by check: there is no member parameter. The owner is `auth.uid()`, taken from
-- the verified token, so the only tenant a caller can create is one they own.
-- Naming a stranger would require an argument this signature does not have.
--
-- IT IS A SECOND ACT AND NEVER A SIDE EFFECT. Nothing calls this: no trigger,
-- no default, no policy, no other function. A sign-in reaches it only if the
-- caller reaches it, which is what OD-G13's "which sign-up may initiate
-- immediately after but never is" means in a schema.
--
-- NOT RATE-LIMITED, stated rather than left to be discovered. Any authenticated
-- Member may call this as often as they like, and each call is a tenant, a
-- membership and an event. Nothing here bounds that, no mechanism for bounding
-- it has been decided, and inventing one would be a stack decision this task
-- does not hold. Recorded as CF-129 with what remains reachable.
create or replace function public.provision_tenant(
  p_name           text,
  p_slug           text,
  p_base_currency  text,
  p_default_locale text
)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_caller uuid := auth.uid();
  v_tenant uuid;
begin
  if v_caller is null then
    raise exception
      'tenant provisioning refused: the caller is not an authenticated identity'
      using errcode = 'insufficient_privilege';
  end if;

  -- The second-act rule, enforced. Authentication materialises the Member;
  -- this path consumes one and never creates one. An authenticated identity
  -- with no live `member` row cannot provision, which also means this function
  -- can never be the thing that repairs a failed materialisation — the two acts
  -- stay separate in the failure direction too.
  if not exists (
    select 1
      from public.member m
     where m.id = v_caller
       and m.archived_at is null
  ) then
    raise exception
      'tenant provisioning refused: the caller holds no live member record'
      using errcode = 'insufficient_privilege',
            hint = 'OD-G13 makes provisioning a second act. Authentication materialises the Member first.';
  end if;

  -- §3.1 fixes the shape of these two columns in prose and the table carries no
  -- constraint for either, so this is the only place the shape can be
  -- established — this function is the only writer `tenant` has. Nothing here
  -- invents a rule: `name` is "the company's own name", `slug` is "URL-safe,
  -- lowercase". `base_currency` and `default_locale` are passed through
  -- unvalidated, which is a gap this task found rather than closed: see CF-130.
  if p_name is null or btrim(p_name) = '' then
    raise exception
      'tenant provisioning refused: a tenant must carry a name'
      using errcode = 'check_violation';
  end if;

  if p_slug is null or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    raise exception
      'tenant provisioning refused: slug must be lowercase and URL-safe, alphanumeric groups joined by single hyphens'
      using errcode = 'check_violation';
  end if;

  insert into public.tenant
    (name, slug, base_currency, default_locale, status, created_by)
  values
    (btrim(p_name), p_slug, p_base_currency, p_default_locale, 'active', v_caller)
  returning id into v_tenant;

  -- OD-G15: at least one active owner, and the caller is it. `accepted_at` is
  -- set because there was no invitation to accept — the caller is the tenant's
  -- origin, not an invitee, and leaving it null would model a pending offer
  -- nobody made.
  insert into public.membership
    (tenant_id, member_id, role, status, accepted_at, created_by)
  values
    (v_tenant, v_caller, 'owner', 'active', now(), v_caller);

  -- §3.6 — the audit trail's first row for this tenant. `payload` stays null:
  -- every fact worth recording is already a column, and §3.6 forbids a full row
  -- copy there.
  insert into public.activity_event
    (tenant_id, actor_member_id, action, entity_type, entity_id)
  values
    (v_tenant, v_caller, 'tenant.provisioned', 'Tenant', v_tenant);

  return v_tenant;
end
$$;


-- CF-105's standing obligation: a Supabase project ships ALTER DEFAULT
-- PRIVILEGES granting EXECUTE on every new `public` function to anon,
-- authenticated and service_role, so each of these two arrived holding three
-- explicit grants of its own. Every migration adding a function repeats the
-- revoke and states its own grant, or the function ships callable by every
-- signed-in identity.

revoke execute on function public.materialise_member() from public;
revoke execute on function public.materialise_member() from anon;
revoke execute on function public.materialise_member() from authenticated;
revoke execute on function public.materialise_member() from service_role;

-- materialise_member() receives no grant at all, for the reason
-- enforce_tenant_active_owner() receives none: a trigger function's EXECUTE
-- privilege is checked when the trigger is created, never when it fires. The
-- trigger keeps working while the function stops being an RPC endpoint, which
-- is the correct state for the one function here that no caller should ever
-- invoke directly.

revoke execute on function public.provision_tenant(text, text, text, text) from public;
revoke execute on function public.provision_tenant(text, text, text, text) from anon;
revoke execute on function public.provision_tenant(text, text, text, text) from service_role;

-- `authenticated` is the whole of the grant, and the function's own first two
-- checks are what narrow it further: an unauthenticated caller and an
-- authenticated one holding no Member are both refused inside the body. anon is
-- revoked as well as refused, so the endpoint is not merely unproductive for it
-- but absent. service_role receives nothing because it bypasses RLS and would
-- gain nothing from a definer function it could out-write directly.
grant execute on function public.provision_tenant(text, text, text, text) to authenticated;
