// Built-in glyphs for this catalog. Each carries the registry flag from
// DESIGN_SURFACE.md §2.10. None of these four mirror.

type GlyphProps = {
  path: string;
  className?: string;
  circle?: boolean;
  dot?: boolean;
};

export function Glyph({ path, className, circle = false, dot = false }: GlyphProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={className}
      data-mirrors="false"
    >
      {circle ? (
        <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      ) : null}
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {dot ? <circle cx="8" cy="11.75" r="0.75" fill="currentColor" /> : null}
    </svg>
  );
}

export const glyphPath = {
  check: "M3.5 8.5 L6.5 11.5 L12.5 4.5",
  chevronDown: "M4 6 L8 10 L12 6",
  cross: "M4.5 4.5 L11.5 11.5 M11.5 4.5 L4.5 11.5",
  danger: "M8 4.75 V9",
};
