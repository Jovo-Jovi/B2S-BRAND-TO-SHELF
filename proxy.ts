import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, locales } from "./app/[locale]/dictionaries";

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

// Runs before route resolution, session resolution and every authorization
// gate — the ordering ADR-007 fixes so no later gate can be placed ahead of
// locale normalisation.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
