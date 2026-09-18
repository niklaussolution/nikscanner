import type { ReportInput } from "@/lib/validation/report";

export interface CommunityReport extends ReportInput {
  id: string;
  status: "pending_review" | "verified" | "rejected" | "duplicate";
  createdAt: string;
}

/**
 * In-memory moderation queue for local development. A single unverified
 * report must never flip a target's public reputation — it only affects
 * scoring once a moderator (or N-of-M corroboration policy) marks it
 * "verified". Production deployments should back this with a real table
 * (see the CommunityReport / ThreatReport Prisma models) and a review UI.
 */
const queue: CommunityReport[] = [];

export function enqueueReport(report: CommunityReport) {
  queue.push(report);
  return report;
}

export function listReports() {
  return [...queue].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
