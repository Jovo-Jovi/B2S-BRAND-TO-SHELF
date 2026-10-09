"use client";

import { useState, type ReactNode } from "react";

import type { Locale } from "@/app/[locale]/dictionaries";
import type en from "@/app/[locale]/dictionaries/en.json";
import { EntryFrame } from "@/components/shared/entry-frame/entry-frame";
import { Button } from "@/components/ui/button/button";
import { Field } from "@/components/ui/field/field";
import { Glyph } from "@/components/ui/glyphs";
import { Notice } from "@/components/ui/notice/notice";
import { Tabs } from "@/components/ui/tabs/tabs";
import { TextField } from "@/components/ui/text-field/text-field";

import type { AccessErrorKey } from "../schema";

export type AccessCopy = (typeof en)["access"];

type SignInViewProps = {
  dictionary: AccessCopy;
  errorKey: AccessErrorKey | null;
  locale: Locale;
  returnPath?: string;
  wordmark: ReactNode;
  localeHref: string;
  localeCaption: string;
  signInAction: (formData: FormData) => void | Promise<void>;
  signUpAction: (formData: FormData) => void | Promise<void>;
  googleAction: (formData: FormData) => void | Promise<void>;
};

const FIELD_ERRORS = new Set<AccessErrorKey>(["email_invalid", "password_required"]);

function noticeFor(dictionary: AccessCopy, errorKey: AccessErrorKey) {
  if (errorKey === "identity_refused") {
    return { tone: "danger" as const, title: dictionary.identityNoticeTitle, icon: "danger" as const };
  }
  if (errorKey === "sign_in_refused") {
    return { tone: "danger" as const, title: dictionary.signInNoticeTitle, icon: "danger" as const };
  }
  if (errorKey === "oauth_cancelled") {
    return { tone: "info" as const, title: dictionary.cancelledNoticeTitle, icon: "check" as const };
  }
  return { tone: "warning" as const, title: dictionary.inputNoticeTitle, icon: "danger" as const };
}

export function SignInView({
  dictionary,
  errorKey,
  locale,
  returnPath,
  wordmark,
  localeHref,
  localeCaption,
  signInAction,
  signUpAction,
  googleAction,
}: SignInViewProps) {
  const [tab, setTab] = useState("sign-in");
  const emailError = errorKey === "email_invalid" ? dictionary.email_invalid : undefined;
  const passwordError = errorKey === "password_required" ? dictionary.password_required : undefined;
  const notice = errorKey && !FIELD_ERRORS.has(errorKey) ? noticeFor(dictionary, errorKey) : null;

  function googleForm() {
    return (
      <form action={googleAction}>
        <input type="hidden" name="locale" value={locale} />
        <Button type="submit" variant="secondary">
          {dictionary.googleSubmit}
        </Button>
      </form>
    );
  }

  function credentials(
    action: (formData: FormData) => void | Promise<void>,
    submit: string,
    autoComplete: "current-password" | "new-password",
    next?: string,
  ) {
    return (
      <form action={action}>
        <input type="hidden" name="locale" value={locale} />
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <Field caption={dictionary.emailLabel} error={emailError}>
          <TextField variant="email" name="email" autoComplete="username" required />
        </Field>
        <Field caption={dictionary.passwordLabel} error={passwordError}>
          <TextField variant="password" name="password" autoComplete={autoComplete} required />
        </Field>
        <Button type="submit" variant="primary">
          {submit}
        </Button>
      </form>
    );
  }

  return (
    <EntryFrame wordmark={wordmark} localeHref={localeHref} localeCaption={localeCaption}>
      {notice && errorKey ? (
        <Notice variant="inline" tone={notice.tone} title={notice.title} message={dictionary[errorKey]} icon={<Glyph name={notice.icon} />} />
      ) : null}
      <Tabs
        tabs={[
          {
            id: "sign-in",
            caption: dictionary.signInHeading,
            panel: (
              <>
                {googleForm()}
                <p>{dictionary.or}</p>
                {credentials(signInAction, dictionary.signInSubmit, "current-password", returnPath)}
              </>
            ),
          },
          {
            id: "create",
            caption: dictionary.signUpHeading,
            panel: (
              <>
                {googleForm()}
                <p>{dictionary.or}</p>
                {credentials(signUpAction, dictionary.signUpSubmit, "new-password")}
              </>
            ),
          },
        ]}
        selectedId={tab}
        onSelect={setTab}
      />
    </EntryFrame>
  );
}
