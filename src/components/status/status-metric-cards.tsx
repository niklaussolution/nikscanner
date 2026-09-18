"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ShieldCheck, Zap, FileWarning, Server } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { StatusSnapshot } from "@/types/status";

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
      duration: reduced ? 0 : 1,
      ease: "power2.out",
      onUpdate: () => setDisplay(counter.value),
    });
    return () => {
      tween.kill();
    };
  }, [target, ready]);
  return decimals > 0 ? display.toFixed(decimals) : Math.round(display).toString();
}

function MetricCard({ metric, ready }: { metric: MetricDef; ready: boolean }) {
  const display = useCountUp(metric.value, metric.decimals, ready);
  const Icon = metric.icon;
  return (
    <div
      data-analysis-card
      className="flex flex-col gap-3 rounded-xl border border-[var(--border-muted)] bg-[var(--surface-soft)] p-4 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--orange)]/40"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--orange)]/25 bg-[var(--orange)]/10 text-[var(--orange-light)]">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-2xl font-extrabold text-[var(--white)]">
          {display}
          {metric.suffix}
        </p>
        <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">{metric.label}</p>
      </div>
    </div>
  );
}

export function StatusMetricCards({ metrics, ready }: { metrics: StatusSnapshot["metrics"] | null; ready: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ready || !rootRef.current) return;
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-metric-card]",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" },
      );
    }, rootRef);
    return () => ctx.revert();
  }, [ready]);

  const defs: MetricDef[] = [
    { id: "uptime", icon: ShieldCheck, value: metrics?.uptimeWindow ?? 0, decimals: 2, suffix: "%", label: "20-Day Uptime" },
    { id: "response", icon: Zap, value: metrics?.avgResponseMs ?? 0, decimals: 0, suffix: " ms", label: "Avg Response" },
    { id: "incidents", icon: FileWarning, value: metrics?.activeIncidents ?? 0, decimals: 0, suffix: "", label: "Active Incidents" },
    { id: "systems", icon: Server, value: metrics?.systemsOnline ?? 0, decimals: 0, suffix: metrics ? ` / ${metrics.systemsTotal}` : "", label: "Systems Online" },
  ];

  return (
    <div ref={rootRef} className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {defs.map((m) => (
        <div key={m.id} data-metric-card>
          <MetricCard metric={m} ready={ready} />
        </div>
      ))}
    </div>
  );
}
