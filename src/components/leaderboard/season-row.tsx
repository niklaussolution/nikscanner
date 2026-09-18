"use client";

import { useEffect, useState } from "react";
import { Info } from "lucide-react";

function formatCountdown(ms: number): string {
  if (ms <= 0) return "0d 00h";
  const totalHours = Math.floor(ms / (60 * 60 * 1000));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return `${days}d ${String(hours).padStart(2, "0")}h`;
}

export function SeasonRow({ seasonNumber, endsAt }: { seasonNumber: number; endsAt: string | null }) {
  const [now, setNow] = useState<number | null>(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const remaining = endsAt && now !== null ? new Date(endsAt).getTime() - now : null;

  return (
    <div data-status-row className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
      <span className="flex items-center gap-2">
        <span data-status-dot className="h-2 w-2 rounded-full bg-[var(--orange)]" />
        <span className="text-[var(--orange-light)]">Season {String(seasonNumber).padStart(2, "0")} Live</span>
      </span>
      <span aria-hidden className="h-3 w-px bg-[var(--border)]" />
      <span className="normal-case tracking-normal">
        Ends in <span className="font-bold text-[var(--white)]">{remaining === null ? "…" : formatCountdown(remaining)}</span>
      </span>
      <button type="button" aria-label="About this season" className="text-[var(--text-muted)] transition-colors hover:text-[var(--white)]">
        <Info className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
