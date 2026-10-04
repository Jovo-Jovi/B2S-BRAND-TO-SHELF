import { expect, test, type Page } from "@playwright/test";
import axe from "axe-core";

import ar from "../../app/[locale]/dictionaries/ar.json";
import en from "../../app/[locale]/dictionaries/en.json";
import {
  addViewer,
  createMember,
  markComplete,
  memberGet,
  memberRpc,
  memberToken,
  png,
  svg,
  teardownSynthetic,
  type Member,
} from "./onboarding-members";

test.describe.configure({ mode: "serial" });
test.setTimeout(180_000);

const LOCALES = ["en", "ar"] as const;
const THEMES = ["light", "dark"] as const;
const WIDTHS = [360, 1280] as const;
const PRIMARY = "#0b6e4f";
const SECONDARY = "#1d4e89";
const ACCENT = "#8a5a00";

type Copy = (typeof en)["onboarding"];

function copyFor(locale: "en" | "ar"): Copy {
  return locale === "ar" ? ar.onboarding : en.onboarding;
}

async function clean(): Promise<void> {
  const counts = await teardownSynthetic();
  expect(counts).toEqual({ users: 0, members: 0, tenants: 0, objects: 0 });
}

test.beforeAll(clean);
test.afterEach(clean);
test.afterAll(clean);

async function signIn(page: Page, locale: "en" | "ar", member: Member): Promise<void> {
  const access = locale === "ar" ? ar.access : en.access;
  await page.goto(`/${locale}/sign-in?next=/${locale}/onboarding`);
  const form = page.locator("form").first();
  await form.locator('input[name="email"]').fill(member.email);
  await form.locator('input[name="password"]').fill(member.password);
  await form.getByRole("button", { name: access.signInSubmit }).click();
  await page.waitForURL((url) => {
    const path = url.pathname;
    return path === `/${locale}/onboarding` || path.startsWith(`/${locale}/onboarding/`);
  });
}

async function openThemed(page: Page, locale: "en" | "ar", theme: "light" | "dark", width: number, screen: string): Promise<void> {
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ colorScheme: theme === "dark" ? "dark" : "light" });
  await page.goto(`/${locale}/onboarding/${screen}?theme=${theme}`);
  await page.waitForFunction((value) => document.documentElement.dataset.theme === value, theme);
}

async function runAxe(page: Page): Promise<string[]> {
  await page.addScriptTag({ content: axe.source });
  return page.evaluate(async () => {
    const watched = ["color-contrast", "target-size", "landmark-one-main", "page-has-heading-one", "heading-order"];
    const engine = (window as unknown as {
      axe: {
        run: (node: Document, options: unknown) => Promise<{
          violations: Array<{ id: string }>;
          incomplete: Array<{ id: string }>;
        }>;
      };
    }).axe;
    const result = await engine.run(document, {
      rules: {
        "color-contrast": { enabled: true },
        "target-size": { enabled: true },
        "landmark-one-main": { enabled: true },
        "page-has-heading-one": { enabled: true },
        "heading-order": { enabled: true },
      },
      exclude: [["[data-proof-content]"]],
    });
    return [...result.violations, ...result.incomplete]
      .filter((item) => watched.includes(item.id))
      .flatMap((item) => {
        const nodes = (item as { nodes?: Array<{ target?: string[]; html?: string }> }).nodes ?? [];
        if (nodes.length === 0) return [item.id];
        return nodes.map((node) => `${item.id}: ${(node.target ?? []).join(" ")} ${(node.html ?? "").slice(0, 160)}`);
      });
  });
}

function errorSummary(page: Page) {
  return page.locator('[data-composition="WizardStep"] div[role="alert"]');
}

async function press(page: Page, name: string): Promise<void> {
  await page.getByRole("button", { name }).evaluate((button: HTMLButtonElement) => {
    button.click();
  });
}

async function hold(page: Page, locale: "en" | "ar", screen: string): Promise<void> {
  const violations = await runAxe(page);
  expect(violations, screen).toEqual([]);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, screen).toBeLessThanOrEqual(1);
  await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
  const proof = page.locator("[data-proof-content]");
  if ((await proof.count()) > 0) {
    await expect(proof.first()).toHaveAttribute("dir", "ltr");
  }
}

test("a signed-out person is sent to sign-in and back to the step", async ({ page }) => {
  await page.goto("/en/onboarding/brand");
  await expect(page).toHaveURL(/\/en\/sign-in\?/);
  expect(decodeURIComponent(page.url())).toContain("/en/onboarding/brand");
});

test("the ownership cap is named on welcome", async ({ page }) => {
  const member = await createMember("cap");
  const token = await memberToken(member);
  for (let index = 0; index < 3; index += 1) {
    await memberRpc(token, "provision_tenant", {
      p_name: `zz-test-wiz-cap-${index}-${member.id.slice(0, 8)}`,
      p_base_currency: "EGP",
      p_default_locale: "en",
    });
  }
  await signIn(page, "en", member);
  await openThemed(page, "en", "light", 1280, "welcome");
  await page.locator("#welcome-name").fill(`zz-test-wiz-cap-again-${member.id.slice(0, 8)}`);
  await page.getByRole("button", { name: en.onboarding.continue }).click();
  await expect(errorSummary(page)).toContainText(en.onboarding.cap);
  await expect(page).toHaveURL(/\/welcome/);
});

