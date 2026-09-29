"use client";

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { gsap } from "gsap";

export type BlurTextDirection = "top" | "bottom" | "left" | "right";

export interface BlurTextProps {
  text: string;
  /** Stagger between each word's animation, in ms. */
  delay?: number;
  direction?: BlurTextDirection;
  duration?: number;
  blurAmount?: number;
  offset?: number;
  ease?: string;
  className?: string;
  style?: CSSProperties;
}

const WORD_SPLIT = /(\s+)/;

/** React Bits-style "Blur Text": each word starts blurred and offset along `direction`, then
 *  animates to sharp and in place, staggered word by word. */
export default function BlurText({
  text,
  delay = 150,
  direction = "top",
  duration = 0.6,
  blurAmount = 10,
  offset = 16,
  ease = "power2.out",
  className = "",
  style = {},
}: BlurTextProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const tokens = useMemo(() => text.split(WORD_SPLIT), [text]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const words = root.querySelectorAll<HTMLElement>("[data-blur-word]");
    if (!words.length) return;

    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.set(words, { opacity: 1, filter: "blur(0px)", x: 0, y: 0 });
      return;
    }

    const axis = direction === "left" || direction === "right" ? "x" : "y";
    const sign = direction === "bottom" || direction === "right" ? 1 : -1;

    gsap.set(words, { opacity: 0, filter: `blur(${blurAmount}px)`, [axis]: sign * offset });
    const tween = gsap.to(words, {
      opacity: 1,
      filter: "blur(0px)",
      [axis]: 0,
      duration,
      ease,
      stagger: delay / 1000,
    });

    return () => {
      tween.kill();
    };
  }, [text, delay, direction, duration, blurAmount, offset, ease]);

  return (
    <span ref={rootRef} className={className} style={style}>
      {tokens.map((token, i) =>
        /^\s+$/.test(token) ? (
          <span key={i}>{token}</span>
        ) : (
          <span key={i} data-blur-word className="inline-block">
            {token}
          </span>
        ),
      )}
    </span>
  );
}
