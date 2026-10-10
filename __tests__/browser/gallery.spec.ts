import { expect, test, type Page } from "@playwright/test";
import axe from "axe-core";

import { installConsoleGuard } from "./console-guard";

installConsoleGuard();

import {
  GALLERY_COVERAGE,
  GALLERY_LOCALES,
  GALLERY_THEMES,
  GALLERY_WIDTHS,
} from "../../app/[locale]/(public)/gallery/coverage";
import { readFileSync } from "node:fs";

import { writeOverflowDiagnostic } from "./overflow-diagnostic";

import { KNOWN_BAD_FIXTURES } from "../../scripts/known-bad-fixtures.mjs";
import en from "../../app/[locale]/dictionaries/en.json";
import ar from "../../app/[locale]/dictionaries/ar.json";

const CLAIMED = {
  "color-contrast": { enabled: true },
  "target-size": { enabled: true },
  "link-in-text-block": { enabled: true },
  "avoid-inline-spacing": { enabled: true },
  "meta-viewport": { enabled: true },
};

const WATCHED = [
  "color-contrast",
  "target-size",
  "link-in-text-block",
  "avoid-inline-spacing",
  "meta-viewport",
  "landmark-one-main",
  "page-has-heading-one",
  "heading-order",
];

type AxeNode = { target: string; html: string; summary: string };
type AxeReport = {
  violations: Array<{ id: string; nodes: AxeNode[] }>;
  notes: Array<{ id: string; html: string; summary: string }>;
  buckets: Record<string, string>;
};

async function runAxe(page: Page, rules: Record<string, { enabled: boolean }>): Promise<AxeReport> {
  await page.addScriptTag({ content: axe.source });
  return page.evaluate(
    async ({ enabled, watched }) => {
      const engine = (window as unknown as { axe: { run: (context: { exclude: string[][] }, options: unknown) => Promise<{
        violations: Array<{ id: string; nodes: Array<{ target: string[]; html?: string; failureSummary?: string }> }>;
        passes: Array<{ id: string }>;
        incomplete: Array<{ id: string; nodes: Array<{ failureSummary?: string; html?: string }> }>;
        inapplicable: Array<{ id: string }>;
      }> } }).axe;
      const result = await engine.run(
        { exclude: [["[data-proof-content]"]] },
        { rules: enabled },
      );
      const buckets: Record<string, string> = {};
      for (const id of watched) {
        const hit = (["violations", "passes", "incomplete", "inapplicable"] as const).find((key) =>
          result[key].some((item) => item.id === id),
        );
        buckets[id] = hit ?? "absent";
      }
      return {
        violations: result.violations.map((item) => ({
          id: item.id,
          nodes: item.nodes.slice(0, 4).map((node) => ({
            target: node.target.join(" "),
            html: (node.html ?? "").slice(0, 200),
            summary: (node.failureSummary ?? "").slice(0, 300),
          })),
        })),
        buckets,
        notes: result.incomplete
          .filter((item) => watched.includes(item.id))
          .map((item) => ({
            id: item.id,
            html: (item.nodes[0]?.html ?? "").slice(0, 200),
            summary: (item.nodes[0]?.failureSummary ?? "").slice(0, 300),
          })),
      };
    },
    { enabled: rules, watched: WATCHED },
  );
}

for (const fixture of KNOWN_BAD_FIXTURES) {
  test(`component known-bad fixture fails in the browser: ${fixture.id}`, async ({ page }) => {
    await page.setContent(fixture.document);
    const result = await runAxe(page, { [fixture.id]: { enabled: true } });
    expect(result.violations.map((item) => item.id), fixture.id).toContain(fixture.id);
  });
}

