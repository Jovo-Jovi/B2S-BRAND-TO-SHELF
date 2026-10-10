// P03-T29. Local photographs for the design review. Tagged @design-review.
// The filename ends in .spec.ts so the browser tier loads it. playwright.config.ts
// does not load this file unless B2S_CAPTURE=1, and the browser workflow passes
// --grep-invert @design-review, so CI never runs it.
// One synthetic owner, torn down at the end. No product copy is changed.

import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { expect, test, type Locator, type Page } from "@playwright/test";
import sharp from "sharp";

import ar from "../../app/[locale]/dictionaries/ar.json";
import en from "../../app/[locale]/dictionaries/en.json";
import { createMember, memberPatch, memberToken, teardownSynthetic, type Member } from "./onboarding-members";

test.describe.configure({ mode: "serial" });

const OUT = join(process.cwd(), "docs", "review", "p03");
const QUALITY = 80;
const LIGHT = [
  ["en", 1280],
  ["en", 360],
  ["ar", 1280],
  ["ar", 360],
] as const;
const DARK = [
  ["en", 1280],
  ["ar", 1280],
] as const;

const BUSINESS_EN = "Dar Lumen";
const BUSINESS_AR = "دار لومن";
const ADDRESS_EN = "12 Courtyard Lane, Sample District";
const ADDRESS_AR = "12 حارة الفناء، حي النموذج";
const CONTACT = "studio@example.com";
const GUEST = "studio-guest@example.com";
const PRIMARY = "#1f6f5b";
const SECONDARY = "#c47b2b";
const ACCENT = "#5c4d7a";
const BACKGROUND = "#f3ecdf";
const GUIDELINE_TITLE_EN = "Quiet margins";
const GUIDELINE_TITLE_AR = "هوامش هادئة";
const GUIDELINE_BODY_EN = "Leave clear space around the mark on every side.";
const GUIDELINE_BODY_AR = "اترك فراغا واضحا حول العلامة من كل جانب.";

type Locale = "en" | "ar";
type Theme = "light" | "dark";
type Width = 360 | 1280;

type Shot = { file: string; note: string };

const taken: Shot[] = [];

function copyFor(locale: Locale) {
  return locale === "ar" ? ar.onboarding : en.onboarding;
}

function accessFor(locale: Locale) {
  return locale === "ar" ? ar.access : en.access;
}

function fileName(screen: string, state: string, locale: Locale, width: Width, theme: Theme): string {
  const dark = theme === "dark" ? "-dark" : "";
  return `${screen}-${state}-${locale}-${width}${dark}.jpg`;
}

async function clean(): Promise<void> {
  const counts = await teardownSynthetic();
  expect(counts).toEqual({ users: 0, members: 0, tenants: 0, objects: 0 });
}

test.beforeAll(clean);
test.afterEach(clean);
test.afterAll(clean);

async function hideOverlay(page: Page): Promise<void> {
  await page.evaluate(() => {
    document.querySelectorAll("nextjs-portal").forEach((node) => {
      if (node instanceof HTMLElement) node.style.setProperty("display", "none", "important");
    });
  });
}

async function press(page: Page, name: string): Promise<void> {
  await page.getByRole("button", { name, exact: true }).evaluate((button: HTMLButtonElement) => {
    button.click();
  });
}

async function shoot(
  page: Page,
  screen: string,
  state: string,
  locale: Locale,
  width: Width,
  theme: Theme,
  note: string,
): Promise<void> {
  await hideOverlay(page);
  await page.evaluate(() => document.fonts.ready);
  const file = fileName(screen, state, locale, width, theme);
  await page.screenshot({
    path: join(OUT, file),
    fullPage: true,
    type: "jpeg",
    quality: QUALITY,
    animations: "disabled",
  });
  taken.push({ file, note });
}

async function showSignIn(page: Page, locale: Locale, width: Width): Promise<void> {
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto(`/${locale}/sign-in`);
  await page.evaluate(() => {
    document.documentElement.dataset.theme = "light";
  });
  await expect(page.getByRole("tab", { name: accessFor(locale).signInHeading, exact: true })).toBeVisible();
}

function credentialForm(page: Page): Locator {
  return page.locator('[role="tabpanel"]:not([hidden]) form').filter({ has: page.locator('input[name="email"]') });
}

