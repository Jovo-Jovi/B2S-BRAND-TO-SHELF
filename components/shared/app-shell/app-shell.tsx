"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

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
  const menuRef = useRef<HTMLSpanElement>(null);
  const drawerRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = drawerRef.current;
    if (!node) {
      return;
    }
    if (open) {
      if (!node.open && typeof node.showModal === "function") {
        node.showModal();
      }
      return;
    }
    if (node.open && typeof node.close === "function") {
      node.close();
    }
  }, [open]);

  function renderLinks() {
    return navigation.map((item) => (
      <a
        key={item.id}
        className={classes(styles.link, item.current && styles.current)}
        href={item.href}
        aria-current={item.current ? "page" : undefined}
        data-repeated="navigation"
      >
        {item.caption}
      </a>
    ));
  }

  return (
    <div className={styles.shell} data-composition="AppShell">
      <a className={styles.skip} href="#app-main">
        {skip}
      </a>
      <header className={styles.banner}>
        <span className={styles.drawer} ref={menuRef}>
          <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
            {openNavigation}
          </Button>
        </span>
        <PageHeader {...header} />
      </header>
      <nav className={styles.nav} data-name-group="navigation" aria-label={navigationLabel}>
        {renderLinks()}
      </nav>
      <dialog
        ref={drawerRef}
        className={styles.sheet}
        aria-label={navigationLabel}
        onClose={() => {
          setOpen(false);
          menuRef.current?.querySelector("button")?.focus();
        }}
      >
        <nav className={styles.sheetNav} aria-label={navigationLabel}>
          {renderLinks()}
        </nav>
        <Button type="button" variant="quiet" onClick={() => setOpen(false)}>
          {closeNavigation}
        </Button>
      </dialog>
      <main id="app-main" className={classes(styles.main, measure === "form" && styles.measured)}>
        {children}
      </main>
    </div>
  );
}
