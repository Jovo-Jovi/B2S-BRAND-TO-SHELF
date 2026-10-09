// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DISABLED_RULES } from "../../../scripts/component-a11y-exclusions.mjs";
import { mount } from "../../ui/mount";
import { EntryFrame } from "./entry-frame";

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core/axe.js"), "utf8");

type AxeResult = {
  violations: Array<{ id: string }>;
  incomplete: Array<{ id: string }>;
};

function boot() {
  const target = window as unknown as {
    eval: (source: string) => void;
    axe?: { run: (node: Element, options?: unknown) => Promise<AxeResult> };
  };
  if (!target.axe) {
    target.eval(axeSource);
  }
  return target.axe;
}

describe("EntryFrame", () => {
  it("names itself, carries the wordmark and the other language, and draws no image", () => {
    const html = renderToStaticMarkup(
      <EntryFrame wordmark={<p>B2S</p>} localeHref="/ar/sign-in" localeCaption="Arabic">
        <p>Sign in</p>
      </EntryFrame>,
    );
    expect(html).toContain('data-composition="EntryFrame"');
    expect(html).toContain("B2S");
    expect(html).toContain('href="/ar/sign-in"');
    expect(html).toContain("Arabic");
    expect(html).not.toContain("<img");
    expect(html).not.toContain("<main");
    const source = readFileSync("components/shared/entry-frame/entry-frame.tsx", "utf8");
    expect(source).not.toContain("<h1");
    expect(source).not.toContain("<main");
  });

  it("has no axe violation in either locale", async () => {
    const axe = boot();
    if (!axe) {
      throw new Error("axe-core did not attach to the window");
    }
    for (const locale of ["en", "ar"] as const) {
      const view = await mount(
        <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
          <EntryFrame
            wordmark={<p>B2S</p>}
            localeHref={locale === "en" ? "/ar/sign-in" : "/en/sign-in"}
            localeCaption={locale === "en" ? "Arabic" : "English"}
          >
            <p>Form</p>
          </EntryFrame>
        </div>,
      );
      const result = await axe.run(view.host, { rules: DISABLED_RULES });
      expect(result.violations.map((item) => item.id)).toEqual([]);
      expect(result.incomplete.map((item) => item.id)).toEqual([]);
      await view.unmount();
    }
  });
});
