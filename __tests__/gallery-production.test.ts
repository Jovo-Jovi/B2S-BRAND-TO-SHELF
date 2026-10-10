import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
}));

import GalleryPage from "../app/[locale]/(public)/gallery/page";
import { galleryRefused } from "../app/[locale]/(public)/gallery/production";

describe("gallery production refusal", () => {
  it("refuses only the production deployment", () => {
    expect(galleryRefused("production")).toBe(true);
    expect(galleryRefused("preview")).toBe(false);
    expect(galleryRefused("development")).toBe(false);
    expect(galleryRefused(undefined)).toBe(false);
  });

  it("the route calls notFound when the deployment is production", async () => {
    const previous = process.env.VERCEL_ENV;
    process.env.VERCEL_ENV = "production";
    await expect(
      GalleryPage({
        params: Promise.resolve({ locale: "en" }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow("NOT_FOUND");
    process.env.VERCEL_ENV = previous;
  });

  it("the route is served on a preview deployment", async () => {
    const previous = process.env.VERCEL_ENV;
    process.env.VERCEL_ENV = "preview";
    const page = await GalleryPage({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({ theme: "dark" }),
    });
    expect(page).toBeTruthy();
    process.env.VERCEL_ENV = previous;
  });
});
