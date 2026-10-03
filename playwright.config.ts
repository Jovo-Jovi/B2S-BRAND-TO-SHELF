import { defineConfig } from "@playwright/test";

// ADR-015. Chromium is installed natively on the runner. This config does not
// name a Docker image.
export default defineConfig({
  testDir: "__tests__/browser",
  timeout: 120_000,
  expect: { timeout: 15_000 },
  use: { baseURL: "http://127.0.0.1:3000" },
  webServer: {
    command: "npx next dev --hostname 127.0.0.1 --port 3000",
    url: "http://127.0.0.1:3000/en/gallery",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
