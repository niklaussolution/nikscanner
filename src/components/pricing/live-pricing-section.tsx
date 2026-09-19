"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { PricingCard, type PricingTier } from "@/components/pricing/pricing-card";
import { publicJson } from "@/lib/firebase/api";
import type { BackendPlan, PaymentPlansResult } from "@/lib/firebase/nikscanner-types";

function tierFromPlan(plan: BackendPlan): PricingTier {
  return {
    name: plan.label,
    price: `₹${plan.amount_rupees}`,
    period: "one-time",
    description: plan.unlimited_url
      ? "Unlimited URL scans for power users."
      : `Top up with ${plan.credits} scan credits.`,
    features: [
      plan.unlimited_url ? "Unlimited URL scans" : `+${plan.credits} scan credits`,
      `+${plan.files} file scans`,
    ],
    cta: "Get Started",
    href: "/signup",
    highlighted: plan.key === "pro",
  };
}

export function LivePricingSection() {
  const [plans, setPlans] = useState<BackendPlan[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    publicJson<PaymentPlansResult>("/api/payment/plans")
      .then((res) => setPlans(res.plans))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load plans."));
  }, []);

  const tiers: PricingTier[] = (plans ?? []).map(tierFromPlan);

  return (
    <section className="bg-grid border-t border-border-subtle px-5 py-24 sm:px-6 lg:px-8" style={{ background: "#070707" }}>
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-flame-primary">Simple Pricing</p>
          <h2 className="mt-3 font-heading text-4xl font-extrabold text-white sm:text-5xl">
            Protection that scales with you.
          </h2>
          <p className="mt-3 text-lg text-muted">Top up scan credits whenever you need more.</p>
        </div>

        {error && <p className="mt-8 text-center text-sm text-danger">{error}</p>}

        {!plans ? (
          <div className="mt-14 flex items-center justify-center gap-2 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading plans...
          </div>
        ) : (
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tiers.map((tier) => (
              <PricingCard key={tier.name} tier={tier} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
