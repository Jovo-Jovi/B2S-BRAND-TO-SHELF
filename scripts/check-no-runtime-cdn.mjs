#!/usr/bin/env node
// ARCHITECTURE.md §6 — "No runtime CDN". Fonts and libraries are bundled;
// nothing in the application source may load a script or stylesheet from an
// external origin at request time. Scans app/, lib/, docs/, features/,
// components/ and the root proxy for a JSX/HTML <script> or <link> element
// whose src/href resolves to an external URL. docs/ is in scope because
// docs/roadmap.html is generated output served as a static page and is
// otherwise unguarded by construction.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOTS = ["app", "proxy.ts", "lib", "docs", "features", "components"];
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".html", ".css"]);

// PR-27 — a check states the minimum it expected to examine and fails when it
// examined less. Without this floor the guard reports "OK ... 0 file(s)" and
// exits 0 the day a scan root is renamed or moved, which is a guard that has
// stopped guarding while still reporting success. CF-94 — the floor is the
// true count across all three roots as of the commit that adds `lib/`, not
// the placeholder 1 that let `lib/` ship unscanned in the first place.
// P02-T09-FIX — docs/ and .html widen the surface to 9 as of that commit
// (app: 3, proxy.ts: 1, lib: 3, docs: 2). P02-T14 adds features/ and
// raises the floor to the true count of 19. P03-T08 adds .css so the guard
// can see where self-hosted fonts load from, and raises the floor to 20
// (app/globals.css). P03-T09 adds components/ and raises the floor to the
// true count measured with that root present. Changed condition, not a new
// premise: the two-way pair stays the scan roots [app, proxy.ts, lib, docs, features].
const MINIMUM_FILES = 59;
const MINIMUM_FONT_SOURCES = 6;

const EXTERNAL_TAG = /<(script|link)\b[^>]*\b(?:src|href)\s*=\s*["'`]((?:https?:)?\/\/[^"'`]+)["'`]/gi;
const EXTERNAL_URL = /url\(\s*["']?((?:https?:)?\/\/[^"')]+)["']?\s*\)/gi;
const FONT_URL = /url\(\s*["']?([^"')]+)["']?\s*\)/gi;

let violations = 0;
let filesScanned = 0;
const fontSources = new Set();
const perRoot = new Map();
const absentRoots = [];

function walk(path) {
  const stats = statSync(path);
  if (stats.isDirectory()) {
    for (const entry of readdirSync(path)) {
      walk(join(path, entry));
    }
    return;
  }
  if (!EXTENSIONS.has(extname(path))) {
    return;
  }
  filesScanned += 1;
  const contents = readFileSync(path, "utf8");
  const lines = contents.split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    if (EXTERNAL_TAG.test(lines[i])) {
      violations += 1;
      console.error(`FAIL: external <script>/<link> at ${path}:${i + 1}`);
    }
    EXTERNAL_TAG.lastIndex = 0;
    if (EXTERNAL_URL.test(lines[i])) {
      violations += 1;
      console.error(`FAIL: external url() at ${path}:${i + 1}`);
    }
    EXTERNAL_URL.lastIndex = 0;
    FONT_URL.lastIndex = 0;
    let fontMatch = FONT_URL.exec(lines[i]);
    while (fontMatch) {
      if (fontMatch[1].endsWith(".woff2")) {
        fontSources.add(fontMatch[1]);
      }
      fontMatch = FONT_URL.exec(lines[i]);
    }
    FONT_URL.lastIndex = 0;
  }
}

for (const root of ROOTS) {
  const before = filesScanned;
  try {
    walk(root);
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw err;
    }
    absentRoots.push(root);
    continue;
  }
  perRoot.set(root, filesScanned - before);
}

if (filesScanned < MINIMUM_FILES) {
  console.error(
    `FAIL: ${filesScanned} file(s) scanned, minimum ${MINIMUM_FILES}. This guard ` +
      `examined nothing, and nothing found in nothing is not a pass (PR-27).`,
  );
  if (absentRoots.length > 0) {
    console.error(`  scan root(s) that do not exist: ${absentRoots.join(", ")}`);
  }
  const empty = [...perRoot].filter(([, n]) => n === 0).map(([r]) => r);
  if (empty.length > 0) {
    console.error(`  scan root(s) present but empty : ${empty.join(", ")}`);
  }
  process.exit(1);
}

if (fontSources.size < MINIMUM_FONT_SOURCES) {
  console.error(
    `FAIL: ${fontSources.size} self-hosted font source(s) seen, minimum ${MINIMUM_FONT_SOURCES}. ` +
      `A font check that cannot see where the files load from has not run (PR-21).`,
  );
  process.exit(1);
}

if (violations > 0) {
  console.error(`FAIL: ${violations} runtime-CDN reference(s) found`);
  process.exit(1);
}

const census = [...perRoot].map(([r, n]) => `${r}: ${n}`).join(", ");
console.log(
  `OK: no runtime CDN reference in ${filesScanned} file(s), minimum ${MINIMUM_FILES}; ` +
    `${fontSources.size} self-hosted font source(s), minimum ${MINIMUM_FONT_SOURCES} [${[...fontSources].sort().join(", ")}] [${census}]` +
    (absentRoots.length > 0 ? ` (not yet created: ${absentRoots.join(", ")})` : ""),
);
