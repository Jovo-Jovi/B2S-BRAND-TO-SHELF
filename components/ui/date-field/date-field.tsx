"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

import {
  addDays,
  formatCalendarDate,
  daysInMonth,
  monthGrid,
  parseCalendarDate,
  saturdayIndex,
  shiftMonth,
  startOfWeek,
  type CalendarLocale,
} from "../../../lib/locale/calendar-date";
import { fillPattern, formatCount } from "../../../lib/locale/format-number";
import { Button } from "../button/button";
import { classes } from "../classes";
import { Glyph } from "../glyphs";
import styles from "./date-field.module.css";

export type DateFieldVariant = "single";
export type DateFieldSize = "compact" | "comfortable";

export type DateFieldVisual =
  | "default"
  | "hover"
  | "focus"
  | "active"
  | "disabled"
  | "error"
  | "empty"
  | "selected";

export type DateFieldCopy = {
  months: readonly string[];
  weekdaysShort: readonly string[];
  weekdaysFull: readonly string[];
  dayAccessibleName: string;
  monthHeading: string;
  placeholder: string;
  previousMonth: string;
  nextMonth: string;
  openCalendar: string;
  invalid: string;
};

type DateFieldProps = {
  variant?: DateFieldVariant;
  size?: DateFieldSize;
  state?: DateFieldVisual;
  locale: CalendarLocale;
  copy: DateFieldCopy;
  viewYear: number;
  viewMonth: number;
  accessibleName: string;
  value?: string | null;
  onValueChange?: (iso: string | null) => void;
  disabled?: boolean;
  id?: string;
  name?: string;
};

