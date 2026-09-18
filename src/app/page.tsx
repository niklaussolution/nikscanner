import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/home/hero";
import { WhatWeScan } from "@/components/home/what-we-scan";
import { HowItWorks } from "@/components/home/how-it-works";
import { StatsSection } from "@/components/home/stats-section";
import { ThreatMapSection } from "@/components/home/threat-map-section";
import { CommunitySection } from "@/components/home/community-section";
import { DeveloperSection } from "@/components/home/developer-section";
import { AndroidSection } from "@/components/home/android-section";
import { PricingPreview } from "@/components/home/pricing-preview";
import { FaqSection } from "@/components/home/faq-section";
import { FinalCta } from "@/components/home/final-cta";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <StatsSection />
        <WhatWeScan />
        <HowItWorks />
        <ThreatMapSection />
        <CommunitySection />
        <AndroidSection />
        <DeveloperSection />
        <PricingPreview />
        <FaqSection />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
