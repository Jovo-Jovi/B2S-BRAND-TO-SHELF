#!/usr/bin/env node
// CF-172. Raw colour, length, radius, duration, shadow, font-family and
// z-index values live only in token definitions. The scan is every stylesheet
// under app/, components/ and features/, module or global, and every inline
// style attribute. A --b2s- custom property may be defined only in
// app/globals.css. The closed chromatic list is removed: OD-G24 and OD-G25
// replace OD-G22, and an allow-list of chromatic tokens no longer describes
// the platform. The colour-token set is closed against DESIGN_SURFACE.md
// §2.2 and §2.11 in both directions. proof, proof-edge and proof-text are
// achromatic.
// The warmth ceiling and the Clay–danger CIE76 floor are computed from
// this stylesheet. Font families are the two OD-G23 faces plus generic
// fallbacks, except the typeface library's own stylesheet, whose families
// are admitted and asserted both ways against lib/typeface/registry.ts.
// No other stylesheet may name a library family. The z-index layer list
// is still asserted both ways.
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
const LIBRARY_STYLESHEET = "lib/typeface/library.module.css";
const LIBRARY_REGISTRY = "lib/typeface/registry.ts";
const LIBRARY_DIR = "public/fonts/library";
const SCAN_ROOTS = ["app", "components", "features"];
const MINIMUM_LIBRARY_FAMILIES = 11;
const MINIMUM_LIBRARY_FILES = 19;

const MINIMUM_TOKENS = 271;
const MINIMUM_FONT_FAMILIES = 38;
const MINIMUM_CLOSED_COLOURS = 35;
const MINIMUM_PROOF_CHANNELS = 6;
const MINIMUM_CHROMA = 20;
const MINIMUM_DELTA = 6;
// P03-T12 — measured after DateField, FileDrop and DataTable.
// P03-T13 — quiet fill is transparent, and the gallery is scanned: 1205 declarations, 89 sources.
// P03-T19 — the typeface library stylesheet is scanned: 31 stylesheets, 1597 declarations, 38 font families, 109 sources.
// P03-T21 measured 113 sources after the error boundaries and the probe.
const MINIMUM_STYLESHEETS = 31;
const MINIMUM_DECLARATIONS = 1597;
const MINIMUM_SOURCES = 113;

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

function sectionSlice(markdown, startMark, endMark) {
  const start = markdown.indexOf(startMark);
  const end = markdown.indexOf(endMark, start + 1);
  if (start < 0 || end < 0) return null;
  return markdown.slice(start, end);
}

function documentColourTokens(markdown) {
  const colour = sectionSlice(markdown, "### 2.2", "### 2.3");
  const dimensions = sectionSlice(markdown, "### 2.11", "\n## 3");
  if (!colour || !dimensions) {
    return { error: "DESIGN_SURFACE.md is missing §2.2 or §2.11" };
  }
  const names = new Set();
  for (const slice of [colour, dimensions]) {
    for (const match of slice.matchAll(/--b2s-color-[a-z0-9-]+/g)) {
      names.add(match[0]);
    }
  }
  return { names };
}

