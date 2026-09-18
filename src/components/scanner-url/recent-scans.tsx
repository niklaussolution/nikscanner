"use client";

import Link from "next/link";
import { Clock, Globe, Code, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RecentScanEntry {
  id: string;
  icon: LucideIcon;
  primary: string;
  secondary: string;
  verdict: string;
  verdictTone: "safe" | "danger";
  time: string;
}

export const INITIAL_RECENT_SCANS: RecentScanEntry[] = [
  {
    id: "1",
    icon: Globe,
    primary: "docs.google.com",
    secondary: "https://docs.google.com",
    verdict: "SAFE",
    verdictTone: "safe",
    time: "2m ago",
  },
  {
    id: "2",
    icon: Globe,
    primary: "secure-login-check.xyz",
    secondary: "https://secure-login-check.xyz",
    verdict: "PHISHING",
    verdictTone: "danger",
    time: "18m ago",
  },
  {
    id: "3",
    icon: Code,
    primary: "github.com",
    secondary: "https://github.com",
    verdict: "SAFE",
    verdictTone: "safe",
    time: "1h ago",
  },
];

export function RecentScans({
  scans,
  title = "Recent Scans",
  historyHref = "/dashboard/scans",
}: {
  scans: RecentScanEntry[];
  title?: string;
  historyHref?: string;
}) {
  return (
    <div
      data-recent-scans
      className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6"
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">
          <Clock className="h-4 w-4 text-[var(--orange-light)]" /> {title}
        </span>
        <Link
          href={historyHref}
          className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-[var(--orange-light)] hover:text-[var(--orange)]"
        >
          View scan history <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-4 flex flex-col divide-y divide-[var(--border-muted)] sm:flex-row sm:divide-x sm:divide-y-0">
        {scans.map((s) => (
          <div key={s.id} className="flex min-w-0 flex-1 items-center gap-3 py-3 sm:px-4 sm:py-0 first:sm:pl-0 last:sm:pr-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border-muted)] bg-black/30 text-[var(--text-secondary)]">
              <s.icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--white)]">{s.primary}</p>
              <p className="truncate font-mono text-[11px] text-[var(--text-muted)]">{s.secondary}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span
                className={cn(
                  "rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                  s.verdictTone === "safe"
                    ? "border-[var(--safe)]/40 bg-[var(--safe)]/10 text-[var(--safe)]"
                    : "border-[var(--danger)]/40 bg-[var(--danger)]/10 text-[var(--danger)]",
                )}
              >
                {s.verdict}
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">{s.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