test("grey text on the same grey is not a contrast pass", async ({ page }) => {
  await page.setContent(
    '<!doctype html><html lang="en"><head><title>T</title></head><body><p style="background-color:#767676;color:#767676;font-size:16px;font-weight:400">Grey on grey</p></body></html>',
  );
  const result = await runAxe(page, { "color-contrast": { enabled: true } });
  expect(result.buckets["color-contrast"]).not.toBe("passes");
  expect(result.buckets["color-contrast"]).not.toBe("absent");
  expect(JSON.stringify(result.notes) + JSON.stringify(result.violations)).toContain("1:1");
});

test("grey text below the AA threshold fails colour contrast", async ({ page }) => {
  await page.setContent(
    '<!doctype html><html lang="en"><head><title>T</title></head><body style="background:#fff"><main><h1 style="color:#111;background:#fff">T</h1><p style="color:#9a9a9a;background-color:#ffffff;font-size:16px">Soft grey</p></main></body></html>',
  );
  const result = await runAxe(page, { "color-contrast": { enabled: true } });
  expect(result.violations.map((item) => item.id)).toContain("color-contrast");
});

test("a 4px button beside another target fails target size", async ({ page }) => {
  // Measured: a lone 4px button passes axe target-size. The spacing exception
  // gives it a 24px circle that meets no neighbour. The fixture that fails is
  // the 4px button touching a second target, which is the rule as axe
  // implements WCAG 2.2 2.5.8.
  await page.setContent(
    '<!doctype html><html lang="en"><head><title>T</title></head><body><main><h1>T</h1><button style="width:4px;height:4px;padding:0">Go</button><button style="width:4px;height:4px;padding:0">Go</button></main></body></html>',
  );
  const result = await runAxe(page, { "target-size": { enabled: true } });
  expect(result.violations.map((item) => item.id)).toContain("target-size");
});

test("a same-colour link on a different background fails", async ({ page }) => {
  // Measured in axe-core 4.13.0: the rule's allowSameColor option passes a
  // link whose text and background both match the paragraph. It violates when
  // the text colour matches and the background does not, and no other style
  // distinguishes the link.
  const shared =
    "color:#1a1a1a;font-family:sans-serif;font-size:16px;font-weight:400;font-style:normal;text-decoration:none solid #1a1a1a";
  await page.setContent(
    `<!doctype html><html lang="en"><head><title>T</title></head><body><main><h1>T</h1><p style="${shared};background:#ffffff">See <a href="/guide" style="${shared};background:#d0d0d0">more</a> now</p></main></body></html>`,
  );
  const result = await runAxe(page, { "link-in-text-block": { enabled: true } });
  expect(result.violations.map((item) => item.id)).toContain("link-in-text-block");
});

test("locked inline spacing fails", async ({ page }) => {
  await page.setContent(
    '<!doctype html><html lang="en"><head><title>T</title></head><body><main><h1>T</h1><p style="line-height:1.2 !important;letter-spacing:0.05em !important;word-spacing:0.05em !important">Locked</p></main></body></html>',
  );
  const result = await runAxe(page, { "avoid-inline-spacing": { enabled: true } });
  expect(result.violations.map((item) => item.id)).toContain("avoid-inline-spacing");
});

test("a viewport that forbids zoom fails", async ({ page }) => {
  await page.setContent(
    '<!doctype html><html lang="en"><head><title>T</title><meta name="viewport" content="width=device-width, user-scalable=no"></head><body><main><h1>Page</h1></main></body></html>',
  );
  const result = await runAxe(page, { "meta-viewport": { enabled: true } });
  expect(result.violations.map((item) => item.id)).toContain("meta-viewport");
});

test("an unflipped mirroring glyph and a flipped never-mirror glyph both fail", async ({ page }) => {
  await page.setContent(`<!doctype html>
    <html dir="rtl"><body>
      <svg data-glyph="previous" data-mirrors="true" style="transform:none"></svg>
      <svg data-glyph="check" data-mirrors="false" style="transform:scaleX(-1)"></svg>
    </body></html>`);
  const report = await page.evaluate(() => {
    const failures: string[] = [];
    for (const node of document.querySelectorAll("svg")) {
      const name = node.getAttribute("data-glyph");
      const mirrors = node.getAttribute("data-mirrors") === "true";
      const transform = getComputedStyle(node).transform;
      const flipped = transform.includes("-1");
      if (mirrors && !flipped) failures.push(`unflipped ${name}`);
      if (!mirrors && flipped) failures.push(`flipped ${name}`);
    }
    return failures;
  });
  expect(report).toContain("unflipped previous");
  expect(report).toContain("flipped check");
});

