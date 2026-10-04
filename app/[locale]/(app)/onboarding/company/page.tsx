import { notFound, redirect } from "next/navigation";

import { CompanyStub } from "@/features/onboarding/components/company-stub";
import { NamedScreen } from "@/features/onboarding/components/named-screen";
import { themedHref } from "@/features/onboarding/destination";
import { enter } from "@/features/onboarding/enter";

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
  if (entered.decision.screen === "pending") return <NamedScreen copy={entered.copy} kind="pending" />;
  if (entered.decision.screen !== "company") redirect(themedHref(`/${entered.locale}/onboarding`, entered.theme));

  return (
    <main>
      <h1>{entered.copy.companyStub}</h1>
      <CompanyStub locale={entered.locale} copy={entered.copy} theme={entered.theme} />
    </main>
  );
}
