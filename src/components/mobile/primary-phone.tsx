"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Wifi, Battery, Globe, Link as LinkIcon, Smartphone, ChevronRight, ScanLine, Home, Bell, User, ShieldCheck } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const ROWS = [
  { icon: Globe, label: "APK Protection" },
  { icon: LinkIcon, label: "URL Scanner" },
  { icon: Smartphone, label: "Device Security" },
];

const NAV = [
  { icon: Home, label: "Home", active: true },
  { icon: ScanLine, label: "Scan", active: false },
  { icon: Bell, label: "Alerts", active: false },
  { icon: User, label: "Profile", active: false },
];

const R = 42;
const CIRC = 2 * Math.PI * R;

export function PrimaryPhone({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    const circle = circleRef.current;
    if (!root || !circle) return;

    gsap.set(circle, { strokeDasharray: CIRC, strokeDashoffset: CIRC });

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root,
        start: "top 85%",
        once: true,
        onEnter: () => {
          const obj = { v: 0 };
          gsap.to(obj, {
            v: 94,
            duration: 1.6,
            delay: 0.5,
            ease: "power2.out",
            onUpdate: () => {
              setScore(Math.round(obj.v));
              gsap.set(circle, { strokeDashoffset: CIRC * (1 - obj.v / 100) });
            },
          });

          gsap.fromTo(
            "[data-phone-row]",
            { opacity: 0, x: -8 },
            { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, delay: 1.1, ease: "power2.out" },
          );
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className={className}>
      <div className="relative aspect-[375/812] w-full overflow-hidden rounded-[2.6rem] border-[6px] border-[#1a1a1a] bg-black shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
        {/* camera cutout */}
        <div className="absolute left-1/2 top-2.5 z-30 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-black ring-2 ring-white/10" />

        <div className="flex h-full flex-col bg-gradient-to-b from-[#0c0c0c] to-black px-4 pb-3 pt-6">
          {/* status bar */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-soft-white">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              <Battery className="h-3.5 w-3.5" />
              <span>100%</span>
            </div>
          </div>

          {/* wordmark */}
          <div className="mt-4 flex items-center justify-between">
            <p className="font-heading text-sm font-bold tracking-tight text-white">
              NIK<span className="text-flame-bright">SCANNER</span>
            </p>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-glow" /> Online
            </span>
          </div>

          {/* score ring */}
          <div className="mt-6 flex flex-col items-center">
            <div className="relative h-32 w-32">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
                <circle
                  ref={circleRef}
                  cx="50"
                  cy="50"
                  r={R}
                  fill="none"
                  stroke="url(#scoreGradient)"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ff5a00" />
                    <stop offset="100%" stopColor="#ff7a1a" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[7px] uppercase tracking-widest text-muted">Security Score</p>
                <p className="font-heading text-3xl font-bold text-white">{score}%</p>
              </div>
            </div>
            <p className="mt-2 flex items-center gap-1 text-[11px] font-bold text-success">
              <ShieldCheck className="h-3.5 w-3.5" /> Device Protected
            </p>
          </div>

          {/* protection rows */}
          <div className="mt-5 space-y-2">
            {ROWS.map((row) => (
              <div
                key={row.label}
                data-phone-row
                className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.04] px-3 py-2.5"
              >
                <span className="flex items-center gap-2 text-[11px] font-medium text-soft-white">
                  <row.icon className="h-3.5 w-3.5 text-flame-bright" /> {row.label}
                </span>
                <span className="flex items-center gap-0.5 text-[10px] font-semibold text-success">
                  Active <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            ))}
          </div>

          {/* scan button */}
          <button
            type="button"
            className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-flame-primary to-flame-bright py-3 text-xs font-bold uppercase tracking-wide text-white shadow-[0_8px_24px_-8px_rgba(255,90,0,0.6)]"
          >
            <ScanLine className="h-4 w-4" /> Scan Device
          </button>

          {/* bottom nav */}
          <div className="mt-auto flex items-center justify-between pt-4">
            {NAV.map((n) => (
              <div key={n.label} className={`flex flex-col items-center gap-1 text-[9px] font-medium ${n.active ? "text-flame-bright" : "text-muted"}`}>
                <n.icon className="h-4 w-4" />
                {n.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
