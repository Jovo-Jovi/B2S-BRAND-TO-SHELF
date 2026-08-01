# TENANCY MODEL — B2S

**Status:** AUTHORED. Tier 3a, precedence slot 5.
**Authored:** 2026-08-01 by the reviewer surface.
**Depends on:** `PRODUCT_BRIEF.md`, `GLOSSARY.md`, `SCOPE.md`, `DECISIONS.md`, `DOMAIN_MODEL.md`.
**Read with:** `SECURITY_MODEL.md`, which states the isolation guarantee in testable terms.

> This document says who owns what and what is scoped to what. `SECURITY_MODEL.md`
> says how that is proven. `DATA_MODEL.md` says how it is stored.

---

## 1. The hierarchy

```
Tenant  (one company, one account)
  └─ Brand                       1:1, mandatory, created at onboarding
       ├─ BrandLine              1:N, zero or more product families
       └─ BrandProfile           1:N, versioned identity snapshots
Tenant
  ├─ Membership ─ Member         N:M through Membership, each carrying one Role
  └─ every business entity       1:N, without exception
```

**One account = one company = one master `Brand`** (OD-A3). Unrelated companies
require separate accounts. A `Tenant` cannot hold two `Brand` records, and a
`Brand` cannot span two `Tenant` records.

**Why 1:1 and not 1:N.** A tenant holding several unrelated brands is the agency
model, explicitly excluded (OD-A5). Admitting it would mean the isolation
boundary sits at the brand rather than the account, which changes every access
predicate in the platform. Product families are served by `BrandLine`, which
inherits from the master `Brand` with per-field override (OD-D10).

---

## 2. The isolation boundary

**The boundary is the `Tenant`.** It is drawn at exactly one place and there is
no second boundary anywhere.

Everything below the boundary is tenant-scoped without exception:

| Scoped to `Tenant` | Examples |
|---|---|
| Every business entity | `Product`, `Buyer`, `Invoice`, `StockMovement`, `Batch`, `Supplier` |
| Every brand entity | `Brand`, `BrandProfile`, `BrandTheme`, `LogoVariant` |
| Every asset | `MediaAsset`, `AssetRendition`, and its stored object |
| Every configuration | `TaxRule`, `Currency`, `UnitOfMeasure`, `Locale` selection, `RegulatoryProfile` |
| Every derived record | `StockLevel`, `CostRecord`, `TraceLink` |
| Every audit record | `ActivityEvent`, `ImportRun`, `BackupSnapshot` |
| Every packaging artefact | `PackagingTemplate` instances a tenant creates, `Artwork`, `ArtworkVersion`, `PrintArtifact` |

**Not tenant-scoped — the only exceptions, and the list is closed:**

| Platform-scoped | Why | Contains tenant data? |
|---|---|---|
| `Operator` | B2S staff identity | No |
| `Member` | A person, who may belong to more than one `Tenant` | Identity only. Never business data |
| `Subscription`, `FeatureFlag` | Commercial entitlement | Metadata only |
| `ConsentGrant` | A tenant's grant of support access | Names one tenant; readable by that tenant |
| Platform-supplied `PackagingTemplate` library | The constrained starter library, identical for all | No |
| `Locale`, `Currency` definitions | Reference data | No |

**A `Member` is the one identity that crosses tenants.** A person may hold a
`Membership` in several tenants. What never crosses is *data*: a session is bound
to exactly one `Membership` at a time, and switching tenant is a new
authorisation context, not a filter change.

**Anything not on the exception list is tenant-scoped. New entities are
tenant-scoped by default; making one platform-scoped requires an OD.**

---

## 3. Roles

Five roles, tenant-scoped, carried on `Membership` (OD-G2).

| Role | Can | Cannot |
|---|---|---|
| **Owner** | Everything within the tenant, including billing, member management, and granting `ConsentGrant` | Nothing within the tenant. Cannot see another tenant |
| **Manager** | All business operations: catalog, inventory, purchasing, sales, invoicing, payments, returns, import | Manage members, change billing, grant consent, delete the brand |
| **Designer** | Brand, assets, templates, artwork, print. Read-only on catalog for binding artwork to a variant | Any sales, payment, cost or buyer data |
| **Approver** | Read artwork and approve or reject an `ApprovalStep` (OD-F6) | Edit artwork, or anything outside approvals |
| **Viewer** | Read-only within the tenant | Any write. Any payment or cost figure unless explicitly granted |

**Rules.**

1. **Every `Tenant` has exactly one `Owner` at all times.** Transfer is atomic;
   the role cannot be vacated.
2. **Roles are additive per `Membership`, never per record.** There is no
   per-invoice or per-product permission. Record-level permissions are the
   failure mode that makes an access model unauditable.
3. **The `Designer` boundary is real, not cosmetic.** It exists so a tenant can
   bring in outside design help without exposing buyers, prices or margins. It is
   the internal analogue of OD-G12's Design Assistant restriction.
4. **A role never grants cross-tenant reach.** No role, including `Owner`,
   can read another tenant.

