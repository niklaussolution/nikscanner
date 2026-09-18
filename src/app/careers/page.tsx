import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata = { title: "Careers" };

export default function CareersPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-bg-black">
        <PageHeader eyebrow="Company" title="Careers" description="Help build the global security layer for the internet." />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <ComingSoon feature="Open roles" />
        </div>
      </main>
      <Footer />
    </>
  );
}
