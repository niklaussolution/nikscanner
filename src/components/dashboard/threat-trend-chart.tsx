"use client";

import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const DATA = [
  { day: "Mon", scans: 42, threats: 6 },
  { day: "Tue", scans: 58, threats: 9 },
  { day: "Wed", scans: 51, threats: 5 },
  { day: "Thu", scans: 73, threats: 12 },
  { day: "Fri", scans: 66, threats: 8 },
  { day: "Sat", scans: 39, threats: 4 },
  { day: "Sun", scans: 47, threats: 7 },
];

export function ThreatTrendChart() {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
          <YAxis stroke="#A3A3A3" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: "#151515", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#fff" }}
          />
          <Area type="monotone" dataKey="scans" stroke="#ff7a00" fill="url(#scansGradient)" strokeWidth={2} />
          <Area type="monotone" dataKey="threats" stroke="#ef4444" fill="url(#threatsGradient)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
