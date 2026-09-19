"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { Link as LinkIcon, Lock, CheckCircle2, AlertTriangle, Loader2, ArrowRight, FileText, LogIn } from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";
import { authedJson } from "@/lib/firebase/api";

const REPORT_CATEGORIES = [
  { value: "phishing", label: "Phishing" },
  { value: "malicious", label: "Malicious" },
  { value: "tracking", label: "Tracking" },
  { value: "suspicious", label: "Suspicious" },
] as const;

type FormState = "idle" | "submitting" | "success" | "error";

interface ReportResult {
  ok: true;
  duplicate: boolean;
  confirmed: boolean;
  reporters: number;
  points: number;
  points_awarded: number;
}

export function ReportForm() {
  const { user, loading: authLoading } = useAuth();
  const urlId = useId();
  const categoryId = useId();

  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ReportResult | null>(null);

  const isValid = url.trim().length > 0 && category.length > 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValid || state === "submitting") return;

    setState("submitting");
    setErrorMessage(null);

    try {
      const data = await authedJson<ReportResult>("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, category }),
      });
      setResult(data);
      setState("success");
      setUrl("");
      setCategory("");
    } catch (err) {
      setState("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
        <Lock className="h-10 w-10 text-[var(--text-muted)]" />
        <h3 className="mt-4 font-heading text-lg font-bold text-[var(--text)]">Sign in to report a URL</h3>
        <p className="mt-2 max-w-sm text-sm text-[var(--text-muted)]">
          Reports are tied to your account so we can credit you and prevent abuse. Sign in or create a free account
          to get started.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login?next=/community"
            className="flex h-11 min-h-[44px] items-center gap-2 rounded-lg bg-[var(--orange)] px-5 text-sm font-bold text-white"
          >
            <LogIn className="h-4 w-4" /> Log In
          </Link>
          <Link
            href="/signup?next=/community"
            className="flex h-11 min-h-[44px] items-center rounded-lg border border-[var(--border)] px-5 text-sm font-bold text-[var(--text)] transition-colors hover:border-[var(--orange)]/50"
          >
            Sign Up
          </Link>
        </div>
      </div>
    );
  }

  if (state === "success" && result) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-[var(--green)]/30 bg-[var(--green)]/5 p-10 text-center">
        <CheckCircle2 className="h-10 w-10 text-[var(--green)]" />
        <h3 className="mt-4 font-heading text-lg font-bold text-[var(--text)]">Report submitted</h3>
        <p className="mt-2 max-w-sm text-sm text-[var(--text-muted)]">
          {result.duplicate
            ? "You'd already reported this URL — no duplicate points awarded."
            : `Recorded to your account${result.points_awarded > 0 ? ` — +${result.points_awarded} community points` : ""}.`}{" "}
          It only affects the target&apos;s public reputation once confirmed.
        </p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="mt-6 flex h-11 min-h-[44px] items-center rounded-lg border border-[var(--border)] px-5 text-sm font-bold text-[var(--text)] transition-colors hover:border-[var(--orange)]/50"
        >
          Report another URL
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--orange)]/25 bg-[var(--orange)]/10 text-[var(--orange-light)]">
          <FileText className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-[var(--text)] sm:text-lg">Report a suspicious URL</h2>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            Help the community by reporting malicious or suspicious links.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label htmlFor={urlId} className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
            Suspicious URL <span className="text-[var(--orange)]">*</span>
          </label>
          <div className="relative">
            <LinkIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              id={urlId}
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://suspicious-site.com"
              className="h-11 min-h-[44px] w-full rounded-xl border border-[var(--border)] bg-black/30 pl-10 pr-3 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--orange)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/20"
            />
          </div>
        </div>

        <div>
          <label htmlFor={categoryId} className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
            Threat category <span className="text-[var(--orange)]">*</span>
          </label>
          <select
            id={categoryId}
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-11 min-h-[44px] w-full appearance-none rounded-xl border border-[var(--border)] bg-black/30 px-3 text-sm text-[var(--text)] focus:border-[var(--orange)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/20"
          >
            <option value="" disabled>
              Select a category
            </option>
            {REPORT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-[var(--border-soft)] bg-black/20 p-4">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-muted)]" />
          <div>
            <p className="text-sm font-semibold text-[var(--text)]">Recorded under your account.</p>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              Used to credit your contribution and prevent abuse — never shown publicly.
            </p>
          </div>
        </div>

        {state === "error" && errorMessage && (
          <div className="flex items-center gap-2 rounded-lg border border-[var(--red)]/30 bg-[var(--red)]/10 px-4 py-3 text-sm text-[var(--red)]">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {errorMessage}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={!isValid || state === "submitting"}
            className="group flex h-12 min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[var(--orange)] text-sm font-bold text-white shadow-[0_0_0_1px_rgba(255,90,0,0.4)] transition-all duration-200 hover:shadow-[0_0_0_1px_rgba(255,90,0,0.6),0_0_28px_-4px_rgba(255,90,0,0.55)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            {state === "submitting" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
              </>
            ) : (
              <>
                Submit report
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </>
            )}
          </button>
          <p className="mt-3 text-center text-xs text-[var(--text-muted)]">
            Reports are confirmed once enough of the community flags the same URL.
          </p>
        </div>
      </form>
    </div>
  );
}
