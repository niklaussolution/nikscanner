import { authedJson } from "@/lib/firebase/api";
import type { BackendPlan, CreateOrderResult, CreditedAccountResult, PaymentStatusResult } from "@/lib/firebase/nikscanner-types";

// Client-side half of the same Razorpay flow already integrated in the mobile app — the backend
// (F:\c\nikscanner-rebuild\backend\server.js) already has the Key ID/Secret, order creation,
// signature verification, and self-healing status-check reconciliation fully built; this just
// drives Razorpay's Checkout widget and calls those existing endpoints in the right order.

const CHECKOUT_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  theme?: { color?: string };
  prefill?: { email?: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayCheckoutInstance {
  open: () => void;
  on: (event: "payment.failed", handler: (response: { error: { description?: string } }) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadCheckoutScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Razorpay checkout is browser-only."));
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CHECKOUT_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Could not load the Razorpay checkout script."));
    };
    document.body.appendChild(script);
  });
  return scriptPromise;
}

export type PaymentOutcome =
  | { status: "credited"; result: CreditedAccountResult }
  | { status: "cancelled" }
  | { status: "pending_reconciliation" };

/** Runs the full checkout flow for one plan: create the order, open Razorpay's widget, verify
 *  the signature on success. If the widget is dismissed or the signature step never completes
 *  (e.g. the browser tab dies mid-payment, the same failure mode the mobile app's Checkout SDK
 *  can hit), falls back to asking the backend to check the order status directly — the same
 *  self-healing reconciliation /api/payment/status exists for. */
export async function startCheckout(plan: BackendPlan, userEmail?: string): Promise<PaymentOutcome> {
  const [order] = await Promise.all([
    authedJson<CreateOrderResult>("/api/payment/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: plan.key }),
    }),
    loadCheckoutScript(),
  ]);

  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error("Razorpay checkout failed to load."));
      return;
    }

    let settled = false;

    const reconcile = async () => {
      if (settled) return;
      settled = true;
      try {
        const status = await authedJson<PaymentStatusResult>(
          `/api/payment/status?order_id=${encodeURIComponent(order.order_id)}&plan=${encodeURIComponent(plan.key)}`,
        );
        if (status.captured && status.credits !== undefined) {
          resolve({
            status: "credited",
            result: {
              ok: true,
              already_processed: status.already_processed ?? false,
              credits: status.credits,
              file_scans_allowed: status.file_scans_allowed ?? 0,
              pro_unlimited_url: status.pro_unlimited_url ?? false,
              plan_key: status.plan_key ?? plan.key,
              plan_label: status.plan_label ?? plan.label,
            },
          });
        } else {
          resolve({ status: "cancelled" });
        }
      } catch {
        // The widget was dismissed and we can't yet confirm whether money moved — surfaced
        // distinctly so the UI can tell the user to check back rather than claiming failure.
        resolve({ status: "pending_reconciliation" });
      }
    };

    const razorpay = new window.Razorpay({
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      order_id: order.order_id,
      name: "NIKSCANNER",
      description: `${plan.label} plan`,
      theme: { color: "#FF5A00" },
      ...(userEmail ? { prefill: { email: userEmail } } : {}),
      handler: (response: RazorpaySuccessResponse) => {
        settled = true;
        authedJson<CreditedAccountResult>("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            plan: plan.key,
          }),
        })
          .then((result) => resolve({ status: "credited", result }))
          .catch(() => {
            // The signature step itself failed after Razorpay already reported success — fall
            // back to the same server-side reconciliation rather than surfacing a hard error.
            settled = false;
            reconcile();
          });
      },
      modal: { ondismiss: reconcile },
    } as RazorpayCheckoutOptions);

    razorpay.on("payment.failed", () => {
      reconcile();
    });

    razorpay.open();
  });
}
