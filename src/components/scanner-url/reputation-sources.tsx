"use client";

import Link from "next/link";
import { Database, Check, X, AlertTriangle, HelpCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EngineResult } from "@/types/scan";

export function displayProviderName(name: string): string {
  if (name === "NIKSCANNER Internal Engine") return "NIKSCANNER";
  return name.toUpperCase();
}

type CardTone = "ok" | "bad" | "warn" | "neutral";

export interface ReputationLabels {
  clean?: string;
  detected?: string;
  suspicious?: string;
  unknown?: string;
  unavailable?: string;
  notConfigured?: string;
}

function cardFor(engine: EngineResult, labels: ReputationLabels): { value: string; tone: CardTone; icon: LucideIcon } {
  if (engine.unavailable) return { value: labels.unavailable ?? "Unavailable", tone: "bad", icon: AlertTriangle };
  if (engine.configured === false) return { value: labels.notConfigured ?? "Not configured", tone: "neutral", icon: HelpCircle };
  switch (engine.verdict) {
    case "clean":
      return { value: labels.clean ?? "Clean", tone: "ok", icon: Check };
    case "detected":
      return { value: labels.detected ?? "Detected", tone: "bad", icon: X };
    case "suspicious":
      return { value: labels.suspicious ?? "Suspicious", tone: "warn", icon: AlertTriangle };
    default:
      return { value: labels.unknown ?? "Unknown", tone: "neutral", icon: HelpCircle };
  }
}

const TONE_CLASSES: Record<CardTone, string> = {
  ok: "border-[var(--safe)]/40 bg-[var(--safe)]/10 text-[var(--safe)]",
  bad: "border-[var(--danger)]/40 bg-[var(--danger)]/10 text-[var(--danger)]",
  warn: "border-[var(--warning)]/40 bg-[var(--warning)]/10 text-[var(--warning)]",
  neutral: "border-[var(--border)] bg-black/30 text-[var(--text-muted)]",
};

export function ReputationSources({
  engines,
  title = "Reputation Sources",
  historyHref = "/dashboard/scans",
  labels = {},
  providerIcon,
}: {
  engines: EngineResult[];
  title?: string;
  historyHref?: string;
  labels?: ReputationLabels;
  providerIcon?: (engineId: string) => LucideIcon | undefined;
}) {
  return (
    <div data-reputation-sources className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">
          <Database className="h-4 w-4 text-[var(--orange-light)]" /> {title}
        </span>
        <Link
          href={historyHref}
          className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-[var(--orange-light)] hover:text-[var(--orange)]"
        >
          View full report <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {engines.map((engine) => {
          const { value, tone, icon: ToneIcon } = cardFor(engine, labels);
          const ProviderIcon = providerIcon?.(engine.id);
          return (
            <div key={engine.id} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border-muted)] bg-[var(--surface-soft)] p-3.5">
              <div className="flex min-w-0 items-center gap-2.5">
                {ProviderIcon && (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--orange)]/25 bg-[var(--orange)]/10 text-[var(--orange-light)]">
                    <ProviderIcon className="h-4 w-4" />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">{displayProviderName(engine.name)}</p>
                  <p className={cn("mt-1 truncate text-[13px] font-bold uppercase", tone === "neutral" ? "text-[var(--text-muted)]" : "text-[var(--white)]")}>
                    {value}
                  </p>
                </div>
              </div>
              <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full border", TONE_CLASSES[tone])}>
                <ToneIcon className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
