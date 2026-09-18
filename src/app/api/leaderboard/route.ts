import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, clientKeyFromRequest } from "@/lib/security/rate-limit";
import { LEADERBOARD_DATASET, LEADERBOARD_COUNTRIES, SEASON, pointsForPeriod, type LeaderboardUser } from "@/lib/data/leaderboard";
import type { LeaderboardPeriod, LeaderboardResponse, RankedHunter } from "@/types/leaderboard";

export const runtime = "nodejs";

const PAGE_SIZE = 7;

const querySchema = z.object({
  period: z.enum(["global", "weekly", "monthly", "alltime"]).default("global"),
  country: z.string().max(64).default("all"),
  search: z.string().max(64).default(""),
  page: z.coerce.number().int().min(1).default(1),
});

/**
 * Stable multi-key sort, computed server-side — this is the authoritative
 * ranking the client renders, never re-sorted or re-scored in the browser.
 * 1) points for the selected period, desc
 * 2) verified reports, desc
 * 3) accuracy, desc
 * 4) earlier first-achievement time wins ties
 */
function sortForPeriod(users: LeaderboardUser[], period: LeaderboardPeriod): LeaderboardUser[] {
  return [...users].sort((a, b) => {
    const byPoints = pointsForPeriod(b, period) - pointsForPeriod(a, period);
    if (byPoints !== 0) return byPoints;
    const byVerified = b.reportsVerified - a.reportsVerified;
    if (byVerified !== 0) return byVerified;
    const byAccuracy = b.accuracy - a.accuracy;
    if (byAccuracy !== 0) return byAccuracy;
    return new Date(a.firstAchievementAt).getTime() - new Date(b.firstAchievementAt).getTime();
  });
}

function rankMap(sorted: LeaderboardUser[]): Map<string, number> {
  const map = new Map<string, number>();
  sorted.forEach((u, i) => map.set(u.id, i + 1));
  return map;
}

export async function GET(req: Request) {
  const limit = rateLimit(`leaderboard:${clientKeyFromRequest(req)}`, 60, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429, headers: { "Retry-After": String(Math.ceil(limit.resetMs / 1000)) } });
  }

  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    period: url.searchParams.get("period") ?? undefined,
    country: url.searchParams.get("country") ?? undefined,
    search: url.searchParams.get("search") ?? undefined,
    page: url.searchParams.get("page") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters.", issues: parsed.error.issues }, { status: 400 });
  }
  const { period, country, search, page } = parsed.data;

  const sortedForPeriod = sortForPeriod(LEADERBOARD_DATASET, period);
  const currentRanks = rankMap(sortedForPeriod);
  // Trend compares the selected period's rank against a different baseline
  // ranking (the season/"global" order, or all-time when already viewing
  // global) — a real, deterministic comparison, not a random arrow.
  const baselinePeriod: LeaderboardPeriod = period === "global" ? "alltime" : "global";
  const baselineRanks = rankMap(sortForPeriod(LEADERBOARD_DATASET, baselinePeriod));

  const normalizedSearch = search.trim().toLowerCase();
  const normalizedCountry = country.trim().toLowerCase();

  const filtered = sortedForPeriod.filter((u) => {
    if (normalizedCountry !== "all" && u.country.toLowerCase() !== normalizedCountry) return false;
    if (normalizedSearch && !u.username.toLowerCase().includes(normalizedSearch)) return false;
    return true;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageUsers = filtered.slice(start, start + PAGE_SIZE);

  const users: RankedHunter[] = pageUsers.map((u) => {
    const currentRank = currentRanks.get(u.id) ?? 0;
    const baselineRank = baselineRanks.get(u.id) ?? currentRank;
    return {
      id: u.id,
      rank: currentRank,
      trend: baselineRank === currentRank ? 0 : baselineRank - currentRank,
      username: u.username,
      country: u.country,
      countryCode: u.countryCode,
      title: u.title,
      points: pointsForPeriod(u, period),
      reportsSubmitted: u.reportsSubmitted,
      reportsVerified: u.reportsVerified,
      accuracy: u.accuracy,
    };
  });

  const activeHunters = LEADERBOARD_DATASET.length;
  const verifiedReports = LEADERBOARD_DATASET.reduce((sum, u) => sum + u.reportsVerified, 0);
  const countries = new Set(LEADERBOARD_DATASET.map((u) => u.country)).size;
  const avgAccuracy = Number((LEADERBOARD_DATASET.reduce((sum, u) => sum + u.accuracy, 0) / LEADERBOARD_DATASET.length).toFixed(1));

  const payload: LeaderboardResponse = {
    state: total === 0 ? "empty" : "ready",
    period,
    country,
    search,
    users,
    pagination: { page: safePage, pageSize: PAGE_SIZE, total, totalPages },
    metrics: { activeHunters, verifiedReports, countries, avgAccuracy },
    season: {
      number: SEASON.number,
      endsAt: SEASON.endsAt,
      targetVerifiedReports: SEASON.targetVerifiedReports,
      verifiedReports,
    },
    countries: LEADERBOARD_COUNTRIES.map((c) => c.name),
    demo: true,
  };

  return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
}
