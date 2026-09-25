"use client";

import { useId, useState, type ReactNode } from "react";

import { classes } from "../classes";
import { Glyph, glyphPath } from "../glyphs";
import { Spinner } from "../spinner/spinner";
import {
  IDENTIFIER_DIGIT_ERROR,
  hasArabicIndicDigit,
  normaliseNumberInput,
} from "./digits";
import styles from "./text-field.module.css";

export type TextFieldVariant = "text" | "email" | "number" | "identifier" | "multiline";
export type TextFieldSize = "compact" | "comfortable";

export type TextFieldVisual = "default" | "hover" | "focus" | "disabled" | "loading" | "error" | "empty";

type TextFieldProps = {
  variant?: TextFieldVariant;
  size?: TextFieldSize;
  state?: TextFieldVisual;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onIdentifierError?: (code: typeof IDENTIFIER_DIGIT_ERROR | null) => void;
  placeholder?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  clearAccessibleName?: string;
  digitError?: string;
  invalid?: boolean;
  disabled?: boolean;
  loading?: boolean;
  id?: string;
  name?: string;
  dir?: "ltr" | "rtl";
  lang?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  "aria-labelledby"?: string;
};

export function TextField({
  variant = "text",
  size,
  state,
  value,
  defaultValue = "",
  onValueChange,
  onIdentifierError,
  placeholder,
  prefix,
  suffix,
  clearAccessibleName,
  digitError,
  invalid = false,
  disabled = false,
  loading = false,
  id,
  name,
  dir,
  lang,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  "aria-labelledby": ariaLabelledBy,
}: TextFieldProps) {
  const generatedId = useId();
  const errorId = useId();
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const [digitRejected, setDigitRejected] = useState(false);
  const current = value !== undefined ? value : uncontrolled;
  const isolated = variant === "email" || variant === "identifier";
  const inputDir = isolated ? "ltr" : dir;
  const empty = current.length === 0;
  const showInvalid = invalid || ariaInvalid || digitRejected;
  const visual =
    state ??
    (disabled ? "disabled" : showInvalid ? "error" : loading ? "loading" : empty ? "empty" : "default");

  function commit(next: string) {
    if (variant === "identifier" && hasArabicIndicDigit(next)) {
      setDigitRejected(true);
      onIdentifierError?.(IDENTIFIER_DIGIT_ERROR);
      if (value === undefined) {
        setUncontrolled(next);
      }
      onValueChange?.(next);
      return;
    }
    setDigitRejected(false);
    onIdentifierError?.(null);
    const stored = variant === "number" ? normaliseNumberInput(next) : next;
    if (value === undefined) {
      setUncontrolled(stored);
    }
    onValueChange?.(stored);
  }

  const described = [ariaDescribedBy, digitRejected && digitError ? errorId : null].filter(Boolean).join(" ");
  const shared = {
    id: id ?? generatedId,
    name,
    className: classes(styles.input, variant === "multiline" && styles.multiline, variant === "number" && styles.number, (isolated || inputDir) && styles.isolate),
    value: current,
    placeholder,
    disabled,
    dir: inputDir,
    lang,
    spellCheck: variant === "identifier" ? false : undefined,
    autoCapitalize: variant === "identifier" ? "off" : undefined,
    inputMode: variant === "number" ? ("decimal" as const) : variant === "email" ? ("email" as const) : undefined,
    "aria-invalid": showInvalid || undefined,
    "aria-describedby": described || undefined,
    "aria-labelledby": ariaLabelledBy,
    "aria-busy": loading || undefined,
    onChange: (event: { target: { value: string } }) => commit(event.target.value),
    onKeyDown: (event: { key: string; preventDefault: () => void }) => {
      if (event.key === "Escape" && clearAccessibleName) {
        event.preventDefault();
        commit("");
      }
    },
  };

  return (
    <div>
      <div className={styles.root} data-variant={variant} data-state={visual} data-density={size} data-error-code={digitRejected ? IDENTIFIER_DIGIT_ERROR : undefined}>
        {prefix ? <span className={styles.affix}>{prefix}</span> : null}
        {variant === "multiline" ? <textarea {...shared} /> : <input {...shared} type={variant === "email" ? "email" : "text"} />}
        {loading ? <Spinner state="loading" /> : null}
        {suffix ? <span className={styles.affix}>{suffix}</span> : null}
        {clearAccessibleName ? (
          <button type="button" className={styles.clear} aria-label={clearAccessibleName} onClick={() => commit("")}>
            <Glyph path={glyphPath.cross} />
          </button>
        ) : null}
      </div>
      {digitRejected && digitError ? (
        <p id={errorId} className={styles.digitError} role="alert">
          {digitError}
        </p>
      ) : null}
    </div>
  );
}
