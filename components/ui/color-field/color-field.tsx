"use client";

import { useState } from "react";

import { FOREGROUND_CONTRAST_MINIMUM, contrastRatio } from "../../../lib/colour/contrast";
import { formatContrastRatio } from "../../../lib/locale/format-number";
import type { CalendarLocale } from "../../../lib/locale/calendar-date";
import { classes } from "../classes";
import styles from "./color-field.module.css";

export type ColorFieldVariant = "standard" | "paired";
export type ColorFieldSize = "compact" | "comfortable";

export type ColorFieldVisual =
  | "default"
  | "hover"
  | "focus"
  | "active"
  | "disabled"
  | "error"
  | "empty";

const STORED = /^#[0-9a-f]{6}$/;

export function normaliseColorValue(raw: string): string | null {
  const lower = raw.toLowerCase();
  const withHash = lower.startsWith("#") ? lower : `#${lower}`;
  return STORED.test(withHash) ? withHash : null;
}

type ColorFieldProps = {
  variant?: ColorFieldVariant;
  size?: ColorFieldSize;
  state?: ColorFieldVisual;
  value?: string;
  onValueChange?: (value: string) => void;
  pairedWith?: string;
  locale?: CalendarLocale;
  passText?: string;
  failText?: string;
  emptyName: string;
  pickerName?: string;
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
  name?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  "aria-labelledby"?: string;
};

export function ColorField({
  variant = "standard",
  size,
  state,
  value = "",
  onValueChange,
  pairedWith,
  locale = "en",
  passText,
  failText,
  emptyName,
  pickerName,
  disabled = false,
  invalid = false,
  id,
  name,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  "aria-labelledby": ariaLabelledBy,
}: ColorFieldProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? value;
  const stored = normaliseColorValue(shown);
  const refused = shown.length > 0 && stored === null;
  const empty = shown.length === 0;
  const pairedValue = pairedWith ? normaliseColorValue(pairedWith) : null;
  const ratio = stored && pairedValue ? contrastRatio(stored, pairedValue) : null;
  const passes = ratio !== null && ratio >= FOREGROUND_CONTRAST_MINIMUM;
  const visual =
    state ??
    (disabled ? "disabled" : invalid || ariaInvalid || refused ? "error" : empty ? "empty" : "default");

  function commit(next: string) {
    setDraft(next);
    const normalised = normaliseColorValue(next);
    if (normalised) {
      setDraft(null);
      onValueChange?.(normalised);
    }
  }

  return (
    <div className={styles.root} data-variant={variant} data-state={visual} data-density={size}>
      <span className={styles.swatch} aria-hidden="true" style={stored ? { backgroundColor: stored } : undefined}>
        {stored ? null : emptyName}
      </span>
      <input
        id={id}
        name={name}
        className={styles.hex}
        dir="ltr"
        value={shown}
        disabled={disabled}
        spellCheck={false}
        autoCapitalize="off"
        aria-invalid={refused || invalid || ariaInvalid || undefined}
        aria-describedby={ariaDescribedBy}
        aria-labelledby={ariaLabelledBy}
        onChange={(event) => commit(event.target.value)}
      />
      {pickerName ? (
        <input
          className={styles.picker}
          type="color"
          aria-label={pickerName}
          disabled={disabled}
          value={stored ?? undefined}
          onChange={(event) => commit(event.target.value)}
        />
      ) : null}
      {variant === "paired" && ratio !== null && passText && failText ? (
        <p className={classes(styles.readout, passes ? styles.pass : styles.fail)}>
          <span>{formatContrastRatio(ratio, locale)}</span>
          {passes ? passText : failText}
        </p>
      ) : null}
    </div>
  );
}
