import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import { completenessGaps } from "./completeness";
import { readCompleteness, readGuidelines, readLegal } from "./records";
import type { BrandSnapshot, ColourValues, GuidelineValues, LegalValues, ReviewModel } from "./types";
import { COLOUR_ROLES } from "./types";
import { latestProfileId, loadSnapshot } from "./writes";

export async function readBrandSnapshot(starting: Pick<ColourValues, "background" | "foreground" | "muted" | "critical">): Promise<BrandSnapshot> {
  const supabase = await createSupabaseServerClient();
  const loaded = await loadSnapshot(supabase);
  const colours = {} as ColourValues;
  for (const role of COLOUR_ROLES) {
    const stored = loaded.storedColours[role];
    if (stored) {
      colours[role] = stored;
      continue;
    }
    if (role === "background" || role === "foreground" || role === "muted" || role === "critical") {
      colours[role] = starting[role];
      continue;
    }
    colours[role] = "";
  }
  return {
    defaultLocale: loaded.defaultLocale,
    names: loaded.names,
    colours,
    logos: loaded.logos,
    faces: loaded.faces,
  };
}

export async function readCompanyForm(): Promise<LegalValues> {
  const supabase = await createSupabaseServerClient();
  return readLegal(supabase);
}

export async function readGuidelineForm(): Promise<GuidelineValues[]> {
  const supabase = await createSupabaseServerClient();
  const profileId = await latestProfileId(supabase);
  return readGuidelines(supabase, profileId);
}

export async function readReviewModel(): Promise<ReviewModel> {
  const supabase = await createSupabaseServerClient();
  const profileId = await latestProfileId(supabase);
  const legal = await readLegal(supabase);
  const guidelines = await readGuidelines(supabase, profileId);
  const input = await readCompleteness(supabase, profileId);
  return { legal, guidelines, gaps: completenessGaps(input) };
}
