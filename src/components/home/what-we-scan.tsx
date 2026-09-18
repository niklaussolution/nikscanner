"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Link as LinkIcon,
  FileText,
  Globe,
  Network,
  QrCode,
  Shield,
  CheckCircle2,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScannerDef {
  icon: LucideIcon;
  title: string;
  desc: string;
  percent: number;
  side: "left" | "right";
  featured?: boolean;
}

const LEFT_SCANNERS: ScannerDef[] = [
  { icon: LinkIcon, title: "URL Scanner", desc: "Reputation, redirects, SSL and phishing analysis for any link.", percent: 78, side: "left" },
  { icon: FileText, title: "File Scanner", desc: "Static analysis, signature detection and hash reputation.", percent: 62, side: "left" },
  { icon: Globe, title: "Domain Scanner", desc: "WHOIS, DNS, SPF/DKIM/DMARC and hosting intelligence.", percent: 46, side: "left" },
];

const RIGHT_SCANNERS: ScannerDef[] = [
  { icon: Network, title: "IP Scanner", desc: "Geolocation, ASN, proxy/VPN/Tor and abuse reputation.", percent: 71, side: "right" },
  { icon: QrCode, title: "QR Scanner", desc: "Decode and analyze the destination before you open it.", percent: 89, side: "right", featured: true },
];

const SPARK_POINTS = [3, 5, 4, 7, 5, 8, 6, 9, 7, 10];