async function assertBrandStep(page: Page, locale: "en" | "ar") {
  const copy = locale === "en" ? en.gallery : ar.gallery;
  const screen = page.locator('[data-screen="brand-step"]');
  const ownsSheet = await page.evaluate(() => {
    for (const sheet of document.styleSheets) {
      let rules: CSSRuleList;
      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }
      for (const rule of rules) {
        if (rule.cssText.includes("brand-step")) return true;
      }
    }
    return false;
  });
  expect(ownsSheet).toBe(false);
  await expect(screen.getByText(copy.fictionalSample)).toBeVisible();
  await expect(screen.locator("#brand-name [data-locale]").first()).toHaveAttribute("data-locale", "en");
  await expect(screen.locator("#brand-name input").first()).toHaveAttribute("dir", "ltr");
  await expect(screen.locator("#brand-name input").nth(1)).toHaveAttribute("dir", "rtl");
  const frameDir = await screen.locator('[data-composition="WizardStep"]').evaluate((node) => getComputedStyle(node).direction);
  expect(frameDir).toBe(locale === "ar" ? "rtl" : "ltr");
  await expect(screen.getByRole("button", { name: copy.compositionHelp })).toHaveCount(0);
  await expect(screen.getByRole("button", { name: copy.compositionBackWelcome })).toHaveCount(0);
  const language = screen.getByRole("link", { name: locale === "en" ? copy.localeAr : copy.localeEn });
  await language.focus();
  const outline = await language.evaluate((node) => getComputedStyle(node).outlineStyle);
  expect(outline).not.toBe("none");
  await screen.locator("#brand-name input").first().fill("");
  await screen.getByRole("button", { name: copy.compositionContinue }).click();
  const summary = screen.locator('[role="alert"]').filter({ has: page.locator('a[href="#brand-name"]') });
  await expect(summary).toBeFocused();
  const missingName = copy.missingName.replace("{locale}", copy.localeEn);
  const missingPrimary = copy.missingRole.replace("{role}", copy.rolePrimary);
  await expect(summary).toContainText(missingName);
  await expect(summary).toContainText(missingPrimary);
  await expect(screen.locator("#brand-name")).toContainText(missingName);
  await screen.locator("#brand-name input").first().fill(copy.sampleBrandEn);
  const name = screen.locator('[data-specimen="label"] [data-part="name"]');
  await expect(name).toHaveText(copy.sampleBrandEn);
  await expect(name).toHaveCSS("font-weight", "700");
  await expect(name).toHaveCSS("font-family", /Inter/);
  await expect(screen.locator('[data-specimen="label"] [data-part="product"]')).toHaveCSS("font-weight", "400");
  await expect(screen.locator('[data-specimen="label"] [data-part="name-other"]')).toHaveCSS("font-family", /Cairo/);
  await screen.locator("#role-primary").fill("#112233");
  await expect
    .poll(() => screen.locator('[data-part="band"]').evaluate((node) => getComputedStyle(node).backgroundColor))
    .toBe("rgb(17, 34, 51)");
  await screen.locator('input[type="file"]').setInputFiles({
    name: "mark.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'),
  });
  await expect(screen.locator('[data-specimen="label"] img[data-part="logo-slot"]')).toHaveAttribute("src", /^blob:/);
  await screen.locator("#role-primary").fill("#ffffff");
  await expect(screen.locator('[data-specimen="label"] img[data-part="logo-slot"]')).toHaveCount(0);
  await expect(screen.getByText(copy.missingMark.replace("{ground}", copy.groundLight)).first()).toBeVisible();
  await screen.getByRole("tab", { name: copy.tabSticker }).click();
  await expect(screen.locator('[data-specimen="sticker"]')).toBeVisible();
  await assertTypographyStep(page, locale);
  await page.getByRole("button", { name: copy.compositionAccount }).click();
  await expect(page.getByRole("radio", { name: copy.themeSystem })).toBeVisible();
  await expect(page.getByRole("radio", { name: copy.themeLight })).toBeVisible();
  await expect(page.getByRole("radio", { name: copy.themeDark })).toBeVisible();
}

