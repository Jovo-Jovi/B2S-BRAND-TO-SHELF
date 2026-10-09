import { notFound, redirect } from "next/navigation";

import { CompanyStep } from "@/features/onboarding/components/company-step";
import { NamedScreen } from "@/features/onboarding/components/named-screen";
import { themedHref } from "@/features/onboarding/destination";
import { enter } from "@/features/onboarding/enter";
import { readBrandSnapshot, readCompanyForm } from "@/features/onboarding/queries";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ theme?: string | string[] }>;
};

export default async function CompanyPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const query = await searchParams;
  const entered = await enter(locale, "company", query.theme);
  if (!entered) notFound();
  if (entered.decision.type === "redirect") redirect(themedHref(entered.decision.href, entered.theme));
  if (entered.decision.screen === "pending") return <NamedScreen copy={entered.copy} locale={entered.locale} />;
  if (entered.decision.screen !== "company") redirect(themedHref(`/${entered.locale}/onboarding`, entered.theme));

  const [values, snapshot] = await Promise.all([
    readCompanyForm(),
    readBrandSnapshot({
      background: entered.copy.startingBackground,
      foreground: entered.copy.startingForeground,
      muted: entered.copy.startingMuted,
      critical: entered.copy.startingCritical,
    }),
  ]);

  return (
    <main>
      <h1>{entered.copy.company}</h1>
      <CompanyStep
        locale={entered.locale}
        copy={entered.copy}
        theme={entered.theme}
        values={values}
        defaultLocale={snapshot.defaultLocale}
      />
    </main>
  );
}
