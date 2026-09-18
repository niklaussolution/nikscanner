"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ShieldAlert, Trophy, Users, FileText, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SignalNetwork } from "@/components/community/signal-network";
import { CommunityReportsPanel } from "@/components/community/community-reports-panel";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

interface MetricDef {
  icon: LucideIcon;
  value: number;
  suffix: string;
  label: string;
  decimals?: number;
}

const METRICS: MetricDef[] = [
  { icon: Users, value: 48, suffix: "K+", label: "Contributors" },
  { icon: FileText, value: 1.2, suffix: "M", label: "Reports", decimals: 1 },
  { icon: ShieldCheck, value: 96, suffix: "%", label: "Verified" },
];

function MagneticButton({ href, children, variant }: { href: string; children: React.ReactNode; variant: "primary" | "outline" }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const quickX = useRef<gsap.QuickToFunc | null>(null);
  const quickY = useRef<gsap.QuickToFunc | null>(null);

  useEffect(() => {
    if (!ref.current || prefersReducedMotion()) return;
    quickX.current = gsap.quickTo(ref.current, "x", { duration: 0.4, ease: "power3" });
    quickY.current = gsap.quickTo(ref.current, "y", { duration: 0.4, ease: "power3" });
  }, []);

  function handleMove(e: React.MouseEvent<HTMLAnchorElement>) {
    if (prefersReducedMotion() || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    quickX.current?.(relX * 0.3);
    quickY.current?.(relY * 0.4);
  }

  function handleLeave() {
    quickX.current?.(0);
    quickY.current?.(0);
  }

  const base =
    "inline-flex h-13 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-7 text-base font-semibold tracking-wide transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-black";
  const styles =
    variant === "primary"
      ? "bg-flame-primary text-white shadow-[0_0_0_1px_rgba(255,90,0,0.4),0_8px_24px_-8px_rgba(255,90,0,0.55)] hover:bg-flame-bright"
      : "border border-white/15 text-white hover:border-flame-primary/60 hover:text-flame-bright bg-transparent";

  return (
    <Link href={href} ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave} className={`${base} ${styles}`}>
      {children}
    </Link>
  );
}

function MetricItem({ metric, index }: { metric: (typeof METRICS)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    const numEl = numRef.current;
    if (!el || !numEl) return;

    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () => {
        gsap.to(el, { opacity: 1, y: 0, duration: 0.5, delay: index * 0.1, ease: "power2.out" });
        gsap.to(
          { v: 0 },
          {
            v: metric.value,
            duration: 1.6,
            delay: index * 0.1,
            ease: "power2.out",
            onUpdate: function () {
              const v = this.targets()[0].v;
              numEl.textContent = (metric.decimals ? v.toFixed(metric.decimals) : Math.round(v).toLocaleString("en-US")) + metric.suffix;
            },
          },
        );
      },
    });
  }, [index, metric]);

  return (
    <div ref={ref} className="opacity-0" style={{ transform: "translateY(14px)" }}>
      <p ref={numRef} className="font-heading text-3xl font-bold text-flame-bright sm:text-4xl">
        0{metric.suffix}
      </p>
      <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
        <metric.icon className="h-3.5 w-3.5" /> {metric.label}
      </p>
    </div>
  );
}

export function CommunitySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const quickX = useRef<gsap.QuickToFunc | null>(null);
  const quickY = useRef<gsap.QuickToFunc | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-heading-mask]",
        { yPercent: 110 },
        { yPercent: 0, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: section, start: "top 78%", once: true } },
      );

      gsap.fromTo(
        "[data-left-bit]",
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          delay: 0.15,
          ease: "power2.out",
          scrollTrigger: { trigger: section, start: "top 78%", once: true },
        },
      );

      if (!reduced) {
        quickX.current = gsap.quickTo(glowRef.current, "--gx", { duration: 0.6, ease: "power3" });
        quickY.current = gsap.quickTo(glowRef.current, "--gy", { duration: 0.6, ease: "power3" });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    if (prefersReducedMotion()) return;
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    quickX.current?.(e.clientX - rect.left);
    quickY.current?.(e.clientY - rect.top);
  }

  return (
    <section
      id="community"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden border-t border-border-subtle bg-bg-black py-24"
    >
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-60"
        style={
          {
            background: "radial-gradient(520px circle at var(--gx, 20%) var(--gy, 20%), rgba(255,90,0,0.06), transparent 70%)",
          } as React.CSSProperties
        }
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <div data-left-bit className="flex items-center gap-3">
              <p className="shrink-0 text-xs font-semibold uppercase tracking-widest text-flame-bright">Community Intelligence</p>
              <span className="h-px flex-1 bg-gradient-to-r from-flame-primary/50 to-transparent" />
            </div>

            <h2 className="mt-4 overflow-hidden font-heading text-3xl font-bold leading-tight text-white sm:text-4xl">
              <span data-heading-mask className="inline-block">
                Security gets stronger together.
              </span>
            </h2>

            <p data-left-bit className="mt-4 max-w-md text-base leading-relaxed text-muted">
              Every reported URL strengthens the NIKSCANNER intelligence engine. Reports pass through moderation
              before affecting reputation — no single report labels a site malicious.
            </p>

            <div data-left-bit className="mt-8 flex flex-wrap gap-3">
              <MagneticButton href="/community" variant="primary">
                <ShieldAlert className="h-4 w-4" /> Join the Community
              </MagneticButton>
              <MagneticButton href="/leaderboard" variant="outline">
                <Trophy className="h-4 w-4" /> View Leaderboard
              </MagneticButton>
            </div>

            <div data-left-bit>
              <SignalNetwork />
            </div>

            <div data-left-bit className="mt-8 grid grid-cols-3 gap-4 border-t border-border-subtle pt-6">
              {METRICS.map((m, i) => (
                <MetricItem key={m.label} metric={m} index={i} />
              ))}
            </div>
          </div>

          <CommunityReportsPanel />
        </div>
      </div>
    </section>
  );
}
