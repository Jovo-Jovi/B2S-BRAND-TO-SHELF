"use client";

import { useParams } from "next/navigation";

import { ServerErrorView } from "../server-error-view";

type LocaleErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function LocaleError({ error, reset }: LocaleErrorProps) {
  const params = useParams();
  const locale = params.locale === "ar" ? "ar" : "en";
  return <ServerErrorView locale={locale} digest={error.digest ?? ""} onRetry={reset} />;
}
