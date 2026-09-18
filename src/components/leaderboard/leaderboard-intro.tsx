"use client";

import { Users } from "lucide-react";
import { ScannerIntro } from "@/components/scanner-url/scanner-intro";

export function LeaderboardIntro() {
  return (
    <ScannerIntro
      pillIcon={Users}
      pillText="Community Intelligence"
      headingPrefix="Global "
      headingHighlight="Threat Hunters"
      subtitle="Recognizing the researchers who make the internet safer."
    />
  );
}
