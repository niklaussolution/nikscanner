"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { THREAT_ROUTES } from "@/lib/data/threat-routes";
import type { GlobeConfig, Position } from "@/components/ui/globe";

// WebGL can't render on the server — load the globe client-side only.
const World = dynamic(() => import("@/components/ui/globe").then((m) => m.World), { ssr: false });

const ARC_COLORS = ["#ff5a00", "#ff7a1a", "#ff3d00"];

const toRad = (d: number) => (d * Math.PI) / 180;

/** Great-circle angle between two points, in degrees — used to lift longer arcs higher. */
function angularDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const a =
    Math.sin(toRad(lat2 - lat1) / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(toRad(lng2 - lng1) / 2) ** 2;
  return (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 180) / Math.PI;
}

const ARCS: Position[] = THREAT_ROUTES.map((r, i) => {
  const [startLng, startLat] = r.from;
  const [endLng, endLat] = r.to;
  const angle = angularDistance(startLat, startLng, endLat, endLng);
  return {
    // Doubles as the dash's initial gap (in arc lengths), so keep it small — a route swapped
    // in later should start drawing within a cycle or two, not after ten.
    order: i % 3,
    startLat,
    startLng,
    endLat,
    endLng,
    arcAlt: Math.min(0.5, Math.max(0.1, (angle / 180) * 0.6)),
    color: ARC_COLORS[i % ARC_COLORS.length],
  };
});

const GLOBE_CONFIG: GlobeConfig = {
  pointSize: 4,
  globeColor: "#241810",
  showAtmosphere: true,
  atmosphereColor: "#ff6a10",
  atmosphereAltitude: 0.18,
  emissive: "#ff5a00",
  emissiveIntensity: 0.04,
  shininess: 0.9,
  polygonColor: "rgba(255,150,70,1)",
  ambientLight: "#ffffff",
  directionalLeftLight: "#ffffff",
  directionalTopLight: "#ffffff",
  pointLight: "#ffffff",
  arcTime: 1400,
  arcLength: 0.9,
  rings: 1,
  maxRings: 3,
  initialPosition: { lat: 22.3193, lng: 114.1694 },
  autoRotate: true,
  autoRotateSpeed: 0.5,
};

const VISIBLE_ARCS = 10;
const SWAP_INTERVAL_MS = 2500;

/** Demo telemetry: shows a rolling subset of routes, swapping one route (and so its endpoint
 *  points) for a different one each interval, rather than a fixed static set. The same arc
 *  objects are reused across swaps so routes that stay on screen keep animating uninterrupted. */
export function ThreatGlobe({ className }: { className?: string }) {
  const [visible, setVisible] = useState<number[]>(() => ARCS.slice(0, VISIBLE_ARCS).map((_, i) => i));

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setVisible((prev) => {
        const hidden = ARCS.map((_, i) => i).filter((i) => !prev.includes(i));
        if (hidden.length === 0) return prev;
        const next = [...prev];
        next[Math.floor(Math.random() * next.length)] = hidden[Math.floor(Math.random() * hidden.length)];
        return next;
      });
    }, SWAP_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const data = useMemo(() => visible.map((i) => ARCS[i]), [visible]);

  return (
    <div className={cn("relative", className)}>
      <World data={data} globeConfig={GLOBE_CONFIG} />
    </div>
  );
}
