import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { inspectLogo, LOGO_MAXIMUM_BYTES, PNG_MINIMUM_SHORTER_SIDE } from "../lib/logo/logo-file";

const NS = "http://www.w3.org/2000/svg";
const XLINK = "http://www.w3.org/1999/xlink";

function svg(body: string, root = ""): Uint8Array {
  return new TextEncoder().encode(`<svg xmlns="${NS}" ${root}>${body}</svg>`);
}

function png(width: number, height: number): Uint8Array {
  const bytes = new Uint8Array(24);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d], 0);
  bytes.set([0x49, 0x48, 0x44, 0x52], 12);
  const view = new DataView(bytes.buffer);
  view.setUint32(16, width);
  view.setUint32(20, height);
  return bytes;
}

const corpus: { name: string; bytes: Uint8Array }[] = [
  { name: "script element", bytes: svg("<script>alert(1)</script><circle r='1'/>") },
  { name: "event-handler attribute", bytes: svg("<circle r='1'/>", "onload=\"alert(1)\"") },
  { name: "javascript href", bytes: svg(`<a href="javascript:alert(1)"><circle r='1'/></a>`) },
  { name: "javascript xlink:href", bytes: svg(`<a xmlns:xlink="${XLINK}" xlink:href="javascript:alert(1)"><circle r='1'/></a>`) },
  { name: "data url carrying script", bytes: svg(`<image href="data:image/svg+xml,&lt;svg xmlns='${NS}'&gt;&lt;script&gt;alert(1)&lt;/script&gt;&lt;/svg&gt;"/>`) },
  { name: "foreignObject", bytes: svg("<foreignObject><span/></foreignObject>") },
  { name: "iframe", bytes: svg("<iframe src='about:blank'/>") },
  { name: "embed", bytes: svg("<embed src='https://example.com/a.svg'/>") },
  { name: "object", bytes: svg("<object data='https://example.com/a.svg'/>") },
  { name: "use referring to a remote resource", bytes: svg("<use href='https://example.com/a.svg#x'/>") },
  { name: "image referring to a remote resource", bytes: svg("<image href='https://example.com/a.png'/>") },
  { name: "style importing a remote resource", bytes: svg("<style>@import url(https://example.com/a.css);</style>") },
  {
    name: "doctype with entities",
    bytes: new TextEncoder().encode(
      `<!DOCTYPE svg [<!ENTITY a "lol"><!ENTITY b "&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;"><!ENTITY c "&b;&b;&b;&b;&b;&b;&b;&b;&b;&b;">]><svg xmlns="${NS}">&c;</svg>`,
    ),
  },
  { name: "animate changing an href to javascript", bytes: svg("<animate attributeName='href' to='javascript:alert(1)'/>") },
  { name: "set changing an href to javascript", bytes: svg("<set attributeName='href' to='javascript:alert(1)'/>") },
  { name: "xml-stylesheet", bytes: new TextEncoder().encode(`<?xml-stylesheet href="https://example.com/a.css"?><svg xmlns="${NS}"/>`) },
  { name: "feImage remote", bytes: svg("<filter><feImage href='https://example.com/a.png'/></filter>") },
  {
    name: "script in another namespace",
    bytes: svg(`<script xmlns="http://www.w3.org/1999/xhtml">alert(1)</script>`),
  },
  { name: "set of an event handler", bytes: svg("<set attributeName='onload' to='alert(1)'/>") },
];

describe("logo file", () => {
  it.each(corpus)("refuses $name", ({ bytes }) => {
    const result = inspectLogo(bytes);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("active-content");
      expect(result.message).toContain("active content");
    }
  });

  it("removes comments and metadata and keeps the drawing", () => {
    const result = inspectLogo(
      svg("<title>Mark</title><!-- note --><metadata>secret</metadata><circle r='8'/>"),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      const text = new TextDecoder().decode(result.bytes);
      expect(text).not.toContain("note");
      expect(text).not.toContain("metadata");
      expect(text).not.toContain("secret");
      expect(text).toContain("<circle");
      expect(text).toContain("<title");
    }
  });

  it("keeps a known-good logo", () => {
    const original = readFileSync("public/gallery/sample-mark-dark.svg");
    const result = inspectLogo(original);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.format).toBe("svg");
      expect(new TextDecoder().decode(result.bytes)).toContain("<circle");
    }
  });

  it("identifies a PNG from its bytes and accepts 1000 pixels on the shorter side", () => {
    const result = inspectLogo(png(1000, 1400));
    expect(result).toMatchObject({ ok: true, format: "png" });
  });

  it("refuses a PNG under 1000 pixels on the shorter side and names the minimum", () => {
    const result = inspectLogo(png(999, 2000));
    expect(result.ok).toBe(false);
    if (!result.ok && result.reason === "png-shorter-side") {
      expect(result.minimumPixels).toBe(PNG_MINIMUM_SHORTER_SIDE);
      expect(result.shorterSide).toBe(999);
      expect(result.message).toContain(String(PNG_MINIMUM_SHORTER_SIDE));
    } else {
      expect(result).toMatchObject({ reason: "png-shorter-side" });
    }
  });

  it("refuses a file over 5 MB on both paths", () => {
    const pngBytes = new Uint8Array(LOGO_MAXIMUM_BYTES + 1);
    pngBytes.set(png(1000, 1000));
    const svgBytes = new Uint8Array(LOGO_MAXIMUM_BYTES + 1);
    svgBytes.set(svg("<circle r='1'/>"));
    for (const bytes of [pngBytes, svgBytes]) {
      const result = inspectLogo(bytes);
      expect(result).toMatchObject({ ok: false, reason: "too-large", maximumBytes: LOGO_MAXIMUM_BYTES });
    }
    const exact = new Uint8Array(LOGO_MAXIMUM_BYTES);
    exact.set(png(1000, 1000));
    expect(inspectLogo(exact)).toMatchObject({ ok: true, format: "png" });
  });

  it("does not trust a file name or a claimed type, because it is never given one", () => {
    const result = inspectLogo(svg("<circle r='1'/>"));
    expect(result).toMatchObject({ ok: true, format: "svg" });
    expect(inspectLogo(new Uint8Array([1, 2, 3, 4]))).toMatchObject({ reason: "not-svg-or-png" });
  });
});