async function assertTypographyStep(page: Page, locale: "en" | "ar") {
  const copy = locale === "en" ? en.gallery : ar.gallery;
  const screen = page.locator('[data-screen="typography-step"]');
  await expect(screen.locator("#typeface-heading-arabic")).toHaveValue("");
  await expect(screen.locator("#typeface-body-latin")).toHaveValue("");
  await screen.getByRole("button", { name: copy.compositionContinue }).click();
  const missing = copy.typefaceMissing.replace("{role}", copy.typefaceHeading).replace("{script}", copy.typefaceArabic);
  const summary = screen.locator('[role="alert"]').filter({ has: page.locator('a[href="#typeface-heading-arabic"]') });
  await expect(summary).toContainText(missing);
  await screen.locator("#typeface-heading-latin").selectOption("Inter");
  await screen.locator("#typeface-body-latin").selectOption("Lora");
  await screen.locator("#typeface-heading-arabic").selectOption("Cairo");
  await screen.locator("#typeface-body-arabic").selectOption("Amiri");
  const name = screen.locator('[data-specimen="label"] [data-part="name"]');
  await expect(name).toHaveCSS("font-family", /Inter/);
  await expect(name).toHaveCSS("font-weight", "700");
  const product = screen.locator('[data-specimen="label"] [data-part="product"]');
  await expect(product).toHaveCSS("font-family", /Lora/);
  await expect(product).toHaveCSS("font-weight", "400");
  await expect(screen.locator('[data-specimen="label"] [data-part="name-other"]')).toHaveCSS("font-family", /Cairo/);
  await expect(screen.locator('[data-specimen="label"] [data-part="name-other"]')).toHaveCSS("font-weight", "700");
}

async function hideDialogs(page: Page) {
  await page.evaluate(() => {
    for (const node of document.querySelectorAll("dialog")) {
      if (node instanceof HTMLDialogElement && node.open) node.close();
      node.removeAttribute("open");
    }
  });
}

