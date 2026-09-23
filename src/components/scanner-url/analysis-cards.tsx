"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalysisCardData } from "@/components/scanner-url/types";

const TONE_TEXT: Record<AnalysisCardData["tone"], string> = {
  neutral: "text-[var(--text-secondary)]",
  safe: "text-[var(--safe)]",
  danger: "text-[var(--danger)]",
};

const FEATURED_TONE_GLOW: Record<AnalysisCardData["tone"], string> = {
  neutral: "border-[var(--orange)]/50 shadow-[0_0_0_1px_rgba(255,90,0,0.15),0_8px_24px_-8px_rgba(255,90,0,0.35)]",
  safe: "border-[var(--safe)]/50 shadow-[0_0_0_1px_rgba(34,197,94,0.15),0_8px_24px_-8px_rgba(34,197,94,0.35)]",
  danger: "border-[var(--danger)]/60 shadow-[0_0_0_1px_rgba(239,68,68,0.2),0_8px_24px_-8px_rgba(239,68,68,0.5)]",
};

export function AnalysisCards({ cards, trailing }: { cards: AnalysisCardData[]; trailing?: React.ReactNode }) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        if (card.featured) {
          return (
            <button
              key={card.id}
              type="button"
              data-analysis-card
              className={cn(
                "group flex items-center justify-between gap-2 rounded-xl border bg-[var(--surface-soft)] p-5 text-left transition-all duration-200 hover:-translate-y-1 sm:col-span-2",
                FEATURED_TONE_GLOW[card.tone],
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--orange)]/30 bg-[var(--orange)]/10 text-[var(--orange-light)]">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold uppercase tracking-wide text-[var(--white)]">{card.title}</p>
                  <p className={cn("mt-0.5 truncate text-lg font-extrabold", TONE_TEXT[card.tone])}>{card.value}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5" />
            </button>
          );
        }
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
      {trailing && (
        <div className="flex items-stretch sm:col-span-2 xl:col-span-2" data-analysis-card>
          {trailing}
        </div>
      )}
    </div>
  );
}
