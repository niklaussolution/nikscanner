"use client";

import { Activity } from "lucide-react";
import { ScannerIntro } from "@/components/scanner-url/scanner-intro";

export function StatusIntro() {
  return (
    <ScannerIntro
      pillIcon={Activity}
      pillText="System Status"
      headingPrefix="Infrastructure "
      headingHighlight="you can trust."
      subtitle="Live uptime, performance metrics and incident history."
    />
  );
}
