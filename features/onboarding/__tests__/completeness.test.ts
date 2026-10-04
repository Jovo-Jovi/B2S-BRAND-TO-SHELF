import { describe, expect, it } from "vitest";

import catalog from "@/app/[locale]/dictionaries/en.json";

import { completenessGaps, emptyCompleteness, rulesFromCompleteError } from "../completeness";

const starting = catalog.onboarding;

describe("onboarding completeness rules", () => {
  it("names the same gaps a profile with only a brand name raises", () => {
    const input = emptyCompleteness();
    input.brandName = { en: "Northwind", ar: "Northwind" };
    const gaps = completenessGaps(input);
    expect(gaps).toContain("default theme count is 0, expected 1");
    expect(gaps).toContain("logo variant missing");
    expect(gaps).toContain("typeface missing heading/latin");
    expect(gaps).toContain("legal name missing locale en");
    expect(gaps).toContain("registered address missing locale ar");
    expect(gaps.some((gap) => gap.startsWith("brand name"))).toBe(false);
  });

  it("names a foreground that does not clear the background", () => {
    const input = emptyCompleteness();
    input.brandName = { en: "Northwind", ar: "Northwind" };
    input.legalName = { en: "Northwind LLC", ar: "Northwind LLC" };
    input.registeredAddress = { en: "1 Street", ar: "2 Street" };
    input.logoReady = true;
    input.typefaces = [
      { role: "heading", script: "latin" },
      { role: "heading", script: "arabic" },
      { role: "body", script: "latin" },
      { role: "body", script: "arabic" },
    ];
    input.themes = [
      {
        name: { en: "Main colours", ar: "Main colours" },
        isDefault: true,
        colours: {
          primary: starting.startingForeground,
          secondary: starting.startingForeground,
          accent: starting.startingForeground,
          background: starting.startingBackground,
          foreground: starting.startingBackground,
          muted: starting.startingMuted,
          critical: starting.startingCritical,
        },
      },
    ];
    const gaps = completenessGaps(input);
    expect(gaps).toContain("foreground contrast against background is below 4.5:1");
    expect(gaps).not.toContain("default theme count is 0, expected 1");
  });

  it("reads the raised rule list out of the completion error", () => {
    const message = "onboarding incomplete: logo variant missing; legal name missing locale en";
    expect(rulesFromCompleteError(message)).toEqual([
      "logo variant missing",
      "legal name missing locale en",
    ]);
    expect(rulesFromCompleteError("something else")).toBeNull();
  });
});
