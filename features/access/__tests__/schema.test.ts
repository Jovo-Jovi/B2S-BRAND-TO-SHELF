import { describe, expect, it } from "vitest";

import {
  googleSignInSchema,
  oauthCallbackSchema,
  signInSchema,
  signUpSchema,
} from "../schema";

describe("access schemas", () => {
  it("accepts a well-formed sign-in payload", () => {
    const result = signInSchema.safeParse({
      email: "member@example.com",
      password: "secret",
      locale: "en",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing password", () => {
    const result = signUpSchema.safeParse({
      email: "member@example.com",
      password: "",
      locale: "ar",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path[0]).toBe("password");
    }
  });

  it("rejects a string that is not an email", () => {
    const result = signInSchema.safeParse({
      email: "not-an-email",
      password: "secret",
      locale: "en",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path[0]).toBe("email");
    }
  });

  it("reads credentials out of FormData at the schema boundary", () => {
    const formData = new FormData();
    formData.set("email", "member@example.com");
    formData.set("password", "secret");
    formData.set("locale", "ar");
    const result = signInSchema.safeParse(formData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.locale).toBe("ar");
      expect(result.data.email).toBe("member@example.com");
    }
  });

  it("accepts a Google sign-in locale", () => {
    const result = googleSignInSchema.safeParse({ locale: "en" });
    expect(result.success).toBe(true);
  });

  it("accepts an OAuth callback with a code and no error", () => {
    const result = oauthCallbackSchema.safeParse({
      locale: "en",
      code: "pkce-code",
    });
    expect(result.success).toBe(true);
  });
});
