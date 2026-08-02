import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import LocaleLayout from "../app/[locale]/layout";
import { locales, direction, type Locale } from "../app/[locale]/dictionaries";

describe("locale shell", () => {
  it.each(locales.map((locale) => [locale, direction[locale]] as const))(
    "renders the %s shell with dir=%s applied on the document element",
    async (locale: Locale, dir: "ltr" | "rtl") => {
      const element = await LocaleLayout({
        children: <p>smoke</p>,
        params: Promise.resolve({ locale }),
      });

      const html = renderToStaticMarkup(element);

      expect(html).toContain(`lang="${locale}"`);
      expect(html).toContain(`dir="${dir}"`);
    },
  );
});
