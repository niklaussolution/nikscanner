"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { publicJson } from "@/lib/firebase/api";
import { formatRelativeTime } from "@/lib/format-time";
import { THREAT_LEVEL_LABEL, type ThreatLevel } from "@/types/scan";

interface RecentScan {
  target: string;
  threat_level: ThreatLevel;
  score: number;
  created_at: number;
}

interface Event {
  time: string;
  label: string;
  target: string;
  tone: "danger" | "warning";
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

const TONE_DOT = {
  danger: "bg-danger",
  warning: "bg-flame-primary",
} as const;

const ROTATE_INTERVAL_MS = 3500;

/** Real, recent URL scans across every user (GET /api/scan/recent) — restricted server-side to
 *  Suspicious/High Risk/Malicious results only, so this never surfaces a benign or private URL
 *  someone happened to check, same principle as the public community blocklist. Shown one at a
 *  time, rotating on an interval, rather than all at once. */
export function LiveActivityTicker() {
  const [events, setEvents] = useState<Event[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    publicJson<{ scans: RecentScan[] }>("/api/scan/recent?limit=3&type=url")
      .then((res) => {
        setEvents(
          res.scans.map((s) => ({
            time: formatRelativeTime(s.created_at),
            label: `${THREAT_LEVEL_LABEL[s.threat_level].toUpperCase()} URL DETECTED`,
            target: hostnameOf(s.target),
            tone: s.threat_level === "MALICIOUS" ? "danger" : "warning",
          })),
        );
      })
      .catch(() => {
        // Non-fatal — the ticker just shows nothing until this succeeds.
      });
  }, []);

  useEffect(() => {
    if (events.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % events.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [events.length]);

  const current = events[index % events.length] ?? null;

  return (
    <div className="rounded-xl border border-border-subtle bg-card-bg/80 px-5 py-3.5 backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <span className="flex shrink-0 items-center gap-2 text-xs font-bold uppercase tracking-wide text-white">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse-glow" /> Live Activity
        </span>
        <Link
          href="/threat-intelligence"
          className="flex shrink-0 items-center gap-1 text-xs font-semibold text-flame-bright hover:text-flame-primary"
        >
          View All <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="relative mt-2.5 h-5 overflow-hidden">
        {!current ? (
          <p className="text-xs text-muted">No flagged URLs in the community feed yet.</p>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="absolute inset-0 flex items-center gap-2 text-xs"
            >
              <span className="shrink-0 font-mono text-muted">{current.time}</span>
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${TONE_DOT[current.tone]}`} />
              <span className="shrink-0 font-semibold text-soft-white">{current.label}</span>
              <span className="truncate font-mono text-muted">{current.target}</span>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
