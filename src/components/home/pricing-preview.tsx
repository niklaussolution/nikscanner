"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, CreditCard, Clock3, ShieldCheck, Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { publicJson } from "@/lib/firebase/api";
import type { BackendPlan, PaymentPlansResult } from "@/lib/firebase/nikscanner-types";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

interface Plan {
  id: string;
  badge?: string;
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
}

function planFromBackend(plan: BackendPlan): Plan {
  const featured = plan.key === "pro";
  return {
    id: plan.key,
    badge: featured ? "Most Popular" : undefined,
    name: plan.label,
    price: `₹${plan.amount_rupees}`,
    period: "one-time",
    description: plan.unlimited_url ? "Unlimited URL scans for power users." : `Top up with ${plan.credits} scan credits.`,
    features: [
      plan.unlimited_url ? "Unlimited URL scans" : `+${plan.credits} scan credits`,
      `+${plan.files} file scans`,
    ],
    cta: "Get Started",
    href: "/signup",
    featured,
  };
}

const TRUST_ITEMS: { icon: LucideIcon; label: string }[] = [
  { icon: CreditCard, label: "No credit card" },
  { icon: Clock3, label: "Credits never expire" },
  { icon: ShieldCheck, label: "Secure payments" },
];

export function PricingPreview() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const featuredButtonRef = useRef<HTMLAnchorElement>(null);
  const [plans, setPlans] = useState<BackendPlan[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    publicJson<PaymentPlansResult>("/api/payment/plans")
      .then((res) => setPlans(res.plans))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load plans."));
  }, []);

  const displayPlans: Plan[] = plans ? plans.map(planFromBackend) : [];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !plans) return;
    const reduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: section, start: "top 72%", once: true },
        defaults: { ease: "power3.out", duration: 0.8 },
      });

      tl.fromTo("[data-eyebrow]", { opacity: 0, y: 18 }, { opacity: 1, y: 0 })
        .fromTo("[data-heading]", { opacity: 0, y: 45 }, { opacity: 1, y: 0 }, "-=0.55")
        .fromTo("[data-description]", { opacity: 0, y: 18 }, { opacity: 1, y: 0 }, "-=0.55")
        .fromTo(
          "[data-card]:not([data-featured])",
          { opacity: 0, y: 70 },
          { opacity: 1, y: 0, stagger: 0.12 },
          "-=0.3",
        )
        .fromTo(
          "[data-featured]",
          { opacity: 0, y: 70, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.7 },
          "<",
        )
        .fromTo("[data-trust-item]", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, "-=0.2");

      if (!reduced) {
        gsap.to(featuredButtonRef.current, {
          boxShadow: "0 0 0 6px rgba(255,90,0,0), 0 12px 32px -8px rgba(255,90,0,0.55)",
          duration: 1.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    }, section);

    return () => ctx.revert();
  }, [plans]);

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="bg-grid relative overflow-hidden border-t border-border-subtle py-24 md:py-32"
      style={{ background: "#070707" }}
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          {/* <p data-eyebrow className="text-sm font-semibold uppercase tracking-[0.15em] text-flame-primary">
            Simple Pricing
          </p> */}
          <h2
            data-heading
            className="mt-3 font-heading font-extrabold text-white"
            style={{ fontSize: "clamp(2.375rem, 4vw + 1rem, 3.75rem)", lineHeight: 1.08 }}
          >
            Protection that scales with you.
          </h2>
          <p data-description className="mt-3 text-lg text-muted sm:text-xl">
            Top up scan credits whenever you need more.
          </p>
        </div>

        {error && <p className="mt-8 text-center text-sm text-danger">{error}</p>}

        {/* pricing cards */}
        <div className="relative mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 ">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-[38%] -translate-x-1/2 rounded-full bg-flame-primary/10 blur-[100px] lg:block"
          />
          {!plans ? (
            <div className="col-span-full flex items-center justify-center gap-2 py-10 text-sm text-muted">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading plans...
            </div>
          ) : (
            displayPlans.map((plan) => (
              <div key={plan.id} data-card data-featured={plan.featured ? "" : undefined} className="relative flex">
                {/* inner wrapper carries hover/elevation transforms — kept separate from the
                    GSAP-animated outer wrapper above, since GSAP's transform tween on an
                    element permanently overrides any CSS `translate` utility on that same node */}
                <div
                  className={cn(
                    "group flex w-full flex-col rounded-[18px] border p-8 transition-all duration-300 hover:-translate-y-1.5 lg:min-h-[480px]",
                    plan.featured
                      ? "border-[1.5px] border-flame-primary bg-[#11100f] shadow-[0_20px_60px_-20px_rgba(255,90,0,0.35)] lg:-translate-y-3 hover:lg:-translate-y-4"
                      : "border-[#292929] bg-[#0d0d0d] hover:border-[#3d3d3d]",
                  )}
                >
                  {plan.badge && (
                    <span className="mb-3 inline-flex w-fit items-center rounded-full border border-flame-primary/50 bg-flame-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-flame-primary">
                      {plan.badge}
                    </span>
                  )}
                  <p className="text-sm font-bold uppercase tracking-wide text-white">{plan.name}</p>

                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="font-heading text-5xl font-extrabold text-white">{plan.price}</span>
                    {plan.period && <span className="text-base text-muted">/{plan.period}</span>}
                  </div>

                  <p className="mt-4 text-base text-muted">{plan.description}</p>

                  <ul className="mt-6 flex-1 space-y-4 border-t border-[#1c1c1c] pt-5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-base text-soft-white">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-flame-primary text-flame-primary">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.href}
                    ref={plan.featured ? featuredButtonRef : undefined}
                    className={cn(
                      "mt-7 flex h-13 w-full items-center justify-center rounded-lg text-base font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-black",
                      plan.featured
                        ? "bg-flame-primary text-white hover:bg-flame-bright"
                        : "border border-white/15 bg-transparent text-white hover:border-flame-primary/50 hover:text-flame-bright",
                    )}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* trust row */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 sm:flex-nowrap">
          <span aria-hidden className="hidden h-px w-16 shrink-0 bg-border-subtle sm:block" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:flex sm:flex-nowrap sm:items-center sm:gap-6">
            {TRUST_ITEMS.map((item, i) => (
              <div key={item.label} className="flex items-center gap-4">
                <div data-trust-item className="flex items-center gap-2 whitespace-nowrap">
                  <item.icon className="h-4 w-4 shrink-0 text-flame-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted">{item.label}</span>
                </div>
                {i < TRUST_ITEMS.length - 1 && <span aria-hidden className="hidden h-4 w-px bg-border-subtle sm:block" />}
              </div>
            ))}
          </div>
          <span aria-hidden className="hidden h-px w-16 shrink-0 bg-border-subtle sm:block" />
        </div>
      </div>
    </section>
  );
}
