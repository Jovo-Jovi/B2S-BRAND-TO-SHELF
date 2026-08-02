#!/usr/bin/env node
// ADR-005 — the privileged (service_role) client is constructed in exactly one
// server-only module, and application, feature and component code may not reach
// it. This guard fails on any import resolving into lib/supabase/server-only/
// from app/, features/ or components/.
//
// It replaces the vacuous version landed at P01-T01, whose target did not exist
// yet. The target exists now, so a missing quarantine is a failure rather than a
// pass: a guard whose premise has disappeared must say so, not report OK
// (PR-21).

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const QUARANTINE_DIR = join("lib", "supabase", "server-only");
const SCAN_ROOTS = ["app", "features", "components"];
const SCANNED_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);

// Any specifier that resolves into the quarantine, whether written through the
// `@/` alias, from the repository root, or by relative climb. The npm package
// `server-only` — nothing after it — is a different thing, is what the
// quarantined module itself imports, and is deliberately not matched.
const QUARANTINED_SPECIFIER =
  /(?:\bfrom\s*|\bimport\s*|\brequire\(\s*)["'`][^"'`]*\bserver-only\/[^"'`]*["'`]/;

let violations = 0;
let filesScanned = 0;
const rootsPresent = [];
const rootsAbsent = [];

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
  filesScanned += 1;
  const lines = readFileSync(path, "utf8").split("\n");
  lines.forEach((line, index) => {
    if (QUARANTINED_SPECIFIER.test(line)) {
      violations += 1;
      console.error(
        `FAIL: import of the privileged client quarantine at ${path}:${index + 1}`,
      );
    }
  });
}

let quarantineExists = false;
try {
  quarantineExists = statSync(QUARANTINE_DIR).isDirectory();
} catch {
  quarantineExists = false;
}

if (!quarantineExists) {
  console.error(
    `FAIL: ${QUARANTINE_DIR} does not exist — ADR-005's quarantine is the thing this guard protects`,
  );
  process.exit(1);
}

for (const root of SCAN_ROOTS) {
  try {
    walk(root);
    rootsPresent.push(root);
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw err;
    }
    rootsAbsent.push(root);
  }
}

if (violations > 0) {
  console.error(
    `FAIL: ${violations} import(s) of ${QUARANTINE_DIR} from outside the quarantine`,
  );
  process.exit(1);
}

console.log(
  `OK: ${filesScanned} file(s) scanned under [${rootsPresent.join(", ")}]` +
    (rootsAbsent.length > 0
      ? ` (not yet created: ${rootsAbsent.join(", ")})`
      : "") +
    `; no import of ${QUARANTINE_DIR}`,
);
