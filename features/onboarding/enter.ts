import "server-only";

import { getDictionary, hasLocale, type Locale } from "@/app/[locale]/dictionaries";

import { resolveOnboarding } from "./resolve";
import type { GateDecision, RequestedScreen } from "./types";

export function themeFrom(raw: string | string[] | undefined): "light" | "dark" | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === "light" || value === "dark") return value;
  return null;
}

type OnboardingCopy = Awaited<ReturnType<typeof getDictionary>>["onboarding"];

export async function enter<T = null>(
  localeRaw: string,
  requested: RequestedScreen,
  themeRaw: string | string[] | undefined,
  load?: (copy: OnboardingCopy) => Promise<T>,
): Promise<{
  locale: Locale;
  decision: GateDecision;
  copy: OnboardingCopy;
  theme: "light" | "dark" | null;
  loaded: T;
} | null> {
  if (!hasLocale(localeRaw)) return null;
  const dictionary = await getDictionary(localeRaw);
  const copy = dictionary.onboarding;
  const [decision, loaded] = await Promise.all([
    resolveOnboarding(localeRaw, requested),
    load ? load(copy) : Promise.resolve(null as T),
  ]);
  return { locale: localeRaw, decision, copy, theme: themeFrom(themeRaw), loaded };
}
