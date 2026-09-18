"use client";

import Link from "next/link";
import { CheckCircle2, FileText, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { INCIDENT_STATUS_LABEL } from "@/components/status/status-meta";
import type { IncidentEntry } from "@/types/status";

const STATUS_TONE: Record<IncidentEntry["status"], string> = {
  investigating: "text-[var(--outage)]",
  identified: "text-[var(--degraded)]",
  monitoring: "text-[var(--degraded)]",
  resolved: "text-[var(--text-muted)]",
  "scheduled-maintenance": "text-[var(--text-secondary)]",
};

export function IncidentHistory({ incidents, demo }: { incidents: IncidentEntry[]; demo: boolean }) {
  const unresolved = incidents.filter((i) => i.status !== "resolved");
  const healthy = unresolved.length === 0;

  return (
    <div data-incident-history className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">
        <FileText className="h-4 w-4 text-[var(--orange-light)]" /> Incident History
      </span>

      {healthy && (
        <div className="mt-4 flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--operational)]" />
          <div>
            <p className="text-sm font-bold text-[var(--operational)]">No incidents in the last 30 days.</p>
            <p className="text-xs text-[var(--text-secondary)]">Excellent uptime across all services.</p>
          </div>
        </div>
      )}

      <ul className="mt-4 space-y-3">
        {incidents.map((incident) => (
          <li key={incident.id} className="flex items-start gap-3 border-t border-[var(--border-muted)] pt-3 first:border-t-0 first:pt-0">
            <FileText className={cn("mt-0.5 h-4 w-4 shrink-0", STATUS_TONE[incident.status])} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--white)]">
                {new Date(incident.startedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })} · {incident.title}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                {incident.status === "resolved" && incident.resolutionMinutes ? `Resolved in ${incident.resolutionMinutes} minutes` : INCIDENT_STATUS_LABEL[incident.status]}
              </p>
            </div>
            <span className={cn("shrink-0 text-[10px] font-bold uppercase tracking-wide", STATUS_TONE[incident.status])}>
              {incident.status === "resolved" ? "Resolved" : INCIDENT_STATUS_LABEL[incident.status]}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-muted)] pt-4">
        <Link href="/status" className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-[var(--orange-light)] hover:text-[var(--orange)]">
          View complete history <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        {demo && <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">Status data refreshes automatically every 30 seconds.</span>}
      </div>
    </div>
  );
}
