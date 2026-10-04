"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import { themedHref } from "./destination";
import { provisionRefusal } from "./provision-error";
import { brandSchema, isHex, logoUploadSchema, repairSchema, typographySchema, welcomeSchema } from "./schema";
import type { ColourValues } from "./types";
import { COLOUR_ROLES } from "./types";
import {
  latestProfileId,
  openDraftAtBrand,
  saveName,
  saveThemeIfComplete,
  setResume,
  storeLogoVariant,
  upsertTypefaces,
  writeDraftColours,
  writeStartingColours,
} from "./writes";

export type ActionResult = { gaps: string[]; notice: "saved" | null };

function coloursFrom(data: {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  critical: string;
}): ColourValues {
  return {
    primary: data.primary,
    secondary: data.secondary,
    accent: data.accent,
    background: data.background,
    foreground: data.foreground,
    muted: data.muted,
    critical: data.critical,
  };
}

function go(path: string, theme: "light" | "dark" | undefined): never {
  redirect(themedHref(path, theme));
}

function brandGaps(nameEn: string, nameAr: string, colours: ColourValues): string[] {
  const gaps: string[] = [];
  if (!nameEn.trim()) gaps.push("name-en");
  if (!nameAr.trim()) gaps.push("name-ar");
  for (const role of COLOUR_ROLES) {
    if (!isHex(colours[role])) gaps.push(`role-${role}`);
  }
  return gaps;
}

export async function submitWelcome(input: unknown): Promise<ActionResult> {
  const parsed = welcomeSchema.safeParse(input);
  if (!parsed.success) return { gaps: ["refused"], notice: null };

  const { locale, businessLocale, currency, name, theme } = parsed.data;
  const supabase = await createSupabaseServerClient();
  const tenant = await supabase.rpc("current_tenant_id");
  if (tenant.data) {
    go(`/${locale}/onboarding`, theme);
  }
  if (!name.trim()) return { gaps: ["name"], notice: null };

  const provisioned = await supabase.rpc("provision_tenant", {
    p_name: name.trim(),
    p_base_currency: currency,
    p_default_locale: businessLocale,
  });
  if (provisioned.error) {
    return { gaps: [provisionRefusal(provisioned.error.message)], notice: null };
  }

  const draftId = await openDraftAtBrand(supabase);
  if (draftId) await writeStartingColours(supabase, draftId);
  go(`/${locale}/onboarding/brand`, theme);
}

export async function repairOnboardingDraft(input: unknown): Promise<void> {
  const parsed = repairSchema.safeParse(input);
  if (!parsed.success) return;

  const supabase = await createSupabaseServerClient();
  const brand = await supabase.from("brand").select("current_profile_id").maybeSingle();
  if (brand.data?.current_profile_id) return;
  const draftId = await openDraftAtBrand(supabase);
  if (draftId) await writeStartingColours(supabase, draftId);
}

export async function submitBrand(input: unknown): Promise<ActionResult> {
  const parsed = brandSchema.safeParse(input);
  if (!parsed.success) return { gaps: ["refused"], notice: null };

  const { locale, intent, step, nameEn, nameAr, theme } = parsed.data;
  const colours = coloursFrom(parsed.data);
  const supabase = await createSupabaseServerClient();
  const draft = await supabase.from("onboarding_draft").select("id, archived_at").maybeSingle();
  const draftId = draft.data && !draft.data.archived_at ? draft.data.id : null;

  const profileFromName = await saveName(supabase, nameEn, nameAr);
  const profileId = profileFromName ?? (await latestProfileId(supabase));
  if (draftId) await writeDraftColours(supabase, draftId, colours);
  await saveThemeIfComplete(supabase, profileId, colours);

  if (intent === "continue") {
    const gaps = brandGaps(nameEn, nameAr, colours);
    if (gaps.length > 0) return { gaps, notice: null };
    await setResume(supabase, "typography");
    go(`/${locale}/onboarding/typography`, theme);
  }
  if (intent === "back") {
    go(`/${locale}/onboarding/welcome`, theme);
  }
  if (intent === "step" && step) {
    go(`/${locale}/onboarding/${step}`, theme);
  }
  return { gaps: [], notice: "saved" };
}

export async function submitTypography(input: unknown): Promise<ActionResult> {
  const parsed = typographySchema.safeParse(input);
  if (!parsed.success) return { gaps: ["refused"], notice: null };

  const { locale, intent, step, headingArabic, bodyArabic, headingLatin, bodyLatin, theme } = parsed.data;
  const faces = { headingArabic, bodyArabic, headingLatin, bodyLatin };
  const supabase = await createSupabaseServerClient();
  const profileId = await latestProfileId(supabase);
  if (profileId) await upsertTypefaces(supabase, profileId, faces);

  const missing = [
    ["heading-arabic", headingArabic],
    ["body-arabic", bodyArabic],
    ["heading-latin", headingLatin],
    ["body-latin", bodyLatin],
  ].filter((pair) => !pair[1].trim()).map((pair) => pair[0]);

  if (intent === "continue") {
    if (missing.length > 0) return { gaps: missing, notice: null };
    await setResume(supabase, "company");
    go(`/${locale}/onboarding/company`, theme);
  }
  if (intent === "back") {
    go(`/${locale}/onboarding/brand`, theme);
  }
  if (intent === "step" && step) {
    go(`/${locale}/onboarding/${step}`, theme);
  }
  return { gaps: [], notice: "saved" };
}

export async function uploadLogo(input: unknown): Promise<{ error: string | null; url: string | null; ground: "light" | "dark" | null }> {
  const parsed = logoUploadSchema.safeParse(input);
  if (!parsed.success) return { error: "type", url: null, ground: null };

  const supabase = await createSupabaseServerClient();
  if (parsed.data.nameEn.trim() || parsed.data.nameAr.trim()) {
    await saveName(supabase, parsed.data.nameEn, parsed.data.nameAr);
  }
  const bytes = new Uint8Array(await parsed.data.file.arrayBuffer());
  const stored = await storeLogoVariant(supabase, parsed.data.ground, parsed.data.filename, bytes);
  return { error: stored.error, url: stored.url, ground: parsed.data.ground };
}
