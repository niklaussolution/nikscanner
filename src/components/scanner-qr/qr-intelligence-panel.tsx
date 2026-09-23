"use client";

import { Settings, Shield, Link as LinkIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QrScanState } from "@/components/scanner-qr/types";

export interface QrStatusRow {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: "safe" | "neutral" | "danger" | "unknown";
}

const GRID_SIZE = 17;
const FINDER_SIZE = 5;

// Deterministic pseudo-random module pattern — decorative only, does not
// encode the actual scanned payload (never render the real QR content here).
function moduleOn(x: number, y: number): boolean {
  const n = x * 928371 + y * 123457 + x * y * 17;
  return (n ^ (n >> 3)) % 5 < 2;
}

function inFinderZone(x: number, y: number): boolean {
  const zones = [
    [0, 0],
    [GRID_SIZE - FINDER_SIZE, 0],
    [0, GRID_SIZE - FINDER_SIZE],
  ];
  return zones.some(([zx, zy]) => x >= zx && x < zx + FINDER_SIZE && y >= zy && y < zy + FINDER_SIZE);
}

function FinderPattern({ x, y, cell }: { x: number; y: number; cell: number }) {
  return (
    <g>
      <rect x={x * cell} y={y * cell} width={FINDER_SIZE * cell} height={FINDER_SIZE * cell} fill="none" stroke="var(--orange)" strokeWidth={cell * 0.8} />
      <rect x={(x + 1.5) * cell} y={(y + 1.5) * cell} width={2 * cell} height={2 * cell} fill="var(--orange)" />
    </g>
  );
}

export function QrIntelligencePanel({
  state,
  destinationVerified,
  statusRows,
  footerText = "Opening the destination requires your confirmation.",
}: {
  state: QrScanState;
  /** true/false once a URL destination has been checked, null while pending or idle, "n/a" for a decoded non-URL payload (nothing to verify). */
  destinationVerified: boolean | null | "n/a";
  statusRows: QrStatusRow[];
  footerText?: string;
}) {
  const scanning = state === "scanning" || state === "decoding";
  const cell = 200 / GRID_SIZE;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[var(--border-muted)] bg-[var(--surface-raised)] p-5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">
          <Settings className="h-4 w-4 text-[var(--orange-light)]" /> QR Intelligence
        </span>
        {/* <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--safe)]">
          <span data-status-dot className="h-1.5 w-1.5 rounded-full bg-[var(--safe)]" /> Engine Online
        </span> */}
      </div>

      <div data-radar className="relative mx-auto mt-5 aspect-square w-full max-w-[260px] overflow-hidden rounded-xl">
        {(["top-left", "top-right", "bottom-left", "bottom-right"] as const).map((corner) => (
          <span
            key={corner}
            aria-hidden
            className={cn(
              "absolute z-20 h-4 w-4 border-[var(--orange)]/60",
              corner === "top-left" && "left-0 top-0 border-l-2 border-t-2",
              corner === "top-right" && "right-0 top-0 border-r-2 border-t-2",
              corner === "bottom-left" && "bottom-0 left-0 border-b-2 border-l-2",
              corner === "bottom-right" && "bottom-0 right-0 border-b-2 border-r-2",
            )}
          />
        ))}

        {/* faint circular targeting rings */}
        <svg viewBox="0 0 200 200" className="absolute inset-0 z-0 h-full w-full opacity-30">
          <circle cx="100" cy="100" r="95" fill="none" stroke="var(--orange)" strokeWidth="1" className={scanning ? "radar-rotate-cw-fast" : "radar-rotate-cw"} style={{ transformOrigin: "100px 100px" }} />
          <circle cx="100" cy="100" r="70" fill="none" stroke="var(--orange)" strokeWidth="1" strokeDasharray="3 5" className={scanning ? "radar-rotate-ccw-fast" : "radar-rotate-ccw"} style={{ transformOrigin: "100px 100px" }} />
        </svg>

        {/* QR module grid */}
        <svg viewBox="0 0 200 200" className="absolute inset-0 z-10 h-full w-full">
          <rect x="0" y="0" width="200" height="200" fill="var(--surface)" />
          {Array.from({ length: GRID_SIZE }).map((_, y) =>
            Array.from({ length: GRID_SIZE }).map((_, x) => {
              if (inFinderZone(x, y)) return null;
              if (!moduleOn(x, y)) return null;
              return <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell * 0.85} height={cell * 0.85} fill="var(--orange)" opacity="0.85" />;
            }),
          )}
          <FinderPattern x={0} y={0} cell={cell} />
          <FinderPattern x={GRID_SIZE - FINDER_SIZE} y={0} cell={cell} />
          <FinderPattern x={0} y={GRID_SIZE - FINDER_SIZE} cell={cell} />
        </svg>

        {/* central shield + link badge */}
        <div className="absolute left-1/2 top-1/2 z-20 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--orange)]/50 bg-[var(--surface)] shadow-[0_0_28px_-4px_rgba(255,90,0,0.5)]">
          <Shield className="absolute h-9 w-9 text-[var(--orange)]/30" strokeWidth={1.25} />
          <LinkIcon className="relative h-5 w-5 text-[var(--orange-light)]" />
        </div>

        {/* scanning line */}
        <div
          aria-hidden
          className={cn("qr-scanline absolute inset-x-0 z-30 h-[3px]", scanning && "qr-scanline-fast")}
          style={{
            background: "linear-gradient(90deg, transparent, var(--orange-light) 20%, var(--orange-light) 80%, transparent)",
            boxShadow: "0 0 12px 2px rgba(255,122,26,0.7)",
          }}
        />
      </div>

      <p
        data-radar-label
        className={cn(
          "mt-4 text-center text-sm font-extrabold uppercase tracking-wide",
          state === "error"
            ? "text-[var(--danger)]"
            : destinationVerified === false
              ? "text-[var(--danger)]"
              : destinationVerified === "n/a"
                ? "text-[var(--text-secondary)]"
                : "text-[var(--safe)]",
        )}
      >
        {state === "error"
          ? "Scan Failed"
          : destinationVerified === null
            ? state === "idle"
              ? "Awaiting Upload"
              : "Analyzing Destination"
            : destinationVerified === "n/a"
              ? "Decoded — Not a Link"
              : destinationVerified
                ? "Destination Verified"
                : "Destination Flagged"}
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
        {footerText}
      </div>
    </div>
  );
}
