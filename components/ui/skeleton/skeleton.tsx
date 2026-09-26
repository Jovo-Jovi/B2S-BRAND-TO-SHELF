import { classes } from "../classes";
import styles from "./skeleton.module.css";

export type SkeletonVariant = "text" | "block" | "table_rows";
export type SkeletonSize = "compact" | "comfortable";

export type SkeletonVisual = "default" | "loading";

type SkeletonProps = {
  variant?: SkeletonVariant;
  size?: SkeletonSize;
  state?: SkeletonVisual;
  count?: number;
};

export function Skeleton({
  variant = "text",
  size,
  state = "loading",
  count = 1,
}: SkeletonProps) {
  const total = count < 1 ? 1 : count;
  return (
    <div
      className={styles.root}
      data-variant={variant}
      data-state={state}
      data-density={size}
      aria-hidden="true"
    >
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={classes(styles.shape, styles[variant], state === "loading" && styles.loading)}
        />
      ))}
    </div>
  );
}
