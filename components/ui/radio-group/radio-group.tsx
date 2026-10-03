"use client";

import { useId, type KeyboardEvent } from "react";

import { classes } from "../classes";
import styles from "./radio-group.module.css";

export type RadioGroupVariant = "vertical" | "horizontal";
export type RadioGroupSize = "compact" | "comfortable";

export type RadioGroupVisual = "default" | "hover" | "focus" | "active" | "disabled" | "error" | "checked";

export type RadioOption = {
  value: string;
  caption: string;
};

type RadioGroupProps = {
  variant?: RadioGroupVariant;
  size?: RadioGroupSize;
  state?: RadioGroupVisual;
  caption: string;
  options: RadioOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  name?: string;
  "aria-describedby"?: string;
};

function arrowDelta(key: string, rtl: boolean): number {
  if (key === "ArrowDown") return 1;
  if (key === "ArrowUp") return -1;
  if (key === "ArrowRight") return rtl ? -1 : 1;
  if (key === "ArrowLeft") return rtl ? 1 : -1;
  return 0;
}

function readingDirection(element: HTMLElement): boolean {
  const marked = element.closest("[dir]")?.getAttribute("dir");
  if (marked === "rtl" || marked === "ltr") {
    return marked === "rtl";
  }
  return getComputedStyle(element).direction === "rtl";
}

export function RadioGroup({
  variant = "vertical",
  size,
  state,
  caption,
  options,
  value,
  onValueChange,
  disabled = false,
  invalid = false,
  name,
  "aria-describedby": ariaDescribedBy,
}: RadioGroupProps) {
  const generatedName = useId();
  const groupName = name ?? generatedName;
  const selected = value ?? "";
  const visual =
    state ?? (disabled ? "disabled" : invalid ? "error" : selected ? "checked" : "default");

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const delta = arrowDelta(event.key, readingDirection(event.currentTarget));
    if (delta === 0) return;
    event.preventDefault();
    const inputs = [...event.currentTarget.closest("fieldset")!.querySelectorAll<HTMLInputElement>("input[type='radio']")];
    const index = inputs.indexOf(event.currentTarget);
    const next = inputs[(index + delta + inputs.length) % inputs.length];
    next.focus();
    onValueChange?.(next.value);
  }

  return (
    <fieldset
      className={classes(styles.group, variant === "horizontal" && styles.horizontal)}
      data-variant={variant}
      data-state={visual}
      data-density={size}
      disabled={disabled || undefined}
      aria-invalid={invalid || undefined}
      aria-describedby={ariaDescribedBy}
    >
      <legend className={styles.caption}>{caption}</legend>
      {options.map((option) => {
        const checked = option.value === selected;
        return (
          <label key={option.value} className={styles.option}>
            <span className={styles.control}>
              <input
                className={styles.radio}
                type="radio"
                name={groupName}
                value={option.value}
                checked={checked}
                disabled={disabled || undefined}
                tabIndex={checked || (!selected && option === options[0]) ? 0 : -1}
                onChange={() => onValueChange?.(option.value)}
                onKeyDown={onKeyDown}
              />
              <span className={styles.dot} aria-hidden="true" />
            </span>
            <span>{option.caption}</span>
          </label>
        );
      })}
    </fieldset>
  );
}
