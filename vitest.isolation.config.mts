import { defineConfig } from "vitest/config";

// The tenant-isolation proof runs against the live Supabase project and is
// therefore deliberately NOT part of `npm test`. The unit job in ci.yml holds no
// Supabase credentials, and a suite that skipped itself there would report green
// while proving nothing — the exact shape PR-21 forbids. It is invoked on its
// own, by `npm run test:isolation`, at the phase gate and whenever a policy, a
// grant or an entity changes (SECURITY_MODEL.md §4).
export default defineConfig({
  test: {
    environment: "node",
    include: ["__tests__/isolation/**/*.test.ts"],
    // Seeding, thirteen proofs and teardown share one live fixture, so they run
    // in declaration order in a single worker. Nothing here is parallel-safe.
    fileParallelism: false,
    sequence: { concurrent: false },
    testTimeout: 180_000,
    hookTimeout: 240_000,
    // The PASS/FAIL ledger this suite prints is the gate's evidence, not
    // incidental logging. Vitest's console interception attributes output to a
    // task and drops what the final afterAll writes, so it is turned off here.
    disableConsoleIntercept: true,
    // One live project, one suite: a retry would re-run a proof against state a
    // previous attempt had already mutated.
    retry: 0,
  },
});
