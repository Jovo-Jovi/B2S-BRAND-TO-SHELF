import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "./dictionaries";

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LocalePage({ params }: LocalePageProps) {
  const { locale } = await params;

  if (!hasLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);

  return (
    <main>
      <h1>{dictionary.shell.title}</h1>
      <p>{dictionary.shell.description}</p>
    </main>
  );
}
