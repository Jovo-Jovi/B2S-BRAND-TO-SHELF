import { defineConfig } from "@playwright/test";

// ADR-015. Chromium is installed natively on the runner. This config does not
// name a Docker image.
//
// design-review.capture.spec.ts is tagged @design-review and is a local
// photograph of staging. CI does not set B2S_CAPTURE, so the file is not
// loaded. The browser workflow also passes --grep-invert @design-review.
const capture = process.env.B2S_CAPTURE === "1";

export default defineConfig({
  testDir: "__tests__/browser",
  testIgnore: capture ? undefined : /design-review\.capture\.spec\.ts/,
  timeout: capture ? 3_000_000 : 120_000,
  expect: { timeout: capture ? 120_000 : 15_000 },
  use: { baseURL: "http://127.0.0.1:3010" },
  webServer: {
    command: "node scripts/dev-server-capture.mjs",
    url: "http://127.0.0.1:3010/en/gallery",
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
