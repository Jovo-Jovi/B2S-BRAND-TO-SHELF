# SECURITY MODEL — B2S

**Status:** AUTHORED. Tier 3a, precedence slot 5.
**Authored:** 2026-08-01 by the reviewer surface.
**Closes:** CF-31.
**Depends on:** `TENANCY_MODEL.md`, `DOMAIN_MODEL.md`, `DECISIONS.md`.

> `TENANCY_MODEL.md` says who owns what. This document states the isolation
> guarantee in **testable** terms and names the evidence that closes its gate.
> Mechanism is `ARCHITECTURE.md`'s, after Gate 3. Nothing here names a library,
> a policy syntax, or a folder.

---

## 1. The guarantee

> **No request executed in the authorisation context of tenant A can read, infer
> the existence of, or modify any record belonging to tenant B — regardless of
> the request's shape, the role held, or the identifier supplied.**

Three parts, each independently testable.

**Read.** No response body ever contains a tenant B record.

**Existence.** No response *distinguishes* "does not exist" from "exists but
belongs to another tenant." Status codes, timings, error text and validation
messages are identical for both. An enumerable identifier that returns a
different response for a foreign record is a breach even when it returns no data.

**Modify.** No write, delete, archive or state transition reaches a tenant B
record, including writes that supply a foreign identifier as a foreign key on an
otherwise valid own-tenant record.

**This gate cannot be waived by OD.** Every other standard in this platform can
be traded against schedule by a signed decision. This one cannot, because a
failure is not recoverable by a later fix: data disclosed is disclosed.

---

## 2. Default deny

**Authorisation is enforced at the data layer. Every other check is convenience.**

1. **The data layer denies by default.** Access is granted by explicit rule, never
   assumed by absence of a rule.
2. **UI gates and request-layer checks are UX and defence in depth, never the
   boundary.** A missing UI check is a bug. A missing data-layer rule is a breach.
3. **Enabling protection without a rule fails closed and silent** — permitted data
   silently returns empty. Therefore every gate tests the **positive** path too:
   the tenant's own data must actually come back. A test suite that only proves
   "A cannot read B" passes trivially against a system that returns nothing to
   anyone.
4. **Rules and grants compose.** A rule that looks harmless in isolation can widen
   reach when combined with a broad grant. Both are reviewed together, always.
5. **Any privileged path that bypasses tenant rules is physically quarantined**,
   reachable from exactly one place, and every use writes an `ActivityEvent`.

---

## 3. The five testable properties

Each is a claim a test can fail. These are the acceptance criteria for the
tenant-isolation standard.

**P1 — Cross-tenant read returns nothing.** For every entity type, a request in
tenant A's context supplying a valid tenant B identifier returns no record.
*Evidence:* one automated test per entity type, run against the live environment.

**P2 — Cross-tenant existence is indistinguishable.** For every entity type, the
response for a foreign identifier is byte-identical in status and shape to the
response for a non-existent one.
*Evidence:* paired assertions, foreign versus nonexistent, per entity type.

**P3 — Cross-tenant write is rejected.** For every mutable entity type, a write
in tenant A's context targeting a tenant B record fails, and no partial effect
persists. Includes supplying a foreign foreign-key on an own-tenant record.
*Evidence:* one test per mutable entity type, asserting both rejection and
absence of side effect.

**P4 — The positive path works.** For every entity type, a tenant reading its own
data receives it. Non-empty, correct, complete.
*Evidence:* seeded fixtures asserted to return. **Required — this is what catches
fail-closed-and-silent.**

**P5 — Every rule is exercised.** No entity type ships without P1–P4 covering it.
An entity with no isolation test is treated as having failed, not as untested.
*Evidence:* a coverage assertion mapping every entity in `DOMAIN_MODEL.md` §2 to
its four tests. **87 entities, 4 properties.**

---

## 4. What closes the gate — CF-31

CF-31 recorded that isolation correctness was an *ungated gate*: asserted,
never proven. It closes here, with this definition.

**The gate is closed by, and only by:**

1. **P1–P5 green against the live environment**, not against a local stub and not
   against code review. Rules are read from the live catalog, not from source.
2. **A coverage report** mapping all 87 entities to their four properties, with no
   gaps and no exemptions.
3. **A written adversarial review** of the rule set and the grant set *together*,
   by the heavyweight model class, asking what combination widens reach.
4. **Zero privileged-path uses outside the quarantined location**, proven by an
   automated check, not by inspection.

**Re-run conditions.** Every one of these re-runs the full gate, not a subset:
a new entity type · a change to any access rule · a change to any grant · a new
privileged path · a role definition change · any change to the `Operator` surface.

**No evidence means FAIL.** A gate closed on partial evidence has not been closed.

---

## 5. Operator access controls

`TENANCY_MODEL.md` §5 states the policy. This states the enforcement.

