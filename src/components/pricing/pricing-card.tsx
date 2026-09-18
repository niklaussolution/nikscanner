import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PricingTier {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  highlighted?: boolean;
}

export function PricingCard({ tier }: { tier: PricingTier }) {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-2xl border p-6",
        tier.highlighted
          ? "border-flame-primary/50 bg-gradient-to-b from-flame-primary/10 to-card-bg border-glow-flame"
          : "border-border-subtle bg-card-bg",
      )}
    >
      {tier.highlighted && (
        <span className="mb-3 inline-flex w-fit rounded-full bg-flame-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          Most Popular
        </span>
      )}
      <h3 className="font-heading text-lg font-bold text-white">{tier.name}</h3>
      <p className="mt-1 text-sm text-muted">{tier.description}</p>
      <div className="mt-5 flex items-baseline gap-1">
        <span className="font-heading text-3xl font-bold text-white">{tier.price}</span>
        {tier.period && <span className="text-sm text-muted">/{tier.period}</span>}
      </div>

      <ul className="mt-6 flex-1 space-y-3">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-soft-white">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-flame-bright" />
            {f}
          </li>
        ))}
      </ul>

      <Link href={tier.href} className="mt-6">
        <Button className="w-full" variant={tier.highlighted ? "primary" : "outline"}>
          {tier.cta}
        </Button>
      </Link>
    </div>
  );
}
