"use client";

import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";

import { classes } from "../classes";
import { Skeleton } from "../skeleton/skeleton";
import styles from "./tabs.module.css";

export type TabsVariant = "standard";
export type TabsSize = "compact" | "comfortable";

export type TabsVisual =
  | "default"
  | "hover"
  | "focus"
  | "disabled"
  | "loading"
  | "error"
  | "empty"
  | "selected";

export type TabSpec = {
  id: string;
  caption: string;
  panel: ReactNode;
  disabled?: boolean;
};

type TabsProps = {
  tabs: TabSpec[];
  selectedId: string;
  onSelect?: (id: string) => void;
  variant?: TabsVariant;
  size?: TabsSize;
  state?: TabsVisual;
};

export function Tabs({
  tabs,
  selectedId,
  onSelect,
  variant = "standard",
  size,
  state = "default",
}: TabsProps) {
  const baseId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.id === selectedId),
  );

  function enabledIndexes(): number[] {
    return tabs.flatMap((tab, index) => (tab.disabled ? [] : [index]));
  }

  function move(from: number, direction: 1 | -1) {
    const enabled = enabledIndexes();
    if (enabled.length === 0) {
      return;
    }
    const position = enabled.indexOf(from);
    const origin = position === -1 ? 0 : position;
    const next = enabled[(origin + direction + enabled.length) % enabled.length];
    if (next === undefined) {
      return;
    }
    tabRefs.current[next]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const dir = listRef.current?.closest("[dir]")?.getAttribute("dir") ?? document.documentElement.getAttribute("dir");
    const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    const backward = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    const current = tabRefs.current.findIndex((node) => node === document.activeElement);
    const from = current === -1 ? selectedIndex : current;
    if (event.key === forward) {
      event.preventDefault();
      move(from, 1);
      return;
    }
    if (event.key === backward) {
      event.preventDefault();
      move(from, -1);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      const first = enabledIndexes()[0];
      if (first !== undefined) {
        tabRefs.current[first]?.focus();
      }
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      const enabled = enabledIndexes();
      const last = enabled[enabled.length - 1];
      if (last !== undefined) {
        tabRefs.current[last]?.focus();
      }
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const tab = tabs[from];
      if (tab && !tab.disabled) {
        onSelect?.(tab.id);
      }
    }
  }

  return (
    <div className={styles.root} data-variant={variant} data-state={state} data-density={size}>
      <div
        ref={listRef}
        className={styles.list}
        role="tablist"
        onKeyDown={onKeyDown}
      >
        {tabs.map((tab, index) => {
          const selected = tab.id === selectedId;
          return (
            <button
              key={tab.id}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              className={classes(styles.tab, selected && styles.selected)}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              disabled={tab.disabled || undefined}
              onClick={() => {
                if (!tab.disabled) {
                  onSelect?.(tab.id);
                }
              }}
            >
              {tab.caption}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => {
        const selected = tab.id === selectedId;
        const showSkeleton = selected && state === "loading";
        return (
          <div
            key={tab.id}
            role="tabpanel"
            id={`${baseId}-panel-${tab.id}`}
            aria-labelledby={`${baseId}-tab-${tab.id}`}
            aria-busy={showSkeleton ? true : undefined}
            hidden={selected ? undefined : true}
            className={styles.panel}
          >
            {showSkeleton ? <Skeleton state="loading" /> : tab.panel}
          </div>
        );
      })}
    </div>
  );
}
