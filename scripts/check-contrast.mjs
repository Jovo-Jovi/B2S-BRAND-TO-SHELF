#!/usr/bin/env node
// Static contrast gate. Text: every rule that declares both a text colour
// and a background colour — directly, or through a state selector of the
// same component — resolves both tokens in each theme. Text needs 4.5:1.
//
// Boundary: only --b2s-color-border-control owes 3:1. --b2s-color-border is
// decorative and exempt (DESIGN_SURFACE.md §2.2). A boundary is measured
// against the surfaces around a control, not the fill declared in the same
// rule. The four surfaces a control can sit on are canvas, surface, sunken
// and raised, in both themes. Rule-level boundary pairing is not used.
//
// Brand pairs are runtime data. This check does not evaluate them.
// BRAND_CONFIG.md §11 binds foreground against background at profile
// completion. A colour inherited from an ancestor is outside this check,
// so it is a recurrence guard and not a substitute for CF-177.
// transparent, inherit and currentcolor are not a pair.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const GLOBALS = "app/globals.css";
const DOCUMENT = "docs/product/DESIGN_SURFACE.md";
const SCAN_ROOTS = ["app", "components", "features"];
const TEXT_MINIMUM = 4.5;
const BOUNDARY_MINIMUM = 3;
const BOUNDARY_TOKEN = "--b2s-color-border-control";
const SURFACES = ["--b2s-color-canvas", "--b2s-color-surface", "--b2s-color-sunken", "--b2s-color-raised"];
// P03-T12 — measured after DateField, FileDrop and DataTable: 82.
// P03-T14 — BrandFrame no longer declares a platform text colour, so the
// pair that colour made is gone: 81.
const MINIMUM_STYLESHEETS = 23;
const MINIMUM_TEXT_PAIRS = 81;
const MINIMUM_SURFACES = 4;
const MINIMUM_BOUNDARY_PAIRS = 8;
const MINIMUM_THEMES = 2;
const MINIMUM_ENUMERATED = 92;

const SKIP = new Set(["transparent", "inherit", "currentcolor"]);
const STATE_PATTERN =
  /:focus-visible|:focus|:hover|:active|:disabled|:checked|\[data-state|\[aria-invalid|\[aria-selected/;

let violations = 0;

function fail(message) {
  violations += 1;
  console.error(`FAIL: ${message}`);
}

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function splitTop(css) {
  const blocks = [];
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf("{", i);
    if (open === -1) {
      break;
    }
    const prelude = css.slice(i, open).trim();
    let depth = 1;
    let j = open + 1;
    while (j < css.length && depth > 0) {
      if (css[j] === "{") {
        depth += 1;
      } else if (css[j] === "}") {
        depth -= 1;
      }
      j += 1;
    }
    blocks.push({ prelude, body: css.slice(open + 1, j - 1) });
    i = j;
  }
  return blocks;
}

function flatBody(body) {
  let out = "";
  let depth = 0;
  for (const char of body) {
    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth = Math.max(0, depth - 1);
    } else if (depth === 0) {
      out += char;
    }
  }
  return out;
}

function declarations(body) {
  return flatBody(body)
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const colon = part.indexOf(":");
      if (colon === -1) {
        return null;
      }
      return { prop: part.slice(0, colon).trim(), value: part.slice(colon + 1).trim() };
    })
    .filter(Boolean);
}

function walkFiles(dir) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") {
        continue;
      }
      found.push(...walkFiles(full));
      continue;
    }
    if (entry.name.endsWith(".css")) {
      found.push(full.split("\\").join("/"));
    }
  }
  return found;
}

function customProps(body) {
  const map = new Map();
  for (const decl of declarations(body)) {
    if (decl.prop.startsWith("--")) {
      map.set(decl.prop, decl.value);
    }
  }
  return map;
}

function themesFrom(css) {
  const light = new Map();
  const dark = new Map();
  for (const block of splitTop(css)) {
    if (block.prelude === ":root" || block.prelude === ':root[data-theme="light"]') {
      for (const [name, value] of customProps(block.body)) {
        light.set(name, value);
      }
    }
    if (block.prelude.includes("prefers-color-scheme: dark")) {
      for (const inner of splitTop(block.body)) {
        if (inner.prelude.includes(":root")) {
          for (const [name, value] of customProps(inner.body)) {
            dark.set(name, value);
          }
        }
      }
    }
    if (block.prelude === ':root[data-theme="dark"]') {
      for (const [name, value] of customProps(block.body)) {
        dark.set(name, value);
      }
    }
  }
  return [
    { name: "light", values: light },
    { name: "dark", values: dark },
  ];
}

