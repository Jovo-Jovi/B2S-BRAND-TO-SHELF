import "server-only";

import catalog from "@/app/[locale]/dictionaries/en.json";
import { logoStoreSession, mintLogoReadUrl, SIGNED_URL_SECONDS, storeLogo, type MemberMediaClient } from "@/lib/logo/store-logo";
import { LIBRARY_BODY_WEIGHT, LIBRARY_HEADING_WEIGHT, familiesFor } from "@/lib/typeface/registry";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { isHex } from "./schema";
import type { ColourRole, ColourValues, FaceValues, LocaleCode, LogoUrls, ResumeStep } from "./types";
import { COLOUR_ROLES, RESUME_STEPS } from "./types";

export type Client = Awaited<ReturnType<typeof createSupabaseServerClient>>;

const STARTING: { role: ColourRole; srgb: string }[] = [
  { role: "background", srgb: catalog.onboarding.startingBackground },
  { role: "foreground", srgb: catalog.onboarding.startingForeground },
  { role: "muted", srgb: catalog.onboarding.startingMuted },
  { role: "critical", srgb: catalog.onboarding.startingCritical },
];

function forward(current: string, next: ResumeStep): ResumeStep {
  const currentIndex = RESUME_STEPS.indexOf(current as ResumeStep);
  const nextIndex = RESUME_STEPS.indexOf(next);
  if (nextIndex > currentIndex) return next;
  if ((RESUME_STEPS as readonly string[]).includes(current)) return current as ResumeStep;
  return next;
}

export async function memberContext(supabase: Client): Promise<{ tenantId: string; memberId: string } | null> {
  const auth = await supabase.auth.getUser();
  const tenant = await supabase.rpc("current_tenant_id");
  if (!auth.data.user || !tenant.data) return null;
  return { tenantId: tenant.data, memberId: auth.data.user.id };
}

export async function openDraftAtBrand(supabase: Client): Promise<string | null> {
  const who = await memberContext(supabase);
  if (!who) return null;

  const existing = await supabase.from("onboarding_draft").select("id, archived_at, resume_step").maybeSingle();
  if (existing.error) return null;

  if (existing.data && !existing.data.archived_at) return existing.data.id;

  if (existing.data) {
    const updated = await supabase
      .from("onboarding_draft")
      .update({ archived_at: null, resume_step: "brand" })
      .eq("id", existing.data.id)
      .select("id")
      .maybeSingle();
    return updated.data?.id ?? existing.data.id;
  }

  const inserted = await supabase
    .from("onboarding_draft")
    .insert({ tenant_id: who.tenantId, resume_step: "brand", created_by: who.memberId })
    .select("id")
    .maybeSingle();
  return inserted.data?.id ?? null;
}

export async function writeStartingColours(supabase: Client, draftId: string): Promise<void> {
  const who = await memberContext(supabase);
  if (!who) return;
  for (const colour of STARTING) {
    if (!isHex(colour.srgb)) continue;
    const existing = await supabase
      .from("onboarding_draft_color")
      .select("id")
      .eq("draft_id", draftId)
      .eq("role", colour.role)
      .maybeSingle();
    if (existing.data) continue;
    await supabase.from("onboarding_draft_color").insert({
      tenant_id: who.tenantId,
      draft_id: draftId,
      role: colour.role,
      srgb: colour.srgb,
      created_by: who.memberId,
    });
  }
}

async function upsertDraftColour(
  supabase: Client,
  who: { tenantId: string; memberId: string },
  draftId: string,
  role: ColourRole,
  srgb: string,
): Promise<void> {
  const existing = await supabase
    .from("onboarding_draft_color")
    .select("id")
    .eq("draft_id", draftId)
    .eq("role", role)
    .maybeSingle();
  if (existing.data) {
    await supabase
      .from("onboarding_draft_color")
      .update({ srgb, archived_at: null })
      .eq("id", existing.data.id);
    return;
  }
  await supabase.from("onboarding_draft_color").insert({
    tenant_id: who.tenantId,
    draft_id: draftId,
    role,
    srgb,
    created_by: who.memberId,
  });
}

export async function writeDraftColours(supabase: Client, draftId: string, colours: ColourValues): Promise<void> {
  const who = await memberContext(supabase);
  if (!who) return;
  for (const role of COLOUR_ROLES) {
    const value = colours[role];
    if (!isHex(value)) continue;
    await upsertDraftColour(supabase, who, draftId, role, value);
  }
}

export async function saveName(
  supabase: Client,
  nameEn: string,
  nameAr: string,
): Promise<string | null> {
  if (!nameEn.trim() && !nameAr.trim()) return null;
  const saved = await supabase.rpc("save_brand_name", {
    p_name_en: nameEn,
    p_name_ar: nameAr,
  });
  if (saved.error) return null;
  return saved.data?.[0]?.profile_id ?? null;
}

export async function latestProfileId(supabase: Client): Promise<string | null> {
  const profile = await supabase
    .from("brand_profile")
    .select("id")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  return profile.data?.id ?? null;
}

