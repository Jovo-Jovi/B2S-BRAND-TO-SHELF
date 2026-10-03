"use client";

import { useState } from "react";

import type en from "../../dictionaries/en.json";
import { BrandFrame } from "@/components/ui/brand-frame/brand-frame";
import { BilingualField } from "@/components/ui/bilingual-field/bilingual-field";
import { byteUnits } from "@/components/ui/data-catalog";
import { ColorField } from "@/components/ui/color-field/color-field";
import { Field } from "@/components/ui/field/field";
import { FileDrop } from "@/components/ui/file-drop/file-drop";
import { FormSection } from "@/components/shared/form-section/form-section";
import { Tabs } from "@/components/ui/tabs/tabs";
import { WizardStep } from "@/components/shared/wizard-step/wizard-step";
import { fillPattern } from "@/lib/locale/format-number";
import { libraryFace } from "@/lib/typeface/registry";

import { LabelSpecimen, StickerSpecimen, missingMarkNote, type SpecimenMark } from "./specimens";

type GalleryCopy = (typeof en)["gallery"];
type Locale = "en" | "ar";
type Role = "primary" | "secondary" | "accent" | "background" | "foreground" | "muted" | "critical";

const BUSINESS_DEFAULT: Locale = "en";
const DARK_MARK = "/gallery/sample-mark-dark.svg";

const ROLE_CAPTION: Record<Role, keyof GalleryCopy> = {
  primary: "rolePrimary",
  secondary: "roleSecondary",
  accent: "roleAccent",
  background: "roleBackground",
  foreground: "roleForeground",
  muted: "roleMuted",
  critical: "roleCritical",
};

type BrandStepProps = {
  locale: Locale;
  copy: GalleryCopy;
  otherLocale: Locale;
};

