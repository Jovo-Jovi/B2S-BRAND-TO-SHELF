"use client";

import type { ReactNode } from "react";

import styles from "./wizard-step.module.css";

type PreviewId = "label" | "sticker";

type PreviewPanelProps = {
  title: string;
  label: string;
  sticker: string;
  selected: PreviewId;
  onSelect: (id: PreviewId) => void;
  note?: string | null;
  children: ReactNode;
};

export function PreviewPanel({ title, label, sticker, selected, onSelect, note, children }: PreviewPanelProps) {
  return (
    <section className={styles.panel} data-composition="PreviewPanel">
      <div className={styles.panelHeader}>
        <span className={styles.dot} aria-hidden="true" />
        <h2 className={styles.panelTitle}>{title}</h2>
        <div className={styles.segments} role="group" aria-label={title}>
          <button type="button" className={styles.segment} aria-pressed={selected === "label"} onClick={() => onSelect("label")}>
            {label}
          </button>
          <button type="button" className={styles.segment} aria-pressed={selected === "sticker"} onClick={() => onSelect("sticker")}>
            {sticker}
          </button>
        </div>
      </div>
      {note ? (
        <p className={styles.note} data-note="missing-mark">
          {note}
        </p>
      ) : null}
      <div className={styles.specimen}>{children}</div>
    </section>
  );
}
