"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import {
  Link as LinkIcon,
  Upload,
  FileText,
  Database,
  Globe,
  Network,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function TickMarks() {
  return (
    <svg width="30" height="10" viewBox="0 0 30 10" className="shrink-0">
      {[0, 6, 12, 18, 24].map((x) => (
        <line key={x} x1={x} y1="10" x2={x + 5} y2="0" stroke="#ff5a00" strokeWidth="1.5" opacity="0.5" />
      ))}
    </svg>
  );
}

function MiniBars() {
  const heights = [5, 9, 4, 11, 6, 8];
  return (
    <div className="flex shrink-0 items-end gap-0.5">
      {heights.map((h, i) => (
        <span key={i} className="w-0.5 rounded-full bg-flame-primary/70" style={{ height: h }} />
      ))}
    </div>
  );
}

function SubmitVisual() {
  return (
    <div className="mt-4 space-y-2.5">
      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2.5">
        <LinkIcon className="h-3.5 w-3.5 shrink-0 text-muted" />
        <span className="flex-1 truncate text-xs text-muted">https://example.com</span>
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-flame-primary text-white">
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-flame-primary/30 py-3.5 text-center">
        <Upload className="h-4 w-4 text-flame-bright" />
        <p className="text-[10px] leading-tight text-muted">
          Drop a file here
          <br />
          or click to upload
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {["URL", "EXE", "HASH"].map((tag) => (
          <div key={tag} className="flex flex-col items-center gap-1 rounded-lg border border-border-subtle bg-card-elevated py-2">
            <FileText className="h-3.5 w-3.5 text-muted" />
            <span className="text-[9px] font-semibold text-muted">{tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyzeVisual() {
  const rows = [
    { icon: Database, label: "Signatures" },
    { icon: Globe, label: "Reputation" },
    { icon: Network, label: "Behaviour" },
  ];
  return (
    <div className="mt-4">
      <div className="relative mx-auto mb-4 h-24 w-24">
        <div data-radar-ring className="absolute inset-0 rounded-full border border-flame-primary/25" />
        <div data-radar-ring className="absolute inset-2 rounded-full border border-flame-primary/25" />
        <div data-radar-ring className="absolute inset-5 rounded-full border border-flame-primary/30" />
        <div
          data-radar-sweep
          className="absolute left-1/2 top-1/2 h-1/2 w-px origin-top -translate-x-1/2 bg-gradient-to-b from-flame-bright to-transparent"
        />
      </div>
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-2 rounded-lg border border-border-subtle bg-card-elevated px-2.5 py-1.5">
            <r.icon className="h-3.5 w-3.5 shrink-0 text-flame-bright" />
            <span className="flex-1 text-[9px] font-semibold uppercase tracking-wide text-muted">{r.label}</span>
            <MiniBars />
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
          </div>
        ))}
      </div>
    </div>
  );
}

const GRAPH_NODES: [number, number, boolean][] = [
  [40, 20, false],
  [160, 20, false],
  [30, 70, true],
  [170, 75, false],
  [100, 15, false],
  [70, 88, false],
  [132, 88, false],
];

function DetectVisual() {
  const rows = [
    { label: "Malware Engine", status: "Suspicious" },
    { label: "Reputation Check", status: "Malicious" },
    { label: "Community Signals", status: "High Risk" },
    // { label: "Heuristic Analysis", status: "Suspicious" },
  ];
  return (
    <div className="mt-4">
      <div className="relative mx-auto mb-4 h-24 w-full overflow-hidden rounded-lg">
        <svg viewBox="0 0 200 100" className="h-full w-full">
          {GRAPH_NODES.map(([x, y], i) => (
            <line key={i} x1="100" y1="50" x2={x} y2={y} stroke="rgba(255,90,0,0.3)" strokeWidth="1" />
          ))}
          <circle cx="100" cy="50" r="6" fill="#ef4444" />
          {GRAPH_NODES.map(([x, y, isRed], i) => (
            <circle key={i} cx={x} cy={y} r={isRed ? 3.5 : 2.5} fill={isRed ? "#ef4444" : "#ff7a00"} />
          ))}
          <rect data-scan-beam x="0" y="0" width="14" height="100" fill="url(#scanBeamGradient)" />
          <defs>
            <linearGradient id="scanBeamGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ff7a1a" stopOpacity="0" />
              <stop offset="50%" stopColor="#ff7a1a" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ff7a1a" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        <span className="absolute right-0 top-1 flex items-center gap-1 rounded-full border border-danger/40 bg-danger/10 px-2 py-1 text-[9px] font-bold uppercase text-danger">
          <AlertTriangle className="h-3 w-3" /> Threat Found
        </span>
      </div>
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between rounded-lg border border-border-subtle bg-card-elevated px-2.5 py-1.5">
            <span className="truncate text-[9.5px] text-muted">{r.label}</span>
            <span className="flex shrink-0 items-center gap-1 text-[9.5px] font-semibold text-warning">
              {r.status} <AlertTriangle className="h-3 w-3" />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProtectVisual() {
  const items = ["Block malicious content", "Get detailed recommendations", "Keep your environment safe"];
  return (
    <div className="mt-4">
      <div className="relative mx-auto mb-4 flex h-24 w-24 items-center justify-center">
        <div data-shield-ring className="absolute inset-0 rounded-full border border-success/25" />
        <div data-shield-ring className="absolute inset-3 rounded-full border border-success/25" />
        <div data-shield-ring className="absolute inset-6 rounded-full border border-success/30" />
        <ShieldCheck className="h-10 w-10 text-success" strokeWidth={1.5} />
      </div>
      <div className="mb-3 flex justify-center">
        <span className="flex items-center gap-1 rounded-full border border-success/40 bg-success/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-success">
          <CheckCircle2 className="h-3 w-3" /> Protected
        </span>
      </div>
      <div className="space-y-1.5">
        {items.map((t) => (
          <div key={t} className="flex items-center gap-2 text-[10.5px] text-muted">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

interface StepDef {
  step: string;
  title: string;
  desc: string;
  footer: string;
  active?: boolean;
  badge?: string;
  render: () => React.ReactNode;
}

const STEPS: StepDef[] = [
  {
    step: "01",
    title: "Submit",
    desc: "Paste a URL, upload a file, or submit an indicator.",
    footer: "INDICATORS IN",
    render: () => <SubmitVisual />,
  },
  {
    step: "02",
    title: "Analyze",
    desc: "NIKSCANNER checks security and reputation intelligence.",
    footer: "INTELLIGENCE ENGINES",
    render: () => <AnalyzeVisual />,
  },
  {
    step: "03",
    title: "Detect",
    desc: "Threat signals are correlated across engines and community data.",
    footer: "CORRELATING THREATS",
    active: true,
    badge: "Scanning...",
    render: () => <DetectVisual />,
  },
  {
    step: "04",
    title: "Protect",
    desc: "Receive recommendations and block dangerous content.",
    footer: "THREATS STOPPED",
    render: () => <ProtectVisual />,
  },
];

const STAGES = [
  { label: "Submitted", tone: "flame" as const },
  { label: "Analyzing", tone: "flame" as const },
  { label: "Signal Correlation", tone: "flame" as const, active: true },
  { label: "Protected", tone: "success" as const },
];

/** Small dot + chevron connector used at the tablet (2x2) breakpoint only. */
function MiniConnector({ vertical }: { vertical?: boolean }) {
  return (
    <div className={cn("flex items-center justify-center", vertical ? "h-10 w-full" : "h-full w-10")}>
      <div className={cn("flex items-center gap-1", vertical && "flex-col")}>
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-flame-primary shadow-[0_0_8px_rgba(255,90,0,0.8)]" />
        <ArrowRight className={cn("h-3.5 w-3.5 shrink-0 text-flame-primary/60", vertical && "rotate-90")} />
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-flame-primary shadow-[0_0_8px_rgba(255,90,0,0.8)]" />
      </div>
    </div>
  );
}

/** Continuous glowing pipeline spanning all four desktop cards, with travelling packets. */
function Pipeline() {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const path = pathRef.current;
    if (!svg || !path) return;

    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    const draw = gsap.to(path, {
      strokeDashoffset: 0,
      duration: 1.6,
      ease: "power2.inOut",
      scrollTrigger: { trigger: svg, start: "top 80%", once: true },
    });

    const packets: gsap.core.Tween[] = [];
    if (!prefersReducedMotion()) {
      const dots = svg.querySelectorAll<SVGCircleElement>("[data-packet]");
      dots.forEach((dot, i) => {
        packets.push(
          gsap.to(dot, {
            motionPath: { path, align: path, alignOrigin: [0.5, 0.5] },
            duration: 3.2,
            repeat: -1,
            delay: i * 1.1 + 1.6,
            ease: "power1.inOut",
          }),
        );
      });
    }

    return () => {
      draw.kill();
      packets.forEach((p) => p.kill());
    };
  }, []);

  return (
    // <svg
    //   ref={svgRef}
    //   viewBox="0 0 1000 100"
    //   preserveAspectRatio="none"
    //   className="pointer-events-none absolute inset-x-0 top-[168px] z-0 hidden h-24 w-full lg:block"
    // >
    //   <path
    //     ref={pathRef}
    //     d="M125,50 Q250,86 375,50 Q500,86 625,50 Q750,86 875,50"
    //     fill="none"
    //     stroke="url(#pipelineGradient)"
    //     strokeWidth="2.5"
    //     strokeLinecap="round"
    //   />
    //   <linearGradient id="pipelineGradient" x1="0" y1="0" x2="1" y2="0">
    //     <stop offset="0%" stopColor="#ff5a00" />
    //     <stop offset="50%" stopColor="#ff7a1a" />
    //     <stop offset="100%" stopColor="#ff5a00" />
    //   </linearGradient>
    //   {[125, 375, 625, 875].map((x) => (
    //     <circle key={x} cx={x} cy="50" r="4" fill="#ff7a1a" />
    //   ))}
    //   {[0, 1, 2].map((i) => (
    //     <circle key={i} data-packet r="3.5" fill="#fff3e8" opacity="0.9" />
    //   ))}
    // </svg>


    <svg
  ref={svgRef}
  viewBox="0 0 1000 100"
  preserveAspectRatio="none"
  className="pointer-events-none absolute inset-x-0 top-[168px] z-0 hidden h-24 w-full lg:block"
>
  <defs>
    <linearGradient
      id="pipelineGradient"
      x1="0"
      y1="0"
      x2="1000"
      y2="0"
      gradientUnits="userSpaceOnUse"
    >
      <stop offset="0%" stopColor="#ff5a00" />
      <stop offset="25%" stopColor="#ff6a0a" />
      <stop offset="50%" stopColor="#ff8a2b" />
      <stop offset="75%" stopColor="#ff6a0a" />
      <stop offset="100%" stopColor="#ff5a00" />
    </linearGradient>

    <filter
      id="pipelineGlow"
      x="-50%"
      y="-50%"
      width="200%"
      height="200%"
    >
      <feGaussianBlur stdDeviation="2.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  {/* Main pipeline */}
  <path
    ref={pathRef}
    d="
      M125,50
      Q250,82 375,50
      Q500,82 625,50
      Q750,82 875,50
    "
    fill="none"
    stroke="url(#pipelineGradient)"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  />

  {/* Subtle glow behind the pipeline */}
  <path
    d="
      M125,50
      Q250,82 375,50
      Q500,82 625,50
      Q750,82 875,50
    "
    fill="none"
    stroke="#ff6a0a"
    strokeWidth="5"
    strokeLinecap="round"
    strokeLinejoin="round"
    opacity="0.12"
    filter="url(#pipelineGlow)"
  />

  {/* Pipeline nodes */}
  {[125, 375, 625, 875].map((x) => (
    <g key={x}>
      {/* Outer glow */}
      <circle
        cx={x}
        cy="50"
        r="7"
        fill="#ff7a1a"
        opacity="0.12"
      />

      {/* Node ring */}
      <circle
        cx={x}
        cy="50"
        r="4.5"
        fill="#0f0f0f"
        stroke="#ff7a1a"
        strokeWidth="1.5"
      />

      {/* Node center */}
      <circle
        cx={x}
        cy="50"
        r="2"
        fill="#ff8a2b"
      />
    </g>
  ))}

  {/* Animated data packets */}
  {[0, 1, 2].map((i) => (
    <circle
      key={i}
      data-packet
      r="3.5"
      fill="#fff3e8"
      opacity="0.95"
      filter="url(#pipelineGlow)"
    />
  ))}
</svg>
  );
}

function StepCard({ s, index }: { s: StepDef; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const quickX = useRef<gsap.QuickToFunc | null>(null);
  const quickY = useRef<gsap.QuickToFunc | null>(null);
  const quickRotateX = useRef<gsap.QuickToFunc | null>(null);
  const quickRotateY = useRef<gsap.QuickToFunc | null>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || prefersReducedMotion()) return;

    quickX.current = gsap.quickTo(glowRef.current, "--gx", { duration: 0.4, ease: "power3" });
    quickY.current = gsap.quickTo(glowRef.current, "--gy", { duration: 0.4, ease: "power3" });
    quickRotateX.current = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power3" });
    quickRotateY.current = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power3" });

    gsap.set(card, { transformPerspective: 800 });
  }, []);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card || prefersReducedMotion()) return;
    const rect = card.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const nx = px / rect.width - 0.5;
    const ny = py / rect.height - 0.5;

    quickX.current?.(px);
    quickY.current?.(py);
    quickRotateY.current?.(nx * 8);
    quickRotateX.current?.(-ny * 8);
  }

  function handleMouseLeave() {
    if (prefersReducedMotion()) return;
    quickRotateX.current?.(0);
    quickRotateY.current?.(0);
    gsap.to(cardRef.current, { y: 0, duration: 0.4, ease: "power2.out" });
  }

  function handleMouseEnter() {
    if (prefersReducedMotion()) return;
    gsap.to(cardRef.current, { y: -6, duration: 0.35, ease: "power2.out" });
  }

  return (
    <div data-step-card={index} className="relative isolate pt-10">
      <span
        data-step-number
        aria-hidden
        className="pointer-events-none absolute left-1 top-0 z-0 select-none overflow-hidden font-heading text-7xl font-bold text-white/[0.14]"
        style={{ clipPath: "inset(0 100% 0 0)", textShadow: "0 0 24px rgba(255,90,0,0.25)" }}
      >
        {s.step}
      </span>

      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "relative z-10 rounded-xl border p-5 will-change-transform",
          s.active
            ? "border-flame-primary/70 bg-gradient-to-b from-flame-primary/[0.08] to-card-bg shadow-[0_0_0_1px_rgba(255,90,0,0.25),0_0_25px_-2px_rgba(255,90,0,0.55),0_0_70px_-15px_rgba(255,90,0,0.5)]"
            : "border-border-subtle bg-card-bg",
        )}
      >
        <div
          ref={glowRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 rounded-xl opacity-0 transition-opacity duration-300 hover:opacity-100"
          style={
            {
              background: "radial-gradient(220px circle at var(--gx, 50%) var(--gy, 50%), rgba(255,90,0,0.16), transparent 70%)",
            } as React.CSSProperties
          }
        />

        {s.badge && (
          <span className="absolute right-4 top-4 z-10 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-widest text-flame-bright">
            {s.badge}
            <TickMarks />
          </span>
        )}

        <div className="relative z-10">
          <h3 className="font-heading text-lg font-bold text-white">{s.title}</h3>
          <p className="mt-1.5 text-xs text-muted">{s.desc}</p>

          {s.render()}

          <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-3">
            <span className="text-[9px] font-semibold uppercase tracking-widest text-muted/60">{s.footer}</span>
            <TickMarks />
          </div>
        </div>
      </div>
    </div>
  );
}

export function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduced = prefersReducedMotion();

    // Scope every animation/ScrollTrigger created below to this section, so
    // cleanup only reverts what THIS component created — calling the global
    // `ScrollTrigger.getAll().forEach(kill)` here would also kill triggers
    // belonging to other sections on the page (e.g. WhatWeScan), which in
    // React's dev-mode double-invoke can permanently break them.
    const ctx = gsap.context(() => {
    // Heading reveal
    const headingWords = section.querySelectorAll<HTMLElement>("[data-heading-word]");
    gsap.fromTo(
      headingWords,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 75%", once: true },
      },
    );

    // Card entrance, staggered
    const cards = section.querySelectorAll<HTMLElement>("[data-step-card]");
    gsap.fromTo(
      cards,
      { opacity: 0, y: 32 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: { trigger: cards[0] ?? section, start: "top 85%", once: true },
      },
    );

    // Masked number reveal (wipe left -> right), following the card entrance
    const numbers = section.querySelectorAll<HTMLElement>("[data-step-number]");
    gsap.to(numbers, {
      clipPath: "inset(0 0% 0 0)",
      duration: 0.9,
      stagger: 0.15,
      ease: "power2.out",
      delay: 0.2,
      scrollTrigger: { trigger: cards[0] ?? section, start: "top 85%", once: true },
    });

    // Bottom tracker reveal
    const stages = section.querySelectorAll<HTMLElement>("[data-stage]");
    gsap.fromTo(
      stages,
      { opacity: 0, scale: 0.8 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        stagger: 0.1,
        ease: "back.out(2)",
        scrollTrigger: { trigger: "[data-tracker]", start: "top 90%", once: true },
      },
    );
    const trackerLine = section.querySelector<HTMLElement>("[data-tracker-fill]");
    if (trackerLine) {
      gsap.fromTo(
        trackerLine,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1,
          ease: "power2.inOut",
          transformOrigin: "left center",
          scrollTrigger: { trigger: "[data-tracker]", start: "top 90%", once: true },
        },
      );
    }

    // Continuous (infinite) decorative animations are scoped per-breakpoint via
    // matchMedia so only the currently-visible layout (desktop/tablet/mobile —
    // all three are always mounted, switched with CSS `hidden`) actually
    // animates. Without this, all three hidden/visible copies of every card
    // would run their infinite tweens simultaneously, tripling the animation
    // load for no visual benefit.
    const mm = gsap.matchMedia();
    if (!reduced) {
      mm.add(
        {
          isDesktop: "(min-width: 1024px)",
          isTablet: "(min-width: 640px) and (max-width: 1023px)",
          isMobile: "(max-width: 639px)",
        },
        (context) => {
          const conditions = context.conditions as { isDesktop: boolean; isTablet: boolean; isMobile: boolean };
          const layout = conditions.isDesktop ? "desktop" : conditions.isTablet ? "tablet" : "mobile";
          const root = section.querySelector(`[data-layout="${layout}"]`);
          if (!root) return;

          root.querySelectorAll<HTMLElement>("[data-radar-ring]").forEach((ring, i) => {
            gsap.to(ring, { scale: 1.12, opacity: 0, duration: 2.2, repeat: -1, delay: i * 0.5, ease: "power1.out" });
          });
          root.querySelectorAll<HTMLElement>("[data-radar-sweep]").forEach((sweep) => {
            gsap.to(sweep, { rotate: 360, duration: 3, repeat: -1, ease: "linear", transformOrigin: "top center" });
          });
          root.querySelectorAll<SVGRectElement>("[data-scan-beam]").forEach((beam) => {
            gsap.fromTo(beam, { x: -20 }, { x: 200, duration: 2.4, repeat: -1, ease: "sine.inOut" });
          });
          root.querySelectorAll<HTMLElement>("[data-shield-ring]").forEach((ring, i) => {
            gsap.to(ring, { scale: 1.15, opacity: 0, duration: 2.4, repeat: -1, delay: i * 0.5, ease: "power1.out" });
          });
        },
      );
    }
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden border-t border-border-subtle bg-secondary-dark bg-grid py-24">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p data-heading-word className="text-xs font-semibold uppercase tracking-widest text-flame-bright">
            Process
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold text-white sm:text-4xl">
            <span data-heading-word className="inline-block">
              How
            </span>{" "}
            <span data-heading-word className="inline-block text-flame-gradient">
              NIKSCANNER
            </span>{" "}
            <span data-heading-word className="inline-block">
              Works
            </span>
          </h2>
          <p data-heading-word className="mt-3 text-muted">
            From submission to protection in seconds.
          </p>
        </div>

        <div className="relative mt-20">
          {/* Desktop (lg+): one continuous pipeline behind a 4-up row */}
          <Pipeline />
          <div data-layout="desktop" className="relative z-10 hidden lg:grid lg:grid-cols-4 lg:gap-x-10">
            {STEPS.map((s, i) => (
              <StepCard key={s.step} s={s} index={i} />
            ))}
          </div>

          {/* Tablet (sm-lg): 2x2 grid with connectors between cards */}
          <div data-layout="tablet" className="hidden sm:grid sm:grid-cols-[1fr_2.5rem_1fr] sm:items-stretch lg:hidden">
            <StepCard s={STEPS[0]} index={0} />
            <MiniConnector />
            <StepCard s={STEPS[1]} index={1} />

            <div className="col-span-3 flex justify-center">
              <MiniConnector vertical />
            </div>

            <StepCard s={STEPS[2]} index={2} />
            <MiniConnector />
            <StepCard s={STEPS[3]} index={3} />
          </div>

          {/* Mobile (<sm): vertical timeline */}
          <div data-layout="mobile" className="relative space-y-8 sm:hidden">
            <span className="pointer-events-none absolute bottom-6 left-5 top-6 w-px bg-gradient-to-b from-flame-primary/50 via-flame-primary/20 to-transparent" />
            {STEPS.map((s, i) => (
              <div key={s.step} className="relative pl-2">
                <StepCard s={s} index={i} />
              </div>
            ))}
          </div>
        </div>

        <div data-tracker className="relative mx-auto mt-16 flex max-w-4xl flex-wrap items-center justify-center gap-x-3 gap-y-3">
          <span className="absolute left-0 right-0 top-1/2 hidden h-px -translate-y-1/2 bg-border-subtle sm:block" />
          <span
            data-tracker-fill
            className="absolute left-0 top-1/2 hidden h-px w-3/4 -translate-y-1/2 bg-gradient-to-r from-flame-hot via-flame-bright to-success sm:block"
            style={{ transform: "scaleX(0)" }}
          />
          {STAGES.map((stage, i) => (
            <div key={stage.label} data-stage className="relative z-10 flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full bg-secondary-dark px-2">
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-full",
                    stage.tone === "success" ? "bg-success" : "bg-flame-primary",
                    stage.active && "animate-pulse-glow",
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wide",
                    stage.active ? "text-flame-bright" : stage.tone === "success" ? "text-success" : "text-muted",
                  )}
                >
                  {stage.label}
                </span>
              </div>
              {i < STAGES.length - 1 && <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted/50" />}
            </div>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-between text-[10px] font-semibold uppercase leading-relaxed tracking-widest text-muted/50">
          <p>
            Faster
            <br />
            Safer
            <br />
            Cleaner Internet
          </p>
          <p className="text-right">
            Threat Intelligence
            <br />
            For A Safer Tomorrow
          </p>
        </div>
      </div>
    </section>
  );
}
