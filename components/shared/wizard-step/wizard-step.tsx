"use client";

import { useEffect, useRef, type ReactNode } from "react";

import type { CalendarLocale } from "../../../lib/locale/calendar-date";
import { fillPattern, formatCount } from "../../../lib/locale/format-number";
import { Button } from "../../ui/button/button";
import { Glyph } from "../../ui/glyphs";
import { TextLink } from "../../ui/text-link/text-link";
import styles from "./wizard-step.module.css";

export const WIZARD_STEPS = ["brand", "typography", "company", "guidelines", "review"] as const;
export type WizardStepId = (typeof WIZARD_STEPS)[number] | "welcome";
export type WizardScreen = WizardStepId | "complete";

export type WizardError = {
  fieldId: string;
  message: string;
  href?: string;
  rule?: string;
};

type WizardStepProps = {
  locale: CalendarLocale;
  current: WizardScreen;
  captions: Record<WizardStepId, string>;
  progress: string;
  eyebrowLabel?: string;
  title: string;
  titleLevel?: "h1" | "h2";
  purpose: string;
  back?: string;
  continueCaption?: string;
  save?: string;
  mark: string;
  tagline: string;
  localeHref: string;
  localeCaption: string;
  onBack?: () => void;
  onContinue?: () => void;
  onSave?: () => void;
  onStep?: (step: WizardStepId) => void;
  stepHref?: (step: (typeof WIZARD_STEPS)[number]) => string;
  errors: WizardError[];
  preview?: ReactNode;
  notice?: ReactNode;
  signOut: ReactNode;
  children?: ReactNode;
};

function indexOf(step: WizardScreen): number {
  if (step === "welcome") return -1;
  if (step === "complete") return WIZARD_STEPS.length;
  return WIZARD_STEPS.indexOf(step);
}

export function WizardStep({
  locale,
  current,
  captions,
  progress,
  eyebrowLabel,
  title,
  titleLevel = "h1",
  purpose,
  back,
  continueCaption,
  save,
  mark,
  tagline,
  localeHref,
  localeCaption,
  onBack,
  onContinue,
  onSave,
  onStep,
  stepHref,
  errors,
  preview,
  notice,
  signOut,
  children,
}: WizardStepProps) {
  const summaryRef = useRef<HTMLDivElement>(null);
  const currentIndex = indexOf(current);
  const showIndicator = current !== "welcome";
  const numbered = current !== "welcome" && current !== "complete";
  useEffect(() => {
    if (errors.length > 0) {
      summaryRef.current?.focus();
    }
  }, [errors]);

  const counted =
    numbered
      ? fillPattern(progress, {
          current: formatCount(currentIndex + 1, locale),
          total: formatCount(WIZARD_STEPS.length, locale),
          label: eyebrowLabel ?? captions[current],
        })
      : "";
  const progressNow = current === "complete" ? WIZARD_STEPS.length : currentIndex + 1;
  const compactLabel = current === "complete" ? captions.review : current === "welcome" ? "" : captions[current];
  const compact =
    showIndicator
      ? fillPattern(progress, {
          current: formatCount(progressNow, locale),
          total: formatCount(WIZARD_STEPS.length, locale),
          label: compactLabel,
        })
      : "";
  const fraction = current === "complete" ? 1 : numbered ? (currentIndex + 1) / WIZARD_STEPS.length : 0;

  const TitleTag = titleLevel === "h2" ? "h2" : "h1";
  const header = (
    <header className={styles.frameHeader}>
      <div className={styles.lockup}>
        <span className={styles.tile}>
          <Glyph name="mark" />
        </span>
        <span>
          <p className={styles.wordmark}>{mark}</p>
          <p className={styles.tagline}>{tagline}</p>
        </span>
      </div>
      <div className={styles.indicator}>
        {showIndicator ? (
          <>
            <ol className={styles.stepper}>
              {WIZARD_STEPS.map((step, index) => {
                const state = index < currentIndex ? "completed" : index === currentIndex ? "current" : "upcoming";
                const body = (
                  <>
                    <span className={styles.circle}>{formatCount(index + 1, locale)}</span>
                    <span>{captions[step]}</span>
                  </>
                );
                return (
                  <li key={step} data-step={step} data-step-state={state}>
                    {state === "completed" && stepHref ? (
                      <a
                        className={`${styles.step} ${styles.completed}`}
                        href={stepHref(step)}
                        onClick={(event) => {
                          if (!onStep) return;
                          event.preventDefault();
                          onStep(step);
                        }}
                      >
                        {body}
                      </a>
                    ) : state === "current" ? (
                      <span className={`${styles.step} ${styles.current}`} aria-current="step">
                        {body}
                      </span>
                    ) : (
                      <span className={`${styles.step} ${styles.upcoming}`}>{body}</span>
                    )}
                    {index < WIZARD_STEPS.length - 1 ? <span className={styles.connector} aria-hidden="true" /> : null}
                  </li>
                );
              })}
            </ol>
            {showIndicator ? (
              <div className={styles.compact}>
                <p className={styles.compactLine}>{compact}</p>
                <div
                  className={styles.bar}
                  role="progressbar"
                  aria-label={compact}
                  aria-valuemin={1}
                  aria-valuemax={WIZARD_STEPS.length}
                  aria-valuenow={progressNow}
                  aria-valuetext={compact}
                >
                  <span className={styles.fill} style={{ inlineSize: `${fraction * 100}%` }} />
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
      <div className={styles.headerEnd}>
        <TextLink href={localeHref} variant="standalone">
          {localeCaption}
        </TextLink>
        {signOut}
      </div>
    </header>
  );

  const heading = (
    <div className={styles.heading}>
      {numbered && eyebrowLabel ? <p className={styles.eyebrow}>{counted}</p> : null}
      <TitleTag className={styles.title}>{title}</TitleTag>
      <p className={styles.purpose}>{purpose}</p>
    </div>
  );

  const footer =
    back || save || continueCaption ? (
      <div className={styles.footer}>
        {back ? (
          <Button type="button" variant="quiet" onClick={onBack}>
            {back}
          </Button>
        ) : (
          <span />
        )}
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
    ) : null;

  return (
    <section className={styles.frame} data-composition="WizardStep" data-density="comfortable">
      {header}
      {current === "complete" ? (
        <div className={styles.complete}>
          <TitleTag className={styles.title}>{title}</TitleTag>
          <p className={styles.purpose}>{purpose}</p>
          {preview ? <div className={styles.completePreview}>{preview}</div> : null}
        </div>
      ) : (
        <div className={styles.layout}>
          {heading}
          {preview ? <div className={styles.preview}>{preview}</div> : null}
          <div className={styles.formBody}>
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
            {children}
          </div>
          {notice ? <div className={styles.noticeSlot}>{notice}</div> : null}
          {footer}
        </div>
      )}
    </section>
  );
}
