-- ===== migration: 20260803120005_membership_self_visibility =====

-- 20260803120004 was half right, and the gate said so on the next run. This is
-- the other half, kept as its own migration because 004 is applied and an
-- applied migration is history (ADR-006).
--
-- 004 scoped the invitee's new SELECT policy to `status = 'invited'`, reasoning
-- that an invitee needs to see the offer and nothing more. The offer became
-- visible and acceptance was still refused, now with 42501 rather than a silent
-- zero-row match.
--
-- Measured rather than guessed: with the accept policy's WITH CHECK replaced by
-- literal `true` and both other UPDATE policies dropped, the refusal survived.
-- A WITH CHECK that cannot fail was failing, so the check being violated was
-- never the UPDATE policy's.
--
-- PostgreSQL applies the SELECT policies to an UPDATE **twice**: to the old row,
-- which is why 004 was needed at all, and again to the NEW row, so that no
-- UPDATE can push a row out of the caller's own visibility. An `invited`-only
-- SELECT policy does exactly that: the row the invitee is permitted to write is
-- `active`, and `active` is what the policy stops covering. Accepting an
-- invitation under 004 meant updating a row into a state its owner could no
-- longer see, and the server is right to refuse it.
--
-- So the rule is not "an invitee may see their invitation". It is the plainer
-- thing that was true all along: **a member may see the membership rows that
-- are theirs**, wherever they are, in whatever state. A person is entitled to
-- know which tenants claim them and in what role, and no other member is
-- exposed by it — `membership_select_tenant` remains the only way to see anyone
-- else's row, and it still requires an active membership in that tenant.
--
-- What this concedes, stated rather than buried: an owner can now put one row
-- into a stranger's result set, since inviting someone is how anyone ever joins
-- a second tenant. It confers nothing. The row is `invited`, it does not move
-- what the stranger resolves to, and ignoring it is a complete defence.
-- DATA_MODEL.md §5 proof 9 asserts exactly that, from the victim's side.

drop policy membership_select_own_invitation on public.membership;

create policy membership_select_own on public.membership
  for select to authenticated
  using ( member_id = auth.uid() );
