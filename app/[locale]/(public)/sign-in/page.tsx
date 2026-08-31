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
  searchParams: Promise<{ error?: string | string[] }>;
};

function errorFromSearch(raw: string | string[] | undefined) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || !isAccessErrorKey(value)) return null;
  return value;
}

export default async function SignInPage({ params, searchParams }: SignInPageProps) {
  const { locale } = await params;
  if (!hasLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);
  const query = await searchParams;
  const typedLocale: Locale = locale;

  return (
    <SignInView
      dictionary={dictionary.access}
      errorKey={errorFromSearch(query.error)}
      locale={typedLocale}
      signInAction={signInWithPassword}
      signUpAction={signUpWithPassword}
      googleAction={signInWithGoogle}
    />
  );
}
