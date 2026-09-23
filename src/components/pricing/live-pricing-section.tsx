"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { PricingCard, type PricingTier } from "@/components/pricing/pricing-card";
import { publicJson } from "@/lib/firebase/api";
import { useAuth } from "@/lib/firebase/auth-context";
import { startCheckout } from "@/lib/firebase/razorpay";
import type { BackendPlan, PaymentPlansResult } from "@/lib/firebase/nikscanner-types";

function tierFromPlan(
  plan: BackendPlan,
  opts: { signedIn: boolean; loading: boolean; onUpgrade: (plan: BackendPlan) => void },
): PricingTier {
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
    // Signed-in visitors check out directly from this page; signed-out visitors go create an
    // account first — the checkout flow itself always requires a signed-in Firebase user (the
    // backend's create-order/verify endpoints are auth-gated), so there's nothing to run yet.
    ...(opts.signedIn ? { cta: "Upgrade Now", onClick: () => opts.onUpgrade(plan), loading: opts.loading } : { cta: "Get Started", href: "/signup" }),
    highlighted: plan.key === "pro",
  };
}

export function LivePricingSection() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<BackendPlan[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkoutPlanKey, setCheckoutPlanKey] = useState<string | null>(null);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);

  useEffect(() => {
    publicJson<PaymentPlansResult>("/api/payment/plans")
      .then((res) => setPlans(res.plans))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load plans."));
  }, []);

  async function handleUpgrade(plan: BackendPlan) {
    if (!user || checkoutPlanKey) return;
    setError(null);
    setCheckoutMessage(null);
    setCheckoutPlanKey(plan.key);
    try {
      const outcome = await startCheckout(plan, user.email ?? undefined);
      if (outcome.status === "credited") {
        setCheckoutMessage(`Payment successful — ${outcome.result.plan_label} plan is now active.`);
      } else if (outcome.status === "pending_reconciliation") {
        setCheckoutMessage("We couldn't immediately confirm this payment — if it went through, your account will be credited shortly.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed. Please try again.");
    } finally {
      setCheckoutPlanKey(null);
    }
  }

  const tiers: PricingTier[] = (plans ?? []).map((plan) =>
    tierFromPlan(plan, { signedIn: !!user, loading: checkoutPlanKey === plan.key, onUpgrade: handleUpgrade }),
  );

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
        {checkoutMessage && <p className="mt-8 text-center text-sm text-flame-bright">{checkoutMessage}</p>}

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
