"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, HelpCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckResult {
  label: string;
  status: "pass" | "fail" | "unknown";
  detail: string;
}

function detectBrowser(ua: string) {
  if (ua.includes("Edg/")) return "Microsoft Edge";
  if (ua.includes("Chrome/") && !ua.includes("Chromium")) return "Google Chrome";
  if (ua.includes("Firefox/")) return "Mozilla Firefox";
  if (ua.includes("Safari/") && !ua.includes("Chrome")) return "Safari";
  return "Unknown browser";
}

export function BrowserSecurityCheck() {
  const [checks, setChecks] = useState<CheckResult[] | null>(null);

  useEffect(() => {
    const ua = navigator.userAgent;
    const results: CheckResult[] = [
      {
        label: "HTTPS Connection",
        status: window.location.protocol === "https:" ? "pass" : "fail",
        detail: window.location.protocol === "https:" ? "This page is served securely." : "Connection is not encrypted.",
      },
      {
        label: "Browser",
        status: "unknown",
        detail: detectBrowser(ua),
      },
      {
        label: "Do Not Track",
        status: navigator.doNotTrack === "1" ? "pass" : "unknown",
        detail: navigator.doNotTrack === "1" ? "Enabled" : "Not enabled or not exposed by this browser.",
      },
      {
        label: "Cookies Enabled",
        status: navigator.cookieEnabled ? "unknown" : "fail",
        detail: navigator.cookieEnabled ? "Enabled" : "Disabled",
      },
      {
        label: "WebRTC Exposure",
        status: "unknown",
        detail: "Full local-IP leak testing requires a STUN round-trip — run the deep scan in the app for this check.",
      },
    ];
    // One-time browser feature detection — must run client-side after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChecks(results);
  }, []);

  if (!checks) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin text-flame-bright" /> Running browser checks...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {checks.map((c) => (
        <div key={c.label} className="flex items-center justify-between rounded-lg border border-border-subtle bg-card-elevated px-4 py-3">
          <div>
            <p className="text-sm font-medium text-white">{c.label}</p>
            <p className="text-xs text-muted">{c.detail}</p>
          </div>
          {c.status === "pass" && <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />}
          {c.status === "fail" && <XCircle className="h-5 w-5 shrink-0 text-danger" />}
          {c.status === "unknown" && <HelpCircle className={cn("h-5 w-5 shrink-0 text-muted")} />}
        </div>
      ))}
    </div>
  );
}
