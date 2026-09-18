"use client";

import { useRef } from "react";
import gsap from "gsap";
import { Link as LinkIcon, Clipboard, ArrowRight, ExternalLink, Trash2, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScanState } from "@/components/scanner-url/types";

const DEMO_URL = "https://secure-login-check.xyz";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function UrlInputPanel({
  value,
  onChange,
  onScan,
  state,
  validationError,
}: {
  value: string;
  onChange: (v: string) => void;
  onScan: () => void;
  state: ScanState;
  validationError: string | null;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);
  const quickX = useRef<gsap.QuickToFunc | null>(null);

  const scanning = state === "scanning";

  function handleEnter() {
    if (prefersReducedMotion() || scanning) return;
    quickX.current ??= gsap.quickTo(arrowRef.current, "x", { duration: 0.25, ease: "power2.out" });
    quickX.current(4);
  }
  function handleLeave() {
    quickX.current?.(0);
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) onChange(text);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--white)]">Enter a suspicious link</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">Paste the complete URL including https://</p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <LinkIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--orange-light)]" />
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onScan()}
            disabled={scanning}
            placeholder="https://example.com/suspicious-login"
            aria-label="URL to scan"
            aria-invalid={!!validationError}
            className="h-13 w-full min-w-0 rounded-xl border border-[var(--border)] bg-black/40 pl-11 pr-12 font-mono text-sm text-[var(--white)] placeholder:text-[var(--text-muted)] focus:border-[var(--orange)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/20 disabled:opacity-60"
          />
          <button
            type="button"
            onClick={handlePaste}
            disabled={scanning}
            aria-label="Paste from clipboard"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors hover:text-[var(--white)] disabled:opacity-50"
          >
            <Clipboard className="h-4 w-4" />
          </button>
        </div>

        <button
          ref={btnRef}
          type="button"
          onClick={onScan}
          disabled={scanning}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          className={cn(
            "flex h-13 min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--orange)] px-7 text-sm font-bold uppercase tracking-wide text-white shadow-[0_0_0_1px_rgba(255,90,0,0.4),0_10px_28px_-8px_rgba(255,90,0,0.55)] transition-shadow hover:shadow-[0_0_0_1px_rgba(255,122,26,0.6),0_14px_32px_-6px_rgba(255,122,26,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-70",
          )}
        >
          {scanning ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" /> Scanning...
            </>
          ) : (
            <>
              Scan URL <ArrowRight ref={arrowRef} className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {validationError && (
        <p role="alert" className="mt-2 text-sm text-[var(--danger)]">
          {validationError}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-[var(--text-secondary)]">
        <button
          type="button"
          onClick={() => onChange(DEMO_URL)}
          disabled={scanning}
          className="flex items-center gap-1.5 transition-colors hover:text-[var(--orange-light)] disabled:opacity-50"
        >
          <ExternalLink className="h-3.5 w-3.5" /> Try a demo URL
        </button>
        <button
          type="button"
          onClick={() => onChange("")}
          disabled={scanning}
          className="flex items-center gap-1.5 transition-colors hover:text-[var(--white)] disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" /> Clear
        </button>
      </div>
    </div>
  );
}
