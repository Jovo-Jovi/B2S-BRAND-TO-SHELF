"use client";

import { useRef, useState } from "react";

import { BilingualField } from "@/components/ui/bilingual-field/bilingual-field";
import { Field } from "@/components/ui/field/field";
import { FormSection } from "@/components/shared/form-section/form-section";
import { TextField } from "@/components/ui/text-field/text-field";
import { fillPattern } from "@/lib/locale/format-number";
import type { WizardError, WizardStepId } from "@/components/shared/wizard-step/wizard-step";

import { submitCompany } from "../actions";
import type { LegalValues, LocaleCode } from "../types";
import type { OnboardingCopy } from "./copy";
import { WizardFrame } from "./wizard-frame";

type CompanyStepProps = {
  locale: LocaleCode;
  copy: OnboardingCopy;
  theme: string | null;
  values: LegalValues;
  defaultLocale: LocaleCode;
};

const GAP_FIELD: Record<string, string> = {
  "legal-name-en": "legal-name-en",
  "legal-name-ar": "legal-name-ar",
  "address-en": "address-en",
  "address-ar": "address-ar",
  tax: "tax",
  email: "email",
  phone: "phone",
};

export function CompanyStep({ locale, copy, theme, values, defaultLocale }: CompanyStepProps) {
  const [legalName, setLegalName] = useState(values.legalName);
  const [tradingName, setTradingName] = useState(values.tradingName);
  const [address, setAddress] = useState(values.address);
  const [tax, setTax] = useState(values.tax);
  const [email, setEmail] = useState(values.email);
  const [phone, setPhone] = useState(values.phone);
  const [errors, setErrors] = useState<WizardError[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const busy = useRef(false);

  function messages(gaps: string[]): WizardError[] {
    return gaps.map((gap) => {
      const named = gap.endsWith("-ar") ? copy.localeAr : copy.localeEn;
      if (gap.startsWith("legal-name")) return { fieldId: GAP_FIELD[gap] ?? gap, message: fillPattern(copy.legalNameMissing, { locale: named }) };
      if (gap.startsWith("address")) return { fieldId: GAP_FIELD[gap] ?? gap, message: fillPattern(copy.addressMissing, { locale: named }) };
      if (gap === "tax") return { fieldId: "tax", message: copy.taxInvalid };
      if (gap === "email") return { fieldId: "email", message: copy.emailInvalid };
      if (gap === "phone") return { fieldId: "phone", message: copy.phoneInvalid };
      return { fieldId: "legal-name-en", message: copy.refused };
    });
  }

  async function run(intent: "save" | "continue" | "back" | "step", step?: WizardStepId) {
    if (busy.current) return;
    busy.current = true;
    try {
      const result = await submitCompany({
        locale,
        intent,
        step,
        legalName,
        tradingName,
        address,
        tax,
        email,
        phone,
        theme: theme === "light" || theme === "dark" ? theme : undefined,
      });
      if (result?.phone) setPhone(result.phone);
      if (result?.gaps?.length) {
        setNotice(result.notice === "saved" ? copy.saved : null);
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

  const legalError = errors.find((item) => item.fieldId.startsWith("legal-name"));
  const addressError = errors.find((item) => item.fieldId.startsWith("address"));
  const bilingual = {
    localeName: { en: copy.localeEn, ar: copy.localeAr },
    missingText: { en: copy.localeEn, ar: copy.localeAr },
  };

  return (
    <WizardFrame
      locale={locale}
      copy={copy}
      current="company"
      title={copy.company}
      purpose={copy.companyPurpose}
      theme={theme}
      errors={errors}
      onBack={() => void run("back")}
      onContinue={() => void run("continue")}
      onSave={() => void run("save")}
      onStep={(step) => void run("step", step === "welcome" ? "brand" : step)}
    >
      {notice ? <p role="status">{notice}</p> : null}
      <FormSection title={copy.companyLegal} description={copy.companyLegalBody}>
        <div id="legal-name">
          <span id="legal-name-en" />
          <span id="legal-name-ar" />
          <BilingualField
            caption={copy.legalName}
            defaultLocale={defaultLocale}
            values={legalName}
            onValuesChange={setLegalName}
            {...bilingual}
            completeText={copy.legalName}
            error={legalError?.message}
            errorLocale={legalError?.fieldId.endsWith("ar") ? "ar" : legalError ? "en" : undefined}
          />
        </div>
        <BilingualField
          caption={copy.tradingName}
          defaultLocale={defaultLocale}
          values={tradingName}
          onValuesChange={setTradingName}
          {...bilingual}
          completeText={copy.tradingName}
          help={copy.optional}
        />
        <Field caption={copy.taxNumber} optional={copy.optional} error={errors.find((item) => item.fieldId === "tax")?.message}>
          <TextField id="tax" variant="identifier" value={tax} onValueChange={setTax} dir="ltr" />
        </Field>
      </FormSection>
      <FormSection title={copy.companyAddress} description={copy.companyAddressBody}>
        <div id="registered-address">
          <span id="address-en" />
          <span id="address-ar" />
          <BilingualField
            variant="multiline"
            caption={copy.companyAddress}
            defaultLocale={defaultLocale}
            values={address}
            onValuesChange={setAddress}
            {...bilingual}
            completeText={copy.companyAddress}
            error={addressError?.message}
            errorLocale={addressError?.fieldId.endsWith("ar") ? "ar" : addressError ? "en" : undefined}
          />
        </div>
      </FormSection>
      <FormSection title={copy.companyContact} description={copy.companyContactBody}>
        <Field caption={copy.emailCaption} optional={copy.optional} error={errors.find((item) => item.fieldId === "email")?.message}>
          <TextField id="email" variant="email" value={email} onValueChange={setEmail} />
        </Field>
        <Field caption={copy.phoneCaption} optional={copy.optional} error={errors.find((item) => item.fieldId === "phone")?.message}>
          <TextField id="phone" value={phone} onValueChange={setPhone} dir="ltr" />
        </Field>
      </FormSection>
    </WizardFrame>
  );
}
