"use client";

import { useRef } from "react";
import gsap from "gsap";
import { FileText, Archive, FileCog, FileCode, X, ArrowRight, LoaderCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBytes, getExtension } from "@/components/scanner-file/file-validation";
import type { FileScanState } from "@/components/scanner-file/types";

const EXTENSION_ICONS: Record<string, LucideIcon> = {
  ".pdf": FileText,
  ".docx": FileText,
  ".zip": Archive,
  ".apk": Archive,
  ".exe": FileCog,
  ".msi": FileCog,
  ".js": FileCode,
};

export type HashStatus = "preparing" | "computing" | "ready" | "failed";

const HASH_LABEL: Record<HashStatus, string> = {
  preparing: "Preparing file",
  computing: "Computing SHA-256",
  ready: "Ready",
  failed: "Hash failed",
};

export function SelectedFilePreview({
  file,
  hashStatus,
  state,
  onRemove,
  onScan,
}: {
  file: File;
  hashStatus: HashStatus;
  state: FileScanState;
  onRemove: () => void;
  onScan: () => void;
}) {
  const arrowRef = useRef<SVGSVGElement>(null);
  const quickX = useRef<gsap.QuickToFunc | null>(null);

  const Icon = EXTENSION_ICONS[getExtension(file.name)] ?? FileText;
  const busy = state === "uploading" || state === "scanning";
  const scanDisabled = busy || hashStatus !== "ready";

  function handleEnter() {
    if (scanDisabled) return;
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    quickX.current ??= gsap.quickTo(arrowRef.current, "x", { duration: 0.25, ease: "power2.out" });
    quickX.current(4);
  }
  function handleLeave() {
    quickX.current?.(0);
  }

  return (
    <div
      data-file-preview
      className="mt-4 flex flex-col gap-3 rounded-xl border border-[var(--border-muted)] bg-[var(--surface-soft)] p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--orange)]/25 bg-[var(--orange)]/10 text-[var(--orange-light)]">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[var(--white)]">{file.name}</p>
          <p className="text-xs text-[var(--text-muted)]">{formatBytes(file.size)}</p>
        </div>
        <span
          className={cn(
            "ml-1 flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
            hashStatus === "failed"
              ? "border-[var(--danger)]/40 bg-[var(--danger)]/10 text-[var(--danger)]"
              : hashStatus === "ready"
                ? "border-[var(--safe)]/40 bg-[var(--safe)]/10 text-[var(--safe)]"
                : "border-[var(--border)] bg-black/30 text-[var(--text-muted)]",
          )}
        >
          {hashStatus === "computing" || hashStatus === "preparing" ? (
            <LoaderCircle className="h-3 w-3 animate-spin" />
          ) : null}
          {hashStatus === "ready" ? "Ready" : HASH_LABEL[hashStatus]}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
        <button
          type="button"
          onClick={onRemove}
          disabled={busy}
          aria-label="Remove file"
          className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] transition-colors hover:text-[var(--white)] disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onScan}
          disabled={scanDisabled}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          className="flex h-11 min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[var(--orange)] px-6 text-xs font-bold uppercase tracking-wide text-white shadow-[0_0_0_1px_rgba(255,90,0,0.4),0_10px_24px_-8px_rgba(255,90,0,0.55)] transition-shadow hover:shadow-[0_0_0_1px_rgba(255,122,26,0.6),0_12px_28px_-6px_rgba(255,122,26,0.65)] disabled:opacity-70"
        >
          {busy ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" /> Scanning...
            </>
          ) : (
            <>
              Scan File <ArrowRight ref={arrowRef} className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
