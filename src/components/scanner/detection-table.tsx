"use client";

import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from "lucide-react";
import type { EngineResult } from "@/types/scan";
import { cn } from "@/lib/utils";

const VERDICT_META: Record<
  EngineResult["verdict"],
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  clean: { label: "Clean", icon: CheckCircle2, className: "text-success" },
  detected: { label: "Detected", icon: XCircle, className: "text-danger" },
  suspicious: { label: "Suspicious", icon: AlertTriangle, className: "text-warning" },
  unknown: { label: "Unknown", icon: HelpCircle, className: "text-muted" },
};

export function DetectionTable({ engines }: { engines: EngineResult[] }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {engines.map((engine, i) => {
        const meta = VERDICT_META[engine.verdict];
        const Icon = meta.icon;
        return (
          <motion.div
            key={engine.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between rounded-lg border border-border-subtle bg-card-elevated px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{engine.name}</p>
              {engine.detail && <p className="truncate text-xs text-muted">{engine.detail}</p>}
            </div>
            <span className={cn("flex shrink-0 items-center gap-1.5 text-xs font-semibold", meta.className)}>
              <Icon className="h-4 w-4" />
              {meta.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
