"use client";

import { usePathname } from "next/navigation";

import { ServerErrorView } from "./server-error-view";
import "./globals.css";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const path = usePathname() ?? "";
  const locale = path === "/ar" || path.startsWith("/ar/") ? "ar" : "en";
  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body>
        <ServerErrorView locale={locale} digest={error.digest ?? ""} onRetry={reset} />
      </body>
    </html>
  );
}
