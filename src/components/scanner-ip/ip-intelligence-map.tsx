"use client";

import { Settings, MapPin, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IpScanState } from "@/components/scanner-ip/types";

export interface MapStatusRow {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: "safe" | "neutral" | "danger" | "unknown";
}

export function IpIntelligenceMap({
  state,
  ip,
  score,
  statusRows,
}: {
  state: IpScanState;
  ip: string;
  score: number | null;
  statusRows: MapStatusRow[];
}) {
  const scanning = state === "scanning";

  const label =
    state === "scanning"
      ? "Analyzing IP"
      : state === "error"
        ? "Scan Failed"
        : state === "complete" || state === "partial"
          ? score !== null && score < 30
            ? "Trusted Network"
            : score !== null && score < 60
              ? "Elevated Risk"
              : "High Risk Network"
          : "Ready to Analyze";

  const labelTone =
    state === "error"
      ? "text-[var(--danger)]"
      : (state === "complete" || state === "partial") && score !== null
        ? score < 30
          ? "text-[var(--safe)]"
          : score < 60
            ? "text-[var(--warning)]"
            : "text-[var(--danger)]"
        : "text-[var(--orange-light)]";

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[var(--border-muted)] bg-[var(--surface-raised)] p-5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">
          <Settings className="h-4 w-4 text-[var(--orange-light)]" /> IP Intelligence
        </span>
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--safe)]">
          <span data-status-dot className="h-1.5 w-1.5 rounded-full bg-[var(--safe)]" /> Engine Online
        </span>
      </div>

      <div data-radar className="relative mx-auto mt-5 aspect-square w-full max-w-[260px]">
        {(["top-left", "top-right", "bottom-left", "bottom-right"] as const).map((corner) => (
          <span
            key={corner}
            aria-hidden
            className={cn(
              "absolute h-4 w-4 border-[var(--orange)]/50",
              corner === "top-left" && "left-0 top-0 border-l-2 border-t-2",
              corner === "top-right" && "right-0 top-0 border-r-2 border-t-2",
              corner === "bottom-left" && "bottom-0 left-0 border-b-2 border-l-2",
              corner === "bottom-right" && "bottom-0 right-0 border-b-2 border-r-2",
            )}
          />
        ))}

        <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
          <defs>
            <radialGradient id="ipRadarGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--orange)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--orange)" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="ipBeamGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--orange)" stopOpacity="0" />
              <stop offset="100%" stopColor="var(--orange-light)" stopOpacity="0.55" />
            </linearGradient>
          </defs>

          <circle cx="100" cy="100" r="95" fill="url(#ipRadarGlow)" />

          {/* dotted world-map texture (stylized, not geographically literal) */}
          <g opacity="0.35" className={scanning ? "radar-rotate-cw-fast" : "radar-rotate-cw"} style={{ transformOrigin: "100px 100px" }}>
            {Array.from({ length: 60 }).map((_, i) => {
              const angle = (i / 60) * Math.PI * 2;
              const r = 30 + ((i * 7) % 55);
              // Rounded to a fixed precision so server- and client-rendered
              // markup match exactly — trig results can differ in the last
              // decimal between Node's and the browser's libm, which trips
              // React's hydration mismatch check on raw float props.
              const cx = Math.round((100 + Math.cos(angle) * r) * 100) / 100;
              const cy = Math.round((100 + Math.sin(angle) * r * 0.65) * 100) / 100;
              return <circle key={i} cx={cx} cy={cy} r="1" fill="var(--orange)" />;
            })}
          </g>

          {/* latitude / longitude curves */}
          <g opacity="0.4">
            <ellipse cx="100" cy="100" rx="88" ry="88" fill="none" stroke="var(--orange)" strokeWidth="1" />
            <ellipse cx="100" cy="100" rx="30" ry="88" fill="none" stroke="var(--orange)" strokeWidth="1" />
            <ellipse cx="100" cy="100" rx="60" ry="88" fill="none" stroke="var(--orange)" strokeWidth="1" />
            <ellipse cx="100" cy="100" rx="88" ry="30" fill="none" stroke="var(--orange)" strokeWidth="1" />
            <ellipse cx="100" cy="100" rx="88" ry="58" fill="none" stroke="var(--orange)" strokeWidth="1" />
          </g>

          <g className={scanning ? "radar-rotate-cw-fast" : "radar-rotate-cw"} style={{ transformOrigin: "100px 100px" }}>
            <circle cx="100" cy="100" r="92" fill="none" stroke="var(--orange)" strokeOpacity="0.35" strokeWidth="1.5" />
          </g>
          <g className={scanning ? "radar-rotate-ccw-fast" : "radar-rotate-ccw"} style={{ transformOrigin: "100px 100px" }}>
            <circle cx="100" cy="100" r="70" fill="none" stroke="var(--orange)" strokeOpacity="0.3" strokeWidth="1.5" strokeDasharray="4 6" />
          </g>

          {/* connected network nodes + approximate location marker */}
          <g opacity="0.5">
            <line x1="40" y1="150" x2="100" y2="100" stroke="var(--orange-light)" strokeWidth="1" className="node-line-pulse" />
            <line x1="168" y1="155" x2="100" y2="100" stroke="var(--orange-light)" strokeWidth="1" className="node-line-pulse" />
          </g>
          {[
            { cx: 168, cy: 72, delay: "0.35s" },
            { cx: 40, cy: 150, delay: "0.7s" },
            { cx: 168, cy: 155, delay: "1.05s" },
          ].map((p, i) => (
            <circle key={i} cx={p.cx} cy={p.cy} r="3.5" fill="var(--orange-light)" className="orbit-pulse" style={{ animationDelay: p.delay }} />
          ))}
          {/* approximate location marker with pulse */}
          <circle cx="60" cy="80" r="4" fill="var(--orange)" className="location-pulse" />
          <circle cx="60" cy="80" r="4" fill="none" stroke="var(--orange)" strokeWidth="1.5" className="location-pulse-ring" />

          <g className={scanning ? "radar-rotate-cw-beam-fast" : "radar-rotate-cw-beam"} style={{ transformOrigin: "100px 100px" }}>
            <path d="M100,100 L100,8 A92,92 0 0,1 165,36 Z" fill="url(#ipBeamGradient)" opacity="0.6" />
          </g>
        </svg>

        <div className="absolute left-1/2 top-1/2 flex w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-full border border-[var(--orange)]/50 bg-[var(--surface)] p-3 text-center shadow-[0_0_28px_-4px_rgba(255,90,0,0.5)]">
          <MapPin className="h-6 w-6 text-[var(--orange-light)]" />
          <span className="max-w-full truncate font-mono text-[10px] font-bold text-[var(--white)]">{ip || "—"}</span>
        </div>
      </div>

      <p data-radar-label className={cn("mt-4 text-center text-sm font-extrabold uppercase tracking-wide", labelTone)}>
        {label}
      </p>

      <div className="mt-5 space-y-2.5 border-t border-[var(--border-muted)] pt-4">
        {statusRows.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-[var(--text-secondary)]">
              <row.icon className="h-3.5 w-3.5 text-[var(--text-muted)]" /> {row.label}
            </span>
            <span
              className={cn(
                "truncate pl-2 text-right font-semibold",
                row.tone === "safe" && "text-[var(--safe)]",
                row.tone === "danger" && "text-[var(--danger)]",
                row.tone === "unknown" && "text-[var(--text-muted)]",
                row.tone === "neutral" && "text-[var(--text-secondary)]",
              )}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-[var(--border-muted)] bg-black/30 px-3 py-2.5 text-[11px] text-[var(--text-muted)]">
        <Shield className="h-3.5 w-3.5 shrink-0 text-[var(--orange-light)]" />
        Location is approximate and based on network data.
      </div>
    </div>
  );
}
