"use client";

import { Globe } from "lucide-react";
import { ScannerIntro } from "@/components/scanner-url/scanner-intro";

export function DomainScannerIntro() {
  return (
    <ScannerIntro
      pillIcon={Globe}
      pillText="Domain Scanner"
      headingPrefix="WHOIS, DNS and "
      headingHighlight="hosting intelligence."
      subtitle="Check ownership, DNS records, email security and blacklist status in seconds."
    />
  );
}
