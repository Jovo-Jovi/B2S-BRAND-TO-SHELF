// Tenant-isolation proof harness — DATA_MODEL.md §5, SECURITY_MODEL.md §3, ADR-003.
//
// This harness exists so the thirteen proofs in tenant-isolation.test.ts run
// against the LIVE catalog and the LIVE policies, never against
// supabase/schema.sql and never against a local stub. ADR-003 makes RLS the
// authorization boundary; a proof that reads the migration file proves only what
// the builder intended to apply.
//
// WHY THERE IS NO `@supabase/*` IMPORT HERE. `check-data-boundary` scans
// `__tests__/` and requires every file importing a Supabase client library to
// live under `lib/supabase/`; ARCHITECTURE.md §6 says a guard that blocks you is
// right and is superseded by an ADR, never disabled. ADR-005 separately fixes the
// `service_role` client at exactly one server-only module, which vitest cannot
// import anyway — the `server-only` package throws outside a React Server
// Component. So this harness constructs no Supabase client at all. It speaks
// PostgREST, GoTrue and the Management API over plain HTTP, which also gives the
// proofs something the SDK hides: the verbatim SQLSTATE and message, which is the
// only thing distinguishing a GRANT refusal from a POLICY refusal (proof 5).
//
// Three access paths, deliberately different:
//
//   sql()      — the Management API query endpoint, running as `postgres`. The
//                only way to reach pg_class and pg_policy, since PostgREST
//                exposes `public` alone. Also the only way to remove synthetic
//                membership rows: the deferred active-owner constraint trigger
//                refuses to let a tenant reach zero active owners, and that
//                refusal is itself proof 12.
//
//   as()       — an ordinary caller: the publishable key plus a real signed-in
//                access token, so every request is evaluated by RLS exactly as a
//                browser's would be.
//
//   authAdmin  — GoTrue's admin endpoint, for creating and destroying the
//                synthetic identities. This is a privileged credential living
//                outside ADR-005's quarantine; it is confined to this file.
//
// ADR-012: this project is production and holds no real tenant. Every row this
// harness creates is synthetic, carries the reserved `zz-test-` prefix, and is
// torn down by the same run that seeded it.

import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export const SYNTHETIC_PREFIX = "zz-test-";

export const TABLES = [
  "tenant",
  "member",
  "membership",
  "operator",
  "consent_grant",
  "activity_event",
] as const;

export type TableName = (typeof TABLES)[number];

/** §1.1 — every table except these three carries a non-null tenant_id. */
export const TENANT_SCOPED_TABLES: TableName[] = [
  "membership",
  "consent_grant",
  "activity_event",
];

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

function loadEnvLocal(): void {
  const file = resolve(process.cwd(), ".env.local");
  if (!existsSync(file)) return;

  for (const rawLine of readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === "" || line.startsWith("#")) continue;

    const separator = line.indexOf("=");
    if (separator === -1) continue;

    const key = line.slice(0, separator).trim();
    if (process.env[key] !== undefined) continue;

    let value = line.slice(separator + 1).trim();
    const quoted =
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"));
    if (quoted && value.length >= 2) value = value.slice(1, -1);

    process.env[key] = value;
  }
}

function required(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    // PR-21 — the absence of a check is never reported as a passing check. This
    // suite fails loudly rather than skipping, because a skipped isolation gate
    // reads as green while proving nothing.
    throw new Error(
      `FAIL: the tenant-isolation suite cannot run. Absent configuration: ${name}. ` +
        `This suite never skips — absent configuration is a failure, not a reason to pass.`,
    );
  }
  return value;
}

export type Config = {
  url: string;
  publishableKey: string;
  serviceRoleKey: string;
  accessToken: string;
  projectRef: string;
};

export function readConfig(): Config {
  loadEnvLocal();

  const url = required("NEXT_PUBLIC_SUPABASE_URL").replace(/\/+$/, "");

  return {
    url,
    publishableKey: required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    serviceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
    accessToken: required("SUPABASE_ACCESS_TOKEN"),
    projectRef: process.env.SUPABASE_PROJECT_ID || new URL(url).hostname.split(".")[0],
  };
}

