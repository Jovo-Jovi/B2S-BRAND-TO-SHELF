# DECISIONS — B2S

**Status:** AUTHORED. Tier 1, precedence slot 2.
**Landed:** 2026-08-01 by P-05-LAND.

The 84 signed operational decisions, promoted verbatim from
`docs/method/B2S_PREPARE_PHASE.md` §2, which remains the record of where
they were signed. **This file is now the authoritative copy.** Rows are
byte-identical to the register as signed; no rationale has been added after
the fact, because the signatures cover the decisions, not a later
reconstruction of the reasoning.

New decisions are authored here in full — decision, date, rationale, and
what it forecloses. Existing rows are amended only by formal amendment,
never edited in place.

## 2. Decision register

88 decisions, all signed. None open.

### Group A — Product identity

| OD | Decision | Status |
|---|---|---|
| A1 | Multi-brand multi-product. Wizard captures brand name, logo, type, numbers, data, colours; system optimises output to suit. | SIGNED |
| A2 | Customer is the brand owner, possibly a food producer. | SIGNED |
| A3 | One account = one company = one master brand + many lines + many products. Free at launch, subscription later. | SIGNED |
| A4 | Balance Bites is a customer. Product is B2S. | SIGNED |
| A5 | **Exclusions:** agencies serving unrelated clients from one login. Compliance guarantees (F2). Retail GTIN generation (H5). Legacy data migration as a built-in feature — CSV import replaces it. | SIGNED (derived) |
| A6 | Done when many brands run their business from it. | SIGNED |
| A7 | Every product links to business management, design, preparation, packaging and invoicing. Stock reaches component level. | SIGNED |

### Group B — Legacy relationship

| OD | Decision | Status |
|---|---|---|
| B1 | **Void.** Parity is dead; replaced by the three-standard model in §7. | CLOSED |
| B2 | Legacy tools frozen and retiring. Not maintained in parallel. | SIGNED |
| B3 | Nothing is "fixed" — everything is configured. Legacy defects are requirements the new build must not reproduce. | SIGNED |
| B4 | No legacy print output is a reference. Print standard is a fresh physical measurement. | SIGNED |
| B5 | Harvest specifications, relationships and feature ideas only. No code. | SIGNED |
| B6 | Keep none of the six tools. Retiring them is the point of the project. | SIGNED |
| B7 | All legacy data loss accepted once replaced by configurable tools. | SIGNED |

### Group C — Domain & data

| OD | Decision | Status |
|---|---|---|
| C1 | Canonical entity list + one definition per concept. Authored in `DOMAIN_MODEL.md`. | SIGNED (scope) |
| C2 | Returns are first-class and must be correctly processed. | SIGNED |
| C3 | Returns are **stock movements**. | SIGNED |
| C4 | Batch/lot tracking for produced products, produced stickers and produced labels. | SIGNED |
| C5 | Traceability required — a bad batch resolves to the invoices that shipped it. | SIGNED |
| C6 | Multi-location stock: IN. | SIGNED |
| C7 | Product variants: IN. **Master items + variant items, customer chooses.** | SIGNED |
| C8 | Units of measure: customer-selectable. | SIGNED |
| C9 | Multi-currency: customer-selectable. | SIGNED |
| C10 | Tax: customer toggles on/off during configuration, with rate(s) configurable. | SIGNED |
| C11 | Invoice numbering scoped per A3 (account → line). | SIGNED |
| C12 | Payments IN: full / partial / underpaid; type cash / card / other; receipt attachment when available. | SIGNED |
| C13 | Purchase orders and supplier management: IN. | SIGNED |
| C14 | Data retention, ownership, portability, deletion: yes. | SIGNED |
| C15 | Audit trail: yes. | SIGNED |
| C16 | A `Return`'s money effect creates a `CreditNote`. An issued `Invoice` is immutable. Outstanding = Invoice - Payments - CreditNotes. | SIGNED |
| C17 | Printed labels and stickers are `Component` records of kind `packaging`, with an optional link to the `ArtworkVersion` that produced them. Not a new entity. | SIGNED |
| C18 | `Shipment` is a distinct entity, R1 at data level. R1 auto-creates one per `Invoice`; standalone management is R2. | SIGNED |
| C19 | `PriceList` in scope, R2. R1 is one price per `ProductVariant` in the tenant's base currency. | SIGNED |

