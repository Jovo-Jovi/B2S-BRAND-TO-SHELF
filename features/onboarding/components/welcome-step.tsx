"use client";

import { useRef, useState } from "react";

import { Field } from "@/components/ui/field/field";
import { RadioGroup } from "@/components/ui/radio-group/radio-group";
import { Select } from "@/components/ui/select/select";
import { TextField } from "@/components/ui/text-field/text-field";
import type { WizardError } from "@/components/shared/wizard-step/wizard-step";

import { submitWelcome } from "../actions";
import { CURRENCIES, type LocaleCode } from "../types";
import type { OnboardingCopy } from "./copy";
import { WizardFrame } from "./wizard-frame";

type WelcomeStepProps = {
  locale: LocaleCode;
  copy: OnboardingCopy;
  theme: string | null;
};

const CURRENCY_CAPTION: Record<(typeof CURRENCIES)[number], keyof OnboardingCopy> = {
  EGP: "currencyEgp",
  USD: "currencyUsd",
  SAR: "currencySar",
  AED: "currencyAed",
  EUR: "currencyEur",
};

export function WelcomeStep({ locale, copy, theme }: WelcomeStepProps) {
  const [businessLocale, setBusinessLocale] = useState<LocaleCode>(locale);
  const [currency, setCurrency] = useState<(typeof CURRENCIES)[number]>("EGP");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<WizardError[]>([]);
  const busy = useRef(false);

  function messages(gaps: string[]): WizardError[] {
    return gaps.map((gap) => {
      if (gap === "name") return { fieldId: "welcome-name", message: copy.welcomeNameMissing };
      if (gap === "cap") return { fieldId: "welcome-name", message: copy.cap };
      if (gap === "rate") return { fieldId: "welcome-name", message: copy.rate };
      return { fieldId: "welcome-name", message: copy.refused };
    });
  }

  async function run() {
    if (busy.current) return;
    busy.current = true;
    try {
      const result = await submitWelcome({
        locale,
        businessLocale,
        currency,
        name,
        intent: "continue",
        theme: theme === "light" || theme === "dark" ? theme : undefined,
      });
      if (result?.gaps?.length) setErrors(messages(result.gaps));
    } finally {
      busy.current = false;
    }
  }

  return (
    <WizardFrame
      locale={locale}
      copy={copy}
      current="welcome"
      title={copy.welcome}
      purpose={copy.welcomePurpose}
      theme={theme}
      errors={errors}
      onBack={() => undefined}
      onContinue={() => void run()}
      onSave={() => void run()}
      onStep={() => undefined}
    >
      <RadioGroup
        name="business-locale"
        caption={copy.welcomeLanguage}
        options={[
          { value: "en", caption: copy.localeEn },
          { value: "ar", caption: copy.localeAr },
        ]}
        value={businessLocale}
        onValueChange={(value) => setBusinessLocale(value === "ar" ? "ar" : "en")}
      />
      <Field caption={copy.welcomeCurrency} help={copy.welcomeCurrencyHelp}>
        <Select
          id="welcome-currency"
          options={CURRENCIES.map((code) => ({ value: code, caption: copy[CURRENCY_CAPTION[code]] }))}
          value={currency}
          onValueChange={(value) => {
            const match = CURRENCIES.find((code) => code === value);
            if (match) setCurrency(match);
          }}
          noResults={copy.welcomeCurrency}
        />
      </Field>
      <Field caption={copy.welcomeName} help={copy.welcomeNameHelp} error={errors.find((item) => item.fieldId === "welcome-name")?.message}>
        <TextField
          id="welcome-name"
          value={name}
          onValueChange={setName}
          dir={businessLocale === "ar" ? "rtl" : "ltr"}
          lang={businessLocale}
        />
      </Field>
    </WizardFrame>
  );
}
