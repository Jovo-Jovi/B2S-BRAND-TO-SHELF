import type { Locale } from "@/app/[locale]/dictionaries";

import type { AccessErrorKey } from "../schema";

export type AccessCopy = {
  title: string;
  signInHeading: string;
  signUpHeading: string;
  emailLabel: string;
  passwordLabel: string;
  signInSubmit: string;
  signUpSubmit: string;
  googleSubmit: string;
  identity_refused: string;
  sign_in_refused: string;
  email_invalid: string;
  password_required: string;
  locale_invalid: string;
  oauth_cancelled: string;
  input_invalid: string;
};

type SignInViewProps = {
  dictionary: AccessCopy;
  errorKey: AccessErrorKey | null;
  locale: Locale;
  signInAction: (formData: FormData) => void | Promise<void>;
  signUpAction: (formData: FormData) => void | Promise<void>;
  googleAction: (formData: FormData) => void | Promise<void>;
};

export function SignInView({
  dictionary,
  errorKey,
  locale,
  signInAction,
  signUpAction,
  googleAction,
}: SignInViewProps) {
  const errorText = errorKey ? dictionary[errorKey] : null;

  return (
    <main>
      <h1>{dictionary.title}</h1>
      {errorText ? <p role="alert">{errorText}</p> : null}

      <section>
        <h2>{dictionary.signInHeading}</h2>
        <form action={signInAction}>
          <input type="hidden" name="locale" value={locale} />
          <p>
            <label>
              {dictionary.emailLabel}
              <input type="email" name="email" autoComplete="username" required />
            </label>
          </p>
          <p>
            <label>
              {dictionary.passwordLabel}
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
              />
            </label>
          </p>
          <p>
            <button type="submit">{dictionary.signInSubmit}</button>
          </p>
        </form>
      </section>

      <section>
        <h2>{dictionary.signUpHeading}</h2>
        <form action={signUpAction}>
          <input type="hidden" name="locale" value={locale} />
          <p>
            <label>
              {dictionary.emailLabel}
              <input type="email" name="email" autoComplete="username" required />
            </label>
          </p>
          <p>
            <label>
              {dictionary.passwordLabel}
              <input
                type="password"
                name="password"
                autoComplete="new-password"
                required
              />
            </label>
          </p>
          <p>
            <button type="submit">{dictionary.signUpSubmit}</button>
          </p>
        </form>
      </section>

      <section>
        <form action={googleAction}>
          <input type="hidden" name="locale" value={locale} />
          <p>
            <button type="submit">{dictionary.googleSubmit}</button>
          </p>
        </form>
      </section>
    </main>
  );
}
