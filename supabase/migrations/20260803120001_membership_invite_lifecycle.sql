-- ===== migration: 20260803120001_membership_invite_lifecycle =====

-- CF-103 — §3.3's invite-then-accept rule, enforced.
--
-- The defect: membership_insert_owner constrained tenant_id and the caller's
-- role and said nothing about member_id or status, so tenant A's owner could
-- insert an ACTIVE membership naming any member of any other tenant. That
-- member then held two active memberships, current_tenant_id() returned null by
-- design, and they lost access to their own tenant. Nothing of tenant B was
-- read, inferred or modified, so SECURITY_MODEL.md §1's three parts did not
-- cover it; §1 now carries a fourth, availability.
--
-- The rule: an owner may INVITE anyone. An owner may never MAKE anyone active.
-- Only the invitee moves their own row to active. An invitation is an offer,
-- and an offer the offeree cannot decline is not an offer.

-- §3.3 — INSERT is invite-only. status = 'invited' is what makes "invite" the
-- only thing an owner can do here; without it the WITH CHECK is a rule about
-- which tenant the row lands in and not about what the row does.
drop policy membership_insert_owner on public.membership;

create policy membership_insert_owner on public.membership
  for insert to authenticated
  with check (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
    and status = 'invited'
  );

-- §3.3 — the invitee's own move, and the only status transition available to
-- them: invited -> active, on their own row. USING reads the old row and
-- WITH CHECK the new one, so the pair states the transition exactly.
-- archived_at is null in USING because a withdrawn invitation is not an
-- invitation (§1.3).
create policy membership_accept_invitation on public.membership
  for update to authenticated
  using (
    member_id = auth.uid()
    and status = 'invited'
    and archived_at is null
  )
  with check (
    member_id = auth.uid()
    and status = 'active'
  );

-- The rule stated once, RESTRICTIVE so it ANDs with every UPDATE policy on this
-- table — the two that exist and any later one, which is the difference between
-- fixing membership_update_owner and fixing the table. Without it the exploit
-- survives the INSERT fix in one more move: an owner inserts the invitation the
-- new WITH CHECK permits, then updates it to active under membership_update_owner.
--
-- No update may leave an unarchived ACTIVE membership belonging to anyone but
-- the caller. An owner keeps suspend and archive, on their own tenant's rows,
-- because neither produces one.
create policy membership_active_is_self_only on public.membership
  as restrictive for update to authenticated
  using ( true )
  with check (
    status <> 'active'
    or archived_at is not null
    or member_id = auth.uid()
  );
