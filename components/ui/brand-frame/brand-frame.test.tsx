// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { BrandFrame, type BrandFrameProfile, type BrandFrameMarkers } from "./brand-frame";

function hex(digits: string): string {
  return `#${digits}`;
}

const markers: BrandFrameMarkers = {
  role: (role) => role,
  localeString: (field, locale) => `${field}/${locale}`,
  typeface: (pair) => pair,
};

const face = { family: "Example Face", weight: "400", italic: false };

function profile(overrides: Partial<BrandFrameProfile> = {}): BrandFrameProfile {
  return {
    colors: {
      primary: hex("112233"),
      secondary: hex("223344"),
      accent: hex("334455"),
      background: hex("ffffff"),
      foreground: hex("1a1a1a"),
      muted: hex("545454"),
      critical: hex("b3261e"),
    },
    typefaces: {
      "heading-latin": face,
      "heading-arabic": face,
      "body-latin": face,
      "body-arabic": { ...face, italic: true },
    },
    strings: [
      { field: "brand", locale: "en", value: "Mint" },
      { field: "brand", locale: "ar", value: "Mint ar" },
    ],
    ...overrides,
  };
}

describe("BrandFrame", () => {
  it("renders every enforced state in both locales", () => {
    const states = ["default", "loading", "error", "empty", "incomplete"] as const;
    for (const state of states) {
      for (const locale of ["en", "ar"] as const) {
        const html = renderToStaticMarkup(
          <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
            <BrandFrame
              state={state}
              profile={state === "empty" ? null : profile()}
              previewLocale="en"
              regionName="Mint"
              missingRegionName="Name missing"
              markers={markers}
              unresolvedMessage="Could not resolve"
              requestIdentifier="req-14"
              emptyMessage="No current profile"
            >
              Preview
            </BrandFrame>
          </div>,
        );
        expect(html).toContain(`data-state="${state}"`);
        expect(html).toContain(`lang="${locale}"`);
        expect(html).toContain('role="region"');
      }
    }
  });

  it("takes the previewed locale direction when the interface differs", () => {
    const html = renderToStaticMarkup(
      <div lang="en" dir="ltr">
        <BrandFrame profile={profile()} previewLocale="ar" regionName="Mint" missingRegionName="Name missing" markers={markers}>
          Preview
        </BrandFrame>
      </div>,
    );
    expect(html).toContain('lang="en"');
    expect(html).toContain('dir="ltr"');
    expect(html).toContain('lang="ar"');
    expect(html).toContain('dir="rtl"');
  });

  it("names a missing role, locale string and typeface and does not substitute", () => {
    const html = renderToStaticMarkup(
      <BrandFrame
        profile={profile({
          colors: { background: hex("ffffff") },
          typefaces: { "body-latin": face },
          strings: [{ field: "brand", locale: "ar", value: null }],
        })}
        previewLocale="en"
        regionName={null}
        missingRegionName="Name missing"
        markers={markers}
      >
        Preview
      </BrandFrame>,
    );
    expect(html).toContain("Name missing");
    expect(html).toContain("primary");
    expect(html).toContain("brand/ar");
    expect(html).toContain("heading-latin");
    expect(html).not.toContain("Mint ar");
    expect(html).toContain('data-state="incomplete"');
  });

  it("offers both variants", () => {
    for (const variant of ["preview", "editor_preview"] as const) {
      const html = renderToStaticMarkup(
        <BrandFrame variant={variant} profile={profile()} previewLocale="en" regionName="Mint" missingRegionName="Name missing" markers={markers} />,
      );
      expect(html).toContain(`data-variant="${variant}"`);
      expect(html).toContain('data-density="comfortable"');
    }
  });
});
