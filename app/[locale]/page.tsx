import { notFound, redirect } from "next/navigation";

import { hasLocale, type Locale } from "./dictionaries";
import { resolveOnboarding } from "@/features/onboarding/resolve";

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

export default async function LocalePage({ params }: LocalePageProps) {
  const { locale } = await params;

  if (!hasLocale(locale)) {
    notFound();
  }

  const typed: Locale = locale;
  const decision = await resolveOnboarding(typed, "index");
  if (decision.type === "redirect") {
    redirect(decision.href);
  }
  redirect(`/${typed}/onboarding`);
}
