import { CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PricingCard } from "@/components/pricing/pricing-card";
import { PRICING_TIERS } from "@/lib/data/pricing";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">Billing</h1>
        <p className="mt-1 text-sm text-muted">Manage your plan and payment method.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Current Plan</CardTitle>
          <Badge variant="flame">Free</Badge>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-subtle bg-card-elevated text-muted">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">No payment method on file</p>
              <p className="text-xs text-muted">Upgrade to Pro to add a card via Razorpay checkout.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 font-heading text-lg font-bold text-white">Upgrade Plan</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PRICING_TIERS.map((tier) => (
            <PricingCard key={tier.name} tier={tier} />
          ))}
        </div>
      </div>
    </div>
  );
}
