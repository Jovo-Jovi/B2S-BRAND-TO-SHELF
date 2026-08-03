-- ===== migration: 20260803120002_operator_consent_reach =====

-- CF-104 — OD-G10, enforced rather than promised.
--
-- G10: an operator sees account metadata, usage and billing, never tenant
-- business data; support access requires a ConsentGrant and is logged. What was
-- built gave an operator an unconditional row read of activity_event, payload
-- included, for every tenant, with nothing logged anywhere.
--
-- §2 now states the rule once, in two classes:
--
--   Account metadata — `tenant` and `consent_grant`. Unconditional operator
--   SELECT policy, no grant required and no log written. These are the
--   "account metadata" half of G10, and an operator who cannot read the consent
--   record cannot tell whether the access they hold is live or lapsed.
--
--   Tenant business data — `activity_event` here, every later tier's tables
--   after it. NO operator policy on the table at all. Reachable only through
--   the declared read path below, which requires a live consent grant, writes
--   an activity_event naming the operator, and never returns `payload`.
--
-- Why the business-data half is a function and not a policy. Two mechanisms
-- the requirement asks for do not exist at this granularity:
--
--   A policy cannot log. PostgREST runs GET in a READ ONLY transaction, so a
--   policy expression that inserted an audit row would abort the read it was
--   auditing. "Every access under a grant is logged" (SECURITY_MODEL.md §5)
--   therefore cannot be satisfied on a policy-mediated read.
--
--   A column grant cannot separate an operator from a member. Both arrive as
--   the `authenticated` role, and column privileges are role-scoped. Excluding
--   `payload` by grant would exclude it from the tenant's own audit trail too,
--   which §7 gives the tenant in full. Excluding it from the operator alone is
--   a projection, and a projection needs a function.
--
-- The function is therefore the whole of the operator's business-data reach,
-- which makes both properties structural: there is no path that returns
-- `payload` to an operator, and there is no path that returns a business row to
-- an operator without writing the log.

-- The live-grant predicate, separate because every later tier's business table
-- reaches for the same test. §3.5: a consent grant is live when it has not been
-- revoked and has not lapsed, evaluated at read time, never cached.
create or replace function public.has_live_consent_grant(p_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.consent_grant g
    where g.tenant_id = p_tenant_id
      and g.revoked_at is null
      and now() < g.expires_at
  )
$$;

-- §3.6 — the operator loses the unconditional row read. What remains on the
-- table is the tenant's own SELECT and the tenant's own INSERT; the absence of
-- an operator policy here is what makes the declared path the only one.
drop policy activity_event_select_operator on public.activity_event;

-- The declared operator read path. VOLATILE because it writes: PostgREST runs
-- POST /rpc in a read-write transaction, which is the whole reason the log can
-- be written here and not in a policy.
--
-- `payload` is absent from the return type. That absence is the exclusion, and
-- it holds whether or not a grant is live, because there is no argument and no
-- caller that adds a column to a function's signature.
create or replace function public.operator_read_activity_event(p_tenant_id uuid)
returns table (
  id                uuid,
  tenant_id         uuid,
  actor_member_id   uuid,
  actor_operator_id uuid,
  action            text,
  entity_type       text,
  entity_id         uuid,
  occurred_at       timestamptz
)
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  -- Refused, not empty. SECURITY_MODEL.md §5 makes an operator request with no
  -- live grant indistinguishable from a cross-tenant one; both end here, and
  -- neither says whether the tenant exists.
  if not public.is_operator() then
    raise exception 'operator read refused: the caller is not an operator'
      using errcode = 'insufficient_privilege';
  end if;

  if not public.has_live_consent_grant(p_tenant_id) then
    raise exception 'operator read refused: no live consent grant for this tenant'
      using errcode = 'insufficient_privilege';
  end if;

  -- Written before the rows are returned, so a read that is interrupted after
  -- the log is still a read that happened. The tenant reads this row like any
  -- other event: §7 makes the audit trail theirs.
  insert into public.activity_event
    (tenant_id, actor_operator_id, action, entity_type, entity_id)
  values
    (p_tenant_id, auth.uid(), 'operator.activity_event.read', 'ActivityEvent', null);

  return query
    select e.id, e.tenant_id, e.actor_member_id, e.actor_operator_id,
           e.action, e.entity_type, e.entity_id, e.occurred_at
      from public.activity_event e
     where e.tenant_id = p_tenant_id
     order by e.occurred_at desc, e.id;
end
$$;