function parts(iso: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) {
    return null;
  }
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function calendarIso(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function DateField({
  variant = "single",
  size,
  state,
  locale,
  copy,
  viewYear,
  viewMonth,
  accessibleName,
  value = null,
  onValueChange,
  disabled = false,
  id,
  name,
}: DateFieldProps) {
  const generatedId = useId();
  const headingId = useId();
  const errorId = useId();
  const inputId = id ?? generatedId;
  const parsed = value ? parseCalendarDate(value) : null;
  const fromValue = parsed ? parts(parsed) : null;
  const [text, setText] = useState(parsed ? (formatCalendarDate(parsed, locale) ?? "") : "");
  const [invalid, setInvalid] = useState(false);
  const [opened, setOpened] = useState(false);
  const [visible, setVisible] = useState({ year: fromValue?.year ?? viewYear, month: fromValue?.month ?? viewMonth });
  const [focusedIso, setFocusedIso] = useState(parsed ?? `${String(viewYear).padStart(4, "0")}-${String(viewMonth).padStart(2, "0")}-01`);
  const [trackedValue, setTrackedValue] = useState(parsed);
  if (parsed !== trackedValue) {
    setTrackedValue(parsed);
    if (parsed) {
      setFocusedIso(parsed);
      const next = parts(parsed);
      if (next) {
        setVisible(next);
      }
      setText(formatCalendarDate(parsed, locale) ?? "");
    }
  }
  const focusRef = useRef<HTMLButtonElement>(null);
  const open = state === "active" || state === "selected" || opened;
  const visual =
    state ??
    (disabled ? "disabled" : invalid ? "error" : open ? "active" : text.length === 0 ? "empty" : "default");
  const weeks = monthGrid(visible.year, visible.month) ?? [];
  const heading = fillPattern(copy.monthHeading, {
    month: copy.months[visible.month - 1] ?? "",
    year: String(visible.year).padStart(4, "0"),
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    focusRef.current?.focus();
  }, [open, focusedIso, visible.year, visible.month]);

  function commit(iso: string | null) {
    setInvalid(false);
    onValueChange?.(iso);
    if (iso) {
      setText(formatCalendarDate(iso, locale) ?? "");
      const next = parts(iso);
      if (next) {
        setVisible(next);
      }
    } else {
      setText("");
    }
  }

  function onBlur() {
    if (text.trim().length === 0) {
      commit(null);
      return;
    }
    const next = parseCalendarDate(text);
    if (next === null) {
      setInvalid(true);
      return;
    }
    commit(next);
  }

  function moveFocus(iso: string | null) {
    if (!iso) {
      return;
    }
    const next = parts(iso);
    if (next && (next.year !== visible.year || next.month !== visible.month)) {
      setVisible(next);
    }
    setFocusedIso(iso);
  }

  function onGridKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const host = event.currentTarget.closest("[dir]");
    const dir = host?.getAttribute("dir") ?? document.documentElement.getAttribute("dir");
    const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    const backward = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    if (event.key === forward) {
      event.preventDefault();
      moveFocus(addDays(focusedIso, 1));
      return;
    }
    if (event.key === backward) {
      event.preventDefault();
      moveFocus(addDays(focusedIso, -1));
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveFocus(addDays(focusedIso, 7));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveFocus(addDays(focusedIso, -7));
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      moveFocus(startOfWeek(focusedIso));
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      const start = startOfWeek(focusedIso);
      moveFocus(start ? addDays(start, 6) : null);
      return;
    }
    if (event.key === "PageUp" || event.key === "PageDown") {
      event.preventDefault();
      const source = parts(focusedIso);
      if (!source) {
        return;
      }
      const step = event.shiftKey ? 12 : 1;
      const delta = event.key === "PageUp" ? -step : step;
      const next = shiftMonth(source.year, source.month, delta);
      const day = Math.min(source.day, daysInMonth(next.year, next.month));
      setVisible(next);
      setFocusedIso(calendarIso(next.year, next.month, day));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      commit(focusedIso);
      setOpened(false);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setOpened(false);
    }
  }

  function showMonth(delta: number) {
    setVisible((current) => shiftMonth(current.year, current.month, delta));
  }

  return (
    <div className={styles.root} data-variant={variant} data-state={visual} data-density={size}>
      <div className={styles.entry}>
        <input
          id={inputId}
          name={name}
          className={styles.input}
          value={text}
          placeholder={copy.placeholder}
          disabled={disabled}
          aria-label={accessibleName}
          inputMode="numeric"
          aria-invalid={invalid || state === "error" || undefined}
          aria-describedby={invalid || state === "error" ? errorId : undefined}
          onChange={(event) => {
            setText(event.target.value);
            setInvalid(false);
          }}
          onBlur={onBlur}
        />
        <Button
          variant="quiet"
          size={size}
          accessibleName={copy.openCalendar}
          disabled={disabled}
          iconStart={<Glyph name="chevronDown" />}
          onClick={() => setOpened((current) => !current)}
        />
      </div>
      {invalid || state === "error" ? (
        <p id={errorId} className={styles.invalid} role="alert">
          {copy.invalid}
        </p>
      ) : null}
      {open && !disabled ? (
        <div
          className={styles.popover}
          role="dialog"
          aria-modal="false"
          aria-labelledby={headingId}
          onKeyDown={onGridKeyDown}
        >
          <div className={styles.monthBar}>
            <Button
              variant="quiet"
              size={size}
              accessibleName={copy.previousMonth}
              iconStart={<Glyph name="previous" />}
              onClick={() => showMonth(-1)}
            />
            <h2 id={headingId} className={styles.heading}>
              {heading}
            </h2>
            <Button
              variant="quiet"
              size={size}
              accessibleName={copy.nextMonth}
              iconStart={<Glyph name="next" />}
              onClick={() => showMonth(1)}
            />
          </div>
          <div role="grid" aria-labelledby={headingId}>
            <div role="row" className={styles.week}>
              {copy.weekdaysShort.map((name) => (
                <span key={name} role="columnheader" className={styles.weekday}>
                  {name}
                </span>
              ))}
            </div>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} role="row" className={styles.week}>
                {week.map((cell, cellIndex) => {
                  if (!cell) {
                    return <span key={cellIndex} role="gridcell" className={styles.blank} />;
                  }
                  const index = saturdayIndex(cell.iso) ?? 0;
                  const weekday = copy.weekdaysFull[index] ?? "";
                  const cellParts = parts(cell.iso);
                  const dayName = fillPattern(copy.dayAccessibleName, {
                    weekday,
                    day: String(cell.day),
                    month: copy.months[(cellParts?.month ?? 1) - 1] ?? "",
                    year: cell.iso.slice(0, 4),
                  });
                  const selected = parsed === cell.iso;
                  return (
                    <button
                      key={cell.iso}
                      ref={cell.iso === focusedIso ? focusRef : undefined}
                      type="button"
                      role="gridcell"
                      className={classes(styles.day, selected && styles.selectedDay)}
                      data-selected={selected ? "true" : "false"}
                      aria-selected={selected}
                      aria-label={dayName}
                      tabIndex={cell.iso === focusedIso ? 0 : -1}
                      onClick={() => {
                        commit(cell.iso);
                        setFocusedIso(cell.iso);
                        setOpened(false);
                      }}
                    >
                      {formatCount(cell.day, locale)}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
