import { notFound } from "next/navigation";

import { galleryRefused } from "../gallery/production";

type WiringPageProps = {
  params: Promise<{ locale: string }>;
};

function projectRef(url: string | undefined): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.split(".")[0] ?? "";
  } catch {
    return "";
  }
}

export const dynamic = "force-dynamic";

export default async function WiringPage({ params }: WiringPageProps) {
  if (galleryRefused(process.env.VERCEL_ENV)) {
    notFound();
  }
  await params;
  const environment = process.env.VERCEL_ENV ?? "local";
  const project = projectRef(process.env.NEXT_PUBLIC_SUPABASE_URL);

  return (
    <main>
      <h1>Wiring</h1>
      <dl>
        <dt>Environment</dt>
        <dd>{environment}</dd>
        <dt>Project</dt>
        <dd>{project}</dd>
      </dl>
    </main>
  );
}
