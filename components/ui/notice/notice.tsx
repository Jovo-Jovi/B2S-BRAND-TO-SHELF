"use client";

import { Children, useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from "react";

import { Button } from "../button/button";
import { classes } from "../classes";
import styles from "./notice.module.css";

export type NoticeVariant = "toast" | "inline";
export type NoticeSize = "comfortable";
export type NoticeTone = "success" | "info" | "warning" | "danger";

export type NoticeVisual = "default" | "hover" | "focus" | "error";

const TOAST_CAP = 3;

type NoticeProps = {
  variant: NoticeVariant;
  tone: NoticeTone;
  title: string;
  message: string;
  icon: ReactNode;
  size?: NoticeSize;
  state?: NoticeVisual;
  requestIdentifier?: string;
  copyCaption?: string;
  dismissCaption?: string;
  onDismiss?: () => void;
  blocksWork?: boolean;
  actions?: ReactNode;
};

function tokenMilliseconds(name: string): number | null {
  if (typeof document === "undefined") {
    return null;
  }
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const match = /^(\d+(?:\.\d+)?)ms$/.exec(raw);
  return match ? Number(match[1]) : null;
}

export function Notice({
  variant,
  tone,
  title,
  message,
  icon,
  size = "comfortable",
  state = "default",
  requestIdentifier,
  copyCaption,
  dismissCaption,
  onDismiss,
  blocksWork = false,
  actions,
}: NoticeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const onDismissRef = useRef(onDismiss);
  const titleId = useId();
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);
  const alert = tone === "danger" || (tone === "warning" && blocksWork);
  const persists = tone === "warning" || tone === "danger";

  useEffect(() => {
    if (variant !== "toast" || persists || state === "hover" || state === "focus") {
      return;
    }
    const root = rootRef.current;
    const ms = tokenMilliseconds("--b2s-notice-dismiss");
    if (!root || ms === null) {
      return;
    }
    const element = root;
    let remaining = ms;
    let started = Date.now();
    let paused = false;
    let timer = window.setTimeout(fire, remaining);

    function fire() {
      if (!paused) {
        onDismissRef.current?.();
      }
    }
    function pause() {
      if (paused) {
        return;
      }
      paused = true;
      window.clearTimeout(timer);
      remaining -= Date.now() - started;
    }
    function resume() {
      if (!paused) {
        return;
      }
      paused = false;
      started = Date.now();
      timer = window.setTimeout(fire, Math.max(remaining, 0));
    }
    function onFocusOut(event: FocusEvent) {
      if (event.relatedTarget instanceof Node && element.contains(event.relatedTarget)) {
        return;
      }
      resume();
    }
    element.addEventListener("mouseenter", pause);
    element.addEventListener("mouseleave", resume);
    element.addEventListener("focusin", pause);
    element.addEventListener("focusout", onFocusOut);
    return () => {
      window.clearTimeout(timer);
      element.removeEventListener("mouseenter", pause);
      element.removeEventListener("mouseleave", resume);
      element.removeEventListener("focusin", pause);
      element.removeEventListener("focusout", onFocusOut);
    };
  }, [variant, persists, state]);

  async function copyIdentifier() {
    if (!requestIdentifier || !navigator.clipboard?.writeText) {
      return;
    }
    await navigator.clipboard.writeText(requestIdentifier);
  }

  return (
    <div
      ref={rootRef}
      className={classes(styles.root, variant === "toast" && styles.toast)}
      data-variant={variant}
      data-state={state}
      data-density={size}
      data-tone={tone}
      role={alert ? "alert" : "status"}
      aria-live={alert ? "assertive" : "polite"}
      aria-labelledby={titleId}
      onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
        if (variant === "toast" && event.key === "Escape") {
          event.preventDefault();
          onDismissRef.current?.();
        }
      }}
    >
      <span className={classes(styles.bar, styles[tone])} aria-hidden="true" />
      <div className={styles.body}>
        <div className={styles.heading}>
          <span className={styles.icon}>{icon}</span>
          <p id={titleId} className={styles.title}>
            {title}
          </p>
        </div>
        <p className={styles.message}>{message}</p>
        {requestIdentifier ? (
          <p className={styles.identifier} dir="ltr">
            {requestIdentifier}
          </p>
        ) : null}
        <div className={styles.actions}>
          {actions}
          {requestIdentifier && copyCaption ? (
            <Button type="button" variant="quiet" onClick={() => void copyIdentifier()}>
              {copyCaption}
            </Button>
          ) : null}
          {dismissCaption ? (
            <Button type="button" variant="quiet" onClick={() => onDismissRef.current?.()}>
              {dismissCaption}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function NoticeRegion({ children }: { children: ReactNode }) {
  const notices = Children.toArray(children).slice(0, TOAST_CAP);
  return (
    <div className={styles.region} data-notice-region="">
      {notices}
    </div>
  );
}
