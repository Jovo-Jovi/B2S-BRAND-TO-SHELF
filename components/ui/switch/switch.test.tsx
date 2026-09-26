// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { useState } from "react";
import { act } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { mount } from "../mount";
import { Switch } from "./switch";

describe("Switch", () => {
  it("renders every enforced state in both locales", () => {
    const states = ["default", "hover", "focus", "active", "disabled", "loading", "error", "checked"] as const;
    for (const state of states) {
      for (const locale of ["en", "ar"] as const) {
        const html = renderToStaticMarkup(
          <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
            <Switch
              caption="Notifications"
              onText="On"
              offText="Off"
              state={state}
              checked={state === "checked"}
              loading={state === "loading"}
              error={state === "error"}
            />
          </div>,
        );
        expect(html).toContain(`data-state="${state}"`);
        expect(html).toContain(`lang="${locale}"`);
        expect(html).toContain('role="switch"');
        expect(html).toContain(state === "checked" ? "On" : "Off");
      }
    }
  });

  it("toggles from a click and returns to the previous position on error", async () => {
    function Harness() {
      const [checked, setChecked] = useState(false);
      const [error, setError] = useState(false);
      return (
        <div>
          <Switch caption="Notifications" onText="On" offText="Off" checked={checked} error={error} onCheckedChange={setChecked} />
          <button type="button" onClick={() => setError(true)}>
            Fail
          </button>
        </div>
      );
    }
    const view = await mount(<Harness />);
    const control = view.host.querySelector("[role='switch']") as HTMLButtonElement;
    expect(control.getAttribute("aria-checked")).toBe("false");
    expect(control.tagName).toBe("BUTTON");
    await act(async () => {
      control.click();
    });
    expect(view.host.querySelector("[role='switch']")?.getAttribute("aria-checked")).toBe("true");
    expect(view.host.textContent).toContain("On");
    await act(async () => {
      view.host.querySelectorAll("button")[1]?.click();
    });
    expect(view.host.querySelector("[role='switch']")?.getAttribute("aria-checked")).toBe("false");
    expect(view.host.textContent).toContain("Off");
    await view.unmount();
  });

  it("offers the declared variant and sizes and stays focusable while loading", () => {
    const html = renderToStaticMarkup(
      <Switch caption="Notifications" onText="On" offText="Off" variant="standard" size="compact" loading />,
    );
    expect(html).toContain('data-variant="standard"');
    expect(html).toContain('data-density="compact"');
    expect(html).toContain('aria-busy="true"');
    expect(html).not.toMatch(/<button[^>]*\sdisabled(?:=|\s|>)/);
    const comfortable = renderToStaticMarkup(
      <Switch caption="Notifications" onText="On" offText="Off" size="comfortable" />,
    );
    expect(comfortable).toContain('data-density="comfortable"');
  });

  it("sizes the track and thumb from the stated tokens", () => {
    const css = readFileSync("components/ui/switch/switch.module.css", "utf8");
    expect(css).toContain("block-size: var(--b2s-switch-block-size)");
    expect(css).toContain("inline-size: var(--b2s-switch-inline-size)");
    expect(css).toContain("block-size: var(--b2s-switch-thumb-size)");
    expect(css).toContain("var(--b2s-switch-inset)");
  });
});