### Group D — Brand & identity

| OD | Decision | Status |
|---|---|---|
| D1 | Complete brand field inventory required. | SIGNED (scope) |
| D2 | Full logo variant set. | SIGNED |
| D3 | All colour models offered (RGB, CMYK, Pantone); customer selects. | SIGNED |
| D4 | Font licensing: customer selects and is responsible. | SIGNED |
| D5 | Brand versioning: customer archives; **no deletion, ever**. | SIGNED |
| D6 | No hardcoded values — enforced as a checkable rule. | SIGNED |
| D7 | i18n contract: no literals; bilingual by rule. | SIGNED |
| D8 | Customer uploads icons and images, all formats supported, size-constrained. | SIGNED |
| D9 | Customer authors their own guidelines; optional templates offered. | SIGNED |
| **D10** | **Brand identity is master-level with per-line inherit-or-override, per field.** Same master/variant pattern as products. | SIGNED |

### Group E — Print & production

| OD | Decision | Status |
|---|---|---|
| E1 | Print shop receives all variants: PNG, PDF, cutout, and others. | SIGNED |
| E2 | **Calibration is a measured physical tolerance recorded at Step 15. Not an assumed value.** | SIGNED |
| E3 | Bleed / trim / safe-area fully configurable, with library presets. | SIGNED |
| E4 | Output colour space: customer-selectable. | SIGNED |
| E5 | Die-lines: required and selectable. | SIGNED |
| E6 | **Imposition required, R2, labels and stickers only. R1 exports one PrintArtifact per Artwork. Sheet parameters specified in PRINT_PRODUCTION_SPEC.md at P-10.** | SIGNED |
| E7 | Outputs customer-selectable, some or all. **Garment tickets added** for cloth brands; extensible to other brand categories. | SIGNED |
| E8 | Tolerance customised per output type. | SIGNED |
| E9 | Substrate / material: customer-selectable. | SIGNED |
| E10 | Proofing and print sign-off record: yes. | SIGNED |
| **E11** | **BOTH paths. PrintArtifact (PDF/PNG/cutout) is the production deliverable and must be byte-identical across platforms. Browser print dialog is desk preview only, labelled as such, never the print-shop handoff.** Forced by your answer 3 + H3. | SIGNED |
| E12 | A `PrintJob` produces a file, never stock. Physical output is recorded by a `ProductionRun` of kind `printing`, which references the `PrintJob` and generates the `StockMovement`. | SIGNED |

### Group F — Regulatory

| OD | Decision | Status |
|---|---|---|
| F1 | Applicable regimes: customer-selectable. | SIGNED |
| F2 | **Compliance is the brand owner's responsibility, not a B2S guarantee.** Must appear in terms of service. | SIGNED |
| F3 | Allergen data model: yes. | SIGNED |
| F4 | Nutrition declaration rules: customer-selectable. | SIGNED |
| F5 | Mandatory label elements: customer-selectable. | SIGNED |
| F6 | Multi-stage approval: designer + owner + additional approvers. | SIGNED |

### Group G — Platform & access

