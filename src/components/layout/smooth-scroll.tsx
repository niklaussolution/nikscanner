"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";

let lenis: Lenis | null = null;

/** Site-wide inertial smooth scrolling (Lenis), driven by GSAP's ticker so every ScrollTrigger
 *  animation stays in sync with the smoothed scroll position. Skipped for reduced-motion users. */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const instance = new Lenis({
      duration: 1.1,
      anchors: true,
      // Inner scroll areas (dashboard sidebar, live feed table) keep native scrolling.
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
    });
    lenis = instance;

    instance.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      lenis = null;
    };
  }, []);

  // Client-side navigations should land at the top of the new page, not glide from the old offset.
  useEffect(() => {
    if (window.location.hash) return;
    lenis?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}
