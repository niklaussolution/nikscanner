"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AlertTriangle, MapPin, Network, ShieldCheck, Ghost, Wifi, Globe } from "lucide-react";
import { ScannerTabs } from "@/components/scanner-url/scanner-tabs";
import { ScanProgressRail } from "@/components/scanner-url/scan-progress-rail";
import { ResultSummary, type ResultSummaryData } from "@/components/scanner-url/result-summary";
import { StatusCards, type StatusCardData } from "@/components/scanner-url/status-cards";
import { IpInput } from "@/components/scanner-ip/ip-input";
import { IpIntelligenceMap, type MapStatusRow } from "@/components/scanner-ip/ip-intelligence-map";
import { ReputationSources } from "@/components/scanner-url/reputation-sources";
import { RecentScans, type RecentScanEntry } from "@/components/scanner-url/recent-scans";
import { BlockTargetButton } from "@/components/scanner-url/block-target-button";
import { IP_STAGES, type IpScanState } from "@/components/scanner-ip/types";
import { normalizeAndValidateIp } from "@/lib/validation/ip";
import { THREAT_LEVEL_LABEL, type IpScanPayload } from "@/types/scan";
import { logScanIfSignedIn } from "@/lib/firebase/log-scan";
import { useAuth } from "@/lib/firebase/auth-context";
import { fetchRecentScans } from "@/lib/firebase/scan-history";
import { formatRelativeTime } from "@/lib/format-time";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const DEFAULT_IP = "8.8.8.8";
const STAGE_INTERVAL_MS = 850;

function verdictToneFromScore(score: number): "safe" | "warning" | "danger" {
  if (score < 30) return "safe";
  if (score < 60) return "warning";
  return "danger";
}

function buildResultSummary(payload: IpScanPayload): ResultSummaryData {
  const detectedCount = payload.engines.filter((e) => e.verdict === "detected").length;
  return {
    target: payload.target,
    score: payload.score,
    verdict: THREAT_LEVEL_LABEL[payload.threatLevel].toUpperCase(),
    verdictTone: verdictToneFromScore(payload.score),
    flaggedCount: detectedCount,
    totalEngines: payload.engines.length,
    confidence: payload.confidence,
    unit: "address",
  };
}

function buildCards(payload: IpScanPayload): StatusCardData[] {
  return [
    {
      id: "geo",
      icon: MapPin,
      title: "Geolocation",
      primary: payload.geo?.city ? `${payload.geo.city}, ${payload.geo.region ?? ""}`.replace(/,\s*$/, "") : "Unavailable",
      secondary: payload.geo?.country ?? "Location unavailable",
      status: payload.geo?.city ? "ok" : "unavailable",
    },
    {
      id: "asn",
      icon: Network,
      title: "Network & ASN",
      primary: payload.network?.asn ?? "Unavailable",
      secondary: payload.network?.isp ?? payload.network?.org ?? "ASN info unavailable",
      status: payload.network?.asn ? "ok" : "unavailable",
    },
    {
      id: "rdns",
      icon: Wifi,
      title: "Reverse DNS",
      primary: payload.reverseDns ?? "Unavailable",
      secondary: payload.network?.hosting ? "Datacenter / hosting network" : payload.network?.hosting === false ? "Residential / non-hosting network" : "Network type unavailable",
      status: payload.reverseDns ? "ok" : "unavailable",
    },
    {
      id: "privacy",
      icon: ShieldCheck,
      title: "Privacy Signals",
      primary: payload.privacy.proxy === null ? "Unavailable" : payload.privacy.proxy ? "VPN / Proxy detected" : "No VPN · No Proxy",
      secondary: payload.privacy.tor === null ? "Tor status unavailable" : payload.privacy.tor ? "Tor exit node" : "Tor not detected",
      status: payload.privacy.proxy === null && payload.privacy.tor === null ? "unavailable" : payload.privacy.proxy || payload.privacy.tor ? "bad" : "ok",
    },
  ];
}

