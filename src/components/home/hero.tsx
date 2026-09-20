"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Download, Map, Database, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroScanner } from "@/components/scanner/hero-scanner";
import { ScanVisualization } from "@/components/home/scan-visualization";

const STATUS_ITEMS = [
  {
    dot: true,
    title: "ENGINE ONLINE",
    subtitle: "Real-time protection",
  },
  {
    icon: Database,
    title: "42 SOURCES CONNECTED",
    subtitle: "Global threat intelligence",
  },
  {
    icon: Lock,
    title: "PRIVATE ANALYSIS",
    subtitle: "Your data stays private",
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-grid bg-radial-flame pt-20 pb-10 sm:pt-28 sm:pb-32">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg-black" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-flame-primary/30 bg-flame-primary/10 px-4 py-1.5 text-xs font-medium text-flame-bright"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-flame-bright animate-pulse-glow" />
              SCAN. DETECT. BLOCK. PROTECT.
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="font-heading text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl"
            >
              THINK BEFORE
              <br />
              YOU <span className="text-flame-gradient">CLICK.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 max-w-xl text-base text-muted sm:text-lg"
            >
              Scan suspicious URLs, files, IP and domains before they become a threat.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-3 max-w-2xl text-sm text-muted/80"
            >
              NIKSCANNER combines threat intelligence, reputation analysis, behavioral scanning and community
              intelligence to help identify dangerous digital content.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link href="/scanner/url">
                <Button size="lg">
                  Start Scanning <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/download">
                <Button size="lg" variant="outline">
                  <Download className="h-4 w-4" /> Download App
                </Button>
              </Link>
              <Link href="/threat-intelligence#map">
                <Button size="lg" variant="ghost">
                  <Map className="h-4 w-4" /> View Live Threat Map
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4"
            >
              {STATUS_ITEMS.map((item) => (
                <div key={item.title} className="flex items-center gap-2.5">
                  {item.dot ? (
                    <span className="h-2.5 w-2.5 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.7)]" />
                  ) : (
                    item.icon && <item.icon className="h-4 w-4 text-muted" />
                  )}
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-white">{item.title}</p>
                    <p className="text-[11px] text-muted">{item.subtitle}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <ScanVisualization />
          </motion.div>
        </div>
{/* 
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto mt-16 max-w-3xl"
        >
          <HeroScanner />
        </motion.div> */}
      </div>
    </section>
  );
}
