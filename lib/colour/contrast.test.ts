import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { formatContrastRatio } from "../locale/format-number";
import { contrastHex } from "../../scripts/check-contrast.mjs";
import { contrastRatio } from "./contrast";

type Pair = {
  foreground: string;
  background: string;
  theme: "light" | "dark";
  expected: string;
};

function tokenHexes(markdown: string): Map<string, { light: string; dark: string }> {
  const start = markdown.indexOf("### 2.2");
  const end = markdown.indexOf("### 2.3", start);
  const table = markdown.slice(start, end);
  const found = new Map<string, { light: string; dark: string }>();
  for (const line of table.split("\n")) {
    if (!line.startsWith("| `--b2s-color-")) {
      continue;
    }
    const cells = line.split("|").map((cell) => cell.trim());
    const names = cells[1].match(/--b2s-color-[a-z0-9-]+/g) ?? [];
    const light = cells[2].match(/#[0-9a-fA-F]{6}/g) ?? [];
    const dark = cells[3].match(/#[0-9a-fA-F]{6}/g) ?? [];
    names.forEach((name, index) => {
      if (light[index] && dark[index]) {
        found.set(name.replace("--b2s-color-", ""), { light: light[index], dark: dark[index] });
      }
    });
  }
  return found;
}

function digitsIn(cell: string): string | null {
  const match = cell.match(/[\d]+\.[\d]+/);
  return match ? match[0] : null;
}

function tokenName(label: string): string {
  return label.replace(/\s*\([^)]*\)/g, "").trim();
}

function hexesFor(
  name: string,
  markdown: string,
  hexes: Map<string, { light: string; dark: string }>,
): { light: string; dark: string } | undefined {
  const known = hexes.get(name);
  if (known) {
    return known;
  }
  const needle = `--b2s-color-${name}`;
  for (const line of markdown.split("\n")) {
    if (!line.includes(needle)) {
      continue;
    }
    const marked = [...line.matchAll(/#([0-9a-fA-F]{6})[^#]*?\b(light|dark)\b/g)];
    const light = marked.find((match) => match[2] === "light");
    const dark = marked.find((match) => match[2] === "dark");
    if (light && dark) {
      return { light: `#${light[1]}`, dark: `#${dark[1]}` };
    }
  }
  return undefined;
}

function pairsFrom(markdown: string, hexes: Map<string, { light: string; dark: string }>): Pair[] {
  const start = markdown.indexOf("| Pair |");
  const end = markdown.indexOf("A control's boundary", start);
  const pairs: Pair[] = [];
  for (const line of markdown.slice(start, end).split("\n")) {
    if (!line.startsWith("| ") || line.startsWith("| Pair") || line.startsWith("|---")) {
      continue;
    }
    const cells = line.split("|").map((cell) => cell.trim());
    const label = cells[1];
    const lightCell = cells[2];
    const darkCell = cells[3];
    const labelled = label.match(/^(.+?) on (.+)$/);
    if (labelled) {
      const foreground = tokenName(labelled[1]);
      const background = tokenName(labelled[2]);
      const light = digitsIn(lightCell);
      const dark = digitsIn(darkCell);
      if (light === null || dark === null) {
        continue;
      }
      pairs.push({ foreground, background, theme: "light", expected: light });
      pairs.push({ foreground, background, theme: "dark", expected: dark });
      continue;
    }
    const lightOn = lightCell.match(/^([\d.]+) on (\S+)$/);
    const darkOn = darkCell.match(/^([\d.]+) on (\S+)$/);
    if (!lightOn || !darkOn) {
      continue;
    }
    const foreground = tokenName(label.split(",")[0]);
    pairs.push({ foreground, background: lightOn[2], theme: "light", expected: lightOn[1] });
    pairs.push({ foreground, background: darkOn[2], theme: "dark", expected: darkOn[1] });
  }
  return pairs.map((pair) => {
    const foreground = hexesFor(pair.foreground, markdown, hexes);
    const background = hexesFor(pair.background, markdown, hexes);
    if (!foreground || !background) {
      throw new Error(`contrast table names ${pair.foreground} on ${pair.background}, which the colour table does not`);
    }
    return {
      ...pair,
      foreground: pair.theme === "light" ? foreground.light : foreground.dark,
      background: pair.theme === "light" ? background.light : background.dark,
    };
  });
}

describe("contrast ratio", () => {
  const markdown = readFileSync("docs/product/DESIGN_SURFACE.md", "utf8");
  const pairs = pairsFrom(markdown, tokenHexes(markdown));

  it("agrees with check-contrast.mjs on every §2.2 contrast-table pair", () => {
    expect(pairs.length).toBeGreaterThan(0);
    for (const pair of pairs) {
      const here = contrastRatio(pair.foreground, pair.background);
      const gate = contrastHex(pair.foreground, pair.background);
      expect(here).toBe(gate);
      expect(formatContrastRatio(here, "en")).toBe(pair.expected);
      expect(formatContrastRatio(here, "ar")).toBe(pair.expected);
    }
  });
});
