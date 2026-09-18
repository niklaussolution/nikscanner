import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageHeader } from "@/components/layout/page-header";
import { CodeTabs } from "@/components/developers/code-tabs";
import { API_ENDPOINTS } from "@/lib/data/api-endpoints";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "API" };

export default function ApiPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-bg-black">
        <PageHeader
          eyebrow="API Platform"
          title="A single REST API for threat intelligence"
          description="Rate-limited, versioned, and built for production traffic."
        />

        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-heading text-lg font-bold text-white">Endpoints</h2>
            <Link href="/dashboard/api-keys">
              <Button size="sm">Get API Key</Button>
            </Link>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-border-subtle bg-card-bg">
            {API_ENDPOINTS.map((e, i) => (
              <div
                key={e.path}
                className={`flex items-center gap-4 px-5 py-3.5 ${i !== API_ENDPOINTS.length - 1 ? "border-b border-border-subtle" : ""}`}
              >
                <Badge variant={e.method === "POST" ? "flame" : "info"} className="w-14 justify-center">
                  {e.method}
                </Badge>
                <code className="font-mono text-sm text-white">{e.path}</code>
                <span className="ml-auto text-xs text-muted">{e.desc}</span>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <h2 className="mb-2 font-heading text-lg font-bold text-white">Authentication</h2>
            <p className="mb-4 text-sm text-muted">
              Every request must include your API key as a bearer token:
            </p>
            <pre className="rounded-lg border border-border-subtle bg-black p-4 font-mono text-xs text-flame-bright">
              Authorization: Bearer YOUR_API_KEY
            </pre>
          </div>

          <div className="mt-10">
            <h2 className="mb-4 font-heading text-lg font-bold text-white">Example Request</h2>
            <CodeTabs />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
