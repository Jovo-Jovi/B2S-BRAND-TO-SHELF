"use client";

import { useState } from "react";

import { Button } from "../../ui/button/button";
import { Field } from "../../ui/field/field";
import { TextField } from "../../ui/text-field/text-field";
import styles from "./tenant-switcher.module.css";

export type Membership = {
  id: string;
  name: string;
  mark: string;
};

export type TenantSwitcherProps = {
  memberships: Membership[];
  resolvedId: string;
  searchCaption: string;
  onSwitch: (id: string) => void;
};

const SEARCH_THRESHOLD = 7;

export function TenantSwitcher({ memberships, resolvedId, searchCaption, onSwitch }: TenantSwitcherProps) {
  const [query, setQuery] = useState("");
  const searchable = memberships.length > SEARCH_THRESHOLD;
  const visible = searchable
    ? memberships.filter((membership) => membership.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
    : memberships;
  return (
    <div className={styles.switcher} data-composition="TenantSwitcher">
      {searchable ? (
        <Field caption={searchCaption}>
          <TextField variant="text" value={query} onValueChange={setQuery} />
        </Field>
      ) : null}
      <div className={styles.list} data-name-group="memberships">
        {visible.map((membership) => (
          <span key={membership.id} data-repeated="memberships" className={membership.id === resolvedId ? styles.current : undefined}>
            <Button
              type="button"
              variant={membership.id === resolvedId ? "secondary" : "quiet"}
              onClick={() => onSwitch(membership.id)}
            >
              <span>{membership.mark}</span>
              <span>{membership.name}</span>
            </Button>
          </span>
        ))}
      </div>
    </div>
  );
}
