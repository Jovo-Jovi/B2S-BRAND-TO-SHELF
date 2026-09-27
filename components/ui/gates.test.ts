import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  assertDisabledSet,
  assertKnownBad,
  EXCLUSION_IDS,
} from "../../scripts/component-a11y-exclusions.mjs";
import {
  coveredStatesInSource,
  setDiff,
  typeLiteralMembers,
} from "../../scripts/component-blocks.mjs";

describe("component gates, planted in memory", () => {
  it("rejects a variant union that lost a member, and leaves the source byte-identical", () => {
    const path = "components/ui/button/button.tsx";
    const original = readFileSync(path, "utf8");
    const planted = original.replace(
      'export type ButtonVariant = "primary" | "secondary" | "quiet" | "danger"',
      'export type ButtonVariant = "primary" | "secondary" | "quiet"',
    );
    expect(planted).not.toBe(original);
    const members = typeLiteralMembers(planted, "ButtonVariant");
    expect(setDiff(members ?? [], ["primary", "secondary", "quiet", "danger"])).not.toBeNull();
    expect(readFileSync(path, "utf8")).toBe(original);
  });

  it("rejects a state whose rendering literal was removed, and leaves the test byte-identical", () => {
    const path = "components/ui/button/button.test.tsx";
    const original = readFileSync(path, "utf8");
    const planted = original.replace('"active"', '"resting"');
    expect(planted).not.toBe(original);
    const covered = coveredStatesInSource(planted);
    expect(covered.has("active")).toBe(false);
    expect(coveredStatesInSource(original).has("active")).toBe(true);
    expect(readFileSync(path, "utf8")).toBe(original);
  });

  it("rejects a disabled set that re-enables a rule, gains a rule with no cause, or drops a known-bad fixture", () => {
    const held = assertDisabledSet();
    expect(held.ok).toBe(true);
    expect(held.disabled).toEqual(held.listed);
    expect(held.listed).toEqual(["color-contrast", "target-size"]);
    const reenabled = assertDisabledSet({
      "color-contrast": { enabled: false },
      "target-size": { enabled: true },
    });
    expect(reenabled.ok).toBe(false);
    expect(reenabled.notDisabled).toEqual(["target-size"]);
    const noCause = assertDisabledSet({
      "color-contrast": { enabled: false },
      "target-size": { enabled: false },
      region: { enabled: false },
    });
    expect(noCause.ok).toBe(false);
    expect(noCause.disabledWithoutCause).toEqual(["region"]);
    const dropped = assertKnownBad(["color-contrast"]);
    expect(dropped.ok).toBe(false);
    expect(dropped.missing).toEqual(["target-size"]);
    const proven = assertKnownBad([...EXCLUSION_IDS]);
    expect(proven.ok).toBe(true);
  });
});
