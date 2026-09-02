# ROLE JOURNEY — B2S

**Status:** AUTHORED. OD-H9 — lands with the conformance check that asserts it
against reality, or it does not land.
**Authored:** 2026-08-05, P02-T09.
**Depends on:** `TENANCY_MODEL.md` §3 (the Can/Cannot table) and §5 (Operator
reach), `docs/method/BUILD_PHASES.md`, `supabase/schema.sql`'s `public.role`
enum.

> This is a specification, not prose. One table. Every capability traces to a
> `Can` cell in `TENANCY_MODEL.md` §3 or §5, and every owning phase is a real
> heading in `BUILD_PHASES.md`. `scripts/check_roadmap.py` asserts both facts
> on every push (OD-H9): no actor here that is not the enum plus the two named
> exceptions, no phase here that `BUILD_PHASES.md` does not carry, and every
> enum role holds at least one row.

---

## Seven actors, and exactly seven

Five carried on `Membership` — the `public.role` enum, verbatim: **owner**,
**manager**, **designer**, **approver**, **viewer**. Plus two that are never a
`Membership` at all:

- **Operator** — platform-side, holds no tenant `Role` (OD-G10). A B2S platform
  identity, metadata and usage only, never tenant business data.
- **Buyer** — a record, not an actor. It never authenticates, never holds a
  `Membership`, and never opens a session. Its row exists precisely because
  that is the fact most likely to be misread from the name alone.

---

## The table

| Role | Capability | Owning phase | Note |
|---|---|---|---|
| Owner | Manage tenant membership: invite, assign a `Role`, suspend or archive a `Membership` | P02 | `TENANCY_MODEL.md` §3 Can column ("member management"); bounded by the `membership_active_owner_required` trigger (§3 rule 1) — a tenant may never be left at zero active owners |
| Owner | Issue, scope, time-box and revoke a `ConsentGrant` for Operator break-glass access | P02 | `TENANCY_MODEL.md` §5 — only an `Owner` may create one, never an `Operator` and never a support ticket |
| Owner | Every Manager-level business operation, in addition to the two rows above | P04 | `TENANCY_MODEL.md` §3 Can column ("everything within the tenant"); P04 is the earliest phase that gives an Owner tenant business data to act on |
| Manager | Catalog and inventory operations | P04 | `TENANCY_MODEL.md` §3 Can column |
| Manager | Sales, invoicing, payments, returns | P05 | `TENANCY_MODEL.md` §3 Can column |
| Manager | CSV import of products and buyers | P07 | `TENANCY_MODEL.md` §3 Can column; `IMPORT_SPEC.md` is authored just-in-time at P07. CF-32 still names the pre-renumbering phase id `P-10` for this same work and has not been corrected |
| Designer | Brand identity and asset management | P03 | `TENANCY_MODEL.md` §3 Can column |
| Designer | Packaging templates and artwork authoring | P06 | `TENANCY_MODEL.md` §3 Can column |
| Designer | Generate print output (`PrintArtifact`) | P06 | `TENANCY_MODEL.md` §3 Can column |
| Designer | Read-only catalog access, to bind artwork to a variant | P04 | `TENANCY_MODEL.md` §3 Can column states this as the one read exception to the Designer boundary; it needs `Product`/`ProductVariant` to exist |
| Approver | Read artwork and approve or reject an `ApprovalStep` | P06 | `TENANCY_MODEL.md` §3 Can column (OD-F6). `ApprovalStep` itself is `SCOPE.md` module 08, Release 2, and is not delivered by any of the nine phases; the phase named is the one that creates the `Artwork` an `ApprovalStep` approves |
| Viewer | Read-only visibility across catalog and inventory | P04 | `TENANCY_MODEL.md` §3 Can column |
| Viewer | Read-only visibility on sales and financial records, only where explicitly granted | P05 | `TENANCY_MODEL.md` §3 Cannot column names the default exclusion ("any payment or cost figure unless explicitly granted") — the grant is the exception, not a Viewer default |
| Operator | View account metadata and usage: tenant name, plan, `Subscription` state, member count, storage consumed, `ImportRun` counts and outcomes, error rates, last activity date, invoice count as a number | P08 | `TENANCY_MODEL.md` §5, permitted-without-consent list. The operator surface itself, metadata and usage only, is a named P08 deliverable |
| Operator | Reach restricted to metadata only, by construction | P02 | OD-G10. "`Operator` reach limited to metadata per OD-G10" is a named P02 deliverable. **Not:** an `Operator` never reaches tenant business data — no `Buyer`, `Invoice`, `Payment`, `CreditNote`, cost or margin figure, `Product` name, `MediaAsset`, `Artwork` or `BrandProfile` value — under any circumstance, without a live `ConsentGrant`; and there is no API path to become an Operator — no self-registration, invitation or public endpoint, and no API role holds INSERT, UPDATE or DELETE on `public.operator` (OD-G19) |
| Operator | Break-glass access to a stated module, only under a live, time-boxed `ConsentGrant`, with every access logged as an `ActivityEvent` | P02 | `TENANCY_MODEL.md` §5's break-glass path; `ConsentGrant` and `ActivityEvent` are named P02 deliverables |
| Buyer | None — a data record referenced by `SalesOrder` and `Invoice`, not a role with a capability | P05 | `TENANCY_MODEL.md` §3 does not name `Buyer` among the five roles at all; `SCOPE.md` module 13 creates the `Buyer` entity at P05. **Not:** a `Buyer` never signs in, holds no `Membership`, no `Role` and no session — misreading it as an actor is the failure this row exists to foreclose |

---

*Read with `TENANCY_MODEL.md` and `docs/method/BUILD_PHASES.md`.*
