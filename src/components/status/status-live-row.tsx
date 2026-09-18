"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

function formatAgo(seconds: number): string {
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hour${hours === 1 ? "" : "s"} ago`;
}

export function StatusLiveRow({
  lastUpdated,
  refreshing,
  onRefresh,
}: {
  lastUpdated: Date | null;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  const [seconds, setSeconds] = useState<number | null>(() =>
    lastUpdated ? Math.max(0, Math.floor((Date.now() - lastUpdated.getTime()) / 1000)) : null,
  );

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds(lastUpdated ? Math.max(0, Math.floor((Date.now() - lastUpdated.getTime()) / 1000)) : null);
    }, 1000);
    return () => clearInterval(id);
  }, [lastUpdated]);

  return (
    <div
      data-status-row
      className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]"
    >
      <span className="flex items-center gap-2">
        <span data-status-dot className="h-2 w-2 rounded-full bg-[var(--operational)]" />
        <span className="text-[var(--operational)]">Live Monitoring</span>
      </span>
      <span aria-hidden className="hidden h-3 w-px bg-[var(--border)] sm:block" />
      <span className="normal-case tracking-normal text-[var(--text-secondary)]">
        {seconds === null ? "Loading…" : `Updated ${formatAgo(seconds)}`}
      </span>
      <button
        type="button"
        onClick={onRefresh}
        aria-label="Refresh status now"
        className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:text-[var(--white)]"
      >
        <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
      </button>
    </div>
  );
}
