import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  LabelSpecimen,
  StickerSpecimen,
  missingMarkNote,
  type SpecimenCopy,
  type SpecimenMark,
} from "../app/[locale]/(public)/gallery/specimens";

const copy: SpecimenCopy = {
  product: "[PRODUCT NAME]",
  weight: "[NET WT]",
  missingMark: "The {ground} mark is missing.",
  groundLight: "light-ground",
  groundDark: "dark-ground",
};

const names = { en: "Northwind Sample", ar: "Northwind Sample" };
const darkOnly: SpecimenMark[] = [{ ground: "dark", src: "/gallery/sample-mark-dark.svg" }];

describe("preview specimens", () => {
  it("leaves the logo slot empty and names the missing ground", () => {
    const html = renderToStaticMarkup(
      <LabelSpecimen defaultLocale="en" names={names} primary="#ffffff" marks={darkOnly} copy={copy} />,
    );
    expect(html).toContain('data-part="logo-slot"');
    expect(html).not.toContain("sample-mark-dark.svg");
    expect(missingMarkNote("#ffffff", darkOnly, copy)).toBe("The light-ground mark is missing.");
    const sticker = renderToStaticMarkup(
      <StickerSpecimen defaultLocale="en" names={names} primary="#ffffff" marks={darkOnly} copy={copy} />,
    );
    expect(sticker).not.toContain("sample-mark-dark.svg");
  });

  it("assigns each part the role section 3.1 names and never uses critical", () => {
    const label = renderToStaticMarkup(
      <LabelSpecimen defaultLocale="en" names={names} primary="#111111" marks={darkOnly} copy={copy} />,
    );
    expect(label).toContain('data-part="band" data-role="primary"');
    expect(label).toContain('data-part="panel" data-role="background"');
    expect(label).toContain('data-part="name" data-role="foreground"');
    expect(label).toContain('data-part="name-other" data-role="foreground"');
    expect(label).toContain('data-part="rule" data-role="accent"');
    expect(label).toContain('data-part="product" data-role="muted"');
    expect(label).toContain('data-part="weight" data-role="muted"');
    expect(label).toContain('data-part="strip" data-role="secondary"');
    expect(label).not.toContain("critical");
    const sticker = renderToStaticMarkup(
      <StickerSpecimen defaultLocale="en" names={names} primary="#111111" marks={darkOnly} copy={copy} />,
    );
    expect(sticker).toContain('data-part="disc" data-role="primary"');
    expect(sticker).toContain('data-part="ring" data-role="accent"');
    expect(sticker).toContain('data-part="sticker-name" data-role="background"');
    expect(sticker).not.toContain("critical");
  });
});
