// P03-T23. The wizard's browser harness. Privileged credentials are confined
// to this file, and only to creating and removing synthetic members. The
// screens under test write through the member's own session. Same shape as
// the isolation harness: GoTrue admin, then the Management API for teardown.
// Staging-named variables only. A production ref is a failure before any call.

import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// Push and pull_request both run this suite against the same staging
// database. A shared prefix lets one run's teardown delete the other's
// member mid-test. The run id keeps each suite inside its own names.
const PREFIX = `zz-test-wiz-${process.env.GITHUB_RUN_ID ?? "local"}-`;
const PRODUCTION_REF = "akpvvydmltmfmkmwivgn";

export type Member = { id: string; email: string; password: string };

type Config = {
  url: string;
  publishableKey: string;
  serviceRoleKey: string;
  accessToken: string;
  projectRef: string;
};

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
    const quoted = (value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"));
    if (quoted && value.length >= 2) value = value.slice(1, -1);
    process.env[key] = value;
  }
}

function config(): Config {
  loadEnvLocal();
  const names = [
    "SUPABASE_STAGING_URL",
    "SUPABASE_STAGING_PUBLISHABLE_KEY",
    "SUPABASE_STAGING_SERVICE_ROLE_KEY",
    "SUPABASE_STAGING_PROJECT_ID",
    "SUPABASE_ACCESS_TOKEN",
  ];
  const missing = names.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`FAIL: onboarding harness absent staging configuration: ${missing.join(", ")}`);
  }
  const url = process.env.SUPABASE_STAGING_URL!.replace(/\/+$/, "");
  const projectRef = process.env.SUPABASE_STAGING_PROJECT_ID!;
  const urlRef = new URL(url).hostname.split(".")[0];
  if (urlRef !== projectRef || urlRef === PRODUCTION_REF || projectRef === PRODUCTION_REF) {
    throw new Error("FAIL: onboarding harness refuses to run. The staging URL is not the staging ref.");
  }
  return {
    url,
    publishableKey: process.env.SUPABASE_STAGING_PUBLISHABLE_KEY!,
    serviceRoleKey: process.env.SUPABASE_STAGING_SERVICE_ROLE_KEY!,
    accessToken: process.env.SUPABASE_ACCESS_TOKEN!,
    projectRef,
  };
}

function lit(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

async function sql<T>(query: string): Promise<T[]> {
  const current = config();
  const response = await fetch(`https://api.supabase.com/v1/projects/${current.projectRef}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${current.accessToken}`,
      "Content-Type": "application/json",
      "User-Agent": "B2S-P03-T23-onboarding/1.0",
    },
    body: JSON.stringify({ query }),
  });
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`SQL ${response.status}: ${body.slice(0, 400)}`);
  }
  const parsed = JSON.parse(body) as T[] | { message?: string };
  if (!Array.isArray(parsed)) {
    throw new Error(`SQL returned no rows: ${body.slice(0, 400)}`);
  }
  return parsed;
}

