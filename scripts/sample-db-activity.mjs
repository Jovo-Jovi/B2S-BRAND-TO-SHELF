// Once a second, through the Management API, record staging's
// pg_stat_activity and the round trip of a statement that starts with
// select 1. The application does not use this path. No query text, role
// name or connection string is written.

import { appendFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const STAGING = "bnjrgoaoujnrlvuxicca";
const PRODUCTION = "akpvvydmltmfmkmwivgn";
const UA = "B2S-P03-T28-FIX-independent/1.0";
const INTERVAL_MS = 1000;

function loadEnv() {
  const file = resolve(".env.local");
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

loadEnv();

const token = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef = process.env.SUPABASE_STAGING_PROJECT_ID;
if (!token || projectRef !== STAGING || projectRef === PRODUCTION) {
  throw new Error("database sample refuses to run. Staging is not the configured ref.");
}

const query = `
select 1 as probe,
       (select count(*)::int from pg_stat_activity) as connections,
       (select count(*)::int from pg_stat_activity where state = 'active') as active,
       (
         select coalesce(json_agg(json_build_object(
                  'state', state,
                  'wait_event_type', wait_event_type,
                  'wait_event', wait_event,
                  'n', n
                ) order by n desc), '[]'::json)
           from (
             select coalesce(state, '(null)') as state,
                    coalesce(wait_event_type, '(null)') as wait_event_type,
                    coalesce(wait_event, '(null)') as wait_event,
                    count(*)::int as n
               from pg_stat_activity
              group by 1, 2, 3
           ) grouped
       ) as waits
`;

mkdirSync(resolve("test-results"), { recursive: true });
const outFile = resolve("test-results/db-activity.jsonl");

function sleep(ms) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

async function sampleOnce() {
  const started = performance.now();
  const t = new Date().toISOString();
  let response;
  try {
    response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": UA,
      },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(20000),
    });
  } catch (error) {
    return {
      t,
      rttMs: Math.round(performance.now() - started),
      status: 0,
      error: error instanceof Error ? error.name : "network",
    };
  }
  const rttMs = Math.round(performance.now() - started);
  const text = await response.text();
  if (!response.ok) {
    return { t, rttMs, status: response.status, error: `http-${response.status}` };
  }
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { t, rttMs, status: response.status, error: "not-json" };
  }
  const row = Array.isArray(parsed) ? parsed[0] : null;
  if (!row || row.probe !== 1) {
    return { t, rttMs, status: response.status, error: "no-probe" };
  }
  let waits = row.waits;
  if (typeof waits === "string") {
    try {
      waits = JSON.parse(waits);
    } catch {
      waits = [];
    }
  }
  return {
    t,
    rttMs,
    status: response.status,
    connections: row.connections,
    active: row.active,
    waits,
  };
}

const once = process.argv.includes("--once");
let stop = false;
process.on("SIGINT", () => {
  stop = true;
});
process.on("SIGTERM", () => {
  stop = true;
});

let taken = 0;
while (!stop) {
  const started = Date.now();
  let row = await sampleOnce();
  if (row.status === 0 || row.status >= 500) {
    await sleep(250);
    if (!stop) row = await sampleOnce();
  }
  appendFileSync(outFile, `${JSON.stringify(row)}\n`);
  taken += 1;
  if (taken === 1 || taken % 30 === 0) {
    console.log(`db-sample #${taken} status=${row.status} rtt=${row.rttMs} connections=${row.connections ?? "-"}`);
  }
  if (once) break;
  const remain = INTERVAL_MS - (Date.now() - started);
  if (remain > 0) await sleep(remain);
}
console.log(`db-sample stopped after ${taken}`);
