import { notFound, redirect } from "next/navigation";

import { CompletionScreen } from "@/features/onboarding/components/completion-screen";
import { NamedScreen } from "@/features/onboarding/components/named-screen";
import { themedHref } from "@/features/onboarding/destination";
import { enter } from "@/features/onboarding/enter";
import { readBrandSnapshot, startingColours } from "@/features/onboarding/queries";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ theme?: string | string[] }>;
};

export default async function CompletePage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const query = await searchParams;
  const entered = await enter(locale, "complete", query.theme, (copy) => readBrandSnapshot(startingColours(copy)));
  if (!entered) notFound();
  if (entered.decision.type === "redirect") redirect(themedHref(entered.decision.href, entered.theme));
  if (entered.decision.screen === "pending") return <NamedScreen copy={entered.copy} locale={entered.locale} />;

  return (
    <main>
      <CompletionScreen locale={entered.locale} copy={entered.copy} theme={entered.theme} snapshot={entered.loaded} />
    </main>
  );
}
