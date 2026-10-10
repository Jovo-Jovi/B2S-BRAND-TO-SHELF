"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

import { classes } from "../classes";
import { Spinner } from "../spinner/spinner";
import styles from "./button.module.css";

export type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";
export type ButtonSize = "compact" | "comfortable";

export type ButtonVisual = "default" | "hover" | "focus" | "active" | "disabled" | "loading";

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  state?: ButtonVisual;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  accessibleName?: string;
  children?: ReactNode;
  onClick?: () => void;
};

export function Button({
  variant = "primary",
  size,
  state,
  type = "button",
  disabled = false,
  loading = false,
  iconStart,
  iconEnd,
  accessibleName,
  children,
  onClick,
}: ButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const lockedRef = useRef<string | null>(null);
  const visual = state ?? (disabled ? "disabled" : loading ? "loading" : "default");
  const namedByText = children !== undefined && children !== null && children !== "";

  useLayoutEffect(() => {
    const element = buttonRef.current;
    if (!element) {
      return;
    }
    if (!loading) {
      const measured = element.getBoundingClientRect().width;
      if (measured > 0) {
        lockedRef.current = `${measured}px`;
      }
      element.style.inlineSize = "";
      return;
    }
    if (lockedRef.current) {
      element.style.inlineSize = lockedRef.current;
    }
  }, [loading]);

  return (
    <button
      ref={buttonRef}
      type={type}
      className={classes(styles.root, styles[variant])}
      data-variant={variant}
      data-state={visual}
      data-density={size}
      disabled={disabled || undefined}
      aria-disabled={loading ? true : undefined}
      aria-busy={loading ? true : undefined}
      aria-label={namedByText ? undefined : accessibleName}
      onClick={(event) => {
        if (loading || disabled) {
          event.preventDefault();
          return;
        }
        onClick?.();
      }}
    >
      {loading ? <Spinner state="loading" /> : iconStart ? <span className={styles.icon}>{iconStart}</span> : null}
      {children}
      {iconEnd ? <span className={styles.icon}>{iconEnd}</span> : null}
    </button>
  );
}
