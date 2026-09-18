"use client";

import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { DETECTION_TIMELINE } from "@/lib/data/threat-feed";

export function TimelineChart() {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={DETECTION_TIMELINE} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="day" stroke="#A3A3A3" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#A3A3A3" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ background: "#151515", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12 }} />
          <Bar dataKey="detections" fill="#ff5a00" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
