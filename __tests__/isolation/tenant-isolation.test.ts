// The tenant-isolation proof — DATA_MODEL.md §5, SECURITY_MODEL.md §3, ADR-003.
//
// Thirteen proofs. The first eight are DATA_MODEL.md §5's checklist; the last
// five exist because a gate that only runs its checklist is a checklist. Every
// one of them runs against the LIVE catalog and the LIVE policies. None of them
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
  futureIso,
  makeProbes,
  makeSqlRunner,
  printLedger,
  readConfig,
  record,
  recordedAssertions,
  refusedByGrant,
  refusedByPolicy,
  seed,
  SYNTHETIC_PREFIX,
  TABLES,
  TENANT_SCOPED_TABLES,
  teardown,
  teardownCounts,
  type Attempt,
  type Config,
  type Fixture,
  type Identity,
  type Probes,
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
  it("pg_class.relrowsecurity is true for all six tables, zero exceptions", async () => {
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

      // Tenant A's viewer. consent_grant is owner-only by policy, so the empty
      // read there is the specified behaviour rather than a fail-closed symptom.
      [a.viewer, "tenant", [a.id]],
      [a.viewer, "member", [a.owner.authId, a.viewer.authId]],
      [a.viewer, "membership", [a.ownerMembershipId, a.viewerMembershipId]],
      [a.viewer, "operator", []],
      [a.viewer, "consent_grant", []],
      [a.viewer, "activity_event", [a.activityEventId]],

      // Tenant B's owner — the mirror image.
      [b.owner, "tenant", [b.id]],
      [b.owner, "member", [b.owner.authId, b.viewer.authId]],
      [b.owner, "membership", [b.ownerMembershipId, b.viewerMembershipId]],
      [b.owner, "operator", []],
      [b.owner, "consent_grant", [b.consentGrantId]],
      [b.owner, "activity_event", [b.activityEventId]],

      // The unaffiliated member: their own member row, and nothing anywhere else.
      [unaffiliated, "tenant", []],
      [unaffiliated, "member", [unaffiliated.authId]],
      [unaffiliated, "membership", []],
      [unaffiliated, "operator", []],
      [unaffiliated, "consent_grant", []],
      [unaffiliated, "activity_event", []],
    ];

    const idsOf = (t: typeof a) => [
      t.id,
      t.ownerMembershipId,
      t.viewerMembershipId,
      t.consentGrantId,
      t.activityEventId,
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
      ["operator", { id: randomUUID(), granted_at: new Date().toISOString() }],
    ];

    // An owner may write memberships and consent grants inside their own tenant;
    // any active member may append an activity_event to it. Nothing else is
    // reachable, and provisioning a tenant or a member never is.
    const allowed: Record<string, TableName[]> = {
      [a.owner.label]: ["membership", "consent_grant", "activity_event"],
      [a.viewer.label]: ["activity_event"],
      [b.owner.label]: ["membership", "consent_grant", "activity_event"],
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
      `${probes} insert probes across 4 identities x 6 tables; ${permittedLanded} permitted inserts landed and were removed`,
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
      `${probes} delete probes — 4 identities x ${targets.length} targets spanning all 6 tables, own and foreign; ` +
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
    // it. Nothing gives an operator member or membership: current_tenant_id()
    // is null for an identity holding no membership.
    const expectations: [TableName, string[]][] = [
      ["tenant", [fixture.a.id, fixture.b.id]],
      ["activity_event", []],
      ["consent_grant", [fixture.a.consentGrantId, fixture.b.consentGrantId]],
      ["operator", [fixture.operator.authId]],
      ["member", []],
      ["membership", []],
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
  it("public holds six ordinary tables and no view, materialised view or foreign table", async () => {
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
      failures.push(`public holds [${rows.map((r) => r.relname).join(", ")}], expected exactly the six tables`);
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
      "operator_read_activity_event",
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
    // this proof still has to say is about the helper rather than the policy:
    // current_tenant_id() fails closed on more than one active membership, by
    // design, and that behaviour is unchanged and is what makes the lockout
    // possible at all. It is the half of CF-103 that stays open for Phase 02.
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
      "A second active membership denies both tenants, reversibly",
      failures,
      `seeded privileged, since no API path creates one any more: the victim resolved to their own tenant, ` +
        `then to null while doubly-membered, then to their own tenant again; in the middle state they read ` +
        `0 tenant rows and 0 rows belonging to any other member, keeping sight only of their own ` +
        `${during.count}, and their ${before.count} membership rows returned after removal — the helper's ` +
        `fail-closed behaviour is unchanged and is CF-103's remaining half, retargeted to P02`,
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
      operator_read_activity_event: "authenticated,postgres",
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
