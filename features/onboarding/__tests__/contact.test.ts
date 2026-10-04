import { describe, expect, it } from "vitest";

import { emailStored, phoneStored, scalarToWrite, taxStored } from "../contact";

describe("legal-entity contact values", () => {
  it("stores an Egyptian national number by replacing the leading zero with the country code", () => {
    const national = `0${"1001234567"}`;
    const stored = phoneStored(national);
    expect(stored).toEqual({ kind: "valid", stored: `+20${"1001234567"}` });
  });

  it("keeps an international number that already matches the stored form", () => {
    const international = `+20${"1001234567"}`;
    expect(phoneStored(international)).toEqual({ kind: "valid", stored: international });
  });

  it("names a number that is neither form, and treats a blank as not provided", () => {
    expect(phoneStored("12345").kind).toBe("invalid");
    expect(phoneStored("  ")).toEqual({ kind: "empty" });
  });

  it("keeps a previously saved value when the new one is malformed", () => {
    const previous = "TAX123";
    expect(scalarToWrite(taxStored("not valid"), previous)).toBe(previous);
    expect(scalarToWrite(emailStored("not-an-email"), "")).toBe("");
    expect(scalarToWrite(emailStored(""), previous)).toBe("");
    expect(scalarToWrite(taxStored("TAX123"), previous)).toBe("TAX123");
  });
});