test("a member who is not the owner sees the pending screen", async ({ page, browser }) => {
  const owner = await createMember("owner");
  await signIn(page, "en", owner);
  await openThemed(page, "en", "light", 1280, "welcome");
  await page.locator("#welcome-name").fill(`zz-test-wiz-owner-${owner.id.slice(0, 8)}`);
  await page.getByRole("button", { name: en.onboarding.continue }).click();
  await page.waitForURL(/\/brand/);
  const token = await memberToken(owner);
  const memberships = await memberGet<{ tenant_id: string }[]>(token, "membership?select=tenant_id");
  const tenantId = memberships[0]?.tenant_id;
  expect(tenantId).toBeTruthy();
  const viewer = await createMember("viewer");
  await addViewer(tenantId!, viewer.id);
  const context = await browser.newContext();
  const viewerPage = await context.newPage();
  await signIn(viewerPage, "en", viewer);
  await viewerPage.goto("/en/onboarding/brand");
  await expect(viewerPage.locator("[data-screen=pending]")).toBeVisible();
  await expect(viewerPage.getByText(en.onboarding.pendingBody)).toBeVisible();
  await expect(viewerPage.locator('[data-composition="WizardStep"]')).toHaveCount(0);
  await context.close();
});

test("a tenant with a current profile and no draft is sent to the completion route", async ({ page }) => {
  const member = await createMember("done");
  await signIn(page, "en", member);
  await openThemed(page, "en", "light", 1280, "welcome");
  await page.locator("#welcome-name").fill(`zz-test-wiz-done-${member.id.slice(0, 8)}`);
  await page.getByRole("button", { name: en.onboarding.continue }).click();
  await page.waitForURL(/\/brand/);
  const token = await memberToken(member);
  await memberRpc(token, "save_brand_name", { p_name_en: "North", p_name_ar: "شمال" });
  const memberships = await memberGet<{ tenant_id: string }[]>(token, "membership?select=tenant_id");
  await markComplete(memberships[0]!.tenant_id);
  await page.goto("/en/onboarding/brand");
  await expect(page).toHaveURL(/\/onboarding\/complete/);
  await expect(page.locator("[data-interim=complete]")).toContainText(en.onboarding.completeStubBody);
});

