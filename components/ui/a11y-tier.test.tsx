// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { assertExclusionUnion, EXCLUSION_IDS } from "../../scripts/component-a11y-exclusions.mjs";
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
import { Dialog, type DialogVisual } from "./dialog/dialog";
import { Glyph } from "./glyphs";
import { Notice, type NoticeVisual } from "./notice/notice";

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core/axe.js"), "utf8");

type AxeResult = {
  violations: Array<{ id: string }>;
  incomplete: Array<{ id: string }>;
};

function boot() {
  const target = window as unknown as {
    eval: (source: string) => void;
    axe?: { run: (node: Element) => Promise<AxeResult> };
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
// primitive's rule outcome changes. target-size is not a rule in axe-core
// 4.13.0, so this tier does not claim it. Rendered geometry belongs to the
// browser tier.
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
    const observed = new Set<string>();
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
            const result = await axe.run(root);
            for (const item of result.incomplete) {
              observed.add(item.id);
            }
            const violations = result.violations.map((item) => item.id);
            const unlisted = result.incomplete.map((item) => item.id).filter((id) => !EXCLUSION_IDS.includes(id));
            expect(violations, `${sample.name} ${state} ${locale}`).toEqual([]);
            expect(unlisted, `${sample.name} ${state} ${locale}`).toEqual([]);
          } finally {
            restore?.();
          }
        }
      }
    }

    const verdict = assertExclusionUnion([...observed]);
    expect(verdict.silent).toEqual([]);
    expect(verdict.unlisted).toEqual([]);
    expect(verdict.ok).toBe(true);
  }, 30000);
});
