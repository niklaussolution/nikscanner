"use client";

import { useEffect, useState } from "react";
import { publicJson } from "@/lib/firebase/api";
import { formatRelativeTime } from "@/lib/format-time";
import { THREAT_LEVEL_LABEL, type ThreatLevel } from "@/types/scan";
import { Badge } from "@/components/ui/badge";

interface RecentScan {
  target: string;
  threat_level: ThreatLevel;
  score: number;
  created_at: number;
}

const LEVEL_VARIANT: Record<ThreatLevel, "danger" | "warning" | "info"> = {
  MALICIOUS: "danger",
  HIGH_RISK: "danger",
  SUSPICIOUS: "warning",
  LOW_RISK: "info",
  SAFE: "info",
};

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

/** Real, recent flagged URL scans across every user (GET /api/scan/recent) — the backend only
 *  ever hands out Suspicious/High Risk/Malicious results here, the same restriction the public
 *  community blocklist applies, so a user's benign or private scans are never exposed. */
export function LiveFeedTable() {
  const [scans, setScans] = useState<RecentScan[] | null>(null);

  useEffect(() => {
    publicJson<{ scans: RecentScan[] }>("/api/scan/recent?limit=10&type=url")
      .then((res) => setScans(res.scans))
      .catch(() => setScans([]));
  }, []);

  return (
    <div className="scrollbar-hidden overflow-x-auto overflow-y-auto rounded-xl border border-border-subtle bg-card-bg">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border-subtle text-xs uppercase tracking-wider text-muted">
            <th className="px-5 py-3 font-medium">Time</th>
            <th className="px-5 py-3 font-medium">Type</th>
            <th className="px-5 py-3 font-medium">Indicator</th>
            <th className="px-5 py-3 font-medium">Risk</th>
          </tr>
        </thead>
        <tbody>
          {!scans ? (
            <tr>
              <td colSpan={4} className="px-5 py-8 text-center text-sm text-muted">
                Loading live feed...
              </td>
            </tr>
          ) : scans.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-5 py-8 text-center text-sm text-muted">
                No flagged scans yet.
              </td>
            </tr>
          ) : (
            scans.map((item, i) => (
              <tr key={i} className="border-b border-border-subtle font-mono last:border-0 hover:bg-white/[0.02]">
                <td className="whitespace-nowrap px-5 py-3 text-muted">{formatRelativeTime(item.created_at)}</td>
                <td className="px-5 py-3">
                  <Badge variant={LEVEL_VARIANT[item.threat_level]}>{THREAT_LEVEL_LABEL[item.threat_level]}</Badge>
                </td>
                <td className="max-w-[220px] truncate px-5 py-3 text-soft-white">{hostnameOf(item.target)}</td>
                <td
                  className={
                    "px-5 py-3 font-semibold " +
                    (item.score >= 80 ? "text-danger" : item.score >= 50 ? "text-warning" : "text-success")
                  }
                >
                  {item.score}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
