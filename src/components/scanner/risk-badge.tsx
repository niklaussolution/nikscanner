import { Badge } from "@/components/ui/badge";
import { THREAT_LEVEL_LABEL, type ThreatLevel } from "@/types/scan";
import { cn } from "@/lib/utils";

const VARIANT: Record<ThreatLevel, "success" | "info" | "warning" | "danger"> = {
  SAFE: "success",
  LOW_RISK: "info",
  SUSPICIOUS: "warning",
  HIGH_RISK: "danger",
  MALICIOUS: "danger",
};

export function RiskBadge({ level, className }: { level: ThreatLevel; className?: string }) {
  return (
    <Badge variant={VARIANT[level]} className={cn(level === "MALICIOUS" && "animate-pulse-glow", className)}>
      {THREAT_LEVEL_LABEL[level]}
    </Badge>
  );
}
