import { notFound, redirect } from "next/navigation";

import { SignOutControl } from "@/features/access/components/sign-out-control";
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
      <SignOutControl locale={entered.locale} caption={entered.copy.signOut} />
      <h1>{entered.copy.completeTitle}</h1>
      <CompletionScreen copy={entered.copy} snapshot={entered.loaded} />
    </main>
  );
}
