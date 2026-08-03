-- ===== migration: 20260803120003_function_execute_grants =====

-- CF-105 — EXECUTE on a function in `public` defaults to PUBLIC, and
-- 20260802120007's blanket revoke covers tables only. Every function in this
-- schema was therefore a PostgREST RPC endpoint callable by `anon`, including
-- ones that had not been written yet.
--
-- Revoking PUBLIC and `anon` is not enough, and the reason is the same one
-- 20260802120007 records for tables. A Supabase project ships ALTER DEFAULT
-- PRIVILEGES granting EXECUTE on new functions in `public` to anon,
-- authenticated and service_role, so each function arrives holding three
-- explicit grants of its own. Revoking PUBLIC removes a default that was never
-- what carried them. Every role is therefore revoked and only the ones that
-- need a given function are granted it back.
--
-- The same shape as the table revoke, and the same obligation: any later
-- migration that adds a function to `public` repeats this revoke and states its
-- own grant, or the function ships callable by every signed-in identity.

revoke execute on all functions in schema public from public;
revoke execute on all functions in schema public from anon;
revoke execute on all functions in schema public from authenticated;
revoke execute on all functions in schema public from service_role;

-- The three tenancy helpers are evaluated inside policies, and a policy
-- expression is executed with the privileges of the caller, so `authenticated`
-- needs EXECUTE for its own policies to work. `anon` evaluates none of them:
-- every policy in this schema is `to authenticated`.
grant execute on function public.current_tenant_id()        to authenticated;
grant execute on function public.is_operator()              to authenticated;
grant execute on function public.is_current_tenant_owner()  to authenticated;

-- The consent predicate and the declared operator read path. Granting the read
-- path to `authenticated` rather than to some narrower role is correct: there
-- is no operator role, an operator is an ordinary authenticated identity with
-- an `operator` row, and the function refuses anyone else on its first line.
grant execute on function public.has_live_consent_grant(uuid)      to authenticated;
grant execute on function public.operator_read_activity_event(uuid) to authenticated;

-- enforce_tenant_active_owner() receives no grant, deliberately. A trigger
-- function's EXECUTE privilege is checked when the trigger is created, never
-- when it fires, so the constraint keeps working while the function stops
-- being an RPC endpoint. It is the one function here that no caller should
-- ever invoke directly.
--
-- service_role receives no grant either. It bypasses row-level security, so it
-- evaluates none of these policies, and ADR-005's quarantined client uses it
-- for provisioning writes alone. A privilege with no reader is exposure with no
-- purpose.
