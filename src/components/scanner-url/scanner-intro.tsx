"use client";

import { Link as LinkIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function ScannerIntro({
  pillIcon: PillIcon = LinkIcon,
  // pillText = "URL Scanner",
  headingPrefix = "Analyze any link ",
  headingHighlight = "before you click.",
  subtitle = "Reputation, SSL, redirect chains, domain age and phishing indicators — checked in seconds.",
}: {
  pillIcon?: LucideIcon;
  pillText?: string;
  headingPrefix?: string;
  headingHighlight?: string;
  subtitle?: string;
}) {
  return (
    <div className="relative mx-auto max-w-3xl text-center">
      {/* <div
        data-intro-pill
        className="mx-auto inline-flex items-center gap-2 rounded-full border border-[var(--orange)]/40 bg-[var(--orange)]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[var(--orange-light)]"
      >
        <PillIcon className="h-3.5 w-3.5" />
        {pillText}
      </div> */}

      <h1
        data-intro-heading
        className="mt-5 font-heading font-extrabold text-[var(--white)]"
        style={{ fontSize: "clamp(2.625rem, 4vw, 3.875rem)", lineHeight: 1.05 }}
      >
        {headingPrefix}
        <span className="relative inline-block text-[var(--orange)]">
          {headingHighlight}
          <svg
            aria-hidden
            viewBox="0 0 320 14"
            preserveAspectRatio="none"
            className="absolute -bottom-2 left-0 h-3 w-full"
          >
            <path
              data-intro-underline
              d="M2 8 C 60 2, 120 12, 180 6 S 280 2, 318 7"
              fill="none"
              stroke="var(--orange)"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </h1>

      <p data-intro-subtitle className="mx-auto mt-4 max-w-2xl text-lg text-[var(--text-secondary)]">
        {subtitle}
      </p>
    </div>
  );
}
