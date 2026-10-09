export function acceptedSignUpPath(locale: "en" | "ar", session: unknown): string {
  if (session) return `/${locale}`;
  return `/${locale}/sign-in?error=confirmation_sent`;
}
