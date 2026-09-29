"use client";

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { gsap } from "gsap";

export type FoldTextHinge = "left" | "right" | "top" | "bottom";

export interface FoldTextProps {
  text: string;
  perspective?: number;
  hinge?: FoldTextHinge;
  ease?: string;
  duration?: number;
  /** Opacity of the crease shadow at the fully-folded starting position (0-1); fades out as
   *  each word unfolds flat. */
  creaseShading?: number;
  stagger?: number;
  fontWeight?: number | string;
  className?: string;
  style?: CSSProperties;
}

const WORD_SPLIT = /(\s+)/;

/** React Bits-style "Fold Text": each word starts folded back along a hinge edge (like a page
 *  opening) with a dark crease-shadow overlay, then unfolds flat while the shadow fades. */
export default function FoldText({
  text,
  perspective = 800,
  hinge = "left",
  ease = "power2.out",
  duration = 0.8,
  creaseShading = 0.5,
  stagger = 0.05,
  fontWeight,
  className = "",
  style = {},
}: FoldTextProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const tokens = useMemo(() => text.split(WORD_SPLIT), [text]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const cells = root.querySelectorAll<HTMLElement>("[data-fold-word]");
    const shades = root.querySelectorAll<HTMLElement>("[data-fold-shade]");
    if (!cells.length) return;

    const axisProp = hinge === "left" || hinge === "right" ? "rotationY" : "rotationX";
    const startAngle = hinge === "left" || hinge === "top" ? -85 : 85;
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      gsap.set(cells, { [axisProp]: 0, opacity: 1 });
      gsap.set(shades, { opacity: 0 });
      return;
    }

    gsap.set(cells, { [axisProp]: startAngle, opacity: 0, transformPerspective: perspective });
    gsap.set(shades, { opacity: creaseShading });

    const tl = gsap.timeline();
    tl.to(cells, { [axisProp]: 0, opacity: 1, duration, ease, stagger }, 0);
    tl.to(shades, { opacity: 0, duration: duration * 0.85, ease: "power1.out", stagger }, 0);

    return () => {
      tl.kill();
    };
  }, [text, perspective, hinge, ease, duration, creaseShading, stagger]);

  const transformOrigin =
    hinge === "left" ? "left center" : hinge === "right" ? "right center" : hinge === "top" ? "center top" : "center bottom";

  const creaseGradient =
    hinge === "left"
      ? "linear-gradient(to right, rgba(0,0,0,0.9), transparent 70%)"
      : hinge === "right"
        ? "linear-gradient(to left, rgba(0,0,0,0.9), transparent 70%)"
        : hinge === "top"
          ? "linear-gradient(to bottom, rgba(0,0,0,0.9), transparent 70%)"
          : "linear-gradient(to top, rgba(0,0,0,0.9), transparent 70%)";

  return (
    <span ref={rootRef} className={className} style={{ ...style, fontWeight }}>
      {tokens.map((token, i) =>
        /^\s+$/.test(token) ? (
          <span key={i}>{token}</span>
        ) : (
          <span
            key={i}
            data-fold-word
            className="relative inline-block"
            style={{ transformStyle: "preserve-3d", transformOrigin }}
          >
            {token}
            <span
              data-fold-shade
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-sm"
              style={{ background: creaseGradient }}
            />
          </span>
        ),
      )}
    </span>
  );
}