async function openWizard(page: Page, locale: Locale, theme: Theme, width: Width, screen: string): Promise<void> {
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ colorScheme: theme === "dark" ? "dark" : "light" });
  await page.goto(`/${locale}/onboarding/${screen}?theme=${theme}`);
  await page.waitForFunction((value) => document.documentElement.dataset.theme === value, theme);
}

async function saved(page: Page, locale: Locale): Promise<void> {
  const notice = page.getByRole("status");
  await expect(notice).toHaveAttribute("data-tone", "success");
  await expect(notice).toContainText(copyFor(locale).saved);
}

async function bilingual(page: Page, caption: string, locale: "en" | "ar", value: string, multiline: boolean): Promise<void> {
  const field = page.getByRole("group", { name: caption, exact: true });
  const box = field.locator(`[data-locale="${locale}"] ${multiline ? "textarea" : "input"}`);
  await box.fill(value);
}

async function mark(): Promise<Buffer> {
  // A PNG logo is accepted only when its shorter side is at least 1000 pixels.
  const paper = await sharp({
    create: { width: 440, height: 440, channels: 4, background: { r: 243, g: 236, b: 223, alpha: 1 } },
  })
    .png()
    .toBuffer();
  return sharp({
    create: { width: 1000, height: 1000, channels: 4, background: { r: 31, g: 111, b: 91, alpha: 1 } },
  })
    .composite([{ input: paper, gravity: "centre" }])
    .png()
    .toBuffer();
}

function indexBody(): string {
  const lines = [
    "# P03 design review",
    "",
    "Photographs of the screens as they are. Nothing on a screen was restyled or rewritten for this set.",
    "",
    "The business is invented for the review. It is not a real brand, and the address is not a real place. The light-ground mark is a generated square. Four colours were chosen: primary, secondary, accent and background. Foreground, muted and critical stay at the values the brand screen already shows, so the theme can be saved. All four typefaces are chosen. Company details are half filled until the completion shots. One guideline is filled in both languages.",
    "",
    `JPEG quality ${QUALITY}.`,
    "",
    "| File | State |",
    "|---|---|",
    ...taken.map((shot) => `| \`${shot.file}\` | ${shot.note} |`),
    "",
  ];
  return lines.join("\n");
}

