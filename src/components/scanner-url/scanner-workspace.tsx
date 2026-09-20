"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AlertTriangle, Database, Globe, Lock, Share2, ShieldCheck } from "lucide-react";
import { ScannerTabs } from "@/components/scanner-url/scanner-tabs";
import { UrlInputPanel } from "@/components/scanner-url/url-input-panel";
import { ScanProgressRail } from "@/components/scanner-url/scan-progress-rail";
import { AnalysisCards } from "@/components/scanner-url/analysis-cards";
import { ScanEngineRadar } from "@/components/scanner-url/scan-engine-radar";
import { RecentScans, INITIAL_RECENT_SCANS, type RecentScanEntry } from "@/components/scanner-url/recent-scans";
import { STAGES, type AnalysisCardData, type ScanState } from "@/components/scanner-url/types";
import { THREAT_LEVEL_LABEL, type ScanResultPayload } from "@/types/scan";
import { logScanIfSignedIn } from "@/lib/firebase/log-scan";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// const DEFAULT_URL = "https://example.com/suspicious-login";
const STAGE_INTERVAL_MS = 850;

function defaultCards(): AnalysisCardData[] {
  return [
    { id: "reputation", icon: Database, title: "URL Reputation", value: "42 sources", tone: "neutral" },
    { id: "ssl", icon: Lock, title: "SSL Certificate", value: "Valid & trusted", tone: "neutral" },
    { id: "redirects", icon: Share2, title: "Redirect Chain", value: "0 redirects", tone: "neutral" },
    { id: "phishing", icon: ShieldCheck, title: "Phishing Signals", value: "No scan yet", tone: "neutral" },
  ];
}

function toneForThreatLevel(threatLevel: ScanResultPayload["threatLevel"]): AnalysisCardData["tone"] {
  if (threatLevel === "SAFE" || threatLevel === "LOW_RISK") return "safe";
  if (threatLevel === "SUSPICIOUS") return "neutral";
  return "danger";
}

function computeResultCards(result: ScanResultPayload, targetUrl: string): AnalysisCardData[] {
  const isHttps = targetUrl.trim().toLowerCase().startsWith("https://");
  const cleanCount = result.engines.filter((e) => e.verdict === "clean").length;
  const detectedCount = result.engines.filter((e) => e.verdict === "detected").length;

  return [
    {
      id: "reputation",
      icon: Database,
      title: "URL Reputation",
      value: detectedCount > 0 ? `${detectedCount} source${detectedCount > 1 ? "s" : ""} flagged` : `${cleanCount}/${result.engines.length} clean`,
      tone: detectedCount > 0 ? "danger" : "safe",
    },
    {
      id: "ssl",
      icon: Lock,
      title: "SSL Certificate",
      value: isHttps ? "Valid & trusted" : "Not encrypted (HTTP)",
      tone: isHttps ? "safe" : "danger",
    },
    { id: "redirects", icon: Share2, title: "Redirect Chain", value: "Not tracked in this scan", tone: "neutral" },
    {
      id: "phishing",
      icon: ShieldCheck,
      title: "Phishing Signals",
      value: THREAT_LEVEL_LABEL[result.threatLevel],
      tone: toneForThreatLevel(result.threatLevel),
    },
  ];
}

function safeHostname(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function ScannerWorkspace() {
  const rootRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const quickX = useRef<gsap.QuickToFunc | null>(null);
  const quickY = useRef<gsap.QuickToFunc | null>(null);
  const stageTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [value, setValue] = useState("");
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [cards, setCards] = useState<AnalysisCardData[]>(defaultCards());
  const [validationError, setValidationError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<RecentScanEntry[]>(INITIAL_RECENT_SCANS);

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
      setScanState("idle");
      setCards(defaultCards());
      setValidationError(null);
      setErrorMessage(null);
      setActiveStageIndex(0);
    }
  }

  async function handleScan() {
    const trimmed = value.trim();
    if (!trimmed) {
      setValidationError("Enter a URL to scan.");
      return;
    }
    if (!/^https?:\/\//i.test(trimmed)) {
      setValidationError("URL must start with http:// or https://");
      return;
    }

    setValidationError(null);
    setErrorMessage(null);
    setScanState("scanning");
    setActiveStageIndex(0);

    let i = 0;
    stageTimerRef.current = setInterval(() => {
      i += 1;
      if (i >= STAGES.length) {
        if (stageTimerRef.current) clearInterval(stageTimerRef.current);
        return;
      }
      setActiveStageIndex(i);
    }, STAGE_INTERVAL_MS);

    const stageTimerDone = new Promise<void>((resolve) => setTimeout(resolve, STAGE_INTERVAL_MS * (STAGES.length - 1)));

    try {
      const fetchPromise = fetch("/api/scan/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType: "url", target: trimmed }),
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Scan failed.");
        return data as ScanResultPayload;
      });

      const [result] = await Promise.all([fetchPromise, stageTimerDone]);

      if (stageTimerRef.current) clearInterval(stageTimerRef.current);
      setActiveStageIndex(STAGES.length - 1);
      setCards(computeResultCards(result, trimmed));
      setScanState("complete");
      logScanIfSignedIn({ target: trimmed, targetType: "url", threatLevel: result.threatLevel, score: result.score });
      const isSafe = result.threatLevel === "SAFE" || result.threatLevel === "LOW_RISK";
      const verdictTone: RecentScanEntry["verdictTone"] = isSafe ? "safe" : "danger";
      setRecentScans((prev) => [
        {
          id: result.id,
          icon: Globe,
          primary: safeHostname(trimmed),
          secondary: trimmed,
          verdict: isSafe ? "SAFE" : "PHISHING",
          verdictTone,
          time: "Just now",
        },
        ...prev,
      ].slice(0, 3));
    } catch (e) {
      if (stageTimerRef.current) clearInterval(stageTimerRef.current);
      setScanState("error");
      setErrorMessage(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    }
  }

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
            {
              background: "radial-gradient(560px circle at var(--gx, 20%) var(--gy, 0%), rgba(255,90,0,0.05), transparent 70%)",
            } as React.CSSProperties
          }
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[68%_32%]">
          <div className="border-b border-[var(--border-muted)] lg:border-b-0 lg:border-r">
            <ScannerTabs active="url" />

            <div className="p-5 sm:p-7">
              <UrlInputPanel value={value} onChange={handleValueChange} onScan={handleScan} state={scanState} validationError={validationError} />

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
                <ScanProgressRail state={scanState} activeIndex={activeStageIndex} />
              )}

              <AnalysisCards cards={cards} />
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <ScanEngineRadar state={scanState} scanningLabel="Analyzing URL" />
          </div>
        </div>
      </div>

      <RecentScans scans={recentScans} />
    </>
  );
}
