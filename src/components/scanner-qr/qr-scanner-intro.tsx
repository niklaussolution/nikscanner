"use client";

import { QrCode } from "lucide-react";
import { ScannerIntro } from "@/components/scanner-url/scanner-intro";

export function QrScannerIntro() {
  return (
    <ScannerIntro
      pillIcon={QrCode}
      pillText="QR Scanner"
      headingPrefix="Know where a QR code "
      headingHighlight="leads before you scan."
      subtitle="Decode the destination and analyze every link before you open it."
    />
  );
}
