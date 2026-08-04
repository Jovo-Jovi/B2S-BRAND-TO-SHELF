#!/usr/bin/env node
// ARCHITECTURE.md §6 — "Every enumeration stores a language-neutral key"
// (OD-D6, OD-D7, CF-65). Display text lives in translation resources; a stored
// enumeration value is a key and never a label. CF-73 is what the defect costs:
// a corrupted Arabic string reached a printed report because the display string
// was the stored value.
//
// Asserted positively, per PR-22. This does not scan for forbidden words or
// scripts, which would false-positive on its own documentation and could be
// defeated by rewording. It states the SHAPE every enumeration value must have
// — lowercase ASCII letters, digits and underscores, starting with a letter —
// at the one structural location where an enumeration value is created.
// Anything not of that shape fails, in whatever language it is written.
//
// supabase/schema.sql is the only source read: ADR-006 makes it authoritative
// and check_migration_split.py asserts the migrations are equivalent to it, so
// reading both would assert the same fact twice.

import { readFileSync } from "node:fs";

const SCHEMA = "supabase/schema.sql";

// A language-neutral key. Not a locale, not a label, not a sentence.
const KEY = /^[a-z][a-z0-9_]*$/;

let violations = 0;

function fail(message) {
  violations += 1;
  console.error(`FAIL: ${message}`);
}

// Blank out `--` line comments without changing any offset, so a bracket or
// apostrophe in a comment cannot be read as SQL and every reported line number
// still points at the real line. Quoted text is left alone.
function blankComments(text) {
  const out = text.split("");
  let inString = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (inString) {
      if (c !== "'") {
        continue;
      }
      if (text[i + 1] === "'") {
        i += 1;
      } else {
        inString = false;
      }
      continue;
    }
    if (c === "'") {
      inString = true;
      continue;
    }
    if (c === "-" && text[i + 1] === "-") {
      while (i < text.length && text[i] !== "\n") {
        out[i] = " ";
        i += 1;
      }
    }
  }
  return out.join("");
}

// Read the parenthesised value list starting at its opening paren, honouring
// quotes so that a `)` inside a value cannot end the list early.
function readValueList(text, openParen) {
  let depth = 0;
  let inString = false;
  for (let i = openParen; i < text.length; i += 1) {
    const c = text[i];
    if (inString) {
      if (c !== "'") {
        continue;
      }
      if (text[i + 1] === "'") {
        i += 1;
      } else {
        inString = false;
      }
      continue;
    }
    if (c === "'") {
      inString = true;
    } else if (c === "(") {
      depth += 1;
    } else if (c === ")") {
      depth -= 1;
      if (depth === 0) {
        return text.substring(openParen + 1, i);
      }
    }
  }
  return null;
}

function lineOf(text, offset) {
  return text.substring(0, offset).split("\n").length;
}

function checkValue(typeName, raw, offset, text) {
  const value = raw.replace(/''/g, "'");
  let reason = null;

  if ([...value].some((ch) => ch.codePointAt(0) > 127)) {
    reason = "contains a non-ASCII character — that is display text, not a key";
  } else if (/\s/.test(value)) {
    reason = "contains whitespace — that is display text, not a key";
  } else if (!KEY.test(value)) {
    reason =
      "is not lowercase ASCII letters, digits and underscores starting with a letter";
  }

  if (reason !== null) {
    fail(`enum ${typeName} value '${value}' ${reason} (${SCHEMA}:${lineOf(text, offset)})`);
  }
}

let source;
try {
  source = readFileSync(SCHEMA, "utf8");
} catch (err) {
  if (err.code === "ENOENT") {
    console.error(
      `FAIL: ${SCHEMA} does not exist — the authoritative schema is what this guard reads (ADR-006)`,
    );
    process.exit(1);
  }
  throw err;
}

const scannable = blankComments(source);

// Both statements that bring an enumeration value into existence. Covering
// `create type` alone would leave the rule defeatable by adding the value in a
// later migration instead, which is the hole PR-22 exists to close.
const DECLARATION = /\bcreate\s+type\s+([\w."]+)\s+as\s+enum\s*(?=\()/gi;
const ADDITION =
  /\balter\s+type\s+([\w."]+)\s+add\s+value\s+(?:if\s+not\s+exists\s+)?'((?:[^']|'')*)'/gi;
const VALUE = /'((?:[^']|'')*)'/g;

const typesSeen = new Set();
let valuesChecked = 0;

for (const declaration of scannable.matchAll(DECLARATION)) {
  const typeName = declaration[1];
  const listStart = declaration.index + declaration[0].length;
  const body = readValueList(scannable, listStart);
  if (body === null) {
    fail(
      `enum ${typeName} has an unterminated value list (${SCHEMA}:${lineOf(source, declaration.index)})`,
    );
    continue;
  }
  typesSeen.add(typeName);
  for (const value of body.matchAll(VALUE)) {
    valuesChecked += 1;
    checkValue(typeName, value[1], listStart + 1 + value.index, source);
  }
}

for (const addition of scannable.matchAll(ADDITION)) {
  typesSeen.add(addition[1]);
  valuesChecked += 1;
  checkValue(addition[1], addition[2], addition.index, source);
}

// A guard that checked nothing says so. Zero enumerations means either the
// schema stopped declaring them or this guard stopped finding them, and neither
// is a clean result (PR-21).
if (valuesChecked === 0) {
  console.error(
    `FAIL: no enumeration value found in ${SCHEMA} — this guard has nothing to check, which is not a pass`,
  );
  process.exit(1);
}

if (violations > 0) {
  console.error(`FAIL: ${violations} enumeration value(s) are not language-neutral keys`);
  process.exit(1);
}

console.log(
  `OK: ${valuesChecked} value(s) across ${typesSeen.size} enumeration(s) in ${SCHEMA} ` +
    `are language-neutral keys [${[...typesSeen].join(", ")}]`,
);
