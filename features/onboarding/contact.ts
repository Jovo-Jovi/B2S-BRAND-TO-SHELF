// Legal-entity contact values, validated before save_legal_entity.
// DATA_MODEL.md §3.22 states the stored shapes. An empty optional field is
// "not provided". A malformed one is named and is not written.

const E164 = /^\+[1-9][0-9]{6,14}$/;
const EMAIL = /^[^\s@]+@[^\s@]+$/;
const TAX = /^[0-9A-Za-z]{1,32}$/;
const NATIONAL = /^0[0-9]+$/;

export type Stored = { kind: "empty" } | { kind: "valid"; stored: string } | { kind: "invalid" };

export function taxStored(raw: string): Stored {
  const trimmed = raw.trim();
  if (!trimmed) return { kind: "empty" };
  if (TAX.test(trimmed)) return { kind: "valid", stored: trimmed };
  return { kind: "invalid" };
}

export function emailStored(raw: string): Stored {
  const trimmed = raw.trim();
  if (!trimmed) return { kind: "empty" };
  if (trimmed.length <= 254 && EMAIL.test(trimmed)) return { kind: "valid", stored: trimmed };
  return { kind: "invalid" };
}

export function phoneStored(raw: string): Stored {
  const trimmed = raw.trim();
  if (!trimmed) return { kind: "empty" };
  if (E164.test(trimmed)) return { kind: "valid", stored: trimmed };
  if (NATIONAL.test(trimmed)) {
    const stored = `+20${trimmed.slice(1)}`;
    if (E164.test(stored)) return { kind: "valid", stored };
  }
  return { kind: "invalid" };
}

export function scalarToWrite(parsed: Stored, previous: string): string {
  if (parsed.kind === "valid") return parsed.stored;
  if (parsed.kind === "empty") return "";
  return previous;
}
