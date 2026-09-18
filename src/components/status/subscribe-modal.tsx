"use client";

import { useEffect, useRef, useState } from "react";
import { X, Mail, CheckCircle2, LoaderCircle } from "lucide-react";

export function SubscribeModal({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => emailRef.current?.focus(), 50);

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("submitting");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/status/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setState("success");
    } catch (err) {
      setState("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscribe-modal-title"
        className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-9 w-9 min-h-[36px] items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:text-[var(--white)]"
        >
          <X className="h-4 w-4" />
        </button>

        {state === "success" ? (
          <div className="flex flex-col items-center py-4 text-center">
            <CheckCircle2 className="h-10 w-10 text-[var(--operational)]" />
            <h2 id="subscribe-modal-title" className="mt-3 text-lg font-bold text-[var(--white)]">
              You&apos;re subscribed
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">We&apos;ll email {email} when status changes.</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 flex h-11 min-h-[44px] w-full items-center justify-center rounded-lg bg-[var(--orange)] px-4 text-xs font-bold uppercase tracking-wide text-white"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 id="subscribe-modal-title" className="text-lg font-bold text-[var(--white)]">
              Subscribe to updates
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Get an email whenever a service&apos;s status changes.</p>

            <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]" htmlFor="subscribe-email">
              Email address
            </label>
            <div className="relative mt-1.5">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                ref={emailRef}
                id="subscribe-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={state === "submitting"}
                placeholder="you@example.com"
                className="h-12 w-full rounded-lg border border-[var(--border)] bg-black/40 pl-10 pr-3 text-sm text-[var(--white)] placeholder:text-[var(--text-muted)] focus:border-[var(--orange)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/20 disabled:opacity-60"
              />
            </div>

            <p className="mt-3 text-[11px] text-[var(--text-muted)]">
              By subscribing you agree to receive status notification emails from NIKSCANNER. You can unsubscribe at any time.
            </p>

            {state === "error" && (
              <p role="alert" className="mt-3 text-sm text-[var(--outage)]">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={state === "submitting"}
              className="mt-5 flex h-11 min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-[var(--orange)] px-4 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-70"
            >
              {state === "submitting" ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" /> Subscribing...
                </>
              ) : (
                "Subscribe"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
