import Link from "next/link";
import { ArrowRight } from "lucide-react";

const EVENTS = [
  { time: "13:41", label: "MALICIOUS URL BLOCKED", target: "https://malware-site.net", tone: "danger" },
  { time: "13:40", label: "APK SIGNATURE MATCH", target: "com.unknown.app", tone: "warning" },
  { time: "13:39", label: "DOMAIN REPUTATION UPDATED", target: "example-phish.com", tone: "warning" },
] as const;

const TONE_DOT = {
  danger: "bg-danger",
  warning: "bg-flame-primary",
} as const;

export function LiveActivityTicker() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-border-subtle bg-card-bg/80 px-5 py-3.5 backdrop-blur">
      <span className="flex shrink-0 items-center gap-2 text-xs font-bold uppercase tracking-wide text-white">
        <span className="h-2 w-2 rounded-full bg-success animate-pulse-glow" /> Live Activity
      </span>

      <div className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-2 divide-x divide-border-subtle">
        {EVENTS.map((e, i) => (
          <div key={i} className={i === 0 ? "flex items-center gap-2 text-xs" : "flex items-center gap-2 pl-6 text-xs"}>
            <span className="font-mono text-muted">{e.time}</span>
            <span className={`h-1.5 w-1.5 rounded-full ${TONE_DOT[e.tone]}`} />
            <span className="font-semibold text-soft-white">{e.label}</span>
            <span className="font-mono text-muted">{e.target}</span>
          </div>
        ))}
      </div>

      <Link href="/threat-intelligence" className="ml-auto flex shrink-0 items-center gap-1 text-xs font-semibold text-flame-bright hover:text-flame-primary">
        View All <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