export async function createMember(label: string): Promise<Member> {
  const current = config();
  const email = `${PREFIX}${label}-${randomUUID().slice(0, 8)}@example.com`;
  const password = randomUUID();
  const response = await fetch(`${current.url}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: current.serviceRoleKey,
      Authorization: `Bearer ${current.serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`create synthetic member failed: ${response.status}`);
  const user = JSON.parse(body) as { id?: string };
  if (!user.id) throw new Error("create synthetic member returned no id");
  return { id: user.id, email, password };
}

export async function memberToken(member: Member): Promise<string> {
  const current = config();
  const response = await fetch(`${current.url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: current.publishableKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email: member.email, password: member.password }),
  });
  if (!response.ok) throw new Error(`synthetic sign-in failed: ${response.status}`);
  const session = (await response.json()) as { access_token?: string };
  if (!session.access_token) throw new Error("synthetic sign-in returned no token");
  return session.access_token;
}

export async function memberGet<T>(token: string, path: string): Promise<T> {
  const current = config();
  const response = await fetch(`${current.url}/rest/v1/${path}`, {
    headers: { apikey: current.publishableKey, Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`member read failed: ${response.status}`);
  return (await response.json()) as T;
}

export async function memberPatch(token: string, path: string, body: Record<string, string>): Promise<void> {
  const current = config();
  const response = await fetch(`${current.url}/rest/v1/${path}`, {
    method: "PATCH",
    headers: {
      apikey: current.publishableKey,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`member patch failed: ${response.status} ${text.slice(0, 200)}`);
  }
}

export async function memberRpcResult(
  token: string,
  name: string,
  args: Record<string, string | number | null>,
): Promise<{ ok: boolean; body: string }> {
  const current = config();
  const response = await fetch(`${current.url}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: current.publishableKey,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  return { ok: response.ok, body: await response.text() };
}

export async function memberRpc(token: string, name: string, args: Record<string, string>): Promise<void> {
  const current = config();
  const response = await fetch(`${current.url}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: current.publishableKey,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`member rpc ${name} failed: ${response.status} ${body.slice(0, 200)}`);
  }
}

export async function addViewer(tenantId: string, memberId: string): Promise<void> {
  if (!/^[0-9a-f-]{36}$/i.test(tenantId) || !/^[0-9a-f-]{36}$/i.test(memberId)) {
    throw new Error("refusing to write a membership for a non-uuid");
  }
  await sql(
    `insert into public.membership (tenant_id, member_id, role, status, accepted_at) values (${lit(tenantId)}, ${lit(memberId)}, 'viewer', 'active', now())`,
  );
}

export async function markComplete(tenantId: string): Promise<void> {
  if (!/^[0-9a-f-]{36}$/i.test(tenantId)) throw new Error("refusing to mark a non-uuid complete");
  await sql(`
    update public.brand
       set current_profile_id = (
         select id from public.brand_profile where tenant_id = ${lit(tenantId)} order by version desc limit 1
       )
     where tenant_id = ${lit(tenantId)};
    update public.onboarding_draft
       set archived_at = now()
     where tenant_id = ${lit(tenantId)};
  `);
}

type Counts = { users: number; members: number; tenants: number; objects: number };

export async function teardownSynthetic(): Promise<Counts> {
  const prefix = lit(`${PREFIX}%`);
  const targets = await sql<{ tenant_id: string | null; user_id: string }>(`
    select u.id::text as user_id, t.id::text as tenant_id
      from auth.users u
      left join public.tenant t
        on t.created_by = u.id
        or t.id in (select m.tenant_id from public.membership m where m.member_id = u.id)
     where u.email like ${prefix}
  `);
  const userIds = [...new Set(targets.map((row) => row.user_id))].filter((id) => /^[0-9a-f-]{36}$/i.test(id));
  const tenantIds = [...new Set(targets.map((row) => row.tenant_id).filter((id): id is string => Boolean(id)))].filter(
    (id) => /^[0-9a-f-]{36}$/i.test(id),
  );
  try {
    if (tenantIds.length > 0) {
      const ids = tenantIds.map(lit).join(", ");
      await sql(`
        select set_config('storage.allow_delete_query', 'true', true);
        delete from storage.objects
         where bucket_id = 'tenant-media'
           and split_part(name, '/', 1) in (${ids});
        alter table public.membership disable trigger membership_active_owner_required;
        update public.brand set current_profile_id = null where tenant_id in (${ids});
        delete from public.color_value where tenant_id in (${ids});
        delete from public.typeface where tenant_id in (${ids});
        delete from public.logo_variant where tenant_id in (${ids});
        delete from public.brand_guideline where tenant_id in (${ids});
        delete from public.brand_theme where tenant_id in (${ids});
        delete from public.brand_line where tenant_id in (${ids});
        delete from public.brand_profile where tenant_id in (${ids});
        delete from public.brand where tenant_id in (${ids});
        delete from public.asset_rendition where tenant_id in (${ids});
        delete from public.media_asset where tenant_id in (${ids});
        delete from public.onboarding_draft_color where tenant_id in (${ids});
        delete from public.onboarding_draft where tenant_id in (${ids});
        delete from public.legal_entity where tenant_id in (${ids});
        delete from public.translation_entry where tenant_id in (${ids});
        delete from public.translation_key where tenant_id in (${ids});
        delete from public.invitation where tenant_id in (${ids});
        delete from public.activity_event where tenant_id in (${ids});
        delete from public.consent_grant where tenant_id in (${ids});
        delete from public.membership where tenant_id in (${ids});
        delete from public.tenant where id in (${ids});
        alter table public.membership enable trigger membership_active_owner_required;
      `);
    }
    if (userIds.length > 0) {
      const ids = userIds.map(lit).join(", ");
      await sql(`
        alter table public.membership disable trigger membership_active_owner_required;
        delete from public.membership where member_id in (${ids});
        delete from public.activity_event where actor_member_id in (${ids});
        delete from public.member where id in (${ids});
        alter table public.membership enable trigger membership_active_owner_required;
      `);
    }
  } finally {
    if (tenantIds.length > 0) {
      const ids = tenantIds.map(lit).join(", ");
      await sql(`
        select set_config('storage.allow_delete_query', 'true', true);
        delete from storage.objects
         where bucket_id = 'tenant-media'
           and split_part(name, '/', 1) in (${ids});
      `);
    }
    await sql("alter table public.membership enable trigger membership_active_owner_required;");
  }
  const current = config();
  for (const id of userIds) {
    const response = await fetch(`${current.url}/auth/v1/admin/users/${id}`, {
      method: "DELETE",
      headers: { apikey: current.serviceRoleKey, Authorization: `Bearer ${current.serviceRoleKey}` },
    });
    if (!response.ok && response.status !== 404) {
      throw new Error(`teardown could not remove a synthetic identity: ${response.status}`);
    }
  }
  const [counts] = await sql<Counts>(`
    select
      (select count(*)::int from auth.users where email like ${prefix}) as users,
      (select count(*)::int from public.member where email::text like ${prefix}) as members,
      (select count(*)::int from public.tenant where name like ${prefix} or created_by in (${userIds.length ? userIds.map(lit).join(", ") : "null"})) as tenants,
      (select count(*)::int from storage.objects
        where bucket_id = 'tenant-media'
          and split_part(name, '/', 1) in (${tenantIds.length ? tenantIds.map(lit).join(", ") : "''"})) as objects
  `);
  return counts ?? { users: 0, members: 0, tenants: 0, objects: 0 };
}

export function png(width: number, height: number): Buffer {
  const bytes = Buffer.alloc(24);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d], 0);
  bytes.write("IHDR", 12, "ascii");
  bytes.writeUInt32BE(width, 16);
  bytes.writeUInt32BE(height, 20);
  return bytes;
}

export function svg(body: string): Buffer {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg">${body}</svg>`);
}
