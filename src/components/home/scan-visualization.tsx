"use client";

import { motion } from "framer-motion";
import {
  Shield,
  Link as LinkIcon,
  FileText,
  FileType,
  Globe,
  Smartphone,
  Skull,
  AlertTriangle,
  SignalHigh,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ORBIT_NODES = [
  { icon: LinkIcon, label: "URL", top: "10%", left: "43%" },
  { icon: FileText, label: "FILE", top: "35%", left: "16%" },
  { icon: Smartphone, label: "APK", top: "35%", left: "72%" },
  { icon: FileType, label: "PDF", top: "72%", left: "20%" },
  { icon: Globe, label: "DOMAIN", top: "74%", left: "66%" },
];

const SKULLS = [
  { top: "38%", left: "0%" },
  { top: "56%", left: "4%" },
  { top: "34%", left: "95%" },
];

function OrbitNode({ icon: Icon, label, top, left }: (typeof ORBIT_NODES)[number]) {
  return (
    <div
      className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5"
      style={{ top, left }}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-flame-primary/40 bg-card-bg/90 text-flame-bright shadow-[0_0_20px_-4px_rgba(255,90,0,0.5)] sm:h-14 sm:w-14">
        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>
      <span className="text-[9px] font-semibold uppercase tracking-widest text-muted sm:text-[10px]">{label}</span>
    </div>
  );
}

export function ScanVisualization() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-lg select-none">
      {/* wireframe globe backdrop, larger than the radar so it peeks out at the edges */}
      <svg
        viewBox="0 0 200 200"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[128%] w-[128%] -translate-x-1/2 -translate-y-1/2 text-flame-primary/25"
      >
        <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
        <ellipse cx="100" cy="100" rx="90" ry="34" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
        <ellipse cx="100" cy="100" rx="90" ry="62" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
        <line x1="10" y1="100" x2="190" y2="100" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
        <motion.g
          style={{ transformOrigin: "100px 100px" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        >
          <ellipse cx="100" cy="100" rx="34" ry="90" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
        </motion.g>
      </svg>

      {SKULLS.map((s, i) => (
        <Skull key={i} className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-flame-primary/25" style={{ top: s.top, left: s.left }} />
      ))}

      {/* radar rings */}
      <div className="absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-flame-primary/20" />
      <div className="absolute left-1/2 top-1/2 h-[56%] w-[56%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-flame-primary/25" />
      <div className="absolute left-1/2 top-1/2 h-[34%] w-[34%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-flame-primary/30" />

      {/* rotating radar sweep — a fading wedge, not a single line */}
      <div
        className="absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 animate-radar-sweep overflow-hidden rounded-full"
        style={{
          background: "conic-gradient(from 0deg, rgba(255,122,0,0.45), rgba(255,90,0,0.12) 45deg, transparent 100deg)",
        }}
      />

      {/* central shield */}
      <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-flame-primary/40 bg-flame-primary/10 sm:h-28 sm:w-28">
        <Shield className="h-11 w-11 text-flame-bright sm:h-14 sm:w-14" strokeWidth={1.5} />
      </div>

      {ORBIT_NODES.map((n) => (
        <OrbitNode key={n.label} {...n} />
      ))}

      {/* Scanning terminal card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="absolute -left-6 -top-2 hidden w-52 rounded-xl border border-border-subtle bg-card-bg/95 p-3 shadow-xl shadow-black/50 backdrop-blur sm:block"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white">Scanning...</span>
          <span className="h-1.5 w-1.5 rounded-full bg-flame-bright animate-pulse-glow" />
        </div>
        <div className="mt-2 space-y-1 font-mono text-[10px] leading-relaxed">
          <p className="text-soft-white">https://example.com</p>
          <p className="flex items-center justify-between text-muted">
            Analyzing reputation... <CheckCircle2 className="h-3 w-3 text-success" />
          </p>
          <p className="flex items-center justify-between text-muted">
            Checking indicators... <CheckCircle2 className="h-3 w-3 text-success" />
          </p>
          <p className="text-muted">Scanning with 42 engines...</p>
          <p className="text-flame-bright">Detecting threats...</p>
          <p className="text-muted">Finalizing report...</p>
        </div>
      </motion.div>

      {/* Threat detected card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="absolute -right-6 -top-2 hidden w-48 rounded-xl border border-danger/30 bg-card-bg/95 p-3 shadow-xl shadow-black/50 backdrop-blur sm:block"
      >
        <div className="flex items-center gap-1.5 text-xs font-semibold text-danger">
          <AlertTriangle className="h-3.5 w-3.5" /> THREAT DETECTED
        </div>
        <div className="mt-2 space-y-1.5 text-[11px] text-soft-white">
          <p className="flex items-center gap-1.5">
            <LinkIcon className="h-3 w-3 text-danger" /> Malicious URL
          </p>
          <p className="flex items-center gap-1.5">
            <AlertTriangle className="h-3 w-3 text-warning" /> Phishing
          </p>
          <p className="flex items-center gap-1.5">
            <SignalHigh className="h-3 w-3 text-danger" /> High Risk
          </p>
        </div>
      </motion.div>

      {/* Reputation score card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="absolute -right-6 bottom-2 hidden w-44 rounded-xl border border-border-subtle bg-card-bg/95 p-3 shadow-xl shadow-black/50 backdrop-blur sm:block"
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">Reputation Score</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-danger/60">
            <span className="font-heading text-sm font-bold text-white">8</span>
          </div>
          <div>
            <p className="text-xs text-muted">/100</p>
            <p className={cn("text-xs font-semibold text-danger")}>High Risk</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
