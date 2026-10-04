import { fillPattern } from "@/lib/locale/format-number";

import { themedHref } from "./destination";
import type { LocaleCode } from "./types";
import type { OnboardingCopy } from "./components/copy";

function localeName(copy: OnboardingCopy, locale: string): string {
  return locale === "ar" ? copy.localeAr : copy.localeEn;
}

export function ruleMessage(rule: string, copy: OnboardingCopy): string {
  const locale = rule.match(/locale (en|ar)$/)?.[1];
  const named = locale ? localeName(copy, locale) : "";
  if (rule.startsWith("brand name missing")) return fillPattern(copy.ruleBrandName, { locale: named });
  if (rule.startsWith("theme name missing")) return fillPattern(copy.ruleThemeName, { locale: named });
  if (rule.startsWith("guideline title missing")) return fillPattern(copy.ruleGuidelineTitle, { locale: named });
  if (rule.startsWith("guideline body missing")) return fillPattern(copy.ruleGuidelineBody, { locale: named });
  if (rule.startsWith("line name missing")) return fillPattern(copy.ruleLineName, { locale: named });
  if (rule.startsWith("default theme count")) return copy.ruleDefaultTheme;
  if (rule.startsWith("color role ")) {
    const role = rule.slice("color role ".length);
    const caption =
      role === "primary"
        ? copy.rolePrimary
        : role === "secondary"
          ? copy.roleSecondary
          : role === "accent"
            ? copy.roleAccent
            : role === "background"
              ? copy.roleBackground
              : role === "foreground"
                ? copy.roleForeground
                : role === "muted"
                  ? copy.roleMuted
                  : copy.roleCritical;
    return fillPattern(copy.ruleColour, { role: caption });
  }
  if (rule.startsWith("foreground contrast") && rule.includes("missing")) return copy.ruleContrastMissing;
  if (rule.startsWith("foreground contrast")) return copy.ruleContrast;
  if (rule === "logo variant missing") return copy.ruleLogo;
  if (rule.startsWith("typeface missing ")) return fillPattern(copy.ruleTypeface, { pair: rule.slice("typeface missing ".length) });
  if (rule.startsWith("legal name missing")) return fillPattern(copy.ruleLegalName, { locale: named });
  if (rule.startsWith("registered address missing")) return fillPattern(copy.ruleAddress, { locale: named });
  return rule;
}

export function rulePath(rule: string): string {
  if (rule.startsWith("brand name missing locale en")) return "brand#name-en";
  if (rule.startsWith("brand name missing locale ar")) return "brand#name-ar";
  if (rule.startsWith("theme name") || rule.startsWith("default theme") || rule.startsWith("line name")) return "brand#role-primary";
  if (rule.startsWith("color role ")) return `brand#role-${rule.slice("color role ".length)}`;
  if (rule.startsWith("foreground contrast")) return "brand#role-foreground";
  if (rule === "logo variant missing") return "brand#logo-file";
  if (rule === "typeface missing heading/arabic") return "typography#heading-arabic";
  if (rule === "typeface missing body/arabic") return "typography#body-arabic";
  if (rule === "typeface missing heading/latin") return "typography#heading-latin";
  if (rule === "typeface missing body/latin") return "typography#body-latin";
  if (rule.startsWith("legal name missing locale en")) return "company#legal-name-en";
  if (rule.startsWith("legal name missing locale ar")) return "company#legal-name-ar";
  if (rule.startsWith("registered address missing locale en")) return "company#address-en";
  if (rule.startsWith("registered address missing locale ar")) return "company#address-ar";
  if (rule.startsWith("guideline")) return "guidelines#guidelines";
  return "review";
}

export function ruleHref(locale: LocaleCode, rule: string, theme: string | null): string {
  return themedHref(`/${locale}/onboarding/${rulePath(rule)}`, theme);
}