export async function saveThemeIfComplete(
  supabase: Client,
  profileId: string | null,
  colours: ColourValues,
): Promise<void> {
  if (!profileId) return;
  if (!COLOUR_ROLES.every((role) => isHex(colours[role]))) return;
  await supabase.rpc("save_brand_theme", {
    p_profile_id: profileId,
    p_primary: colours.primary,
    p_secondary: colours.secondary,
    p_accent: colours.accent,
    p_background: colours.background,
    p_foreground: colours.foreground,
    p_muted: colours.muted,
    p_critical: colours.critical,
  });
}

export async function setResume(supabase: Client, next: ResumeStep): Promise<void> {
  const draft = await supabase.from("onboarding_draft").select("id, resume_step, archived_at").maybeSingle();
  if (!draft.data || draft.data.archived_at) return;
  const resume = forward(draft.data.resume_step, next);
  if (resume === draft.data.resume_step) return;
  await supabase.from("onboarding_draft").update({ resume_step: resume }).eq("id", draft.data.id);
}

function familyAllowed(script: "arabic" | "latin", family: string): boolean {
  return familiesFor(script).some((item) => item.family === family);
}

export async function upsertTypefaces(supabase: Client, profileId: string, faces: FaceValues): Promise<void> {
  const who = await memberContext(supabase);
  if (!who) return;
  const rows: { role: "heading" | "body"; script: "arabic" | "latin"; family: string }[] = [
    { role: "heading", script: "arabic", family: faces.headingArabic },
    { role: "body", script: "arabic", family: faces.bodyArabic },
    { role: "heading", script: "latin", family: faces.headingLatin },
    { role: "body", script: "latin", family: faces.bodyLatin },
  ];
  for (const row of rows) {
    if (!row.family || !familyAllowed(row.script, row.family)) continue;
    const weight = row.role === "heading" ? LIBRARY_HEADING_WEIGHT : LIBRARY_BODY_WEIGHT;
    const existing = await supabase
      .from("typeface")
      .select("id")
      .eq("profile_id", profileId)
      .eq("role", row.role)
      .eq("script", row.script)
      .maybeSingle();
    if (existing.data) {
      await supabase
        .from("typeface")
        .update({
          family: row.family,
          weight,
          is_italic: false,
          font_asset_id: null,
          archived_at: null,
        })
        .eq("id", existing.data.id);
      continue;
    }
    await supabase.from("typeface").insert({
      tenant_id: who.tenantId,
      profile_id: profileId,
      role: row.role,
      script: row.script,
      family: row.family,
      weight,
      is_italic: false,
      font_asset_id: null,
      created_by: who.memberId,
    });
  }
}

function mediaClient(supabase: Client): MemberMediaClient {
  const writer = supabase as unknown as {
    from(table: "media_asset" | "asset_rendition"): {
      insert(row: unknown): PromiseLike<{ error: { message: string } | null }>;
      update(values: { archived_at: string }): {
        eq(column: string, value: string): PromiseLike<{ error: { message: string } | null }>;
      };
    };
  };
  return {
    storage: supabase.storage,
    from(table) {
      return {
        async insert(row) {
          const result = await writer.from(table).insert(row);
          return { error: result.error };
        },
        update(values) {
          return {
            async eq(column, value) {
              const result = await writer.from(table).update(values).eq(column, value);
              return { error: result.error };
            },
          };
        },
      };
    },
  };
}

export async function storeLogoVariant(
  supabase: Client,
  ground: "light" | "dark",
  filename: string,
  bytes: Uint8Array,
): Promise<{ error: "active-content" | "type" | "size" | "failure" | "name" | null; url: string | null }> {
  const who = await memberContext(supabase);
  if (!who) return { error: "failure", url: null };
  const profileId = await latestProfileId(supabase);
  if (!profileId) return { error: "name", url: null };

  const session = logoStoreSession(mediaClient(supabase), who.tenantId, who.memberId);
  let stored: Awaited<ReturnType<typeof storeLogo>>;
  try {
    stored = await storeLogo({ bytes, filename }, session);
  } catch {
    return { error: "failure", url: null };
  }
  if (!stored.ok) {
    if (stored.reason === "active-content") return { error: "active-content", url: null };
    if (stored.reason === "not-svg-or-png") return { error: "type", url: null };
    if (stored.reason === "too-large" || stored.reason === "png-shorter-side") return { error: "size", url: null };
    return { error: "failure", url: null };
  }

  const existing = await supabase
    .from("logo_variant")
    .select("id, media_asset_id")
    .eq("profile_id", profileId)
    .eq("kind", "full")
    .eq("ground", ground)
    .maybeSingle();

  const previous = existing.data?.media_asset_id ?? null;
  if (existing.error) return { error: "failure", url: null };
  if (existing.data) {
    const updated = await supabase
      .from("logo_variant")
      .update({ media_asset_id: stored.mediaAssetId, archived_at: null })
      .eq("id", existing.data.id)
      .select("media_asset_id");
    if (updated.error || updated.data?.[0]?.media_asset_id !== stored.mediaAssetId) {
      return { error: "failure", url: null };
    }
  } else {
    const inserted = await supabase.from("logo_variant").insert({
      tenant_id: who.tenantId,
      profile_id: profileId,
      kind: "full",
      ground,
      media_asset_id: stored.mediaAssetId,
      created_by: who.memberId,
    });
    if (inserted.error) return { error: "failure", url: null };
  }

  if (previous && previous !== stored.mediaAssetId) {
    try {
      await session.archive(previous);
    } catch {
      return { error: "failure", url: null };
    }
  }

  try {
    const url = await mintLogoReadUrl(session, stored.objectKeys.original);
    return { error: null, url };
  } catch {
    return { error: null, url: null };
  }
}

