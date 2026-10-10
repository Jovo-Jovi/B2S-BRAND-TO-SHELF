import { EntryFrame } from "@/components/shared/entry-frame/entry-frame";
import { SignOutControl } from "@/features/access/components/sign-out-control";

import type { LocaleCode } from "../types";
import type { OnboardingCopy } from "./copy";

type NamedScreenProps = {
  copy: OnboardingCopy;
  locale: LocaleCode;
};

export function NamedScreen({ copy, locale }: NamedScreenProps) {
  const other: LocaleCode = locale === "en" ? "ar" : "en";
  return (
    <main data-screen="pending">
      <EntryFrame
        wordmark={<p>{copy.mark}</p>}
        tagline={copy.tagline}
        localeHref={`/${other}/onboarding`}
        localeCaption={other === "ar" ? copy.localeAr : copy.localeEn}
      >
        <h1>{copy.pendingTitle}</h1>
        <p>{copy.pendingBody}</p>
        <SignOutControl locale={locale} caption={copy.signOut} />
      </EntryFrame>
    </main>
  );
}

export type { LocaleCode };
