"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ArrowUp, Shield, Link as LinkIcon, FileText, Globe } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ThreatMapPanel } from "@/components/threat-intelligence/threat-map-panel";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface MetricDef {
  icon: LucideIcon;
  value: number;
  suffix: string;
  label: string;
  trend: string;
  spark: number[];
}

const METRICS: MetricDef[] = [
  { icon: Shield, value: 8412, suffix: "", label: "Threats Detected Today", trend: "+12%", spark: [4, 6, 5, 7, 6, 8, 7, 9, 8, 10] },
  { icon: LinkIcon, value: 142006, suffix: "", label: "URLs Analyzed", trend: "+8%", spark: [6, 6, 7, 6, 8, 7, 8, 9, 8, 9] },
  { icon: FileText, value: 9884, suffix: "", label: "Files Scanned", trend: "+23%", spark: [3, 4, 4, 6, 5, 8, 7, 9, 10, 11] },
  { icon: Globe, value: 190, suffix: "+", label: "Countries Protected", trend: "+0%", spark: [8, 8, 8, 8, 8, 8, 8, 8, 8, 8] },
];

function Sparkline({ points }: { points: number[] }) {
  const pathRef = useRef<SVGPathElement>(null);
  const w = 100;
  const h = 28;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const step = w / (points.length - 1);
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${i * step},${h - ((p - min) / (max - min || 1)) * h}`).join(" ");

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    gsap.to(path, {
      strokeDashoffset: 0,
      duration: 1.2,
      ease: "power2.out",
      scrollTrigger: { trigger: path, start: "top 90%", once: true },
    });
  }, [d]);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-7 w-full" preserveAspectRatio="none">
      <path ref={pathRef} d={d} fill="none" stroke="#ff7a1a" strokeWidth="1.5" />
    </svg>
  );
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
            duration: 1.6,
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

  return (
    <div ref={cardRef} className="rounded-xl border border-border-subtle bg-card-bg p-5 opacity-0" style={{ transform: "translateY(16px)" }}>
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-flame-primary/25 bg-flame-primary/10 text-flame-bright">
          <metric.icon className="h-4.5 w-4.5" />
        </span>
        <span className="flex items-center gap-0.5 text-xs font-semibold text-success">
          <ArrowUp className="h-3.5 w-3.5" /> {metric.trend}
        </span>
      </div>
      <p className="mt-4 font-heading text-2xl font-bold text-white sm:text-3xl">
        {display.toLocaleString("en-US")}
        {metric.suffix}
      </p>
      <p className="mt-1 text-xs uppercase tracking-wider text-muted">{metric.label}</p>
      <div className="mt-3">
        <Sparkline points={metric.spark} />
      </div>
    </div>
  );
}

export function ThreatMapSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

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

  return (
    <section id="map" ref={sectionRef} className="border-t border-border-subtle bg-secondary-dark py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p data-header-bit className="text-xs font-semibold uppercase tracking-widest text-flame-bright">
              Live Telemetry
            </p>
            <h2 data-header-bit className="mt-3 font-heading text-3xl font-bold text-white sm:text-4xl">
              Global Threat Map
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
              190+ Countries
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
          {METRICS.map((m, i) => (
            <MetricCard key={m.label} metric={m} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
