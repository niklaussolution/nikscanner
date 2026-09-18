"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Play,
  Copy,
  Check,
  ChevronDown,
  Braces,
  Laptop,
  Server,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LANG_SAMPLES, RESPONSE_LINES, TOKEN_CLASS_NAME, type CodeLine, type LangSample } from "@/components/developers/code-samples";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const LINE_H = 25;

function CodeLines({
  lines,
  revealKey,
  caretLine,
  activeLineRef,
}: {
  lines: CodeLine[];
  revealKey: string | number;
  caretLine?: number;
  activeLineRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = prefersReducedMotion();
    const rows = root.querySelectorAll<HTMLElement>("[data-code-row]");
    const highlight = activeLineRef?.current;

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(rows, { opacity: 1 });
        if (highlight) gsap.set(highlight, { y: (lines.length - 1) * LINE_H, opacity: 1 });
        return;
      }

      gsap.set(rows, { opacity: 0 });
      const tl = gsap.timeline();
      rows.forEach((row, i) => {
        const tokens = row.querySelectorAll<HTMLElement>("[data-token]");
        tl.to(row, { opacity: 1, duration: 0.01 }, i * 0.11);
        if (tokens.length) {
          tl.fromTo(
            tokens,
            { opacity: 0, y: 3 },
            { opacity: 1, y: 0, duration: 0.16, stagger: 0.015, ease: "power1.out" },
            i * 0.11,
          );
        }
        if (highlight) {
          tl.to(highlight, { y: i * LINE_H, opacity: 1, duration: 0.16, ease: "power2.out" }, i * 0.11);
        }
      });
    }, root);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealKey]);

  return (
    <div ref={rootRef} className="relative">
      {activeLineRef && (
        <div
          ref={activeLineRef}
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 top-0 z-0 bg-flame-primary/[0.06]"
          style={{ height: LINE_H, opacity: 0 }}
        />
      )}
      {lines.map((line, i) => (
        <div key={i} data-code-row className="relative z-10 flex" style={{ height: LINE_H }}>
          <span className="w-8 shrink-0 select-none text-right pr-3 text-muted/50">{i + 1}</span>
          <span className="whitespace-pre">
            {line.map((tok, j) => (
              <span key={j} data-token className={TOKEN_CLASS_NAME[tok.c]}>
                {tok.t}
              </span>
            ))}
            {caretLine === i && <span className="caret-blink ml-0.5 inline-block h-[15px] w-[7px] translate-y-[2px] bg-flame-bright" />}
          </span>
        </div>
      ))}
    </div>
  );
}

