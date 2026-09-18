"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { Zap } from "lucide-react";
import type { ResponseTimePoint } from "@/types/status";

const WIDTH = 600;
const HEIGHT = 220;
const PAD_LEFT = 36;
const PAD_BOTTOM = 24;
const PAD_TOP = 10;
const MAX_MS = 200;

export function ResponseTimeChart({ points, currentMs, demo }: { points: ResponseTimePoint[]; currentMs: number; demo: boolean }) {
  const pathRef = useRef<SVGPathElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const plotW = WIDTH - PAD_LEFT;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const coords = useMemo(
    () =>
      points.map((p, i) => ({
        x: PAD_LEFT + (i / Math.max(points.length - 1, 1)) * plotW,
        y: PAD_TOP + plotH - (Math.min(p.ms, MAX_MS) / MAX_MS) * plotH,
        p,
      })),
    [points, plotW, plotH],
  );

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const areaPath = coords.length ? `${linePath} L${coords[coords.length - 1].x},${PAD_TOP + plotH} L${PAD_LEFT},${PAD_TOP + plotH} Z` : "";

  useEffect(() => {
    if (!pathRef.current || coords.length === 0) return;
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const length = pathRef.current.getTotalLength();
    if (reduced) {
      gsap.set(pathRef.current, { strokeDasharray: length, strokeDashoffset: 0 });
      return;
    }
    gsap.fromTo(
      pathRef.current,
      { strokeDasharray: length, strokeDashoffset: length },
      { strokeDashoffset: 0, duration: 1.2, ease: "power2.out" },
    );
  }, [linePath, coords.length]);

  const gridY = [0, 100, 200];
  const timeLabels = ["00:00", "06:00", "12:00", "18:00", "Now"];

  return (
    <div data-response-chart className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">
          <Zap className="h-4 w-4 text-[var(--orange-light)]" /> Response Time — Last 24 Hours
        </span>
        <span className="flex items-center gap-1.5 rounded-md border border-[var(--orange)]/40 bg-[var(--orange)]/10 px-2.5 py-1 text-xs font-bold text-[var(--orange-light)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--orange)]" /> {currentMs} ms
        </span>
      </div>

      <div className="relative mt-4">
        {coords.length === 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center text-xs text-[var(--text-muted)]">Loading chart…</div>
        )}
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Response time over the last 24 hours">
          <defs>
            <linearGradient id="responseAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--orange)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--orange)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {gridY.map((v) => {
            const y = PAD_TOP + plotH - (v / MAX_MS) * plotH;
            return (
              <g key={v}>
                <line x1={PAD_LEFT} y1={y} x2={WIDTH} y2={y} stroke="var(--border-muted)" strokeWidth="1" />
                <text x={0} y={y + 4} fontSize="10" fill="var(--text-muted)">
                  {v} ms
                </text>
              </g>
            );
          })}

          <path d={areaPath} fill="url(#responseAreaGradient)" stroke="none" />
          <path ref={pathRef} d={linePath} fill="none" stroke="var(--orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {hover !== null && coords[hover] && (
            <g>
              <line x1={coords[hover].x} y1={PAD_TOP} x2={coords[hover].x} y2={PAD_TOP + plotH} stroke="var(--orange)" strokeOpacity="0.4" strokeDasharray="3 3" />
              <circle cx={coords[hover].x} cy={coords[hover].y} r="4" fill="var(--orange-light)" stroke="var(--surface)" strokeWidth="2" />
            </g>
          )}

          {/* invisible hover targets */}
          {coords.map((c, i) => (
            <rect
              key={i}
              x={c.x - plotW / points.length / 2}
              y={PAD_TOP}
              width={plotW / points.length}
              height={plotH}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover((prev) => (prev === i ? null : prev))}
              onFocus={() => setHover(i)}
            />
          ))}

          {timeLabels.map((label, i) => (
            <text key={label} x={PAD_LEFT + (i / (timeLabels.length - 1)) * plotW} y={HEIGHT - 4} fontSize="10" fill="var(--text-muted)" textAnchor={i === 0 ? "start" : i === timeLabels.length - 1 ? "end" : "middle"}>
              {label}
            </text>
          ))}
        </svg>

        {hover !== null && coords[hover] && (
          <div
            role="tooltip"
            className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-full rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2 text-[11px] shadow-xl"
            style={{ left: `${(coords[hover].x / WIDTH) * 100}%`, top: `${(coords[hover].y / HEIGHT) * 100}%` }}
          >
            <p className="font-bold text-[var(--white)]">{new Date(coords[hover].p.t).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</p>
            <p className="text-[var(--orange-light)]">{coords[hover].p.ms} ms</p>
          </div>
        )}
      </div>

      {demo && <p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">Demo trend data — current value above is live.</p>}
    </div>
  );
}
