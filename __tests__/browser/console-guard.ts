import { expect, test } from "@playwright/test";

// Any console error or React warning fails the test. React writes its
// warnings with console.error. There is no allow-list of messages.
export function installConsoleGuard(): void {
  const problems = new WeakMap<object, string[]>();

  test.beforeEach(async ({ page }) => {
    const found: string[] = [];
    problems.set(page, found);
    page.on("console", (message) => {
      if (message.type() === "error") {
        found.push(`error: ${message.text()}`);
      }
    });
    page.on("pageerror", (error) => {
      found.push(`pageerror: ${error.message}`);
    });
  });

  test.afterEach(async ({ page }) => {
    expect(problems.get(page) ?? []).toEqual([]);
  });
}
