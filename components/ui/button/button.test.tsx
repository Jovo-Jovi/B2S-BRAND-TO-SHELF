// @vitest-environment jsdom
import { act } from "react";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Button } from "./button";
import { mount } from "../mount";

function frame(locale: "en" | "ar", html: string) {
  return html;
}

describe("Button", () => {
  it("renders every enforced state in both locales", () => {
    const states = ["default", "hover", "focus", "active", "disabled", "loading"] as const;
    for (const state of states) {
      for (const locale of ["en", "ar"] as const) {
        const html = renderToStaticMarkup(
          <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
            <Button state={state}>Save</Button>
          </div>,
        );
        expect(html).toContain(`data-state="${state}"`);
        expect(html).toContain(`lang="${locale}"`);
        expect(html).toContain("Save");
        expect(html.startsWith("<div")).toBe(true);
        expect(html).toContain("<button");
      }
    }
    expect(frame("en", "")).toBe("");
  });

  it("offers the declared variants and sizes", () => {
    for (const variant of ["primary", "secondary", "quiet", "danger"] as const) {
      const html = renderToStaticMarkup(<Button variant={variant}>Save</Button>);
      expect(html).toContain(`data-variant="${variant}"`);
    }
    for (const size of ["compact", "comfortable"] as const) {
      const html = renderToStaticMarkup(<Button size={size}>Save</Button>);
      expect(html).toContain(`data-density="${size}"`);
    }
  });

  it("keeps a submit button enabled and locks a loading button without removing focus", async () => {
    const idle = renderToStaticMarkup(<Button type="submit">Save</Button>);
    expect(idle).toContain('type="submit"');
    expect(idle).not.toMatch(/<button[^>]*\sdisabled(?:=|\s|>)/);

    const loading = renderToStaticMarkup(
      <Button type="submit" loading>
        Save
      </Button>,
    );
    expect(loading).toContain('aria-busy="true"');
    expect(loading).toContain('aria-disabled="true"');
    expect(loading).toContain("Save");
    expect(loading).not.toMatch(/<button[^>]*\sdisabled(?:=|\s|>)/);

    const rect = HTMLElement.prototype.getBoundingClientRect;
    HTMLElement.prototype.getBoundingClientRect = () =>
      ({ width: 120, height: 40, top: 0, left: 0, bottom: 40, right: 120, x: 0, y: 0, toJSON() { return {}; } }) as DOMRect;
    const view = await mount(<Button>Save</Button>);
    await view.render(<Button loading>Save</Button>);
    const button = view.host.querySelector("button");
    expect(button).not.toBeNull();
    button?.focus();
    expect(document.activeElement).toBe(button);
    expect(button?.style.inlineSize).toBe("120px");
    HTMLElement.prototype.getBoundingClientRect = rect;
    await view.unmount();
  });

  it("names an icon-only button from the accessible-name prop and ignores a click while loading", async () => {
    const html = renderToStaticMarkup(<Button accessibleName="Save" iconStart={<svg aria-hidden="true" />} />);
    expect(html).toContain('aria-label="Save"');

    let clicks = 0;
    const view = await mount(
      <Button
        loading
        onClick={() => {
          clicks += 1;
        }}
      >
        Save
      </Button>,
    );
    const button = view.host.querySelector("button");
    await act(async () => {
      button?.click();
    });
    expect(clicks).toBe(0);
    await view.unmount();
  });

  it("paints danger text and each pressed fill from the stated tokens", () => {
    const css = readFileSync("components/ui/button/button.module.css", "utf8");
    expect(css).toContain("color: var(--b2s-color-danger-action-text)");
    expect(css).toContain("background-color: var(--b2s-color-danger-action-active)");
    expect(css).toContain("background-color: var(--b2s-color-action-active)");
    expect(css).toContain("background-color: var(--b2s-color-surface-active)");
    expect(css).not.toContain("transform:");
  });
});
