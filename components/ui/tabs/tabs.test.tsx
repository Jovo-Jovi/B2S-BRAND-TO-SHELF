// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { mount } from "../mount";
import { Tabs } from "./tabs";

const tabs = [
  { id: "identity", caption: "Identity", panel: "Legal name" },
  { id: "trading", caption: "Trading", panel: "Trading name", disabled: false },
];

describe("Tabs", () => {
  it("renders every enforced state in both locales", () => {
    const states = ["default", "hover", "focus", "disabled", "loading", "error", "empty", "selected"] as const;
    for (const state of states) {
      for (const locale of ["en", "ar"] as const) {
        const html = renderToStaticMarkup(
          <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
            <Tabs
              state={state}
              selectedId="identity"
              tabs={tabs.map((tab) => ({ ...tab, disabled: state === "disabled" && tab.id === "trading" }))}
            />
          </div>,
        );
        expect(html).toContain(`data-state="${state}"`);
        expect(html).toContain(`lang="${locale}"`);
        expect(html).toContain('role="tablist"');
        expect(html).toContain("Identity");
      }
    }
  });

  it("offers the declared variant and sizes, and activates manually", async () => {
    const html = renderToStaticMarkup(
      <Tabs variant="standard" size="compact" selectedId="identity" tabs={tabs} />,
    );
    expect(html).toContain('data-variant="standard"');
    expect(html).toContain('data-density="compact"');

    let selected = "identity";
    const view = await mount(
      <div dir="rtl">
        <Tabs
          selectedId={selected}
          onSelect={(id) => {
            selected = id;
          }}
          tabs={tabs}
        />
      </div>,
    );
    const list = view.host.querySelector("[role=tablist]");
    const buttons = [...view.host.querySelectorAll<HTMLButtonElement>("[role=tab]")];
    expect(buttons[0]?.getAttribute("aria-selected")).toBe("true");
    buttons[0]?.focus();
    list?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    expect(document.activeElement).toBe(buttons[1]);
    expect(buttons[1]?.getAttribute("aria-selected")).toBe("false");
    list?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(selected).toBe("trading");
    await view.unmount();
  });

  it("shows Skeleton while the selected panel is loading", () => {
    const html = renderToStaticMarkup(<Tabs state="loading" selectedId="identity" tabs={tabs} />);
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('data-state="loading"');
  });
});
