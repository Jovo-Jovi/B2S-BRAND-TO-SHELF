// @vitest-environment jsdom
import { act } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { mount } from "../mount";
import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  it("renders every enforced state in both locales", () => {
    const states = ["default", "hover", "focus", "active", "disabled", "error", "checked"] as const;
    for (const state of states) {
      for (const locale of ["en", "ar"] as const) {
        const html = renderToStaticMarkup(
          <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
            <Checkbox caption="Archive" state={state} checked={state === "checked"} invalid={state === "error"} />
          </div>,
        );
        expect(html).toContain(`data-state="${state}"`);
        expect(html).toContain(`lang="${locale}"`);
        expect(html).toContain('type="checkbox"');
        expect(html).toContain("Archive");
        expect(html).toContain("<label");
      }
    }
  });

  it("toggles through the native checkbox and sets indeterminate", async () => {
    let checked = false;
    const view = await mount(
      <Checkbox
        caption="Archive"
        variant="indeterminate"
        checked={false}
        onCheckedChange={(next) => {
          checked = next;
        }}
      />,
    );
    const input = view.host.querySelector("input") as HTMLInputElement;
    expect(input.indeterminate).toBe(true);
    expect(input.type).toBe("checkbox");
    await act(async () => {
      input.click();
    });
    expect(checked).toBe(true);
    await view.unmount();
  });

  it("offers the declared variants and sizes", () => {
    for (const variant of ["standard", "indeterminate"] as const) {
      const html = renderToStaticMarkup(<Checkbox caption="Archive" variant={variant} />);
      expect(html).toContain(`data-variant="${variant}"`);
    }
    for (const size of ["compact", "comfortable"] as const) {
      const html = renderToStaticMarkup(<Checkbox caption="Archive" size={size} />);
      expect(html).toContain(`data-density="${size}"`);
    }
  });
});
