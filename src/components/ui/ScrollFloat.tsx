"use client";

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export type ScrollFloatSplit = "chars" | "words";

export interface ScrollFloatProps {
  text: string;
  splitBy?: ScrollFloatSplit;
  /** Starting vertical offset (px) each piece floats up from. */
  yStart?: number;
  stagger?: number;
  ease?: string;
  scrollStart?: string;
  scrollEnd?: string;
  /** How tightly the animation follows scroll position vs. playing out on its own; a number
   *  (seconds) smooths the catch-up, `true` ties it 1:1 to scroll. */
  scrub?: number | boolean;
  className?: string;
  style?: CSSProperties;
}

const WORD_SPLIT = /(\s+)/;

/** React Bits-style "Scroll Float": splits text into characters or words that float up from
 *  below and fade in as the element scrolls through view, scrubbed to scroll position rather
 *  than firing once. */
export default function ScrollFloat({
  text,
  splitBy = "chars",
  yStart = 40,
  stagger = 0.03,
  ease = "power2.out",
  scrollStart = "top bottom-=60",
  scrollEnd = "bottom center",
  scrub = 0.4,
  className = "",
  style = {},
}: ScrollFloatProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const pieces = useMemo(
    () => (splitBy === "chars" ? Array.from(text) : text.split(WORD_SPLIT)),
    [text, splitBy],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const targets = root.querySelectorAll<HTMLElement>("[data-float-piece]");
    if (!targets.length) return;

    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.set(targets, { y: 0, opacity: 1 });
      return;
    }

    gsap.set(targets, { y: yStart, opacity: 0 });
    const tween = gsap.to(targets, {
      y: 0,
      opacity: 1,
      ease,
      stagger,
      scrollTrigger: {
        trigger: root,
        start: scrollStart,
        end: scrollEnd,
        scrub,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [text, splitBy, yStart, stagger, ease, scrollStart, scrollEnd, scrub]);

  return (
    <span ref={rootRef} className={className} style={{ whiteSpace: "nowrap", ...style }}>
      {pieces.map((piece, i) =>
        splitBy === "words" && /^\s+$/.test(piece) ? (
          <span key={i}>{piece}</span>
        ) : (
          <span key={i} data-float-piece className="inline-block will-change-transform">
            {piece === " " ? " " : piece}
          </span>
        ),
      )}
    </span>
  );
}
