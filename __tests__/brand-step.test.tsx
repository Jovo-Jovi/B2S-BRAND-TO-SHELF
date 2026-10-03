import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import en from "../app/[locale]/dictionaries/en.json";
import { TypographyStep } from "../app/[locale]/(public)/gallery/typography-step";
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

  it("uses the full logo for a ground that has no mark and never a logo for the other ground", () => {
    const marks: SpecimenMark[] = [
      { ground: "light", kind: "full", src: "/gallery/full-light.svg" },
      { ground: "dark", kind: "mark", src: "/gallery/sample-mark-dark.svg" },
      { ground: "light", kind: "wordmark", src: "/gallery/word-light.svg" },
    ];
    const html = renderToStaticMarkup(
      <LabelSpecimen defaultLocale="en" names={names} primary="#ffffff" marks={marks} copy={copy} />,
    );
    expect(html).toContain('src="/gallery/full-light.svg"');
    expect(html).not.toContain("sample-mark-dark.svg");
    expect(html).not.toContain("word-light.svg");
    expect(missingMarkNote("#ffffff", marks, copy)).toBeNull();
    const wordOnly: SpecimenMark[] = [{ ground: "light", kind: "wordmark", src: "/gallery/word-light.svg" }];
    expect(missingMarkNote("#ffffff", wordOnly, copy)).toBe("The light-ground mark is missing.");
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

describe("typography specimen", () => {
  it("lists each script's library families and starts with nothing chosen", () => {
    const html = renderToStaticMarkup(<TypographyStep locale="en" copy={en.gallery} otherLocale="ar" />);
    expect(html).toContain('id="typeface-heading-arabic"');
    expect(html).toContain('id="typeface-body-arabic"');
    expect(html).toContain('id="typeface-heading-latin"');
    expect(html).toContain('id="typeface-body-latin"');
    expect(html).toContain(">Cairo<");
    expect(html).toContain(">Noto Naskh Arabic<");
    expect(html).toContain(">Inter<");
    expect(html).toContain(">Playfair Display<");
    expect(html).not.toContain("Almarai");
    expect(html).toContain(">Not chosen<");
  });
});
