import { expect, test, type Page } from "@playwright/test";
import axe from "axe-core";

import { installConsoleGuard } from "./console-guard";

installConsoleGuard();

import ar from "../../app/[locale]/dictionaries/ar.json";
import en from "../../app/[locale]/dictionaries/en.json";
import {
  addViewer,
  createMember,
  markComplete,
  memberGet,
  memberPatch,
  memberToken,
  setSyntheticPrefix,
  teardownSynthetic,
  type Member,
} from "./onboarding-members";

setSyntheticPrefix(`zz-test-frame-${process.env.GITHUB_RUN_ID ?? "local"}-`);

test.describe.configure({ mode: "serial" });

const LOCALES = ["en", "ar"] as const;
const THEMES = ["light", "dark"] as const;
const WIDTHS = [360, 960, 1280] as const;
const PRIMARY = "#0b6e4f";
const SECONDARY = "#1d4e89";
const ACCENT = "#8a5a00";

type Locale = (typeof LOCALES)[number];
type Theme = (typeof THEMES)[number];
type Copy = (typeof en)["onboarding"];

function copyFor(locale: Locale): Copy {
  return locale === "ar" ? ar.onboarding : en.onboarding;
}

async function clean(): Promise<void> {
  const counts = await teardownSynthetic();
  expect(counts).toEqual({ users: 0, members: 0, tenants: 0, objects: 0 });
}

test.beforeAll(clean);
test.afterEach(clean);
test.afterAll(clean);

async function signIn(page: Page, locale: Locale, member: Member): Promise<void> {
  const access = locale === "ar" ? ar.access : en.access;
  await page.goto(`/${locale}/sign-in?next=/${locale}/onboarding`);
  const form = page.locator('[role="tabpanel"]:not([hidden]) form').filter({ has: page.locator('input[name="email"]') });
  await form.locator('input[name="email"]').fill(member.email);
  await form.locator('input[name="password"]').fill(member.password);
  await form.getByRole("button", { name: access.signInSubmit }).click();
  await page.waitForURL((url) => url.pathname === `/${locale}/onboarding` || url.pathname.startsWith(`/${locale}/onboarding/`));
  await page.waitForLoadState("load");
}

async function openScreen(page: Page, locale: Locale, theme: Theme, width: number, screen: string): Promise<void> {
  await page.setViewportSize({ width, height: 1200 });
  await page.emulateMedia({ colorScheme: theme === "dark" ? "dark" : "light" });
  const path = screen === "sign-in" ? `/${locale}/sign-in?theme=${theme}` : `/${locale}/onboarding/${screen}?theme=${theme}`;
  const response = await page.goto(path, { waitUntil: "load" });
  const status = response?.status() ?? 0;
  if (status >= 400) {
    throw new Error(`${path} returned ${status} at ${page.url()}`);
  }
  await expect(page.locator("h1")).toHaveCount(1);
  if (screen === "sign-in") {
    await page.evaluate((value) => {
      document.documentElement.dataset.theme = value;
    }, theme);
  }
  await page.waitForFunction((value) => document.documentElement.dataset.theme === value, theme, { timeout: 15_000 });
}

async function runAxe(page: Page): Promise<string[]> {
  await page.addScriptTag({ content: axe.source });
  return page.evaluate(async () => {
    const watched = ["color-contrast", "target-size", "landmark-one-main", "page-has-heading-one", "heading-order"];
    const engine = (window as unknown as {
      axe: {
        run: (context: { exclude: string[][] }, options: unknown) => Promise<{
          violations: Array<{ id: string; nodes?: Array<{ target?: string[]; html?: string }> }>;
          incomplete: Array<{ id: string; nodes?: Array<{ target?: string[]; html?: string }> }>;
        }>;
      };
    }).axe;
    const result = await engine.run(
      { exclude: [["[data-proof-content]"]] },
      { rules: Object.fromEntries(watched.map((id) => [id, { enabled: true }])) },
    );
    return [...result.violations, ...result.incomplete].filter((item) => watched.includes(item.id)).flatMap((item) => {
      const nodes = item.nodes ?? [];
      if (nodes.length === 0) return [item.id];
      return nodes.map((node) => `${item.id}: ${(node.target ?? []).join(" ")} ${(node.html ?? "").slice(0, 160)}`);
    });
  });
}

async function press(page: Page, name: string): Promise<void> {
  await page.getByRole("button", { name }).evaluate((button: HTMLButtonElement) => {
    button.click();
  });
}

async function assertOneHeading(page: Page, title: string): Promise<void> {
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText(title);
}

async function assertNoDisclaimer(page: Page, copy: Copy): Promise<void> {
  await expect(page.getByText(copy.fictionalSample)).toHaveCount(0);
}

async function assertReflow(page: Page): Promise<void> {
  const fits = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);
  expect(fits).toBe(true);
}

