import { describe, expect, it } from "vitest";

import { formatContrastRatio, formatNumber } from "./format-number";

describe("formatNumber", () => {
  it("uses R1-25 separators in both locales", () => {
    for (const locale of ["en", "ar"] as const) {
      expect(formatNumber(1234, locale)).toBe("1,234");
      expect(formatNumber(4.5, locale, 1)).toBe("4.5");
      expect(formatContrastRatio(17.4, locale)).toBe("17.40");
    }
  });
});
