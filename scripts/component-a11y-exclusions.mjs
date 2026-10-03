// CF-176. Rules the component tier must not claim. Each one was measured in
// the simulated DOM: either its result does not change when the geometry or
// the computed colour it is supposed to read is substituted, or enabling it
// records a pass or an incomplete on a fixture that fails the criterion.
// The tier disables these rules. It does not treat "incomplete" as proof
// that a rule is unobservable — target-size returns a confident pass.

export const FLOOR_RULES_RUN = 84;
export const FLOOR_DISABLED = 5;
export const FLOOR_KNOWN_BAD = 5;

export const EXCLUSIONS = [
  {
    id: "color-contrast",
    gate: "CF-177",
    cause:
      "Measured in axe-core 4.13.0 against the component primitives. With element geometry held at 400px so the rule would treat the node as on screen, getComputedStyle ran 941 times, background-color was read 2 times, and color was read 0 times. The rule stayed incomplete both when computed colour was black on white and when it was gray on gray. jsdom does not implement getComputedStyle for pseudo-elements and does not implement canvas text, so the rule never finishes a contrast calculation. A known-bad fixture of the same gray on itself does not produce a violation. CF-177 owns rendered contrast in a real browser.",
  },
  {
    id: "target-size",
    gate: "CF-178",
    cause:
      "Measured in axe-core 4.13.0: the rule is present, tagged wcag22aa and wcag258, and shipped disabled. Enabling it passes a button styled 4px by 4px. jsdom's getBoundingClientRect on that button is 0 by 0, and the rule's offset check reports a 24px diameter. Reporting every element at 400px and at 4px does not change the pass. CF-178 owns geometry and target size in a real browser.",
  },
  {
    id: "link-in-text-block",
    gate: "CF-177",
    cause:
      "Measured in axe-core 4.13.0 on the component root, the same place the tier runs. A link with the same colour as its sentence and no underline returned inapplicable, not a violation. jsdom does not compute the colours the rule compares. The browser tier owns 1.4.1 on the gallery, where the same fixture is a violation.",
  },
  {
    id: "avoid-inline-spacing",
    gate: "CF-178",
    cause:
      "Measured in axe-core 4.13.0 on the component root. A paragraph locking line-height, letter-spacing and word-spacing with !important returned incomplete, not a violation. The browser tier owns 1.4.12, where the same fixture is a violation.",
  },
  {
    id: "meta-viewport",
    gate: "CF-196",
    cause:
      "Measured in axe-core 4.13.0. Run on the document, user-scalable=no is a violation. Run on the component root, which is where this tier runs, the same document is inapplicable. A page rule cannot be observed from a component root. The browser tier owns 1.4.4 on the gallery page, where the same fixture is a violation.",
  },
];

// The engine configuration. Kept beside the list so the two can diverge,
// which is what the equality assertion and its plants detect.
export const DISABLED_RULES = {
  "color-contrast": { enabled: false },
  "target-size": { enabled: false },
  "link-in-text-block": { enabled: false },
  "avoid-inline-spacing": { enabled: false },
  "meta-viewport": { enabled: false },
};

export const EXCLUSION_IDS = EXCLUSIONS.map((entry) => entry.id);

export function disabledIds(rules = DISABLED_RULES) {
  return Object.entries(rules)
    .filter(([, config]) => config && config.enabled === false)
    .map(([id]) => id)
    .sort();
}

/**
 * @param {Record<string, { enabled: boolean }>} [rules]
 * @param {typeof EXCLUSIONS} [exclusions]
 */
export function assertDisabledSet(rules = DISABLED_RULES, exclusions = EXCLUSIONS) {
  const disabled = disabledIds(rules);
  const listed = exclusions.map((entry) => entry.id).sort();
  const missingCause = exclusions
    .filter((entry) => !entry.cause || !String(entry.cause).trim() || !entry.gate || !String(entry.gate).trim())
    .map((entry) => entry.id);
  const disabledWithoutCause = disabled.filter((id) => {
    const entry = exclusions.find((item) => item.id === id);
    return !entry || !entry.cause || !String(entry.cause).trim();
  });
  const notDisabled = listed.filter((id) => !disabled.includes(id));
  const unlisted = disabled.filter((id) => !listed.includes(id));
  return {
    ok:
      missingCause.length === 0 &&
      disabledWithoutCause.length === 0 &&
      notDisabled.length === 0 &&
      unlisted.length === 0 &&
      disabled.length >= FLOOR_DISABLED,
    missingCause,
    disabledWithoutCause,
    notDisabled,
    unlisted,
    disabled,
    listed,
  };
}

/**
 * @param {string[]} provenIds
 * @param {typeof EXCLUSIONS} [exclusions]
 */
export function assertKnownBad(provenIds, exclusions = EXCLUSIONS) {
  const listed = exclusions.map((entry) => entry.id);
  const missing = listed.filter((id) => !provenIds.includes(id));
  return {
    ok: missing.length === 0 && provenIds.length >= FLOOR_KNOWN_BAD,
    missing,
    proven: provenIds.length,
  };
}
