"use client";

import { TbLink, TbFileUpload, TbWorld, TbNetwork, TbQrcode } from "react-icons/tb";
import { cn } from "@/lib/utils";
import { FloatingDock } from "@/components/ui/floating-dock";

const TABS: { id: string; label: string; icon: typeof TbLink; href: string }[] = [
  { id: "url", label: "URL", icon: TbLink, href: "/scanner/url" },
  { id: "file", label: "File", icon: TbFileUpload, href: "/scanner/file" },
  { id: "domain", label: "Domain", icon: TbWorld, href: "/scanner/domain" },
  { id: "ip", label: "IP", icon: TbNetwork, href: "/scanner/ip" },
  { id: "qr", label: "QR", icon: TbQrcode, href: "/scanner/qr" },
];

export function ScannerTabs({ active = "url" }: { active?: string }) {
  const items = TABS.map((t) => ({
    title: t.label,
    href: t.href,
    icon: (
      <t.icon
        className={cn("h-full w-full hover:text-[#ff5500]", active === t.id ? "text-[var(--orange)]" : "text-[var(--text-muted)]")}
      />
    ),
  }));

  return (
    <div className="border-b border-[var(--border-muted)] px-3 py-3 sm:px-5">
      <FloatingDock items={items} desktopClassName="mx-0" mobileClassName="mx-0" />
    </div>
  );
}
