export const COLOUR_ROLES = [
  "primary",
  "secondary",
  "accent",
  "background",
  "foreground",
  "muted",
  "critical",
] as const;

export type ColourRole = (typeof COLOUR_ROLES)[number];

export const RESUME_STEPS = ["brand", "typography", "company", "guidelines", "review"] as const;

export type ResumeStep = (typeof RESUME_STEPS)[number];

export const ONBOARDING_SCREENS = ["welcome", ...RESUME_STEPS, "complete"] as const;

export type OnboardingScreen = (typeof ONBOARDING_SCREENS)[number];

export type RequestedScreen = OnboardingScreen | "index";

export const CURRENCIES = ["EGP", "USD", "SAR", "AED", "EUR"] as const;

export type CurrencyCode = (typeof CURRENCIES)[number];

export type LocaleCode = "en" | "ar";

export type ColourValues = Record<ColourRole, string>;

export type LogoUrls = { light: string | null; dark: string | null };

export type FaceValues = {
  headingArabic: string;
  bodyArabic: string;
  headingLatin: string;
  bodyLatin: string;
};

export type BrandSnapshot = {
  defaultLocale: LocaleCode;
  names: { en: string; ar: string };
  colours: ColourValues;
  logos: LogoUrls;
  faces: FaceValues;
};

export type GateState =
  | { kind: "anonymous" }
  | { kind: "welcome" }
  | { kind: "pending" }
  | { kind: "repair" }
  | { kind: "draft"; resume: ResumeStep }
  | { kind: "complete" };

export type GateDecision =
  | { type: "redirect"; href: string }
  | { type: "render"; screen: "welcome" | "pending" | "complete" | ResumeStep };
