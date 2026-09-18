import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AndroidSection } from "@/components/home/android-section";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Download" };

export default function DownloadPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-bg-black">
        <PageHeader
          eyebrow="Mobile App"
          title="NIKSCANNER in your pocket"
          description="Scan links, QR codes and files, and monitor device security wherever you are."
        />
        <AndroidSection />
      </main>
      <Footer />
    </>
  );
}
