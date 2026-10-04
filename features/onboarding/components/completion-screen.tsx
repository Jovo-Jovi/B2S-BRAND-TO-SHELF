"use client";

import { useState } from "react";

import type { BrandSnapshot } from "../types";
import type { OnboardingCopy } from "./copy";
import { BrandProof } from "./proof";

type CompletionScreenProps = {
  copy: OnboardingCopy;
  snapshot: BrandSnapshot;
};

export function CompletionScreen({ copy, snapshot }: CompletionScreenProps) {
  const [tab, setTab] = useState("label");
  return (
    <div data-screen="complete">
      <p>{copy.completeBody}</p>
      <BrandProof copy={copy} snapshot={snapshot} tab={tab} onTab={setTab} />
    </div>
  );
}
