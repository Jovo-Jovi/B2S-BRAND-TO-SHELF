import type { LocaleCode } from "../types";
import type { OnboardingCopy } from "./copy";

type NamedScreenProps = {
  copy: OnboardingCopy;
};

export function NamedScreen({ copy }: NamedScreenProps) {
  return (
    <main data-screen="pending">
      <h1>{copy.pendingTitle}</h1>
      <p>{copy.pendingBody}</p>
    </main>
  );
}

export type { LocaleCode };
