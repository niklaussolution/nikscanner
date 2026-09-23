"use client";

import { Settings, Shield, Link as LinkIcon, Database, Package, Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScanState } from "@/components/scanner-url/types";

export interface RadarStatusRow {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: "safe" | "neutral" | "danger";
}

const DEFAULT_STATUS_ROWS: RadarStatusRow[] = [
  { icon: Database, label: "Threat databases", value: "Connected", tone: "safe" },
  { icon: Package, label: "Sandbox", value: "Standby", tone: "neutral" },
  { icon: Lock, label: "Privacy", value: "No logs", tone: "safe" },
];

export function ScanEngineRadar({
  state,
  title = "Scan Engine",
  centerIcon: CenterIcon = LinkIcon,
  scanningLabel,
  statusRows = DEFAULT_STATUS_ROWS,
  footerText = "Your submission is encrypted in transit.",
}: {
  state: ScanState;
  title?: string;
  centerIcon?: LucideIcon;
  scanningLabel?: string;
  statusRows?: RadarStatusRow[];
  footerText?: string;
}) {
  const scanning = state === "scanning";
  const radarLabel =
    state === "scanning"
      ? (scanningLabel ?? "Analyzing")
      : state === "complete"
        ? "Analysis Complete"
        : state === "error"
          ? "Scan Failed"
          : "Ready to Analyze";

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[var(--border-muted)] bg-[var(--surface-raised)] p-5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">
          <Settings className="h-4 w-4 text-[var(--orange-light)]" /> {title}
        </span>
        {/* <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--safe)]">
          <span data-status-dot className="h-1.5 w-1.5 rounded-full bg-[var(--safe)]" /> Engine Online
        </span> */}
      </div>

      <div data-radar className="relative mx-auto mt-5 aspect-square w-full max-w-[260px]">
        {/* corner targeting marks */}
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
            <radialGradient id="radarCoreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--orange)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--orange)" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="radarBeamGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--orange)" stopOpacity="0" />
              <stop offset="100%" stopColor="var(--orange-light)" stopOpacity="0.55" />
            </linearGradient>
          </defs>

          <circle cx="100" cy="100" r="95" fill="url(#radarCoreGlow)" />

          <g className={scanning ? "radar-rotate-cw-fast" : "radar-rotate-cw"} style={{ transformOrigin: "100px 100px" }}>
            <circle cx="100" cy="100" r="92" fill="none" stroke="var(--orange)" strokeOpacity="0.35" strokeWidth="1.5" />
          </g>
          <g className={scanning ? "radar-rotate-ccw-fast" : "radar-rotate-ccw"} style={{ transformOrigin: "100px 100px" }}>
            <circle cx="100" cy="100" r="68" fill="none" stroke="var(--orange)" strokeOpacity="0.3" strokeWidth="1.5" strokeDasharray="4 6" />
          </g>
          <circle cx="100" cy="100" r="44" fill="none" stroke="var(--orange)" strokeOpacity="0.25" strokeWidth="1.5" />

          {/* orbit points */}
          {[
            { cx: 100, cy: 8, delay: "0s" },
            { cx: 178, cy: 72, delay: "0.35s" },
            { cx: 40, cy: 150, delay: "0.7s" },
            { cx: 168, cy: 155, delay: "1.05s" },
          ].map((p, i) => (
            <circle key={i} cx={p.cx} cy={p.cy} r="3.5" fill="var(--orange-light)" className="orbit-pulse" style={{ animationDelay: p.delay }} />
          ))}

          {/* rotating scan beam */}
          <g className={scanning ? "radar-rotate-cw-beam-fast" : "radar-rotate-cw-beam"} style={{ transformOrigin: "100px 100px" }}>
            <path d="M100,100 L100,8 A92,92 0 0,1 165,36 Z" fill="url(#radarBeamGradient)" opacity="0.6" />
          </g>
        </svg>

        {/* central shield + icon */}
        <div className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--orange)]/50 bg-[var(--surface)] shadow-[0_0_28px_-4px_rgba(255,90,0,0.5)]">
          <Shield className="absolute h-9 w-9 text-[var(--orange)]/30" strokeWidth={1.25} />
          <CenterIcon className="relative h-5 w-5 text-[var(--orange-light)]" />
        </div>
      </div>

      <p
        data-radar-label
        className={cn(
          "mt-4 text-center text-sm font-extrabold uppercase tracking-wide",
          state === "error" ? "text-[var(--danger)]" : "text-[var(--orange-light)]",
        )}
      >
        {radarLabel}
      </p>

      <div className="mt-5 space-y-2.5 border-t border-[var(--border-muted)] pt-4">
        {statusRows.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-[var(--text-secondary)]">
              <row.icon className="h-3.5 w-3.5 text-[var(--text-muted)]" /> {row.label}
            </span>
            <span
              className={cn(
                "font-semibold",
                row.tone === "safe" && "text-[var(--safe)]",
                row.tone === "danger" && "text-[var(--danger)]",
                row.tone === "neutral" && "text-[var(--text-muted)]",
              )}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-[var(--border-muted)] bg-black/30 px-3 py-2.5 text-[11px] text-[var(--text-muted)]">
        <Shield className="h-3.5 w-3.5 shrink-0 text-[var(--orange-light)]" />
        {footerText}
      </div>
    </div>
  );
}
