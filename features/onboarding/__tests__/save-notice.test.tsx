import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { SaveNotice, saveKind } from "../components/save-notice";

describe("SaveNotice", () => {
  it("announces a successful save as a polite success notice", () => {
    const html = renderToStaticMarkup(
      <SaveNotice
        kind="saved"
        savedTitle="Saved"
        savedMessage="Saved. You can leave and return here later."
        failedTitle="Not saved"
        failedMessage="The Brand could not be saved."
      />,
    );
    expect(html).toContain('role="status"');
    expect(html).toContain('data-tone="success"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain("You can leave and return here later.");
  });

  it("names the step when a save fails", () => {
    const html = renderToStaticMarkup(
      <SaveNotice
        kind="failed"
        savedTitle="Saved"
        savedMessage="Saved. You can leave and return here later."
        failedTitle="Not saved"
        failedMessage="The Brand could not be saved."
      />,
    );
    expect(html).toContain('role="alert"');
    expect(html).toContain('data-tone="danger"');
    expect(html).toContain("The Brand could not be saved.");
  });

  it("renders nothing until there is a result", () => {
    const html = renderToStaticMarkup(
      <SaveNotice
        kind={null}
        savedTitle="Saved"
        savedMessage="Saved."
        failedTitle="Not saved"
        failedMessage="The Brand could not be saved."
      />,
    );
    expect(html).toBe("");
  });

  it("treats a refused save as a failure and a stored save as success", () => {
    expect(saveKind("save", { notice: "saved", gaps: [] })).toBe("saved");
    expect(saveKind("save", { notice: null, gaps: ["refused"] })).toBe("failed");
    expect(saveKind("continue", { notice: null, gaps: ["name-en"] })).toBe(null);
  });
});
