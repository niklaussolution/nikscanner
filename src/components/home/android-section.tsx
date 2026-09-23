"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  ShieldCheck,
  QrCode,
  FileText,
  Bell,
  Smartphone,
  Moon,
  PlayCircle,
  Shield,
  ShieldAlert,
  Clock,
  Radio,
  X,
  File,
  FileTextIcon
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PrimaryPhone } from "@/components/mobile/primary-phone";
import { ScannerPhone } from "@/components/mobile/scanner-phone";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const FEATURES: { icon: LucideIcon; label: string }[] = [
  { icon: ShieldCheck, label: "URL Protection" },
  { icon: QrCode, label: "QR Scanner" },
  { icon: FileText, label: "APK Analysis" },
  { icon: FileTextIcon, label: "Word/Docs Scanning" },
  { icon: File, label: "PDF Scan" },
  { icon: Smartphone, label: "Device Security" },
];

function FeatureChip({ feature }: { feature: (typeof FEATURES)[number] }) {
  const ref = useRef<HTMLDivElement>(null);

  function handleEnter() {
    if (prefersReducedMotion() || !ref.current) return;
    gsap.to(ref.current, { y: -3, duration: 0.25, ease: "power2.out" });
  }
  function handleLeave() {
    if (!ref.current) return;
    gsap.to(ref.current, { y: 0, duration: 0.3, ease: "power2.out" });
  }

  return (
    <div
      ref={ref}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="flex items-center gap-2 rounded-lg border border-border-subtle bg-card-bg px-3 py-2.5 transition-colors hover:border-flame-primary/40"
    >
      <feature.icon className="h-4 w-4 shrink-0 text-flame-bright" />
      <span className="text-xs text-soft-white">{feature.label}</span>
    </div>
  );
}

function MagneticButton({
  href,
  external,
  children,
  variant,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
  variant: "primary" | "outline";
}) {
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
    quickX.current?.((e.clientX - rect.left - rect.width / 2) * 0.3);
    quickY.current?.((e.clientY - rect.top - rect.height / 2) * 0.4);
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

  const extraProps = external ? { target: "_blank", rel: "noreferrer" } : {};

  return (
    <Link href={href} ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave} className={`${base} ${styles}`} {...extraProps}>
      {children}
    </Link>
  );
}

interface FloatingCard {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  tone: "success" | "neutral" | "active";
  style: React.CSSProperties;
}

const FLOATING_CARDS: FloatingCard[] = [
  { id: "safe", icon: ShieldCheck, title: "URL SAFE", subtitle: "No threats detected", tone: "success", style: { left: "-6%", top: "6%" } },
  { id: "threats", icon: FileText, title: "0 THREATS", subtitle: "All clear", tone: "neutral", style: { left: "-10%", top: "32%" } },
  { id: "scan", icon: Clock, title: "LAST SCAN", subtitle: "2m ago", tone: "neutral", style: { left: "74%", top: "-3%" } },
  { id: "realtime", icon: Radio, title: "REALTIME", subtitle: "ACTIVE", tone: "active", style: { left: "90%", top: "56%" } },
];

const TONE_ICON = {
  success: "border-success/40 bg-success/10 text-success",
  neutral: "border-border-subtle bg-card-bg text-flame-bright",
  active: "border-success/40 bg-success/10 text-success",
} as const;