test("@design-review photographs every onboarding screen", { tag: "@design-review" }, async ({ page }) => {
  test.setTimeout(3_000_000);
  page.setDefaultTimeout(120_000);
  page.setDefaultNavigationTimeout(180_000);
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
  const logo = await mark();

  for (const [locale, width] of LIGHT) {
    const access = accessFor(locale);
    await showSignIn(page, locale, width);
    await shoot(page, "sign-in", "tab", locale, width, "light", "Sign-in tab, light, before any credentials are submitted.");
    await page.getByRole("tab", { name: access.signUpHeading, exact: true }).evaluate((tab: HTMLElement) => {
      tab.click();
    });
    await expect(page.getByRole("button", { name: access.signUpSubmit, exact: true })).toBeVisible();
    await shoot(page, "sign-in", "create", locale, width, "light", "Create-account tab, light, empty.");
    await page.getByRole("tab", { name: access.signInHeading, exact: true }).evaluate((tab: HTMLElement) => {
      tab.click();
    });
    await expect(page.getByRole("button", { name: access.signInSubmit, exact: true })).toBeVisible();
    const form = credentialForm(page);
    await form.locator('input[name="email"]').fill(GUEST);
    await form.locator('input[name="password"]').fill("sample-pass-not-real");
    await form.getByRole("button", { name: access.signInSubmit, exact: true }).evaluate((button: HTMLButtonElement) => {
      button.click();
    });
    await expect(page).toHaveURL(/error=sign_in_refused/);
    await expect(page.locator('[data-tone="danger"][role="alert"]')).toContainText(access.sign_in_refused);
    await page.evaluate(() => {
      document.documentElement.dataset.theme = "light";
    });
    await shoot(page, "sign-in", "refused", locale, width, "light", "Sign-in tab showing the refusal Notice. The address used has no account.");
  }

  const member: Member = await createMember("review");
  const access = accessFor("en");
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/en/sign-in?next=/en/onboarding");
  const form = credentialForm(page);
  await form.locator('input[name="email"]').fill(member.email);
  await form.locator('input[name="password"]').fill(member.password);
  await form.getByRole("button", { name: access.signInSubmit, exact: true }).evaluate((button: HTMLButtonElement) => {
    button.click();
  });
  // The sign-in URL already contains next=/en/onboarding, so a substring
  // match would succeed before the form leaves the page.
  await page.waitForURL((url) => url.pathname === "/en/onboarding" || url.pathname.startsWith("/en/onboarding/"));

  for (const [locale, width] of LIGHT) {
    await openWizard(page, locale, "light", width, "welcome");
    await expect(page.locator("#welcome-name")).toBeVisible();
    await page.locator("#welcome-name").fill(locale === "ar" ? BUSINESS_AR : BUSINESS_EN);
    await shoot(page, "welcome", "named", locale, width, "light", "Welcome with the invented business name typed, language and currency at their presets. Not yet continued.");
  }

  await openWizard(page, "en", "light", 1280, "welcome");
  await page.locator("#welcome-name").fill(BUSINESS_EN);
  await press(page, en.onboarding.continue);
  await page.waitForURL(/\/brand/);

  for (const [locale, width] of LIGHT) {
    await openWizard(page, locale, "light", width, "brand");
    await expect(page.locator("[data-screen=brand]")).toBeVisible();
    await expect(page.locator("#role-primary")).toHaveValue("");
    await shoot(page, "brand", "empty", locale, width, "light", "Brand on arrival: no name, no mark, primary, secondary and accent unset. The four text colours show the screen's starting values.");
  }
  for (const [locale, width] of DARK) {
    await openWizard(page, locale, "dark", width, "brand");
    await expect(page.locator("[data-screen=brand]")).toBeVisible();
    await expect(page.locator("#role-primary")).toHaveValue("");
    await shoot(page, "brand", "empty", locale, width, "dark", "Brand on arrival, dark, 1280. Same empty state as the light arrival.");
  }

  await openWizard(page, "en", "light", 1280, "brand");
  await bilingual(page, en.onboarding.nameField, "en", BUSINESS_EN, false);
  await bilingual(page, en.onboarding.nameField, "ar", BUSINESS_AR, false);
  await page.locator("#role-primary").fill(PRIMARY);
  await page.locator("#role-secondary").fill(SECONDARY);
  await page.locator("#role-accent").fill(ACCENT);
  await page.locator("#role-background").fill(BACKGROUND);
  await press(page, en.onboarding.save);
  await saved(page, "en");
  await page.locator('[data-logo-ground="light"] input[type=file]').setInputFiles({
    name: "mark.png",
    mimeType: "image/png",
    buffer: logo,
  });
  await expect(page.locator('[data-ground="light"]').first()).toHaveAttribute("src", /.+/);

  for (const [locale, width] of LIGHT) {
    await openWizard(page, locale, "light", width, "brand");
    await expect(page.locator('[data-locale="en"] input').first()).toHaveValue(BUSINESS_EN);
    const lightMark = page.locator('[data-ground="light"]').first();
    await expect(lightMark).toHaveAttribute("src", /.+/);
    await expect.poll(() => lightMark.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
    await shoot(page, "brand", "filled", locale, width, "light", "Brand filled: both names, a light-ground mark, and four chosen colours. Foreground, muted and critical remain the screen's starting values. No dark-ground mark.");
  }
  for (const [locale, width] of DARK) {
    await openWizard(page, locale, "dark", width, "brand");
    await expect(page.locator('[data-locale="en"] input').first()).toHaveValue(BUSINESS_EN);
    const lightMark = page.locator('[data-ground="light"]').first();
    await expect(lightMark).toHaveAttribute("src", /.+/);
    await expect.poll(() => lightMark.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
    await shoot(page, "brand", "filled", locale, width, "dark", "Brand filled, dark, 1280. Same content as the light filled state.");
  }

  await openWizard(page, "en", "light", 1280, "brand");
  await press(page, en.onboarding.continue);
  await page.waitForURL(/\/typography/);
  await page.locator("#heading-arabic").selectOption("Cairo");
  await page.locator("#body-arabic").selectOption("Amiri");
  await page.locator("#heading-latin").selectOption("Fraunces");
  await page.locator("#body-latin").selectOption("Lora");
  await press(page, en.onboarding.save);
  await saved(page, "en");

  for (const [locale, width] of LIGHT) {
    await openWizard(page, locale, "light", width, "typography");
    await expect(page.locator("#heading-latin")).toHaveValue("Fraunces");
    await expect(page.locator("#heading-arabic")).toHaveValue("Cairo");
    await shoot(page, "typography", "chosen", locale, width, "light", "Typography with all four faces chosen: Cairo, Amiri, Fraunces and Lora.");
  }

  await openWizard(page, "en", "light", 1280, "typography");
  await press(page, en.onboarding.continue);
  await page.waitForURL(/\/company/);

  await bilingual(page, en.onboarding.legalName, "en", BUSINESS_EN, false);
  await bilingual(page, en.onboarding.tradingName, "en", "Lumen", false);
  await bilingual(page, en.onboarding.companyAddress, "en", ADDRESS_EN, true);
  await page.locator("#email").fill(CONTACT);
  await press(page, en.onboarding.save);
  await saved(page, "en");

  for (const [locale, width] of LIGHT) {
    const copy = copyFor(locale);
    await openWizard(page, locale, "light", width, "company");
    await expect(page.locator("#email")).toHaveValue(CONTACT);
    await shoot(page, "company", "partial", locale, width, "light", "Company half filled: English legal name, English trading name, English address and an example contact. Arabic legal name and address, tax and phone are empty.");
    await press(page, copy.continue);
    const summary = page.locator('[data-composition="WizardStep"] div[role="alert"]');
    await expect(summary).toBeVisible();
    await expect(summary).not.toBeEmpty();
    await shoot(page, "company", "errors", locale, width, "light", "Company after Continue, with the errors for the missing Arabic legal name and address.");
  }

  const token = await memberToken(member);
  await memberPatch(token, "onboarding_draft?archived_at=is.null", { resume_step: "guidelines" });
  await openWizard(page, "en", "light", 1280, "guidelines");
  await expect(page.locator("#guidelines")).toBeVisible();
  await press(page, en.onboarding.addGuideline);
  await page.locator('#guideline-1-title [data-locale="en"] input').fill(GUIDELINE_TITLE_EN);
  await page.locator('#guideline-1-title [data-locale="ar"] input').fill(GUIDELINE_TITLE_AR);
  await page.locator('#guideline-1-body [data-locale="en"] textarea').fill(GUIDELINE_BODY_EN);
  await page.locator('#guideline-1-body [data-locale="ar"] textarea').fill(GUIDELINE_BODY_AR);
  await press(page, en.onboarding.save);
  await saved(page, "en");

  for (const [locale, width] of LIGHT) {
    await openWizard(page, locale, "light", width, "guidelines");
    await expect(page.locator('#guideline-1-title [data-locale="en"] input')).toHaveValue(GUIDELINE_TITLE_EN);
    await shoot(page, "guidelines", "one", locale, width, "light", "Guidelines with one guideline filled in both languages.");
  }

  // Review stays closed until guidelines Continue advances the draft. Company is still half filled, so the needed list remains.
  await openWizard(page, "en", "light", 1280, "guidelines");
  await press(page, en.onboarding.continue);
  await page.waitForURL((url) => url.pathname.endsWith("/review"));

  for (const [locale, width] of LIGHT) {
    await openWizard(page, locale, "light", width, "review");
    await expect(page.locator("[data-needed]")).toBeVisible();
    await shoot(page, "review", "needed", locale, width, "light", "Review, with the list of what is still needed.");
  }
  for (const [locale, width] of DARK) {
    await openWizard(page, locale, "dark", width, "review");
    await expect(page.locator("[data-needed]")).toBeVisible();
    await shoot(page, "review", "needed", locale, width, "dark", "Review, dark, 1280, with the list of what is still needed.");
  }

  await openWizard(page, "en", "light", 1280, "company");
  await bilingual(page, en.onboarding.legalName, "ar", BUSINESS_AR, false);
  await bilingual(page, en.onboarding.companyAddress, "ar", ADDRESS_AR, true);
  await press(page, en.onboarding.continue);
  await page.waitForURL(/\/guidelines/);
  await press(page, en.onboarding.continue);
  await page.waitForURL(/\/review/);
  await press(page, en.onboarding.finish);
  await page.waitForURL(/\/complete/);
  await expect(page.locator("[data-screen=complete]")).toBeVisible();

  for (const [locale, width] of LIGHT) {
    await openWizard(page, locale, "light", width, "complete");
    await expect(page.locator("[data-screen=complete]")).toBeVisible();
    await shoot(page, "complete", "finished", locale, width, "light", "Completion after Finish setup, with the current brand in the preview.");
  }

  expect(taken).toHaveLength(54);
  await writeFile(join(OUT, "index.md"), indexBody(), "utf8");
});
