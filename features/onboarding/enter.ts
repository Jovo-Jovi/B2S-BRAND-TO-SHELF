import "server-only";

import { getDictionary, hasLocale, type Locale } from "@/app/[locale]/dictionaries";

import { resolveOnboarding } from "./resolve";
import type { GateDecision, RequestedScreen } from "./types";

export function themeFrom(raw: string | string[] | undefined): "light" | "dark" | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === "light" || value === "dark") return value;
  return null;
}

export async function enter(
  localeRaw: string,
  requested: RequestedScreen,
  themeRaw: string | string[] | undefined,
): Promise<{ locale: Locale; decision: GateDecision; copy: Awaited<ReturnType<typeof getDictionary>>["onboarding"]; theme: "light" | "dark" | null } | null> {
  if (!hasLocale(localeRaw)) return null;
  const dictionary = await getDictionary(localeRaw);
  const decision = await resolveOnboarding(localeRaw, requested);
  return { locale: localeRaw, decision, copy: dictionary.onboarding, theme: themeFrom(themeRaw) };
}