// ---------------------------------------------------------------------------
// Privileged SQL — the live catalog, read as `postgres`
// ---------------------------------------------------------------------------

export type SqlOutcome = { ok: boolean; status: number; body: string };
export type SqlRunner = {
  <T>(query: string): Promise<T[]>;
  try: (query: string) => Promise<SqlOutcome>;
};

const TRANSPORT_RETRIES = 4;

const wait = (ms: number) => new Promise((done) => setTimeout(done, ms));

/**
 * Retries gateway failures only, and never a 4xx.
 *
 * A 4xx carries a SQLSTATE and a Postgres message: it is a RESULT, and several
 * proofs assert one. A 5xx or a dropped socket is the transport failing, and
 * treating it as a result is how a negative assertion passes for the wrong
 * reason — "the write was refused" and "the request never arrived" look
 * identical to a caller that only checks for an error.
 */
async function fetchResilient(
  url: string,
  init: RequestInit,
  what: string,
): Promise<{ status: number; body: string }> {
  let lastFailure = "";

  for (let attempt = 0; attempt <= TRANSPORT_RETRIES; attempt += 1) {
    if (attempt > 0) await wait(400 * 2 ** (attempt - 1));
    try {
      const response = await fetch(url, init);
      const body = await response.text();
      if (response.status < 500) return { status: response.status, body };
      lastFailure = `HTTP ${response.status} ${body.slice(0, 200)}`;
    } catch (cause) {
      lastFailure = cause instanceof Error ? cause.message : String(cause);
    }
  }

  throw new Error(
    `${what}: the transport failed ${TRANSPORT_RETRIES + 1} times and no result was obtained — ` +
      `last failure: ${lastFailure}. This is not an isolation result and is never reported as one.`,
  );
}

export function makeSqlRunner(config: Config): SqlRunner {
  const endpoint = `https://api.supabase.com/v1/projects/${config.projectRef}/database/query`;

  async function send(query: string): Promise<SqlOutcome> {
    const result = await fetchResilient(
      endpoint,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      },
      "privileged SQL",
    );
    return { ok: result.status < 400, status: result.status, body: result.body };
  }

  return Object.assign(
    async <T>(query: string): Promise<T[]> => {
      const outcome = await send(query);
      if (!outcome.ok) throw new Error(`SQL ${outcome.status}: ${outcome.body}`);
      return JSON.parse(outcome.body) as T[];
    },
    { try: send },
  );
}

// ---------------------------------------------------------------------------
// Callers — PostgREST, exactly as a browser reaches it
// ---------------------------------------------------------------------------

/**
 * The credential pair PostgREST evaluates a request against, plus whatever
 * extra request headers the caller chose to send.
 *
 * `headers` is what makes OD-G14's selector testable. It rides on the Caller
 * rather than on each probe so that a selection applies to every request that
 * caller makes — a read, a write and an RPC alike — which is the only way to
 * assert that the tenant a session resolves to and the rows it reads agree.
 */
export type Caller = {
  label: string;
  apiKey: string;
  token: string;
  headers?: Record<string, string>;
  /**
   * Header pairs appended rather than set, so the same name can be sent twice.
   * CF-128 is about exactly that and a `Record` cannot express it: two
   * `x-b2s-tenant` headers is a distinct wire shape from one, and undici joins
   * them into a single comma-separated field value. Applied after `headers`.
   */
  rawHeaders?: [string, string][];
};

/**
 * OD-G14's transport. An ordinary request header, read server-side out of
 * PostgREST's per-request `request.headers` setting, re-validated against
 * `public.membership` on every call and trusted for nothing.
 */
export const TENANT_SELECTOR_HEADER = "x-b2s-tenant";

/**
 * The same caller, selecting a tenant. Takes the value verbatim — a proof needs
 * to send a malformed one, an empty one and a differently-cased header name,
 * and a helper that validated its argument could not express any of them.
 */
export function selecting(
  caller: Caller,
  selector: string,
  headerName: string = TENANT_SELECTOR_HEADER,
): Caller {
  return {
    ...caller,
    label: `${caller.label}[${headerName}=${selector === "" ? "<empty>" : selector}]`,
    headers: { ...(caller.headers ?? {}), [headerName]: selector },
  };
}

