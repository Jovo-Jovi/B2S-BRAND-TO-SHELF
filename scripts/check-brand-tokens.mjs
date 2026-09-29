#!/usr/bin/env node
// CF-171. Brand tokens are a structural boundary, not a banned word.
// --brand-* is referenced only in BrandFrame's stylesheet. Within that
// stylesheet, --brand-* appears only on canvas and content selectors, and
// --b2s-* appears only on mount and surround selectors. --brand-* is defined
// only by BrandFrame, and only from an expression: a literal colour is not
// a definition. A stored swatch colour is data and is not a brand token.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const REPO = dirname(dirname(fileURLToPath(import.meta.url)));
const SCAN_ROOTS = ["app", "components", "features"];
const STYLESHEET = "components/ui/brand-frame/brand-frame.module.css";
const SOURCE = "components/ui/brand-frame/brand-frame.tsx";
// P03-T12 — measured after the data family: 85. P03-T13 adds the gallery: 89.
const MINIMUM_FILES = 89;
const MINIMUM_DEFINITIONS = 11;
const MINIMUM_BRAND_REFERENCES = 4;
const MINIMUM_PLATFORM_REFERENCES = 5;

let violations = 0;

function fail(message) {
  violations += 1;
  console.error(`FAIL: ${message}`);
}

function rel(path) {
  return path.slice(REPO.length + 1).split("\\").join("/");
}

function walk(dir, extensions, found) {
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
      if (name === "node_modules" || name === ".next") continue;
      walk(path, extensions, found);
    } else if (extensions.some((extension) => name.endsWith(extension))) {
      found.push(path);
    }
  }
}

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function splitTop(css) {
  const blocks = [];
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf("{", i);
    if (open === -1) break;
    const prelude = css.slice(i, open).trim();
    let depth = 1;
    let j = open + 1;
    while (j < css.length && depth > 0) {
      if (css[j] === "{") depth += 1;
      else if (css[j] === "}") depth -= 1;
      j += 1;
    }
    blocks.push({ prelude, body: css.slice(open + 1, j - 1) });
    i = j;
  }
  return blocks;
}

function declarations(body) {
  let out = "";
  let depth = 0;
  for (const char of body) {
    if (char === "{") depth += 1;
    else if (char === "}") depth = Math.max(0, depth - 1);
    else if (depth === 0) out += char;
  }
  return out
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const colon = part.indexOf(":");
      if (colon === -1) return null;
      return { prop: part.slice(0, colon).trim(), value: part.slice(colon + 1).trim() };
    })
    .filter(Boolean);
}

function selectorRole(selector) {
  const brand = /\.(?:canvas|content)\b/.test(selector);
  const platform = /\.(?:mount|surround)\b/.test(selector);
  if (brand && platform) return "mixed";
  if (brand) return "brand";
  if (platform) return "platform";
  return "other";
}

function colourLiteral(value) {
  return /#[0-9a-fA-F]{3,8}\b/.test(value) || /\brgb(a)?\s*\(/.test(value);
}

function expression(value) {
  return /^var\(--[a-zA-Z0-9-]+\)$/.test(value.trim());
}

function inspectStylesheet(path, text) {
  const brandRefs = new Set();
  const platformRefs = new Set();
  function visit(css) {
    for (const block of splitTop(css)) {
      if (block.prelude.startsWith("@") || block.prelude === "") {
        visit(block.body);
        continue;
      }
      const roles = block.prelude.split(",").map((selector) => selectorRole(selector.trim()));
      for (const decl of declarations(block.body)) {
        if (decl.prop.startsWith("--brand-")) {
          if (!expression(decl.value) || colourLiteral(decl.value)) {
            fail(`${rel(path)} defines ${decl.prop} from a literal, not an expression`);
          }
        }
        const brands = decl.value.match(/var\(--brand-[a-zA-Z0-9-]+\)/g) ?? [];
        const platforms = decl.value.match(/var\(--b2s-[a-zA-Z0-9-]+\)/g) ?? [];
        for (const reference of brands) {
          brandRefs.add(reference);
          if (roles.some((role) => role !== "brand")) {
            fail(`${rel(path)} references ${reference} outside a canvas or content selector (${block.prelude})`);
          }
        }
        for (const reference of platforms) {
          platformRefs.add(reference);
          if (roles.some((role) => role !== "platform")) {
            fail(`${rel(path)} references ${reference} outside a mount or surround selector (${block.prelude})`);
          }
        }
      }
      if (splitTop(block.body).length) visit(block.body);
    }
  }
  visit(stripComments(text));
  return { brandRefs, platformRefs };
}

