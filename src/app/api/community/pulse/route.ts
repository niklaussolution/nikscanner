import { NextResponse } from "next/server";
import { rateLimit, clientKeyFromRequest } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

const NIKSCANNER_API_BASE_URL = process.env.NEXT_PUBLIC_NIKSCANNER_API_BASE_URL || "";

interface BackendStats {
  total: number;
  confirmed: number;
  pending: number;
  users: number;
}

/** Real community numbers — same backend the mobile app uses. "Contributors" is every user
 *  with at least one confirmed block (GET /api/stats' `users`), "Verified reports" is the
 *  count of blocklist entries that reached CONFIRM_THRESHOLD independent reporters (`confirmed`).
 *  "Accuracy" has no direct backend equivalent, so it's derived from these same real numbers
 *  (confirmed / total) rather than a separate fabricated figure. */
export async function GET(req: Request) {
  const limit = rateLimit(`community-pulse:${clientKeyFromRequest(req)}`, 60, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  if (!NIKSCANNER_API_BASE_URL) {
    return NextResponse.json({ contributors: 0, verifiedReports: 0, accuracyPct: 0, demo: true }, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const res = await fetch(`${NIKSCANNER_API_BASE_URL.replace(/\/+$/, "")}/api/stats`, { cache: "no-store" });
    if (!res.ok) throw new Error(`stats fetch failed: ${res.status}`);
    const stats = (await res.json()) as BackendStats;

    return NextResponse.json(
      {
        contributors: stats.users,
        verifiedReports: stats.confirmed,
        accuracyPct: stats.total > 0 ? Math.round((stats.confirmed / stats.total) * 1000) / 10 : 0,
        demo: false,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    console.error("Community pulse fetch failed:", e);
    return NextResponse.json({ contributors: 0, verifiedReports: 0, accuracyPct: 0, demo: true }, { headers: { "Cache-Control": "no-store" } });
  }
}
