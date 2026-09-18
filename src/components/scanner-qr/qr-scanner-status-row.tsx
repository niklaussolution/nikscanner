"use client";

import { Database, ScanLine } from "lucide-react";
import { ScannerStatusRow } from "@/components/scanner-url/scanner-status-row";

export function QrScannerStatusRow({ sourceCount }: { sourceCount: number }) {
  return (
    <ScannerStatusRow
      items={[
        { icon: Database, label: `${sourceCount} Sources Connected` },
        { icon: ScanLine, label: "Local QR Decoding" },
      ]}
    />
  );
}
