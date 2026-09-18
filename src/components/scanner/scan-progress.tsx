"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const STEPS = [
  "Initializing scan...",
  "Checking reputation...",
  "Analyzing redirects...",
  "Verifying SSL...",
  "Checking threat databases...",
  "Finalizing result...",
];

export function ScanProgress({ active }: { active: boolean }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [wasActive, setWasActive] = useState(active);

  // Reset the step counter synchronously during render when `active` flips
  // off, instead of in an effect — avoids an extra render pass.
  if (active !== wasActive) {
    setWasActive(active);
    if (!active) setStepIndex(0);
  }

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, 420);
    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-flame-primary/25 bg-card-bg p-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-full overflow-hidden">
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-flame-primary to-transparent animate-scan-line" />
      </div>

      <div className="relative flex items-center gap-4">
        <div className="relative h-14 w-14 shrink-0">
          <div className="absolute inset-0 rounded-full border-2 border-flame-primary/20" />
          <div className="absolute inset-0 animate-radar-sweep rounded-full border-t-2 border-flame-bright" />
          <div className="absolute inset-3 rounded-full bg-flame-primary/10" />
        </div>
        <div className="flex-1 font-mono text-xs sm:text-sm">
          <AnimatePresence mode="wait">
            <motion.p
              key={stepIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="text-flame-bright"
            >
              <span className="text-muted">$</span> {STEPS[stepIndex]}
            </motion.p>
          </AnimatePresence>
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="h-full bg-gradient-to-r from-flame-hot to-flame-bright"
              animate={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
