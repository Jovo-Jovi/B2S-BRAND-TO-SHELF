// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { act } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { mount } from "../mount";
import { Select } from "./select";

const options = [
  { value: "mint", caption: "Mint" },
  { value: "rose", caption: "Rose" },
];

describe("Select", () => {
  it("renders every enforced state in both locales", () => {
    const states = ["default", "hover", "focus", "active", "disabled", "loading", "error", "empty", "selected"] as const;
    for (const state of states) {
      for (const locale of ["en", "ar"] as const) {
        const html = renderToStaticMarkup(
          <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
            <Select
              state={state}
              variant={state === "empty" || state === "active" || state === "selected" ? "searchable" : "native"}
              options={options}
              value={state === "selected" ? "mint" : ""}
              noResults="No matches"
            />
          </div>,
        );
        expect(html).toContain(`data-state="${state}"`);
        expect(html).toContain(`lang="${locale}"`);
      }
    }
  });

  it("uses a native select, and a searchable listbox that filters, selects and closes", async () => {
    const native = renderToStaticMarkup(<Select options={options} value="mint" noResults="No matches" />);
    expect(native).toContain("<select");
    expect(native).toContain("Mint");

    const empty = renderToStaticMarkup(
      <Select variant="searchable" state="empty" options={options} value="" noResults="No matches" />,
    );
    expect(empty).toContain("No matches");
    expect(empty).toContain('role="listbox"');

    const selected = renderToStaticMarkup(
      <Select variant="searchable" state="selected" options={options} value="mint" noResults="No matches" />,
    );
    expect(selected).toContain('aria-selected="true"');

    const loading = renderToStaticMarkup(<Select options={options} value="" loading noResults="No matches" />);
    expect(loading).toContain('aria-busy="true"');
    expect(loading).not.toMatch(/<select[^>]*\sdisabled(?:=|\s|>)/);

    let chosen = "";
    const view = await mount(
      <Select
        variant="searchable"
        options={options}
        value=""
        noResults="No matches"
        onValueChange={(value) => {
          chosen = value;
        }}
      />,
    );
    const input = view.host.querySelector("input") as HTMLInputElement;
    await act(async () => {
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    });
    expect(view.host.querySelector("[role='listbox']")).not.toBeNull();
    const prototype = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    await act(async () => {
      prototype?.call(input, "Ro");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(view.host.textContent).toContain("Rose");
    expect(view.host.textContent).not.toContain("Mint");
    await act(async () => {
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });
    expect(chosen).toBe("rose");
    await view.unmount();
  });

  it("offers the declared variants and sizes", () => {
    for (const variant of ["native", "searchable"] as const) {
      const html = renderToStaticMarkup(<Select variant={variant} options={options} value="" noResults="No matches" />);
      expect(html).toContain(`data-variant="${variant}"`);
    }
    for (const size of ["compact", "comfortable"] as const) {
      const html = renderToStaticMarkup(<Select size={size} options={options} value="" noResults="No matches" />);
      expect(html).toContain(`data-density="${size}"`);
    }
  });

  it("raises the listbox on the stated layer", () => {
    const css = readFileSync("components/ui/select/select.module.css", "utf8");
    expect(css).toContain("z-index: var(--b2s-layer-dropdown)");
  });
});
