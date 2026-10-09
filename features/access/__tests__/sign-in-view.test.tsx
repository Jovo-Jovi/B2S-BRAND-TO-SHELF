import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { SignInView } from "../components/sign-in-view";
import en from "../../../app/[locale]/dictionaries/en.json";
import ar from "../../../app/[locale]/dictionaries/ar.json";
import { ACCESS_ERROR_KEYS } from "../schema";

const noop = async () => {};

const frame = {
  wordmark: <p>B2S</p>,
  localeHref: "/ar/sign-in",
  localeCaption: "Arabic",
};

describe("SignInView", () => {
  it("renders English copy from the catalog and no alert when there is no error", () => {
    const html = renderToStaticMarkup(
      <SignInView
        dictionary={en.access}
        errorKey={null}
        locale="en"
        {...frame}
        signInAction={noop}
        signUpAction={noop}
        googleAction={noop}
      />,
    );

    expect(html).toContain('data-composition="EntryFrame"');
    expect(html).toContain(en.access.signInHeading);
    expect(html).toContain(en.access.signUpHeading);
    expect(html).toContain(en.access.signInSubmit);
    expect(html).toContain(en.access.signUpSubmit);
    expect(html).toContain(en.access.googleSubmit);
    expect(html).toContain(en.access.or);
    expect(html).toContain('type="password"');
    expect(html).toContain('autoComplete="current-password"');
    expect(html).toContain('autoComplete="new-password"');
    expect(html).not.toContain('role="alert"');
    expect(html).not.toContain("<img");
    expect(html).toContain('name="locale"');
    expect(html).toContain('value="en"');
  });

  it("renders Arabic copy from the catalog", () => {
    const html = renderToStaticMarkup(
      <SignInView
        dictionary={ar.access}
        errorKey={null}
        locale="ar"
        wordmark={<p>B2S</p>}
        localeHref="/en/sign-in"
        localeCaption="English"
        signInAction={noop}
        signUpAction={noop}
        googleAction={noop}
      />,
    );

    expect(html).toContain(ar.access.signInSubmit);
    expect(html).toContain(ar.access.signUpSubmit);
    expect(html).toContain(ar.access.googleSubmit);
    expect(html).toContain(ar.access.or);
    expect(html).toContain('value="ar"');
  });

  it("shows the identity-refused catalog string and does not include held-address wording", () => {
    const html = renderToStaticMarkup(
      <SignInView
        dictionary={en.access}
        errorKey="identity_refused"
        locale="en"
        {...frame}
        signInAction={noop}
        signUpAction={noop}
        googleAction={noop}
      />,
    );

    expect(html).toContain('role="alert"');
    expect(html).toContain('data-tone="danger"');
    expect(html).toContain(en.access.identity_refused);
    expect(html).toContain(en.access.identityNoticeTitle);
    expect(html.toLowerCase()).not.toContain("already held");
    expect(html.toLowerCase()).not.toContain("already registered");
    expect(html.toLowerCase()).not.toContain("no account");
  });

  it("uses the same danger notice for a refused sign-in and keeps a field error inline", () => {
    const refused = renderToStaticMarkup(
      <SignInView
        dictionary={en.access}
        errorKey="sign_in_refused"
        locale="en"
        {...frame}
        signInAction={noop}
        signUpAction={noop}
        googleAction={noop}
      />,
    );
    expect(refused).toContain(en.access.sign_in_refused);
    expect(refused).toContain('data-tone="danger"');
    expect(refused.toLowerCase()).not.toContain("not found");
    expect(refused.toLowerCase()).not.toContain("does not exist");

    const invalid = renderToStaticMarkup(
      <SignInView
        dictionary={en.access}
        errorKey="email_invalid"
        locale="en"
        {...frame}
        signInAction={noop}
        signUpAction={noop}
        googleAction={noop}
      />,
    );
    expect(invalid).toContain(en.access.email_invalid);
    expect(invalid).not.toContain('data-tone="danger"');
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
