import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PricingPreview } from "@/components/home/pricing-preview";

export const metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-bg-black">
        <PricingPreview />
      </main>
      <Footer />
    </>
  );
}
