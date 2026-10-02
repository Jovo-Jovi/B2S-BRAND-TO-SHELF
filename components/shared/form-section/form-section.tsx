import type { ReactNode } from "react";

import styles from "./form-section.module.css";

type FormSectionProps = {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function FormSection({ title, description, actions, children }: FormSectionProps) {
  return (
    <section className={styles.section} data-composition="FormSection">
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
      <div className={styles.fields}>{children}</div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </section>
  );
}