function literalText(node) {
  if (!node) return null;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  return null;
}

function isHexLiteral(node) {
  const text = literalText(node);
  return Boolean(text && (/^#[0-9a-fA-F]{3,8}$/.test(text) || text.startsWith("rgb")));
}

function inspectSource(path, text) {
  const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const names = new Set();
  const here = rel(path) === SOURCE;
  function visit(node) {
    const textValue = literalText(node);
    if (textValue && textValue.includes("--brand-")) {
      if (!here) {
        fail(`${rel(path)} uses ${textValue} outside BrandFrame`);
      } else if (textValue.startsWith("--brand-")) {
        names.add(textValue);
      }
    }
    if (ts.isPropertyAssignment(node)) {
      const name = literalText(node.name);
      if (name && name.startsWith("--brand-") && isHexLiteral(node.initializer)) {
        fail(`${rel(path)} defines ${name} from a literal colour`);
      }
    }
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isElementAccessExpression(node.left)) {
      const name = literalText(node.left.argumentExpression);
      if (name && name.startsWith("--brand-") && isHexLiteral(node.right)) {
        fail(`${rel(path)} defines ${name} from a literal colour`);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return names;
}

function main() {
  const files = [];
  for (const root of SCAN_ROOTS) {
    const absolute = join(REPO, root);
    if (!existsSync(absolute)) {
      fail(`${root}/ is absent`);
      continue;
    }
    walk(absolute, [".css", ".tsx", ".ts"], files);
  }
  if (files.length < MINIMUM_FILES) {
    fail(`${files.length} file(s) scanned, minimum ${MINIMUM_FILES}`);
  }
  const stylesheet = join(REPO, STYLESHEET);
  const source = join(REPO, SOURCE);
  if (!existsSync(stylesheet)) {
    fail(`${STYLESHEET} is absent`);
  }
  if (!existsSync(source)) {
    fail(`${SOURCE} is absent`);
  }

  let definitions = 0;
  let brandReferences = 0;
  let platformReferences = 0;
  for (const path of files) {
    const text = readFileSync(path, "utf8");
    const relative = rel(path);
    if (relative.endsWith(".css")) {
      if (relative !== STYLESHEET && /--brand-/.test(stripComments(text))) {
        fail(`${relative} references or defines a --brand-* token outside BrandFrame`);
      }
      if (relative === STYLESHEET) {
        const found = inspectStylesheet(path, text);
        brandReferences = found.brandRefs.size;
        platformReferences = found.platformRefs.size;
      }
    } else {
      const names = inspectSource(path, text);
      if (relative === SOURCE) definitions = names.size;
    }
  }

  if (existsSync(source) && definitions < MINIMUM_DEFINITIONS) {
    fail(`${definitions} --brand-* definition(s), minimum ${MINIMUM_DEFINITIONS}`);
  }
  if (existsSync(stylesheet) && brandReferences < MINIMUM_BRAND_REFERENCES) {
    fail(`${brandReferences} --brand-* reference(s), minimum ${MINIMUM_BRAND_REFERENCES}`);
  }
  if (existsSync(stylesheet) && platformReferences < MINIMUM_PLATFORM_REFERENCES) {
    fail(`${platformReferences} --b2s-* reference(s) on mount or surround, minimum ${MINIMUM_PLATFORM_REFERENCES}`);
  }

  if (violations > 0) process.exit(1);
  console.log(
    `OK: brand tokens; ${files.length} file(s) scanned, minimum ${MINIMUM_FILES}; ${definitions} definition(s), minimum ${MINIMUM_DEFINITIONS}; ${brandReferences} brand reference(s), minimum ${MINIMUM_BRAND_REFERENCES}; ${platformReferences} platform reference(s), minimum ${MINIMUM_PLATFORM_REFERENCES}`,
  );
}

main();
