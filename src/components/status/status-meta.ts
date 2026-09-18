import type { IncidentStatus, OverallStatus, ServiceStatus } from "@/types/status";

export const SERVICE_STATUS_LABEL: Record<ServiceStatus, string> = {
  operational: "Operational",
  degraded: "Degraded Performance",
  "partial-outage": "Partial Outage",
  "major-outage": "Major Outage",
  maintenance: "Maintenance",
  "not-configured": "Not Configured",
};

export const SERVICE_STATUS_COLOR_VAR: Record<ServiceStatus, string> = {
  operational: "var(--operational)",
  degraded: "var(--degraded)",
  "partial-outage": "var(--outage)",
  "major-outage": "var(--outage)",
  maintenance: "var(--text-muted)",
  "not-configured": "var(--text-muted)",
};

export const OVERALL_STATUS_LABEL: Record<OverallStatus, string> = {
  operational: "All systems operational",
  degraded: "Degraded performance",
  "partial-outage": "Partial outage",
  "major-outage": "Major outage",
  maintenance: "Scheduled maintenance",
};

export const OVERALL_STATUS_DETAIL: Record<OverallStatus, string> = {
  operational: "All NIKSCANNER services are running normally.",
  degraded: "Some services are experiencing slower-than-normal performance.",
  "partial-outage": "One or more services are partially unavailable.",
  "major-outage": "A critical service is currently unavailable.",
  maintenance: "Scheduled maintenance is in progress on one or more services.",
};

export const INCIDENT_STATUS_LABEL: Record<IncidentStatus, string> = {
  investigating: "Investigating",
  identified: "Identified",
  monitoring: "Monitoring",
  resolved: "Resolved",
  "scheduled-maintenance": "Scheduled Maintenance",
};
