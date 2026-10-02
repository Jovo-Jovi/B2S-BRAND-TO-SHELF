import { Button } from "../../ui/button/button";

type EmptyStateProps = {
  title: string;
  description: string;
  action: string;
  onAction: () => void;
};

export function EmptyState({ title, description, action, onAction }: EmptyStateProps) {
  return (
    <section data-composition="EmptyState">
      <h2>{title}</h2>
      <p>{description}</p>
      <Button type="button" variant="primary" onClick={onAction}>
        {action}
      </Button>
    </section>
  );
}
