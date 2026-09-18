"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function riskColorVar(score: number): string {
  if (score < 30) return "var(--safe)";
  if (score < 60) return "var(--warning)";
  return "var(--danger)";
}

export interface ResultSummaryData {
  target: string;
  score: number;
  verdict: string;
  verdictTone: "safe" | "warning" | "danger";
  flaggedCount: number;
  totalEngines: number;
  confidence: number;
  unit: string;
}

const TONE_CLASSES: Record<ResultSummaryData["verdictTone"], string> = {
  safe: "border-[var(--safe)]/40 bg-[var(--safe)]/10 text-[var(--safe)]",
  warning: "border-[var(--warning)]/40 bg-[var(--warning)]/10 text-[var(--warning)]",
  danger: "border-[var(--danger)]/40 bg-[var(--danger)]/10 text-[var(--danger)]",
};

export function ResultSummary({
  data,
  emptyLabel,
  actions,
}: {
  data: ResultSummaryData | null;
  emptyLabel: string;
  actions?: ReactNode;
}) {
  const circleRef = useRef<SVGCircleElement>(null);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (!data || !circleRef.current) return;
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = Math.max(0, Math.min(100, data.score));
    const offset = CIRCUMFERENCE * (1 - target / 100);

    const duration = reduced ? 0 : 1.1;
    gsap.fromTo(circleRef.current, { strokeDashoffset: CIRCUMFERENCE }, { strokeDashoffset: offset, duration, ease: "power2.out" });
    const counter = { value: 0 };
    gsap.to(counter, {
      value: target,
      duration,
      ease: "power2.out",
      onUpdate: () => setDisplayScore(Math.round(counter.value)),
    });
  }, [data]);

  if (!data) {
    return (
      <div className="mt-6 rounded-xl border border-[var(--border-muted)] bg-[var(--surface-soft)] p-5 text-center text-sm text-[var(--text-muted)]">
        {emptyLabel}
      </div>
    );
  }

  const color = riskColorVar(data.score);

  return (
    <div
      data-result-summary
      className="mt-6 flex flex-col items-center gap-5 rounded-xl border border-[var(--border-muted)] bg-[var(--surface-soft)] p-5 sm:flex-row sm:items-center"
    >
      <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
        <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
          <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="var(--border-muted)" strokeWidth="7" />
          <circle
            ref={circleRef}
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-2xl font-extrabold text-[var(--white)]">{displayScore}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">/ 100</span>
        </div>
      </div>

      <div className="min-w-0 flex-1 text-center sm:text-left">
        <span
          className={cn(
            "inline-block rounded-md border px-2.5 py-1 text-xs font-bold uppercase tracking-wide",
            TONE_CLASSES[data.verdictTone],
          )}
        >
          {data.verdict}
        </span>
        <p className="mt-2 truncate font-mono text-lg font-bold text-[var(--white)]">{data.target}</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {data.flaggedCount} / {data.totalEngines} sources flagged this {data.unit}
        </p>
        <p className="text-sm text-[var(--text-secondary)]">{data.confidence}% confidence</p>
      </div>

      {actions && <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 sm:justify-end">{actions}</div>}
    </div>
  );
}
