"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeft, Link as LinkIcon, CheckCircle2, Loader2, Circle } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const CHECKS = [
  { label: "Checking reputation...", state: "done" as const },
  { label: "Analyzing content...", state: "done" as const },
  { label: "Scanning for threats...", state: "active" as const },
  { label: "Checking redirects...", state: "pending" as const },
  { label: "Finalizing scan...", state: "pending" as const },
];

export function ScannerPhone({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const bar = barRef.current;
    if (!root) return;
    const reduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-scan-row]",
        { opacity: 0, x: 8 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: { trigger: root, start: "top 85%", once: true },
        },
      );

      if (bar && !reduced) {
        gsap.set(bar, { scaleX: 0.15, transformOrigin: "left center" });
        gsap.to(bar, {
          scaleX: 0.72,
          duration: 2.4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 0.6,
        });
      }
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className={className}>
      <div className="relative aspect-[375/812] w-full rotate-15 transform-gpu overflow-hidden rounded-[2.4rem] border-[5px] border-[#1a1a1a] bg-black shadow-[0_24px_60px_-16px_rgba(0,0,0,0.75)]">        <div className="absolute left-1/2 top-2 z-30 h-2 w-2 -translate-x-1/2 rounded-full bg-black ring-2 ring-white/10" />

        <div className="flex h-full flex-col bg-gradient-to-b from-[#0c0c0c] to-black px-3.5 pb-4 pt-5">
          <div className="flex items-center justify-between text-[10px] font-semibold text-soft-white">
            <span>9:41</span>
            <span>100%</span>
          </div>

          <div className="mt-4 flex items-center gap-1.5">
            <ChevronLeft className="h-3.5 w-3.5 text-muted" />
            <p className="text-[11px] font-bold text-white">URL Scanner</p>
          </div>

          <div className="mt-6 flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-flame-primary/10 text-flame-bright">
              <LinkIcon className="h-4 w-4" />
            </span>
            <p className="text-xs font-bold text-white">Scanning URL...</p>
          </div>
          <p className="mt-1.5 truncate font-mono text-[10px] text-muted">https://example.com</p>

          <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-white/10">
            <div ref={barRef} className="h-full w-full rounded-full bg-gradient-to-r from-flame-primary to-flame-bright" />
          </div>

          <div className="mt-5 space-y-2.5">
            {CHECKS.map((c) => (
              <div key={c.label} data-scan-row className="flex items-center gap-2 text-[10.5px]">
                {c.state === "done" && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />}
                {c.state === "active" && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-flame-bright" />}
                {c.state === "pending" && <Circle className="h-3.5 w-3.5 shrink-0 text-white/15" />}
                <span className={c.state === "pending" ? "text-white/30" : "text-soft-white"}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
