"use client";

import { Button } from "@/components/ui/button/button";

import { signOut } from "../actions";

type SignOutControlProps = {
  locale: "en" | "ar";
  caption: string;
};

export function SignOutControl({ locale, caption }: SignOutControlProps) {
  return (
    <form action={signOut}>
      <input type="hidden" name="locale" value={locale} />
      <Button type="submit" variant="quiet">
        {caption}
      </Button>
    </form>
  );
}
