import { expect, test, type Page } from "@playwright/test";
import axe from "axe-core";
import { readFileSync } from "node:fs";

import ar from "../../app/[locale]/dictionaries/ar.json";
import en from "../../app/[locale]/dictionaries/en.json";

const LOG = "test-results/dev-server.log";
const LOCALES = ["en", "ar"] as const;
const THEMES = ["light", "dark"] as const;

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

type ServerErrorRecord = {
  event: string;
  digest: string;
  route: string;
  routerKind: string;
  method: string;
  errorName: string;
  message: string;
  frames: unknown[];
  timestamp: string;
};

function parseRecords(text: string): ServerErrorRecord[] {
  const found: ServerErrorRecord[] = [];
  for (const line of text.split("\n")) {
    const start = line.indexOf('{"event":"server_error"');
    if (start === -1) continue;
    try {
      found.push(JSON.parse(line.slice(start)) as ServerErrorRecord);
    } catch {
      continue;
    }
  }
  return found;
}

function logText(): string {
  try {
    return readFileSync(LOG, "utf8");
  } catch {
    return "";
  }
}

async function waitForNewRecord(before: string, digest: string): Promise<ServerErrorRecord[]> {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    const added = logText().slice(before.length);
    const hits = parseRecords(added).filter((record) => record.digest === digest);
    if (hits.length > 0) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const settled = logText().slice(before.length);
      return parseRecords(settled).filter((record) => record.digest === digest);
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  return [];
}

async function runAxe(page: Page) {
  await page.addScriptTag({ content: axe.source });
  return page.evaluate(async (tags) => {
    const engine = (window as unknown as {
      axe: {
        run: (node: Document, options: unknown) => Promise<{
          violations: Array<{ id: string; nodes: Array<{ html?: string; failureSummary?: string }> }>;
        }>;
      };
    }).axe;
    const result = await engine.run(document, { runOnly: { type: "tag", values: tags } });
    return result.violations.map((item) => ({
      id: item.id,
      html: (item.nodes[0]?.html ?? "").slice(0, 200),
      summary: (item.nodes[0]?.failureSummary ?? "").slice(0, 300),
    }));
  }, WCAG);
}

for (const locale of LOCALES) {
  for (const theme of THEMES) {
    test(`error probe ${locale} ${theme}`, async ({ page }) => {
      const copy = locale === "en" ? en.error : ar.error;
      await page.emulateMedia({ colorScheme: theme === "dark" ? "dark" : "light" });
      await page.addInitScript((next) => {
        document.documentElement.dataset.theme = next;
      }, theme);
      await page.goto(`/${locale}/error-probe`);
      const screen = page.locator("[data-composition='ErrorState']");
      await expect(screen).toBeVisible();
      await expect(screen.getByRole("heading", { name: copy.title })).toBeVisible();
      await expect(screen.getByText(copy.message)).toBeVisible();
      await expect(screen.getByText(copy.next)).toBeVisible();
      await expect(screen.getByRole("button", { name: copy.retry })).toBeVisible();
      await expect(screen.getByRole("button", { name: copy.copyIdentifier })).toBeVisible();
      const identifier = screen.locator("p[dir='ltr']");
      await expect(identifier).toBeVisible();
      const digest = (await identifier.innerText()).trim();
      expect(digest.length).toBeGreaterThan(0);
      expect(digest).not.toContain("probe");

      const before = logText();
      await page.reload();
      const hits = await waitForNewRecord(before, digest);
      expect(hits).toHaveLength(1);
      expect(hits[0].event).toBe("server_error");
      expect(hits[0].digest).toBe(digest);
      expect(hits[0].routerKind).toBe("App Router");
      expect(hits[0].method).toBe("GET");
      expect(hits[0].errorName).toBe("Error");
      expect(typeof hits[0].route).toBe("string");
      expect(hits[0].route.length).toBeGreaterThan(0);
      expect(Array.isArray(hits[0].frames)).toBe(true);
      expect(hits[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(hits[0].message).toBe("probe");

      const violations = await runAxe(page);
      expect(violations, JSON.stringify(violations)).toEqual([]);
    });
  }
}

test("error probe redacts an email in the server line", async ({ page }) => {
  const before = logText();
  await page.goto("/en/error-probe?fixture=email");
  const identifier = page.locator("[data-composition='ErrorState'] p[dir='ltr']");
  const digest = (await identifier.innerText()).trim();
  const hits = await waitForNewRecord(before, digest);
  expect(hits).toHaveLength(1);
  expect(hits[0].message).not.toContain("person@example.com");
  expect(hits[0].message).toContain("<REDACTED>");
  expect(JSON.stringify(hits[0])).not.toContain("person@example.com");
});
