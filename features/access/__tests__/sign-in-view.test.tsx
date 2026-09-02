import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { SignInView } from "../components/sign-in-view";
import en from "../../../app/[locale]/dictionaries/en.json";
import ar from "../../../app/[locale]/dictionaries/ar.json";
import { ACCESS_ERROR_KEYS } from "../schema";

const noop = async () => {};

describe("SignInView", () => {
  it("renders English copy from the catalog and no alert when there is no error", () => {
    const html = renderToStaticMarkup(
      <SignInView
        dictionary={en.access}
        errorKey={null}
        locale="en"
        signInAction={noop}
        signUpAction={noop}
        googleAction={noop}
      />,
    );

    expect(html).toContain(en.access.title);
    expect(html).toContain(en.access.signInSubmit);
    expect(html).toContain(en.access.signUpSubmit);
    expect(html).toContain(en.access.googleSubmit);
    expect(html).not.toContain('role="alert"');
    expect(html).toContain('name="locale"');
    expect(html).toContain('value="en"');
  });

  it("renders Arabic copy from the catalog", () => {
    const html = renderToStaticMarkup(
      <SignInView
        dictionary={ar.access}
        errorKey={null}
        locale="ar"
        signInAction={noop}
        signUpAction={noop}
        googleAction={noop}
      />,
    );

    expect(html).toContain(ar.access.title);
    expect(html).toContain(ar.access.signInSubmit);
    expect(html).toContain(ar.access.googleSubmit);
    expect(html).toContain('value="ar"');
  });

  it("shows the identity-refused catalog string and does not include held-address wording", () => {
    const html = renderToStaticMarkup(
      <SignInView
        dictionary={en.access}
        errorKey="identity_refused"
        locale="en"
        signInAction={noop}
        signUpAction={noop}
        googleAction={noop}
      />,
    );

    expect(html).toContain('role="alert"');
    expect(html).toContain(en.access.identity_refused);
    expect(html.toLowerCase()).not.toContain("already held");
    expect(html.toLowerCase()).not.toContain("already registered");
  });
});

describe("access catalogs", () => {
  it("keep the same keys in en and ar, including every error key", () => {
    expect(Object.keys(en.access).sort()).toEqual(Object.keys(ar.access).sort());
    for (const key of ACCESS_ERROR_KEYS) {
      expect(en.access[key].length).toBeGreaterThan(0);
      expect(ar.access[key].length).toBeGreaterThan(0);
    }
  });
});
