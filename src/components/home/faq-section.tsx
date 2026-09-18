"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "How does NIKSCANNER determine a security score?",
    a: "We correlate results from multiple independent detection engines — threat-intelligence databases, our internal heuristic engine, and community reports — into a single 0-100 score. No single provider can push a target into the malicious range alone.",
  },
  {
    q: "Is my scan data private?",
    a: "Scanned URLs and files are processed to generate a verdict and are not sold to third parties. See our Privacy Policy for full retention details.",
  },
  {
    q: "Can NIKSCANNER scan internal or private URLs?",
    a: "No. To prevent the scanning infrastructure from being used as a proxy into private networks, targets resolving to localhost, private IP ranges, or internal infrastructure are blocked by default.",
  },
  {
    q: "How does community reporting work?",
    a: "Anyone can report a suspicious URL. Reports enter a moderation queue and are only reflected in public reputation data once verified — a single unverified report never labels a site malicious.",
  },
  {
    q: "Do you have an API?",
    a: "Yes — the NIKSCANNER API lets you run URL, file, domain and IP scans programmatically. See the Developers section for documentation and SDKs.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="border-t border-border-subtle bg-secondary-dark py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-flame-bright">FAQ</p>
          <h2 className="mt-3 font-heading text-3xl font-bold text-white sm:text-4xl">Frequently asked questions</h2>
        </div>

        <div className="mt-12 divide-y divide-border-subtle rounded-xl border border-border-subtle bg-card-bg">
          {FAQS.map((item, i) => (
            <div key={item.q}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={open === i}
              >
                <span className="text-sm font-medium text-white">{item.q}</span>
                <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted transition-transform", open === i && "rotate-180 text-flame-bright")} />
              </button>
              {open === i && <p className="px-5 pb-4 text-sm text-muted">{item.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
