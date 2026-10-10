// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { act } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { formatCount } from "../../../lib/locale/format-number";
import { Button } from "../button/button";
import { mount } from "../mount";
import { DataTable, PAGE_SIZES, type DataTableVisual } from "./data-table";

const columns = [
  { key: "sku", caption: "SKU", kind: "identifier" as const },
  { key: "name", caption: "Name", kind: "prose" as const, sortable: true },
  { key: "shown", caption: "Shown", kind: "number" as const },
];

const rows = [
  { id: "row-1", cells: { sku: "SKU-10001", name: "Fruit bites carton", shown: "12.50" }, actions: <Button variant="quiet">Edit</Button> },
];

const rangePattern = "{from}:{to}:{total}";

function table(locale: "en" | "ar", state: DataTableVisual, extra?: Partial<Parameters<typeof DataTable>[0]>) {
  return (
    <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <DataTable
        locale={locale}
        variant="selectable"
        state={state}
        columns={columns}
        rows={state === "empty" || state === "loading" || state === "error" ? [] : rows}
        rangePattern={rangePattern}
        regionName="Lines"
        pageSizeCaption="Page size"
        listEmpty="None"
        previousPage="Previous page"
        nextPage="Next page"
        selectAllName="Select all"
        selectRowName="Select row"
        actionsCaption="Actions"
        empty={
          state === "empty"
            ? { kind: "first-use", content: "Create the first row" }
            : { kind: "no-results", content: "Nothing matches" }
        }
        failure={{
          message: "The list failed",
          requestIdentifier: "req-14",
          retry: "Retry",
          onRetry: () => undefined,
        }}
        selectedIds={state === "selected" ? ["row-1"] : []}
        bulkActions={<Button variant="quiet">Archive</Button>}
        {...extra}
      />
    </div>
  );
}

describe("DataTable", () => {
  it("renders every enforced state in both locales", () => {
    const states = ["default", "hover", "focus", "loading", "error", "empty", "selected"] as const;
    const probes = states.map((state) => (
      <DataTable
        key={state}
        locale="en"
        state={state}
        columns={columns}
        rows={rows}
        rangePattern={rangePattern}
        regionName="Lines"
        pageSizeCaption="Page size"
        listEmpty="None"
        previousPage="Previous page"
        nextPage="Next page"
      />
    ));
    expect(probes).toHaveLength(states.length);
    for (const state of states) {
      for (const locale of ["en", "ar"] as const) {
        const html = renderToStaticMarkup(table(locale, state));
        expect(html).toContain(`data-state="${state}"`);
        expect(html).toContain(`lang="${locale}"`);
        expect(html).toContain("<table");
        expect(html).toContain('scope="col"');
        if (state === "empty") {
          expect(html).toContain("Create the first row");
          expect(html).toContain('data-empty="first-use"');
        }
        if (state === "error") {
          expect(html).toContain("The list failed");
          expect(html).toContain("req-14");
          expect(html).toContain('dir="ltr"');
          expect(html).toContain("Retry");
        }
        if (state === "loading") {
          expect(html).toContain('aria-busy="true"');
          expect(html).toContain('aria-hidden="true"');
        }
        if (state === "default" || state === "selected") {
          expect(html).toContain("SKU-10001");
          expect(html).toContain("12.50");
          expect(html).toContain('dir="ltr"');
        }
        if (state === "selected") {
          expect(html).toContain(formatCount(1, locale));
          expect(html).toContain("Archive");
        }
      }
    }
    const css = readFileSync("components/ui/data-table/data-table.module.css", "utf8");
    expect(css).toContain("position: sticky");
    expect(css).toContain("overflow: auto");
    expect(css).toContain("white-space: nowrap");
    expect(css).toContain("text-align: end");
    const source = readFileSync("components/ui/data-table/data-table.tsx", "utf8");
    expect(source).not.toContain("localStorage");
    expect(source).not.toContain("sessionStorage");
  });

  it("offers both variants and sizes, and the page sizes 25, 50 and 100", () => {
    for (const variant of ["standard", "selectable"] as const) {
      const html = renderToStaticMarkup(
        <DataTable
          locale="en"
          variant={variant}
          columns={columns}
          rows={rows}
          rangePattern={rangePattern}
          regionName="Lines"
          pageSizeCaption="Page size"
          listEmpty="None"
          previousPage="Previous page"
          nextPage="Next page"
        />,
      );
      expect(html).toContain(`data-variant="${variant}"`);
    }
    for (const size of ["compact", "comfortable"] as const) {
      const html = renderToStaticMarkup(
        <DataTable
          locale="en"
          size={size}
          columns={columns}
          rows={rows}
          rangePattern={rangePattern}
          regionName="Lines"
          pageSizeCaption="Page size"
          listEmpty="None"
          previousPage="Previous page"
          nextPage="Next page"
        />,
      );
      expect(html).toContain(`data-density="${size}"`);
    }
    const html = renderToStaticMarkup(table("en", "default"));
    for (const size of PAGE_SIZES) {
      expect(html).toContain(`>${formatCount(size, "en")}<`);
    }
    expect(html).toContain('value="25"');
    expect(html).toContain("1:1:1");
  });

  it("keeps first use distinct from no results and cycles sort direction", async () => {
    const first = renderToStaticMarkup(table("en", "empty"));
    const none = renderToStaticMarkup(
      table("en", "empty", { empty: { kind: "no-results", content: "Nothing matches" } }),
    );
    expect(first).toContain("Create the first row");
    expect(first).not.toContain("Nothing matches");
    expect(none).toContain("Nothing matches");
    expect(none).toContain('data-empty="no-results"');

    const view = await mount(table("en", "default"));
    const header = [...view.host.querySelectorAll("th")].find((cell) => cell.textContent?.includes("Name"));
    expect(header?.getAttribute("aria-sort")).toBe("none");
    const button = header?.querySelector("button");
    await act(async () => {
      button?.click();
    });
    expect(view.host.querySelector("th[aria-sort='ascending']")).not.toBeNull();
    await view.unmount();
  });
});
