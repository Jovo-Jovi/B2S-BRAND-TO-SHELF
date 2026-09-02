import { z } from "zod";

import type { AccessErrorKey } from "./schema";

export function zodErrorKey(error: z.ZodError): AccessErrorKey {
  const path = error.issues[0]?.path[0];
  if (path === "email") return "email_invalid";
  if (path === "password") return "password_required";
  if (path === "locale") return "locale_invalid";
  return "input_invalid";
}

export function signUpAuthErrorKey(message: string | null | undefined): AccessErrorKey {
  void message;
  return "identity_refused";
}

export function signInAuthErrorKey(message: string | null | undefined): AccessErrorKey {
  if (/access_denied/i.test(message ?? "")) return "oauth_cancelled";
  return "sign_in_refused";
}

export function oauthQueryErrorKey(error: string | undefined): AccessErrorKey {
  if (error === "access_denied") return "oauth_cancelled";
  return "identity_refused";
}
