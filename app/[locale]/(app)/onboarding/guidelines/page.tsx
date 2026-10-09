import { notFound, redirect } from "next/navigation";

import { GuidelinesStep } from "@/features/onboarding/components/guidelines-step";
import { NamedScreen } from "@/features/onboarding/components/named-screen";
import { themedHref } from "@/features/onboarding/destination";
import { enter } from "@/features/onboarding/enter";
import { readBrandSnapshot, readGuidelineForm, startingColours } from "@/features/onboarding/queries";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ theme?: string | string[] }>;
};

export default async function GuidelinesPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const query = await searchParams;
  const entered = await enter(locale, "guidelines", query.theme, async (copy) => {
    const [guidelines, snapshot] = await Promise.all([readGuidelineForm(), readBrandSnapshot(startingColours(copy))]);
    return { guidelines, snapshot };
  });
  if (!entered) notFound();
  if (entered.decision.type === "redirect") redirect(themedHref(entered.decision.href, entered.theme));
  if (entered.decision.screen === "pending") return <NamedScreen copy={entered.copy} locale={entered.locale} />;
  if (entered.decision.screen !== "guidelines") redirect(themedHref(`/${entered.locale}/onboarding`, entered.theme));

  return (
    <main>
      <h1>{entered.copy.guidelines}</h1>
      <GuidelinesStep
        locale={entered.locale}
        copy={entered.copy}
        theme={entered.theme}
        guidelines={entered.loaded.guidelines}
        defaultLocale={entered.loaded.snapshot.defaultLocale}
      />
    </main>
  );
}
