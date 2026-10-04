import type { GateDecision, GateState, LocaleCode, RequestedScreen, ResumeStep } from "./types";
import { RESUME_STEPS } from "./types";

const STEP_INDEX: Record<string, number> = {
  welcome: -1,
  brand: 0,
  typography: 1,
  company: 2,
  guidelines: 3,
  review: 4,
};

export function screenPath(locale: LocaleCode, screen: string): string {
  return `/${locale}/onboarding/${screen}`;
}

export function themedHref(href: string, theme: string | null | undefined): string {
  if (theme !== "light" && theme !== "dark") return href;
  const hashAt = href.indexOf("#");
  const hash = hashAt === -1 ? "" : href.slice(hashAt);
  const path = hashAt === -1 ? href : href.slice(0, hashAt);
  if (/(?:[?&])theme=/.test(path)) return href;
  const join = path.includes("?") ? "&" : "?";
  return `${path}${join}theme=${theme}${hash}`;
}

export function signInReturn(locale: LocaleCode, requested: RequestedScreen): string {
  const next = requested === "index" ? `/${locale}/onboarding` : screenPath(locale, requested);
  return `/${locale}/sign-in?next=${encodeURIComponent(next)}`;
}

function resumeOf(state: GateState): ResumeStep {
  if (state.kind === "draft") return state.resume;
  return "brand";
}

export function decide(locale: LocaleCode, state: GateState, requested: RequestedScreen): GateDecision {
  if (state.kind === "anonymous") {
    return { type: "redirect", href: signInReturn(locale, requested) };
  }

  if (state.kind === "welcome") {
    if (requested === "welcome") return { type: "render", screen: "welcome" };
    return { type: "redirect", href: screenPath(locale, "welcome") };
  }

  if (state.kind === "pending") {
    return { type: "render", screen: "pending" };
  }

  if (state.kind === "repair") {
    return { type: "redirect", href: screenPath(locale, "brand") };
  }

  if (state.kind === "complete") {
    if (requested === "complete") return { type: "render", screen: "complete" };
    return { type: "redirect", href: screenPath(locale, "complete") };
  }

  const resume = resumeOf(state);
  if (requested === "index" || requested === "complete") {
    return { type: "redirect", href: screenPath(locale, resume) };
  }
  const requestedIndex = STEP_INDEX[requested];
  const resumeIndex = STEP_INDEX[resume];
  if (requestedIndex === undefined || requestedIndex > resumeIndex) {
    return { type: "redirect", href: screenPath(locale, resume) };
  }
  if (requested === "welcome") return { type: "redirect", href: screenPath(locale, resume) };
  if ((RESUME_STEPS as readonly string[]).includes(requested)) {
    return { type: "render", screen: requested as ResumeStep };
  }
  return { type: "redirect", href: screenPath(locale, resume) };
}
