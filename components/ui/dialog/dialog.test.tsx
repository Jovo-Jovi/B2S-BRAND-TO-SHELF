// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Button } from "../button/button";
import { mount } from "../mount";
import { Dialog } from "./dialog";

const failure = {
  title: "Not saved",
  message: "Try again",
  requestIdentifier: "req-14",
  copyCaption: "Copy",
  dismissCaption: "Dismiss",
};

function dialog(state: "default" | "focus" | "loading" | "error") {
  return (
    <Dialog
      open
      variant={state === "loading" ? "confirmation" : "standard"}
      size="medium"
      state={state}
      title="Archive the line"
      description="It can be restored"
      closeCaption="Close"
      onClose={() => undefined}
      failure={state === "error" ? failure : undefined}
      footer={
        <Button type="button" loading={state === "loading"}>
          Keep
        </Button>
      }
    >
      Body
    </Dialog>
  );
}

describe("Dialog", () => {
  it("renders every enforced state in both locales", () => {
    const states = ["default", "focus", "loading", "error"] as const;
    for (const state of states) {
      for (const locale of ["en", "ar"] as const) {
        const html = renderToStaticMarkup(
          <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
            {dialog(state)}
          </div>,
        );
        expect(html).toContain(`data-state="${state}"`);
        expect(html).toContain(`lang="${locale}"`);
        expect(html).toContain("Archive the line");
        expect(html).toContain("<dialog");
      }
    }
  });

  it("offers the declared variants and sizes, and uses the scrim and the sheet", () => {
    for (const variant of ["standard", "confirmation"] as const) {
      const html = renderToStaticMarkup(
        <Dialog
          open
          variant={variant}
          size="small"
          title="Archive the line"
          closeCaption="Close"
          onClose={() => undefined}
          footer={<Button type="button">Keep</Button>}
        >
          Body
        </Dialog>,
      );
      expect(html).toContain(`data-variant="${variant}"`);
    }
    for (const size of ["small", "medium", "large"] as const) {
      const html = renderToStaticMarkup(
        <Dialog
          open
          variant="standard"
          size={size}
          title="Archive the line"
          closeCaption="Close"
          onClose={() => undefined}
          footer={<Button type="button">Keep</Button>}
        >
          Body
        </Dialog>,
      );
      expect(html).toContain(`data-size="${size}"`);
    }
    const css = readFileSync("components/ui/dialog/dialog.module.css", "utf8");
    expect(css).toContain("var(--b2s-color-scrim)");
    expect(css).toContain("var(--b2s-layer-dialog)");
    expect(css).toContain("var(--b2s-layer-scrim)");
    expect(css).toContain("width < 640px");
    expect(css).toContain("block-size: 100%");
  });

  it("focuses the least destructive action on a confirmation and does not stack", async () => {
    let secondClosed = 0;
    const view = await mount(
      <div>
        <Dialog
          open
          variant="confirmation"
          size="small"
          title="Archive the line"
          closeCaption="Close"
          onClose={() => undefined}
          footer={
            <>
              <Button type="button">Keep</Button>
              <Button type="button" variant="danger">
                Archive
              </Button>
            </>
          }
        >
          Body
        </Dialog>
        <Dialog
          open
          variant="standard"
          size="small"
          title="Second"
          closeCaption="Close"
          onClose={() => {
            secondClosed += 1;
          }}
          footer={<Button type="button">Keep</Button>}
        >
          Other
        </Dialog>
      </div>,
    );
    const dialogs = [...view.host.querySelectorAll("dialog")];
    expect(dialogs[0]?.open).toBe(true);
    const keep = view.host.querySelector("[data-dialog-footer] button");
    expect(document.activeElement).toBe(keep);
    expect(secondClosed).toBeGreaterThan(0);
    await view.unmount();
  });
});
