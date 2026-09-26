// @vitest-environment jsdom
import { act } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { Glyph } from "../glyphs";
import { mount } from "../mount";
import { Notice, NoticeRegion } from "./notice";

const icon = <Glyph name="check" />;

describe("Notice", () => {
  it("renders every enforced state in both locales", () => {
    const states = ["default", "hover", "focus", "error"] as const;
    for (const state of states) {
      for (const locale of ["en", "ar"] as const) {
        const html = renderToStaticMarkup(
          <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
            <Notice
              variant="inline"
              tone={state === "error" ? "danger" : "info"}
              state={state}
              title="Saved"
              message="The line is stored"
              icon={icon}
              requestIdentifier={state === "error" ? "req-14" : undefined}
              copyCaption="Copy"
              dismissCaption="Dismiss"
            />
          </div>,
        );
        expect(html).toContain(`data-state="${state}"`);
        expect(html).toContain(`lang="${locale}"`);
        expect(html).toContain("Saved");
        if (state === "error") {
          expect(html).toContain('dir="ltr"');
          expect(html).toContain("req-14");
        }
      }
    }
  });

  it("offers toast and inline, and stacks at most three", () => {
    for (const variant of ["toast", "inline"] as const) {
      const html = renderToStaticMarkup(
        <Notice variant={variant} tone="success" title="Saved" message="Stored" icon={icon} />,
      );
      expect(html).toContain(`data-variant="${variant}"`);
    }
    const html = renderToStaticMarkup(
      <NoticeRegion>
        <Notice variant="toast" tone="success" title="One" message="Stored" icon={icon} />
        <Notice variant="toast" tone="info" title="Two" message="Stored" icon={icon} />
        <Notice variant="toast" tone="warning" title="Three" message="Stored" icon={icon} />
        <Notice variant="toast" tone="danger" title="Four" message="Stored" icon={icon} />
      </NoticeRegion>,
    );
    expect(html).toContain("One");
    expect(html).toContain("Three");
    expect(html).not.toContain("Four");
  });

  it("dismisses success after the token and pauses while hovered", async () => {
    document.documentElement.style.setProperty("--b2s-notice-dismiss", "1000ms");
    vi.useFakeTimers();
    let dismissed = 0;
    const view = await mount(
      <Notice
        variant="toast"
        tone="success"
        title="Saved"
        message="Stored"
        icon={icon}
        onDismiss={() => {
          dismissed += 1;
        }}
      />,
    );
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(dismissed).toBe(1);
    await view.unmount();

    dismissed = 0;
    const paused = await mount(
      <Notice
        variant="toast"
        tone="info"
        title="Saved"
        message="Stored"
        icon={icon}
        onDismiss={() => {
          dismissed += 1;
        }}
      />,
    );
    const root = paused.host.querySelector("[data-variant=toast]");
    root?.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(dismissed).toBe(0);
    root?.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(dismissed).toBe(1);
    await paused.unmount();
    vi.useRealTimers();
  });

  it("keeps warning and danger until dismissed", async () => {
    document.documentElement.style.setProperty("--b2s-notice-dismiss", "1000ms");
    vi.useFakeTimers();
    let dismissed = 0;
    const view = await mount(
      <Notice
        variant="toast"
        tone="danger"
        title="Not saved"
        message="Try again"
        icon={<Glyph name="danger" />}
        requestIdentifier="req-14"
        copyCaption="Copy"
        dismissCaption="Dismiss"
        onDismiss={() => {
          dismissed += 1;
        }}
      />,
    );
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    expect(dismissed).toBe(0);
    view.host.querySelector("[data-variant=toast]")?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    expect(dismissed).toBe(1);
    const isolated = view.host.querySelector("[dir=ltr]");
    expect(isolated?.textContent).toBe("req-14");
    await view.unmount();
    vi.useRealTimers();
  });
});
