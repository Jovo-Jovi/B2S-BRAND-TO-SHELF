// The application's list of what onboarding still needs.
// complete_onboarding is the authority (DATA_MODEL.md §3.24). These strings
// are that function's rule names, in its order, so the two can be compared.

import { COLOUR_ROLES, type ColourRole } from "./types";
import { contrastRatio, FOREGROUND_CONTRAST_MINIMUM } from "@/lib/colour/contrast";

export const PERMITTED_LOCALES = ["en", "ar"] as const;
export type PermittedLocale = (typeof PERMITTED_LOCALES)[number];

export type LocaleText = Record<PermittedLocale, string>;

export type CompletenessTheme = {
  name: LocaleText;
  isDefault: boolean;
  colours: Partial<Record<ColourRole, string>>;
};

export type CompletenessInput = {
  brandName: LocaleText;
  themes: CompletenessTheme[];
  guidelines: { title: LocaleText; body: LocaleText }[];
  lineNames: LocaleText[];
  logoReady: boolean;
  typefaces: { role: string; script: string }[];
  legalName: LocaleText;
  registeredAddress: LocaleText;
};

const TYPEFACE_PAIRS = [
  ["heading", "latin"],
  ["heading", "arabic"],
  ["body", "latin"],
  ["body", "arabic"],
] as const;

const HEX = /^#[0-9a-f]{6}$/;

function filled(value: string | undefined): boolean {
  return Boolean(value && value.trim() !== "");
}

function missingLocales(label: string, text: LocaleText, gaps: string[]): void {
  for (const locale of PERMITTED_LOCALES) {
    if (!filled(text[locale])) gaps.push(`${label} missing locale ${locale}`);
  }
}

export function completenessGaps(input: CompletenessInput): string[] {
  const gaps: string[] = [];
  missingLocales("brand name", input.brandName, gaps);
  for (const theme of input.themes) missingLocales("theme name", theme.name, gaps);
  for (const guideline of input.guidelines) missingLocales("guideline title", guideline.title, gaps);
  for (const guideline of input.guidelines) missingLocales("guideline body", guideline.body, gaps);
  for (const line of input.lineNames) missingLocales("line name", line, gaps);

  const defaults = input.themes.filter((theme) => theme.isDefault).length;
  if (defaults !== 1) gaps.push(`default theme count is ${defaults}, expected 1`);

  for (const theme of input.themes) {
    for (const role of COLOUR_ROLES) {
      if (!theme.colours[role]) gaps.push(`color role ${role}`);
    }
    const foreground = theme.colours.foreground;
    const background = theme.colours.background;
    if (!foreground || !background || !HEX.test(foreground) || !HEX.test(background)) {
      gaps.push("foreground contrast against background: a colour is missing");
    } else if (contrastRatio(foreground, background) < FOREGROUND_CONTRAST_MINIMUM) {
      gaps.push("foreground contrast against background is below 4.5:1");
    }
  }

  if (!input.logoReady) gaps.push("logo variant missing");

  for (const [role, script] of TYPEFACE_PAIRS) {
    const present = input.typefaces.some((face) => face.role === role && face.script === script);
    if (!present) gaps.push(`typeface missing ${role}/${script}`);
  }

  for (const locale of PERMITTED_LOCALES) {
    if (!filled(input.legalName[locale])) gaps.push(`legal name missing locale ${locale}`);
    if (!filled(input.registeredAddress[locale])) gaps.push(`registered address missing locale ${locale}`);
  }

  return gaps;
}

export function rulesFromCompleteError(message: string): string[] | null {
  const marker = "onboarding incomplete: ";
  const at = message.indexOf(marker);
  if (at < 0) return null;
  return message
    .slice(at + marker.length)
    .split("; ")
    .map((rule) => rule.trim())
    .filter((rule) => rule.length > 0);
}

const EMPTY: LocaleText = { en: "", ar: "" };

export function emptyCompleteness(): CompletenessInput {
  return {
    brandName: { ...EMPTY },
    themes: [],
    guidelines: [],
    lineNames: [],
    logoReady: false,
    typefaces: [],
    legalName: { ...EMPTY },
    registeredAddress: { ...EMPTY },
  };
}