---

## 4. What is scoped to what, below the tenant

Tenant scope is the security boundary. These are organisational scopes inside it,
and they are **not** security boundaries — a `Manager` sees every `BrandLine`.

| Scoped to | Entities | Note |
|---|---|---|
| `Brand` | `BrandProfile`, `BrandLine`, `BrandGuideline` | One `Brand` per tenant, so brand scope and tenant scope coincide today |
| `BrandLine` | Optional `BrandProfile` override per field (OD-D10) | R2. R1 ships one line |
| `BrandProfile` | `BrandTheme`, `LogoVariant`, `ColorValue`, `Typeface` | Versioned, archived, never deleted (OD-D5) |
| `Location` | `StockLevel`, and every `StockMovement` | R1 ships one location (OD-C6) |
| `Currency` | `PriceList`, and every stored money value's interpretation | Tenant base currency in R1 (OD-C9, OD-C19) |

**`Invoice` numbering is scoped per account then line** (OD-C11). Two tenants may
hold the same invoice number; within a tenant it is unique per `BrandLine`
sequence. Numbering is never global, and a number is never reused.

---

## 5. Operator reach

**The `Operator` sees account metadata, usage and billing. Never tenant business
data** (OD-G10).

Permitted without consent: tenant name, plan, `Subscription` state, member count,
storage consumed, `ImportRun` counts and outcomes, error rates, last activity
date, invoice count as a number.

**Never, under any circumstance, without a `ConsentGrant`:** any `Buyer`, any
`Invoice` or its lines, any `Payment` or `CreditNote`, any cost or margin figure,
any `Product` name or `MediaAsset`, any `Artwork`, any `BrandProfile` value.

### The break-glass path

Support access is not an ambient capability. It requires:

1. An explicit `ConsentGrant` created **by a tenant `Owner`**, never by an
   `Operator` and never by a support ticket.
2. **A stated scope** — which module, and why.
3. **A time box.** The grant expires; it is not revoked, it lapses. An expired
   grant cannot be extended, only replaced.
4. **An `ActivityEvent` for the grant, and one for every access made under it**
   (OD-C15). The tenant can read this trail in full.
5. **Revocable at any moment by the `Owner`**, taking effect immediately.

An `Operator` action taken without a live `ConsentGrant` covering it is a breach,
not a policy exception. There is no emergency override, because an override that
exists is an override that will be used.

---

## 6. Data ownership, portability and deletion

**The tenant owns its data** (OD-C14).

| Right | Guarantee |
|---|---|
| **Portability** | A `BackupSnapshot` exports every tenant-scoped record in a machine-readable form, including assets. Not a subset, not a report |
| **Retention** | Stated per entity class in `DATA_MODEL.md`. Immutable documents — `Invoice`, `CreditNote`, `ActivityEvent`, `ArtworkVersion` — are retained for the tenant's stated statutory period and are never edited |
| **Deletion** | A tenant may request deletion. It removes tenant-scoped records and stored objects. It does **not** remove platform-scoped billing records required for statutory reasons; those are named explicitly rather than kept silently |
| **Archive, never delete** | `BrandProfile` and `ArtworkVersion` are never deleted while the tenant exists (OD-D5). Tenant deletion is the only path that removes them |

**Deletion is irreversible and the tenant is told so before it runs.** A grace
window applies; its length is a `DATA_MODEL.md` decision.

---

## 7. Scale target

**1,000 tenants**, each with multiple members (OD-G1).

What this fixes as a requirement, not an aspiration:

- Every query carries a tenant predicate, so no query's cost grows with the
  number of *other* tenants.
- Asset storage is tenant-isolated (OD-G11) — print masters and large binaries
  live in object storage, never in table rows. Base64-in-rows is what broke the
  retiring tools.
- A tenant with 50,000 `StockMovement` records must not degrade a tenant with 50.
- `StockLevel` is materialised precisely because deriving it by scan does not
  hold at this scale (`DOMAIN_MODEL.md` §5.2).

**What it does not require:** sharding, regional distribution, or multi-region
failover. Those are neither signed nor implied, and proposing them is inventing
scope.

---

## 8. What this forecloses

| Failure | Foreclosed by |
|---|---|
| A query that returns another tenant's rows | §2 — tenant scope is universal, exceptions are a closed list |
| An agency blurring two clients' data | OD-A5, and the 1:1 `Tenant`:`Brand` rule |
| A designer seeing margins | §3 — the `Designer` role boundary |
| Support staff browsing tenant data | §5 — `ConsentGrant` required, time-boxed, logged, revocable |
| A record-level permission model nobody can audit | §3 rule 2 |
| An orphaned tenant with no `Owner` | §3 rule 1 |
| A new entity silently escaping tenant scope | §2 — tenant-scoped by default, exceptions require an OD |
| Assets leaking between tenants through shared storage | OD-G11 — tenant-isolated object storage |

---

*Tier 3a. Read with `SECURITY_MODEL.md`.*
