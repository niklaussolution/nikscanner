import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t border-border-subtle bg-bg-black py-24">
      <div className="pointer-events-none absolute inset-0 bg-radial-flame" />
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
          Protect what matters. <span className="text-flame-gradient">Start scanning today.</span>
        </h2>
        <p className="mt-4 text-muted">Free to start. No credit card required.</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/signup">
            <Button size="lg">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/scanner">
            <Button size="lg" variant="outline">
              Try the Scanner
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
