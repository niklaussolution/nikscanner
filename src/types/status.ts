export type ServiceStatus = "operational" | "degraded" | "partial-outage" | "major-outage" | "maintenance" | "not-configured";

export type OverallStatus = "operational" | "degraded" | "partial-outage" | "major-outage" | "maintenance";

export type IncidentStatus = "investigating" | "identified" | "monitoring" | "resolved" | "scheduled-maintenance";

export interface ServiceCheckResult {
  id: string;
  name: string;
  status: ServiceStatus;
  latencyMs: number | null;
  detail?: string;
}

export interface HistoryPoint {
  date: string; // ISO date, one per day
  status: ServiceStatus;
  uptimePct: number;
  latencyMs: number;
}

export interface IncidentEntry {
  id: string;
  title: string;
  status: IncidentStatus;
  startedAt: string;
  resolvedAt?: string;
  resolutionMinutes?: number;
  detail?: string;
}

export interface ResponseTimePoint {
  t: string; // ISO timestamp
  ms: number;
}

export interface StatusSnapshot {
  overall: OverallStatus;
  generatedAt: string;
  services: ServiceCheckResult[];
  metrics: {
    uptimeWindow: number;
    avgResponseMs: number;
    activeIncidents: number;
    systemsOnline: number;
    systemsTotal: number;
  };
  history: Record<string, HistoryPoint[]>;
  responseTimeSeries: ResponseTimePoint[];
  incidents: IncidentEntry[];
  /** Which parts of this snapshot are live self-checks vs. stable demo fixtures — surfaced in the UI, never hidden. */
  demo: {
    history: boolean;
    responseTimeSeries: boolean;
    incidents: boolean;
  };
}
