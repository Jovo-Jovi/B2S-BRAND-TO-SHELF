// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { AppShell } from "./app-shell/app-shell";
import { EmptyState } from "./empty-state/empty-state";
import { ErrorState } from "./error-state/error-state";
import { FilteredDataTable } from "./filtered-data-table/filtered-data-table";
import { PageHeader } from "./page-header/page-header";
import { assertDistinctNames } from "./names";
import { TenantSwitcher } from "./tenant-switcher/tenant-switcher";
import { WizardStep } from "./wizard-step/wizard-step";

function paint(element: ReactElement) {
  const html = renderToStaticMarkup(element);
  const parsed = new DOMParser().parseFromString(html, "text/html");
  const next = parsed.body;
  document.body.replaceChildren();
  for (const child of [...next.childNodes]) {
    document.body.appendChild(document.adoptNode(child));
  }
  return document.body;
}

const header = {
  theme: "light" as const,
  tenantName: "Sample company",
  logos: [] as { ground: "light" | "dark"; src: string }[],
  localeHref: "/ar/gallery",
  localeCaption: "Arabic",
  themeCaption: "Theme",
  themeSystem: "System theme",
  themeLight: "Light theme",
  themeDark: "Dark theme",
  onTheme: () => undefined,
  accountCaption: "Account menu",
  accountOptions: [],
  switcher: {
    memberships: [
      { id: "a", name: "Sample company", mark: "A" },
      { id: "b", name: "Second company", mark: "B" },
    ],
    resolvedId: "a",
    searchCaption: "Search the memberships",
    onSwitch: () => undefined,
  },
};

function shell(captions: [string, string]) {
  return (
    <AppShell
      skip="Skip"
      openNavigation="Open the navigation"
      closeNavigation="Close the navigation"
      navigationLabel="Sections"
      measure="full"
      navigation={[
        { id: "one", caption: captions[0], href: "#one", current: true },
        { id: "two", caption: captions[1], href: "#two", current: false },
      ]}
      header={header}
    >
      <p>Body</p>
    </AppShell>
  );
}

