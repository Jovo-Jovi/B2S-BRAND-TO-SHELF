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

// PR-27 — the quarantine floor above was only half of it. This guard also
// needs somewhere to look: with every scan root gone it reported
// "OK: 0 file(s) scanned under []" at exit 0, which is the same defect as a
// missing quarantine wearing a cleaner message. `features/` and `components/`
// are legitimately absent until the phase that creates them (CF-94), so the
// floor is on the total examined, not on each root existing.
const MINIMUM_FILES = 1;

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

const perRoot = new Map();

for (const root of SCAN_ROOTS) {
  const before = filesScanned;
  try {
    walk(root);
    rootsPresent.push(root);
    perRoot.set(root, filesScanned - before);
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw err;
    }
    rootsAbsent.push(root);
  }
}

if (filesScanned < MINIMUM_FILES) {
  console.error(
    `FAIL: ${filesScanned} file(s) scanned across [${SCAN_ROOTS.join(", ")}], ` +
      `minimum ${MINIMUM_FILES}. The quarantine exists and nothing was examined ` +
      `against it, which is not a pass (PR-27).`,
  );
  if (rootsAbsent.length > 0) {
    console.error(`  scan root(s) that do not exist: ${rootsAbsent.join(", ")}`);
  }
  const empty = [...perRoot].filter(([, n]) => n === 0).map(([r]) => r);
  if (empty.length > 0) {
    console.error(`  scan root(s) present but empty : ${empty.join(", ")}`);
  }
  process.exit(1);
}

if (violations > 0) {
  console.error(
    `FAIL: ${violations} import(s) of ${QUARANTINE_DIR} from outside the quarantine`,
  );
  process.exit(1);
}

console.log(
  `OK: ${filesScanned} file(s) scanned under [${rootsPresent.join(", ")}], ` +
    `minimum ${MINIMUM_FILES}` +
    (rootsAbsent.length > 0
      ? ` (not yet created: ${rootsAbsent.join(", ")})`
      : "") +
    `; no import of ${QUARANTINE_DIR}`,
);
