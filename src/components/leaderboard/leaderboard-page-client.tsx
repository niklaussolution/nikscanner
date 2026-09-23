"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LeaderboardIntro } from "@/components/leaderboard/leaderboard-intro";
import { CommunityMetrics } from "@/components/leaderboard/community-metrics";
import { RealLeaderboardPodium } from "@/components/leaderboard/real-leaderboard-podium";
import { RankingsTable } from "@/components/leaderboard/rankings-table";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Real backend data only, now — RealLeaderboardPodium (top 3), CommunityMetrics (active
 *  hunters / verified reports), and RankingsTable (top 10) each fetch the real NIKSCANNER
 *  backend directly. The old demo-dataset scaffolding (period/country/search filters,
 *  pagination, seasons, achievements, the activity ticker) is gone — none of it has a real
 *  data source, and showing it alongside real numbers would be actively misleading. */
export function LeaderboardPageClient() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-podium-card]", { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power3.out" });
      gsap.fromTo(
        "[data-ranking-row]",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, stagger: reduced ? 0 : 0.04, ease: "power2.out" },
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef}>
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
