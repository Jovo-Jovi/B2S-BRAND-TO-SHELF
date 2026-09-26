// @vitest-environment jsdom
import { act } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { mount } from "../mount";
import { Tooltip } from "./tooltip";

describe("Tooltip", () => {
  it("renders every enforced state in both locales", () => {
    const states = ["default", "hover", "focus"] as const;
    for (const state of states) {
      for (const locale of ["en", "ar"] as const) {
        const html = renderToStaticMarkup(
          <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
            <Tooltip text="Full trading name" state={state}>
              <button type="button">Name</button>
            </Tooltip>
          </div>,
        );
        expect(html).toContain(`data-state="${state}"`);
        expect(html).toContain(`lang="${locale}"`);
        expect(html).toContain("Name");
        if (state === "default") {
          expect(html).not.toContain('role="tooltip"');
        } else {
          expect(html).toContain('role="tooltip"');
          expect(html).toContain("Full trading name");
        }
      }
    }
  });

  it("does not attach to a disabled trigger", () => {
    const html = renderToStaticMarkup(
      <Tooltip text="Full trading name">
        <button type="button" disabled>
          Name
        </button>
      </Tooltip>,
    );
    expect(html).not.toContain('role="tooltip"');
    expect(html).not.toContain("data-variant");
    expect(html).toContain("Name");
  });

  it("shows on focus immediately and on hover after the delay", async () => {
    document.documentElement.style.setProperty("--b2s-delay-tooltip", "500ms");
    vi.useFakeTimers();
    const view = await mount(
      <Tooltip text="Full trading name">
        <button type="button">Name</button>
      </Tooltip>,
    );
    const button = view.host.querySelector("button");
    await act(async () => {
      button?.focus();
    });
    expect(view.host.querySelector("[role=tooltip]")).not.toBeNull();
    await view.unmount();

    const hovered = await mount(
      <Tooltip text="Full trading name">
        <button type="button">Name</button>
      </Tooltip>,
    );
    const trigger = hovered.host.querySelector("button");
    await act(async () => {
      trigger?.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    });
    expect(hovered.host.querySelector("[role=tooltip]")).toBeNull();
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(hovered.host.querySelector("[role=tooltip]")).not.toBeNull();
    trigger?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await act(async () => {
      await Promise.resolve();
    });
    expect(hovered.host.querySelector("[role=tooltip]")).toBeNull();
    await hovered.unmount();
    vi.useRealTimers();
  });
});
