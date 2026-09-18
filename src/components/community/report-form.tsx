"use client";

import { useId, useState } from "react";
import { Link as LinkIcon, Lock, CheckCircle2, AlertTriangle, Loader2, ArrowRight, FileText } from "lucide-react";
import { REPORT_CATEGORIES } from "@/lib/data/community";

const REASON_MAX = 500;

const STEPS = [
  { id: 1, label: "Details" },
  { id: 2, label: "Evidence" },
  { id: 3, label: "Review" },
] as const;

type FormState = "idle" | "submitting" | "success" | "error";

export function ReportForm() {
  const urlId = useId();
  const categoryId = useId();
  const reasonId = useId();
  const evidenceId = useId();

  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");
  const [reason, setReason] = useState("");
  const [evidence, setEvidence] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isValid = url.trim().length > 0 && category.length > 0 && reason.trim().length >= 10;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValid || state === "submitting") return;

    setState("submitting");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/reports/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          threatType: category,
          reason,
          evidence: evidence || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit report.");
      setState("success");
      setUrl("");
      setCategory("");
      setReason("");
      setEvidence("");
    } catch (err) {
      setState("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (state === "success") {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-[var(--green)]/30 bg-[var(--green)]/5 p-10 text-center">
        <CheckCircle2 className="h-10 w-10 text-[var(--green)]" />
        <h3 className="mt-4 font-heading text-lg font-bold text-[var(--text)]">Report submitted</h3>
        <p className="mt-2 max-w-sm text-sm text-[var(--text-muted)]">
          Thanks — your report has entered the moderation queue. It only affects the target&apos;s public reputation
          once verified.
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

      {/* step indicator */}
      <div className="mt-6 flex items-center" aria-label="Report progress">
        {STEPS.map((step, i) => (
          <div key={step.id} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2">
              <span
                className={
                  step.id === 1
                    ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--orange)] text-xs font-bold text-white"
                    : "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-xs font-bold text-[var(--text-muted)]"
                }
              >
                {step.id}
              </span>
              <span
                className={
                  step.id === 1
                    ? "text-xs font-bold uppercase tracking-wide text-[var(--orange-light)]"
                    : "text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]"
                }
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && <span className="mx-3 h-px flex-1 bg-[var(--border)]" aria-hidden />}
          </div>
        ))}
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
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor={reasonId} className="block text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
              Reason <span className="text-[var(--orange)]">*</span>
            </label>
            <span className="text-[11px] text-[var(--text-muted)]">
              {reason.length}/{REASON_MAX}
            </span>
          </div>
          <textarea
            id={reasonId}
            required
            minLength={10}
            maxLength={REASON_MAX}
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe why this URL is suspicious or malicious..."
            className="w-full rounded-xl border border-[var(--border)] bg-black/30 px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--orange)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/20"
          />
        </div>

        <div>
          <label htmlFor={evidenceId} className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
            Evidence URL <span className="text-[var(--text-muted)] normal-case">(optional)</span>
          </label>
          <input
            id={evidenceId}
            type="text"
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            placeholder="Link to screenshot or additional context (e.g. VirusTotal, WHOIS, etc.)"
            className="h-11 min-h-[44px] w-full rounded-xl border border-[var(--border)] bg-black/30 px-4 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--orange)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/20"
          />
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-[var(--border-soft)] bg-black/20 p-4">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-muted)]" />
          <div>
            <p className="text-sm font-semibold text-[var(--text)]">Your report is anonymous and privacy protected.</p>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">We don&apos;t store personal information, only threat data.</p>
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
            Reports are reviewed before they affect reputation.
          </p>
        </div>
      </form>
    </div>
  );
}
