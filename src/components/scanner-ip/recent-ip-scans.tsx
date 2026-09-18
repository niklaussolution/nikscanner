"use client";

import Link from "next/link";
import { Clock, MapPin, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecentIpEntry } from "@/components/scanner-ip/types";

const TONE_CLASSES: Record<RecentIpEntry["verdictTone"], string> = {
  safe: "border-[var(--safe)]/40 bg-[var(--safe)]/10 text-[var(--safe)]",
  warning: "border-[var(--warning)]/40 bg-[var(--warning)]/10 text-[var(--warning)]",
  danger: "border-[var(--danger)]/40 bg-[var(--danger)]/10 text-[var(--danger)]",
};

export const INITIAL_RECENT_IPS: RecentIpEntry[] = [
  { id: "1", ip: "1.1.1.1", label: "Cloudflare", verdict: "SAFE", verdictTone: "safe", time: "3m ago" },
  { id: "2", ip: "8.8.4.4", label: "Google", verdict: "SAFE", verdictTone: "safe", time: "18m ago" },
  { id: "3", ip: "185.220.101.45", label: "Tor Exit Node", verdict: "HIGH RISK", verdictTone: "danger", time: "36m ago" },
];

export function RecentIpScans({ scans }: { scans: RecentIpEntry[] }) {
  return (
    <div data-recent-ip-scans className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">
          <Clock className="h-4 w-4 text-[var(--orange-light)]" /> Recent IP Scans
        </span>
        <Link
          href="/dashboard/scans"
          className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-[var(--orange-light)] hover:text-[var(--orange)]"
        >
          View scan history <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-4 flex flex-col divide-y divide-[var(--border-muted)] sm:flex-row sm:divide-x sm:divide-y-0">
        {scans.map((s) => (
          <div key={s.id} className="flex min-w-0 flex-1 items-center gap-2.5 py-3 sm:px-4 sm:py-0 first:sm:pl-0 last:sm:pr-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border-muted)] bg-black/30 text-[var(--text-secondary)]">
              <MapPin className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-sm font-semibold text-[var(--white)]">{s.ip}</p>
              <p className="truncate text-[11px] text-[var(--text-muted)]">{s.label}</p>
            </div>
            <span className={cn("shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", TONE_CLASSES[s.verdictTone])}>
              {s.verdict}
            </span>
            <span className="shrink-0 text-[10px] text-[var(--text-muted)]">{s.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