export function BrandStep({ locale, copy, otherLocale }: BrandStepProps) {
  const [names, setNames] = useState({ en: copy.sampleBrandEn, ar: copy.sampleBrandAr });
  const [colours, setColours] = useState<Record<Role, string>>({
    primary: "",
    secondary: "",
    accent: "",
    background: copy.startingBackground,
    foreground: copy.startingForeground,
    muted: copy.startingMuted,
    critical: copy.startingCritical,
  });
  const [darkMark, setDarkMark] = useState(DARK_MARK);
  const [tab, setTab] = useState("label");
  const [errors, setErrors] = useState<{ fieldId: string; message: string }[]>([]);
  const [nameError, setNameError] = useState<Locale | null>(null);

  const marks: SpecimenMark[] = [{ ground: "dark", src: darkMark }];
  const specimenCopy = {
    product: copy.placeholderProduct,
    weight: copy.placeholderWeight,
    missingMark: copy.missingMark,
    groundLight: copy.groundLight,
    groundDark: copy.groundDark,
  };
  const note = missingMarkNote(colours.primary, marks, specimenCopy);
  const profileColours = {
    primary: colours.primary || null,
    secondary: colours.secondary || null,
    accent: colours.accent || null,
    background: colours.background || null,
    foreground: colours.foreground || null,
    muted: colours.muted || null,
    critical: colours.critical || null,
  };
  const profile = {
    colors: profileColours,
    strings: [
      { field: "name", locale: "en" as const, value: names.en || null },
      { field: "name", locale: "ar" as const, value: names.ar || null },
    ],
    typefaces: {
      "heading-latin": libraryFace("latin", "heading"),
      "heading-arabic": libraryFace("arabic", "heading"),
      "body-latin": libraryFace("latin", "body"),
      "body-arabic": libraryFace("arabic", "body"),
    },
  };

  function setRole(role: Role, value: string) {
    setColours((current) => ({ ...current, [role]: value }));
  }

  function roleField(role: Role, help?: string) {
    const caption = copy[ROLE_CAPTION[role]];
    const paired = role === "foreground";
    return (
      <Field key={role} caption={caption} help={help} error={errors.find((item) => item.fieldId === `role-${role}`)?.message}>
        <ColorField
          id={`role-${role}`}
          variant={paired ? "paired" : "standard"}
          value={colours[role]}
          pairedWith={paired ? colours.background : undefined}
          locale={locale}
          passText={copy.contrastPasses}
          failText={copy.contrastFails}
          emptyName={copy.sampleEmptyColour}
          pickerName={caption}
          onValueChange={(value) => setRole(role, value)}
        />
      </Field>
    );
  }

  function validate() {
    const next: { fieldId: string; message: string }[] = [];
    let missingLocale: Locale | null = null;
    if (!names.en.trim()) {
      missingLocale = "en";
    } else if (!names.ar.trim()) {
      missingLocale = "ar";
    }
    if (missingLocale) {
      const localeName = missingLocale === "en" ? copy.localeEn : copy.localeAr;
      next.push({
        fieldId: "brand-name",
        message: fillPattern(copy.missingName, { locale: localeName }),
      });
    }
    setNameError(missingLocale);
    for (const role of Object.keys(ROLE_CAPTION) as Role[]) {
      if (!colours[role]) {
        next.push({
          fieldId: `role-${role}`,
          message: fillPattern(copy.missingRole, { role: copy[ROLE_CAPTION[role]] }),
        });
      }
    }
    setErrors(next);
  }

  const frame = (panel: "label" | "sticker", regionName: string) => (
    <div
      style={{
        maxInlineSize:
          panel === "label"
            ? "calc(var(--b2s-preview-label-max) + var(--b2s-space-5) + var(--b2s-space-5))"
            : "calc(var(--b2s-preview-sticker-max) + var(--b2s-space-5) + var(--b2s-space-5))",
      }}
    >
      <BrandFrame
        regionName={regionName}
        missingRegionName={regionName}
        profile={profile}
        previewLocale={BUSINESS_DEFAULT}
        markers={{
          role: (role) => role,
          localeString: (field, entryLocale) => `${field}-${entryLocale}`,
          typeface: (pair) => pair,
        }}
        proofNotes={note ? [note] : []}
      >
        {panel === "label" ? (
          <LabelSpecimen
            defaultLocale={BUSINESS_DEFAULT}
            names={names}
            primary={colours.primary}
            marks={marks}
            copy={specimenCopy}
          />
        ) : (
          <StickerSpecimen
            defaultLocale={BUSINESS_DEFAULT}
            names={names}
            primary={colours.primary}
            marks={marks}
            copy={specimenCopy}
          />
        )}
      </BrandFrame>
    </div>
  );

  return (
    <div data-screen="brand-step">
      <WizardStep
        locale={locale}
        current="brand"
        captions={{
          welcome: copy.welcomeTitle,
          brand: copy.compositionBrand,
          typography: copy.compositionTypography,
          company: copy.compositionCompany,
          guidelines: copy.compositionGuidelines,
          review: copy.compositionReview,
        }}
        progress={copy.compositionProgress}
        title={copy.compositionBrand}
        purpose={copy.compositionPurpose}
        back={copy.compositionBackWelcome}
        continueCaption={copy.compositionContinue}
        save={copy.compositionSave}
        mark={copy.compositionPlatformMark}
        localeHref={`/${otherLocale}/gallery`}
        localeCaption={otherLocale === "ar" ? copy.localeAr : copy.localeEn}
        help={copy.compositionHelp}
        onBack={() => undefined}
        onContinue={validate}
        onSave={() => undefined}
        onHelp={() => undefined}
        onStep={() => undefined}
        errors={errors}
        preview={
          <>
            <p>{copy.fictionalSample}</p>
            <Tabs
              tabs={[
                { id: "label", caption: copy.tabLabel, panel: frame("label", copy.previewLabelRegion) },
                { id: "sticker", caption: copy.tabSticker, panel: frame("sticker", copy.previewStickerRegion) },
              ]}
              selectedId={tab}
              onSelect={setTab}
            />
          </>
        }
      >
        <FormSection title={copy.brandSectionName} description={copy.brandSectionNameBody}>
          <div id="brand-name">
            <BilingualField
              caption={copy.compositionField}
              defaultLocale={BUSINESS_DEFAULT}
              values={names}
              onValuesChange={setNames}
              localeName={{ en: copy.localeEn, ar: copy.localeAr }}
              missingText={{ en: copy.localeEn, ar: copy.localeAr }}
              completeText={copy.compositionField}
              error={nameError ? fillPattern(copy.missingName, { locale: nameError === "en" ? copy.localeEn : copy.localeAr }) : undefined}
              errorLocale={nameError ?? undefined}
            />
          </div>
        </FormSection>
        <FormSection title={copy.brandSectionColours} description={copy.brandSectionColoursBody}>
          {roleField("primary")}
          {roleField("secondary")}
          {roleField("accent")}
        </FormSection>
        <FormSection title={copy.brandSectionText} description={copy.brandSectionTextBody}>
          {roleField("background", fillPattern(copy.startingHelp, { hex: copy.startingBackground }))}
          {roleField("foreground", fillPattern(copy.startingHelp, { hex: copy.startingForeground }))}
          {roleField("muted", fillPattern(copy.startingHelp, { hex: copy.startingMuted }))}
          {roleField("critical", fillPattern(copy.startingHelp, { hex: copy.startingCritical }))}
        </FormSection>
        <FormSection title={copy.brandSectionLogo} description={copy.brandSectionLogoBody}>
          <FileDrop
            locale={locale}
            units={byteUnits(locale)}
            copy={{
              instruction: copy.logoInstruction,
              dropInstruction: copy.logoDrop,
              browse: copy.logoBrowse,
              acceptedTypes: copy.logoAccepted,
              percentPattern: copy.logoPercent,
              retry: copy.logoRetry,
              replace: copy.logoReplace,
              remove: copy.logoRemove,
              typeError: copy.logoTypeError,
              sizeError: copy.logoSizeError,
              failureError: copy.logoFailure,
            }}
            onChoose={(files) => {
              const file = files[0];
              if (file) {
                setDarkMark(URL.createObjectURL(file));
              }
            }}
          />
        </FormSection>
      </WizardStep>
    </div>
  );
}
