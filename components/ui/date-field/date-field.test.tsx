// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { act } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { addDays, parseCalendarDate, saturdayIndex } from "../../../lib/locale/calendar-date";
import { dateNames } from "../data-catalog";
import { mount, setInputValue } from "../mount";
import { DateField, type DateFieldCopy, type DateFieldVisual } from "./date-field";

function copy(locale: "en" | "ar"): DateFieldCopy {
  const names = dateNames(locale);
  return {
    months: names.months,
    weekdaysShort: names.weekdaysShort,
    weekdaysFull: names.weekdaysFull,
    monthHeading: names.monthHeading,
    placeholder: names.placeholder,
    previousMonth: "Previous month",
    nextMonth: "Next month",
    openCalendar: "Open calendar",
    invalid: "Use DD/MM/YYYY",
  };
}

function indic(value: string): string {
  return [...value]
    .map((char) => (char >= "0" && char <= "9" ? String.fromCodePoint(0x0660 + Number(char)) : char))
    .join("");
}

describe("DateField", () => {
  it("renders every enforced state in both locales", () => {
    const states = ["default", "hover", "focus", "active", "disabled", "error", "empty", "selected"] as const;
    for (const state of states) {
      for (const locale of ["en", "ar"] as const) {
        const html = renderToStaticMarkup(
          <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
            <DateField
              locale={locale}
              copy={copy(locale)}
              state={state as DateFieldVisual}
              viewYear={2026}
              viewMonth={9}
              accessibleName="Delivery date"
              value={state === "selected" ? "2026-09-01" : ""}
              disabled={state === "disabled"}
            />
          </div>,
        );
        expect(html).toContain(`data-state="${state}"`);
        expect(html).toContain(`lang="${locale}"`);
        expect(html).toContain("DD/MM/YYYY");
        if (state === "active" || state === "selected") {
          expect(html).toContain(dateNames(locale).weekdaysShort[0]);
          expect(html).toContain('role="grid"');
        }
      }
    }
    const css = readFileSync("components/ui/date-field/date-field.module.css", "utf8");
    expect(css).toContain("z-index: var(--b2s-layer-dropdown)");
    expect(css).toContain("box-shadow: var(--b2s-elevation-1)");
  });

  it("offers the declared variant and sizes", () => {
    const html = renderToStaticMarkup(
      <DateField locale="en" copy={copy("en")} viewYear={2026} viewMonth={9} accessibleName="Delivery date" />,
    );
    expect(html).toContain('data-variant="single"');
    for (const size of ["compact", "comfortable"] as const) {
      const sized = renderToStaticMarkup(
        <DateField locale="en" copy={copy("en")} size={size} viewYear={2026} viewMonth={9} accessibleName="Delivery date" />,
      );
      expect(sized).toContain(`data-density="${size}"`);
    }
  });

  it("starts the grid on Saturday and refuses an impossible date", async () => {
    const html = renderToStaticMarkup(
      <DateField locale="en" copy={copy("en")} state="active" viewYear={2026} viewMonth={9} accessibleName="Delivery date" />,
    );
    const headers = [...html.matchAll(/role="columnheader"[^>]*>([^<]*)</g)].map((match) => match[1]);
    expect(headers[0]).toBe(dateNames("en").weekdaysShort[0]);
    expect(headers).toEqual([...dateNames("en").weekdaysShort]);

    let committed: string | null | undefined;
    const view = await mount(
      <DateField
        locale="en"
        copy={copy("en")}
        viewYear={2026}
        viewMonth={9}
        accessibleName="Delivery date"
        onValueChange={(iso) => {
          committed = iso;
        }}
      />,
    );
    const input = view.host.querySelector("input");
    expect(input).not.toBeNull();
    input?.focus();
    await act(async () => {
      setInputValue(input as HTMLInputElement, "31/02/2026");
      input?.blur();
    });
    expect(input?.value).toBe("31/02/2026");
    expect(parseCalendarDate("31/02/2026")).toBeNull();
    expect(committed).toBeUndefined();
    expect(view.host.textContent).toContain("Use DD/MM/YYYY");
    await view.unmount();
  });

  it("normalises Arabic-Indic digits and moves by the mirroring direction", async () => {
    let committed: string | null | undefined;
    const view = await mount(
      <div dir="ltr">
        <DateField
          locale="en"
          copy={copy("en")}
          viewYear={2026}
          viewMonth={1}
          accessibleName="Delivery date"
          onValueChange={(iso) => {
            committed = iso;
          }}
        />
      </div>,
    );
    const input = view.host.querySelector("input") as HTMLInputElement;
    input.focus();
    await act(async () => {
      setInputValue(input, indic("12/01/2026"));
      input.blur();
    });
    expect(committed).toBe("2026-01-12");
    expect(input.value).toBe("12/01/2026");

    const opener = [...view.host.querySelectorAll("button")].find((button) => button.getAttribute("aria-label") === "Open calendar");
    await act(async () => {
      opener?.click();
    });
    await view.render(
      <div dir="ltr">
        <DateField
          locale="en"
          copy={copy("en")}
          state="active"
          viewYear={2026}
          viewMonth={1}
          value="2026-01-12"
          accessibleName="Delivery date"
        />
      </div>,
    );
    const focused = view.host.querySelector("button[aria-selected='true']") as HTMLButtonElement;
    const before = focused?.getAttribute("aria-label");
    await act(async () => {
      focused?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    });
    const next = addDays("2026-01-12", 1);
    expect(saturdayIndex("2026-01-12")).not.toBeNull();
    expect(before).toBe(dateNames("en").weekdaysFull[saturdayIndex("2026-01-12") ?? 0]);
    expect(next).toBe("2026-01-13");
    expect(view.host.querySelector("button[tabindex='0']")?.textContent).toBe("13");
    await view.unmount();
  });
});
