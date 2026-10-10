import { notFound } from "next/navigation";

import { getDictionary, hasLocale, type Locale } from "../../dictionaries";
import {
  signInWithGoogle,
  signInWithPassword,
  signUpWithPassword,
} from "@/features/access/actions";
import { SignInView } from "@/features/access/components/sign-in-view";
import { isAccessErrorKey } from "@/features/access/schema";

type SignInPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string | string[]; next?: string | string[] }>;
};

function errorFromSearch(raw: string | string[] | undefined) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || !isAccessErrorKey(value)) return null;
  return value;
}

function returnPathFromSearch(raw: string | string[] | undefined): string | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return undefined;
  if (!/^\/(en|ar)\/onboarding(\/[\w-]+)?$/.test(value)) return undefined;
  return value;
}

export const dynamic = "force-dynamic";

export default async function SignInPage({ params, searchParams }: SignInPageProps) {
  const { locale } = await params;
  if (!hasLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);
  const query = await searchParams;
  const typedLocale: Locale = locale;
  const other: Locale = typedLocale === "en" ? "ar" : "en";
  const errorKey = errorFromSearch(query.error);
  const returnPath = returnPathFromSearch(query.next);
  const preserved = new URLSearchParams();
  if (errorKey) preserved.set("error", errorKey);
  if (returnPath) preserved.set("next", returnPath);
  const suffix = preserved.size > 0 ? `?${preserved.toString()}` : "";

  return (
    <main>
      <SignInView
        dictionary={dictionary.access}
        errorKey={errorKey}
        locale={typedLocale}
        returnPath={returnPath}
        wordmark={<h1>{dictionary.onboarding.mark}</h1>}
        localeHref={`/${other}/sign-in${suffix}`}
        localeCaption={other === "ar" ? dictionary.onboarding.localeAr : dictionary.onboarding.localeEn}
        tagline={dictionary.onboarding.tagline}
        signInAction={signInWithPassword}
        signUpAction={signUpWithPassword}
        googleAction={signInWithGoogle}
      />
    </main>
  );
}
