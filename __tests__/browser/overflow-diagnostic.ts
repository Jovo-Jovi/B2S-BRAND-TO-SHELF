import { mkdirSync, writeFileSync } from "node:fs";
import type { Page } from "@playwright/test";

// Measures one gallery page in the browser that renders it, and writes the
// reading next to the screenshots. A later overflow is diagnosed the same way:
// the document widths, every box and text run past either edge, every element
// whose scroll width exceeds its client width, and the smallest subtree whose
// removal makes the document's scroll width equal its client width.

export async function writeOverflowDiagnostic(
  page: Page,
  locale: string,
  theme: string,
  width: number,
): Promise<void> {
  const file = `test-results/visual/overflow-gallery-${locale}-${theme}-${width}.json`;
  mkdirSync("test-results/visual", { recursive: true });
  let measured: unknown;
  try {
    measured = await page.evaluate(measureOverflow);
  } catch (error) {
    const failure = {
      locale,
      theme,
      width,
      error: error instanceof Error ? error.stack ?? error.message : String(error),
    };
    const json = JSON.stringify(failure, null, 2);
    writeFileSync(file, `${json}\n`, "utf8");
    console.log(`OVERFLOW_DIAGNOSTIC ${file}`);
    console.log(json);
    throw error;
  }
  const report = { locale, theme, width, ...(measured as Record<string, unknown>) };
  const json = JSON.stringify(report, null, 2);
  writeFileSync(file, `${json}\n`, "utf8");
  console.log(`OVERFLOW_DIAGNOSTIC ${file}`);
  console.log(json);
  if (!(measured as { restored?: boolean }).restored) {
    throw new Error("overflow diagnostic did not restore the document");
  }
}

