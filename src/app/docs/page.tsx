import Link from "next/link";
import { ArrowRight, Book, Code2, Puzzle, Activity } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Documentation" };

const SECTIONS = [
  { icon: Book, title: "Getting Started", desc: "Create an account, generate an API key, and run your first scan.", href: "/api" },
  { icon: Code2, title: "API Reference", desc: "Full REST API reference for URL, file, domain and IP scanning.", href: "/api" },
  { icon: Puzzle, title: "SDKs", desc: "Official SDKs for JavaScript, Python and Node.js.", href: "#sdks" },
  { icon: Activity, title: "System Status", desc: "Live uptime and incident history.", href: "/status" },
];

export default function DocsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-bg-black">
        <PageHeader eyebrow="Documentation" title="Everything you need to integrate NIKSCANNER" />
        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {SECTIONS.map((s) => (
              <Link
                key={s.title}
                href={s.href}
                className="group rounded-xl border border-border-subtle bg-card-bg p-6 transition-colors hover:border-flame-primary/40"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-flame-primary/25 bg-flame-primary/10 text-flame-bright">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-heading text-base font-semibold text-white">{s.title}</h3>
                <p className="mt-1 text-sm text-muted">{s.desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-flame-bright opacity-0 transition-opacity group-hover:opacity-100">
                  Read more <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>

          <div id="sdks" className="mt-14">
            <h2 className="mb-4 font-heading text-lg font-bold text-white">SDKs</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {["@nikscanner/sdk (Node.js)", "nikscanner (Python)", "nikscanner-js (Browser)"].map((s) => (
                <div key={s} className="rounded-lg border border-border-subtle bg-card-bg px-4 py-3 font-mono text-xs text-soft-white">
                  {s}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