export function AndroidSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const mainPhoneRef = useRef<HTMLDivElement>(null);
  const secondaryPhoneRef = useRef<HTMLDivElement>(null);
  const quickX = useRef<gsap.QuickToFunc | null>(null);
  const quickY = useRef<gsap.QuickToFunc | null>(null);
  const phoneRotY = useRef<gsap.QuickToFunc | null>(null);
  const phoneRotX = useRef<gsap.QuickToFunc | null>(null);
  const [notificationOpen, setNotificationOpen] = useState(true);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-heading-mask]",
        { yPercent: 110 },
        { yPercent: 0, duration: 0.7, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: section, start: "top 78%", once: true } },
      );

      gsap.fromTo(
        "[data-left-bit]",
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          delay: 0.25,
          ease: "power2.out",
          scrollTrigger: { trigger: section, start: "top 78%", once: true },
        },
      );

      gsap.fromTo(
        mainPhoneRef.current,
        { opacity: 0, y: 70, rotate: 10 },
        {
          opacity: 1,
          y: 0,
          rotate: -3,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 75%", once: true },
        },
      );

      gsap.fromTo(
        secondaryPhoneRef.current,
        { opacity: 0, y: 50, rotate: -2 },
        {
          opacity: 1,
          y: 0,
          rotate: -9,
          duration: 0.8,
          delay: 0.3,
          ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 75%", once: true },
        },
      );

      const cards = section.querySelectorAll<HTMLElement>("[data-float-card]");
      gsap.fromTo(
        cards,
        { opacity: 0, scale: 0.85 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.12,
          delay: 0.9,
          ease: "back.out(1.6)",
          scrollTrigger: { trigger: section, start: "top 75%", once: true },
        },
      );

      gsap.fromTo(
        "[data-notification]",
        { opacity: 0, x: 40 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          delay: 1.4,
          ease: "power2.out",
          scrollTrigger: { trigger: section, start: "top 75%", once: true },
        },
      );

      if (!reduced) {
        quickX.current = gsap.quickTo(glowRef.current, "--gx", { duration: 0.6, ease: "power3" });
        quickY.current = gsap.quickTo(glowRef.current, "--gy", { duration: 0.6, ease: "power3" });

        phoneRotY.current = gsap.quickTo([mainPhoneRef.current, secondaryPhoneRef.current], "rotationY", {
          duration: 0.6,
          ease: "power3",
        });
        phoneRotX.current = gsap.quickTo([mainPhoneRef.current, secondaryPhoneRef.current], "rotationX", {
          duration: 0.6,
          ease: "power3",
        });

        cards.forEach((card, i) => {
          gsap.to(card, { y: "+=10", duration: 2.6 + i * 0.3, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1.2 });
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    if (prefersReducedMotion()) return;
    const sectionRect = sectionRef.current?.getBoundingClientRect();
    if (sectionRect) {
      quickX.current?.(e.clientX - sectionRect.left);
      quickY.current?.(e.clientY - sectionRect.top);
    }
    const rightRect = rightRef.current?.getBoundingClientRect();
    if (rightRect && phoneRotY.current && phoneRotX.current) {
      const relX = (e.clientX - rightRect.left) / rightRect.width - 0.5;
      const relY = (e.clientY - rightRect.top) / rightRect.height - 0.5;
      phoneRotY.current(relX * 14);
      phoneRotX.current(relY * -10);
    }
  }

  return (
    <section
      id="android"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="bg-grid relative overflow-hidden border-t border-border-subtle bg-secondary-dark py-24"
    >
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-60"
        style={
          {
            background: "radial-gradient(560px circle at var(--gx, 30%) var(--gy, 20%), rgba(255,90,0,0.07), transparent 70%)",
          } as React.CSSProperties
        }
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* left column */}
          <div>
            <div data-left-bit className="flex items-center gap-3">
              <p className="shrink-0 text-xs font-semibold uppercase tracking-widest text-flame-bright">Mobile Security</p>
              <span className="h-px flex-1 bg-gradient-to-r from-flame-primary/50 to-transparent" />
            </div>

            <h2 className="mt-4 font-heading text-4xl font-bold leading-[1.05] text-white sm:text-5xl">
              <span className="block overflow-hidden">
                <span data-heading-mask className="inline-block">
                  NIKSCANNER
                </span>
              </span>
              <span className="block overflow-hidden">
                <span data-heading-mask className="inline-block text-flame-bright">
                  in your pocket.
                </span>
              </span>
            </h2>

            <p data-left-bit className="mt-4 max-w-md text-base leading-relaxed text-muted">
              Scan suspicious links, QR codes, files, apps and devices. Monitor your Android security wherever you go.
            </p>

            <div data-left-bit className="mt-6 grid grid-cols-3 gap-3">
              {FEATURES.map((f) => (
                <FeatureChip key={f.label} feature={f} />
              ))}
            </div>

            <div data-left-bit className="mt-8 flex flex-wrap gap-3">
              <MagneticButton href="/download" variant="primary">
                Get the Android App <ArrowRight className="h-4 w-4" />
              </MagneticButton>
              <MagneticButton href="/download" variant="outline">
                Explore Mobile Security <ArrowRight className="h-4 w-4" />
              </MagneticButton>
            </div>

            <div data-left-bit className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 rounded-xl border border-border-subtle bg-card-bg px-4 py-3">
                <PlayCircle className="h-7 w-7 text-muted" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">Android App</p>
                  <p className="text-xs font-bold text-white">Coming Soon</p>
                </div>
              </div>
              <p className="flex items-center gap-1.5 text-xs text-muted">
                <Shield className="h-3.5 w-3.5 text-flame-bright" /> Private scans &bull; No data retained &bull; Realtime protection
              </p>
            </div>
          </div>

          {/* right composition — desktop / tablet */}
          <div ref={rightRef} className="relative mx-auto hidden aspect-[6/7] w-full max-w-xl sm:block" style={{ perspective: "1400px" }}>
            {/* background radar + shield glow */}
            <div className="pointer-events-none absolute inset-0 z-0 flex items-start justify-center">
              <div className="relative mt-6 h-[460px] w-[460px]">
                <div className="absolute left-1/2 top-8 h-40 w-40 -translate-x-1/2 rounded-full bg-flame-primary/20 blur-3xl" />
                <Shield className="absolute left-1/2 top-0 h-32 w-32 -translate-x-1/2 text-flame-primary/45" strokeWidth={1} />
                <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-flame-primary/25" />
                <div className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-flame-primary/25" />
                <div className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-flame-primary/25" />
                <div
                  className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 animate-radar-sweep rounded-full"
                  style={{ background: "conic-gradient(from 0deg, rgba(255,122,26,0.35), transparent 30%)" }}
                />
              </div>
            </div>

            {/* secondary phone */}
            <div ref={secondaryPhoneRef} className="absolute left-[48%] top-[9%] z-10 w-[36%] opacity-0" style={{ transformStyle: "preserve-3d" }}>
              <ScannerPhone />
            </div>

            {/* main phone */}
            <div ref={mainPhoneRef} className="absolute left-[22%] top-[2%] z-20 w-[46%] opacity-0" style={{ transformStyle: "preserve-3d" }}>
              <div className="relative">
                <PrimaryPhone />
                <div className="pointer-events-none absolute inset-2 overflow-hidden rounded-[2.4rem]">
                  <div className="h-10 w-full animate-scan-line bg-gradient-to-b from-transparent via-flame-primary/25 to-transparent" />
                </div>
              </div>
            </div>

            {/* floating cards */}
            {FLOATING_CARDS.map((card) => (
              <div
                key={card.id}
                data-float-card
                className="absolute z-30 flex w-[150px] items-center gap-2.5 rounded-xl border border-border-subtle bg-card-bg/95 p-2.5 shadow-xl shadow-black/50 backdrop-blur"
                style={card.style}
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${TONE_ICON[card.tone]}`}>
                  <card.icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-bold uppercase tracking-wide text-white">{card.title}</p>
                  <p className="truncate text-[10px] text-muted">{card.subtitle}</p>
                </div>
              </div>
            ))}

            {/* threat notification */}
            {notificationOpen && (
              <div
                data-notification
                data-float-card
                className="absolute left-[58%] top-[74%] z-30 flex w-[190px] items-start gap-2.5 rounded-xl border border-danger/40 bg-card-bg/95 p-3 shadow-xl shadow-black/50 backdrop-blur"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-danger/40 bg-danger/10 text-danger">
                  <ShieldAlert className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white">Threat blocked</p>
                  <p className="truncate text-[10px] text-muted">Malicious APK isolated</p>
                </div>
                <button onClick={() => setNotificationOpen(false)} aria-label="Dismiss" className="shrink-0 text-muted hover:text-white">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* mobile composition */}
          <div className="relative mx-auto flex w-full max-w-xs flex-col items-center sm:hidden">
            <div className="relative w-[220px]">
              <div className="absolute -right-6 top-6 z-0 w-[150px] rotate-[8deg] opacity-70">
                <ScannerPhone />
              </div>
              <div className="relative z-10">
                <PrimaryPhone />
              </div>
            </div>

            <div className="mt-6 flex w-full flex-wrap justify-center gap-2">
              {FLOATING_CARDS.map((card) => (
                <div key={card.id} className="flex items-center gap-1.5 rounded-full border border-border-subtle bg-card-bg px-3 py-1.5">
                  <card.icon className="h-3 w-3 text-flame-bright" />
                  <span className="text-[10px] font-semibold text-soft-white">{card.title}</span>
                </div>
              ))}
              {notificationOpen && (
                <div className="flex items-center gap-1.5 rounded-full border border-danger/40 bg-danger/10 px-3 py-1.5">
                  <ShieldAlert className="h-3 w-3 text-danger" />
                  <span className="text-[10px] font-semibold text-danger">Threat blocked</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
