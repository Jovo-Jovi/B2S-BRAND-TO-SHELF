import type { ReactNode } from "react";

import { classes } from "../classes";
import styles from "./status-badge.module.css";

export type StatusBadgeVariant = "neutral" | "success" | "warning" | "danger" | "info";
export type StatusBadgeSize = "compact";

export type StatusBadgeVisual = "default" | "error";

type StatusBadgeProps = {
  variant: StatusBadgeVariant;
  text: string;
  icon?: ReactNode;
  size?: StatusBadgeSize;
  state?: StatusBadgeVisual;
};

export function StatusBadge({
  variant,
  text,
  icon,
  size = "compact",
  state = "default",
}: StatusBadgeProps) {
  const tone = state === "error" ? "danger" : variant;
  return (
    <span
      className={classes(styles.root, styles[tone])}
      data-variant={variant}
      data-state={state}
      data-density={size}
      data-tone={tone}
    >
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      {text}
    </span>
  );
}
