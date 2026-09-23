"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AlertTriangle, FileText, Globe, Route, Lock, ExternalLink, RotateCw, QrCode, Shield, ShieldCheck, Sigma, Fish, Database, Wifi } from "lucide-react";
import { ScannerTabs } from "@/components/scanner-url/scanner-tabs";
import { ScanProgressRail } from "@/components/scanner-url/scan-progress-rail";
import { ResultSummary, type ResultSummaryData } from "@/components/scanner-url/result-summary";
import { StatusCards, type StatusCardData } from "@/components/scanner-url/status-cards";
import { ReputationSources } from "@/components/scanner-url/reputation-sources";
import { RecentScans, type RecentScanEntry } from "@/components/scanner-url/recent-scans";
import { QrDropzone, validateQrFile } from "@/components/scanner-qr/qr-dropzone";
import { SelectedQrPreview } from "@/components/scanner-qr/selected-qr-preview";
import { QrIntelligencePanel, type QrStatusRow } from "@/components/scanner-qr/qr-intelligence-panel";
import { decodeQrFromFile } from "@/components/scanner-qr/decode-qr";
import { classifyPayload, isSafeToOpen, safeHostname, PAYLOAD_TYPE_LABEL, type QrPayloadType } from "@/components/scanner-qr/qr-payload";
import { looksConfusable, openSafely } from "@/components/scanner-qr/open-safely";
import { QR_STAGES, type QrScanState } from "@/components/scanner-qr/types";
import { THREAT_LEVEL_LABEL, type ScanResultPayload } from "@/types/scan";
import { logScanIfSignedIn } from "@/lib/firebase/log-scan";
import { useAuth } from "@/lib/firebase/auth-context";
import { fetchRecentScans } from "@/lib/firebase/scan-history";
import { formatRelativeTime } from "@/lib/format-time";
import type { TlsInfo } from "@/lib/domain-intel/tls";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function verdictToneFromThreatLevel(threatLevel: ScanResultPayload["threatLevel"]): "safe" | "warning" | "danger" {
  if (threatLevel === "SAFE" || threatLevel === "LOW_RISK") return "safe";
  if (threatLevel === "SUSPICIOUS") return "warning";
  return "danger";
}

function payloadIcon(type: QrPayloadType) {
  if (type === "url") return Globe;
  if (type === "wifi") return Wifi;
  return FileText;
}

