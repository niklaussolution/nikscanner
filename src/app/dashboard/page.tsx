import Link from "next/link";
import { ScanLine, ShieldAlert, Ban, Trophy, Globe, Laptop } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { ThreatTrendChart } from "@/components/dashboard/threat-trend-chart";
import { RiskBadge } from "@/components/scanner/risk-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_RECENT_SCANS } from "@/lib/data/mock-scans";

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Overview</h1>
          <p className="mt-1 text-sm text-muted">Welcome back — here&apos;s your security summary.</p>
        </div>
        <Badge variant="neutral">Demo Data</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={ScanLine} label="Total Scans" value="1,248" trend="+12.4%" trendUp />
        <StatCard icon={ShieldAlert} label="Threats Found" value="86" trend="+3.1%" trendUp={false} />
        <StatCard icon={Ban} label="URLs Blocked" value="42" trend="+8.0%" trendUp />
        <StatCard icon={Trophy} label="Community Points" value="2,310" trend="Rank #148" trendUp />
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
              { icon: Globe, label: "API Usage", value: "1,024 / 10,000" },
              { icon: Laptop, label: "Devices Protected", value: "3" },
              { icon: Trophy, label: "Global Rank", value: "#148" },
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
                {MOCK_RECENT_SCANS.map((scan) => (
                  <tr key={scan.id} className="border-b border-border-subtle last:border-0">
                    <td className="max-w-[220px] truncate px-5 py-3 font-mono text-soft-white">{scan.target}</td>
                    <td className="px-5 py-3 text-muted">{scan.type}</td>
                    <td className="px-5 py-3">
                      <RiskBadge level={scan.threatLevel} />
                    </td>
                    <td className="px-5 py-3 text-white">{scan.score}</td>
                    <td className="px-5 py-3 text-muted">{scan.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
