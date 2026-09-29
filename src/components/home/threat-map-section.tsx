"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ArrowUp, ArrowDown, Shield, Link as LinkIcon, FileText, Globe } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ThreatMapPanel } from "@/components/threat-intelligence/threat-map-panel";
import { publicJson } from "@/lib/firebase/api";
import ScrollFloat from "@/components/ui/ScrollFloat";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface DailyStats {
  threats_detected_today: number;
  threats_detected_yesterday: number;
  urls_analyzed_today: number;
  urls_analyzed_yesterday: number;
  files_scanned_today: number;
  files_scanned_yesterday: number;
  countries: number;
}

interface MetricDef {
  icon: LucideIcon;
  value: number;
  suffix: string;
  label: string;
  trend: string | null;
}

function pctChange(today: number, yesterday: number): string | null {
  if (yesterday === 0) return today > 0 ? "+100%" : null;
  const pct = Math.round(((today - yesterday) / yesterday) * 100);
  return `${pct >= 0 ? "+" : ""}${pct}%`;
}

function buildMetrics(stats: DailyStats): MetricDef[] {
  return [
    {
      icon: Shield,
      value: stats.threats_detected_today,
      suffix: "",
      label: "Threats Detected Today",
      trend: pctChange(stats.threats_detected_today, stats.threats_detected_yesterday),
    },
    {
      icon: LinkIcon,
      value: stats.urls_analyzed_today,
      suffix: "",
      label: "URLs Analyzed",
      trend: pctChange(stats.urls_analyzed_today, stats.urls_analyzed_yesterday),
    },
    {
      icon: FileText,
      value: stats.files_scanned_today,
      suffix: "",
      label: "Files Scanned",
      trend: pctChange(stats.files_scanned_today, stats.files_scanned_yesterday),
    },
    {
      icon: Globe,
      value: stats.countries,
      suffix: "",
      label: "Countries Protected",
      trend: null,
    },
  ];
}

function MetricCard({ metric, index }: { metric: MetricDef; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    ScrollTrigger.create({
      trigger: card,
      start: "top 90%",
      once: true,
      onEnter: () => {
        gsap.to(card, { opacity: 1, y: 0, duration: 0.5, delay: index * 0.1, ease: "power2.out" });
        gsap.to(
          { v: 0 },
          {
            v: metric.value,
            duration: 1.2,
            delay: index * 0.1,
            ease: "power2.out",
            onUpdate: function () {
              setDisplay(Math.round(this.targets()[0].v));
            },
          },
        );
      },
    });
  }, [index, metric.value]);

  const isDown = metric.trend?.startsWith("-");

  return (
    <div ref={cardRef} className="rounded-xl border border-border-subtle bg-card-bg p-5 opacity-0" style={{ transform: "translateY(16px)" }}>
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-flame-primary/25 bg-flame-primary/10 text-flame-bright">
          <metric.icon className="h-4.5 w-4.5" />
        </span>
        {metric.trend && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${isDown ? "text-danger" : "text-success"}`}>
            {isDown ? <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUp className="h-3.5 w-3.5" />} {metric.trend}
          </span>
        )}
      </div>
      <p className="mt-4 font-heading text-2xl font-bold text-white sm:text-3xl">
        {display.toLocaleString("en-US")}
        {metric.suffix}
      </p>
      <p className="mt-1 text-xs uppercase tracking-wider text-muted">{metric.label}</p>
      {/* <p className="mt-3 text-[10px] uppercase tracking-wide text-muted/60">
        {metric.trend ? "vs. yesterday" : "cumulative"}
      </p> */}
    </div>
  );
}

const EMPTY_STATS: DailyStats = {
  threats_detected_today: 0,
  threats_detected_yesterday: 0,
  urls_analyzed_today: 0,
  urls_analyzed_yesterday: 0,
  files_scanned_today: 0,
  files_scanned_yesterday: 0,
  countries: 0,
};

export function ThreatMapSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState<DailyStats>(EMPTY_STATS);

  useEffect(() => {
    publicJson<DailyStats>("/api/stats/daily")
      .then(setStats)
      .catch(() => {
        // Non-fatal — cards just show 0 until this succeeds.
      });
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const headerBits = section.querySelectorAll<HTMLElement>("[data-header-bit]");
      gsap.fromTo(
        headerBits,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: { trigger: section, start: "top 80%", once: true },
        },
      );

      const panel = section.querySelector("[data-map-panel]");
      gsap.fromTo(
        panel,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: { trigger: panel, start: "top 85%", once: true },
        },
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const metrics = buildMetrics(stats);

  return (
    <section id="map" ref={sectionRef} className="border-t border-border-subtle bg-secondary-dark py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p data-header-bit className="text-xs font-semibold uppercase tracking-widest text-flame-bright">
              Live Telemetry
            </p>
            <h2 data-header-bit className="mt-3 font-heading text-3xl font-bold text-white sm:text-4xl">
              <ScrollFloat text="Global Threat Map" splitBy="words" />
            </h2>
            <p data-header-bit className="mt-2 text-sm text-muted">
              Watch threats move across the world in real time.
            </p>
          </div>

          <div data-header-bit className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-glow" /> Live
            </span>
            <span className="rounded-full border border-border-subtle px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
              Updated 2s ago
            </span>
            <span className="rounded-full border border-border-subtle px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
              {stats.countries}+ Countries
            </span>
            <Link
              href="/threat-intelligence"
              className="ml-1 flex items-center gap-1 text-sm font-medium text-flame-bright hover:text-flame-primary"
            >
              View full threat intelligence <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div data-map-panel className="mt-8 opacity-0">
          <ThreatMapPanel />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m, i) => (
            <MetricCard key={m.label} metric={m} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
