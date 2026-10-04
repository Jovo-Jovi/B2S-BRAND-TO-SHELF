"use client";

import type { ReactNode } from "react";

import { WizardStep, type WizardError, type WizardStepId } from "@/components/shared/wizard-step/wizard-step";

import type { OnboardingCopy } from "./copy";
import type { LocaleCode } from "../types";

type FrameProps = {
  locale: LocaleCode;
  copy: OnboardingCopy;
  current: WizardStepId;
  title: string;
  purpose: string;
  theme: string | null;
  errors: WizardError[];
  onBack: () => void;
  onContinue: () => void;
  onSave: () => void;
  onStep: (step: WizardStepId) => void;
  preview?: ReactNode;
  children: ReactNode;
};

export function WizardFrame({
  locale,
  copy,
  current,
  title,
  purpose,
  theme,
  errors,
  onBack,
  onContinue,
  onSave,
  onStep,
  preview,
  children,
}: FrameProps) {
  const other: LocaleCode = locale === "en" ? "ar" : "en";
  const query = theme === "light" || theme === "dark" ? `?theme=${theme}` : "";
  const step = current === "welcome" ? "welcome" : current;

  return (
    <div data-screen={current}>
      <WizardStep
        locale={locale}
        current={current}
        captions={{
          welcome: copy.welcome,
          brand: copy.brand,
          typography: copy.typography,
          company: copy.company,
          guidelines: copy.guidelines,
          review: copy.review,
        }}
        progress={copy.progress}
        title={title}
        purpose={purpose}
        back={copy.back}
        continueCaption={copy.continue}
        save={copy.save}
        mark={copy.mark}
        localeHref={`/${other}/onboarding/${step}${query}`}
        localeCaption={other === "ar" ? copy.localeAr : copy.localeEn}
        help={copy.help}
        onBack={onBack}
        onContinue={onContinue}
        onSave={onSave}
        onHelp={() => undefined}
        onStep={onStep}
        errors={errors}
        preview={preview}
      >
        {children}
      </WizardStep>
    </div>
  );
}
