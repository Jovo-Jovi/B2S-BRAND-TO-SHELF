// Match each onboarding request over three seconds to the database
// samples taken while it was in flight. Prints durations and wait counts.
// No cookie, token or email.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const requests = readFileSync(resolve("test-results/onboarding-tail.jsonl"), "utf8")
  .trim()
  .split(/\n/)
  .filter(Boolean)
  .map((line) => JSON.parse(line));
const samples = readFileSync(resolve("test-results/db-activity.jsonl"), "utf8")
  .trim()
  .split(/\n/)
  .filter(Boolean)
  .map((line) => JSON.parse(line));

function at(value) {
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : null;
}

function summarise(rows) {
  const sorted = [...rows].sort((a, b) => a.ms - b.ms);
  const mid = sorted.length / 2;
  const median = sorted.length % 2 === 0 ? (sorted[mid - 1].ms + sorted[mid].ms) / 2 : sorted[Math.floor(mid)].ms;
  const p95 = sorted[Math.ceil(0.95 * sorted.length) - 1].ms;
  const max = sorted[sorted.length - 1].ms;
  const over = sorted.filter((row) => row.ms >= 3000).length;
  return { n: sorted.length, median, p95, max, over };
}

const human = requests.filter((row) => row.mode === "human");
const byRoute = new Map();
for (const row of human) {
  const list = byRoute.get(row.route) ?? [];
  list.push(row);
  byRoute.set(row.route, list);
}
for (const [route, rows] of byRoute) {
  const stats = summarise(rows);
  console.log(
    `TABLE human ${route} n=${stats.n} median=${stats.median} p95=${stats.p95} max=${stats.max} over3s=${stats.over}`,
  );
}

const slow = human.filter((row) => row.ms >= 3000);
console.log(`SLOW ${slow.length} of ${human.length}`);
for (const row of slow) {
  const start = at(row.startedAt);
  const end = at(row.endedAt);
  const during = samples.filter((sample) => {
    const time = at(sample.t);
    return start !== null && end !== null && time !== null && time >= start && time <= end;
  });
  const waits = during.map((sample) => ({
    t: sample.t,
    rttMs: sample.rttMs,
    status: sample.status,
    connections: sample.connections ?? null,
    active: sample.active ?? null,
    error: sample.error ?? null,
    waits: sample.waits ?? null,
  }));
  console.log(
    JSON.stringify({
      route: row.route,
      i: row.i,
      ms: row.ms,
      status: row.status,
      vercelId: row.vercelId,
      timing: row.timing,
      refreshed: row.refreshed,
      denied: row.denied,
      startedAt: row.startedAt,
      endedAt: row.endedAt,
      dbSamples: waits.length,
      db: waits,
    }),
  );
}
