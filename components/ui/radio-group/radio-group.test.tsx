// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { useState } from "react";
import { act } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { mount } from "../mount";
import { RadioGroup } from "./radio-group";

const options = [
  { value: "a", caption: "A" },
  { value: "b", caption: "B" },
  { value: "c", caption: "C" },
];

describe("RadioGroup", () => {
  it("renders every enforced state in both locales", () => {
    const states = ["default", "hover", "focus", "active", "disabled", "error", "checked"] as const;
    for (const state of states) {
      for (const locale of ["en", "ar"] as const) {
        const html = renderToStaticMarkup(
          <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
            <RadioGroup caption="Language" options={options} state={state} value={state === "checked" ? "a" : ""} invalid={state === "error"} />
          </div>,
        );
        expect(html).toContain(`data-state="${state}"`);
        expect(html).toContain(`lang="${locale}"`);
        expect(html).toContain("<legend");
        expect(html).toContain('type="radio"');
      }
    }
  });

  it("moves selection with the arrow keys in visual direction", async () => {
    function Harness({ dir }: { dir: "ltr" | "rtl" }) {
      const [value, setValue] = useState("b");
      return (
        <div dir={dir}>
          <RadioGroup caption="Language" options={options} value={value} onValueChange={setValue} />
        </div>
      );
    }
    const view = await mount(<Harness dir="ltr" />);
    const current = view.host.querySelector("input:checked") as HTMLInputElement;
    await act(async () => {
      current.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    });
    expect((view.host.querySelector("input:checked") as HTMLInputElement).value).toBe("c");
    await view.unmount();

    const arabic = await mount(<Harness dir="rtl" />);
    const start = arabic.host.querySelector("input:checked") as HTMLInputElement;
    await act(async () => {
      start.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    });
    expect((arabic.host.querySelector("input:checked") as HTMLInputElement).value).toBe("a");
    await arabic.unmount();
  });

  it("offers the declared variants and sizes", () => {
    for (const variant of ["vertical", "horizontal"] as const) {
      const html = renderToStaticMarkup(<RadioGroup caption="Language" options={options} variant={variant} value="" />);
      expect(html).toContain(`data-variant="${variant}"`);
    }
    for (const size of ["compact", "comfortable"] as const) {
      const html = renderToStaticMarkup(<RadioGroup caption="Language" options={options} size={size} value="" />);
      expect(html).toContain(`data-density="${size}"`);
    }
  });

  it("draws the inner dot from the stated size", () => {
    const css = readFileSync("components/ui/radio-group/radio-group.module.css", "utf8");
    expect(css).toContain("inline-size: var(--b2s-radio-dot-size)");
    expect(css).toContain("border-radius: var(--b2s-radius-full)");
    expect(css).not.toContain("50%");
  });
});
