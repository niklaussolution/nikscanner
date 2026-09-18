"use client";

import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { MonogramAvatar } from "@/components/leaderboard/monogram-avatar";
import type { RankedHunter } from "@/types/leaderboard";

function PodiumCard({ user, place }: { user: RankedHunter; place: 1 | 2 | 3 }) {
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
      {isFirst && (
        <span aria-hidden className="podium-crown-float absolute -top-6 left-1/2 -translate-x-1/2 text-[var(--orange-light)]">
          <Crown className="h-8 w-8" fill="currentColor" />
        </span>
      )}

      <span
        className={cn(
          "absolute left-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold",
          isFirst ? "bg-[var(--orange)] text-white" : "border border-[var(--border)] bg-black/40 text-[var(--text-secondary)]",
        )}
      >
        {String(place).padStart(2, "0")}
      </span>

      <MonogramAvatar username={user.username} size={isFirst ? 72 : 60} />

      <p className={cn("mt-3 font-bold text-[var(--white)]", isFirst ? "text-lg" : "text-base")}>{user.username}</p>
      <p className="mt-1 text-xs text-[var(--text-secondary)]">{user.country}</p>
      <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[var(--orange-light)]">{user.title}</p>

      <p className={cn("mt-3 font-extrabold text-[var(--white)]", isFirst ? "text-2xl" : "text-xl")}>{user.points.toLocaleString()}</p>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Points</p>
      {isFirst && <p className="mt-1 text-[10px] font-semibold text-[var(--text-muted)]">{user.reportsSubmitted} reports</p>}
    </div>
  );
}

export function LeaderboardPodium({ users }: { users: RankedHunter[] }) {
  const [first, second, third] = users;
  if (!first || !second || !third) return null;

  return (
    // Mobile: natural DOM order is first → second → third (per spec).
    // sm+: reordered visually to second, first (elevated center), third.
    <div data-podium className="grid grid-cols-1 items-end gap-4 sm:grid-cols-3 sm:gap-5">
      <div className="sm:order-2 sm:-mb-4">
        <PodiumCard user={first} place={1} />
      </div>
      <div className="sm:order-1 sm:self-end">
        <PodiumCard user={second} place={2} />
      </div>
      <div className="sm:order-3 sm:self-end">
        <PodiumCard user={third} place={3} />
      </div>
    </div>
  );
}
