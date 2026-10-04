"use client";

import { useRouter } from "next/navigation";

import { themedHref } from "../destination";
import type { LocaleCode } from "../types";
import type { OnboardingCopy } from "./copy";
import { WizardFrame } from "./wizard-frame";

type CompanyStubProps = {
  locale: LocaleCode;
  copy: OnboardingCopy;
  theme: string | null;
};

export function CompanyStub({ locale, copy, theme }: CompanyStubProps) {
  const router = useRouter();
  return (
    <div data-interim="company">
      <WizardFrame
        locale={locale}
        copy={copy}
        current="company"
        title={copy.companyStub}
        purpose={copy.companyStubBody}
        theme={theme}
        errors={[]}
        onBack={() => router.push(themedHref(`/${locale}/onboarding/typography`, theme))}
        onContinue={() => undefined}
        onSave={() => undefined}
        onStep={(step) => router.push(themedHref(`/${locale}/onboarding/${step}`, theme))}
      >
        <p>{copy.companyStubBody}</p>
      </WizardFrame>
    </div>
  );
}