async function assertMirrored(page: Page, locale: Locale): Promise<void> {
  const placed = await page.evaluate(() => {
    const tile = document.querySelector("[data-glyph=mark]")?.getBoundingClientRect();
    const frame = document.querySelector("[data-composition=WizardStep], [data-composition=EntryFrame]")?.getBoundingClientRect();
    if (!tile || !frame) return null;
    const tileCenter = tile.left + tile.width / 2;
    const mid = frame.left + frame.width / 2;
    const dir = document.documentElement.dir;
    return dir === "rtl" ? tileCenter > mid : tileCenter < mid;
  });
  expect(placed).toBe(true);
  await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
}

async function assertActionVisible(page: Page, name: string): Promise<void> {
  const box = await page.getByRole("button", { name }).boundingBox();
  const viewport = page.viewportSize();
  expect(box).toBeTruthy();
  expect(viewport).toBeTruthy();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y + box!.height).toBeLessThanOrEqual((viewport?.height ?? 0) + 1);
}

async function assertPreviewStays(page: Page): Promise<void> {
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const box = await page.locator('[data-composition="PreviewPanel"]').boundingBox();
  expect(box).toBeTruthy();
  expect(box!.y).toBeGreaterThan(0);
  expect(box!.y).toBeLessThan(160);
}

async function assertNameSizes(page: Page): Promise<void> {
  const sizes = await page.evaluate(() => {
    function read(lang: string): { size: number; width: number } {
      const node = document.querySelector(`[data-specimen="label"] [lang="${lang}"][data-part="name"], [data-specimen="label"] [lang="${lang}"][data-part="name-other"]`);
      const label = document.querySelector('[data-specimen="label"]');
      return {
        size: node ? Number.parseFloat(getComputedStyle(node).fontSize) : 0,
        width: label ? label.getBoundingClientRect().width : 0,
      };
    }
    const arabic = read("ar");
    const english = read("en");
    return { arabic: arabic.size, english: english.size, width: arabic.width };
  });
  expect(sizes.arabic, JSON.stringify(sizes)).toBeGreaterThan(0);
  expect(sizes.english).toBeGreaterThan(0);
  expect(sizes.arabic).toBeGreaterThanOrEqual(sizes.english);
}

async function plantFailures(page: Page, copy: Copy): Promise<void> {
  await page.evaluate((sample) => {
    const heading = document.createElement("h1");
    heading.id = "plant-heading";
    heading.textContent = "plant";
    document.body.append(heading);
    const note = document.createElement("p");
    note.id = "plant-disclaimer";
    note.textContent = sample;
    document.body.append(note);
  }, copy.fictionalSample);
  let headingFailed = false;
  let disclaimerFailed = false;
  try {
    await expect(page.locator("h1")).toHaveCount(1, { timeout: 1_000 });
  } catch {
    headingFailed = true;
  }
  try {
    await expect(page.getByText(copy.fictionalSample)).toHaveCount(0, { timeout: 1_000 });
  } catch {
    disclaimerFailed = true;
  }
  expect(headingFailed).toBe(true);
  expect(disclaimerFailed).toBe(true);
  await page.locator("#plant-heading").evaluate((node) => node.remove());
  await page.locator("#plant-disclaimer").evaluate((node) => node.remove());
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByText(copy.fictionalSample)).toHaveCount(0);
}

test("entry frame keeps one heading in every combination", async ({ page }) => {
  test.setTimeout(240_000);
  for (const locale of LOCALES) {
    const copy = copyFor(locale);
    for (const theme of THEMES) {
      for (const width of WIDTHS) {
        await openScreen(page, locale, theme, width, "sign-in");
        await assertOneHeading(page, copy.mark);
        await assertNoDisclaimer(page, copy);
        await assertReflow(page);
        await assertMirrored(page, locale);
        await expect(page.getByText(copy.tagline)).toBeVisible();
        expect(await runAxe(page)).toEqual([]);
      }
    }
  }
});

