"use client";

import { ErrorState } from "@/components/shared/error-state/error-state";

import ar from "./[locale]/dictionaries/ar.json";
import en from "./[locale]/dictionaries/en.json";

type ServerErrorViewProps = {
  locale: "en" | "ar";
  digest: string;
  onRetry: () => void;
};

export function ServerErrorView({ locale, digest, onRetry }: ServerErrorViewProps) {
  const copy = locale === "ar" ? ar.error : en.error;
  return (
    <main>
      <ErrorState
        title={copy.title}
        message={copy.message}
        next={copy.next}
        retry={copy.retry}
        onRetry={onRetry}
        requestIdentifier={digest}
        copyIdentifier={copy.copyIdentifier}
      />
    </main>
  );
}
