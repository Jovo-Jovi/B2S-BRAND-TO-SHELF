// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Glyph } from "../glyphs";
import { StatusBadge } from "./status-badge";

describe("StatusBadge", () => {
  it("renders every enforced state in both locales", () => {
    const states = ["default", "error"] as const;
    for (const state of states) {
      for (const locale of ["en", "ar"] as const) {
        const html = renderToStaticMarkup(
          <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
            <StatusBadge variant="success" state={state} text="Ready" icon={<Glyph name="check" />} />
          </div>,
        );
        expect(html).toContain(`data-state="${state}"`);
        expect(html).toContain(`lang="${locale}"`);
        expect(html).toContain("Ready");
        if (state === "error") {
          expect(html).toContain('data-tone="danger"');
        }
      }
    }
  });

  it("offers every declared variant", () => {
    for (const variant of ["neutral", "success", "warning", "danger", "info"] as const) {
      const html = renderToStaticMarkup(<StatusBadge variant={variant} text="Ready" />);
      expect(html).toContain(`data-variant="${variant}"`);
      expect(html).toContain('data-density="compact"');
    }
  });
});
