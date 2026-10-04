import { notFound, redirect } from "next/navigation";

import { NamedScreen } from "@/features/onboarding/components/named-screen";
import { WelcomeStep } from "@/features/onboarding/components/welcome-step";
import { themedHref } from "@/features/onboarding/destination";
import { enter } from "@/features/onboarding/enter";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ theme?: string | string[] }>;
};

export default async function WelcomePage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const query = await searchParams;
  const entered = await enter(locale, "welcome", query.theme);
  if (!entered) notFound();
  if (entered.decision.type === "redirect") redirect(themedHref(entered.decision.href, entered.theme));
  if (entered.decision.screen === "pending") return <NamedScreen copy={entered.copy} kind="pending" />;
  if (entered.decision.screen !== "welcome") redirect(themedHref(`/${entered.locale}/onboarding`, entered.theme));

  return (
    <main>
      <h1>{entered.copy.welcome}</h1>
      <WelcomeStep locale={entered.locale} copy={entered.copy} theme={entered.theme} />
    </main>
  );
}
