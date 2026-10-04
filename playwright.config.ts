import { defineConfig } from "@playwright/test";

// ADR-015. Chromium is installed natively on the runner. This config does not
// name a Docker image.
export default defineConfig({
  testDir: "__tests__/browser",
  timeout: 120_000,
  expect: { timeout: 15_000 },
  use: { baseURL: "http://127.0.0.1:3010" },
  webServer: {
    command: "node scripts/dev-server-capture.mjs",
    url: "http://127.0.0.1:3010/en/gallery",
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
