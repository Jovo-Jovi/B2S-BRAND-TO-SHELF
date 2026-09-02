import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  oauthQueryErrorKey,
  signInAuthErrorKey,
  signUpAuthErrorKey,
  zodErrorKey,
} from "../errors";
import { signUpSchema } from "../schema";

describe("access error keys", () => {
  it("maps a held-address Auth failure and a generic sign-up failure to the same key", () => {
    const held = signUpAuthErrorKey(
      "member materialisation refused: this email address is already held by a different member",
    );
    const generic = signUpAuthErrorKey("unexpected");
    const empty = signUpAuthErrorKey(undefined);
    expect(held).toBe("identity_refused");
    expect(generic).toBe("identity_refused");
    expect(empty).toBe("identity_refused");
    expect(held).toBe(generic);
  });

  it("maps a failed password sign-in to a sign-in key, not an identity-held key", () => {
    expect(signInAuthErrorKey("Invalid login credentials")).toBe("sign_in_refused");
  });

  it("maps OAuth access_denied to cancelled, and any other OAuth error to identity_refused", () => {
    expect(oauthQueryErrorKey("access_denied")).toBe("oauth_cancelled");
    expect(oauthQueryErrorKey("server_error")).toBe("identity_refused");
    expect(oauthQueryErrorKey("already held by a different member")).toBe(
      "identity_refused",
    );
  });

  it("maps zod path email to email_invalid", () => {
    const result = signUpSchema.safeParse({
      email: "nope",
      password: "secret",
      locale: "en",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(zodErrorKey(result.error)).toBe("email_invalid");
    }
  });

  it("does not treat a ZodError as a disclosing identity refusal", () => {
    const error = new z.ZodError([
      {
        code: "custom",
        path: ["other"],
        message: "already held by a different member",
      },
    ]);
    expect(zodErrorKey(error)).toBe("input_invalid");
  });
});
