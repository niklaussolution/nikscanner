"use client";

import { Crown, Medal, Award, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { MonogramAvatar } from "@/components/leaderboard/monogram-avatar";
import type { RankedHunter } from "@/types/leaderboard";

const RANK_ICON = { 1: Crown, 2: Medal, 3: Award } as const;
const RANK_COLOR = { 1: "text-[var(--orange)]", 2: "text-[var(--text-secondary)]", 3: "text-amber-600" } as const;

function TrendBadge({ trend }: { trend: number | null }) {
  if (trend === null) return <span className="text-[var(--text-muted)]">—</span>;
  if (trend === 0) return <Minus className="h-3.5 w-3.5 text-[var(--text-muted)]" />;
  if (trend > 0) {
    return (
      <span className="flex items-center gap-0.5 font-semibold text-[var(--positive)]">
        <TrendingUp className="h-3.5 w-3.5" /> +{trend}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-0.5 font-semibold text-[var(--negative)]">
      <TrendingDown className="h-3.5 w-3.5" /> {trend}
    </span>
  );
}

export function RankingsTable({ users, currentUserId }: { users: RankedHunter[]; currentUserId?: string }) {
  return (
    <div data-rankings-table className="mt-4 rounded-xl border border-[var(--border-muted)] bg-[var(--surface-soft)]">
      {/* Desktop / tablet table */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border-muted)] text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Hunter</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3 text-right">Reports</th>
              <th className="px-4 py-3 text-right">Verified</th>
              <th className="px-4 py-3 text-right">Accuracy</th>
              <th className="px-4 py-3 text-right">Points</th>
              <th className="px-4 py-3 text-right">Trend</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const RankIcon = RANK_ICON[u.rank as 1 | 2 | 3];
              const isCurrentUser = currentUserId === u.id;
              return (
                <tr
                  key={u.id}
                  data-ranking-row
                  className={cn(
                    "group border-b border-[var(--border-muted)] transition-colors last:border-b-0 hover:bg-[var(--orange)]/[0.04]",
                    isCurrentUser && "outline outline-1 -outline-offset-1 outline-[var(--orange)]/50",
                  )}
                >
                  <td className="px-4 py-3 font-bold text-[var(--white)]">
                    <span className="flex items-center gap-1.5">
                      {RankIcon && <RankIcon className={cn("h-4 w-4", RANK_COLOR[u.rank as 1 | 2 | 3])} />}
                      {String(u.rank).padStart(2, "0")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2.5">
                      <MonogramAvatar username={u.username} size={28} />
                      <span className="font-semibold text-[var(--white)]">{u.username}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{u.country}</td>
                  <td className="px-4 py-3 text-right text-[var(--text-secondary)]">{u.reportsSubmitted.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-[var(--text-secondary)]">{u.reportsVerified.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-semibold text-[var(--positive)]">{u.accuracy}%</td>
                  <td className="px-4 py-3 text-right font-bold text-[var(--orange-light)]">{u.points.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <TrendBadge trend={u.trend} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card layout */}
      <div className="divide-y divide-[var(--border-muted)] sm:hidden">
        {users.map((u) => {
          const RankIcon = RANK_ICON[u.rank as 1 | 2 | 3];
          const isCurrentUser = currentUserId === u.id;
          return (
            <div key={u.id} data-ranking-row className={cn("p-4", isCurrentUser && "outline outline-1 -outline-offset-1 outline-[var(--orange)]/50")}>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-sm font-bold text-[var(--white)]">
                  {RankIcon && <RankIcon className={cn("h-4 w-4", RANK_COLOR[u.rank as 1 | 2 | 3])} />}
                  {String(u.rank).padStart(2, "0")}
                </span>
                <MonogramAvatar username={u.username} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[var(--white)]">{u.username}</p>
                  <p className="truncate text-xs text-[var(--text-secondary)]">{u.country}</p>
                </div>
                <TrendBadge trend={u.trend} />
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
                <div>
                  <p className="font-bold text-[var(--white)]">{u.reportsSubmitted}</p>
                  <p className="text-[10px] uppercase text-[var(--text-muted)]">Reports</p>
                </div>
                <div>
                  <p className="font-bold text-[var(--white)]">{u.reportsVerified}</p>
                  <p className="text-[10px] uppercase text-[var(--text-muted)]">Verified</p>
                </div>
                <div>
                  <p className="font-bold text-[var(--positive)]">{u.accuracy}%</p>
                  <p className="text-[10px] uppercase text-[var(--text-muted)]">Accuracy</p>
                </div>
                <div>
                  <p className="font-bold text-[var(--orange-light)]">{u.points.toLocaleString()}</p>
                  <p className="text-[10px] uppercase text-[var(--text-muted)]">Points</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
