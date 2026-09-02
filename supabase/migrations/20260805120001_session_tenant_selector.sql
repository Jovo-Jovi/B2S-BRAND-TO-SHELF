-- ===== migration: 20260805120001_session_tenant_selector =====

-- OD-G14 — session-to-membership binding, implemented. 20260802120004 shipped
-- current_tenant_id() failing closed on more than one active membership, and
-- said why in its own comment: DATA_MODEL.md specified no storage for the
-- binding and no rule for choosing among several, so denying was the only safe
-- direction. The decision now exists, so the function implements it instead of
-- working around its absence. CF-93 gap (3) and CF-103's remainder.
--
-- The contract, which DATA_MODEL.md §2 states as the same table:
--
--   selector absent, 0 active memberships              -> null
--   selector absent, exactly 1 active membership       -> that tenant
--   selector absent, 2 or more active memberships      -> null
--   selector present, malformed                        -> null, never an error
--   selector present, no active membership for it      -> null
--   selector present, held active                      -> that tenant
--
-- Explicit beats implicit, and a wrong explicit fails closed. A caller holding
-- exactly one active membership who supplies a selector naming a tenant they do
-- not hold resolves null; it does NOT fall back to the held one. Acting in a
-- tenant the caller did not ask for is worse than acting in none.

-- THE TRANSPORT — an ordinary HTTP request header, read out of PostgREST's
-- per-request `request.headers` setting.
--
-- OD-G14 forecloses both alternatives. A token claim is out because the client
-- would then hold the tenant of record and a re-issued token would carry a
-- stale one; a stored per-person value is out because it is shared across every
-- session and device that person has open. A request header is neither: it is
-- supplied per request, by the caller, and nothing persists it.
--
-- A forged header is harmless, and that is a property of the join below rather
-- than of any check on the header. The value never selects rows; it can only
-- narrow `held`, which is re-derived from public.membership on every call. The
-- most a caller can do by forging it is name a tenant they do not hold, and the
-- answer to that is null — they lose their own access for that request and gain
-- nothing. There is no value that widens reach, because there is no value that
-- adds a row to `held`.
--
-- STABLE is still correct now that the body reads a per-request value.
-- current_setting() is itself stable, and PostgREST sets the request settings
-- once per transaction, before the statement runs — so the value cannot change
-- within a statement, which is exactly what STABLE promises. VOLATILE would be
-- wrong in the other direction: it would force re-evaluation per row inside
-- every policy that calls this, at no gain.
--
-- Known boundary, recorded rather than discovered later: Supabase Realtime does
-- not carry request headers into its WebSocket handshake, so a policy evaluated
-- there sees no selector. That degrades to "absent", which is denial and not
-- disclosure. Nothing in this schema is subscribed to today.

create or replace function public.current_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  with sent as (
    -- PostgREST always sets valid JSON here, and this still guards the cast: a
    -- security definer function on the tenancy spine does not get to assume its
    -- inputs. An unset setting reads as null and lands in the same empty object.
    select case
             when pg_input_is_valid(current_setting('request.headers', true), 'jsonb')
               then current_setting('request.headers', true)::jsonb
             else '{}'::jsonb
           end as headers
  ),
  selector as (
    -- HTTP header names are case-insensitive, so the lookup lowercases the key
    -- rather than trusting a client to pick a convention. An absent header, an
    -- empty one and a whitespace-only one are all `absent`: a client that has
    -- not chosen a tenant yet sends nothing, and an intermediary that blanks the
    -- value must not lock out every single-membership caller in the process.
    select lower(btrim(entry.value)) as supplied
      from sent, jsonb_each_text(sent.headers) as entry(key, value)
     where lower(entry.key) = 'x-b2s-tenant'
       and btrim(entry.value) <> ''
     order by entry.key
     limit 1
  ),
  held as (
    -- The whole of what the caller holds. `invited`, `suspended` and archived
    -- memberships are not held: the predicate is the one 20260802120004 already
    -- used, unchanged.
    select m.tenant_id
      from public.membership m
     where m.member_id = auth.uid()
       and m.status = 'active'
       and m.archived_at is null
  )
  select case
           when exists (select 1 from selector) then (
             -- Compared as text, deliberately. A uuid cast would raise 22P02 on
             -- a malformed selector, and the contract's fourth row forbids that
             -- outright — inside a policy an exception is a failed request, not
             -- a denied one. Comparing text also collapses three rows of the
             -- contract into one code path: malformed, unheld and nonexistent
             -- are the same non-match and therefore indistinguishable to the
             -- caller, which is SECURITY_MODEL.md §1's existence property
             -- holding by construction rather than by a matching pair of
             -- branches somebody has to keep in agreement.
             select h.tenant_id
               from held h
              where h.tenant_id::text = (select s.supplied from selector s)
           )
           else (
             -- No selector: one active membership resolves implicitly, and any
             -- other number resolves null. Two is ambiguous, zero is nothing.
             select h.tenant_id
               from held h
              where (select count(*) from held) = 1
           )
         end
$$;

-- is_current_tenant_owner() is deliberately not touched. It already reads
-- `m.tenant_id = public.current_tenant_id()`, so it follows the selection for
-- free: an owner of two tenants who selects one is an owner in that one and not
-- in the other. Restating its body here would create a second place for the
-- rule to live.

-- CF-105's obligation, restated at the narrowest scope that discharges it.
-- CREATE OR REPLACE preserves a function's ACL, so these two statements should
-- be no-ops; they are here because "should be" is not an assertion, and proof
-- 22 checks the resulting privilege set either way.
revoke execute on function public.current_tenant_id() from public;
revoke execute on function public.current_tenant_id() from anon;
revoke execute on function public.current_tenant_id() from service_role;
grant  execute on function public.current_tenant_id() to authenticated;
