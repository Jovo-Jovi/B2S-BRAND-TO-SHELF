#!/usr/bin/env node
// ARCHITECTURE.md §6 — "No brand, business or locale literal outside
// configuration, translation resources or tokens". Scans application source
// under app/ (excluding the message catalogs and the token stylesheet, which
// are the named exemptions) for a hex colour, an Arabic character, a bare
// URL or a phone-shaped digit run. Each pattern asserts the SHAPE the
// forbidden value takes (PR-22), not a word this file is not allowed to say.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname, sep } from "node:path";

const ROOTS = ["app", "proxy.ts"];
const SCANNED_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);
const EXEMPT_PATH_SEGMENT = `${sep}dictionaries${sep}`;

const CHECKS = [
  { name: "hex colour", pattern: /#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3}(?:[0-9a-fA-F]{2})?)?\b/ },
  { name: "Arabic literal", pattern: /[\u0600-\u06FF]/ },
  { name: "URL literal", pattern: /https?:\/\/[^\s"'`]+/ },
  { name: "phone-shaped literal", pattern: /\+\d{1,3}[\s-]?\(?\d{2,4}\)?(?:[\s-]?\d{2,4}){2,}/ },
  {
    name: "currency-code-beside-amount literal",
    pattern: /\b(?:USD|EUR|GBP|SAR|AED|EGP|JOD|KWD|QAR|BHD|OMR)\b\s?\d|\d\s?\b(?:USD|EUR|GBP|SAR|AED|EGP|JOD|KWD|QAR|BHD|OMR)\b/,
  },
];

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
  if (!SCANNED_EXTENSIONS.has(extname(path))) {
    return;
  }
  if (path.includes(EXEMPT_PATH_SEGMENT)) {
    return; // translation resources — the named exemption
  }
  filesScanned += 1;
  const lines = readFileSync(path, "utf8").split("\n");
  lines.forEach((line, index) => {
    for (const { name, pattern } of CHECKS) {
      if (pattern.test(line)) {
        violations += 1;
        console.error(`FAIL: ${name} at ${path}:${index + 1}`);
      }
    }
  });
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
  console.error(`FAIL: ${violations} hardcoded literal(s) found outside configuration, translation resources or tokens`);
  process.exit(1);
}

console.log(`OK: no hardcoded literal in ${filesScanned} file(s) scanned`);
