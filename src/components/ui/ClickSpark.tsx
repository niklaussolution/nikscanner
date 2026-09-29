"use client";

import { useEffect, useRef, useState, useCallback, type ReactNode, type CSSProperties } from "react";

export type ClickSparkEasing = "linear" | "ease-in" | "ease-in-out" | "ease-out";

export interface ClickSparkProps {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  easing?: ClickSparkEasing;
  extraScale?: number;
  /** Runs its own looping demo — a cursor glides in, clicks, sparks fire — on this interval in
   *  ms, so the effect is visible without a real visitor clicking. Set to 0 to disable. */
  autoClickIntervalMs?: number;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

interface Spark {
  x: number;
  y: number;
  angle: number;
  startTime: number;
}

function easeFor(easing: ClickSparkEasing) {
  switch (easing) {
    case "linear":
      return (t: number) => t;
    case "ease-in":
      return (t: number) => t * t;
    case "ease-in-out":
      return (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
    default:
      return (t: number) => t * (2 - t);
  }
}

/** A small arrow-style cursor used to demo the click interaction on an interval. */
function Cursor({ pressed }: { pressed: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      className={pressed ? "scale-90" : ""}
      style={{ transition: "transform 0.15s ease-out", filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.5))" }}
    >
      <path
        d="M2 1.5 L2 15 L5.6 11.7 L8 17 L10.2 16 L7.8 10.7 L13 10.3 Z"
        fill="#ffffff"
        stroke="#111111"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** React Bits-style "Click Spark": bursts spark lines outward from a click point on a canvas
 *  layered behind the children. Also runs a looping demo — a cursor glides in, clicks, and
 *  triggers the burst — so the effect is visible without requiring a real click; still responds
 *  to a real click too. */
export default function ClickSpark({
  sparkColor = "#ff5a00",
  sparkSize = 10,
  sparkRadius = 18,
  sparkCount = 8,
  duration = 450,
  easing = "ease-out",
  extraScale = 1,
  autoClickIntervalMs = 3400,
  children,
  className = "",
  style = {},
}: ClickSparkProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);
  const easeFunc = easeFor(easing);
  const [cursor, setCursor] = useState<{ x: number; y: number; visible: boolean; pressed: boolean }>({
    x: 0,
    y: 0,
    visible: false,
    pressed: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = wrap.offsetWidth;
      canvas.height = wrap.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = performance.now();
      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = now - spark.startTime;
        if (elapsed >= duration) return false;
        const progress = elapsed / duration;
        const eased = easeFunc(progress);
        const distance = eased * sparkRadius * extraScale;
        const lineLength = sparkSize * (1 - eased);
        const x1 = spark.x + distance * Math.cos(spark.angle);
        const y1 = spark.y + distance * Math.sin(spark.angle);
        const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
        const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);
        ctx.strokeStyle = sparkColor;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 1 - progress;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        return true;
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [sparkColor, sparkSize, sparkRadius, sparkCount, duration, extraScale, easeFunc]);

  const spawnSparks = useCallback(
    (x: number, y: number) => {
      const now = performance.now();
      for (let i = 0; i < sparkCount; i++) {
        sparksRef.current.push({ x, y, angle: (2 * Math.PI * i) / sparkCount, startTime: now });
      }
    },
    [sparkCount],
  );

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    spawnSparks(e.clientX - rect.left, e.clientY - rect.top);
  }

  useEffect(() => {
    if (!autoClickIntervalMs) return;
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let cancelled = false;
    const timeouts: number[] = [];
    const t = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
      timeouts.push(id);
    };

    function cycle() {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const targetX = wrap.offsetWidth * 0.6;
      const targetY = wrap.offsetHeight * 0.55;

      setCursor({ x: targetX + 42, y: targetY - 32, visible: true, pressed: false });
      t(() => setCursor({ x: targetX, y: targetY, visible: true, pressed: false }), 40);
      t(() => {
        setCursor({ x: targetX, y: targetY, visible: true, pressed: true });
        spawnSparks(targetX, targetY);
      }, 780);
      t(() => setCursor({ x: targetX, y: targetY, visible: true, pressed: false }), 940);
      t(() => setCursor((c) => ({ ...c, visible: false })), 1300);
      t(cycle, autoClickIntervalMs);
    }

    t(cycle, 1200);

    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, [autoClickIntervalMs, spawnSparks]);

  return (
    <div
      ref={wrapRef}
      onClick={handleClick}
      className={`relative inline-block cursor-pointer ${className}`.trim()}
      style={{ ...style }}
    >
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 z-0" />
      <span className="relative z-10">{children}</span>
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-20 transition-opacity duration-200"
        style={{
          opacity: cursor.visible ? 1 : 0,
          transform: `translate(${cursor.x}px, ${cursor.y}px)`,
          transition: "transform 0.7s cubic-bezier(0.4,0,0.2,1), opacity 0.2s",
        }}
      >
        <Cursor pressed={cursor.pressed} />
      </span>
    </div>
  );
}
