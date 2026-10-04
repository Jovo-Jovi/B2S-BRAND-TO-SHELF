import { notFound, redirect } from "next/navigation";

import { NamedScreen } from "@/features/onboarding/components/named-screen";
import { ReviewStep } from "@/features/onboarding/components/review-step";
import { themedHref } from "@/features/onboarding/destination";
import { enter } from "@/features/onboarding/enter";
import { readBrandSnapshot, readReviewModel } from "@/features/onboarding/queries";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ theme?: string | string[] }>;
};

export default async function ReviewPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const query = await searchParams;
  const entered = await enter(locale, "review", query.theme);
  if (!entered) notFound();
  if (entered.decision.type === "redirect") redirect(themedHref(entered.decision.href, entered.theme));
  if (entered.decision.screen === "pending") return <NamedScreen copy={entered.copy} />;
  if (entered.decision.screen !== "review") redirect(themedHref(`/${entered.locale}/onboarding`, entered.theme));

  const starting = {
    background: entered.copy.startingBackground,
    foreground: entered.copy.startingForeground,
    muted: entered.copy.startingMuted,
    critical: entered.copy.startingCritical,
  };
  const [snapshot, review] = await Promise.all([readBrandSnapshot(starting), readReviewModel()]);

  return (
    <main>
      <h1>{entered.copy.review}</h1>
      <ReviewStep locale={entered.locale} copy={entered.copy} theme={entered.theme} snapshot={snapshot} review={review} />
    </main>
  );
}
