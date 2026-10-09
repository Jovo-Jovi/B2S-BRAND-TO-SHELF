import "server-only";

import { timePhase } from "@/lib/observability/phase-timing";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { completenessGaps, type CompletenessInput, type LocaleText } from "./completeness";
import type { GuidelineValues, LegalValues } from "./types";
import { COLOUR_ROLES, type ColourRole } from "./types";

type Client = Awaited<ReturnType<typeof createSupabaseServerClient>>;

function blank(): LocaleText {
  return { en: "", ar: "" };
}

async function texts(supabase: Client, keyIds: Array<string | null>): Promise<Map<string, LocaleText>> {
  return timePhase("texts", async () => {
    const ids = keyIds.filter((id): id is string => Boolean(id));
    const map = new Map<string, LocaleText>();
    if (ids.length === 0) return map;
    const rows = await supabase.from("translation_entry").select("key_id, locale, value, archived_at").in("key_id", ids);
    for (const row of rows.data ?? []) {
      if (row.archived_at) continue;
      if (row.locale !== "en" && row.locale !== "ar") continue;
      const current = map.get(row.key_id) ?? blank();
      current[row.locale] = row.value;
      map.set(row.key_id, current);
    }
    return map;
  });
}

function textOf(map: Map<string, LocaleText>, key: string | null): LocaleText {
  if (!key) return blank();
  return map.get(key) ?? blank();
}

export async function readLegal(supabase: Client): Promise<LegalValues> {
  const empty: LegalValues = {
    legalName: blank(),
    tradingName: blank(),
    address: blank(),
    tax: "",
    email: "",
    phone: "",
  };
  const row = await timePhase("legal", () =>
    supabase
      .from("legal_entity")
      .select("legal_name_key_id, trading_name_key_id, registered_address_key_id, tax_registration_number, contact_email, contact_phone, archived_at")
      .maybeSingle(),
  );
  if (!row.data || row.data.archived_at) return empty;
  const map = await texts(supabase, [row.data.legal_name_key_id, row.data.trading_name_key_id, row.data.registered_address_key_id]);
  return {
    legalName: textOf(map, row.data.legal_name_key_id),
    tradingName: textOf(map, row.data.trading_name_key_id),
    address: textOf(map, row.data.registered_address_key_id),
    tax: row.data.tax_registration_number ?? "",
    email: row.data.contact_email ?? "",
    phone: row.data.contact_phone ?? "",
  };
}

export async function readGuidelines(supabase: Client, profileId: string | null): Promise<GuidelineValues[]> {
  if (!profileId) return [];
  const rows = await timePhase("guidelines", () =>
    supabase
      .from("brand_guideline")
      .select("id, title_key_id, body_key_id, ordinal, archived_at")
      .eq("profile_id", profileId)
      .order("ordinal"),
  );
  const live = (rows.data ?? []).filter((row) => !row.archived_at);
  const map = await texts(
    supabase,
    live.flatMap((row) => [row.title_key_id, row.body_key_id]),
  );
  return live.map((row) => ({
    id: row.id,
    ordinal: row.ordinal,
    title: textOf(map, row.title_key_id),
    body: textOf(map, row.body_key_id),
  }));
}

async function logoReady(supabase: Client, profileId: string): Promise<boolean> {
  return timePhase("logo", async () => {
    const variants = await supabase.from("logo_variant").select("media_asset_id, archived_at").eq("profile_id", profileId);
    for (const variant of variants.data ?? []) {
      if (variant.archived_at) continue;
      const asset = await supabase.from("media_asset").select("id, archived_at").eq("id", variant.media_asset_id).maybeSingle();
      if (!asset.data || asset.data.archived_at) continue;
      const renditions = await supabase.from("asset_rendition").select("tier, archived_at").eq("media_asset_id", asset.data.id);
      const tiers = new Set((renditions.data ?? []).filter((row) => !row.archived_at).map((row) => row.tier));
      if (tiers.has("display") && tiers.has("print")) return true;
    }
    return false;
  });
}

export async function readCompleteness(supabase: Client, profileId: string | null): Promise<CompletenessInput> {
  const input: CompletenessInput = {
    brandName: blank(),
    themes: [],
    guidelines: [],
    lineNames: [],
    logoReady: false,
    typefaces: [],
    legalName: blank(),
    registeredAddress: blank(),
  };

  const [brand, legal] = await timePhase("complete-wave", () =>
    Promise.all([
      supabase.from("brand").select("id, name_key_id").maybeSingle(),
      readLegal(supabase),
    ]),
  );
  input.legalName = legal.legalName;
  input.registeredAddress = legal.address;

  const nameMap = await texts(supabase, [brand.data?.name_key_id ?? null]);
  if (brand.data?.name_key_id) input.brandName = textOf(nameMap, brand.data.name_key_id);

  if (!profileId) return input;

  const [themes, guidelines, lines, faces, ready] = await timePhase("complete-wave-2", () =>
    Promise.all([
      supabase.from("brand_theme").select("id, name_key_id, is_default, archived_at").eq("profile_id", profileId),
      readGuidelines(supabase, profileId),
      brand.data
        ? supabase.from("brand_line").select("name_key_id, archived_at, profile_id").eq("brand_id", brand.data.id)
        : Promise.resolve({ data: null }),
      supabase.from("typeface").select("role, script, archived_at").eq("profile_id", profileId),
      logoReady(supabase, profileId),
    ]),
  );
  const liveThemes = (themes.data ?? []).filter((row) => !row.archived_at);
  const [themeNames, colourRows] = await timePhase("complete-colours", () =>
    Promise.all([
      texts(supabase, liveThemes.map((row) => row.name_key_id)),
      Promise.all(liveThemes.map((theme) => supabase.from("color_value").select("role, srgb").eq("theme_id", theme.id))),
    ]),
  );
  liveThemes.forEach((theme, index) => {
    const colours: Partial<Record<ColourRole, string>> = {};
    for (const value of colourRows[index]?.data ?? []) {
      if ((COLOUR_ROLES as readonly string[]).includes(value.role)) colours[value.role as ColourRole] = value.srgb;
    }
    input.themes.push({
      name: textOf(themeNames, theme.name_key_id),
      isDefault: theme.is_default,
      colours,
    });
  });

  input.guidelines = guidelines.map((row) => ({ title: row.title, body: row.body }));

  const liveLines = (lines.data ?? []).filter((row) => !row.archived_at && row.profile_id === profileId);
  const lineMap = await texts(supabase, liveLines.map((row) => row.name_key_id));
  input.lineNames = liveLines.map((row) => textOf(lineMap, row.name_key_id));

  input.typefaces = (faces.data ?? [])
    .filter((row) => !row.archived_at)
    .map((row) => ({ role: row.role, script: row.script }));

  input.logoReady = ready;
  return input;
}

export function reviewGaps(input: CompletenessInput): string[] {
  return completenessGaps(input);
}
