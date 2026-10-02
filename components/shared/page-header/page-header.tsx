"use client";

import { useState } from "react";

import { Button } from "../../ui/button/button";
import { TextLink } from "../../ui/text-link/text-link";
import { TenantSwitcher, type TenantSwitcherProps } from "../tenant-switcher/tenant-switcher";
import styles from "./page-header.module.css";

export type LogoVariant = {
  ground: "light" | "dark";
  src: string;
};

export type PageHeaderProps = {
  theme: "light" | "dark";
  tenantName: string;
  logos: LogoVariant[];
  localeHref: string;
  localeCaption: string;
  themeLight: string;
  themeDark: string;
  onTheme: (theme: "light" | "dark") => void;
  accountCaption: string;
  accountOptions: { id: string; caption: string; onSelect: () => void }[];
  switcher: TenantSwitcherProps;
};

export function PageHeader({
  theme,
  tenantName,
  logos,
  localeHref,
  localeCaption,
  themeLight,
  themeDark,
  onTheme,
  accountCaption,
  accountOptions,
  switcher,
}: PageHeaderProps) {
  const [accountOpen, setAccountOpen] = useState(false);
  const logo = logos.find((item) => item.ground === theme);
  return (
    <div className={styles.header} data-composition="PageHeader">
      {logo ? <img className={styles.logo} src={logo.src} alt={tenantName} /> : <span className={styles.name}>{tenantName}</span>}
      <TenantSwitcher {...switcher} />
      <TextLink href={localeHref} variant="standalone">
        {localeCaption}
      </TextLink>
      <Button type="button" variant="secondary" onClick={() => onTheme("light")}>
        {themeLight}
      </Button>
      <Button type="button" variant="secondary" onClick={() => onTheme("dark")}>
        {themeDark}
      </Button>
      <div className={styles.menu}>
        <Button type="button" variant="secondary" onClick={() => setAccountOpen((open) => !open)}>
          {accountCaption}
        </Button>
        {accountOpen ? (
          <div className={styles.panel}>
            {accountOptions.map((option) => (
              <Button key={option.id} type="button" variant="quiet" onClick={option.onSelect}>
                {option.caption}
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
