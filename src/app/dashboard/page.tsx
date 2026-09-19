"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ScanLine, ShieldAlert, Ban, Trophy, Loader2, CreditCard } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { ThreatTrendChart } from "@/components/dashboard/threat-trend-chart";
import { RiskBadge } from "@/components/scanner/risk-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/firebase/auth-context";
import { authedJson } from "@/lib/firebase/api";
import type {
  ScanHistoryEntry,
  ScanHistoryResult,
  CreditsBalanceResult,
  RankResult,
  PointsResult,
  UserBlocklistResult,
} from "@/lib/firebase/nikscanner-types";

const THREAT_SEVERITY_LEVELS = new Set(["SUSPICIOUS", "HIGH_RISK", "MALICIOUS"]);

interface OverviewData {
  balance: CreditsBalanceResult;
  points: PointsResult;
  rank: RankResult;
  blocklist: UserBlocklistResult;
  totalScans: number;
  threatsCount: number;
  recentScans: ScanHistoryEntry[];
}

export default function DashboardOverviewPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<OverviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;

    (async () => {
      try {
        const [balance, points, rank, blocklist, historyRes] = await Promise.all([
          authedJson<CreditsBalanceResult>("/api/credits/balance"),
          authedJson<PointsResult>("/api/points"),
          authedJson<RankResult>("/api/leaderboard/me"),
          authedJson<UserBlocklistResult>("/api/user/blocklist"),
          authedJson<ScanHistoryResult>("/api/scan/history?limit=200"),
        ]);
        if (cancelled) return;
        const allScans = historyRes.scans;
        setData({
          balance,
          points,
          rank,
          blocklist,
          totalScans: allScans.length,
          threatsCount: allScans.filter((s) => THREAT_SEVERITY_LEVELS.has(s.threat_level)).length,
          recentScans: allScans.slice(0, 5),
        });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load dashboard data.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">Overview</h1>
        <p className="mt-1 text-sm text-muted">
          Welcome back{user?.displayName ? `, ${user.displayName}` : ""} — here&apos;s your security summary.
        </p>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {!data ? (
        <div className="flex items-center gap-2 py-12 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading your data...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={ScanLine} label="Total Scans" value={String(data.totalScans)} />
            {/* <StatCard icon={ShieldAlert} label="Threats Found" value={String(data.threatsCount)} /> */}
            <StatCard icon={Ban} label="URLs Blocked" value={String(data.blocklist.count)} />
            <StatCard
              icon={Trophy}
              label="Community Points"
              value={String(data.points.points)}
              trend={data.rank.rank ? `Rank #${data.rank.rank}` : "Unranked"}
              trendUp
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Scan Activity (7 days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ThreatTrendChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Protection Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { icon: CreditCard, label: "Current Plan", value: data.balance.plan_label },
                  {
                    icon: ScanLine,
                    label: "Credits Remaining",
                    value: data.balance.pro_unlimited_url ? "Unlimited" : String(data.balance.credits),
                  },
                  { icon: Trophy, label: "Global Rank", value: data.rank.rank ? `#${data.rank.rank}` : "Unranked" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between rounded-lg border border-border-subtle bg-card-elevated px-3 py-2.5">
                    <span className="flex items-center gap-2 text-sm text-muted">
                      <row.icon className="h-4 w-4 text-flame-bright" /> {row.label}
                    </span>
                    <span className="text-sm font-semibold text-white">{row.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Scans</CardTitle>
              <Link href="/dashboard/scans" className="text-xs font-semibold text-flame-bright hover:text-flame-primary">
                View all
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {data.recentScans.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-muted">
                  No scans yet — scans you run on the website will show up here.
                </p>
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
                      {data.recentScans.map((scan) => (
                        <tr key={scan.id} className="border-b border-border-subtle last:border-0">
                          <td className="max-w-[220px] truncate px-5 py-3 font-mono text-soft-white">{scan.target}</td>
                          <td className="px-5 py-3 text-muted">{scan.target_type}</td>
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
        </>
      )}
    </div>
  );
}
