"use client";

import { useRef, useState } from "react";

import { FormSection } from "@/components/shared/form-section/form-section";
import { TextLink } from "@/components/ui/text-link/text-link";
import type { WizardError, WizardStepId } from "@/components/shared/wizard-step/wizard-step";
import { fillPattern } from "@/lib/locale/format-number";

import { submitReview } from "../actions";
import { ruleHref, ruleMessage } from "../rule-text";
import type { BrandSnapshot, LocaleCode, ReviewModel } from "../types";
import type { OnboardingCopy } from "./copy";
import { BrandProof } from "./proof";
import { WizardFrame } from "./wizard-frame";

type ReviewStepProps = {
  locale: LocaleCode;
  copy: OnboardingCopy;
  theme: string | null;
  snapshot: BrandSnapshot;
  review: ReviewModel;
};

function line(value: string, empty: string): string {
  const trimmed = value.trim();
  return trimmed ? trimmed : empty;
}

export function ReviewStep({ locale, copy, theme, snapshot, review }: ReviewStepProps) {
  const [errors, setErrors] = useState<WizardError[]>([]);
  const [tab, setTab] = useState("label");
  const busy = useRef(false);
  const themeQuery = theme === "light" || theme === "dark" ? theme : null;

  function edit(step: "brand" | "typography" | "company" | "guidelines", name: string) {
    return (
      <TextLink href={ruleHref(locale, step === "brand" ? "brand name missing locale en" : step === "typography" ? "typeface missing heading/latin" : step === "company" ? "legal name missing locale en" : "guideline title missing locale en", themeQuery)}>
        {fillPattern(copy.reviewEdit, { step: name })}
      </TextLink>
    );
  }

  function messages(gaps: string[]): WizardError[] {
    return gaps.map((gap) => {
      if (!gap.includes(" ")) return { fieldId: "review-needed", message: copy.refused };
      return {
        fieldId: "review-needed",
        href: ruleHref(locale, gap, themeQuery),
        rule: gap,
        message: ruleMessage(gap, copy),
      };
    });
  }

  async function run(intent: "finish" | "back" | "step", step?: WizardStepId) {
    if (busy.current) return;
    busy.current = true;
    try {
      const result = await submitReview({
        locale,
        intent,
        step: step === "welcome" ? "brand" : step,
        theme: themeQuery ?? undefined,
      });
      if (result?.gaps?.length) setErrors(messages(result.gaps));
    } finally {
      busy.current = false;
    }
  }

  const faces = [snapshot.faces.headingArabic, snapshot.faces.bodyArabic, snapshot.faces.headingLatin, snapshot.faces.bodyLatin]
    .map((face) => face.trim())
    .filter(Boolean)
    .join(", ");

  return (
    <WizardFrame
      locale={locale}
      copy={copy}
      current="review"
      title={copy.review}
      purpose={copy.reviewPurpose}
      theme={theme}
      errors={errors}
      onBack={() => void run("back")}
      onContinue={() => void run("finish")}
      onStep={(step) => void run("step", step)}
      preview={<BrandProof copy={copy} snapshot={snapshot} tab={tab} onTab={setTab} />}
    >
      <FormSection title={copy.reviewBrand} description={copy.reviewBrandBody}>
        <p>{line(snapshot.names.en, copy.summaryEmpty)}</p>
        <p>{line(snapshot.names.ar, copy.summaryEmpty)}</p>
        {edit("brand", copy.brand)}
      </FormSection>
      <FormSection title={copy.reviewTypography} description={copy.reviewTypographyBody}>
        <p>{faces || copy.summaryEmpty}</p>
        {edit("typography", copy.typography)}
      </FormSection>
      <FormSection title={copy.reviewCompany} description={copy.reviewCompanyBody}>
        <p>{line(review.legal.legalName.en, copy.summaryEmpty)}</p>
        <p>{line(review.legal.legalName.ar, copy.summaryEmpty)}</p>
        {edit("company", copy.company)}
      </FormSection>
      <FormSection title={copy.reviewGuidelines} description={copy.reviewGuidelinesBody}>
        {review.guidelines.length === 0 ? <p>{copy.summaryNone}</p> : review.guidelines.map((guideline) => <p key={guideline.id}>{line(guideline.title.en || guideline.title.ar, copy.summaryEmpty)}</p>)}
        {edit("guidelines", copy.guidelines)}
      </FormSection>
      <FormSection title={copy.reviewNeeded} description={copy.reviewNeededBody}>
        {review.gaps.length === 0 ? (
          <p>{copy.reviewReady}</p>
        ) : (
          <ul data-needed="">
            {review.gaps.map((rule, index) => (
              <li key={`${rule}-${index}`} data-rule={rule}>
                <TextLink href={ruleHref(locale, rule, themeQuery)}>{ruleMessage(rule, copy)}</TextLink>
              </li>
            ))}
          </ul>
        )}
      </FormSection>
    </WizardFrame>
  );
}
