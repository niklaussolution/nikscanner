"use client";

import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { THREAT_SEVERITY_LEVELS } from "@/types/scan";
import type { ScanHistoryEntry } from "@/lib/firebase/nikscanner-types";

const DAY_LABEL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_MS = 24 * 60 * 60 * 1000;

interface DayBucket {
  day: string;
  scans: number;
  threats: number;
}

/** Buckets this user's real scan history (already fetched for the rest of the dashboard) into
 *  the last 7 calendar days — today plus the six before it, oldest first — rather than
 *  fabricating a trend. A user with no scans in a given day just gets a 0, not seeded data. */
function bucketLast7Days(scans: ScanHistoryEntry[]): DayBucket[] {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const buckets: DayBucket[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = todayStart - i * DAY_MS;
    buckets.push({ day: DAY_LABEL[new Date(dayStart).getDay()], scans: 0, threats: 0 });
  }

  for (const scan of scans) {
    const offset = Math.floor((todayStart - new Date(scan.created_at).setHours(0, 0, 0, 0)) / DAY_MS);
    if (offset < 0 || offset > 6) continue;
    const bucket = buckets[6 - offset];
    bucket.scans += 1;
    if (THREAT_SEVERITY_LEVELS.has(scan.threat_level)) bucket.threats += 1;
  }

  return buckets;
}

export function ThreatTrendChart({ scans }: { scans: ScanHistoryEntry[] }) {
  const data = bucketLast7Days(scans);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="scansGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff7a00" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#ff7a00" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="threatsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="day" stroke="#A3A3A3" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#A3A3A3" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: "#151515", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#fff" }}
          />
          <Area type="monotone" dataKey="scans" name="Scans" stroke="#ff7a00" fill="url(#scansGradient)" strokeWidth={2} />
          <Area type="monotone" dataKey="threats" name="Threats" stroke="#ef4444" fill="url(#threatsGradient)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
