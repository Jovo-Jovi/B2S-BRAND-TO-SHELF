#!/usr/bin/env node
// CF-172. Raw colour, spacing, radius, duration, shadow and font-family
// values live only in token definitions. Every chrome-neutral colour token
// has R = G = B (OD-G22). Font families are the two OD-G23 faces plus
// generic fallbacks. Colours are parsed in every notation this stylesheet
// uses, not only six-digit hex (PR-22).

import { readFileSync } from "node:fs";

const FILE = "app/globals.css";
const MINIMUM_TOKENS = 204;

const CHROME_NEUTRALS = new Set([
  "--b2s-color-canvas",
  "--b2s-color-surface",
  "--b2s-color-sunken",
  "--b2s-color-raised",
  "--b2s-color-border",
  "--b2s-color-border-control",
  "--b2s-color-text",
  "--b2s-color-text-muted",
  "--b2s-color-text-subtle",
  "--b2s-color-action",
  "--b2s-color-action-text",
  "--b2s-color-action-hover",
  "--b2s-color-focus",
  "--b2s-color-scrim",
]);

const FAMILIES = new Set(["IBM Plex Sans", "IBM Plex Sans Arabic"]);
const GENERICS = new Set(["system-ui", "sans-serif"]);

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

function declarations(body) {
  return body
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

function channelsOf(value) {
  const found = [];
  const hex = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
  let match = hex.exec(value);
  while (match) {
    const channels = hexChannels(match[0]);
    if (!channels) {
      return { error: match[0] };
    }
    found.push(channels);
    match = hex.exec(value);
  }
  const fn = /(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\([^)]*\)/gi;
  match = fn.exec(value);
  while (match) {
    const inner = match[0];
    if (/^rgba?\(/i.test(inner)) {
      const nums = inner
        .replace(/rgba?\(/i, "")
        .replace(")", "")
        .trim()
        .split(/[\s,/]+/)
        .filter(Boolean)
        .slice(0, 3)
        .map(Number);
      if (nums.length !== 3 || nums.some((n) => Number.isNaN(n))) {
        return { error: inner };
      }
      found.push(nums);
    }
    match = fn.exec(value);
  }
  return { found };
}

function familiesIn(value) {
  const quoted = [...value.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  const rest = value
    .replace(/"[^"]*"/g, " ")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return [...quoted, ...rest];
}

let text;
try {
  text = stripComments(readFileSync(FILE, "utf8"));
} catch (err) {
  fail(`${FILE}: ${err.message}`);
  process.exit(1);
}

let tokens = 0;

function walkBlocks(css) {
  for (const block of splitTop(css)) {
    const fontFace = block.prelude.includes("@font-face");
    const nested = splitTop(block.body);
    const nestedSpan = nested.length
      ? block.body
      : "";
    const flat = nested.length ? block.body.replace(/[^{}]*\{[\s\S]*\}/g, " ") : block.body;
    inspect(block.prelude, flat, fontFace);
    if (nested.length) {
      walkBlocks(block.body);
    }
    if (nestedSpan && nested.length === 0) {
      /* leaf */
    }
  }
}

function inspect(prelude, body, fontFace) {
  for (const decl of declarations(body)) {
    if (decl.prop.startsWith("--")) {
      tokens += 1;
      if (CHROME_NEUTRALS.has(decl.prop)) {
        const parsed = channelsOf(decl.value);
        if (parsed.error || parsed.found.length === 0) {
          fail(`${decl.prop} is a chrome neutral with no parsed colour (${decl.value})`);
        } else if (parsed.found.some(([r, g, b]) => r !== g || g !== b)) {
          fail(`${decl.prop} is a chrome neutral and is not achromatic (${decl.value})`);
        }
      }
      if (decl.prop === "--b2s-font-family") {
        for (const name of familiesIn(decl.value)) {
          if (!FAMILIES.has(name) && !GENERICS.has(name)) {
            fail(`font family ${name} is outside OD-G23`);
          }
        }
      }
      continue;
    }
    if (fontFace) {
      if (decl.prop === "font-family") {
        const names = familiesIn(decl.value);
        if (names.length !== 1 || !FAMILIES.has(names[0])) {
          fail(`@font-face family ${decl.value} is outside OD-G23`);
        }
      }
      if (decl.prop === "src" && /https?:|(?:^|[^/])\/\//.test(decl.value)) {
        fail(`@font-face src is not self-hosted (${decl.value})`);
      }
      continue;
    }
    const raw = decl.value.replace(/var\(--b2s-[a-z0-9-]+\)/g, "");
    if (
      /#(?:[0-9a-fA-F]{3,8})\b/.test(raw) ||
      /(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/i.test(raw) ||
      /\d+(?:\.\d+)?(?:px|rem|em|ms|s|ch)\b/.test(raw) ||
      /rgb\(/.test(raw)
    ) {
      fail(`raw value outside a token definition: ${decl.prop}: ${decl.value}`);
    }
    if (decl.prop === "font-family") {
      for (const name of familiesIn(decl.value)) {
        if (name.startsWith("var(")) {
          continue;
        }
        if (!FAMILIES.has(name) && !GENERICS.has(name)) {
          fail(`font family ${name} is outside OD-G23`);
        }
      }
    }
  }
}

walkBlocks(text);
if (tokens === 0) {
  fail(`${FILE} has no style blocks`);
}

if (tokens < MINIMUM_TOKENS) {
  fail(`${tokens} token definition(s), minimum ${MINIMUM_TOKENS}`);
}

if (violations > 0) {
  process.exit(1);
}

console.log(`OK: token values stay inside definitions; ${tokens} token(s), minimum ${MINIMUM_TOKENS}`);
