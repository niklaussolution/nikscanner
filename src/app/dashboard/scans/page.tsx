"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { RiskBadge } from "@/components/scanner/risk-badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/firebase/auth-context";
import { authedJson } from "@/lib/firebase/api";
import type { ScanHistoryEntry, ScanHistoryResult } from "@/lib/firebase/nikscanner-types";
import { cn } from "@/lib/utils";

const FILTERS = ["All", "url", "file", "domain", "ip", "qr"] as const;
const FILTER_LABEL: Record<(typeof FILTERS)[number], string> = {
  All: "All",
  url: "URL",
  file: "File",
  domain: "Domain",
  ip: "IP",
  qr: "QR",
};

export default function ScanHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [scans, setScans] = useState<ScanHistoryEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;

    authedJson<ScanHistoryResult>("/api/scan/history?limit=200")
      .then((res) => {
        if (!cancelled) setScans(res.scans);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load scan history.");
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  const filtered = scans?.filter((s) => filter === "All" || s.target_type === filter) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">Scan History</h1>
        <p className="mt-1 text-sm text-muted">
          Scans you&apos;ve run on the website, across URL, file, domain, IP and QR targets.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors",
              filter === f ? "bg-flame-primary text-white" : "border border-white/10 text-muted hover:text-white",
            )}
          >
            {FILTER_LABEL[f]}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Card>
        <CardContent className="p-0">
          {!scans ? (
            <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading scan history...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted">
              {scans.length === 0
                ? "No scans yet — scans you run on the website will show up here."
                : "No scans match this filter."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border-subtle text-xs uppercase tracking-wider text-muted">
                    <th className="px-5 py-3 font-medium">Target</th>
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 font-medium">Risk</th>
                    <th className="px-5 py-3 font-medium">Score</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((scan) => (
                    <tr key={scan.id} className="border-b border-border-subtle last:border-0">
                      <td className="max-w-[220px] truncate px-5 py-3 font-mono text-soft-white">{scan.target}</td>
                      <td className="px-5 py-3 text-muted">{FILTER_LABEL[scan.target_type]}</td>
                      <td className="px-5 py-3">
                        <RiskBadge level={scan.threat_level} />
                      </td>
                      <td className="px-5 py-3 text-white">{scan.score}</td>
                      <td className="px-5 py-3 text-muted">{new Date(scan.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
