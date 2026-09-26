#!/usr/bin/env node
// Static contrast gate. For every rule that declares both a text colour and
// a background colour — directly, or through a state selector of the same
// component — resolve both tokens in each theme and compute WCAG 2.2
// contrast. Text needs 4.5:1. A boundary token against the surface declared
// in the same rule needs 3:1. A state selector does not move the boundary
// check onto a background the state did not declare with the border.
//
// This check sees pairs declared together. It does not resolve a colour
// inherited from an ancestor, so it is a recurrence guard and not a
// substitute for CF-177's rendered check. transparent, inherit and
// currentcolor are not a pair. A boundary whose two resolved colours are
// equal is not a pair.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const GLOBALS = "app/globals.css";
const SCAN_ROOTS = ["app", "components", "features"];
const TEXT_MINIMUM = 4.5;
const BOUNDARY_MINIMUM = 3;
const MINIMUM_STYLESHEETS = 18;
const MINIMUM_TEXT_PAIRS = 44;
const MINIMUM_BOUNDARY_PAIRS = 8;
const MINIMUM_THEMES = 2;

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

function boundaryPairs(rules) {
  const pairs = [];
  for (const [selector, props] of rules) {
    if (!props.background || props.borders.length === 0) {
      continue;
    }
    const seen = new Set();
    for (const border of props.borders) {
      if (seen.has(border)) {
        continue;
      }
      seen.add(border);
      pairs.push({ selector, border, background: props.background });
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

function main() {
  if (!existsSync(GLOBALS)) {
    fail(`${GLOBALS} is absent`);
    process.exit(1);
  }
  const themes = themesFrom(stripComments(readFileSync(GLOBALS, "utf8")));
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
    for (const pair of boundaryPairs(rules)) {
      let counted = false;
      for (const theme of themes) {
        const seen = checkPair(rel, pair.selector, theme, "boundary", pair.border, pair.background, BOUNDARY_MINIMUM);
        counted = counted || seen;
      }
      if (counted) {
        boundaryCount += 1;
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
    `OK: declared contrast pairs; ${stylesheets.length} stylesheet(s) scanned, minimum ${MINIMUM_STYLESHEETS}; ${textCount} text pair(s), minimum ${MINIMUM_TEXT_PAIRS}; ${boundaryCount} boundary pair(s), minimum ${MINIMUM_BOUNDARY_PAIRS}; ${themes.length} theme(s), minimum ${MINIMUM_THEMES}. Pairs inherited from an ancestor are outside this check; it is not a substitute for CF-177`,
  );
}

main();
