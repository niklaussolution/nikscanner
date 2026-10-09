"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";
import { Link as LinkIcon, ShieldCheck, Globe, BarChart2, ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { publicJson } from "@/lib/firebase/api";
import { LiveActivityTicker } from "@/components/home/live-activity-ticker";

interface BackendStats {
  url_scans_total: number;
  confirmed: number;
  countries: number;
}

interface StatDef {
  icon: LucideIcon;
  value: number;
  decimals?: number;
  suffix: string;
  label: string;
  trend?: string;
  spark?: number[];
}

function formatIndian(value: number, decimals: number) {
  return value.toLocaleString("en-IN", { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
}

function Sparkline({ points }: { points: number[] }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const w = 100;
  const h = 28;
  const step = w / (points.length - 1);
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${i * step},${h - ((p - min) / (max - min || 1)) * h}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-7 w-full" preserveAspectRatio="none">
      <path d={path} fill="none" stroke="#ff7a00" strokeWidth="1.5" />
    </svg>
  );
}

function StatCard({ stat }: { stat: StatDef }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, stat.value, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    return controls.stop;
  }, [inView, stat.value]);

  return (
    <div ref={ref} className="min-w-0 rounded-xl border border-border-subtle bg-card-bg p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-flame-primary/25 bg-flame-primary/10 text-flame-bright">
          <stat.icon className="h-4.5 w-4.5" />
        </span>
        {stat.trend && (
          <span className="flex items-center gap-0.5 text-xs font-semibold text-success">
            <ArrowUpRight className="h-3.5 w-3.5" /> {stat.trend}
          </span>
        )}
      </div>
      <p className="mt-4 font-heading text-2xl font-bold text-flame-gradient sm:text-3xl">
        {formatIndian(display, stat.decimals ?? 0)}
        {stat.suffix}
      </p>
      <p className="mt-1 text-[11px] uppercase tracking-wider text-muted sm:text-xs">{stat.label}</p>
      {stat.spark && (
        <div className="mt-3">
          <Sparkline points={stat.spark} />
        </div>
      )}
    </div>
  );
}

export function StatsSection() {
  const [stats, setStats] = useState<BackendStats | null>(null);

  useEffect(() => {
    publicJson<BackendStats>("/api/stats")
      .then(setStats)
      .catch(() => {
        // Non-fatal — the cards just stay at 0 until this succeeds.
      });
  }, []);

  const defs: StatDef[] = [
    { icon: LinkIcon, value: stats?.url_scans_total ?? 0, suffix: "", label: "URLs Scanned" },
    { icon: ShieldCheck, value: stats?.confirmed ?? 0, suffix: "", label: "Threats Detected" },
    { icon: Globe, value: stats?.countries ?? 0, suffix: "", label: "Countries" },
    {
      icon: BarChart2,
      value: 100,
      decimals: 0,
      suffix: "%",
      label: "Platform Availability",
      trend: "+0.01%",
      spark: [9, 9, 10, 9, 10, 10, 9, 10, 10, 10],
    },
  ];

  return (
    <section className="border-t border-border-subtle bg-bg-black py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-center gap-4">
          <span className="h-px flex-1 bg-border-subtle" />
          <span className="flex shrink-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-flame-primary" />
            Global Threat Network
            <span className="h-1.5 w-1.5 rounded-full bg-flame-primary" />
          </span>
          <span className="h-px flex-1 bg-border-subtle" />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {defs.map((s) => (
            <StatCard key={s.label} stat={s} />
          ))}
        </div>

        <div className="mt-6">
          <LiveActivityTicker />
        </div>
      </div>
    </section>
  );
}
