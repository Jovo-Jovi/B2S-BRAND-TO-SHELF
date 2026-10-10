// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { TextLink } from "./text-link";

describe("TextLink", () => {
  it("renders every enforced state in both locales", () => {
    const states = ["default", "hover", "focus", "active"] as const;
    for (const state of states) {
      for (const locale of ["en", "ar"] as const) {
        const html = renderToStaticMarkup(
          <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
            <TextLink href="/guide" state={state}>
              Guide
            </TextLink>
          </div>,
        );
        expect(html).toContain(`data-state="${state}"`);
        expect(html).toContain(`lang="${locale}"`);
        expect(html).toContain('href="/guide"');
        expect(html).toContain("<a");
        expect(html).toContain("Guide");
      }
    }
  });

  it("offers the declared variants and sizes and announces a new window", () => {
    for (const variant of ["inline", "standalone"] as const) {
      const html = renderToStaticMarkup(
        <TextLink href="/guide" variant={variant}>
          Guide
        </TextLink>,
      );
      expect(html).toContain(`data-variant="${variant}"`);
    }
    for (const size of ["compact", "comfortable"] as const) {
      const html = renderToStaticMarkup(
        <TextLink href="/guide" size={size}>
          Guide
        </TextLink>,
      );
      expect(html).toContain(`data-density="${size}"`);
    }
    const opened = renderToStaticMarkup(
      <TextLink href="/guide" newWindowName="New window" iconEnd={<svg aria-hidden="true" />}>
        Guide
      </TextLink>,
    );
    expect(opened).toContain('target="_blank"');
    expect(opened).toContain('rel="noopener"');
    expect(opened).toContain('aria-label="New window"');
  });
});
