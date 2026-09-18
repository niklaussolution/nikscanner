"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { KeyRound, BookOpen, Terminal, Package, Webhook, Database, Globe, Zap, Server } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { ApiPlayground } from "@/components/developers/api-playground";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CHIPS: { icon: LucideIcon; label: string }[] = [
  { icon: Terminal, label: "REST API" },
  { icon: Package, label: "SDKs" },
  { icon: Webhook, label: "Webhooks" },
  { icon: Database, label: "API v1" },
];

const METRICS: { icon: LucideIcon; value: string; label: string }[] = [
  { icon: Globe, value: "99.99%", label: "Uptime" },
  { icon: Zap, value: "<120ms", label: "Response" },
  { icon: Server, value: "", label: "Global Edge" },
];


export function DeveloperSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

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
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section id="developers" ref={sectionRef} className="bg-grid border-t border-border-subtle bg-secondary-dark py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-14">
          {/* left column */}
          <div>
            <div data-left-bit className="flex items-center gap-3">
              <p className="shrink-0 text-xs font-semibold uppercase tracking-widest text-flame-bright">For Developers</p>
              <span className="h-px flex-1 bg-gradient-to-r from-flame-primary/50 to-transparent" />
            </div>

            <h2 className="mt-4 font-heading text-4xl font-bold leading-[1.05] text-white sm:text-5xl">
              <span className="block overflow-hidden">
                <span data-heading-mask className="inline-block">
                  Build security into
                </span>
              </span>
              <span className="block overflow-hidden">
                <span data-heading-mask className="inline-block">
                  anything.
                  <span className="caret-blink ml-1.5 inline-block h-9 w-[5px] translate-y-1 bg-flame-primary align-middle sm:h-10" />
                </span>
              </span>
            </h2>

            <p data-left-bit className="mt-4 max-w-md text-base leading-relaxed text-muted">
              One REST API for URL, file, domain and IP intelligence. Rate-limited, versioned and built for
              production traffic.
            </p>

            <div data-left-bit className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/dashboard/api-keys"
                className="inline-flex h-13 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-flame-primary px-7 text-base font-semibold tracking-wide text-white shadow-[0_0_0_1px_rgba(255,90,0,0.4),0_8px_24px_-8px_rgba(255,90,0,0.55)] transition-colors duration-200 hover:bg-flame-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-black"
              >
                <KeyRound className="h-4 w-4" /> Get API Key
              </Link>
              <Link
                href="/docs"
                className="inline-flex h-13 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-white/15 bg-transparent px-7 text-base font-semibold tracking-wide text-white transition-colors duration-200 hover:border-flame-primary/60 hover:text-flame-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-black"
              >
                <BookOpen className="h-4 w-4" /> View Documentation
              </Link>
            </div>

            <div data-left-bit className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {CHIPS.map((c) => (
                <div key={c.label} className="flex items-center gap-2 rounded-sm border border-border-subtle bg-card-bg px-3 py-2.5">
                  <c.icon className="h-4 w-4 shrink-0 text-flame-bright" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-soft-white">{c.label}</span>
                </div>
              ))}
            </div>

            <div data-left-bit className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border-subtle pt-6">
              {METRICS.map((m) => (
                <div key={m.label} className="flex items-center gap-2.5">
                  <m.icon className="h-4 w-4 text-flame-bright" />
                  <div>
                    {m.value && <p className="font-heading text-2xl font-bold text-white">{m.value}</p>}
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">{m.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <p data-left-bit className="mt-6 text-xs text-muted">
              Typed SDKs &bull; Clear documentation &bull; Production-ready
            </p>
          </div>

          {/* right playground */}
          <div>
            <ApiPlayground />
          </div>
        </div>
      </div>
    </section>
  );
}
