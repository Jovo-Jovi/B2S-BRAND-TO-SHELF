"use client";

import {
  cloneElement,
  useEffect,
  useId,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
} from "react";

import styles from "./tooltip.module.css";

export type TooltipVariant = "standard";
export type TooltipSize = "compact";

export type TooltipVisual = "default" | "hover" | "focus";

type TriggerProps = {
  disabled?: boolean;
  "aria-describedby"?: string;
  onFocus?: (event: FocusEvent<HTMLElement>) => void;
  onBlur?: (event: FocusEvent<HTMLElement>) => void;
  onMouseEnter?: (event: MouseEvent<HTMLElement>) => void;
  onMouseLeave?: (event: MouseEvent<HTMLElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
};

type TooltipProps = {
  text: string;
  children: ReactElement;
  variant?: TooltipVariant;
  size?: TooltipSize;
  state?: TooltipVisual;
};

function tokenMilliseconds(name: string): number | null {
  if (typeof document === "undefined") {
    return null;
  }
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const match = /^(\d+(?:\.\d+)?)ms$/.exec(raw);
  return match ? Number(match[1]) : null;
}

export function Tooltip({
  text,
  children,
  variant = "standard",
  size = "compact",
  state,
}: TooltipProps) {
  const bubbleId = useId();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const triggerProps = children.props as TriggerProps;
  const disabled = triggerProps.disabled === true;
  const visible = state === "hover" || state === "focus" || (state === undefined && open);

  useEffect(() => {
    if (!pending) {
      return;
    }
    const ms = tokenMilliseconds("--b2s-delay-tooltip");
    if (ms === null) {
      return;
    }
    const timer = window.setTimeout(() => {
      setOpen(true);
      setPending(false);
    }, ms);
    return () => {
      window.clearTimeout(timer);
    };
  }, [pending]);

  function showNow() {
    setPending(false);
    setOpen(true);
  }

  function hide() {
    setPending(false);
    setOpen(false);
  }

  function showAfterDelay() {
    setOpen(false);
    setPending(true);
  }

  if (disabled) {
    return children;
  }

  const visual = state ?? (visible ? "hover" : "default");

  return (
    <span className={styles.root} data-variant={variant} data-state={visual} data-density={size}>
      {cloneElement(children as ReactElement<TriggerProps>, {
        "aria-describedby": visible ? bubbleId : undefined,
        onFocus: (event: FocusEvent<HTMLElement>) => {
          triggerProps.onFocus?.(event);
          showNow();
        },
        onBlur: (event: FocusEvent<HTMLElement>) => {
          triggerProps.onBlur?.(event);
          hide();
        },
        onMouseEnter: (event: MouseEvent<HTMLElement>) => {
          triggerProps.onMouseEnter?.(event);
          showAfterDelay();
        },
        onMouseLeave: (event: MouseEvent<HTMLElement>) => {
          triggerProps.onMouseLeave?.(event);
          hide();
        },
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
          triggerProps.onKeyDown?.(event);
          if (event.key === "Escape") {
            hide();
          }
        },
      })}
      {visible ? (
        <span id={bubbleId} role="tooltip" className={styles.bubble}>
          {text}
          <span className={styles.pointer} aria-hidden="true" />
        </span>
      ) : null}
    </span>
  );
}
