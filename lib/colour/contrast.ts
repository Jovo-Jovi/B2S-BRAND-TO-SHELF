// WCAG 2.x relative luminance and contrast ratio for an sRGB hex value.
// This is the one home of the function (OD-H9). check-contrast.mjs keeps its
// own copy of the same formula; the test asserts the two do not drift.
// BRAND_CONFIG.md §11's profile-completion check will call this. ColorField
// calls it now.

/** BRAND_CONFIG.md §11. foreground against background, every theme. */
export const FOREGROUND_CONTRAST_MINIMUM = 4.5;

/** DESIGN_SURFACE.md §3.1. Black and white contrast equally here. */
export const EQUAL_CONTRAST_LUMINANCE = 0.179;

export function markGround(primary: string): "dark" | "light" {
  return relativeLuminance(primary) < EQUAL_CONTRAST_LUMINANCE ? "dark" : "light";
}

function hexChannels(hex: string): [number, number, number] | null {
  let body = hex.startsWith("#") ? hex.slice(1) : hex;
  if (body.length === 3 || body.length === 4) {
    body = [...body].map((character) => character + character).join("");
  }
  if (body.length !== 6 && body.length !== 8) {
    return null;
  }
  if (!/^[0-9a-fA-F]+$/.test(body)) {
    return null;
  }
  return [0, 2, 4].map((offset) => parseInt(body.slice(offset, offset + 2), 16)) as [number, number, number];
}

function channelLinear(value: number): number {
  const scaled = value / 255;
  return scaled <= 0.04045 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const channels = hexChannels(hex);
  if (!channels) {
    throw new Error(`not an sRGB hex value: ${hex}`);
  }
  return 0.2126 * channelLinear(channels[0]) + 0.7152 * channelLinear(channels[1]) + 0.0722 * channelLinear(channels[2]);
}

export function contrastRatio(foreground: string, background: string): number {
  const left = relativeLuminance(foreground);
  const right = relativeLuminance(background);
  const lighter = Math.max(left, right);
  const darker = Math.min(left, right);
  return (lighter + 0.05) / (darker + 0.05);
}
