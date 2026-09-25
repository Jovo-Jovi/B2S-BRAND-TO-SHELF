"use client";

import { useEffect, useId, useRef } from "react";

import { Glyph, glyphPath } from "../glyphs";
import styles from "./checkbox.module.css";

export type CheckboxVariant = "standard" | "indeterminate";
export type CheckboxSize = "compact" | "comfortable";

export type CheckboxVisual = "default" | "hover" | "focus" | "active" | "disabled" | "error" | "checked";

type CheckboxProps = {
  variant?: CheckboxVariant;
  size?: CheckboxSize;
  state?: CheckboxVisual;
  caption: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
  name?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

export function Checkbox({
  variant = "standard",
  size,
  state,
  caption,
  checked = false,
  onCheckedChange,
  disabled = false,
  invalid = false,
  id,
  name,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: CheckboxProps) {
  const generatedId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const visual = state ?? (disabled ? "disabled" : invalid || ariaInvalid ? "error" : checked ? "checked" : "default");

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = variant === "indeterminate";
    }
  }, [variant]);

  return (
    <label className={styles.row} data-variant={variant} data-state={visual} data-density={size}>
      <span className={styles.control}>
        <input
          ref={inputRef}
          id={id ?? generatedId}
          className={styles.box}
          type="checkbox"
          name={name}
          checked={checked}
          disabled={disabled || undefined}
          aria-invalid={invalid || ariaInvalid || undefined}
          aria-describedby={ariaDescribedBy}
          onChange={(event) => onCheckedChange?.(event.target.checked)}
        />
        <Glyph className={styles.mark} path={glyphPath.check} />
      </span>
      <span>{caption}</span>
    </label>
  );
}
