"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { Glyph } from "../glyphs";
import { Spinner } from "../spinner/spinner";
import styles from "./select.module.css";

export type SelectVariant = "native" | "searchable";
export type SelectSize = "compact" | "comfortable";

export type SelectVisual =
  | "default"
  | "hover"
  | "focus"
  | "active"
  | "disabled"
  | "loading"
  | "error"
  | "empty"
  | "selected";

export type SelectOption = {
  value: string;
  caption: string;
};

type SelectProps = {
  variant?: SelectVariant;
  size?: SelectSize;
  state?: SelectVisual;
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  noResults: string;
  disabled?: boolean;
  loading?: boolean;
  invalid?: boolean;
  id?: string;
  name?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  "aria-labelledby"?: string;
};

export function Select({
  variant = "native",
  size,
  state,
  options,
  value = "",
  onValueChange,
  noResults,
  disabled = false,
  loading = false,
  invalid = false,
  id,
  name,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  "aria-labelledby": ariaLabelledBy,
}: SelectProps) {
  const generatedId = useId();
  const listId = useId();
  const controlId = id ?? generatedId;
  const [opened, setOpened] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const showInvalid = invalid || ariaInvalid;
  const visual =
    state ??
    (disabled ? "disabled" : showInvalid ? "error" : loading ? "loading" : "default");
  const forcedOpen = state === "active" || state === "empty" || state === "selected";
  const open = variant === "searchable" && (forcedOpen || opened);
  const filtered = options.filter((option) => option.caption.toLowerCase().includes(query.trim().toLowerCase()));
  const chosen = options.find((option) => option.value === value);

  function choose(option: SelectOption) {
    onValueChange?.(option.value);
    setOpened(false);
    setQuery("");
  }

  function onSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === "Enter" || event.key === " " || event.key === "ArrowDown")) {
      event.preventDefault();
      setOpened(true);
      return;
    }
    if (!open) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const delta = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((index) => {
        if (filtered.length === 0) return 0;
        return (index + delta + filtered.length) % filtered.length;
      });
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const option = filtered[activeIndex];
      if (option) choose(option);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setOpened(false);
    }
  }

  const chevron = loading ? (
    <span className={styles.spinner}>
      <Spinner state="loading" />
    </span>
  ) : (
    <span className={styles.chevron}>
      <Glyph name="chevronDown" />
    </span>
  );

  if (variant === "native") {
    return (
      <div className={styles.root} data-variant={variant} data-state={visual} data-density={size}>
        <select
          id={controlId}
          className={styles.input}
          name={name}
          value={value}
          disabled={disabled || undefined}
          aria-invalid={showInvalid || undefined}
          aria-describedby={ariaDescribedBy}
          aria-labelledby={ariaLabelledBy}
          aria-busy={loading || undefined}
          onChange={(event) => onValueChange?.(event.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.caption}
            </option>
          ))}
        </select>
        {chevron}
      </div>
    );
  }

  const showingEmpty = state === "empty" || filtered.length === 0;
  const activeId = !open
    ? undefined
    : showingEmpty
      ? `${listId}-empty`
      : filtered[activeIndex]
        ? `${listId}-${filtered[activeIndex].value}`
        : undefined;

  return (
    <div className={styles.root} data-variant={variant} data-state={visual} data-density={size}>
      <input
        id={controlId}
        className={styles.input}
        role="combobox"
        name={name}
        value={open ? query : (chosen?.caption ?? "")}
        disabled={disabled || undefined}
        placeholder={chosen?.caption}
        aria-invalid={showInvalid || undefined}
        aria-describedby={ariaDescribedBy}
        aria-labelledby={ariaLabelledBy}
        aria-busy={loading || undefined}
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-autocomplete="list"
        aria-activedescendant={activeId}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpened(true);
          setActiveIndex(0);
        }}
        onKeyDown={onSearchKeyDown}
      />
      {chevron}
      {open ? (
        <div id={listId} className={styles.listbox} role="listbox">
          {showingEmpty ? (
            <div id={`${listId}-empty`} className={styles.empty} role="option" aria-selected="false" aria-disabled="true" data-part="no-results">
              {noResults}
            </div>
          ) : (
            filtered.map((option, index) => {
              const selected = option.value === value;
              return (
                <button
                  key={option.value}
                  id={`${listId}-${option.value}`}
                  type="button"
                  role="option"
                  className={styles.option}
                  aria-selected={selected}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(option)}
                  tabIndex={index === activeIndex ? 0 : -1}
                >
                  <Glyph className={styles.mark} name="check" />
                  {option.caption}
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
