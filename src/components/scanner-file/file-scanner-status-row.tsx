"use client";

import { Database, Lock } from "lucide-react";
import { ScannerStatusRow } from "@/components/scanner-url/scanner-status-row";

export function FileScannerStatusRow() {
  return (
    <ScannerStatusRow
      items={[
        { icon: Database, label: "42 Engines Connected" },
        { icon: Lock, label: "Private by Design" },
      ]}
    />
  );
}
