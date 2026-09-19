import { Suspense } from "react";
import { LeaderboardPageClient } from "@/components/leaderboard/leaderboard-page-client";
import { leaderboardTheme } from "@/components/leaderboard/theme";

export default function DashboardLeaderboardPage() {
  return (
    <section
      style={{
        ...leaderboardTheme,
        backgroundColor: "var(--background)",
        backgroundImage:
          "linear-gradient(to right, var(--border-muted) 1px, transparent 1px), linear-gradient(to bottom, var(--border-muted) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
      }}
      className="relative -m-6 overflow-hidden px-4 pb-24 pt-12 sm:px-6 lg:px-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[520px]"
        style={{ background: "radial-gradient(680px circle at 50% 0%, rgba(255,90,0,0.1), transparent 70%)" }}
      />

      <div className="relative z-10 mx-auto max-w-[1500px]">
        <Suspense fallback={null}>
          <LeaderboardPageClient />
        </Suspense>
      </div>
    </section>
  );
}
