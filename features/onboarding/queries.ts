import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { BrandSnapshot, ColourValues } from "./types";
import { COLOUR_ROLES } from "./types";
import { loadSnapshot } from "./writes";

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
