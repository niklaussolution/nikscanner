"use client";

import { CheckCircle2, AlertTriangle, AlertOctagon, Wrench, Bell } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { OVERALL_STATUS_DETAIL, OVERALL_STATUS_LABEL } from "@/components/status/status-meta";
import type { OverallStatus } from "@/types/status";

const ICON: Record<OverallStatus, LucideIcon> = {
  operational: CheckCircle2,
  degraded: AlertTriangle,
  "partial-outage": AlertTriangle,
  "major-outage": AlertOctagon,
  maintenance: Wrench,
};

const TONE: Record<OverallStatus, "operational" | "degraded" | "outage"> = {
  operational: "operational",
  degraded: "degraded",
  "partial-outage": "degraded",
  "major-outage": "outage",
  maintenance: "degraded",
};

const TONE_CLASSES = {
  operational: {
    border: "border-[var(--operational)]/30",
    bg: "bg-[var(--operational)]/5",
    icon: "text-[var(--operational)]",
    iconBorder: "border-[var(--operational)]/40",
    badge: "border-[var(--operational)]/40 bg-[var(--operational)]/10 text-[var(--operational)]",
  },
  degraded: {
    border: "border-[var(--degraded)]/30",
    bg: "bg-[var(--degraded)]/5",
    icon: "text-[var(--degraded)]",
    iconBorder: "border-[var(--degraded)]/40",
    badge: "border-[var(--degraded)]/40 bg-[var(--degraded)]/10 text-[var(--degraded)]",
  },
  outage: {
    border: "border-[var(--outage)]/30",
    bg: "bg-[var(--outage)]/5",
    icon: "text-[var(--outage)]",
    iconBorder: "border-[var(--outage)]/40",
    badge: "border-[var(--outage)]/40 bg-[var(--outage)]/10 text-[var(--outage)]",
  },
} as const;

export function OverallStatusBanner({ overall, onSubscribe }: { overall: OverallStatus; onSubscribe: () => void }) {
  const Icon = ICON[overall];
  const tone = TONE_CLASSES[TONE[overall]];

  return (
    <div
      data-overall-banner
      className={cn("mt-8 flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6", tone.border, tone.bg)}
    >
      <div className="flex items-center gap-4">
        <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2", tone.iconBorder)}>
          <Icon className={cn("h-6 w-6 pulse-soft", tone.icon)} strokeWidth={2.2} />
        </span>
        <div>
          <p className="text-lg font-bold text-[var(--white)]">{OVERALL_STATUS_LABEL[overall]}</p>
          <p className="text-sm text-[var(--text-secondary)]">{OVERALL_STATUS_DETAIL[overall]}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 self-stretch sm:self-auto">
        <span className={cn("flex h-11 flex-1 items-center justify-center rounded-lg border px-4 text-xs font-bold uppercase tracking-wide sm:flex-none", tone.badge)}>
          {overall === "operational" ? "Operational" : OVERALL_STATUS_LABEL[overall]}
        </span>
        <button
          type="button"
          onClick={onSubscribe}
          className="flex h-11 min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-4 text-xs font-bold uppercase tracking-wide text-[var(--white)] transition-colors hover:border-[var(--orange)]/50 sm:flex-none"
        >
          <Bell className="h-3.5 w-3.5" /> Subscribe to updates
        </button>
      </div>
    </div>
  );
}