/**
 * The same caller sending the selector header MORE THAN ONCE — CF-128.
 *
 * Each pair is appended, so the request really does carry two header lines of
 * the same name and undici joins them on the wire exactly as any HTTP client
 * would. That is the point: the value PostgREST hands to SQL is one
 * comma-joined string, which is a non-match against every uuid the caller
 * holds, so the answer is null. Fail-closed by construction, and unproven until
 * something sends it.
 */
export function selectingTwice(
  caller: Caller,
  first: string,
  second: string,
  headerName: string = TENANT_SELECTOR_HEADER,
): Caller {
  return {
    ...caller,
    label: `${caller.label}[${headerName}=${first} +${headerName}=${second}]`,
    rawHeaders: [
      ...(caller.rawHeaders ?? []),
      [headerName, first],
      [headerName, second],
    ],
  };
}

export type Attempt = {
  ok: boolean;
  status: number;
  code: string;
  message: string;
  ids: string[];
  count: number;
  /** The rows verbatim, so a proof can assert on a key that must be absent. */
  rows: Record<string, unknown>[];
};

function parseAttempt(status: number, raw: string): Attempt {
  let payload: unknown = null;
  try {
    payload = raw === "" ? null : JSON.parse(raw);
  } catch {
    payload = null;
  }

  if (status >= 400) {
    const error = (payload ?? {}) as { code?: string; message?: string };
    return {
      ok: false,
      status,
      code: error.code ?? String(status),
      message: error.message ?? raw.slice(0, 300),
      ids: [],
      count: 0,
      rows: [],
    };
  }

  const rows = Array.isArray(payload) ? (payload as Record<string, unknown>[]) : [];
  return {
    ok: true,
    status,
    code: "",
    message: "",
    ids: rows.map((row) => row.id).filter((id): id is string => typeof id === "string"),
    count: rows.length,
    rows,
  };
}

/**
 * The request headers for one caller: the fixed pair PostgREST authenticates
 * against, then whatever the caller chose to add.
 *
 * A `Headers` instance rather than a plain object because `rawHeaders` appends,
 * and appending the same name twice is the whole of CF-128's wire shape. Set
 * headers are applied first so a raw pair can add a second line beside one.
 */
function buildHeaders(base: Record<string, string>, caller: Caller): Headers {
  const headers = new Headers(base);
  for (const [name, value] of Object.entries(caller.headers ?? {})) headers.set(name, value);
  for (const [name, value] of caller.rawHeaders ?? []) headers.append(name, value);
  return headers;
}

async function postgrest(
  config: Config,
  caller: Caller,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
  prefer = "return=representation",
): Promise<Attempt> {
  const base: Record<string, string> = {
    apikey: caller.apiKey,
    Accept: "application/json",
    // Every write returns its rows, so "refused" and "matched nothing" are
    // distinguishable. Conflating them is how a silent zero-row write passes.
    Prefer: prefer,
  };
  // An empty token is the unauthenticated caller: the request carries the
  // publishable key alone and PostgREST resolves it to `anon`.
  if (caller.token !== "") base.Authorization = `Bearer ${caller.token}`;
  if (body !== undefined) base["Content-Type"] = "application/json";

  const result = await fetchResilient(
    `${config.url}/rest/v1/${path}`,
    {
      method,
      headers: buildHeaders(base, caller),
      body: body === undefined ? undefined : JSON.stringify(body),
    },
    `${caller.label} ${method} ${path}`,
  );
  return parseAttempt(result.status, result.body);
}

/** A row as PostgREST returned it, so a proof can assert on absent keys. */
export type RawRow = Record<string, unknown>;

