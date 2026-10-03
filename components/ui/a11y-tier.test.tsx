// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  assertDisabledSet,
  assertKnownBad,
  DISABLED_RULES,
  FLOOR_DISABLED,
  FLOOR_KNOWN_BAD,
  FLOOR_RULES_RUN,
} from "../../scripts/component-a11y-exclusions.mjs";
import { KNOWN_BAD_FIXTURES } from "../../scripts/known-bad-fixtures.mjs";
import { BilingualField, type BilingualFieldVisual } from "./bilingual-field/bilingual-field";
import { Button, type ButtonVisual } from "./button/button";
import { Checkbox, type CheckboxVisual } from "./checkbox/checkbox";
import { Field, type FieldVisual } from "./field/field";
import { RadioGroup, type RadioGroupVisual } from "./radio-group/radio-group";
import { Select, type SelectVisual } from "./select/select";
import { Skeleton, type SkeletonVisual } from "./skeleton/skeleton";
import { Spinner, type SpinnerVisual } from "./spinner/spinner";
import { StatusBadge, type StatusBadgeVisual } from "./status-badge/status-badge";
import { Switch, type SwitchVisual } from "./switch/switch";
import { Tabs, type TabsVisual } from "./tabs/tabs";
import { TextField, type TextFieldVisual } from "./text-field/text-field";
import { TextLink, type TextLinkVisual } from "./text-link/text-link";
import { Tooltip, type TooltipVisual } from "./tooltip/tooltip";
import { BrandFrame, type BrandFrameVisual } from "./brand-frame/brand-frame";
import { ColorField, type ColorFieldVisual } from "./color-field/color-field";
import { DataTable, type DataTableVisual } from "./data-table/data-table";
import { byteUnits, dateNames } from "./data-catalog";
import { DateField, type DateFieldCopy, type DateFieldVisual } from "./date-field/date-field";
import { FileDrop, type FileDropCopy, type FileDropVisual } from "./file-drop/file-drop";
import { Dialog, type DialogVisual } from "./dialog/dialog";
import { Glyph } from "./glyphs";
import { Notice, type NoticeVisual } from "./notice/notice";

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core/axe.js"), "utf8");

type AxeResult = {
  violations: Array<{ id: string }>;
  incomplete: Array<{ id: string }>;
  passes: Array<{ id: string }>;
  inapplicable: Array<{ id: string }>;
};

function boot() {
  const target = window as unknown as {
    eval: (source: string) => void;
    axe?: { run: (node: Element, options?: unknown) => Promise<AxeResult> };
  };
  if (!target.axe) {
    target.eval(axeSource);
  }
  return target.axe;
}

// Installed only while a dialog is open, then removed. axe decides which
// dialog is the modal by calling elementsFromPoint. jsdom's own throws, and
// the throw is reported as incomplete before the rule reads the dialog.
// Measured with the stand-in on and off: the rules that change are only
// Dialog's — aria-allowed-attr, aria-conditional-attr, aria-deprecated-role,
// aria-dialog-name, aria-hidden-focus, aria-prohibited-attr,
// aria-required-attr, aria-required-children, aria-required-parent,
// aria-roles, aria-valid-attr, aria-valid-attr-value, autocomplete-valid,
// button-name, empty-heading, heading-order, nested-interactive,
// scrollable-region-focusable, tabindex and valid-lang. Each is incomplete
// without the stand-in and passes, or is inapplicable, with it. No other
// primitive's rule outcome changes. Measured in axe-core 4.13.0: target-size
// is a rule, tagged wcag22aa, and the engine ships it disabled. Enabling it
// passes a button styled 4px by 4px. jsdom's getBoundingClientRect on that
// button is 0 by 0, and the offset check still reports a 24px diameter, so
// the pass is not a measurement. This tier disables target-size. Rendered
// size belongs to the browser tier, CF-178. color-contrast is disabled for
// the same class of reason and belongs to CF-177.
function storedColour(digits: string): string {
  return `#${digits}`;
}

