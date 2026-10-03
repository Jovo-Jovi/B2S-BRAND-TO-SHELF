// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Glyph } from "./glyphs";
import styles from "./glyphs.module.css";

describe("icon registry", () => {
  it("flips a mirroring glyph under dir=rtl and leaves a never-mirror glyph", () => {
    const previous = renderToStaticMarkup(
      <div dir="rtl">
        <Glyph name="previous" />
      </div>,
    );
    const next = renderToStaticMarkup(
      <div dir="rtl">
        <Glyph name="next" />
      </div>,
    );
    const check = renderToStaticMarkup(
      <div dir="rtl">
        <Glyph name="check" />
      </div>,
    );
    expect(previous).toContain('data-mirrors="true"');
    expect(previous).toContain(styles.mirrors);
    expect(previous).toContain('data-glyph="previous"');
    expect(next).toContain('data-mirrors="true"');
    expect(check).toContain('data-mirrors="false"');
    const css = readFileSync("components/ui/glyphs.module.css", "utf8");
    expect(css).toContain('[dir="rtl"]');
    expect(css).toContain("scaleX(-1)");
    expect(css).not.toMatch(/\bleft\b|\bright\b/);
  });
});