function Sparkline() {
  const w = 80;
  const h = 20;
  const max = Math.max(...SPARK_POINTS);
  const min = Math.min(...SPARK_POINTS);
  const step = w / (SPARK_POINTS.length - 1);
  const path = SPARK_POINTS.map((p, i) => `${i === 0 ? "M" : "L"}${i * step},${h - ((p - min) / (max - min || 1)) * h}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-4 w-16 shrink-0" preserveAspectRatio="none">
      <path d={path} fill="none" stroke="#ff7a00" strokeWidth="1.5" />
    </svg>
  );
}

function ScanCard({ scanner, index }: { scanner: ScannerDef; index: number }) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    gsap.fromTo(
      bar,
      { width: "0%" },
      {
        width: `${scanner.percent}%`,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: bar,
          start: "top 85%",
          once: true,
        },
      },
    );
  }, [scanner.percent]);

  const isLeft = scanner.side === "left";

  return (
    <div data-scan-card={scanner.side} data-index={index} style={{ perspective: "1600px" }}>
      <div
        className={cn(
          "relative rounded-xl border p-5 shadow-2xl shadow-black/40 transition-colors",
          scanner.featured
            ? "border-flame-primary/60 bg-gradient-to-b from-flame-primary/10 to-card-bg shadow-[0_0_30px_-8px_rgba(255,90,0,0.45)]"
            : "border-border-subtle bg-card-bg",
        )}
        style={{
          transform: `rotateY(${isLeft ? 10 : -10}deg) rotateX(2deg)`,
          transformOrigin: isLeft ? "right center" : "left center",
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-flame-primary/50 bg-flame-deep/20 text-flame-bright">
              <scanner.icon className="h-5 w-5" />
            </span>
            <h3 className="font-heading text-base font-bold text-white">{scanner.title}</h3>
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Ready
          </span>
        </div>

        <p className="mt-3 text-sm text-muted">{scanner.desc}</p>

        <div className="mt-4 flex items-center gap-3">
          <Sparkline />
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div ref={barRef} className="h-full rounded-full bg-gradient-to-r from-flame-hot to-flame-bright" style={{ width: "0%" }} />
          </div>
          <span className="shrink-0 text-xs font-semibold text-muted">{scanner.percent}%</span>
        </div>

        {scanner.featured && (
          <div className="mt-4 flex justify-end">
            <a
              href="/scanner/qr"
              className="inline-flex items-center gap-1.5 rounded-lg bg-flame-primary px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-flame-bright"
            >
              Scan Now <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function CornerNote({
  lines,
  align,
  className,
  style,
}: {
  lines: string[];
  align: "left" | "right";
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={cn("flex gap-2", align === "right" && "flex-row-reverse text-right", className)} style={style}>
      <span className="w-px shrink-0 bg-gradient-to-b from-flame-primary to-transparent" />
      <div className="text-[10px] font-semibold uppercase leading-relaxed tracking-widest text-muted/70">
        {lines.map((l) => (
          <p key={l}>{l}</p>
        ))}
      </div>
    </div>
  );
}

const CONNECTOR_ROWS: { y: number; side: "left" | "right" }[] = [
  { y: 110, side: "left" },
  { y: 300, side: "left" },
  { y: 490, side: "left" },
  { y: 110, side: "right" },
  { y: 300, side: "right" },
  { y: 490, side: "right" },
];

// 8 decorative dots evenly spaced around the middle radar ring.
const RING_DOTS = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * Math.PI * 2;
  const r = 88;
  return { cx: 500 + Math.cos(angle) * r, cy: 300 + Math.sin(angle) * r };
});

function ConnectorLines() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const paths = svg.querySelectorAll<SVGPathElement>("path[data-connector]");
    const nodes = svg.querySelectorAll<SVGCircleElement>("circle[data-node]");

    paths.forEach((path) => {
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 1.4,
        ease: "power2.out",
        scrollTrigger: { trigger: svg, start: "top 80%", once: true },
      });
    });

    gsap.fromTo(
      nodes,
      { opacity: 0, scale: 0 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        stagger: 0.06,
        delay: 0.5,
        ease: "back.out(2)",
        scrollTrigger: { trigger: svg, start: "top 80%", once: true },
      },
    );

    const ring = svg.querySelectorAll<SVGCircleElement>("circle[data-ring-dot]");
    gsap.to(ring, {
      opacity: 0.3,
      duration: 1.2,
      repeat: -1,
      yoyo: true,
      stagger: 0.15,
      ease: "sine.inOut",
    });
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 1000 600"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
    >
      {CONNECTOR_ROWS.map((row, i) => {
        const isLeft = row.side === "left";
        const cardEdgeX = isLeft ? 350 : 650;
        const bendX = isLeft ? 430 : 570;
        const circleEdgeX = isLeft ? 412 : 588;
        const circleY = 300 + (row.y - 300) * 0.45;
        const d = `M${cardEdgeX},${row.y} L${bendX},${row.y} L${circleEdgeX},${circleY}`;
        return (
          <g key={i}>
            <path data-connector d={d} fill="none" stroke="rgba(255,90,0,0.45)" strokeWidth="1.5" strokeLinejoin="round" />
            <circle data-node cx={bendX} cy={row.y} r="4" fill="#ff7a00" />
            <circle data-node cx={circleEdgeX} cy={circleY} r="3" fill="#ff7a00" />
          </g>
        );
      })}

      {RING_DOTS.map((d, i) => (
        <circle key={i} data-ring-dot cx={d.cx} cy={d.cy} r="3.5" fill="#ff7a00" opacity="0.9" />
      ))}
    </svg>
  );
}

function GlobeHorizon() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 overflow-hidden sm:h-80">
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full opacity-80"
        style={{
          top: "56px",
          width: "3600px",
          height: "3600px",
          backgroundImage: "radial-gradient(rgba(255,122,0,0.65) 1.4px, transparent 1.4px)",
          backgroundSize: "16px 16px",
        }}
      />
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full border border-flame-primary/25"
        style={{ top: "56px", width: "3600px", height: "3600px" }}
      />
    </div>
  );
}

export function WhatWeScan() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Scoped to this section so cleanup only reverts animations THIS
    // component created — a global `ScrollTrigger.getAll().forEach(kill)`
    // would also kill other sections' triggers (e.g. HowItWorks), which in
    // React's dev-mode double-invoke can permanently break them.
    const ctx = gsap.context(() => {
      const cards = section.querySelectorAll<HTMLElement>("[data-scan-card]");
      cards.forEach((card) => {
        const side = card.dataset.scanCard;
        gsap.fromTo(
          card,
          { opacity: 0, x: side === "left" ? -30 : 30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: { trigger: card, start: "top 88%", once: true },
          },
        );
      });

      const rings = section.querySelectorAll<HTMLElement>("[data-radar-ring]");
      rings.forEach((ring, i) => {
        gsap.to(ring, {
          scale: 1.15,
          opacity: 0,
          duration: 2.4,
          repeat: -1,
          delay: i * 0.6,
          ease: "power1.out",
        });
      });
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-bg-black pt-24 pb-56 sm:pb-64">
      {/* <GlobeHorizon /> */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-flame-primary/15 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <CornerNote lines={["One", "Platform", "Greater", "Security"]} align="left" className="absolute left-4 top-0 hidden lg:flex" />
        <CornerNote lines={["Detect", "Analyze", "Stay Ahead"]} align="right" className="absolute right-4 top-0 hidden lg:flex" />
        <CornerNote
          lines={["More Surfaces.", "Less Blind Spots."]}
          align="left"
          className="absolute left-4 hidden lg:flex"
          style={{ bottom: "-160px" }}
        />
        <CornerNote
          lines={["Scans Today", "A Safer Tomorrow."]}
          align="right"
          className="absolute right-4 hidden lg:flex"
          style={{ bottom: "-160px" }}
        />

        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-flame-bright">Coverage</p>
          <h2 className="mt-3 font-heading text-3xl font-bold text-white sm:text-4xl">What NIKSCANNER Scans</h2>
          <p className="mt-3 text-muted">One platform, every attack surface — from a single link to a full device.</p>
        </div>

        <div className="relative mt-16">
          <ConnectorLines />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-x-16">
            <div className="space-y-6">
              {LEFT_SCANNERS.map((s, i) => (
                <ScanCard key={s.title} scanner={s} index={i} />
              ))}
            </div>

            <div className="relative mx-auto hidden h-64 w-64 shrink-0 items-center justify-center lg:flex">
              <div data-radar-ring className="absolute h-full w-full rounded-full border border-flame-primary/25" />
              <div data-radar-ring className="absolute h-[78%] w-[78%] rounded-full border border-flame-primary/25" />
              <div data-radar-ring className="absolute h-[56%] w-[56%] rounded-full border border-flame-primary/25" />
              <div className="absolute h-full w-full rounded-full border border-flame-primary/15" />
              <div className="absolute h-[78%] w-[78%] rounded-full border border-flame-primary/20" />
              <div className="absolute h-[56%] w-[56%] rounded-full border border-flame-primary/25" />

              <div className="relative flex flex-col items-center pt-14">
                <div className="flex h-24 w-24 items-center justify-center rounded-full border border-flame-primary/40 bg-flame-primary/10">
                  <Shield className="h-11 w-11 text-flame-bright" strokeWidth={1.5} />
                </div>
                <p className="mt-4 whitespace-nowrap text-xs font-bold uppercase tracking-widest text-white">Unified Scan Engine</p>
                <p className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Online
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {RIGHT_SCANNERS.map((s, i) => (
                <ScanCard key={s.title} scanner={s} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
