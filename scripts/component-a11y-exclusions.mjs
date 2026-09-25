// CF-176. Every entry states why the simulated DOM cannot complete the rule.
// An id is listed only when a primitive run returns it incomplete. A listed id
// that a run stops returning, or an unlisted id that a run starts returning,
// fails the tier so this list cannot rot.

export const EXCLUSIONS = [
  {
    id: "color-contrast",
    cause:
      "A simulated DOM computes no rendered colour. jsdom leaves HTMLCanvasElement.getContext null, and axe-core's color-contrast rule throws inside _isIconLigature while reading canvas, then returns incomplete. CF-177 owns rendered contrast.",
  },
];

export const EXCLUSION_IDS = EXCLUSIONS.map((entry) => entry.id);

export function assertExclusionUnion(observedIds, listedIds = EXCLUSION_IDS) {
  const observed = new Set(observedIds);
  const listed = new Set(listedIds);
  const unlisted = [...observed].filter((id) => !listed.has(id));
  const silent = [...listed].filter((id) => !observed.has(id));
  return { ok: unlisted.length === 0 && silent.length === 0, unlisted, silent };
}
