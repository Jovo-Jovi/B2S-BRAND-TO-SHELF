#!/usr/bin/env node
// CF-175. Intl.DateTimeFormat, Intl.NumberFormat, Intl.RelativeTimeFormat,
// toLocaleString, toLocaleDateString, toLocaleTimeString and toFixed may be
// called only inside lib/locale/ and, when it lands, lib/money/. Detection
// is the TypeScript compiler (PR-22), not a substring. The gate covers dates
// now and extends to money and quantities when lib/money/ lands. A removed
// or emptied scan root is one FAIL line, never a stack (PR-27).

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const REPO = dirname(dirname(fileURLToPath(import.meta.url)));
const ROOTS = ["app", "components", "features", "lib"];
const ALLOWED = ["lib/locale/", "lib/money/"];
const INTL_APIS = new Set(["DateTimeFormat", "NumberFormat", "RelativeTimeFormat"]);
const METHOD_APIS = new Set(["toLocaleString", "toLocaleDateString", "toLocaleTimeString", "toFixed"]);
const MINIMUM_FILES = 57;

function fail(message) {
  console.error(`FAIL: ${message}`);
}

function walk(dir, out) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch (err) {
    if (err && err.code === "ENOENT") return;
    throw err;
  }
  for (const name of entries) {
    const path = join(dir, name);
    let stat;
    try {
      stat = statSync(path);
    } catch (err) {
      if (err && err.code === "ENOENT") continue;
      throw err;
    }
    if (stat.isDirectory()) {
      if (name === "node_modules") continue;
      walk(path, out);
    } else if (name.endsWith(".ts") || name.endsWith(".tsx")) {
      out.push(path);
    }
  }
}

function isAllowed(rel) {
  const normalized = rel.split(sep).join("/");
  return ALLOWED.some((prefix) => normalized.startsWith(prefix));
}

function callsIn(source, fileName) {
  const kind = fileName.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, kind);
  const found = [];
  function visit(node) {
    if (ts.isNewExpression(node) || ts.isCallExpression(node)) {
      const expr = node.expression;
      if (ts.isPropertyAccessExpression(expr)) {
        const name = expr.name.text;
        if (INTL_APIS.has(name) && expr.expression.getText(sourceFile) === "Intl") {
          found.push(`Intl.${name}`);
        } else if (METHOD_APIS.has(name)) {
          found.push(name);
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return found;
}

function main() {
  const missing = ROOTS.filter((root) => !existsSync(join(REPO, root)));
  if (missing.length > 0) {
    fail(
      `scan root missing: ${missing.join(", ")}. An emptied or removed root is not a pass (PR-27)`,
    );
    process.exit(1);
  }
  const files = [];
  for (const root of ROOTS) walk(join(REPO, root), files);
  if (files.length < MINIMUM_FILES) {
    fail(
      `${files.length} file(s) scanned, minimum ${MINIMUM_FILES}. An emptied scan is not a pass (PR-27)`,
    );
    process.exit(1);
  }
  const violations = [];
  for (const file of files) {
    const rel = relative(REPO, file);
    if (isAllowed(rel)) continue;
    let source;
    try {
      source = readFileSync(file, "utf8");
    } catch (err) {
      if (err && err.code === "ENOENT") continue;
      throw err;
    }
    for (const hit of callsIn(source, file)) {
      violations.push(`${rel.split(sep).join("/")}: ${hit}`);
    }
  }
  if (violations.length > 0) {
    fail(`locale formatting API outside lib/locale/ and lib/money/: ${violations.join("; ")}`);
    process.exit(1);
  }
  console.log(
    `OK: locale formatting APIs confined to lib/locale/ and lib/money/, ${files.length} file(s) scanned, minimum ${MINIMUM_FILES}. Dates are covered now; money and quantities are covered when lib/money/ lands`,
  );
}

try {
  main();
} catch (err) {
  fail(err instanceof Error ? err.message : String(err));
  process.exit(1);
}
