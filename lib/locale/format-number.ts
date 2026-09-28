// Numbers CALC_SPEC.md does not govern: counts, upload percentages, byte
// sizes, and the contrast ratio ColorField shows. Digit system, decimal
// separator and grouping are R1-25's locale definitions. Both locales are
// Latin digits, "." and ",". Money and domain quantities are not formatted
// here; they arrive with lib/money/ at P05 under ADR-011.

import type { CalendarLocale } from "./calendar-date";

const SEPARATORS: Record<CalendarLocale, { decimal: "."; group: "," }> = {
  en: { decimal: ".", group: "," },
  ar: { decimal: ".", group: "," },
};

/**
 * §2.2 writes every contrast ratio to two decimal places. The readout uses
 * that presentation.
 */
export const CONTRAST_RATIO_FRACTION_DIGITS = 2;

export function formatNumber(value: number, locale: CalendarLocale, fractionDigits = 0): string {
  const { decimal, group } = SEPARATORS[locale];
  const negative = value < 0;
  const fixed = Math.abs(value).toFixed(fractionDigits);
  const [whole, fraction] = fixed.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, group);
  const body = fractionDigits > 0 ? `${grouped}${decimal}${fraction}` : grouped;
  return negative ? `-${body}` : body;
}

export function formatContrastRatio(value: number, locale: CalendarLocale): string {
  return formatNumber(value, locale, CONTRAST_RATIO_FRACTION_DIGITS);
}

export function formatCount(value: number, locale: CalendarLocale): string {
  if (value < 0) {
    throw new RangeError("count is below zero");
  }
  return formatNumber(Math.trunc(value), locale, 0);
}

/**
 * Completed fraction in the closed interval from 0 to 1, rounded down.
 * 100 only when the fraction is 1. A value outside that interval is refused.
 * The sign is a catalog pattern applied by fillPattern, and it follows the
 * value in both locales.
 */
export function progressPercent(completed: number): number {
  if (completed < 0 || completed > 1) {
    throw new RangeError("progress is outside 0 to 1");
  }
  return Math.floor(completed * 100);
}

export function formatProgress(completed: number, locale: CalendarLocale): string {
  return formatNumber(progressPercent(completed), locale, 0);
}

export const BYTE_UNITS = ["B", "kB", "MB", "GB"] as const;
export type ByteUnit = (typeof BYTE_UNITS)[number];
export type ByteUnitWords = Record<ByteUnit, string>;

const BYTE_SCALE: Record<ByteUnit, number> = {
  B: 1,
  kB: 1000,
  MB: 1_000_000,
  GB: 1_000_000_000,
};

function byteUnit(bytes: number): ByteUnit {
  if (bytes >= BYTE_SCALE.GB) {
    return "GB";
  }
  if (bytes >= BYTE_SCALE.MB) {
    return "MB";
  }
  if (bytes >= BYTE_SCALE.kB) {
    return "kB";
  }
  return "B";
}

function scaleBytes(bytes: number, unit: ByteUnit, digits: number): number {
  const scale = BYTE_SCALE[unit];
  if (scale === 1) {
    return bytes;
  }
  const places = 10 ** digits;
  const half = Math.floor(scale / 2);
  const rounded = Math.floor((bytes * places + half) / scale);
  return rounded / places;
}

export function formatByteSize(bytes: number, locale: CalendarLocale, units: ByteUnitWords): string {
  if (bytes < 0) {
    throw new RangeError("byte size is below zero");
  }
  const unit = byteUnit(bytes);
  const scaled = bytes / BYTE_SCALE[unit];
  const digits = unit === "B" || scaled >= 10 ? 0 : 1;
  const shown = formatNumber(scaleBytes(bytes, unit, digits), locale, digits);
  return `${shown} ${units[unit]}`;
}

const SLOT = /\{([A-Za-z]+)\}/g;

export function fillPattern(pattern: string, slots: Record<string, string>): string {
  return pattern.replace(SLOT, (token, name: string) =>
    Object.prototype.hasOwnProperty.call(slots, name) ? slots[name] : token,
  );
}
