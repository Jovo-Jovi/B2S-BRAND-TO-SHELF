"use client";

import type { ReactNode } from "react";

import { WizardStep, WIZARD_STEPS, type WizardError, type WizardScreen } from "@/components/shared/wizard-step/wizard-step";
import { SignOutControl } from "@/features/access/components/sign-out-control";

import type { OnboardingCopy } from "./copy";
import type { LocaleCode } from "../types";

type FrameProps = {
  locale: LocaleCode;
  copy: OnboardingCopy;
  current: WizardScreen;
  title: string;
  purpose: string;
  theme: string | null;
  errors: WizardError[];
  onBack?: () => void;
  onContinue?: () => void;
  onSave?: () => void;
  onStep?: (step: (typeof WIZARD_STEPS)[number] | "welcome") => void;
  preview?: ReactNode;
  notice?: ReactNode;
  children?: ReactNode;
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
  notice,
  children,
}: FrameProps) {
  const other: LocaleCode = locale === "en" ? "ar" : "en";
  const query = theme === "light" || theme === "dark" ? `?theme=${theme}` : "";
  const step = current === "welcome" ? "welcome" : current === "complete" ? "complete" : current;
  const showBack = current === "typography" || current === "company" || current === "guidelines" || current === "review";
  const showSave = current === "brand" || current === "typography" || current === "company" || current === "guidelines";
  const primary = current === "review" ? copy.finish : current === "welcome" || showSave || showBack ? copy.continue : undefined;
  const eyebrowLabel =
    current === "brand"
      ? copy.brandEyebrow
      : current === "typography" || current === "company" || current === "guidelines" || current === "review"
        ? copy[current]
        : undefined;

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
        progress={copy.progressLabeled}
        eyebrowLabel={eyebrowLabel}
        title={title}
        purpose={purpose}
        back={showBack ? copy.back : undefined}
        continueCaption={primary}
        save={showSave ? copy.save : undefined}
        mark={copy.mark}
        tagline={copy.tagline}
        localeHref={`/${other}/onboarding/${step}${query}`}
        localeCaption={other === "ar" ? copy.localeAr : copy.localeEn}
        onBack={onBack}
        onContinue={onContinue}
        onSave={onSave}
        onStep={current === "complete" ? undefined : onStep}
        stepHref={(item) => `/${locale}/onboarding/${item}${query}`}
        errors={errors}
        preview={preview}
        notice={notice}
        signOut={<SignOutControl locale={locale} caption={copy.signOut} />}
      >
        {children}
      </WizardStep>
    </div>
  );
}
