import type { ReactNode } from "react";

import { TextLink } from "../../ui/text-link/text-link";
import styles from "./entry-frame.module.css";

type EntryFrameProps = {
  wordmark: ReactNode;
  localeHref: string;
  localeCaption: string;
  children: ReactNode;
};

export function EntryFrame({ wordmark, localeHref, localeCaption, children }: EntryFrameProps) {
  return (
    <section className={styles.canvas} data-composition="EntryFrame">
      <div className={styles.column}>
        <div className={styles.header}>
          <div className={styles.wordmark}>{wordmark}</div>
          <TextLink href={localeHref} variant="standalone">
            {localeCaption}
          </TextLink>
        </div>
        {children}
      </div>
    </section>
  );
}
