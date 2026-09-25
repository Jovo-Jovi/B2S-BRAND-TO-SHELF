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
import { Switch, type SwitchVisual } from "./switch/switch";
import { TextField, type TextFieldVisual } from "./text-field/text-field";
import { TextLink, type TextLinkVisual } from "./text-link/text-link";

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
    ];

    for (const locale of locales) {
      for (const sample of cases) {
        for (const state of sample.states) {
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
        }
      }
    }

    const verdict = assertExclusionUnion([...observed]);
    expect(verdict.silent).toEqual([]);
    expect(verdict.unlisted).toEqual([]);
    expect(verdict.ok).toBe(true);
  });
});
