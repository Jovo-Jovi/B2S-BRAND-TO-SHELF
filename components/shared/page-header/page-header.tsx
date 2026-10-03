"use client";

import { useEffect, useState } from "react";

import { Button } from "../../ui/button/button";
import { RadioGroup } from "../../ui/radio-group/radio-group";
import { TextLink } from "../../ui/text-link/text-link";
import { TenantSwitcher, type TenantSwitcherProps } from "../tenant-switcher/tenant-switcher";
import styles from "./page-header.module.css";

export type LogoVariant = {
  ground: "light" | "dark";
  src: string;
};

export type ThemeChoice = "system" | "light" | "dark";

export type PageHeaderProps = {
  theme: ThemeChoice;
  tenantName: string;
  logos: LogoVariant[];
  localeHref: string;
  localeCaption: string;
  themeCaption: string;
  themeSystem: string;
  themeLight: string;
  themeDark: string;
  onTheme: (theme: ThemeChoice) => void;
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
  themeCaption,
  themeSystem,
  themeLight,
  themeDark,
  onTheme,
  accountCaption,
  accountOptions,
  switcher,
}: PageHeaderProps) {
  const [accountOpen, setAccountOpen] = useState(false);
  const [scheme, setScheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => setScheme(query.matches ? "dark" : "light");
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);
  const resolved = theme === "system" ? scheme : theme;
  const logo = logos.find((item) => item.ground === resolved);
  return (
    <div className={styles.header} data-composition="PageHeader">
      {logo ? <img className={styles.logo} src={logo.src} alt={tenantName} /> : <span className={styles.name}>{tenantName}</span>}
      <TenantSwitcher {...switcher} />
      <TextLink href={localeHref} variant="standalone">
        {localeCaption}
      </TextLink>
      <div className={styles.menu}>
        <Button type="button" variant="secondary" onClick={() => setAccountOpen((open) => !open)}>
          {accountCaption}
        </Button>
        {accountOpen ? (
          <div className={styles.panel}>
            <RadioGroup
              caption={themeCaption}
              options={[
                { value: "system", caption: themeSystem },
                { value: "light", caption: themeLight },
                { value: "dark", caption: themeDark },
              ]}
              value={theme}
              onValueChange={(next) => onTheme(next as ThemeChoice)}
            />
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
