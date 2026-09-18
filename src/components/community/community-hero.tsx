"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Users, ShieldCheck, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NetworkBackdrop } from "@/components/community/network-backdrop";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const TRUST_INDICATORS: { icon: LucideIcon; label: string }[] = [
  { icon: Users, label: "Moderated reports" },
  { icon: ShieldCheck, label: "Privacy protected" },
  { icon: Trophy, label: "Points for verified findings" },
];

export function CommunityHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const quickX = useRef<gsap.QuickToFunc | null>(null);
  const quickY = useRef<gsap.QuickToFunc | null>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const reduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-hero-in]",
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.09, ease: "power2.out" },
      );

      if (!reduced) {
        gsap.to("[data-net-dot]", {
          opacity: 0.35,
          duration: 2.2,
          stagger: { each: 0.12, from: "random" },
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });

        quickX.current = gsap.quickTo(glowRef.current, "--gx", { duration: 0.5, ease: "power3" });
        quickY.current = gsap.quickTo(glowRef.current, "--gy", { duration: 0.5, ease: "power3" });
      }
    }, hero);

    return () => ctx.revert();
  }, []);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (prefersReducedMotion()) return;
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    quickX.current?.(e.clientX - rect.left);
    quickY.current?.(e.clientY - rect.top);
  }

  return (
    <div
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden border-b border-[var(--border-soft)] px-4 pb-14 pt-10 sm:px-6 lg:px-8"
      style={{
        backgroundColor: "var(--background)",
        backgroundImage:
          "linear-gradient(to right, var(--border-soft) 1px, transparent 1px), linear-gradient(to bottom, var(--border-soft) 1px, transparent 1px)",
        backgroundSize: "56px 56px",
      }}
    >
      <NetworkBackdrop />

      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={
          {
            background: "radial-gradient(620px circle at var(--gx, 50%) var(--gy, -10%), rgba(255,90,0,0.14), transparent 70%)",
          } as React.CSSProperties
        }
      />

      {/* corner micro-labels */}
      <span data-hero-in className="absolute left-4 top-6 hidden rounded-md border border-[var(--border)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] sm:block lg:left-8">
        A safer internet
      </span>
      <span data-hero-in className="absolute right-4 top-6 hidden rounded-md border border-[var(--border)] px-2.5 py-1 text-right text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] sm:block lg:right-8">
        Powered by people
      </span>
      <span data-hero-in className="absolute right-4 top-20 hidden rounded-md border border-[var(--border)] px-2.5 py-1 text-right text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] sm:block lg:right-8">
        Threats stop here
      </span>
      <span data-hero-in className="absolute left-4 top-20 hidden rounded-md border border-[var(--border)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] sm:block lg:left-8">
        Community intelligence
      </span>

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <div
          data-hero-in
          className="mx-auto inline-flex items-center gap-2 rounded-full border border-[var(--orange)]/40 bg-[var(--orange)]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[var(--orange-light)]"
        >
          <Users className="h-3.5 w-3.5" />
          Community Intelligence
        </div>

        <h1
          data-hero-in
          className="mt-5 font-heading font-extrabold text-[var(--text)]"
          style={{ fontSize: "clamp(2.25rem, 4vw, 3.25rem)", lineHeight: 1.1 }}
        >
          Security gets stronger <span className="text-[var(--orange)]">together.</span>
        </h1>

        <p data-hero-in className="mx-auto mt-4 max-w-xl text-base text-[var(--text-muted)] sm:text-lg">
          Report suspicious links. Help verify threats. Protect the community.
        </p>

        <div data-hero-in className="mt-7 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {TRUST_INDICATORS.map((t) => (
            <span key={t.label} className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <t.icon className="h-4 w-4 text-[var(--orange-light)]" />
              {t.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