test("the wizard frame holds in every combination", async ({ page, browser }) => {
  test.setTimeout(600_000);
  for (const locale of LOCALES) {
    const copy = copyFor(locale);
    const member = await createMember(`frame-${locale}`);
    await signIn(page, locale, member);
    let planted = false;

    for (const theme of THEMES) {
      for (const width of WIDTHS) {
        await openScreen(page, locale, theme, width, "welcome");
        await assertOneHeading(page, copy.welcomeTitle);
        await assertNoDisclaimer(page, copy);
        await assertReflow(page);
        await assertMirrored(page, locale);
        await expect(page.locator("[data-composition=WizardStep] ol")).toHaveCount(0);
        await assertActionVisible(page, copy.continue);
        expect(await runAxe(page)).toEqual([]);
      }
    }

    await openScreen(page, locale, "light", 1280, "welcome");
    await page.getByRole("radio", { name: copy.localeEn }).check();
    await page.locator("#welcome-name").fill(`zz-test-frame-${locale}-${member.id.slice(0, 8)}`);
    await press(page, copy.continue);
    await page.waitForURL(/\/brand/);
    await page.locator('[data-locale="en"] input').fill("Northwind");
    await page.locator('[data-locale="ar"] input').fill("شمال");
    await page.locator("#role-primary").fill(PRIMARY);
    await page.locator("#role-secondary").fill(SECONDARY);
    await page.locator("#role-accent").fill(ACCENT);
    await press(page, copy.save);
    await expect(page.getByRole("status")).toContainText(copy.saved);

    for (const theme of THEMES) {
      for (const width of WIDTHS) {
        await openScreen(page, locale, theme, width, "brand");
        await assertOneHeading(page, copy.brandTitle);
        await assertNoDisclaimer(page, copy);
        await assertReflow(page);
        await assertMirrored(page, locale);
        await expect(page.locator('[data-step="brand"] [aria-current="step"]')).toHaveCount(1);
        await expect(page.locator('[data-step="typography"][data-step-state="upcoming"] a')).toHaveCount(0);
        await assertActionVisible(page, copy.continue);
        await assertNameSizes(page);
        if (width === 1280) await assertPreviewStays(page);
        if (width < 960) await expect(page.locator("[data-composition=WizardStep] ol")).toBeHidden();
        else await expect(page.locator("[data-composition=WizardStep] ol")).toBeVisible();
        expect(await runAxe(page)).toEqual([]);
        if (!planted) {
          await plantFailures(page, copy);
          planted = true;
        }
      }
    }

    const token = await memberToken(member);
    await memberPatch(token, "onboarding_draft?archived_at=is.null", { resume_step: "typography" });
    for (const theme of THEMES) {
      for (const width of WIDTHS) {
        await openScreen(page, locale, theme, width, "typography");
        await assertOneHeading(page, copy.typefaceTitle);
        await assertNoDisclaimer(page, copy);
        await expect(page.locator('[data-step="brand"][data-step-state="completed"] a')).toHaveCount(1);
        await expect(page.locator('[data-step="typography"] [aria-current="step"]')).toHaveCount(1);
        await expect(page.locator('[data-step="company"][data-step-state="upcoming"] a')).toHaveCount(0);
        await expect(page.locator('[data-step="review"][data-step-state="upcoming"]')).toHaveCount(1);
        await assertActionVisible(page, copy.continue);
        expect(await runAxe(page)).toEqual([]);
      }
    }

    await memberPatch(token, "onboarding_draft?archived_at=is.null", { resume_step: "company" });
    await openScreen(page, locale, "dark", 960, "company");
    await assertOneHeading(page, copy.companyTitle);
    await assertNoDisclaimer(page, copy);
    await assertActionVisible(page, copy.continue);

    await memberPatch(token, "onboarding_draft?archived_at=is.null", { resume_step: "guidelines" });
    await openScreen(page, locale, "light", 360, "guidelines");
    await assertOneHeading(page, copy.guidelinesTitle);
    await assertNoDisclaimer(page, copy);
    await assertActionVisible(page, copy.continue);

    await memberPatch(token, "onboarding_draft?archived_at=is.null", { resume_step: "review" });
    await openScreen(page, locale, "dark", 1280, "review");
    await assertOneHeading(page, copy.reviewTitle);
    await assertNoDisclaimer(page, copy);
    await assertPreviewStays(page);
    await assertActionVisible(page, copy.finish);

    const memberships = await memberGet<{ tenant_id: string }[]>(token, "membership?select=tenant_id");
    await markComplete(memberships[0]!.tenant_id);
    for (const theme of THEMES) {
      for (const width of WIDTHS) {
        await openScreen(page, locale, theme, width, "complete");
        await assertOneHeading(page, copy.completeTitle);
        await assertNoDisclaimer(page, copy);
        await expect(page.locator('[data-step-state="completed"] a')).toHaveCount(5);
        await expect(page.locator('[aria-current="step"]')).toHaveCount(0);
        await expect(page.getByRole("button", { name: copy.finish })).toHaveCount(0);
        if (width < 960) await expect(page.locator("[data-composition=WizardStep] ol")).toBeHidden();
        else await expect(page.locator("[data-composition=WizardStep] ol")).toBeVisible();
        expect(await runAxe(page)).toEqual([]);
      }
    }
  }

  const owner = await createMember("frame-owner");
  await page.context().clearCookies();
  await signIn(page, "en", owner);
  await openScreen(page, "en", "light", 1280, "welcome");
  await page.locator("#welcome-name").fill(`zz-test-frame-owner-${owner.id.slice(0, 8)}`);
  await press(page, en.onboarding.continue);
  await page.waitForURL(/\/brand/);
  const ownerToken = await memberToken(owner);
  const owned = await memberGet<{ tenant_id: string }[]>(ownerToken, "membership?select=tenant_id");
  const viewer = await createMember("frame-viewer");
  await addViewer(owned[0]!.tenant_id, viewer.id);
  const context = await browser.newContext();
  const viewerPage = await context.newPage();
  await signIn(viewerPage, "ar", viewer);
  await openScreen(viewerPage, "ar", "dark", 360, "brand");
  await assertOneHeading(viewerPage, ar.onboarding.pendingTitle);
  await assertNoDisclaimer(viewerPage, ar.onboarding);
  await expect(viewerPage.locator("[data-composition=WizardStep]")).toHaveCount(0);
  await expect(viewerPage.locator("[data-composition=EntryFrame]")).toHaveCount(1);
  expect(await runAxe(viewerPage)).toEqual([]);
  await context.close();
});
