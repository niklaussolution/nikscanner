"use client";

import { useState } from "react";
import { RiskBadge } from "@/components/scanner/risk-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_RECENT_SCANS } from "@/lib/data/mock-scans";
import { cn } from "@/lib/utils";

const FILTERS = ["All", "URL", "File", "Domain", "IP"] as const;

export default function ScanHistoryPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const scans = MOCK_RECENT_SCANS.filter((s) => filter === "All" || s.type === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Scan History</h1>
          <p className="mt-1 text-sm text-muted">All scans across URL, file, domain and IP targets.</p>
        </div>
        <Badge variant="neutral">Demo Data</Badge>
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
            {f}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {scans.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted">No scans match this filter yet.</div>
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
                    <th className="px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {scans.map((scan) => (
                    <tr key={scan.id} className="border-b border-border-subtle last:border-0">
                      <td className="max-w-[220px] truncate px-5 py-3 font-mono text-soft-white">{scan.target}</td>
                      <td className="px-5 py-3 text-muted">{scan.type}</td>
                      <td className="px-5 py-3">
                        <RiskBadge level={scan.threatLevel} />
                      </td>
                      <td className="px-5 py-3 text-white">{scan.score}</td>
                      <td className="px-5 py-3 text-muted">{scan.date}</td>
                      <td className="px-5 py-3">
                        <button className="text-xs font-semibold text-flame-bright hover:text-flame-primary">View Details</button>
                      </td>
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
