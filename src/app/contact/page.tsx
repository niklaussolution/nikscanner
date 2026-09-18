"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    // Wires into a support inbox / ticketing system in production.
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    setSent(true);
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-bg-black">
        <PageHeader eyebrow="Contact" title="Get in touch" description="Sales, support, or security disclosures." />
        <section className="mx-auto max-w-lg px-4 py-16 sm:px-6 lg:px-8">
          {sent ? (
            <div className="flex flex-col items-center rounded-xl border border-success/30 bg-success/5 p-10 text-center">
              <CheckCircle2 className="h-10 w-10 text-success" />
              <h3 className="mt-4 font-heading text-lg font-bold text-white">Message sent</h3>
              <p className="mt-2 text-sm text-muted">We&apos;ll get back to you within 1-2 business days.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border-subtle bg-card-bg p-6">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-muted">
                  Name
                </label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-muted">
                  Email
                </label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div>
                <label htmlFor="message" className="mb-1.5 block text-xs font-medium text-muted">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-muted focus:border-flame-primary/60 focus:outline-none focus:ring-2 focus:ring-flame-primary/20"
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
