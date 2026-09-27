// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { formatByteSize, formatProgress } from "../../../lib/locale/format-number";
import { byteUnits, dateNames } from "../data-catalog";
import { mount } from "../mount";
import { FileDrop, type FileDropCopy, type FileDropVisual } from "./file-drop";

function copy(locale: "en" | "ar"): FileDropCopy {
  return {
    instruction: "Choose a file",
    dropInstruction: "Drop to upload",
    browse: "Browse",
    acceptedTypes: "PNG",
    percentPattern: dateNames(locale).percent,
    retry: "Retry",
    replace: "Replace",
    remove: "Remove",
    typeError: "That type is not accepted",
    sizeError: "That file is too large",
    failureError: "That file failed",
  };
}

const doneFile = {
  id: "file-1",
  name: "pack.png",
  sizeBytes: 1000,
  phase: "done" as const,
};

describe("FileDrop", () => {
  it("renders every enforced state in both locales", () => {
    const states = ["default", "hover", "focus", "active", "disabled", "loading", "error", "empty", "done"] as const;
    for (const state of states) {
      for (const locale of ["en", "ar"] as const) {
        const files =
          state === "loading"
            ? [{ id: "file-1", name: "pack.png", sizeBytes: 1250000, phase: "uploading" as const, progress: 0.5 }]
            : state === "error"
              ? [{ id: "file-1", name: "pack.png", sizeBytes: 1000, phase: "error" as const, error: "type" as const }, doneFile]
              : state === "done"
                ? [doneFile]
                : [];
        const html = renderToStaticMarkup(
          <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
            <FileDrop
              locale={locale}
              units={byteUnits(locale)}
              copy={copy(locale)}
              state={state as FileDropVisual}
              sizeLimit={2500000000}
              files={files}
              disabled={state === "disabled"}
            />
          </div>,
        );
        expect(html).toContain(`data-state="${state}"`);
        expect(html).toContain(`lang="${locale}"`);
        expect(html).toContain("Browse");
        expect(html).toContain(formatByteSize(2500000000, locale, byteUnits(locale)));
        if (state === "active") {
          expect(html).toContain("Drop to upload");
        }
        if (state === "loading") {
          expect(html).toContain('role="progressbar"');
          expect(html).toContain(formatProgress(0.5, locale));
          expect(html).toContain('dir="ltr"');
        }
        if (state === "done") {
          expect(html).toContain("pack.png");
          expect(html).toContain('dir="ltr"');
          expect(html).toContain("Replace");
          expect(html).toContain("Remove");
        }
        if (state === "error") {
          expect(html).toContain("That type is not accepted");
          expect(html).toContain("Retry");
          expect(html).toContain("pack.png");
        }
      }
    }
  });

  it("offers both variants and keeps browse working while a file is dragged", async () => {
    for (const variant of ["single", "multiple"] as const) {
      const html = renderToStaticMarkup(
        <FileDrop locale="en" units={byteUnits("en")} copy={copy("en")} variant={variant} sizeLimit={1000} />,
      );
      expect(html).toContain(`data-variant="${variant}"`);
      expect(html).toContain('data-density="comfortable"');
      expect(html).toContain(variant === "multiple" ? "multiple" : "type=\"file\"");
    }
    let chosen = 0;
    const view = await mount(
      <FileDrop
        locale="en"
        units={byteUnits("en")}
        copy={copy("en")}
        state="active"
        sizeLimit={1000}
        onChoose={() => {
          chosen += 1;
        }}
      />,
    );
    const browse = [...view.host.querySelectorAll("button")].find((button) => button.textContent === "Browse");
    expect(browse?.hasAttribute("disabled")).toBe(false);
    const input = view.host.querySelector("input[type='file']") as HTMLInputElement;
    const file = new File(["pack"], "pack.png", { type: "image/png" });
    Object.defineProperty(input, "files", { value: [file] });
    input.dispatchEvent(new Event("change", { bubbles: true }));
    expect(chosen).toBe(1);
    await view.unmount();
  });

  it("shows processing without a percentage and leaves the other file alone", () => {
    const html = renderToStaticMarkup(
      <FileDrop
        locale="ar"
        units={byteUnits("ar")}
        copy={copy("ar")}
        sizeLimit={999}
        files={[
          { id: "a", name: "one.png", sizeBytes: 999, phase: "processing" },
          { id: "b", name: "two.png", sizeBytes: 1000, phase: "done" },
        ]}
      />,
    );
    expect(html).toContain("one.png");
    expect(html).toContain("two.png");
    expect(html).toContain(formatByteSize(999, "ar", byteUnits("ar")));
    expect(html).not.toContain('aria-valuenow');
    expect(html).toContain("Replace");
  });
});
