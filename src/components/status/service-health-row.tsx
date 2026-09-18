"use client";

import { useId, useState } from "react";
import { ScanLine, Monitor, Rss, Users, Lock, Webhook, ChevronDown, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { UptimeBars } from "@/components/status/uptime-bars";
import { SERVICE_STATUS_COLOR_VAR, SERVICE_STATUS_LABEL } from "@/components/status/status-meta";
import type { HistoryPoint, ServiceCheckResult } from "@/types/status";

const SERVICE_ICON: Record<string, LucideIcon> = {
  "scanning-api": ScanLine,
  "web-dashboard": Monitor,
  "threat-intel-feed": Rss,
  "community-reports": Users,
  authentication: Lock,
  webhooks: Webhook,
};

function avg(points: HistoryPoint[]): number {
  return points.length ? points.reduce((s, p) => s + p.uptimePct, 0) / points.length : 0;
}

export function ServiceHealthRow({
  service,
  history,
  rangeDays,
}: {
  service: ServiceCheckResult;
  history: HistoryPoint[];
  rangeDays: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();
  const Icon = SERVICE_ICON[service.id] ?? ScanLine;
  const color = SERVICE_STATUS_COLOR_VAR[service.status];
  const visible = history.slice(-rangeDays);
  const uptimeForRange = avg(visible).toFixed(2);

  const uptime24h = avg(history.slice(-1));
  const uptime7d = avg(history.slice(-7));
  const uptime14d = avg(history.slice(-14));
  const uptime20d = avg(history);
  const recentIncidents = history.filter((p) => p.status !== "operational").slice(-3);

  return (
    <div className="border-b border-[var(--border-muted)] last:border-b-0">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="group flex w-full flex-col gap-3 rounded-lg p-3 text-left transition-colors hover:border-[var(--orange)]/30 sm:flex-row sm:items-center sm:gap-4 sm:border sm:border-transparent"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--orange)]/25 bg-[var(--orange)]/10 text-[var(--orange-light)]">
          <Icon className="h-4 w-4" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-[var(--white)]">{service.name}</p>
          <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
            {SERVICE_STATUS_LABEL[service.status]}
          </span>
        </div>

        <div className="min-w-0 flex-1 sm:max-w-[220px]">
          <UptimeBars points={history} rangeDays={rangeDays} />
          <div className="mt-1 flex justify-between text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            <span>{rangeDays} days ago</span>
            <span>Today</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4 text-right">
          <div>
            <p className="text-sm font-bold text-[var(--white)]">{service.status === "not-configured" ? "—" : `${uptimeForRange}%`}</p>
            <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">uptime</p>
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--white)]">{service.latencyMs !== null ? `${service.latencyMs} ms` : "—"}</p>
          </div>
          <ChevronDown className={cn("h-4 w-4 text-[var(--text-muted)] transition-transform group-hover:translate-y-0.5", expanded && "rotate-180")} />
        </div>
      </button>

      {expanded && (
        <div id={panelId} className="grid grid-cols-2 gap-3 border-t border-[var(--border-muted)] px-3 pb-4 pt-3 text-xs sm:grid-cols-4">
          <div>
            <p className="text-[var(--text-muted)]">24h uptime</p>
            <p className="mt-0.5 font-bold text-[var(--white)]">{uptime24h.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-[var(--text-muted)]">7d uptime</p>
            <p className="mt-0.5 font-bold text-[var(--white)]">{uptime7d.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-[var(--text-muted)]">14d uptime</p>
            <p className="mt-0.5 font-bold text-[var(--white)]">{uptime14d.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-[var(--text-muted)]">20d uptime</p>
            <p className="mt-0.5 font-bold text-[var(--white)]">{uptime20d.toFixed(2)}%</p>
          </div>
          <div className="col-span-2 flex items-center gap-1.5 text-[var(--text-secondary)] sm:col-span-4">
            <Clock className="h-3.5 w-3.5" /> Last successful check: just now
          </div>
          {service.detail && <p className="col-span-2 text-[var(--text-secondary)] sm:col-span-4">{service.detail}</p>}
          {recentIncidents.length > 0 && (
            <div className="col-span-2 sm:col-span-4">
              <p className="mb-1 text-[var(--text-muted)]">Recent incidents (20d, demo history)</p>
              <ul className="space-y-1">
                {recentIncidents.map((p) => (
                  <li key={p.date} className="flex items-center justify-between text-[var(--text-secondary)]">
                    <span>{new Date(p.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                    <span style={{ color: SERVICE_STATUS_COLOR_VAR[p.status] }}>{SERVICE_STATUS_LABEL[p.status]}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
