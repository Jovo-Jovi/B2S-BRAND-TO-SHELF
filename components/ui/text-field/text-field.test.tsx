// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { act } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { mount, setInputValue } from "../mount";
import { IDENTIFIER_DIGIT_ERROR, normaliseNumberInput } from "./digits";
import { TextField } from "./text-field";

describe("TextField", () => {
  it("renders every enforced state in both locales", () => {
    const states = ["default", "hover", "focus", "disabled", "loading", "error", "empty"] as const;
    for (const state of states) {
      for (const locale of ["en", "ar"] as const) {
        const html = renderToStaticMarkup(
          <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
            <TextField state={state} value={state === "empty" ? "" : "Mint"} placeholder="Mint" />
          </div>,
        );
        expect(html).toContain(`data-state="${state}"`);
        expect(html).toContain(`lang="${locale}"`);
        expect(html).toContain("<input");
      }
    }
  });

  it("offers the declared variants and sizes", () => {
    for (const variant of ["text", "email", "number", "identifier", "multiline"] as const) {
      const html = renderToStaticMarkup(<TextField variant={variant} value="" />);
      expect(html).toContain(`data-variant="${variant}"`);
    }
    const multiline = renderToStaticMarkup(<TextField variant="multiline" value="" />);
    expect(multiline).toContain("<textarea");
    for (const size of ["compact", "comfortable"] as const) {
      const html = renderToStaticMarkup(<TextField size={size} value="" />);
      expect(html).toContain(`data-density="${size}"`);
    }
  });

  it("normalises number input and refuses an Arabic-Indic digit in an identifier", () => {
    expect(normaliseNumberInput("\u0661\u0662\u0663\u066b\u0664")).toBe("123.4");
    expect(normaliseNumberInput("1,5")).toBe("15");
    expect(normaliseNumberInput("1.234,56")).toBe("1.23456");
    expect(normaliseNumberInput("1,234.56")).toBe("1234.56");
    expect(normaliseNumberInput("1\u066c234.56")).toBe("1234.56");
    expect(normaliseNumberInput("\u06f1\u06f2")).toBe("12");
    expect(normaliseNumberInput("\u06f1\u066b\u06f5")).toBe("1.5");

    const email = renderToStaticMarkup(<TextField variant="email" value="a@b.c" />);
    expect(email).toContain('dir="ltr"');
    const identifier = renderToStaticMarkup(<TextField variant="identifier" value="SKU-1" />);
    expect(identifier).toContain('dir="ltr"');
    expect(identifier.toLowerCase()).toContain('spellcheck="false"');
    const number = renderToStaticMarkup(<TextField variant="number" value="1" />);
    expect(number.toLowerCase()).toContain('inputmode="decimal"');
    expect(number).toContain('type="text"');
  });

  it("keeps an identifier raw when an Arabic-Indic digit is typed and clears on Escape", async () => {
    const view = await mount(
      <TextField variant="identifier" defaultValue="" digitError="Use the digits 0 to 9" clearAccessibleName="Clear" />,
    );
    const input = view.host.querySelector("input");
    expect(input).not.toBeNull();
    await act(async () => {
      setInputValue(input as HTMLInputElement, "\u0661");
    });
    expect((view.host.querySelector("input") as HTMLInputElement).value).toBe("\u0661");
    expect(view.host.querySelector("[data-error-code]")?.getAttribute("data-error-code")).toBe(IDENTIFIER_DIGIT_ERROR);
    await act(async () => {
      setInputValue(view.host.querySelector("input") as HTMLInputElement, "\u06f1");
    });
    expect((view.host.querySelector("input") as HTMLInputElement).value).toBe("\u06f1");
    expect(view.host.textContent).toContain("Use the digits 0 to 9");
    const current = view.host.querySelector("input") as HTMLInputElement;
    await act(async () => {
      current.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    expect((view.host.querySelector("input") as HTMLInputElement).value).toBe("");
    await view.unmount();
  });

  it("caps a multiline field with the stated row tokens", () => {
    const css = readFileSync("components/ui/text-field/text-field.module.css", "utf8");
    expect(css).toContain("var(--b2s-multiline-rows-min)");
    expect(css).toContain("var(--b2s-multiline-rows-max)");
  });
});
