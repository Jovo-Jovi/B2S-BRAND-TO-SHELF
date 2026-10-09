import { randomUUID } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";
import axe from "axe-core";

import { installConsoleGuard } from "./console-guard";

installConsoleGuard();

import ar from "../../app/[locale]/dictionaries/ar.json";
import en from "../../app/[locale]/dictionaries/en.json";
import { rulesFromCompleteError } from "../../features/onboarding/completeness";
import { fillPattern, formatCount } from "../../lib/locale/format-number";
import {
  addViewer,
  createMember,
  markComplete,
  memberGet,
  memberPatch,
  memberRpc,
  memberRpcResult,
  memberToken,
  png,
  svg,
  teardownSynthetic,
  PREFIX,
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
  const form = page.locator('[role="tabpanel"]:not([hidden]) form').filter({ has: page.locator('input[name="email"]') });
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

async function expectSaved(page: Page, copy: Copy): Promise<void> {
  const notice = page.getByRole("status");
  await expect(notice).toHaveAttribute("data-tone", "success");
  await expect(notice).toHaveAttribute("aria-live", "polite");
  await expect(notice).toContainText(copy.saved);
  await expect(notice).not.toBeFocused();
  const tookFocus = await notice.evaluate((element) => element.contains(document.activeElement));
  expect(tookFocus).toBe(false);
}

async function chooseColour(page: Page, id: string, value: string): Promise<void> {
  const chooser = page.locator("[data-variant]").filter({ has: page.locator(`#${id}`) }).locator('input[type="color"]');
  await expect(chooser).toHaveCount(1);
  await chooser.fill(value);
  await expect(page.locator(`#${id}`)).toHaveValue(value);
}

function raisedRules(body: string): string[] {
  let message = body;
  try {
    const parsed = JSON.parse(body) as { message?: string };
    if (parsed.message) message = parsed.message;
  } catch {
    message = body;
  }
  return (rulesFromCompleteError(message) ?? []).sort();
}

async function visibleRules(page: Page, selector: string): Promise<string[]> {
  const rules = await page.locator(selector).evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("data-rule") ?? "").filter((rule) => rule.length > 0),
  );
  return rules.sort();
}

async function profileId(token: string): Promise<string> {
  const profiles = await memberGet<{ id: string }[]>(token, "brand_profile?select=id&order=version.desc&limit=1");
  const id = profiles[0]?.id;
  if (!id) throw new Error("the synthetic member has no brand profile");
  return id;
}

async function hold(page: Page, locale: "en" | "ar", screen: string): Promise<void> {
  const violations = await runAxe(page);
  expect(violations, screen).toEqual([]);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, screen).toBeLessThanOrEqual(1);
  await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
  await expect(page.getByRole("button", { name: copyFor(locale).signOut })).toBeVisible();
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
  await press(page, en.onboarding.continue);
  await expect(errorSummary(page)).toContainText(en.onboarding.cap, { timeout: 60_000 });
  await expect(page).toHaveURL(/\/welcome/);
});

test("a member who is not the owner sees the pending screen", async ({ page, browser }) => {
  const owner = await createMember("owner");
  await signIn(page, "en", owner);
  await openThemed(page, "en", "light", 1280, "welcome");
  await page.locator("#welcome-name").fill(`zz-test-wiz-owner-${owner.id.slice(0, 8)}`);
  await press(page, en.onboarding.continue);
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
  await expect(viewerPage.getByRole("button", { name: en.onboarding.signOut })).toBeVisible();
  await expect(viewerPage.locator('[data-composition="WizardStep"]')).toHaveCount(0);
  await context.close();
});

