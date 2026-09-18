"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { generateWorldDots, project, type LonLat } from "@/lib/data/world-continents";

const VB_W = 1000;
const VB_H = 500;

// const LOCATIONS = {
//   singapore: [103.8, 1.35] as LonLat,
//   frankfurt: [8.68, 50.11] as LonLat,
//   newYork: [-74, 40.7] as LonLat,
//   saoPaulo: [-46.6, -23.5] as LonLat,
//   lagos: [3.4, 6.5] as LonLat,
//   moscow: [37.6, 55.75] as LonLat,
//   mumbai: [72.8, 19.07] as LonLat,
//   tokyo: [139.7, 35.68] as LonLat,
//   sydney: [151.2, -33.87] as LonLat,
//   london: [-0.12, 51.5] as LonLat,
// };

const LOCATIONS = {
  // Asia
  singapore: [103.8, 1.35] as LonLat,
  mumbai: [72.8, 19.07] as LonLat,
  tokyo: [139.7, 35.68] as LonLat,
  seoul: [126.98, 37.57] as LonLat,
  beijing: [116.4, 39.9] as LonLat,
  bangkok: [100.5, 13.75] as LonLat,
  jakarta: [106.85, -6.2] as LonLat,

  // Europe
  frankfurt: [8.68, 50.11] as LonLat,
  london: [-0.12, 51.5] as LonLat,
  paris: [2.35, 48.85] as LonLat,
  amsterdam: [4.9, 52.37] as LonLat,
  moscow: [37.6, 55.75] as LonLat,
  istanbul: [28.97, 41.01] as LonLat,

  // North America
  newYork: [-74, 40.7] as LonLat,
  losAngeles: [-118.24, 34.05] as LonLat,
  sanFrancisco: [-122.42, 37.77] as LonLat,
  seattle: [-122.33, 47.61] as LonLat,
  toronto: [-79.38, 43.65] as LonLat,
  chicago: [-87.63, 41.88] as LonLat,

  // South America
  saoPaulo: [-46.6, -23.5] as LonLat,
  buenosAires: [-58.38, -34.6] as LonLat,
  santiago: [-70.67, -33.45] as LonLat,

  // Africa
  lagos: [3.4, 6.5] as LonLat,
  cairo: [31.24, 30.04] as LonLat,
  nairobi: [36.82, -1.29] as LonLat,
  johannesburg: [28.05, -26.2] as LonLat,

  // Australia
  sydney: [151.2, -33.87] as LonLat,
  melbourne: [144.96, -37.81] as LonLat,

  // Middle East
  dubai: [55.27, 25.2] as LonLat,
};

const ROUTES: { from: LonLat; to: LonLat; delay: number }[] = [
  { from: LOCATIONS.singapore, to: LOCATIONS.frankfurt, delay: 0 },
  { from: LOCATIONS.moscow, to: LOCATIONS.frankfurt, delay: 0.6 },
  { from: LOCATIONS.mumbai, to: LOCATIONS.frankfurt, delay: 1.2 },
  { from: LOCATIONS.newYork, to: LOCATIONS.sydney, delay: 0.3 },
  { from: LOCATIONS.saoPaulo, to: LOCATIONS.newYork, delay: 0.9 },
  { from: LOCATIONS.lagos, to: LOCATIONS.sydney, delay: 1.5 },
  { from: LOCATIONS.tokyo, to: LOCATIONS.london, delay: 0.45 },
  { from: LOCATIONS.singapore, to: LOCATIONS.sydney, delay: 1.8 },
];

// const ROUTES: { from: LonLat; to: LonLat; delay: number }[] = [
//   // Asia → Europe
//   { from: LOCATIONS.singapore, to: LOCATIONS.frankfurt, delay: 0 },
//   { from: LOCATIONS.mumbai, to: LOCATIONS.frankfurt, delay: 1.2 },
//   { from: LOCATIONS.tokyo, to: LOCATIONS.london, delay: 0.45 },
//   { from: LOCATIONS.seoul, to: LOCATIONS.paris, delay: 1.05 },
//   // { from: LOCATIONS.beijing, to: LOCATIONS.amsterdam, delay: 1.65 },
//   // { from: LOCATIONS.bangkok, to: LOCATIONS.london, delay: 2.1 },

//   // Asia → Australia
//   { from: LOCATIONS.singapore, to: LOCATIONS.sydney, delay: 1.8 },
//   { from: LOCATIONS.tokyo, to: LOCATIONS.sydney, delay: 2.4 },
//   { from: LOCATIONS.seoul, to: LOCATIONS.melbourne, delay: 2.85 },
//   // { from: LOCATIONS.mumbai, to: LOCATIONS.sydney, delay: 3.2 },

