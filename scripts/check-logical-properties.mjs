#!/usr/bin/env node
// CF-168. Where a logical property or keyword exists, the physical one is
// not used. Stylesheets and inline styles are parsed into declarations —
// property and value — so a comment or a shared line cannot hide one
// (PR-22).
//
// The mapped set is taken from CSS Logical Properties and Values Module
// Level 1, W3C Working Draft, 4 December 2025:
// https://www.w3.org/TR/2025/WD-css-logical-1-20251204/
//   §2.1 caption-side left/right (top/bottom are redefined there as
//        block-start/block-end, so they are not physical values)
//   §2.2 float and clear left/right, logical keywords inline-start/inline-end
//   §2.3 text-align left/right, logical keywords start/end
//   §3   page-break-before and page-break-after left/right, logical
//        keywords recto/verso
//   §4.1 width, height, min-*, max-* ↔ inline-size / block-size
//   §4.2 margin longhands
//   §4.3 top, right, bottom, left ↔ inset-* 
//   §4.4 padding longhands
//   §4.5 border side, width, style and color longhands, and the four
//        physical corner radii
//   §4.7 margin, padding, border-width, border-style, border-color,
//        scroll-margin, scroll-padding and inset set physical longhands
//        unless the value begins with the logical keyword. The scroll
//        longhands are the physical properties those two shorthands set.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOTS = ["app", "features"];
const OPTIONAL_ROOTS = ["components"];
const STYLE_EXT = new Set([".css"]);
const CODE_EXT = new Set([".ts", ".tsx", ".js", ".jsx"]);

const PHYSICAL_LONGHANDS = [
  "width",
  "height",
  "min-width",
  "min-height",
  "max-width",
  "max-height",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "top",
  "right",
  "bottom",
  "left",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "border-top",
  "border-right",
  "border-bottom",
  "border-left",
  "border-top-width",
  "border-right-width",
  "border-bottom-width",
  "border-left-width",
  "border-top-style",
  "border-right-style",
  "border-bottom-style",
  "border-left-style",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-bottom-right-radius",
  "border-bottom-left-radius",
  "scroll-margin-top",
  "scroll-margin-right",
  "scroll-margin-bottom",
  "scroll-margin-left",
  "scroll-padding-top",
  "scroll-padding-right",
  "scroll-padding-bottom",
  "scroll-padding-left",
];

const PHYSICAL_SHORTHANDS = [
  "margin",
  "padding",
  "border-width",
  "border-style",
  "border-color",
  "scroll-margin",
  "scroll-padding",
  "inset",
];

const PHYSICAL_VALUES = {
  "caption-side": ["left", "right"],
  float: ["left", "right"],
  clear: ["left", "right"],
  "text-align": ["left", "right"],
  "page-break-before": ["left", "right"],
  "page-break-after": ["left", "right"],
};

const MAPPED = [
  ...PHYSICAL_LONGHANDS,
  ...PHYSICAL_SHORTHANDS,
  ...Object.keys(PHYSICAL_VALUES),
];

const LONGHANDS = new Set(PHYSICAL_LONGHANDS);
const SHORTHANDS = new Set(PHYSICAL_SHORTHANDS);

// P03-T09 — components/ now holds a stylesheet per primitive. The floors
// below are the true counts across app/, features/ and components/. Raising
// them is a changed condition on the existing app/globals.css premise: an
// emptied globals.css still falls short of the new declaration floor, and
// PROVEN_PAIRS does not gain a pair. Button's loading width lock writes
// element.style.inlineSize, which this scan does not parse, so that write
// is not part of the declaration count.
const MINIMUM_STYLESHEETS = 12;
const MINIMUM_DECLARATIONS = 657;
const MINIMUM_MAPPED = 60;

let violations = 0;
let stylesheets = 0;
let declarations = 0;
const absentOptional = [];

function fail(message) {
  violations += 1;
  console.error(`FAIL: ${message}`);
}

