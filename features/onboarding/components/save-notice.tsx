"use client";

import { Glyph } from "@/components/ui/glyphs";
import { Notice } from "@/components/ui/notice/notice";

export type SaveKind = "saved" | "failed" | null;

type SaveResult = {
  notice?: "saved" | null;
  gaps?: string[];
};

export function saveKind(intent: string, result: SaveResult | undefined): SaveKind {
  if (result?.notice === "saved") return "saved";
  if (intent === "save" && result?.gaps?.includes("refused")) return "failed";
  return null;
}

export function isNextRedirect(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("digest" in error)) return false;
  return String((error as { digest: unknown }).digest).startsWith("NEXT_REDIRECT");
}

type SaveNoticeProps = {
  kind: SaveKind;
  savedTitle: string;
  savedMessage: string;
  failedTitle: string;
  failedMessage: string;
};

export function SaveNotice({ kind, savedTitle, savedMessage, failedTitle, failedMessage }: SaveNoticeProps) {
  if (kind === "saved") {
    return (
      <Notice
        variant="inline"
        tone="success"
        title={savedTitle}
        message={savedMessage}
        icon={<Glyph name="check" />}
      />
    );
  }
  if (kind === "failed") {
    return (
      <Notice
        variant="inline"
        tone="danger"
        title={failedTitle}
        message={failedMessage}
        icon={<Glyph name="danger" />}
      />
    );
  }
  return null;
}
