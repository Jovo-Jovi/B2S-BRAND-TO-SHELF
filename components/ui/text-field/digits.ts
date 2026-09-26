// TextField number, DESIGN_SURFACE.md TextField `number`:
// U+0660–U+0669 and U+06F0–U+06F9 become the Latin digits 0–9.
// U+066B becomes ".". U+066C and "," are grouping and are removed.
// Identifier values never pass through here.

const ARABIC_INDIC_ZERO = 0x0660;
const EXTENDED_ARABIC_INDIC_ZERO = 0x06f0;
const ARABIC_DECIMAL_SEPARATOR = 0x066b;
const ARABIC_THOUSANDS_SEPARATOR = 0x066c;

export const IDENTIFIER_DIGIT_ERROR = "arabic_indic_digit";

function isArabicIndic(code: number): boolean {
  return (
    (code >= ARABIC_INDIC_ZERO && code <= ARABIC_INDIC_ZERO + 9) ||
    (code >= EXTENDED_ARABIC_INDIC_ZERO && code <= EXTENDED_ARABIC_INDIC_ZERO + 9)
  );
}

export function hasArabicIndicDigit(value: string): boolean {
  for (const char of value) {
    const code = char.codePointAt(0);
    if (code !== undefined && isArabicIndic(code)) {
      return true;
    }
  }
  return false;
}

function latinDigits(value: string): string {
  let out = "";
  for (const char of value) {
    const code = char.codePointAt(0);
    if (code === undefined) {
      continue;
    }
    if (code >= ARABIC_INDIC_ZERO && code <= ARABIC_INDIC_ZERO + 9) {
      out += String(code - ARABIC_INDIC_ZERO);
    } else if (code >= EXTENDED_ARABIC_INDIC_ZERO && code <= EXTENDED_ARABIC_INDIC_ZERO + 9) {
      out += String(code - EXTENDED_ARABIC_INDIC_ZERO);
    } else if (code === ARABIC_DECIMAL_SEPARATOR) {
      out += ".";
    } else if (code === ARABIC_THOUSANDS_SEPARATOR || char === ",") {
      continue;
    } else {
      out += char;
    }
  }
  return out;
}

export function normaliseNumberInput(value: string): string {
  return latinDigits(value);
}
