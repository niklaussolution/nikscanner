"use client";

import { useEffect, useState } from "react";
import { Crown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { publicJson } from "@/lib/firebase/api";
import { MonogramAvatar } from "@/components/leaderboard/monogram-avatar";
import type { LeaderboardEntry, LeaderboardResult } from "@/lib/firebase/nikscanner-types";

function PodiumCard({ entry, place }: { entry: LeaderboardEntry; place: 1 | 2 | 3 }) {
  const isFirst = place === 1;

  return (
    <div
      data-podium-card
      data-place={place}
      className={cn(
        "relative flex flex-col items-center rounded-2xl border p-6 text-center transition-all duration-200 hover:-translate-y-1.5",
        isFirst
          ? "border-[var(--orange)] bg-[var(--surface-raised)] pt-9 shadow-[0_0_50px_-12px_rgba(255,90,0,0.55)]"
          : "border-[var(--border-muted)] bg-[var(--surface-soft)]",
      )}
    >
      {/* {isFirst && (
        <span aria-hidden className="podium-crown-float absolute -top-6 left-1/2 -translate-x-1/2 text-[var(--orange-light)]">
          <Crown className="h-8 w-8" fill="currentColor" />
        </span>
      )} */}

      <span
        className={cn(
          "absolute left-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold",
          isFirst ? "bg-[var(--orange)] text-white" : "border border-[var(--border)] bg-black/40 text-[var(--text-secondary)]",
        )}
      >
        {String(place).padStart(2, "0")}
      </span>

      <MonogramAvatar username={entry.name} size={isFirst ? 72 : 60} />

      <p className={cn("mt-3 font-bold text-[var(--white)]", isFirst ? "text-lg" : "text-base")}>{entry.name}</p>
      {entry.country && <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{entry.country}</p>}

      <p className={cn("mt-3 font-extrabold text-[var(--white)]", isFirst ? "text-2xl" : "text-xl")}>
        {entry.count.toLocaleString()}
      </p>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">URLs Blocked</p>
    </div>
  );
}

/** Top 3 community contributors by confirmed-block count — real data from the NIKSCANNER
 *  backend (GET /api/leaderboard?limit=3, same backend the mobile app uses), not the demo
 *  seeded dataset the rest of this page's table/filters/seasons still use. */
export function RealLeaderboardPodium() {
  const [leaders, setLeaders] = useState<LeaderboardEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    publicJson<LeaderboardResult>("/api/leaderboard?limit=3")
      .then((res) => setLeaders(res.leaders))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load leaderboard."));
  }, []);

  if (error) return <p className="text-sm text-[var(--danger)]">{error}</p>;

  if (!leaders) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-[var(--text-secondary)]">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading top contributors...
      </div>
    );
  }

  const [first, second, third] = leaders;
  if (!first) return null;

  return (
    <div data-podium className="grid grid-cols-1 items-end gap-4 sm:grid-cols-3 sm:gap-5">
      <div className="sm:order-2 sm:-mb-4">
        <PodiumCard entry={first} place={1} />
      </div>
      {second && (
        <div className="sm:order-1 sm:self-end">
          <PodiumCard entry={second} place={2} />
        </div>
      )}
      {third && (
        <div className="sm:order-3 sm:self-end">
          <PodiumCard entry={third} place={3} />
        </div>
      )}
    </div>
  );
}
