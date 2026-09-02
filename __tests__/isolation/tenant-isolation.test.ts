// The tenant-isolation proof — DATA_MODEL.md §5, SECURITY_MODEL.md §3, ADR-003.
//
// Fourteen proofs. The first eight are DATA_MODEL.md §5's checklist; the rest
// exist because a gate that only runs its checklist is a checklist. Every one
// of them runs against the LIVE catalog and the LIVE policies. None of them
// reads supabase/schema.sql.
//
// This is the one acceptance standard no OD can waive (SECURITY_MODEL.md §1).
// A single FAIL blocks the phase.
//
// Run: npm run test:isolation

import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  anonCaller,
  EXPECTED_ASSERTIONS,
  FAULT_SCHEMA,
  futureIso,
  makeIdentity,
  makeProbes,
  makeSqlRunner,
  printLedger,
  readConfig,
  record,
  recordedAssertions,
  refusedByGrant,
  refusedByPolicy,
  seed,
  selecting,
  selectingTwice,
  SYNTHETIC_PREFIX,
  TABLES,
  TENANT_SCOPED_TABLES,
  teardown,
  teardownCounts,
  TENANT_SELECTOR_HEADER,
  type Attempt,
  type Caller,
  type Config,
  type Fixture,
  type Identity,
  type Probes,
  type RawRow,
  type SqlRunner,
  type TableName,
} from "./harness";

let config: Config;
let sql: SqlRunner;
let probe: Probes;
let fixture: Fixture;

const sortedIds = (ids: string[]): string[] => [...new Set(ids)].sort();
const sameSet = (actual: string[], expected: string[]): boolean =>
  sortedIds(actual).join("|") === sortedIds(expected).join("|");

/** Reads straight through the privileged path, past every policy. */
async function rowExists(table: TableName, id: string): Promise<boolean> {
  const rows = await sql<{ n: number }>(
    `select count(*)::int as n from public.${table} where id = '${id}'`,
  );
  return rows[0].n > 0;
}

async function columnValue(table: TableName, id: string, column: string): Promise<string | null> {
  const rows = await sql<{ v: string | null }>(
    `select ${column}::text as v from public.${table} where id = '${id}'`,
  );
  return rows.length === 0 ? null : rows[0].v;
}

beforeAll(async () => {
  config = readConfig();
  sql = makeSqlRunner(config);
  probe = makeProbes(config);

  // ADR-012's reinstatement trigger, as a check rather than a judgement (CF-92).
  // This suite may seed and tear down against b2s-production only while it holds
  // zero real tenants. The moment one exists it refuses to run, and a staging
  // project must be created first.
  const [live] = await sql<{ real_tenants: number }>(
    `select count(*)::int as real_tenants
       from public.tenant
      where slug not like '${SYNTHETIC_PREFIX}%'`,
  );
  if (live.real_tenants > 0) {
    throw new Error(
      `HALT: b2s-production holds ${live.real_tenants} non-synthetic tenant row(s). ` +
        `ADR-012's reinstatement trigger has fired: create a staging project and ` +
        `supersede ADR-012 before running this suite again.`,
    );
  }

  // Idempotence: clear anything a previous interrupted run may have left.
  await teardown(config, sql);
  fixture = await seed(config, sql);
}, 300_000);

afterAll(async () => {
  if (config && sql) await teardown(config, sql);
  printLedger();
}, 240_000);

// ---------------------------------------------------------------------------

describe("proof 1 — RLS is enabled on every table", () => {
  it("pg_class.relrowsecurity is true for every public table, zero exceptions", async () => {
    const rows = await sql<{ table_name: string; rls_enabled: boolean }>(
      `select c.relname as table_name, c.relrowsecurity as rls_enabled
         from pg_class c
         join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relkind = 'r'
        order by 1`,
    );

    const failures: string[] = [];
    const names = rows.map((row) => row.table_name);
    if (!sameSet(names, [...TABLES])) {
      failures.push(`live public tables are [${names.join(", ")}], expected [${TABLES.join(", ")}]`);
    }
    for (const row of rows) {
      if (row.rls_enabled !== true) failures.push(`${row.table_name}: relrowsecurity = ${row.rls_enabled}`);
    }

    record(
      "1",
      "RLS enabled on every table",
      failures,
      `pg_class.relrowsecurity true on ${rows.filter((r) => r.rls_enabled).length}/${rows.length} public tables`,
    );
    expect(failures).toEqual([]);
  });
});

describe("proof 2 — every table carries at least one policy", () => {
  it("no table is RLS-enabled with an empty pg_policy set", async () => {
    const rows = await sql<{ table_name: string; policy_count: number }>(
      `select c.relname as table_name, count(p.oid)::int as policy_count
         from pg_class c
         join pg_namespace n on n.oid = c.relnamespace
         left join pg_policy p on p.polrelid = c.oid
        where n.nspname = 'public' and c.relkind = 'r'
        group by 1 order by 1`,
    );

    const failures = rows
      .filter((row) => row.policy_count < 1)
      .map((row) => `${row.table_name}: 0 policies — RLS enabled with no policy fails closed and silent`);

    const total = rows.reduce((sum, row) => sum + row.policy_count, 0);
    record(
      "2",
      "Every table has >= 1 policy",
      failures,
      `${total} policies across ${rows.length} tables: ${rows.map((r) => `${r.table_name}=${r.policy_count}`).join(", ")}`,
    );
    expect(failures).toEqual([]);
  });
});

