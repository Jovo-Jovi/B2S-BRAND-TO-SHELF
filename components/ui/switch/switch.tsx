"use client";

import { useState } from "react";

import { classes } from "../classes";
import { Spinner } from "../spinner/spinner";
import styles from "./switch.module.css";

export type SwitchVariant = "standard";
export type SwitchSize = "compact" | "comfortable";

export type SwitchVisual =
  | "default"
  | "hover"
  | "focus"
  | "active"
  | "disabled"
  | "loading"
  | "error"
  | "checked";

type SwitchProps = {
  variant?: SwitchVariant;
  size?: SwitchSize;
  state?: SwitchVisual;
  caption: string;
  onText: string;
  offText: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  loading?: boolean;
  error?: boolean;
  id?: string;
};

export function Switch({
  variant = "standard",
  size,
  state,
  caption,
  onText,
  offText,
  checked = false,
  onCheckedChange,
  disabled = false,
  loading = false,
  error = false,
  id,
}: SwitchProps) {
  const [previous, setPrevious] = useState(checked);
  const [attempt, setAttempt] = useState<boolean | null>(null);
  if (!error && attempt !== null && checked === attempt) {
    setAttempt(null);
  }
  const shown = error ? previous : (attempt ?? checked);
  const visual =
    state ??
    (disabled ? "disabled" : error ? "error" : loading ? "loading" : shown ? "checked" : "default");

  function toggle() {
    if (disabled || loading || error) return;
    const base = attempt ?? checked;
    setPrevious(base);
    const next = !base;
    setAttempt(next);
    onCheckedChange?.(next);
  }

  return (
    <button
      id={id}
      type="button"
      role="switch"
      className={classes(styles.root, shown && styles.checked)}
      data-variant={variant}
      data-state={visual}
      data-density={size}
      aria-checked={shown}
      aria-busy={loading || undefined}
      disabled={disabled || undefined}
      onClick={() => {
        if (disabled || loading) return;
        toggle();
      }}
    >
      <span className={styles.track}>
        <span className={styles.thumb}>{loading ? <Spinner className={styles.thumbSpinner} state="loading" /> : null}</span>
      </span>
      <span>{caption}</span>
      <span data-part="state-text">{shown ? onText : offText}</span>
    </button>
  );
}
