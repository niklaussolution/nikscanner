"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { Link as LinkIcon, FileUp, Globe, Network, QrCode } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS: { id: string; label: string; icon: LucideIcon; href: string }[] = [
  { id: "url", label: "URL", icon: LinkIcon, href: "/scanner/url" },
  { id: "file", label: "File", icon: FileUp, href: "/scanner/file" },
  { id: "domain", label: "Domain", icon: Globe, href: "/scanner/domain" },
  { id: "ip", label: "IP", icon: Network, href: "/scanner/ip" },
  { id: "qr", label: "QR", icon: QrCode, href: "/scanner/qr" },
];

export function ScannerTabs({ active = "url" }: { active?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const indicator = indicatorRef.current;
    if (!root || !indicator) return;

    const activeEl = root.querySelector<HTMLElement>(`[data-tab-id="${active}"]`);
    if (!activeEl) return;

    const containerRect = root.getBoundingClientRect();
    const targetRect = activeEl.getBoundingClientRect();
    gsap.to(indicator, {
      x: targetRect.left - containerRect.left,
      width: targetRect.width,
      height: targetRect.height,
      duration: 0.4,
      ease: "power3.out",
    });
  }, [active]);

  return (
    <div
      ref={rootRef}
      role="tablist"
      aria-label="Scanner type"
      className="relative flex gap-1.5 overflow-x-auto border-b border-[var(--border-muted)] px-3 py-3 scrollbar-thin sm:gap-2 sm:px-5"
    >
      <div
        ref={indicatorRef}
        aria-hidden
        className="absolute left-0 top-3 z-0 rounded-lg border border-[var(--orange)] bg-[var(--orange)]/10"
        style={{ width: 0, height: 0 }}
      />
      {TABS.map((t) => (
        <Link
          key={t.id}
          href={t.href}
          data-tab-id={t.id}
          role="tab"
          aria-selected={active === t.id}
          className={cn(
            "relative z-10 flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange)]",
            active === t.id ? "text-[var(--orange-light)]" : "text-[var(--text-muted)] hover:text-[var(--white)]",
          )}
        >
          <t.icon className="h-4 w-4" />
          {t.label}
        </Link>
      ))}
    </div>
  );
}
