"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import { emailStored, phoneStored, scalarToWrite, taxStored } from "./contact";
import { themedHref } from "./destination";
import { provisionRefusal } from "./provision-error";
import { readGuidelines, readLegal } from "./records";
import { rulesFromCompleteError } from "./completeness";
import { brandSchema, companySchema, guidelinesSchema, isHex, logoUploadSchema, repairSchema, reviewSchema, typographySchema, welcomeSchema } from "./schema";
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

export type SavedGuideline = {
  id: string;
  ordinal: number;
};

export type ActionResult = {
  gaps: string[];
  notice: "saved" | null;
  phone?: string;
  guidelines?: SavedGuideline[];
};

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
  if (intent === "step" && step && step !== "welcome") {
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

function localeGaps(prefix: string, value: { en: string; ar: string }): string[] {
  const gaps: string[] = [];
  if (!value.en.trim()) gaps.push(`${prefix}-en`);
  if (!value.ar.trim()) gaps.push(`${prefix}-ar`);
  return gaps;
}

export async function submitCompany(input: unknown): Promise<ActionResult> {
  const parsed = companySchema.safeParse(input);
  if (!parsed.success) return { gaps: ["refused"], notice: null };

  const { locale, intent, step, legalName, tradingName, address, theme } = parsed.data;
  const tax = taxStored(parsed.data.tax);
  const email = emailStored(parsed.data.email);
  const phone = phoneStored(parsed.data.phone);
  const malformed: string[] = [];
  if (tax.kind === "invalid") malformed.push("tax");
  if (email.kind === "invalid") malformed.push("email");
  if (phone.kind === "invalid") malformed.push("phone");

  const supabase = await createSupabaseServerClient();
  const previous = await readLegal(supabase);
  const saved = await supabase.rpc("save_legal_entity", {
    p_legal_name_en: legalName.en,
    p_legal_name_ar: legalName.ar,
    p_trading_name_en: tradingName.en,
    p_trading_name_ar: tradingName.ar,
    p_registered_address_en: address.en,
    p_registered_address_ar: address.ar,
    p_tax_registration_number: scalarToWrite(tax, previous.tax),
    p_contact_email: scalarToWrite(email, previous.email),
    p_contact_phone: scalarToWrite(phone, previous.phone),
  });
  if (saved.error) return { gaps: ["refused"], notice: null };

  const phoneStoredForm = phone.kind === "valid" ? phone.stored : undefined;
  const required = [...localeGaps("legal-name", legalName), ...localeGaps("address", address)];

  if (intent === "continue") {
    const gaps = [...malformed, ...required];
    if (gaps.length > 0) return { gaps, notice: null, phone: phoneStoredForm };
    await setResume(supabase, "guidelines");
    go(`/${locale}/onboarding/guidelines`, theme);
  }
  if (malformed.length > 0) return { gaps: malformed, notice: "saved", phone: phoneStoredForm };
  if (intent === "back") go(`/${locale}/onboarding/typography`, theme);
  if (intent === "step" && step) go(`/${locale}/onboarding/${step}`, theme);
  return { gaps: [], notice: "saved", phone: phoneStoredForm };
}

function guidelineShortfalls(guidelines: { ordinal: number; titleEn: string; titleAr: string; bodyEn: string; bodyAr: string }[]): string[] {
  const gaps: string[] = [];
  for (const guideline of guidelines) {
    if (!guideline.titleEn.trim()) gaps.push(`guideline-${guideline.ordinal}-title-en`);
    if (!guideline.titleAr.trim()) gaps.push(`guideline-${guideline.ordinal}-title-ar`);
    if (!guideline.bodyEn.trim()) gaps.push(`guideline-${guideline.ordinal}-body-en`);
    if (!guideline.bodyAr.trim()) gaps.push(`guideline-${guideline.ordinal}-body-ar`);
  }
  return gaps;
}

function hasText(guideline: { titleEn: string; titleAr: string; bodyEn: string; bodyAr: string }): boolean {
  return Boolean(guideline.titleEn.trim() || guideline.titleAr.trim() || guideline.bodyEn.trim() || guideline.bodyAr.trim());
}

export async function submitGuidelines(input: unknown): Promise<ActionResult> {
  const parsed = guidelinesSchema.safeParse(input);
  if (!parsed.success) return { gaps: ["refused"], notice: null };

  const { locale, intent, step, guidelines, removeId, theme } = parsed.data;
  const supabase = await createSupabaseServerClient();
  const profileId = await latestProfileId(supabase);
  if (!profileId && (guidelines.some((row) => hasText(row) || row.id) || removeId)) {
    return { gaps: ["profile"], notice: null };
  }

  if (removeId) {
    if (!profileId) return { gaps: ["profile"], notice: null };
    const archived = await supabase
      .from("brand_guideline")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", removeId)
      .select("id");
    if (archived.error || !archived.data?.length) return { gaps: ["remove"], notice: null };
  }

  if (profileId) {
    for (const guideline of guidelines) {
      if (!guideline.id && !hasText(guideline)) continue;
      const written = await supabase.rpc("save_guideline", {
        p_profile_id: profileId,
        p_guideline_id: (guideline.id ?? null) as string,
        p_title_en: guideline.titleEn,
        p_title_ar: guideline.titleAr,
        p_body_en: guideline.bodyEn,
        p_body_ar: guideline.bodyAr,
        p_ordinal: guideline.ordinal,
      });
      if (written.error) return { gaps: ["refused"], notice: null };
    }
  }

  const stored = await readGuidelines(supabase, profileId);
  const returned: SavedGuideline[] = stored.map((row) => ({ id: row.id, ordinal: row.ordinal }));

  if (intent === "continue") {
    const gaps = guidelineShortfalls(guidelines.filter((row) => row.id !== null || hasText(row)));
    if (gaps.length > 0) return { gaps, notice: null, guidelines: returned };
    await setResume(supabase, "review");
    go(`/${locale}/onboarding/review`, theme);
  }
  if (intent === "back") go(`/${locale}/onboarding/company`, theme);
  if (intent === "step" && step) go(`/${locale}/onboarding/${step}`, theme);
  return { gaps: [], notice: "saved", guidelines: returned };
}

export async function submitReview(input: unknown): Promise<ActionResult> {
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { gaps: ["refused"], notice: null };

  const { locale, intent, step, theme } = parsed.data;
  const supabase = await createSupabaseServerClient();
  if (intent === "back") go(`/${locale}/onboarding/guidelines`, theme);
  if (intent === "step" && step) go(`/${locale}/onboarding/${step}`, theme);

  const profileId = await latestProfileId(supabase);
  if (!profileId) return { gaps: ["profile"], notice: null };
  const finished = await supabase.rpc("complete_onboarding", { p_profile_id: profileId });
  if (finished.error) {
    const rules = rulesFromCompleteError(finished.error.message);
    return { gaps: rules ?? ["refused"], notice: null };
  }
  go(`/${locale}/onboarding/complete`, theme);
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
