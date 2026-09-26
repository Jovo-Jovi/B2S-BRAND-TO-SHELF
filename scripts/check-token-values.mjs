#!/usr/bin/env node
// CF-172. Raw colour, length, radius, duration, shadow, font-family and
// z-index values live only in token definitions. The scan is every stylesheet
// under app/, components/ and features/, module or global, and every inline
// style attribute. A --b2s- custom property may be defined only in
// app/globals.css. Every --b2s-color-* token, and every colour inside any
// --b2s- definition, is achromatic unless the token is on the closed
// chromatic list (OD-G22). That list, and the z-index layer list, are
// asserted both ways against DESIGN_SURFACE.md. Font families are the two
// OD-G23 faces plus generic fallbacks.
//
// Button's loading width lock writes element.style.inlineSize. That
// imperative assignment is not an inline style attribute, and this scan
// does not parse it.
//
// Achromaticity is decided in the colour's own space, not by converting to
// 8-bit sRGB. An sRGB conversion can turn a zero-chroma lab colour into
// unequal channels, and a near-zero chroma into equal ones.
//   hex, rgb/rgba, named colours, and color() in an RGB space
//     (srgb, srgb-linear, display-p3, a98-rgb, rec2020, prophoto-rgb):
//     the three colour channels are equal. Alpha is ignored.
//   hsl/hsla: saturation is 0.
//   hwb: white + black is at least 1, so the hue has no weight.
//   lab/oklab: a = 0 and b = 0.
//   lch/oklch: chroma is 0. Hue is ignored.
//   color(xyz), color(xyz-d65), color(xyz-d50): the components are a
//     non-negative scalar of that space's reference white (D65 or D50).
//     Equal xyz components are not neutral.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const GLOBALS = "app/globals.css";
const DOCUMENT = "docs/product/DESIGN_SURFACE.md";
const SCAN_ROOTS = ["app", "components", "features"];

const CHROMATIC_TOKENS = [
  "--b2s-color-danger-action",
  "--b2s-color-danger-action-hover",
  "--b2s-color-danger-action-active",
  "--b2s-color-success",
  "--b2s-color-success-bg",
  "--b2s-color-warning",
  "--b2s-color-warning-bg",
  "--b2s-color-danger",
  "--b2s-color-danger-bg",
  "--b2s-color-info",
  "--b2s-color-info-bg",
];

const MINIMUM_TOKENS = 234;
const MINIMUM_ACHROMATIC = 68;
const MINIMUM_CHROMATIC = 11;
const MINIMUM_FONT_FAMILIES = 11;
const MINIMUM_STYLESHEETS = 18;
const MINIMUM_DECLARATIONS = 874;
const MINIMUM_SOURCES = 69;

const FAMILIES = new Set(["IBM Plex Sans", "IBM Plex Sans Arabic"]);
const GENERICS = new Set(["system-ui", "sans-serif"]);

const ACHROMATIC_NAMES = new Set([
  "black",
  "white",
  "gray",
  "grey",
  "silver",
  "dimgray",
  "dimgrey",
  "darkgray",
  "darkgrey",
  "lightgray",
  "lightgrey",
  "whitesmoke",
  "gainsboro",
  "transparent",
]);