test("a tenant with a current profile and no draft is sent to the completion route", async ({ page }) => {
  const member = await createMember("done");
  await signIn(page, "en", member);
  await openThemed(page, "en", "light", 1280, "welcome");
  await page.locator("#welcome-name").fill(`zz-test-wiz-done-${member.id.slice(0, 8)}`);
  await press(page, en.onboarding.continue);
  await page.waitForURL(/\/brand/);
  const token = await memberToken(member);
  await memberRpc(token, "save_brand_name", { p_name_en: "North", p_name_ar: "شمال" });
  const memberships = await memberGet<{ tenant_id: string }[]>(token, "membership?select=tenant_id");
  await markComplete(memberships[0]!.tenant_id);
  await page.goto("/en/onboarding/brand");
  await expect(page).toHaveURL(/\/onboarding\/complete/);
  await expect(page.locator("[data-screen=complete]")).toContainText(en.onboarding.completeBody);
});

for (const locale of LOCALES) {
  for (const theme of THEMES) {
    for (const width of WIDTHS) {
      test(`wizard ${locale} ${theme} ${width}`, async ({ page }) => {
        test.setTimeout(360_000);
        const copy = copyFor(locale);
        const member = await createMember(`${locale}-${theme}-${width}`);
        const business = `zz-test-wiz-${locale}-${theme}-${width}`;
        await signIn(page, locale, member);
        await openThemed(page, locale, theme, width, "brand");
        await expect(page).toHaveURL(/\/welcome/);
        await expect(page.getByRole("button", { name: copy.continue })).toHaveCount(1);
        await expect(page.getByRole("button", { name: copy.back })).toHaveCount(0);
        await expect(page.getByRole("button", { name: copy.save })).toHaveCount(0);
        await expect(page.getByRole("button", { name: copy.help })).toHaveCount(0);
        await hold(page, locale, "welcome");
        await page.screenshot({ path: `test-results/visual/onboarding-${locale}-${theme}-${width}-welcome.png`, fullPage: true });

        await page.getByRole("radio", { name: copy.localeEn }).check();
        await page.locator("#welcome-name").fill(business);
        await press(page, copy.continue);
        await page.waitForURL(/\/brand/);
        await expect(page.locator("[data-screen=brand]")).toBeVisible();
        await expect(page.getByRole("button", { name: copy.back })).toHaveCount(0);
        await expect(page.getByRole("button", { name: copy.save })).toHaveCount(1);
        await expect(page.getByRole("button", { name: copy.help })).toHaveCount(0);

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
        await expectSaved(page, copy);
        await page.reload();
        await page.waitForFunction((value) => document.documentElement.dataset.theme === value, theme);
        await expect(page.locator('[data-locale="en"] input')).toHaveValue("Northwind");
        await expect(page.locator('[data-locale="ar"] input')).toHaveValue("شمال");
        await expect(page.locator("#role-primary")).toHaveValue(PRIMARY);
        await expect(page.locator("#role-secondary")).toHaveValue("");

        await page.locator("#role-secondary").fill(SECONDARY);
        await page.locator("#role-accent").fill(ACCENT);
        await press(page, copy.save);
        await expectSaved(page, copy);
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
        await expectSaved(page, copy);
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
        await expect(page.locator("#legal-name")).toBeVisible();
        await expect(page.getByRole("button", { name: copy.back })).toHaveCount(1);
        await expect(page.getByRole("button", { name: copy.save })).toHaveCount(1);
        await expect(page.getByRole("button", { name: copy.help })).toHaveCount(0);
        await hold(page, locale, "company");
        await page.screenshot({ path: `test-results/visual/onboarding-${locale}-${theme}-${width}-company.png`, fullPage: true });

        await memberPatch(token, "onboarding_draft?archived_at=is.null", { resume_step: "review" });
        await page.goto(`/${locale}/onboarding/guidelines?theme=${theme}`);
        await expect(page.locator("#guidelines")).toBeVisible();
        await expect(page.getByRole("button", { name: copy.help })).toHaveCount(0);
        await hold(page, locale, "guidelines");
        await page.screenshot({ path: `test-results/visual/onboarding-${locale}-${theme}-${width}-guidelines.png`, fullPage: true });
        await page.goto(`/${locale}/onboarding/review?theme=${theme}`);
        await expect(page.locator("[data-needed]")).toBeVisible();
        await expect(page.getByRole("button", { name: copy.finish })).toHaveCount(1);
        await expect(page.getByRole("button", { name: copy.help })).toHaveCount(0);
        await hold(page, locale, "review");
        await page.screenshot({ path: `test-results/visual/onboarding-${locale}-${theme}-${width}-review.png`, fullPage: true });

        const id = await profileId(token);
        await memberRpc(token, "save_legal_entity", {
          p_legal_name_en: "Northwind LLC",
          p_legal_name_ar: "Northwind LLC",
          p_trading_name_en: "",
          p_trading_name_ar: "",
          p_registered_address_en: "1 Street",
          p_registered_address_ar: "2 Street",
          p_tax_registration_number: "",
          p_contact_email: "",
          p_contact_phone: "",
        });
        await memberRpc(token, "complete_onboarding", { p_profile_id: id });
        await page.goto(`/${locale}/onboarding/complete?theme=${theme}`);
        await expect(page.locator("[data-screen=complete]")).toContainText(copy.completeBody);
        await expect(page.getByRole("button", { name: copy.help })).toHaveCount(0);
        await hold(page, locale, "complete");
        await page.screenshot({ path: `test-results/visual/onboarding-${locale}-${theme}-${width}-complete.png`, fullPage: true });
        await page.goto(`/${locale}/onboarding/brand?theme=${theme}`);
        await expect(page).toHaveURL(/\/onboarding\/complete/);
      });
    }
  }
}

