#!/usr/bin/env node
// ARCHITECTURE.md §6 and MODULE_SPEC.md §2 — "Persistence is reached through one
// declared boundary, never touched directly from feature code" (OD-G11).
//
// Asserted positively, per PR-22: rather than forbidding a list of constructor
// names, this guard asserts the LOCATION every Supabase client construction must
// have. A client cannot be constructed without importing the library, so
// requiring that every importing file live under lib/supabase/ catches
// createClient, createBrowserClient, createServerClient and any constructor
// invented later, and cannot be defeated by rewording or by aliasing an import.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname, sep } from "node:path";

const BOUNDARY_DIR = join("lib", "supabase");
const SCAN_ROOTS = ["app", "features", "components", "lib", "__tests__", "proxy.ts"];
const SCANNED_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mts", ".mjs"]);

// PR-27 — a check states the minimum it expected to examine and fails when it
// examined less. This guard had no floor at all: a scan root rename or an
// emptied lib/supabase/ would report "OK ... 0 file(s)" and exit 0, the same
// shape of gap CF-94 already named and fixed on check-no-runtime-cdn and
// check-no-hardcoded-literals. Floors below are the true counts as of this
// commit (P02-T11, CF-148): 10 files under [app, lib, __tests__, proxy.ts]
// (features/ and components/ do not exist yet) and 3 Supabase import sites,
// all inside lib/supabase/. P02-T14 creates features/ and lib/supabase/session.ts:
// 20 files and 4 import sites. Raise both the day either count grows; never
// lower either to make a shrinking result pass. Changed condition, not a new
// premise: PROVEN_PAIRS does not gain a pair for this guard.
const MINIMUM_FILES_SCANNED = 20;
const MINIMUM_IMPORT_SITES = 4;

// An import of any Supabase client package, in either module syntax.
const SUPABASE_LIBRARY_IMPORT =
  /(?:\bfrom\s*|\bimport\s*|\brequire\(\s*)["'`]@supabase\/[^"'`]+["'`]/;

let violations = 0;
let filesScanned = 0;
let importSites = 0;
const rootsPresent = [];
const rootsAbsent = [];

function isInsideBoundary(path) {
  const normalised = path.split("/").join(sep);
  return normalised === BOUNDARY_DIR || normalised.startsWith(BOUNDARY_DIR + sep);
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
  filesScanned += 1;
  const lines = readFileSync(path, "utf8").split("\n");
  lines.forEach((line, index) => {
    if (!SUPABASE_LIBRARY_IMPORT.test(line)) {
      return;
    }
    importSites += 1;
    if (!isInsideBoundary(path)) {
      violations += 1;
      console.error(
        `FAIL: Supabase client constructed outside ${BOUNDARY_DIR} at ${path}:${index + 1}`,
      );
    }
  });
}

let boundaryExists = false;
try {
  boundaryExists = statSync(BOUNDARY_DIR).isDirectory();
} catch {
  boundaryExists = false;
}

if (!boundaryExists) {
  console.error(
    `FAIL: ${BOUNDARY_DIR} does not exist — the declared persistence boundary is what this guard asserts`,
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

if (filesScanned < MINIMUM_FILES_SCANNED) {
  console.error(
    `FAIL: ${filesScanned} file(s) scanned, minimum ${MINIMUM_FILES_SCANNED}. ` +
      `This guard examined less than its own floor (PR-27), rather than the ` +
      `true count under [${rootsPresent.join(", ")}]${
        rootsAbsent.length > 0 ? ` (not yet created: ${rootsAbsent.join(", ")})` : ""
      }.`,
  );
  process.exit(1);
}

if (violations > 0) {
  console.error(
    `FAIL: ${violations} Supabase client construction(s) outside ${BOUNDARY_DIR}`,
  );
  process.exit(1);
}

// An import count below the floor would mean the boundary itself had stopped
// constructing as much as it used to, which is a broken guard rather than a
// clean result — CF-148, mirroring CF-94's floor on the sibling guards.
if (importSites < MINIMUM_IMPORT_SITES) {
  console.error(
    `FAIL: ${importSites} Supabase library import site(s) found, minimum ${MINIMUM_IMPORT_SITES} — ${BOUNDARY_DIR} is expected to hold at least that many`,
  );
  process.exit(1);
}

console.log(
  `OK: ${filesScanned} file(s) scanned under [${rootsPresent.join(", ")}]` +
    (rootsAbsent.length > 0
      ? ` (not yet created: ${rootsAbsent.join(", ")})`
      : "") +
    ` (minimum ${MINIMUM_FILES_SCANNED}); all ${importSites} Supabase import site(s) inside ${BOUNDARY_DIR} (minimum ${MINIMUM_IMPORT_SITES})`,
);
