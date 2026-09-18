"use client";

import { FileText } from "lucide-react";
import { ScannerIntro } from "@/components/scanner-url/scanner-intro";

export function FileScannerIntro() {
  return (
    <ScannerIntro
      pillIcon={FileText}
      pillText="File Scanner"
      headingPrefix="Analyze a file "
      headingHighlight="before you open it."
      subtitle="Hashes are computed locally in your browser. Files are checked against malware signatures and threat intelligence."
    />
  );
}