| OD | Decision | Status |
|---|---|---|
| G1 | Scale target: **1000 tenants**, each a brand, each with multiple members (per G2/F6). | SIGNED |
| G2 | Roles and permissions: yes. | SIGNED |
| G3 | Auth: yes. Per-customer private data and database isolation. | SIGNED |
| G4 | PWA client, online database (Supabase). | SIGNED |
| G5 | Responsive across devices. | SIGNED |
| G6 | PII handling: yes. | SIGNED |
| G7 | **Repo public now.** Pre-relaunch audit required (§10). Prevention, not later-removal (§9). | SIGNED |
| G8 | Backup and restore policy: yes. | SIGNED |
| G9 | Hosted on Vercel. | SIGNED |
| **G10** | **Operator sees account metadata, usage and billing only. Never tenant business data.** Support access requires ConsentGrant and is logged. Future: subscription-gated feature flags. | SIGNED |
| **G11** | **Print masters and large assets in tenant-isolated object storage, never table rows.** Base64-in-rows is what broke the legacy tools. | SIGNED |
| G12 | Design Assistant: R3, paid tier. May read brand config, template metadata and product names only. Never buyer, invoice, payment or financial data. | SIGNED |
| **G13** | **Email-and-password and Google coexist as sign-in mechanisms. One email address resolves to exactly one `member.id`, whichever mechanism was used; an identity that cannot be deterministically linked fails closed. An invitation may be accepted only where the platform has established control of the invited identity — satisfied today by a verified email and nothing else. Authentication creates at most a `Member`: never a `Membership`, never a `Role`, never a `Tenant`.** | SIGNED 2026-08-04 |
| **G14** | **The tenant a session acts in is a caller-supplied selector resolved server-side against an active `Membership` on every request. One active membership resolves implicitly; more than one requires an explicit held selection; anything else resolves null.** | SIGNED 2026-08-04 |
| **G15** | **Every `Tenant` has at least one active `Owner` at all times. More than one is permitted.** | SIGNED 2026-08-04 |
| **G16** | **An invitation is keyed to an email address, not to an existing `Member`. Signing in through the invitation link establishes control of the address and activates the `Membership` in the same act.** | SIGNED 2026-08-04 |

### Group H — Quality & acceptance

| OD | Decision | Status |
|---|---|---|
| H1 | **Professional standard defined by ACCEPTANCE.md, authored at P-11.** | SIGNED |
| H2 | Accessibility: yes. | SIGNED |
| H3 | All platforms supported — which forces E11. | SIGNED |
| H4 | QR: upload or generate, derived from brand name, product brand type, product category, product batch. | SIGNED |
| H5 | **Barcodes scannable, with one constraint: retail GTIN is ENTERED (GS1-allocated by the brand), never generated.** Generator produces Code 128 / Code 39 for internal and batch use, or EAN-13 on restricted-circulation prefixes (`02`, `04`, `20`–`29`), both labelled not-for-retail. | SIGNED (constrained) |
| H6 | **Gate evidence: the four-standard acceptance model, §7.** | SIGNED |
| **H7** | **Gate 3 verifies the blocking set only: `PRODUCT_BRIEF`, `GLOSSARY`, `SCOPE`, `DECISIONS`, `DOMAIN_MODEL`, `TENANCY_MODEL`, `SECURITY_MODEL`, `CALC_SPEC`. Every other frozen document is authored just-in-time, one step ahead of the module that needs it, and is verified by that module's own gate. `CALC_SPEC.md`'s Gate 3 item covers its 25 Release 1 rows; the fourteen Release 2 rows in its §6 land as signed amendments.** | SIGNED 2026-08-01 |
| **H8** | **A readiness check precedes every heavyweight exit gate. A STANDARD-class task asserts every mechanically checkable criterion first; the heavyweight gate runs only when readiness is green.** | SIGNED 2026-08-04 |
| **H9** | **A reviewer-authored specification lands with a conformance check that asserts it against reality. A specification no script can check does not land.** | SIGNED 2026-08-04 |
| **H10** | **`MODULE_SPEC.md` §1 is the application tree. Repository-root configuration and infrastructure directories are outside its scope and are stated as such.** | SIGNED 2026-08-04 |
| **H11** | **Every probe a gate invents becomes a permanent CI check or suite assertion. An adversarial pass is additive, never re-invented.** | SIGNED 2026-08-04 |

## 3. Decisions authored after the promotion

### OD-H7 — Gate 3 scope

**Decision.** Gate 3 verifies eight documents: `PRODUCT_BRIEF.md`,
`GLOSSARY.md`, `SCOPE.md`, `DECISIONS.md`, `DOMAIN_MODEL.md`,
`TENANCY_MODEL.md`, `SECURITY_MODEL.md`, `CALC_SPEC.md`. The thirteen remaining
frozen documents are authored just-in-time, one step ahead of the module that
needs them, and each carries the Gate 3 line item originally written for it,
moved verbatim to its own module gate. `CALC_SPEC.md`'s Gate 3 item covers its
25 Release 1 rows only.

**Date.** Signed 2026-08-01.

