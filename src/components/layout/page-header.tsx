import { Badge } from "@/components/ui/badge";

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="border-b border-border-subtle bg-grid bg-radial-flame py-20 text-center">
      <div className="mx-auto max-w-2xl px-4">
        <Badge variant="flame">{eyebrow}</Badge>
        <h1 className="mt-4 font-heading text-4xl font-bold text-white sm:text-5xl">{title}</h1>
        {description && <p className="mt-4 text-muted">{description}</p>}
      </div>
    </section>
  );
}
