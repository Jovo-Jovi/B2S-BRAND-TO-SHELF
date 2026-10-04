"use client";

import styles from "@/components/ui/brand-frame/brand-frame.module.css";
import { BrandFrame } from "@/components/ui/brand-frame/brand-frame";
import { Tabs } from "@/components/ui/tabs/tabs";
import { markGround } from "@/lib/colour/contrast";
import { fillPattern } from "@/lib/locale/format-number";
import { LIBRARY_BODY_WEIGHT, LIBRARY_HEADING_WEIGHT } from "@/lib/typeface/registry";

import type { OnboardingCopy } from "./copy";
import type { BrandSnapshot, ColourRole, LocaleCode } from "../types";

type ProofProps = {
  copy: OnboardingCopy;
  snapshot: BrandSnapshot;
  tab: string;
  onTab: (id: string) => void;
};

const ROLE_CAPTION: Record<ColourRole, keyof OnboardingCopy> = {
  primary: "rolePrimary",
  secondary: "roleSecondary",
  accent: "roleAccent",
  background: "roleBackground",
  foreground: "roleForeground",
  muted: "roleMuted",
  critical: "roleCritical",
};

function face(family: string, weight: number) {
  if (!family) return null;
  return { family, weight: String(weight), italic: false as const };
}

function typefaceCaption(copy: OnboardingCopy, pair: string): string {
  const role = pair.startsWith("heading") ? copy.typefaceHeading : copy.typefaceBody;
  const script = pair.endsWith("arabic") ? copy.typefaceArabic : copy.typefaceLatin;
  return `${role} ${script}`;
}

function direction(locale: LocaleCode): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

function scriptClass(locale: LocaleCode, kind: "heading" | "body"): string {
  if (kind === "body") return locale === "ar" ? styles.bodyArabic : styles.bodyLatin;
  return locale === "ar" ? styles.scriptArabic : styles.scriptLatin;
}

export function BrandProof({ copy, snapshot, tab, onTab }: ProofProps) {
  const locale = snapshot.defaultLocale;
  const other: LocaleCode = locale === "en" ? "ar" : "en";
  const profile = {
    colors: {
      primary: snapshot.colours.primary || null,
      secondary: snapshot.colours.secondary || null,
      accent: snapshot.colours.accent || null,
      background: snapshot.colours.background || null,
      foreground: snapshot.colours.foreground || null,
      muted: snapshot.colours.muted || null,
      critical: snapshot.colours.critical || null,
    },
    strings: [
      { field: "name", locale: "en" as const, value: snapshot.names.en || null },
      { field: "name", locale: "ar" as const, value: snapshot.names.ar || null },
    ],
    typefaces: {
      "heading-latin": face(snapshot.faces.headingLatin, LIBRARY_HEADING_WEIGHT),
      "heading-arabic": face(snapshot.faces.headingArabic, LIBRARY_HEADING_WEIGHT),
      "body-latin": face(snapshot.faces.bodyLatin, LIBRARY_BODY_WEIGHT),
      "body-arabic": face(snapshot.faces.bodyArabic, LIBRARY_BODY_WEIGHT),
    },
  };
  const ground = snapshot.colours.primary ? markGround(snapshot.colours.primary) : null;
  const matched = ground ? snapshot.logos[ground] : null;
  const note =
    snapshot.colours.primary && !matched
      ? fillPattern(copy.missingMark, { ground: ground === "dark" ? copy.groundDark : copy.groundLight })
      : null;

  const label = (
    <div className={styles.label} data-specimen="label" dir={direction(locale)}>
      <div className={styles.band} data-part="band" data-role="primary">
        <span className={styles.mark}>
          {snapshot.logos.light ? (
            <img data-part="logo-slot" data-ground="light" alt={copy.logoLight} src={snapshot.logos.light} />
          ) : null}
          {snapshot.logos.dark ? (
            <img data-part="logo-slot" data-ground="dark" alt={copy.logoDark} src={snapshot.logos.dark} />
          ) : null}
        </span>
      </div>
      <div className={styles.panel} data-part="panel" data-role="background">
        <p className={scriptClass(locale, "heading")} data-part="name" lang={locale} dir={direction(locale)}>
          {snapshot.names[locale]}
        </p>
        <p className={`${scriptClass(other, "heading")} ${styles.otherName}`} data-part="name-other" lang={other} dir={direction(other)}>
          {snapshot.names[other]}
        </p>
        <p className={scriptClass(locale, "body")} data-part="product" lang={locale} dir={direction(locale)}>
          {copy.placeholderProduct}
        </p>
        <p className={scriptClass(locale, "body")} data-part="weight" lang={locale} dir={direction(locale)}>
          {copy.placeholderWeight}
        </p>
      </div>
    </div>
  );

  return (
    <>
      <p>{copy.fictionalSample}</p>
      <Tabs
        tabs={[
          {
            id: "label",
            caption: copy.tabLabel,
            panel: (
              <BrandFrame
                regionName={copy.previewLabelRegion}
                missingRegionName={copy.previewLabelRegion}
                profile={profile}
                previewLocale={locale}
                markers={{
                  role: (role) => copy[ROLE_CAPTION[role]],
                  localeString: (_field, entryLocale) => (entryLocale === "en" ? copy.localeEn : copy.localeAr),
                  typeface: (pair) => typefaceCaption(copy, pair),
                }}
                proofNotes={note ? [note] : []}
              >
                {label}
              </BrandFrame>
            ),
          },
          {
            id: "sticker",
            caption: copy.tabSticker,
            panel: (
              <BrandFrame
                regionName={copy.previewStickerRegion}
                missingRegionName={copy.previewStickerRegion}
                profile={profile}
                previewLocale={locale}
                markers={{
                  role: (role) => copy[ROLE_CAPTION[role]],
                  localeString: (_field, entryLocale) => (entryLocale === "en" ? copy.localeEn : copy.localeAr),
                  typeface: (pair) => typefaceCaption(copy, pair),
                }}
              >
                {label}
              </BrandFrame>
            ),
          },
        ]}
        selectedId={tab}
        onSelect={onTab}
      />
    </>
  );
}
