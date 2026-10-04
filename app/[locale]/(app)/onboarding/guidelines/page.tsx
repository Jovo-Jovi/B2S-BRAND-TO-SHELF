import { notFound, redirect } from "next/navigation";

import { GuidelinesStep } from "@/features/onboarding/components/guidelines-step";
import { NamedScreen } from "@/features/onboarding/components/named-screen";
import { themedHref } from "@/features/onboarding/destination";
import { enter } from "@/features/onboarding/enter";
import { readBrandSnapshot, readGuidelineForm } from "@/features/onboarding/queries";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ theme?: string | string[] }>;
};

export default async function GuidelinesPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const query = await searchParams;
  const entered = await enter(locale, "guidelines", query.theme);
  if (!entered) notFound();
  if (entered.decision.type === "redirect") redirect(themedHref(entered.decision.href, entered.theme));
  if (entered.decision.screen === "pending") return <NamedScreen copy={entered.copy} />;
  if (entered.decision.screen !== "guidelines") redirect(themedHref(`/${entered.locale}/onboarding`, entered.theme));

  const [guidelines, snapshot] = await Promise.all([
    readGuidelineForm(),
    readBrandSnapshot({
      background: entered.copy.startingBackground,
      foreground: entered.copy.startingForeground,
      muted: entered.copy.startingMuted,
      critical: entered.copy.startingCritical,
    }),
  ]);

  return (
    <main>
      <h1>{entered.copy.guidelines}</h1>
      <GuidelinesStep
        locale={entered.locale}
        copy={entered.copy}
        theme={entered.theme}
        guidelines={guidelines}
        defaultLocale={snapshot.defaultLocale}
      />
    </main>
  );
}
