import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata = { title: "Blog" };

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-bg-black">
        <PageHeader eyebrow="Resources" title="Blog" description="Security research, product updates and guides." />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <ComingSoon feature="The blog" />
        </div>
      </main>
      <Footer />
    </>
  );
}
