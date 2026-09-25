// TextField number normalises Arabic-Indic digits and both decimal
// separators to the canonical numeric form CALC_SPEC.md R1-25 stores:
// Latin digits and "." as the decimal separator. It does not group, and
// it does not render. Identifier values never pass through here.

const ARABIC_INDIC_ZERO = 0x0660;
const EXTENDED_ARABIC_INDIC_ZERO = 0x06f0;
const ARABIC_DECIMAL_SEPARATOR = 0x066b;

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
    } else {
      out += char;
    }
  }
  return out;
}

// The rightmost of "," and "." is the decimal separator. Earlier copies of
// either are grouping marks and are removed. A value with only one kind of
// separator treats that separator as decimal.
export function normaliseNumberInput(value: string): string {
  const latin = latinDigits(value);
  const lastComma = latin.lastIndexOf(",");
  const lastDot = latin.lastIndexOf(".");
  if (lastComma === -1) {
    return latin;
  }
  if (lastDot === -1 || lastComma > lastDot) {
    const head = latin.slice(0, lastComma).replace(/[,.]/g, "");
    const tail = latin.slice(lastComma + 1).replace(/,/g, "");
    return `${head}.${tail}`;
  }
  return latin.replace(/,/g, "");
}
