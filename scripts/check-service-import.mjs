#!/usr/bin/env node
// ADR-005 — the privileged (service_role) client is constructed in exactly
// one server-only module, at the path ARCHITECTURE.md §4 names: `server-only/`.
// That module has no target yet (P01 lands no Supabase project and no
// privileged client) — this guard has nothing to find today, and passes
// vacuously so the rule can never be argued away later for lack of a
// mechanism. The moment `server-only/` gains a file, every import of it from
// outside that directory fails the build.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname, sep, relative } from "node:path";

const PRIVILEGED_DIR = "server-only";
const SCAN_ROOTS = ["app", "proxy.ts"];
const SCANNED_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);

// Matches an import/require specifier that resolves into the privileged
// directory: an alias (`@/server-only/...`) or a relative path ending in a
// `server-only/` segment. The bare npm package name `server-only` (no
// trailing slash) is a different thing and is deliberately not matched.
const PRIVILEGED_IMPORT = /from\s+["'`](?:@\/)?(?:\.{1,2}\/)*server-only\/[^"'`]*["'`]|require\(\s*["'`](?:@\/)?(?:\.{1,2}\/)*server-only\/[^"'`]*["'`]\s*\)/;

let violations = 0;
let filesScanned = 0;

function isInsidePrivilegedDir(path) {
  return relative(".", path).split(sep)[0] === PRIVILEGED_DIR;
}

function walk(path) {
  const stats = statSync(path);
  if (stats.isDirectory()) {
    for (const entry of readdirSync(path)) {
      walk(join(path, entry));
    }
    return;
  }
  if (!SCANNED_EXTENSIONS.has(extname(path))) {
    return;
  }
  if (isInsidePrivilegedDir(path)) {
    return; // the quarantine may import within itself
  }
  filesScanned += 1;
  const lines = readFileSync(path, "utf8").split("\n");
  lines.forEach((line, index) => {
    if (PRIVILEGED_IMPORT.test(line)) {
      violations += 1;
      console.error(`FAIL: import of server-only/ from outside the quarantine at ${path}:${index + 1}`);
    }
  });
}

let targetExists = false;
try {
  targetExists = statSync(PRIVILEGED_DIR).isDirectory();
} catch {
  targetExists = false;
}

for (const root of SCAN_ROOTS) {
  try {
    walk(root);
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw err;
    }
  }
}

if (violations > 0) {
  console.error(`FAIL: ${violations} import(s) of the privileged client from outside server-only/`);
  process.exit(1);
}

console.log(
  targetExists
    ? `OK: server-only/ exists; scanned ${filesScanned} file(s), no outside import`
    : `OK: server-only/ has no target yet (vacuous pass); scanned ${filesScanned} file(s), no outside import`,
);
