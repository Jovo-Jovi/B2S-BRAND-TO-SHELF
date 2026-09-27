#!/usr/bin/env node
// CF-176. The component accessibility tier. Below the implementation floor
// this check fails before it starts the runner, so a removed or emptied
// components/ui is a one-line FAIL and not a stack. Excluded rules are
// disabled in the engine configuration. The disabled set equals the
// exclusion list, both ways. Each entry has a cause, names the browser-tier
// gate that owns it, and is proven by a known-bad fixture the simulated DOM
// wrongly passes or cannot evaluate.

import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { MINIMUM_IMPLEMENTED, loadCatalog } from "./component-blocks.mjs";
import {
  EXCLUSIONS,
  FLOOR_DISABLED,
  FLOOR_KNOWN_BAD,
  FLOOR_RULES_RUN,
  assertDisabledSet,
} from "./component-a11y-exclusions.mjs";

const REPO = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(REPO);
const TIER_LINE = /A11Y_TIER rules=(\d+) disabled=(\d+) knownBad=(\d+)/;

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
    const verdict = assertDisabledSet();
    if (!verdict.ok) {
      fail(
        `disabled set ${verdict.disabled.join(",") || "(none)"} is not the exclusion list ${verdict.listed.join(",") || "(none)"}; missing cause: ${verdict.missingCause.join(",") || "(none)"}; disabled without a cause: ${verdict.disabledWithoutCause.join(",") || "(none)"}; not disabled: ${verdict.notDisabled.join(",") || "(none)"}`,
      );
      process.exit(1);
    }
    if (verdict.disabled.length < FLOOR_DISABLED) {
      fail(`${verdict.disabled.length} rule(s) disabled, minimum ${FLOOR_DISABLED}`);
      process.exit(1);
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
    const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
    if (result.status !== 0) {
      fail("the component accessibility tier reported a violation, a disabled-set mismatch, or an unproven known-bad fixture");
      if (result.stdout) process.stdout.write(result.stdout);
      if (result.stderr) process.stderr.write(result.stderr);
      process.exit(result.status ?? 1);
    }
    const measured = output.match(TIER_LINE);
    if (!measured) {
      fail("the component accessibility tier did not report rules run, rules disabled, and known-bad fixtures (PR-21)");
      if (result.stdout) process.stdout.write(result.stdout);
      if (result.stderr) process.stderr.write(result.stderr);
      process.exit(1);
    }
    const rulesRun = Number(measured[1]);
    const disabled = Number(measured[2]);
    const knownBad = Number(measured[3]);
    if (rulesRun < FLOOR_RULES_RUN) {
      fail(`${rulesRun} rule(s) run, minimum ${FLOOR_RULES_RUN}`);
      process.exit(1);
    }
    if (disabled < FLOOR_DISABLED) {
      fail(`${disabled} rule(s) disabled, minimum ${FLOOR_DISABLED}`);
      process.exit(1);
    }
    if (knownBad < FLOOR_KNOWN_BAD) {
      fail(`${knownBad} known-bad fixture(s) proven, minimum ${FLOOR_KNOWN_BAD}`);
      process.exit(1);
    }
    const causes = EXCLUSIONS.map((entry) => `${entry.id} (${entry.gate}): ${entry.cause}`).join(" | ");
    console.log(
      `OK: component accessibility tier on ${catalog.implementations.length} primitive(s), minimum ${MINIMUM_IMPLEMENTED}; ${rulesRun} rule(s) run, minimum ${FLOOR_RULES_RUN}; ${disabled} rule(s) disabled, minimum ${FLOOR_DISABLED}; ${knownBad} known-bad fixture(s) proven, minimum ${FLOOR_KNOWN_BAD}; exclusions: ${causes}`,
    );
  } catch (err) {
    fail(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

main();
