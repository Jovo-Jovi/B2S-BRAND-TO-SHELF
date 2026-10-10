// Repeated controls in one composition must be distinguishable by name.
// The group is the attribute; the control is the button or link inside it.

export function accessibleName(node: Element): string {
  const control = node.matches("a, button") ? node : node.querySelector("a, button");
  const target = control ?? node;
  const labelled = target.getAttribute("aria-label");
  if (labelled && labelled.trim()) {
    return labelled.trim();
  }
  return (target.textContent ?? "").replace(/\s+/g, " ").trim();
}

export function duplicateNames(root: ParentNode): string[] {
  const found: string[] = [];
  for (const group of root.querySelectorAll("[data-name-group]")) {
    const kind = group.getAttribute("data-name-group");
    if (!kind) {
      continue;
    }
    const controls = [...group.querySelectorAll("[data-repeated]")].filter(
      (node) => node.getAttribute("data-repeated") === kind && node.closest("[data-name-group]") === group,
    );
    const seen = new Set<string>();
    for (const control of controls) {
      const name = accessibleName(control);
      if (seen.has(name)) {
        found.push(name);
      }
      seen.add(name);
    }
  }
  return found;
}

export function assertDistinctNames(root: ParentNode): void {
  const duplicates = duplicateNames(root);
  if (duplicates.length > 0) {
    throw new Error(`duplicate accessible name: ${duplicates.join(", ")}`);
  }
}
