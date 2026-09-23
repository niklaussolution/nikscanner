"use client";

import { Database, Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface StatusRowItem {
  icon: LucideIcon;
  label: string;
}

const DEFAULT_ITEMS: StatusRowItem[] = [
  { icon: Database, label: "42 Sources Connected" },
  { icon: Lock, label: "Private Analysis" },
];

export function ScannerStatusRow({ items = DEFAULT_ITEMS }: { items?: StatusRowItem[] }) {
  return (
    <div
      data-status-row
      className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]"
    >
      {/* <span className="flex items-center gap-2">
        <span data-status-dot className="h-2 w-2 rounded-full bg-[var(--safe)]" />
        <span className="text-[var(--safe)]">Engine Online</span>
      </span> */}
      {items.map((item) => (
        <span key={item.label} className="contents">
          <span aria-hidden className="hidden h-3 w-px bg-[var(--border)] sm:block" />
          <span className="flex items-center gap-1.5">
            <item.icon className="h-3.5 w-3.5 text-[var(--text-muted)]" />
            {item.label}
          </span>
        </span>
      ))}
    </div>
  );
}
