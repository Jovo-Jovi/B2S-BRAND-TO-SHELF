#!/usr/bin/env node
// CF-174. Each implemented primitive's variant and size unions equal the
// sets its component block declares. The TypeScript compiler already in
// the repository parses the source. A block with no implementation is
// pending, by name. An implementation with no block fails.

import {
  MINIMUM_BLOCKS,
  MINIMUM_IMPLEMENTED,
  MINIMUM_SIZE_MEMBERS,
  MINIMUM_VARIANT_MEMBERS,
  enforcedStates,
  loadCatalog,
  setDiff,
} from "./component-blocks.mjs";

function fail(message) {
  console.error(`FAIL: ${message}`);
}

function main() {
  try {
    const catalog = loadCatalog();
    const failures = [];
    if (catalog.specMissing || catalog.specUnreadable) {
      failures.push("docs/product/DESIGN_SURFACE.md does not exist, so there are no component blocks to match (PR-27)");
    }
    if (catalog.uiMissing) {
      failures.push("components/ui does not exist, so there are no implemented primitives to match (PR-27)");
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

    let variantMembers = 0;
    let sizeMembers = 0;
    for (const item of catalog.implementations) {
      const block = blocksByName.get(item.name);
      if (!block) {
        failures.push(`${item.name} is implemented under components/ui and DESIGN_SURFACE.md has no component block for it`);
        continue;
      }
      variantMembers += item.variants.length;
      sizeMembers += item.sizes?.length ?? 0;
      const variants = setDiff(item.variants, block.variants);
      if (variants) {
        failures.push(
          `${item.name} variants are [${item.variants.join(", ")}]; its component block declares [${block.variants.join(", ")}]`,
        );
      }
      const sizes = setDiff(item.sizes ?? [], block.sizes);
      if (sizes) {
        failures.push(
          `${item.name} sizes are [${(item.sizes ?? []).join(", ")}]; its component block declares [${block.sizes.join(", ")}]`,
        );
      }
      if (enforcedStates(block).length === 0 && block.states.length > 0) {
        failures.push(`${item.name} declares states and every one of them is marked n/a`);
      }
    }

    if (!catalog.uiMissing && variantMembers < MINIMUM_VARIANT_MEMBERS) {
      failures.push(`${variantMembers} variant member(s) on implemented primitives, minimum ${MINIMUM_VARIANT_MEMBERS}`);
    }
    if (!catalog.uiMissing && sizeMembers < MINIMUM_SIZE_MEMBERS) {
      failures.push(`${sizeMembers} size member(s) on implemented primitives, minimum ${MINIMUM_SIZE_MEMBERS}`);
    }

    if (pending.length > 0) {
      console.log(`pending: ${pending.join(", ")}`);
    }
    for (const message of failures) fail(message);
    if (failures.length > 0) process.exit(1);

    console.log(
      `OK: variant and size unions match ${catalog.implementations.length} component block(s), ` +
        `minimum ${MINIMUM_IMPLEMENTED} implemented, ${catalog.blocks.length} block(s) minimum ${MINIMUM_BLOCKS}, ` +
        `${variantMembers} variant member(s) minimum ${MINIMUM_VARIANT_MEMBERS}, ` +
        `${sizeMembers} size member(s) minimum ${MINIMUM_SIZE_MEMBERS}; ${pending.length} pending`,
    );
  } catch (err) {
    fail(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

main();
