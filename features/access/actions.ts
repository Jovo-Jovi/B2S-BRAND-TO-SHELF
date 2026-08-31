"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { defaultLocale } from "@/app/[locale]/dictionaries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  oauthQueryErrorKey,
  signInAuthErrorKey,
  signUpAuthErrorKey,
  zodErrorKey,
} from "./errors";
import {
  googleSignInSchema,
  oauthCallbackSchema,
  signInSchema,
  signUpSchema,
  type AccessErrorKey,
} from "./schema";

function signInPath(locale: "en" | "ar", errorKey: AccessErrorKey): string {
  return `/${locale}/sign-in?error=${errorKey}`;
}

function homePath(locale: "en" | "ar"): string {
  return `/${locale}`;
}

function localeFromInput(input: unknown): "en" | "ar" {
  if (typeof FormData !== "undefined" && input instanceof FormData) {
    const value = input.get("locale");
    if (value === "en" || value === "ar") return value;
  }
  if (input !== null && typeof input === "object" && "locale" in input) {
    const value = (input as { locale: unknown }).locale;
    if (value === "en" || value === "ar") return value;
  }
  return defaultLocale;
}

async function requestOrigin(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  if (!host) {
    throw new Error("Sign-in cannot determine the request host");
  }
  const proto = headerList.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

function authMessage(error: { message?: string } | null): string | undefined {
  return error?.message;
}

export async function signInWithPassword(input: unknown) {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    redirect(signInPath(localeFromInput(input), zodErrorKey(parsed.error)));
  }

  const supabase = await createSupabaseServerClient();
  const result = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (result.error) {
    redirect(signInPath(parsed.data.locale, signInAuthErrorKey(authMessage(result.error))));
  }

  redirect(homePath(parsed.data.locale));
}

export async function signUpWithPassword(input: unknown) {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    redirect(signInPath(localeFromInput(input), zodErrorKey(parsed.error)));
  }

  const supabase = await createSupabaseServerClient();
  const result = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (result.error) {
    redirect(
      signInPath(parsed.data.locale, signUpAuthErrorKey(authMessage(result.error))),
    );
  }

  redirect(homePath(parsed.data.locale));
}

export async function signInWithGoogle(input: unknown) {
  const parsed = googleSignInSchema.safeParse(input);
  if (!parsed.success) {
    redirect(signInPath(localeFromInput(input), zodErrorKey(parsed.error)));
  }

  const origin = await requestOrigin();
  const supabase = await createSupabaseServerClient();
  const result = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/${parsed.data.locale}/callback`,
    },
  });

  if (result.error || !result.data.url) {
    redirect(
      signInPath(parsed.data.locale, signInAuthErrorKey(authMessage(result.error))),
    );
  }

  redirect(result.data.url);
}

export async function completeOAuthCallback(input: unknown) {
  const parsed = oauthCallbackSchema.safeParse(input);
  if (!parsed.success) {
    redirect(signInPath(localeFromInput(input), zodErrorKey(parsed.error)));
  }

  if (parsed.data.error && !parsed.data.code) {
    redirect(signInPath(parsed.data.locale, oauthQueryErrorKey(parsed.data.error)));
  }

  if (!parsed.data.code) {
    redirect(signInPath(parsed.data.locale, "identity_refused"));
  }

  const supabase = await createSupabaseServerClient();
  const result = await supabase.auth.exchangeCodeForSession(parsed.data.code);

  if (result.error) {
    redirect(
      signInPath(parsed.data.locale, signUpAuthErrorKey(authMessage(result.error))),
    );
  }

  redirect(homePath(parsed.data.locale));
}
