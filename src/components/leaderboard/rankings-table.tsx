"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Crown, Medal, Award, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { publicJson } from "@/lib/firebase/api";
import { MonogramAvatar } from "@/components/leaderboard/monogram-avatar";
import type { LeaderboardEntry, LeaderboardResult } from "@/lib/firebase/nikscanner-types";

const RANK_ICON = { 1: Crown, 2: Medal, 3: Award } as const;
const RANK_COLOR = { 1: "text-[var(--orange)]", 2: "text-[var(--text-secondary)]", 3: "text-amber-600" } as const;

/** Top 10 community contributors by confirmed-block count — same real backend data
 *  RealLeaderboardPodium already shows for the top 3 (GET /api/leaderboard, public), just the
 *  fuller list below it. The real backend exposes name, country (self-reported at signup/in
 *  profile, "—" if never set), confirmed-block count and community points per user — no
 *  accuracy or trend data exists to show, so this table only shows what's actually real instead
 *  of the old demo dataset's fabricated extra columns. */
export function RankingsTable() {
  const [leaders, setLeaders] = useState<LeaderboardEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    publicJson<LeaderboardResult>("/api/leaderboard?limit=10")
      .then((res) => setLeaders(res.leaders.slice(0, 10)))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load rankings."));
  }, []);

  useEffect(() => {
    const table = tableRef.current;
    if (!table || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Only the rows of the layout actually showing (desktop table vs mobile cards).
    const rows = [...table.querySelectorAll<HTMLElement>("[data-ranking-row]")].filter((r) => r.offsetParent !== null);
    if (rows.length === 0) return;
    const tween = gsap.fromTo(rows, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.04, ease: "power2.out" });
    return () => {
      tween.kill();
    };
  }, [leaders]);

  if (error) {
    return <p className="mt-4 text-sm text-[var(--danger)]">{error}</p>;
  }

  if (!leaders) {
    return (
      <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-[var(--border-muted)] bg-[var(--surface-soft)] py-10 text-sm text-[var(--text-secondary)]">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading rankings...
      </div>
    );
  }

  if (leaders.length === 0) {
    return (
      <div className="mt-4 rounded-xl border border-[var(--border-muted)] bg-[var(--surface-soft)] p-8 text-center text-sm text-[var(--text-secondary)]">
        No hunters yet — block a URL to be the first on the board.
      </div>
    );
  }

  return (
    <div ref={tableRef} data-rankings-table className="mt-4 rounded-xl border border-[var(--border-muted)] bg-[var(--surface-soft)]">
      {/* Desktop / tablet table */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[420px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border-muted)] text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Hunter</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Points</th>
              <th className="px-4 py-3 text-right">URLs Blocked</th>
            </tr>
          </thead>
          <tbody>
            {leaders.map((u, i) => {
              const rank = i + 1;
              const RankIcon = RANK_ICON[rank as 1 | 2 | 3];
              return (
                <tr
                  key={`${u.name}-${i}`}
                  data-ranking-row
                  className="group border-b border-[var(--border-muted)] transition-colors last:border-b-0 hover:bg-[var(--orange)]/[0.04]"
                >
                  <td className="px-4 py-3 font-bold text-[var(--white)]">
                    <span className="flex items-center gap-1.5">
                      {RankIcon && <RankIcon className={cn("h-4 w-4", RANK_COLOR[rank as 1 | 2 | 3])} />}
                      {String(rank).padStart(2, "0")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2.5">
                      <MonogramAvatar username={u.name} src={u.avatar} size={28} />
                      <span className="font-semibold text-[var(--white)]">{u.name}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {u.country ?? "—"}
                    {/* <span className="ml-2 text-xs font-semibold text-[var(--orange-light)]">{(u.points ?? 0).toLocaleString()} pts</span> */}
                  </td>
                  <td className="px-8 py-3 font-bold text-[var(--orange-light)]">{(u.points ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-bold text-[var(--orange-light)]">{u.count.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card layout */}
      <div className="divide-y divide-[var(--border-muted)] sm:hidden">
        {leaders.map((u, i) => {
          const rank = i + 1;
          const RankIcon = RANK_ICON[rank as 1 | 2 | 3];
          return (
            <div key={`${u.name}-${i}`} data-ranking-row className="flex items-center gap-3 p-4">
              <span className="flex items-center gap-1 text-sm font-bold text-[var(--white)]">
                {RankIcon && <RankIcon className={cn("h-4 w-4", RANK_COLOR[rank as 1 | 2 | 3])} />}
                {String(rank).padStart(2, "0")}
              </span>
              <MonogramAvatar username={u.name} src={u.avatar} size={32} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-[var(--white)]">{u.name}</p>
                <p className="truncate text-[11px] text-[var(--text-muted)]">
                  {u.country ?? "—"}
                  <span className="ml-1.5 font-semibold text-[var(--orange-light)]">{(u.points ?? 0).toLocaleString()} pts</span>
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[var(--orange-light)]">{u.count.toLocaleString()}</p>
                <p className="text-[10px] uppercase text-[var(--text-muted)]">Blocked</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
