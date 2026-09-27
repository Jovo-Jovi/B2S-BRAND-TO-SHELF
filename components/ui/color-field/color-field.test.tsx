// @vitest-environment jsdom
import { act } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { mount, setInputValue } from "../mount";
import { ColorField } from "./color-field";

function hex(digits: string): string {
  return `#${digits}`;
}

const stored = hex("1a1a1a");
const paired = hex("ffffff");

describe("ColorField", () => {
  it("renders every enforced state in both locales", () => {
    const states = ["default", "hover", "focus", "active", "disabled", "error", "empty"] as const;
    for (const state of states) {
      for (const locale of ["en", "ar"] as const) {
        const html = renderToStaticMarkup(
          <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
            <ColorField
              state={state}
              value={state === "empty" ? "" : stored}
              emptyName="No colour"
              pickerName="Pick"
              locale={locale}
              variant="paired"
              pairedWith={paired}
              passText="Pass"
              failText="Fail"
            />
          </div>,
        );
        expect(html).toContain(`data-state="${state}"`);
        expect(html).toContain(`lang="${locale}"`);
        expect(html).toContain('dir="ltr"');
        if (state === "empty") {
          expect(html).toContain("No colour");
        }
      }
    }
  });

  it("normalises to lowercase with a leading hash and refuses anything else", async () => {
    let committed = "";
    const view = await mount(<ColorField value="" emptyName="No colour" onValueChange={(next) => { committed = next; }} />);
    const input = view.host.querySelector("input");
    if (!(input instanceof HTMLInputElement)) {
      throw new Error("hex input missing");
    }
    await act(async () => {
      setInputValue(input, "AABBCC");
    });
    expect(committed).toBe(hex("aabbcc"));
    await act(async () => {
      setInputValue(input, "abc");
    });
    expect(view.host.querySelector("[data-state]")?.getAttribute("data-state")).toBe("error");
    expect(committed).toBe(hex("aabbcc"));
    await view.unmount();
  });

  it("shows the paired ratio as text in both locales", () => {
    for (const locale of ["en", "ar"] as const) {
      const html = renderToStaticMarkup(
        <ColorField
          variant="paired"
          value={stored}
          pairedWith={paired}
          locale={locale}
          emptyName="No colour"
          passText="Pass"
          failText="Fail"
        />,
      );
      expect(html).toContain("Pass");
      expect(html).toContain("17.40");
    }
  });

  it("offers both sizes and both variants", () => {
    for (const size of ["compact", "comfortable"] as const) {
      const html = renderToStaticMarkup(<ColorField size={size} value={stored} emptyName="No colour" />);
      expect(html).toContain(`data-density="${size}"`);
    }
    for (const variant of ["standard", "paired"] as const) {
      const html = renderToStaticMarkup(
        <ColorField variant={variant} value={stored} pairedWith={paired} emptyName="No colour" passText="Pass" failText="Fail" />,
      );
      expect(html).toContain(`data-variant="${variant}"`);
    }
  });
});
