"use client";

import { cloneElement, useId, type ReactElement } from "react";

import { classes } from "../classes";
import { Glyph, glyphPath } from "../glyphs";
import styles from "./field.module.css";

export type FieldVariant = "standard";
export type FieldSize = "compact" | "comfortable";

export type FieldVisual = "default" | "hover" | "focus" | "active" | "disabled" | "loading" | "error";

type ControlProps = {
  id?: string;
  state?: string;
  invalid?: boolean;
  disabled?: boolean;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

type FieldProps = {
  variant?: FieldVariant;
  size?: FieldSize;
  state?: FieldVisual;
  caption: string;
  optional?: string;
  help?: string;
  error?: string;
  counter?: string;
  disabled?: boolean;
  children: ReactElement<ControlProps>;
};

export function Field({
  variant = "standard",
  size,
  state,
  caption,
  optional,
  help,
  error,
  counter,
  disabled = false,
  children,
}: FieldProps) {
  const generatedId = useId();
  const helpId = useId();
  const errorId = useId();
  const controlId = children.props.id ?? generatedId;
  const describedBy = [help ? helpId : null, error ? errorId : null].filter(Boolean).join(" ");
  const visual = state ?? (disabled ? "disabled" : error ? "error" : "default");
  const domChild = typeof children.type === "string";
  const control = cloneElement(children, {
    id: controlId,
    disabled: disabled || children.props.disabled,
    "aria-invalid": error ? true : children.props["aria-invalid"],
    "aria-describedby": describedBy || undefined,
    ...(domChild
      ? {}
      : {
          state: state ?? children.props.state,
          invalid: Boolean(error) || children.props.invalid,
        }),
  });

  return (
    <div className={classes(styles.root)} data-variant={variant} data-state={visual} data-density={size}>
      <label className={styles.caption} htmlFor={controlId}>
        {caption}
        {optional ? <span className={styles.optional}>{optional}</span> : null}
      </label>
      <div>{control}</div>
      {help ? (
        <p id={helpId} className={styles.help}>
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          <Glyph className={styles.icon} path={glyphPath.danger} circle dot />
          {error}
        </p>
      ) : null}
      {counter ? <p className={styles.counter}>{counter}</p> : null}
    </div>
  );
}