describe("compositions", () => {
  it("gives repeated controls distinct accessible names", () => {
    paint(shell(["Catalog section", "Sample section"]));
    expect(() => assertDistinctNames(document.body)).not.toThrow();
  });

  it("fails when repeated controls share an accessible name", () => {
    paint(shell(["Catalog section", "Catalog section"]));
    expect(() => assertDistinctNames(document.body)).toThrow(/duplicate accessible name/);
  });

  it("uses the logo whose ground matches the theme and otherwise the tenant name", () => {
    const matched = renderToStaticMarkup(
      <PageHeader
        {...header}
        theme="light"
        logos={[
          { ground: "dark", src: "/gallery/sample-mark-dark.svg" },
          { ground: "light", src: "/gallery/sample-mark-light.svg" },
        ]}
      />,
    );
    expect(matched).toContain("/gallery/sample-mark-light.svg");
    expect(matched).not.toContain("/gallery/sample-mark-dark.svg");

    const missing = renderToStaticMarkup(
      <PageHeader {...header} theme="light" logos={[{ ground: "dark", src: "/gallery/sample-mark-dark.svg" }]} />,
    );
    expect(missing).not.toContain("<img");
    expect(missing).toContain("Sample company");
  });

  it("does not persist a tenant choice and searches only past seven memberships", () => {
    const setItem = vi.fn();
    vi.stubGlobal("localStorage", { setItem, getItem: vi.fn() });
    const eight = Array.from({ length: 8 }, (_, index) => ({
      id: `m-${index}`,
      name: `Company ${index}`,
      mark: String(index),
    }));
    const searchable = renderToStaticMarkup(
      <TenantSwitcher memberships={eight} resolvedId="m-0" searchCaption="Search the memberships" onSwitch={() => undefined} />,
    );
    expect(searchable).toContain("Search the memberships");
    const seven = eight.slice(0, 7);
    const quiet = renderToStaticMarkup(
      <TenantSwitcher memberships={seven} resolvedId="m-0" searchCaption="Search the memberships" onSwitch={() => undefined} />,
    );
    expect(quiet).not.toContain("Search the memberships");
    expect(setItem).not.toHaveBeenCalled();
    expect(readFileSync("components/shared/tenant-switcher/tenant-switcher.tsx", "utf8")).not.toContain("localStorage");
    expect(readFileSync("components/shared/tenant-switcher/tenant-switcher.tsx", "utf8")).not.toContain("sessionStorage");
    expect(readFileSync("components/shared/tenant-switcher/tenant-switcher.tsx", "utf8")).not.toContain("document.cookie");
    vi.unstubAllGlobals();
  });

  it("numbers Brand to Review and leaves Welcome unnumbered", () => {
    const html = renderToStaticMarkup(
      <WizardStep
        locale="en"
        current="brand"
        captions={{
          welcome: "Welcome",
          brand: "Brand",
          typography: "Typography",
          company: "Company",
          guidelines: "Guidelines",
          review: "Review",
        }}
        progress="Step {current} of {total}"
        title="Brand"
        purpose="Set the brand"
        back="Back"
        continueCaption="Continue"
        save="Save and finish later"
        mark="B2S"
        localeHref="/ar/gallery"
        localeCaption="Arabic"
        help="Help"
        onBack={() => undefined}
        onContinue={() => undefined}
        onSave={() => undefined}
        onHelp={() => undefined}
        onStep={() => undefined}
        errors={[]}
      >
        <p>Fields</p>
      </WizardStep>,
    );
    expect(html).toContain("Step 1 of 5");
    expect(html).toContain("Welcome");
    expect(html).not.toContain(">0<");
    expect(html.match(/<li>/g)?.length).toBe(6);
  });

  it("isolates the request identifier and does not say whether a record exists", () => {
    const html = renderToStaticMarkup(
      <ErrorState
        title="The page did not load"
        message="The request failed"
        next="Retry the request"
        retry="Retry"
        onRetry={() => undefined}
        requestIdentifier="req-14"
        copyIdentifier="Copy the request identifier"
      />,
    );
    expect(html).toContain('dir="ltr"');
    expect(html).toContain("req-14");
    expect(html.toLowerCase()).not.toContain("not found");
    expect(html.toLowerCase()).not.toContain("does not exist");
    const source = readFileSync("components/shared/error-state/error-state.tsx", "utf8");
    expect(source).not.toContain("not found");
    expect(source).not.toContain("does not exist");
  });

  it("names each removable filter and each row action for its own target", () => {
    paint(
      <FilteredDataTable
        locale="en"
        searchCaption="Search"
        searchValue=""
        onSearch={() => undefined}
        filters={[
          { id: "mint", caption: "Mint line" },
          { id: "rose", caption: "Rose line" },
        ]}
        active={[
          { id: "mint", caption: "Mint line" },
          { id: "rose", caption: "Rose line" },
        ]}
        onToggle={() => undefined}
        removePattern="Remove {name}"
        clearFilters="Clear filters"
        onClear={() => undefined}
        resultCaption="Results"
        resultCount={2}
        columns={[{ key: "name", caption: "Product name", kind: "text" }]}
        rows={[
          { id: "1", cells: { name: "Mint" }, actions: <button type="button">Edit Mint</button> },
          { id: "2", cells: { name: "Rose" }, actions: <button type="button">Edit Rose</button> },
        ]}
        rangePattern="{from}–{to} of {total}"
        regionName="Lines"
        pageSizeCaption="Page size"
        listEmpty="None yet"
        previousPage="Previous page"
        nextPage="Next page"
        actionsCaption="Actions"
        emptyKind="first-use"
        empty={<EmptyState title="No lines yet" description="Add a line" action="Add a line" onAction={() => undefined} />}
      />,
    );
    expect(() => assertDistinctNames(document.body)).not.toThrow();
  });
});
