-- ===== migration: 20260831120001_tenant_locale_and_currency_constraints =====

-- OD-G17. `tenant.default_locale` accepts only `en` and `ar`; `tenant.base_currency`
-- accepts only `EGP`, `USD`, `SAR`, `AED`, `EUR`. Enforced on the table, not in
-- a wizard that does not exist (ADR-003): `provision_tenant` is granted to every
-- authenticated caller and takes free text, so a CHECK on `public.tenant` is the
-- constraint a direct call cannot walk around.
--
-- WHY A CHECK AND NOT AN ENUM. `check-enum-keys` would accept these values —
-- they are already language-neutral keys — but P07 lands `Currency` and `Locale`
-- as Settings entities per SCOPE.md module 18, and OD-G17 is then superseded
-- rather than deleted. Dropping a CHECK and adding a foreign key is one
-- migration (`alter table public.tenant drop constraint
-- tenant_default_locale_permitted` / `tenant_base_currency_permitted`, then
-- `alter table ... add constraint ... foreign key`). Replacing an enum column
-- with a foreign key is a rewrite of the column. The CHECK is the shape that
-- supersedes cleanly.
--
-- Zero tenant rows exist at apply time, so there is no backfill. Confirmed by
-- query before this migration is applied, not assumed from a prior report.
--
-- Independently revertible: drop the two constraints. The function body is not
-- touched here, so a revert cannot leave a validating function pointing at
-- constraints that no longer exist.

alter table public.tenant
  add constraint tenant_default_locale_permitted
    check (default_locale in ('en', 'ar'));

alter table public.tenant
  add constraint tenant_base_currency_permitted
    check (base_currency in ('EGP', 'USD', 'SAR', 'AED', 'EUR'));
