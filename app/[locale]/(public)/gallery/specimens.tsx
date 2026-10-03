import type { CSSProperties } from "react";

import styles from "@/components/ui/brand-frame/brand-frame.module.css";
import { markGround } from "@/lib/colour/contrast";
import { fillPattern } from "@/lib/locale/format-number";

export type SpecimenMark = {
  ground: "light" | "dark";
  src: string;
  kind?: "full" | "mark" | "wordmark";
};

export type SpecimenCopy = {
  product: string;
  weight: string;
  missingMark: string;
  groundLight: string;
  groundDark: string;
};

type SpecimenProps = {
  defaultLocale: "en" | "ar";
  names: { en: string; ar: string };
  primary: string;
  marks: SpecimenMark[];
  copy: SpecimenCopy;
};

const RULE_BLOCK: CSSProperties = { blockSize: "var(--b2s-preview-rule-block)" };

function scriptClass(locale: "en" | "ar", kind: "heading" | "body" | "sticker"): string {
  if (kind === "body") {
    return locale === "ar" ? styles.bodyArabic : styles.bodyLatin;
  }
  if (kind === "sticker") {
    return locale === "ar" ? styles.stickerArabic : styles.stickerLatin;
  }
  return locale === "ar" ? styles.scriptArabic : styles.scriptLatin;
}

function direction(locale: "en" | "ar"): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function markForGround(primary: string, marks: SpecimenMark[]): SpecimenMark | null {
  if (!primary) {
    return null;
  }
  const ground = markGround(primary);
  const sameGround = marks.filter((item) => item.ground === ground);
  const kindOf = (item: SpecimenMark) => item.kind ?? "mark";
  return sameGround.find((item) => kindOf(item) === "mark") ?? sameGround.find((item) => kindOf(item) === "full") ?? null;
}

export function missingMarkNote(primary: string, marks: SpecimenMark[], copy: SpecimenCopy): string | null {
  if (!primary) {
    return null;
  }
  if (markForGround(primary, marks)) {
    return null;
  }
  const ground = markGround(primary);
  const name = ground === "dark" ? copy.groundDark : copy.groundLight;
  return fillPattern(copy.missingMark, { ground: name });
}

function LogoSlot({ mark }: { mark: SpecimenMark | null }) {
  if (!mark) {
    return <span data-part="logo-slot" />;
  }
  return <img data-part="logo-slot" alt="" src={mark.src} />;
}

export function LabelSpecimen({ defaultLocale, names, primary, marks, copy }: SpecimenProps) {
  const other = defaultLocale === "en" ? "ar" : "en";
  const mark = markForGround(primary, marks);
  return (
    <div className={styles.label} data-specimen="label" dir={direction(defaultLocale)}>
      <div className={styles.band} data-part="band" data-role="primary" data-output-mark="band">
        <span className={styles.mark}>
          <LogoSlot mark={mark} />
        </span>
      </div>
      <div className={styles.panel} data-part="panel" data-role="background">
        <p className={scriptClass(defaultLocale, "heading")} data-part="name" data-role="foreground" lang={defaultLocale} dir={direction(defaultLocale)}>
          {names[defaultLocale]}
        </p>
        <p
          className={`${scriptClass(other, "heading")} ${styles.otherName}`}
          data-part="name-other"
          data-role="foreground"
          lang={other}
          dir={direction(other)}
        >
          {names[other]}
        </p>
        <span className={styles.rule} data-part="rule" data-role="accent" style={RULE_BLOCK} />
        <p className={scriptClass(defaultLocale, "body")} data-part="product" data-role="muted" lang={defaultLocale} dir={direction(defaultLocale)}>
          {copy.product}
        </p>
        <p className={scriptClass(defaultLocale, "body")} data-part="weight" data-role="muted" lang={defaultLocale} dir={direction(defaultLocale)}>
          {copy.weight}
        </p>
      </div>
      <span className={styles.strip} data-part="strip" data-role="secondary" data-output-mark="strip" />
    </div>
  );
}

export function StickerSpecimen({ defaultLocale, names, primary, marks }: SpecimenProps) {
  const mark = markForGround(primary, marks);
  return (
    <div className={styles.sticker} data-specimen="sticker" dir={direction(defaultLocale)}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle className={styles.disc} data-part="disc" data-role="primary" data-output-mark="disc" cx="50" cy="50" r="50" />
        <circle className={styles.ring} data-part="ring" data-role="accent" cx="50" cy="50" r="42" fill="none" strokeWidth="4" />
      </svg>
      <div className={styles.stickerCenter}>
        <span className={styles.stickerMark}>
          <LogoSlot mark={mark} />
        </span>
        <p
          className={scriptClass(defaultLocale, "sticker")}
          data-part="sticker-name"
          data-role="background"
          lang={defaultLocale}
          dir={direction(defaultLocale)}
        >
          {names[defaultLocale]}
        </p>
      </div>
    </div>
  );
}