for (const locale of LOCALES) {
  for (const theme of THEMES) {
    for (const width of WIDTHS) {
      test(`wizard ${locale} ${theme} ${width}`, async ({ page }) => {
        const copy = copyFor(locale);
        const member = await createMember(`${locale}-${theme}-${width}`);
        const business = `zz-test-wiz-${locale}-${theme}-${width}`;
        await signIn(page, locale, member);
        await openThemed(page, locale, theme, width, "brand");
        await expect(page).toHaveURL(/\/welcome/);
        await hold(page, locale, "welcome");
        await page.screenshot({ path: `test-results/visual/onboarding-${locale}-${theme}-${width}-welcome.png`, fullPage: true });

        await page.getByRole("radio", { name: copy.localeEn }).check();
        await page.locator("#welcome-name").fill(business);
        await press(page, copy.continue);
        await page.waitForURL(/\/brand/);
        await expect(page.locator("[data-screen=brand]")).toBeVisible();

        await page.goto(`/${locale}/onboarding/typography?theme=${theme}`);
        await expect(page).toHaveURL(/\/brand/);

        await press(page, copy.continue);
        const alert = errorSummary(page);
        await expect(alert).toContainText(copy.missingName.replace("{locale}", copy.localeEn));
        await expect(alert).toContainText(copy.missingName.replace("{locale}", copy.localeAr));
        for (const role of [copy.rolePrimary, copy.roleSecondary, copy.roleAccent]) {
          await expect(alert).toContainText(copy.missingRole.replace("{role}", role));
        }

        await page.locator('[data-locale="en"] input').fill("Northwind");
        await page.locator('[data-locale="ar"] input').fill("شمال");
        await page.locator("#role-primary").fill(PRIMARY);
        await press(page, copy.save);
        await expect(page.getByRole("status")).toContainText(copy.saved);
        await page.reload();
        await page.waitForFunction((value) => document.documentElement.dataset.theme === value, theme);
        await expect(page.locator('[data-locale="en"] input')).toHaveValue("Northwind");
        await expect(page.locator('[data-locale="ar"] input')).toHaveValue("شمال");
        await expect(page.locator("#role-primary")).toHaveValue(PRIMARY);
        await expect(page.locator("#role-secondary")).toHaveValue("");

        await page.locator("#role-secondary").fill(SECONDARY);
        await page.locator("#role-accent").fill(ACCENT);
        await press(page, copy.save);
        await expect(page.getByRole("status")).toContainText(copy.saved);
        const token = await memberToken(member);
        const draftColours = await memberGet<{ role: string; archived_at: string | null }[]>(
          token,
          "onboarding_draft_color?select=role,archived_at",
        );
        expect(draftColours.length).toBeGreaterThan(0);
        expect(draftColours.every((row) => row.archived_at)).toBe(true);
        const themes = await memberGet<{ id: string }[]>(token, "brand_theme?select=id");
        expect(themes.length).toBeGreaterThan(0);

        const before = await memberGet<{ id: string }[]>(token, "media_asset?select=id");
        await page.locator('[data-logo-ground="light"] input[type=file]').setInputFiles({
          name: "mark.png",
          mimeType: "image/png",
          buffer: png(1000, 1000),
        });
        await expect(page.locator('[data-ground="light"]').first()).toHaveAttribute("src", /.+/);
        await page.locator('[data-logo-ground="dark"] input[type=file]').setInputFiles({
          name: "mark.svg",
          mimeType: "image/svg+xml",
          buffer: svg("<circle r='1'/>"),
        });
        await expect(page.locator('[data-ground="dark"]').first()).toHaveAttribute("src", /.+/);
        const firstLight = await memberGet<{ media_asset_id: string }[]>(
          token,
          "logo_variant?select=media_asset_id&kind=eq.full&ground=eq.light",
        );
        const previousLight = await page.locator('[data-ground="light"]').first().getAttribute("src");
        const replaced = page.waitForResponse(
          (response) => response.url().includes("/onboarding/brand") && response.request().method() === "POST",
        );
        await page.locator('[data-logo-ground="light"] input[type=file]').setInputFiles({
          name: "mark-2.png",
          mimeType: "image/png",
          buffer: png(1200, 1200),
        });
        await replaced;
        await expect(page.locator('[data-ground="light"]').first()).not.toHaveAttribute("src", previousLight ?? "");
        const secondLight = await memberGet<{ media_asset_id: string }[]>(
          token,
          "logo_variant?select=media_asset_id&kind=eq.full&ground=eq.light&archived_at=is.null",
        );
        expect(secondLight[0]?.media_asset_id).not.toBe(firstLight[0]?.media_asset_id);
        const archived = await memberGet<{ archived_at: string | null }[]>(
          token,
          `media_asset?select=archived_at&id=eq.${firstLight[0]!.media_asset_id}`,
        );
        expect(archived[0]?.archived_at).toBeTruthy();
        const assets = await memberGet<{ id: string }[]>(token, "media_asset?select=id");
        await page.locator('[data-logo-ground="dark"] input[type=file]').setInputFiles({
          name: "script.svg",
          mimeType: "image/svg+xml",
          buffer: svg("<script>alert(1)</script>"),
        });
        await expect(errorSummary(page)).toContainText(copy.logoActive);
        const after = await memberGet<{ id: string }[]>(token, "media_asset?select=id");
        expect(after.length).toBe(assets.length);
        expect(after.length).toBeGreaterThan(before.length);

        await hold(page, locale, "brand");
        await page.screenshot({ path: `test-results/visual/onboarding-${locale}-${theme}-${width}-brand.png`, fullPage: true });
        await press(page, copy.continue);
        await page.waitForURL(/\/typography/);
        await page.goto(`/${locale}/onboarding/company?theme=${theme}`);
        await expect(page).toHaveURL(/\/typography/);

        await page.locator("#heading-arabic").selectOption("Cairo");
        await page.locator("#body-arabic").selectOption("Amiri");
        await page.locator("#heading-latin").selectOption("Fraunces");
        await page.locator("#body-latin").selectOption("Lora");
        await press(page, copy.save);
        await expect(page.getByRole("status")).toContainText(copy.saved);
        await page.reload();
        await expect(page.locator("#heading-latin")).toHaveValue("Fraunces");
        const family = await page.locator('[data-part="name"]').first().evaluate((node) => getComputedStyle(node).fontFamily);
        expect(family.toLowerCase()).toContain("fraunces");

        const goingBack = page.waitForURL(/\/brand/);
        await press(page, copy.back);
        await goingBack;
        await expect(page.locator('[data-locale="en"] input')).toHaveValue("Northwind");
        await expect(page.locator("#role-primary")).toHaveValue(PRIMARY);
        await press(page, copy.continue);
        await page.waitForURL(/\/typography/);
        await expect(page.locator("#heading-latin")).toHaveValue("Fraunces");
        await hold(page, locale, "typography");
        await page.screenshot({ path: `test-results/visual/onboarding-${locale}-${theme}-${width}-typography.png`, fullPage: true });

        await press(page, copy.continue);
        await page.waitForURL(/\/company/);
        await expect(page.locator("[data-interim=company]")).toContainText(copy.companyStubBody);
        await hold(page, locale, "company");
        await page.screenshot({ path: `test-results/visual/onboarding-${locale}-${theme}-${width}-company.png`, fullPage: true });
      });
    }
  }
}
