import type { CSSProperties, ReactNode } from "react";

import { Skeleton } from "../skeleton/skeleton";
import styles from "./brand-frame.module.css";

export type BrandFrameVariant = "preview";
export type BrandFrameSize = "comfortable";

export type BrandFrameVisual = "default" | "loading" | "error" | "empty" | "incomplete";

export const COLOR_ROLES = ["primary", "secondary", "accent", "background", "foreground", "muted", "critical"] as const;
export type ColorRole = (typeof COLOR_ROLES)[number];

export const TYPEFACE_PAIRS = ["heading-latin", "heading-arabic", "body-latin", "body-arabic"] as const;
export type TypefacePair = (typeof TYPEFACE_PAIRS)[number];

export type BrandTypeface = {
  family: string;
  weight: string;
  italic: boolean;
};

export type BrandLocaleString = {
  field: string;
  locale: "en" | "ar";
  value: string | null;
};

export type BrandFrameProfile = {
  colors: Partial<Record<ColorRole, string | null>>;
  typefaces: Partial<Record<TypefacePair, BrandTypeface | null>>;
  strings: BrandLocaleString[];
};

export type BrandFrameMarkers = {
  role: (role: ColorRole) => string;
  localeString: (field: string, locale: "en" | "ar") => string;
  typeface: (pair: TypefacePair) => string;
};

type BrandFrameProps = {
  variant?: BrandFrameVariant;
  size?: BrandFrameSize;
  state?: BrandFrameVisual;
  profile: BrandFrameProfile | null;
  previewLocale: "en" | "ar";
  regionName: string | null;
  missingRegionName: string;
  markers: BrandFrameMarkers;
  unresolvedMessage?: string;
  requestIdentifier?: string;
  emptyMessage?: string;
  loading?: boolean;
  children?: ReactNode;
};

const COLOR_PROPERTY: Record<ColorRole, string> = {
  primary: "--brand-primary",
  secondary: "--brand-secondary",
  accent: "--brand-accent",
  background: "--brand-background",
  foreground: "--brand-foreground",
  muted: "--brand-muted",
  critical: "--brand-critical",
};

const FONT_PROPERTY: Record<TypefacePair, string> = {
  "heading-latin": "--brand-font-heading-latin",
  "heading-arabic": "--brand-font-heading-arabic",
  "body-latin": "--brand-font-body-latin",
  "body-arabic": "--brand-font-body-arabic",
};

function brandProperties(profile: BrandFrameProfile): CSSProperties {
  const style: Record<string, string> = {};
  for (const role of COLOR_ROLES) {
    const value = profile.colors[role];
    if (value) {
      style[COLOR_PROPERTY[role]] = value;
    }
  }
  for (const pair of TYPEFACE_PAIRS) {
    const face = profile.typefaces[pair];
    if (face) {
      style[FONT_PROPERTY[pair]] = face.family;
    }
  }
  return style;
}

function missingRoles(profile: BrandFrameProfile): ColorRole[] {
  return COLOR_ROLES.filter((role) => !profile.colors[role]);
}

function missingTypefaces(profile: BrandFrameProfile): TypefacePair[] {
  return TYPEFACE_PAIRS.filter((pair) => !profile.typefaces[pair]);
}

function missingStrings(profile: BrandFrameProfile): BrandLocaleString[] {
  return profile.strings.filter((entry) => !entry.value);
}

export function BrandFrame({
  variant = "preview",
  size = "comfortable",
  state,
  profile,
  previewLocale,
  regionName,
  missingRegionName,
  markers,
  unresolvedMessage,
  requestIdentifier,
  emptyMessage,
  loading = false,
  children,
}: BrandFrameProps) {
  const gaps = profile
    ? missingRoles(profile).length + missingTypefaces(profile).length + missingStrings(profile).length + (regionName ? 0 : 1)
    : 0;
  const visual =
    state ??
    (loading ? "loading" : unresolvedMessage ? "error" : !profile ? "empty" : gaps > 0 ? "incomplete" : "default");
  const bodyPair: TypefacePair = previewLocale === "ar" ? "body-arabic" : "body-latin";
  const body = profile?.typefaces[bodyPair];
  const showCanvas = profile && visual !== "loading" && visual !== "error" && visual !== "empty";

  return (
    <section
      className={styles.mount}
      data-variant={variant}
      data-state={visual}
      data-density={size}
      role="region"
      aria-label={regionName ?? missingRegionName}
    >
      <div className={styles.surround}>
        {visual === "loading" ? <Skeleton variant="block" state="loading" /> : null}
        {visual === "error" && unresolvedMessage ? (
          <p className={styles.message}>
            {unresolvedMessage}
            {requestIdentifier ? (
              <span className={styles.identifier} dir="ltr">
                {requestIdentifier}
              </span>
            ) : null}
          </p>
        ) : null}
        {visual === "empty" && emptyMessage ? <p className={styles.message}>{emptyMessage}</p> : null}
        {visual === "incomplete" && profile ? (
          <ul className={styles.markers}>
            {regionName ? null : <li>{missingRegionName}</li>}
            {missingRoles(profile).map((role) => (
              <li key={role}>{markers.role(role)}</li>
            ))}
            {missingStrings(profile).map((entry) => (
              <li key={`${entry.field}-${entry.locale}`}>{markers.localeString(entry.field, entry.locale)}</li>
            ))}
            {missingTypefaces(profile).map((pair) => (
              <li key={pair}>{markers.typeface(pair)}</li>
            ))}
          </ul>
        ) : null}
        {showCanvas ? (
          <div className={styles.canvas} style={brandProperties(profile)}>
            {profile.colors.foreground ? (
              <div
                className={styles.content}
                lang={previewLocale}
                dir={previewLocale === "ar" ? "rtl" : "ltr"}
                style={body ? { fontWeight: body.weight, fontStyle: body.italic ? "italic" : "normal" } : undefined}
              >
                {children}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
