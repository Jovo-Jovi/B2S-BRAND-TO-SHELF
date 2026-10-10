import type { ReactNode } from "react";

import { Glyph } from "../../ui/glyphs";
import { TextLink } from "../../ui/text-link/text-link";
import styles from "./entry-frame.module.css";

type EntryFrameProps = {
  wordmark: ReactNode;
  tagline: string;
  localeHref: string;
  localeCaption: string;
  children: ReactNode;
};

export function EntryFrame({ wordmark, tagline, localeHref, localeCaption, children }: EntryFrameProps) {
  return (
    <section className={styles.canvas} data-composition="EntryFrame" data-density="comfortable">
      <div className={styles.column}>
        <div className={styles.header}>
          <div className={styles.lockup}>
            <span className={styles.tile}>
              <Glyph name="mark" />
            </span>
            <div>
              <div className={styles.wordmark}>{wordmark}</div>
              <p className={styles.tagline}>{tagline}</p>
            </div>
          </div>
          <TextLink href={localeHref} variant="standalone">
            {localeCaption}
          </TextLink>
        </div>
        {children}
      </div>
    </section>
  );
}

export function EntryDivider({ label }: { label: string }) {
  return (
    <div className={styles.divider}>
      <span className={styles.rule} aria-hidden="true" />
      <span>{label}</span>
      <span className={styles.rule} aria-hidden="true" />
    </div>
  );
}
