import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageHeader } from "@/components/layout/page-header";
import { DeveloperSection } from "@/components/home/developer-section";
import { CodeTabs } from "@/components/developers/code-tabs";

export const metadata = { title: "Developers" };

export default function DevelopersPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-bg-black">
        <PageHeader eyebrow="Developers" title="Build security into anything" description="A single REST API for URL, file, domain and IP intelligence." />
        <DeveloperSection />
        <section className="mx-auto max-w-4xl px-4 pb-20 sm:px-6 lg:px-8">
          <h2 className="mb-4 font-heading text-lg font-bold text-white">Try it now</h2>
          <CodeTabs />
        </section>
      </main>
      <Footer />
    </>
  );
}