function buildMapStatusRows(payload: IpScanPayload | null): MapStatusRow[] {
  if (!payload) {
    return [
      { icon: Network, label: "ISP", value: "—", tone: "unknown" },
      { icon: Wifi, label: "Connection", value: "—", tone: "unknown" },
      { icon: Ghost, label: "Abuse score", value: "—", tone: "unknown" },
    ];
  }
  return [
    { icon: Network, label: "ISP", value: payload.network?.isp ?? payload.network?.org ?? "Unavailable", tone: payload.network?.isp ? "neutral" : "unknown" },
    {
      icon: Wifi,
      label: "Connection",
      value: payload.network?.hosting === null || payload.network?.hosting === undefined ? "Unavailable" : payload.network.hosting ? "Datacenter" : "Residential",
      tone: "neutral",
    },
    { icon: Ghost, label: "Abuse score", value: `${payload.score}%`, tone: payload.score < 30 ? "safe" : payload.score < 60 ? "unknown" : "danger" },
  ];
}

function isSafeIp(payload: IpScanPayload): boolean {
  return payload.threatLevel === "SAFE" || payload.threatLevel === "LOW_RISK";
}

export function IpScannerWorkspace() {
  const { user } = useAuth();
  const rootRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const quickX = useRef<gsap.QuickToFunc | null>(null);
  const quickY = useRef<gsap.QuickToFunc | null>(null);
  const stageTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [value, setValue] = useState(DEFAULT_IP);
  const [scanState, setScanState] = useState<IpScanState>("idle");
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [result, setResult] = useState<IpScanPayload | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recentIps, setRecentIps] = useState<RecentScanEntry[]>([]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetchRecentScans("ip").then((scans) => {
      if (cancelled) return;
      setRecentIps(
        scans.map((s) => {
          const isSafe = s.threat_level === "SAFE" || s.threat_level === "LOW_RISK";
          return {
            id: s.id,
            icon: Globe,
            primary: s.target,
            secondary: `Score ${s.score}/100`,
            verdict: isSafe ? "SAFE" : "RISKY",
            verdictTone: isSafe ? "safe" : "danger",
            time: formatRelativeTime(s.created_at),
          };
        }),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        root,
        { opacity: 0, y: 60, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: root, start: "top 82%", once: true } },
      );
      gsap.fromTo(
        "[data-analysis-card]",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, delay: 0.3, ease: "power2.out", scrollTrigger: { trigger: root, start: "top 82%", once: true } },
      );
      gsap.fromTo(
        "[data-radar]",
        { opacity: 0, scale: 0.85 },
        { opacity: 1, scale: 1, duration: 0.7, delay: 0.25, ease: "power3.out", scrollTrigger: { trigger: root, start: "top 82%", once: true } },
      );
      if (!reduced) {
        quickX.current = gsap.quickTo(glowRef.current, "--gx", { duration: 0.6, ease: "power3" });
        quickY.current = gsap.quickTo(glowRef.current, "--gy", { duration: 0.6, ease: "power3" });
      }
    }, root);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    return () => {
      if (stageTimerRef.current) clearInterval(stageTimerRef.current);
    };
  }, []);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;
    quickX.current?.(e.clientX - rect.left);
    quickY.current?.(e.clientY - rect.top);
  }

  function handleValueChange(next: string) {
    setValue(next);
    if (scanState !== "scanning") {
      setValidationError(null);
      setErrorMessage(null);
    }
  }

  async function handleScan() {
    setScanState("validating");
    const validation = normalizeAndValidateIp(value);
    if (!validation.ok || !validation.address) {
      setValidationError(validation.error ?? "Enter a valid IP address.");
      setScanState("idle");
      return;
    }

    setValidationError(null);
    setErrorMessage(null);
    setScanState("scanning");
    setActiveStageIndex(0);

    let i = 0;
    stageTimerRef.current = setInterval(() => {
      i += 1;
      if (i >= IP_STAGES.length) {
        if (stageTimerRef.current) clearInterval(stageTimerRef.current);
        return;
      }
      setActiveStageIndex(i);
    }, STAGE_INTERVAL_MS);

    const stageTimerDone = new Promise<void>((resolve) => setTimeout(resolve, STAGE_INTERVAL_MS * (IP_STAGES.length - 1)));

    try {
      const fetchPromise = fetch("/api/scan/ip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType: "ip", target: validation.address }),
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Scan failed.");
        return data as IpScanPayload;
      });

      const [payload] = await Promise.all([fetchPromise, stageTimerDone]);

      if (stageTimerRef.current) clearInterval(stageTimerRef.current);
      setActiveStageIndex(IP_STAGES.length - 1);
      setResult(payload);
      setScanState(payload.partial ? "partial" : "complete");
      logScanIfSignedIn({ target: payload.target, targetType: "ip", threatLevel: payload.threatLevel, score: payload.score });

      const entry: RecentScanEntry = {
        id: payload.id,
        icon: Globe,
        primary: payload.target,
        secondary: `Score ${payload.score}/100`,
        verdict: isSafeIp(payload) ? "SAFE" : "RISKY",
        verdictTone: isSafeIp(payload) ? "safe" : "danger",
        time: "Just now",
      };
      setRecentIps((prev) => [entry, ...prev].slice(0, 3));
    } catch (e) {
      if (stageTimerRef.current) clearInterval(stageTimerRef.current);
      setScanState("error");
      setErrorMessage(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    }
  }

  const railState =
    scanState === "scanning" || scanState === "validating"
      ? "scanning"
      : scanState === "complete" || scanState === "partial"
        ? "complete"
        : scanState === "error"
          ? "error"
          : "idle";

  return (
    <>
      <div
        ref={rootRef}
        onMouseMove={handleMouseMove}
        className="relative overflow-hidden rounded-[18px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)]"
      >
        <div
          ref={glowRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 opacity-70"
          style={
            { background: "radial-gradient(560px circle at var(--gx, 20%) var(--gy, 0%), rgba(255,90,0,0.05), transparent 70%)" } as React.CSSProperties
          }
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[68%_32%]">
          <div className="border-b border-[var(--border-muted)] lg:border-b-0 lg:border-r">
            <ScannerTabs active="ip" />

            <div className="p-5 sm:p-7">
              <IpInput value={value} onChange={handleValueChange} onScan={handleScan} state={scanState} validationError={validationError} hasResult={!!result} />

              {scanState === "error" ? (
                <div className="mt-6 flex items-start gap-3 rounded-xl border border-[var(--danger)]/40 bg-[var(--danger)]/10 p-4 text-sm text-[var(--danger)]">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-semibold">Scan failed</p>
                    <p className="mt-0.5 text-[var(--text-secondary)]">{errorMessage}</p>
                    <button type="button" onClick={handleScan} className="mt-2 text-xs font-bold uppercase tracking-wide text-[var(--danger)] underline">
                      Retry
                    </button>
                  </div>
                </div>
              ) : (
                <ScanProgressRail state={railState} activeIndex={activeStageIndex} stages={IP_STAGES} />
              )}

              {scanState === "partial" && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-[var(--warning)]/40 bg-[var(--warning)]/10 p-3.5 text-sm text-[var(--warning)]">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-semibold">Some checks were unavailable</p>
                    <p className="mt-0.5 text-[var(--text-secondary)]">
                      One or more providers didn&apos;t respond. Results below reflect only the checks that succeeded.
                    </p>
                    <button type="button" onClick={handleScan} className="mt-2 text-xs font-bold uppercase tracking-wide text-[var(--warning)] underline">
                      Retry unavailable checks
                    </button>
                  </div>
                </div>
              )}

              {result && (scanState === "complete" || scanState === "partial") && (
                <ResultSummary data={buildResultSummary(result)} emptyLabel="Run a scan to see the address's risk score and verdict." />
              )}
              {result && (scanState === "complete" || scanState === "partial") && <StatusCards cards={buildCards(result)} />}

              {result && (scanState === "complete" || scanState === "partial") && !isSafeIp(result) && (
                <div className="mt-4">
                  <BlockTargetButton
                    key={result.id}
                    target={`https://${result.family === 6 ? `[${result.target}]` : result.target}`}
                    blocklistHit={result.blocklistHit}
                    blockedBy={result.blockedBy}
                    suggestedCategory={result.threatLevel === "MALICIOUS" ? "malicious" : "suspicious"}
                    targetLabel="IP Address"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <IpIntelligenceMap state={scanState} ip={result?.target ?? value} score={result ? result.score : null} statusRows={buildMapStatusRows(result)} />
            {result?.demo && (scanState === "complete" || scanState === "partial") && (
              <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                Demo Data — no live threat-intel provider configured
              </p>
            )}
          </div>
        </div>
      </div>

      {result && (scanState === "complete" || scanState === "partial") && <ReputationSources engines={result.engines} />}
      <RecentScans scans={recentIps} title="Recent IP Scans" />
    </>
  );
}