const NAMED_COLOURS = new Set([
  ...ACHROMATIC_NAMES,
  "aliceblue",
  "antiquewhite",
  "aqua",
  "aquamarine",
  "azure",
  "beige",
  "bisque",
  "blanchedalmond",
  "blue",
  "blueviolet",
  "brown",
  "burlywood",
  "cadetblue",
  "chartreuse",
  "chocolate",
  "coral",
  "cornflowerblue",
  "cornsilk",
  "crimson",
  "cyan",
  "darkblue",
  "darkcyan",
  "darkgoldenrod",
  "darkgreen",
  "darkkhaki",
  "darkmagenta",
  "darkolivegreen",
  "darkorange",
  "darkorchid",
  "darkred",
  "darksalmon",
  "darkseagreen",
  "darkslateblue",
  "darkslategray",
  "darkslategrey",
  "darkturquoise",
  "darkviolet",
  "deeppink",
  "deepskyblue",
  "dodgerblue",
  "firebrick",
  "floralwhite",
  "forestgreen",
  "fuchsia",
  "ghostwhite",
  "gold",
  "goldenrod",
  "green",
  "greenyellow",
  "honeydew",
  "hotpink",
  "indianred",
  "indigo",
  "ivory",
  "khaki",
  "lavender",
  "lavenderblush",
  "lawngreen",
  "lemonchiffon",
  "lightblue",
  "lightcoral",
  "lightcyan",
  "lightgoldenrodyellow",
  "lightgreen",
  "lightpink",
  "lightsalmon",
  "lightseagreen",
  "lightskyblue",
  "lightslategray",
  "lightslategrey",
  "lightsteelblue",
  "lightyellow",
  "lime",
  "limegreen",
  "linen",
  "magenta",
  "maroon",
  "mediumaquamarine",
  "mediumblue",
  "mediumorchid",
  "mediumpurple",
  "mediumseagreen",
  "mediumslateblue",
  "mediumspringgreen",
  "mediumturquoise",
  "mediumvioletred",
  "midnightblue",
  "mintcream",
  "mistyrose",
  "moccasin",
  "navajowhite",
  "navy",
  "oldlace",
  "olive",
  "olivedrab",
  "orange",
  "orangered",
  "orchid",
  "palegoldenrod",
  "palegreen",
  "paleturquoise",
  "palevioletred",
  "papayawhip",
  "peachpuff",
  "peru",
  "pink",
  "plum",
  "powderblue",
  "purple",
  "rebeccapurple",
  "red",
  "rosybrown",
  "royalblue",
  "saddlebrown",
  "salmon",
  "sandybrown",
  "seagreen",
  "seashell",
  "sienna",
  "skyblue",
  "slateblue",
  "slategray",
  "slategrey",
  "snow",
  "springgreen",
  "steelblue",
  "tan",
  "teal",
  "thistle",
  "tomato",
  "turquoise",
  "violet",
  "wheat",
  "yellow",
  "yellowgreen",
]);

const RGB_SPACES = new Set([
  "srgb",
  "srgb-linear",
  "display-p3",
  "a98-rgb",
  "rec2020",
  "prophoto-rgb",
]);

const XYZ_WHITE = {
  xyz: [0.95047, 1, 1.08883],
  "xyz-d65": [0.95047, 1, 1.08883],
  "xyz-d50": [0.96422, 1, 0.82521],
};

const WIDE = new Set(["inherit", "initial", "unset", "revert", "revert-layer"]);

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

function matchingParen(text, openIndex) {
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
    if (c === "(") {
      depth += 1;
    } else if (c === ")") {
      depth -= 1;
      if (depth === 0) {
        return i;
      }
    }
  }
  return -1;
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

function component(token) {
  if (token === "none") {
    return 0;
  }
  if (token.endsWith("%")) {
    const n = Number(token.slice(0, -1));
    return Number.isNaN(n) ? null : n / 100;
  }
  const n = Number(token);
  return Number.isNaN(n) ? null : n;
}

function argsOf(inner) {
  const slash = inner.indexOf("/");
  const head = (slash === -1 ? inner : inner.slice(0, slash)).trim();
  return head.split(/[\s,]+/).filter(Boolean);
}

function zero(n) {
  return n === 0;
}

function equalChannels(channels) {
  return channels.length === 3 && channels[0] === channels[1] && channels[1] === channels[2];
}

function rgbChannels(tokens) {
  if (tokens.length !== 3) {
    return null;
  }
  const parsed = tokens.map(component);
  if (parsed.some((n) => n === null)) {
    return null;
  }
  return parsed.map((n, i) => (tokens[i].endsWith("%") ? n * 255 : n));
}

function whiteScaled(channels, white) {
  if (channels.every((n) => n === 0)) {
    return true;
  }
  let scale = null;
  for (let i = 0; i < 3; i++) {
    const s = channels[i] / white[i];
    if (s < 0) {
      return false;
    }
    if (scale === null) {
      scale = s;
    } else if (Math.abs(s - scale) > 1e-4) {
      return false;
    }
  }
  return scale !== null;
}

