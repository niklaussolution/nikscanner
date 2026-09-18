import { THREAT_FEED } from "@/lib/data/threat-feed";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TYPE_VARIANT = {
  Phishing: "danger",
  Malware: "danger",
  Scam: "warning",
  Botnet: "warning",
  Suspicious: "info",
  Spam: "neutral",
} as const;

export function LiveFeedTable() {
  return (
    <div className="overflow-x-auto rounded-xl border border-border-subtle bg-card-bg">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border-subtle text-xs uppercase tracking-wider text-muted">
            <th className="px-5 py-3 font-medium">Time</th>
            <th className="px-5 py-3 font-medium">Type</th>
            <th className="px-5 py-3 font-medium">Indicator</th>
            <th className="px-5 py-3 font-medium">Country</th>
            <th className="px-5 py-3 font-medium">Risk</th>
            <th className="px-5 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {THREAT_FEED.map((item, i) => (
            <tr key={i} className="border-b border-border-subtle font-mono last:border-0 hover:bg-white/[0.02]">
              <td className="px-5 py-3 text-muted">{item.time}</td>
              <td className="px-5 py-3">
                <Badge variant={TYPE_VARIANT[item.type]}>{item.type}</Badge>
              </td>
              <td className="max-w-[220px] truncate px-5 py-3 text-soft-white">{item.indicator}</td>
              <td className="px-5 py-3 text-muted">{item.country}</td>
              <td
                className={cn(
                  "px-5 py-3 font-semibold",
                  item.risk >= 80 ? "text-danger" : item.risk >= 50 ? "text-warning" : "text-success",
                )}
              >
                {item.risk}
              </td>
              <td className="px-5 py-3 text-muted">{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
