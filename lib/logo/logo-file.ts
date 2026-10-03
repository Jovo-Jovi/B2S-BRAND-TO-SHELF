import { DOMParser, XMLSerializer, type Document, type Element, type Node } from "@xmldom/xmldom";

// BRAND_CONFIG.md §9 amendment, 2026-10-03. 5 MB is 5 000 000 bytes: the
// platform's byte units are decimal SI (DESIGN_SURFACE.md §4 rule 6).
// This module reads bytes and returns bytes. It writes to nothing.

export const LOGO_MAXIMUM_BYTES = 5_000_000;
export const PNG_MINIMUM_SHORTER_SIDE = 1000;

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const FORBIDDEN_ELEMENTS = new Set(["script", "foreignobject", "iframe", "embed", "object"]);
const URL_ATTRIBUTES = new Set(["href", "src", "xlink:href"]);
const COMMENT = 8;
const ELEMENT = 1;

export type LogoFile =
  | { ok: true; format: "png" | "svg"; bytes: Uint8Array }
  | { ok: false; reason: "too-large"; maximumBytes: number; message: string }
  | { ok: false; reason: "not-svg-or-png"; message: string }
  | { ok: false; reason: "png-shorter-side"; minimumPixels: number; shorterSide: number; message: string }
  | { ok: false; reason: "active-content"; message: string };

export function inspectLogo(bytes: Uint8Array): LogoFile {
  if (bytes.byteLength > LOGO_MAXIMUM_BYTES) {
    return {
      ok: false,
      reason: "too-large",
      maximumBytes: LOGO_MAXIMUM_BYTES,
      message: "A logo file must be at most 5 MB.",
    };
  }
  if (isPng(bytes)) {
    return inspectPng(bytes);
  }
  return inspectSvg(bytes);
}

function isPng(bytes: Uint8Array): boolean {
  if (bytes.byteLength < PNG_SIGNATURE.length) {
    return false;
  }
  return PNG_SIGNATURE.every((byte, index) => bytes[index] === byte);
}

function inspectPng(bytes: Uint8Array): LogoFile {
  if (bytes.byteLength < 24) {
    return { ok: false, reason: "not-svg-or-png", message: "A logo file must be SVG or PNG." };
  }
  const chunk = String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15]);
  if (chunk !== "IHDR") {
    return { ok: false, reason: "not-svg-or-png", message: "A logo file must be SVG or PNG." };
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const width = view.getUint32(16);
  const height = view.getUint32(20);
  const shorterSide = Math.min(width, height);
  if (shorterSide < PNG_MINIMUM_SHORTER_SIDE) {
    return {
      ok: false,
      reason: "png-shorter-side",
      minimumPixels: PNG_MINIMUM_SHORTER_SIDE,
      shorterSide,
      message: `A PNG must be at least ${PNG_MINIMUM_SHORTER_SIDE} pixels on its shorter side.`,
    };
  }
  return { ok: true, format: "png", bytes };
}

function inspectSvg(bytes: Uint8Array): LogoFile {
  const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  if (/<!DOCTYPE|<!ENTITY|<\?xml-stylesheet/i.test(text)) {
    return active();
  }
  let document: Document;
  try {
    document = new DOMParser({
      onError: () => undefined,
    }).parseFromString(text, "image/svg+xml");
  } catch {
    return { ok: false, reason: "not-svg-or-png", message: "A logo file must be SVG or PNG." };
  }
  const root = document.documentElement;
  if (!root || localName(root) !== "svg") {
    return { ok: false, reason: "not-svg-or-png", message: "A logo file must be SVG or PNG." };
  }
  if (containsActiveContent(root)) {
    return active();
  }
  stripCommentsAndMetadata(root);
  const cleaned = new XMLSerializer().serializeToString(document);
  return { ok: true, format: "svg", bytes: new TextEncoder().encode(cleaned) };
}

function active(): LogoFile {
  return { ok: false, reason: "active-content", message: "This SVG contains active content." };
}

function localName(node: Element): string {
  const name = node.localName || node.nodeName || "";
  const bare = name.includes(":") ? name.slice(name.indexOf(":") + 1) : name;
  return bare.toLowerCase();
}

function attributeName(node: Node): string {
  const name = node.nodeName || "";
  return name.toLowerCase();
}

function containsActiveContent(root: Element): boolean {
  const pending: Node[] = [root];
  while (pending.length > 0) {
    const node = pending.pop();
    if (!node) {
      continue;
    }
    if (node.nodeType !== ELEMENT) {
      if (node.childNodes) {
        for (let index = 0; index < node.childNodes.length; index += 1) {
          pending.push(node.childNodes[index]);
        }
      }
      continue;
    }
    const element = node as Element;
    const name = localName(element);
    if (FORBIDDEN_ELEMENTS.has(name)) {
      return true;
    }
    if (element.attributes) {
      for (let index = 0; index < element.attributes.length; index += 1) {
        const attribute = element.attributes.item(index);
        if (!attribute) {
          continue;
        }
        const attr = attributeName(attribute);
        const bare = attr.includes(":") ? attr.slice(attr.lastIndexOf(":") + 1) : attr;
        if (bare.startsWith("on")) {
          return true;
        }
        if ((URL_ATTRIBUTES.has(attr) || URL_ATTRIBUTES.has(bare)) && activeUrl(attribute.nodeValue ?? "")) {
          return true;
        }
        if (bare === "style" && activeStyle(attribute.nodeValue ?? "")) {
          return true;
        }
      }
    }
    if ((name === "animate" || name === "set") && animatesActive(element)) {
      return true;
    }
    if (name === "style" && activeStyle(element.textContent ?? "")) {
      return true;
    }
    for (let index = 0; index < element.childNodes.length; index += 1) {
      pending.push(element.childNodes[index]);
    }
  }
  return false;
}

function animatesActive(element: Element): boolean {
  const target = (element.getAttribute("attributeName") ?? "").toLowerCase();
  const bare = target.includes(":") ? target.slice(target.lastIndexOf(":") + 1) : target;
  const values = ["to", "from", "values", "by"].map((name) => element.getAttribute(name) ?? "");
  if (bare.startsWith("on")) {
    return true;
  }
  if (URL_ATTRIBUTES.has(target) || URL_ATTRIBUTES.has(bare) || bare === "href") {
    return values.some((value) => value !== "" && activeUrl(value));
  }
  return values.some((value) => /javascript\s*:/i.test(value));
}

function activeUrl(value: string): boolean {
  const trimmed = value.trim();
  if (/javascript\s*:/i.test(trimmed)) {
    return true;
  }
  if (/^(?:https?:|ftp:|\/\/)/i.test(trimmed)) {
    return true;
  }
  if (/^data:/i.test(trimmed)) {
    return !/^data:image\/(?:png|jpeg)[;,]/i.test(trimmed);
  }
  return false;
}

function activeStyle(value: string): boolean {
  return /@import|javascript\s*:|expression\s*\(|url\s*\(\s*['"]?\s*(?:https?:|ftp:|\/\/|data:(?!image\/(?:png|jpeg)))/i.test(value);
}

function stripCommentsAndMetadata(node: Node) {
  if (!node.childNodes) {
    return;
  }
  for (let index = node.childNodes.length - 1; index >= 0; index -= 1) {
    const child = node.childNodes[index];
    if (child.nodeType === COMMENT) {
      node.removeChild(child);
      continue;
    }
    if (child.nodeType === ELEMENT && localName(child as Element) === "metadata") {
      node.removeChild(child);
      continue;
    }
    stripCommentsAndMetadata(child);
  }
}
