"use client";

import { useRef, useState } from "react";

import { BilingualField } from "@/components/ui/bilingual-field/bilingual-field";
import { byteUnits } from "@/components/ui/data-catalog";
import { ColorField } from "@/components/ui/color-field/color-field";
import { Field } from "@/components/ui/field/field";
import { FileDrop, type FileDropCopy } from "@/components/ui/file-drop/file-drop";
import { FormSection } from "@/components/shared/form-section/form-section";
import { LOGO_MAXIMUM_BYTES } from "@/lib/logo/logo-file";
import { fillPattern } from "@/lib/locale/format-number";
import { libraryFace } from "@/lib/typeface/registry";
import type { WizardError, WizardStepId } from "@/components/shared/wizard-step/wizard-step";

import { submitBrand, uploadLogo } from "../actions";
import type { BrandSnapshot, ColourRole, ColourValues, LocaleCode } from "../types";
import { COLOUR_ROLES } from "../types";
import type { OnboardingCopy } from "./copy";
import { BrandProof } from "./proof";
import { WizardFrame } from "./wizard-frame";

type BrandStepProps = {
  locale: LocaleCode;
  copy: OnboardingCopy;
  theme: string | null;
  snapshot: BrandSnapshot;
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

const STARTING_HELP: Partial<Record<ColourRole, keyof OnboardingCopy>> = {
  background: "startingBackground",
  foreground: "startingForeground",
  muted: "startingMuted",
  critical: "startingCritical",
};

export function BrandStep({ locale, copy, theme, snapshot }: BrandStepProps) {
  const [names, setNames] = useState(snapshot.names);
  const [colours, setColours] = useState<ColourValues>(snapshot.colours);
  const [logos, setLogos] = useState(snapshot.logos);
  const [errors, setErrors] = useState<WizardError[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [tab, setTab] = useState("label");
  const busy = useRef(false);

  function logoCopy(): FileDropCopy {
    return {
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
    };
  }

  function messages(gaps: string[]): WizardError[] {
    return gaps.map((gap) => {
      if (gap === "name-en" || gap === "name-ar") {
        const name = gap === "name-en" ? copy.localeEn : copy.localeAr;
        return { fieldId: gap, message: fillPattern(copy.missingName, { locale: name }) };
      }
      if (gap.startsWith("role-")) {
        const role = gap.slice("role-".length) as ColourRole;
        const caption = copy[ROLE_CAPTION[role]] ?? gap;
        return { fieldId: gap, message: fillPattern(copy.missingRole, { role: caption }) };
      }
      if (gap === "active-content") return { fieldId: "logo-file", message: copy.logoActive };
      if (gap === "type") return { fieldId: "logo-file", message: copy.logoTypeError };
      if (gap === "size") return { fieldId: "logo-file", message: copy.logoSizeError };
      if (gap === "name") return { fieldId: "brand-name", message: copy.missingName.replace("{locale}", copy.localeEn) };
      return { fieldId: "logo-file", message: copy.logoFailure };
    });
  }

  async function run(intent: "save" | "continue" | "back" | "step", step?: WizardStepId) {
    if (busy.current) return;
    busy.current = true;
    try {
      const result = await submitBrand({
        locale,
        intent,
        step,
        nameEn: names.en,
        nameAr: names.ar,
        theme: theme === "light" || theme === "dark" ? theme : undefined,
        ...colours,
      });
      if (result?.gaps?.length) {
        setNotice(null);
        setErrors(messages(result.gaps));
        return;
      }
      if (result?.notice === "saved") {
        setErrors([]);
        setNotice(copy.saved);
      }
    } finally {
      busy.current = false;
    }
  }

  async function onLogo(ground: "light" | "dark", file: File | undefined) {
    if (!file || busy.current) return;
    busy.current = true;
    try {
      const body = new FormData();
      body.set("locale", locale);
      body.set("ground", ground);
      body.set("nameEn", names.en);
      body.set("nameAr", names.ar);
      body.set("file", file);
      const result = await uploadLogo(body);
      if (result.error) {
        setErrors(messages([result.error]));
        return;
      }
      if (result.url && result.ground) {
        setLogos((current) => ({ ...current, [result.ground as "light" | "dark"]: result.url }));
      }
      setErrors([]);
    } finally {
      busy.current = false;
    }
  }

  function roleField(role: ColourRole) {
    const helpKey = STARTING_HELP[role];
    const help = helpKey ? fillPattern(copy.startingHelp, { hex: copy[helpKey] }) : undefined;
    return (
      <Field key={role} caption={copy[ROLE_CAPTION[role]]} help={help} error={errors.find((item) => item.fieldId === `role-${role}`)?.message}>
        <ColorField
          id={`role-${role}`}
          variant={role === "foreground" ? "paired" : "standard"}
          value={colours[role]}
          pairedWith={role === "foreground" ? colours.background : undefined}
          locale={locale}
          passText={copy.contrastPasses}
          failText={copy.contrastFails}
          emptyName={copy.emptyColour}
          pickerName={copy[ROLE_CAPTION[role]]}
          onValueChange={(value) => setColours((current) => ({ ...current, [role]: value }))}
        />
      </Field>
    );
  }

  const nameError = errors.find((item) => item.fieldId === "name-en" || item.fieldId === "name-ar");
  const display = {
    ...snapshot,
    names,
    colours,
    logos,
    faces: {
      headingLatin: snapshot.faces.headingLatin || libraryFace("latin", "heading").family,
      headingArabic: snapshot.faces.headingArabic || libraryFace("arabic", "heading").family,
      bodyLatin: snapshot.faces.bodyLatin || libraryFace("latin", "body").family,
      bodyArabic: snapshot.faces.bodyArabic || libraryFace("arabic", "body").family,
    },
  };

  return (
    <WizardFrame
      locale={locale}
      copy={copy}
      current="brand"
      title={copy.brand}
      purpose={copy.brandPurpose}
      theme={theme}
      errors={errors}
      onContinue={() => void run("continue")}
      onSave={() => void run("save")}
      onStep={(step) => void run("step", step)}
      preview={<BrandProof copy={copy} snapshot={display} tab={tab} onTab={setTab} />}
    >
      {notice ? <p role="status">{notice}</p> : null}
      <FormSection title={copy.brandSectionName} description={copy.brandSectionNameBody}>
        <div id="brand-name">
          <span id="name-en" />
          <span id="name-ar" />
          <BilingualField
            caption={copy.nameField}
            defaultLocale={snapshot.defaultLocale}
            values={names}
            onValuesChange={setNames}
            localeName={{ en: copy.localeEn, ar: copy.localeAr }}
            missingText={{ en: copy.localeEn, ar: copy.localeAr }}
            completeText={copy.nameField}
            error={nameError?.message}
            errorLocale={nameError?.message.includes(copy.localeAr) ? "ar" : nameError ? "en" : undefined}
          />
        </div>
      </FormSection>
      <FormSection title={copy.brandSectionColours} description={copy.brandSectionColoursBody}>
        {roleField("primary")}
        {roleField("secondary")}
        {roleField("accent")}
      </FormSection>
      <FormSection title={copy.brandSectionText} description={copy.brandSectionTextBody}>
        {COLOUR_ROLES.filter((role) => role === "background" || role === "foreground" || role === "muted" || role === "critical").map((role) => roleField(role))}
      </FormSection>
      <FormSection title={copy.brandSectionLogo} description={copy.brandSectionLogoBody}>
        <div id="logo-file" data-logo-ground="light">
          <FileDrop
            locale={locale}
            units={byteUnits(locale)}
            copy={logoCopy()}
            accept="image/png,image/svg+xml"
            sizeLimit={LOGO_MAXIMUM_BYTES}
            onChoose={(files) => void onLogo("light", files[0])}
          />
        </div>
        <div data-logo-ground="dark">
          <FileDrop
            locale={locale}
            units={byteUnits(locale)}
            copy={logoCopy()}
            accept="image/png,image/svg+xml"
            sizeLimit={LOGO_MAXIMUM_BYTES}
            onChoose={(files) => void onLogo("dark", files[0])}
          />
        </div>
      </FormSection>
    </WizardFrame>
  );
}
