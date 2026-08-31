import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, locales } from "./app/[locale]/dictionaries";
import { updateSession } from "./lib/supabase/session";

function detectLocale(request: NextRequest): string {
  const header = request.headers.get("accept-language");
  if (!header) {
    return defaultLocale;
  }

  const preferred = header
    .split(",")
    .map((part) => part.trim().split(";")[0]?.split("-")[0]?.toLowerCase());

  for (const tag of preferred) {
    const match = locales.find((locale) => locale === tag);
    if (match) {
      return match;
    }
  }

  return defaultLocale;
}

// Locale is normalised BEFORE any authorization gate (ADR-007), then the
// session is resolved. A locale redirect does not refresh the session; the
// following request, now localized, does.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (!pathnameHasLocale) {
    const locale = detectLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(url);
  }

  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
