-- ===== migration: 20260831120004_operator_no_api_write =====

-- OD-G19. public.operator is a system-managed table. No API role holds
-- INSERT, UPDATE or DELETE on it. The grants migration (20260802120007)
-- revoked all on all public tables from anon and from authenticated ONLY,
-- so service_role kept Supabase's default table privileges — measured at
-- P02-T13 against information_schema.role_table_grants and
-- has_table_privilege: SELECT, INSERT, UPDATE, DELETE, TRUNCATE,
-- REFERENCES, TRIGGER — and bypasses RLS besides (SECURITY_MODEL §11a.3).
-- service_role is an API role, so the signed clause was not true of the
-- catalog as it stood.
--
-- Resolution chosen: make the clause literally true, rather than narrow it
-- and leave residual reach as a carry-forward. The isolation suite (and
-- every other Operator provision) already writes this table as postgres
-- through the Management API, which is the decision's "direct
-- administrative access to the database". No API write path is added to
-- prove the absence.
--
-- TRUNCATE was a fourth row-write the three named verbs would have left
-- standing; it is revoked with them so the absence is of a write path, not
-- of a list of synonyms. REFERENCES and TRIGGER are dropped by REVOKE ALL
-- as well, then SELECT is granted back: the privileged client may still
-- read the table under ADR-005's quarantine, and it cannot insert, update,
-- delete or truncate a row through PostgREST.
--
-- Independently revertible: revoke select on public.operator from
-- service_role; grant insert, update, delete, truncate, references, trigger
-- on public.operator to service_role.

revoke all on table public.operator from service_role;
grant select on table public.operator to service_role;
