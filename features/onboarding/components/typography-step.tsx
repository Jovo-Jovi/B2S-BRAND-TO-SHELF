"use client";

import { useRef, useState } from "react";

import { Field } from "@/components/ui/field/field";
import { FormSection } from "@/components/shared/form-section/form-section";
import { Select } from "@/components/ui/select/select";
import { fillPattern } from "@/lib/locale/format-number";
import { familiesFor, type TypefaceScript } from "@/lib/typeface/registry";
import type { WizardError, WizardStepId } from "@/components/shared/wizard-step/wizard-step";

import { submitTypography } from "../actions";
import type { BrandSnapshot, FaceValues, LocaleCode } from "../types";
import type { OnboardingCopy } from "./copy";
import { BrandProof } from "./proof";
import { WizardFrame } from "./wizard-frame";

type TypographyStepProps = {
  locale: LocaleCode;
  copy: OnboardingCopy;
  theme: string | null;
  snapshot: BrandSnapshot;
};

const PAIRS: { id: keyof FaceValues; field: string; script: TypefaceScript; role: "heading" | "body" }[] = [
  { id: "headingArabic", field: "heading-arabic", script: "arabic", role: "heading" },
  { id: "bodyArabic", field: "body-arabic", script: "arabic", role: "body" },
  { id: "headingLatin", field: "heading-latin", script: "latin", role: "heading" },
  { id: "bodyLatin", field: "body-latin", script: "latin", role: "body" },
];

export function TypographyStep({ locale, copy, theme, snapshot }: TypographyStepProps) {
  const [faces, setFaces] = useState<FaceValues>(snapshot.faces);
  const [errors, setErrors] = useState<WizardError[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [tab, setTab] = useState("label");
  const busy = useRef(false);

  function messages(gaps: string[]): WizardError[] {
    return gaps.map((gap) => {
      const pair = PAIRS.find((item) => item.field === gap);
      const role = pair?.role === "heading" ? copy.typefaceHeading : copy.typefaceBody;
      const script = pair?.script === "arabic" ? copy.typefaceArabic : copy.typefaceLatin;
      return { fieldId: gap, message: fillPattern(copy.typefaceMissing, { role, script }) };
    });
  }

  async function run(intent: "save" | "continue" | "back" | "step", step?: WizardStepId) {
    if (busy.current) return;
    busy.current = true;
    try {
      const result = await submitTypography({
        locale,
        intent,
        step,
        ...faces,
        theme: theme === "light" || theme === "dark" ? theme : undefined,
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

  function select(pair: (typeof PAIRS)[number]) {
    const options = [
      { value: "", caption: copy.typefaceUnchosen },
      ...familiesFor(pair.script).map((item) => ({ value: item.family, caption: item.family })),
    ];
    const role = pair.role === "heading" ? copy.typefaceHeading : copy.typefaceBody;
    return (
      <Field key={pair.field} caption={role} help={copy.typefaceHelp} error={errors.find((item) => item.fieldId === pair.field)?.message}>
        <Select
          id={pair.field}
          options={options}
          value={faces[pair.id]}
          onValueChange={(value) => setFaces((current) => ({ ...current, [pair.id]: value }))}
          noResults={copy.typefaceNoResults}
        />
      </Field>
    );
  }

  return (
    <WizardFrame
      locale={locale}
      copy={copy}
      current="typography"
      title={copy.typography}
      purpose={copy.typefacePurpose}
      theme={theme}
      errors={errors}
      onBack={() => void run("back")}
      onContinue={() => void run("continue")}
      onSave={() => void run("save")}
      onStep={(step) => void run("step", step)}
      preview={<BrandProof copy={copy} snapshot={{ ...snapshot, faces }} tab={tab} onTab={setTab} />}
    >
      {notice ? <p role="status">{notice}</p> : null}
      <FormSection title={copy.typefaceSectionArabic} description={copy.typefaceSectionArabicBody}>
        {select(PAIRS[0])}
        {select(PAIRS[1])}
      </FormSection>
      <FormSection title={copy.typefaceSectionLatin} description={copy.typefaceSectionLatinBody}>
        {select(PAIRS[2])}
        {select(PAIRS[3])}
      </FormSection>
    </WizardFrame>
  );
}
