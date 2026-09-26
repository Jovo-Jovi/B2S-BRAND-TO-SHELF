// CALC_SPEC.md R1-25 date block. A calendar date is a year, a month and a
// day. It is never passed through a time-zone conversion: the value a person
// enters is the value stored and shown. Display is DD/MM/YYYY in both locales,
// using the Latin digits and the separators that block states. Machine values
// are ISO 8601. Weeks start on Saturday.
//
// Money and quantity formatting do not live here. ADR-011 forbids a JavaScript
// number from holding a money value; that formatter arrives with lib/money/
// at P05.

export const WEEK_STARTS_ON = "saturday" as const;

export type CalendarLocale = "en" | "ar";

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DISPLAY_DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const ARABIC_INDIC_ZERO = 0x0660;
const EXTENDED_ARABIC_INDIC_ZERO = 0x06f0;
const DAY_MS = 86400000;

function foldDigits(value: string): string {
  let out = "";
  for (const char of value) {
    const code = char.codePointAt(0);
    if (code === undefined) {
      continue;
    }
    if (code >= ARABIC_INDIC_ZERO && code <= ARABIC_INDIC_ZERO + 9) {
      out += String(code - ARABIC_INDIC_ZERO);
    } else if (code >= EXTENDED_ARABIC_INDIC_ZERO && code <= EXTENDED_ARABIC_INDIC_ZERO + 9) {
      out += String(code - EXTENDED_ARABIC_INDIC_ZERO);
    } else {
      out += char;
    }
  }
  return out;
}

function realDate(year: number, month: number, day: number): boolean {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return false;
  }
  const probe = new Date(Date.UTC(year, month - 1, day));
  return probe.getUTCFullYear() === year && probe.getUTCMonth() === month - 1 && probe.getUTCDate() === day;
}

function isoFromParts(year: number, month: number, day: number): string {
  const yyyy = String(year).padStart(4, "0");
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function partsOf(iso: string): { year: number; month: number; day: number } | null {
  const match = ISO_DATE.exec(iso);
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!realDate(year, month, day)) {
    return null;
  }
  return { year, month, day };
}

export function parseCalendarDate(value: string): string | null {
  const folded = foldDigits(value.trim());
  const iso = ISO_DATE.exec(folded);
  const display = DISPLAY_DATE.exec(folded);
  let year: number;
  let month: number;
  let day: number;
  if (iso) {
    year = Number(iso[1]);
    month = Number(iso[2]);
    day = Number(iso[3]);
  } else if (display) {
    day = Number(display[1]);
    month = Number(display[2]);
    year = Number(display[3]);
  } else {
    return null;
  }
  if (!realDate(year, month, day)) {
    return null;
  }
  return isoFromParts(year, month, day);
}

export function formatCalendarDate(iso: string, locale: CalendarLocale): string | null {
  if (locale !== "en" && locale !== "ar") {
    return null;
  }
  const parts = partsOf(foldDigits(iso.trim()));
  if (!parts) {
    return null;
  }
  const day = String(parts.day).padStart(2, "0");
  const month = String(parts.month).padStart(2, "0");
  const year = String(parts.year).padStart(4, "0");
  return `${day}/${month}/${year}`;
}

export function startOfWeek(iso: string): string | null {
  const parsed = parseCalendarDate(iso);
  if (parsed === null) {
    return null;
  }
  const parts = partsOf(parsed);
  if (!parts) {
    return null;
  }
  const probe = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  const daysSinceSaturday = (probe.getUTCDay() + 1) % 7;
  const start = new Date(probe.getTime() - daysSinceSaturday * DAY_MS);
  return isoFromParts(start.getUTCFullYear(), start.getUTCMonth() + 1, start.getUTCDate());
}
