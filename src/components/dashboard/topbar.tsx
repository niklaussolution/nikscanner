"use client";

import { Bell, Search } from "lucide-react";

export function DashboardTopbar() {
  return (
    <div className="flex h-16 items-center justify-between border-b border-border-subtle bg-bg-black px-6">
      <div className="relative hidden max-w-xs flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          placeholder="Search scans, reports..."
          className="h-9 w-full rounded-lg border border-white/10 bg-card-bg pl-9 pr-3 text-sm text-white placeholder:text-muted focus:border-flame-primary/60 focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-4">
        <button className="relative text-muted hover:text-white" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-flame-primary" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-flame-primary/15 text-xs font-bold text-flame-bright">
            N
          </div>
          <span className="hidden text-sm font-medium text-white sm:inline">Nik</span>
        </div>
      </div>
    </div>
  );
}
