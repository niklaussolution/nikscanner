"use client";

import { Check, X, AlertTriangle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatusCardData {
  id: string;
  icon: LucideIcon;
  title: string;
  primary: string;
  secondary: string;
  status: "ok" | "warn" | "bad" | "unavailable";
}

const STATUS_ICON: Record<StatusCardData["status"], LucideIcon> = {
  ok: Check,
  warn: AlertTriangle,
  bad: X,
  unavailable: AlertTriangle,
};

const STATUS_CLASSES: Record<StatusCardData["status"], string> = {
  ok: "border-[var(--safe)]/40 bg-[var(--safe)]/10 text-[var(--safe)]",
  warn: "border-[var(--warning)]/40 bg-[var(--warning)]/10 text-[var(--warning)]",
  bad: "border-[var(--danger)]/40 bg-[var(--danger)]/10 text-[var(--danger)]",
  unavailable: "border-[var(--border)] bg-black/30 text-[var(--text-muted)]",
};

export function StatusCards({ cards }: { cards: StatusCardData[] }) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const StatusIcon = STATUS_ICON[card.status];
        return (
          <div
            key={card.id}
            data-analysis-card
            className="group flex flex-col gap-3 rounded-xl border border-[var(--border-muted)] bg-[var(--surface-soft)] p-3.5 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--orange)]/40"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--orange)]/25 bg-[var(--orange)]/10 text-[var(--orange-light)]">
                <Icon className="h-4 w-4" />
              </span>
              <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border", STATUS_CLASSES[card.status])}>
                <StatusIcon className="h-3 w-3" strokeWidth={3} />
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">{card.title}</p>
              <p className={cn("mt-1 truncate text-[13px] font-bold", card.status === "unavailable" ? "text-[var(--text-muted)]" : "text-[var(--white)]")}>
                {card.primary}
              </p>
              <p className="truncate text-[11px] text-[var(--text-secondary)]">{card.secondary}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