function parseFunction(fn) {
  const open = fn.indexOf("(");
  const name = fn.slice(0, open).toLowerCase();
  const inner = fn.slice(open + 1, -1).trim();
  if (/\bfrom\b/i.test(inner)) {
    return { error: fn };
  }
  const tokens = argsOf(inner);
  if (name === "rgb" || name === "rgba") {
    const colourTokens = tokens.length === 4 ? tokens.slice(0, 3) : tokens;
    const channels = rgbChannels(colourTokens);
    if (!channels) {
      return { error: fn };
    }
    return { achromatic: equalChannels(channels), label: fn };
  }
  if (name === "hsl" || name === "hsla") {
    const colourTokens = tokens.length === 4 ? tokens.slice(0, 3) : tokens;
    if (colourTokens.length !== 3) {
      return { error: fn };
    }
    const saturation = component(colourTokens[1]);
    if (saturation === null) {
      return { error: fn };
    }
    return { achromatic: zero(saturation), label: fn };
  }
  if (name === "hwb") {
    if (tokens.length !== 3) {
      return { error: fn };
    }
    const white = component(tokens[1]);
    const black = component(tokens[2]);
    if (white === null || black === null) {
      return { error: fn };
    }
    return { achromatic: white + black >= 1 - 1e-9, label: fn };
  }
  if (name === "lab" || name === "oklab") {
    if (tokens.length !== 3) {
      return { error: fn };
    }
    const a = component(tokens[1]);
    const b = component(tokens[2]);
    if (a === null || b === null) {
      return { error: fn };
    }
    return { achromatic: zero(a) && zero(b), label: fn };
  }
  if (name === "lch" || name === "oklch") {
    if (tokens.length !== 3) {
      return { error: fn };
    }
    const chroma = component(tokens[1]);
    if (chroma === null) {
      return { error: fn };
    }
    return { achromatic: zero(chroma), label: fn };
  }
  if (name === "color") {
    if (tokens.length < 4) {
      return { error: fn };
    }
    const space = tokens[0].toLowerCase();
    const channels = tokens.slice(1, 4).map(component);
    if (channels.some((n) => n === null)) {
      return { error: fn };
    }
    if (RGB_SPACES.has(space)) {
      return { achromatic: equalChannels(channels), label: fn };
    }
    if (XYZ_WHITE[space]) {
      return { achromatic: whiteScaled(channels, XYZ_WHITE[space]), label: fn };
    }
    return { error: fn };
  }
  return { error: fn };
}

