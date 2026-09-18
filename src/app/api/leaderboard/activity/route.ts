import { NextResponse } from "next/server";
import { rateLimit, clientKeyFromRequest } from "@/lib/security/rate-limit";
import { LEADERBOARD_DATASET } from "@/lib/data/leaderboard";

export const runtime = "nodejs";

export interface ActivityItem {
  id: string;
  kind: "verified" | "milestone" | "joined";
  text: string;
}

/**
 * A stable, sanitized activity feed derived from the same dataset the
 * rankings use — only usernames and countries are ever surfaced here,
 * never emails, IPs, or raw report content.
 */
function buildActivity(): ActivityItem[] {
  const byVerified = [...LEADERBOARD_DATASET].sort((a, b) => b.reportsVerified - a.reportsVerified).slice(0, 6);
  const byWeekly = [...LEADERBOARD_DATASET].sort((a, b) => b.pointsWeekly - a.pointsWeekly).slice(0, 6);
  const byJoined = [...LEADERBOARD_DATASET].sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()).slice(0, 6);

  const items: ActivityItem[] = [];
  byVerified.forEach((u) => items.push({ id: `verified-${u.id}`, kind: "verified", text: `${u.username} verified a threat report` }));
  byWeekly.forEach((u) => items.push({ id: `milestone-${u.id}`, kind: "milestone", text: `${u.username} reached ${Math.round(u.pointsGlobal / 1000) * 1000} points` }));
  byJoined.forEach((u) => items.push({ id: `joined-${u.id}`, kind: "joined", text: `New hunter joined from ${u.country}` }));

  // Interleave the three kinds rather than grouping them.
  const interleaved: ActivityItem[] = [];
  const max = Math.max(byVerified.length, byWeekly.length, byJoined.length);
  for (let i = 0; i < max; i++) {
    if (items[i]) interleaved.push(items[i]);
    if (items[max + i]) interleaved.push(items[max + i]);
    if (items[2 * max + i]) interleaved.push(items[2 * max + i]);
  }
  return interleaved;
}

const ACTIVITY = buildActivity();

export async function GET(req: Request) {
  const limit = rateLimit(`leaderboard-activity:${clientKeyFromRequest(req)}`, 60, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }
  return NextResponse.json({ items: ACTIVITY, demo: true }, { headers: { "Cache-Control": "no-store" } });
}
