"use client";

import { useState, type ReactNode } from "react";

import { Button } from "../../ui/button/button";
import { classes } from "../../ui/classes";
import { PageHeader, type PageHeaderProps } from "../page-header/page-header";
import styles from "./app-shell.module.css";

export type AppShellNavItem = {
  id: string;
  caption: string;
  href: string;
  current: boolean;
};

type AppShellProps = {
  skip: string;
  openNavigation: string;
  closeNavigation: string;
  navigationLabel: string;
  navigation: AppShellNavItem[];
  header: PageHeaderProps;
  measure: "full" | "form";
  children: ReactNode;
};

export function AppShell({
  skip,
  openNavigation,
  closeNavigation,
  navigationLabel,
  navigation,
  header,
  measure,
  children,
}: AppShellProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.shell} data-composition="AppShell">
      <a className={styles.skip} href="#app-main">
        {skip}
      </a>
      <header className={styles.banner}>
        <span className={styles.drawer}>
          <Button type="button" variant="secondary" onClick={() => setOpen((value) => !value)}>
            {open ? closeNavigation : openNavigation}
          </Button>
        </span>
        <PageHeader {...header} />
      </header>
      <nav className={styles.nav} data-open={open ? "true" : "false"} data-name-group="navigation" aria-label={navigationLabel}>
        {navigation.map((item) => (
          <a
            key={item.id}
            className={classes(styles.link, item.current && styles.current)}
            href={item.href}
            aria-current={item.current ? "page" : undefined}
            data-repeated="navigation"
          >
            {item.caption}
          </a>
        ))}
      </nav>
      <main id="app-main" className={classes(styles.main, measure === "form" && styles.measured)}>
        {children}
      </main>
    </div>
  );
}
