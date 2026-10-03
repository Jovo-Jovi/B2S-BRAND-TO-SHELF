import { notFound } from "next/navigation";

import { getDictionary, hasLocale, type Locale } from "../../dictionaries";
import { GALLERY_THEMES, type GalleryTheme } from "./coverage";
import { Gallery } from "./gallery";
import { galleryRefused } from "./production";

type GalleryPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ theme?: string | string[] }>;
};

function themeFromSearch(raw: string | string[] | undefined): GalleryTheme {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value && (GALLERY_THEMES as readonly string[]).includes(value)) {
    return value as GalleryTheme;
  }
  return "light";
}

export default async function GalleryPage({ params, searchParams }: GalleryPageProps) {
  if (galleryRefused(process.env.VERCEL_ENV)) {
    notFound();
  }

  const { locale } = await params;
  if (!hasLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);
  const theme = themeFromSearch((await searchParams).theme);
  const typedLocale: Locale = locale;

  return (
    <Gallery
      locale={typedLocale}
      theme={theme}
      copy={dictionary.gallery}
      data={dictionary.data}
    />
  );
}
