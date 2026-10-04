import type { LocaleCode } from "../types";
import type { OnboardingCopy } from "./copy";

type NamedScreenProps = {
  copy: OnboardingCopy;
  kind: "pending" | "complete";
};

export function NamedScreen({ copy, kind }: NamedScreenProps) {
  if (kind === "pending") {
    return (
      <main data-screen="pending">
        <h1>{copy.pendingTitle}</h1>
        <p>{copy.pendingBody}</p>
      </main>
    );
  }
  return (
    <main data-screen="complete" data-interim="complete">
      <h1>{copy.completeStub}</h1>
      <p>{copy.completeStubBody}</p>
    </main>
  );
}

export type { LocaleCode };
