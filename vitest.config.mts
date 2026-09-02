import path from "node:path";
import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": root,
    },
  },
  test: {
    environment: "node",
    include: [
      "__tests__/**/*.test.ts",
      "__tests__/**/*.test.tsx",
      "features/**/__tests__/**/*.test.ts",
      "features/**/__tests__/**/*.test.tsx",
    ],
    // __tests__/isolation/ needs live Supabase credentials and seeds real rows
    // into the one project ADR-012 allows. It runs on its own config, through
    // `npm run test:isolation`, never as part of the credential-free unit job.
    exclude: [...configDefaults.exclude, "__tests__/isolation/**"],
  },
});
