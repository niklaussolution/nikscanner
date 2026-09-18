"use client";

import Link from "next/link";
import { Fish, Bug, Link as LinkIcon, ShieldCheck, ChevronRight, Check, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACHIEVEMENTS } from "@/lib/data/leaderboard";

const ICON: Record<string, LucideIcon> = {
  "phishing-hunter": Fish,
  "malware-hunter": Bug,
  "url-guardian": LinkIcon,
  "community-defender": ShieldCheck,
};

export function FeaturedAchievements({ unlockedIds = [] }: { unlockedIds?: string[] }) {
  return (
    <div data-achievements className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">
        <Trophy className="h-4 w-4 text-[var(--orange-light)]" /> Featured Achievements
      </span>

      <ul className="mt-4 space-y-2">
        {ACHIEVEMENTS.map((a) => {
          const Icon = ICON[a.id] ?? Trophy;
          const unlocked = unlockedIds.includes(a.id);
          return (
            <li key={a.id} data-achievement-row>
              <button
                type="button"
                className="group flex w-full items-center gap-3 rounded-lg border border-transparent p-2.5 text-left transition-colors hover:border-[var(--orange)]/30 hover:bg-[var(--orange)]/[0.04]"
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
                    unlocked ? "border-[var(--positive)]/40 bg-[var(--positive)]/10 text-[var(--positive)]" : "border-[var(--orange)]/25 bg-[var(--orange)]/10 text-[var(--orange-light)]",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[var(--white)]">{a.title}</p>
                  <p className="truncate text-xs text-[var(--text-secondary)]">{a.desc}</p>
                </div>
                {unlocked ? (
                  <span className="flex shrink-0 items-center gap-1 rounded-md border border-[var(--positive)]/40 bg-[var(--positive)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--positive)]">
                    <Check className="h-3 w-3" /> Unlocked
                  </span>
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5" />
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <Link
        href="/leaderboard"
        className="mt-4 flex items-center justify-end gap-1 text-xs font-bold uppercase tracking-wide text-[var(--orange-light)] hover:text-[var(--orange)]"
      >
        View all achievements <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
