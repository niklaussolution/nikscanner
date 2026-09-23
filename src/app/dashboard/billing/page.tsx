"use client";

import { useEffect, useState } from "react";
import { CreditCard, Loader2, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/firebase/auth-context";
import { authedJson, publicJson } from "@/lib/firebase/api";
import { startCheckout } from "@/lib/firebase/razorpay";
import type { CreditsBalanceResult, BackendPlan, PaymentPlansResult } from "@/lib/firebase/nikscanner-types";

export default function BillingPage() {
  const { user, loading: authLoading } = useAuth();
  const [balance, setBalance] = useState<CreditsBalanceResult | null>(null);
  const [plans, setPlans] = useState<BackendPlan[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkoutPlanKey, setCheckoutPlanKey] = useState<string | null>(null);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);

  useEffect(() => {
    publicJson<PaymentPlansResult>("/api/payment/plans")
      .then((res) => setPlans(res.plans))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load plans."));
  }, []);

  function refreshBalance() {
    if (!user) return;
    authedJson<CreditsBalanceResult>("/api/credits/balance")
      .then((res) => setBalance(res))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load billing info."));
  }

  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;

    authedJson<CreditsBalanceResult>("/api/credits/balance")
      .then((res) => {
        if (!cancelled) setBalance(res);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load billing info.");
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  async function handleUpgrade(plan: BackendPlan) {
    if (!user || checkoutPlanKey) return;
    setError(null);
    setCheckoutMessage(null);
    setCheckoutPlanKey(plan.key);

    try {
      const outcome = await startCheckout(plan, user.email ?? undefined);
      if (outcome.status === "credited") {
        setCheckoutMessage(`Payment successful — ${outcome.result.plan_label} plan is now active.`);
        refreshBalance();
      } else if (outcome.status === "pending_reconciliation") {
        setCheckoutMessage("We couldn't immediately confirm this payment — if it went through, your account will be credited shortly. Refresh this page in a minute to check.");
      }
      // "cancelled" — the user closed the checkout widget without paying; nothing to show.
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed. Please try again.");
    } finally {
      setCheckoutPlanKey(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">Billing</h1>
        <p className="mt-1 text-sm text-muted">Manage your plan and payment method.</p>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      {checkoutMessage && <p className="text-sm text-flame-bright">{checkoutMessage}</p>}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Current Plan</CardTitle>
          {balance && <Badge variant={balance.plan_key === "free" ? "neutral" : "flame"}>{balance.plan_label}</Badge>}
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          {!balance ? (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading plan...
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-subtle bg-card-elevated text-muted">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {balance.pro_unlimited_url ? "Unlimited URL scans" : `${balance.credits} scan credits remaining`}
                </p>
                <p className="text-xs text-muted">
                  File scans used: {balance.file_scans_used} / {balance.file_scans_allowed}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 font-heading text-lg font-bold text-white">Upgrade Plan</h2>
        {!plans ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading plans...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.key} className="flex h-full flex-col rounded-2xl border border-border-subtle bg-card-bg p-6">
                <h3 className="font-heading text-lg font-bold capitalize text-white">{plan.label}</h3>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="font-heading text-3xl font-bold text-white">₹{plan.amount_rupees}</span>
                  <span className="text-sm text-muted">one-time</span>
                </div>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.unlimited_url ? (
                    <li className="flex items-start gap-2 text-sm text-soft-white">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-flame-bright" /> Unlimited URL scans
                    </li>
                  ) : (
                    <li className="flex items-start gap-2 text-sm text-soft-white">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-flame-bright" /> +{plan.credits} scan credits
                    </li>
                  )}
                  <li className="flex items-start gap-2 text-sm text-soft-white">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-flame-bright" /> +{plan.files} file scans
                  </li>
                </ul>

                <Button
                  className="mt-6 w-full"
                  variant="outline"
                  disabled={!user || checkoutPlanKey !== null}
                  onClick={() => handleUpgrade(plan)}
                >
                  {checkoutPlanKey === plan.key ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                    </span>
                  ) : (
                    "Upgrade"
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
