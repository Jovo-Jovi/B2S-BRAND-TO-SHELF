import { NextResponse } from "next/server";

import { defaultLocale, hasLocale } from "../../dictionaries";
import { completeOAuthCallback } from "@/features/access/actions";

type CallbackContext = {
  params: Promise<{ locale: string }>;
};

export async function GET(request: Request, context: CallbackContext) {
  const { locale } = await context.params;
  const url = new URL(request.url);

  if (!hasLocale(locale)) {
    return NextResponse.redirect(new URL(`/${defaultLocale}/sign-in`, url));
  }

  await completeOAuthCallback({
    locale,
    code: url.searchParams.get("code") ?? undefined,
    error: url.searchParams.get("error") ?? undefined,
  });

  return NextResponse.redirect(new URL(`/${locale}`, url));
}