export function floorViolations({ stylesheets: sheets, declarations: decls, mapped }) {
  const messages = [];
  if (sheets < MINIMUM_STYLESHEETS) {
    messages.push(`${sheets} stylesheet(s) scanned, minimum ${MINIMUM_STYLESHEETS}`);
  }
  if (decls < MINIMUM_DECLARATIONS) {
    messages.push(`${decls} declaration(s) examined, minimum ${MINIMUM_DECLARATIONS}`);
  }
  if (mapped < MINIMUM_MAPPED) {
    messages.push(`${mapped} mapped physical property(ies), minimum ${MINIMUM_MAPPED}`);
  }
  return messages;
}

function blankCssComments(css) {
  let out = "";
  for (let i = 0; i < css.length; i++) {
    if (css[i] === "/" && css[i + 1] === "*") {
      const end = css.indexOf("*/", i + 2);
      const stop = end === -1 ? css.length : end + 2;
      for (let j = i; j < stop; j++) {
        out += css[j] === "\n" ? "\n" : " ";
      }
      i = stop - 1;
      continue;
    }
    out += css[i];
  }
  return out;
}

function lineOf(text, index) {
  let line = 1;
  const stop = Math.min(index, text.length);
  for (let i = 0; i < stop; i++) {
    if (text[i] === "\n") {
      line += 1;
    }
  }
  return line;
}

function matchingDelimiter(text, openIndex, open, close) {
  let depth = 0;
  let quote = null;
  for (let i = openIndex; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === "\\") {
        i += 1;
        continue;
      }
      if (c === quote) {
        quote = null;
      }
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      continue;
    }
    if (c === open) {
      depth += 1;
    } else if (c === close) {
      depth -= 1;
      if (depth === 0) {
        return i;
      }
    }
  }
  return text.length - 1;
}

function pushDecl(segment, out, index, css) {
  const part = segment.trim();
  if (!part || part.startsWith("@") || part.includes("{")) {
    return;
  }
  const colon = part.indexOf(":");
  if (colon <= 0) {
    return;
  }
  const prop = part.slice(0, colon).trim();
  const value = part.slice(colon + 1).trim();
  if (!prop || /[\s{}();]/.test(prop)) {
    return;
  }
  out.push({ prop, value, line: lineOf(css, index) });
}

function collectBody(body, out, full, bodyOffset) {
  let start = 0;
  let quote = null;
  let paren = 0;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (quote) {
      if (c === "\\") {
        i += 1;
        continue;
      }
      if (c === quote) {
        quote = null;
      }
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      continue;
    }
    if (c === "(") {
      paren += 1;
      continue;
    }
    if (c === ")" && paren > 0) {
      paren -= 1;
      continue;
    }
    if (c === "{" && paren === 0) {
      const rel = matchingDelimiter(body, i, "{", "}");
      walkStylesheet(body.slice(start, rel + 1), out, full, bodyOffset + start);
      i = rel;
      start = rel + 1;
      continue;
    }
    if (c === ";" && paren === 0) {
      pushDecl(body.slice(start, i), out, bodyOffset + start, full);
      start = i + 1;
    }
  }
  pushDecl(body.slice(start), out, bodyOffset + start, full);
}

function walkStylesheet(css, out, full, offset) {
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf("{", i);
    if (open < 0) {
      break;
    }
    const close = matchingDelimiter(css, open, "{", "}");
    collectBody(css.slice(open + 1, close), out, full, offset + open + 1);
    i = close + 1;
  }
}

export function stylesheetDeclarations(css) {
  const blanked = blankCssComments(css);
  const out = [];
  walkStylesheet(blanked, out, blanked, 0);
  return out;
}