export async function signLogo(supabase: Client, objectKey: string): Promise<string | null> {
  const who = await memberContext(supabase);
  if (!who) return null;
  const session = logoStoreSession(mediaClient(supabase), who.tenantId, who.memberId);
  try {
    return await session.signObject(objectKey, SIGNED_URL_SECONDS);
  } catch {
    return null;
  }
}

export async function loadSnapshot(supabase: Client): Promise<{
  defaultLocale: LocaleCode;
  names: { en: string; ar: string };
  storedColours: Partial<ColourValues>;
  logos: LogoUrls;
  faces: FaceValues;
}> {
  const emptyFaces: FaceValues = { headingArabic: "", bodyArabic: "", headingLatin: "", bodyLatin: "" };
  const names = { en: "", ar: "" };
  const storedColours: Partial<ColourValues> = {};
  const logos: LogoUrls = { light: null, dark: null };
  let defaultLocale: LocaleCode = "en";

  const who = await memberContext(supabase);
  if (!who) return { defaultLocale, names, storedColours, logos, faces: emptyFaces };

  const tenant = await supabase.from("tenant").select("default_locale").eq("id", who.tenantId).maybeSingle();
  if (tenant.data?.default_locale === "ar" || tenant.data?.default_locale === "en") {
    defaultLocale = tenant.data.default_locale;
  }

  const brand = await supabase.from("brand").select("name_key_id").maybeSingle();
  if (brand.data?.name_key_id) {
    const entries = await supabase
      .from("translation_entry")
      .select("locale, value")
      .eq("key_id", brand.data.name_key_id);
    for (const entry of entries.data ?? []) {
      if (entry.locale === "en" || entry.locale === "ar") names[entry.locale] = entry.value;
    }
  }

  const draft = await supabase.from("onboarding_draft").select("id, archived_at").maybeSingle();
  if (draft.data && !draft.data.archived_at) {
    const colours = await supabase
      .from("onboarding_draft_color")
      .select("role, srgb, archived_at")
      .eq("draft_id", draft.data.id);
    for (const colour of colours.data ?? []) {
      if (colour.archived_at) continue;
      if ((COLOUR_ROLES as readonly string[]).includes(colour.role)) {
        storedColours[colour.role] = colour.srgb;
      }
    }
  }

  const profile = await supabase
    .from("brand_profile")
    .select("id")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (profile.data) {
    const theme = await supabase
      .from("brand_theme")
      .select("id")
      .eq("profile_id", profile.data.id)
      .is("archived_at", null)
      .eq("is_default", true)
      .maybeSingle();
    if (theme.data) {
      const values = await supabase.from("color_value").select("role, srgb").eq("theme_id", theme.data.id);
      for (const value of values.data ?? []) {
        if (storedColours[value.role]) continue;
        if ((COLOUR_ROLES as readonly string[]).includes(value.role)) {
          storedColours[value.role] = value.srgb;
        }
      }
    }

    const faces = await supabase
      .from("typeface")
      .select("role, script, family, archived_at")
      .eq("profile_id", profile.data.id);
    for (const face of faces.data ?? []) {
      if (face.archived_at) continue;
      if (face.role === "heading" && face.script === "arabic") emptyFaces.headingArabic = face.family;
      if (face.role === "body" && face.script === "arabic") emptyFaces.bodyArabic = face.family;
      if (face.role === "heading" && face.script === "latin") emptyFaces.headingLatin = face.family;
      if (face.role === "body" && face.script === "latin") emptyFaces.bodyLatin = face.family;
    }

    const variants = await supabase
      .from("logo_variant")
      .select("ground, media_asset_id, archived_at")
      .eq("profile_id", profile.data.id)
      .eq("kind", "full");
    for (const variant of variants.data ?? []) {
      if (variant.archived_at) continue;
      if (variant.ground !== "light" && variant.ground !== "dark") continue;
      const asset = await supabase
        .from("media_asset")
        .select("object_key, archived_at")
        .eq("id", variant.media_asset_id)
        .maybeSingle();
      if (!asset.data || asset.data.archived_at) continue;
      logos[variant.ground] = await signLogo(supabase, asset.data.object_key);
    }
  }

  return { defaultLocale, names, storedColours, logos, faces: emptyFaces };
}
