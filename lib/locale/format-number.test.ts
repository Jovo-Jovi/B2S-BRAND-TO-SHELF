import { describe, expect, it } from "vitest";

import ar from "../../app/[locale]/dictionaries/ar.json";
import en from "../../app/[locale]/dictionaries/en.json";
import { byteUnits } from "../../components/ui/data-catalog";
import {
  fillPattern,
  formatByteSize,
  formatContrastRatio,
  formatCount,
  formatNumber,
  formatProgress,
} from "./format-number";

const AR_MONTHS = [
  "\u064a\u0646\u0627\u064a\u0631",
  "\u0641\u0628\u0631\u0627\u064a\u0631",
  "\u0645\u0627\u0631\u0633",
  "\u0623\u0628\u0631\u064a\u0644",
  "\u0645\u0627\u064a\u0648",
  "\u064a\u0648\u0646\u064a\u0648",
  "\u064a\u0648\u0644\u064a\u0648",
  "\u0623\u063a\u0633\u0637\u0633",
  "\u0633\u0628\u062a\u0645\u0628\u0631",
  "\u0623\u0643\u062a\u0648\u0628\u0631",
  "\u0646\u0648\u0641\u0645\u0628\u0631",
  "\u062f\u064a\u0633\u0645\u0628\u0631",
];

const AR_SHORT = [
  "\u0633\u0628\u062a",
  "\u0623\u062d\u062f",
  "\u0627\u062b\u0646\u064a\u0646",
  "\u062b\u0644\u0627\u062b\u0627\u0621",
  "\u0623\u0631\u0628\u0639\u0627\u0621",
  "\u062e\u0645\u064a\u0633",
  "\u062c\u0645\u0639\u0629",
];

const AR_FULL = [
  "\u0627\u0644\u0633\u0628\u062a",
  "\u0627\u0644\u0623\u062d\u062f",
  "\u0627\u0644\u0625\u062b\u0646\u064a\u0646",
  "\u0627\u0644\u062b\u0644\u0627\u062b\u0627\u0621",
  "\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621",
  "\u0627\u0644\u062e\u0645\u064a\u0633",
  "\u0627\u0644\u062c\u0645\u0639\u0629",
];

describe("formatNumber", () => {
  it("uses R1-25 separators in both locales", () => {
    for (const locale of ["en", "ar"] as const) {
      expect(formatNumber(1234, locale)).toBe("1,234");
      expect(formatNumber(4.5, locale, 1)).toBe("4.5");
      expect(formatContrastRatio(17.4, locale)).toBe("17.40");
    }
  });

  it("formats counts, progress and byte sizes in both locales", () => {
    const months = [
      en.data.month1,
      en.data.month2,
      en.data.month3,
      en.data.month4,
      en.data.month5,
      en.data.month6,
      en.data.month7,
      en.data.month8,
      en.data.month9,
      en.data.month10,
      en.data.month11,
      en.data.month12,
    ];
    expect(months).toEqual([
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]);
    expect([
      ar.data.month1,
      ar.data.month2,
      ar.data.month3,
      ar.data.month4,
      ar.data.month5,
      ar.data.month6,
      ar.data.month7,
      ar.data.month8,
      ar.data.month9,
      ar.data.month10,
      ar.data.month11,
      ar.data.month12,
    ]).toEqual(AR_MONTHS);
    expect([
      ar.data.weekdayShort1,
      ar.data.weekdayShort2,
      ar.data.weekdayShort3,
      ar.data.weekdayShort4,
      ar.data.weekdayShort5,
      ar.data.weekdayShort6,
      ar.data.weekdayShort7,
    ]).toEqual(AR_SHORT);
    expect([
      ar.data.weekdayFull1,
      ar.data.weekdayFull2,
      ar.data.weekdayFull3,
      ar.data.weekdayFull4,
      ar.data.weekdayFull5,
      ar.data.weekdayFull6,
      ar.data.weekdayFull7,
    ]).toEqual(AR_FULL);
    expect(ar.data.byteB).toBe("\u0628\u0627\u064a\u062a");
    expect(ar.data.byteKB).toBe("\u0643\u064a\u0644\u0648\u0628\u0627\u064a\u062a");
    expect(ar.data.byteMB).toBe("\u0645\u064a\u062c\u0627\u0628\u0627\u064a\u062a");
    expect(ar.data.byteGB).toBe("\u062c\u064a\u062c\u0627\u0628\u0627\u064a\u062a");

    for (const locale of ["en", "ar"] as const) {
      const units = byteUnits(locale);
      expect(formatCount(1234, locale)).toBe("1,234");
      expect(formatProgress(0, locale)).toBe("0");
      expect(formatProgress(0.5, locale)).toBe("50");
      expect(formatProgress(0.999, locale)).toBe("99");
      expect(formatProgress(1, locale)).toBe("100");
      expect(formatByteSize(999, locale, units)).toBe(`999 ${units.B}`);
      expect(formatByteSize(1000, locale, units)).toBe(`1.0 ${units.kB}`);
      expect(formatByteSize(1250000, locale, units)).toBe(`1.3 ${units.MB}`);
      expect(formatByteSize(12500000, locale, units)).toBe(`13 ${units.MB}`);
      expect(formatByteSize(2500000000, locale, units)).toBe(`2.5 ${units.GB}`);
      for (const refuse of [
        () => formatCount(-1, locale),
        () => formatByteSize(-1500, locale, units),
        () => formatProgress(-0.01, locale),
        () => formatProgress(1.01, locale),
      ]) {
        let caught: unknown;
        try {
          refuse();
        } catch (error) {
          caught = error;
        }
        expect(caught).toBeInstanceOf(RangeError);
        expect((caught as RangeError).name).toBe("RangeError");
      }
      const pattern = locale === "en" ? en.data.percent : ar.data.percent;
      expect(pattern.startsWith("{value}")).toBe(true);
      expect(pattern.endsWith("%")).toBe(true);
      expect(fillPattern(pattern, { value: formatProgress(0.5, locale) })).toBe("50%");
    }
  });
});
