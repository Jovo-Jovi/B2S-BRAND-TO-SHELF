import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
}));

import WiringPage from "../app/[locale]/(public)/wiring/page";

const params = Promise.resolve({ locale: "en" });

describe("wiring readout", () => {
  it("is refused in production", async () => {
    const previous = process.env.VERCEL_ENV;
    process.env.VERCEL_ENV = "production";
    await expect(WiringPage({ params })).rejects.toThrow("NOT_FOUND");
    process.env.VERCEL_ENV = previous;
  });

  it("names the deployment environment and the project ref, and not the host", async () => {
    const previousEnv = process.env.VERCEL_ENV;
    const previousUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.VERCEL_ENV = "preview";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://bnjrgoaoujnrlvuxicca.supabase.co";
    const element = await WiringPage({ params });
    const html = renderToStaticMarkup(element);
    expect(html).toContain("preview");
    expect(html).toContain("bnjrgoaoujnrlvuxicca");
    expect(html).not.toContain("supabase.co");
    expect(html).not.toContain("akpvvydmltmfmkmwivgn");
    process.env.VERCEL_ENV = previousEnv;
    process.env.NEXT_PUBLIC_SUPABASE_URL = previousUrl;
  });
});
