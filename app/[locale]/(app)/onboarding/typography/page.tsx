import { notFound, redirect } from "next/navigation";

import { NamedScreen } from "@/features/onboarding/components/named-screen";
import { TypographyStep } from "@/features/onboarding/components/typography-step";
import { themedHref } from "@/features/onboarding/destination";
import { enter } from "@/features/onboarding/enter";
import { readBrandSnapshot } from "@/features/onboarding/queries";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ theme?: string | string[] }>;
};

export default async function TypographyPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const query = await searchParams;
  const entered = await enter(locale, "typography", query.theme);
  if (!entered) notFound();
  if (entered.decision.type === "redirect") redirect(themedHref(entered.decision.href, entered.theme));
  if (entered.decision.screen === "pending") return <NamedScreen copy={entered.copy} kind="pending" />;
  if (entered.decision.screen !== "typography") redirect(themedHref(`/${entered.locale}/onboarding`, entered.theme));

  const snapshot = await readBrandSnapshot({
    background: entered.copy.startingBackground,
    foreground: entered.copy.startingForeground,
    muted: entered.copy.startingMuted,
    critical: entered.copy.startingCritical,
  });

  return (
    <main>
      <h1>{entered.copy.typography}</h1>
      <TypographyStep locale={entered.locale} copy={entered.copy} theme={entered.theme} snapshot={snapshot} />
    </main>
  );
}
