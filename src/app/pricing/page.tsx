import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { LivePricingSection } from "@/components/pricing/live-pricing-section";

export const metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-bg-black">
        <LivePricingSection />
      </main>
      <Footer />
    </>
  );
}
