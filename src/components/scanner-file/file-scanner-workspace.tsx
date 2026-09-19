"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AlertTriangle, Archive, FileCog, FileText, Hash, Activity, ShieldCheck } from "lucide-react";
import { ScannerTabs } from "@/components/scanner-url/scanner-tabs";
import { ScanProgressRail } from "@/components/scanner-url/scan-progress-rail";
import { AnalysisCards } from "@/components/scanner-url/analysis-cards";
import { ScanEngineRadar } from "@/components/scanner-url/scan-engine-radar";
import { RecentScans, type RecentScanEntry } from "@/components/scanner-url/recent-scans";
import type { AnalysisCardData } from "@/components/scanner-url/types";
import { FileDropzone } from "@/components/scanner-file/file-dropzone";
import { SelectedFilePreview, type HashStatus } from "@/components/scanner-file/selected-file-preview";
import { FILE_STAGES, type FileScanState } from "@/components/scanner-file/types";
import { validateFileMeta, sniffMatchesExtension, hashFileSHA256, formatBytes, getExtension } from "@/components/scanner-file/file-validation";
import { fileTypeLabel } from "@/components/scanner-file/file-analysis";
import { THREAT_LEVEL_LABEL, type ScanResultPayload } from "@/types/scan";
import { logScanIfSignedIn } from "@/lib/firebase/log-scan";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STAGE_INTERVAL_MS = 850;

const INITIAL_RECENT_FILE_SCANS: RecentScanEntry[] = [
  { id: "1", icon: FileText, primary: "invoice_2026.pdf", secondary: "1.8 MB • PDF", verdict: "CLEAN", verdictTone: "safe", time: "2m ago" },
  { id: "2", icon: FileCog, primary: "system_patch.exe", secondary: "12.4 MB • EXE", verdict: "MALWARE", verdictTone: "danger", time: "21m ago" },
  { id: "3", icon: Archive, primary: "nikscanner.apk", secondary: "8.7 MB • APK", verdict: "CLEAN", verdictTone: "safe", time: "1h ago" },
];

function defaultCards(fileName?: string): AnalysisCardData[] {
  return [
    { id: "hash", icon: Hash, title: "File Hash", value: "SHA-256 ready", tone: "neutral" },
    { id: "filetype", icon: FileText, title: "File Type", value: fileName ? fileTypeLabel(fileName) : "No file yet", tone: "neutral" },
    { id: "signatures", icon: ShieldCheck, title: "Malware Signatures", value: "Awaiting scan", tone: "neutral" },
    { id: "behavior", icon: Activity, title: "Behavior Analysis", value: "Sandbox standby", tone: "neutral" },
  ];
}

function toneForThreatLevel(threatLevel: ScanResultPayload["threatLevel"]): AnalysisCardData["tone"] {
  if (threatLevel === "SAFE" || threatLevel === "LOW_RISK") return "safe";
  if (threatLevel === "SUSPICIOUS") return "neutral";
  return "danger";
}

function computeResultCards(result: ScanResultPayload, file: File, sha256: string): AnalysisCardData[] {
  const cleanCount = result.engines.filter((e) => e.verdict === "clean").length;
  const detectedCount = result.engines.filter((e) => e.verdict === "detected").length;

  return [
    { id: "hash", icon: Hash, title: "File Hash", value: `${sha256.slice(0, 12)}…`, tone: "neutral" },
    { id: "filetype", icon: FileText, title: "File Type", value: fileTypeLabel(file.name), tone: "neutral" },
    {
      id: "signatures",
      icon: ShieldCheck,
      title: "Malware Signatures",
      value: detectedCount > 0 ? `${detectedCount} engine${detectedCount > 1 ? "s" : ""} flagged` : `${cleanCount}/${result.engines.length} clean`,
      tone: detectedCount > 0 ? "danger" : "safe",
    },
    {
      id: "behavior",
      icon: Activity,
      title: "Behavior Analysis",
      value: THREAT_LEVEL_LABEL[result.threatLevel],
      tone: toneForThreatLevel(result.threatLevel),
    },
  ];
}