**Rationale.** The compression was already in force — it governed which
documents were authored and in what order — but it lived in a reviewer
configuration and never reached `B2S_PREPARE_PHASE.md`, which is the document a
gate is run from. The committed checklist therefore demanded seven documents
that the compression had deliberately deferred: `PRINT_CONTRACT`,
`PRINT_PRODUCTION_SPEC`, `TEMPLATE_MODEL`, `IMPORT_SPEC`, `FEATURE_INVENTORY`,
`RISK_REGISTER` and `ACCEPTANCE`. Over-preparation is its own failure mode; a
document authored eight steps before the module that consumes it is rewritten by
the time it is used.

**Forecloses.** A gate that cannot pass, and the reverse failure — quietly
running Gate 3 against a checklist known to be stale, which would make every
later citation of "Gate 3 passed" untrue. It does not foreclose any verification:
every deferred item survives, attached to the gate that can actually evidence it.

### OD-H8 — Readiness precedes the gate

**Decision.** Before every heavyweight phase exit gate, a STANDARD-class readiness
task runs and asserts only what is mechanically checkable: stated counts, tree
conformance in both directions, guard presence measured against live targets,
ledger owner reachability, and a diff of every specification against the live
catalog. The exit gate runs only when readiness is green.

**Date.** Signed 2026-08-04.

**Rationale.** P01's exit gate ran three times. Eight of the nine findings from
the first two runs were defects in reviewer-authored documents — a definition of
done naming guards whose targets did not exist, a folder tree authored before the
tree, a bypass inventory that did not exist and then was ambiguous, stated counts
that contradicted their own enumerations, and an owner-reachability rule with no
mechanism. Every one was cheap to detect and was detected in the most expensive
place in the system: a heavyweight run with a 250-second live suite.

**Forecloses.** Discovering a specification defect at a gate. Readiness costs a
cheap run; a gate cycle costs a heavyweight run, a fix task, and a full re-run.

### OD-H9 — A specification lands with its conformance check

**Decision.** No reviewer-authored specification lands unless a script asserts it
against reality and runs in CI. Where the assertion needs the live database, it
runs in the readiness task instead. A specification that cannot be checked
mechanically is too vague to gate against and is rewritten until it can be.

**Date.** Signed 2026-08-04.

**Rationale.** `check_stated_counts.py` already does this for numbers and has
caught what the reviewer repeatedly missed by hand. Extending it from counts to
trees, schemas and inventories is the same move applied to the same failure.

**Forecloses.** A document whose first contact with reality is a gate, and the
reviewer asserting conformance from memory — which PR-23 already forbids and
which kept happening anyway.

### OD-H10 — `MODULE_SPEC.md` §1 is the application tree

**Decision.** §1 specifies the application: `app/`, `features/`, `components/`,
`lib/`, `supabase/`, `types/`, `scripts/`, `docs/` and the root `__tests__/`.
Repository-root configuration files and infrastructure directories are outside
its scope, and §1 states that rather than leaving it inferred.

**Date.** Signed 2026-08-04.

**Rationale.** The same finding recurred at all three P01 gate runs. The document
was authored as an application tree and checked as a repository, and both
readings were defensible — which made it a scope question rather than a defect,
and one the builder correctly refused to decide three times.

**Forecloses.** The fourth recurrence, and a §1 that grows to enumerate every
`.gitignore` and lockfile in the repository.

### OD-H11 — Adversarial probes are additive

**Decision.** Every probe a gate invents becomes a permanent CI check or suite
assertion in the fix task that follows. A gate's adversarial pass extends the
permanent set; it never re-invents it.

**Date.** Signed 2026-08-04.

**Rationale.** P01's C9 probe — remove a check's target, then empty it — found
four checks passing on nothing, and its two-way form found a fifth. That probe
existed for one run. Had it been permanent from the first, the second gate cycle
would not have happened.

**Forecloses.** A gate whose rigour depends on whoever runs it remembering last
time's ideas.

### OD-G13 — Authentication providers
**Signed 2026-08-04.**

Email-and-password and Google coexist as sign-in mechanisms.