export function QrScannerWorkspace() {
  const { user } = useAuth();
  const rootRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const quickX = useRef<gsap.QuickToFunc | null>(null);
  const quickY = useRef<gsap.QuickToFunc | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [decoding, setDecoding] = useState(false);
  const [decodedValue, setDecodedValue] = useState<string | null>(null);
  const [payloadType, setPayloadType] = useState<QrPayloadType | null>(null);
  const [qrState, setQrState] = useState<QrScanState>("idle");
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [result, setResult] = useState<ScanResultPayload | null>(null);
  const [tlsInfo, setTlsInfo] = useState<TlsInfo | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<RecentScanEntry[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetchRecentScans("qr").then((scans) => {
      if (cancelled) return;
      setRecentScans(
        scans.map((s) => {
          const isSafe = s.threat_level === "SAFE" || s.threat_level === "LOW_RISK";
          return {
            id: s.id,
            icon: Globe,
            primary: safeHostname(s.target) ?? s.target,
            secondary: s.target,
            verdict: isSafe ? "SAFE" : "HIGH RISK",
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

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;
    quickX.current?.(e.clientX - rect.left);
    quickY.current?.(e.clientY - rect.top);
  }

  function resetToIdle() {
    setFile(null);
    setDecoding(false);
    setDecodedValue(null);
    setPayloadType(null);
    setQrState("idle");
    setActiveStageIndex(0);
    setResult(null);
    setTlsInfo(null);
    setValidationError(null);
    setErrorMessage(null);
    setConfirmOpen(false);
  }

  async function runReputationCheck(url: string, fileName: string) {
    setQrState("scanning");
    setActiveStageIndex(2);
    setErrorMessage(null);

    try {
      const hostname = safeHostname(url);
      const resultPromise = fetch("/api/scan/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType: "url", target: url }),
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Scan failed.");
        return data as ScanResultPayload;
      });

      setActiveStageIndex(3);
      const tlsPromise = hostname
        ? fetch("/api/scan/connection", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ hostname }),
          })
            .then((res) => (res.ok ? res.json() : { tls: null }))
            .then((d) => d.tls as TlsInfo | null)
            .catch(() => null)
        : Promise.resolve(null);

      const [scanResult, tls] = await Promise.all([resultPromise, tlsPromise]);

      setResult(scanResult);
      setTlsInfo(tls);
      setActiveStageIndex(4);
      setQrState(tls ? "complete" : "partial");
      logScanIfSignedIn({ target: url, targetType: "qr", threatLevel: scanResult.threatLevel, score: scanResult.score });

      const isSafe = scanResult.threatLevel === "SAFE" || scanResult.threatLevel === "LOW_RISK";
      const verdictTone: RecentScanEntry["verdictTone"] = isSafe ? "safe" : "danger";
      setRecentScans((prev) => [
        {
          id: scanResult.id,
          icon: Globe,
          primary: fileName,
          secondary: hostname ?? url,
          verdict: isSafe ? "SAFE" : "HIGH RISK",
          verdictTone,
          time: "Just now",
        },
        ...prev,
      ].slice(0, 3));
    } catch (e) {
      setQrState("error");
      setErrorMessage(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    }
  }

  async function handleFile(picked: File) {
    if (qrState === "decoding" || qrState === "scanning") return;

    const meta = validateQrFile(picked);
    if (!meta.ok) {
      setValidationError(meta.error ?? "This file can't be scanned.");
      return;
    }

    setValidationError(null);
    setErrorMessage(null);
    setFile(picked);
    setResult(null);
    setTlsInfo(null);
    setConfirmOpen(false);
    setDecoding(true);
    setQrState("decoding");
    setActiveStageIndex(0);

    try {
      const decoded = await decodeQrFromFile(picked);
      setDecoding(false);

      if (!decoded) {
        setQrState("error");
        setErrorMessage("Couldn't detect a QR code in that image.");
        return;
      }

      setDecodedValue(decoded.value);
      setActiveStageIndex(1);
      const type = classifyPayload(decoded.value);
      setPayloadType(type);

      if (type === "url") {
        await runReputationCheck(decoded.value, picked.name);
      } else {
        // Non-URL payloads never reach a reputation provider — Resolve and
        // Reputation are shown as skipped, not silently completed.
        setActiveStageIndex(4);
        setQrState("complete");
      }
    } catch {
      setDecoding(false);
      setQrState("error");
      setErrorMessage("Couldn't read that image file.");
    }
  }

  function handleReplace() {
    setConfirmOpen(false);
    const input = document.querySelector<HTMLInputElement>('[data-dropzone] input[type="file"]');
    input?.click();
  }

  function handleRescan() {
    if (decodedValue && payloadType === "url") {
      void runReputationCheck(decodedValue, file?.name ?? "qr-code.png");
    }
  }

  function handleOpenSafely() {
    if (!decodedValue || !isSafeToOpen(decodedValue)) return;
    const hostname = safeHostname(decodedValue);
    const risky = !result || result.threatLevel === "HIGH_RISK" || result.threatLevel === "MALICIOUS" || result.threatLevel === "SUSPICIOUS";
    const confusable = hostname ? looksConfusable(hostname) : false;

    if ((risky || confusable) && !confirmOpen) {
      setConfirmOpen(true);
      return;
    }
    setConfirmOpen(false);
    openSafely(decodedValue);
  }

  const railState: "idle" | "scanning" | "complete" | "error" =
    qrState === "decoding" || qrState === "scanning" ? "scanning" : qrState === "complete" || qrState === "partial" ? "complete" : qrState === "error" ? "error" : "idle";
  const skippedIndices = payloadType && payloadType !== "url" ? [2, 3] : undefined;

  const resultSummary: ResultSummaryData | null =
    result && payloadType === "url"
      ? {
          target: decodedValue ?? "",
          score: result.score,
          verdict: THREAT_LEVEL_LABEL[result.threatLevel].toUpperCase(),
          verdictTone: verdictToneFromThreatLevel(result.threatLevel),
          flaggedCount: result.engines.filter((e) => e.verdict === "detected").length,
          totalEngines: result.engines.length,
          confidence: result.confidence,
          unit: "destination",
        }
      : null;

  const cards: StatusCardData[] | null = decodedValue
    ? [
        {
          id: "payload",
          icon: payloadIcon(payloadType ?? "text"),
          title: "Payload Type",
          primary: PAYLOAD_TYPE_LABEL[payloadType ?? "text"],
          secondary:
            payloadType === "url"
              ? decodedValue.startsWith("https://")
                ? "HTTPS link"
                : "HTTP link"
              : payloadType === "dangerous"
                ? "Blocked for safety"
                : "Not sent to any provider",
          status: payloadType === "dangerous" ? "bad" : "ok",
        },
        {
          id: "destination",
          icon: Globe,
          title: "Final Destination",
          primary: payloadType === "url" ? (safeHostname(decodedValue) ?? "Unavailable") : "Not applicable",
          secondary: payloadType === "url" ? "No hidden domain" : "Non-URL payload",
          status: payloadType === "url" ? "ok" : "unavailable",
        },
        {
          id: "redirects",
          icon: Route,
          title: "Redirect Chain",
          primary: payloadType === "url" ? "Not tracked" : "Not applicable",
          secondary: payloadType === "url" ? "Not tracked in this scan" : "Non-URL payload",
          status: "unavailable",
        },
        {
          id: "connection",
          icon: Lock,
          title: "Connection",
          primary: payloadType !== "url" ? "Not applicable" : tlsInfo === null && qrState !== "complete" && qrState !== "partial" ? "Pending" : tlsInfo ? (tlsInfo.valid ? "HTTPS valid" : "HTTPS invalid") : "Unavailable",
          secondary: payloadType !== "url" ? "Non-URL payload" : tlsInfo?.protocol ?? "TLS check unavailable",
          status: payloadType !== "url" ? "unavailable" : tlsInfo ? (tlsInfo.valid ? "ok" : "bad") : "unavailable",
        },
      ]
    : null;

  const mapStatusRows: QrStatusRow[] = [
    { icon: ShieldCheck, label: "Decoded locally", value: decodedValue ? "Yes" : "—", tone: decodedValue ? "safe" : "unknown" },
    { icon: Route, label: "Hidden redirects", value: payloadType === "url" ? "None" : payloadType ? "Not applicable" : "—", tone: "neutral" },
    {
      icon: Shield,
      label: "Reputation",
      value: !result ? (payloadType && payloadType !== "url" ? "Not checked" : "—") : result.threatLevel === "SAFE" || result.threatLevel === "LOW_RISK" ? "Low risk" : "Elevated risk",
      tone: !result ? "unknown" : result.threatLevel === "SAFE" || result.threatLevel === "LOW_RISK" ? "safe" : "danger",
    },
  ];

  const destinationVerified: boolean | null | "n/a" =
    payloadType === "url"
      ? result
        ? result.threatLevel === "SAFE" || result.threatLevel === "LOW_RISK"
        : null
      : payloadType === "dangerous"
        ? false
        : payloadType
          ? "n/a"
          : null;

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
          style={{ background: "radial-gradient(560px circle at var(--gx, 20%) var(--gy, 0%), rgba(255,90,0,0.05), transparent 70%)" } as React.CSSProperties}
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[68%_32%]">
          <div className="border-b border-[var(--border-muted)] lg:border-b-0 lg:border-r">
            <ScannerTabs active="qr" />

            <div className="p-5 sm:p-7">
              <QrDropzone onFile={handleFile} disabled={qrState === "decoding" || qrState === "scanning"} error={validationError} />

              {file && (
                <SelectedQrPreview
                  file={file}
                  decoding={decoding}
                  decoded={!!decodedValue}
                  onReplace={handleReplace}
                  onRemove={resetToIdle}
                  busy={qrState === "decoding" || qrState === "scanning"}
                />
              )}

              {qrState === "error" ? (
                <div className="mt-6 flex items-start gap-3 rounded-xl border border-[var(--danger)]/40 bg-[var(--danger)]/10 p-4 text-sm text-[var(--danger)]">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-semibold">Scan failed</p>
                    <p className="mt-0.5 text-[var(--text-secondary)]">{errorMessage}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-4">
                      <button
                        type="button"
                        onClick={() => (decodedValue ? handleRescan() : file && handleFile(file))}
                        className="text-xs font-bold uppercase tracking-wide text-[var(--danger)] underline"
                      >
                        Retry
                      </button>
                      {decodedValue && payloadType === "url" && (
                        <button type="button" onClick={handleOpenSafely} className="text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)] underline">
                          Open unscanned link anyway
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                file && <ScanProgressRail state={railState} activeIndex={activeStageIndex} stages={QR_STAGES} skippedIndices={skippedIndices} />
              )}

              {qrState === "partial" && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-[var(--warning)]/40 bg-[var(--warning)]/10 p-3.5 text-sm text-[var(--warning)]">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-semibold">Connection check unavailable</p>
                    <p className="mt-0.5 text-[var(--text-secondary)]">The reputation result below is real; the TLS/connection check didn&apos;t respond.</p>
                  </div>
                </div>
              )}

              {resultSummary && (
                <ResultSummary
                  data={resultSummary}
                  emptyLabel="Upload a QR code to see its destination and risk score."
                  actions={
                    <>
                      <button
                        type="button"
                        onClick={handleOpenSafely}
                        className="flex h-11 min-h-[44px] items-center gap-2 rounded-lg border border-[var(--orange)] px-4 text-xs font-bold uppercase tracking-wide text-[var(--orange-light)] transition-colors hover:bg-[var(--orange)]/10"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Open Safely
                      </button>
                      <button
                        type="button"
                        onClick={handleRescan}
                        className="flex h-11 min-h-[44px] items-center gap-2 rounded-lg border border-[var(--border)] px-4 text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)] transition-colors hover:text-[var(--white)]"
                      >
                        <RotateCw className="h-3.5 w-3.5" /> Re-scan
                      </button>
                    </>
                  }
                />
              )}

              {confirmOpen && (
                <div className="mt-3 rounded-lg border border-[var(--danger)]/40 bg-[var(--danger)]/10 p-3.5 text-xs text-[var(--text-secondary)]">
                  <p className="font-semibold text-[var(--danger)]">This destination hasn&apos;t been confirmed safe.</p>
                  <p className="mt-1">{decodedValue}</p>
                  <div className="mt-2 flex gap-3">
                    <button type="button" onClick={handleOpenSafely} className="text-xs font-bold uppercase tracking-wide text-[var(--danger)] underline">
                      Yes, open anyway
                    </button>
                    <button type="button" onClick={() => setConfirmOpen(false)} className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)] underline">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {decodedValue && payloadType !== "url" && qrState !== "error" && (
                <div className="mt-6 rounded-xl border border-[var(--border-muted)] bg-[var(--surface-soft)] p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">{PAYLOAD_TYPE_LABEL[payloadType ?? "text"]}</p>
                  <p className="mt-2 break-all font-mono text-sm text-[var(--white)]">{decodedValue}</p>
                  <p className="mt-2 text-xs text-[var(--text-secondary)]">
                    {payloadType === "dangerous"
                      ? "This QR code points to a scheme that's blocked for safety and was never opened or scanned."
                      : "This isn't a web link, so no reputation check was performed and nothing was sent to any provider."}
                  </p>
                </div>
              )}

              {cards && <StatusCards cards={cards} />}
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <QrIntelligencePanel state={qrState} destinationVerified={destinationVerified} statusRows={mapStatusRows} />
            {result?.demo && (qrState === "complete" || qrState === "partial") && (
              <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                Demo Data — no live threat-intel provider configured
              </p>
            )}
          </div>
        </div>
      </div>

      {result && (
        <ReputationSources
          engines={result.engines}
          title="Threat Intelligence"
          labels={{ detected: "Malicious", suspicious: "Caution" }}
          providerIcon={(id) =>
            ({
              "internal-engine": Shield,
              "google-safe-browsing": Globe,
              virustotal: Sigma,
              phishtank: Fish,
              "community-reports": Database,
            })[id]
          }
        />
      )}
      <RecentScans scans={recentScans} title="Recent QR Scans" />
    </>
  );
}
