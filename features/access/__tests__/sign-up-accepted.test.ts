import { describe, expect, it } from "vitest";

import { acceptedSignUpPath } from "../sign-up-accepted";

describe("accepted sign-up", () => {
  it("returns to sign-in with the same notice whether or not a session was issued", () => {
    const without = acceptedSignUpPath("en", null);
    expect(without).toBe("/en/sign-in?error=confirmation_sent");
    expect(without).not.toContain("@");
    expect(acceptedSignUpPath("ar", null)).toBe("/ar/sign-in?error=confirmation_sent");
    expect(acceptedSignUpPath("en", { access_token: "present" })).toBe("/en");
  });
});
