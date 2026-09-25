#!/usr/bin/env node
// CF-168. Where a logical start/end property exists, the physical left/right
// property is not used. Scans stylesheets and inline styles only — the
// structural location — so documentation of the rule cannot trip it (PR-22).

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOTS = ["app", "features"];
const STYLE_EXT = new Set([".css"]);
const CODE_EXT = new Set([".ts", ".tsx", ".js", ".jsx"]);

const MINIMUM_STYLESHEETS = 1;
const MINIMUM_DECLARATIONS = 250;

let violations = 0;
let stylesheets = 0;
let declarations = 0;

function fail(message) {
  violations += 1;
  console.error(`FAIL: ${message}`);
}

function walk(path) {
  const stats = statSync(path);
  if (stats.isDirectory()) {
    for (const entry of readdirSync(path)) {
      walk(join(path, entry));
    }
    return;
  }
  const ext = extname(path);
  const text = readFileSync(path, "utf8");
  if (STYLE_EXT.has(ext)) {
    stylesheets += 1;
    const lines = text.split("\n");
    lines.forEach((line, index) => {
      if (line.includes(":") && !line.trim().startsWith("/*") && !line.trim().startsWith("*")) {
        declarations += 1;
      }
      if (/margin-left|margin-right|padding-left|padding-right|border-left|border-right|scroll-margin-left|scroll-margin-right|scroll-padding-left|scroll-padding-right|inset-inline/.test(line) && /(?:margin|padding|border|scroll-margin|scroll-padding)-(?:left|right)\b/.test(line)) {
        fail(`physical inline-axis property at ${path}:${index + 1}`);
      }
      if (/^\s*(left|right)\s*:/.test(line)) {
        fail(`physical left/right property at ${path}:${index + 1}`);
      }
      if (/\b(text-align|float|clear)\s*:\s*(left|right)\b/.test(line)) {
        fail(`physical left/right value at ${path}:${index + 1}`);
      }
    });
    return;
  }
  if (CODE_EXT.has(ext)) {
    const lines = text.split("\n");
    lines.forEach((line, index) => {
      if (line.includes("style=") && /marginLeft|marginRight|paddingLeft|paddingRight|borderLeft|borderRight|scrollMarginLeft|scrollMarginRight|paddingInline|left:|right:/.test(line)) {
        if (/marginLeft|marginRight|paddingLeft|paddingRight|borderLeft|borderRight|scrollMarginLeft|scrollMarginRight|\bleft\s*:|\bright\s*:/.test(line)) {
          fail(`physical inline style at ${path}:${index + 1}`);
        }
      }
    });
  }
}

for (const root of ROOTS) {
  try {
    walk(root);
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw err;
    }
    fail(`scan root does not exist: ${root}`);
  }
}

if (stylesheets < MINIMUM_STYLESHEETS) {
  fail(`${stylesheets} stylesheet(s) scanned, minimum ${MINIMUM_STYLESHEETS}`);
}
if (declarations < MINIMUM_DECLARATIONS) {
  fail(`${declarations} declaration(s) scanned, minimum ${MINIMUM_DECLARATIONS}`);
}

if (violations > 0) {
  process.exit(1);
}

console.log(`OK: no physical left/right where a logical property exists; ${stylesheets} stylesheet(s), minimum ${MINIMUM_STYLESHEETS}; ${declarations} declaration(s), minimum ${MINIMUM_DECLARATIONS}`);
