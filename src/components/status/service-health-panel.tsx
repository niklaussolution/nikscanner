"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Link from "next/link";
import { Activity, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ServiceHealthRow } from "@/components/status/service-health-row";
import type { StatusSnapshot } from "@/types/status";

const RANGES = [
  { label: "20 Days", days: 20 },
  { label: "14 Days", days: 14 },
  { label: "7 Days", days: 7 },
];

export function ServiceHealthPanel({ snapshot }: { snapshot: StatusSnapshot | null }) {
  const [rangeDays, setRangeDays] = useState(20);
  const selectorRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const selector = selectorRef.current;
    const indicator = indicatorRef.current;
    if (!selector || !indicator) return;
    const activeEl = selector.querySelector<HTMLElement>(`[data-range="${rangeDays}"]`);
    if (!activeEl) return;
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const selectorRect = selector.getBoundingClientRect();
    const targetRect = activeEl.getBoundingClientRect();
    gsap.to(indicator, {
      x: targetRect.left - selectorRect.left,
      width: targetRect.width,
      duration: reduced ? 0 : 0.3,
      ease: "power3.out",
    });
  }, [rangeDays]);

  function selectRange(days: number) {
    setRangeDays(days);
  }

  if (!snapshot) {
    return (
      <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--text-muted)]">
        Loading service health…
      </div>
    );
  }

  return (
    <div data-service-health className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">
          <Activity className="h-4 w-4 text-[var(--orange-light)]" /> Service Health
        </span>

        <div className="flex items-center gap-3">
          <div ref={selectorRef} className="relative flex items-center gap-1 rounded-lg border border-[var(--border-muted)] bg-black/30 p-1">
            <div ref={indicatorRef} aria-hidden className="absolute inset-y-1 left-1 z-0 rounded-md bg-[var(--orange)]" style={{ width: 0 }} />
            {RANGES.map((r) => (
              <button
                key={r.days}
                type="button"
                data-range={r.days}
                onClick={() => selectRange(r.days)}
                className={cn(
                  "relative z-10 rounded-md px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-colors",
                  rangeDays === r.days ? "text-white" : "text-[var(--text-muted)] hover:text-[var(--white)]",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
          <Link
            href="/status"
            className="hidden items-center gap-1 text-xs font-bold uppercase tracking-wide text-[var(--orange-light)] hover:text-[var(--orange)] sm:flex"
          >
            View API status <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div data-service-rows className="mt-4 grid grid-cols-1 gap-1 lg:grid-cols-2 lg:gap-x-4">
        {snapshot.services.map((service) => (
          <ServiceHealthRow key={service.id} service={service} history={snapshot.history[service.id] ?? []} rangeDays={rangeDays} />
        ))}
      </div>
    </div>
  );
}