async function returnTo(page: Page, locale: "en" | "ar", member: Member, step: string): Promise<void> {
  await page.context().clearCookies();
  await signIn(page, locale, member);
  await page.waitForURL(new RegExp(`/${step}(?:\\?|$)`));
}

test("review names exactly the rules complete_onboarding raises", async ({ page }) => {
  test.setTimeout(240_000);
  const member = await createMember("rules");
  await signIn(page, "en", member);
  await openThemed(page, "en", "light", 1280, "welcome");
  await page.getByRole("radio", { name: en.onboarding.localeEn }).check();
  await page.locator("#welcome-name").fill(`zz-test-wiz-rules-${member.id.slice(0, 8)}`);
  await press(page, en.onboarding.continue);
  await page.waitForURL(/\/brand/);
  const token = await memberToken(member);
  await memberRpc(token, "save_brand_name", { p_name_en: "Northwind", p_name_ar: "Northwind" });

  async function compare(label: string): Promise<string[]> {
    await memberPatch(token, "onboarding_draft?archived_at=is.null", { resume_step: "review" });
    await page.goto("/en/onboarding/review");
    await expect(page.locator("[data-needed]")).toBeVisible();
    const listed = await visibleRules(page, "[data-needed] [data-rule]");
    const id = await profileId(token);
    const result = await memberRpcResult(token, "complete_onboarding", { p_profile_id: id });
    expect(result.ok, `${label} ${result.body}`).toBe(false);
    const raised = raisedRules(result.body);
    expect(listed, label).toEqual(raised);
    return raised;
  }

  const namedOnly = await compare("name only");
  expect(namedOnly).toContain("default theme count is 0, expected 1");
  expect(namedOnly).toContain("logo variant missing");
  expect(namedOnly).toContain("legal name missing locale en");
  expect(namedOnly).toContain("registered address missing locale ar");

  const id = await profileId(token);
  const same = en.onboarding.startingBackground;
  await memberRpc(token, "save_brand_theme", {
    p_profile_id: id,
    p_primary: en.onboarding.startingForeground,
    p_secondary: en.onboarding.startingMuted,
    p_accent: en.onboarding.startingCritical,
    p_background: same,
    p_foreground: same,
    p_muted: en.onboarding.startingMuted,
    p_critical: en.onboarding.startingCritical,
  });
  const contrasted = await compare("contrast");
  expect(contrasted).toContain("foreground contrast against background is below 4.5:1");
  expect(contrasted.some((rule) => rule.startsWith("default theme count"))).toBe(false);
  expect(contrasted).not.toEqual(namedOnly);

  const written = await memberRpcResult(token, "save_guideline", {
    p_profile_id: id,
    p_guideline_id: null,
    p_title_en: "Clear space",
    p_title_ar: "",
    p_body_en: "",
    p_body_ar: "",
    p_ordinal: 1,
  });
  expect(written.ok, written.body).toBe(true);
  const withGuideline = await compare("guideline");
  expect(withGuideline).toContain("guideline title missing locale ar");
  expect(withGuideline).toContain("guideline body missing locale en");
  expect(withGuideline).not.toEqual(contrasted);

  await press(page, en.onboarding.finish);
  await expect(page.locator('[role="alert"] [data-rule]').first()).toBeVisible();
  expect(await visibleRules(page, '[role="alert"] [data-rule]')).toEqual(withGuideline);
  const brand = await memberGet<{ current_profile_id: string | null }[]>(token, "brand?select=current_profile_id");
  expect(brand[0]?.current_profile_id ?? null).toBeNull();
  const drafts = await memberGet<{ archived_at: string | null }[]>(token, "onboarding_draft?select=archived_at");
  expect(drafts[0]?.archived_at ?? null).toBeNull();
});

