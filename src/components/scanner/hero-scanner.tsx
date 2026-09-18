"use client";

import { useState } from "react";
import { Link as LinkIcon, FileUp, Globe, Network, QrCode, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScanProgress } from "./scan-progress";
import { ScanResultPanel } from "./scan-result-panel";
import type { ScanResultPayload, ScanTargetType } from "@/types/scan";

const TABS: { id: ScanTargetType; label: string; icon: typeof LinkIcon; placeholder: string }[] = [
  { id: "url", label: "URL", icon: LinkIcon, placeholder: "https://example.com" },
  { id: "file", label: "File", icon: FileUp, placeholder: "Drop a file to analyze" },
  { id: "domain", label: "Domain", icon: Globe, placeholder: "example.com" },
  { id: "ip", label: "IP", icon: Network, placeholder: "8.8.8.8" },
  { id: "qr", label: "QR", icon: QrCode, placeholder: "Upload a QR code image" },
];

export function HeroScanner({ defaultTab = "url" }: { defaultTab?: ScanTargetType }) {
  const [tab, setTab] = useState<ScanTargetType>(defaultTab);
  const [value, setValue] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResultPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeTab = TABS.find((t) => t.id === tab)!;
  const isInlineSupported = tab === "url" || tab === "domain" || tab === "ip";

  async function runScan() {
    if (!value.trim() || !isInlineSupported) return;
    setScanning(true);
    setError(null);
    setResult(null);

    const start = Date.now();
    try {
      const res = await fetch("/api/scan/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType: tab, target: value.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Scan failed.");

      // keep the animated progress readable even when the API responds instantly
      const elapsed = Date.now() - start;
      if (elapsed < 2500) await new Promise((r) => setTimeout(r, 2500 - elapsed));

      setResult(data as ScanResultPayload);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="w-full rounded-2xl border border-border-subtle bg-card-bg/80 backdrop-blur-xl shadow-2xl shadow-black/40">
      <div className="flex flex-wrap gap-1 border-b border-border-subtle p-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id);
              setResult(null);
              setError(null);
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold uppercase tracking-wide transition-colors",
              tab === t.id ? "bg-flame-primary/15 text-flame-bright" : "text-muted hover:text-white hover:bg-white/5",
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {isInlineSupported ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runScan()}
                placeholder={activeTab.placeholder}
                aria-label={`${activeTab.label} to scan`}
                className="h-13 w-full rounded-lg border border-white/10 bg-black/40 pl-11 pr-4 text-sm text-white placeholder:text-muted focus:border-flame-primary/60 focus:outline-none focus:ring-2 focus:ring-flame-primary/20"
              />
            </div>
            <Button size="lg" onClick={runScan} disabled={scanning || !value.trim()}>
              {scanning ? "Scanning..." : "Scan Now"}
            </Button>
          </div>
        ) : (
          <div className="flex h-24 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 text-center text-sm text-muted">
            <activeTab.icon className="h-5 w-5 text-flame-bright" />
            {activeTab.placeholder}
            <p className="text-xs">Available in the full {activeTab.label} Scanner</p>
          </div>
        )}

        {error && <p className="mt-3 text-sm text-danger">{error}</p>}

        {scanning && (
          <div className="mt-5">
            <ScanProgress active={scanning} />
          </div>
        )}

        {result && !scanning && (
          <div className="mt-5">
            <ScanResultPanel result={result} onRescan={runScan} />
          </div>
        )}
      </div>
    </div>
  );
}
