"use client";

import Link from "next/link";
import { Clock, Globe, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecentDomainEntry } from "@/components/scanner-domain/types";

const TONE_CLASSES: Record<RecentDomainEntry["verdictTone"], string> = {
  safe: "border-[var(--safe)]/40 bg-[var(--safe)]/10 text-[var(--safe)]",
  warning: "border-[var(--warning)]/40 bg-[var(--warning)]/10 text-[var(--warning)]",
  danger: "border-[var(--danger)]/40 bg-[var(--danger)]/10 text-[var(--danger)]",
};

export const INITIAL_RECENT_DOMAINS: RecentDomainEntry[] = [
  { id: "1", domain: "github.com", verdict: "SAFE", verdictTone: "safe", time: "2m ago" },
  { id: "2", domain: "cloudflare.com", verdict: "SAFE", verdictTone: "safe", time: "12m ago" },
  { id: "3", domain: "secure-login-check.xyz", verdict: "HIGH RISK", verdictTone: "danger", time: "28m ago" },
];

export function RecentDomains({ domains }: { domains: RecentDomainEntry[] }) {
  return (
    <div data-recent-domains className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">
          <Clock className="h-4 w-4 text-[var(--orange-light)]" /> Recent Domains
        </span>
        <Link
          href="/dashboard/scans"
          className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-[var(--orange-light)] hover:text-[var(--orange)]"
        >
          View scan history <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-4 flex flex-col divide-y divide-[var(--border-muted)] sm:flex-row sm:divide-x sm:divide-y-0">
        {domains.map((d) => (
          <div key={d.id} className="flex min-w-0 flex-1 items-center gap-2.5 py-3 sm:px-4 sm:py-0 first:sm:pl-0 last:sm:pr-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border-muted)] bg-black/30 text-[var(--text-secondary)]">
              <Globe className="h-4 w-4" />
            </span>
            <p className="min-w-0 flex-1 truncate font-mono text-sm font-semibold text-[var(--white)]">{d.domain}</p>
            <span className={cn("shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", TONE_CLASSES[d.verdictTone])}>
              {d.verdict}
            </span>
            <span className="shrink-0 text-[10px] text-[var(--text-muted)]">{d.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
