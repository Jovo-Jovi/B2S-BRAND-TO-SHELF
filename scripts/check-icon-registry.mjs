#!/usr/bin/env node
// DESIGN_SURFACE.md §2.10. Every glyphRegistry entry declares `mirrors`
// as a boolean literal. No glyph whose name appears on the never-mirror
// sentence carries mirrors: true. A missing registry or a missing sentence
// is one FAIL line, never a stack (PR-27).

import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const REPO = dirname(dirname(fileURLToPath(import.meta.url)));
const GLYPHS = join(REPO, "components", "ui", "glyphs.tsx");
const SPEC = join(REPO, "docs", "product", "DESIGN_SURFACE.md");
const MINIMUM_ENTRIES = 6;
const MINIMUM_NEVER = 23;

function fail(message) {
  console.error(`FAIL: ${message}`);
}

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function neverMirrorNames(text) {
  const match = text.match(/Never mirror:\s*([^.]+)\./);
  if (!match) return null;
  const sentence = match[1].replace(/\([^)]*\)/g, " ");
  const pieces = sentence.split(/\band\b|\bor\b|,/).map((piece) => piece.replace(/^\s*every\s+/i, "").trim());
  const names = new Set();
  for (const piece of pieces) {
    if (!piece) continue;
    const phrase = normalize(piece);
    if (phrase) names.add(phrase);
    for (const word of piece.split(/\s+/)) {
      const token = normalize(word);
      if (token) names.add(token);
    }
  }
  return names;
}

function unwrap(node) {
  let current = node;
  while (
    current &&
    (ts.isAsExpression(current) ||
      ts.isSatisfiesExpression(current) ||
      ts.isParenthesizedExpression(current))
  ) {
    current = current.expression;
  }
  return current;
}

function registryObject(source) {
  const sourceFile = ts.createSourceFile("glyphs.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let found = null;
  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === "glyphRegistry" &&
      node.initializer
    ) {
      const initializer = unwrap(node.initializer);
      if (ts.isObjectLiteralExpression(initializer)) found = initializer;
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return { sourceFile, found };
}

function propertyName(node, sourceFile) {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node)) return node.text;
  return node.getText(sourceFile);
}

function main() {
  if (!existsSync(GLYPHS)) {
    fail("components/ui/glyphs.tsx does not exist. The icon registry has nothing to read (PR-27)");
    process.exit(1);
  }
  if (!existsSync(SPEC)) {
    fail("docs/product/DESIGN_SURFACE.md does not exist. The never-mirror list has nothing to read (PR-27)");
    process.exit(1);
  }
  let glyphs;
  let spec;
  try {
    glyphs = readFileSync(GLYPHS, "utf8");
    spec = readFileSync(SPEC, "utf8");
  } catch (err) {
    if (err && err.code === "ENOENT") {
      fail("the icon registry or DESIGN_SURFACE.md disappeared while being read (PR-27)");
      process.exit(1);
    }
    throw err;
  }
  const never = neverMirrorNames(spec);
  if (!never || never.size < MINIMUM_NEVER) {
    fail(
      `${never ? never.size : 0} never-mirror name(s) read from DESIGN_SURFACE.md §2.10, minimum ${MINIMUM_NEVER}. An emptied list is not a pass (PR-27)`,
    );
    process.exit(1);
  }
  const { sourceFile, found } = registryObject(glyphs);
  if (!found) {
    fail("glyphRegistry is missing from components/ui/glyphs.tsx. An emptied registry is not a pass (PR-27)");
    process.exit(1);
  }
  const failures = [];
  let entries = 0;
  for (const property of found.properties) {
    if (!ts.isPropertyAssignment(property)) {
      failures.push("a glyphRegistry member is not a property assignment");
      continue;
    }
    const name = propertyName(property.name, sourceFile);
    const initializer = unwrap(property.initializer);
    if (!ts.isObjectLiteralExpression(initializer)) {
      failures.push(`${name} is not an object entry`);
      continue;
    }
    entries += 1;
    const mirrors = initializer.properties.find(
      (item) => ts.isPropertyAssignment(item) && propertyName(item.name, sourceFile) === "mirrors",
    );
    if (!mirrors || !ts.isPropertyAssignment(mirrors)) {
      failures.push(`${name} does not declare mirrors`);
      continue;
    }
    const value = mirrors.initializer;
    const flag = value.kind === ts.SyntaxKind.TrueKeyword ? true : value.kind === ts.SyntaxKind.FalseKeyword ? false : null;
    if (flag === null) {
      failures.push(`${name} mirrors is not an explicit boolean literal`);
      continue;
    }
    if (flag && never.has(normalize(name))) {
      failures.push(`${name} is on the never-mirror list and carries mirrors: true`);
    }
  }
  if (entries < MINIMUM_ENTRIES) {
    failures.push(`${entries} registry entry(ies), minimum ${MINIMUM_ENTRIES}. An emptied registry is not a pass (PR-27)`);
  }
  for (const message of failures) fail(message);
  if (failures.length > 0) process.exit(1);
  console.log(
    `OK: ${entries} glyph(s) declare mirrors, minimum ${MINIMUM_ENTRIES}; ${never.size} never-mirror name(s), minimum ${MINIMUM_NEVER}`,
  );
}

try {
  main();
} catch (err) {
  fail(err instanceof Error ? err.message : String(err));
  process.exit(1);
}
