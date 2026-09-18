"use client";

import { MapPin } from "lucide-react";
import { ScannerIntro } from "@/components/scanner-url/scanner-intro";

export function IpScannerIntro() {
  return (
    <ScannerIntro
      pillIcon={MapPin}
      pillText="IP Scanner"
      headingPrefix="Geolocation and "
      headingHighlight="abuse intelligence."
      subtitle="Analyze ASN, ISP, proxy, VPN, Tor and malicious activity for any IPv4 or IPv6 address."
    />
  );
}