//   // Europe → North America
//   { from: LOCATIONS.london, to: LOCATIONS.newYork, delay: 0.25 },
//   { from: LOCATIONS.frankfurt, to: LOCATIONS.newYork, delay: 0.75 },
//   { from: LOCATIONS.paris, to: LOCATIONS.toronto, delay: 1.35 },
//   // { from: LOCATIONS.amsterdam, to: LOCATIONS.chicago, delay: 1.9 },

//   // North America → Asia
//   { from: LOCATIONS.newYork, to: LOCATIONS.tokyo, delay: 0.4 },
//   { from: LOCATIONS.sanFrancisco, to: LOCATIONS.singapore, delay: 1.1 },
//   { from: LOCATIONS.losAngeles, to: LOCATIONS.tokyo, delay: 1.7 },
//   // { from: LOCATIONS.seattle, to: LOCATIONS.seoul, delay: 2.3 },

//   // North America → Australia
//   { from: LOCATIONS.newYork, to: LOCATIONS.sydney, delay: 0.3 },
//   { from: LOCATIONS.losAngeles, to: LOCATIONS.sydney, delay: 1.4 },
//   { from: LOCATIONS.sanFrancisco, to: LOCATIONS.melbourne, delay: 2.0 },

//   // South America → North America
//   { from: LOCATIONS.saoPaulo, to: LOCATIONS.newYork, delay: 0.9 },
//   // { from: LOCATIONS.buenosAires, to: LOCATIONS.miami, delay: 1.6 },
//   { from: LOCATIONS.santiago, to: LOCATIONS.losAngeles, delay: 2.2 },

//   // Africa → Europe
//   { from: LOCATIONS.lagos, to: LOCATIONS.london, delay: 0.55 },
//   { from: LOCATIONS.johannesburg, to: LOCATIONS.frankfurt, delay: 1.25 },
//   { from: LOCATIONS.cairo, to: LOCATIONS.paris, delay: 1.85 },

//   // Africa → Asia / Australia
//   { from: LOCATIONS.lagos, to: LOCATIONS.singapore, delay: 2.5 },
//   { from: LOCATIONS.nairobi, to: LOCATIONS.mumbai, delay: 3.0 },
//   { from: LOCATIONS.johannesburg, to: LOCATIONS.sydney, delay: 3.6 },

//   // Europe → Asia
//   { from: LOCATIONS.moscow, to: LOCATIONS.frankfurt, delay: 0.6 },
//   { from: LOCATIONS.moscow, to: LOCATIONS.tokyo, delay: 1.15 },
//   { from: LOCATIONS.london, to: LOCATIONS.singapore, delay: 1.75 },
//   { from: LOCATIONS.frankfurt, to: LOCATIONS.mumbai, delay: 2.35 },

//   // Europe → Middle East / Asia
//   { from: LOCATIONS.london, to: LOCATIONS.dubai, delay: 2.8 },
//   { from: LOCATIONS.frankfurt, to: LOCATIONS.dubai, delay: 3.25 },
//   { from: LOCATIONS.istanbul, to: LOCATIONS.mumbai, delay: 3.7 },
// ];


const IMPACT_POINTS: LonLat[] = [LOCATIONS.frankfurt, LOCATIONS.sydney, LOCATIONS.newYork];
const ORIGIN_POINTS: LonLat[] = [LOCATIONS.singapore, LOCATIONS.moscow, LOCATIONS.mumbai, LOCATIONS.lagos];

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function routePath(from: LonLat, to: LonLat) {
  const [x1, y1] = project(from, VB_W, VB_H);
  const [x2, y2] = project(to, VB_W, VB_H);
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 - Math.min(90, Math.abs(x1 - x2) * 0.28);
  return { d: `M${x1},${y1} Q${mx},${my} ${x2},${y2}`, x1, y1, x2, y2 };
}

