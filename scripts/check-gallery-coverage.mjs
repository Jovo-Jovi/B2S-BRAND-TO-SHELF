#!/usr/bin/env node
// The browser tier's completeness guard. The expected matrix — every
// primitive, every enforced state, both themes, both locales, both widths —
// is derived from the component blocks and from DESIGN_SURFACE.md §2.9, and
// the gallery's coverage list must equal it both ways. A new primitive or
// state that the gallery does not render fails here, before the browser job.

import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { enforcedStates, loadCatalog, MINIMUM_BLOCKS, MINIMUM_ENFORCED_STATES, MINIMUM_IMPLEMENTED } from "./component-blocks.mjs";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const COVERAGE = join(ROOT, "app", "[locale]", "(public)", "gallery", "coverage.ts");
const GALLERY = join(ROOT, "app", "[locale]", "(public)", "gallery", "gallery.tsx");
const SPEC = join(ROOT, "__tests__", "browser", "gallery.spec.ts");
const SURFACE = join(ROOT, "docs", "product", "DESIGN_SURFACE.md");

const MINIMUM_THEMES = 2;
const MINIMUM_LOCALES = 2;
const MINIMUM_WIDTHS = 2;

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function readText(path, label) {
  if (!existsSync(path)) {
    fail(`${label} does not exist, so the gallery matrix cannot be checked (PR-27)`);
  }
  const stats = statSync(path);
  if (!stats.isFile() || stats.size === 0) {
    fail(`${label} is empty, so the gallery matrix cannot be checked (PR-27)`);
  }
  return readFileSync(path, "utf8");
}

function bracketStrings(source, exportName) {
  const match = source.match(new RegExp(`export const ${exportName} = \\[([^\\]]*)\\]`));
  if (!match) return [];
  return [...match[1].matchAll(/"([^"]+)"/g)].map((item) => item[1]);
}

function bracketNumbers(source, exportName) {
  const match = source.match(new RegExp(`export const ${exportName} = \\[([^\\]]*)\\]`));
  if (!match) return [];
  return [...match[1].matchAll(/\d+/g)].map((item) => Number(item[0]));
}

function main() {
  const catalog = loadCatalog();
  if (catalog.specMissing || catalog.specUnreadable) {
    fail("docs/product/DESIGN_SURFACE.md does not exist, so there are no component blocks to cover (PR-27)");
  }
  if (catalog.blocks.length < MINIMUM_BLOCKS) {
    fail(`${catalog.blocks.length} component block(s), minimum ${MINIMUM_BLOCKS}`);
  }
  if (catalog.implementations.length < MINIMUM_IMPLEMENTED) {
    fail(`${catalog.implementations.length} primitive(s) implemented, minimum ${MINIMUM_IMPLEMENTED}`);
  }

  const required = [];
  for (const block of catalog.blocks) {
    for (const state of enforcedStates(block)) {
      required.push(`${block.name}/${state}`);
    }
  }
  if (required.length < MINIMUM_ENFORCED_STATES) {
    fail(`${required.length} enforced state(s), minimum ${MINIMUM_ENFORCED_STATES}`);
  }

  const coverageSource = readText(COVERAGE, "gallery coverage");
  const matrix = coverageSource.match(/export const GALLERY_COVERAGE = \[([\s\S]*?)\];/);
  const pairs = matrix
    ? [...matrix[1].matchAll(/\["([A-Za-z]+)", "([A-Za-z0-9_]+)"\]/g)].map((item) => `${item[1]}/${item[2]}`)
    : [];
  const themes = bracketStrings(coverageSource, "GALLERY_THEMES");
  const locales = bracketStrings(coverageSource, "GALLERY_LOCALES");
  const widths = bracketNumbers(coverageSource, "GALLERY_WIDTHS");

  if (pairs.length < MINIMUM_ENFORCED_STATES) {
    fail(`${pairs.length} gallery pair(s), minimum ${MINIMUM_ENFORCED_STATES}`);
  }
  if (themes.length < MINIMUM_THEMES) {
    fail(`${themes.length} theme(s), minimum ${MINIMUM_THEMES}`);
  }
  if (locales.length < MINIMUM_LOCALES) {
    fail(`${locales.length} locale(s), minimum ${MINIMUM_LOCALES}`);
  }
  if (widths.length < MINIMUM_WIDTHS) {
    fail(`${widths.length} width(s), minimum ${MINIMUM_WIDTHS}`);
  }

  const surface = readText(SURFACE, "DESIGN_SURFACE.md");
  const xl = surface.match(/`xl`\s+(\d+)px/);
  if (!xl) {
    fail("DESIGN_SURFACE.md §2.9 does not state an xl breakpoint, so desktop width is unknown (PR-44)");
  }
  const desktop = Number(xl[1]);
  if (!widths.includes(360) || !widths.includes(desktop)) {
    fail(`gallery widths ${widths.join(",")} do not include 360 and the xl breakpoint ${desktop}`);
  }
  if (themes.join(",") !== "light,dark") {
    fail(`gallery themes are ${themes.join(",")}; the catalog's two themes are light and dark`);
  }
  if (locales.join(",") !== "en,ar") {
    fail(`gallery locales are ${locales.join(",")}; the catalog's two locales are en and ar`);
  }

  const requiredSet = new Set(required);
  const coveredSet = new Set(pairs);
  const missing = required.filter((pair) => !coveredSet.has(pair));
  const extra = pairs.filter((pair) => !requiredSet.has(pair));
  if (missing.length > 0 || extra.length > 0) {
    fail(
      `gallery coverage is not the enforced matrix; missing ${missing.join(",") || "(none)"}; extra ${extra.join(",") || "(none)"}`,
    );
  }

  const gallery = readText(GALLERY, "gallery renderer");
  const unrendered = [...new Set(pairs.map((pair) => pair.split("/")[0]))].filter(
    (name) => !gallery.includes(`case "${name}":`),
  );
  if (unrendered.length > 0) {
    fail(`gallery renderer has no case for ${unrendered.join(",")}`);
  }
  if (!gallery.includes("<main>") || !gallery.includes("<h1>")) {
    fail("the gallery is not a page: it needs one main landmark and one h1 (CF-196)");
  }

  const spec = readText(SPEC, "browser tier spec");
  for (const token of ["GALLERY_THEMES", "GALLERY_LOCALES", "GALLERY_WIDTHS", "GALLERY_COVERAGE"]) {
    if (!spec.includes(token)) {
      fail(`the browser tier spec does not visit ${token}`);
    }
  }

  const primitives = new Set(pairs.map((pair) => pair.split("/")[0])).size;
  if (primitives < MINIMUM_IMPLEMENTED) {
    fail(`${primitives} primitive(s) in the gallery, minimum ${MINIMUM_IMPLEMENTED}`);
  }

  console.log(
    `OK: gallery covers ${pairs.length} enforced state(s), minimum ${MINIMUM_ENFORCED_STATES}, ` +
      `across ${primitives} primitive(s), minimum ${MINIMUM_IMPLEMENTED}; ` +
      `${themes.length} theme(s), minimum ${MINIMUM_THEMES}; ` +
      `${locales.length} locale(s), minimum ${MINIMUM_LOCALES}; ` +
      `${widths.length} width(s) including 360 and xl ${desktop}, minimum ${MINIMUM_WIDTHS}`,
  );
}

main();
