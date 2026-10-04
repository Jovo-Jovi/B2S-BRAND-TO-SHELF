"use client";

import { useRef, useState } from "react";

import { BilingualField } from "@/components/ui/bilingual-field/bilingual-field";
import { Button } from "@/components/ui/button/button";
import { FormSection } from "@/components/shared/form-section/form-section";
import { fillPattern, formatCount } from "@/lib/locale/format-number";
import type { WizardError, WizardStepId } from "@/components/shared/wizard-step/wizard-step";

import { submitGuidelines } from "../actions";
import type { GuidelineValues, LocaleCode } from "../types";
import type { OnboardingCopy } from "./copy";
import { WizardFrame } from "./wizard-frame";

type GuidelinesStepProps = {
  locale: LocaleCode;
  copy: OnboardingCopy;
  theme: string | null;
  guidelines: GuidelineValues[];
  defaultLocale: LocaleCode;
};

type Row = {
  key: string;
  id: string | null;
  title: { en: string; ar: string };
  body: { en: string; ar: string };
};

function rowsFrom(guidelines: GuidelineValues[]): Row[] {
  return guidelines.map((guideline) => ({
    key: guideline.id,
    id: guideline.id,
    title: guideline.title,
    body: guideline.body,
  }));
}

export function GuidelinesStep({ locale, copy, theme, guidelines, defaultLocale }: GuidelinesStepProps) {
  const [rows, setRows] = useState<Row[]>(rowsFrom(guidelines));
  const [errors, setErrors] = useState<WizardError[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const busy = useRef(false);

  function messages(gaps: string[]): WizardError[] {
    return gaps.map((gap) => {
      const match = /^guideline-(\d+)-(title|body)-(en|ar)$/.exec(gap);
      if (!match) return { fieldId: "guidelines", message: copy.refused };
      const ordinal = match[1] ?? "";
      const part = match[2] === "title" ? copy.partTitle : copy.partBody;
      const named = match[3] === "ar" ? copy.localeAr : copy.localeEn;
      return {
        fieldId: gap,
        message: fillPattern(copy.guidelineShort, { ordinal, part, locale: named }),
      };
    });
  }

  function applyIds(saved: { id: string; ordinal: number }[] | undefined) {
    if (!saved) return;
    setRows((current) =>
      current.map((row, index) => {
        const match = saved.find((item) => item.ordinal === index + 1);
        return match ? { ...row, id: match.id, key: match.id } : row;
      }),
    );
  }

  async function run(intent: "save" | "continue" | "back" | "step" | "remove", step?: WizardStepId, removeId?: string) {
    if (busy.current) return;
    busy.current = true;
    try {
      const payload = rows
        .filter((row) => intent !== "remove" || row.id !== removeId)
        .map((row, index) => ({
          id: row.id,
          titleEn: row.title.en,
          titleAr: row.title.ar,
          bodyEn: row.body.en,
          bodyAr: row.body.ar,
          ordinal: index + 1,
        }));
      const result = await submitGuidelines({
        locale,
        intent,
        step,
        guidelines: payload,
        removeId,
        theme: theme === "light" || theme === "dark" ? theme : undefined,
      });
      if (intent === "remove" && result && result.gaps.length === 0) {
        setRows((current) => current.filter((row) => row.id !== removeId));
      }
      applyIds(result?.guidelines);
      if (result?.gaps?.length) {
        setNotice(null);
        setErrors(messages(result.gaps));
        return;
      }
      if (result?.notice === "saved" || intent === "remove") {
        setErrors([]);
        setNotice(copy.saved);
      }
    } finally {
      busy.current = false;
    }
  }

  const bilingual = {
    localeName: { en: copy.localeEn, ar: copy.localeAr },
    missingText: { en: copy.localeEn, ar: copy.localeAr },
  };

  return (
    <WizardFrame
      locale={locale}
      copy={copy}
      current="guidelines"
      title={copy.guidelines}
      purpose={copy.guidelinesPurpose}
      theme={theme}
      errors={errors}
      onBack={() => void run("back")}
      onContinue={() => void run("continue")}
      onSave={() => void run("save")}
      onStep={(step) => void run("step", step === "welcome" ? "brand" : step)}
    >
      {notice ? <p role="status">{notice}</p> : null}
      <div id="guidelines">
        <p>{copy.guidelinesHelp}</p>
        {rows.map((row, index) => {
          const ordinal = formatCount(index + 1, locale);
          const titleError = errors.find((item) => item.fieldId === `guideline-${index + 1}-title-en` || item.fieldId === `guideline-${index + 1}-title-ar`);
          const bodyError = errors.find((item) => item.fieldId === `guideline-${index + 1}-body-en` || item.fieldId === `guideline-${index + 1}-body-ar`);
          return (
            <FormSection key={row.key} title={fillPattern(copy.guidelineTitle, { ordinal })} description={copy.guidelineSectionBody}>
              <div id={`guideline-${index + 1}-title`}>
                <span id={`guideline-${index + 1}-title-en`} />
                <span id={`guideline-${index + 1}-title-ar`} />
                <BilingualField
                  caption={copy.partTitle}
                  defaultLocale={defaultLocale}
                  values={row.title}
                  onValuesChange={(title) => setRows((current) => current.map((item) => (item.key === row.key ? { ...item, title } : item)))}
                  {...bilingual}
                  completeText={copy.partTitle}
                  error={titleError?.message}
                  errorLocale={titleError?.fieldId.endsWith("ar") ? "ar" : titleError ? "en" : undefined}
                />
              </div>
              <div id={`guideline-${index + 1}-body`}>
                <span id={`guideline-${index + 1}-body-en`} />
                <span id={`guideline-${index + 1}-body-ar`} />
                <BilingualField
                  variant="multiline"
                  caption={copy.partBody}
                  defaultLocale={defaultLocale}
                  values={row.body}
                  onValuesChange={(body) => setRows((current) => current.map((item) => (item.key === row.key ? { ...item, body } : item)))}
                  {...bilingual}
                  completeText={copy.partBody}
                  error={bodyError?.message}
                  errorLocale={bodyError?.fieldId.endsWith("ar") ? "ar" : bodyError ? "en" : undefined}
                />
              </div>
              <Button
                type="button"
                variant="quiet"
                onClick={() => {
                  if (row.id) void run("remove", undefined, row.id);
                  else setRows((current) => current.filter((item) => item.key !== row.key));
                }}
              >
                {fillPattern(copy.removeGuideline, { ordinal })}
              </Button>
            </FormSection>
          );
        })}
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            setRows((current) => [
              ...current,
              { key: `new-${current.length}-${Date.now()}`, id: null, title: { en: "", ar: "" }, body: { en: "", ar: "" } },
            ])
          }
        >
          {copy.addGuideline}
        </Button>
      </div>
    </WizardFrame>
  );
}
