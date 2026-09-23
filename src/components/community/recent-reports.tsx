"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { publicJson } from "@/lib/firebase/api";
import { cn } from "@/lib/utils";

interface BlocklistEntry {
  url: string;
  category: string;
  blocked_by: string;
  reported_at: number;
}

interface Row {
  id: string;
  domain: string;
  category: string;
  blockedBy: string;
  time: string;
}

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.max(0, Math.round(diff / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

/** The 3 most recently blocked URLs across every user on the shared community blocklist — same
 *  backend the mobile app uses (GET /api/blocklist, public). Every entry returned by that
 *  endpoint has already cleared CONFIRM_THRESHOLD independent reporters, so there's no
 *  "pending"/demo state here — this is real, live community activity or nothing at all. */
export function RecentReports() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    publicJson<{ count: number; entries: BlocklistEntry[] }>("/api/blocklist?limit=3")
      .then((res) => {
        if (cancelled) return;
        const recentFirst = [...res.entries].reverse();
        setRows(
          recentFirst.map((e, i) => ({
            id: `${e.url}-${i}`,
            domain: hostnameOf(e.url),
            category: e.category,
            blockedBy: e.blocked_by,
            time: timeAgo(e.reported_at),
          })),
        );
      })
      .catch(() => {
        // Non-fatal — the panel just shows its empty state.
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || !rootRef.current) return;
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-report-row]",
        { opacity: 0, y: -8 },
        { opacity: 1, y: 0, duration: 0.4, stagger: reduced ? 0 : 0.06, ease: "power2.out" },
      );
      if (!reduced) {
        gsap.to("[data-timeline-dot]", { opacity: 0.35, duration: 1.4, repeat: -1, yoyo: true, stagger: 0.15, ease: "sine.inOut" });
      }
    }, rootRef);
    return () => ctx.revert();
  }, [ready, rows]);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-[var(--text)]">Recent community reports</h2>
      </div>

      <div ref={rootRef} className="relative mt-4 space-y-1">
        <div aria-hidden className="absolute bottom-2 left-[7px] top-2 w-px bg-[var(--border-soft)]" />
        {rows.length === 0 && ready ? (
          <p className="py-4 text-sm text-[var(--text-muted)]">No blocked URLs reported yet.</p>
        ) : (
          rows.map((r) => (
            <div key={r.id} data-report-row className="relative flex items-start gap-3 py-2 pl-1">
              <span data-timeline-dot className="relative z-10 mt-1.5 h-[7px] w-[7px] shrink-0 rounded-full bg-[var(--orange)]" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate font-mono text-sm text-[var(--text)]">{r.domain}</p>
                  <span className="shrink-0 text-[11px] text-[var(--text-muted)]">{r.time}</span>
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-3">
                  <p className="truncate text-xs text-[var(--text-muted)]">
                    {r.category} · blocked by {r.blockedBy}
                  </p>
                  <span
                    className={cn(
                      "flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                      "bg-[var(--green)]/15 text-[var(--green)]",
                    )}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--green)]" />
                    Verified
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
