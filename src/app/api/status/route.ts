import { NextResponse } from "next/server";
import { runServiceChecks } from "@/lib/status/checks";
import { buildHistoryDays, buildIncidentHistory, buildResponseTimeSeries } from "@/lib/status/fixtures";
import { rateLimit, clientKeyFromRequest } from "@/lib/security/rate-limit";
import type { OverallStatus, ServiceStatus, StatusSnapshot } from "@/types/status";

export const runtime = "nodejs";

const SEVERITY: Record<ServiceStatus, number> = {
  operational: 0,
  "not-configured": 0,
  maintenance: 1,
  degraded: 2,
  "partial-outage": 3,
  "major-outage": 4,
};

function computeOverall(statuses: ServiceStatus[]): OverallStatus {
  // "not-configured" services are intentionally out of scope for this
  // deployment (see checks.ts) — they never drag the overall banner down,
  // the same way a SaaS status page doesn't degrade over an unreleased
  // feature flag.
  const active = statuses.filter((s) => s !== "not-configured");
  if (active.length === 0) return "operational";

  const worst = active.reduce((max, s) => (SEVERITY[s] > SEVERITY[max] ? s : max), active[0]);
  if (worst === "operational") return "operational";
  if (worst === "maintenance") return "maintenance";
  if (worst === "degraded") return "degraded";
  if (worst === "partial-outage") return "partial-outage";
  return "major-outage";
}

export async function GET(req: Request) {
  const limit = rateLimit(`status:${clientKeyFromRequest(req)}`, 60, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429, headers: { "Retry-After": String(Math.ceil(limit.resetMs / 1000)) } });
  }

  const services = await runServiceChecks();
  const overall = computeOverall(services.map((s) => s.status));

  const configured = services.filter((s) => s.status !== "not-configured");
  const latencies = configured.map((s) => s.latencyMs).filter((v): v is number => v !== null);
  const avgResponseMs = latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;
  const systemsOnline = services.filter((s) => s.status === "operational").length;

  const history: StatusSnapshot["history"] = {};
  for (const s of services) history[s.id] = buildHistoryDays(s.id);
  const uptimeValues = configured.map((s) => {
    const points = history[s.id];
    return points.reduce((sum, p) => sum + p.uptimePct, 0) / points.length;
  });
  const uptimeWindow = uptimeValues.length ? Number((uptimeValues.reduce((a, b) => a + b, 0) / uptimeValues.length).toFixed(2)) : 100;

  const incidents = buildIncidentHistory();
  const hasUnresolvedIncident = incidents.some((i) => i.status !== "resolved");
  const activeIncidents = (overall !== "operational" ? 1 : 0) + (hasUnresolvedIncident ? incidents.filter((i) => i.status !== "resolved").length : 0);

  const payload: StatusSnapshot = {
    overall,
    generatedAt: new Date().toISOString(),
    services,
    metrics: {
      uptimeWindow,
      avgResponseMs,
      activeIncidents,
      systemsOnline,
      systemsTotal: services.length,
    },
    history,
    responseTimeSeries: buildResponseTimeSeries(),
    incidents,
    demo: { history: true, responseTimeSeries: true, incidents: true },
  };

  return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
}
