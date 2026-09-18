"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AlertTriangle } from "lucide-react";
import { StatusIntro } from "@/components/status/status-intro";
import { StatusLiveRow } from "@/components/status/status-live-row";
import { OverallStatusBanner } from "@/components/status/overall-status-banner";
import { StatusMetricCards } from "@/components/status/status-metric-cards";
import { ServiceHealthPanel } from "@/components/status/service-health-panel";
import { ResponseTimeChart } from "@/components/status/response-time-chart";
import { IncidentHistory } from "@/components/status/incident-history";
import { SubscribeModal } from "@/components/status/subscribe-modal";
import type { StatusSnapshot } from "@/types/status";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const POLL_INTERVAL_MS = 30_000;

export function StatusPageClient() {
  const rootRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inFlightRef = useRef(false);
  const mountedRef = useRef(true);

  const [snapshot, setSnapshot] = useState<StatusSnapshot | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [stale, setStale] = useState(false);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [subscribeOpen, setSubscribeOpen] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchStatus = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setRefreshing(true);
    try {
      const res = await fetch("/api/status", { cache: "no-store" });
      if (!res.ok) throw new Error(`Status API returned ${res.status}`);
      const data = (await res.json()) as StatusSnapshot;
      if (!mountedRef.current) return;
      setSnapshot(data);
      setLastUpdated(new Date());
      setStale(false);
      setFatalError(null);
    } catch {
      if (!mountedRef.current) return;
      // Preserve the previous successful snapshot rather than blanking the
      // page — only surface a non-blocking staleness warning.
      setStale(true);
      if (!snapshot) setFatalError("Couldn't load system status. Retrying automatically.");
    } finally {
      inFlightRef.current = false;
      if (mountedRef.current) setRefreshing(false);
    }
  }, [snapshot]);

  useEffect(() => {
    // Deferred a tick so the initial load isn't a synchronous setState call
    // from within the effect body itself — fires on the next microtask.
    void Promise.resolve().then(() => fetchStatus());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function startPolling() {
      if (timerRef.current) return;
      timerRef.current = setInterval(() => {
        if (document.visibilityState === "visible") fetchStatus();
      }, POLL_INTERVAL_MS);
    }
    function stopPolling() {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    function handleVisibility() {
      if (document.visibilityState === "visible") {
        fetchStatus();
        startPolling();
      } else {
        stopPolling();
      }
    }

    startPolling();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchStatus]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-overall-banner]",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
      );
      gsap.fromTo(
        "[data-service-health], [data-response-chart], [data-incident-history]",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, delay: 0.15, ease: "power3.out" },
      );
      if (!reduced) {
        gsap.to("[data-status-dot]", { opacity: 0.4, duration: 1.1, repeat: -1, yoyo: true, ease: "sine.inOut" });
      }
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef}>
      <StatusIntro />
      <StatusLiveRow lastUpdated={lastUpdated} refreshing={refreshing} onRefresh={fetchStatus} />

      {stale && (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-[var(--degraded)]/40 bg-[var(--degraded)]/10 px-4 py-2 text-xs font-semibold text-[var(--degraded)]">
          <AlertTriangle className="h-3.5 w-3.5" />
          Showing the last known status — live refresh is temporarily unavailable.
        </div>
      )}
      {fatalError && !snapshot && (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-[var(--outage)]/40 bg-[var(--outage)]/10 px-4 py-2 text-xs font-semibold text-[var(--outage)]">
          <AlertTriangle className="h-3.5 w-3.5" />
          {fatalError}
        </div>
      )}

      <OverallStatusBanner overall={snapshot?.overall ?? "operational"} onSubscribe={() => setSubscribeOpen(true)} />
      <StatusMetricCards metrics={snapshot?.metrics ?? null} ready={!!snapshot} />
      <ServiceHealthPanel snapshot={snapshot} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px]">
        <ResponseTimeChart
          points={snapshot?.responseTimeSeries ?? []}
          currentMs={snapshot?.metrics.avgResponseMs ?? 0}
          demo={snapshot?.demo.responseTimeSeries ?? true}
        />
        <IncidentHistory incidents={snapshot?.incidents ?? []} demo={snapshot?.demo.incidents ?? true} />
      </div>

      {subscribeOpen && <SubscribeModal onClose={() => setSubscribeOpen(false)} />}
    </div>
  );
}
