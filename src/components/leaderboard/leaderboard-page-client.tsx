"use client";

import { LeaderboardIntro } from "@/components/leaderboard/leaderboard-intro";
import { CommunityMetrics } from "@/components/leaderboard/community-metrics";
import { RealLeaderboardPodium } from "@/components/leaderboard/real-leaderboard-podium";
import { RankingsTable } from "@/components/leaderboard/rankings-table";

/** Real backend data only, now — RealLeaderboardPodium (top 3), CommunityMetrics (active
 *  hunters / verified reports), and RankingsTable (top 10) each fetch the real NIKSCANNER
 *  backend directly. The old demo-dataset scaffolding (period/country/search filters,
 *  pagination, seasons, achievements, the activity ticker) is gone — none of it has a real
 *  data source, and showing it alongside real numbers would be actively misleading. */
export function LeaderboardPageClient() {
  // Entrance animations live in RealLeaderboardPodium / RankingsTable themselves, run once their
  // data has loaded — animating from here on mount targeted elements that didn't exist yet.
  return (
    <div>
      <LeaderboardIntro />
      <CommunityMetrics />

      <div className="mt-8">
        <RealLeaderboardPodium />

        <h2 className="mt-8 text-sm font-bold uppercase tracking-wide text-[var(--text-secondary)]">Global Rankings</h2>
        <RankingsTable />
      </div>
    </div>
  );
}
