import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-bg-black">
        <PageHeader eyebrow="Company" title="About NIKSCANNER" description="Global threat intelligence, built for everyone." />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <ComingSoon feature="Our company story" />
        </div>
      </main>
      <Footer />
    </>
  );
}
