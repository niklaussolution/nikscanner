import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendUp,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-card-bg p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-flame-primary/25 bg-flame-primary/10 text-flame-bright">
          <Icon className="h-4.5 w-4.5" />
        </div>
        {trend && (
          <span className={cn("text-xs font-semibold", trendUp ? "text-success" : "text-danger")}>{trend}</span>
        )}
      </div>
      <p className="mt-4 font-heading text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wider text-muted">{label}</p>
    </div>
  );
}
