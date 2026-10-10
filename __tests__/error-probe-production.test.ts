import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
}));

import ErrorProbePage from "../app/[locale]/(public)/error-probe/page";

describe("error probe production refusal", () => {
  it("calls notFound when the deployment is production", async () => {
    const previous = process.env.VERCEL_ENV;
    process.env.VERCEL_ENV = "production";
    await expect(
      ErrorProbePage({ searchParams: Promise.resolve({}) }),
    ).rejects.toThrow("NOT_FOUND");
    process.env.VERCEL_ENV = previous;
  });

  it("throws the probe outside production", async () => {
    const previous = process.env.VERCEL_ENV;
    process.env.VERCEL_ENV = "preview";
    await expect(
      ErrorProbePage({ searchParams: Promise.resolve({}) }),
    ).rejects.toThrow("probe");
    process.env.VERCEL_ENV = previous;
  });
});
