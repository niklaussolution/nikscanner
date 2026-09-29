"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DASHBOARD_NAV } from "@/lib/data/dashboard-nav";
import { cn } from "@/lib/utils";

/** Icon + label quick-nav for the dashboard on small screens, where the full sidebar
 *  (`DashboardSidebar`, `hidden ... lg:flex`) isn't shown — without this, a mobile visitor has
 *  no way to reach Scan History/Blocklist/Billing/Leaderboard/Profile/Settings at all. */
export function DashboardMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto border-b border-border-subtle bg-secondary-dark px-4 py-3 scrollbar-hidden lg:hidden">
      {DASHBOARD_NAV.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "border-flame-primary/40 bg-flame-primary/12 text-flame-bright"
                : "border-border-subtle text-muted hover:bg-white/5 hover:text-white",
            )}
          >
            <item.icon className="h-3.5 w-3.5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
