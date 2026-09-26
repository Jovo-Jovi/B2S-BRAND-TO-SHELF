"use client";

import { classes } from "../classes";
import styles from "./spinner.module.css";

export type SpinnerVariant = "standard";
export type SpinnerSize = "compact" | "comfortable";

export type SpinnerVisual = "default" | "loading";

type SpinnerProps = {
  variant?: SpinnerVariant;
  size?: SpinnerSize;
  state?: SpinnerVisual;
  className?: string;
};

export function Spinner({
  variant = "standard",
  size,
  state = "loading",
  className,
}: SpinnerProps) {
  return (
    <span
      className={classes(styles.arc, className)}
      data-variant={variant}
      data-state={state}
      data-density={size}
      aria-hidden="true"
    >
      <svg viewBox="0 0 16 16">
        <circle
          cx="8"
          cy="8"
          r="5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="23.6 7.8"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
