"use client";

import type { CSSProperties } from "react";

import styles from "@/components/ui/brand-frame/brand-frame.module.css";
import { BrandFrame } from "@/components/ui/brand-frame/brand-frame";
import { PreviewPanel } from "@/components/shared/wizard-step/preview-panel";
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

const RULE_BLOCK: CSSProperties = { blockSize: "var(--b2s-preview-rule-block)" };

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

function scriptClass(locale: LocaleCode, kind: "heading" | "body" | "sticker"): string {
  if (kind === "body") return locale === "ar" ? styles.bodyArabic : styles.bodyLatin;
  if (kind === "sticker") return locale === "ar" ? styles.stickerArabic : styles.stickerLatin;
  return locale === "ar" ? styles.scriptArabic : styles.scriptLatin;
}

function nameClass(locale: LocaleCode): string {
  const size = locale === "ar" ? styles.nameArabic : styles.nameEnglish;
  return `${scriptClass(locale, "heading")} ${size}`;
}

export function BrandProof({ copy, snapshot, tab, onTab }: ProofProps) {
  const locale = snapshot.defaultLocale;
  const other: LocaleCode = locale === "en" ? "ar" : "en";
  const selected = tab === "sticker" ? "sticker" : "label";
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
  const markers = {
    role: (role: ColourRole) => copy[ROLE_CAPTION[role]],
    localeString: (_field: string, entryLocale: "en" | "ar") => (entryLocale === "en" ? copy.localeEn : copy.localeAr),
    typeface: (pair: string) => typefaceCaption(copy, pair),
  };
  const logo =
    matched && ground ? (
      <img data-part="logo-slot" data-ground={ground} alt={ground === "dark" ? copy.logoDark : copy.logoLight} src={matched} />
    ) : (
      <span data-part="logo-slot" />
    );

  const label = (
    <div className={styles.label} data-specimen="label" dir={direction(locale)}>
      <div className={styles.band} data-part="band" data-role="primary">
        <span className={styles.mark}>{logo}</span>
      </div>
      <div className={styles.panel} data-part="panel" data-role="background">
        <p className={nameClass(locale)} data-part="name" lang={locale} dir={direction(locale)}>
          {snapshot.names[locale]}
        </p>
        <p className={nameClass(other)} data-part="name-other" lang={other} dir={direction(other)}>
          {snapshot.names[other]}
        </p>
        <span className={styles.rule} data-part="rule" data-role="accent" style={RULE_BLOCK} />
        <p className={scriptClass(locale, "body")} data-part="product" lang={locale} dir={direction(locale)}>
          {copy.placeholderProduct}
        </p>
        <p className={scriptClass(locale, "body")} data-part="weight" lang={locale} dir={direction(locale)}>
          {copy.placeholderWeight}
        </p>
      </div>
      <span className={styles.strip} data-part="strip" data-role="secondary" />
    </div>
  );

  const sticker = (
    <div className={styles.sticker} data-specimen="sticker" dir={direction(locale)}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle className={styles.disc} data-part="disc" data-role="primary" cx="50" cy="50" r="50" />
        <circle className={styles.ring} data-part="ring" data-role="accent" cx="50" cy="50" r="42" fill="none" strokeWidth="4" />
      </svg>
      <div className={styles.stickerCenter}>
        <span className={styles.stickerMark}>{logo}</span>
        <p className={scriptClass(locale, "sticker")} data-part="sticker-name" lang={locale} dir={direction(locale)}>
          {snapshot.names[locale]}
        </p>
      </div>
    </div>
  );

  return (
    <PreviewPanel
      title={copy.livePreview}
      label={copy.tabLabel}
      sticker={copy.tabSticker}
      selected={selected}
      onSelect={onTab}
      note={note}
    >
      <BrandFrame
        regionName={selected === "label" ? copy.previewLabelRegion : copy.previewStickerRegion}
        missingRegionName={selected === "label" ? copy.previewLabelRegion : copy.previewStickerRegion}
        profile={profile}
        previewLocale={locale}
        markers={markers}
      >
        {selected === "label" ? label : sticker}
      </BrandFrame>
    </PreviewPanel>
  );
}