for (const locale of ["en"] as const) {
  test(`brand colours are chosen through the visual chooser ${locale}`, async ({ page }) => {
    test.setTimeout(180_000);
    const copy = copyFor(locale);
    const member = await createMember(`pick-${locale}`);
    await signIn(page, locale, member);
    await openThemed(page, locale, "light", 1280, "welcome");
    await page.getByRole("radio", { name: copy.localeEn }).check();
    await page.locator("#welcome-name").fill(`zz-test-wiz-pick-${locale}-${member.id.slice(0, 8)}`);
    await press(page, copy.continue);
    await page.waitForURL(/\/brand/);

    await chooseColour(page, "role-primary", PRIMARY);
    await chooseColour(page, "role-secondary", SECONDARY);
    await chooseColour(page, "role-accent", ACCENT);
    await press(page, copy.save);
    await expectSaved(page, copy);
    await page.reload();
    await expect(page.locator("#role-primary")).toHaveValue(PRIMARY);
    await expect(page.locator("#role-secondary")).toHaveValue(SECONDARY);
    await expect(page.locator("#role-accent")).toHaveValue(ACCENT);
  });
}

for (const locale of LOCALES) {
  test(`company, guidelines, resume and finish ${locale}`, async ({ page }) => {
    test.setTimeout(360_000);
    const copy = copyFor(locale);
    const member = await createMember(`back-${locale}`);
    await signIn(page, locale, member);
    await openThemed(page, locale, "light", 1280, "welcome");
    await page.getByRole("radio", { name: copy.localeEn }).check();
    await page.locator("#welcome-name").fill(`zz-test-wiz-back-${locale}-${member.id.slice(0, 8)}`);
    await press(page, copy.continue);
    await page.waitForURL(/\/brand/);

    await page.locator("#role-primary").fill(PRIMARY);
    await press(page, copy.save);
    await expectSaved(page, copy);
    await returnTo(page, locale, member, "brand");
    await expect(page.locator("#role-primary")).toHaveValue(PRIMARY);
    await expect(page.locator("#role-secondary")).toHaveValue("");

    await page.locator('[data-locale="en"] input').fill("Northwind");
    await page.locator('[data-locale="ar"] input').fill("Northwind");
    await page.locator("#role-secondary").fill(SECONDARY);
    await page.locator("#role-accent").fill(ACCENT);
    await press(page, copy.continue);
    await page.waitForURL(/\/typography/);
    await page.locator("#heading-latin").selectOption("Fraunces");
    await press(page, copy.save);
    await expectSaved(page, copy);
    await returnTo(page, locale, member, "typography");
    await expect(page.locator("#heading-latin")).toHaveValue("Fraunces");
    await page.locator("#heading-arabic").selectOption("Cairo");
    await page.locator("#body-arabic").selectOption("Amiri");
    await page.locator("#body-latin").selectOption("Lora");
    await press(page, copy.continue);
    await page.waitForURL(/\/company/);

    const national = `0${"1001234567"}`;
    const storedPhone = `+20${"1001234567"}`;
    await page.locator('#legal-name [data-locale="en"] input').fill("Northwind LLC");
    await page.locator("#tax").fill("TAX123");
    await page.locator("#phone").fill(national);
    await press(page, copy.save);
    await expectSaved(page, copy);
    await expect(page.locator("#phone")).toHaveValue(storedPhone);
    await returnTo(page, locale, member, "company");
    await expect(page.locator('#legal-name [data-locale="en"] input')).toHaveValue("Northwind LLC");
    await expect(page.locator("#tax")).toHaveValue("TAX123");
    await expect(page.locator("#phone")).toHaveValue(storedPhone);

    await page.locator("#tax").fill("not valid");
    await page.locator("#email").fill("not-an-email");
    await press(page, copy.continue);
    const companyAlert = errorSummary(page);
    await expect(companyAlert).toContainText(copy.taxInvalid);
    await expect(companyAlert).toContainText(copy.emailInvalid);
    await expect(companyAlert).toContainText(fillPattern(copy.legalNameMissing, { locale: copy.localeAr }));
    await expect(companyAlert).toContainText(fillPattern(copy.addressMissing, { locale: copy.localeEn }));
    await expect(companyAlert).toContainText(fillPattern(copy.addressMissing, { locale: copy.localeAr }));
    await expect(companyAlert).not.toContainText(fillPattern(copy.legalNameMissing, { locale: copy.localeEn }));
    await page.reload();
    await expect(page.locator("#tax")).toHaveValue("TAX123");
    await expect(page.locator("#email")).toHaveValue("");
    await expect(page.locator("#phone")).toHaveValue(storedPhone);
    await expect(page.locator('#legal-name [data-locale="en"] input')).toHaveValue("Northwind LLC");
    const token = await memberToken(member);
    const entity = await memberGet<{ contact_phone: string | null }[]>(token, "legal_entity?select=contact_phone");
    expect(entity[0]?.contact_phone).toBe(storedPhone);

    await page.locator('#legal-name [data-locale="ar"] input').fill("Northwind LLC");
    await page.locator('#registered-address [data-locale="en"] textarea').fill("1 Street");
    await page.locator('#registered-address [data-locale="ar"] textarea').fill("2 Street");
    await press(page, copy.continue);
    await page.waitForURL(/\/guidelines/);

    await press(page, copy.addGuideline);
    await page.locator('#guideline-1-title [data-locale="en"] input').fill("Clear space");
    await press(page, copy.continue);
    const guidelineAlert = errorSummary(page);
    await expect(guidelineAlert).toContainText(fillPattern(copy.guidelineShort, { ordinal: "1", part: copy.partTitle, locale: copy.localeAr }));
    await expect(guidelineAlert).toContainText(fillPattern(copy.guidelineShort, { ordinal: "1", part: copy.partBody, locale: copy.localeEn }));
    await expect(guidelineAlert).toContainText(fillPattern(copy.guidelineShort, { ordinal: "1", part: copy.partBody, locale: copy.localeAr }));
    await page.locator('#guideline-1-title [data-locale="ar"] input').fill("Clear space");
    await page.locator('#guideline-1-body [data-locale="en"] textarea').fill("Leave room around the mark.");
    await page.locator('#guideline-1-body [data-locale="ar"] textarea').fill("Leave room around the mark.");
    await press(page, copy.save);
    await expectSaved(page, copy);
    await returnTo(page, locale, member, "guidelines");
    await expect(page.locator('#guideline-1-title [data-locale="en"] input')).toHaveValue("Clear space");
    await page.locator('#guideline-1-title [data-locale="en"] input').fill("Clear space revised");
    await press(page, copy.save);
    await expectSaved(page, copy);
    await page.reload();
    await expect(page.locator('#guideline-1-title [data-locale="en"] input')).toHaveValue("Clear space revised");
    const removeName = fillPattern(copy.removeGuideline, { ordinal: formatCount(1, locale) });
    await press(page, removeName);
    await expect(page.locator("#guideline-1-title")).toHaveCount(0);
    const guidelines = await memberGet<{ id: string; archived_at: string | null }[]>(token, "brand_guideline?select=id,archived_at");
    expect(guidelines).toHaveLength(1);
    expect(guidelines[0]?.archived_at).toBeTruthy();

    await press(page, copy.continue);
    await page.waitForURL(/\/review/);
    const listed = await visibleRules(page, "[data-needed] [data-rule]");
    const id = await profileId(token);
    const result = await memberRpcResult(token, "complete_onboarding", { p_profile_id: id });
    expect(result.ok).toBe(false);
    expect(listed).toEqual(raisedRules(result.body));
    const before = await memberGet<{ current_profile_id: string | null }[]>(token, "brand?select=current_profile_id");
    await press(page, copy.finish);
    await expect(page.locator('[role="alert"] [data-rule]').first()).toBeVisible();
    expect(await visibleRules(page, '[role="alert"] [data-rule]')).toEqual(listed);
    const after = await memberGet<{ current_profile_id: string | null }[]>(token, "brand?select=current_profile_id");
    expect(after[0]?.current_profile_id ?? null).toBe(before[0]?.current_profile_id ?? null);
    expect(page.url()).toContain("/review");

    await page.goto(`/${locale}/onboarding/brand`);
    await page.locator('[data-logo-ground="light"] input[type=file]').setInputFiles({
      name: "mark.png",
      mimeType: "image/png",
      buffer: png(1000, 1000),
    });
    await expect(page.locator('[data-ground="light"]').first()).toHaveAttribute("src", /.+/);
    await page.goto(`/${locale}/onboarding/review`);
    await expect(page.getByText(copy.reviewReady)).toBeVisible();
    await press(page, copy.finish);
    await page.waitForURL(/\/complete/);
    await expect(page.locator("[data-screen=complete]")).toContainText(copy.completeBody);
    const finished = await memberGet<{ current_profile_id: string | null }[]>(token, "brand?select=current_profile_id");
    expect(finished[0]?.current_profile_id).toBeTruthy();
    const draft = await memberGet<{ archived_at: string | null }[]>(token, "onboarding_draft?select=archived_at");
    expect(draft[0]?.archived_at).toBeTruthy();
    await page.goto(`/${locale}/onboarding/brand`);
    await expect(page).toHaveURL(/\/onboarding\/complete/);
    await page.goto(`/${locale}/onboarding`);
    await expect(page).toHaveURL(/\/onboarding\/complete/);
  });
}

