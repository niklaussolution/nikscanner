"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Users, FileCheck, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface PulseData {
  contributors: number;
  verifiedReports: number;
  accuracyPct: number;
}

interface MetricDef {
  id: string;
  icon: LucideIcon;
  value: number;
  decimals: number;
  suffix: string;
  label: string;
}

function useCountUp(target: number, decimals: number, ready: boolean) {
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
  return decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString();
}

function MetricCard({ metric, ready }: { metric: MetricDef; ready: boolean }) {
  const display = useCountUp(metric.value, metric.decimals, ready);
  const Icon = metric.icon;
  return (
    <div
      data-pulse-card
      className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] p-4 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--orange)]/40"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--orange)]/25 bg-[var(--orange)]/10 text-[var(--orange-light)]">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-2xl font-extrabold text-[var(--text)]">
          {display}
          {metric.suffix}
        </p>
        <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">{metric.label}</p>
      </div>
    </div>
  );
}

export function CommunityPulse() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<PulseData | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(async () => {
      try {
        const res = await fetch("/api/community/pulse", { cache: "no-store" });
        const json = (await res.json()) as PulseData;
        if (!cancelled) {
          setData(json);
          setReady(true);
        }
      } catch {
        if (!cancelled) setReady(true);
      }
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
      gsap.fromTo("[data-pulse-card]", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" });
    }, rootRef);
    return () => ctx.revert();
  }, [ready]);

  const defs: MetricDef[] = [
    { id: "contributors", icon: Users, value: data?.contributors ?? 0, decimals: 0, suffix: "", label: "Contributors" },
    { id: "verified", icon: FileCheck, value: data?.verifiedReports ?? 0, decimals: 0, suffix: "", label: "Verified reports" },
    { id: "accuracy", icon: Target, value: data?.accuracyPct ?? 0, decimals: 1, suffix: "%", label: "Accuracy" },
  ];

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-[var(--text)]">Community pulse</h2>
        <p className="text-[11px] text-[var(--text-muted)]">Real people. Real impact.</p>
      </div>
      <div ref={rootRef} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {defs.map((m) => (
          <MetricCard key={m.id} metric={m} ready={ready} />
        ))}
      </div>
    </div>
  );
}
