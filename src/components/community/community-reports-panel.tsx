"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Users,
  ShieldAlert,
  Database,
  CreditCard,
  Bug,
  ChevronRight,
  FileText,
  Search,
  BarChart3,
  ArrowRight,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReportForm } from "@/components/community/report-form";
import { publicJson } from "@/lib/firebase/api";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type Status = "Verified" | "Under Review";

interface Report {
  url: string;
  category: string;
  time: string;
  reporterCount: number | null;
  status: Status;
  icon: LucideIcon;
}

interface BlocklistEntry {
  url: string;
  category: string;
  blocked_by: string;
  reported_at: number;
  reporter_count?: number;
}

// The real backend only ever hands out /api/blocklist entries once they've cleared
// CONFIRM_THRESHOLD independent reporters — there's no public "pending" state to show, so
// every real report here is "Verified" (the "Under Review" filter stays honest: it's simply
// empty for real data instead of being backed by a fabricated pending report).
const CATEGORY_META: Record<string, { label: string; icon: LucideIcon }> = {
  malicious: { label: "Malware", icon: Bug },
  phishing: { label: "Phishing", icon: ShieldAlert },
  tracking: { label: "Tracking", icon: Database },
  suspicious: { label: "Suspicious", icon: CreditCard },
};

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.max(0, Math.round(diff / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

const FILTERS = ["All", "Verified", "Under Review"] as const;

const PIPELINE = [
  { icon: FileText, label: "Community Report", note: null },
  { icon: Search, label: "Moderation", note: "Automated & human review" },
  { icon: BarChart3, label: "Reputation Signal", note: null },
];

export function CommunityReportsPanel() {
  const panelRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const quickX = useRef<gsap.QuickToFunc | null>(null);
  const quickY = useRef<gsap.QuickToFunc | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    let cancelled = false;
    publicJson<{ count: number; entries: BlocklistEntry[] }>("/api/blocklist?limit=4")
      .then((res) => {
        if (cancelled) return;
        const recentFirst = [...res.entries].reverse().slice(0, 4);
        setReports(
          recentFirst.map((e) => {
            const meta = CATEGORY_META[e.category] ?? { label: e.category, icon: ShieldAlert };
            return {
              url: hostnameOf(e.url),
              category: meta.label,
              time: timeAgo(e.reported_at),
              reporterCount: e.reporter_count ?? null,
              status: "Verified",
              icon: meta.icon,
            };
          }),
        );
      })
      .catch(() => {
        // Non-fatal — the panel just shows its empty state.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = reports.filter((r) => filter === "All" || r.status === filter);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const reduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        panel,
        { opacity: 0, x: 24 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: { trigger: panel, start: "top 85%", once: true },
        },
      );

      const rows = panel.querySelectorAll<HTMLElement>("[data-report-row]");
      gsap.fromTo(
        rows,
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.08,
          delay: 0.25,
          ease: "power2.out",
          scrollTrigger: { trigger: panel, start: "top 85%", once: true },
        },
      );

      const stages = panel.querySelectorAll<HTMLElement>("[data-pipeline-stage]");
      gsap.fromTo(
        stages,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.15,
          delay: 0.5,
          ease: "power2.out",
          scrollTrigger: { trigger: panel, start: "top 80%", once: true },
        },
      );

      const connectors = panel.querySelectorAll<HTMLElement>("[data-pipeline-connector]");
      gsap.fromTo(
        connectors,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.5,
          stagger: 0.15,
          delay: 0.6,
          ease: "power2.out",
          transformOrigin: "left center",
          scrollTrigger: { trigger: panel, start: "top 80%", once: true },
        },
      );

      if (!reduced) {
        quickX.current = gsap.quickTo(glowRef.current, "--gx", { duration: 0.5, ease: "power3" });
        quickY.current = gsap.quickTo(glowRef.current, "--gy", { duration: 0.5, ease: "power3" });

        const badge = panel.querySelector("[data-live-badge]");
        if (badge) {
          gsap.to(badge, { opacity: 0.55, duration: 1, repeat: -1, yoyo: true, ease: "sine.inOut" });
        }

        const activeTrace = panel.querySelector("[data-active-trace]");
        if (activeTrace) {
          gsap.fromTo(
            activeTrace,
            { scaleX: 0 },
            { scaleX: 1, duration: 2.4, repeat: -1, ease: "power1.inOut", transformOrigin: "left center" },
          );
        }
      }
    }, panel);

    return () => ctx.revert();
  }, [reports]);

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
      className="relative overflow-hidden rounded-2xl border border-border-subtle bg-card-bg p-5 shadow-2xl shadow-black/50 sm:p-6"
    >
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-70"
        style={
          {
            background: "radial-gradient(380px circle at var(--gx, 20%) var(--gy, 0%), rgba(255,90,0,0.07), transparent 70%)",
          } as React.CSSProperties
        }
      />

      <div className="relative z-10">
        {/* header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-flame-primary/25 bg-flame-primary/10 text-flame-bright">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-white">Recent Community Reports</p>
              <p className="mt-0.5 text-xs text-muted">Real reports. Real impact. A safer internet together.</p>
            </div>
          </div>
          {/* <span
            data-live-badge
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-success"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Live
          </span> */}
        </div>

        {/* filters + report button */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-[11px] font-bold uppercase tracking-wide transition-colors",
                  filter === f
                    ? "border-flame-primary/60 bg-flame-primary/10 text-flame-bright"
                    : "border-border-subtle text-muted hover:text-white",
                )}
              >
                {f === "Under Review" ? "Under Review" : f}
              </button>
            ))}
          </div>
          {/* <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-flame-primary/50 bg-flame-primary/10 px-3.5 py-2 text-[11px] font-bold uppercase tracking-wide text-flame-bright transition-colors hover:bg-flame-primary/20"
          >
            Report a Threat <ArrowRight className="h-3.5 w-3.5" />
          </button> */}
        </div>

        {/* report rows */}
        <div className="mt-4 space-y-2.5">
          {visible.length === 0 && (
            <p className="py-4 text-center text-sm text-muted">
              {filter === "Under Review" ? "No reports are currently under review." : "No blocked URLs reported yet."}
            </p>
          )}
          {visible.map((r, i) => {
            const active = i === 0 && filter === "All";
            return (
              <button
                key={`${r.url}-${i}`}
                data-report-row
                type="button"
                className={cn(
                  "group relative block w-full overflow-hidden rounded-xl border p-3.5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame-primary/50",
                  active
                    ? "border-flame-primary/60 bg-flame-primary/[0.06] shadow-[0_0_0_1px_rgba(255,90,0,0.25),0_12px_28px_-10px_rgba(255,90,0,0.4)]"
                    : "border-border-subtle bg-card-elevated hover:-translate-y-0.5 hover:border-white/20 hover:shadow-lg hover:shadow-black/30",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
                        active ? "border-flame-primary/50 bg-flame-primary/15 text-flame-bright" : "border-white/10 bg-white/5 text-muted",
                      )}
                    >
                      <r.icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm font-semibold text-white">{r.url}</p>
                      <p className="text-xs text-muted">{r.category}</p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <div className="hidden text-right sm:block">
                      <p className="text-[11px] text-muted">{r.time}</p>
                      {r.reporterCount !== null && (
                        <p className="text-[11px] font-semibold text-soft-white">
                          Confirmed by <span className="text-flame-bright">{r.reporterCount}</span>
                        </p>
                      )}
                    </div>
                    <span
                      className={cn(
                        "flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                        r.status === "Verified" ? "bg-success/15 text-success" : "bg-warning/15 text-warning",
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full", r.status === "Verified" ? "bg-success" : "bg-warning")} />
                      {r.status}
                    </span>
                    {/* <ChevronRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5" /> */}
                  </div>
                </div>
{/* 
                {active && (
                  <div className="mt-3 h-[2px] w-full overflow-hidden rounded-full bg-white/5">
                    <div data-active-trace className="h-full w-full origin-left rounded-full bg-gradient-to-r from-flame-primary via-flame-bright to-flame-primary" />
                  </div>
                )} */}
              </button>
            );
          })}
        </div>

        {/* moderation pipeline */}
        <div className="mt-6 rounded-xl border border-border-subtle bg-black/30 p-5">
          <p className="text-center text-[10px] font-semibold uppercase tracking-widest text-muted">How a Report Makes an Impact</p>
          <div className="mt-4 flex items-center justify-center gap-2 sm:gap-4">
            {PIPELINE.map((stage, i) => (
              <div key={stage.label} className="flex items-center gap-2 sm:gap-4">
                <div data-pipeline-stage className="flex w-20 flex-col items-center text-center sm:w-24">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-flame-primary/40 bg-flame-primary/10 text-flame-bright shadow-[0_0_24px_-6px_rgba(255,90,0,0.5)]">
                    <stage.icon className="h-5 w-5" />
                  </span>
                  <p className="mt-2 text-[10px] font-bold uppercase leading-tight tracking-wide text-white">{stage.label}</p>
                  {stage.note && <p className="mt-0.5 text-[9px] leading-tight text-muted">{stage.note}</p>}
                </div>
                {i < PIPELINE.length - 1 && (
                  <div data-pipeline-connector className="h-px w-6 shrink-0 bg-gradient-to-r from-flame-primary/60 to-flame-primary/10 sm:w-10" />
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-muted">Multi-signal verification prevents false positives.</p>
        </div>
      </div>

      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Report a threat"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setModalOpen(false)}
              aria-label="Close"
              className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle bg-card-bg text-muted hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
            <ReportForm />
          </div>
        </div>
      )}
    </div>
  );
}
