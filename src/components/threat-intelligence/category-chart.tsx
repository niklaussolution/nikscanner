"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Loader2 } from "lucide-react";
import { useThreatStats } from "@/lib/firebase/use-threat-stats";
import { SCAN_CATEGORY_LABEL, type ScanCategory } from "@/lib/scan/categorize";

const CATEGORY_ORDER: ScanCategory[] = ["phishing", "malware", "scam", "botnet", "spam", "other"];
const CATEGORY_COLOR: Record<ScanCategory, string> = {
  phishing: "#ff3d00",
  malware: "#ff5a00",
  scam: "#ff7a00",
  botnet: "#f59e0b",
  spam: "#a3a3a3",
  other: "#3b82f6",
};

/** Flagged scans (URL, file, domain, IP, QR) across all users over the last 30 days, by
 *  threat category — real data from GET /api/stats/threats. */
export function CategoryChart() {
  const { data, error } = useThreatStats();

  if (error) return <ChartMessage>Stats are unavailable right now. Please try again later.</ChartMessage>;
  if (!data) {
    return (
      <ChartMessage>
        <Loader2 className="h-4 w-4 animate-spin" /> Loading...
      </ChartMessage>
    );
  }

  const counts = new Map(data.categories.map((c) => [c.category, c.count]));
  const rows = CATEGORY_ORDER.map((c) => ({ key: c, label: SCAN_CATEGORY_LABEL[c], value: counts.get(c) ?? 0 }));
  const total = rows.reduce((sum, r) => sum + r.value, 0);
  if (total === 0) return <ChartMessage>No threats flagged in the last {data.category_window_days} days.</ChartMessage>;

  const slices = rows.filter((r) => r.value > 0);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={slices} dataKey="value" nameKey="label" innerRadius={55} outerRadius={85} paddingAngle={slices.length > 1 ? 2 : 0}>
            {slices.map((r) => (
              <Cell key={r.key} fill={CATEGORY_COLOR[r.key]} stroke="#101010" />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value} (${Math.round((Number(value) / total) * 100)}%)`, "Scans"]}
            contentStyle={{ background: "#151515", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12 }}
            itemStyle={{ color: "#F5F5F5" }}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: "#A3A3A3" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ChartMessage({ children }: { children: React.ReactNode }) {
  return <div className="flex h-64 w-full items-center justify-center gap-2 text-center text-sm text-muted">{children}</div>;
}
