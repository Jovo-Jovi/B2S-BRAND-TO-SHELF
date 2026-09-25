#!/usr/bin/env node
// CF-176. The component accessibility tier. Below the implementation floor
// this check fails before it starts the runner, so a removed or emptied
// components/ui is a one-line FAIL and not a stack. The exclusion list and
// its causes live in component-a11y-exclusions.mjs; the suite asserts that
// the incomplete rules it actually sees are exactly that list.

import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { EXCLUSIONS } from "./component-a11y-exclusions.mjs";
import { MINIMUM_IMPLEMENTED, loadCatalog } from "./component-blocks.mjs";

const REPO = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(REPO);

function fail(message) {
  console.error(`FAIL: ${message}`);
}

function main() {
  try {
    const catalog = loadCatalog();
    if (catalog.uiMissing) {
      fail("components/ui does not exist. The component accessibility tier has nothing to run (PR-27)");
      process.exit(1);
    }
    if (catalog.implementations.length < MINIMUM_IMPLEMENTED) {
      fail(
        `${catalog.implementations.length} primitive(s) implemented, minimum ${MINIMUM_IMPLEMENTED}. An emptied catalog is not a pass (PR-27)`,
      );
      process.exit(1);
    }
    for (const entry of EXCLUSIONS) {
      if (!entry.cause || !entry.cause.trim()) {
        fail(`exclusion ${entry.id} has no cause`);
        process.exit(1);
      }
    }
    const result = spawnSync(
      process.execPath,
      [join("node_modules", "vitest", "vitest.mjs"), "run", "components/ui/a11y-tier.test.tsx"],
      { cwd: ROOT, encoding: "utf8" },
    );
    if (result.error) {
      fail(result.error.message);
      process.exit(1);
    }
    if (result.status !== 0) {
      fail("the component accessibility tier reported a violation or an exclusion-list mismatch");
      if (result.stdout) process.stdout.write(result.stdout);
      if (result.stderr) process.stderr.write(result.stderr);
      process.exit(result.status ?? 1);
    }
    const causes = EXCLUSIONS.map((entry) => `${entry.id}: ${entry.cause}`).join(" | ");
    console.log(
      `OK: component accessibility tier on ${catalog.implementations.length} primitive(s), minimum ${MINIMUM_IMPLEMENTED}; exclusions: ${causes}`,
    );
  } catch (err) {
    fail(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

main();
