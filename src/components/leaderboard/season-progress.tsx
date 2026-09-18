"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Target } from "lucide-react";

const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function SeasonProgress({ verified, target }: { verified: number; target: number }) {
  const circleRef = useRef<SVGCircleElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [displayPct, setDisplayPct] = useState(0);

  const rawPct = target > 0 ? (verified / target) * 100 : 0;
  const clampedPct = Math.max(0, Math.min(100, rawPct));

  useEffect(() => {
    if (!circleRef.current) return;
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const offset = CIRCUMFERENCE * (1 - clampedPct / 100);
    const duration = reduced ? 0 : 1.1;

    gsap.fromTo(circleRef.current, { strokeDashoffset: CIRCUMFERENCE }, { strokeDashoffset: offset, duration, ease: "power2.out" });
    if (barRef.current) gsap.fromTo(barRef.current, { width: "0%" }, { width: `${clampedPct}%`, duration, ease: "power2.out" });

    const counter = { value: 0 };
    const tween = gsap.to(counter, { value: clampedPct, duration, ease: "power2.out", onUpdate: () => setDisplayPct(counter.value) });
    return () => {
      tween.kill();
    };
  }, [clampedPct]);

  return (
    <div data-season-progress className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">
          <Target className="h-4 w-4 text-[var(--orange-light)]" /> Season Progress
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">Community goal</span>
      </div>

      <div className="mt-5 flex items-center gap-5">
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
          <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
            <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="var(--border-muted)" strokeWidth="8" />
            <circle
              ref={circleRef}
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              stroke="var(--orange)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE}
            />
          </svg>
          <span className="absolute text-xl font-extrabold text-[var(--white)]">{Math.round(displayPct)}%</span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xl font-extrabold text-[var(--white)]">{verified.toLocaleString()}</p>
          <p className="text-xs text-[var(--text-secondary)]">verified reports</p>
          <p className="mt-2 text-xs text-[var(--text-muted)]">{target.toLocaleString()} target</p>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--border-muted)]">
        <div ref={barRef} className="h-full rounded-full bg-[var(--orange)]" style={{ width: 0 }} />
      </div>
    </div>
  );
}
