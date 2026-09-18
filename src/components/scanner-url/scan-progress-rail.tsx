"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { STAGES, type ScanState } from "@/components/scanner-url/types";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Columns are forced to equal width (flex-1) instead of sizing to each
// label's text, so every dot's center sits at a fixed, predictable fraction
// of the row — immune to label-width differences, font swaps, and any
// ancestor transform (a getBoundingClientRect-based measurement drifts
// whenever an ancestor is mid-GSAP-scale, since transforms repaint without
// firing ResizeObserver). With N equal columns, dot i's center is at
// ((i + 0.5) / N) * 100%, so the connecting line can start/end exactly on
// the first and last dot using pure CSS percentages.

export function ScanProgressRail({
  state,
  activeIndex,
  stages = STAGES,
  skippedIndices,
}: {
  state: ScanState;
  activeIndex: number;
  stages?: readonly string[];
  /** Stages that were intentionally not run (e.g. reputation checks skipped for a non-URL payload) — shown distinctly from "done", never implying they were verified. */
  skippedIndices?: number[];
}) {
  const lineRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const prevCompletedThrough = useRef(0);

  const columnPct = 100 / stages.length;
  const firstCenterPct = columnPct / 2;
  const trackSpanPct = 100 - columnPct;

  const completedThrough = state === "complete" ? stages.length - 1 : activeIndex;

  useEffect(() => {
    if (!lineRef.current) return;
    const pct = stages.length > 1 ? completedThrough / (stages.length - 1) : 0;
    const widthPct = trackSpanPct * pct;
    if (prefersReducedMotion()) {
      gsap.set(lineRef.current, { width: `${widthPct}%` });
    } else {
      gsap.to(lineRef.current, { width: `${widthPct}%`, duration: 0.5, ease: "power2.out" });
    }
  }, [completedThrough, stages.length, trackSpanPct]);

  useEffect(() => {
    if (prefersReducedMotion()) {
      prevCompletedThrough.current = completedThrough;
      return;
    }
    // Pop each node that just became "done" (or the whole rail, on reset-to-idle).
    const from = state === "idle" ? -1 : prevCompletedThrough.current;
    for (let i = from; i <= completedThrough; i++) {
      const el = nodeRefs.current[i];
      if (!el) continue;
      gsap.fromTo(el, { scale: 0.6 }, { scale: 1, duration: 0.45, ease: "back.out(2.5)" });
    }
    prevCompletedThrough.current = completedThrough;
  }, [completedThrough, state]);

  return (
    <div className="mt-6">
      <div className="relative flex items-center">
        <div
          className="absolute top-1/2 h-px -translate-y-1/2 bg-[var(--border-muted)]"
          style={{ left: `${firstCenterPct}%`, width: `${trackSpanPct}%` }}
        />
        <div
          ref={lineRef}
          className="absolute top-1/2 h-px -translate-y-1/2 bg-[var(--orange)]"
          style={{ left: `${firstCenterPct}%`, width: 0 }}
        />

        {stages.map((stage, i) => {
          const skipped = skippedIndices?.includes(i) ?? false;
          const done = !skipped && (i < completedThrough || state === "complete");
          const active = !skipped && i === completedThrough && state !== "complete";
          return (
            <div key={stage} className="relative z-10 flex min-w-0 flex-1 flex-col items-center gap-2.5">
              <span
                ref={(el) => {
                  nodeRefs.current[i] = el;
                }}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors duration-300",
                  skipped
                    ? "border-dashed border-[var(--border)] bg-[var(--background)] text-[var(--text-muted)]"
                    : done
                      ? "border-[var(--orange)] bg-[var(--orange)] text-white"
                      : active
                        ? "border-[var(--orange)] bg-[var(--background)] text-[var(--orange)] scan-node-pulse"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--text-muted)]",
                )}
              >
                {skipped ? (
                  <Minus className="h-3.5 w-3.5" strokeWidth={3} />
                ) : done ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-current" />
                )}
              </span>
              <span
                className={cn(
                  "max-w-full px-0.5 text-center text-[8px] font-bold uppercase leading-tight break-words sm:text-[10px] sm:tracking-wide",
                  skipped ? "text-[var(--text-muted)]" : done || active ? "text-[var(--orange-light)]" : "text-[var(--text-muted)]",
                )}
              >
                {stage}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
