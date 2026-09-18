/**
 * Stable, deterministic historical fixtures — NOT regenerated per request
 * or per render. This project has no monitoring database wired yet, so
 * there is no real 20-day history to serve; per the page's own spec, that
 * gap is filled with fixed demo data that the UI labels as demonstration
 * data, never as live production status. The *current* status shown
 * elsewhere on the page (service dots, live metrics) comes from
 * `runServiceChecks()`, not from here.
 */
import type { HistoryPoint, IncidentEntry, ResponseTimePoint, ServiceStatus } from "@/types/status";

const DAY_MS = 24 * 60 * 60 * 1000;

export const HISTORY_DAYS = 20;

// Day indices (0 = HISTORY_DAYS ago) where each service dipped out of "operational".
const INCIDENT_DAYS: Record<string, { day: number; status: ServiceStatus; uptimePct: number }[]> = {
  "scanning-api": [{ day: 16, status: "degraded", uptimePct: 92.4 }],
  "web-dashboard": [{ day: 8, status: "degraded", uptimePct: 96.1 }],
  "threat-intel-feed": [
    { day: 3, status: "degraded", uptimePct: 89.7 },
    { day: 4, status: "degraded", uptimePct: 94.2 },
  ],
  "community-reports": [],
  authentication: [],
  webhooks: [{ day: 13, status: "degraded", uptimePct: 95.5 }],
};

const BASE_LATENCY: Record<string, number> = {
  "scanning-api": 112,
  "web-dashboard": 96,
  "threat-intel-feed": 148,
  "community-reports": 121,
  authentication: 40,
  webhooks: 136,
};

function seededJitter(seed: number): number {
  const n = Math.sin(seed * 12.9898) * 43758.5453;
  return n - Math.floor(n);
}

export function buildHistoryDays(serviceId: string): HistoryPoint[] {
  const incidents = new Map(INCIDENT_DAYS[serviceId]?.map((i) => [i.day, i]) ?? []);
  const baseLatency = BASE_LATENCY[serviceId] ?? 100;
  const now = Date.now();
  const points: HistoryPoint[] = [];

  for (let day = 0; day < HISTORY_DAYS; day++) {
    const incident = incidents.get(day);
    const jitter = seededJitter(day + serviceId.length);
    points.push({
      date: new Date(now - (HISTORY_DAYS - 1 - day) * DAY_MS).toISOString(),
      status: incident?.status ?? "operational",
      uptimePct: incident?.uptimePct ?? Number((99.9 + jitter * 0.1).toFixed(2)),
      latencyMs: Math.round(baseLatency + (jitter - 0.5) * 24 + (incident ? 40 : 0)),
    });
  }
  return points;
}

export function buildResponseTimeSeries(): ResponseTimePoint[] {
  const now = Date.now();
  const points: ResponseTimePoint[] = [];
  for (let i = 0; i < 48; i++) {
    const t = now - (47 - i) * 30 * 60 * 1000; // every 30 minutes over 24h
    const hourFrac = (i / 48) * 24;
    const wave = Math.sin(hourFrac / 3) * 18 + Math.sin(hourFrac * 1.7) * 8;
    const spike = i === 41 ? 55 : 0; // one visible spike, matching the reference's shape
    points.push({ t: new Date(t).toISOString(), ms: Math.round(100 + wave + spike) });
  }
  return points;
}

export function buildIncidentHistory(): IncidentEntry[] {
  return [
    {
      id: "inc-sep12",
      title: "Elevated scan latency",
      status: "resolved",
      startedAt: new Date(Date.now() - 6 * DAY_MS).toISOString(),
      resolvedAt: new Date(Date.now() - 6 * DAY_MS + 18 * 60 * 1000).toISOString(),
      resolutionMinutes: 18,
      detail: "The Scanning API's provider fan-out briefly slowed under load.",
    },
  ];
}
