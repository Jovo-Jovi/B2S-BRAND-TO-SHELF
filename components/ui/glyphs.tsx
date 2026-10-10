import { classes } from "./classes";
import styles from "./glyphs.module.css";

type GlyphRecord = {
  path: string;
  paths?: string[];
  mirrors: boolean;
  circle?: boolean;
  dot?: boolean;
};

// DESIGN_SURFACE.md §2.10. Every entry declares `mirrors`. There is no default.
// check, cross and danger are on or beside the never-mirror list. chevronDown
// points down, the same class as the vertical marks that never mirror.
// previous and next are the direction-bearing pair for month navigation and
// pagination, and they mirror.
export const glyphRegistry = {
  check: { path: "M3.5 8.5 L6.5 11.5 L12.5 4.5", mirrors: false },
  chevronDown: { path: "M4 6 L8 10 L12 6", mirrors: false },
  cross: { path: "M4.5 4.5 L11.5 11.5 M11.5 4.5 L4.5 11.5", mirrors: false },
  danger: { path: "M8 4.75 V9", mirrors: false, circle: true, dot: true },
  previous: { path: "M10.5 3.5 L5.5 8 L10.5 12.5", mirrors: true },
  next: { path: "M5.5 3.5 L10.5 8 L5.5 12.5", mirrors: true },
  // The platform mark is a brand mark. §2.10 never mirrors a brand mark.
  mark: {
    path: "M8 2.2 L13.2 5.1 V10.9 L8 13.8 L2.8 10.9 V5.1 Z",
    paths: ["M8 2.2 L13.2 5.1 V10.9 L8 13.8 L2.8 10.9 V5.1 Z", "M8 2.2 V8.2 M2.8 5.1 L8 8.2 L13.2 5.1"],
    mirrors: false,
  },
} satisfies Record<string, GlyphRecord>;

export type GlyphName = keyof typeof glyphRegistry;

type GlyphProps = {
  name: GlyphName;
  className?: string;
};

export function Glyph({ name, className }: GlyphProps) {
  const entry: GlyphRecord = glyphRegistry[name];
  const mirrors = entry.mirrors === true;
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={classes(styles.glyph, mirrors && styles.mirrors, className)}
      data-glyph={name}
      data-mirrors={mirrors ? "true" : "false"}
    >
      {entry.circle ? (
        <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      ) : null}
      {(entry.paths ?? [entry.path]).map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {entry.dot ? <circle cx="8" cy="11.75" r="0.75" fill="currentColor" /> : null}
    </svg>
  );
}
