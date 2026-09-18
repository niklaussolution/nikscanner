"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AlertTriangle, Calendar, Database, Mail, ShieldAlert, Shield, Server, Activity } from "lucide-react";
import { ScannerTabs } from "@/components/scanner-url/scanner-tabs";
import { ScanProgressRail } from "@/components/scanner-url/scan-progress-rail";
import { DomainInput } from "@/components/scanner-domain/domain-input";
import { ResultSummary, type ResultSummaryData } from "@/components/scanner-url/result-summary";
import { StatusCards, type StatusCardData } from "@/components/scanner-url/status-cards";
import { DomainIntelligenceRadar, type RadarStatusRow } from "@/components/scanner-domain/domain-intelligence-radar";
import { DnsSecurityRecords } from "@/components/scanner-domain/dns-security-records";
import { RecentDomains, INITIAL_RECENT_DOMAINS } from "@/components/scanner-domain/recent-domains";
import { DOMAIN_STAGES, type DomainScanState, type RecentDomainEntry } from "@/components/scanner-domain/types";
import { normalizeAndValidateDomain } from "@/lib/validation/domain";
import { THREAT_LEVEL_LABEL, type DomainScanPayload } from "@/types/scan";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const DEFAULT_DOMAIN = "google.com";
const STAGE_INTERVAL_MS = 850;

function verdictToneFromScore(score: number): "safe" | "warning" | "danger" {
  if (score < 30) return "safe";
  if (score < 60) return "warning";
  return "danger";
}

function buildResultSummary(payload: DomainScanPayload): ResultSummaryData {
  const detectedCount = payload.engines.filter((e) => e.verdict === "detected").length;
  return {
    target: payload.target,
    score: payload.score,
    verdict: THREAT_LEVEL_LABEL[payload.threatLevel].toUpperCase(),
    verdictTone: verdictToneFromScore(payload.score),
    flaggedCount: detectedCount,
    totalEngines: payload.engines.length,
    confidence: payload.confidence,
    unit: "domain",
  };
}

function buildCards(payload: DomainScanPayload): StatusCardData[] {
  const createdYear = payload.whois?.createdDate ? new Date(payload.whois.createdDate).getFullYear() : null;
  const detectedCount = payload.engines.filter((e) => e.verdict === "detected").length;

  return [
    {
      id: "whois",
      icon: Calendar,
      title: "WHOIS & Age",
      primary: createdYear ? `Registered ${createdYear}` : "Unavailable",
      secondary: payload.whois?.registrar ?? "Registrar unavailable",
      status: createdYear ? "ok" : "unavailable",
    },
    {
      id: "dns",
      icon: Database,
      title: "DNS & Hosting",
      primary: payload.dns.a?.[0] ?? "Unavailable",
      secondary: payload.ipInfo ? `${payload.ipInfo.org ?? "Unknown org"} · ${payload.ipInfo.country ?? "Unknown"}` : "Host info unavailable",
      status: payload.dns.a?.length ? "ok" : "unavailable",
    },
    {
      id: "email",
      icon: Mail,
      title: "Email Security",
      primary: `SPF ${payload.dns.spf ? "PASS" : "MISSING"}`,
      secondary: `DMARC ${payload.dns.dmarc ? "PASS" : "MISSING"} · DKIM Unavailable`,
      status: payload.dns.spf && payload.dns.dmarc ? "ok" : payload.dns.spf || payload.dns.dmarc ? "warn" : "bad",
    },
    {
      id: "blacklist",
      icon: ShieldAlert,
      title: "Blacklist Status",
      primary: `${detectedCount} listing${detectedCount === 1 ? "" : "s"}`,
      secondary: detectedCount > 0 ? `Flagged by ${detectedCount} of ${payload.engines.length} sources` : `Clean across ${payload.engines.length} sources`,
      status: detectedCount > 0 ? "bad" : "ok",
    },
  ];
}

