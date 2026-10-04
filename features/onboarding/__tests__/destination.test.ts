import { describe, expect, it } from "vitest";

import { decide, signInReturn, themedHref } from "../destination";

describe("onboarding gate", () => {
  it("keeps a theme query on a redirect", () => {
    expect(themedHref("/en/onboarding/welcome", "dark")).toBe("/en/onboarding/welcome?theme=dark");
    expect(themedHref("/en/sign-in?next=%2Fen%2Fonboarding%2Fbrand", "light")).toBe(
      "/en/sign-in?next=%2Fen%2Fonboarding%2Fbrand&theme=light",
    );
    expect(themedHref("/en/onboarding/brand", null)).toBe("/en/onboarding/brand");
  });

  it("sends an anonymous person to sign-in and back", () => {
    expect(decide("en", { kind: "anonymous" }, "brand")).toEqual({
      type: "redirect",
      href: signInReturn("en", "brand"),
    });
    expect(signInReturn("ar", "typography")).toBe("/ar/sign-in?next=%2Far%2Fonboarding%2Ftypography");
  });

  it("sends a signed-in person with no current tenant to welcome", () => {
    expect(decide("en", { kind: "welcome" }, "brand").type === "redirect" && decide("en", { kind: "welcome" }, "brand")).toEqual({
      type: "redirect",
      href: "/en/onboarding/welcome",
    });
    expect(decide("en", { kind: "welcome" }, "welcome")).toEqual({ type: "render", screen: "welcome" });
  });

  it("shows the owner-pending screen to a member who is not the owner", () => {
    expect(decide("en", { kind: "pending" }, "brand")).toEqual({ type: "render", screen: "pending" });
  });

  it("keeps earlier steps and refuses later ones", () => {
    expect(decide("en", { kind: "draft", resume: "typography" }, "brand")).toEqual({
      type: "render",
      screen: "brand",
    });
    expect(decide("en", { kind: "draft", resume: "typography" }, "welcome")).toEqual({
      type: "render",
      screen: "welcome",
    });
    expect(decide("en", { kind: "draft", resume: "brand" }, "company")).toEqual({
      type: "redirect",
      href: "/en/onboarding/brand",
    });
    expect(decide("en", { kind: "draft", resume: "typography" }, "typography")).toEqual({
      type: "render",
      screen: "typography",
    });
  });

  it("sends a finished tenant to the completion route", () => {
    expect(decide("ar", { kind: "complete" }, "brand")).toEqual({
      type: "redirect",
      href: "/ar/onboarding/complete",
    });
    expect(decide("ar", { kind: "complete" }, "complete")).toEqual({ type: "render", screen: "complete" });
  });

  it("opens brand when a draft still has to be repaired", () => {
    expect(decide("en", { kind: "repair" }, "welcome")).toEqual({
      type: "redirect",
      href: "/en/onboarding/brand",
    });
  });
});
