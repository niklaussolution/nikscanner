"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { Shield } from "lucide-react";
import { publicJson } from "@/lib/firebase/api";
import type { LeaderboardResult } from "@/lib/firebase/nikscanner-types";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
}

const VB_W = 800;
const VB_H = 400;
const CX = VB_W / 2;
const CY = VB_H / 2;

interface NodeDef {
  id: string;
  reports: number;
  x: number;
  y: number;
  side: "left" | "right";
}

// Same 8 fixed slot positions the hand-drawn network always used — real leaders are dropped
// into these slots by rank, so the layout never changes, only who's shown in it.
const POSITIONS: Omit<NodeDef, "id" | "reports">[] = [
  { x: 110, y: 60, side: "left" },
  { x: 90, y: 155, side: "left" },
  { x: 90, y: 250, side: "left" },
  { x: 110, y: 340, side: "left" },
  { x: 690, y: 60, side: "right" },
  { x: 710, y: 155, side: "right" },
  { x: 710, y: 250, side: "right" },
  { x: 690, y: 340, side: "right" },
];

/** Same 2-letter monogram convention MonogramAvatar uses elsewhere on the site (e.g. the
 *  leaderboard) — first letter of up to the first two "words" in the display name. */
function initialsFor(name: string): string {
  const parts = name.split(/[_\-\s]/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase());
  return parts.join("") || name.slice(0, 2).toUpperCase();
}

function nodePath(n: NodeDef) {
  const mx = n.x + (CX - n.x) * 0.55;
  return `M${n.x},${n.y} C${mx},${n.y} ${mx},${CY} ${CX},${CY}`;
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function SignalNetwork() {
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<NodeDef[]>([]);

  useEffect(() => {
    let cancelled = false;
    publicJson<LeaderboardResult>("/api/leaderboard?limit=8")
      .then((res) => {
        if (cancelled) return;
        setNodes(res.leaders.slice(0, 8).map((leader, i) => ({ ...POSITIONS[i], id: initialsFor(leader.name), reports: leader.count })));
      })
      .catch(() => {
        // Non-fatal — the network just renders with no nodes until this succeeds.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const svg = svgRef.current;
    if (!root || !svg || nodes.length === 0) return;
    const reduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      const nodeEls = root.querySelectorAll<HTMLElement>("[data-net-node]");
      gsap.fromTo(
        nodeEls,
        { opacity: 0, scale: 0.6 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: "back.out(1.7)",
          scrollTrigger: { trigger: root, start: "top 82%", once: true },
        },
      );

      const paths = svg.querySelectorAll<SVGPathElement>("[data-net-path]");
      paths.forEach((path, i) => {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 1.1,
          delay: 0.2 + i * 0.07,
          ease: "power2.inOut",
          scrollTrigger: { trigger: root, start: "top 82%", once: true },
        });
      });

      gsap.fromTo(
        "[data-net-hub]",
        { opacity: 0, scale: 0.7 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "back.out(1.6)",
          scrollTrigger: { trigger: root, start: "top 82%", once: true },
        },
      );

      if (!reduced) {
        paths.forEach((path, i) => {
          const packet = svg.querySelector<SVGCircleElement>(`[data-net-packet="${i}"]`);
          if (!packet) return;
          gsap.to(packet, {
            motionPath: { path, align: path, alignOrigin: [0.5, 0.5] },
            duration: 2.2,
            repeat: -1,
            delay: 1 + i * 0.25,
            ease: "power1.inOut",
          });
        });

        svg.querySelectorAll<SVGCircleElement>("[data-hub-pulse]").forEach((ring, i) => {
          gsap.fromTo(
            ring,
            { attr: { r: 34 }, opacity: 0.7 },
            { attr: { r: 90 }, opacity: 0, duration: 2.6, repeat: -1, delay: i * 0.9, ease: "power1.out" },
          );
        });
      }
    }, root);

    return () => ctx.revert();
  }, [nodes]);

  return (
    <div ref={rootRef} className="relative mt-10">
      <p className="text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-muted">
        Collective Signal Network
      </p>

      <div className="relative mx-auto mt-4 aspect-[800/400] w-full max-w-2xl">
        <svg ref={svgRef} viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="netRouteGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ff5a00" stopOpacity="0.1" />
              <stop offset="60%" stopColor="#ff7a1a" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#ff5a00" stopOpacity="0.9" />
            </linearGradient>
            <radialGradient id="netGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ff5a00" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#ff5a00" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect x="0" y="0" width={VB_W} height={VB_H} fill="url(#netGlow)" />

          {nodes.map((n, i) => (
            <path key={`path-${i}`} data-net-path d={nodePath(n)} fill="none" stroke="url(#netRouteGradient)" strokeWidth="1.4" />
          ))}
          {nodes.map((n, i) => (
            <circle key={`p-${i}`} data-net-packet={i} r="2.6" fill="#fff3e8" opacity="0.95" />
          ))}

          <circle data-hub-pulse cx={CX} cy={CY} r="34" fill="none" stroke="rgba(255,90,0,0.35)" strokeWidth="1.5" />
          <circle data-hub-pulse cx={CX} cy={CY} r="34" fill="none" stroke="rgba(255,90,0,0.35)" strokeWidth="1.5" />
        </svg>

        {/* central hub */}
        <div data-net-hub className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center pt-10">
          <div className="flex h-[84px] w-[84px] items-center justify-center rounded-full border border-flame-primary/50 bg-card-bg shadow-[0_0_40px_-4px_rgba(255,90,0,0.55)]">
            <Shield className="h-8 w-8 text-flame-bright" fill="rgba(255,90,0,0.18)" />
          </div>
          <p className="mt-2.5 text-sm font-bold text-white">NIKSCANNER</p>
          <p className="text-[9px] font-semibold uppercase tracking-widest text-muted">Intelligence Engine</p>
        </div>

        {/* node badges */}
        {nodes.map((n, i) => (
          <div
            key={`node-${i}`}
            data-net-node
            className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2"
            style={{ left: `${(n.x / VB_W) * 100}%`, top: `${(n.y / VB_H) * 100}%`, flexDirection: n.side === "right" ? "row-reverse" : "row" }}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-card-bg text-[10px] font-bold text-white shadow-lg shadow-black/40 sm:h-11 sm:w-11 sm:text-sm">
              {n.id}
            </span>
            <span
              className={`hidden whitespace-nowrap text-[11px] leading-tight text-muted sm:inline ${n.side === "right" ? "text-right" : "text-left"}`}
            >
              Contributed
              <br />
              <span className="text-soft-white">{n.reports} reports</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
