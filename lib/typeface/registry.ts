export const LIBRARY_HEADING_WEIGHT = 700;
export const LIBRARY_BODY_WEIGHT = 400;

export type TypefaceScript = "arabic" | "latin";
export type TypefaceRole = "heading" | "body";

export type LibraryFamily = {
  family: string;
  script: TypefaceScript;
  weights: readonly number[];
  files: readonly string[];
};

export const TYPEFACE_LIBRARY: readonly LibraryFamily[] = [
  { family: "Cairo", script: "arabic", weights: [400, 700], files: ["cairo-400.woff2", "cairo-700.woff2"] },
  { family: "Tajawal", script: "arabic", weights: [400, 700], files: ["tajawal-400.woff2", "tajawal-700.woff2"] },
  {
    family: "Noto Naskh Arabic",
    script: "arabic",
    weights: [400, 700],
    files: ["noto-naskh-arabic-400.woff2", "noto-naskh-arabic-700.woff2"],
  },
  { family: "Amiri", script: "arabic", weights: [400, 700], files: ["amiri-400.woff2", "amiri-700.woff2"] },
  { family: "Reem Kufi", script: "arabic", weights: [400, 700], files: ["reem-kufi.woff2"] },
  { family: "Inter", script: "latin", weights: [400, 700], files: ["inter-400.woff2", "inter-700.woff2"] },
  { family: "Montserrat", script: "latin", weights: [400, 700], files: ["montserrat-400.woff2", "montserrat-700.woff2"] },
  { family: "Poppins", script: "latin", weights: [400, 700], files: ["poppins-400.woff2", "poppins-700.woff2"] },
  { family: "Fraunces", script: "latin", weights: [400, 700], files: ["fraunces.woff2"] },
  { family: "Playfair Display", script: "latin", weights: [400, 700], files: ["playfair-display.woff2"] },
  { family: "Lora", script: "latin", weights: [400, 700], files: ["lora-400.woff2", "lora-700.woff2"] },
];

export function familiesFor(script: TypefaceScript): readonly LibraryFamily[] {
  return TYPEFACE_LIBRARY.filter((item) => item.script === script);
}

export function libraryFace(
  script: TypefaceScript,
  role: TypefaceRole,
): { family: string; weight: string; italic: false } {
  const entry = familiesFor(script)[0];
  if (!entry) {
    throw new Error(`typeface library has no ${script} family`);
  }
  const weight = role === "heading" ? LIBRARY_HEADING_WEIGHT : LIBRARY_BODY_WEIGHT;
  return { family: entry.family, weight: String(weight), italic: false };
}
