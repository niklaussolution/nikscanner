"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Globe, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LeaderboardPeriod } from "@/types/leaderboard";

const PERIODS: { id: LeaderboardPeriod; label: string }[] = [
  { id: "global", label: "Global" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "alltime", label: "All Time" },
];

function useDebouncedCallback<T extends (...args: string[]) => void>(fn: T, delayMs: number) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Re-created each render, closing over the latest `fn` — only the timer
  // handle needs to persist across renders, so no ref-sync-during-render
  // is needed here.
  return (value: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fn(value), delayMs);
  };
}

export function LeaderboardControls({
  period,
  onPeriodChange,
  country,
  onCountryChange,
  countries,
  searchValue,
  onSearchChange,
}: {
  period: LeaderboardPeriod;
  onPeriodChange: (p: LeaderboardPeriod) => void;
  country: string;
  onCountryChange: (c: string) => void;
  countries: string[];
  searchValue: string;
  onSearchChange: (s: string) => void;
}) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebouncedCallback(onSearchChange, 350);

  useEffect(() => {
    const tabs = tabsRef.current;
    const indicator = indicatorRef.current;
    if (!tabs || !indicator) return;
    const activeEl = tabs.querySelector<HTMLElement>(`[data-period="${period}"]`);
    if (!activeEl) return;
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tabsRect = tabs.getBoundingClientRect();
    const targetRect = activeEl.getBoundingClientRect();
    gsap.to(indicator, {
      x: targetRect.left - tabsRect.left,
      width: targetRect.width,
      height: targetRect.height,
      duration: reduced ? 0 : 0.35,
      ease: "power3.out",
    });
  }, [period]);

  return (
    <div data-leaderboard-controls className="mt-6 flex flex-wrap items-center justify-between gap-3">
      <div ref={tabsRef} role="tablist" aria-label="Leaderboard period" className="relative flex gap-1 overflow-x-auto rounded-xl border border-[var(--border-muted)] bg-black/30 p-1 scrollbar-thin">
        <div ref={indicatorRef} aria-hidden className="absolute left-1 top-1 z-0 rounded-lg bg-[var(--orange)]" style={{ width: 0, height: 0 }} />
        {PERIODS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            data-period={p.id}
            aria-selected={period === p.id}
            onClick={() => onPeriodChange(p.id)}
            className={cn(
              "relative z-10 shrink-0 rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange)]",
              period === p.id ? "text-white" : "text-[var(--text-muted)] hover:text-[var(--white)]",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-wrap items-center justify-end gap-3 sm:flex-none">
        <div className="relative min-w-[180px] flex-1 sm:flex-none">
          <Globe className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <select
            value={country}
            onChange={(e) => onCountryChange(e.target.value)}
            aria-label="Filter by country"
            className="h-11 min-h-[44px] w-full appearance-none rounded-xl border border-[var(--border-muted)] bg-black/30 pl-10 pr-9 text-xs font-bold uppercase tracking-wide text-[var(--white)] focus:border-[var(--orange)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/20"
          >
            <option value="all">All Countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
        </div>

        <div className="relative w-full sm:w-48">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            // Uncontrolled: typing is fully local DOM state, so the debounced
            // URL sync never fights the user's keystrokes. Keyed on whether
            // the external value is empty so an outside reset (e.g. "Clear
            // Filters") remounts the field with an empty default, while
            // ordinary typing (which keeps this key stable) never remounts.
            key={searchValue === "" ? "empty" : "has-value"}
            defaultValue={searchValue}
            onChange={(e) => debouncedSearch(e.target.value)}
            placeholder="Search hunter…"
            aria-label="Search hunters by username"
            className="h-11 min-h-[44px] w-full rounded-xl border border-[var(--border-muted)] bg-black/30 pl-10 pr-3 text-sm text-[var(--white)] placeholder:text-[var(--text-muted)] focus:border-[var(--orange)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/20"
          />
        </div>
      </div>
    </div>
  );
}
