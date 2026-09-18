"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { DEMO_REPORTS, type DemoReport, type DemoReportStatus } from "@/lib/data/community";
import { cn } from "@/lib/utils";

interface RealReport {
  id: string;
  url: string;
  threatType: string;
  status: "pending_review" | "verified" | "rejected" | "duplicate";
  createdAt: string;
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.round(ms / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  return `${hours} hour${hours === 1 ? "" : "s"} ago`;
}

function toDisplayStatus(status: RealReport["status"]): DemoReportStatus {
  return status === "verified" ? "Verified" : "Under Review";
}

export function RecentReports() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<DemoReport[]>(DEMO_REPORTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(async () => {
      try {
        const res = await fetch("/api/reports/url", { cache: "no-store" });
        const json = (await res.json()) as { reports: RealReport[] };
        if (cancelled) return;
        const real: DemoReport[] = json.reports.slice(0, 3).map((r) => {
          let domain = r.url;
          try {
            domain = new URL(r.url).hostname;
          } catch {
            /* keep raw string if not a valid URL somehow */
          }
          return {
            id: r.id,
            domain,
            category: r.threatType,
            time: timeAgo(r.createdAt),
            status: toDisplayStatus(r.status),
          };
        });
        setRows([...real, ...DEMO_REPORTS]);
      } finally {
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
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-report-row]",
        { opacity: 0, y: -8 },
        { opacity: 1, y: 0, duration: 0.4, stagger: reduced ? 0 : 0.06, ease: "power2.out" },
      );
      if (!reduced) {
        gsap.to("[data-timeline-dot]", { opacity: 0.35, duration: 1.4, repeat: -1, yoyo: true, stagger: 0.15, ease: "sine.inOut" });
      }
    }, rootRef);
    return () => ctx.revert();
  }, [ready, rows]);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-[var(--text)]">Recent community reports</h2>
        <span className="rounded-md border border-[var(--border)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
          Demo Data
        </span>
      </div>

      <div ref={rootRef} className="relative mt-4 space-y-1">
        <div aria-hidden className="absolute bottom-2 left-[7px] top-2 w-px bg-[var(--border-soft)]" />
        {rows.slice(0, 5).map((r) => (
          <div key={r.id} data-report-row className="relative flex items-start gap-3 py-2 pl-1">
            <span data-timeline-dot className="relative z-10 mt-1.5 h-[7px] w-[7px] shrink-0 rounded-full bg-[var(--orange)]" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate font-mono text-sm text-[var(--text)]">{r.domain}</p>
                <span className="shrink-0 text-[11px] text-[var(--text-muted)]">{r.time}</span>
              </div>
              <div className="mt-0.5 flex items-center justify-between gap-3">
                <p className="text-xs text-[var(--text-muted)]">{r.category}</p>
                <span
                  className={cn(
                    "flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                    r.status === "Verified" ? "bg-[var(--green)]/15 text-[var(--green)]" : "bg-[var(--amber)]/15 text-[var(--amber)]",
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", r.status === "Verified" ? "bg-[var(--green)]" : "bg-[var(--amber)]")} />
                  {r.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
