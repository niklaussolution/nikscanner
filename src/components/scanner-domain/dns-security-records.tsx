"use client";

import { useState } from "react";
import Link from "next/link";
import { Server, Mail, Network, Lock, Check, X, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DnsRecords } from "@/lib/domain-intel/dns";
import type { TlsInfo } from "@/lib/domain-intel/tls";

interface RecordCardData {
  id: string;
  icon: LucideIcon;
  label: string;
  values: string[];
  ok: boolean | null;
}

function buildCards(dns: DnsRecords | null, tls: TlsInfo | null): RecordCardData[] {
  return [
    { id: "a", icon: Server, label: "A Record", values: dns?.a ?? [], ok: dns ? Boolean(dns.a?.length) : null },
    {
      id: "mx",
      icon: Mail,
      label: "MX Record",
      values: dns?.mx?.map((r) => r.exchange) ?? [],
      ok: dns ? Boolean(dns.mx?.length) : null,
    },
    { id: "ns", icon: Network, label: "Nameservers", values: dns?.ns ?? [], ok: dns ? Boolean(dns.ns?.length) : null },
    {
      id: "tls",
      icon: Lock,
      label: "TLS",
      values: tls ? [`${tls.valid ? "Valid" : "Invalid"} · ${tls.protocol ?? "Unknown"}`] : [],
      ok: tls ? tls.valid : null,
    },
  ];
}

export function DnsSecurityRecords({
  dns,
  tls,
  reportHref = "/dashboard/scans",
}: {
  dns: DnsRecords | null;
  tls: TlsInfo | null;
  reportHref?: string;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const cards = buildCards(dns, tls);

  return (
    <div data-dns-records className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">
          <Server className="h-4 w-4 text-[var(--orange-light)]" /> DNS &amp; Security Records
        </span>
        <Link
          href={reportHref}
          className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-[var(--orange-light)] hover:text-[var(--orange)]"
        >
          View full report <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const isOpen = expanded === card.id;
          const extra = card.values.length - 1;
          return (
            <div key={card.id} className="rounded-lg border border-[var(--border-muted)] bg-[var(--surface-soft)] p-3.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                  <card.icon className="h-3.5 w-3.5 text-[var(--orange-light)]" /> {card.label}
                </span>
                {card.ok !== null && (
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full border",
                      card.ok
                        ? "border-[var(--safe)]/40 bg-[var(--safe)]/10 text-[var(--safe)]"
                        : "border-[var(--danger)]/40 bg-[var(--danger)]/10 text-[var(--danger)]",
                    )}
                  >
                    {card.ok ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : <X className="h-2.5 w-2.5" strokeWidth={3} />}
                  </span>
                )}
              </div>
              <p className="mt-2 truncate font-mono text-[13px] font-semibold text-[var(--white)]">{card.values[0] ?? "Unavailable"}</p>
              {extra > 0 && (
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : card.id)}
                  className="mt-1 text-[11px] font-bold text-[var(--orange-light)] hover:text-[var(--orange)]"
                >
                  {isOpen ? "Show less" : `+${extra} more`}
                </button>
              )}
              {isOpen && extra > 0 && (
                <ul className="mt-1.5 space-y-1 border-t border-[var(--border-muted)] pt-1.5">
                  {card.values.slice(1).map((v) => (
                    <li key={v} className="truncate font-mono text-[11px] text-[var(--text-secondary)]">
                      {v}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
