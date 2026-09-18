"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileCheck, Crown, UserPlus, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActivityItem } from "@/app/api/leaderboard/activity/route";

const KIND_ICON: Record<ActivityItem["kind"], LucideIcon> = {
  verified: FileCheck,
  milestone: Crown,
  joined: UserPlus,
};

export function CommunityActivityTicker() {
  const [items, setItems] = useState<ActivityItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/leaderboard/activity")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setItems(data.items ?? []);
      })
      .catch(() => {
        /* ticker is decorative — a failed fetch just leaves it empty */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (items.length === 0) return null;

  const looped = [...items, ...items];

  return (
    <div data-activity-ticker className="mt-6 flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 sm:px-5">
      <span className="flex shrink-0 items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-[var(--positive)]">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--positive)]" /> Live Community Activity
      </span>

      <div
        tabIndex={0}
        className="group min-w-0 flex-1 overflow-hidden focus-visible:outline-none"
        role="marquee"
        aria-label="Recent community activity"
      >
        <div className={cn("ticker-track flex w-max items-center gap-8 group-hover:[animation-play-state:paused] group-focus-visible:[animation-play-state:paused]")}>
          {looped.map((item, i) => {
            const Icon = KIND_ICON[item.kind];
            return (
              <span key={`${item.id}-${i}`} className="flex shrink-0 items-center gap-2 text-xs text-[var(--text-secondary)]">
                <Icon className="h-3.5 w-3.5 text-[var(--orange-light)]" />
                <span>
                  {item.kind === "milestone" ? (
                    <>
                      <span className="font-semibold text-[var(--white)]">{item.text.split(" reached ")[0]}</span> reached{" "}
                      {item.text.split(" reached ")[1]}
                    </>
                  ) : item.kind === "verified" ? (
                    <>
                      <span className="font-semibold text-[var(--white)]">{item.text.split(" verified ")[0]}</span> verified{" "}
                      {item.text.split(" verified ")[1]}
                    </>
                  ) : (
                    item.text
                  )}
                </span>
              </span>
            );
          })}
        </div>
      </div>

      <Link
        href="/community"
        className="hidden shrink-0 items-center gap-1 text-xs font-bold uppercase tracking-wide text-[var(--orange-light)] hover:text-[var(--orange)] sm:flex"
      >
        Submit a threat <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