export function FileScannerWorkspace() {
  const rootRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const quickX = useRef<gsap.QuickToFunc | null>(null);
  const quickY = useRef<gsap.QuickToFunc | null>(null);
  const stageTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [sha256, setSha256] = useState<string | null>(null);
  const [hashStatus, setHashStatus] = useState<HashStatus>("preparing");
  const [fileScanState, setFileScanState] = useState<FileScanState>("idle");
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [cards, setCards] = useState<AnalysisCardData[]>(defaultCards());
  const [validationError, setValidationError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [demoResult, setDemoResult] = useState(false);
  const [recentScans, setRecentScans] = useState<RecentScanEntry[]>(INITIAL_RECENT_FILE_SCANS);

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

  function resetToIdle() {
    setFile(null);
    setSha256(null);
    setHashStatus("preparing");
    setFileScanState("idle");
    setCards(defaultCards());
    setValidationError(null);
    setErrorMessage(null);
    setActiveStageIndex(0);
    setDemoResult(false);
  }

  async function handleFile(picked: File) {
    if (fileScanState === "uploading" || fileScanState === "scanning") return;

    const meta = validateFileMeta(picked);
    if (!meta.ok) {
      setValidationError(meta.error ?? "This file can't be scanned.");
      return;
    }

    setValidationError(null);
    setErrorMessage(null);
    setFile(picked);
    setSha256(null);
    setCards(defaultCards(picked.name));
    setFileScanState("hashing");
    setActiveStageIndex(0);
    setHashStatus("preparing");

    try {
      const matches = await sniffMatchesExtension(picked);
      if (!matches) {
        setFile(null);
        setFileScanState("idle");
        setCards(defaultCards());
        setValidationError("This file's content doesn't match its extension — it may have been renamed to bypass filtering.");
        return;
      }

      setHashStatus("computing");
      const digest = await hashFileSHA256(picked);
      setSha256(digest);
      setHashStatus("ready");
      setFileScanState("selected");
    } catch {
      setHashStatus("failed");
      setFileScanState("selected");
    }
  }

  function handleRemove() {
    resetToIdle();
  }

  async function handleScan() {
    if (!file || !sha256 || hashStatus !== "ready") return;

    setErrorMessage(null);
    setFileScanState("uploading");
    setActiveStageIndex(0);

    let i = 0;
    stageTimerRef.current = setInterval(() => {
      i += 1;
      if (i >= FILE_STAGES.length) {
        if (stageTimerRef.current) clearInterval(stageTimerRef.current);
        return;
      }
      setActiveStageIndex(i);
      if (i === 1) setFileScanState("scanning");
    }, STAGE_INTERVAL_MS);

    const stageTimerDone = new Promise<void>((resolve) => setTimeout(resolve, STAGE_INTERVAL_MS * (FILE_STAGES.length - 1)));

    try {
      const fetchPromise = fetch("/api/scan/file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType: "file", sha256, fileName: file.name, fileSize: file.size }),
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Scan failed.");
        return data as ScanResultPayload;
      });

      const [result] = await Promise.all([fetchPromise, stageTimerDone]);

      if (stageTimerRef.current) clearInterval(stageTimerRef.current);
      setActiveStageIndex(FILE_STAGES.length - 1);
      setCards(computeResultCards(result, file, sha256));
      setDemoResult(result.demo);
      setFileScanState("complete");
      logScanIfSignedIn({ target: file.name, targetType: "file", threatLevel: result.threatLevel, score: result.score });

      const isSafe = result.threatLevel === "SAFE" || result.threatLevel === "LOW_RISK";
      const verdictTone: RecentScanEntry["verdictTone"] = isSafe ? "safe" : "danger";
      const ext = getExtension(file.name).slice(1).toUpperCase();
      setRecentScans((prev) => [
        {
          id: result.id,
          icon: FileText,
          primary: file.name,
          secondary: `${formatBytes(file.size)} • ${ext}`,
          verdict: isSafe ? "CLEAN" : "MALWARE",
          verdictTone,
          time: "Just now",
        },
        ...prev,
      ].slice(0, 3));
    } catch (e) {
      if (stageTimerRef.current) clearInterval(stageTimerRef.current);
      setFileScanState("error");
      setErrorMessage(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    }
  }

  const railState = fileScanState === "uploading" || fileScanState === "scanning" ? "scanning" : fileScanState === "complete" ? "complete" : fileScanState === "error" ? "error" : "idle";
  const dropzoneDisabled = fileScanState === "uploading" || fileScanState === "scanning";

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
            <ScannerTabs active="file" />

            <div className="p-5 sm:p-7">
              <FileDropzone onFile={handleFile} disabled={dropzoneDisabled} error={validationError} />

              {file && (
                <SelectedFilePreview file={file} hashStatus={hashStatus} state={fileScanState} onRemove={handleRemove} onScan={handleScan} />
              )}

              {fileScanState === "error" ? (
                <div className="mt-6 flex items-start gap-3 rounded-xl border border-[var(--danger)]/40 bg-[var(--danger)]/10 p-4 text-sm text-[var(--danger)]">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-semibold">Scan failed</p>
                    <p className="mt-0.5 text-[var(--text-secondary)]">{errorMessage}</p>
                    <div className="mt-2 flex items-center gap-4">
                      <button type="button" onClick={handleScan} className="text-xs font-bold uppercase tracking-wide text-[var(--danger)] underline">
                        Retry
                      </button>
                      <button type="button" onClick={handleRemove} className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)] underline">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <ScanProgressRail state={railState} activeIndex={activeStageIndex} stages={FILE_STAGES} />
              )}

              <AnalysisCards cards={cards} />
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <ScanEngineRadar
              state={railState}
              title="Malware Engine"
              centerIcon={FileText}
              scanningLabel="Analyzing File"
              statusRows={[
                { icon: Hash, label: "Signature engines", value: "Connected", tone: "safe" },
                { icon: Activity, label: "Sandbox", value: "Standby", tone: "neutral" },
                { icon: ShieldCheck, label: "Privacy", value: "No storage", tone: "safe" },
              ]}
              footerText="Your file hash is generated locally."
            />
            {demoResult && fileScanState === "complete" && (
              <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                Demo Data — no live threat-intel provider configured
              </p>
            )}
          </div>
        </div>
      </div>

      <RecentScans scans={recentScans} title="Recent File Scans" />
    </>
  );
}
