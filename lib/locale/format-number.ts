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
