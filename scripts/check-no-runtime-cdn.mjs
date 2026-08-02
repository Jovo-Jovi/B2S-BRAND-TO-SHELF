#!/usr/bin/env node
// ARCHITECTURE.md §6 — "No runtime CDN". Fonts and libraries are bundled;
// nothing in the application source may load a script or stylesheet from an
// external origin at request time. Scans app/ and the root proxy for a JSX
// <script> or <link> element whose src/href resolves to an external URL.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOTS = ["app", "proxy.ts"];
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);

const EXTERNAL_TAG = /<(script|link)\b[^>]*\b(?:src|href)\s*=\s*["'`]((?:https?:)?\/\/[^"'`]+)["'`]/gi;

let violations = 0;
let filesScanned = 0;

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
  try {
    walk(root);
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw err;
    }
  }
}

if (violations > 0) {
  console.error(`FAIL: ${violations} runtime-CDN reference(s) found`);
  process.exit(1);
}

console.log(`OK: no runtime CDN reference in ${filesScanned} file(s)`);
