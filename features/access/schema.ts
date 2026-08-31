import { z } from "zod";

function credentialsFromUnknown(raw: unknown): unknown {
  if (typeof FormData !== "undefined" && raw instanceof FormData) {
    return {
      email: String(raw.get("email") ?? ""),
      password: String(raw.get("password") ?? ""),
      locale: String(raw.get("locale") ?? ""),
    };
  }
  return raw;
}

const localeSchema = z.enum(["en", "ar"]);

const credentialsObject = z.object({
  email: z.email(),
  password: z.string().min(1),
  locale: localeSchema,
});

export const signInSchema = z.preprocess(credentialsFromUnknown, credentialsObject);

export const signUpSchema = z.preprocess(credentialsFromUnknown, credentialsObject);

export const googleSignInSchema = z.preprocess((raw: unknown) => {
  if (typeof FormData !== "undefined" && raw instanceof FormData) {
    return { locale: String(raw.get("locale") ?? "") };
  }
  return raw;
}, z.object({ locale: localeSchema }));

export const oauthCallbackSchema = z.object({
  locale: localeSchema,
  code: z.string().min(1).optional(),
  error: z.string().optional(),
});

export type AccessErrorKey =
  | "identity_refused"
  | "sign_in_refused"
  | "email_invalid"
  | "password_required"
  | "locale_invalid"
  | "oauth_cancelled"
  | "input_invalid";

export const ACCESS_ERROR_KEYS: readonly AccessErrorKey[] = [
  "identity_refused",
  "sign_in_refused",
  "email_invalid",
  "password_required",
  "locale_invalid",
  "oauth_cancelled",
  "input_invalid",
];

export function isAccessErrorKey(value: string): value is AccessErrorKey {
  return (ACCESS_ERROR_KEYS as readonly string[]).includes(value);
}
