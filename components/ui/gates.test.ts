import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { assertExclusionUnion, EXCLUSION_IDS } from "../../scripts/component-a11y-exclusions.mjs";
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

  it("rejects an exclusion list that gained an id and one that lost the only id", () => {
    const listed = [...EXCLUSION_IDS];
    const extra = assertExclusionUnion([...listed, "button-name"], listed);
    expect(extra.ok).toBe(false);
    expect(extra.unlisted).toEqual(["button-name"]);
    const dropped = assertExclusionUnion([], listed);
    expect(dropped.ok).toBe(false);
    expect(dropped.silent).toEqual(listed);
    const held = assertExclusionUnion(listed, listed);
    expect(held.ok).toBe(true);
    expect(EXCLUSION_IDS).toEqual(["color-contrast"]);
  });
});