describe("proof 3 — the WITH CHECK matrix", () => {
  it("every write-side policy carries with_check; every read policy carries qual alone", async () => {
    const rows = await sql<{
      table_name: string;
      policy_name: string;
      cmd: string;
      permissive: boolean;
      roles: string;
      qual: string | null;
      with_check: string | null;
    }>(
      `select c.relname as table_name,
              p.polname as policy_name,
              case p.polcmd
                when 'r' then 'SELECT' when 'a' then 'INSERT'
                when 'w' then 'UPDATE' when 'd' then 'DELETE'
                when '*' then 'ALL' end as cmd,
              p.polpermissive as permissive,
              coalesce((select string_agg(r.rolname, ',' order by r.rolname)
                          from pg_roles r where r.oid = any(p.polroles)), 'PUBLIC') as roles,
              pg_get_expr(p.polqual, p.polrelid) as qual,
              pg_get_expr(p.polwithcheck, p.polrelid) as with_check
         from pg_policy p
         join pg_class c on c.oid = p.polrelid
         join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public'
        order by 1, 2`,
    );

    const failures: string[] = [];
    const writeSided = ["INSERT", "UPDATE", "ALL"];

    for (const row of rows) {
      const label = `${row.table_name}.${row.policy_name} (${row.cmd})`;
      if (writeSided.includes(row.cmd)) {
        if (row.with_check === null) failures.push(`${label}: write-side policy with no WITH CHECK`);
      } else if (row.cmd === "SELECT") {
        if (row.qual === null) failures.push(`${label}: read policy with no USING`);
        if (row.with_check !== null) {
          failures.push(`${label}: read policy carries WITH CHECK, which PostgreSQL cannot evaluate`);
        }
      }
      if (row.roles !== "authenticated") {
        failures.push(`${label}: applies to roles [${row.roles}], expected authenticated alone`);
      }
    }

    const byCmd = rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.cmd] = (acc[row.cmd] ?? 0) + 1;
      return acc;
    }, {});

    console.log(
      "\n--- proof 3: live policy matrix ---\n" +
        rows
          .map(
            (r) =>
              `${r.table_name.padEnd(15)} ${r.policy_name.padEnd(32)} ${r.cmd.padEnd(7)} ` +
              `qual=${r.qual === null ? "—" : "yes"} with_check=${r.with_check === null ? "—" : "yes"} ` +
              `permissive=${r.permissive} roles=${r.roles}`,
          )
          .join("\n"),
    );

    record(
      "3",
      "Write policies carry WITH CHECK; read policies carry USING alone",
      failures,
      `${rows.length} live policies — ${Object.entries(byCmd).map(([k, v]) => `${v} ${k}`).join(", ")}; ` +
        `${rows.filter((r) => r.with_check !== null).length} carry with_check, ` +
        `${rows.filter((r) => r.qual !== null).length} carry qual`,
    );
    expect(failures).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Proof 4 — the core proof, split by operation.
// ---------------------------------------------------------------------------

describe("proof 4 — cross-tenant reach on every table, both directions", () => {
  it("4a SELECT: each caller reads exactly its own tenant's rows and zero of the other's", async () => {
    const { a, b, unaffiliated } = fixture;

    const expectations: [Identity, TableName, string[]][] = [
      // Tenant A's owner.
      [a.owner, "tenant", [a.id]],
      [a.owner, "member", [a.owner.authId, a.viewer.authId]],
      [a.owner, "membership", [a.ownerMembershipId, a.viewerMembershipId]],
      [a.owner, "operator", []],
      [a.owner, "consent_grant", [a.consentGrantId]],
      [a.owner, "activity_event", [a.activityEventId]],
      [a.owner, "invitation", [a.invitationId]],

      // Tenant A's viewer. consent_grant is owner-only by policy, so the empty
      // read there is the specified behaviour rather than a fail-closed symptom.
      [a.viewer, "tenant", [a.id]],
      [a.viewer, "member", [a.owner.authId, a.viewer.authId]],
      [a.viewer, "membership", [a.ownerMembershipId, a.viewerMembershipId]],
      [a.viewer, "operator", []],
      [a.viewer, "consent_grant", []],
      [a.viewer, "activity_event", [a.activityEventId]],
      [a.viewer, "invitation", [a.invitationId]],

      // Tenant B's owner — the mirror image.
      [b.owner, "tenant", [b.id]],
      [b.owner, "member", [b.owner.authId, b.viewer.authId]],
      [b.owner, "membership", [b.ownerMembershipId, b.viewerMembershipId]],
      [b.owner, "operator", []],
      [b.owner, "consent_grant", [b.consentGrantId]],
      [b.owner, "activity_event", [b.activityEventId]],
      [b.owner, "invitation", [b.invitationId]],

      // The unaffiliated member: their own member row, and nothing anywhere else.
      [unaffiliated, "tenant", []],
      [unaffiliated, "member", [unaffiliated.authId]],
      [unaffiliated, "membership", []],
      [unaffiliated, "operator", []],
      [unaffiliated, "consent_grant", []],
      [unaffiliated, "activity_event", []],
      [unaffiliated, "invitation", []],
    ];

    const idsOf = (t: typeof a) => [
      t.id,
      t.ownerMembershipId,
      t.viewerMembershipId,
      t.consentGrantId,
      t.activityEventId,
      t.invitationId,
      t.owner.authId,
      t.viewer.authId,
    ];
    const foreignTo = (identity: Identity): string[] => {
      if (identity === a.owner || identity === a.viewer) return idsOf(b);
      if (identity === b.owner || identity === b.viewer) return idsOf(a);
      return [...idsOf(a), ...idsOf(b)];
    };

    const failures: string[] = [];
    let permittedRowsReturned = 0;

    for (const [identity, table, expected] of expectations) {
      const attempt = await probe.select(identity, table);
      const label = `${identity.label} SELECT ${table}`;

      if (!attempt.ok) {
        failures.push(`${label}: errored ${attempt.status} (${attempt.code}) ${attempt.message}`);
        continue;
      }
      if (!sameSet(attempt.ids, expected)) {
        failures.push(
          `${label}: read [${sortedIds(attempt.ids).join(", ") || "none"}], expected [${sortedIds(expected).join(", ") || "none"}]`,
        );
      }
      // The positive path, asserted on its own: default-deny failing silently is
      // indistinguishable from an empty table, and that is a documented incident.
      if (expected.length > 0 && attempt.count === 0) {
        failures.push(`${label}: POSITIVE PATH EMPTY — permitted rows did not come back`);
      }
      permittedRowsReturned += expected.length > 0 ? attempt.count : 0;

      const leaked = attempt.ids.filter((id) => foreignTo(identity).includes(id));
      if (leaked.length > 0) failures.push(`${label}: LEAKED foreign rows [${leaked.join(", ")}]`);
    }

    record(
      "4a",
      "SELECT: own rows return, foreign rows do not",
      failures,
      `${expectations.length} identity/table reads asserted as exact sets; ` +
        `${permittedRowsReturned} permitted rows actually returned; 0 foreign ids observed`,
    );
    expect(failures).toEqual([]);
  });

  it("4b INSERT: permitted writes land, everything else is refused", async () => {
    const { a, b, unaffiliated } = fixture;

    const payloadsFor = (identity: Identity, tenantId: string): [TableName, Record<string, unknown>][] => [
      [
        "tenant",
        {
          id: randomUUID(),
          name: `${SYNTHETIC_PREFIX}probe`,
          slug: `${SYNTHETIC_PREFIX}probe-${randomUUID().slice(0, 8)}`,
          base_currency: "SAR",
          default_locale: "en",
          status: "active",
        },
      ],
      ["member", { id: randomUUID(), email: `${SYNTHETIC_PREFIX}probe-${randomUUID().slice(0, 8)}@example.com` }],
      [
        "membership",
        { id: randomUUID(), tenant_id: tenantId, member_id: unaffiliated.authId, role: "viewer", status: "invited" },
      ],
      [
        "consent_grant",
        { id: randomUUID(), tenant_id: tenantId, granted_by: identity.authId, scope: "read_only", expires_at: futureIso(1) },
      ],
      [
        "activity_event",
        { id: randomUUID(), tenant_id: tenantId, actor_member_id: identity.authId, action: `${SYNTHETIC_PREFIX}probe`, entity_type: "Tenant" },
      ],
      [
        "invitation",
        {
          id: randomUUID(),
          tenant_id: tenantId,
          email: `${SYNTHETIC_PREFIX}probe-invite-${randomUUID().slice(0, 8)}@example.com`,
          role: "viewer",
          expires_at: futureIso(1),
        },
      ],
      ["operator", { id: randomUUID(), granted_at: new Date().toISOString() }],
    ];

    // An owner may write memberships and consent grants inside their own tenant;
    // any active member may append an activity_event to it. Nothing else is
    // reachable, and provisioning a tenant or a member never is.
    const allowed: Record<string, TableName[]> = {
      [a.owner.label]: ["membership", "consent_grant", "activity_event", "invitation"],
      [a.viewer.label]: ["activity_event"],
      [b.owner.label]: ["membership", "consent_grant", "activity_event", "invitation"],
      [unaffiliated.label]: [],
    };

    const failures: string[] = [];
    let probes = 0;
    let permittedLanded = 0;

    for (const [identity, tenantId] of [
      [a.owner, a.id],
      [a.viewer, a.id],
      [b.owner, b.id],
      [unaffiliated, a.id],
    ] as [Identity, string][]) {
      for (const [table, payload] of payloadsFor(identity, tenantId)) {
        probes += 1;
        const id = String(payload.id);
        const attempt = await probe.insert(identity, table, payload);
        const label = `${identity.label} INSERT ${table}`;

        if (allowed[identity.label].includes(table)) {
          if (!attempt.ok) {
            failures.push(`${label}: POSITIVE PATH REFUSED ${attempt.status} (${attempt.code}) ${attempt.message}`);
          } else if (!(await rowExists(table, id))) {
            failures.push(`${label}: reported success but nothing persisted`);
          } else {
            permittedLanded += 1;
          }
          await sql(`delete from public.${table} where id = '${id}'`);
        } else if (attempt.ok) {
          failures.push(`${label}: ACCEPTED, and must not have been`);
          await sql(`delete from public.${table} where id = '${id}'`);
        } else if (await rowExists(table, id)) {
          failures.push(`${label}: refused but a row persisted anyway`);
        }
      }
    }

    record(
      "4b",
      "INSERT: permitted writes land, the rest are refused",
      failures,
      `${probes} insert probes across 4 identities x ${TABLES.length} tables; ${permittedLanded} permitted inserts landed and were removed`,
    );
    expect(failures).toEqual([]);
  });

  it("4c UPDATE: own-tenant writes land where a grant exists, foreign writes reach nothing", async () => {
    const { a, b, unaffiliated, operator } = fixture;
    const failures: string[] = [];

    // Three tables carry no UPDATE grant at all, so the refusal must come from
    // the grant rather than from a policy that merely matched no row.
    const ungranted: [TableName, string, Record<string, unknown>][] = [
      ["tenant", a.id, { name: `${SYNTHETIC_PREFIX}rewritten` }],
      ["operator", operator.authId, { revoked_at: new Date().toISOString() }],
      ["activity_event", a.activityEventId, { action: `${SYNTHETIC_PREFIX}rewritten` }],
    ];
    for (const identity of [a.owner, a.viewer, b.owner, unaffiliated]) {
      for (const [table, id, patch] of ungranted) {
        const attempt = await probe.update(identity, table, id, patch);
        if (attempt.ok && attempt.count > 0) {
          failures.push(`${identity.label} UPDATE ${table}: ACCEPTED, and no UPDATE grant exists`);
        } else if (attempt.ok) {
          failures.push(`${identity.label} UPDATE ${table}: matched zero rows silently; expected a grant refusal`);
        } else if (!refusedByGrant(attempt)) {
          failures.push(`${identity.label} UPDATE ${table}: refused as "${attempt.message}", expected a grant refusal`);
        }
      }
    }

    // member — self is writable on the two granted columns; nobody else is.
    const selfUpdate = await probe.update(a.owner, "member", a.owner.authId, {
      display_name: `${SYNTHETIC_PREFIX}renamed`,
    });
    if (!selfUpdate.ok || selfUpdate.count !== 1) {
      failures.push(`A-owner UPDATE own member row: POSITIVE PATH REFUSED (${selfUpdate.code}) ${selfUpdate.message}`);
    }
    if ((await columnValue("member", a.owner.authId, "display_name")) !== `${SYNTHETIC_PREFIX}renamed`) {
      failures.push("A-owner UPDATE own member row: reported success but the value did not change");
    }

    for (const [what, targetId] of [
      ["colleague", a.viewer.authId],
      ["tenant B", b.owner.authId],
    ] as [string, string][]) {
      const before = await columnValue("member", targetId, "display_name");
      const attempt = await probe.update(a.owner, "member", targetId, {
        display_name: `${SYNTHETIC_PREFIX}hijacked`,
      });
      if (attempt.count > 0) failures.push(`A-owner UPDATE ${what} member row: ACCEPTED`);
      if ((await columnValue("member", targetId, "display_name")) !== before) {
        failures.push(`A-owner UPDATE ${what} member row: the value changed`);
      }
    }

    // membership — an owner writes the granted columns inside their own tenant;
    // a viewer does not; nobody reaches the other tenant.
    //
    // The owner's write here is a SUSPENSION, not the `accepted_at` this proof
    // used before P01-T04. `membership_active_is_self_only` refuses any update
    // leaving an unarchived ACTIVE row belonging to someone else, so an owner
    // touching a colleague's still-active row is now refused by design (§3.3).
    // Suspend and archive are what the owner keeps, and suspend is the one that
    // reverses cleanly, so it is what the positive path exercises.
    const ownerOnOwn = await probe.update(a.owner, "membership", a.viewerMembershipId, {
      status: "suspended",
    });
    if (!ownerOnOwn.ok || ownerOnOwn.count !== 1) {
      failures.push(`A-owner UPDATE own-tenant membership: POSITIVE PATH REFUSED (${ownerOnOwn.code}) ${ownerOnOwn.message}`);
    }
    if ((await columnValue("membership", a.viewerMembershipId, "status")) !== "suspended") {
      failures.push("A-owner UPDATE own-tenant membership: reported success but the status did not change");
    }
    await sql(`update public.membership set status = 'active' where id = '${a.viewerMembershipId}'`);

    const viewerOnSelf = await probe.update(a.viewer, "membership", a.viewerMembershipId, { status: "suspended" });
    if (viewerOnSelf.count > 0) failures.push("A-viewer UPDATE own membership.status: ACCEPTED, and only an owner may");
    if ((await columnValue("membership", a.viewerMembershipId, "status")) !== "active") {
      failures.push("A-viewer UPDATE own membership.status: the value changed");
    }

    const ownerOnForeign = await probe.update(a.owner, "membership", b.viewerMembershipId, { status: "suspended" });
    if (ownerOnForeign.count > 0) failures.push("A-owner UPDATE tenant B membership: ACCEPTED");
    if ((await columnValue("membership", b.viewerMembershipId, "status")) !== "active") {
      failures.push("A-owner UPDATE tenant B membership: tenant B's row changed");
    }

    // consent_grant — revoked_at is the whole of the granted write surface.
    const revoke = await probe.update(a.owner, "consent_grant", a.consentGrantId, {
      revoked_at: new Date().toISOString(),
    });
    if (!revoke.ok || revoke.count !== 1) {
      failures.push(`A-owner UPDATE own consent_grant.revoked_at: POSITIVE PATH REFUSED (${revoke.code}) ${revoke.message}`);
    }
    await sql(`update public.consent_grant set revoked_at = null where id = '${a.consentGrantId}'`);

    const viewerRevoke = await probe.update(a.viewer, "consent_grant", a.consentGrantId, {
      revoked_at: new Date().toISOString(),
    });
    if (viewerRevoke.count > 0) failures.push("A-viewer UPDATE consent_grant: ACCEPTED, and only an owner may");

    const foreignRevoke = await probe.update(a.owner, "consent_grant", b.consentGrantId, {
      revoked_at: new Date().toISOString(),
    });
    if (foreignRevoke.count > 0) failures.push("A-owner UPDATE tenant B consent_grant: ACCEPTED");
    if ((await columnValue("consent_grant", b.consentGrantId, "revoked_at")) !== null) {
      failures.push("A-owner UPDATE tenant B consent_grant: tenant B's row changed");
    }

    record(
      "4c",
      "UPDATE: granted own writes land, foreign writes reach nothing",
      failures,
      "3 ungranted tables x 4 identities refused on the grant; member, membership and consent_grant positive paths landed; " +
        "every foreign target re-read through the privileged path and verified unchanged",
    );
    expect(failures).toEqual([]);
  });

  it("4d DELETE: no caller deletes any row on any table, own or foreign", async () => {
    const { a, b, operator, unaffiliated } = fixture;

    const targets: [TableName, string][] = [
      ["tenant", a.id],
      ["tenant", b.id],
      ["member", a.owner.authId],
      ["member", b.owner.authId],
      ["membership", a.viewerMembershipId],
      ["membership", b.viewerMembershipId],
      ["operator", operator.authId],
      ["consent_grant", a.consentGrantId],
      ["consent_grant", b.consentGrantId],
      ["activity_event", a.activityEventId],
      ["activity_event", b.activityEventId],
      ["invitation", a.invitationId],
      ["invitation", b.invitationId],
    ];

    const failures: string[] = [];
    let probes = 0;

    for (const identity of [a.owner, a.viewer, b.owner, unaffiliated]) {
      for (const [table, id] of targets) {
        probes += 1;
        const attempt = await probe.remove(identity, table, id);
        if (attempt.ok && attempt.count > 0) {
          failures.push(`${identity.label} DELETE ${table}: DELETED a row`);
        } else if (attempt.ok) {
          failures.push(`${identity.label} DELETE ${table}: matched zero rows silently; no DELETE privilege should exist`);
        } else if (!refusedByGrant(attempt)) {
          failures.push(`${identity.label} DELETE ${table}: refused as "${attempt.message}", expected a grant refusal`);
        }
        if (!(await rowExists(table, id))) failures.push(`${identity.label} DELETE ${table}: the row is gone`);
      }
    }

    record(
      "4d",
      "DELETE: refused everywhere, for every caller",
      failures,
      `${probes} delete probes — 4 identities x ${targets.length} targets spanning all ${TABLES.length} tables, own and foreign; ` +
        `every target re-read and verified still present`,
    );
    expect(failures).toEqual([]);
  });
});

// ---------------------------------------------------------------------------

describe("proof 5 — nobody raises their own role", () => {
  it("a viewer and an owner both fail on the grant, not on a policy", async () => {
    const failures: string[] = [];
    const evidence: string[] = [];

    for (const [what, identity, membershipId] of [
      ["viewer", fixture.a.viewer, fixture.a.viewerMembershipId],
      ["owner", fixture.a.owner, fixture.a.ownerMembershipId],
    ] as [string, Identity, string][]) {
      const before = await columnValue("membership", membershipId, "role");
      const attempt: Attempt = await probe.update(identity, "membership", membershipId, { role: "owner" });

      if (attempt.ok) {
        failures.push(`${what} raising own membership.role: ACCEPTED`);
      } else if (!refusedByGrant(attempt)) {
        failures.push(
          `${what} raising own membership.role: refused as "${attempt.message}" (${attempt.code}) — expected a ` +
            `GRANT refusal, so the column is structurally unwritable rather than policy-filtered`,
        );
      }
      const after = await columnValue("membership", membershipId, "role");
      if (after !== before) failures.push(`${what}: membership.role changed from ${before} to ${after}`);
      evidence.push(`${what}: ${attempt.code} "${attempt.message}", role still ${after}`);
    }

    record("5", "membership.role is unwritable, refused by the grant", failures, evidence.join(" | "));
    expect(failures).toEqual([]);
  });
});

describe("proof 6 — no row may carry another tenant's tenant_id", () => {
  it("tenant A's owner cannot insert into any tenant-scoped table with tenant B's id", async () => {
    const failures: string[] = [];
    const evidence: string[] = [];

    const payloads: Record<string, Record<string, unknown>> = {
      membership: {
        id: randomUUID(),
        tenant_id: fixture.b.id,
        member_id: fixture.unaffiliated.authId,
        role: "viewer",
        status: "invited",
      },
      consent_grant: {
        id: randomUUID(),
        tenant_id: fixture.b.id,
        granted_by: fixture.a.owner.authId,
        scope: "read_only",
        expires_at: futureIso(1),
      },
      activity_event: {
        id: randomUUID(),
        tenant_id: fixture.b.id,
        actor_member_id: fixture.a.owner.authId,
        action: `${SYNTHETIC_PREFIX}cross-tenant`,
        entity_type: "Tenant",
      },
      invitation: {
        id: randomUUID(),
        tenant_id: fixture.b.id,
        email: `${SYNTHETIC_PREFIX}cross-invite-${randomUUID().slice(0, 8)}@example.com`,
        role: "viewer",
        expires_at: futureIso(1),
      },
    };

    for (const table of TENANT_SCOPED_TABLES) {
      const payload = payloads[table];
      const id = String(payload.id);
      const attempt = await probe.insert(fixture.a.owner, table, payload);

      if (attempt.ok) {
        failures.push(`A-owner INSERT ${table} carrying tenant B's tenant_id: ACCEPTED`);
        await sql(`delete from public.${table} where id = '${id}'`);
      } else if (!refusedByPolicy(attempt)) {
        failures.push(
          `A-owner INSERT ${table} carrying tenant B's tenant_id: refused as "${attempt.message}", ` +
            `expected the row-level security WITH CHECK to be what rejected it`,
        );
      } else if (await rowExists(table, id)) {
        failures.push(`A-owner INSERT ${table} carrying tenant B's tenant_id: refused but a row persisted`);
      }
      evidence.push(`${table}: ${attempt.code || "ACCEPTED"}`);
    }

    record(
      "6",
      "Cross-tenant tenant_id on insert is refused by WITH CHECK on every tenant-scoped table",
      failures,
      `${TENANT_SCOPED_TABLES.length} tenant-scoped tables — ${evidence.join(", ")}`,
    );
    expect(failures).toEqual([]);
  });
});

describe("proof 7 — the operator surface", () => {
  it("reads the permitted metadata, reaches no member or membership row, and cannot grant itself consent", async () => {
    const failures: string[] = [];
    const observed: string[] = [];

    // §2's operator rule, as amended by P01-T04. Account metadata — `tenant`
    // and `consent_grant` — is an unconditional row read. Tenant business data
    // is not: `activity_event` lost its operator policy, so the direct table
    // read is now empty for an operator whether or not a live consent grant
    // exists, and proofs 20 and 21 cover the declared read path that replaced
    // it. Nothing gives an operator a MEMBERSHIP: current_tenant_id() is null
    // for an identity holding none, so `membership` and every tenant's `member`
    // rows stay out of reach.
    //
    // `member` is the operator's OWN row and nobody else's. P02-T05 made
    // materialisation unconditional (OD-G13), so an Operator identity that signs in
    // holds a `member` row like anyone else and `member_select_self` returns it.
    // The expectation moved from `[]` to exactly that one id: the claim is
    // unchanged — an operator reaches no TENANT's member row — and the set is
    // still exact, so it is the measurement that was refined and not the rule
    // that was relaxed. `member_select_colleague` needs a shared tenant and an
    // operator has none, which is why one row is the whole of it.
    const expectations: [TableName, string[]][] = [
      ["tenant", [fixture.a.id, fixture.b.id]],
      ["activity_event", []],
      ["consent_grant", [fixture.a.consentGrantId, fixture.b.consentGrantId]],
      ["operator", [fixture.operator.authId]],
      ["member", [fixture.operator.authId]],
      ["membership", []],
      ["invitation", []],
    ];

    for (const [table, expected] of expectations) {
      const attempt = await probe.select(fixture.operator, table);
      if (!attempt.ok) {
        failures.push(`operator SELECT ${table}: errored ${attempt.status} (${attempt.code}) ${attempt.message}`);
        continue;
      }
      if (!sameSet(attempt.ids, expected)) {
        failures.push(
          `operator SELECT ${table}: read [${sortedIds(attempt.ids).join(", ") || "none"}], expected [${sortedIds(expected).join(", ") || "none"}]`,
        );
      }
      if (expected.length > 0 && attempt.count === 0) {
        failures.push(`operator SELECT ${table}: POSITIVE PATH EMPTY — the permitted metadata read returned nothing`);
      }
      observed.push(`${table}=${attempt.count}`);
    }

    const grantId = randomUUID();
    const insert = await probe.insert(fixture.operator, "consent_grant", {
      id: grantId,
      tenant_id: fixture.a.id,
      granted_by: fixture.a.owner.authId,
      scope: "read_only",
      expires_at: futureIso(1),
    });
    if (insert.ok) {
      failures.push("operator INSERT consent_grant: ACCEPTED — an operator granted itself access");
      await sql(`delete from public.consent_grant where id = '${grantId}'`);
    } else if (await rowExists("consent_grant", grantId)) {
      failures.push("operator INSERT consent_grant: refused but a row persisted");
    }

    record(
      "7",
      "Operator reads account metadata only and cannot create a consent_grant",
      failures,
      `rows visible: ${observed.join(", ")}; consent_grant insert refused as ${insert.code} "${insert.message}"`,
    );
    expect(failures).toEqual([]);
  });
});

describe("proof 8 — the generated types match the live schema", () => {
  it(
    "regenerating from the live project reproduces types/database.ts",
    async () => {
      const failures: string[] = [];
      const committed = readFileSync(resolve(process.cwd(), "types/database.ts"), "utf8").replace(/\r\n/g, "\n");

      const npx = process.platform === "win32" ? "npx.cmd" : "npx";
      const generation = spawnSync(
        npx,
        ["--yes", "supabase@2.111.0", "gen", "types", "typescript", "--project-id", config.projectRef],
        {
          encoding: "utf8",
          shell: process.platform === "win32",
          maxBuffer: 64 * 1024 * 1024,
          env: process.env,
        },
      );

      let regenerated = "";
      if (generation.status !== 0) {
        failures.push(`supabase gen types exited ${generation.status}: ${(generation.stderr || "").slice(0, 400)}`);
      } else {
        regenerated = generation.stdout.replace(/\r\n/g, "\n");
        if (regenerated.trimEnd() !== committed.trimEnd()) {
          failures.push(
            `types/database.ts differs from the live schema: committed ${committed.length} chars, regenerated ${regenerated.length} chars`,
          );
        }
      }

      // The same claim from the other direction, straight off the catalog, so a
      // CLI that silently emitted nothing cannot read as agreement.
      const columns = await sql<{ table_name: string; column_name: string }>(
        `select table_name, column_name
           from information_schema.columns
          where table_schema = 'public'
          order by 1, 2`,
      );
      for (const column of columns) {
        if (!new RegExp(`^\\s+${column.column_name}\\??: `, "m").test(committed)) {
          failures.push(`live column ${column.table_name}.${column.column_name} is absent from types/database.ts`);
        }
      }

      record(
        "8",
        "types/database.ts matches the live schema",
        failures,
        `supabase gen types exit ${generation.status}, ${regenerated.length} chars regenerated vs ${committed.length} committed; ` +
          `${columns.length} live columns each found declared`,
      );
      expect(failures).toEqual([]);
    },
    420_000,
  );
});

// ---------------------------------------------------------------------------
// Additional probes — because a gate that only runs its checklist is a checklist.
// ---------------------------------------------------------------------------

describe("proof 9 — activity_event is immutable", () => {
  it("its own tenant's owner can neither update nor delete an event", async () => {
    const failures: string[] = [];
    const id = fixture.a.activityEventId;
    const before = await columnValue("activity_event", id, "action");

    const update = await probe.update(fixture.a.owner, "activity_event", id, {
      action: `${SYNTHETIC_PREFIX}tampered`,
    });
    if (update.ok && update.count > 0) failures.push("A-owner UPDATE own activity_event: ACCEPTED");
    else if (!refusedByGrant(update)) failures.push(`A-owner UPDATE own activity_event: "${update.message}", expected a grant refusal`);

    const remove = await probe.remove(fixture.a.owner, "activity_event", id);
    if (remove.ok && remove.count > 0) failures.push("A-owner DELETE own activity_event: DELETED");
    else if (!refusedByGrant(remove)) failures.push(`A-owner DELETE own activity_event: "${remove.message}", expected a grant refusal`);

    if (!(await rowExists("activity_event", id))) failures.push("the activity_event row is gone");
    if ((await columnValue("activity_event", id, "action")) !== before) failures.push("activity_event.action changed");

    record(
      "9",
      "activity_event carries no UPDATE and no DELETE path",
      failures,
      `update: ${update.code} "${update.message}" | delete: ${remove.code} "${remove.message}" | row intact, action unchanged`,
    );
    expect(failures).toEqual([]);
  });
});

describe("proof 10 — nobody becomes an operator", () => {
  it("every seeded identity is refused an INSERT into operator", async () => {
    const failures: string[] = [];
    const codes: string[] = [];

    for (const identity of fixture.everyIdentity) {
      const id = randomUUID();
      const attempt = await probe.insert(identity, "operator", { id, granted_at: new Date().toISOString() });
      if (attempt.ok) {
        failures.push(`${identity.label} INSERT operator: ACCEPTED`);
        await sql(`delete from public.operator where id = '${id}'`);
      } else if (await rowExists("operator", id)) {
        failures.push(`${identity.label} INSERT operator: refused but a row persisted`);
      }
      codes.push(`${identity.label}=${attempt.code}`);
    }

    record(
      "10",
      "No identity can insert into operator",
      failures,
      `${fixture.everyIdentity.length} identities, all refused: ${codes.join(", ")}`,
    );
    expect(failures).toEqual([]);
  });
});

describe("proof 11 — a consent grant is never extended", () => {
  it("an owner cannot move expires_at, because the column is outside the grant", async () => {
    const failures: string[] = [];
    const id = fixture.a.consentGrantId;
    const before = await columnValue("consent_grant", id, "expires_at");

    const attempt = await probe.update(fixture.a.owner, "consent_grant", id, { expires_at: futureIso(365) });
    if (attempt.ok && attempt.count > 0) failures.push("A-owner UPDATE consent_grant.expires_at: ACCEPTED");
    else if (!refusedByGrant(attempt)) {
      failures.push(`A-owner UPDATE consent_grant.expires_at: "${attempt.message}", expected a grant refusal`);
    }
    const after = await columnValue("consent_grant", id, "expires_at");
    if (after !== before) failures.push(`consent_grant.expires_at moved from ${before} to ${after}`);

    record(
      "11",
      "consent_grant.expires_at is outside the column grant",
      failures,
      `${attempt.code} "${attempt.message}"; expires_at unchanged`,
    );
    expect(failures).toEqual([]);
  });
});

describe("proof 12 — a tenant cannot be left without an owner", () => {
  it("deleting tenant A's last active owner is refused by the constraint trigger", async () => {
    const failures: string[] = [];
    const id = fixture.a.ownerMembershipId;

    // Attempted as `postgres` on purpose: `authenticated` holds no DELETE
    // privilege at all, so an ordinary caller never reaches the trigger and
    // would prove nothing about it. This is the trigger under test, not RLS.
    const outcome = await sql.try(`delete from public.membership where id = '${id}'`);

    if (outcome.ok) failures.push("privileged DELETE of tenant A's last active owner: ACCEPTED");
    if (!/no active owner/i.test(outcome.body)) {
      failures.push(`refused as ${outcome.status} "${outcome.body.slice(0, 200)}", expected the active-owner constraint trigger`);
    }
    if (!(await rowExists("membership", id))) failures.push("tenant A's owner membership row is gone");

    const [owners] = await sql<{ n: number }>(
      `select count(*)::int as n from public.membership
        where tenant_id = '${fixture.a.id}' and role = 'owner' and status = 'active' and archived_at is null`,
    );
    if (owners.n !== 1) failures.push(`tenant A holds ${owners.n} active owners, expected 1`);

    record(
      "12",
      "The active-owner constraint trigger refuses the last owner's deletion",
      failures,
      `HTTP ${outcome.status}; tenant A still holds ${owners.n} active owner`,
    );
    expect(failures).toEqual([]);
  });
});

describe("proof 13 — anon reads nothing", () => {
  it("an unauthenticated caller returns zero rows on every table", async () => {
    const failures: string[] = [];
    const observed: string[] = [];
    const anon = anonCaller(config);

    for (const table of TABLES) {
      const attempt = await probe.select(anon, table);
      if (attempt.count > 0) {
        failures.push(`anon SELECT ${table}: returned ${attempt.count} rows [${attempt.ids.join(", ")}]`);
      }
      observed.push(`${table}=${attempt.ok ? `${attempt.count} rows` : `${attempt.status}/${attempt.code}`}`);
    }

    record("13", "anon reads zero rows on every table", failures, `${TABLES.length} tables — ${observed.join(", ")}`);
    expect(failures).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Probes 14 to 17 are this task's own additions, beyond the thirteen it was
// commissioned to run. Each one attacks a surface the commissioned set leaves
// untouched: a bypass that needs no policy at all, a role attribute that would
// make every policy decoration, the existence oracle SECURITY_MODEL.md §3 P2
// names but §5's checklist does not, and the one place where a tenant's own
// action reaches across the boundary.
// ---------------------------------------------------------------------------

describe("proof 14 — nothing in public bypasses RLS by construction", () => {
  it("public holds only ordinary tables and no view, materialised view or foreign table", async () => {
    const rows = await sql<{ relname: string; relkind: string; owner: string }>(
      `select c.relname, c.relkind::text as relkind, pg_get_userbyid(c.relowner) as owner
         from pg_class c
         join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relkind in ('r', 'v', 'm', 'f', 'p')
        order by 1`,
    );

    const failures: string[] = [];
    for (const row of rows) {
      if (row.relkind !== "r") {
        // A view runs as its owner unless it is security_invoker, so one over
        // these tables would read every tenant's rows for every caller.
        failures.push(`${row.relname}: relkind '${row.relkind}' in public — not an ordinary RLS-bearing table`);
      }
    }
    if (!sameSet(rows.map((r) => r.relname), [...TABLES])) {
      failures.push(`public holds [${rows.map((r) => r.relname).join(", ")}], expected exactly the ${TABLES.length} tables`);
    }

    record(
      "14",
      "No view or other non-table relation exists in public",
      failures,
      `${rows.length} relations, all relkind 'r', owned by ${[...new Set(rows.map((r) => r.owner))].join("/")}`,
    );
    expect(failures).toEqual([]);
  });
});

describe("proof 15 — the roles and the function surface", () => {
  it("anon and authenticated cannot bypass RLS, and every public function is a pinned security-definer helper", async () => {
    const failures: string[] = [];

    const roles = await sql<{ rolname: string; rolsuper: boolean; rolbypassrls: boolean }>(
      `select rolname, rolsuper, rolbypassrls
         from pg_roles
        where rolname in ('anon', 'authenticated', 'authenticator')
        order by 1`,
    );
    for (const role of roles) {
      // If either attribute were ever true, every policy in this schema would
      // be decoration and all twelve other proofs would pass while proving
      // nothing.
      if (role.rolsuper) failures.push(`${role.rolname}: rolsuper is true`);
      if (role.rolbypassrls) failures.push(`${role.rolname}: rolbypassrls is true — RLS would not apply to it`);
    }
    if (roles.length !== 3) failures.push(`expected the three PostgREST roles, found [${roles.map((r) => r.rolname).join(", ")}]`);

    const functions = await sql<{
      proname: string;
      prosecdef: boolean;
      config: string;
      returns: string;
    }>(
      `select p.proname,
              p.prosecdef,
              coalesce(array_to_string(p.proconfig, ','), '') as config,
              p.prorettype::regtype::text as returns
         from pg_proc p
         join pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'public'
        order by 1`,
    );
    const expectedFunctions = [
      "current_tenant_id",
      "enforce_tenant_active_owner",
      "has_live_consent_grant",
      "is_current_tenant_owner",
      "is_operator",
      // P02-T05, OD-G13's two acts. Both are security definer with a pinned
      // search_path like every other function here, which is what this proof
      // asserts of the whole surface rather than of a list it knows.
      "materialise_member",
      "operator_read_activity_event",
      "provision_tenant",
      "caller_email_is_verified",
      "accept_invitation",
    ];
    if (!sameSet(functions.map((f) => f.proname), expectedFunctions)) {
      failures.push(`public functions are [${functions.map((f) => f.proname).join(", ")}], expected [${expectedFunctions.join(", ")}]`);
    }
    for (const fn of functions) {
      if (!fn.prosecdef) failures.push(`${fn.proname}: not security definer`);
      // An unpinned search_path on a security definer function is the classic
      // privilege-escalation route: the caller chooses which table it reads.
      if (!/search_path=/.test(fn.config)) failures.push(`${fn.proname}: no pinned search_path (proconfig = "${fn.config}")`);
    }

    // The helpers are callable over RPC by anyone. They must answer only for
    // the caller, and must answer nothing at all for an unauthenticated one.
    const rpcChecks: [string, string, string][] = [
      ["anon", "current_tenant_id", "null"],
      ["anon", "is_operator", "false"],
      ["anon", "is_current_tenant_owner", "false"],
      ["A-owner", "current_tenant_id", `"${fixture.a.id}"`],
      ["A-owner", "is_operator", "false"],
      ["A-owner", "is_current_tenant_owner", "true"],
      ["A-viewer", "current_tenant_id", `"${fixture.a.id}"`],
      ["A-viewer", "is_current_tenant_owner", "false"],
      ["B-owner", "current_tenant_id", `"${fixture.b.id}"`],
      ["unaffiliated", "current_tenant_id", "null"],
      ["operator", "current_tenant_id", "null"],
      ["operator", "is_operator", "true"],
    ];
    const callers: Record<string, ReturnType<typeof anonCaller>> = {
      anon: anonCaller(config),
      "A-owner": fixture.a.owner,
      "A-viewer": fixture.a.viewer,
      "B-owner": fixture.b.owner,
      unaffiliated: fixture.unaffiliated,
      operator: fixture.operator,
    };
    const rpcObserved: string[] = [];
    for (const [who, fn, expected] of rpcChecks) {
      const result = await probe.rpc(callers[who], fn);
      // An unauthenticated refusal is at least as strong as a null answer.
      const acceptable = result.body === expected || (who === "anon" && result.status >= 400);
      if (!acceptable) failures.push(`${who} rpc/${fn}: returned ${result.status} ${result.body}, expected ${expected}`);
      rpcObserved.push(`${who}.${fn}=${result.status >= 400 ? result.status : result.body}`);
    }

    record(
      "15",
      "No RLS-bypassing role attribute; helpers answer only for their caller",
      failures,
      `${roles.length} roles with rolsuper/rolbypassrls false; ${functions.length} public functions, all security definer with a pinned search_path; ` +
        `${rpcChecks.length} RPC answers: ${rpcObserved.join(", ")}`,
    );
    expect(failures).toEqual([]);
  });
});

describe("proof 16 — a foreign id is indistinguishable from a nonexistent one", () => {
  it("SECURITY_MODEL §3 P2: the same status and the same empty body, on every table", async () => {
    const failures: string[] = [];
    const observed: string[] = [];

    const foreignIds: [TableName, string][] = [
      ["tenant", fixture.b.id],
      ["member", fixture.b.owner.authId],
      ["membership", fixture.b.ownerMembershipId],
      ["operator", fixture.operator.authId],
      ["consent_grant", fixture.b.consentGrantId],
      ["activity_event", fixture.b.activityEventId],
      ["invitation", fixture.b.invitationId],
    ];

    for (const [table, foreignId] of foreignIds) {
      const foreign = await probe.selectById(fixture.a.owner, table, foreignId);
      const absent = await probe.selectById(fixture.a.owner, table, randomUUID());

      if (foreign.status !== absent.status) {
        failures.push(`${table}: foreign id answered ${foreign.status}, nonexistent id answered ${absent.status}`);
      }
      if (foreign.count !== 0) failures.push(`${table}: a foreign id returned ${foreign.count} rows`);
      if (absent.count !== 0) failures.push(`${table}: a nonexistent id returned ${absent.count} rows`);
      observed.push(`${table}=${foreign.status}/${foreign.count}`);
    }

    record(
      "16",
      "Foreign and nonexistent ids answer identically",
      failures,
      `${foreignIds.length} paired probes as tenant A's owner — ${observed.join(", ")}`,
    );
    expect(failures).toEqual([]);
  });
});

describe("proof 17 — a second active membership fails closed", () => {
  it("a doubly-membered identity resolves to no tenant, and recovers when the second is removed", async () => {
    const failures: string[] = [];
    const victim = fixture.b.viewer;

    const resolvesTo = async (): Promise<string | null> => {
      const answer = await probe.rpc(victim, "current_tenant_id");
      try {
        return JSON.parse(answer.body === "" ? "null" : answer.body) as string | null;
      } catch {
        return answer.body;
      }
    };

    // The lockout is measured as what the victim loses sight of, not as a count
    // reaching zero. membership_select_own means they keep seeing their own two
    // rows throughout — a person is always entitled to know which tenants claim
    // them — so a count would read 2 before and 2 during and prove nothing. What
    // goes away is everyone else: their colleague's row, their tenant, and the
    // tenant their session resolves to.
    const before = await probe.select(victim, "membership");
    const beforeRows = await probe.selectColumns(victim, "membership", "id,member_id");
    const colleague = beforeRows.rows.find((row) => row.member_id !== victim.authId);
    if (before.count === 0) failures.push("precondition: tenant B's viewer could not read tenant B's memberships");
    if (colleague === undefined) failures.push("precondition: the victim could not see a colleague's membership row");
    if ((await resolvesTo()) !== fixture.b.id) {
      failures.push("precondition: the victim does not resolve to their own tenant");
    }

    // The second active membership is now seeded through the PRIVILEGED path,
    // because P01-T04 removed the API path that used to create it — that
    // removal is CF-103's exploit and proof 19 is where it is asserted. What
    // this proof still has to say is about the helper rather than the policy,
    // and P02-T04 changed why it matters rather than what it measures: with NO
    // selector supplied, two active memberships still resolve to nothing, which
    // is §2.1's third row. It is no longer a lockout, because the member now
    // has a selector and 23k proves selecting costs them nothing — but the
    // ambiguous path must keep denying, and this is the assertion that says so.
    // Not one probe here was relaxed to accommodate the new behaviour.
    const probeMembershipId = randomUUID();
    await sql(`
      insert into public.membership (id, tenant_id, member_id, role, status)
      values ('${probeMembershipId}', '${fixture.a.id}', '${victim.authId}', 'viewer', 'active')
    `);

    const during = await probe.selectColumns(victim, "membership", "id,member_id,tenant_id");
    const strangers = during.rows.filter((row) => row.member_id !== victim.authId);
    if (strangers.length !== 0) {
      failures.push(
        `the doubly-membered identity still reads ${strangers.length} row(s) belonging to another member; ` +
          `the helper did not fail closed`,
      );
    }
    const duringTenant = await probe.select(victim, "tenant");
    if (duringTenant.count !== 0) {
      failures.push(`the doubly-membered identity read ${duringTenant.count} tenant rows; the helper did not fail closed`);
    }
    const duringResolves = await resolvesTo();
    if (duringResolves !== null) {
      failures.push(`the doubly-membered identity resolves to ${duringResolves}, expected null`);
    }
    await sql(`delete from public.membership where id = '${probeMembershipId}'`);

    // After: access is restored, which is what makes the middle state a lockout
    // rather than a corruption.
    const after = await probe.select(victim, "membership");
    if (after.count !== before.count) {
      failures.push(`after cleanup the victim reads ${after.count} membership rows, expected the original ${before.count}`);
    }
    const afterResolves = await resolvesTo();
    if (afterResolves !== fixture.b.id) {
      failures.push(`after cleanup the victim resolves to ${afterResolves}, expected their own tenant again`);
    }

    record(
      "17",
      "A second active membership, with no selector, denies both tenants",
      failures,
      `seeded privileged, since no API path creates one any more: with no selector supplied the victim resolved ` +
        `to their own tenant, then to null while doubly-membered, then to their own tenant again; in the middle ` +
        `state they read 0 tenant rows and 0 rows belonging to any other member, keeping sight only of their own ` +
        `${during.count}, and their ${before.count} membership rows returned after removal. Unchanged by P02-T04 ` +
        `and deliberately so — this is §2.1's third row, ambiguity denied rather than guessed. What changed is ` +
        `that it is no longer a lockout: 23k takes the same middle state, supplies a selector, and reads ` +
        `everything back`,
    );
    expect(failures).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Proofs 18 to 22 are P01-T04's, one group per finding the P01-T03 gate raised.
// Each closes with the same question: is the thing that was possible still
// possible? A fix asserted only by its own author's reading of the migration is
// a fix nobody has tested.
// ---------------------------------------------------------------------------

/** Refused, whether the refusal arrived as an error or as a zero-row match. */
function wasRefused(attempt: Attempt): boolean {
  return !attempt.ok || attempt.count === 0;
}

describe("proof 18 — invite, then accept (CF-103, DATA_MODEL §3.3)", () => {
  it("18a an owner cannot insert an active membership for anyone", async () => {
    const { a, b, unaffiliated } = fixture;
    const failures: string[] = [];
    const observed: string[] = [];

    // A stranger to every tenant, a member of another tenant, and the owner
    // themselves. §3.3 refuses all three: the rule is about `status`, not about
    // who is named, which is what stops it being defeated by a new victim.
    const targets: [string, string][] = [
      ["a stranger", unaffiliated.authId],
      ["tenant B's viewer", b.viewer.authId],
      ["the owner themselves", a.owner.authId],
    ];

    for (const [what, memberId] of targets) {
      for (const status of ["active", "suspended"]) {
        const id = randomUUID();
        const attempt = await probe.insert(a.owner, "membership", {
          id,
          tenant_id: a.id,
          member_id: memberId,
          role: "viewer",
          status,
        });
        if (attempt.ok) {
          failures.push(`A-owner INSERT ${status} membership for ${what}: ACCEPTED`);
          await sql(`delete from public.membership where id = '${id}'`);
        } else if (!refusedByPolicy(attempt)) {
          failures.push(
            `A-owner INSERT ${status} membership for ${what}: refused as "${attempt.message}", ` +
              `expected the WITH CHECK on membership_insert_owner`,
          );
        } else if (await rowExists("membership", id)) {
          failures.push(`A-owner INSERT ${status} membership for ${what}: refused but a row persisted`);
        }
        observed.push(`${what}/${status}=${attempt.code || "ACCEPTED"}`);
      }
    }

    record(
      "18a",
      "An owner cannot insert a membership that is not an invitation",
      failures,
      `${targets.length * 2} probes — ${observed.join(", ")}`,
    );
    expect(failures).toEqual([]);
  });

  it("18b an owner inserting an invited membership for a stranger succeeds", async () => {
    const { a, unaffiliated } = fixture;
    const failures: string[] = [];

    const id = randomUUID();
    const attempt = await probe.insert(a.owner, "membership", {
      id,
      tenant_id: a.id,
      member_id: unaffiliated.authId,
      role: "viewer",
      status: "invited",
      invited_by: a.owner.authId,
    });

    if (!attempt.ok) {
      failures.push(`A-owner INSERT invited membership: POSITIVE PATH REFUSED (${attempt.code}) ${attempt.message}`);
    } else if (!(await rowExists("membership", id))) {
      failures.push("A-owner INSERT invited membership: reported success but nothing persisted");
    } else if ((await columnValue("membership", id, "status")) !== "invited") {
      failures.push("A-owner INSERT invited membership: landed with a status other than invited");
    }
    await sql(`delete from public.membership where id = '${id}'`);

    record(
      "18b",
      "An owner CAN invite a stranger — the positive path of the same rule",
      failures,
      `HTTP ${attempt.status}, row persisted as status=invited and removed; ` +
        `an owner who cannot invite has not been constrained, they have been broken`,
    );
    expect(failures).toEqual([]);
  });

  it("18c only the invitee moves their own row from invited to active", async () => {
    const { a, unaffiliated } = fixture;
    const failures: string[] = [];
    const evidence: string[] = [];

    const inviteId = randomUUID();
    await sql(`
      insert into public.membership (id, tenant_id, member_id, role, status, invited_by)
      values ('${inviteId}', '${a.id}', '${unaffiliated.authId}', 'viewer', 'invited', '${a.owner.authId}')
    `);

    // Everyone who is not the invitee, first. The owner is the one that matters:
    // A1 alone would have left the exploit one UPDATE away.
    for (const [what, identity] of [
      ["the inviting owner", a.owner],
      ["a colleague", a.viewer],
    ] as [string, Identity][]) {
      const attempt = await probe.update(identity, "membership", inviteId, { status: "active" });
      if (!wasRefused(attempt)) failures.push(`${what} moving someone else's invitation to active: ACCEPTED`);
      const after = await columnValue("membership", inviteId, "status");
      if (after !== "invited") failures.push(`${what}: the invitation is now ${after}`);
      evidence.push(`${what}=${attempt.ok ? `${attempt.count} rows` : attempt.code}`);
    }

    // The invitee must be able to see the invitation, and to still see the row
    // after accepting it. PostgreSQL applies the SELECT policies to an UPDATE
    // twice — to the old row, because `UPDATE ... WHERE` reads existing values,
    // and to the new row, so that no UPDATE pushes a row out of the caller's
    // own visibility. That is what membership_select_own is for, and it is why
    // an `invited`-only version of it refused the very transition it existed to
    // permit. Scope is asserted in the same breath: their own row, and none of
    // the inviting tenant's other two.
    const visible = await probe.selectColumns(unaffiliated, "membership", "id,tenant_id,status");
    if (visible.count !== 1 || visible.ids[0] !== inviteId) {
      failures.push(
        `the invitee sees ${visible.count} membership row(s) [${visible.ids.join(", ")}], expected their invitation alone`,
      );
    }

    // Both Prefer forms are tried and the one that worked is reported. Which it
    // is matters to the Phase 02 client: a representation comes back only if the
    // accepted row is still visible to its owner, so this doubles as the reading
    // of that rule from the client's side.
    const withRepresentation = await probe.update(unaffiliated, "membership", inviteId, {
      status: "active",
      accepted_at: new Date().toISOString(),
    });
    let form = "return=representation";
    if (!withRepresentation.ok || withRepresentation.count === 0) {
      form = "return=minimal";
      const minimal = await probe.updateMinimal(unaffiliated, "membership", inviteId, {
        status: "active",
        accepted_at: new Date().toISOString(),
      });
      if (!minimal.ok) {
        failures.push(`the invitee accepting: REFUSED under both prefer forms (${minimal.code}) ${minimal.message}`);
      }
    }

    const accepted = await columnValue("membership", inviteId, "status");
    if (accepted !== "active") failures.push(`the invitee accepting: the row is ${accepted}, expected active`);
    const acceptedAt = await columnValue("membership", inviteId, "accepted_at");
    if (acceptedAt === null) failures.push("the invitee accepting: accepted_at was not written");

    await sql(`delete from public.membership where id = '${inviteId}'`);

    record(
      "18c",
      "Only the invitee moves their own invitation to active",
      failures,
      `the invitee sees ${visible.count} membership row, their own invitation; ` +
        `owner and colleague refused (${evidence.join(", ")}); the invitee's own move landed under ${form}, ` +
        `row read back as ${accepted}, accepted_at ${acceptedAt === null ? "absent" : "written"}`,
    );
    expect(failures).toEqual([]);
  });

  it("18d the invitee cannot move their row to any other status", async () => {
    const { a, unaffiliated } = fixture;
    const failures: string[] = [];
    const observed: string[] = [];

    const inviteId = randomUUID();
    await sql(`
      insert into public.membership (id, tenant_id, member_id, role, status)
      values ('${inviteId}', '${a.id}', '${unaffiliated.authId}', 'viewer', 'invited')
    `);

    // active is the only value WITH CHECK admits, so suspended is refused and
    // so is standing still: there is one transition, not a write surface. The
    // invitee can see this row — 18c asserts that — so every refusal below is
    // the policy declining a transition, not the invitee failing to find it.
    for (const status of ["suspended", "invited"]) {
      const attempt = await probe.updateMinimal(unaffiliated, "membership", inviteId, { status });
      if (!wasRefused(attempt)) failures.push(`the invitee setting status=${status}: ACCEPTED`);
      const after = await columnValue("membership", inviteId, "status");
      if (after !== "invited") failures.push(`the invitee setting status=${status}: the row is now ${after}`);
      observed.push(`${status}=${attempt.ok ? `${attempt.count} rows` : attempt.code}`);
    }

    // Nor may they lift themselves out of the role they were invited into:
    // `role` is absent from the UPDATE grant, so the refusal is structural.
    const escalate = await probe.updateMinimal(unaffiliated, "membership", inviteId, { role: "owner" });
    if (!escalate.ok && !refusedByGrant(escalate)) {
      failures.push(`the invitee raising role while accepting: refused as "${escalate.message}", expected a grant refusal`);
    } else if (escalate.ok) {
      failures.push("the invitee raising role while accepting: ACCEPTED");
    }
    if ((await columnValue("membership", inviteId, "role")) !== "viewer") {
      failures.push("the invitee raising role while accepting: the role changed");
    }

    await sql(`delete from public.membership where id = '${inviteId}'`);

    record(
      "18d",
      "invited -> active is the invitee's only transition",
      failures,
      `${observed.join(", ")}; role escalation refused as ${escalate.code} "${escalate.message}"`,
    );
    expect(failures).toEqual([]);
  });

  it("18e the privileged provisioning path still works, and is still the only one", async () => {
    const { a, b, unaffiliated } = fixture;
    const failures: string[] = [];

    // It works: this run's own two tenants were provisioned that way minutes
    // ago, each with an active owner the new policies would refuse to create.
    const [owners] = await sql<{ a_owners: number; b_owners: number }>(
      `select
         (select count(*)::int from public.membership
           where tenant_id = '${a.id}' and role = 'owner' and status = 'active' and archived_at is null) as a_owners,
         (select count(*)::int from public.membership
           where tenant_id = '${b.id}' and role = 'owner' and status = 'active' and archived_at is null) as b_owners`,
    );
    if (owners.a_owners !== 1) failures.push(`tenant A holds ${owners.a_owners} active owners, expected 1`);
    if (owners.b_owners !== 1) failures.push(`tenant B holds ${owners.b_owners} active owners, expected 1`);

    // And it is unaffected by §3.3's new rule: the privileged path bypasses RLS,
    // so it still writes an active membership directly. If this ever fails, a
    // tenant can no longer be created at all.
    const privilegedId = randomUUID();
    const provisioned = await sql.try(`
      insert into public.membership (id, tenant_id, member_id, role, status)
      values ('${privilegedId}', '${a.id}', '${unaffiliated.authId}', 'manager', 'active')
    `);
    if (!provisioned.ok) {
      failures.push(`privileged INSERT of an active membership: REFUSED ${provisioned.status} ${provisioned.body.slice(0, 200)}`);
    } else if (!(await rowExists("membership", privilegedId))) {
      failures.push("privileged INSERT of an active membership: reported success but nothing persisted");
    }
    await sql(`delete from public.membership where id = '${privilegedId}'`);

    // And it is the only one: no caller reaches `tenant` at all, so no caller
    // can reach the state in which they would be its first owner.
    const tenantProbes: string[] = [];
    for (const identity of fixture.everyIdentity) {
      const id = randomUUID();
      const attempt = await probe.insert(identity, "tenant", {
        id,
        name: `${SYNTHETIC_PREFIX}provision`,
        slug: `${SYNTHETIC_PREFIX}provision-${randomUUID().slice(0, 8)}`,
        base_currency: "SAR",
        default_locale: "en",
        status: "active",
      });
      if (attempt.ok) {
        failures.push(`${identity.label} INSERT tenant: ACCEPTED — provisioning is reachable from the API`);
        await sql(`delete from public.tenant where id = '${id}'`);
      }
      tenantProbes.push(`${identity.label}=${attempt.code}`);
    }

    record(
      "18e",
      "Provisioning is privileged, still works, and is still the only path to a first owner",
      failures,
      `both fixture tenants provisioned with exactly 1 active owner; privileged active INSERT accepted ` +
        `(HTTP ${provisioned.status}) and removed; tenant INSERT refused for all ` +
        `${fixture.everyIdentity.length} identities: ${tenantProbes.join(", ")}`,
    );
    expect(failures).toEqual([]);
  });
});

describe("proof 19 — the CF-103 exploit, re-run as a regression", () => {
  it("a victim keeps their own tenant whatever another tenant's owner creates", async () => {
    const { a, b } = fixture;
    const failures: string[] = [];
    const attacker = a.owner;
    const victim = b.viewer;

    /**
     * What SECURITY_MODEL.md §1's fourth guarantee means, measured two ways:
     * the tenant the victim resolves to, and the rows they read inside it.
     *
     * Rows belonging to another tenant are counted apart from both.
     * membership_select_own_invitation makes an invitation addressed to the
     * victim visible to the victim, so the attacker can put a row into their
     * result set — and must be able to, or nobody could ever be invited to a
     * second tenant. Being offered something is not losing something. The
     * guarantee is about what the victim keeps, so the assertion is about what
     * the victim keeps, and the offer is asserted separately to be an offer:
     * `invited`, never active.
     */
    type State = {
      own: Record<string, number>;
      foreign: Record<string, unknown>[];
      tenantId: string | null;
    };

    const readState = async (): Promise<State> => {
      const own: Record<string, number> = {};
      for (const table of TABLES) own[table] = (await probe.select(victim, table)).count;

      const seen = await probe.selectColumns(victim, "membership", "id,tenant_id,status");
      const foreign = seen.rows.filter((row) => row.tenant_id !== b.id);
      own.membership -= foreign.length;

      const resolved = await probe.rpc(victim, "current_tenant_id");
      let tenantId: string | null = null;
      try {
        tenantId = JSON.parse(resolved.body === "" ? "null" : resolved.body) as string | null;
      } catch {
        tenantId = resolved.body;
      }

      return { own, foreign, tenantId };
    };

    const before = await readState();
    if (before.own.membership === 0 || before.own.tenant === 0) {
      failures.push(
        `precondition: the victim reads ${before.own.tenant} tenant and ${before.own.membership} membership rows`,
      );
    }
    if (before.foreign.length !== 0) {
      failures.push(`precondition: the victim already sees ${before.foreign.length} foreign membership row(s)`);
    }
    if (before.tenantId !== b.id) {
      failures.push(`precondition: the victim resolves to ${before.tenantId}, expected their own tenant`);
    }

    const compare = (when: string, now: State): void => {
      for (const table of TABLES) {
        if (now.own[table] !== before.own[table]) {
          failures.push(
            `${when}: the victim reads ${now.own[table]} of their own ${table} rows, ` +
              `was ${before.own[table]} — LOCKOUT`,
          );
        }
      }
      if (now.tenantId !== before.tenantId) {
        failures.push(`${when}: the victim now resolves to ${now.tenantId}, was ${before.tenantId} — LOCKOUT`);
      }
      const notAnOffer = now.foreign.filter((row) => row.status !== "invited");
      if (notAnOffer.length > 0) {
        failures.push(
          `${when}: the victim carries ${notAnOffer.length} foreign membership row(s) that are not invitations`,
        );
      }
    };

    const created: string[] = [];
    const attempts: string[] = [];

    // Every membership shape tenant A's owner can reach, naming the victim. The
    // one that is ACCEPTED is the invitation, and the point of the proof is
    // that an accepted invitation moves nothing the victim holds.
    for (const status of ["active", "suspended", "invited"]) {
      const id = randomUUID();
      const attempt = await probe.insert(attacker, "membership", {
        id,
        tenant_id: a.id,
        member_id: victim.authId,
        role: "viewer",
        status,
      });
      if (attempt.ok) created.push(id);
      attempts.push(`insert ${status}=${attempt.ok ? "accepted" : attempt.code}`);

      compare(`after A-owner inserted a ${status} membership naming the victim`, await readState());
    }

    // And the second move: take the invitation the rule permits and try to
    // finish the job with an UPDATE.
    for (const id of created) {
      for (const [what, identity] of [
        ["A-owner", attacker],
        ["A-viewer", a.viewer],
      ] as [string, Identity][]) {
        const attempt = await probe.update(identity, "membership", id, { status: "active" });
        if (!wasRefused(attempt)) failures.push(`${what} UPDATE the invitation to active: ACCEPTED`);
        attempts.push(`${what} update->active=${attempt.ok ? `${attempt.count} rows` : attempt.code}`);
      }
      compare("after the UPDATE attempts", await readState());
    }

    // The invitation the attacker was permitted to create is the one thing the
    // victim can now see of tenant A. It buys the attacker nothing: it is not
    // active, it does not change what the victim resolves to, and the victim
    // declines it by doing nothing at all.
    const offered = (await readState()).foreign;
    if (created.length > 0 && offered.length !== created.length) {
      failures.push(`the victim sees ${offered.length} of the ${created.length} row(s) addressed to them`);
    }

    for (const id of created) await sql(`delete from public.membership where id = '${id}'`);

    const after = await readState();
    compare("after cleanup", after);
    if (after.foreign.length !== 0) {
      failures.push(`after cleanup the victim still sees ${after.foreign.length} foreign membership row(s)`);
    }

    record(
      "19",
      "SECURITY_MODEL §1 availability: no tenant can lock another tenant's member out",
      failures,
      `the victim resolved to their own tenant throughout and read the same own-tenant rows before, ` +
        `during and after (${Object.entries(before.own).map(([t, n]) => `${t}=${n}`).join(", ")}); ` +
        `attacker attempts: ${attempts.join(", ")}; ${created.length} row(s) the rule permits, ` +
        `${offered.length} of them visible to the victim as an invitation, none of them active`,
    );
    expect(failures).toEqual([]);
  });
});

describe("proof 20 — operator reach is behind a live consent grant (CF-104, OD-G10)", () => {
  it("20a a business-row read with no live grant is refused, and logs nothing", async () => {
    const { a, b, operator } = fixture;
    const failures: string[] = [];
    const observed: string[] = [];

    const eventsFor = async (tenantId: string): Promise<number> => {
      const [row] = await sql<{ n: number }>(
        `select count(*)::int as n from public.activity_event where tenant_id = '${tenantId}'`,
      );
      return row.n;
    };

    const before = await eventsFor(b.id);

    // Both ways a grant stops being live. §3.5 evaluates them at read time, so
    // both are tested against the live policy rather than against the column.
    const lapses: [string, string, string][] = [
      ["revoked", `revoked_at = now()`, `revoked_at = null`],
      ["expired", `expires_at = now() - interval '1 hour'`, `expires_at = now() + interval '1 day'`],
    ];

    for (const [what, lapse, restore] of lapses) {
      await sql(`update public.consent_grant set ${lapse} where id = '${b.consentGrantId}'`);
      const attempt = await probe.rpc(operator, "operator_read_activity_event", { p_tenant_id: b.id });
      if (attempt.status < 400) {
        failures.push(`operator read of tenant B with a ${what} grant: ACCEPTED (${attempt.rows.length} rows)`);
      }
      if (!/no live consent grant/i.test(attempt.body)) {
        failures.push(`operator read with a ${what} grant: refused as "${attempt.body.slice(0, 160)}", expected the consent check`);
      }
      if ((await eventsFor(b.id)) !== before) {
        failures.push(`operator read with a ${what} grant: an activity_event was written for a refused read`);
      }
      observed.push(`${what}=${attempt.status}`);
      await sql(`update public.consent_grant set ${restore} where id = '${b.consentGrantId}'`);
    }

    // A grant belongs to one tenant. Holding a live one for tenant A reaches
    // nothing of tenant B — that is P1 applied to the operator surface.
    await sql(`update public.consent_grant set revoked_at = now() where id = '${b.consentGrantId}'`);
    const wrongTenant = await probe.rpc(operator, "operator_read_activity_event", { p_tenant_id: b.id });
    if (wrongTenant.status < 400) failures.push("operator read of tenant B under tenant A's grant: ACCEPTED");
    observed.push(`b-under-a-grant=${wrongTenant.status}`);
    await sql(`update public.consent_grant set revoked_at = null where id = '${b.consentGrantId}'`);

    // And nobody but an operator reaches the path at all, live grant or not.
    for (const [what, identity] of [
      ["A-owner", a.owner],
      ["A-viewer", a.viewer],
      ["unaffiliated", fixture.unaffiliated],
    ] as [string, Identity][]) {
      const attempt = await probe.rpc(identity, "operator_read_activity_event", { p_tenant_id: a.id });
      if (attempt.status < 400) failures.push(`${what} calling the operator read path: ACCEPTED`);
      if (!/not an operator/i.test(attempt.body)) {
        failures.push(`${what} calling the operator read path: refused as "${attempt.body.slice(0, 160)}", expected the operator check`);
      }
      observed.push(`${what}=${attempt.status}`);
    }

    const anonAttempt = await probe.rpc(anonCaller(config), "operator_read_activity_event", { p_tenant_id: a.id });
    if (anonAttempt.status < 400) failures.push("anon calling the operator read path: ACCEPTED");
    observed.push(`anon=${anonAttempt.status}`);

    record(
      "20a",
      "No live consent grant, no operator read — and nothing logged for a refusal",
      failures,
      `${observed.join(", ")}; tenant B held ${before} events throughout`,
    );
    expect(failures).toEqual([]);
  });

  it("20b the same read with a live grant succeeds and writes an activity_event", async () => {
    const { a, operator } = fixture;
    const failures: string[] = [];

    const [live] = await sql<{ n: number }>(
      `select count(*)::int as n from public.consent_grant
        where id = '${a.consentGrantId}' and revoked_at is null and now() < expires_at`,
    );
    if (live.n !== 1) failures.push("precondition: tenant A holds no live consent grant");

    const [before] = await sql<{ n: number }>(
      `select count(*)::int as n from public.activity_event where tenant_id = '${a.id}'`,
    );

    const attempt = await probe.rpc(operator, "operator_read_activity_event", { p_tenant_id: a.id });
    if (attempt.status >= 400) {
      failures.push(`operator read under a live grant: POSITIVE PATH REFUSED ${attempt.status} ${attempt.body.slice(0, 200)}`);
    }
    if (attempt.rows.length === 0) {
      failures.push("operator read under a live grant: POSITIVE PATH EMPTY — tenant A holds events and none came back");
    }
    for (const row of attempt.rows) {
      if (row.tenant_id !== a.id) failures.push(`operator read returned a row belonging to ${String(row.tenant_id)}`);
    }

    const logged = await sql<{ n: number; actor: string | null; action: string }>(
      `select count(*)::int as n,
              max(actor_operator_id::text) as actor,
              max(action) as action
         from public.activity_event
        where tenant_id = '${a.id}' and actor_operator_id is not null`,
    );
    if (logged[0].n !== 1) failures.push(`the read wrote ${logged[0].n} operator-actor events, expected exactly 1`);
    if (logged[0].actor !== operator.authId) {
      failures.push(`the logged event names actor_operator_id ${logged[0].actor}, expected the operator`);
    }
    if (logged[0].action !== "operator.activity_event.read") {
      failures.push(`the logged event carries action "${logged[0].action}"`);
    }

    // The tenant reads its own audit trail, the operator's access included.
    // SECURITY_MODEL §7: a log the tenant cannot see is not an audit trail.
    const tenantSees = await probe.select(a.owner, "activity_event");
    if (tenantSees.count !== before.n + 1) {
      failures.push(`tenant A reads ${tenantSees.count} events, expected ${before.n + 1} with the operator's access among them`);
    }

    record(
      "20b",
      "A live grant admits the read, and the read logs itself",
      failures,
      `HTTP ${attempt.status}, ${attempt.rows.length} rows returned, all tenant A's; exactly 1 activity_event ` +
        `written with actor_operator_id set and action ${logged[0].action}; tenant A now reads ` +
        `${tenantSees.count} events, up from ${before.n}`,
    );
    expect(failures).toEqual([]);
  });
});

describe("proof 21 — an operator never reads activity_event.payload", () => {
  it("grant or no grant, by every path that exists", async () => {
    const { a, operator } = fixture;
    const failures: string[] = [];
    const observed: string[] = [];

    // A payload the operator must not see, and the tenant must.
    await sql(
      `update public.activity_event
          set payload = '{"marker":"${SYNTHETIC_PREFIX}payload"}'::jsonb
        where id = '${a.activityEventId}'`,
    );

    // The direct table read, with tenant A's grant live: no operator policy
    // exists on this table any more, so it returns nothing at all.
    for (const columns of ["id", "id,payload", "*"]) {
      const attempt = await probe.selectColumns(operator, "activity_event", columns);
      if (attempt.count > 0) {
        failures.push(`operator SELECT activity_event(${columns}): returned ${attempt.count} rows`);
      }
      for (const row of attempt.rows) {
        if ("payload" in row) failures.push(`operator SELECT activity_event(${columns}): a payload key came back`);
      }
      observed.push(`direct(${columns})=${attempt.ok ? `${attempt.count} rows` : attempt.code}`);
    }

    // The declared path, with the grant live: rows come back and none of them
    // carries the column, because the function's signature does not have it.
    const viaPath = await probe.rpc(operator, "operator_read_activity_event", { p_tenant_id: a.id });
    if (viaPath.status >= 400) failures.push(`the declared path refused under a live grant: ${viaPath.status}`);
    if (viaPath.rows.length === 0) failures.push("the declared path returned nothing under a live grant");
    for (const row of viaPath.rows) {
      if ("payload" in row) failures.push("the declared path returned a payload key");
    }
    observed.push(`declared-path=${viaPath.rows.length} rows, keys [${Object.keys(viaPath.rows[0] ?? {}).join("|")}]`);

    // Structural, not behavioural: no policy on this table consults is_operator,
    // so there is no row-level path for a later migration to widen by accident.
    const operatorPolicies = await sql<{ polname: string; qual: string | null }>(
      `select p.polname, pg_get_expr(p.polqual, p.polrelid) as qual
         from pg_policy p
         join pg_class c on c.oid = p.polrelid
         join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relname = 'activity_event'`,
    );
    for (const policy of operatorPolicies) {
      if (policy.qual !== null && /is_operator/.test(policy.qual)) {
        failures.push(`activity_event.${policy.polname} consults is_operator(): ${policy.qual}`);
      }
    }

    // The other side of the same rule: excluding the operator did not exclude
    // the tenant. §7 gives the tenant its audit trail in full.
    const tenantRead = await probe.selectColumns(a.owner, "activity_event", "id,payload");
    const withPayload = tenantRead.rows.filter((row) => row.payload !== null && row.payload !== undefined);
    if (withPayload.length === 0) {
      failures.push("tenant A read no payload at all — the exclusion reached the tenant, which §7 forbids");
    }

    await sql(`update public.activity_event set payload = null where id = '${a.activityEventId}'`);

    record(
      "21",
      "payload is out of the operator's reach by every path, and still in the tenant's",
      failures,
      `${observed.join("; ")}; ${operatorPolicies.length} policies on activity_event, none consulting is_operator(); ` +
        `tenant A read ${withPayload.length} row(s) carrying a payload`,
    );
    expect(failures).toEqual([]);
  });
});

describe("proof 22 — every function's EXECUTE privilege is explicit (CF-105)", () => {
  it("none is reachable by PUBLIC or anon, and one no caller needs is granted to no one", async () => {
    const failures: string[] = [];

    const rows = await sql<{
      proname: string;
      acl: string | null;
      grantees: string | null;
      public_grants: number;
    }>(
      `select p.proname,
              array_to_string(p.proacl, ' | ') as acl,
              (select string_agg(distinct coalesce(r.rolname, 'PUBLIC'), ',' order by coalesce(r.rolname, 'PUBLIC'))
                 from aclexplode(p.proacl) x
                 left join pg_roles r on r.oid = x.grantee
                where x.privilege_type = 'EXECUTE') as grantees,
              (select count(*)::int from aclexplode(p.proacl) x where x.grantee = 0) as public_grants
         from pg_proc p
         join pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'public'
        order by 1`,
    );

    // Exact, not "does not contain anon". A default privilege that grants a new
    // function to three roles is what CF-105 actually was, one level up from
    // the PUBLIC default everyone looks for.
    const expected: Record<string, string> = {
      current_tenant_id: "authenticated,postgres",
      enforce_tenant_active_owner: "postgres",
      has_live_consent_grant: "authenticated,postgres",
      is_current_tenant_owner: "authenticated,postgres",
      is_operator: "authenticated,postgres",
      // P02-T05. materialise_member is a trigger function and is granted to
      // nobody, for the reason enforce_tenant_active_owner is: EXECUTE is
      // checked when the trigger is created, never when it fires, so the
      // trigger keeps working while the function stops being an RPC endpoint.
      materialise_member: "postgres",
      operator_read_activity_event: "authenticated,postgres",
      provision_tenant: "authenticated,postgres",
      caller_email_is_verified: "authenticated,postgres",
      accept_invitation: "authenticated,postgres",
    };

    for (const row of rows) {
      // A null proacl is the default, and the default for a function is EXECUTE
      // to PUBLIC. Absence of an ACL is the finding, not the absence of one.
      if (row.acl === null) {
        failures.push(`${row.proname}: proacl is null — EXECUTE falls back to the PUBLIC default`);
        continue;
      }
      if (row.public_grants > 0) failures.push(`${row.proname}: ${row.public_grants} grant(s) to PUBLIC`);
      const want = expected[row.proname];
      if (want === undefined) {
        failures.push(`${row.proname}: a function this proof does not know about — add it or remove it`);
      } else if (row.grantees !== want) {
        failures.push(`${row.proname}: EXECUTE granted to [${row.grantees}], expected [${want}]`);
      }
    }
    if (rows.length !== Object.keys(expected).length) {
      failures.push(`public holds ${rows.length} functions, expected ${Object.keys(expected).length}`);
    }

    // The catalog says it; the wire confirms it.
    const overTheWire: string[] = [];
    const anon = anonCaller(config);
    for (const fn of Object.keys(expected)) {
      const args = fn.endsWith("_activity_event") || fn === "has_live_consent_grant" ? { p_tenant_id: fixture.a.id } : {};
      const attempt = await probe.rpc(anon, fn, args);
      if (attempt.status < 400) failures.push(`anon rpc/${fn}: answered ${attempt.status} ${attempt.body.slice(0, 120)}`);
      overTheWire.push(`anon.${fn}=${attempt.status}`);
    }
    const triggerFn = await probe.rpc(fixture.a.owner, "enforce_tenant_active_owner");
    if (triggerFn.status < 400) failures.push(`A-owner rpc/enforce_tenant_active_owner: answered ${triggerFn.status}`);
    overTheWire.push(`A-owner.enforce_tenant_active_owner=${triggerFn.status}`);

    record(
      "22",
      "EXECUTE is explicit on every public function; none is PUBLIC or anon",
      failures,
      `${rows.length} functions, each ACL asserted exactly: ` +
        `${rows.map((r) => `${r.proname}=[${r.grantees}]`).join(", ")}; over the wire ${overTheWire.join(", ")}`,
    );
    expect(failures).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Proof 23 is P02-T04's, and it is OD-G14's resolution contract asserted row by
// row. Until this migration a caller holding two active memberships resolved to
// nothing, by design and for want of a decision; the decision exists now, so
// what used to be documented fail-closed behaviour is a specification with six
// rows and each row needs an assertion that fails if the row stops being true.
//
// Every actor here is built by this proof rather than taken from the shared
// fixture, because proofs 4a and 19 assert exact row sets against that fixture
// and a proof that needs a doubly-membered owner must not reshape theirs. Every
// row created carries the reserved prefix or lives in a synthetic tenant, so
// `teardown()` removes all of it and assertion D is where that is proven.
// ---------------------------------------------------------------------------

/** The tables whose contents move when the selection moves. */
const SELECTOR_TABLES: TableName[] = ["tenant", "membership", "consent_grant", "activity_event", "invitation"];

type Resolution = { status: number; body: string; value: string | null };

type Actors = {
  /** Active OWNER in tenant A and in tenant B. */
  dual: Identity;
  /** Active OWNER in tenant A alone. */
  single: Identity;
  /** Active owner in A; `invited` in B. */
  invitee: Identity;
  /** Active owner in A; `suspended` in B. */
  suspended: Identity;
  /** Active owner in A; an `active` but ARCHIVED row in B. */
  archived: Identity;
  /** A tenant that exists and which none of the above holds. */
  c: { id: string; slug: string; owner: Identity };
};

describe("proof 23 — session-to-membership resolution (OD-G14, CF-93 gap 3, CF-103)", () => {
  let actor: Actors;

  /** What the caller's session resolves to, and the verbatim answer it gave. */
  const resolves = async (caller: Caller): Promise<Resolution> => {
    const answer = await probe.rpc(caller, "current_tenant_id");
    let value: string | null = null;
    try {
      value = JSON.parse(answer.body === "" ? "null" : answer.body) as string | null;
    } catch {
      value = answer.body;
    }
    return { status: answer.status, body: answer.body, value };
  };

  /**
   * What the caller actually reads, per table, as id sets.
   *
   * A refusal carrying 42501 is zero reach and is recorded as the empty set.
   * anon holds no policy on any of these tables — every policy in this schema
   * is `to authenticated` — so it is refused outright rather than filtered to
   * nothing, which proof 13 already establishes; counting that refusal as a row
   * would invert the result. Any OTHER error is not a refusal and lands as a
   * marker that no assertion here can mistake for an empty read, because an
   * exception raised inside a policy must never pass as isolation working.
   */
  const reads = async (caller: Caller): Promise<Record<string, string[]>> => {
    const out: Record<string, string[]> = {};
    for (const table of SELECTOR_TABLES) {
      const attempt = await probe.select(caller, table);
      if (attempt.ok) out[table] = attempt.ids;
      else if (attempt.code === "42501") out[table] = [];
      else out[table] = [`UNEXPECTED:${attempt.status}:${attempt.code}:${attempt.message.slice(0, 80)}`];
    }
    return out;
  };

  /** Membership rows the caller can see that belong to a DIFFERENT member. */
  const foreignMembers = async (caller: Caller, tenantId: string): Promise<RawRow[]> => {
    const seen = await probe.selectColumns(caller, "membership", "id,member_id,tenant_id");
    return seen.rows.filter((row) => row.tenant_id === tenantId && row.member_id !== (caller as Identity).authId);
  };

  /** Every table read empty. Used wherever the contract says the answer is null. */
  const readsNothing = (what: string, seen: Record<string, string[]>, failures: string[]): void => {
    for (const table of SELECTOR_TABLES) {
      // membership_select_own is deliberately wider than the tenancy spine: a
      // person may always see the rows that are theirs, in any tenant and any
      // state (DATA_MODEL §3.3). Those rows are not reach into a tenant and are
      // asserted separately, per assertion, as foreign-member rows.
      if (table === "membership") continue;
      if (seen[table].length !== 0) {
        failures.push(`${what}: read ${seen[table].length} ${table} row(s) [${seen[table].join(", ")}], expected none`);
      }
    }
  };

  beforeAll(async () => {
    const { a, b } = fixture;
    const runId = randomUUID().slice(0, 8);

    const dual = await makeIdentity(config, "g14-dual", runId);
    const single = await makeIdentity(config, "g14-single", runId);
    const invitee = await makeIdentity(config, "g14-invitee", runId);
    const suspended = await makeIdentity(config, "g14-suspended", runId);
    const archived = await makeIdentity(config, "g14-archived", runId);
    const cOwner = await makeIdentity(config, "g14-c-owner", runId);

    const tenantC = { id: randomUUID(), slug: `${SYNTHETIC_PREFIX}gamma-${runId}` };

    // Owners rather than viewers, so consent_grant — which only an owner of the
    // current tenant reads — moves with the selection too. That makes the proof
    // cover is_current_tenant_owner() as well, which resolves through this same
    // helper and would otherwise be asserted nowhere against a selection.
    // OD-G15 permits more than one active owner per tenant.
    const rows: [string, string, string, string, string][] = [
      [randomUUID(), a.id, dual.authId, "active", "null"],
      [randomUUID(), b.id, dual.authId, "active", "null"],
      [randomUUID(), a.id, single.authId, "active", "null"],
      [randomUUID(), a.id, invitee.authId, "active", "null"],
      [randomUUID(), b.id, invitee.authId, "invited", "null"],
      [randomUUID(), a.id, suspended.authId, "active", "null"],
      [randomUUID(), b.id, suspended.authId, "suspended", "null"],
      [randomUUID(), a.id, archived.authId, "active", "null"],
      // `active` AND archived: the status alone is not what makes a membership
      // held, and a row that says `active` while being archived is the case a
      // predicate checking only `status` would get wrong.
      [randomUUID(), b.id, archived.authId, "active", "now()"],
      [randomUUID(), tenantC.id, cOwner.authId, "active", "null"],
    ];

    const members = [dual, single, invitee, suspended, archived, cOwner];
    await sql(`
      -- ADOPTED, not created. P02-T05's member_materialisation trigger writes
      -- the row inside the transaction that inserts into auth.users, so by the
      -- time makeIdentity returns, every one of these already exists. The
      -- display name is all this statement still contributes, and it is what
      -- teardown finds them by. A plain INSERT here would raise 23505 on the
      -- primary key, which is the trigger working.
      insert into public.member (id, email, display_name) values
        ${members.map((m) => `('${m.authId}', '${m.email}', '${SYNTHETIC_PREFIX}${m.label}')`).join(",\n        ")}
      on conflict (id) do update set display_name = excluded.display_name;

      insert into public.tenant (id, name, slug, base_currency, default_locale, status) values
        ('${tenantC.id}', '${SYNTHETIC_PREFIX}gamma', '${tenantC.slug}', 'SAR', 'en', 'active');

      insert into public.membership (id, tenant_id, member_id, role, status, archived_at) values
        ${rows.map(([id, tid, mid, status, arch]) => `('${id}', '${tid}', '${mid}', 'owner', '${status}', ${arch})`).join(",\n        ")};
    `);

    actor = { dual, single, invitee, suspended, archived, c: { ...tenantC, owner: cOwner } };
  }, 240_000);

  it("23a no selector, exactly one active membership — that tenant, and only active counts", async () => {
    const failures: string[] = [];
    const observed: string[] = [];

    // All four hold exactly one ACTIVE membership, in tenant A. Three of them
    // also hold a second membership in tenant B that is invited, suspended or
    // archived. If any of those counted, the caller would hold two and resolve
    // null — so this asserts the contract's second row and the `held` predicate
    // in the same breath.
    const holders: [string, Identity][] = [
      ["nothing else", actor.single],
      ["plus an invitation in B", actor.invitee],
      ["plus a suspended row in B", actor.suspended],
      ["plus an archived row in B", actor.archived],
    ];

    for (const [what, who] of holders) {
      const answer = await resolves(who);
      observed.push(`${what}=${answer.body}`);
      if (answer.value !== fixture.a.id) {
        failures.push(`${who.label} (${what}) resolved ${answer.body}, expected tenant A`);
      }
      const seen = await reads(who);
      if (!sameSet(seen.tenant, [fixture.a.id])) {
        failures.push(`${who.label} (${what}) read tenant [${seen.tenant.join(", ")}], expected exactly tenant A`);
      }
      // The positive path, stated on its own: default-deny failing silently
      // looks identical to correct isolation.
      if (seen.activity_event.length === 0) {
        failures.push(`${who.label} (${what}): POSITIVE PATH EMPTY — read no activity_event rows in the tenant they hold`);
      }
    }

    record(
      "23a",
      "No selector, one active membership: that tenant resolves",
      failures,
      `4 callers each holding exactly one active membership resolved tenant A and read it: ${observed.join(", ")}; ` +
        `an invited, a suspended and an archived membership in tenant B each counted for nothing`,
    );
    expect(failures).toEqual([]);
  });

  it("23b no selector, two active memberships — null, and nothing is read", async () => {
    const failures: string[] = [];

    const answer = await resolves(actor.dual);
    if (answer.value !== null) failures.push(`the doubly-membered caller resolved ${answer.body}, expected null`);

    const seen = await reads(actor.dual);
    readsNothing("no selector, two active memberships", seen, failures);

    for (const tenantId of [fixture.a.id, fixture.b.id]) {
      const foreign = await foreignMembers(actor.dual, tenantId);
      if (foreign.length !== 0) {
        failures.push(`no selector: read ${foreign.length} membership row(s) belonging to another member of ${tenantId}`);
      }
    }

    record(
      "23b",
      "No selector, two active memberships: null — ambiguity is denied, not guessed",
      failures,
      `resolved ${answer.body}; read 0 tenant, 0 consent_grant and 0 activity_event rows, and 0 membership rows ` +
        `belonging to any other member of either tenant — the caller keeps sight of their own two rows and nothing else`,
    );
    expect(failures).toEqual([]);
  });

  it("23c selector = A: tenant A resolves and tenant B returns zero", async () => {
    const failures: string[] = [];
    const caller = selecting(actor.dual, fixture.a.id);

    const answer = await resolves(caller);
    if (answer.value !== fixture.a.id) failures.push(`selecting A resolved ${answer.body}, expected tenant A`);

    // Calibrated against a caller who holds one membership in A and nothing
    // else, read at this same moment: selecting a tenant must reach exactly
    // what belonging to only that tenant reaches. A hardcoded set would go
    // stale the moment an earlier proof writes an activity_event.
    const selected = await reads(caller);
    const baseline = await reads(fixture.a.owner);
    for (const table of ["tenant", "consent_grant", "activity_event"]) {
      if (!sameSet(selected[table], baseline[table])) {
        failures.push(
          `selecting A read ${table} [${sortedIds(selected[table]).join(", ")}], ` +
            `tenant A's own owner reads [${sortedIds(baseline[table]).join(", ")}]`,
        );
      }
      if (baseline[table].length > 0 && selected[table].length === 0) {
        failures.push(`selecting A: POSITIVE PATH EMPTY on ${table}`);
      }
    }

    const foreignB = await foreignMembers(caller, fixture.b.id);
    if (foreignB.length !== 0) {
      failures.push(`selecting A still read ${foreignB.length} membership row(s) of another member of tenant B`);
    }
    const inA = await foreignMembers(caller, fixture.a.id);
    if (inA.length === 0) {
      failures.push("selecting A: POSITIVE PATH EMPTY — read no colleague's membership row in the selected tenant");
    }

    record(
      "23c",
      "Selector = A: A resolves, B returns zero",
      failures,
      `resolved ${answer.body}; read exactly what tenant A's own owner reads on tenant, consent_grant and ` +
        `activity_event (${["tenant", "consent_grant", "activity_event"].map((t) => `${t}=${selected[t].length}`).join(", ")}), ` +
        `including ${inA.length} colleague membership row(s) in A and 0 in B`,
    );
    expect(failures).toEqual([]);
  });

  it("23d the same member, selector = B: tenant B resolves and tenant A returns zero", async () => {
    const failures: string[] = [];
    const caller = selecting(actor.dual, fixture.b.id);

    const answer = await resolves(caller);
    if (answer.value !== fixture.b.id) failures.push(`selecting B resolved ${answer.body}, expected tenant B`);

    const selected = await reads(caller);
    const baseline = await reads(fixture.b.owner);
    for (const table of ["tenant", "consent_grant", "activity_event"]) {
      if (!sameSet(selected[table], baseline[table])) {
        failures.push(
          `selecting B read ${table} [${sortedIds(selected[table]).join(", ")}], ` +
            `tenant B's own owner reads [${sortedIds(baseline[table]).join(", ")}]`,
        );
      }
      if (baseline[table].length > 0 && selected[table].length === 0) {
        failures.push(`selecting B: POSITIVE PATH EMPTY on ${table}`);
      }
    }

    const foreignA = await foreignMembers(caller, fixture.a.id);
    if (foreignA.length !== 0) {
      failures.push(`selecting B still read ${foreignA.length} membership row(s) of another member of tenant A`);
    }
    const inB = await foreignMembers(caller, fixture.b.id);
    if (inB.length === 0) {
      failures.push("selecting B: POSITIVE PATH EMPTY — read no colleague's membership row in the selected tenant");
    }

    record(
      "23d",
      "Selector = B: B resolves, A returns zero — one identity, two disjoint reaches",
      failures,
      `resolved ${answer.body}; read exactly what tenant B's own owner reads on tenant, consent_grant and ` +
        `activity_event (${["tenant", "consent_grant", "activity_event"].map((t) => `${t}=${selected[t].length}`).join(", ")}), ` +
        `including ${inB.length} colleague membership row(s) in B and 0 in A — the same session, the same token, ` +
        `a different tenant, and no overlap with 23c`,
    );
    expect(failures).toEqual([]);
  });

  it("23e a selector naming a tenant the caller does not hold — null, and zero from every tenant", async () => {
    const failures: string[] = [];
    const observed: string[] = [];

    // Both membership counts, because the answer must not depend on how many
    // the caller holds: two (dual) and one (single), each selecting tenant C,
    // which exists and which neither of them holds.
    for (const who of [actor.dual, actor.single]) {
      const caller = selecting(who, actor.c.id);
      const answer = await resolves(caller);
      observed.push(`${who.label}=${answer.body}`);
      if (answer.value !== null) failures.push(`${who.label} selecting an unheld tenant resolved ${answer.body}, expected null`);

      const seen = await reads(caller);
      readsNothing(`${who.label} selecting an unheld tenant`, seen, failures);
      if (seen.tenant.includes(actor.c.id)) failures.push(`${who.label} read the unheld tenant's own row`);

      for (const tenantId of [fixture.a.id, fixture.b.id, actor.c.id]) {
        const foreign = await foreignMembers(caller, tenantId);
        if (foreign.length !== 0) {
          failures.push(`${who.label} selecting an unheld tenant read ${foreign.length} foreign membership row(s) in ${tenantId}`);
        }
      }
    }

    record(
      "23e",
      "An unheld selection reaches nothing, at either membership count",
      failures,
      `tenant C exists and neither caller holds it: ${observed.join(", ")}; both read 0 tenant, 0 consent_grant ` +
        `and 0 activity_event rows and 0 foreign membership rows in A, B or C`,
    );
    expect(failures).toEqual([]);
  });

  it("23f a selector naming a tenant where the membership is invited — null", async () => {
    const failures: string[] = [];
    const caller = selecting(actor.invitee, fixture.b.id);

    const answer = await resolves(caller);
    if (answer.value !== null) failures.push(`selecting a tenant that only invited them resolved ${answer.body}, expected null`);
    if (answer.value === fixture.a.id) failures.push("FALLBACK: it resolved the tenant they do hold instead");

    const seen = await reads(caller);
    readsNothing("selecting a tenant where the membership is invited", seen, failures);

    const held = await sql<{ status: string }>(
      `select status::text as status from public.membership
        where member_id = '${actor.invitee.authId}' and tenant_id = '${fixture.b.id}'`,
    );

    record(
      "23f",
      "An invitation is not a membership: selecting it resolves null",
      failures,
      `the row exists in tenant B with status ${held.map((r) => r.status).join("/")}; resolved ${answer.body}, ` +
        `read 0 tenant, 0 consent_grant and 0 activity_event rows, and did not fall back to tenant A`,
    );
    expect(failures).toEqual([]);
  });

  it("23g a selector naming a tenant where the membership is archived — null", async () => {
    const failures: string[] = [];
    const caller = selecting(actor.archived, fixture.b.id);

    const answer = await resolves(caller);
    if (answer.value !== null) failures.push(`selecting an archived membership's tenant resolved ${answer.body}, expected null`);
    if (answer.value === fixture.a.id) failures.push("FALLBACK: it resolved the tenant they do hold instead");

    const seen = await reads(caller);
    readsNothing("selecting a tenant where the membership is archived", seen, failures);

    const held = await sql<{ status: string; archived: string | null }>(
      `select status::text as status, archived_at::text as archived from public.membership
        where member_id = '${actor.archived.authId}' and tenant_id = '${fixture.b.id}'`,
    );
    if (held.length !== 1 || held[0].status !== "active" || held[0].archived === null) {
      failures.push(`precondition: the archived row is ${JSON.stringify(held)}, expected exactly one active-and-archived row`);
    }

    record(
      "23g",
      "An archived membership is not held, whatever its status column says",
      failures,
      `the row in tenant B reads status=${held[0]?.status} archived_at=set; resolved ${answer.body}, read 0 tenant, ` +
        `0 consent_grant and 0 activity_event rows, and did not fall back to tenant A — a predicate testing ` +
        `status alone would have resolved tenant B here`,
    );
    expect(failures).toEqual([]);
  });

  it("23h a malformed selector resolves null and raises nothing, on the RPC and inside a policy", async () => {
    const failures: string[] = [];
    const observed: string[] = [];

    // The RPC answers for the helper. A table read answers for the helper as a
    // POLICY EXPRESSION, which is the path that matters: an exception there is
    // a failed request rather than a denied one, and every policy in this
    // schema goes through it.
    const malformed = [
      "not-a-uuid",
      "",
      "0",
      "null",
      "undefined",
      `{${randomUUID()}}`,
      randomUUID().replace(/-/g, ""),
      `${randomUUID()}x`,
      "' or 1=1 --",
      "'; drop table public.tenant; --",
      "%s",
      // Written as printable text on purpose. A literal control character is
      // rejected by the HTTP client before the request is sent, which would
      // prove something about undici rather than about the helper.
      "\\x00",
      "x".repeat(1024),
    ].filter((value) => value !== "");

    /**
     * The same value, put to the helper INSIDE the database, with no network in
     * front of it. `set_config(..., true)` is transaction-local and this is one
     * statement, so the settings cannot escape it; the LATERAL body reads both
     * of them, which is what forces the planner to establish them before
     * current_tenant_id() is called rather than in whatever order it prefers.
     *
     * This exists because two of the values below never reach Postgres at all —
     * see the edge classification underneath — and a probe that reports "the
     * request was blocked" as "the helper behaved" is PR-21's failure shape.
     */
    const throughTheDatabase = async (value: string) => {
      // Dollar-quoted with a random tag rather than quote-doubled. The values
      // here are deliberately injection-shaped and this statement runs as
      // `postgres` on the privileged path, so the quoting must not depend on
      // standard_conforming_strings or on getting an escape right.
      const tag = `sel${randomUUID().replace(/-/g, "").slice(0, 12)}`;
      return sql.try(`
        select res.resolved
          from (
            select set_config('request.jwt.claims',
                              jsonb_build_object('sub', '${actor.single.authId}')::text, true) as claims,
                   set_config('request.headers',
                              jsonb_build_object('${TENANT_SELECTOR_HEADER}', $${tag}$${value}$${tag}$)::text, true) as headers
          ) cfg,
          lateral (
            select case when cfg.claims is not null and cfg.headers is not null
                        then public.current_tenant_id()::text
                   end as resolved
          ) res
      `);
    };

    // The control. Without it a direct path that answered null to everything
    // would pass this proof while exercising nothing.
    const control = await throughTheDatabase(fixture.a.id);
    if (!control.ok || !control.body.includes(fixture.a.id)) {
      failures.push(
        `control: a VALID selector through the direct path answered ${control.status} ${control.body.slice(0, 200)}, ` +
          `expected tenant A — the direct path is not exercising the selector and its null answers prove nothing`,
      );
    }

    let reachedPostgres = 0;
    let blockedAtEdge = 0;

    for (const value of malformed) {
      const caller = selecting(actor.single, value);
      const shown = value.length > 24 ? `${value.slice(0, 24)}...(${value.length})` : value;

      // --- over HTTP, the path a real caller uses -------------------------
      const answer = await resolves(caller);
      let parsedBody = true;
      try {
        JSON.parse(answer.body === "" ? "null" : answer.body);
      } catch {
        parsedBody = false;
      }

      if (answer.status >= 400 && !parsedBody) {
        // Cloudflare's WAF at the Supabase edge refuses a header value that
        // looks like SQL injection, with 403 and an HTML page. No SQLSTATE, no
        // PostgREST, no Postgres: the request never arrived, so this is not a
        // result about the helper in either direction. It is counted, named,
        // and covered by the direct path below instead of being waved through.
        blockedAtEdge += 1;
        observed.push(`${JSON.stringify(shown)}->EDGE ${answer.status}`);
      } else {
        reachedPostgres += 1;
        if (answer.status >= 400) {
          failures.push(`selector ${JSON.stringify(shown)}: rpc answered ${answer.status} ${answer.body} — it RAISED`);
        }
        if (answer.value !== null) failures.push(`selector ${JSON.stringify(shown)}: resolved ${answer.body}, expected null`);

        // The RPC answers for the helper. A table read answers for the helper
        // as a POLICY EXPRESSION, which is the path that matters: an exception
        // there is a failed request rather than a denied one, and every policy
        // in this schema goes through it.
        const read = await probe.select(caller, "tenant");
        if (!read.ok) {
          failures.push(`selector ${JSON.stringify(shown)}: the POLICY path errored ${read.status} (${read.code}) ${read.message} — it RAISED`);
        } else if (read.count !== 0) {
          failures.push(`selector ${JSON.stringify(shown)}: read ${read.count} tenant row(s), expected none`);
        }
        observed.push(`${JSON.stringify(shown)}->${answer.status}:${answer.body}/select ${read.status}:${read.count}`);
      }

      // --- and inside the database, for every value without exception ------
      const direct = await throughTheDatabase(value);
      if (!direct.ok) {
        failures.push(
          `selector ${JSON.stringify(shown)}: the helper RAISED inside the database — ${direct.status} ${direct.body.slice(0, 200)}`,
        );
      } else if (!/"resolved"\s*:\s*null/.test(direct.body)) {
        failures.push(`selector ${JSON.stringify(shown)}: the direct path resolved ${direct.body.slice(0, 200)}, expected null`);
      }
    }

    record(
      "23h",
      "A malformed selector resolves null and never raises",
      failures,
      `${malformed.length} malformed values, each put to the helper twice — over HTTP and inside the database ` +
        `with a forged request.headers. ${reachedPostgres} reached Postgres over HTTP and every one answered ` +
        `200/null with an empty, unerrored policy-mediated read; ${blockedAtEdge} were refused by Cloudflare's WAF ` +
        `at the Supabase edge with a 403 HTML page and never arrived, so HTTP proves nothing about them. All ` +
        `${malformed.length} resolved null through the direct path with no error raised, and a valid selector ` +
        `through that same path resolved tenant A, so the null answers are the helper's and not the path's. ` +
        `Observed: ${observed.join(", ")}`,
    );
    expect(failures).toEqual([]);
  });

  it("23i a selector naming a tenant that does not exist — null, indistinguishable from one that does", async () => {
    const failures: string[] = [];

    const absent = randomUUID();
    const nonexistent = selecting(actor.single, absent);
    const unheld = selecting(actor.single, actor.c.id);

    const [countRow] = await sql<{ n: number }>(`select count(*)::int as n from public.tenant where id = '${absent}'`);
    if (countRow.n !== 0) failures.push(`precondition: the id chosen as nonexistent matches ${countRow.n} tenant row(s)`);

    const answerAbsent = await resolves(nonexistent);
    const answerUnheld = await resolves(unheld);

    if (answerAbsent.value !== null) failures.push(`a nonexistent tenant resolved ${answerAbsent.body}, expected null`);

    // SECURITY_MODEL.md §1's existence property, applied to the selector: "does
    // not exist" and "exists but is not yours" must be the same answer, not two
    // answers that happen to agree today.
    if (answerAbsent.status !== answerUnheld.status || answerAbsent.body !== answerUnheld.body) {
      failures.push(
        `a nonexistent tenant answered ${answerAbsent.status}/${answerAbsent.body} and an unheld existing one ` +
          `answered ${answerUnheld.status}/${answerUnheld.body} — the selector is an existence oracle`,
      );
    }

    const seenAbsent = await reads(nonexistent);
    readsNothing("selecting a nonexistent tenant", seenAbsent, failures);
    const seenUnheld = await reads(unheld);
    for (const table of SELECTOR_TABLES) {
      if (!sameSet(seenAbsent[table], seenUnheld[table])) {
        failures.push(`${table}: nonexistent read [${seenAbsent[table].join(", ")}], unheld read [${seenUnheld[table].join(", ")}]`);
      }
    }

    record(
      "23i",
      "A nonexistent selection answers exactly as an unheld one does",
      failures,
      `nonexistent ${answerAbsent.status}/${answerAbsent.body} and unheld-but-real ${answerUnheld.status}/` +
        `${answerUnheld.body} are byte-identical, and both read the same empty set on all ` +
        `${SELECTOR_TABLES.length} tables — no response distinguishes the two`,
    );
    expect(failures).toEqual([]);
  });

  it("23j one active membership plus an unheld selector — null, and never the held tenant", async () => {
    const failures: string[] = [];

    // The single most important row of the contract, and the one an
    // implementation drifts back into: a caller who holds exactly one tenant
    // asks for a different one. Falling back to the held tenant would serve
    // them a tenant they did not ask for, which is worse than serving nothing.
    const caller = selecting(actor.single, fixture.b.id);

    const unselected = await resolves(actor.single);
    if (unselected.value !== fixture.a.id) {
      failures.push(`precondition: without a selector this caller resolves ${unselected.body}, expected tenant A`);
    }

    const answer = await resolves(caller);
    if (answer.value === fixture.a.id) {
      failures.push("FALLBACK: an unheld selector resolved the caller's one held tenant — this is the behaviour the contract forbids");
    }
    if (answer.value !== null) failures.push(`resolved ${answer.body}, expected null`);

    const seen = await reads(caller);
    readsNothing("one membership plus an unheld selector", seen, failures);
    if (seen.tenant.includes(fixture.a.id)) failures.push("FALLBACK: it read the held tenant's row");
    if (seen.tenant.includes(fixture.b.id)) failures.push("it read the unheld tenant's row");

    for (const tenantId of [fixture.a.id, fixture.b.id]) {
      const foreign = await foreignMembers(caller, tenantId);
      if (foreign.length !== 0) failures.push(`read ${foreign.length} foreign membership row(s) in ${tenantId}`);
    }

    record(
      "23j",
      "No fallback: an unheld selector never resolves the one tenant the caller holds",
      failures,
      `the same caller resolves ${unselected.body} with no selector and ${answer.body} when they ask for tenant B, ` +
        `reading 0 rows of A and 0 of B — explicit beats implicit, and a wrong explicit fails closed`,
    );
    expect(failures).toEqual([]);
  });

  it("23k SECURITY_MODEL §1 availability, re-proven with a second active membership present", async () => {
    const failures: string[] = [];
    const victim = actor.single;
    const selected = () => selecting(victim, fixture.a.id);

    // §1's availability test, verbatim: record what a member reads, change the
    // world, read again, and require the two to be equal on every table. What
    // changes here is the thing that used to cause the lockout — a second
    // active membership — and the property to re-prove is that it now costs the
    // member nothing, provided they say which tenant they mean.
    const stateOf = async (caller: Caller) => {
      const seen = await reads(caller);
      const own: Record<string, number> = {};
      for (const table of SELECTOR_TABLES) own[table] = seen[table].length;
      // Their own membership rows travel with them and are not tenant reach.
      own.membership = (await foreignMembers(caller, fixture.a.id)).length;
      return { own, resolved: (await resolves(caller)).value };
    };

    const before = await stateOf(victim);
    const beforeSelected = await stateOf(selected());
    if (before.resolved !== fixture.a.id) {
      failures.push(`precondition: the member resolves ${before.resolved} before anything changes, expected tenant A`);
    }
    if (before.own.tenant === 0 || before.own.activity_event === 0) {
      failures.push(`precondition: the member reads ${JSON.stringify(before.own)} — the baseline is already empty`);
    }

    const secondId = randomUUID();
    await sql(`
      insert into public.membership (id, tenant_id, member_id, role, status)
      values ('${secondId}', '${fixture.b.id}', '${victim.authId}', 'owner', 'active')
    `);

    const duringImplicit = await stateOf(victim);
    const during = await stateOf(selected());

    // Ambiguity still denies when nothing is selected — that half is unchanged
    // and is 23b. What is new is the line below it.
    if (duringImplicit.resolved !== null) {
      failures.push(`with two active memberships and no selector the member resolved ${duringImplicit.resolved}, expected null`);
    }
    if (during.resolved !== fixture.a.id) {
      failures.push(`with two active memberships and tenant A selected the member resolved ${during.resolved} — LOCKOUT`);
    }
    for (const table of Object.keys(before.own)) {
      if (during.own[table] !== beforeSelected.own[table]) {
        failures.push(
          `with a second membership present, selecting A reads ${during.own[table]} ${table} row(s), ` +
            `was ${beforeSelected.own[table]} — LOCKOUT`,
        );
      }
    }

    await sql(`delete from public.membership where id = '${secondId}'`);

    const after = await stateOf(victim);
    if (after.resolved !== before.resolved) {
      failures.push(`after removal the member resolves ${after.resolved}, was ${before.resolved}`);
    }
    for (const table of Object.keys(before.own)) {
      if (after.own[table] !== before.own[table]) {
        failures.push(`after removal the member reads ${after.own[table]} ${table} row(s), was ${before.own[table]}`);
      }
    }

    record(
      "23k",
      "A second active membership degrades nothing the member already reached",
      failures,
      `baseline with one membership: resolved tenant A, ${Object.entries(before.own).map(([t, n]) => `${t}=${n}`).join(", ")}. ` +
        `With a second active membership in tenant B present, selecting A resolves tenant A and reads ` +
        `${Object.entries(during.own).map(([t, n]) => `${t}=${n}`).join(", ")} — equal on every table — while the ` +
        `unselected path resolves ${duringImplicit.resolved} as 23b requires. Restored on removal. Before this ` +
        `migration the middle state read zero everywhere, which is the CF-103 lockout`,
    );
    expect(failures).toEqual([]);
  });

  it("23l an empty or whitespace-only selector behaves as absent, in both directions", async () => {
    const failures: string[] = [];
    const observed: string[] = [];

    // A client that has not chosen a tenant yet, or an intermediary that blanks
    // a header it does not understand, must not lock out every one-membership
    // caller in the platform. Absence and emptiness are the same thing, and the
    // direction that proves it is not a leak is the doubly-membered one below.
    for (const blank of ["", " ", "   \t  "]) {
      const one = await resolves(selecting(actor.single, blank));
      if (one.value !== fixture.a.id) {
        failures.push(`a one-membership caller sending ${JSON.stringify(blank)} resolved ${one.body}, expected tenant A`);
      }
      const two = await resolves(selecting(actor.dual, blank));
      if (two.value !== null) {
        failures.push(`a two-membership caller sending ${JSON.stringify(blank)} resolved ${two.body}, expected null`);
      }
      observed.push(`${JSON.stringify(blank)}: one-membership=${one.body}, two-membership=${two.body}`);
    }

    record(
      "23l",
      "An empty selector is an absent selector, and grants nothing extra",
      failures,
      `${observed.join(" | ")} — a blank value resolves exactly as sending no header does, which denies the ` +
        `ambiguous caller and does not deny the unambiguous one`,
    );
    expect(failures).toEqual([]);
  });

  it("23m the header name and the selector value are both matched case-insensitively", async () => {
    const failures: string[] = [];
    const observed: string[] = [];

    // HTTP header names are case-insensitive by specification, and a uuid's
    // canonical text form is lowercase. A caller who sends either in another
    // case is not making a mistake, and resolving null for them would be an
    // availability bug that fails closed and is therefore invisible.
    const spellings: [string, string, string][] = [
      ["canonical", TENANT_SELECTOR_HEADER, fixture.a.id],
      ["header title-cased", "X-B2S-Tenant", fixture.a.id],
      ["header upper-cased", "X-B2S-TENANT", fixture.a.id],
      ["value upper-cased", TENANT_SELECTOR_HEADER, fixture.a.id.toUpperCase()],
      ["both", "X-B2S-Tenant", fixture.a.id.toUpperCase()],
    ];

    for (const [what, header, value] of spellings) {
      const caller = selecting(actor.dual, value, header);
      const answer = await resolves(caller);
      observed.push(`${what}=${answer.body}`);
      if (answer.value !== fixture.a.id) failures.push(`${what}: resolved ${answer.body}, expected tenant A`);
      const seen = await reads(caller);
      if (!sameSet(seen.tenant, [fixture.a.id])) {
        failures.push(`${what}: read tenant [${seen.tenant.join(", ")}], expected exactly tenant A`);
      }
    }

    // And a header that is NOT the selector changes nothing, so the match is on
    // the name rather than on any header carrying a uuid.
    const decoy = selecting(actor.dual, fixture.a.id, "x-b2s-tenant-id");
    const decoyAnswer = await resolves(decoy);
    if (decoyAnswer.value !== null) {
      failures.push(`a different header carrying tenant A's id resolved ${decoyAnswer.body}, expected null`);
    }

    record(
      "23m",
      "Case-insensitive on the header name and the value; no other header selects",
      failures,
      `${observed.join(", ")}; a near-miss header name resolved ${decoyAnswer.body} for the same doubly-membered ` +
        `caller, so the selection is bound to the name and not to any header that looks like a uuid`,
    );
    expect(failures).toEqual([]);
  });

  it("23n a selector naming a tenant where the membership is suspended — null", async () => {
    const failures: string[] = [];
    const caller = selecting(actor.suspended, fixture.b.id);

    const answer = await resolves(caller);
    if (answer.value !== null) failures.push(`selecting a suspended membership's tenant resolved ${answer.body}, expected null`);
    if (answer.value === fixture.a.id) failures.push("FALLBACK: it resolved the tenant they do hold instead");

    const seen = await reads(caller);
    readsNothing("selecting a tenant where the membership is suspended", seen, failures);

    const held = await sql<{ status: string }>(
      `select status::text as status from public.membership
        where member_id = '${actor.suspended.authId}' and tenant_id = '${fixture.b.id}'`,
    );
    if (held.length !== 1 || held[0].status !== "suspended") {
      failures.push(`precondition: the row is ${JSON.stringify(held)}, expected exactly one suspended row`);
    }

    record(
      "23n",
      "A suspended membership is not held: selecting it resolves null",
      failures,
      `the row exists in tenant B with status ${held.map((r) => r.status).join("/")}; resolved ${answer.body}, ` +
        `read 0 tenant, 0 consent_grant and 0 activity_event rows, and did not fall back to tenant A — ` +
        `suspension is the third non-active status and is the one no other proof reaches`,
    );
    expect(failures).toEqual([]);
  });

  it("23o a caller holding no membership cannot forge one with a selector", async () => {
    const failures: string[] = [];
    const observed: string[] = [];

    // The forgery analysis, asserted rather than argued. The selector is
    // supplied by the caller and anyone may set it to anything; what stops that
    // mattering is that it can only narrow a set re-derived from
    // public.membership, never add to it.
    for (const tenantId of [fixture.a.id, fixture.b.id, actor.c.id]) {
      for (const who of [anonCaller(config), fixture.unaffiliated]) {
        const caller = selecting(who, tenantId);
        const answer = await resolves(caller);
        const acceptable = answer.value === null || (who.label === "anon" && answer.status >= 400);
        if (!acceptable) failures.push(`${who.label} forging a selector for ${tenantId} resolved ${answer.body}`);
        observed.push(`${who.label}->${answer.status >= 400 ? answer.status : answer.body}`);

        const seen = await reads(caller);
        readsNothing(`${who.label} forging a selector for ${tenantId}`, seen, failures);
        if (seen.membership.length !== 0) {
          failures.push(`${who.label} forging a selector read ${seen.membership.length} membership row(s)`);
        }
      }
    }

    // The operator too, whose tenant and consent_grant reads come from
    // is_operator() and are proof 7's subject, so only the resolved id is
    // asserted here: an operator holds no membership and therefore no selector
    // resolves for them either.
    const operatorAnswer = await resolves(selecting(fixture.operator, fixture.a.id));
    if (operatorAnswer.value !== null) {
      failures.push(`an operator selecting tenant A resolved ${operatorAnswer.body}, expected null`);
    }

    record(
      "23o",
      "A forged selector reaches nothing: the header narrows a set, it never adds to one",
      failures,
      `6 (caller, tenant) pairs across anon and an unaffiliated member, over two real tenants and a third: ` +
        `${observed.join(", ")}, every one reading 0 tenant, 0 membership, 0 consent_grant and 0 activity_event ` +
        `rows; an operator selecting tenant A resolved ${operatorAnswer.body}`,
    );
    expect(failures).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// P02-T05 — OD-G13's two acts, and CF-128
// ---------------------------------------------------------------------------

/** current_tenant_id() as the caller sees it, plus the verbatim answer. */
async function resolution(caller: Caller): Promise<Resolution> {
  const answer = await probe.rpc(caller, "current_tenant_id");
  let value: string | null = null;
  try {
    value = JSON.parse(answer.body === "" ? "null" : answer.body) as string | null;
  } catch {
    value = answer.body;
  }
  return { status: answer.status, body: answer.body, value };
}

/**
 * What the caller reads on every public table, as id sets.
 *
 * A refusal carrying 42501 is zero reach and lands as the empty set: anon holds
 * no policy on any of these tables, so it is refused outright rather than
 * filtered to nothing (proof 13). Any OTHER error lands as a marker no
 * assertion here can mistake for an empty read, because an exception raised
 * inside a policy must never pass as isolation working.
 */
async function readsAllSix(caller: Caller): Promise<Record<string, string[]>> {
  const out: Record<string, string[]> = {};
  for (const table of TABLES) {
    const attempt = await probe.select(caller, table);
    if (attempt.ok) out[table] = attempt.ids;
    else if (attempt.code === "42501") out[table] = [];
    else out[table] = [`UNEXPECTED:${attempt.status}:${attempt.code}:${attempt.message.slice(0, 80)}`];
  }
  return out;
}

/** Asserts an exact id set per table, so a row gained is as loud as one lost. */
function readsExactly(
  what: string,
  seen: Record<string, string[]>,
  expected: Partial<Record<TableName, string[]>>,
  failures: string[],
): void {
  for (const table of TABLES) {
    const want = expected[table] ?? [];
    if (!sameSet(seen[table], want)) {
      failures.push(
        `${what}: read ${table} [${seen[table].join(", ")}], expected [${want.join(", ")}]`,
      );
    }
  }
}

describe("proof 24 — member materialisation (OD-G13 act one, DATA_MODEL §3.2)", () => {
  it("24a a materialised Member holds an identity and nothing else", async () => {
    const failures: string[] = [];
    const runId = randomUUID().slice(0, 8);

    // Nothing runs between this identity being created and the read below. No
    // seeding, no membership, no privileged insert — so whatever is in
    // public.member for this id was put there by the trigger, inside the
    // transaction that wrote the auth row.
    const fresh = await makeIdentity(config, "g13-fresh", runId);

    type MemberRow = {
      email: string;
      display_name: string | null;
      created_by: string | null;
      archived_at: string | null;
    };
    const rows = await sql<MemberRow>(`
      select email::text as email, display_name, created_by::text as created_by,
             archived_at::text as archived_at
        from public.member
       where id = '${fresh.authId}'
    `);

    if (rows.length !== 1) {
      failures.push(
        `a freshly authenticated identity has ${rows.length} member row(s) whose id is the identity's own, ` +
          `expected exactly 1 — OD-G13 makes authentication create at most a Member, and at least one`,
      );
    } else {
      const row = rows[0];
      // Case-insensitively, because member.email is citext and the address is
      // what auth wrote. The point is that it is the SAME address, not that the
      // two strings are byte-equal.
      if (row.email.toLowerCase() !== fresh.email.toLowerCase()) {
        failures.push(`member.email is ${row.email}, expected the address this identity authenticated with`);
      }
      if (row.created_by !== null) {
        failures.push(
          `member.created_by is ${row.created_by}, expected null — nobody created this row, ` +
            `the person did by proving an address, and id already records that`,
        );
      }
      if (row.archived_at !== null) failures.push(`member.archived_at is ${row.archived_at}, expected null`);
    }

    // One address is one member.id (OD-G13's identity invariant), stated as a
    // count over the whole table rather than over the row just read.
    const [held] = await sql<{ n: number }>(
      `select count(*)::int as n from public.member where email = '${fresh.email}'::extensions.citext`,
    );
    if (held.n !== 1) failures.push(`${held.n} member rows carry this address, expected exactly 1`);

    // MATERIALISATION GRANTS NOTHING. Every table that could carry a grant,
    // counted through the privileged path so no policy can hide a row.
    const [granted] = await sql<{
      memberships: number;
      tenants: number;
      events: number;
      consents: number;
      operators: number;
    }>(`
      select
        (select count(*) from public.membership where member_id = '${fresh.authId}')::int          as memberships,
        (select count(*) from public.tenant where created_by = '${fresh.authId}')::int             as tenants,
        (select count(*) from public.activity_event
          where actor_member_id = '${fresh.authId}')::int                                         as events,
        (select count(*) from public.consent_grant
          where granted_by = '${fresh.authId}' or created_by = '${fresh.authId}')::int            as consents,
        (select count(*) from public.operator where id = '${fresh.authId}')::int                   as operators
    `);
    for (const [what, count] of Object.entries(granted)) {
      if (count !== 0) failures.push(`materialisation left ${count} ${what} row(s) behind, expected 0`);
    }

    // §2.1's first contract row: no membership, so nothing resolves.
    const resolved = await resolution(fresh);
    if (resolved.value !== null) {
      failures.push(`a member holding no membership resolved ${resolved.body}, expected null`);
    }

    // The six-table read. `member` is the caller's OWN row, returned by
    // member_select_self, and it is not reach into any tenant — the claim is
    // that it is ALL they have. Asserted as an exact set on every table so a
    // seventh row appearing anywhere fails this.
    const seen = await readsAllSix(fresh);
    readsExactly("a fresh member", seen, { member: [fresh.authId] }, failures);

    const ownership = await probe.rpc(fresh, "is_current_tenant_owner");
    const asOperator = await probe.rpc(fresh, "is_operator");
    if (ownership.body !== "false") failures.push(`is_current_tenant_owner answered ${ownership.body}, expected false`);
    if (asOperator.body !== "false") failures.push(`is_operator answered ${asOperator.body}, expected false`);

    record(
      "24a",
      "Authentication materialises a Member and confers nothing at all",
      failures,
      `one identity created and never touched again: exactly 1 member row carrying its own id and address, ` +
        `created_by null, and 0 membership, 0 tenant, 0 activity_event, 0 consent_grant and 0 operator rows ` +
        `referencing it. current_tenant_id() answered ${resolved.body}, is_current_tenant_owner ` +
        `${ownership.body}, is_operator ${asOperator.body}. Reads across all ${TABLES.length} tables: ` +
        `${TABLES.map((t) => `${t}=${seen[t].length}`).join(", ")} — the one row is member_select_self ` +
        `returning the caller's own record`,
    );
    expect(failures).toEqual([]);
  });

  it("24b a second identity for a held address fails closed, and the row already held is unchanged", async () => {
    const failures: string[] = [];
    const observed: string[] = [];
    const runId = randomUUID().slice(0, 8);

    const held = await makeIdentity(config, "g13-held", runId);

    /** The whole row as jsonb text, so "unchanged" means every column. */
    const snapshot = async (): Promise<string> => {
      const rows = await sql<{ row: string }>(
        `select to_jsonb(m.*)::text as row from public.member m where m.id = '${held.authId}'`,
      );
      return rows[0]?.row ?? "<absent>";
    };

    const before = await snapshot();
    if (before === "<absent>") failures.push("precondition: the first identity was not materialised at all");

    // ROUTE ONE — the ordinary sign-up path, recorded and NOT counted as
    // evidence about the trigger. auth.users carries users_email_partial_key,
    // unique on email where is_sso_user = false, so GoTrue refuses a plain
    // duplicate before the trigger is reached. A refusal by the layer in FRONT
    // of the thing under test proves the layer in front (PR-30), which is
    // precisely why routes two and three exist: they are the shapes that
    // partial index does not cover.
    let signupRefusal = "";
    try {
      // The same label and the same runId, so makeIdentity builds the same
      // address. Nothing else about the call differs.
      await makeIdentity(config, "g13-held", runId);
      signupRefusal = "ACCEPTED";
    } catch (cause) {
      signupRefusal = (cause instanceof Error ? cause.message : String(cause)).slice(0, 120);
    }
    observed.push(`gotrue=${signupRefusal === "ACCEPTED" ? "ACCEPTED" : "refused"}`);

    const [afterSignup] = await sql<{ n: number }>(
      `select count(*)::int as n from public.member where email = '${held.email}'::extensions.citext`,
    );
    if (afterSignup.n !== 1) {
      failures.push(`after a duplicate sign-up, ${afterSignup.n} member rows carry the address, expected exactly 1`);
    }

    // ROUTES TWO AND THREE — straight at auth.users, which is the only way to
    // reach the trigger with an address the partial index lets through: a
    // different case, and an SSO identity (where is_sso_user = true takes the
    // row out of users_email_partial_key entirely).
    const instance = "00000000-0000-0000-0000-000000000000";
    const routes: { what: string; id: string; email: string; sso: boolean }[] = [
      { what: "the same address in a different case", id: randomUUID(), email: held.email.toUpperCase(), sso: false },
      { what: "the identical address as an SSO identity", id: randomUUID(), email: held.email, sso: true },
    ];

    for (const route of routes) {
      const attempt = await sql.try(`
        insert into auth.users (id, instance_id, aud, role, email, is_sso_user)
        values ('${route.id}', '${instance}', 'authenticated', 'authenticated',
                '${route.email}', ${route.sso})
      `);

      if (attempt.ok) {
        failures.push(
          `${route.what}: ACCEPTED — a second identity now exists for an address the platform already held, ` +
            `which is the OD-G13 invariant broken`,
        );
        await sql(`
          delete from public.member where id = '${route.id}';
          delete from auth.users where id = '${route.id}';
        `);
      } else {
        // The refusal has to be the TRIGGER's. A 23505 from an auth index would
        // be a different mechanism answering, and would say nothing about what
        // happens when the trigger is reached.
        if (!/member materialisation refused/i.test(attempt.body)) {
          failures.push(
            `${route.what}: refused ${attempt.status} by something other than the trigger — ` +
              `${attempt.body.slice(0, 240)}`,
          );
        }
        if (!/already held by a different member/i.test(attempt.body)) {
          failures.push(
            `${route.what}: the trigger refused, but not as the identity invariant — ${attempt.body.slice(0, 240)}`,
          );
        }
        observed.push(`${route.what}=refused ${attempt.status}`);
      }

      // NO PARTIAL STATE, in both directions. No member row for the refused id,
      // and no auth row either: the trigger fires inside the transaction that
      // inserts into auth.users, so a surviving auth user would mean the
      // identity came into being without its Member.
      const [left] = await sql<{ members: number; users: number }>(`
        select
          (select count(*) from public.member where id = '${route.id}')::int as members,
          (select count(*) from auth.users where id = '${route.id}')::int    as users
      `);
      if (left.members !== 0) failures.push(`${route.what}: left ${left.members} member row(s) behind`);
      if (left.users !== 0) {
        failures.push(
          `${route.what}: the refused auth identity persisted — the transaction did not roll back, ` +
            `so an identity exists with no Member`,
        );
      }
    }

    // Still exactly one row for the address, and the one that was there is
    // byte-identical to what it was before any of this ran. A refusal that
    // quietly relinked or touched the original would pass every count above.
    const [total] = await sql<{ n: number }>(
      `select count(*)::int as n from public.member where email = '${held.email}'::extensions.citext`,
    );
    if (total.n !== 1) failures.push(`${total.n} member rows carry the address afterwards, expected exactly 1`);

    const after = await snapshot();
    if (after !== before) {
      failures.push(`the member row already held changed during the refusals: before ${before} / after ${after}`);
    }

    record(
      "24b",
      "A second identity for a held address fails closed, with no partial write and no linkage",
      failures,
      `3 routes at one held address. The ordinary sign-up path was refused by auth's own partial unique index ` +
        `before the trigger was reached, which is recorded and not counted; the two routes that index does not ` +
        `cover — a case-differing address and an SSO identity — both reached the trigger and were refused ` +
        `naming the OD-G13 invariant. After each, 0 member rows and 0 auth.users rows for the refused id, so ` +
        `the auth transaction rolled back with it. Exactly 1 member row carries the address throughout and its ` +
        `jsonb is byte-identical before and after. Observed: ${observed.join(", ")}`,
    );
    expect(failures).toEqual([]);
  });

  it("24c no authenticated caller writes a member row — their own included", async () => {
    const failures: string[] = [];
    const observed: string[] = [];

    // The prompt's STOP condition, asserted rather than assumed: if the only
    // mechanism that creates a member row also lets an ordinary caller name an
    // id or an address, materialisation is not on the privileged path.
    const [catalog] = await sql<{
      write_policies: string;
      authenticated_insert: boolean;
      anon_insert: boolean;
      authenticated_delete: boolean;
    }>(`
      select
        -- polcmd is of type "char" rather than text, and concatenating the two
        -- has no unique operator. The cast is required and is not cosmetic.
        (select coalesce(string_agg(p.polname || '/' || p.polcmd::text, ', ' order by p.polname), '')
           from pg_policy p
          where p.polrelid = 'public.member'::regclass
            and p.polcmd in ('a', '*'))                                as write_policies,
        has_table_privilege('authenticated', 'public.member', 'INSERT') as authenticated_insert,
        has_table_privilege('anon', 'public.member', 'INSERT')          as anon_insert,
        has_table_privilege('authenticated', 'public.member', 'DELETE') as authenticated_delete
    `);

    if (catalog.write_policies !== "") {
      failures.push(`public.member carries an INSERT-capable policy: ${catalog.write_policies}`);
    }
    if (catalog.authenticated_insert) failures.push("authenticated holds INSERT on public.member");
    if (catalog.anon_insert) failures.push("anon holds INSERT on public.member");
    if (catalog.authenticated_delete) failures.push("authenticated holds DELETE on public.member");

    // And over the wire, because a catalog that reads clean and a request that
    // succeeds have both happened in this repository.
    const stranger = fixture.b.viewer.authId;
    const invented: string[] = [];
    const callers: Caller[] = [fixture.a.owner, fixture.unaffiliated, fixture.operator, anonCaller(config)];

    for (const caller of callers) {
      const mine = (caller as Identity).authId ?? null;
      const freshId = randomUUID();
      const freshEmail = `${SYNTHETIC_PREFIX}forged-${freshId.slice(0, 8)}@example.com`;
      invented.push(freshId);

      const shapes: [string, Record<string, unknown>][] = [
        // The shape a naive `id = auth.uid()` INSERT policy would permit, and
        // the one a client would reach for if materialisation were its job.
        ["their own id and address", { id: mine, email: (caller as Identity).email ?? freshEmail }],
        // The shape that would actually create a row if a grant existed.
        ["an invented id and address", { id: freshId, email: freshEmail }],
        // Someone else's identity, wearing a new address.
        ["a stranger's id", { id: stranger, email: freshEmail }],
      ];

      for (const [what, payload] of shapes) {
        const attempt = await probe.insert(caller, "member", payload);
        if (attempt.ok) {
          failures.push(`${caller.label} inserted a member row naming ${what}`);
          continue;
        }
        // The refusal must be the GRANT's. A 23505 would mean the INSERT was
        // authorised and only a unique key stopped it, which is a finding
        // wearing a passing assertion's clothes.
        if (!refusedByGrant(attempt) && !refusedByPolicy(attempt)) {
          failures.push(
            `${caller.label} naming ${what} was refused ${attempt.status}/${attempt.code} — ` +
              `${attempt.message.slice(0, 140)}, which is not an authorisation refusal`,
          );
        }
        observed.push(`${caller.label}:${what}=${attempt.status}/${attempt.code}`);
      }
    }

    const [leftover] = await sql<{ n: number }>(
      `select count(*)::int as n from public.member where id in (${invented.map((id) => `'${id}'`).join(", ")})`,
    );
    if (leftover.n !== 0) failures.push(`${leftover.n} of the invented member rows exist`);

    record(
      "24c",
      "The member table has no caller-reachable write path, so materialisation is the privileged path's alone",
      failures,
      `no INSERT-capable policy on public.member, and neither anon nor authenticated holds INSERT or DELETE. ` +
        `${callers.length} callers × 3 payload shapes — their own id, an invented one, and a stranger's — all ` +
        `${callers.length * 3} refused on the grant, none on a unique key: ${observed.join(", ")}. 0 of the ` +
        `${invented.length} invented ids exist afterwards`,
    );
    expect(failures).toEqual([]);
  });
});

// ---------------------------------------------------------------------------

type Provisioning = { status: number; body: string; tenantId: string | null };

/** What provision_tenant wrote for this member, counted past every policy. */
type ProvisionedRows = {
  tenants: number;
  memberships: number;
  active_owner: number;
  events: number;
  provisioned_events: number;
};

async function provision(
  who: Caller,
  label: string,
  slug: string,
  currency = "SAR",
  locale = "en",
): Promise<Provisioning> {
  const answer = await probe.rpc(who, "provision_tenant", {
    p_name: `${SYNTHETIC_PREFIX}${label}`,
    p_slug: slug,
    p_base_currency: currency,
    p_default_locale: locale,
  });
  let tenantId: string | null = null;
  try {
    const parsed = JSON.parse(answer.body === "" ? "null" : answer.body) as unknown;
    if (typeof parsed === "string") tenantId = parsed;
  } catch {
    // A refusal carries a Postgres error object rather than a uuid.
  }
  return { status: answer.status, body: answer.body, tenantId };
}

async function provisionedRows(memberId: string): Promise<ProvisionedRows> {
  const [row] = await sql<ProvisionedRows>(`
    select
      (select count(*) from public.tenant t
        where t.created_by = '${memberId}')::int                            as tenants,
      (select count(*) from public.membership m
        where m.member_id = '${memberId}')::int                             as memberships,
      (select count(*) from public.membership m
        where m.member_id = '${memberId}' and m.role = 'owner'
          and m.status = 'active' and m.archived_at is null
          and m.accepted_at is not null)::int                               as active_owner,
      (select count(*) from public.activity_event e
        where e.actor_member_id = '${memberId}')::int                       as events,
      (select count(*) from public.activity_event e
        where e.actor_member_id = '${memberId}'
          and e.action = 'tenant.provisioned' and e.entity_type = 'Tenant'
          and e.entity_id = e.tenant_id and e.payload is null)::int         as provisioned_events
  `);
  return row;
}

function rpcError(body: string): { code: string; message: string } {
  try {
    const parsed = JSON.parse(body) as { code?: string; message?: string };
    return { code: parsed.code ?? "", message: parsed.message ?? body.slice(0, 300) };
  } catch {
    return { code: "", message: body.slice(0, 300) };
  }
}

describe("proof 25 — tenant provisioning (OD-G13 act two, DATA_MODEL §3.1/§3.3/§3.6)", () => {
  let pair: { who: Identity; slug: string; answer: Provisioning }[];


  beforeAll(async () => {
    const runId = randomUUID().slice(0, 8);

    // Assertion (f) is about two members provisioning AT THE SAME TIME, so the
    // two calls are issued together and the answers kept for 25d to assert.
    // 25e then reads the two tenants this produced. Provisioning them here
    // rather than inside either assertion keeps both first-class: neither
    // depends on the other having run.
    const first = await makeIdentity(config, "g13-pair-one", runId);
    const second = await makeIdentity(config, "g13-pair-two", runId);
    const slugs = [`${SYNTHETIC_PREFIX}pair-one-${runId}`, `${SYNTHETIC_PREFIX}pair-two-${runId}`];

    const answers = await Promise.all([
      provision(first, `pair-one-${runId}`, slugs[0]),
      provision(second, `pair-two-${runId}`, slugs[1]),
    ]);

    pair = [
      { who: first, slug: slugs[0], answer: answers[0] },
      { who: second, slug: slugs[1], answer: answers[1] },
    ];
  }, 240_000);

  it("25a provisioning writes exactly one tenant, one active owner membership and one event", async () => {
    const failures: string[] = [];
    const runId = randomUUID().slice(0, 8);
    const solo = await makeIdentity(config, "g13-solo", runId);
    const slug = `${SYNTHETIC_PREFIX}solo-${runId}`;

    // The second-act rule, measured before the act: authentication wrote the
    // Member and nothing else, so all five counts start at zero.
    const before = await provisionedRows(solo.authId);
    for (const [what, count] of Object.entries(before)) {
      if (count !== 0) failures.push(`precondition: authentication alone left ${count} ${what}, expected 0`);
    }

    const answer = await provision(solo, `solo-${runId}`, slug);
    if (answer.status !== 200) {
      failures.push(`provisioning answered ${answer.status} ${answer.body.slice(0, 240)}, expected 200`);
    }
    if (answer.tenantId === null) {
      failures.push(`provisioning returned ${answer.body.slice(0, 120)}, expected the new tenant's uuid`);
    }

    const after = await provisionedRows(solo.authId);
    const expected: ProvisionedRows = {
      tenants: 1,
      memberships: 1,
      active_owner: 1,
      events: 1,
      provisioned_events: 1,
    };
    for (const [what, want] of Object.entries(expected)) {
      const got = (after as unknown as Record<string, number>)[what];
      if (got !== want) failures.push(`${what} = ${got} after one provisioning call, expected ${want}`);
    }

    if (answer.tenantId !== null) {
      // The three rows are each other's, not merely three rows. A function that
      // wrote a membership into some other tenant would satisfy every count
      // above.
      const [row] = await sql<{
        slug: string;
        status: string;
        created_by: string | null;
        archived_at: string | null;
        membership_tenant: string | null;
        event_tenant: string | null;
        event_operator: string | null;
      }>(`
        select t.slug, t.status::text as status, t.created_by::text as created_by,
               t.archived_at::text as archived_at,
               (select m.tenant_id::text from public.membership m
                 where m.member_id = '${solo.authId}')                  as membership_tenant,
               (select e.tenant_id::text from public.activity_event e
                 where e.actor_member_id = '${solo.authId}')            as event_tenant,
               (select e.actor_operator_id::text from public.activity_event e
                 where e.actor_member_id = '${solo.authId}')            as event_operator
          from public.tenant t
         where t.id = '${answer.tenantId}'
      `);

      if (row === undefined) {
        failures.push(`provisioning returned ${answer.tenantId} and no tenant carries that id`);
      } else {
        if (row.slug !== slug) failures.push(`tenant.slug is ${row.slug}, expected ${slug}`);
        if (row.status !== "active") failures.push(`tenant.status is ${row.status}, expected active`);
        if (row.created_by !== solo.authId) {
          failures.push(`tenant.created_by is ${row.created_by}, expected the caller`);
        }
        if (row.archived_at !== null) failures.push(`tenant.archived_at is ${row.archived_at}, expected null`);
        if (row.membership_tenant !== answer.tenantId) {
          failures.push(`the owner membership points at ${row.membership_tenant}, expected the new tenant`);
        }
        if (row.event_tenant !== answer.tenantId) {
          failures.push(`the activity_event points at ${row.event_tenant}, expected the new tenant`);
        }
        if (row.event_operator !== null) {
          failures.push(`activity_event.actor_operator_id is ${row.event_operator}, expected null — a member acted`);
        }
      }
    }

    // And the caller now holds exactly that tenant, over the wire.
    const resolved = await resolution(solo);
    if (resolved.value !== answer.tenantId) {
      failures.push(`after provisioning the caller resolved ${resolved.body}, expected the tenant just created`);
    }
    const seen = await readsAllSix(solo);
    const [ownRows] = await sql<{ membership: string; event: string }>(`
      select
        (select m.id::text from public.membership m where m.member_id = '${solo.authId}')       as membership,
        (select e.id::text from public.activity_event e
          where e.actor_member_id = '${solo.authId}')                                          as event
    `);
    readsExactly(
      "the provisioning caller",
      seen,
      {
        tenant: answer.tenantId === null ? [] : [answer.tenantId],
        member: [solo.authId],
        membership: [ownRows.membership],
        activity_event: [ownRows.event],
      },
      failures,
    );

    // The same slug again. The uniqueness that stops it fires on the FIRST of
    // the three inserts, so this is the atomicity case at step one, and the
    // counts afterwards must still read one apiece rather than one plus a
    // stray membership.
    const twice = await provision(solo, `solo-${runId}`, slug);
    if (twice.status < 400) failures.push(`a duplicate slug was accepted, answering ${twice.status}`);
    const afterTwice = await provisionedRows(solo.authId);
    for (const [what, want] of Object.entries(expected)) {
      const got = (afterTwice as unknown as Record<string, number>)[what];
      if (got !== want) failures.push(`a refused duplicate changed ${what} to ${got}, expected ${want}`);
    }

    record(
      "25a",
      "One provisioning call writes exactly one tenant, one active owner membership and one event, and they are each other's",
      failures,
      `all five counts 0 before the call and 1 after: tenant created_by the caller with status active, an ` +
        `owner/active/accepted membership pointing at that tenant, and one tenant.provisioned activity_event ` +
        `on Tenant with entity_id = tenant_id, null payload and no operator actor. The caller then resolved ` +
        `${resolved.body} and read exactly ${TABLES.map((t) => `${t}=${seen[t].length}`).join(", ")}. A repeat ` +
        `of the same slug answered ${twice.status} and left all five counts at 1`,
    );
    expect(failures).toEqual([]);
  });

  it("25b a failure mid-provisioning leaves no tenant, no membership and no event", async () => {
    const failures: string[] = [];
    const observed: string[] = [];
    const runId = randomUUID().slice(0, 8);
    const faulty = await makeIdentity(config, "g13-fault", runId);

    // ATOMICITY BY ROLLBACK, NOT BY INSPECTION. Reading the function and
    // agreeing that it looks transactional is not evidence. A fault is injected
    // AFTER the tenant insert has already succeeded, the call is made, and the
    // tenant is then looked for. If it is there, the mechanism is not atomic.
    //
    // The trigger lives in its own schema and is gated on this one member's id,
    // so it cannot touch any other row in the database while it exists. Both
    // fault points are exercised: after the tenant (breaking the membership
    // insert) and after tenant + membership (breaking the event insert).
    const faultPoints: [string, string, string][] = [
      [
        "after the tenant insert",
        "public.membership",
        `new.member_id = '${faulty.authId}'`,
      ],
      [
        "after the tenant and membership inserts",
        "public.activity_event",
        `new.actor_member_id = '${faulty.authId}'`,
      ],
    ];

    try {
      await sql(`
        create schema if not exists ${FAULT_SCHEMA};

        create or replace function ${FAULT_SCHEMA}.break()
        returns trigger
        language plpgsql
        as $fault$
        begin
          raise exception 'zz-test fault injection: this write is refused on purpose'
            using errcode = 'raise_exception';
        end
        $fault$;
      `);

      for (const [where, table, when] of faultPoints) {
        const slug = `${SYNTHETIC_PREFIX}fault-${randomUUID().slice(0, 8)}`;

        await sql(`
          create trigger ${FAULT_SCHEMA}_provision_break
          before insert on ${table}
          for each row when (${when})
          execute function ${FAULT_SCHEMA}.break();
        `);

        const answer = await provision(faulty, `fault-${runId}`, slug);

        await sql(`drop trigger ${FAULT_SCHEMA}_provision_break on ${table};`);

        if (answer.status < 400) {
          failures.push(`${where}: provisioning answered ${answer.status} while the fault was armed`);
        }
        if (!/fault injection/i.test(answer.body)) {
          failures.push(
            `${where}: the call failed for a reason other than the injected fault — ${answer.body.slice(0, 240)}`,
          );
        }
        observed.push(`${where}=${answer.status}`);

        // The rollback, counted three ways. The tenant is looked for BY SLUG as
        // well as by creator, because a tenant that survived with a null
        // created_by would slip past the creator count.
        const [left] = await sql<{
          tenants: number;
          by_slug: number;
          memberships: number;
          events: number;
        }>(`
          select
            (select count(*) from public.tenant where created_by = '${faulty.authId}')::int      as tenants,
            (select count(*) from public.tenant where slug = '${slug}')::int                     as by_slug,
            (select count(*) from public.membership where member_id = '${faulty.authId}')::int   as memberships,
            (select count(*) from public.activity_event
              where actor_member_id = '${faulty.authId}')::int                                  as events
        `);
        for (const [what, count] of Object.entries(left)) {
          if (count !== 0) {
            failures.push(`${where}: the rollback left ${count} ${what}, expected 0 — provisioning is not atomic`);
          }
        }
      }
    } finally {
      // A fault injection that outlives its proof is a live defect wearing a
      // test's name. Dropped here whatever happened above, and counted again by
      // teardown.
      await sql(`drop schema if exists ${FAULT_SCHEMA} cascade;`);
    }

    // THE CONTROL. Without it, every zero above is satisfied by a function that
    // is simply broken for this caller, and the assertion would pass while
    // proving nothing about rollback.
    const cleanSlug = `${SYNTHETIC_PREFIX}fault-clean-${runId}`;
    const clean = await provision(faulty, `fault-clean-${runId}`, cleanSlug);
    if (clean.status !== 200 || clean.tenantId === null) {
      failures.push(
        `control: with no fault armed the same caller answered ${clean.status} ${clean.body.slice(0, 200)}, ` +
          `expected a tenant — the zero counts above prove nothing if provisioning cannot succeed`,
      );
    }
    const controlRows = await provisionedRows(faulty.authId);
    if (controlRows.tenants !== 1 || controlRows.active_owner !== 1 || controlRows.provisioned_events !== 1) {
      failures.push(
        `control: an unimpeded call wrote ${controlRows.tenants} tenant(s), ${controlRows.active_owner} active ` +
          `owner membership(s) and ${controlRows.provisioned_events} event(s), expected 1 of each`,
      );
    }

    const [residue] = await sql<{ schemas: number; triggers: number }>(`
      select
        (select count(*) from pg_namespace where nspname = '${FAULT_SCHEMA}')::int as schemas,
        (select count(*) from pg_trigger t join pg_class c on c.oid = t.tgrelid
          where not t.tgisinternal and t.tgname like '${FAULT_SCHEMA}%')::int      as triggers
    `);
    if (residue.schemas !== 0 || residue.triggers !== 0) {
      failures.push(`the fault injection left ${residue.schemas} schema(s) and ${residue.triggers} trigger(s)`);
    }

    record(
      "25b",
      "A failure at any step of provisioning rolls the whole act back — atomicity proven by forcing one",
      failures,
      `2 fault points injected in turn, one after the tenant insert and one after the tenant and membership ` +
        `inserts, each a trigger gated on this caller alone: ${observed.join(", ")}, both refused naming the ` +
        `injected fault. After each, 0 tenants by creator, 0 by slug, 0 memberships and 0 events. The control ` +
        `— the same caller with nothing armed — answered ${clean.status} and wrote 1 tenant, 1 active owner ` +
        `membership and 1 event, so the zeroes are the rollback's and not a broken function's. No fault schema ` +
        `or trigger survives`,
    );
    expect(failures).toEqual([]);
  });

  it("25c the provisioning caller cannot name anyone else as the owner", async () => {
    const failures: string[] = [];
    const observed: string[] = [];
    const runId = randomUUID().slice(0, 8);
    const namer = await makeIdentity(config, "g13-namer", runId);
    const victim = fixture.b.viewer;

    // The signature is the argument. There is no member parameter, so there is
    // nothing to name: the owner is auth.uid(), read out of the verified token.
    // Asserted against the catalog rather than against the migration text.
    const [signature] = await sql<{ args: string; argnames: string; arity: number }>(`
      select pg_get_function_identity_arguments(p.oid)                      as args,
             coalesce(array_to_string(p.proargnames, ','), '')              as argnames,
             p.pronargs::int                                                as arity
        from pg_proc p
       where p.pronamespace = 'public'::regnamespace
         and p.proname = 'provision_tenant'
    `);
    // The rendered identity carries the parameter names as well as the types,
    // so this one comparison says four arguments, all text, named these and
    // nothing else. The arity is asserted separately because a signature that
    // grew a fifth argument is the specific failure this proof exists to catch.
    const expectedSignature = "p_name text, p_slug text, p_base_currency text, p_default_locale text";
    if (signature.args !== expectedSignature) {
      failures.push(`provision_tenant takes (${signature.args}), expected exactly (${expectedSignature})`);
    }
    if (signature.arity !== 4) failures.push(`provision_tenant takes ${signature.arity} arguments, expected 4`);
    if (signature.argnames !== "p_name,p_slug,p_base_currency,p_default_locale") {
      failures.push(`its parameters are ${signature.argnames}, expected p_name,p_slug,p_base_currency,p_default_locale`);
    }
    if (/member|owner|actor|creat|uid|user/i.test(signature.argnames)) {
      failures.push(`a parameter name suggests an identity can be named: ${signature.argnames}`);
    }

    // And over the wire: six spellings of "make someone else the owner", each
    // of which PostgREST has to reject because no such parameter exists.
    for (const name of ["p_member_id", "member_id", "p_owner_id", "p_owner", "p_created_by", "p_actor_member_id"]) {
      const attempt = await probe.rpc(namer, "provision_tenant", {
        p_name: `${SYNTHETIC_PREFIX}namer`,
        p_slug: `${SYNTHETIC_PREFIX}namer-${randomUUID().slice(0, 8)}`,
        p_base_currency: "SAR",
        p_default_locale: "en",
        [name]: victim.authId,
      });
      if (attempt.status < 400) {
        failures.push(`provision_tenant accepted a ${name} argument, answering ${attempt.status}`);
      }
      observed.push(`${name}=${attempt.status}`);
    }

    // The positive case, and the one that matters: a legitimate call while
    // SELECTING a tenant the caller does not hold. If the selector could
    // redirect ownership, this is where it would.
    const slug = `${SYNTHETIC_PREFIX}namer-${runId}`;
    const answer = await provision(selecting(namer, fixture.b.id), `namer-${runId}`, slug);
    if (answer.status !== 200 || answer.tenantId === null) {
      failures.push(`provisioning answered ${answer.status} ${answer.body.slice(0, 200)}, expected a tenant`);
    }

    // A uuid that matches nothing stands in when the call above failed, so this
    // assertion still records a line rather than throwing on a malformed
    // literal. The pushed failure above is the result in that case.
    const created = answer.tenantId ?? randomUUID();
    const [owners] = await sql<{ rows: string; victim_rows: number; creator: string | null }>(`
      select
        (select coalesce(string_agg(m.member_id::text || '/' || m.role::text, ', '), '')
           from public.membership m where m.tenant_id = '${created}')                     as rows,
        (select count(*) from public.membership m
          where m.tenant_id = '${created}' and m.member_id = '${victim.authId}')::int
                                                                                          as victim_rows,
        (select t.created_by::text from public.tenant t where t.id = '${created}')         as creator
    `);
    if (owners.rows !== `${namer.authId}/owner`) {
      failures.push(`the new tenant's memberships are [${owners.rows}], expected the caller alone as owner`);
    }
    if (owners.victim_rows !== 0) failures.push(`${owners.victim_rows} membership(s) were created for the named victim`);
    if (owners.creator !== namer.authId) failures.push(`tenant.created_by is ${owners.creator}, expected the caller`);

    // And the victim gained nothing they can see.
    const victimSees = await probe.selectById(victim, "tenant", created);
    if (!wasRefused(victimSees)) {
      failures.push(`the named victim reads the tenant provisioned in their name (${victimSees.count} row(s))`);
    }

    record(
      "25c",
      "Provisioning has no owner parameter, so the only tenant a caller can create is one they own",
      failures,
      `the catalog shows provision_tenant(${signature.args}) — ${signature.arity} arguments, all text, none of ` +
        `them naming a member, owner, actor or creator. 6 spellings of an owner argument all rejected: ` +
        `${observed.join(", ")}. A legitimate call made while selecting a tenant the caller does not hold still ` +
        `produced exactly one membership, ${owners.rows}, with created_by the caller and 0 rows for the named ` +
        `victim, who reads nothing of it`,
    );
    expect(failures).toEqual([]);
  });

  it("25d two members provisioning at the same time each get one tenant, and only their own", async () => {
    const failures: string[] = [];
    const [one, two] = pair;

    for (const side of pair) {
      if (side.answer.status !== 200 || side.answer.tenantId === null) {
        failures.push(
          `${side.who.label} answered ${side.answer.status} ${side.answer.body.slice(0, 200)} — concurrent ` +
            `provisioning must succeed for both callers, not one`,
        );
      }
    }
    if (one.answer.tenantId !== null && one.answer.tenantId === two.answer.tenantId) {
      failures.push(`both callers were given the same tenant id ${one.answer.tenantId}`);
    }

    // Each wrote exactly its own three rows. Two calls in flight together must
    // not produce four memberships, or two events on one tenant.
    for (const side of pair) {
      const rows = await provisionedRows(side.who.authId);
      if (rows.tenants !== 1 || rows.active_owner !== 1 || rows.provisioned_events !== 1) {
        failures.push(
          `${side.who.label} holds ${rows.tenants} tenant(s), ${rows.active_owner} active owner membership(s) ` +
            `and ${rows.provisioned_events} event(s), expected 1 of each`,
        );
      }
      if (rows.memberships !== 1 || rows.events !== 1) {
        failures.push(`${side.who.label} holds ${rows.memberships} membership(s) and ${rows.events} event(s), expected 1 each`);
      }
    }

    // And each resolves to its own, which is the concurrency claim: neither
    // call's session picked up the other's tenant.
    const resolutions: string[] = [];
    for (const side of pair) {
      const resolved = await resolution(side.who);
      resolutions.push(`${side.who.label}=${resolved.body}`);
      if (resolved.value !== side.answer.tenantId) {
        failures.push(`${side.who.label} resolved ${resolved.body}, expected the tenant it provisioned`);
      }
    }

    const [both] = await sql<{ tenants: number; owners: number }>(`
      select
        (select count(*) from public.tenant
          where slug in ('${one.slug}', '${two.slug}'))::int                    as tenants,
        (select count(*) from public.membership m
          join public.tenant t on t.id = m.tenant_id
         where t.slug in ('${one.slug}', '${two.slug}'))::int                   as owners
    `);
    if (both.tenants !== 2) failures.push(`${both.tenants} tenants carry the two slugs, expected 2`);
    if (both.owners !== 2) failures.push(`${both.owners} memberships exist across the two tenants, expected 2`);

    record(
      "25d",
      "Two provisioning calls in flight together produce two separate tenants, each owned by its own caller",
      failures,
      `both calls issued together answered 200 with distinct tenant ids; each caller holds exactly 1 tenant, ` +
        `1 owner/active membership and 1 event, and resolves to its own: ${resolutions.join(", ")}. Across the ` +
        `two slugs: ${both.tenants} tenants and ${both.owners} memberships in total`,
    );
    expect(failures).toEqual([]);
  });

  it("25e a provisioned tenant is invisible to the other's owner, on every table and both ways", async () => {
    const failures: string[] = [];
    const [one, two] = pair;

    if (one.answer.tenantId === null || two.answer.tenantId === null) {
      failures.push("precondition: the two concurrent provisionings did not both produce a tenant");
    }

    // Every id belonging to each side, so the check is "reads none of the
    // other's rows" rather than "reads few rows".
    const rowsOf = async (memberId: string, tenantId: string | null) => {
      const [row] = await sql<{ membership: string | null; event: string | null }>(`
        select
          (select m.id::text from public.membership m
            where m.member_id = '${memberId}')                                as membership,
          (select e.id::text from public.activity_event e
            where e.actor_member_id = '${memberId}')                          as event
      `);
      return { tenant: tenantId, member: memberId, ...row };
    };

    const sides = [
      { ...one, own: await rowsOf(one.who.authId, one.answer.tenantId) },
      { ...two, own: await rowsOf(two.who.authId, two.answer.tenantId) },
    ];

    for (const [index, side] of sides.entries()) {
      const other = sides[1 - index];
      const seen = await readsAllSix(side.who);

      readsExactly(
        side.who.label,
        seen,
        {
          tenant: side.own.tenant === null ? [] : [side.own.tenant],
          member: [side.own.member],
          membership: side.own.membership === null ? [] : [side.own.membership],
          activity_event: side.own.event === null ? [] : [side.own.event],
        },
        failures,
      );

      // Stated the other way round as well, because an exact-set failure names
      // what was read and this names WHOSE it was.
      const foreign = [other.own.tenant, other.own.member, other.own.membership, other.own.event]
        .filter((id): id is string => id !== null);
      for (const table of TABLES) {
        for (const id of foreign) {
          if (seen[table].includes(id)) failures.push(`${side.who.label} read ${other.who.label}'s ${id} on ${table}`);
        }
      }

      // And not as a filtered lookup either, which is the existence-oracle
      // shape SECURITY_MODEL §1 forbids.
      for (const table of TENANT_SCOPED_TABLES) {
        const targeted = await probe.selectById(side.who, table, other.own.tenant ?? randomUUID());
        if (!wasRefused(targeted)) {
          failures.push(`${side.who.label} reached ${other.who.label}'s tenant id on ${table} by filtering for it`);
        }
      }

      // Selecting the other's tenant explicitly resolves null rather than
      // falling back to the one they hold.
      const forged = await resolution(selecting(side.who, other.own.tenant ?? randomUUID()));
      if (forged.value !== null) {
        failures.push(`${side.who.label} selecting the other's tenant resolved ${forged.body}, expected null`);
      }
    }

    record(
      "25e",
      "Tenants created by provisioning are isolated from each other exactly as seeded ones are",
      failures,
      `both directions across all ${TABLES.length} tables: each owner reads exactly its own tenant, its own ` +
        `member row, its own membership and its own event, and none of the other's ${4} ids on any table. ` +
        `Filtering for the other's tenant id on each of the ${TENANT_SCOPED_TABLES.length} tenant-scoped ` +
        `tables returned nothing, and selecting it resolved null rather than the held tenant`,
    );
    expect(failures).toEqual([]);
  });

  it("25f provisioning is a second act: no sign-in reaches it, and no unauthenticated or memberless caller can", async () => {
    const failures: string[] = [];
    const observed: string[] = [];
    const runId = randomUUID().slice(0, 8);

    // NEVER A SIDE EFFECT OF AUTHENTICATION. An identity that has done nothing
    // but sign in holds no tenant, and nothing in the schema calls the function
    // on its behalf.
    const signedIn = await makeIdentity(config, "g13-signin", runId);
    const sideEffects = await provisionedRows(signedIn.authId);
    for (const [what, count] of Object.entries(sideEffects)) {
      if (count !== 0) {
        failures.push(`signing in alone produced ${count} ${what} — provisioning is not supposed to be reachable implicitly`);
      }
    }
    const signedInReads = await resolution(signedIn);
    if (signedInReads.value !== null) failures.push(`a signed-in identity resolved ${signedInReads.body}, expected null`);

    // Nothing calls it: no trigger, no default, no policy expression, no other
    // function body. Asserted against the catalog, because "nothing calls it"
    // is the whole of the second-act guarantee.
    const [callers] = await sql<{ triggers: number; defaults: number; policies: number; bodies: string }>(`
      select
        (select count(*) from pg_trigger t
          where not t.tgisinternal
            and t.tgfoid = 'public.provision_tenant(text,text,text,text)'::regprocedure)::int as triggers,
        (select count(*) from pg_attrdef d
          where pg_get_expr(d.adbin, d.adrelid) like '%provision_tenant%')::int               as defaults,
        (select count(*) from pg_policy p
          where coalesce(pg_get_expr(p.polqual, p.polrelid), '') like '%provision_tenant%'
             or coalesce(pg_get_expr(p.polwithcheck, p.polrelid), '') like '%provision_tenant%')::int
                                                                                              as policies,
        (select coalesce(string_agg(p.proname, ', ' order by p.proname), '')
           from pg_proc p
          where p.pronamespace = 'public'::regnamespace
            and p.proname <> 'provision_tenant'
            and p.prosrc like '%provision_tenant%')                                           as bodies
    `);
    if (callers.triggers !== 0) failures.push(`${callers.triggers} trigger(s) call provision_tenant`);
    if (callers.defaults !== 0) failures.push(`${callers.defaults} column default(s) mention provision_tenant`);
    if (callers.policies !== 0) failures.push(`${callers.policies} policy expression(s) mention provision_tenant`);
    if (callers.bodies !== "") failures.push(`provision_tenant is called from ${callers.bodies}`);

    // UNAUTHENTICATED, and an authenticated identity holding no live Member.
    // The second is the second-act rule in the failure direction: provisioning
    // consumes a Member and can never be the thing that repairs a missing one.
    const archived = await makeIdentity(config, "g13-archived", runId);
    await sql(`update public.member set archived_at = now() where id = '${archived.authId}'`);

    const refusals: [string, Caller, RegExp | null][] = [
      ["anon", anonCaller(config), null],
      ["an authenticated identity whose member row is archived", archived, /holds no live member record/i],
    ];

    for (const [what, caller, expectedMessage] of refusals) {
      const slug = `${SYNTHETIC_PREFIX}refused-${randomUUID().slice(0, 8)}`;
      const attempt = await provision(caller, `refused-${runId}`, slug);
      if (attempt.status < 400) failures.push(`${what} provisioned a tenant, answering ${attempt.status}`);
      if (expectedMessage !== null && !expectedMessage.test(attempt.body)) {
        failures.push(`${what} was refused ${attempt.status} for the wrong reason — ${attempt.body.slice(0, 200)}`);
      }
      const [left] = await sql<{ n: number }>(`select count(*)::int as n from public.tenant where slug = '${slug}'`);
      if (left.n !== 0) failures.push(`${what}: a refused call left ${left.n} tenant(s) behind`);
      observed.push(`${what}=${attempt.status}`);
    }

    // anon is not merely unproductive here, it is absent: EXECUTE was revoked
    // as well as the body refusing.
    const [grants] = await sql<{ anon: boolean; service: boolean; authenticated: boolean }>(`
      select
        has_function_privilege('anon', 'public.provision_tenant(text,text,text,text)', 'EXECUTE')          as anon,
        has_function_privilege('service_role', 'public.provision_tenant(text,text,text,text)', 'EXECUTE')  as service,
        has_function_privilege('authenticated', 'public.provision_tenant(text,text,text,text)', 'EXECUTE') as authenticated
    `);
    if (grants.anon) failures.push("anon holds EXECUTE on provision_tenant");
    if (grants.service) failures.push("service_role holds EXECUTE on provision_tenant");
    if (!grants.authenticated) failures.push("authenticated does not hold EXECUTE on provision_tenant");

    record(
      "25f",
      "Provisioning is reached only by an authenticated caller who already holds a live Member, and never implicitly",
      failures,
      `an identity that only signed in holds 0 tenants, 0 memberships and 0 events and resolves ` +
        `${signedInReads.body}. Nothing in the catalog calls the function: 0 triggers, 0 column defaults, ` +
        `0 policy expressions and no other function body mentions it. Refusals: ${observed.join(", ")}, ` +
        `neither leaving a tenant behind, and the archived-member case named the live-Member rule. EXECUTE is ` +
        `held by authenticated alone — not anon, not service_role`,
    );
    expect(failures).toEqual([]);
  });
});

// ---------------------------------------------------------------------------

describe("proof 26 — a duplicated tenant selector (CF-128)", () => {
  it("26 two x-b2s-tenant headers resolve null, over HTTP and in process", async () => {
    const failures: string[] = [];
    const observed: string[] = [];

    // The caller holds EXACTLY ONE active membership, and that is what makes
    // this measurable. If a duplicated header were dropped somewhere in the
    // transport, the selector would read as absent and this caller would
    // resolve their one held tenant implicitly — so `null` proves the header
    // arrived and was a non-match, and tenant A would prove it vanished. There
    // is no need for an echo endpoint to see the wire shape: the two outcomes
    // are distinguishable.
    const single = fixture.a.owner;
    const control = await resolution(single);
    if (control.value !== fixture.a.id) {
      failures.push(
        `control: with no selector this caller resolved ${control.body}, expected tenant A — the null answers ` +
          `below would prove nothing`,
      );
    }
    const controlSelected = await resolution(selecting(single, fixture.a.id));
    if (controlSelected.value !== fixture.a.id) {
      failures.push(`control: one valid selector resolved ${controlSelected.body}, expected tenant A`);
    }

    const garbage = "not-a-uuid";
    const absent = randomUUID();
    const cases: [string, string, string][] = [
      ["the same held tenant twice", fixture.a.id, fixture.a.id],
      ["the held tenant then an unheld one", fixture.a.id, fixture.b.id],
      ["an unheld tenant then the held one", fixture.b.id, fixture.a.id],
      ["the held tenant then a nonexistent one", fixture.a.id, absent],
      ["the held tenant then garbage", fixture.a.id, garbage],
      ["garbage then the held tenant", garbage, fixture.a.id],
    ];

    for (const [what, first, second] of cases) {
      const caller = selectingTwice(single, first, second);
      const answer = await resolution(caller);

      if (answer.status !== 200) {
        failures.push(`${what}: answered ${answer.status} ${answer.body.slice(0, 200)}, expected 200 and null`);
      }
      if (answer.value === fixture.a.id) {
        failures.push(
          `${what}: FELL BACK to the caller's one held tenant — a duplicated selector must not resolve, and ` +
            `resolving the held tenant is the behaviour OD-G14's contract forbids for any non-match`,
        );
      } else if (answer.value !== null) {
        failures.push(`${what}: resolved ${answer.body}, expected null`);
      }

      // And it reads nothing. membership is excluded because
      // membership_select_own is deliberately wider than the tenancy spine —
      // a person always sees their own rows (DATA_MODEL §3.3) — so it is
      // asserted as foreign rows instead.
      const seen = await readsAllSix(caller);
      for (const table of SELECTOR_TABLES) {
        if (table === "membership") continue;
        if (seen[table].length !== 0) {
          failures.push(`${what}: read ${seen[table].length} ${table} row(s) [${seen[table].join(", ")}], expected none`);
        }
      }
      const foreign = await probe.selectColumns(caller, "membership", "id,member_id,tenant_id");
      const strangers = foreign.rows.filter((row) => row.member_id !== single.authId);
      if (strangers.length !== 0) {
        failures.push(`${what}: read ${strangers.length} membership row(s) belonging to another member`);
      }

      observed.push(`${what}=${answer.body}`);
    }

    // IN PROCESS, per PR-30. Over HTTP undici normalises two headers of the
    // same name into one comma-joined field value, which is the shape CF-128
    // names — but "the transport joined them" is an assumption until the joined
    // value is put to the helper directly. Both shapes a header pair can take
    // in `request.headers` are forged here: the comma-joined string PostgREST
    // actually sets, and a JSON array, which is what a future intermediary or
    // PostgREST version could set instead.
    const forge = async (label: string, headers: Record<string, unknown>) => {
      const tag = `dup${randomUUID().replace(/-/g, "").slice(0, 12)}`;
      const json = JSON.stringify(headers);
      const outcome = await sql.try(`
        select res.resolved
          from (
            select set_config('request.jwt.claims',
                              jsonb_build_object('sub', '${single.authId}')::text, true) as claims,
                   set_config('request.headers', $${tag}$${json}$${tag}$, true)           as headers
          ) cfg,
          lateral (
            select case when cfg.claims is not null and cfg.headers is not null
                        then public.current_tenant_id()::text
                   end as resolved
          ) res
      `);
      return { label, outcome };
    };

    const direct = [
      await forge("comma-joined, both held", { [TENANT_SELECTOR_HEADER]: `${fixture.a.id},${fixture.a.id}` }),
      await forge("comma-joined, held then unheld", { [TENANT_SELECTOR_HEADER]: `${fixture.a.id},${fixture.b.id}` }),
      await forge("comma-and-space joined", { [TENANT_SELECTOR_HEADER]: `${fixture.a.id}, ${fixture.b.id}` }),
      await forge("a JSON array of two values", { [TENANT_SELECTOR_HEADER]: [fixture.a.id, fixture.b.id] }),
    ];

    for (const { label, outcome } of direct) {
      if (!outcome.ok) {
        failures.push(`${label}: the helper RAISED rather than resolving — ${outcome.body.slice(0, 200)}`);
        continue;
      }
      if (outcome.body.includes(fixture.a.id) || outcome.body.includes(fixture.b.id)) {
        failures.push(`${label}: resolved a tenant through the direct path — ${outcome.body.slice(0, 200)}`);
      }
      observed.push(`direct:${label}=null`);
    }

    // The control for the direct path, exactly as 23h does it: without one, a
    // path that answered null to everything would pass this proof while
    // exercising nothing.
    const directControl = await forge("one valid value", { [TENANT_SELECTOR_HEADER]: fixture.a.id });
    if (!directControl.outcome.ok || !directControl.outcome.body.includes(fixture.a.id)) {
      failures.push(
        `control: one valid selector through the direct path answered ` +
          `${directControl.outcome.body.slice(0, 200)}, expected tenant A — the direct nulls prove nothing`,
      );
    }

    record(
      "26",
      "A duplicated tenant selector resolves null and never falls back to the tenant the caller holds",
      failures,
      `${cases.length} duplicate-header pairs sent over HTTP by a caller holding exactly one active membership, ` +
        `each answering 200/null with 0 tenant, 0 consent_grant and 0 activity_event rows and no foreign ` +
        `membership row: ${observed.filter((o) => !o.startsWith("direct:")).join(", ")}. Because that caller ` +
        `resolves tenant A when no header is sent and when one valid header is sent, null is the selector ` +
        `arriving and failing to match rather than the header being dropped. In process, 4 forged shapes — ` +
        `comma-joined, comma-and-space joined, and a JSON array — all resolved null with nothing raised, ` +
        `while one valid value through that same path resolved tenant A`,
    );
    expect(failures).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// P02-T12 — OD-G17, OD-G18, OD-G16. Every probe lands permanently (OD-H11).
// ---------------------------------------------------------------------------

describe("proof 27 — OD-G17 locale and currency, both directions", () => {
  it(
    "27a default_locale rejects every value outside {en, ar} and accepts both inside",
    async () => {
      const failures: string[] = [];
      const runId = randomUUID().slice(0, 8);
      const who = await makeIdentity(config, "g17-locale", runId);
      const rejected: string[] = [];
      const accepted: string[] = [];

      const outside = ["fr", "EN", "en-GB", "", "zh"];
      for (const [index, locale] of outside.entries()) {
        const slug = `${SYNTHETIC_PREFIX}g17-bad-loc-${runId}-${index}`;
        const answer = await provision(who, `g17-bad-loc-${runId}-${index}`, slug, "SAR", locale);
        const rows = await provisionedRows(who.authId);
        if (answer.status < 400) {
          failures.push(`locale ${JSON.stringify(locale)}: ACCEPTED ${answer.status} ${answer.body.slice(0, 120)}`);
        } else if (rows.tenants !== 0) {
          failures.push(`locale ${JSON.stringify(locale)}: refused but ${rows.tenants} tenant(s) persisted`);
        } else {
          rejected.push(`${JSON.stringify(locale)}→${rpcError(answer.body).message.slice(0, 80)}`);
        }
      }

      for (const locale of ["en", "ar"]) {
        const slug = `${SYNTHETIC_PREFIX}g17-ok-loc-${locale}-${runId}`;
        const before = await provisionedRows(who.authId);
        const answer = await provision(who, `g17-ok-loc-${locale}-${runId}`, slug, "SAR", locale);
        const after = await provisionedRows(who.authId);
        if (answer.status !== 200 || answer.tenantId === null) {
          failures.push(`locale ${locale}: POSITIVE PATH REFUSED ${answer.status} ${answer.body.slice(0, 200)}`);
        } else if (after.tenants !== before.tenants + 1) {
          failures.push(`locale ${locale}: tenants ${before.tenants} → ${after.tenants}, expected +1`);
        } else {
          const [row] = await sql<{ default_locale: string }>(
            `select default_locale from public.tenant where id = '${answer.tenantId}'`,
          );
          if (row.default_locale !== locale) {
            failures.push(`locale ${locale}: stored ${row.default_locale}`);
          } else {
            accepted.push(locale);
          }
        }
      }

      record(
        "27a",
        "default_locale rejects outside {en, ar} and accepts both values inside",
        failures,
        `${outside.length} outside values refused with 0 tenants left: ${rejected.join("; ")}. ` +
          `Inside accepted and stored: ${accepted.join(", ")}`,
      );
      expect(failures).toEqual([]);
    },
    240_000,
  );

  it(
    "27b base_currency rejects every value outside the five and accepts every value inside",
    async () => {
      const failures: string[] = [];
      const runId = randomUUID().slice(0, 8);
      const first = await makeIdentity(config, "g17-ccy-a", runId);
      const second = await makeIdentity(config, "g17-ccy-b", runId);
      const rejected: string[] = [];
      const accepted: string[] = [];

      const outside = ["GBP", "egp", "usd", "XXX"];
      for (const [index, currency] of outside.entries()) {
        const slug = `${SYNTHETIC_PREFIX}g17-bad-ccy-${runId}-${index}`;
        const answer = await provision(first, `g17-bad-ccy-${runId}-${index}`, slug, currency, "en");
        const rows = await provisionedRows(first.authId);
        if (answer.status < 400) {
          failures.push(`currency ${JSON.stringify(currency)}: ACCEPTED ${answer.status} ${answer.body.slice(0, 120)}`);
        } else if (rows.tenants !== 0) {
          failures.push(`currency ${JSON.stringify(currency)}: refused but ${rows.tenants} tenant(s) persisted`);
        } else {
          rejected.push(`${JSON.stringify(currency)}→${rpcError(answer.body).message.slice(0, 80)}`);
        }
      }

      // G18 caps one member at three successful provisions. Five accepted
      // values therefore need two members; the split is not a weakening.
      const batches: [Identity, string[]][] = [
        [first, ["EGP", "USD", "SAR"]],
        [second, ["AED", "EUR"]],
      ];
      for (const [who, currencies] of batches) {
        for (const currency of currencies) {
          const slug = `${SYNTHETIC_PREFIX}g17-ok-ccy-${currency.toLowerCase()}-${runId}`;
          const before = await provisionedRows(who.authId);
          const answer = await provision(who, `g17-ok-ccy-${currency}-${runId}`, slug, currency, "en");
          const after = await provisionedRows(who.authId);
          if (answer.status !== 200 || answer.tenantId === null) {
            failures.push(`currency ${currency}: POSITIVE PATH REFUSED ${answer.status} ${answer.body.slice(0, 200)}`);
          } else if (after.tenants !== before.tenants + 1) {
            failures.push(`currency ${currency}: tenants ${before.tenants} → ${after.tenants}, expected +1`);
          } else {
            const [row] = await sql<{ base_currency: string }>(
              `select base_currency from public.tenant where id = '${answer.tenantId}'`,
            );
            if (row.base_currency !== currency) {
              failures.push(`currency ${currency}: stored ${row.base_currency}`);
            } else {
              accepted.push(currency);
            }
          }
        }
      }

      record(
        "27b",
        "base_currency rejects outside {EGP, USD, SAR, AED, EUR} and accepts every value inside",
        failures,
        `${outside.length} outside values refused with 0 tenants left: ${rejected.join("; ")}. ` +
          `Inside accepted and stored: ${accepted.join(", ")}`,
      );
      expect(failures).toEqual([]);
    },
    240_000,
  );
});

describe("proof 28 — OD-G18 bounds, including the race", () => {
  it(
    "28a the fourth active owned tenant is refused",
    async () => {
      const failures: string[] = [];
      const runId = randomUUID().slice(0, 8);
      const who = await makeIdentity(config, "g18-owned", runId);
      const landed: string[] = [];

      for (let n = 1; n <= 3; n += 1) {
        const slug = `${SYNTHETIC_PREFIX}g18-owned-${runId}-${n}`;
        const answer = await provision(who, `g18-owned-${runId}-${n}`, slug);
        if (answer.status !== 200 || answer.tenantId === null) {
          failures.push(`provision ${n}: REFUSED ${answer.status} ${answer.body.slice(0, 200)}`);
        } else {
          landed.push(answer.tenantId);
        }
      }

      const before = await provisionedRows(who.authId);
      const fourth = await provision(who, `g18-owned-${runId}-4`, `${SYNTHETIC_PREFIX}g18-owned-${runId}-4`);
      const after = await provisionedRows(who.authId);

      if (fourth.status < 400) {
        failures.push(`fourth tenant: ACCEPTED ${fourth.status} ${fourth.body.slice(0, 200)}`);
      }
      if (after.tenants !== 3 || after.active_owner !== 3) {
        failures.push(`after fourth: tenants=${after.tenants} active_owner=${after.active_owner}, expected 3/3`);
      }
      if (after.tenants !== before.tenants || after.memberships !== before.memberships) {
        failures.push(`fourth call changed counts: ${JSON.stringify(before)} → ${JSON.stringify(after)}`);
      }

      record(
        "28a",
        "A fourth active owned tenant is refused",
        failures,
        `3 tenants landed [${landed.join(", ")}]; fourth answered ${fourth.status} ` +
          `"${rpcError(fourth.body).message.slice(0, 120)}"; owned remains ${after.active_owner}`,
      );
      expect(failures).toEqual([]);
    },
    240_000,
  );

  it(
    "28b the fourth provisioning act in 24 hours is refused with fewer than three owned tenants",
    async () => {
      const failures: string[] = [];
      const runId = randomUUID().slice(0, 8);
      const who = await makeIdentity(config, "g18-rate", runId);

      await sql(`
        insert into public.activity_event (tenant_id, actor_member_id, action, entity_type, entity_id, occurred_at)
        values
          ('${fixture.a.id}', '${who.authId}', 'tenant.provisioned', 'Tenant', '${fixture.a.id}', now()),
          ('${fixture.a.id}', '${who.authId}', 'tenant.provisioned', 'Tenant', '${fixture.a.id}', now()),
          ('${fixture.a.id}', '${who.authId}', 'tenant.provisioned', 'Tenant', '${fixture.a.id}', now())
      `);

      const before = await provisionedRows(who.authId);
      if (before.tenants !== 0 || before.active_owner !== 0) {
        failures.push(`precondition: caller already owns ${before.active_owner} tenant(s)`);
      }

      const answer = await provision(who, `g18-rate-${runId}`, `${SYNTHETIC_PREFIX}g18-rate-${runId}`);
      const after = await provisionedRows(who.authId);

      if (answer.status < 400) {
        failures.push(`rate-limited act: ACCEPTED ${answer.status} ${answer.body.slice(0, 200)}`);
      }
      if (after.tenants !== 0 || after.memberships !== 0) {
        failures.push(`rate-limited act left tenants=${after.tenants} memberships=${after.memberships}`);
      }

      record(
        "28b",
        "A fourth provisioning act inside 24 hours is refused even when the caller owns none",
        failures,
        `3 tenant.provisioned events inserted for a member who owns 0; provision answered ${answer.status} ` +
          `"${rpcError(answer.body).message.slice(0, 120)}"; tenants=${after.tenants} memberships=${after.memberships}`,
      );
      expect(failures).toEqual([]);
    },
    240_000,
  );

  it(
    "28c an act outside the 24-hour window succeeds",
    async () => {
      const failures: string[] = [];
      const runId = randomUUID().slice(0, 8);
      const who = await makeIdentity(config, "g18-window", runId);

      await sql(`
        insert into public.activity_event (tenant_id, actor_member_id, action, entity_type, entity_id, occurred_at)
        values
          ('${fixture.a.id}', '${who.authId}', 'tenant.provisioned', 'Tenant', '${fixture.a.id}', now() - interval '25 hours'),
          ('${fixture.a.id}', '${who.authId}', 'tenant.provisioned', 'Tenant', '${fixture.a.id}', now() - interval '25 hours'),
          ('${fixture.a.id}', '${who.authId}', 'tenant.provisioned', 'Tenant', '${fixture.a.id}', now() - interval '25 hours')
      `);

      const before = await provisionedRows(who.authId);
      const answer = await provision(who, `g18-window-${runId}`, `${SYNTHETIC_PREFIX}g18-window-${runId}`);
      const after = await provisionedRows(who.authId);

      if (answer.status !== 200 || answer.tenantId === null) {
        failures.push(`act outside the window: REFUSED ${answer.status} ${answer.body.slice(0, 200)}`);
      }
      if (after.tenants !== before.tenants + 1 || after.active_owner !== 1) {
        failures.push(`after outside-window act: tenants=${after.tenants} active_owner=${after.active_owner}`);
      }

      record(
        "28c",
        "A provisioning act older than 24 hours does not consume the rolling window",
        failures,
        `3 events at now()-25h; provision answered ${answer.status} tenant=${answer.tenantId}; ` +
          `owned ${before.active_owner} → ${after.active_owner}`,
      );
      expect(failures).toEqual([]);
    },
    240_000,
  );

  it(
    "28d two concurrent calls against one member: exactly one succeeds",
    async () => {
      const failures: string[] = [];
      const runId = randomUUID().slice(0, 8);
      const who = await makeIdentity(config, "g18-race", runId);

      for (const n of [1, 2]) {
        const answer = await provision(who, `g18-race-pre-${runId}-${n}`, `${SYNTHETIC_PREFIX}g18-race-pre-${runId}-${n}`);
        if (answer.status !== 200 || answer.tenantId === null) {
          failures.push(`setup provision ${n}: REFUSED ${answer.status} ${answer.body.slice(0, 200)}`);
        }
      }

      const before = await provisionedRows(who.authId);
      if (before.active_owner !== 2) {
        failures.push(`precondition: owned ${before.active_owner}, expected 2 so the race is at the bound`);
      }

      const startedAt = Date.now();
      const [left, right] = await Promise.all([
        provision(who, `g18-race-l-${runId}`, `${SYNTHETIC_PREFIX}g18-race-l-${runId}`),
        provision(who, `g18-race-r-${runId}`, `${SYNTHETIC_PREFIX}g18-race-r-${runId}`),
      ]);
      const elapsedMs = Date.now() - startedAt;
      const after = await provisionedRows(who.authId);

      const successes = [left, right].filter((answer) => answer.status === 200 && answer.tenantId !== null);
      const refusals = [left, right].filter((answer) => answer.status >= 400);

      if (successes.length !== 1) {
        failures.push(
          `concurrent pair produced ${successes.length} success(es) and ${refusals.length} refusal(s); ` +
            `left=${left.status} right=${right.status}; owned=${after.active_owner}`,
        );
      }
      if (after.active_owner !== 3 || after.tenants !== 3) {
        failures.push(`after the pair: tenants=${after.tenants} owned=${after.active_owner}, expected 3/3`);
      }
      if (successes.length === 2 && after.active_owner === 4) {
        failures.push("the race was lost: both calls inserted, which is the bare-count failure OD-G18 names");
      }

      record(
        "28d",
        "Two concurrent provisioning calls against one member: exactly one succeeds",
        failures,
        `Promise.all of two provision_tenant RPCs for one member already owning 2, distinct slugs, ` +
          `elapsed ${elapsedMs}ms; successes=${successes.length} (${successes.map((s) => s.tenantId).join(", ")}) ` +
          `refusals=${refusals.length} (${refusals.map((r) => `${r.status}:${rpcError(r.body).message.slice(0, 60)}`).join("; ")}); ` +
          `owned ${before.active_owner} → ${after.active_owner}`,
      );
      expect(failures).toEqual([]);
    },
    240_000,
  );

  it(
    "28e a refusal leaves no tenant, membership or event",
    async () => {
      const failures: string[] = [];
      const runId = randomUUID().slice(0, 8);
      const who = await makeIdentity(config, "g18-refuse", runId);

      for (let n = 1; n <= 3; n += 1) {
        const answer = await provision(who, `g18-ref-pre-${runId}-${n}`, `${SYNTHETIC_PREFIX}g18-ref-pre-${runId}-${n}`);
        if (answer.status !== 200) {
          failures.push(`setup ${n}: ${answer.status} ${answer.body.slice(0, 160)}`);
        }
      }

      const before = await provisionedRows(who.authId);
      const [totalsBefore] = await sql<{ tenants: number; memberships: number; events: number }>(`
        select
          (select count(*) from public.tenant)::int as tenants,
          (select count(*) from public.membership)::int as memberships,
          (select count(*) from public.activity_event)::int as events
      `);

      const refused = await provision(who, `g18-ref-${runId}`, `${SYNTHETIC_PREFIX}g18-ref-${runId}`);
      const after = await provisionedRows(who.authId);
      const [totalsAfter] = await sql<{ tenants: number; memberships: number; events: number }>(`
        select
          (select count(*) from public.tenant)::int as tenants,
          (select count(*) from public.membership)::int as memberships,
          (select count(*) from public.activity_event)::int as events
      `);

      if (refused.status < 400) {
        failures.push(`expected a refusal, got ${refused.status} ${refused.body.slice(0, 200)}`);
      }
      for (const key of ["tenants", "memberships", "active_owner", "events", "provisioned_events"] as const) {
        if (after[key] !== before[key]) {
          failures.push(`caller's ${key}: ${before[key]} → ${after[key]}`);
        }
      }
      if (
        totalsAfter.tenants !== totalsBefore.tenants ||
        totalsAfter.memberships !== totalsBefore.memberships ||
        totalsAfter.events !== totalsBefore.events
      ) {
        failures.push(
          `catalog moved: tenants ${totalsBefore.tenants}→${totalsAfter.tenants}, ` +
            `memberships ${totalsBefore.memberships}→${totalsAfter.memberships}, ` +
            `events ${totalsBefore.events}→${totalsAfter.events}`,
        );
      }

      record(
        "28e",
        "A refused provisioning call leaves no tenant, membership or event",
        failures,
        `fourth call answered ${refused.status} "${rpcError(refused.body).message.slice(0, 120)}"; ` +
          `caller ${JSON.stringify(before)} unchanged; catalog tenants/memberships/events ` +
          `${totalsBefore.tenants}/${totalsBefore.memberships}/${totalsBefore.events} unchanged`,
      );
      expect(failures).toEqual([]);
    },
    240_000,
  );
});

describe("proof 29 — OD-G16 invitation by email, closing CF-121", () => {
  const accept = async (who: Caller, invitationId: string) => {
    const answer = await probe.rpc(who, "accept_invitation", { p_invitation_id: invitationId });
    let membershipId: string | null = null;
    try {
      const parsed = JSON.parse(answer.body === "" ? "null" : answer.body) as unknown;
      if (typeof parsed === "string") membershipId = parsed;
    } catch {
      membershipId = null;
    }
    return { status: answer.status, body: answer.body, membershipId, error: rpcError(answer.body) };
  };

  it(
    "29a an invitation to an address with no member row is accepted by exactly that person",
    async () => {
      const failures: string[] = [];
      const runId = randomUUID().slice(0, 8);
      const email = `${SYNTHETIC_PREFIX}g16-accept-${runId}@example.com`;
      const invitationId = randomUUID();

      const issued = await probe.insert(fixture.a.owner, "invitation", {
        id: invitationId,
        tenant_id: fixture.a.id,
        email,
        role: "viewer",
        expires_at: futureIso(1),
      });
      if (!issued.ok) {
        failures.push(`owner INSERT invitation: REFUSED ${issued.status} (${issued.code}) ${issued.message}`);
      }

      const [membersBefore] = await sql<{ n: number }>(
        `select count(*)::int as n from public.member where email = '${email.replace(/'/g, "''")}'`,
      );
      if (membersBefore.n !== 0) {
        failures.push(`precondition: ${membersBefore.n} member row(s) already hold ${email}`);
      }

      const invitee = await makeIdentity(config, "g16-accept", runId, email);

      const ownerAccept = await accept(fixture.a.owner, invitationId);
      if (ownerAccept.status < 400) {
        failures.push(`issuing owner accepted the invitation: ${ownerAccept.status} ${ownerAccept.body.slice(0, 160)}`);
      }

      const hijackId = randomUUID();
      const hijack = await probe.insert(fixture.a.owner, "membership", {
        id: hijackId,
        tenant_id: fixture.a.id,
        member_id: invitee.authId,
        role: "viewer",
        status: "active",
      });
      if (hijack.ok) {
        failures.push("owner INSERT active membership for the invitee: ACCEPTED");
        await sql(`delete from public.membership where id = '${hijackId}'`);
      }

      const accepted = await accept(invitee, invitationId);
      if (accepted.status !== 200 || accepted.membershipId === null) {
        failures.push(`invitee accept: ${accepted.status} ${accepted.body.slice(0, 240)}`);
      } else {
        const [row] = await sql<{
          member_id: string;
          tenant_id: string;
          status: string;
          role: string;
        }>(`
          select member_id::text, tenant_id::text, status::text, role::text
            from public.membership where id = '${accepted.membershipId}'
        `);
        if (row.member_id !== invitee.authId) failures.push(`membership.member_id is ${row.member_id}`);
        if (row.tenant_id !== fixture.a.id) failures.push(`membership.tenant_id is ${row.tenant_id}`);
        if (row.status !== "active") failures.push(`membership.status is ${row.status}`);
        if (row.role !== "viewer") failures.push(`membership.role is ${row.role}`);
      }

      record(
        "29a",
        "An invitation issued to an address with no member row is accepted by exactly the person who proves that address",
        failures,
        `issued to ${email} while member-count was ${membersBefore.n}; owner accept refused ${ownerAccept.status}; ` +
          `owner active-membership insert refused ${hijack.status}; invitee accept ${accepted.status} ` +
          `membership=${accepted.membershipId}`,
      );
      expect(failures).toEqual([]);
    },
    240_000,
  );

  it(
    "29b an unverified identity cannot accept",
    async () => {
      const failures: string[] = [];
      const runId = randomUUID().slice(0, 8);
      const email = `${SYNTHETIC_PREFIX}g16-unverified-${runId}@example.com`;
      const invitationId = randomUUID();

      const issued = await probe.insert(fixture.a.owner, "invitation", {
        id: invitationId,
        tenant_id: fixture.a.id,
        email,
        role: "viewer",
        expires_at: futureIso(1),
      });
      if (!issued.ok) failures.push(`issue: ${issued.status} ${issued.message}`);

      const invitee = await makeIdentity(config, "g16-unverified", runId, email);
      await sql(`update auth.users set email_confirmed_at = null where id = '${invitee.authId}'`);

      const [confirmed] = await sql<{ v: string | null }>(
        `select email_confirmed_at::text as v from auth.users where id = '${invitee.authId}'`,
      );
      if (confirmed.v !== null) failures.push(`precondition: email_confirmed_at is still ${confirmed.v}`);

      const missing = await accept(invitee, randomUUID());
      const targeted = await accept(invitee, invitationId);

      if (targeted.status < 400) {
        failures.push(`unverified accept: ACCEPTED ${targeted.status} ${targeted.body.slice(0, 160)}`);
      }
      if (!/verified this email address/i.test(targeted.error.message)) {
        failures.push(`unverified message was "${targeted.error.message}", expected the verified-identity refusal`);
      }
      if (missing.error.code !== targeted.error.code || missing.error.message !== targeted.error.message) {
        failures.push(
          `unverified missing vs real diverged: ${missing.error.code}/${missing.error.message} vs ` +
            `${targeted.error.code}/${targeted.error.message}`,
        );
      }

      const [memberships] = await sql<{ n: number }>(
        `select count(*)::int as n from public.membership where member_id = '${invitee.authId}'`,
      );
      if (memberships.n !== 0) failures.push(`unverified accept left ${memberships.n} membership row(s)`);

      record(
        "29b",
        "An unverified identity cannot accept, and the refusal does not disclose whether the invitation exists",
        failures,
        `email_confirmed_at nulled after sign-in; accept of a real id and of a random id both ${targeted.status} ` +
          `"${targeted.error.message}" (${targeted.error.code}); memberships=${memberships.n}`,
      );
      expect(failures).toEqual([]);
    },
    240_000,
  );

  it(
    "29c tenant A's owner cannot read, alter or accept tenant B's invitation",
    async () => {
      const failures: string[] = [];
      const { a, b } = fixture;

      const seen = await probe.selectColumns(a.owner, "invitation", "id,email");
      if (!seen.ids.includes(a.invitationId)) {
        failures.push(`A-owner SELECT invitation missed own seeded row ${a.invitationId}; read [${seen.ids.join(", ")}]`);
      }
      if (seen.ids.includes(b.invitationId)) {
        failures.push("A-owner SELECT invitation: LEAKED tenant B's invitation");
      }

      const beforeArchived = await columnValue("invitation", b.invitationId, "archived_at");
      const withdraw = await probe.update(a.owner, "invitation", b.invitationId, {
        archived_at: new Date().toISOString(),
      });
      const afterArchived = await columnValue("invitation", b.invitationId, "archived_at");
      if (withdraw.count > 0) failures.push("A-owner PATCH tenant B invitation.archived_at: ACCEPTED");
      if (afterArchived !== beforeArchived) {
        failures.push(`A-owner PATCH changed B.archived_at from ${beforeArchived} to ${afterArchived}`);
      }

      const beforeAccepted = await columnValue("invitation", b.invitationId, "accepted_at");
      const markSpent = await probe.update(a.owner, "invitation", b.invitationId, {
        accepted_at: new Date().toISOString(),
      });
      const afterAccepted = await columnValue("invitation", b.invitationId, "accepted_at");
      if (markSpent.ok && markSpent.count > 0) {
        failures.push("A-owner PATCH tenant B invitation.accepted_at: ACCEPTED");
      } else if (markSpent.ok) {
        failures.push("A-owner PATCH accepted_at matched zero rows silently; expected a grant refusal");
      } else if (!refusedByGrant(markSpent)) {
        failures.push(`A-owner PATCH accepted_at refused as "${markSpent.message}", expected a grant refusal`);
      }
      if (afterAccepted !== beforeAccepted) {
        failures.push(`accepted_at changed from ${beforeAccepted} to ${afterAccepted}`);
      }

      const foreign = await accept(a.owner, b.invitationId);
      const absent = await accept(a.owner, randomUUID());
      if (foreign.status < 400) failures.push(`A-owner accepted B's invitation: ${foreign.status}`);
      if (foreign.error.code !== absent.error.code || foreign.error.message !== absent.error.message) {
        failures.push(
          `accept of B vs nonexistent diverged: ${foreign.error.code}/${foreign.error.message} vs ` +
            `${absent.error.code}/${absent.error.message}`,
        );
      }

      record(
        "29c",
        "Tenant A's Owner cannot read, alter or accept tenant B's invitation",
        failures,
        `SELECT ids=[${seen.ids.join(", ")}]; PATCH archived_at ${withdraw.status}/${withdraw.count}; ` +
          `PATCH accepted_at ${markSpent.status} "${markSpent.message.slice(0, 80)}"; ` +
          `accept B ${foreign.status} "${foreign.error.message}" identical to nonexistent`,
      );
      expect(failures).toEqual([]);
    },
    240_000,
  );

  it(
    "29d a spent invitation cannot be replayed",
    async () => {
      const failures: string[] = [];
      const runId = randomUUID().slice(0, 8);
      const email = `${SYNTHETIC_PREFIX}g16-replay-${runId}@example.com`;
      const invitationId = randomUUID();

      const issued = await probe.insert(fixture.a.owner, "invitation", {
        id: invitationId,
        tenant_id: fixture.a.id,
        email,
        role: "viewer",
        expires_at: futureIso(1),
      });
      if (!issued.ok) failures.push(`issue: ${issued.status} ${issued.message}`);

      const invitee = await makeIdentity(config, "g16-replay", runId, email);
      const first = await accept(invitee, invitationId);
      if (first.status !== 200 || first.membershipId === null) {
        failures.push(`first accept: ${first.status} ${first.body.slice(0, 200)}`);
      }

      const replay = await accept(invitee, invitationId);
      if (replay.status < 400) {
        failures.push(`replay: ACCEPTED ${replay.status} ${replay.body.slice(0, 160)}`);
      }
      if (replay.error.message !== "invitation acceptance refused") {
        failures.push(`replay message "${replay.error.message}", expected the generic invitation-side refusal`);
      }

      const [count] = await sql<{ n: number }>(
        `select count(*)::int as n from public.membership where member_id = '${invitee.authId}' and tenant_id = '${fixture.a.id}'`,
      );
      if (count.n !== 1) failures.push(`memberships for invitee in A: ${count.n}, expected 1`);

      record(
        "29d",
        "A spent invitation cannot be replayed",
        failures,
        `first accept ${first.status} membership=${first.membershipId}; replay ${replay.status} ` +
          `"${replay.error.message}"; memberships in A remain ${count.n}`,
      );
      expect(failures).toEqual([]);
    },
    240_000,
  );

  it(
    "29e an expired invitation cannot be accepted",
    async () => {
      const failures: string[] = [];
      const runId = randomUUID().slice(0, 8);
      const email = `${SYNTHETIC_PREFIX}g16-expired-${runId}@example.com`;
      const invitationId = randomUUID();

      const invitee = await makeIdentity(config, "g16-expired", runId, email);
      await sql(`
        insert into public.invitation (id, tenant_id, email, role, expires_at, created_by)
        values (
          '${invitationId}',
          '${fixture.a.id}',
          '${email.replace(/'/g, "''")}',
          'viewer',
          now() - interval '1 hour',
          '${fixture.a.owner.authId}'
        )
      `);

      const answered = await accept(invitee, invitationId);
      if (answered.status < 400) {
        failures.push(`expired accept: ACCEPTED ${answered.status} ${answered.body.slice(0, 160)}`);
      }
      if (answered.error.message !== "invitation acceptance refused") {
        failures.push(`expired message "${answered.error.message}", expected the generic invitation-side refusal`);
      }

      const [memberships] = await sql<{ n: number }>(
        `select count(*)::int as n from public.membership where member_id = '${invitee.authId}'`,
      );
      if (memberships.n !== 0) failures.push(`expired accept left ${memberships.n} membership row(s)`);

      const spent = await columnValue("invitation", invitationId, "accepted_at");
      if (spent !== null) failures.push(`expired invitation was marked spent at ${spent}`);

      record(
        "29e",
        "An expired invitation cannot be accepted",
        failures,
        `privileged insert with expires_at = now()-1h; accept ${answered.status} "${answered.error.message}"; ` +
          `memberships=${memberships.n}; accepted_at=${spent}`,
      );
      expect(failures).toEqual([]);
    },
    240_000,
  );

  it(
    "29f acceptance produces exactly one active membership and no other row",
    async () => {
      const failures: string[] = [];
      const runId = randomUUID().slice(0, 8);
      const email = `${SYNTHETIC_PREFIX}g16-once-${runId}@example.com`;
      const invitationId = randomUUID();

      const issued = await probe.insert(fixture.a.owner, "invitation", {
        id: invitationId,
        tenant_id: fixture.a.id,
        email,
        role: "designer",
        expires_at: futureIso(1),
      });
      if (!issued.ok) failures.push(`issue: ${issued.status} ${issued.message}`);

      const invitee = await makeIdentity(config, "g16-once", runId, email);

      const [catalogBefore] = await sql<{
        tenants: number;
        memberships: number;
        invitations: number;
        events: number;
      }>(`
        select
          (select count(*) from public.tenant)::int as tenants,
          (select count(*) from public.membership)::int as memberships,
          (select count(*) from public.invitation)::int as invitations,
          (select count(*) from public.activity_event)::int as events
      `);

      const accepted = await accept(invitee, invitationId);
      if (accepted.status !== 200 || accepted.membershipId === null) {
        failures.push(`accept: ${accepted.status} ${accepted.body.slice(0, 200)}`);
      }

      const [catalogAfter] = await sql<{
        tenants: number;
        memberships: number;
        invitations: number;
        events: number;
      }>(`
        select
          (select count(*) from public.tenant)::int as tenants,
          (select count(*) from public.membership)::int as memberships,
          (select count(*) from public.invitation)::int as invitations,
          (select count(*) from public.activity_event)::int as events
      `);

      if (catalogAfter.tenants !== catalogBefore.tenants) {
        failures.push(`tenant count ${catalogBefore.tenants} → ${catalogAfter.tenants}`);
      }
      if (catalogAfter.events !== catalogBefore.events) {
        failures.push(`event count ${catalogBefore.events} → ${catalogAfter.events}`);
      }
      if (catalogAfter.invitations !== catalogBefore.invitations) {
        failures.push(`invitation count ${catalogBefore.invitations} → ${catalogAfter.invitations} (spent, not duplicated)`);
      }
      if (catalogAfter.memberships !== catalogBefore.memberships + 1) {
        failures.push(`membership count ${catalogBefore.memberships} → ${catalogAfter.memberships}, expected +1`);
      }

      const [mine] = await sql<{ n: number }>(`
        select count(*)::int as n
          from public.membership
         where member_id = '${invitee.authId}'
           and tenant_id = '${fixture.a.id}'
           and status = 'active'
           and archived_at is null
      `);
      if (mine.n !== 1) failures.push(`active memberships for invitee in A: ${mine.n}`);

      const [inviteeTenants] = await sql<{ n: number }>(
        `select count(*)::int as n from public.tenant where created_by = '${invitee.authId}'`,
      );
      if (inviteeTenants.n !== 0) failures.push(`invitee created ${inviteeTenants.n} tenant(s)`);

      record(
        "29f",
        "Acceptance produces exactly one active membership and no other row",
        failures,
        `catalog tenants/events/invitations unchanged at ${catalogAfter.tenants}/${catalogAfter.events}/${catalogAfter.invitations}; ` +
          `memberships ${catalogBefore.memberships} → ${catalogAfter.memberships}; ` +
          `invitee's active memberships in A = ${mine.n}; tenants created by invitee = ${inviteeTenants.n}`,
      );
      expect(failures).toEqual([]);
    },
    240_000,
  );

  it("29g the invited address is not readable by an unaffiliated member", async () => {
    const failures: string[] = [];
    const seen = await probe.selectColumns(fixture.unaffiliated, "invitation", "id,email,tenant_id,role");

    if (!seen.ok) {
      failures.push(`unaffiliated SELECT invitation: errored ${seen.status} (${seen.code}) ${seen.message}`);
    } else if (seen.count !== 0) {
      failures.push(`unaffiliated read ${seen.count} invitation row(s): ${JSON.stringify(seen.rows)}`);
    }

    const emails = seen.rows.map((row) => row.email).filter((value) => value !== undefined && value !== null);
    if (emails.length > 0) {
      failures.push(`unaffiliated read invitation email(s): ${emails.join(", ")}`);
    }

    record(
      "29g",
      "The invited address is not readable by an unaffiliated member",
      failures,
      `unaffiliated SELECT invitation id,email,tenant_id,role → ${seen.count} row(s); emails disclosed: ${emails.length}`,
    );
    expect(failures).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// P02-T13 — OD-G19 and ConsentGrant reach. Group 30. Existing proofs 7, 10,
// 11, 20a, 20b and 21 are unchanged: none is weakened or restated so a new
// one can pass.
// ---------------------------------------------------------------------------

const OPERATOR_PRIVILEGES = [
  "SELECT",
  "INSERT",
  "UPDATE",
  "DELETE",
  "TRUNCATE",
  "REFERENCES",
  "TRIGGER",
] as const;

/** Exact privilege grid OD-G19's migration leaves on public.operator. */
const OPERATOR_PRIVILEGE_GRID: Record<string, Record<(typeof OPERATOR_PRIVILEGES)[number], boolean>> = {
  anon: {
    SELECT: false,
    INSERT: false,
    UPDATE: false,
    DELETE: false,
    TRUNCATE: false,
    REFERENCES: false,
    TRIGGER: false,
  },
  authenticated: {
    SELECT: true,
    INSERT: false,
    UPDATE: false,
    DELETE: false,
    TRUNCATE: false,
    REFERENCES: false,
    TRIGGER: false,
  },
  service_role: {
    SELECT: true,
    INSERT: false,
    UPDATE: false,
    DELETE: false,
    TRUNCATE: false,
    REFERENCES: false,
    TRIGGER: false,
  },
};

/**
 * operator_read_activity_event, in process, with the operator's jwt claims
 * forged on the privileged connection. No PostgREST, no Cloudflare. The
 * function is security definer and reads auth.uid() from request.jwt.claims,
 * so this exercises the body the HTTP path would, without the network.
 */
function operatorReadInProcess(operatorId: string, tenantId: string) {
  return sql.try(`
    select res.id
      from (
        select set_config(
                 'request.jwt.claims',
                 jsonb_build_object('sub', '${operatorId}', 'role', 'authenticated')::text,
                 true
               ) as claims
      ) cfg,
      lateral public.operator_read_activity_event('${tenantId}'::uuid) res
     where cfg.claims is not null
  `);
}

async function operatorRowJson(id: string): Promise<string> {
  const [row] = await sql<{ row: unknown }>(
    `select to_jsonb(o) as row from public.operator o where id = '${id}'`,
  );
  return JSON.stringify(row?.row ?? null);
}

async function operatorCount(): Promise<number> {
  const [row] = await sql<{ n: number }>(`select count(*)::int as n from public.operator`);
  return row.n;
}

async function eventsOn(tenantId: string): Promise<number> {
  const [row] = await sql<{ n: number }>(
    `select count(*)::int as n from public.activity_event where tenant_id = '${tenantId}'`,
  );
  return row.n;
}

describe("proof 30 — operator is system-managed, and ConsentGrant reach (OD-G19)", () => {
  it("30a every seeded identity is refused UPDATE on operator, and no row changes", async () => {
    const failures: string[] = [];
    const httpObserved: string[] = [];
    const id = fixture.operator.authId;
    const before = await operatorRowJson(id);

    for (const identity of fixture.everyIdentity) {
      const attempt = await probe.update(identity, "operator", id, {
        revoked_at: new Date().toISOString(),
      });
      if (attempt.ok && attempt.count > 0) {
        failures.push(`${identity.label} UPDATE operator: ACCEPTED`);
      } else if (!refusedByGrant(attempt)) {
        failures.push(
          `${identity.label} UPDATE operator: "${attempt.status}/${attempt.code} ${attempt.message}", ` +
            `expected a grant refusal — a silent no-op would mean the privilege existed and RLS hid the row`,
        );
      }
      httpObserved.push(`${identity.label}=${attempt.status}/${attempt.code}`);
    }

    const after = await operatorRowJson(id);
    if (after !== before) failures.push(`operator row changed: ${before} → ${after}`);

    const [catalog] = await sql<{ authenticated_update: boolean }>(
      `select has_table_privilege('authenticated', 'public.operator', 'UPDATE') as authenticated_update`,
    );
    if (catalog.authenticated_update) {
      failures.push("in-process: authenticated holds UPDATE on public.operator");
    }

    record(
      "30a",
      "Every seeded identity is refused UPDATE on public.operator, and the row is unchanged",
      failures,
      `HTTP ${fixture.everyIdentity.length} identities, all grant-refused: ${httpObserved.join(", ")}; ` +
        `row jsonb unchanged. In-process: authenticated UPDATE=${catalog.authenticated_update}`,
    );
    expect(failures).toEqual([]);
  });

  it("30b every seeded identity is refused DELETE on operator, and the row count is unchanged", async () => {
    const failures: string[] = [];
    const httpObserved: string[] = [];
    const id = fixture.operator.authId;
    const before = await operatorCount();

    for (const identity of fixture.everyIdentity) {
      const attempt = await probe.remove(identity, "operator", id);
      if (attempt.ok && attempt.count > 0) {
        failures.push(`${identity.label} DELETE operator: ACCEPTED`);
      } else if (!refusedByGrant(attempt)) {
        failures.push(
          `${identity.label} DELETE operator: "${attempt.status}/${attempt.code} ${attempt.message}", ` +
            `expected a grant refusal`,
        );
      }
      httpObserved.push(`${identity.label}=${attempt.status}/${attempt.code}`);
    }

    const after = await operatorCount();
    if (after !== before) failures.push(`operator count ${before} → ${after}`);
    if (!(await rowExists("operator", id))) failures.push("the operator row is gone");

    const [catalog] = await sql<{ authenticated_delete: boolean }>(
      `select has_table_privilege('authenticated', 'public.operator', 'DELETE') as authenticated_delete`,
    );
    if (catalog.authenticated_delete) {
      failures.push("in-process: authenticated holds DELETE on public.operator");
    }

    record(
      "30b",
      "Every seeded identity is refused DELETE on public.operator, and the row count is unchanged",
      failures,
      `HTTP ${fixture.everyIdentity.length} identities, all grant-refused: ${httpObserved.join(", ")}; ` +
        `count ${before} → ${after}. In-process: authenticated DELETE=${catalog.authenticated_delete}`,
    );
    expect(failures).toEqual([]);
  });

  it("30c anon reaches operator for SELECT, INSERT, UPDATE and DELETE and gets nothing on all four", async () => {
    const failures: string[] = [];
    const httpObserved: string[] = [];
    const anon = anonCaller(config);
    const id = fixture.operator.authId;
    const before = await operatorCount();
    const beforeRow = await operatorRowJson(id);

    const select = await probe.select(anon, "operator");
    if (select.ok && select.count > 0) failures.push(`anon SELECT operator: returned ${select.count} row(s)`);
    if (select.ok) {
      failures.push(
        `anon SELECT operator: HTTP ${select.status} with ${select.count} rows — a 200 empty is RLS, ` +
          `not the grant; expected permission denied so the request is shown to have reached the table`,
      );
    } else if (!refusedByGrant(select)) {
      failures.push(`anon SELECT operator: ${select.status}/${select.code} "${select.message}", expected a grant refusal`);
    }
    httpObserved.push(`SELECT=${select.status}/${select.code}`);

    const freshId = randomUUID();
    const insert = await probe.insert(anon, "operator", {
      id: freshId,
      granted_at: new Date().toISOString(),
    });
    if (insert.ok) {
      failures.push("anon INSERT operator: ACCEPTED");
      await sql(`delete from public.operator where id = '${freshId}'`);
    } else if (!refusedByGrant(insert)) {
      failures.push(`anon INSERT operator: ${insert.status}/${insert.code} "${insert.message}", expected a grant refusal`);
    } else if (await rowExists("operator", freshId)) {
      failures.push("anon INSERT operator: refused but a row persisted");
    }
    httpObserved.push(`INSERT=${insert.status}/${insert.code}`);

    const update = await probe.update(anon, "operator", id, { revoked_at: new Date().toISOString() });
    if (update.ok && update.count > 0) failures.push("anon UPDATE operator: ACCEPTED");
    else if (!refusedByGrant(update)) {
      failures.push(`anon UPDATE operator: ${update.status}/${update.code} "${update.message}", expected a grant refusal`);
    }
    httpObserved.push(`UPDATE=${update.status}/${update.code}`);

    const remove = await probe.remove(anon, "operator", id);
    if (remove.ok && remove.count > 0) failures.push("anon DELETE operator: ACCEPTED");
    else if (!refusedByGrant(remove)) {
      failures.push(`anon DELETE operator: ${remove.status}/${remove.code} "${remove.message}", expected a grant refusal`);
    }
    httpObserved.push(`DELETE=${remove.status}/${remove.code}`);

    if ((await operatorCount()) !== before) failures.push("anon left the operator count changed");
    if ((await operatorRowJson(id)) !== beforeRow) failures.push("anon changed the operator row");

    const catalog = await sql<{
      rolname: string;
      sel: boolean;
      ins: boolean;
      upd: boolean;
      del: boolean;
    }>(`
      select 'anon' as rolname,
             has_table_privilege('anon', 'public.operator', 'SELECT') as sel,
             has_table_privilege('anon', 'public.operator', 'INSERT') as ins,
             has_table_privilege('anon', 'public.operator', 'UPDATE') as upd,
             has_table_privilege('anon', 'public.operator', 'DELETE') as del
    `);
    const cell = catalog[0];
    if (cell.sel || cell.ins || cell.upd || cell.del) {
      failures.push(`in-process: anon holds a table privilege on operator: ${JSON.stringify(cell)}`);
    }

    record(
      "30c",
      "anon reaches public.operator for SELECT, INSERT, UPDATE and DELETE and gets nothing on all four",
      failures,
      `HTTP ${httpObserved.join(", ")}, all grant-refused, count unchanged at ${before}. ` +
        `In-process: anon SELECT/INSERT/UPDATE/DELETE = ${cell.sel}/${cell.ins}/${cell.upd}/${cell.del}`,
    );
    expect(failures).toEqual([]);
  });

  it("30d public.operator carries exactly one policy, FOR SELECT, and no write policy", async () => {
    const failures: string[] = [];
    const rows = await sql<{ polname: string; polcmd: string; roles: string | null }>(`
      select p.polname,
             p.polcmd::text as polcmd,
             (select string_agg(r.rolname, ',' order by r.rolname)
                from unnest(p.polroles) u(oid)
                join pg_roles r on r.oid = u.oid) as roles
        from pg_policy p
       where p.polrelid = 'public.operator'::regclass
       order by p.polname
    `);

    const expected = [{ polname: "operator_select_operator", polcmd: "r", roles: "authenticated" }];
    const actual = rows.map((row) => ({
      polname: row.polname,
      polcmd: row.polcmd,
      roles: row.roles,
    }));
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      failures.push(`policy set ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
    }

    record(
      "30d",
      "public.operator carries exactly one policy, FOR SELECT to authenticated; no INSERT, UPDATE or DELETE policy exists",
      failures,
      `pg_policies exact set: ${JSON.stringify(actual)}`,
    );
    expect(failures).toEqual([]);
  });

  it("30e the privilege grid on public.operator matches OD-G19 exactly", async () => {
    const failures: string[] = [];
    const rows = await sql<{
      rolname: string;
      privilege: string;
      held: boolean;
    }>(`
      select r.rolname, p.privilege,
             has_table_privilege(r.rolname, 'public.operator', p.privilege) as held
        from (values ('anon'), ('authenticated'), ('service_role')) as r(rolname)
        cross join unnest(ARRAY[
          'SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER'
        ]) as p(privilege)
       order by r.rolname, p.privilege
    `);

    const observed: string[] = [];
    for (const row of rows) {
      const expected = OPERATOR_PRIVILEGE_GRID[row.rolname]?.[
        row.privilege as (typeof OPERATOR_PRIVILEGES)[number]
      ];
      if (expected === undefined) {
        failures.push(`unexpected role/privilege ${row.rolname}.${row.privilege}`);
        continue;
      }
      if (row.held !== expected) {
        failures.push(`${row.rolname}.${row.privilege} = ${row.held}, expected ${expected}`);
      }
      observed.push(`${row.rolname}.${row.privilege}=${row.held}`);
    }

    if (rows.length !== 3 * OPERATOR_PRIVILEGES.length) {
      failures.push(`grid length ${rows.length}, expected ${3 * OPERATOR_PRIVILEGES.length}`);
    }

    record(
      "30e",
      "Privilege grid on public.operator for anon, authenticated and service_role matches OD-G19",
      failures,
      `expected inline: anon none; authenticated SELECT only; service_role SELECT only. ` +
        `measured: ${observed.join(", ")}`,
    );
    expect(failures).toEqual([]);
  });

  it("30f nothing in the catalog writes public.operator", async () => {
    const failures: string[] = [];
    const [catalog] = await sql<{
      triggers: number;
      defaults: number;
      policies: number;
      bodies: string;
    }>(`
      select
        (select count(*) from pg_trigger t
          where t.tgrelid = 'public.operator'::regclass
            and not t.tgisinternal)::int                                              as triggers,
        (select count(*) from pg_attrdef d
          where d.adrelid = 'public.operator'::regclass)::int                          as defaults,
        (select count(*) from pg_policy p
          where coalesce(pg_get_expr(p.polqual, p.polrelid), '') ~* 'insert\\s+into\\s+(public\\.)?operator\\b'
             or coalesce(pg_get_expr(p.polwithcheck, p.polrelid), '') ~* 'insert\\s+into\\s+(public\\.)?operator\\b'
             or coalesce(pg_get_expr(p.polqual, p.polrelid), '') ~* 'update\\s+(public\\.)?operator\\b'
             or coalesce(pg_get_expr(p.polwithcheck, p.polrelid), '') ~* 'update\\s+(public\\.)?operator\\b'
             or coalesce(pg_get_expr(p.polqual, p.polrelid), '') ~* 'delete\\s+from\\s+(public\\.)?operator\\b'
             or coalesce(pg_get_expr(p.polwithcheck, p.polrelid), '') ~* 'delete\\s+from\\s+(public\\.)?operator\\b')::int
                                                                                      as policies,
        (select coalesce(string_agg(n.nspname || '.' || p.proname, ', ' order by n.nspname, p.proname), '')
           from pg_proc p
           join pg_namespace n on n.oid = p.pronamespace
          where p.prosrc ~* 'insert\\s+into\\s+(public\\.)?operator\\b'
             or p.prosrc ~* 'update\\s+(only\\s+)?(public\\.)?operator\\b'
             or p.prosrc ~* 'delete\\s+from\\s+(only\\s+)?(public\\.)?operator\\b'
             or p.prosrc ~* 'truncate\\s+(table\\s+)?(public\\.)?operator\\b')         as bodies
    `);

    if (catalog.triggers !== 0) failures.push(`${catalog.triggers} non-internal trigger(s) on public.operator`);
    if (catalog.defaults !== 0) failures.push(`${catalog.defaults} column default(s) on public.operator`);
    if (catalog.policies !== 0) failures.push(`${catalog.policies} policy expression(s) write public.operator`);
    if (catalog.bodies !== "") failures.push(`function bodies write public.operator: ${catalog.bodies}`);

    record(
      "30f",
      "Nothing in the catalog writes public.operator",
      failures,
      `0 non-internal triggers, 0 column defaults, 0 writing policy expressions, ` +
        `0 function bodies (is_operator and operator_read_activity_event read, they do not write)`,
    );
    expect(failures).toEqual([]);
  });

  it("30g a grant whose expires_at has passed admits nothing, and nothing is logged", async () => {
    const { a, operator } = fixture;
    const failures: string[] = [];
    const grantId = a.consentGrantId;

    const restore = async () => {
      await sql(
        `update public.consent_grant set expires_at = now() + interval '1 day', revoked_at = null where id = '${grantId}'`,
      );
    };

    try {
      const controlHttp = await probe.rpc(operator, "operator_read_activity_event", { p_tenant_id: a.id });
      if (controlHttp.status >= 400) {
        failures.push(
          `control HTTP: live grant refused ${controlHttp.status} ${controlHttp.body.slice(0, 160)} — ` +
            `the lapse answers below would prove nothing`,
        );
      }
      const controlDirect = await operatorReadInProcess(operator.authId, a.id);
      if (!controlDirect.ok) {
        failures.push(
          `control in-process: live grant refused ${controlDirect.status} ${controlDirect.body.slice(0, 160)}`,
        );
      }

      await sql(`update public.consent_grant set expires_at = now() - interval '1 hour' where id = '${grantId}'`);

      const before = await eventsOn(a.id);
      const http = await probe.rpc(operator, "operator_read_activity_event", { p_tenant_id: a.id });
      if (http.status < 400) {
        failures.push(`HTTP: expired grant ACCEPTED (${http.rows.length} rows)`);
      }
      if (!/no live consent grant/i.test(http.body)) {
        failures.push(`HTTP: expired grant refused as "${http.body.slice(0, 160)}", expected the consent check`);
      }
      if ((await eventsOn(a.id)) !== before) {
        failures.push("HTTP: an activity_event was written for a refused expired-grant read");
      }

      const direct = await operatorReadInProcess(operator.authId, a.id);
      if (direct.ok) failures.push(`in-process: expired grant ACCEPTED — ${direct.body.slice(0, 160)}`);
      if (!/no live consent grant/i.test(direct.body)) {
        failures.push(`in-process: expired grant refused as "${direct.body.slice(0, 160)}", expected the consent check`);
      }
      if ((await eventsOn(a.id)) !== before) {
        failures.push("in-process: an activity_event was written for a refused expired-grant read");
      }

      record(
        "30g",
        "A grant whose expires_at has passed admits nothing, and nothing is logged",
        failures,
        `control HTTP ${controlHttp.status} / in-process ${controlDirect.status}; ` +
          `lapse HTTP ${http.status}, in-process ${direct.status}; tenant A held ${before} events throughout the refusals`,
      );
    } finally {
      await restore();
    }
    expect(failures).toEqual([]);
  });

  it("30h revocation is immediate: the next request after revoked_at is cut, and nothing is logged for the refusal", async () => {
    const { a, operator } = fixture;
    const failures: string[] = [];
    const grantId = a.consentGrantId;

    const restore = async () => {
      await sql(`update public.consent_grant set revoked_at = null where id = '${grantId}'`);
    };

    try {
      const [live] = await sql<{ n: number }>(
        `select count(*)::int as n from public.consent_grant
          where id = '${grantId}' and revoked_at is null and now() < expires_at`,
      );
      if (live.n !== 1) failures.push("precondition: tenant A holds no live consent grant");

      const admitted = await probe.rpc(operator, "operator_read_activity_event", { p_tenant_id: a.id });
      if (admitted.status >= 400) {
        failures.push(
          `live grant HTTP refused ${admitted.status} ${admitted.body.slice(0, 160)} — 20b's positive path is the premise`,
        );
      }

      await sql(`update public.consent_grant set revoked_at = now() where id = '${grantId}'`);

      const before = await eventsOn(a.id);
      const http = await probe.rpc(operator, "operator_read_activity_event", { p_tenant_id: a.id });
      if (http.status < 400) failures.push(`HTTP after revoke: ACCEPTED (${http.rows.length} rows)`);
      if (!/no live consent grant/i.test(http.body)) {
        failures.push(`HTTP after revoke: "${http.body.slice(0, 160)}", expected the consent check`);
      }
      if ((await eventsOn(a.id)) !== before) {
        failures.push("HTTP: an activity_event was written for a refused revoked-grant read");
      }

      const direct = await operatorReadInProcess(operator.authId, a.id);
      if (direct.ok) failures.push(`in-process after revoke: ACCEPTED — ${direct.body.slice(0, 160)}`);
      if (!/no live consent grant/i.test(direct.body)) {
        failures.push(`in-process after revoke: "${direct.body.slice(0, 160)}", expected the consent check`);
      }
      if ((await eventsOn(a.id)) !== before) {
        failures.push("in-process: an activity_event was written for a refused revoked-grant read");
      }

      record(
        "30h",
        "Revocation is immediate: setting revoked_at cuts reach on the next request, and nothing is logged for the refusal",
        failures,
        `admitted HTTP ${admitted.status}; after revoke HTTP ${http.status}, in-process ${direct.status}; ` +
          `tenant A held ${before} events throughout the refusals`,
      );
    } finally {
      await restore();
    }
    expect(failures).toEqual([]);
  });

  it("30i only a tenant Owner creates a ConsentGrant: a Viewer of the same tenant and the Owner of tenant B are refused for tenant A", async () => {
    const { a, b } = fixture;
    const failures: string[] = [];
    const httpObserved: string[] = [];
    const invented: string[] = [];

    const tryInsert = async (who: Identity, label: string, payload: Record<string, unknown>) => {
      const id = String(payload.id);
      invented.push(id);
      const attempt = await probe.insert(who, "consent_grant", payload);
      if (attempt.ok) {
        failures.push(`${label} INSERT consent_grant: ACCEPTED`);
        await sql(`delete from public.consent_grant where id = '${id}'`);
      } else if (await rowExists("consent_grant", id)) {
        failures.push(`${label} INSERT consent_grant: refused but a row persisted`);
      } else if (!refusedByPolicy(attempt) && !refusedByGrant(attempt)) {
        failures.push(
          `${label} INSERT consent_grant: ${attempt.status}/${attempt.code} "${attempt.message.slice(0, 140)}" ` +
            `— not an authorisation refusal, so the request may not have reached the table`,
        );
      }
      httpObserved.push(`${label}=${attempt.status}/${attempt.code}`);
    };

    await tryInsert(a.viewer, "A-viewer", {
      id: randomUUID(),
      tenant_id: a.id,
      granted_by: a.viewer.authId,
      scope: "read_only",
      expires_at: futureIso(1),
    });
    await tryInsert(b.owner, "B-owner-for-A", {
      id: randomUUID(),
      tenant_id: a.id,
      granted_by: b.owner.authId,
      scope: "read_only",
      expires_at: futureIso(1),
    });

    const leftover = await sql<{ n: number }>(
      `select count(*)::int as n from public.consent_grant where id in (${invented.map((id) => `'${id}'`).join(", ")})`,
    );
    if (leftover[0].n !== 0) failures.push(`${leftover[0].n} of the invented consent_grant rows exist`);

    const viewerOwner = await sql.try(`
      select res.is_owner
        from (
          select set_config(
                   'request.jwt.claims',
                   jsonb_build_object('sub', '${a.viewer.authId}', 'role', 'authenticated')::text,
                   true
                 ) as claims
        ) cfg,
        lateral (select public.is_current_tenant_owner() as is_owner) res
       where cfg.claims is not null
    `);
    const bOwnerTenant = await sql.try(`
      select res.tid
        from (
          select set_config(
                   'request.jwt.claims',
                   jsonb_build_object('sub', '${b.owner.authId}', 'role', 'authenticated')::text,
                   true
                 ) as claims
        ) cfg,
        lateral (select public.current_tenant_id()::text as tid) res
       where cfg.claims is not null
    `);

    if (!viewerOwner.ok || /true/i.test(viewerOwner.body)) {
      failures.push(`in-process: A-viewer is_current_tenant_owner → ${viewerOwner.body.slice(0, 160)}, expected false`);
    }
    if (!bOwnerTenant.ok || bOwnerTenant.body.includes(a.id)) {
      failures.push(`in-process: B-owner current_tenant_id resolved tenant A — ${bOwnerTenant.body.slice(0, 160)}`);
    }
    if (!bOwnerTenant.ok || !bOwnerTenant.body.includes(b.id)) {
      failures.push(`in-process: B-owner current_tenant_id did not resolve tenant B — ${bOwnerTenant.body.slice(0, 160)}`);
    }

    record(
      "30i",
      "Only a tenant Owner creates a ConsentGrant: a Viewer of A and the Owner of B are refused for tenant A",
      failures,
      `HTTP ${httpObserved.join(", ")}; 0 of ${invented.length} invented rows exist. ` +
        `In-process: A-viewer is_current_tenant_owner=${viewerOwner.body.trim()}; ` +
        `B-owner current_tenant_id body contains B and not A`,
    );
    expect(failures).toEqual([]);
  });

  it("30j a ConsentGrant for tenant A admits no read of tenant B", async () => {
    const { a, b, operator } = fixture;
    const failures: string[] = [];

    const restore = async () => {
      await sql(`update public.consent_grant set revoked_at = null where id = '${b.consentGrantId}'`);
    };

    try {
      const [aLive] = await sql<{ n: number }>(
        `select count(*)::int as n from public.consent_grant
          where id = '${a.consentGrantId}' and revoked_at is null and now() < expires_at`,
      );
      if (aLive.n !== 1) failures.push("precondition: tenant A holds no live consent grant");

      await sql(`update public.consent_grant set revoked_at = now() where id = '${b.consentGrantId}'`);

      const beforeB = await eventsOn(b.id);
      const http = await probe.rpc(operator, "operator_read_activity_event", { p_tenant_id: b.id });
      if (http.status < 400) failures.push(`HTTP read of B under A's live grant: ACCEPTED (${http.rows.length} rows)`);
      if (!/no live consent grant/i.test(http.body)) {
        failures.push(`HTTP: "${http.body.slice(0, 160)}", expected the consent check`);
      }
      if ((await eventsOn(b.id)) !== beforeB) {
        failures.push("HTTP: an activity_event was written on B for a refused cross-tenant operator read");
      }

      const direct = await operatorReadInProcess(operator.authId, b.id);
      if (direct.ok) failures.push(`in-process read of B under A's live grant: ACCEPTED — ${direct.body.slice(0, 160)}`);
      if (!/no live consent grant/i.test(direct.body)) {
        failures.push(`in-process: "${direct.body.slice(0, 160)}", expected the consent check`);
      }
      if ((await eventsOn(b.id)) !== beforeB) {
        failures.push("in-process: an activity_event was written on B for a refused cross-tenant operator read");
      }

      record(
        "30j",
        "A ConsentGrant for tenant A admits no read of tenant B",
        failures,
        `A live=${aLive.n}, B revoked; HTTP ${http.status}, in-process ${direct.status}; ` +
          `tenant B held ${beforeB} events throughout`,
      );
    } finally {
      await restore();
    }
    expect(failures).toEqual([]);
  });
});

describe("TASK D — teardown, and prove it", () => {
  it("removes every synthetic row and verifies the absence by query", async () => {
    await teardown(config, sql);
    const counts = await teardownCounts(sql);

    const failures = Object.entries(counts)
      .filter(([, value]) => Number(value) !== 0)
      .map(([key, value]) => `${key} = ${value}, expected 0`);

    record(
      "D",
      "Teardown verified by query",
      failures,
      Object.entries(counts).map(([key, value]) => `${key}=${value}`).join(", "),
    );
    expect(failures).toEqual([]);
  });

  it("the ledger is complete — no proof reached a verdict-free exit", () => {
    // A proof that throws leaves no ledger line, and a shorter ledger reads as
    // a clean result. This asserts the count so an absent proof cannot pass as
    // an absent problem.
    expect(recordedAssertions()).toEqual(EXPECTED_ASSERTIONS);
  });
});
