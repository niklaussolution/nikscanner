import { NextResponse } from "next/server";
import { BASE_PULSE } from "@/lib/data/community";
import { listReports } from "@/lib/moderation/queue";
import { rateLimit, clientKeyFromRequest } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const limit = rateLimit(`community-pulse:${clientKeyFromRequest(req)}`, 60, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const reports = listReports();
  const verifiedDelta = reports.filter((r) => r.status === "verified").length;

  return NextResponse.json(
    {
      contributors: BASE_PULSE.contributors + reports.length,
      verifiedReports: BASE_PULSE.verifiedReports + verifiedDelta,
      accuracyPct: BASE_PULSE.accuracyPct,
      demo: true,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
