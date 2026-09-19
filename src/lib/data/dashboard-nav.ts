import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  History,
  Ban,
  KeyRound,
  Plug,
  CreditCard,
  Trophy,
  User,
  Settings,
} from "lucide-react";

export interface DashboardNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const DASHBOARD_NAV: DashboardNavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Scan History", href: "/dashboard/scans", icon: History },
  { label: "Blocklist", href: "/dashboard/blocklist", icon: Ban },
  { label: "API Keys", href: "/dashboard/api-keys", icon: KeyRound },
  { label: "Integrations", href: "/dashboard/integrations", icon: Plug },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { label: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy },
  { label: "Profile", href: "/dashboard/profile", icon: User },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];