for (const locale of GALLERY_LOCALES) {
  for (const theme of GALLERY_THEMES) {
    for (const width of GALLERY_WIDTHS) {
      test(`gallery ${locale} ${theme} ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.emulateMedia({ colorScheme: theme === "dark" ? "dark" : "light" });
        await page.goto(`/${locale}/gallery?theme=${theme}`);
        await page.waitForFunction((next) => {
          const text = getComputedStyle(document.body).color;
          return document.documentElement.dataset.theme === next &&
            (next === "dark" ? text === "rgb(243, 239, 234)" : text === "rgb(38, 34, 32)");
        }, theme);
        await expect(page.locator("h1")).toHaveCount(1);
        await expect(page.locator("main")).toHaveCount(1);
        await expect(page.locator("[data-primitive]")).toHaveCount(GALLERY_COVERAGE.length);
        const compositionNames = [...readFileSync("docs/product/DESIGN_SURFACE.md", "utf8").split("## 7. Shared compositions")[1].split("\n## 8.")[0].matchAll(/^### (.+)$/gm)].map((match) => match[1].trim());
        for (const name of compositionNames) {
          await expect(page.locator(`[data-composition="${name}"]`).first()).toBeAttached();
        }
        await page.screenshot({
          path: `test-results/visual/gallery-${locale}-${theme}-${width}.png`,
          fullPage: true,
        });
        await hideDialogs(page);

        if (locale === "ar" && width === 360) {
          await writeOverflowDiagnostic(page, locale, theme, width);
        }

        const overflow = await page.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          client: document.documentElement.clientWidth,
        }));
        expect(overflow.scroll).toBeLessThanOrEqual(overflow.client);

        const rendered = await runAxe(page, CLAIMED);
        expect(rendered.violations, JSON.stringify(rendered.violations)).toEqual([]);
        for (const rule of ["color-contrast", "target-size", "meta-viewport", "landmark-one-main", "page-has-heading-one", "heading-order"]) {
          expect(rendered.buckets[rule], rule).toBe("passes");
        }

        const dialogs = page.locator('[data-primitive="Dialog"] dialog');
        const dialogCount = await dialogs.count();
        for (let index = 0; index < dialogCount; index += 1) {
          await hideDialogs(page);
          await dialogs.nth(index).evaluate((node) => {
            if (node instanceof HTMLDialogElement) node.showModal();
          });
          const dialogReport = await runAxe(page, CLAIMED);
          expect(dialogReport.violations, JSON.stringify(dialogReport.violations)).toEqual([]);
        }
        await hideDialogs(page);

        const mirroring = await page.evaluate(() => {
          function scaleX(node: Element): number {
            const transform = getComputedStyle(node).transform;
            if (!transform || transform === "none") return 1;
            const match = transform.match(/matrix\(([^)]+)\)/);
            if (!match) return 1;
            return Number(match[1].split(",")[0]);
          }
          const previous = document.querySelector('[data-glyph="previous"]');
          const check = document.querySelector('[data-glyph="check"]');
          const button = document.querySelector('[data-primitive="Button"][data-state="default"] button');
          const icon = button?.querySelector("svg");
          const label = button?.querySelector("[data-label]");
          const field = document.querySelector('[data-primitive="TextField"][data-state="default"] input');
          return {
            dir: document.documentElement.dir,
            previous: previous ? scaleX(previous) : null,
            check: check ? scaleX(check) : null,
            iconBeforeLabel:
              icon && label ? icon.getBoundingClientRect().x < label.getBoundingClientRect().x : null,
            identifierDirection: field ? getComputedStyle(field).direction : null,
          };
        });
        expect(mirroring.check).toBe(1);
        expect(mirroring.identifierDirection).toBe("ltr");
        if (locale === "ar") {
          expect(mirroring.dir).toBe("rtl");
          expect(mirroring.previous).toBe(-1);
          expect(mirroring.iconBeforeLabel).toBe(false);
        } else {
          expect(mirroring.dir).toBe("ltr");
          expect(mirroring.previous).toBe(1);
          expect(mirroring.iconBeforeLabel).toBe(true);
        }
        await assertBrandStep(page, locale);
      });
    }
  }
}

type OutputReading = {
  direction: string | null;
  marks: { x: number; y: number; w: number; h: number }[];
};

type SpecimenReadings = {
  pinned: OutputReading;
  knownBad: OutputReading;
  label: OutputReading;
  sticker: OutputReading;
};

async function openGallery(page: Page, locale: string, theme: string, width: number) {
  await page.setViewportSize({ width, height: 800 });
  await page.emulateMedia({ colorScheme: theme === "dark" ? "dark" : "light" });
  await page.goto(`/${locale}/gallery?theme=${theme}`);
  await page.waitForFunction((next) => document.documentElement.dataset.theme === next, theme);
}

async function readOutputs(page: Page): Promise<SpecimenReadings> {
  const screen = page.locator('[data-screen="brand-step"]');
  await hideDialogs(page);
  await screen.getByRole("tab").first().click();
  const label = await page.evaluate(() => {
    const content = document.querySelector('[data-specimen="label"]');
    if (!content) return { direction: null, marks: [] as { x: number; y: number; w: number; h: number }[] };
    const origin = content.getBoundingClientRect();
    const marks = [...content.querySelectorAll("[data-output-mark]")].map((node) => {
      const rect = node.getBoundingClientRect();
      return {
        x: Math.round(rect.left - origin.left),
        y: Math.round(rect.top - origin.top),
        w: Math.round(rect.width),
        h: Math.round(rect.height),
      };
    });
    return { direction: getComputedStyle(content).direction, marks };
  });
  await screen.getByRole("tab").nth(1).click();
  const sticker = await page.evaluate(() => {
    const content = document.querySelector('[data-specimen="sticker"]');
    if (!content) return { direction: null, marks: [] as { x: number; y: number; w: number; h: number }[] };
    const origin = content.getBoundingClientRect();
    const marks = [...content.querySelectorAll("[data-output-mark]")].map((node) => {
      const rect = node.getBoundingClientRect();
      return {
        x: Math.round(rect.left - origin.left),
        y: Math.round(rect.top - origin.top),
        w: Math.round(rect.width),
        h: Math.round(rect.height),
      };
    });
    return { direction: getComputedStyle(content).direction, marks };
  });
  const pinned = await page.evaluate(() => {
    function reading(content: Element | null) {
      if (!content) return { direction: null, marks: [] };
      const origin = content.getBoundingClientRect();
      const marks = [...content.querySelectorAll("[data-output-mark]")].map((node) => {
        const rect = node.getBoundingClientRect();
        return {
          x: Math.round(rect.left - origin.left),
          y: Math.round(rect.top - origin.top),
          w: Math.round(rect.width),
          h: Math.round(rect.height),
        };
      });
      return { direction: getComputedStyle(content).direction, marks };
    }
    const pinned = document.querySelector('[data-specimen="pinned-output"] [lang="en"]');
    const host = document.createElement("div");
    host.dataset.knownBad = "inherit-direction";
    const bad = document.createElement("div");
    bad.dataset.badContent = "";
    for (const label of ["Aa", "Bb"]) {
      const mark = document.createElement("span");
      mark.dataset.outputMark = label === "Aa" ? "lead" : "trail";
      mark.textContent = label;
      bad.appendChild(mark);
    }
    host.appendChild(bad);
    document.body.appendChild(host);
    return {
      pinned: reading(pinned),
      knownBad: reading(host.querySelector("[data-bad-content]")),
    };
  });
  return { ...pinned, label, sticker };
}

function sameOutput(left: OutputReading, right: OutputReading) {
  return left.direction === right.direction && JSON.stringify(left.marks) === JSON.stringify(right.marks);
}

test("tenant output does not mirror the interface", async ({ page }) => {
  const readings = new Map<string, SpecimenReadings>();
  for (const locale of GALLERY_LOCALES) {
    for (const theme of GALLERY_THEMES) {
      for (const width of GALLERY_WIDTHS) {
        await openGallery(page, locale, theme, width);
        readings.set(`${locale}-${theme}-${width}`, await readOutputs(page));
      }
    }
  }
  for (const theme of GALLERY_THEMES) {
    for (const width of GALLERY_WIDTHS) {
      const english = readings.get(`en-${theme}-${width}`);
      const arabic = readings.get(`ar-${theme}-${width}`);
      expect(english?.pinned.direction).toBe("ltr");
      expect(english?.pinned.marks.length).toBe(2);
      expect(sameOutput(english!.pinned, arabic!.pinned)).toBe(true);
      expect(english?.label.direction).toBe("ltr");
      expect(english?.label.marks.length).toBe(2);
      expect(sameOutput(english!.label, arabic!.label)).toBe(true);
      expect(english?.sticker.direction).toBe("ltr");
      expect(english?.sticker.marks.length).toBe(1);
      expect(sameOutput(english!.sticker, arabic!.sticker)).toBe(true);
      expect(sameOutput(english!.knownBad, arabic!.knownBad)).toBe(false);
    }
  }
});
