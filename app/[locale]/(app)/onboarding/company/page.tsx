import { notFound, redirect } from "next/navigation";

import { CompanyStep } from "@/features/onboarding/components/company-step";
import { NamedScreen } from "@/features/onboarding/components/named-screen";
import { themedHref } from "@/features/onboarding/destination";
import { enter } from "@/features/onboarding/enter";
import { readBrandSnapshot, readCompanyForm, startingColours } from "@/features/onboarding/queries";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ theme?: string | string[] }>;
};

export default async function CompanyPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const query = await searchParams;
  const entered = await enter(locale, "company", query.theme, async (copy) => {
    const [values, snapshot] = await Promise.all([readCompanyForm(), readBrandSnapshot(startingColours(copy))]);
    return { values, snapshot };
  });
  if (!entered) notFound();
  if (entered.decision.type === "redirect") redirect(themedHref(entered.decision.href, entered.theme));
  if (entered.decision.screen === "pending") return <NamedScreen copy={entered.copy} locale={entered.locale} />;
  if (entered.decision.screen !== "company") redirect(themedHref(`/${entered.locale}/onboarding`, entered.theme));

  return (
    <main>
      <h1>{entered.copy.company}</h1>
      <CompanyStep
        locale={entered.locale}
        copy={entered.copy}
        theme={entered.theme}
        values={entered.loaded.values}
        defaultLocale={entered.loaded.snapshot.defaultLocale}
      />
    </main>
  );
}
