#!/usr/bin/env node
// ARCHITECTURE.md §6 — "No runtime CDN". Fonts and libraries are bundled;
// nothing in the application source may load a script or stylesheet from an
// external origin at request time. Scans app/, lib/ and the root proxy for a
// JSX <script> or <link> element whose src/href resolves to an external URL.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOTS = ["app", "proxy.ts", "lib"];
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);

// PR-27 — a check states the minimum it expected to examine and fails when it
// examined less. Without this floor the guard reports "OK ... 0 file(s)" and
// exits 0 the day a scan root is renamed or moved, which is a guard that has
// stopped guarding while still reporting success. CF-94 — the floor is the
// true count across all three roots as of the commit that adds `lib/`, not
// the placeholder 1 that let `lib/` ship unscanned in the first place.
const MINIMUM_FILES = 7;

const EXTERNAL_TAG = /<(script|link)\b[^>]*\b(?:src|href)\s*=\s*["'`]((?:https?:)?\/\/[^"'`]+)["'`]/gi;

let violations = 0;
let filesScanned = 0;
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

if (violations > 0) {
  console.error(`FAIL: ${violations} runtime-CDN reference(s) found`);
  process.exit(1);
}

const census = [...perRoot].map(([r, n]) => `${r}: ${n}`).join(", ");
console.log(
  `OK: no runtime CDN reference in ${filesScanned} file(s), minimum ${MINIMUM_FILES} [${census}]` +
    (absentRoots.length > 0 ? ` (not yet created: ${absentRoots.join(", ")})` : ""),
);