function cssProp(name) {
  const raw = name.trim().replace(/^["']|["']$/g, "");
  if (raw.startsWith("--")) {
    return raw;
  }
  if (raw.includes("-")) {
    return raw.toLowerCase();
  }
  return raw
    .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
    .replace(/^-/, "")
    .toLowerCase();
}

function keywords(value) {
  return value
    .replace(/!important/gi, " ")
    .split(/[\s,()/]+/)
    .map((part) => part.toLowerCase())
    .filter(Boolean);
}

export function declarationViolations(prop, value) {
  if (prop.startsWith("--")) {
    return [];
  }
  const name = cssProp(prop);
  const messages = [];
  if (LONGHANDS.has(name)) {
    messages.push(`physical property ${name}`);
  }
  if (SHORTHANDS.has(name) && !/^logical\b/i.test(value.trim())) {
    messages.push(`physical shorthand ${name}`);
  }
  const banned = PHYSICAL_VALUES[name];
  if (banned) {
    for (const word of keywords(value)) {
      if (banned.includes(word)) {
        messages.push(`physical value ${word} of ${name}`);
      }
    }
  }
  return messages;
}

function checkDeclarations(decls, file) {
  for (const decl of decls) {
    declarations += 1;
    for (const message of declarationViolations(decl.prop, decl.value)) {
      fail(`${message} at ${file}:${decl.line}`);
    }
  }
}

function inlineDeclarations(source) {
  const out = [];
  const attr = /style\s*=\s*"([^"]*)"|style\s*=\s*'([^']*)'/g;
  let match = attr.exec(source);
  while (match) {
    const body = match[1] ?? match[2] ?? "";
    const at = match.index;
    for (const decl of stylesheetDeclarations(`x{${body}}`)) {
      out.push({ ...decl, line: lineOf(source, at) });
    }
    match = attr.exec(source);
  }
  let cursor = 0;
  while (cursor < source.length) {
    const marker = source.indexOf("style={{", cursor);
    if (marker < 0) {
      break;
    }
    const open = marker + "style=".length + 1;
    const close = matchingDelimiter(source, open, "{", "}");
    const body = source.slice(open + 1, close);
    const parts = splitObject(body);
    for (const part of parts) {
      const colon = part.indexOf(":");
      if (colon <= 0) {
        continue;
      }
      const prop = part.slice(0, colon).trim();
      const value = part.slice(colon + 1).trim();
      if (!prop) {
        continue;
      }
      out.push({ prop, value, line: lineOf(source, marker) });
    }
    cursor = close + 1;
  }
  return out;
}

function splitObject(body) {
  const parts = [];
  let start = 0;
  let quote = null;
  let depth = 0;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (quote) {
      if (c === "\\") {
        i += 1;
        continue;
      }
      if (c === quote) {
        quote = null;
      }
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      quote = c;
      continue;
    }
    if (c === "{" || c === "(" || c === "[") {
      depth += 1;
      continue;
    }
    if ((c === "}" || c === ")" || c === "]") && depth > 0) {
      depth -= 1;
      continue;
    }
    if (c === "," && depth === 0) {
      parts.push(body.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(body.slice(start));
  return parts;
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
  if (STYLE_EXT.has(ext)) {
    stylesheets += 1;
    const text = readFileSync(path, "utf8");
    checkDeclarations(stylesheetDeclarations(text), path);
    return;
  }
  if (CODE_EXT.has(ext)) {
    const text = readFileSync(path, "utf8");
    checkDeclarations(inlineDeclarations(text), path);
  }
}

function scanRoot(root, optional) {
  try {
    walk(root);
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw err;
    }
    if (optional) {
      absentOptional.push(root);
      return;
    }
    fail(`scan root does not exist: ${root}`);
  }
}

function main() {
  if (MAPPED.length < MINIMUM_MAPPED) {
    fail(`${MAPPED.length} mapped physical property(ies), minimum ${MINIMUM_MAPPED}`);
  }

  for (const root of ROOTS) {
    scanRoot(root, false);
  }
  for (const root of OPTIONAL_ROOTS) {
    scanRoot(root, true);
  }

  for (const message of floorViolations({
    stylesheets,
    declarations,
    mapped: MAPPED.length,
  })) {
    fail(message);
  }

  if (violations > 0) {
    process.exit(1);
  }

  const absent = absentOptional.length ? `; optional root absent: ${absentOptional.join(", ")}` : "";
  console.log(
    `OK: declarations parsed against CSS Logical Properties and Values Level 1 (4 December 2025); ${stylesheets} stylesheet(s), minimum ${MINIMUM_STYLESHEETS}; ${declarations} declaration(s), minimum ${MINIMUM_DECLARATIONS}; ${MAPPED.length} mapped physical property(ies), minimum ${MINIMUM_MAPPED}${absent}`,
  );
}

if (process.env.B2S_CHECK_IMPORT !== "1") {
  main();
}
