import { SignOutControl } from "@/features/access/components/sign-out-control";

import type { LocaleCode } from "../types";
import type { OnboardingCopy } from "./copy";

type NamedScreenProps = {
  copy: OnboardingCopy;
  locale: LocaleCode;
};

export function NamedScreen({ copy, locale }: NamedScreenProps) {
  return (
    <main data-screen="pending">
      <SignOutControl locale={locale} caption={copy.signOut} />
      <h1>{copy.pendingTitle}</h1>
      <p>{copy.pendingBody}</p>
    </main>
  );
}

export type { LocaleCode };
