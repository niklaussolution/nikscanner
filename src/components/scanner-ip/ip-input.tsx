"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { Network, X, ArrowRight, RotateCw, MapPinned, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IpScanState } from "@/components/scanner-ip/types";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function IpInput({
  value,
  onChange,
  onScan,
  state,
  validationError,
  hasResult,
}: {
  value: string;
  onChange: (v: string) => void;
  onScan: () => void;
  state: IpScanState;
  validationError: string | null;
  hasResult: boolean;
}) {
  const arrowRef = useRef<SVGSVGElement>(null);
  const quickX = useRef<gsap.QuickToFunc | null>(null);
  const [showConsent, setShowConsent] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // "validating" fires synchronously on click, before any async work — treating it as busy
  // too means the button locks the instant it's clicked, matching the URL/File scanners.
  const busy = state === "scanning" || state === "validating";

  function handleEnter() {
    if (prefersReducedMotion() || busy) return;
    quickX.current ??= gsap.quickTo(arrowRef.current, "x", { duration: 0.25, ease: "power2.out" });
    quickX.current(4);
  }
  function handleLeave() {
    quickX.current?.(0);
  }

  async function confirmUseMyIp() {
    setShowConsent(false);
    setLookingUp(true);
    setLookupError(null);
    try {
      const res = await fetch("/api/my-ip");
      const data = await res.json();
      if (data.ip) {
        onChange(data.ip);
      } else {
        setLookupError(data.error ?? "Couldn't determine your public IP.");
      }
    } catch {
      setLookupError("Couldn't reach the lookup service.");
    } finally {
      setLookingUp(false);
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--white)]">Analyze an IP address</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">Enter a public IPv4 or IPv6 address.</p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Network className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--orange-light)]" />
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onScan()}
            disabled={busy}
            placeholder="8.8.8.8"
            aria-label="IP address to scan"
            aria-invalid={!!validationError}
            className="h-13 w-full min-w-0 rounded-xl border border-[var(--border)] bg-black/40 pl-11 pr-11 font-mono text-sm text-[var(--white)] placeholder:text-[var(--text-muted)] focus:border-[var(--orange)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/20 disabled:opacity-60"
          />
          {value && !busy && (
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="Clear IP address"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors hover:text-[var(--white)]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onScan}
          disabled={busy}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          className={cn(
            "flex h-13 min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--orange)] px-7 text-sm font-bold uppercase tracking-wide text-white shadow-[0_0_0_1px_rgba(255,90,0,0.4),0_10px_28px_-8px_rgba(255,90,0,0.55)] transition-shadow hover:shadow-[0_0_0_1px_rgba(255,122,26,0.6),0_14px_32px_-6px_rgba(255,122,26,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-70",
          )}
        >
          {busy ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" /> Scanning...
            </>
          ) : (
            <>
              Scan IP <ArrowRight ref={arrowRef} className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {validationError && (
        <p role="alert" className="mt-2 text-sm text-[var(--danger)]">
          {validationError}
        </p>
      )}
      {lookupError && (
        <p role="alert" className="mt-2 text-sm text-[var(--danger)]">
          {lookupError}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-[var(--text-secondary)]">
        <button
          type="button"
          onClick={() => setShowConsent(true)}
          disabled={busy || lookingUp}
          className="flex items-center gap-1.5 transition-colors hover:text-[var(--orange-light)] disabled:opacity-50"
        >
          {lookingUp ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <MapPinned className="h-3.5 w-3.5" />}
          Use my IP
        </button>
        {hasResult && (
          <button
            type="button"
            onClick={onScan}
            disabled={busy}
            className="flex items-center gap-1.5 transition-colors hover:text-[var(--white)] disabled:opacity-50"
          >
            <RotateCw className="h-3.5 w-3.5" /> Re-scan
          </button>
        )}
      </div>

      {showConsent && (
        <div className="mt-3 rounded-lg border border-[var(--border)] bg-black/40 p-3.5 text-xs text-[var(--text-secondary)]">
          <p>
            This looks up the public IP address this connection appears to come from, using our own backend (no
            third-party service is called from your browser). The IP fills the field below — nothing is scanned
            until you press Scan IP.
          </p>
          <div className="mt-2.5 flex gap-3">
            <button type="button" onClick={confirmUseMyIp} className="text-xs font-bold uppercase tracking-wide text-[var(--orange-light)] hover:text-[var(--orange)]">
              Continue
            </button>
            <button type="button" onClick={() => setShowConsent(false)} className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)] hover:text-[var(--white)]">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
