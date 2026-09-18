"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalysisCardData } from "@/components/scanner-url/types";

const TONE_TEXT: Record<AnalysisCardData["tone"], string> = {
  neutral: "text-[var(--text-secondary)]",
  safe: "text-[var(--safe)]",
  danger: "text-[var(--danger)]",
};

export function AnalysisCards({ cards }: { cards: AnalysisCardData[] }) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.id}
            type="button"
            data-analysis-card
            className="group flex items-center justify-between gap-1 rounded-xl border border-[var(--border-muted)] bg-[var(--surface-soft)] p-3.5 text-left transition-all duration-200 hover:-translate-y-1 hover:border-[var(--orange)]/40"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--orange)]/25 bg-[var(--orange)]/10 text-[var(--orange-light)]">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[12px] font-bold text-[var(--white)]">{card.title}</p>
                <p className={cn("truncate text-[11px] font-semibold", TONE_TEXT[card.tone])}>{card.value}</p>
              </div>
            </div>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5" />
          </button>
        );
      })}
    </div>
  );
}
