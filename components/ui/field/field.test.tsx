// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Field } from "./field";

describe("Field", () => {
  it("renders every enforced state in both locales", () => {
    const states = ["default", "hover", "focus", "active", "disabled", "loading", "error"] as const;
    for (const state of states) {
      for (const locale of ["en", "ar"] as const) {
        const html = renderToStaticMarkup(
          <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
            <Field caption="Trading name" state={state} error={state === "error" ? "Enter the trading name" : undefined}>
              <input />
            </Field>
          </div>,
        );
        expect(html).toContain(`data-state="${state}"`);
        expect(html).toContain(`lang="${locale}"`);
        expect(html).toContain("<label");
        expect(html).toContain("Trading name");
        expect(html).toContain("<input");
      }
    }
  });

  it("keeps the caption visible above the control and wires help and error", () => {
    const html = renderToStaticMarkup(
      <Field caption="Trading name" optional="Optional" help="Shown on the label" error="Enter the trading name" counter="12">
        <input />
      </Field>,
    );
    const labelAt = html.indexOf("<label");
    const inputAt = html.indexOf("<input");
    expect(labelAt).toBeGreaterThan(-1);
    expect(inputAt).toBeGreaterThan(labelAt);
    expect(html).toContain("Optional");
    expect(html).toContain("Shown on the label");
    expect(html).toContain('role="alert"');
    expect(html).toContain("Enter the trading name");
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain("aria-describedby=");
    expect(html).toContain("12");
    expect(html).not.toContain("placeholder=");
  });
});
