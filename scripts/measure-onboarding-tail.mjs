// Measures onboarding time-to-headers on one preview, as one synthetic owner.
// Human pace waits three seconds after each response. Burst does not.
// The output is durations, status codes and request ids. No cookie, token,
// email or typed value is written.

import { appendFileSync, mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";

const ROUTES = [
  "/en/onboarding",
  "/en/onboarding/welcome",
  "/en/onboarding/brand",
  "/en/onboarding/typography",
  "/en/onboarding/company",
  "/en/onboarding/guidelines",
  "/en/onboarding/review",
  "/en/onboarding/complete",
];
const SAMPLES = 50;
const HUMAN_GAP_MS = 3000;
const CLIENT_ABORT_MS = 180000;

const probeOnly = process.argv.includes("--probe");
const humanOnly = process.argv.includes("--human");
const sharePath = resolve("test-results/preview-share.txt");
const share = readFileSync(sharePath, "utf8").trim();
const shareUrl = new URL(share);
if (shareUrl.protocol !== "https:" || !shareUrl.hostname.endsWith(".vercel.app")) {
  throw new Error("preview address is not a vercel.app https url");
}
const origin = shareUrl.origin;

function sleep(ms) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function cookieHeader(jar) {
  return [...jar.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
}

function takeSetCookies(response, jar) {
  const lines = typeof response.headers.getSetCookie === "function" ? response.headers.getSetCookie() : [];
  let refreshed = false;
  for (const line of lines) {
    const pair = line.split(";")[0] ?? "";
    const eq = pair.indexOf("=");
    if (eq <= 0) continue;
    jar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
    refreshed = true;
  }
  return refreshed;
}

async function once(jar, route) {
  const startedAt = new Date().toISOString();
  const started = performance.now();
  const response = await fetch(`${origin}${route}`, {
    redirect: "manual",
    headers: { cookie: cookieHeader(jar) },
    signal: AbortSignal.timeout(CLIENT_ABORT_MS),
  });
  const endedAt = new Date().toISOString();
  const ms = performance.now() - started;
  const timing = response.headers.get("server-timing");
  const vercelId = response.headers.get("x-vercel-id");
  const refreshed = takeSetCookies(response, jar);
  try {
    await response.body?.cancel();
  } catch {
    // The body may already be closed.
  }
  const denied = timing ? /(?:^|,\s*)http-429;dur=(\d+\.\d+)/.exec(timing) : null;
  return {
    ms: Math.round(ms),
    status: response.status,
    timing,
    vercelId,
    refreshed,
    denied: denied ? Number(denied[1]) : 0,
    startedAt,
    endedAt,
  };
}

function record(file, row) {
  appendFileSync(file, `${JSON.stringify(row)}\n`);
  if (row.ms >= 3000) {
    console.log(
      `SLOW ${row.mode} ${row.route} #${row.i} ${row.ms}ms status=${row.status} refreshed=${row.refreshed} denied=${row.denied} id=${row.vercelId ?? "-"} timing=${row.timing ?? "-"}`,
    );
  }
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

process.env.GITHUB_RUN_ID = `tail${Date.now()}`;
const harness = await import("../__tests__/browser/onboarding-members.ts");

mkdirSync(resolve("test-results"), { recursive: true });
const outFile = resolve("test-results/onboarding-tail.jsonl");

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();
try {
  await page.goto(share, { waitUntil: "commit", timeout: 60000 });
} catch {
  throw new Error("preview bypass navigation failed");
}
const landed = new URL(page.url());
console.log(`bypass path=${landed.pathname}`);
if (probeOnly) {
  const jar = new Map();
  for (const cookie of await context.cookies(origin)) jar.set(cookie.name, cookie.value);
  console.log(`cookie names=${[...jar.keys()].join(",")}`);
  const row = await once(jar, "/en/onboarding");
  console.log(`probe status=${row.status} ms=${row.ms} id=${row.vercelId ?? "-"} timing=${row.timing ?? "-"}`);
  await browser.close();
  process.exit(0);
}

let failed = false;
try {
  const member = await harness.createMember("pace");
  const token = await harness.memberToken(member);
  await harness.memberRpc(token, "provision_tenant", {
    p_name: `${harness.PREFIX}pace`,
    p_base_currency: "EGP",
    p_default_locale: "en",
  });
  await page.goto(`${origin}/en/sign-in?next=/en/onboarding`, { waitUntil: "domcontentloaded", timeout: 60000 });
  const copy = JSON.parse(readFileSync(resolve("app/[locale]/dictionaries/en.json"), "utf8"));
  const form = page.locator('[role="tabpanel"]:not([hidden]) form').filter({ has: page.locator('input[name="email"]') });
  await form.locator('input[name="email"]').fill(member.email);
  await form.locator('input[name="password"]').fill(member.password);
  await form.getByRole("button", { name: copy.access.signInSubmit }).click();
  await page.waitForURL((url) => url.pathname === "/en/onboarding" || url.pathname.startsWith("/en/onboarding/"), {
    timeout: 60000,
  });
  const jar = new Map();
  for (const cookie of await context.cookies(origin)) jar.set(cookie.name, cookie.value);
  await browser.close();

  const warm = await once(jar, "/en/onboarding/brand");
  record(outFile, { mode: "warmup", route: "/en/onboarding/brand", i: 0, ...warm });
  console.log(`warmup status=${warm.status} ms=${warm.ms}`);

  for (const mode of humanOnly ? ["human"] : ["human", "burst"]) {
    for (const route of ROUTES) {
      const taken = [];
      for (let i = 1; i <= SAMPLES; i += 1) {
        const row = await once(jar, route);
        taken.push(row);
        record(outFile, { mode, route, i, ...row });
        if (i === 1 || i % 10 === 0) console.log(`${mode} ${route} #${i} ${row.ms}ms status=${row.status}`);
        if (mode === "human") await sleep(HUMAN_GAP_MS);
      }
      const stats = summarise(taken);
      console.log(
        `TABLE ${mode} ${route} n=${stats.n} median=${stats.median} p95=${stats.p95} max=${stats.max} over3s=${stats.over}`,
      );
    }
  }
} catch (error) {
  failed = true;
  console.error(error instanceof Error ? error.message : "measurement failed");
} finally {
  if (browser.isConnected()) await browser.close();
  const counts = await harness.teardownSynthetic();
  console.log(
    `teardown users=${counts.users} members=${counts.members} tenants=${counts.tenants} objects=${counts.objects}`,
  );
  if (counts.users !== 0 || counts.members !== 0 || counts.tenants !== 0 || counts.objects !== 0) {
    console.error("synthetic rows remain");
    process.exit(1);
  }
}
if (failed) process.exit(1);
