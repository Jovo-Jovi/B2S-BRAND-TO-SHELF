"use client";

import { useState } from "react";

import type { BrandSnapshot, LocaleCode } from "../types";
import type { OnboardingCopy } from "./copy";
import { BrandProof } from "./proof";
import { WizardFrame } from "./wizard-frame";

type CompletionScreenProps = {
  locale: LocaleCode;
  copy: OnboardingCopy;
  theme: string | null;
  snapshot: BrandSnapshot;
};

export function CompletionScreen({ locale, copy, theme, snapshot }: CompletionScreenProps) {
  const [tab, setTab] = useState("label");
  return (
    <WizardFrame
      locale={locale}
      copy={copy}
      current="complete"
      title={copy.completeTitle}
      purpose={copy.completeBody}
      theme={theme}
      errors={[]}
      preview={<BrandProof copy={copy} snapshot={snapshot} tab={tab} onTab={setTab} />}
    />
  );
}
