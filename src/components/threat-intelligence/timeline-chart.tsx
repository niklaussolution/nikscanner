"use client";

import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { Loader2 } from "lucide-react";
import { useThreatStats } from "@/lib/firebase/use-threat-stats";
import { ChartMessage } from "@/components/threat-intelligence/category-chart";

const SERIES = [
  { key: "url", label: "URL", color: "#ff5a00" },
  { key: "file", label: "File", color: "#ff8a3d" },
  { key: "domain", label: "Domain", color: "#ffb37a" },
  { key: "ip", label: "IP", color: "#a3a3a3" },
  { key: "qr", label: "QR", color: "#3b82f6" },
] as const;

/** "Mon" etc. for a YYYY-MM-DD UTC day — the backend buckets days in UTC. */
function weekday(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString(undefined, { weekday: "short", timeZone: "UTC" });
}

/** Scans per day (any verdict) across all users for the last 7 days, stacked by scan type —
 *  real data from GET /api/stats/threats. */
export function TimelineChart() {
  const { data, error } = useThreatStats();

  if (error) return <ChartMessage>Stats are unavailable right now. Please try again later.</ChartMessage>;
  if (!data) {
    return (
      <ChartMessage>
        <Loader2 className="h-4 w-4 animate-spin" /> Loading...
      </ChartMessage>
    );
  }

  const rows = data.timeline.map((d) => ({ ...d, day: weekday(d.date) }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="day" stroke="#A3A3A3" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#A3A3A3" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            labelFormatter={(_, payload) => {
              const d = payload?.[0]?.payload as (typeof rows)[number] | undefined;
              return d ? `${d.day} ${d.date} · ${d.total} scans` : "";
            }}
            contentStyle={{ background: "#151515", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: "#A3A3A3" }} />
          {SERIES.map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              stackId="scans"
              fill={s.color}
              radius={i === SERIES.length - 1 ? [4, 4, 0, 0] : 0}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
