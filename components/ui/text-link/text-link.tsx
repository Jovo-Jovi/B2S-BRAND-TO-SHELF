import type { ReactNode } from "react";

import { classes } from "../classes";
import styles from "./text-link.module.css";

export type TextLinkVariant = "inline" | "standalone";
export type TextLinkSize = "compact" | "comfortable";

export type TextLinkVisual = "default" | "hover" | "focus" | "active";

type TextLinkProps = {
  variant?: TextLinkVariant;
  size?: TextLinkSize;
  state?: TextLinkVisual;
  href: string;
  children: ReactNode;
  iconEnd?: ReactNode;
  newWindowName?: string;
};

export function TextLink({
  variant = "inline",
  size,
  state = "default",
  href,
  children,
  iconEnd,
  newWindowName,
}: TextLinkProps) {
  const newWindow = newWindowName !== undefined;
  return (
    <a
      className={classes(styles.root, styles[variant])}
      href={href}
      data-variant={variant}
      data-state={state}
      data-density={size}
      target={newWindow ? "_blank" : undefined}
      rel={newWindow ? "noopener" : undefined}
    >
      {children}
      {iconEnd ? (
        <span className={styles.icon} aria-label={newWindowName}>
          {iconEnd}
        </span>
      ) : null}
    </a>
  );
}
