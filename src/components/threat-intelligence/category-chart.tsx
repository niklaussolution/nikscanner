"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { TRENDING_THREATS } from "@/lib/data/threat-feed";

const COLORS = ["#ff3d00", "#ff5a00", "#ff7a00", "#f59e0b", "#a3a3a3", "#3b82f6"];

export function CategoryChart() {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={TRENDING_THREATS} dataKey="value" nameKey="label" innerRadius={55} outerRadius={85} paddingAngle={2}>
            {TRENDING_THREATS.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#101010" />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: "#151515", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#A3A3A3" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
