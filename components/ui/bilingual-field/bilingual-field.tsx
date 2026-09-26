"use client";

import { useId } from "react";

import { classes } from "../classes";
import { TextField } from "../text-field/text-field";
import styles from "./bilingual-field.module.css";

export type BilingualFieldVariant = "single" | "multiline";
export type BilingualFieldSize = "compact" | "comfortable";

export type BilingualLocale = "en" | "ar";

export type BilingualFieldVisual =
  | "default"
  | "hover"
  | "focus"
  | "disabled"
  | "error"
  | "empty"
  | "complete";

type LocaleCopy = Record<BilingualLocale, string>;

type BilingualFieldProps = {
  variant?: BilingualFieldVariant;
  size?: BilingualFieldSize;
  state?: BilingualFieldVisual;
  caption: string;
  defaultLocale: BilingualLocale;
  values: LocaleCopy;
  onValuesChange?: (values: LocaleCopy) => void;
  localeName: LocaleCopy;
  missingText: LocaleCopy;
  completeText: string;
  help?: string;
  error?: string;
  errorLocale?: BilingualLocale;
  disabled?: boolean;
  placeholder?: LocaleCopy;
};

const OTHER: Record<BilingualLocale, BilingualLocale> = { en: "ar", ar: "en" };

export function BilingualField({
  variant = "single",
  size,
  state,
  caption,
  defaultLocale,
  values,
  onValuesChange,
  localeName,
  missingText,
  completeText,
  help,
  error,
  errorLocale,
  disabled = false,
  placeholder,
}: BilingualFieldProps) {
  const captionId = useId();
  const helpId = useId();
  const errorId = useId();
  const order: BilingualLocale[] = [defaultLocale, OTHER[defaultLocale]];
  const filled = {
    en: values.en.trim().length > 0,
    ar: values.ar.trim().length > 0,
  };
  const complete = filled.en && filled.ar;
  const visual = state ?? (disabled ? "disabled" : error ? "error" : complete ? "complete" : "empty");
  const textVariant = variant === "multiline" ? "multiline" : "text";

  return (
    <fieldset
      className={styles.root}
      data-variant={variant}
      data-state={visual}
      data-density={size}
      data-complete={complete ? "true" : "false"}
      disabled={disabled || undefined}
    >
      <legend id={captionId} className={styles.caption}>
        {caption}
      </legend>
      {order.map((locale) => {
        const tagId = `${captionId}-${locale}`;
        return (
          <div key={locale} className={styles.group} data-locale={locale}>
            <span id={tagId} className={styles.tag} lang={locale}>
              {localeName[locale]}
            </span>
            <TextField
              variant={textVariant}
              size={size}
              state={state === "hover" || state === "focus" || state === "disabled" ? state : undefined}
              value={values[locale]}
              onValueChange={(next) => onValuesChange?.({ ...values, [locale]: next })}
              dir={locale === "ar" ? "rtl" : "ltr"}
              lang={locale}
              disabled={disabled}
              invalid={Boolean(error) && errorLocale === locale}
              placeholder={placeholder?.[locale]}
              aria-labelledby={`${captionId} ${tagId}`}
              aria-describedby={[help ? helpId : null, error && errorLocale === locale ? errorId : null].filter(Boolean).join(" ") || undefined}
            />
          </div>
        );
      })}
      <p className={classes(styles.indicator, complete ? styles.complete : styles.missing)} data-part="completion">
        {complete
          ? completeText
          : order
              .filter((locale) => !filled[locale])
              .map((locale) => <span key={locale}>{missingText[locale]}</span>)}
      </p>
      {help ? (
        <p id={helpId} className={styles.help}>
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
