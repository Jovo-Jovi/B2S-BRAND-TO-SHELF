"use client";

import { useEffect, useRef, type ReactNode } from "react";

import type { CalendarLocale } from "../../../lib/locale/calendar-date";
import { fillPattern, formatCount } from "../../../lib/locale/format-number";
import { Button } from "../../ui/button/button";
import { TextLink } from "../../ui/text-link/text-link";
import styles from "./wizard-step.module.css";

export const WIZARD_STEPS = ["brand", "typography", "company", "guidelines", "review"] as const;
export type WizardStepId = (typeof WIZARD_STEPS)[number] | "welcome";

export type WizardError = {
  fieldId: string;
  message: string;
  href?: string;
  rule?: string;
};

type WizardStepProps = {
  locale: CalendarLocale;
  current: WizardStepId;
  captions: Record<WizardStepId, string>;
  progress: string;
  title: string;
  purpose: string;
  back?: string;
  continueCaption?: string;
  save?: string;
  mark: string;
  localeHref: string;
  localeCaption: string;
  onBack?: () => void;
  onContinue?: () => void;
  onSave?: () => void;
  onStep: (step: WizardStepId) => void;
  errors: WizardError[];
  preview?: ReactNode;
  children: ReactNode;
};

function indexOf(step: WizardStepId): number {
  if (step === "welcome") {
    return -1;
  }
  return WIZARD_STEPS.indexOf(step);
}

export function WizardStep({
  locale,
  current,
  captions,
  progress,
  title,
  purpose,
  back,
  continueCaption,
  save,
  mark,
  localeHref,
  localeCaption,
  onBack,
  onContinue,
  onSave,
  onStep,
  errors,
  preview,
  children,
}: WizardStepProps) {
  const summaryRef = useRef<HTMLDivElement>(null);
  const currentIndex = indexOf(current);
  useEffect(() => {
    if (errors.length > 0) {
      summaryRef.current?.focus();
    }
  }, [errors]);

  const welcomeReached = current !== "welcome";

  return (
    <section className={styles.frame} data-composition="WizardStep">
      <header className={styles.frameHeader}>
        <p className={styles.mark}>{mark}</p>
        <TextLink href={localeHref} variant="standalone">
          {localeCaption}
        </TextLink>
        <ol className={styles.stepper}>
        <li>
          {welcomeReached ? (
            <span>{captions.welcome}</span>
          ) : (
            <span aria-current="step">{captions.welcome}</span>
          )}
        </li>
        {WIZARD_STEPS.map((step, index) => {
          const number = formatCount(index + 1, locale);
          const caption = captions[step];
          if (index < currentIndex) {
            return (
              <li key={step}>
                <Button type="button" variant="quiet" onClick={() => onStep(step)}>
                  <span>{number}</span>
                  <span>{caption}</span>
                </Button>
              </li>
            );
          }
          if (index === currentIndex) {
            return (
              <li key={step}>
                <span aria-current="step">
                  <span>{number}</span>
                  <span>{caption}</span>
                </span>
              </li>
            );
          }
          return (
            <li key={step}>
              <span>
                <span>{number}</span>
                <span>{caption}</span>
              </span>
            </li>
          );
        })}
        </ol>
      </header>
      <div className={styles.layout}>
        <div className={styles.formColumn}>
      {current !== "welcome" ? (
        <p>{fillPattern(progress, { current: formatCount(currentIndex + 1, locale), total: formatCount(WIZARD_STEPS.length, locale) })}</p>
      ) : null}
      {errors.length > 0 ? (
        <div className={styles.summary} role="alert" tabIndex={-1} ref={summaryRef}>
          <ul>
            {errors.map((error, index) => (
              <li key={`${error.fieldId}-${index}`}>
                <a href={error.href ?? `#${error.fieldId}`} data-rule={error.rule}>
                  {error.message}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.purpose}>{purpose}</p>
      {children}
      {back || save || continueCaption ? (
        <div className={styles.footer}>
          {back ? (
            <Button type="button" variant="quiet" onClick={onBack}>
              {back}
            </Button>
          ) : null}
          <div className={styles.end}>
            {save ? (
              <Button type="button" variant="secondary" onClick={onSave}>
                {save}
              </Button>
            ) : null}
            {continueCaption ? (
              <Button type="button" variant="primary" onClick={onContinue}>
                {continueCaption}
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
        </div>
        {preview ? <div className={styles.preview}>{preview}</div> : null}
      </div>
    </section>
  );
}
