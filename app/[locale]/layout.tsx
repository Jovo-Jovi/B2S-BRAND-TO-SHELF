import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  direction,
  getDictionary,
  hasLocale,
  locales,
} from "./dictionaries";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;

  if (!hasLocale(locale)) {
    return {};
  }

  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.shell.title,
    description: dictionary.shell.description,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(locale)) {
    notFound();
  }

  return (
    <html lang={locale} dir={direction[locale]}>
      <link
        rel="preload"
        href="/fonts/IBMPlexSans-Regular.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <link
        rel="preload"
        href="/fonts/IBMPlexSansArabic-Regular.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <body>{children}</body>
    </html>
  );
}