export function ThreatMap({ className }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dots = useMemo(() => generateWorldDots(VB_W, VB_H, 9), []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const reduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      const paths = svg.querySelectorAll<SVGPathElement>("[data-route]");
      paths.forEach((path, i) => {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 1.8,
          delay: 0.2 + i * 0.12,
          ease: "power2.inOut",
        });
      });

      if (!reduced) {
        // travelling packets along each route
        paths.forEach((path, i) => {
          const packet = svg.querySelector<SVGCircleElement>(`[data-packet="${i}"]`);
          if (!packet) return;
          gsap.to(packet, {
            motionPath: { path, align: path, alignOrigin: [0.5, 0.5] },
            duration: 2.6,
            repeat: -1,
            delay: 1.2 + i * 0.35,
            ease: "power1.inOut",
          });
        });

        // origin pulse rings
        svg.querySelectorAll<SVGCircleElement>("[data-origin-ring]").forEach((ring, i) => {
          gsap.fromTo(
            ring,
            { attr: { r: 3 }, opacity: 0.8 },
            { attr: { r: 16 }, opacity: 0, duration: 2, repeat: -1, delay: i * 0.4, ease: "power1.out" },
          );
        });

        // target impact rings
        svg.querySelectorAll<SVGCircleElement>("[data-impact-ring]").forEach((ring, i) => {
          gsap.fromTo(
            ring,
            { attr: { r: 4 }, opacity: 0.9 },
            { attr: { r: 22 }, opacity: 0, duration: 1.6, repeat: -1, delay: 0.5 + i * 0.5, ease: "power2.out" },
          );
        });

        // radar sweep rotation
        const sweep = svg.querySelector<SVGGElement>("[data-radar-sweep]");
        if (sweep) {
          gsap.to(sweep, { rotate: 360, duration: 10, repeat: -1, ease: "linear", transformOrigin: "500px 250px" });
        }
      }
    }, svg);

    return () => ctx.revert();
  }, []);

  return (
    <div className={className}>
      <svg ref={svgRef} viewBox={`0 0 ${VB_W} ${VB_H}`} className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="mapGlow" cx="55%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#ff5a00" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#ff5a00" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="routeGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ff5a00" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#ff7a1a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ff5a00" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width={VB_W} height={VB_H} fill="#050505" />
        <rect x="0" y="0" width={VB_W} height={VB_H} fill="url(#mapGlow)" />

        {/* lat/long grid */}
        {Array.from({ length: 13 }).map((_, i) => (
          <line key={`v${i}`} x1={(i * VB_W) / 12} y1="0" x2={(i * VB_W) / 12} y2={VB_H} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        ))}
        {Array.from({ length: 7 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={(i * VB_H) / 6} x2={VB_W} y2={(i * VB_H) / 6} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        ))}

        {/* faint radar rings + sweep, centered on the map */}
        {/* <circle cx={VB_W / 2} cy={VB_H / 2} r="230" fill="none" stroke="rgba(255,90,0,0.08)" strokeWidth="1" />
        <circle cx={VB_W / 2} cy={VB_H / 2} r="150" fill="none" stroke="rgba(255,90,0,0.08)" strokeWidth="1" />
        <circle cx={VB_W / 2} cy={VB_H / 2} r="70" fill="none" stroke="rgba(255,90,0,0.08)" strokeWidth="1" /> */}



        <g>
          <circle
            cx={VB_W / 2}
            cy={VB_H / 2}
            r="230"
            fill="none"
            stroke="rgba(255,90,0,0.08)"
            strokeWidth="1"
            className="origin-center animate-pulse"
          />

          <circle
            cx={VB_W / 2}
            cy={VB_H / 2}
            r="150"
            fill="none"
            stroke="rgba(255,90,0,0.08)"
            strokeWidth="1"
            className="origin-center animate-pulse [animation-delay:300ms]"
          />

          <circle
            cx={VB_W / 2}
            cy={VB_H / 2}
            r="70"
            fill="none"
            stroke="rgba(255,90,0,0.08)"
            strokeWidth="1"
            className="origin-center animate-pulse [animation-delay:600ms]"
          />
        </g>






        {/* dotted world map */}
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.major ? 1.6 : 1} fill="#ff7a1a" opacity={d.major ? 0.55 : 0.32} />
        ))}

        {/* attack routes */}
        {ROUTES.map((r, i) => {
          const { d } = routePath(r.from, r.to);
          return (
            <path key={i} data-route d={d} fill="none" stroke="url(#routeGradient)" strokeWidth="1.4" strokeLinecap="round" />
          );
        })}
        {ROUTES.map((r, i) => (
          <circle key={`p${i}`} data-packet={i} r="3" fill="#fff3e8" opacity="0.95" />
        ))}

        {/* origins */}
        {ORIGIN_POINTS.map((loc, i) => {
          const [x, y] = project(loc, VB_W, VB_H);
          return (
            <g key={i}>
              <circle data-origin-ring cx={x} cy={y} r="3" fill="none" stroke="#ff7a1a" strokeWidth="1.5" />
              <circle cx={x} cy={y} r="3" fill="#ff5a00" />
            </g>
          );
        })}

        {/* impact points */}
        {IMPACT_POINTS.map((loc, i) => {
          const [x, y] = project(loc, VB_W, VB_H);
          return (
            <g key={i}>
              <circle data-impact-ring cx={x} cy={y} r="4" fill="none" stroke="#ff3d00" strokeWidth="1.5" />
              <circle cx={x} cy={y} r="5" fill="#050505" stroke="#ff5a00" strokeWidth="1.5" />
              <circle cx={x} cy={y} r="2.2" fill="#ff5a00" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
