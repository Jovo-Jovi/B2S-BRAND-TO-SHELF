import { notFound } from "next/navigation";

import { galleryRefused } from "../gallery/production";

const PROBE_EMAIL = "person@example.com";

type ErrorProbePageProps = {
  searchParams: Promise<{ fixture?: string | string[] }>;
};

export default async function ErrorProbePage({ searchParams }: ErrorProbePageProps) {
  if (galleryRefused(process.env.VERCEL_ENV)) {
    notFound();
  }

  const fixture = (await searchParams).fixture;
  const selected = Array.isArray(fixture) ? fixture[0] : fixture;
  if (selected === "email") {
    throw new Error(`probe ${PROBE_EMAIL}`);
  }
  throw new Error("probe");
}
