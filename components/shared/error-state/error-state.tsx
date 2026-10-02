"use client";

import { Button } from "../../ui/button/button";
import styles from "./error-state.module.css";

type ErrorStateProps = {
  title: string;
  message: string;
  next: string;
  retry: string;
  onRetry: () => void;
  requestIdentifier: string;
  copyIdentifier: string;
};

export function ErrorState({ title, message, next, retry, onRetry, requestIdentifier, copyIdentifier }: ErrorStateProps) {
  return (
    <section data-composition="ErrorState">
      <h2>{title}</h2>
      <p>{message}</p>
      <p>{next}</p>
      <p className={styles.identifier} dir="ltr">
        {requestIdentifier}
      </p>
      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          const clipboard = navigator.clipboard;
          if (clipboard) {
            void clipboard.writeText(requestIdentifier);
          }
        }}
      >
        {copyIdentifier}
      </Button>
      <Button type="button" variant="primary" onClick={onRetry}>
        {retry}
      </Button>
    </section>
  );
}
