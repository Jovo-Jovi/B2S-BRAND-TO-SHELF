// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("renders every enforced state in both locales", () => {
    const states = ["default", "loading"] as const;
    for (const state of states) {
      for (const locale of ["en", "ar"] as const) {
        const html = renderToStaticMarkup(
          <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
            <Skeleton state={state} />
          </div>,
        );
        expect(html).toContain(`data-state="${state}"`);
        expect(html).toContain(`lang="${locale}"`);
        expect(html).toContain('aria-hidden="true"');
      }
    }
  });

  it("offers the declared variants and sizes", () => {
    for (const variant of ["text", "block", "table_rows"] as const) {
      const html = renderToStaticMarkup(<Skeleton variant={variant} state="default" />);
      expect(html).toContain(`data-variant="${variant}"`);
    }
    for (const size of ["compact", "comfortable"] as const) {
      const html = renderToStaticMarkup(<Skeleton size={size} state="default" />);
      expect(html).toContain(`data-density="${size}"`);
    }
  });

  it("pulses from the stated floor so a placeholder never vanishes", () => {
    const css = readFileSync("components/ui/skeleton/skeleton.module.css", "utf8");
    expect(css).toContain("opacity: var(--b2s-skeleton-opacity-min)");
    expect(css).not.toMatch(/opacity:\s*0/);
  });
});
