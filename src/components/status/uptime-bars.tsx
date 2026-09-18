"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { SERVICE_STATUS_COLOR_VAR, SERVICE_STATUS_LABEL } from "@/components/status/status-meta";
import type { HistoryPoint } from "@/types/status";

export function UptimeBars({ points, rangeDays }: { points: HistoryPoint[]; rangeDays: number }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const visible = points.slice(-rangeDays);

  useEffect(() => {
    if (!rootRef.current) return;
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const bars = rootRef.current.querySelectorAll("[data-uptime-bar]");
    if (reduced) {
      gsap.set(bars, { scaleY: 1 });
      return;
    }
    gsap.fromTo(bars, { scaleY: 0 }, { scaleY: 1, duration: 0.4, stagger: 0.01, ease: "power2.out", transformOrigin: "bottom" });
  }, [rangeDays, points]);

  return (
    <div className="relative">
      <div ref={rootRef} className="flex h-8 items-end gap-px">
        {visible.map((p, i) => (
          // A <div>, not a <button> — this lives inside ServiceHealthRow's
          // own expand/collapse <button>, and nested interactive elements
          // are both invalid HTML and a real accessibility anti-pattern.
          // Hover-only tooltip; the bar's data is also in the row's own
          // expanded detail panel for keyboard/screen-reader users.
          // flex-1 (not a fixed width) so all bars always fit the container
          // statically — no horizontal scrollbar at any range.
          <div
            key={p.date}
            data-uptime-bar
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex((prev) => (prev === i ? null : prev))}
            className="h-full min-w-[1px] flex-1 rounded-full transition-opacity hover:opacity-70"
            style={{ backgroundColor: SERVICE_STATUS_COLOR_VAR[p.status] }}
            title={`${new Date(p.date).toLocaleDateString()}: ${SERVICE_STATUS_LABEL[p.status]}, ${p.uptimePct}% uptime, ${p.latencyMs}ms`}
          />
        ))}
      </div>

      {hoverIndex !== null && visible[hoverIndex] && (
        <div
          role="tooltip"
          className="pointer-events-none absolute bottom-full z-30 mb-2 w-max max-w-[200px] -translate-x-1/2 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2 text-[11px] shadow-xl"
          style={{ left: `${(hoverIndex / Math.max(visible.length - 1, 1)) * 100}%` }}
        >
          <p className="font-bold text-[var(--white)]">{new Date(visible[hoverIndex].date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</p>
          <p className={cn("font-semibold")} style={{ color: SERVICE_STATUS_COLOR_VAR[visible[hoverIndex].status] }}>
            {SERVICE_STATUS_LABEL[visible[hoverIndex].status]}
          </p>
          <p className="text-[var(--text-secondary)]">
            {visible[hoverIndex].uptimePct}% uptime · {visible[hoverIndex].latencyMs}ms
          </p>
        </div>
      )}
    </div>
  );
}