function buildRadarStatusRows(payload: DomainScanPayload | null): RadarStatusRow[] {
  if (!payload) {
    return [
      { icon: Server, label: "Registrar", value: "—", tone: "unknown" },
      { icon: Shield, label: "DNSSEC", value: "—", tone: "unknown" },
      { icon: Activity, label: "Reputation", value: "—", tone: "unknown" },
    ];
  }
  const detectedCount = payload.engines.filter((e) => e.verdict === "detected").length;
  return [
    { icon: Server, label: "Registrar", value: payload.whois?.registrar ? "Verified" : "Unavailable", tone: payload.whois?.registrar ? "safe" : "unknown" },
    {
      icon: Shield,
      label: "DNSSEC",
      value: payload.dns.dnssecSigned === null ? "Unavailable" : payload.dns.dnssecSigned ? "Enabled" : "Not enabled",
      tone: payload.dns.dnssecSigned === null ? "unknown" : payload.dns.dnssecSigned ? "safe" : "danger",
    },
    { icon: Activity, label: "Reputation", value: detectedCount > 0 ? "Flagged" : "Clean", tone: detectedCount > 0 ? "danger" : "safe" },
  ];
}

function verdictForRecent(payload: DomainScanPayload): RecentDomainEntry["verdict"] {
  if (payload.score < 30) return "SAFE";
  if (payload.score < 60) return "SUSPICIOUS";
  return "HIGH RISK";
}

export function DomainScannerWorkspace() {
  const rootRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const quickX = useRef<gsap.QuickToFunc | null>(null);
  const quickY = useRef<gsap.QuickToFunc | null>(null);
  const stageTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [value, setValue] = useState(DEFAULT_DOMAIN);
  const [scanState, setScanState] = useState<DomainScanState>("idle");
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [result, setResult] = useState<DomainScanPayload | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recentDomains, setRecentDomains] = useState<RecentDomainEntry[]>(INITIAL_RECENT_DOMAINS);

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
    const validation = normalizeAndValidateDomain(value);
    if (!validation.ok || !validation.hostname) {
      setValidationError(validation.error ?? "Enter a valid domain.");
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
      if (i >= DOMAIN_STAGES.length) {
        if (stageTimerRef.current) clearInterval(stageTimerRef.current);
        return;
      }
      setActiveStageIndex(i);
    }, STAGE_INTERVAL_MS);

    const stageTimerDone = new Promise<void>((resolve) => setTimeout(resolve, STAGE_INTERVAL_MS * (DOMAIN_STAGES.length - 1)));

    try {
      const fetchPromise = fetch("/api/scan/domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType: "domain", target: validation.hostname }),
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Scan failed.");
        return data as DomainScanPayload;
      });

      const [payload] = await Promise.all([fetchPromise, stageTimerDone]);

      if (stageTimerRef.current) clearInterval(stageTimerRef.current);
      setActiveStageIndex(DOMAIN_STAGES.length - 1);
      setResult(payload);
      setScanState(payload.partial ? "partial" : "complete");

      setRecentDomains((prev) => [
        { id: payload.id, domain: payload.target, verdict: verdictForRecent(payload), verdictTone: verdictToneFromScore(payload.score), time: "Just now" },
        ...prev,
      ].slice(0, 3));
    } catch (e) {
      if (stageTimerRef.current) clearInterval(stageTimerRef.current);
      setScanState("error");
      setErrorMessage(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    }
  }

  const railState = scanState === "scanning" || scanState === "validating" ? "scanning" : scanState === "complete" || scanState === "partial" ? "complete" : scanState === "error" ? "error" : "idle";

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
            <ScannerTabs active="domain" />

            <div className="p-5 sm:p-7">
              <DomainInput
                value={value}
                onChange={handleValueChange}
                onScan={handleScan}
                state={scanState}
                validationError={validationError}
                hasResult={!!result}
              />

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
                <ScanProgressRail state={railState} activeIndex={activeStageIndex} stages={DOMAIN_STAGES} />
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
                <ResultSummary data={buildResultSummary(result)} emptyLabel="Run a scan to see the domain's risk score and verdict." />
              )}
              {result && (scanState === "complete" || scanState === "partial") && <StatusCards cards={buildCards(result)} />}
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <DomainIntelligenceRadar
              state={scanState}
              domain={result?.target ?? value}
              score={result ? result.score : null}
              statusRows={buildRadarStatusRows(result)}
            />
            {result?.demo && (scanState === "complete" || scanState === "partial") && (
              <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                Demo Data — no live threat-intel provider configured
              </p>
            )}
          </div>
        </div>
      </div>

      <DnsSecurityRecords dns={result?.dns ?? null} tls={result?.tls ?? null} />
      <RecentDomains domains={recentDomains} />
    </>
  );
}