function accessFor(locale: "en" | "ar") {
  return locale === "ar" ? ar.access : en.access;
}

function credentialForm(page: Page) {
  return page.locator('[role="tabpanel"]:not([hidden]) form').filter({ has: page.locator('input[name="email"]') });
}

async function holdEntry(page: Page, locale: "en" | "ar", screen: string): Promise<void> {
  const violations = await runAxe(page);
  expect(violations, screen).toEqual([]);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, screen).toBeLessThanOrEqual(1);
  await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
}

for (const locale of LOCALES) {
  test(`entry root and email sign-in ${locale}`, async ({ page }) => {
    await page.goto(`/${locale}`);
    await expect(page).toHaveURL(new RegExp(`/${locale}/sign-in`));

    const member = await createMember(`door-${locale}`);
    await signIn(page, locale, member);
    await page.goto(`/${locale}`);
    await expect(page).toHaveURL(new RegExp(`/${locale}/onboarding`));
  });

  test(`entry sign-up ${locale}`, async ({ page }) => {
    const access = accessFor(locale);
    const email = `${PREFIX}signup-${locale}-${randomUUID().slice(0, 8)}@example.com`;
    const password = randomUUID();
    await page.goto(`/${locale}/sign-in`);
    await page.getByRole("tab", { name: access.signUpHeading }).click();
    const form = credentialForm(page);
    await form.locator('input[name="email"]').fill(email);
    await form.locator('input[name="password"]').fill(password);
    await form.getByRole("button", { name: access.signUpSubmit }).click();
    await page.waitForURL((url) => {
      const path = url.pathname;
      return path.startsWith(`/${locale}/onboarding`) || path === `/${locale}/sign-in`;
    });
    expect(new URL(page.url()).searchParams.get("error")).toBeNull();
  });

  test(`entry refused sign-in ${locale}`, async ({ page }) => {
    const access = accessFor(locale);
    const member = await createMember(`refused-${locale}`);
    await page.goto(`/${locale}/sign-in`);
    const knownForm = credentialForm(page);
    await knownForm.locator('input[name="email"]').fill(member.email);
    await knownForm.locator('input[name="password"]').fill(`${member.password}-wrong`);
    await knownForm.getByRole("button", { name: access.signInSubmit }).click();
    await expect(page).toHaveURL(/error=sign_in_refused/);
    const notice = page.locator('[data-tone="danger"][role="alert"]');
    const known = (await notice.innerText()).replace(/\s+/g, " ").trim();
    expect(known).toContain(access.sign_in_refused);
    expect(known).not.toContain(member.email);

    const unknown = `nobody-${randomUUID().slice(0, 8)}@example.com`;
    await page.goto(`/${locale}/sign-in`);
    const unknownForm = credentialForm(page);
    await unknownForm.locator('input[name="email"]').fill(unknown);
    await unknownForm.locator('input[name="password"]').fill(randomUUID());
    await unknownForm.getByRole("button", { name: access.signInSubmit }).click();
    await expect(page).toHaveURL(/error=sign_in_refused/);
    const unknownText = (await page.locator('[data-tone="danger"][role="alert"]').innerText()).replace(/\s+/g, " ").trim();
    expect(unknownText).toBe(known);
    expect(unknownText).not.toContain(unknown);
  });

  test(`entry sign out ${locale}`, async ({ page }) => {
    const member = await createMember(`out-${locale}`);
    await signIn(page, locale, member);
    await page.goto(`/${locale}/onboarding/welcome`);
    await page.getByRole("button", { name: copyFor(locale).signOut }).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/sign-in$`));
    await page.goto(`/${locale}/onboarding/welcome`);
    await expect(page).toHaveURL(new RegExp(`/${locale}/sign-in`));
  });

  test(`entry google ${locale}`, async ({ page }) => {
    const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!raw) throw new Error("staging URL is absent");
    const host = new URL(raw).hostname;
    let seen = "";
    await page.route("**/auth/v1/authorize**", async (route) => {
      seen = route.request().url();
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<!doctype html><title>held</title>",
      });
    });
    await page.goto(`/${locale}/sign-in`);
    await page.getByRole("button", { name: accessFor(locale).googleSubmit }).click();
    await expect.poll(() => seen, { timeout: 30_000 }).not.toBe("");
    const url = new URL(seen);
    expect(url.hostname).toBe(host);
    expect(url.pathname).toContain("/auth/v1/authorize");
    expect(url.searchParams.get("provider")).toBe("google");
  });
}

for (const locale of LOCALES) {
  for (const theme of THEMES) {
    for (const width of WIDTHS) {
      test(`entry ${locale} ${theme} ${width}`, async ({ page }) => {
        const access = accessFor(locale);
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: theme === "dark" ? "dark" : "light" });
        await page.goto(`/${locale}/sign-in`);
        await expect(page.getByRole("tab", { name: access.signInHeading })).toBeVisible();
        await expect(page.getByRole("button", { name: access.googleSubmit })).toBeVisible();
        await expect(page.locator("img")).toHaveCount(0);
        await holdEntry(page, locale, "sign-in");
        await page.getByRole("tab", { name: access.signUpHeading }).click();
        await expect(page.getByRole("button", { name: access.signUpSubmit })).toBeVisible();
        await holdEntry(page, locale, "create");
        await page.goto(`/${locale}/sign-in?error=sign_in_refused`);
        await expect(page.locator('[data-tone="danger"][role="alert"]')).toContainText(access.sign_in_refused);
        await holdEntry(page, locale, "refused");
      });
    }
  }
}