export function coloursIn(value) {
  const found = [];
  const hex = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b/g;
  let match = hex.exec(value);
  while (match) {
    const channels = hexChannels(match[0]);
    if (!channels) {
      return { error: match[0] };
    }
    found.push({ achromatic: equalChannels(channels), label: match[0] });
    match = hex.exec(value);
  }
  const fnName = /(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/gi;
  let fn = fnName.exec(value);
  while (fn) {
    const open = fn.index + fn[0].length - 1;
    const close = matchingParen(value, open);
    if (close < 0) {
      return { error: fn[0] };
    }
    const parsed = parseFunction(value.slice(fn.index, close + 1));
    if (parsed.error) {
      return { error: parsed.error };
    }
    found.push(parsed);
    fnName.lastIndex = close + 1;
    fn = fnName.exec(value);
  }
  const withoutFunctions = stripFunctions(value);
  for (const word of withoutFunctions.match(/[a-zA-Z]+/g) ?? []) {
    const name = word.toLowerCase();
    if (!NAMED_COLOURS.has(name)) {
      continue;
    }
    found.push({ achromatic: ACHROMATIC_NAMES.has(name), label: name });
  }
  return { found };
}

function stripFunctions(value) {
  let out = "";
  for (let i = 0; i < value.length; i++) {
    const fn = /^(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/i.exec(value.slice(i));
    if (fn) {
      const close = matchingParen(value, i + fn[0].length - 1);
      if (close < 0) {
        out += value[i];
        continue;
      }
      out += " ";
      i = close;
      continue;
    }
    out += value[i];
  }
  return out.replace(/#(?:[0-9a-fA-F]{3,8})\b/g, " ");
}

function referenceOnly(value) {
  const stripped = value
    .replace(/var\(\s*--[a-zA-Z0-9-]+\s*\)/g, " ")
    .replace(/[(),\s]/g, " ")
    .trim();
  if (!stripped) {
    return true;
  }
  return stripped.split(/\s+/).every((word) => WIDE.has(word.toLowerCase()));
}

export function sectionChromaticTokens(markdown) {
  const start22 = markdown.indexOf("### 2.2");
  const end22 = markdown.indexOf("### 2.3", start22 + 1);
  const start211 = markdown.indexOf("### 2.11");
  const end211 = markdown.indexOf("\n## 3", start211 + 1);
  if (start22 < 0 || end22 < 0 || start211 < 0 || end211 < 0) {
    return { error: "DESIGN_SURFACE.md is missing §2.2 or §2.11" };
  }
  const names = new Set();
  for (const line of markdown.slice(start22, end22).split("\n")) {
    if (!line.startsWith("|")) {
      continue;
    }
    const cells = line.split("|").map((cell) => cell.trim()).filter((cell) => cell.length > 0);
    if (cells.length < 2) {
      continue;
    }
    const use = cells[cells.length - 1];
    if (use !== "Status" && !use.startsWith("Destructive")) {
      continue;
    }
    for (const token of cells[0].match(/--b2s-color-[a-z0-9-]+/g) ?? []) {
      names.add(token);
    }
  }
  for (const line of markdown.slice(start211, end211).split("\n")) {
    if (!line.startsWith("|")) {
      continue;
    }
    const cells = line.split("|").map((cell) => cell.trim()).filter((cell) => cell.length > 0);
    if (cells.length < 2) {
      continue;
    }
    const usedBy = cells[cells.length - 1];
    if (!/danger/i.test(usedBy)) {
      continue;
    }
    for (const token of cells[0].match(/--b2s-color-[a-z0-9-]+/g) ?? []) {
      names.add(token);
    }
  }
  return { names };
}

export function listViolations(listed, derived) {
  const messages = [];
  if (listed.length < MINIMUM_CHROMATIC) {
    messages.push(`${listed.length} chromatic token(s) on the list, minimum ${MINIMUM_CHROMATIC}`);
  }
  for (const token of listed) {
    if (!derived.has(token)) {
      messages.push(`${token} is listed as chromatic and DESIGN_SURFACE.md does not name it as chromatic`);
    }
  }
  for (const token of derived) {
    if (!listed.includes(token)) {
      messages.push(`${token} is named chromatic in DESIGN_SURFACE.md and the chromatic list omits it`);
    }
  }
  return messages;
}

export function colourViolations(decls, listed) {
  const messages = [];
  let achromaticTokens = 0;
  let fontFamilies = 0;
  const chromatic = new Set(listed);
  for (const decl of decls) {
    if (!decl.prop.startsWith("--b2s-")) {
      if (decl.prop === "font-family") {
        fontFamilies += 1;
      }
      continue;
    }
    if (decl.prop === "--b2s-font-family") {
      fontFamilies += 1;
    }
    const parsed = coloursIn(decl.value);
    if (parsed.error) {
      messages.push(`${decl.prop} has a colour that could not be parsed (${parsed.error})`);
      continue;
    }
    const exempt = chromatic.has(decl.prop);
    if (decl.prop.startsWith("--b2s-color-") && !exempt) {
      achromaticTokens += 1;
      if (parsed.found.length === 0 && !referenceOnly(decl.value)) {
        messages.push(`${decl.prop} is a colour token with no parsed colour (${decl.value})`);
      }
    }
    if (!exempt) {
      for (const colour of parsed.found) {
        if (!colour.achromatic) {
          messages.push(`${decl.prop} is not on the chromatic list and is not achromatic (${colour.label})`);
        }
      }
    }
  }
  if (achromaticTokens < MINIMUM_ACHROMATIC) {
    messages.push(`${achromaticTokens} achromatic colour token(s) checked, minimum ${MINIMUM_ACHROMATIC}`);
  }
  if (fontFamilies < MINIMUM_FONT_FAMILIES) {
    messages.push(`${fontFamilies} font-family declaration(s) checked, minimum ${MINIMUM_FONT_FAMILIES}`);
  }
  return { messages, achromaticTokens, fontFamilies };
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

function fontViolations(prop, value, fontFace) {
  const messages = [];
  if (prop === "--b2s-font-family" || (prop === "font-family" && !fontFace)) {
    for (const name of familiesIn(value)) {
      if (name.startsWith("var(") || WIDE.has(name.toLowerCase())) {
        continue;
      }
      if (!FAMILIES.has(name) && !GENERICS.has(name)) {
        messages.push(`font family ${name} is outside OD-G23`);
      }
    }
  }
  if (fontFace && prop === "font-family") {
    const names = familiesIn(value);
    if (names.length !== 1 || !FAMILIES.has(names[0])) {
      messages.push(`@font-face family ${value} is outside OD-G23`);
    }
  }
  if (fontFace && prop === "src" && /https?:|(?:^|[^/])\/\//.test(value)) {
    messages.push(`@font-face src is not self-hosted (${value})`);
  }
  return messages;
}

const LAYER_TOKENS = [
  "--b2s-layer-dropdown",
  "--b2s-layer-sticky",
  "--b2s-layer-scrim",
  "--b2s-layer-dialog",
  "--b2s-layer-notice",
  "--b2s-layer-tooltip",
];

function rawViolation(prop, value) {
  const raw = value.replace(/var\(\s*--b2s-[a-z0-9-]+\s*(?:,[^)]*)?\)/g, "");
  if (
    /#(?:[0-9a-fA-F]{3,8})\b/.test(raw) ||
    /(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/i.test(raw) ||
    /\d+(?:\.\d+)?(?:px|rem|em|ms|s|ch)\b/.test(raw)
  ) {
    return `raw value outside a token definition: ${prop}: ${value}`;
  }
  if (prop === "z-index") {
    const named = value.trim().match(/^var\((--b2s-layer-[a-z0-9-]+)\)$/);
    if (!named || !LAYER_TOKENS.includes(named[1])) {
      return `raw z-index outside a token definition: ${prop}: ${value}`;
    }
  }
  if (prop === "border-radius" && raw.replace(/[\s,]/g, "").length > 0) {
    return `raw radius outside a token definition: ${prop}: ${value}`;
  }
  return null;
}

function kebab(name) {
  return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function walkFiles(dir, extensions) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") {
        continue;
      }
      found.push(...walkFiles(full, extensions));
      continue;
    }
    if (extensions.some((extension) => entry.name.endsWith(extension))) {
      found.push(full.split("\\").join("/"));
    }
  }
  return found;
}

function inlineDeclarations(source) {
  const decls = [];
  const quoted = /style\s*=\s*"([^"]*)"/g;
  let match = quoted.exec(source);
  while (match) {
    decls.push(...declarations(match[1]));
    match = quoted.exec(source);
  }
  const objectStyle = /style=\{\{([\s\S]*?)\}\}/g;
  match = objectStyle.exec(source);
  while (match) {
    for (const part of match[1].split(",")) {
      const colon = part.indexOf(":");
      if (colon === -1) {
        continue;
      }
      const prop = kebab(part.slice(0, colon).replace(/['"]/g, "").trim());
      const value = part
        .slice(colon + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
      if (prop) {
        decls.push({ prop, value });
      }
    }
    match = objectStyle.exec(source);
  }
  return decls;
}

export function sectionLayerTokens(markdown) {
  const start = markdown.indexOf("### 2.11");
  const end = markdown.indexOf("\n## 3", start + 1);
  if (start < 0 || end < 0) {
    return { error: "DESIGN_SURFACE.md is missing §2.11" };
  }
  const names = new Set();
  for (const line of markdown.slice(start, end).split("\n")) {
    if (!line.startsWith("|")) {
      continue;
    }
    const cells = line.split("|").map((cell) => cell.trim()).filter((cell) => cell.length > 0);
    if (cells.length < 2) {
      continue;
    }
    for (const token of cells[0].match(/--b2s-layer-[a-z0-9-]+/g) ?? []) {
      names.add(token);
    }
  }
  return { names };
}

function collect(css) {
  const decls = [];
  const faces = [];
  function walk(text) {
    for (const block of splitTop(text)) {
      const fontFace = block.prelude.includes("@font-face");
      const nested = splitTop(block.body);
      const flat = nested.length ? block.body.replace(/[^{}]*\{[\s\S]*?\}/g, " ") : block.body;
      for (const decl of declarations(flat)) {
        decls.push(decl);
        faces.push(fontFace);
      }
      if (nested.length) {
        walk(block.body);
      }
    }
  }
  walk(css);
  return { decls, faces };
}

function examine(rel, text, stylesheet) {
  const { decls, faces } = collect(stripComments(text));
  let tokens = 0;
  decls.forEach((decl, index) => {
    if (decl.prop.startsWith("--")) {
      if (decl.prop.startsWith("--b2s-") && rel !== GLOBALS) {
        fail(`${rel}: a --b2s- custom property is defined only in ${GLOBALS} (${decl.prop})`);
      }
      if (rel === GLOBALS) {
        tokens += 1;
      }
      for (const message of fontViolations(decl.prop, decl.value, false)) {
        fail(`${rel}: ${message}`);
      }
      return;
    }
    if (stylesheet && faces[index]) {
      for (const message of fontViolations(decl.prop, decl.value, true)) {
        fail(`${rel}: ${message}`);
      }
      return;
    }
    const raw = rawViolation(decl.prop, decl.value);
    if (raw) {
      fail(`${rel}: ${raw}`);
    }
    for (const message of fontViolations(decl.prop, decl.value, false)) {
      fail(`${rel}: ${message}`);
    }
  });
  return { decls, tokens };
}

function main() {
  if (CHROMATIC_TOKENS.length < MINIMUM_CHROMATIC) {
    fail(`${CHROMATIC_TOKENS.length} chromatic token(s) on the list, minimum ${MINIMUM_CHROMATIC}`);
  }

  let documentText;
  try {
    documentText = readFileSync(DOCUMENT, "utf8");
  } catch (err) {
    fail(`${DOCUMENT}: ${err.message}`);
    process.exit(1);
  }
  const derived = sectionChromaticTokens(documentText);
  if (derived.error) {
    fail(derived.error);
    process.exit(1);
  }
  for (const message of listViolations(CHROMATIC_TOKENS, derived.names)) {
    fail(message);
  }
  const layers = sectionLayerTokens(documentText);
  if (layers.error) {
    fail(layers.error);
    process.exit(1);
  }
  for (const token of LAYER_TOKENS) {
    if (!layers.names.has(token)) {
      fail(`${token} is listed as a z-index layer and DESIGN_SURFACE.md §2.11 does not name it`);
    }
  }
  for (const token of layers.names) {
    if (!LAYER_TOKENS.includes(token)) {
      fail(`${token} is a z-index layer in DESIGN_SURFACE.md §2.11 and the layer list omits it`);
    }
  }

  const stylesheets = [];
  const sources = [];
  for (const root of SCAN_ROOTS) {
    if (!existsSync(root)) {
      fail(`${root}/ is absent`);
      continue;
    }
    stylesheets.push(...walkFiles(root, [".css"]));
    sources.push(...walkFiles(root, [".css", ".ts", ".tsx", ".js", ".jsx", ".mjs"]));
  }

  const decls = [];
  let tokens = 0;
  for (const rel of stylesheets) {
    const examined = examine(rel, readFileSync(rel, "utf8"), true);
    decls.push(...examined.decls);
    tokens += examined.tokens;
  }
  for (const rel of sources) {
    if (rel.endsWith(".css")) {
      continue;
    }
    const inline = inlineDeclarations(readFileSync(rel, "utf8"));
    for (const decl of inline) {
      const raw = rawViolation(decl.prop, decl.value);
      if (raw) {
        fail(`${rel}: ${raw}`);
      }
    }
    decls.push(...inline);
  }

  const colour = colourViolations(decls, CHROMATIC_TOKENS);
  for (const message of colour.messages) {
    fail(message);
  }

  if (tokens < MINIMUM_TOKENS) {
    fail(`${tokens} token definition(s), minimum ${MINIMUM_TOKENS}`);
  }
  if (stylesheets.length < MINIMUM_STYLESHEETS) {
    fail(`${stylesheets.length} stylesheet(s) scanned, minimum ${MINIMUM_STYLESHEETS}`);
  }
  if (decls.length < MINIMUM_DECLARATIONS) {
    fail(`${decls.length} declaration(s) examined, minimum ${MINIMUM_DECLARATIONS}`);
  }
  if (sources.length < MINIMUM_SOURCES) {
    fail(`${sources.length} source file(s) scanned, minimum ${MINIMUM_SOURCES}`);
  }

  if (violations > 0) {
    process.exit(1);
  }

  console.log(
    `OK: token values stay inside definitions; ${stylesheets.length} stylesheet(s) scanned, minimum ${MINIMUM_STYLESHEETS}; ${decls.length} declaration(s) examined, minimum ${MINIMUM_DECLARATIONS}; ${tokens} token(s), minimum ${MINIMUM_TOKENS}; ${colour.achromaticTokens} achromatic colour token(s), minimum ${MINIMUM_ACHROMATIC}; ${CHROMATIC_TOKENS.length} chromatic token(s), minimum ${MINIMUM_CHROMATIC}; ${colour.fontFamilies} font-family declaration(s), minimum ${MINIMUM_FONT_FAMILIES}; ${sources.length} source file(s) scanned, minimum ${MINIMUM_SOURCES}`,
  );
}

if (process.env.B2S_CHECK_IMPORT !== "1") {
  main();
}
