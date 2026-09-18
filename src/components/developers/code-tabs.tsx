"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CODE_SAMPLES } from "@/lib/data/api-endpoints";

const LANGS = [
  { id: "curl", label: "cURL" },
  { id: "javascript", label: "JavaScript" },
  { id: "node", label: "Node.js" },
  { id: "python", label: "Python" },
] as const;

export function CodeTabs() {
  const [lang, setLang] = useState<keyof typeof CODE_SAMPLES>("curl");

  return (
    <div className="overflow-hidden rounded-xl border border-border-subtle bg-black">
      <div className="flex gap-1 border-b border-border-subtle p-2">
        {LANGS.map((l) => (
          <button
            key={l.id}
            onClick={() => setLang(l.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold",
              lang === l.id ? "bg-flame-primary/15 text-flame-bright" : "text-muted hover:text-white",
            )}
          >
            {l.label}
          </button>
        ))}
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed text-soft-white sm:text-sm">
        <code>{CODE_SAMPLES[lang]}</code>
      </pre>
    </div>
  );
}