| Control | Requirement |
|---|---|
| Default reach | Metadata, usage and billing only. Business data is out of reach by construction, not by policy |
| Elevation | Only through a live `ConsentGrant` created by a tenant `Owner`, scoped and time-boxed |
| Expiry | Lapses automatically. Cannot be extended, only replaced by a new grant |
| Logging | An `ActivityEvent` for the grant and for **every access under it**, readable in full by the tenant |
| Revocation | Immediate, by the `Owner`, at any time |
| Emergency override | **None exists.** An override that exists is an override that will be used |

**Testable:** an `Operator` request for tenant business data with no live
`ConsentGrant` is indistinguishable from a cross-tenant request — it returns
nothing and reveals nothing. That is P1–P3 applied to the operator surface, and
it is covered by P5.

---

## 6. PII handling

Per OD-G6. B2S holds two classes: **`Member` PII** (platform-scoped identity) and
**`Buyer` PII** (tenant-scoped business data, and the tenant's responsibility to
its own buyers).

| Rule | Applies |
|---|---|
| PII is never a natural key | Both — identity is always a generated key (`DOMAIN_MODEL.md` invariant 2) |
| PII never enters a log, an error message, or an `ActivityEvent` payload | Both. Events record the record's key and the action, never its contents |
| PII never enters a `PrintArtifact` filename or object-storage path | Both |
| Buyer PII is exportable and deletable on the tenant's instruction | `Buyer` |
| Member PII survives tenant deletion | `Member` — a person is not a tenant's property |
| **No real buyer data ever enters the repository, including test fixtures. Fixtures are synthetic** | Absolute, per OD-G7 |

---

## 7. Audit trail

Per OD-C15. `ActivityEvent` is append-only and never edited or deleted.

**Every event records:** who (`Member` or `Operator`), what action, which entity
type and key, when, which tenant, and — where an elevation was used — which
`ConsentGrant`.

**Mandatory events:** every write to an immutable document · every `Payment` and
`CreditNote` · every `StockMovement` · every role or membership change · every
`ConsentGrant` lifecycle step and every access under one · every `ImportRun` ·
every `BackupSnapshot` and every deletion request · every privileged-path use.

**Never recorded:** PII values, secrets, or full record contents. The event names
the record; the record holds the data.

**The audit trail is tenant-readable.** A tenant that cannot inspect who touched
its data has not been given ownership of it.

---

## 8. Public-repository prevention rules

Per OD-G7. **Prevention, not later removal — history is permanent.**

1. Never commit any environment file, service-role key, connection string, or
   credential.
2. A publishable client key is safe **only if the data-layer rules are correct**.
   That makes rule correctness a gate, not a nicety — which is §4.
3. Privileged keys exist only in the host platform's secret store. Never in the
   repository, never in a client bundle, never in a migration.
4. Push protection is the enforcement mechanism and is never disabled.
5. A pre-commit hook blocks environment files, privileged key patterns, and long
   base64 blobs.
6. **Accepted as public:** schema, access rules, method documents, retiring tools.
7. **No real buyer data, invoice, or buyer list ever enters the repository** —
   including fixtures.
8. **A credential pasted into any AI surface is treated as compromised and
   rotated immediately.** No exceptions, no assessment of likelihood.

**Known residual, accepted and tracked:** the owner's OS account name is
permanently in git history at three locations under `legacy/`, which
`legacy/FREEZE.md` forbids modifying. Current-content occurrences are redacted.
This cannot be fully removed while `legacy/` is preserved verbatim in a public
repository. Tracked as CF-14, with a four-option OD pending. It is an identifier,
not a credential; it is disclosed, not exploitable.

---

## 9. Pre-launch audit

Run before public launch. **An audit, not a removal** — history is permanent.

- [ ] Full-history secret scan, not just the working tree
- [ ] Confirm no privileged key was ever committed — if one was, **rotate it**;
      deleting it is not remediation
- [ ] Confirm no real buyer, invoice or payment data in any commit
- [ ] P1–P5 green against production, with the 87-entity coverage report
- [ ] Adversarial rule-and-grant review, written, by the heavyweight class
- [ ] Confirm the `Operator` surface's actual reach matches `TENANCY_MODEL.md` §5
      and the terms of service — tested, not asserted
- [ ] Confirm every privileged-path use is quarantined and logged
- [ ] Decide whether the repository stays public at commercial launch. If it goes
      private, understand that already-pushed content stays disclosed

---

## 10. What this forecloses

| Failure | Foreclosed by |
|---|---|
| A tenant reading another's data | §1, proven by P1 |
| Inferring a record's existence without reading it | §3 P2 |
| A foreign key smuggling a foreign record into a valid write | §3 P3 |
| Protection enabled with no rule, returning silence to everyone | §3 P4 — the positive path is mandatory |
| An entity shipping with no isolation test | §3 P5 — untested is failed |
| A harmless-looking rule widening reach through a broad grant | §2.4, §4.3 |
| Support staff browsing tenant data | §5 — no ambient reach, no override |
| PII in a log, a filename, or a fixture | §6 |
| An unauditable data touch | §7 |
| A credential in a public repository | §8 |
| Isolation asserted but never proven | §4 — CF-31 |

---

*Tier 3a. Read with `TENANCY_MODEL.md`. Mechanism is `ARCHITECTURE.md`'s, after Gate 3.*
