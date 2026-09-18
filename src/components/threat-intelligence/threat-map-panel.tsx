"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Shield, Calendar, Filter, ChevronDown, X, MoreHorizontal, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThreatMap } from "@/components/threat-intelligence/threat-map";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const ACTIVITY = [
  { label: "Malicious URL blocked", time: "2s ago", detail: "203.0.113.42", tone: "danger" as const },
  { label: "APK signature match", time: "14s ago", detail: "com.malware.trick", tone: "warning" as const },
  { label: "Phishing domain detected", time: "28s ago", detail: "secure-login.net", tone: "warning" as const },
  { label: "Suspicious IP isolated", time: "41s ago", detail: "185.199.110.24", tone: "warning" as const },
];

const TONE_DOT = { danger: "bg-danger", warning: "bg-flame-primary" } as const;

const CONTROLS = [
  { label: "Live Attacks", icon: Shield },
  { label: "Last 24H", icon: Calendar },
  { label: "Filter", icon: Filter },
];

export function ThreatMapPanel() {
  const panelRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const quickX = useRef<gsap.QuickToFunc | null>(null);
  const quickY = useRef<gsap.QuickToFunc | null>(null);
  const [activeControl, setActiveControl] = useState(0);
  const [alertOpen, setAlertOpen] = useState(true);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const reduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      const cards = panel.querySelectorAll<HTMLElement>("[data-float-card]");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, delay: 0.4, ease: "power2.out" },
      );

      const rows = panel.querySelectorAll<HTMLElement>("[data-activity-row]");
      gsap.fromTo(
        rows,
        { opacity: 0, x: 16 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, delay: 0.6, ease: "power2.out" },
      );

      if (!reduced) {
        cards.forEach((card, i) => {
          gsap.to(card, {
            y: "+=8",
            duration: 3 + i * 0.4,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        });

        quickX.current = gsap.quickTo(glowRef.current, "--gx", { duration: 0.5, ease: "power3" });
        quickY.current = gsap.quickTo(glowRef.current, "--gy", { duration: 0.5, ease: "power3" });
      }
    }, panel);

    return () => ctx.revert();
  }, []);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (prefersReducedMotion()) return;
    const rect = panelRef.current?.getBoundingClientRect();
    if (!rect) return;
    quickX.current?.(e.clientX - rect.left);
    quickY.current?.(e.clientY - rect.top);
  }

  return (
    <div
      ref={panelRef}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden rounded-2xl border border-border-subtle bg-card-bg shadow-2xl shadow-black/50"
    >
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 opacity-60"
        style={
          {
            background: "radial-gradient(360px circle at var(--gx, 50%) var(--gy, 50%), rgba(255,90,0,0.08), transparent 70%)",
          } as React.CSSProperties
        }
      />

      {/* controls row */}
      <div className="relative z-20 flex flex-wrap items-center gap-2 border-b border-border-subtle p-4">
        {CONTROLS.map((c, i) => (
          <button
            key={c.label}
            onClick={() => setActiveControl(i)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors",
              activeControl === i
                ? "border-flame-primary/60 bg-flame-primary/10 text-flame-bright shadow-[0_0_0_1px_rgba(255,90,0,0.2)]"
                : "border-border-subtle text-muted hover:text-white",
            )}
          >
            <c.icon className="h-3.5 w-3.5" />
            {c.label}
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>
        ))}
      </div>

      <div className="relative z-20 grid grid-cols-1 lg:grid-cols-[1fr_250px] lg:h-[500px]">
        {/* map area */}
        <div className="relative aspect-[1000/560] lg:aspect-auto lg:h-full">
          <ThreatMap className="absolute inset-0 h-full w-full" />

          {/* Compact mobile overlay (replaces the two floating cards + legend) */}
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-flame-primary/40 bg-card-bg/95 px-3 py-1.5 text-[10px] font-semibold text-soft-white backdrop-blur sm:hidden">
            <span aria-hidden>🇸🇬</span> Singapore <span className="text-danger">→</span> Frankfurt, DE
          </div>

          {/* Attack origin card */}
          <div
            data-float-card
            className="absolute bottom-6 left-4 hidden w-52 rounded-xl border border-flame-primary/40 bg-card-bg/95 p-3 shadow-xl shadow-black/50 backdrop-blur sm:block sm:left-6"
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">Attack Origin</p>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm font-bold text-white">
              <span aria-hidden>🇸🇬</span> Singapore
            </p>
            <p className="mt-1 font-mono text-xs text-muted">103.27.184.91</p>
            <p className="text-xs font-semibold text-flame-bright">Botnet</p>
          </div>

          {/* Threat intercepted card */}
          {alertOpen && (
            <div
              data-float-card
              className="absolute right-4 top-16 hidden w-60 rounded-xl border border-danger/40 bg-card-bg/95 p-3 shadow-xl shadow-black/50 backdrop-blur sm:block sm:top-5 lg:right-8"
            >
              <div className="flex items-start justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-danger">
                  <Shield className="h-3.5 w-3.5" /> Threat Intercepted
                </span>
                <button onClick={() => setAlertOpen(false)} aria-label="Dismiss" className="text-muted hover:text-white">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-white">Credential Harvesting</p>
                <span className="shrink-0 rounded-md bg-danger/20 px-1.5 py-0.5 text-[10px] font-bold text-danger">HIGH</span>
              </div>
              <p className="mt-1.5 flex items-center gap-1 text-xs text-muted">
                <MapPin className="h-3 w-3" /> Frankfurt, DE
              </p>
            </div>
          )}

          {/* legend */}
          <div className="absolute bottom-4 right-4 hidden items-center gap-4 rounded-lg border border-border-subtle bg-card-bg/90 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted backdrop-blur sm:flex">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-flame-primary" /> Active
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full border border-flame-primary" /> Monitored
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-white/20" /> Inactive
            </span>
          </div>
        </div>

        {/* live activity panel */}
        <div className="border-t border-border-subtle p-4 lg:border-l lg:border-t-0">
          <div className="mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-glow" /> Live Activity
            </span>
            <MoreHorizontal className="h-4 w-4 text-muted" />
          </div>
          <div className="space-y-3">
            {ACTIVITY.map((a) => (
              <div key={a.label} data-activity-row className="flex items-start gap-2.5">
                <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", TONE_DOT[a.tone])} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-semibold text-soft-white">{a.label}</p>
                    <span className="shrink-0 text-[10px] text-muted">{a.time}</span>
                  </div>
                  <p className="truncate font-mono text-[11px] text-muted">{a.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
