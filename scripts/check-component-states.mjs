#!/usr/bin/env node
// CF-173. A state is implemented when a test renders the primitive in that
// state and asserts it. Every state a component block declares, other than
// those marked n/a, must have such a test. The test is read with the
// TypeScript compiler: the state name is a string literal inside an it()
// callback that also contains JSX and an assertion.

import {
  MINIMUM_BLOCKS,
  MINIMUM_ENFORCED_STATES,
  MINIMUM_IMPLEMENTED,
  coveredStatesInDirectory,
  enforcedStates,
  loadCatalog,
} from "./component-blocks.mjs";

function fail(message) {
  console.error(`FAIL: ${message}`);
}

function main() {
  try {
    const catalog = loadCatalog();
    const failures = [];
    if (catalog.specMissing || catalog.specUnreadable) {
      failures.push("docs/product/DESIGN_SURFACE.md does not exist, so there are no declared states to require (PR-27)");
    }
    if (catalog.uiMissing) {
      failures.push("components/ui does not exist, so there are no primitive tests to read (PR-27)");
    }
    if (catalog.blocks.length < MINIMUM_BLOCKS) {
      failures.push(
        `${catalog.blocks.length} component block(s) read, minimum ${MINIMUM_BLOCKS}. An emptied specification is not a pass (PR-27)`,
      );
    }
    if (catalog.implementations.length < MINIMUM_IMPLEMENTED) {
      failures.push(
        `${catalog.implementations.length} primitive(s) implemented, minimum ${MINIMUM_IMPLEMENTED}. An emptied catalog is not a pass (PR-27)`,
      );
    }

    const blocksByName = new Map(catalog.blocks.map((block) => [block.name, block]));
    const implementedNames = new Set(catalog.implementations.map((item) => item.name));
    const pending = catalog.blocks.filter((block) => !implementedNames.has(block.name)).map((block) => block.name);

    let enforced = 0;
    for (const item of catalog.implementations) {
      const block = blocksByName.get(item.name);
      if (!block) {
        failures.push(`${item.name} is implemented under components/ui and DESIGN_SURFACE.md has no component block for it`);
        continue;
      }
      const required = enforcedStates(block);
      enforced += required.length;
      const covered = catalog.uiMissing ? new Set() : coveredStatesInDirectory(item.dir);
      for (const state of required) {
        if (!covered.has(state)) {
          failures.push(`${item.name} state "${state}" is declared and no test renders it`);
        }
      }
    }

    if (!catalog.uiMissing && enforced < MINIMUM_ENFORCED_STATES) {
      failures.push(
        `${enforced} enforced state(s) on implemented primitives, minimum ${MINIMUM_ENFORCED_STATES}`,
      );
    }

    if (pending.length > 0) {
      console.log(`pending: ${pending.join(", ")}`);
    }
    for (const message of failures) fail(message);
    if (failures.length > 0) process.exit(1);

    console.log(
      `OK: every enforced state of ${catalog.implementations.length} primitive(s) is rendered and asserted, ` +
        `minimum ${MINIMUM_IMPLEMENTED} implemented, ${enforced} enforced state(s) minimum ${MINIMUM_ENFORCED_STATES}, ` +
        `${catalog.blocks.length} block(s) minimum ${MINIMUM_BLOCKS}; ${pending.length} pending`,
    );
  } catch (err) {
    fail(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

main();
