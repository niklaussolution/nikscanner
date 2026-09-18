"use client";

import { Globe, ShieldCheck, Bug, FileText, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ACTIVITY_TICKER_ITEMS, type ActivityKind } from "@/lib/data/community";
import { cn } from "@/lib/utils";

const KIND_ICON: Record<ActivityKind, LucideIcon> = {
  verified: Globe,
  phishing: ShieldCheck,
  malware: Bug,
  reported: FileText,
};

export function CommunityActivityTicker() {
  const looped = [...ACTIVITY_TICKER_ITEMS, ...ACTIVITY_TICKER_ITEMS];

  return (
    <div className="border-t border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1440px] items-center gap-4">
        <span className="flex shrink-0 items-center gap-2 text-xs font-bold uppercase tracking-wide text-[var(--green)]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--green)]" />
          Live community activity
        </span>

        <div
          tabIndex={0}
          role="marquee"
          aria-label="Recent community activity"
          className="group min-w-0 flex-1 overflow-hidden focus-visible:outline-none"
        >
          <div className={cn("ticker-track flex w-max items-center gap-8 group-hover:[animation-play-state:paused] group-focus-visible:[animation-play-state:paused]")}>
            {looped.map((item, i) => {
              const Icon = KIND_ICON[item.kind];
              return (
                <span key={`${item.id}-${i}`} className="flex shrink-0 items-center gap-2 text-xs text-[var(--text-muted)]">
                  <Icon className="h-3.5 w-3.5 text-[var(--orange-light)]" />
                  <span className="text-[var(--text)]">{item.text}</span>
                  <span>{item.time}</span>
                </span>
              );
            })}
          </div>
        </div>

        <span className="hidden shrink-0 items-center gap-2 text-xs text-[var(--text-muted)] sm:flex">
          <Users className="h-3.5 w-3.5 text-[var(--orange-light)]" />
          Together for a safer internet.
        </span>
      </div>
    </div>
  );
}
