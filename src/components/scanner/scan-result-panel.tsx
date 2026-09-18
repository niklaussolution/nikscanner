"use client";

import { motion } from "framer-motion";
import { Ban, RefreshCcw, ShieldCheck } from "lucide-react";
import type { ScanResultPayload } from "@/types/scan";
import { ThreatScore } from "./threat-score";
import { RiskBadge } from "./risk-badge";
import { DetectionTable } from "./detection-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ScanResultPanel({
  result,
  onRescan,
}: {
  result: ScanResultPayload;
  onRescan?: () => void;
}) {
  const detections = result.engines.filter((e) => e.verdict === "detected" || e.verdict === "suspicious").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-xl border border-border-subtle bg-card-bg p-6"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <ThreatScore score={result.score} level={result.threatLevel} />
          <div>
            <p className="text-xs uppercase tracking-widest text-muted">Security Score</p>
            <div className="mt-1 flex items-center gap-3">
              <RiskBadge level={result.threatLevel} />
              {result.demo && <Badge variant="neutral">Demo Data</Badge>}
            </div>
            <p className="mt-3 max-w-sm truncate font-mono text-sm text-soft-white">{result.target}</p>
            <p className="mt-1 text-xs text-muted">
              {detections} / {result.engines.length} engines flagged this target · {result.confidence}% confidence
            </p>
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          {result.threatLevel === "SAFE" || result.threatLevel === "LOW_RISK" ? (
            <Button variant="outline" size="sm">
              <ShieldCheck className="h-4 w-4" /> Open Safely
            </Button>
          ) : (
            <Button variant="danger" size="sm">
              <Ban className="h-4 w-4" /> Block This URL
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onRescan}>
            <RefreshCcw className="h-4 w-4" /> Re-scan
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Detection Engines</p>
        <DetectionTable engines={result.engines} />
      </div>

      {result.evidence.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Evidence</p>
          <ul className="space-y-2 text-sm text-muted">
            {result.evidence.map((e, i) => (
              <li key={i} className="rounded-lg border border-border-subtle bg-card-elevated px-3 py-2">
                <span className="text-white">{e.label}:</span> {e.value}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}