function linearChannel(channel) {
  const s = channel / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function labOf(channels) {
  const [r, g, b] = channels.map(linearChannel);
  const x = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047;
  const y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
  const z = (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / 1.08883;
  const f = (t) => (t > (6 / 29) ** 3 ? t ** (1 / 3) : t / (3 * (6 / 29) ** 2) + 4 / 29);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}

function chromaOf(channels) {
  const [, a, b] = labOf(channels);
  return Math.sqrt(a * a + b * b);
}

function deltaEOf(left, right) {
  const a = labOf(left);
  const b = labOf(right);
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

function channelsOf(value) {
  if (!value) return null;
  const hex = value.match(/#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/);
  if (hex) return hexChannels(hex[0]);
  const rgb = value.match(/rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  return null;
}

function propsOf(body) {
  const map = new Map();
  for (const decl of declarations(body)) {
    if (decl.prop.startsWith("--")) map.set(decl.prop, decl.value);
  }
  return map;
}

function themesOf(css) {
  const light = new Map();
  const dark = new Map();
  for (const block of splitTop(css)) {
    if (block.prelude === ":root" || block.prelude === ':root[data-theme="light"]') {
      for (const [name, value] of propsOf(block.body)) light.set(name, value);
    }
    if (block.prelude.includes("prefers-color-scheme: dark")) {
      for (const inner of splitTop(block.body)) {
        if (inner.prelude.includes(":root")) {
          for (const [name, value] of propsOf(inner.body)) dark.set(name, value);
        }
      }
    }
    if (block.prelude === ':root[data-theme="dark"]') {
      for (const [name, value] of propsOf(block.body)) dark.set(name, value);
    }
  }
  return [
    { name: "light", values: light },
    { name: "dark", values: dark },
  ];
}

export function colourViolations(decls) {
  const messages = [];
  let fontFamilies = 0;
  for (const decl of decls) {
    if (!decl.prop.startsWith("--b2s-")) {
      if (decl.prop === "font-family") fontFamilies += 1;
      continue;
    }
    if (decl.prop === "--b2s-font-family") fontFamilies += 1;
    const parsed = coloursIn(decl.value);
    if (parsed.error) {
      messages.push(`${decl.prop} has a colour that could not be parsed (${parsed.error})`);
    }
  }
  if (fontFamilies < MINIMUM_FONT_FAMILIES) {
    messages.push(`${fontFamilies} font-family declaration(s), minimum ${MINIMUM_FONT_FAMILIES}`);
  }
  return { messages, fontFamilies };
}

export function identityViolations(markdown, css) {
  const messages = [];
  const documented = documentColourTokens(markdown);
  const themes = themesOf(stripComments(css));
  if (documented.error) {
    messages.push(documented.error);
    return { messages, closed: 0, proof: 0, chromaChecked: 0, deltaChecked: 0 };
  }
  const styled = new Set();
  for (const theme of themes) {
    for (const name of theme.values.keys()) {
      if (name.startsWith("--b2s-color-")) styled.add(name);
    }
  }
  for (const token of styled) {
    if (!documented.names.has(token)) {
      messages.push(`${token} is defined in ${GLOBALS} and DESIGN_SURFACE.md §2.2 and §2.11 do not name it`);
    }
  }
  for (const token of documented.names) {
    if (!styled.has(token)) {
      messages.push(`${token} is named in DESIGN_SURFACE.md §2.2 or §2.11 and ${GLOBALS} does not define it`);
    }
  }
  let proof = 0;
  for (const theme of themes) {
    for (const token of ["--b2s-color-proof", "--b2s-color-proof-edge", "--b2s-color-proof-text"]) {
      const value = theme.values.get(token);
      const channels = value ? channelsOf(value) : null;
      if (!channels) {
        messages.push(`${token} has no colour in ${theme.name}`);
        continue;
      }
      proof += 1;
      if (!(channels[0] === channels[1] && channels[1] === channels[2])) {
        messages.push(`${token} is tinted in ${theme.name} (${value})`);
      }
    }
  }
  const colour = sectionSlice(markdown, "### 2.2", "### 2.3") ?? "";
  const neutralSection = colour.split("**Neutrals.**")[1]?.split("**Clay")[0] ?? "";
  const neutrals = [];
  for (const line of neutralSection.split("\n")) {
    if (!line.startsWith("|")) continue;
    for (const token of line.match(/--b2s-color-([a-z0-9-]+)/g) ?? []) {
      neutrals.push(token.slice("--b2s-color-".length));
    }
  }
  const warm = colour.match(/`([^`]+)`, `([^`]+)`, `([^`]+)` and `([^`]+)` stay at or below \*\*(\d+)\*\*[\s\S]*?every other neutral at or below \*\*(\d+)\*\*/);
  let chromaChecked = 0;
  if (!warm || neutrals.length === 0) {
    messages.push("DESIGN_SURFACE.md §2.2 does not state the warmth ceiling");
  } else {
    const large = new Set([warm[1], warm[2], warm[3], warm[4]]);
    const largeCeiling = Number(warm[5]);
    const otherCeiling = Number(warm[6]);
    for (const name of neutrals) {
      for (const theme of themes) {
        const channels = channelsOf(theme.values.get(`--b2s-color-${name}`));
        if (!channels) {
          messages.push(`--b2s-color-${name} has no colour in ${theme.name}`);
          continue;
        }
        chromaChecked += 1;
        const ceiling = large.has(name) ? largeCeiling : otherCeiling;
        const measured = chromaOf(channels);
        if (measured > ceiling + 1e-9) {
          messages.push(`--b2s-color-${name} chroma ${measured.toFixed(2)} in ${theme.name} is above ${ceiling}`);
        }
      }
    }
  }
  const danger = colour.match(/Danger is not Clay\.[\s\S]*?at least (\d+)/);
  const pairs = danger ? [...danger[0].matchAll(/`([a-z0-9-]+)` against `([a-z0-9-]+)`/g)] : [];
  let deltaChecked = 0;
  if (!danger || pairs.length === 0) {
    messages.push("DESIGN_SURFACE.md §2.2 does not state the Clay–danger floor");
  } else {
    const floor = Number(danger[1]);
    for (const match of pairs) {
      for (const theme of themes) {
        const left = channelsOf(theme.values.get(`--b2s-color-${match[1]}`));
        const right = channelsOf(theme.values.get(`--b2s-color-${match[2]}`));
        if (!left || !right) {
          messages.push(`${match[1]} against ${match[2]} has no colour in ${theme.name}`);
          continue;
        }
        deltaChecked += 1;
        const measured = deltaEOf(left, right);
        if (measured + 1e-9 < floor) {
          messages.push(`${match[1]} against ${match[2]} is ΔE ${measured.toFixed(2)} in ${theme.name}, minimum ${floor}`);
        }
      }
    }
  }
  if (documented.names.size < MINIMUM_CLOSED_COLOURS) {
    messages.push(`${documented.names.size} colour token(s) in §2.2 and §2.11, minimum ${MINIMUM_CLOSED_COLOURS}`);
  }
  if (proof < MINIMUM_PROOF_CHANNELS) {
    messages.push(`${proof} proof channel check(s), minimum ${MINIMUM_PROOF_CHANNELS}`);
  }
  if (chromaChecked < MINIMUM_CHROMA) {
    messages.push(`${chromaChecked} chroma check(s), minimum ${MINIMUM_CHROMA}`);
  }
  if (deltaChecked < MINIMUM_DELTA) {
    messages.push(`${deltaChecked} ΔE check(s), minimum ${MINIMUM_DELTA}`);
  }
  return { messages, closed: documented.names.size, proof, chromaChecked, deltaChecked };
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

function fontViolations(prop, value, fontFace, libraryStylesheet) {
  const messages = [];
  const admitLibraryFace = libraryStylesheet && fontFace && prop === "font-family";
  if (!admitLibraryFace && (prop === "--b2s-font-family" || (prop === "font-family" && !fontFace))) {
    for (const name of familiesIn(value)) {
      if (name.startsWith("var(") || WIDE.has(name.toLowerCase())) {
        continue;
      }
      if (!FAMILIES.has(name) && !GENERICS.has(name)) {
        messages.push(`font family ${name} is outside OD-G23`);
      }
    }
  }
  if (!admitLibraryFace && fontFace && prop === "font-family") {
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
  const libraryStylesheet = rel === LIBRARY_STYLESHEET;
  let tokens = 0;
  decls.forEach((decl, index) => {
    if (decl.prop.startsWith("--")) {
      if (decl.prop.startsWith("--b2s-") && rel !== GLOBALS) {
        fail(`${rel}: a --b2s- custom property is defined only in ${GLOBALS} (${decl.prop})`);
      }
      if (rel === GLOBALS) {
        tokens += 1;
      }
      for (const message of fontViolations(decl.prop, decl.value, false, libraryStylesheet)) {
        fail(`${rel}: ${message}`);
      }
      return;
    }
    if (stylesheet && faces[index]) {
      for (const message of fontViolations(decl.prop, decl.value, true, libraryStylesheet)) {
        fail(`${rel}: ${message}`);
      }
      return;
    }
    const raw = rawViolation(decl.prop, decl.value);
    if (raw) {
      fail(`${rel}: ${raw}`);
    }
    for (const message of fontViolations(decl.prop, decl.value, false, libraryStylesheet)) {
      fail(`${rel}: ${message}`);
    }
  });
  return { decls, tokens };
}

function readLibraryRegistry(text) {
  const families = [];
  const pattern =
    /family:\s*"([^"]+)"[\s\S]*?script:\s*"(arabic|latin)"[\s\S]*?weights:\s*\[([^\]]*)\][\s\S]*?files:\s*\[([^\]]*)\]/g;
  for (const match of text.matchAll(pattern)) {
    families.push({
      family: match[1],
      script: match[2],
      weights: [...match[3].matchAll(/\d+/g)].map((item) => Number(item[0])),
      files: [...match[4].matchAll(/"([^"]+)"/g)].map((item) => item[1]),
    });
  }
  return families;
}

function readFontFaces(css) {
  const faces = [];
  const { decls, faces: flags } = collect(stripComments(css));
  let current = null;
  decls.forEach((decl, index) => {
    if (!flags[index]) {
      current = null;
      return;
    }
    if (decl.prop === "font-family") {
      current = { family: familiesIn(decl.value)[0], weights: [], files: [] };
      faces.push(current);
    }
    if (!current) {
      return;
    }
    if (decl.prop === "font-weight") {
      current.weights.push(...[...decl.value.matchAll(/\d+/g)].map((item) => Number(item[0])));
    }
    if (decl.prop === "src") {
      current.files.push(...[...decl.value.matchAll(/\/fonts\/library\/([^"')\s]+)/g)].map((item) => item[1]));
    }
  });
  return faces;
}

function assertLibrary(stylesheetTexts) {
  if (!existsSync(LIBRARY_REGISTRY)) {
    fail(`${LIBRARY_REGISTRY} is absent`);
    return;
  }
  if (!existsSync(LIBRARY_STYLESHEET)) {
    fail(`${LIBRARY_STYLESHEET} is absent`);
    return;
  }
  const registryText = readFileSync(LIBRARY_REGISTRY, "utf8");
  const cssText = readFileSync(LIBRARY_STYLESHEET, "utf8");
  if (!registryText.trim()) {
    fail(`${LIBRARY_REGISTRY} is empty`);
  }
  if (!cssText.trim()) {
    fail(`${LIBRARY_STYLESHEET} is empty`);
  }
  const registry = readLibraryRegistry(registryText);
  const faces = readFontFaces(cssText);
  if (registry.length < MINIMUM_LIBRARY_FAMILIES) {
    fail(`${registry.length} library famil${registry.length === 1 ? "y" : "ies"}, minimum ${MINIMUM_LIBRARY_FAMILIES}`);
  }
  const registryNames = new Set(registry.map((item) => item.family));
  const faceNames = new Set(faces.map((item) => item.family).filter(Boolean));
  for (const name of registryNames) {
    if (!faceNames.has(name)) {
      fail(`library family ${name} has no @font-face rule`);
    }
  }
  for (const name of faceNames) {
    if (!registryNames.has(name)) {
      fail(`@font-face family ${name} is not in the typeface registry`);
    }
  }
  const registryFiles = new Set(registry.flatMap((item) => item.files));
  const faceFiles = new Set(faces.flatMap((item) => item.files));
  if (registryFiles.size < MINIMUM_LIBRARY_FILES) {
    fail(`${registryFiles.size} library file(s), minimum ${MINIMUM_LIBRARY_FILES}`);
  }
  for (const file of registryFiles) {
    if (!faceFiles.has(file)) {
      fail(`library file ${file} has no @font-face src`);
    }
    if (!existsSync(join(LIBRARY_DIR, file))) {
      fail(`library file ${file} is not in ${LIBRARY_DIR}`);
    }
  }
  for (const file of faceFiles) {
    if (!registryFiles.has(file)) {
      fail(`@font-face src ${file} is not in the typeface registry`);
    }
  }
  for (const entry of registry) {
    const covered = new Set(
      faces.filter((face) => face.family === entry.family).flatMap((face) => face.weights),
    );
    for (const weight of entry.weights) {
      if (!covered.has(weight)) {
        fail(`library family ${entry.family} does not cover weight ${weight}`);
      }
    }
  }
  for (const [rel, text] of stylesheetTexts) {
    if (rel === LIBRARY_STYLESHEET) {
      continue;
    }
    const { decls } = collect(stripComments(text));
    for (const decl of decls) {
      if (decl.prop !== "font-family" && decl.prop !== "--b2s-font-family") {
        continue;
      }
      for (const name of familiesIn(decl.value)) {
        if (registryNames.has(name)) {
          fail(`${rel} names library family ${name}`);
        }
      }
    }
  }
}

function main() {
  let documentText;
  try {
    documentText = readFileSync(DOCUMENT, "utf8");
  } catch (err) {
    fail(`${DOCUMENT}: ${err.message}`);
    process.exit(1);
  }
  let globalsText;
  try {
    globalsText = readFileSync(GLOBALS, "utf8");
  } catch (err) {
    fail(`${GLOBALS}: ${err.message}`);
    process.exit(1);
  }
  const identity = identityViolations(documentText, globalsText);
  for (const message of identity.messages) {
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
  if (!stylesheets.includes(LIBRARY_STYLESHEET)) {
    stylesheets.push(LIBRARY_STYLESHEET);
  }

  const decls = [];
  const stylesheetTexts = [];
  let tokens = 0;
  for (const rel of stylesheets) {
    let text = "";
    try {
      text = readFileSync(rel, "utf8");
    } catch (err) {
      fail(`${rel}: ${err.message}`);
      continue;
    }
    stylesheetTexts.push([rel, text]);
    const examined = examine(rel, text, true);
    decls.push(...examined.decls);
    tokens += examined.tokens;
  }
  assertLibrary(stylesheetTexts);
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

  const colour = colourViolations(decls);
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
    `OK: token values stay inside definitions; ${stylesheets.length} stylesheet(s) scanned, minimum ${MINIMUM_STYLESHEETS}; ${decls.length} declaration(s) examined, minimum ${MINIMUM_DECLARATIONS}; ${tokens} token(s), minimum ${MINIMUM_TOKENS}; ${identity.closed} colour token(s) closed against section 2.2 and 2.11, minimum ${MINIMUM_CLOSED_COLOURS}; ${identity.proof} proof channel check(s), minimum ${MINIMUM_PROOF_CHANNELS}; ${identity.chromaChecked} chroma check(s), minimum ${MINIMUM_CHROMA}; ${identity.deltaChecked} Clay-danger check(s), minimum ${MINIMUM_DELTA}; ${colour.fontFamilies} font-family declaration(s), minimum ${MINIMUM_FONT_FAMILIES}; the closed chromatic list is removed; ${sources.length} source file(s) scanned, minimum ${MINIMUM_SOURCES}`,
  );
}

if (process.env.B2S_CHECK_IMPORT !== "1") {
  main();
}