function measureOverflow() {
  const EDGE = 0.5;

  function round(value: number): number {
    return Math.round(value * 100) / 100;
  }

  function pastAmount(left: number, right: number, clientWidth: number): number {
    const leftOver = left < -EDGE ? -left : 0;
    const rightOver = right > clientWidth + EDGE ? right - clientWidth : 0;
    return Math.max(leftOver, rightOver);
  }

  function classText(el: Element): string | null {
    if (el instanceof HTMLElement) return el.className.slice(0, 160);
    if (el instanceof SVGElement) return el.className.baseVal.slice(0, 160);
    return null;
  }

  function pathOf(el: Element): string {
    const bits: string[] = [];
    let node: Element | null = el;
    let guard = 0;
    while (node && guard < 24) {
      let bit = node.tagName.toLowerCase();
      if (node.id) bit += `#${node.id}`;
      for (const name of [
        "data-primitive",
        "data-part",
        "data-state",
        "data-composition",
        "data-screen",
        "data-specimen",
        "data-variant",
        "data-density",
      ]) {
        const value = node.getAttribute(name);
        if (value) bit += `[${name}=${value}]`;
      }
      bits.unshift(bit);
      node = node.parentElement;
      guard += 1;
    }
    return bits.join(" > ");
  }

  function identity(el: Element) {
    const rect = el.getBoundingClientRect();
    const data: Record<string, string> = {};
    for (const attr of el.attributes) {
      if (attr.name.startsWith("data-") || attr.name === "id" || attr.name === "role" || attr.name === "dir") {
        data[attr.name] = attr.value.slice(0, 80);
      }
    }
    const computed = el instanceof HTMLElement || el instanceof SVGElement ? getComputedStyle(el) : null;
    return {
      path: pathOf(el),
      tag: el.tagName.toLowerCase(),
      id: el.id || null,
      className: classText(el),
      data,
      text: (el.textContent ?? "").trim().slice(0, 80),
      rect: {
        left: round(rect.left),
        right: round(rect.right),
        top: round(rect.top),
        width: round(rect.width),
        height: round(rect.height),
      },
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      style: computed
        ? {
            display: computed.display,
            overflow: computed.overflow,
            direction: computed.direction,
            inlineSize: computed.inlineSize,
            whiteSpace: computed.whiteSpace,
            visibility: computed.visibility,
            opacity: computed.opacity,
          }
        : null,
    };
  }

  function read() {
    const root = document.documentElement;
    return {
      scrollWidth: root.scrollWidth,
      clientWidth: root.clientWidth,
      innerWidth: window.innerWidth,
      scrollLeft: root.scrollLeft,
      scrollX: window.scrollX,
      dir: root.getAttribute("dir"),
      direction: getComputedStyle(root).direction,
      bodyDirection: document.body ? getComputedStyle(document.body).direction : null,
    };
  }

  function probe(nodes: Element[]): boolean {
    const saved = nodes.flatMap((node) => {
      if (!(node instanceof HTMLElement || node instanceof SVGElement)) return [];
      return [{ node, value: node.style.getPropertyValue("display"), priority: node.style.getPropertyPriority("display") }];
    });
    let cleared = false;
    try {
      for (const item of saved) item.node.style.setProperty("display", "none", "important");
      const root = document.documentElement;
      cleared = root.scrollWidth <= root.clientWidth;
    } finally {
      for (const item of saved) {
        if (item.value) item.node.style.setProperty("display", item.value, item.priority);
        else item.node.style.removeProperty("display");
      }
    }
    return cleared;
  }

  const before = read();
  const amountOf = new Map<Element, number>();

  function noteAmount(el: Element, amount: number) {
    if (amount <= 0) return;
    let node: Element | null = el;
    while (node) {
      const prior = amountOf.get(node) ?? 0;
      if (amount <= prior) break;
      amountOf.set(node, amount);
      node = node.parentElement;
    }
  }

  const elements: Element[] = [];
  function collectElements(root: ParentNode) {
    for (const el of root.querySelectorAll("*")) {
      elements.push(el);
      if (el.shadowRoot) collectElements(el.shadowRoot);
    }
  }
  collectElements(document);

  const pastEdge: Array<ReturnType<typeof identity> & { amount: number }> = [];
  const scrollers: Array<ReturnType<typeof identity> & { delta: number }> = [];
  let subpixel = 0;
  for (const el of elements) {
    const rect = el.getBoundingClientRect();
    const amount = pastAmount(rect.left, rect.right, before.clientWidth);
    const strict = rect.left < 0 || rect.right > before.clientWidth;
    if (amount > 0) {
      noteAmount(el, amount);
      pastEdge.push({ amount: round(amount), ...identity(el) });
    } else if (strict) {
      subpixel += 1;
    }
    if (el.scrollWidth > el.clientWidth) {
      const delta = el.scrollWidth - el.clientWidth;
      noteAmount(el, delta);
      scrollers.push({ delta, ...identity(el) });
    }
  }
  pastEdge.sort((a, b) => b.amount - a.amount);
  scrollers.sort((a, b) => b.delta - a.delta);

  const textPast: Array<{
    text: string;
    parentPath: string;
    rects: Array<{ left: number; right: number; width: number; top: number }>;
  }> = [];
  let textNodes = 0;

  function collectText(root: Node) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let current = walker.nextNode();
    while (current) {
      textNodes += 1;
      const text = current.textContent ?? "";
      const parent = current.parentElement;
      const tag = parent?.tagName;
      if (parent && text.trim() !== "" && tag !== "SCRIPT" && tag !== "STYLE" && tag !== "NOSCRIPT") {
        const range = document.createRange();
        range.selectNodeContents(current);
        const past = Array.from(range.getClientRects()).filter(
          (rect) => rect.left < -EDGE || rect.right > before.clientWidth + EDGE,
        );
        if (past.length > 0) {
          const amount = Math.max(...past.map((rect) => pastAmount(rect.left, rect.right, before.clientWidth)));
          noteAmount(parent, amount);
          textPast.push({
            text: text.slice(0, 80),
            parentPath: pathOf(parent),
            rects: past.map((rect) => ({
              left: round(rect.left),
              right: round(rect.right),
              width: round(rect.width),
              top: round(rect.top),
            })),
          });
        }
      }
      current = walker.nextNode();
    }
    if (root instanceof Document || root instanceof Element) {
      for (const el of root.querySelectorAll("*")) {
        if (el.shadowRoot) collectText(el.shadowRoot);
      }
    }
  }
  collectText(document);

  function halfAmount(nodes: Element[]): number {
    let max = 0;
    for (const node of nodes) max = Math.max(max, amountOf.get(node) ?? 0);
    return max;
  }

  function stylableChildren(node: Element): Element[] {
    return Array.from(node.children).filter((child) => child instanceof HTMLElement || child instanceof SVGElement);
  }

  let bothHalves = false;

  function search(nodes: Element[], depthLimit: number): Element | null {
    if (depthLimit > 48 || nodes.length === 0) return null;
    if (nodes.length === 1) {
      const node = nodes[0];
      if (!probe([node])) return null;
      const deeper = search(stylableChildren(node), depthLimit + 1);
      return deeper ?? node;
    }
    const mid = Math.ceil(nodes.length / 2);
    const left = nodes.slice(0, mid);
    const right = nodes.slice(mid);
    const leftClears = probe(left);
    const rightClears = probe(right);
    if (leftClears && rightClears) {
      bothHalves = true;
      const useRight = halfAmount(right) > halfAmount(left);
      return search(useRight ? right : left, depthLimit + 1);
    }
    if (leftClears) return search(left, depthLimit + 1);
    if (rightClears) return search(right, depthLimit + 1);
    for (const node of nodes) {
      if (probe([node])) return search([node], depthLimit + 1);
    }
    return null;
  }

  let cause: Element | null = null;
  let note = "";
  let confirmation: { hiddenScrollWidth: number; hiddenClientWidth: number; clears: boolean } | null = null;
  if (before.scrollWidth <= before.clientWidth) {
    note = "scrollWidth already equals clientWidth";
  } else {
    cause = search(stylableChildren(document.documentElement), 0);
    if (cause) {
      note = "smallest subtree whose removal clears the overflow";
      const style = cause instanceof HTMLElement || cause instanceof SVGElement ? cause.style : null;
      if (style) {
        const value = style.getPropertyValue("display");
        const priority = style.getPropertyPriority("display");
        try {
          style.setProperty("display", "none", "important");
          const root = document.documentElement;
          confirmation = {
            hiddenScrollWidth: root.scrollWidth,
            hiddenClientWidth: root.clientWidth,
            clears: root.scrollWidth <= root.clientWidth,
          };
        } finally {
          if (value) style.setProperty("display", value, priority);
          else style.removeProperty("display");
        }
      }
    } else {
      cause = document.documentElement;
      note = "no smaller subtree cleared the overflow";
    }
  }

  const causePath = cause ? pathOf(cause) : null;
  const causeText = causePath
    ? textPast.filter((item) => item.parentPath === causePath || item.parentPath.startsWith(`${causePath} > `))
    : [];
  const after = read();

  return {
    edgePx: EDGE,
    document: before,
    restored:
      before.scrollWidth === after.scrollWidth &&
      before.clientWidth === after.clientWidth &&
      before.innerWidth === after.innerWidth,
    after,
    counts: {
      elements: elements.length,
      textNodes,
      pastEdge: pastEdge.length,
      scrollers: scrollers.length,
      textPast: textPast.length,
      subpixel,
    },
    pastEdge,
    scrollers,
    textPast,
    bisection: {
      note,
      bothHalves,
      confirmation,
      cause: cause ? identity(cause) : null,
      causeText,
    },
  };
}
