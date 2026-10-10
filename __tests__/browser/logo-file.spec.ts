import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

import { inspectLogo } from "../../lib/logo/logo-file";

const knownGood = [
  readFileSync("public/gallery/sample-mark-dark.svg"),
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><title>Mark</title><!-- kept out of the file --><metadata>not stored</metadata><circle cx="16" cy="16" r="10" fill="black"/></svg>`,
  ),
];

async function pixels(page: import("@playwright/test").Page, source: string) {
  return page.evaluate(async (svg) => {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext("2d");
    if (!context) {
      return [];
    }
    context.drawImage(image, 0, 0, 64, 64);
    URL.revokeObjectURL(url);
    return [...context.getImageData(0, 0, 64, 64).data];
  }, source);
}

test("known-good logos match after cleaning", async ({ page }) => {
  await page.goto("about:blank");
  for (const original of knownGood) {
    const result = inspectLogo(original);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      continue;
    }
    const before = await pixels(page, new TextDecoder().decode(original));
    const after = await pixels(page, new TextDecoder().decode(result.bytes));
    expect(before.length).toBe(64 * 64 * 4);
    expect(after).toEqual(before);
  }
});
