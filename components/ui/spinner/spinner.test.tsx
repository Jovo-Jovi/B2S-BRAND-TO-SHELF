// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Spinner } from "./spinner";

describe("Spinner", () => {
  it("renders every enforced state in both locales", () => {
    const states = ["default", "loading"] as const;
    for (const state of states) {
      for (const locale of ["en", "ar"] as const) {
        const html = renderToStaticMarkup(
          <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
            <Spinner state={state} />
          </div>,
        );
        expect(html).toContain(`data-state="${state}"`);
        expect(html).toContain(`lang="${locale}"`);
        expect(html).toContain('aria-hidden="true"');
        expect(html).toContain("<svg");
      }
    }
  });

  it("offers the declared variant and sizes", () => {
    const html = renderToStaticMarkup(<Spinner variant="standard" size="compact" />);
    expect(html).toContain('data-variant="standard"');
    expect(html).toContain('data-density="compact"');
    const comfortable = renderToStaticMarkup(<Spinner size="comfortable" />);
    expect(comfortable).toContain('data-density="comfortable"');
  });
});
