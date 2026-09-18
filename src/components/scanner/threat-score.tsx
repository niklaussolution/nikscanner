"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import type { ThreatLevel } from "@/types/scan";

const RING_COLOR: Record<ThreatLevel, string> = {
  SAFE: "#22c55e",
  LOW_RISK: "#3b82f6",
  SUSPICIOUS: "#f59e0b",
  HIGH_RISK: "#ff5a00",
  MALICIOUS: "#ef4444",
};

export function ThreatScore({ score, level }: { score: number; level: ThreatLevel }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const color = RING_COLOR[level];
  const circumference = 2 * Math.PI * 54;

  useEffect(() => {
    const controls = animate(count, score, { duration: 1.1, ease: "easeOut" });
    return controls.stop;
  }, [score, count]);

  return (
    <div className="relative h-40 w-40 shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
        <motion.circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (score / 100) * circumference }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="font-heading text-3xl font-bold text-white">{rounded}</motion.span>
        <span className="text-[10px] uppercase tracking-widest text-muted">/ 100</span>
      </div>
    </div>
  );
}