function CopyButton({ getText }: { getText: () => string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(getText());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy"
      className="flex h-7 w-7 items-center justify-center rounded-md border border-border-subtle text-muted transition-colors hover:border-flame-primary/40 hover:text-white"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

const FLOW_STAGES = [
  { id: "app", icon: Laptop, title: "Your App", subtitle: "Sends request" },
  { id: "api", icon: Server, title: "NIKSCANNER API", subtitle: "Analyzes in real-time" },
  { id: "intel", icon: Database, title: "Threat Intelligence", subtitle: "Multi-source analysis" },
];

const METRICS = [
  { id: "requests", value: 12400, format: (v: number) => `${(v / 1000).toFixed(1)}K`, label: "Requests" },
  { id: "errors", value: 0, format: (v: number) => `${Math.round(v)}`, label: "Errors" },
  { id: "sources", value: 42, format: (v: number) => `${Math.round(v)}`, label: "Sources" },
];

export function ApiPlayground() {
  const rootRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const runBtnRef = useRef<HTMLButtonElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const responsePanelRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const packetsRef = useRef<HTMLDivElement>(null);
  const quickX = useRef<gsap.QuickToFunc | null>(null);
  const quickY = useRef<gsap.QuickToFunc | null>(null);
  const runQuickX = useRef<gsap.QuickToFunc | null>(null);
  const runQuickY = useRef<gsap.QuickToFunc | null>(null);

  const [activeLang, setActiveLang] = useState<LangSample["id"]>("javascript");
  const [runState, setRunState] = useState<"idle" | "loading" | "done">("done");
  const [responseTime, setResponseTime] = useState(112);
  const [metricValues, setMetricValues] = useState(() => METRICS.map((m) => m.value));

  const sample = LANG_SAMPLES.find((s) => s.id === activeLang)!;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        root,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", scrollTrigger: { trigger: root, start: "top 82%", once: true } },
      );

      METRICS.forEach((m, i) => {
        ScrollTrigger.create({
          trigger: root,
          start: "top 82%",
          once: true,
          onEnter: () => {
            const obj = { v: 0 };
            gsap.to(obj, {
              v: m.value,
              duration: 1.4,
              delay: 0.4 + i * 0.1,
              ease: "power2.out",
              onUpdate: () => setMetricValues((prev) => prev.map((p, idx) => (idx === i ? obj.v : p))),
            });
          },
        });
      });

      if (!reduced) {
        quickX.current = gsap.quickTo(glowRef.current, "--gx", { duration: 0.6, ease: "power3" });
        quickY.current = gsap.quickTo(glowRef.current, "--gy", { duration: 0.6, ease: "power3" });
        runQuickX.current = gsap.quickTo(runBtnRef.current, "x", { duration: 0.35, ease: "power3" });
        runQuickY.current = gsap.quickTo(runBtnRef.current, "y", { duration: 0.35, ease: "power3" });

        const packets = packetsRef.current?.querySelectorAll<HTMLElement>("[data-packet]");
        packets?.forEach((p, i) => {
          gsap.fromTo(
            p,
            { xPercent: 0, opacity: 0 },
            {
              xPercent: 100,
              opacity: 1,
              duration: 1.6,
              repeat: -1,
              delay: i * 0.8,
              ease: "power1.inOut",
              repeatDelay: 0.4,
            },
          );
        });
      }
    }, root);

    return () => ctx.revert();
  }, []);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (prefersReducedMotion()) return;
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;
    quickX.current?.(e.clientX - rect.left);
    quickY.current?.(e.clientY - rect.top);
  }

  function handleRunMove(e: React.MouseEvent<HTMLButtonElement>) {
    if (prefersReducedMotion() || !runBtnRef.current) return;
    const rect = runBtnRef.current.getBoundingClientRect();
    runQuickX.current?.((e.clientX - rect.left - rect.width / 2) * 0.25);
    runQuickY.current?.((e.clientY - rect.top - rect.height / 2) * 0.2);
  }
  function handleRunLeave() {
    runQuickX.current?.(0);
    runQuickY.current?.(0);
  }

  function handleRun() {
    if (runState === "loading") return;
    setRunState("loading");

    const tl = gsap.timeline({
      onComplete: () => {
        setRunState("done");
        const obj = { v: 0 };
        gsap.to(obj, {
          v: 112,
          duration: 0.8,
          ease: "power2.out",
          onUpdate: () => setResponseTime(Math.round(obj.v)),
        });
      },
    });

    if (responsePanelRef.current) {
      tl.to(responsePanelRef.current, { opacity: 0.35, duration: 0.2 });
    }
    if (runBtnRef.current) {
      tl.fromTo(
        runBtnRef.current,
        { boxShadow: "0 0 0 0 rgba(255,90,0,0.5)" },
        { boxShadow: "0 0 0 8px rgba(255,90,0,0)", duration: 0.9, ease: "power1.out" },
        0,
      );
    }
    tl.to({}, { duration: 0.7 });
    if (responsePanelRef.current) {
      tl.to(responsePanelRef.current, { opacity: 1, duration: 0.3 });
    }
  }

  return (
    <div
      ref={rootRef}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden rounded-2xl border border-border-subtle bg-card-bg shadow-2xl shadow-black/50"
    >
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-70"
        style={
          {
            background: "radial-gradient(480px circle at var(--gx, 30%) var(--gy, 10%), rgba(255,90,0,0.07), transparent 70%)",
          } as React.CSSProperties
        }
      />

      <div className="relative z-10">
        {/* window chrome */}
        <div className="flex items-center gap-3 border-b border-border-subtle px-5 py-3.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
          </div>
          <p className="font-mono text-xs font-semibold uppercase tracking-wide text-muted">NIKSCANNER API Playground</p>
          <span className="ml-auto flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-glow" /> API Online
          </span>
        </div>

        <div className="p-5 sm:p-6">
          {/* tabs + endpoint row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex items-center gap-5">
              {LANG_SAMPLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveLang(s.id)}
                  className={cn(
                    "relative pb-1.5 text-sm font-semibold transition-colors",
                    activeLang === s.id ? "text-white" : "text-muted hover:text-soft-white",
                  )}
                >
                  {s.label}
                  {activeLang === s.id && (
                    <span className="absolute -bottom-[1px] left-0 h-[2px] w-full rounded-full bg-flame-primary transition-all" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-md border border-flame-primary/40 bg-flame-primary/10 px-2.5 py-1.5 text-[11px] font-bold text-flame-bright">
                GET <ChevronDown className="h-3 w-3" />
              </span>
              <span className="rounded-md border border-border-subtle bg-black/40 px-3 py-1.5 font-mono text-[11px] text-soft-white">
                /v1/scan/url
              </span>
            </div>
          </div>

          {/* editor + run */}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 flex-1 overflow-x-auto rounded-xl border border-border-subtle bg-black/50 p-4 scrollbar-thin">
              <div className="mb-2 flex items-center justify-end">
                <CopyButton getText={() => sample.lines.map((l) => l.map((t) => t.t).join("")).join("\n")} />
              </div>
              <div className="font-mono text-[13px] leading-[25px]">
                <CodeLines lines={sample.lines} revealKey={activeLang} caretLine={sample.lines.length - 1} activeLineRef={highlightRef} />
              </div>
            </div>

            <button
              ref={runBtnRef}
              type="button"
              onMouseMove={handleRunMove}
              onMouseLeave={handleRunLeave}
              onClick={handleRun}
              disabled={runState === "loading"}
              className="flex shrink-0 flex-row items-center justify-center gap-2 rounded-xl border border-flame-primary/50 bg-gradient-to-b from-flame-primary/20 to-flame-primary/5 px-4 py-3 text-flame-bright transition-colors hover:bg-flame-primary/15 disabled:opacity-70 sm:w-[118px] sm:flex-col sm:gap-3 sm:py-4"
            >
              <Play className={cn("h-5 w-5 shrink-0", runState === "loading" && "animate-pulse")} fill="currentColor" />
              <span className="text-center text-[11px] font-bold uppercase leading-tight tracking-wide">
                {runState === "loading" ? "Running..." : "Run Request →"}
              </span>
            </button>
          </div>

          {/* response panel */}
          <div ref={responsePanelRef} className="mt-4 rounded-xl border border-border-subtle bg-black/50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-white">
                <Braces className="h-3.5 w-3.5 text-flame-bright" /> Response
              </span>
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-success/30 bg-success/10 px-2 py-1 text-[11px] font-bold text-success">200 OK</span>
                <span className="rounded-md border border-border-subtle px-2 py-1 text-[11px] font-semibold text-muted">
                  <span ref={timeRef}>{responseTime}</span>ms
                </span>
                <CopyButton getText={() => JSON.stringify({ safe: false, risk_score: 86, category: "phishing", confidence: 0.98 }, null, 2)} />
              </div>
            </div>
            <div className="mt-3 overflow-x-auto font-mono text-[13px] leading-[25px] scrollbar-thin">
              <CodeLines lines={RESPONSE_LINES} revealKey={runState === "done" ? "response" : "response-loading"} />
            </div>
          </div>

          {/* request flow */}
          <div ref={packetsRef} className="relative mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            {FLOW_STAGES.map((stage, i) => (
              <div key={stage.id} className="flex flex-1 items-center gap-3 sm:contents">
                <div className="flex flex-1 items-center gap-2.5 rounded-lg border border-border-subtle bg-black/40 px-3.5 py-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-flame-primary/25 bg-flame-primary/10 text-flame-bright">
                    <stage.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-bold uppercase tracking-wide text-white">{stage.title}</p>
                    <p className="truncate text-[10px] text-muted">{stage.subtitle}</p>
                  </div>
                </div>
                {i < FLOW_STAGES.length - 1 && (
                  <div className="relative h-6 w-6 shrink-0 rotate-90 sm:h-px sm:w-8 sm:rotate-0">
                    <div className="absolute inset-0 border-t border-dashed border-flame-primary/40 sm:top-1/2" />
                    <span data-packet className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-flame-bright shadow-[0_0_6px_rgba(255,122,26,0.8)]" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* usage metrics */}
          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border-subtle pt-5">
            {METRICS.map((m, i) => (
              <div key={m.id} className="flex items-center gap-2">
                <p className="font-heading text-xl font-bold text-white sm:text-2xl">{m.format(metricValues[i])}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
