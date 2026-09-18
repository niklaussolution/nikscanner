import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageHeader } from "@/components/layout/page-header";
import { HeroScanner } from "@/components/scanner/hero-scanner";
import { WhatWeScan } from "@/components/home/what-we-scan";

export const metadata = { title: "Universal Scanner" };

export default function ScannerPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-bg-black">
        <PageHeader
          eyebrow="Scanner"
          title="Universal Scanner"
          description="Scan a URL, domain or IP address against threat intelligence, reputation and behavioral signals."
        />
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <HeroScanner />
        </section>
        <WhatWeScan />
      </main>
      <Footer />
    </>
  );
}
