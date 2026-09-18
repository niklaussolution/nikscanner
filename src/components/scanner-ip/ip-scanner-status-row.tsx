"use client";

import { Database, Lock } from "lucide-react";
import { ScannerStatusRow } from "@/components/scanner-url/scanner-status-row";

export function IpScannerStatusRow({ sourceCount }: { sourceCount: number }) {
  return (
    <ScannerStatusRow
      items={[
        { icon: Database, label: `${sourceCount} Sources Connected` },
        { icon: Lock, label: "Private Analysis" },
      ]}
    />
  );
}
