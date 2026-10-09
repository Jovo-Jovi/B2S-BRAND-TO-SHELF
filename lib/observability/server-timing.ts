// Phase timings for onboarding requests. The header carries a duration for
// an allowlisted phase and nothing else: no identifier, email, token or value.
// SECURITY_MODEL.md §6. A production deployment emits no header.

export const PHASES = [
  "proxy",
  "proxy-user",
  "gate-user",
  "gate-tenant",
  "gate-wave",
  "load-user",
  "load-tenant",
  "load-wave",
  "load-wave-2",
  "load-colours",
  "load-assets",
  "load-sign",
  "legal",
  "texts",
  "guidelines",
  "profile",
  "complete-wave",
  "complete-wave-2",
  "complete-colours",
  "logo",
  "review-wave",
  "render",
  "wall",
  "http-429",
] as const;

export type PhaseName = (typeof PHASES)[number];

export type PhaseSample = {
  name: string;
  dur: number;
};

const ALLOWED = new Set<string>(PHASES);
const METRIC = /^([a-z0-9-]+);dur=(\d+\.\d+)$/;

export function serverTimingHeader(
  env: string | undefined,
  samples: readonly PhaseSample[],
): string | null {
  if (env === "production") return null;
  const parts: string[] = [];
  for (const sample of samples) {
    if (!ALLOWED.has(sample.name)) continue;
    if (!Number.isFinite(sample.dur) || sample.dur < 0) continue;
    parts.push(`${sample.name};dur=${sample.dur.toFixed(1)}`);
  }
  if (parts.length === 0) return null;
  return parts.join(", ");
}

export function parseServerTiming(value: unknown): PhaseSample[] {
  if (typeof value !== "string" || value === "") return [];
  const samples: PhaseSample[] = [];
  for (const part of value.split(",")) {
    const match = METRIC.exec(part.trim());
    if (!match) continue;
    if (!ALLOWED.has(match[1])) continue;
    samples.push({ name: match[1], dur: Number(match[2]) });
  }
  return samples;
}
