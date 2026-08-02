-- ===== migration: 20260802120007_grants =====

-- §2 — grants and policies compose. A permissive policy over a table-wide
-- column grant lets a member rewrite their own role, so the grant set is
-- reviewed together with the policy set, always.
--
-- The blanket revoke is deliberate and load-bearing. A Supabase project grants
-- anon and authenticated broad table privileges by default privilege, so every
-- table below would otherwise arrive with table-wide UPDATE and the
-- column-scoped grants that follow would be decoration. Any later migration
-- adding a table repeats this revoke.

revoke all on all tables in schema public from anon;
revoke all on all tables in schema public from authenticated;

-- anon receives nothing. An unauthenticated caller reads no row of any table.

-- §3.1 — read only. Provisioning is the privileged path.
grant select on public.tenant to authenticated;

-- §3.2 — UPDATE is column-scoped to display_name and preferred_locale. email is
-- absent by construction: it is sourced from auth and never separately
-- editable. No INSERT and no DELETE.
grant select on public.member to authenticated;
grant update (display_name, preferred_locale) on public.member to authenticated;

-- §3.3 — role is absent from the UPDATE grant. That absence, not a policy that
-- trusts the caller, is what makes "role is never self-writable" structural: no
-- caller acting as authenticated can write the column at all, whatever policy
-- they satisfy. A role is set when an owner creates the membership, and changed
-- only through the privileged path. No DELETE: rows are archived.
grant select, insert on public.membership to authenticated;
grant update (status, accepted_at, archived_at) on public.membership to authenticated;

-- §3.4 — read only, and only for operators by policy. No INSERT, UPDATE or
-- DELETE privilege exists to pair with the absent policies.
grant select on public.operator to authenticated;

-- §3.5 — UPDATE is column-scoped to revoked_at, which is the whole of the
-- revocation path. expires_at is absent, so a grant cannot be extended.
grant select, insert on public.consent_grant to authenticated;
grant update (revoked_at) on public.consent_grant to authenticated;

-- §3.6 — append only. No UPDATE and no DELETE privilege, matching the absent
-- policies. The audit trail is tenant-readable in full (SECURITY_MODEL.md §7).
grant select, insert on public.activity_event to authenticated;
