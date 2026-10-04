import { z } from "zod";

import { COLOUR_ROLES, CURRENCIES, RESUME_STEPS } from "./types";

const localeSchema = z.enum(["en", "ar"]);
const intentSchema = z.enum(["save", "continue", "back", "step"]);
const themeSchema = z.enum(["light", "dark"]).optional();

export const welcomeSchema = z.object({
  locale: localeSchema,
  businessLocale: localeSchema,
  currency: z.enum(CURRENCIES),
  name: z.string(),
  intent: intentSchema,
  theme: themeSchema,
});

export const repairSchema = z.object({
  locale: localeSchema,
});

const colourFields = {
  primary: z.string(),
  secondary: z.string(),
  accent: z.string(),
  background: z.string(),
  foreground: z.string(),
  muted: z.string(),
  critical: z.string(),
} as const;

export const brandSchema = z.object({
  locale: localeSchema,
  intent: intentSchema,
  step: z.enum(["welcome", ...RESUME_STEPS]).optional(),
  nameEn: z.string(),
  nameAr: z.string(),
  theme: themeSchema,
  ...colourFields,
});

export const typographySchema = z.object({
  locale: localeSchema,
  intent: intentSchema,
  step: z.enum(["welcome", ...RESUME_STEPS]).optional(),
  headingArabic: z.string(),
  bodyArabic: z.string(),
  headingLatin: z.string(),
  bodyLatin: z.string(),
  theme: themeSchema,
});

const localeText = z.object({ en: z.string(), ar: z.string() });

export const companySchema = z.object({
  locale: localeSchema,
  intent: intentSchema,
  step: z.enum(RESUME_STEPS).optional(),
  legalName: localeText,
  tradingName: localeText,
  address: localeText,
  tax: z.string(),
  email: z.string(),
  phone: z.string(),
  theme: themeSchema,
});

export const guidelineInputSchema = z.object({
  id: z.string().uuid().nullable(),
  titleEn: z.string(),
  titleAr: z.string(),
  bodyEn: z.string(),
  bodyAr: z.string(),
  ordinal: z.number().int().positive(),
});

export const guidelinesSchema = z.object({
  locale: localeSchema,
  intent: z.enum(["save", "continue", "back", "step", "remove"]),
  step: z.enum(RESUME_STEPS).optional(),
  guidelines: z.array(guidelineInputSchema),
  removeId: z.string().uuid().optional(),
  theme: themeSchema,
});

export const reviewSchema = z.object({
  locale: localeSchema,
  intent: z.enum(["finish", "back", "step"]),
  step: z.enum(RESUME_STEPS).optional(),
  theme: themeSchema,
});

export const logoUploadSchema = z.preprocess((raw: unknown) => {
  if (typeof FormData !== "undefined" && raw instanceof FormData) {
    const file = raw.get("file");
    return {
      locale: String(raw.get("locale") ?? ""),
      ground: String(raw.get("ground") ?? ""),
      nameEn: String(raw.get("nameEn") ?? ""),
      nameAr: String(raw.get("nameAr") ?? ""),
      filename: file instanceof File ? file.name : "",
      file,
    };
  }
  return raw;
}, z.object({
  locale: localeSchema,
  ground: z.enum(["light", "dark"]),
  nameEn: z.string(),
  nameAr: z.string(),
  filename: z.string(),
  file: z.custom<File>((value) => typeof File !== "undefined" && value instanceof File),
}));

export const HEX = /^#[0-9a-f]{6}$/;

export function isHex(value: string): boolean {
  return HEX.test(value);
}

export { COLOUR_ROLES };
