"use client";

import { useEffect, useId, useRef, type ReactNode, type SyntheticEvent } from "react";

import { classes } from "../classes";
import { Glyph } from "../glyphs";
import { Notice } from "../notice/notice";
import styles from "./dialog.module.css";

export type DialogVariant = "standard" | "confirmation";
export type DialogSize = "small" | "medium" | "large";

export type DialogVisual = "default" | "focus" | "loading" | "error";

export type DialogFailure = {
  title: string;
  message: string;
  requestIdentifier?: string;
  copyCaption: string;
  dismissCaption: string;
};

type DialogProps = {
  open: boolean;
  onClose: () => void;
  variant: DialogVariant;
  size: DialogSize;
  title: string;
  closeCaption: string;
  description?: string;
  children: ReactNode;
  footer: ReactNode;
  failure?: DialogFailure;
  destructivePending?: boolean;
  state?: DialogVisual;
};

export function Dialog({
  open,
  onClose,
  variant,
  size,
  title,
  closeCaption,
  description,
  children,
  footer,
  failure,
  destructivePending = false,
  state = "default",
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node || !open) {
      return;
    }
    const other = [...document.querySelectorAll("dialog")].find(
      (item) => item !== node && item.getAttribute("data-modal") === "true",
    );
    if (other) {
      onCloseRef.current();
      return;
    }
    const previous = document.activeElement;
    if (typeof node.showModal === "function") {
      try {
        if (typeof node.close === "function" && node.open) {
          node.close();
        }
        node.showModal();
      } catch {
        node.setAttribute("open", "");
      }
    }
    node.setAttribute("data-modal", "true");
    if (variant === "confirmation") {
      const least = node.querySelector<HTMLElement>("[data-dialog-footer] button");
      least?.focus();
    }
    return () => {
      node.removeAttribute("data-modal");
      if (typeof node.close === "function" && node.open) {
        node.close();
      }
      if (previous instanceof HTMLElement) {
        previous.focus();
      }
    };
  }, [open, variant]);

  function onCancel(event: SyntheticEvent<HTMLDialogElement>) {
    if (destructivePending) {
      event.preventDefault();
      return;
    }
    onCloseRef.current();
  }

  const visual = state === "error" || failure ? (state === "default" ? "error" : state) : state;

  return (
    <dialog
      ref={dialogRef}
      className={classes(styles.dialog, styles[size])}
      data-variant={variant}
      data-state={visual}
      data-size={size}
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      open={open || undefined}
      onCancel={onCancel}
    >
      <div className={styles.titleRow}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <button type="button" className={styles.close} onClick={() => onCloseRef.current()}>
          {closeCaption}
        </button>
      </div>
      {description ? (
        <p id={descriptionId} className={styles.description}>
          {description}
        </p>
      ) : null}
      <div className={styles.body}>
        {failure ? (
          <Notice
            variant="inline"
            tone="danger"
            title={failure.title}
            message={failure.message}
            requestIdentifier={failure.requestIdentifier}
            copyCaption={failure.copyCaption}
            dismissCaption={failure.dismissCaption}
            icon={<Glyph name="danger" />}
            onDismiss={() => onCloseRef.current()}
          />
        ) : null}
        {children}
      </div>
      <div className={styles.footer} data-dialog-footer="">
        {footer}
      </div>
    </dialog>
  );
}
