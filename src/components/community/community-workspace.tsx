"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReportForm } from "@/components/community/report-form";
import { CommunitySidebar } from "@/components/community/community-sidebar";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function CommunityWorkspace() {
  const rootRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const quickX = useRef<gsap.QuickToFunc | null>(null);
  const quickY = useRef<gsap.QuickToFunc | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-workspace-form]",
        { opacity: 0, x: -24 },
        {
          opacity: 1,
          x: 0,
          duration: reduced ? 0 : 0.6,
          ease: "power2.out",
          scrollTrigger: { trigger: root, start: "top 78%", once: true },
        },
      );
      gsap.fromTo(
        "[data-workspace-sidebar]",
        { opacity: 0, x: 24 },
        {
          opacity: 1,
          x: 0,
          duration: reduced ? 0 : 0.6,
          ease: "power2.out",
          scrollTrigger: { trigger: root, start: "top 78%", once: true },
        },
      );

      if (!reduced) {
        quickX.current = gsap.quickTo(glowRef.current, "--gx", { duration: 0.6, ease: "power3" });
        quickY.current = gsap.quickTo(glowRef.current, "--gy", { duration: 0.6, ease: "power3" });
      }
    }, root);

    return () => ctx.revert();
  }, []);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (prefersReducedMotion()) return;
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;
    quickX.current?.(e.clientX - rect.left);
    quickY.current?.(e.clientY - rect.top);
  }

  return (
    <div ref={rootRef} onMouseMove={handleMouseMove} className="relative mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        ref={glowRef}
        style={
          {
            background: "radial-gradient(560px circle at var(--gx, 20%) var(--gy, 0%), rgba(255,90,0,0.05), transparent 70%)",
          } as React.CSSProperties
        }
      />
      <div className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div data-workspace-form className="lg:col-span-7">
          <ReportForm />
        </div>
        <CommunitySidebar />
      </div>
    </div>
  );
}
