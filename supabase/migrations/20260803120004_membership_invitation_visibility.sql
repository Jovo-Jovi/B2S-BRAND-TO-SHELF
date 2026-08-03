-- ===== migration: 20260803120004_membership_invitation_visibility =====

-- This task's own gate finding, one layer beneath CF-103's fix. It is recorded
-- as a separate migration rather than folded into 20260803120001 because that
-- one is applied: an applied migration is history, and history that gets edited
-- to look correct is the thing ADR-006's single-applier rule exists to prevent.
--
-- 20260803120001 gave the invitee an UPDATE policy and nothing to update.
-- PostgreSQL applies the SELECT policies on top of an UPDATE policy's USING
-- whenever the statement reads existing row values, and `UPDATE ... WHERE` —
-- the only shape PostgREST emits for a PATCH — always does. membership's one
-- SELECT policy is membership_select_tenant, `tenant_id = current_tenant_id()`,
-- and an invitee holds no ACTIVE membership in the inviting tenant, because
-- that is what being invited means. The row was invisible to the single person
-- entitled to act on it. Their acceptance matched zero rows and PostgREST
-- answered 204, so the defect presented as success.
--
-- A right nobody can exercise is not a right. An invitation the invitee cannot
-- see is the availability defect wearing its other face: SECURITY_MODEL.md §1's
-- fourth guarantee says an owner may not force a stranger active, and A2's
-- answer to that was to make acceptance the invitee's to give. Withholding the
-- row withholds the giving.
--
-- Scoped to the invitation and to nothing else. Without `status = 'invited'`
-- this would read "see your own membership rows in every tenant", and then any
-- owner anywhere could make a row appear in a stranger's result set at will and
-- keep it there. What the invitee gains sight of is one offer addressed to them
-- by name, which they accept or leave to lapse; the moment they accept, the row
-- leaves this policy and is covered by membership_select_tenant like any other.
create policy membership_select_own_invitation on public.membership
  for select to authenticated
  using (
    member_id = auth.uid()
    and status = 'invited'
    and archived_at is null
  );
