"use client";

import { useEffect, useRef } from "react";

const MIN_INTERVAL_MS = 5000;

/** Calls `refresh` whenever the tab becomes visible / the window regains focus (at most once per
 *  5s). The account is shared with the mobile app through the same backend, so a plan bought or
 *  credits spent there show up here as soon as the user switches back, without a manual reload. */
export function useRefreshOnFocus(refresh: () => void, enabled = true) {
  const latest = useRef(refresh);
  useEffect(() => {
    latest.current = refresh;
  });

  useEffect(() => {
    if (!enabled) return;
    let last = Date.now();
    const onVisible = () => {
      if (document.visibilityState !== "visible" || Date.now() - last < MIN_INTERVAL_MS) return;
      last = Date.now();
      latest.current();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [enabled]);
}
