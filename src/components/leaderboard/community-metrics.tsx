"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Users, FileCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface PulseData {
  contributors: number;
  verifiedReports: number;
}

interface MetricDef {
  id: string;
  icon: LucideIcon;
  value: number;
  label: string;
}

function useCountUp(target: number, ready: boolean) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!ready) return;
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const counter = { value: 0 };
    const tween = gsap.to(counter, {
      value: target,
      duration: reduced ? 0 : 1.1,
      ease: "power2.out",
      onUpdate: () => setDisplay(counter.value),
    });
    return () => {
      tween.kill();
    };
  }, [target, ready]);
  return Math.round(display).toLocaleString();
}

function MetricCard({ metric, ready }: { metric: MetricDef; ready: boolean }) {
  const display = useCountUp(metric.value, ready);
  const Icon = metric.icon;
  return (
    <div
      data-metric-card
      className="flex flex-col gap-3 rounded-xl border border-[var(--border-muted)] bg-[var(--surface-soft)] p-4 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--orange)]/40"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--orange)]/25 bg-[var(--orange)]/10 text-[var(--orange-light)]">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-2xl font-extrabold text-[var(--white)]">{display}</p>
        <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">{metric.label}</p>
      </div>
    </div>
  );
}

/** "Active Hunters" (total users who've blocked at least one URL) and "Verified Reports"
 *  (total confirmed blocked URLs across everyone) — real numbers from the same backend the
 *  /community page's pulse card uses (GET /api/stats via /api/community/pulse), not the demo
 *  seeded dataset the rest of this page used to draw from. Self-contained, like
 *  RealLeaderboardPodium, rather than threaded through the page's old fake-data fetch. */
export function CommunityMetrics() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<PulseData | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/community/pulse", { cache: "no-store" })
      .then((res) => res.json())
      .then((json: PulseData) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        // Non-fatal — the cards just show 0 until this succeeds.
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || !rootRef.current) return;
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-metric-card]", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" });
    }, rootRef);
    return () => ctx.revert();
  }, [ready]);

  const defs: MetricDef[] = [
    { id: "hunters", icon: Users, value: data?.contributors ?? 0, label: "Active Hunters" },
    { id: "reports", icon: FileCheck, value: data?.verifiedReports ?? 0, label: "Verified Reports" },
  ];

  return (
    <div ref={rootRef} className="mt-6 grid grid-cols-2 gap-3">
      {defs.map((m) => (
        <MetricCard key={m.id} metric={m} ready={ready} />
      ))}
    </div>
  );
}
