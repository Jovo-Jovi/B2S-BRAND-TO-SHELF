// @vitest-environment jsdom
import { useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { mount } from "../mount";
import { BilingualField, type BilingualLocale } from "./bilingual-field";

const names = { en: "English", ar: "Arabic" };
const missing = { en: "English is missing", ar: "Arabic is missing" };

describe("BilingualField", () => {
  it("renders every enforced state in both locales", () => {
    const states = ["default", "hover", "focus", "disabled", "error", "empty", "complete"] as const;
    for (const state of states) {
      for (const locale of ["en", "ar"] as const) {
        const html = renderToStaticMarkup(
          <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
            <BilingualField
              caption="Trading name"
              defaultLocale={locale}
              state={state}
              values={{ en: state === "complete" ? "Mint" : "", ar: state === "complete" ? "Mint" : "" }}
              localeName={names}
              missingText={missing}
              completeText="Both locales are filled"
              error={state === "error" ? "Arabic is missing" : undefined}
              errorLocale="ar"
            />
          </div>,
        );
        expect(html).toContain(`data-state="${state}"`);
        expect(html).toContain(`lang="${locale}"`);
        expect(html).toContain("<legend");
        expect(html).toContain("Trading name");
      }
    }
  });

  it("orders by the tenant default locale and cannot be complete while incomplete", () => {
    const arabicFirst = renderToStaticMarkup(
      <BilingualField
        caption="Trading name"
        defaultLocale="ar"
        values={{ en: "", ar: "" }}
        localeName={names}
        missingText={missing}
        completeText="Both locales are filled"
      />,
    );
    expect(arabicFirst.indexOf('data-locale="ar"')).toBeLessThan(arabicFirst.indexOf('data-locale="en"'));
    expect(arabicFirst).toContain('dir="rtl"');
    expect(arabicFirst).toContain('dir="ltr"');
    expect(arabicFirst).toContain('data-complete="false"');
    expect(arabicFirst).toContain('data-state="empty"');
    expect(arabicFirst).toContain("English is missing");
    expect(arabicFirst).toContain("Arabic is missing");

    const filled = renderToStaticMarkup(
      <BilingualField
        caption="Trading name"
        defaultLocale="en"
        values={{ en: "Mint", ar: "Mint" }}
        localeName={names}
        missingText={missing}
        completeText="Both locales are filled"
      />,
    );
    expect(filled).toContain('data-complete="true"');
    expect(filled).toContain('data-state="complete"');
    expect(filled).toContain("Both locales are filled");
    expect(filled.indexOf('data-locale="en"')).toBeLessThan(filled.indexOf('data-locale="ar"'));
  });

  it("reports a partial value while one locale is still empty", async () => {
    const seen: Array<{ en: string; ar: string }> = [];
    function Harness() {
      const [values, setValues] = useState<{ en: string; ar: string }>({ en: "Mint", ar: "" });
      return (
        <BilingualField
          caption="Trading name"
          defaultLocale="en"
          values={values}
          localeName={names}
          missingText={missing}
          completeText="Both locales are filled"
          onValuesChange={(next) => {
            seen.push(next);
            setValues(next);
          }}
        />
      );
    }
    const view = await mount(<Harness />);
    expect(view.host.querySelector("[data-complete]")?.getAttribute("data-complete")).toBe("false");
    const input = view.host.querySelector("[data-locale='en'] input") as HTMLInputElement;
    const prototype = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    await (async () => {
      const { act } = await import("react");
      await act(async () => {
        prototype?.call(input, "Mint tea");
        input.dispatchEvent(new Event("input", { bubbles: true }));
      });
    })();
    expect(seen.at(-1)).toEqual({ en: "Mint tea", ar: "" });
    expect(view.host.querySelector("[data-complete]")?.getAttribute("data-complete")).toBe("false");
    await view.unmount();
  });

  it("offers the declared variants and sizes", () => {
    for (const variant of ["single", "multiline"] as const) {
      const html = renderToStaticMarkup(
        <BilingualField
          caption="Trading name"
          variant={variant}
          defaultLocale="en"
          values={{ en: "", ar: "" }}
          localeName={names}
          missingText={missing}
          completeText="Both locales are filled"
        />,
      );
      expect(html).toContain(`data-variant="${variant}"`);
    }
    for (const size of ["compact", "comfortable"] as const) {
      const html = renderToStaticMarkup(
        <BilingualField
          caption="Trading name"
          size={size}
          defaultLocale="en"
          values={{ en: "", ar: "" }}
          localeName={names}
          missingText={missing}
          completeText="Both locales are filled"
        />,
      );
      expect(html).toContain(`data-density="${size}"`);
    }
    const unused: BilingualLocale = "en";
    expect(unused).toBe("en");
  });
});