function installDialogHitTest() {
  const previous = document.elementsFromPoint?.bind(document);
  document.elementsFromPoint = (x: number, y: number) => {
    try {
      const found = previous?.(x, y);
      if (found) return found;
    } catch {
      // jsdom throws. The open dialog is what a modal covers.
    }
    return [...document.querySelectorAll("dialog[open]")];
  };
  return () => {
    if (previous) {
      document.elementsFromPoint = previous;
    }
  };
}

function paint(element: ReactElement, locale: "en" | "ar") {
  const html = renderToStaticMarkup(
    <div id="root" lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      {element}
    </div>,
  );
  const parsed = new DOMParser().parseFromString(html, "text/html");
  const next = parsed.getElementById("root");
  if (!next) {
    throw new Error("the painted tree has no root");
  }
  document.getElementById("root")?.remove();
  document.body.appendChild(document.adoptNode(next));
}

const options = [
  { value: "mint", caption: "Mint" },
  { value: "rose", caption: "Rose" },
];
const names = { en: "English", ar: "Arabic" };
const missing = { en: "English is missing", ar: "Arabic is missing" };

describe("component accessibility tier", () => {
  it("runs axe on every enforced state in both locales and holds the exclusion list", async () => {
    const axe = boot();
    if (!axe) {
      throw new Error("axe-core did not attach to the window");
    }
    const disabled = assertDisabledSet();
    expect(disabled.ok, JSON.stringify(disabled)).toBe(true);
    expect(disabled.disabled).toEqual(disabled.listed);
    expect(disabled.listed).toEqual(disabled.disabled);
    expect(disabled.disabled.length).toBeGreaterThanOrEqual(FLOOR_DISABLED);
    let rulesRun = Number.POSITIVE_INFINITY;
    const locales = ["en", "ar"] as const;

    const cases: Array<{ name: string; states: readonly string[]; render: (state: string) => ReactElement }> = [
      {
        name: "Button",
        states: ["default", "hover", "focus", "active", "disabled", "loading"],
        render: (state) => (
          <Button state={state as ButtonVisual} disabled={state === "disabled"} loading={state === "loading"}>
            Save
          </Button>
        ),
      },
      {
        name: "TextLink",
        states: ["default", "hover", "focus", "active"],
        render: (state) => (
          <TextLink href="/guide" state={state as TextLinkVisual}>
            Guide
          </TextLink>
        ),
      },
      {
        name: "Field",
        states: ["default", "hover", "focus", "active", "disabled", "loading", "error"],
        render: (state) => (
          <Field
            caption="Trading name"
            state={state as FieldVisual}
            help="Shown on the label"
            error={state === "error" ? "Enter the trading name" : undefined}
            disabled={state === "disabled"}
          >
            <input />
          </Field>
        ),
      },
      {
        name: "TextField",
        states: ["default", "hover", "focus", "disabled", "loading", "error", "empty"],
        render: (state) => (
          <Field caption="Trading name" error={state === "error" ? "Enter the trading name" : undefined}>
            <TextField
              state={state as TextFieldVisual}
              value={state === "empty" ? "" : "Mint"}
              placeholder="Mint"
              disabled={state === "disabled"}
              loading={state === "loading"}
              clearAccessibleName="Clear"
            />
          </Field>
        ),
      },
      {
        name: "BilingualField",
        states: ["default", "hover", "focus", "disabled", "error", "empty", "complete"],
        render: (state) => (
          <BilingualField
            caption="Trading name"
            state={state as BilingualFieldVisual}
            defaultLocale="en"
            values={{
              en: state === "complete" ? "Mint" : "",
              ar: state === "complete" ? "Mint" : "",
            }}
            localeName={names}
            missingText={missing}
            completeText="Both locales are filled"
            error={state === "error" ? "Arabic is missing" : undefined}
            errorLocale="ar"
            disabled={state === "disabled"}
          />
        ),
      },
      {
        name: "Select",
        states: ["default", "hover", "focus", "active", "disabled", "loading", "error", "empty", "selected"],
        render: (state) => (
          <Field caption="Line" error={state === "error" ? "Choose a line" : undefined}>
            <Select
              state={state as SelectVisual}
              variant={state === "empty" || state === "active" || state === "selected" ? "searchable" : "native"}
              options={options}
              value={state === "selected" ? "mint" : ""}
              noResults="No matches"
              disabled={state === "disabled"}
              loading={state === "loading"}
            />
          </Field>
        ),
      },
      {
        name: "Checkbox",
        states: ["default", "hover", "focus", "active", "disabled", "error", "checked"],
        render: (state) => (
          <Checkbox
            caption="Archive"
            state={state as CheckboxVisual}
            checked={state === "checked"}
            disabled={state === "disabled"}
            invalid={state === "error"}
          />
        ),
      },
      {
        name: "RadioGroup",
        states: ["default", "hover", "focus", "active", "disabled", "error", "checked"],
        render: (state) => (
          <RadioGroup
            caption="Language"
            state={state as RadioGroupVisual}
            options={options}
            value={state === "checked" ? "mint" : ""}
            disabled={state === "disabled"}
            invalid={state === "error"}
          />
        ),
      },
      {
        name: "Switch",
        states: ["default", "hover", "focus", "active", "disabled", "loading", "error", "checked"],
        render: (state) => (
          <Switch
            caption="Notifications"
            onText="On"
            offText="Off"
            state={state as SwitchVisual}
            checked={state === "checked"}
            disabled={state === "disabled"}
            loading={state === "loading"}
            error={state === "error"}
          />
        ),
      },
      {
        name: "Skeleton",
        states: ["default", "loading"],
        render: (state) => (
          <div aria-busy="true">
            <Skeleton state={state as SkeletonVisual} />
          </div>
        ),
      },
      {
        name: "Spinner",
        states: ["default", "loading"],
        render: (state) => (
          <div aria-busy="true">
            Working
            <Spinner state={state as SpinnerVisual} />
          </div>
        ),
      },
      {
        name: "Tabs",
        states: ["default", "hover", "focus", "disabled", "loading", "error", "empty", "selected"],
        render: (state) => (
          <Tabs
            state={state as TabsVisual}
            selectedId="identity"
            tabs={[
              { id: "identity", caption: "Identity", panel: "Legal name" },
              { id: "trading", caption: "Trading", panel: "Trading name", disabled: state === "disabled" },
            ]}
          />
        ),
      },
      {
        name: "Dialog",
        states: ["default", "focus", "loading", "error"],
        render: (state) => (
          <Dialog
            open
            variant="standard"
            size="medium"
            state={state as DialogVisual}
            title="Archive the line"
            description="It can be restored"
            closeCaption="Close"
            onClose={() => undefined}
            failure={
              state === "error"
                ? {
                    title: "Not saved",
                    message: "Try again",
                    requestIdentifier: "req-14",
                    copyCaption: "Copy",
                    dismissCaption: "Dismiss",
                  }
                : undefined
            }
            footer={
              <Button type="button" loading={state === "loading"}>
                Keep
              </Button>
            }
          >
            Body
          </Dialog>
        ),
      },
      {
        name: "Notice",
        states: ["default", "hover", "focus", "error"],
        render: (state) => (
          <Notice
            variant="inline"
            tone={state === "error" ? "danger" : "info"}
            state={state as NoticeVisual}
            title="Saved"
            message="The line is stored"
            icon={<Glyph name="check" />}
            requestIdentifier={state === "error" ? "req-14" : undefined}
            copyCaption="Copy"
            dismissCaption="Dismiss"
          />
        ),
      },
      {
        name: "Tooltip",
        states: ["default", "hover", "focus"],
        render: (state) => (
          <Tooltip text="Full trading name" state={state as TooltipVisual}>
            <button type="button">Name</button>
          </Tooltip>
        ),
      },
      {
        name: "StatusBadge",
        states: ["default", "error"],
        render: (state) => (
          <StatusBadge variant="success" state={state as StatusBadgeVisual} text="Ready" icon={<Glyph name="check" />} />
        ),
      },
      {
        name: "ColorField",
        states: ["default", "hover", "focus", "active", "disabled", "error", "empty"],
        render: (state) => (
          <Field caption="Ink">
            <ColorField
              variant="standard"
              size="comfortable"
              state={state as ColorFieldVisual}
              value={state === "empty" ? "" : storedColour("1a1a1a")}
              emptyName="No colour"
              disabled={state === "disabled"}
            />
          </Field>
        ),
      },
      {
        name: "BrandFrame",
        states: ["default", "loading", "error", "empty", "incomplete"],
        render: (state) => {
          const face = { family: "Example Face", weight: "400", italic: false };
          const complete = state !== "incomplete";
          return (
            <BrandFrame
              variant="preview"
              size="comfortable"
              state={state as BrandFrameVisual}
              profile={
                state === "empty" || state === "error"
                  ? null
                  : {
                      colors: complete
                        ? {
                            primary: storedColour("112233"),
                            secondary: storedColour("223344"),
                            accent: storedColour("334455"),
                            background: storedColour("ffffff"),
                            foreground: storedColour("1a1a1a"),
                            muted: storedColour("545454"),
                            critical: storedColour("b3261e"),
                          }
                        : { background: storedColour("ffffff") },
                      typefaces: complete
                        ? {
                            "heading-latin": face,
                            "heading-arabic": face,
                            "body-latin": face,
                            "body-arabic": face,
                          }
                        : { "body-latin": face },
                      strings: complete
                        ? [{ field: "brand", locale: "en", value: "Mint" }]
                        : [{ field: "brand", locale: "ar", value: null }],
                    }
              }
              previewLocale="en"
              regionName={complete ? "Mint" : null}
              missingRegionName="Name missing"
              markers={{
                role: (role) => role,
                localeString: (field, locale) => `${field}/${locale}`,
                typeface: (pair) => pair,
              }}
              emptyMessage="No current profile"
              unresolvedMessage="Could not resolve"
              requestIdentifier="req-14"
            >
              Preview
            </BrandFrame>
          );
        },
      },
      {
        name: "DateField",
        states: ["default", "hover", "focus", "active", "disabled", "error", "empty", "selected"],
        render: (state) => {
          const names = dateNames("en");
          const copy: DateFieldCopy = {
            months: names.months,
            weekdaysShort: names.weekdaysShort,
            weekdaysFull: names.weekdaysFull,
            dayAccessibleName: names.dayAccessibleName,
            monthHeading: names.monthHeading,
            placeholder: names.placeholder,
            previousMonth: "Previous month",
            nextMonth: "Next month",
            openCalendar: "Open calendar",
            invalid: "Use DD/MM/YYYY",
          };
          return (
            <DateField
              locale="en"
              copy={copy}
              state={state as DateFieldVisual}
              viewYear={2026}
              viewMonth={9}
              accessibleName="Delivery date"
              value={state === "selected" ? "2026-09-01" : ""}
              disabled={state === "disabled"}
            />
          );
        },
      },
      {
        name: "FileDrop",
        states: ["default", "hover", "focus", "active", "disabled", "loading", "error", "empty", "done"],
        render: (state) => {
          const copy: FileDropCopy = {
            instruction: "Choose a file",
            dropInstruction: "Drop to upload",
            browse: "Browse",
            acceptedTypes: "PNG",
            percentPattern: dateNames("en").percent,
            retry: "Retry",
            replace: "Replace",
            remove: "Remove",
            typeError: "That type is not accepted",
            sizeError: "That file is too large",
            failureError: "That file failed",
          };
          const files =
            state === "loading"
              ? [{ id: "file-1", name: "pack.png", sizeBytes: 1000, phase: "uploading" as const, progress: 0.5 }]
              : state === "error"
                ? [{ id: "file-1", name: "pack.png", sizeBytes: 1000, phase: "error" as const, error: "type" as const }]
                : state === "done"
                  ? [{ id: "file-1", name: "pack.png", sizeBytes: 1000, phase: "done" as const }]
                  : [];
          return (
            <FileDrop
              locale="en"
              units={byteUnits("en")}
              copy={copy}
              state={state as FileDropVisual}
              sizeLimit={1000}
              files={files}
              disabled={state === "disabled"}
            />
          );
        },
      },
      {
        name: "DataTable",
        states: ["default", "hover", "focus", "loading", "error", "empty", "selected"],
        render: (state) => (
          <DataTable
            locale="en"
            variant="selectable"
            state={state as DataTableVisual}
            columns={[
              { key: "sku", caption: "SKU", kind: "identifier" },
              { key: "name", caption: "Name", kind: "text", sortable: true },
            ]}
            rows={
              state === "empty" || state === "loading" || state === "error"
                ? []
                : [{ id: "row-1", cells: { sku: "SKU-10001", name: "Mint" }, actions: <Button variant="quiet">Edit</Button> }]
            }
            rangePattern="{from}:{to}:{total}"
            regionName="Lines"
            pageSizeCaption="Page size"
            listEmpty="None"
            previousPage="Previous page"
            nextPage="Next page"
            selectAllName="Select all"
            selectRowName="Select row"
            actionsCaption="Actions"
            empty={{ kind: state === "empty" ? "first-use" : "no-results", content: "Nothing here" }}
            failure={{
              message: "The list failed",
              requestIdentifier: "req-14",
              retry: "Retry",
              onRetry: () => undefined,
            }}
            selectedIds={state === "selected" ? ["row-1"] : []}
          />
        ),
      },
    ];

    for (const locale of locales) {
      for (const sample of cases) {
        for (const state of sample.states) {
          const restore = sample.name === "Dialog" ? installDialogHitTest() : null;
          try {
            paint(sample.render(state), locale);
            const root = document.getElementById("root");
            if (!root) {
              throw new Error("root missing after paint");
            }
            const result = await axe.run(root, { rules: DISABLED_RULES });
            const examined =
              result.violations.length + result.incomplete.length + result.passes.length + result.inapplicable.length;
            rulesRun = Math.min(rulesRun, examined);
            const violations = result.violations.map((item) => item.id);
            const incomplete = result.incomplete.map((item) => item.id);
            expect(violations, `${sample.name} ${state} ${locale}`).toEqual([]);
            expect(incomplete, `${sample.name} ${state} ${locale}`).toEqual([]);
          } finally {
            restore?.();
          }
        }
      }
    }

    expect(rulesRun).toBeGreaterThanOrEqual(FLOOR_RULES_RUN);

    function mountFixture(html: string) {
      const parsed = new DOMParser().parseFromString(html, "text/html");
      document.body.replaceChildren();
      for (const node of document.head.querySelectorAll('meta[name="viewport"]')) {
        node.remove();
      }
      const meta = parsed.head.querySelector('meta[name="viewport"]');
      if (meta) {
        document.head.appendChild(document.adoptNode(meta));
      }
      const root = document.createElement("div");
      root.id = "root";
      for (const child of [...parsed.body.childNodes]) {
        root.appendChild(document.adoptNode(child));
      }
      document.body.appendChild(root);
      return root;
    }

    const fixtureById = new Map(KNOWN_BAD_FIXTURES.map((fixture) => [fixture.id, fixture.document]));
    const proven: string[] = [];

    const targetRoot = mountFixture(fixtureById.get("target-size") ?? "");
    const targetSize = await axe.run(targetRoot, { rules: { "target-size": { enabled: true } } });
    if (targetSize.violations.some((item) => item.id === "target-size")) {
      throw new Error(
        "target-size failed its known-bad fixture. The simulated DOM can observe it, so the exclusion must be revisited.",
      );
    }
    if (!targetSize.passes.some((item) => item.id === "target-size")) {
      throw new Error("target-size did not pass its adjacent 4px buttons, so the known-bad fixture was not proven");
    }
    proven.push("target-size");

    const contrastRoot = mountFixture(fixtureById.get("color-contrast") ?? "");
    const contrast = await axe.run(contrastRoot, { rules: { "color-contrast": { enabled: true } } });
    if (contrast.violations.some((item) => item.id === "color-contrast")) {
      throw new Error(
        "color-contrast failed its known-bad fixture. The simulated DOM can observe it, so the exclusion must be revisited.",
      );
    }
    const contrastSeen = [...contrast.passes, ...contrast.incomplete].some((item) => item.id === "color-contrast");
    if (!contrastSeen) {
      throw new Error("color-contrast did not run against its known-bad fixture");
    }
    proven.push("color-contrast");

    paint(<p>See now</p>, "en");
    const sentence = document.querySelector("p");
    if (!sentence) {
      throw new Error("the same-colour link was not painted");
    }
    sentence.textContent = "";
    sentence.append("See ");
    const sameLink = document.createElement("a");
    sameLink.setAttribute("href", "#guide");
    sameLink.textContent = "more";
    sentence.append(sameLink);
    sentence.append(" now");
    sentence.style.setProperty("color", "rgb(26, 26, 26)");
    sameLink.style.setProperty("color", "rgb(26, 26, 26)");
    sameLink.style.setProperty("text-decoration", "none");
    const linkRule = await axe.run(document.getElementById("root") ?? sentence, {
      rules: { "link-in-text-block": { enabled: true } },
    });
    if (linkRule.violations.some((item) => item.id === "link-in-text-block")) {
      throw new Error(
        "link-in-text-block failed its known-bad fixture. The simulated DOM can observe it, so the exclusion must be revisited.",
      );
    }
    const linkSeen = [...linkRule.passes, ...linkRule.incomplete, ...linkRule.inapplicable].some(
      (item) => item.id === "link-in-text-block",
    );
    if (!linkSeen) {
      throw new Error("link-in-text-block did not run against its known-bad fixture");
    }
    proven.push("link-in-text-block");

    paint(<p>Locked spacing</p>, "en");
    const locked = document.querySelector("p");
    if (!locked) {
      throw new Error("the locked paragraph was not painted");
    }
    locked.style.setProperty("line-height", "1.2", "important");
    locked.style.setProperty("letter-spacing", "0.05em", "important");
    locked.style.setProperty("word-spacing", "0.05em", "important");
    const spacing = await axe.run(locked, { rules: { "avoid-inline-spacing": { enabled: true } } });
    if (spacing.violations.some((item) => item.id === "avoid-inline-spacing")) {
      throw new Error(
        "avoid-inline-spacing failed its known-bad fixture. The simulated DOM can observe it, so the exclusion must be revisited.",
      );
    }
    const spacingSeen = [...spacing.passes, ...spacing.incomplete, ...spacing.inapplicable].some(
      (item) => item.id === "avoid-inline-spacing",
    );
    if (!spacingSeen) {
      throw new Error("avoid-inline-spacing did not run against its known-bad fixture");
    }
    proven.push("avoid-inline-spacing");

    const viewportMeta = document.createElement("meta");
    viewportMeta.setAttribute("name", "viewport");
    viewportMeta.setAttribute("content", "width=device-width, user-scalable=no");
    document.head.appendChild(viewportMeta);
    paint(<p>Page</p>, "en");
    const viewportRoot = document.getElementById("root");
    if (!viewportRoot) {
      throw new Error("the viewport fixture has no root");
    }
    const viewport = await axe.run(viewportRoot, { rules: { "meta-viewport": { enabled: true } } });
    if (viewport.violations.some((item) => item.id === "meta-viewport")) {
      throw new Error(
        "meta-viewport failed its known-bad fixture on the component root. The simulated DOM can observe it there, so the exclusion must be revisited.",
      );
    }
    const viewportSeen = [...viewport.passes, ...viewport.incomplete, ...viewport.inapplicable].some(
      (item) => item.id === "meta-viewport",
    );
    if (!viewportSeen) {
      throw new Error("meta-viewport did not run against its known-bad fixture");
    }
    proven.push("meta-viewport");

    const fixtures = assertKnownBad(proven);
    expect(fixtures.ok, JSON.stringify(fixtures)).toBe(true);
    expect(fixtures.proven).toBeGreaterThanOrEqual(FLOOR_KNOWN_BAD);
    const line = `A11Y_TIER rules=${rulesRun} disabled=${disabled.disabled.length} knownBad=${fixtures.proven}\n`;
    process.stderr.write(line);
    console.log(line.trim());
  }, 60000);
});