function hexChannels(hex) {
  let h = hex.slice(1);
  if (h.length === 3 || h.length === 4) {
    h = [...h].map((c) => c + c).join("");
  }
  if (h.length !== 6 && h.length !== 8) {
    return null;
  }
  return [0, 2, 4].map((offset) => parseInt(h.slice(offset, offset + 2), 16));
}

function resolveColour(value, theme, depth = 0) {
  if (!value || depth > 8) {
    return { error: value || "empty" };
  }
  const trimmed = value.trim();
  if (SKIP.has(trimmed.toLowerCase())) {
    return { skip: true };
  }
  if (trimmed.startsWith("#")) {
    const channels = hexChannels(trimmed);
    if (!channels) {
      return { error: trimmed };
    }
    return { channels, label: trimmed };
  }
  if (trimmed.includes("--brand-")) {
    return { skip: true };
  }
  const named = trimmed.match(/^var\((--[a-zA-Z0-9-]+)\)$/);
  if (named) {
    const next = theme.get(named[1]);
    if (!next) {
      return { error: trimmed };
    }
    return resolveColour(next, theme, depth + 1);
  }
  const colourVar = trimmed.match(/var\((--b2s-color-[a-zA-Z0-9-]+)\)/);
  if (colourVar) {
    return resolveColour(`var(${colourVar[1]})`, theme, depth + 1);
  }
  if (/\btransparent\b/i.test(trimmed)) {
    return { skip: true };
  }
  const hex = trimmed.match(/#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/);
  if (hex) {
    return resolveColour(hex[0], theme, depth + 1);
  }
  return { error: trimmed };
}

function channelLinear(value) {
  const s = value / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function contrast(a, b) {
  const luminance = (channels) =>
    0.2126 * channelLinear(channels[0]) + 0.7152 * channelLinear(channels[1]) + 0.0722 * channelLinear(channels[2]);
  const left = luminance(a);
  const right = luminance(b);
  const lighter = Math.max(left, right);
  const darker = Math.min(left, right);
  return (lighter + 0.05) / (darker + 0.05);
}

export function contrastHex(foreground, background) {
  const a = hexChannels(foreground);
  const b = hexChannels(background);
  if (!a || !b) {
    throw new Error("unresolved hex");
  }
  return contrast(a, b);
}

function sameColour(a, b) {
  return a.channels.every((channel, index) => channel === b.channels[index]);
}

function selectorsOf(prelude) {
  return prelude
    .split(",")
    .map((selector) => selector.trim())
    .filter(Boolean);
}

function isState(selector) {
  return STATE_PATTERN.test(selector);
}

function baseSelector(selector) {
  return selector
    .replace(/:focus-visible/g, "")
    .replace(/:focus/g, "")
    .replace(/:hover/g, "")
    .replace(/:active/g, "")
    .replace(/:disabled/g, "")
    .replace(/:checked/g, "")
    .replace(/\[data-state(?:="[^"]*")?\]/g, "")
    .replace(/\[aria-invalid(?:="[^"]*")?\]/g, "")
    .replace(/\[aria-selected(?:="[^"]*")?\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function rulesIn(css) {
  const rules = new Map();
  function visit(text) {
    for (const block of splitTop(text)) {
      if (block.prelude.startsWith("@") || block.prelude === "") {
        visit(block.body);
        continue;
      }
      const props = {
        color: null,
        background: null,
        borders: [],
      };
      for (const decl of declarations(block.body)) {
        if (decl.prop === "color") {
          props.color = decl.value;
        } else if (decl.prop === "background-color" || decl.prop === "background") {
          props.background = decl.value;
        } else if (
          decl.prop === "border" ||
          decl.prop === "border-color" ||
          decl.prop.endsWith("-color") && decl.prop.startsWith("border")
        ) {
          props.borders.push(decl.value);
        }
      }
      if (splitTop(block.body).length) {
        visit(block.body);
      }
      for (const selector of selectorsOf(block.prelude)) {
        const prior = rules.get(selector) ?? { color: null, background: null, borders: [] };
        rules.set(selector, {
          color: props.color ?? prior.color,
          background: props.background ?? prior.background,
          borders: props.borders.length ? props.borders : prior.borders,
        });
      }
    }
  }
  visit(css);
  return rules;
}

function textPairs(rules) {
  const pairs = [];
  for (const [selector, props] of rules) {
    if (props.color && props.background) {
      pairs.push({ selector, foreground: props.color, background: props.background });
      continue;
    }
    if (!isState(selector)) {
      continue;
    }
    const base = rules.get(baseSelector(selector));
    if (!base) {
      continue;
    }
    const foreground = props.color || base.color;
    const background = props.background || base.background;
    if (foreground && background && (props.color || props.background)) {
      pairs.push({ selector, foreground, background });
    }
  }
  return pairs;
}

function checkPair(rel, selector, theme, kind, left, right, minimum) {
  const a = resolveColour(left, theme.values);
  const b = resolveColour(right, theme.values);
  if (a.skip || b.skip) {
    return false;
  }
  if (a.error || b.error) {
    fail(`${rel} ${selector}: ${kind} colour could not be resolved in ${theme.name} (${a.error || b.error || left})`);
    return true;
  }
  if (kind === "boundary" && sameColour(a, b)) {
    return false;
  }
  const ratio = contrast(a.channels, b.channels);
  if (ratio < minimum) {
    const role = kind === "text" ? "text" : "boundary";
    fail(
      `${rel} ${selector}: ${role} ${a.label} on ${b.label} is ${ratio.toFixed(2)}:1 in ${theme.name}, minimum ${minimum}`,
    );
  }
  return true;
}

function backticks(clause) {
  return [...clause.matchAll(/`([a-z0-9-]+)`/g)].map((match) => match[1]);
}

export function enumeratedPairs(markdown) {
  const section = markdown.slice(markdown.indexOf("### 2.2"), markdown.indexOf("### 2.3"));
  const sentence = section.match(/Ninety-two pairs[^.]+\./s);
  if (!sentence) return { error: "DESIGN_SURFACE.md §2.2 does not enumerate the contrast pairs", pairs: [] };
  const body = sentence[0].replace(/\s+/g, " ").split(":").slice(1).join(":");
  const clauses = body.split(";").map((clause) => clause.trim());
  const pairs = [];
  let four = [];
  for (const clause of clauses) {
    const minimum = clause.includes("3:1") ? 3 : 4.5;
    if (clause.startsWith("each of")) {
      const [left, right] = clause.split(" on ");
      const foregrounds = backticks(left);
      four = backticks(right ?? "");
      for (const foreground of foregrounds) {
        for (const background of four) pairs.push({ foreground, background, minimum });
      }
    } else if (clause.includes("against those four")) {
      for (const foreground of backticks(clause)) {
        for (const background of four) pairs.push({ foreground, background, minimum });
      }
    } else if (clause.startsWith("each status")) {
      const status = section.split("**The proof")[0];
      for (const line of status.split("\n")) {
        if (!line.includes("| Status")) continue;
        const names = [...line.matchAll(/--b2s-color-([a-z0-9-]+)/g)].map((match) => match[1]);
        const foreground = names.find((name) => !name.endsWith("-bg"));
        if (!foreground) continue;
        pairs.push({ foreground, background: `${foreground}-bg`, minimum: 4.5 });
        pairs.push({ foreground, background: "surface", minimum: 4.5 });
      }
    } else {
      let pending = null;
      for (const chunk of clause.split(/, | and /)) {
        const names = backticks(chunk);
        if (chunk.includes(" on ") && names.length >= 2) {
          pending = names[0];
          for (const background of names.slice(1)) pairs.push({ foreground: pending, background, minimum });
        } else if (pending && names.length > 0) {
          for (const background of names) pairs.push({ foreground: pending, background, minimum });
        } else if (names.length === 2) {
          pairs.push({ foreground: names[0], background: names[1], minimum });
        }
      }
    }
  }
  return { pairs };
}

function main() {
  if (!existsSync(GLOBALS)) {
    fail(`${GLOBALS} is absent`);
    process.exit(1);
  }
  const themes = themesFrom(stripComments(readFileSync(GLOBALS, "utf8")));
  let documentText = "";
  try {
    documentText = readFileSync(DOCUMENT, "utf8");
  } catch (err) {
    fail(`${DOCUMENT}: ${err.message}`);
  }
  const enumerated = enumeratedPairs(documentText);
  if (enumerated.error) fail(enumerated.error);
  let enumeratedCount = 0;
  for (const pair of enumerated.pairs) {
    for (const theme of themes) {
      enumeratedCount += 1;
      checkPair(
        DOCUMENT,
        `${pair.foreground} on ${pair.background}`,
        theme,
        pair.minimum === 3 ? "boundary" : "text",
        `var(--b2s-color-${pair.foreground})`,
        `var(--b2s-color-${pair.background})`,
        pair.minimum,
      );
    }
  }
  if (enumeratedCount < MINIMUM_ENUMERATED) {
    fail(`${enumeratedCount} enumerated pair(s), minimum ${MINIMUM_ENUMERATED}`);
  }
  if (themes.length < MINIMUM_THEMES || themes.some((theme) => theme.values.size === 0)) {
    fail(`${themes.length} theme(s), minimum ${MINIMUM_THEMES}`);
  }

  const stylesheets = [];
  for (const root of SCAN_ROOTS) {
    if (!existsSync(root)) {
      fail(`${root}/ is absent`);
      continue;
    }
    stylesheets.push(...walkFiles(root));
  }

  let textCount = 0;
  let boundaryCount = 0;
  if (SURFACES.length < MINIMUM_SURFACES) {
    fail(`${SURFACES.length} surface(s), minimum ${MINIMUM_SURFACES}`);
  }
  for (const theme of themes) {
    for (const surface of SURFACES) {
      const seen = checkPair(
        GLOBALS,
        `${BOUNDARY_TOKEN} on ${surface}`,
        theme,
        "boundary",
        `var(${BOUNDARY_TOKEN})`,
        `var(${surface})`,
        BOUNDARY_MINIMUM,
      );
      if (seen) {
        boundaryCount += 1;
      }
    }
  }
  for (const rel of stylesheets) {
    const rules = rulesIn(stripComments(readFileSync(rel, "utf8")));
    for (const pair of textPairs(rules)) {
      let counted = false;
      for (const theme of themes) {
        const seen = checkPair(rel, pair.selector, theme, "text", pair.foreground, pair.background, TEXT_MINIMUM);
        counted = counted || seen;
      }
      if (counted) {
        textCount += 1;
      }
    }
  }

  if (stylesheets.length < MINIMUM_STYLESHEETS) {
    fail(`${stylesheets.length} stylesheet(s) scanned, minimum ${MINIMUM_STYLESHEETS}`);
  }
  if (textCount < MINIMUM_TEXT_PAIRS) {
    fail(`${textCount} text pair(s), minimum ${MINIMUM_TEXT_PAIRS}`);
  }
  if (boundaryCount < MINIMUM_BOUNDARY_PAIRS) {
    fail(`${boundaryCount} boundary pair(s), minimum ${MINIMUM_BOUNDARY_PAIRS}`);
  }

  if (violations > 0) {
    process.exit(1);
  }

  console.log(
    `OK: declared contrast pairs; ${stylesheets.length} stylesheet(s) scanned, minimum ${MINIMUM_STYLESHEETS}; ${textCount} text pair(s), minimum ${MINIMUM_TEXT_PAIRS}; ${boundaryCount} boundary pair(s) of ${BOUNDARY_TOKEN} against ${SURFACES.length} surface(s), minimum ${MINIMUM_BOUNDARY_PAIRS}; ${enumeratedCount} enumerated section 2.2 pair(s) from ${GLOBALS}, minimum ${MINIMUM_ENUMERATED}; ${themes.length} theme(s), minimum ${MINIMUM_THEMES}. --b2s-color-border is decorative and exempt. Brand pairs are runtime data and are not evaluated; BRAND_CONFIG.md §11 binds them at profile completion. Pairs inherited from an ancestor are outside this check; it is not a substitute for CF-177`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
