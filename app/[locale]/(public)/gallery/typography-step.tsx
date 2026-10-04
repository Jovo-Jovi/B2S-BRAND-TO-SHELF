"use client";

import { useState } from "react";

import type en from "../../dictionaries/en.json";
import { BrandFrame } from "@/components/ui/brand-frame/brand-frame";
import { Field } from "@/components/ui/field/field";
import { FormSection } from "@/components/shared/form-section/form-section";
import { Select } from "@/components/ui/select/select";
import { Tabs } from "@/components/ui/tabs/tabs";
import { WizardStep } from "@/components/shared/wizard-step/wizard-step";
import { fillPattern } from "@/lib/locale/format-number";
import { LIBRARY_BODY_WEIGHT, LIBRARY_HEADING_WEIGHT, familiesFor, type TypefaceScript } from "@/lib/typeface/registry";

import { LabelSpecimen, StickerSpecimen } from "./specimens";

type GalleryCopy = (typeof en)["gallery"];
type Locale = "en" | "ar";
type Pair = "heading-arabic" | "body-arabic" | "heading-latin" | "body-latin";

type TypographyStepProps = {
  locale: Locale;
  copy: GalleryCopy;
  otherLocale: Locale;
};

const BUSINESS_DEFAULT: Locale = "en";
const PAIRS: { id: Pair; script: TypefaceScript; role: "heading" | "body" }[] = [
  { id: "heading-arabic", script: "arabic", role: "heading" },
  { id: "body-arabic", script: "arabic", role: "body" },
  { id: "heading-latin", script: "latin", role: "heading" },
  { id: "body-latin", script: "latin", role: "body" },
];

export function TypographyStep({ locale, copy, otherLocale }: TypographyStepProps) {
  const [chosen, setChosen] = useState<Record<Pair, string>>({
    "heading-arabic": "",
    "body-arabic": "",
    "heading-latin": "",
    "body-latin": "",
  });
  const [errors, setErrors] = useState<{ fieldId: string; message: string }[]>([]);
  const [tab, setTab] = useState("label");

  const scriptName = (script: TypefaceScript) => (script === "arabic" ? copy.typefaceArabic : copy.typefaceLatin);
  const roleName = (role: "heading" | "body") => (role === "heading" ? copy.typefaceHeading : copy.typefaceBody);

  function face(pair: Pair) {
    const family = chosen[pair];
    if (!family) {
      return null;
    }
    const role = pair.startsWith("heading") ? "heading" : "body";
    const weight = role === "heading" ? LIBRARY_HEADING_WEIGHT : LIBRARY_BODY_WEIGHT;
    return { family, weight: String(weight), italic: false as const };
  }

  const profile = {
    colors: {
      primary: null,
      secondary: null,
      accent: null,
      background: copy.startingBackground,
      foreground: copy.startingForeground,
      muted: copy.startingMuted,
      critical: copy.startingCritical,
    },
    strings: [
      { field: "name", locale: "en" as const, value: copy.sampleBrandEn },
      { field: "name", locale: "ar" as const, value: copy.sampleBrandAr },
    ],
    typefaces: {
      "heading-latin": face("heading-latin"),
      "heading-arabic": face("heading-arabic"),
      "body-latin": face("body-latin"),
      "body-arabic": face("body-arabic"),
    },
  };

  const specimenCopy = {
    product: copy.placeholderProduct,
    weight: copy.placeholderWeight,
    missingMark: copy.missingMark,
    groundLight: copy.groundLight,
    groundDark: copy.groundDark,
  };

  function options(script: TypefaceScript) {
    return [
      { value: "", caption: copy.typefaceUnchosen },
      ...familiesFor(script).map((item) => ({ value: item.family, caption: item.family })),
    ];
  }

  function validate() {
    const next = PAIRS.filter((pair) => !chosen[pair.id]).map((pair) => ({
      fieldId: `typeface-${pair.id}`,
      message: fillPattern(copy.typefaceMissing, { role: roleName(pair.role), script: scriptName(pair.script) }),
    }));
    setErrors(next);
  }

  const frame = (panel: "label" | "sticker", regionName: string) => (
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
    >
      {panel === "label" ? (
        <LabelSpecimen
          defaultLocale={BUSINESS_DEFAULT}
          names={{ en: copy.sampleBrandEn, ar: copy.sampleBrandAr }}
          primary=""
          marks={[]}
          copy={specimenCopy}
        />
      ) : (
        <StickerSpecimen
          defaultLocale={BUSINESS_DEFAULT}
          names={{ en: copy.sampleBrandEn, ar: copy.sampleBrandAr }}
          primary=""
          marks={[]}
          copy={specimenCopy}
        />
      )}
    </BrandFrame>
  );

  function pairField(pair: (typeof PAIRS)[number]) {
    return (
      <Field
        key={pair.id}
        caption={roleName(pair.role)}
        error={errors.find((item) => item.fieldId === `typeface-${pair.id}`)?.message}
      >
        <Select
          id={`typeface-${pair.id}`}
          variant="native"
          options={options(pair.script)}
          value={chosen[pair.id]}
          noResults={copy.typefaceNoResults}
          onValueChange={(value) => setChosen((current) => ({ ...current, [pair.id]: value }))}
        />
      </Field>
    );
  }

  return (
    <div data-screen="typography-step">
      <WizardStep
        locale={locale}
        current="typography"
        captions={{
          welcome: copy.welcomeTitle,
          brand: copy.compositionBrand,
          typography: copy.compositionTypography,
          company: copy.compositionCompany,
          guidelines: copy.compositionGuidelines,
          review: copy.compositionReview,
        }}
        progress={copy.compositionProgress}
        title={copy.compositionTypography}
        purpose={copy.typefacePurpose}
        back={copy.compositionBack}
        continueCaption={copy.compositionContinue}
        save={copy.compositionSave}
        mark={copy.compositionPlatformMark}
        localeHref={`/${otherLocale}/gallery`}
        localeCaption={otherLocale === "ar" ? copy.localeAr : copy.localeEn}
        onBack={() => undefined}
        onContinue={validate}
        onSave={() => undefined}
        onStep={() => undefined}
        errors={errors}
        preview={
          <>
            <p>{copy.fictionalSample}</p>
            <Tabs
              tabs={[
                { id: "label", caption: copy.tabLabel, panel: frame("label", copy.typefaceLabelRegion) },
                { id: "sticker", caption: copy.tabSticker, panel: frame("sticker", copy.typefaceStickerRegion) },
              ]}
              selectedId={tab}
              onSelect={setTab}
            />
          </>
        }
      >
        <FormSection title={copy.typefaceArabic} description={copy.typefaceHelp}>
          {PAIRS.filter((pair) => pair.script === "arabic").map(pairField)}
        </FormSection>
        <FormSection title={copy.typefaceLatin} description={copy.typefaceHelp}>
          {PAIRS.filter((pair) => pair.script === "latin").map(pairField)}
        </FormSection>
      </WizardStep>
    </div>
  );
}
