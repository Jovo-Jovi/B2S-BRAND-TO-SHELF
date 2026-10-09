// Onboarding phase timings stay out of production. The header value is
// produced by lib/observability/server-timing.ts and nowhere else. Removing
// or emptying that module, or a file that sets the header, is a failure
// (PR-27), reported as one FAIL line and not a stack.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MODULE = "lib/observability/server-timing.ts";
const MINIMUM_PHASES = 24;
const SCAN_ROOTS = ["app", "features", "lib", "scripts", "__tests__", "proxy.ts"];
const WRITERS = [
  "lib/observability/phase-timing.ts",
  "lib/supabase/session.ts",
];
const ALLOWED = new Set([
  MODULE,
  ...WRITERS,
  "scripts/check-server-timing.mjs",
  "__tests__/server-timing.test.ts",
]);

let failed = false;

function fail(message) {
  console.error(`FAIL: ${message}`);
  failed = true;
}

function read(relativePath) {
  const path = join(ROOT, relativePath);
  if (!existsSync(path)) return null;
  return readFileSync(path, "utf8");
}

function walk(path, found) {
  if (!existsSync(path)) return;
  const stats = statSync(path);
  if (stats.isDirectory()) {
    for (const entry of readdirSync(path)) walk(join(path, entry), found);
    return;
  }
  if (!/\.(ts|tsx|mjs|js)$/.test(path)) return;
  const text = readFileSync(path, "utf8");
  if (/server-timing/i.test(text)) {
    found.push(relative(ROOT, path).split(sep).join("/"));
  }
}

const moduleUrl = pathToFileURL(join(ROOT, MODULE)).href;
let timing = null;
try {
  timing = await import(moduleUrl);
} catch {
  fail(`${MODULE} did not load, so production could not be checked`);
}

if (timing) {
  const phases = timing.PHASES;
  if (!Array.isArray(phases) || phases.length < MINIMUM_PHASES) {
    fail(`${MODULE} names ${Array.isArray(phases) ? phases.length : 0} phase(s), minimum ${MINIMUM_PHASES}`);
  } else {
    const samples = phases.map((name) => ({ name, dur: 1.2 }));
    if (timing.serverTimingHeader("production", samples) !== null) {
      fail("production emitted a server timing header");
    }
    const preview = timing.serverTimingHeader("preview", samples);
    const local = timing.serverTimingHeader(undefined, [{ name: "proxy", dur: 2 }]);
    const shape = /^[a-z0-9-]+;dur=\d+\.\d+(?:, [a-z0-9-]+;dur=\d+\.\d+)*$/;
    if (typeof preview !== "string" || !shape.test(preview) || preview.includes("@")) {
      fail("preview header is not a list of allowlisted durations");
    } else if (timing.parseServerTiming(preview).length < MINIMUM_PHASES) {
      fail(`preview header kept ${timing.parseServerTiming(preview).length} phase(s), minimum ${MINIMUM_PHASES}`);
    }
    if (local !== "proxy;dur=2.0") {
      fail("an unset deployment environment emitted no duration");
    }
    const leaked = timing.serverTimingHeader("preview", [{ name: "person@example.com", dur: 4 }]);
    if (leaked !== null) fail("a sample outside the phase list was emitted");
  }
}

for (const writer of WRITERS) {
  const text = read(writer);
  if (text === null) {
    fail(`${writer} is not a file, so its header cannot be checked`);
    continue;
  }
  if (!text.includes("serverTimingHeader")) {
    fail(`${writer} sets timings without the production gate`);
  }
}

const found = [];
for (const root of SCAN_ROOTS) walk(join(ROOT, root), found);
if (found.length < WRITERS.length) {
  fail(`${found.length} file(s) mention the timing header, minimum ${WRITERS.length}`);
}
for (const file of found) {
  if (!ALLOWED.has(file)) fail(`${file} mentions the timing header and is not a writer`);
}

if (failed) process.exit(1);
console.log(
  `OK: server timing stays out of production, ${timing && Array.isArray(timing.PHASES) ? timing.PHASES.length : 0} phase(s), minimum ${MINIMUM_PHASES}`,
);
