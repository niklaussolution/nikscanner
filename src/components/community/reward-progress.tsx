"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Trophy, ArrowRight } from "lucide-react";
import { REWARD_PROGRESS } from "@/lib/data/community";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function RewardProgress() {
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const pct = Math.round((REWARD_PROGRESS.currentXp / REWARD_PROGRESS.targetXp) * 100);

  useEffect(() => {
    const root = rootRef.current;
    const bar = barRef.current;
    if (!root || !bar) return;
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        bar,
        { scaleX: 0 },
        {
          scaleX: pct / 100,
          duration: reduced ? 0 : 1,
          ease: "power2.out",
          transformOrigin: "left center",
          scrollTrigger: { trigger: root, start: "top 90%", once: true },
        },
      );
    }, root);

    return () => ctx.revert();
  }, [pct]);

  return (
    <div
      ref={rootRef}
      className="flex flex-col items-start gap-4 rounded-2xl border border-[var(--orange)]/30 bg-[var(--orange)]/5 p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--orange)]/30 bg-[var(--orange)]/10 text-[var(--orange-light)]">
          <Trophy className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-[var(--text)]">Earn points for every verified report</p>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">Help identify threats and climb the leaderboard.</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-sm font-bold text-[var(--orange-light)]">
              {REWARD_PROGRESS.currentXp.toLocaleString()} / {REWARD_PROGRESS.targetXp.toLocaleString()} XP
            </span>
          </div>
          <div className="mt-2 h-1.5 w-40 overflow-hidden rounded-full bg-black/30 sm:w-48">
            <div ref={barRef} className="h-full w-full origin-left rounded-full bg-[var(--orange)]" style={{ transform: "scaleX(0)" }} />
          </div>
        </div>
      </div>

      <Link
        href="/leaderboard"
        className="group flex h-11 min-h-[44px] shrink-0 items-center gap-1.5 rounded-xl border border-[var(--orange)]/40 bg-black/20 px-4 text-sm font-bold text-[var(--orange-light)] transition-colors hover:bg-[var(--orange)]/10"
      >
        View leaderboard
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
