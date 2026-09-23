"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, Users } from "lucide-react";
import { publicJson } from "@/lib/firebase/api";
import { cn } from "@/lib/utils";

const WINDOW_MS = 40 * 60 * 1000;

interface BlocklistEntry {
  url: string;
  reported_at: number;
}

interface TickerItem {
  id: string;
  text: string;
  time: string;
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function formatTimestamp(ms: number): string {
  return new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** URLs blocked by the community in the last 40 minutes, newest first — same public backend
 *  endpoint (GET /api/blocklist?since=...) the rest of this page's real data comes from. */
export function CommunityActivityTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const since = Date.now() - WINDOW_MS;
    publicJson<{ count: number; entries: BlocklistEntry[] }>(`/api/blocklist?since=${since}&limit=100`)
      .then((res) => {
        if (cancelled) return;
        const recentFirst = [...res.entries].reverse();
        setItems(
          recentFirst.map((e, i) => ({
            id: `${e.url}-${i}`,
            text: hostnameOf(e.url),
            time: formatTimestamp(e.reported_at),
          })),
        );
      })
      .catch(() => {
        // Non-fatal — the ticker just shows its empty state.
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const hasItems = items.length > 0;
  // Duplicated for a seamless loop — same technique regardless of how many real items there are.
  const looped = hasItems ? [...items, ...items] : [];

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
          aria-label="URLs blocked by the community in the last 40 minutes"
          className="group min-w-0 flex-1 overflow-hidden focus-visible:outline-none"
        >
          {!hasItems ? (
            <p className="truncate text-xs text-[var(--text-muted)]">
              {loaded ? "No URLs blocked in the last 40 minutes." : "Loading recent activity..."}
            </p>
          ) : (
            <div
              className={cn(
                "ticker-track flex w-max items-center gap-8 group-hover:[animation-play-state:paused] group-focus-visible:[animation-play-state:paused]",
              )}
            >
              {looped.map((item, i) => (
                <span key={`${item.id}-${i}`} className="flex shrink-0 items-center gap-2 text-xs text-[var(--text-muted)]">
                  <ShieldAlert className="h-3.5 w-3.5 text-[var(--orange-light)]" />
                  <span className="font-mono text-[var(--text)]">{item.text}</span>
                  <span>{item.time}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        <span className="hidden shrink-0 items-center gap-2 text-xs text-[var(--text-muted)] sm:flex">
          <Users className="h-3.5 w-3.5 text-[var(--orange-light)]" />
          Together for a safer internet.
        </span>
      </div>
    </div>
  );
}