export function makeProbes(config: Config) {
  return {
    select: (caller: Caller, table: TableName) =>
      postgrest(config, caller, "GET", `${table}?select=id`),

    insert: (caller: Caller, table: TableName, payload: Record<string, unknown>) =>
      postgrest(config, caller, "POST", table, payload),

    update: (caller: Caller, table: TableName, id: string, patch: Record<string, unknown>) =>
      postgrest(config, caller, "PATCH", `${table}?id=eq.${encodeURIComponent(id)}`, patch),

    /**
     * The same PATCH with no representation asked for. `UPDATE ... RETURNING`
     * is subject to the SELECT policies as well as the UPDATE ones, so a caller
     * permitted to write a row they cannot read — an invitee accepting, who
     * holds no active membership in the inviting tenant and therefore no SELECT
     * path to it — needs this form. Persistence is asserted through the
     * privileged path either way.
     */
    updateMinimal: (caller: Caller, table: TableName, id: string, patch: Record<string, unknown>) =>
      postgrest(
        config,
        caller,
        "PATCH",
        `${table}?id=eq.${encodeURIComponent(id)}`,
        patch,
        "return=minimal",
      ),

    /** A read naming its columns, so a proof can ask for one it must not get. */
    selectColumns: (caller: Caller, table: TableName, columns: string) =>
      postgrest(config, caller, "GET", `${table}?select=${encodeURIComponent(columns)}`),

    remove: (caller: Caller, table: TableName, id: string) =>
      postgrest(config, caller, "DELETE", `${table}?id=eq.${encodeURIComponent(id)}`),

    /** A read filtered to one id — the shape an existence oracle would take. */
    selectById: (caller: Caller, table: TableName, id: string) =>
      postgrest(config, caller, "GET", `${table}?select=id&id=eq.${encodeURIComponent(id)}`),

    /**
     * PostgREST exposes every function in the `public` schema as an RPC
     * endpoint. The three tenancy helpers are `security definer`, so if one
     * could be coerced into answering for another caller the whole policy set
     * would follow it.
     */
    async rpc(
      caller: Caller,
      fn: string,
      args: Record<string, unknown> = {},
    ): Promise<{ status: number; body: string; rows: RawRow[] }> {
      const base: Record<string, string> = {
        apikey: caller.apiKey,
        Accept: "application/json",
        "Content-Type": "application/json",
      };
      if (caller.token !== "") base.Authorization = `Bearer ${caller.token}`;

      const result = await fetchResilient(
        `${config.url}/rest/v1/rpc/${fn}`,
        { method: "POST", headers: buildHeaders(base, caller), body: JSON.stringify(args) },
        `${caller.label} rpc/${fn}`,
      );

      let rows: RawRow[] = [];
      if (result.status < 400) {
        try {
          const parsed: unknown = JSON.parse(result.body);
          if (Array.isArray(parsed)) rows = parsed as RawRow[];
        } catch {
          rows = [];
        }
      }
      return { status: result.status, body: result.body.trim(), rows };
    },
  };
}

export type Probes = ReturnType<typeof makeProbes>;

export function anonCaller(config: Config): Caller {
  return { label: "anon", apiKey: config.publishableKey, token: "" };
}

/**
 * A grant refusal and a policy refusal both surface as SQLSTATE 42501. Only the
 * message distinguishes them, and proof 5 turns on that distinction: `role` must
 * be unwritable because the column is absent from the GRANT, not because a
 * policy happened to filter the row.
 */
export function refusedByGrant(attempt: Attempt): boolean {
  return (
    !attempt.ok &&
    /permission denied/i.test(attempt.message) &&
    !/row-level security/i.test(attempt.message)
  );
}

export function refusedByPolicy(attempt: Attempt): boolean {
  return !attempt.ok && /row-level security/i.test(attempt.message);
}

// ---------------------------------------------------------------------------
// GoTrue admin — the synthetic identities
// ---------------------------------------------------------------------------

