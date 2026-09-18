import { Search } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageHeader } from "@/components/layout/page-header";
import { ThreatMap } from "@/components/threat-intelligence/threat-map";
import { LiveFeedTable } from "@/components/threat-intelligence/live-feed-table";
import { CategoryChart } from "@/components/threat-intelligence/category-chart";
import { TimelineChart } from "@/components/threat-intelligence/timeline-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Threat Intelligence" };

export default function ThreatIntelligencePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-bg-black">
        <PageHeader
          eyebrow="Threat Intelligence"
          title="Global threat data, live"
          description="Trending threats, top phishing domains, suspicious TLDs and geographic distribution."
        />

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="relative mx-auto max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              placeholder="Search URL, domain, IP, hash or indicator"
              className="h-12 w-full rounded-xl border border-white/10 bg-card-bg pl-11 pr-4 text-sm text-white placeholder:text-muted focus:border-flame-primary/60 focus:outline-none focus:ring-2 focus:ring-flame-primary/20"
            />
          </div>
        </section>

        <section id="map" className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl border border-border-subtle">
            <ThreatMap className="aspect-[700/340] w-full" />
            <div className="absolute left-4 top-4">
              <Badge variant="neutral">Demo Telemetry</Badge>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Threat Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryChart />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Detection Timeline (7 days)</CardTitle>
              </CardHeader>
              <CardContent>
                <TimelineChart />
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-white">Live Threat Feed</h2>
            <Badge variant="neutral">Demo Telemetry</Badge>
          </div>
          <LiveFeedTable />
        </section>
      </main>
      <Footer />
    </>
  );
}