**Identity invariant.** The platform never holds two `Member` identities for one
person. Expressed so it can be asserted: one email address resolves to exactly
one `member.id`, whichever mechanism was used. Where an authenticating identity
cannot be deterministically linked to the existing `Member`, the flow fails
closed — no `Member` is created, no linkage is asserted, and the person uses the
mechanism they registered with.

**Acceptance invariant.** An invitation may be accepted only where the platform
has established control of the invited identity. Under every mechanism now in
force that condition is satisfied by a verified email address and by nothing
else, whether the provider asserts the verification or the email-and-password
flow completes it. Adding a second satisfying condition requires an amendment to
this decision.

**Enforcement.** Both invariants are enforced in the data layer (ADR-003). No
enforcement point exists today: `supabase/schema.sql` carries no verification
concept, and `membership_accept_invitation` gates only on `member_id =
auth.uid()` and status. The task that writes the acceptance path lands the
mechanism and its assertions, or it does not land (OD-H9).

**Authorization.** Authentication establishes identity and creates at most a
`Member`. It never creates a `Membership`, never grants a `Role`, never confers
authorization, and does not itself create a `Tenant`. A `Tenant` is created only
by an explicit provisioning act on the privileged path (ADR-005), which sign-up
may initiate immediately after but never is, creating the tenant and the caller's
active owner `Membership` atomically and recording an `ActivityEvent`.

**Forecloses.** Two `Member` rows for one person reconciled later, which is D11
and D12 one tier down; a mechanism that confers authorization; a sign-in that
silently provisions; an invitation claimable by asserting an address; and an
invariant with no place to be enforced.

### OD-G14 — Session-to-membership binding
**Signed 2026-08-04.**

The tenant a session acts in is supplied by the caller as a selector and resolved
server-side against an active `Membership` for the authenticated `Member`, on
every request. Exactly one active membership resolves implicitly; more than one
requires an explicit selection the caller holds; no valid membership for the
selection, or ambiguity, resolves null. Authorization derives from `Membership`
alone (ADR-004). A stored last-selected tenant is a convenience and never
participates in resolution.

**The restrictive rule stays.** `membership_active_is_self_only` and the
invite-then-accept rule remain in force, on the restated ground that forcing a
`Membership` onto another person is a write against their identity — sufficient
independent of the lockout it used to cause.

**Forecloses.** A token claim as the tenant of record; a person-global binding
shared across sessions and devices; and the removal of the restrictive rule as
vestigial once the lockout it named is gone.

### OD-G15 — Tenant ownership invariant
**Signed 2026-08-04.**

Every `Tenant` has at least one active `Owner` at all times. More than one active
`Owner` is permitted. Any active `Owner` may suspend or archive another's
`Membership`, bounded only by the `membership_active_owner_required` constraint
trigger. `TENANCY_MODEL.md` §3 rule 1 is amended to match; `DATA_MODEL.md` §3.3
and the trigger already state and enforce this and do not change.

**Forecloses.** The specification-versus-implementation divergence CF-93 gap (4)
records, and an ownership transfer that must vacate before it grants.

### OD-G16 — An invitation is keyed to an email address
**Signed 2026-08-04.**

An invitation names an email address, not an existing `Member`. An `Owner` may
issue one for a person who holds no `Member` record and whom the platform cannot
show them. Acceptance is a single act: signing in through the invitation link
establishes control of the address per OD-G13 and activates the `Membership` in
the same motion. The invitee still performs the act — no `Owner` write may
produce an active `Membership` for anyone but the writer.

**Consequence, stated so it is not discovered at a gate.**
`membership.member_id` is `not null references public.member (id)`, so an
invitation to a person with no `Member` record cannot be a `membership` row as
the table stands today. The shape is the build task's to choose. Whichever it
chooses lands as a signed amendment to `DATA_MODEL.md` §3 with its migration in
the same push (OD-H9), and if it adds an entity then `DOMAIN_MODEL.md` §1's total
moves with it. `check_data_model_schema.py` and `check_stated_counts.py` fail the
push otherwise.

**Forecloses.** An `Owner` who must know a stranger's generated key before
inviting them; a directory that exposes strangers so an `Owner` can find one; a
separate prove-your-email step bolted on after acceptance; and an `Owner` who can
make anyone active.