function makeAuthAdmin(config: Config) {
  const base = `${config.url}/auth/v1`;
  const adminHeaders = {
    apikey: config.serviceRoleKey,
    Authorization: `Bearer ${config.serviceRoleKey}`,
    "Content-Type": "application/json",
  };

  return {
    async createUser(email: string, password: string): Promise<string> {
      const result = await fetchResilient(
        `${base}/admin/users`,
        {
          method: "POST",
          headers: adminHeaders,
          body: JSON.stringify({ email, password, email_confirm: true }),
        },
        `create synthetic identity ${email}`,
      );
      if (result.status >= 400) {
        throw new Error(`create synthetic identity ${email}: ${result.status} ${result.body}`);
      }
      const user = JSON.parse(result.body) as { id?: string };
      if (!user.id) throw new Error(`create synthetic identity ${email}: no id returned`);
      return user.id;
    },

    async deleteUser(id: string): Promise<void> {
      const result = await fetchResilient(
        `${base}/admin/users/${id}`,
        { method: "DELETE", headers: adminHeaders },
        "remove a synthetic identity",
      );
      if (result.status >= 400 && result.status !== 404) {
        throw new Error(`teardown could not remove a synthetic identity: ${result.status} ${result.body}`);
      }
    },

    async signIn(email: string, password: string): Promise<string> {
      const result = await fetchResilient(
        `${base}/token?grant_type=password`,
        {
          method: "POST",
          headers: { apikey: config.publishableKey, "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
        "sign in a synthetic identity",
      );
      if (result.status >= 400) {
        throw new Error(`sign-in failed for a synthetic identity: ${result.status} ${result.body}`);
      }
      const session = JSON.parse(result.body) as { access_token?: string };
      if (!session.access_token) throw new Error("sign-in returned no access token");
      return session.access_token;
    },
  };
}

// ---------------------------------------------------------------------------
// The synthetic fixture
// ---------------------------------------------------------------------------

export type Identity = Caller & { authId: string; email: string };

export type TenantFixture = {
  label: string;
  id: string;
  slug: string;
  owner: Identity;
  viewer: Identity;
  ownerMembershipId: string;
  viewerMembershipId: string;
  consentGrantId: string;
  activityEventId: string;
};

export type Fixture = {
  runId: string;
  a: TenantFixture;
  b: TenantFixture;
  unaffiliated: Identity;
  operator: Identity;
  /** Every identity holding a session, including the operator. */
  everyIdentity: Identity[];
};

export function futureIso(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString();
}

/**
 * One synthetic identity, signed in. Exported so that a proof needing a
 * membership shape the shared fixture does not carry builds its own actors
 * instead of bending the fixture every other proof asserts exact sets against.
 * Same reserved prefix, so the same teardown removes it.
 */
export async function makeIdentity(
  config: Config,
  label: string,
  runId: string,
): Promise<Identity> {
  const auth = makeAuthAdmin(config);
  const email = `${SYNTHETIC_PREFIX}${label}-${runId}@example.com`;
  // Ephemeral, never written to disk and never printed.
  const password = randomUUID();
  const authId = await auth.createUser(email, password);
  const token = await auth.signIn(email, password);
  return { label, authId, email, apiKey: config.publishableKey, token };
}

/** Single-quote escaping for the literals this harness builds into SQL. */
function lit(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

export async function seed(config: Config, sql: SqlRunner): Promise<Fixture> {
  const runId = randomUUID().slice(0, 8);

  const aOwner = await makeIdentity(config, "a-owner", runId);
  const aViewer = await makeIdentity(config, "a-viewer", runId);
  const bOwner = await makeIdentity(config, "b-owner", runId);
  const bViewer = await makeIdentity(config, "b-viewer", runId);
  const unaffiliated = await makeIdentity(config, "unaffiliated", runId);
  const operator = await makeIdentity(config, "operator", runId);

  const tenantA = { id: randomUUID(), slug: `${SYNTHETIC_PREFIX}alpha-${runId}` };
  const tenantB = { id: randomUUID(), slug: `${SYNTHETIC_PREFIX}beta-${runId}` };
  const memberships = {
    aOwner: randomUUID(),
    aViewer: randomUUID(),
    bOwner: randomUUID(),
    bViewer: randomUUID(),
  };
  const consentA = randomUUID();
  const consentB = randomUUID();
  const eventA = randomUUID();
  const eventB = randomUUID();

  // Seeded through the privileged SQL path rather than through PostgREST,
  // because there is deliberately no INSERT policy on `tenant` at all:
  // provisioning is a privileged path (ADR-005, DATA_MODEL §3.1). The four
  // memberships go in as one statement so that the deferred active-owner
  // trigger sees each tenant already holding its owner at commit.
  //
  // §3.2 — the `member` rows already exist by the time this runs. P02-T05's
  // `member_materialisation` trigger on `auth.users` created one for every
  // identity `makeIdentity` just signed in, which is the whole of OD-G13's
  // first act, so this statement ADOPTS them rather than creating them: it
  // stamps the reserved display_name teardown and proof 4a rely on. ON CONFLICT
  // is not defensive vagueness — the id is the auth user id by construction, so
  // the conflict is the expected path and an INSERT here would fail.
  //
  // Nothing about the trigger is proven by this succeeding, deliberately: an
  // upsert would pass whether the trigger fired or not, which is why proof 24a
  // asserts materialisation on a fresh identity before anything writes to it.
  //
  // The operator is materialised too, and there is no longer any way for it not
  // to be — OD-G13 is unconditional. It confers nothing: an operator holds no
  // membership, so it resolves null and reads no tenant's rows, which is what
  // proof 7 measures.
  await sql(`
    insert into public.member (id, email, display_name) values
      (${lit(aOwner.authId)},        ${lit(aOwner.email)},        ${lit(SYNTHETIC_PREFIX + "a-owner")}),
      (${lit(aViewer.authId)},       ${lit(aViewer.email)},       ${lit(SYNTHETIC_PREFIX + "a-viewer")}),
      (${lit(bOwner.authId)},        ${lit(bOwner.email)},        ${lit(SYNTHETIC_PREFIX + "b-owner")}),
      (${lit(bViewer.authId)},       ${lit(bViewer.email)},       ${lit(SYNTHETIC_PREFIX + "b-viewer")}),
      (${lit(unaffiliated.authId)},  ${lit(unaffiliated.email)},  ${lit(SYNTHETIC_PREFIX + "unaffiliated")})
    on conflict (id) do update set display_name = excluded.display_name;

    insert into public.operator (id, granted_at) values (${lit(operator.authId)}, now());

    insert into public.tenant (id, name, slug, base_currency, default_locale, status) values
      (${lit(tenantA.id)}, ${lit(SYNTHETIC_PREFIX + "alpha")}, ${lit(tenantA.slug)}, 'SAR', 'en', 'active'),
      (${lit(tenantB.id)}, ${lit(SYNTHETIC_PREFIX + "beta")},  ${lit(tenantB.slug)}, 'SAR', 'en', 'active');

    insert into public.membership (id, tenant_id, member_id, role, status) values
      (${lit(memberships.aOwner)},  ${lit(tenantA.id)}, ${lit(aOwner.authId)},  'owner',  'active'),
      (${lit(memberships.aViewer)}, ${lit(tenantA.id)}, ${lit(aViewer.authId)}, 'viewer', 'active'),
      (${lit(memberships.bOwner)},  ${lit(tenantB.id)}, ${lit(bOwner.authId)},  'owner',  'active'),
      (${lit(memberships.bViewer)}, ${lit(tenantB.id)}, ${lit(bViewer.authId)}, 'viewer', 'active');

    insert into public.consent_grant (id, tenant_id, granted_by, scope, expires_at) values
      (${lit(consentA)}, ${lit(tenantA.id)}, ${lit(aOwner.authId)}, 'read_only', now() + interval '1 day'),
      (${lit(consentB)}, ${lit(tenantB.id)}, ${lit(bOwner.authId)}, 'read_only', now() + interval '1 day');

    insert into public.activity_event (id, tenant_id, actor_member_id, action, entity_type, entity_id) values
      (${lit(eventA)}, ${lit(tenantA.id)}, ${lit(aOwner.authId)}, ${lit(SYNTHETIC_PREFIX + "seeded")}, 'Tenant', ${lit(tenantA.id)}),
      (${lit(eventB)}, ${lit(tenantB.id)}, ${lit(bOwner.authId)}, ${lit(SYNTHETIC_PREFIX + "seeded")}, 'Tenant', ${lit(tenantB.id)});
  `);

  return {
    runId,
    a: {
      label: "A",
      id: tenantA.id,
      slug: tenantA.slug,
      owner: aOwner,
      viewer: aViewer,
      ownerMembershipId: memberships.aOwner,
      viewerMembershipId: memberships.aViewer,
      consentGrantId: consentA,
      activityEventId: eventA,
    },
    b: {
      label: "B",
      id: tenantB.id,
      slug: tenantB.slug,
      owner: bOwner,
      viewer: bViewer,
      ownerMembershipId: memberships.bOwner,
      viewerMembershipId: memberships.bViewer,
      consentGrantId: consentB,
      activityEventId: eventB,
    },
    unaffiliated,
    operator,
    everyIdentity: [aOwner, aViewer, bOwner, bViewer, unaffiliated, operator],
  };
}

// ---------------------------------------------------------------------------
// Teardown — a requirement, not manners (ADR-012)
// ---------------------------------------------------------------------------

export type TeardownCounts = Record<string, number>;

/**
 * Idempotent. Removes every row carrying the synthetic prefix, whether or not
 * this run created it, so a suite that died mid-flight still leaves the project
 * clean on its next execution.
 *
 * The membership delete runs with the active-owner constraint trigger disabled.
 * That trigger refuses any statement leaving a tenant with zero active owners —
 * proof 12 asserts exactly that — which makes removing a synthetic tenant's last
 * owner impossible through any ordinary path. Disabling it needs table
 * ownership, which is why teardown is privileged SQL and not a PostgREST call.
 */
/**
 * The schema proof 25b's fault injection lives in. Named here rather than in the
 * proof so that teardown can remove it unconditionally: a run that dies between
 * creating the trigger and dropping it would otherwise leave a trigger on
 * `activity_event` that refuses one member's writes forever, and the next run
 * would inherit it.
 *
 * Outside `public` on purpose. Proofs 14, 15 and 22 census `public` and assert
 * exact sets against it, so a fault-injection helper placed there would fail
 * three unrelated proofs depending on which ran first — an order dependency that
 * looks like a policy regression.
 */
export const FAULT_SCHEMA = "zz_test_fault";

export async function teardown(config: Config, sql: SqlRunner): Promise<void> {
  const prefix = lit(`${SYNTHETIC_PREFIX}%`);

  const orphans = await sql<{ id: string }>(
    `select id::text as id from auth.users where email like ${prefix}`,
  );

  await sql(`
    drop schema if exists ${FAULT_SCHEMA} cascade;

    alter table public.membership disable trigger membership_active_owner_required;

    delete from public.activity_event
     where tenant_id in (select id from public.tenant where slug like ${prefix});

    delete from public.consent_grant
     where tenant_id in (select id from public.tenant where slug like ${prefix});

    delete from public.membership
     where tenant_id in (select id from public.tenant where slug like ${prefix});

    delete from public.tenant where slug like ${prefix};

    delete from public.operator
     where id in (select id from auth.users where email like ${prefix});

    delete from public.member where email::text like ${prefix};

    alter table public.membership enable trigger membership_active_owner_required;
  `);

  const auth = makeAuthAdmin(config);
  for (const orphan of orphans) await auth.deleteUser(orphan.id);
}

/** A teardown you did not verify did not happen. */
export async function teardownCounts(sql: SqlRunner): Promise<TeardownCounts> {
  const prefix = lit(`${SYNTHETIC_PREFIX}%`);
  const [row] = await sql<TeardownCounts>(`
    select
      (select count(*) from public.tenant)::int                                     as tenant_total,
      (select count(*) from public.member)::int                                     as member_total,
      (select count(*) from public.membership)::int                                 as membership_total,
      (select count(*) from public.operator)::int                                   as operator_total,
      (select count(*) from public.consent_grant)::int                              as consent_grant_total,
      (select count(*) from public.activity_event)::int                             as activity_event_total,
      (select count(*) from auth.users)::int                                        as auth_users_total,
      (select count(*) from public.tenant
        where slug like ${prefix} or name like ${prefix})::int                      as tenant_synthetic,
      (select count(*) from public.member
        where email::text like ${prefix} or display_name like ${prefix})::int       as member_synthetic,
      (select count(*) from public.activity_event
        where action like ${prefix})::int                                           as activity_event_synthetic,
      (select count(*) from auth.users where email like ${prefix})::int             as auth_users_synthetic,
      -- Proof 25b creates a schema, a function and a trigger to force a failure
      -- mid-provisioning. All three are counted here, because a fault injection
      -- that outlives its proof is a live defect wearing a test's name — and the
      -- trigger is the one that would matter, since it sits on activity_event.
      (select count(*) from pg_namespace
        where nspname = '${FAULT_SCHEMA}')::int                                     as fault_schema_total,
      (select count(*) from pg_trigger t
         join pg_class c on c.oid = t.tgrelid
        where not t.tgisinternal
          and c.relnamespace = 'public'::regnamespace
          and t.tgname like ${lit(`${FAULT_SCHEMA}%`)})::int                         as fault_trigger_total
  `);
  return row;
}

// ---------------------------------------------------------------------------
// The PASS/FAIL ledger the gate reads
// ---------------------------------------------------------------------------

export type LedgerLine = {
  id: string;
  claim: string;
  verdict: "PASS" | "FAIL";
  evidence: string;
  failures: string[];
};

const ledger: LedgerLine[] = [];

export function recordedAssertions(): string[] {
  return ledger.map((line) => line.id);
}

export function record(id: string, claim: string, failures: string[], evidence: string): string[] {
  ledger.push({
    id,
    claim,
    verdict: failures.length === 0 ? "PASS" : "FAIL",
    evidence,
    failures,
  });
  return failures;
}

/**
 * Every assertion this suite is expected to record. A proof that throws before
 * reaching `record` leaves no line at all, and a ledger that is simply shorter
 * than it should be reads as a clean result — the exact shape PR-21 forbids. The
 * count is asserted so an absent proof is louder than a failing one.
 */
export const EXPECTED_ASSERTIONS = [
  "1", "2", "3", "4a", "4b", "4c", "4d", "5", "6", "7", "8",
  "9", "10", "11", "12", "13", "14", "15", "16", "17",
  // P01-T04 — one line per fix, so a closed finding that reopens is louder
  // than a finding that was never tested.
  "18a", "18b", "18c", "18d", "18e", "19", "20a", "20b", "21", "22",
  // P02-T04 — OD-G14's resolution contract, one line per row of it plus the
  // four probes this task invented. 23l, 23m, 23n and 23o found nothing and are
  // here anyway: OD-H11 lands a probe that passes, because that is the one that
  // catches tomorrow's regression.
  "23a", "23b", "23c", "23d", "23e", "23f", "23g", "23h",
  "23i", "23j", "23k", "23l", "23m", "23n", "23o",
  // P02-T05 — OD-G13's two acts. 24 is member materialisation, 25 is tenant
  // provisioning, 26 is CF-128's duplicate selector header. 24c and 25f found
  // nothing and are here anyway, per OD-H11.
  "24a", "24b", "24c",
  "25a", "25b", "25c", "25d", "25e", "25f",
  "26",
  "D",
];

export function printLedger(): void {
  const width = Math.max(20, ...ledger.map((line) => line.claim.length));
  const out = ["", "=== TENANT-ISOLATION PROOF LEDGER — DATA_MODEL.md §5, live catalog ===", ""];

  for (const line of ledger) {
    out.push(`${line.verdict}  ${line.id.padEnd(4)} ${line.claim.padEnd(width)}  ${line.evidence}`);
    for (const failure of line.failures) out.push(`        ! ${failure}`);
  }

  const recorded = new Set(ledger.map((line) => line.id));
  const missing = EXPECTED_ASSERTIONS.filter((id) => !recorded.has(id));
  for (const id of missing) {
    out.push(`LOST  ${id.padEnd(4)} ${"assertion never recorded".padEnd(width)}  the proof threw before reaching a verdict`);
  }

  const failed = ledger.filter((line) => line.verdict === "FAIL").length;
  out.push(
    "",
    `${EXPECTED_ASSERTIONS.length} expected — ${ledger.length - failed} PASS, ${failed} FAIL, ${missing.length} LOST`,
    "",
  );
  console.log(out.join("\n"));
}
