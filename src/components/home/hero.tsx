"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Download, Map, Database, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroScanner } from "@/components/scanner/hero-scanner";
import { ScanVisualization } from "@/components/home/scan-visualization";
import { useBackendStatus } from "@/lib/firebase/use-backend-status";
import { useAuth } from "@/lib/firebase/auth-context";
import { cn } from "@/lib/utils";
import StrokeText from "../ui/StrokeText";
import ClickSpark from "../ui/ClickSpark";
import TextType from "../ui/TextType";
import BlurText from "../ui/BlurText";

const STATUS_ITEMS = [
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
  const backendOnline = useBackendStatus();
  const { user } = useAuth();
  return (
    <section className="relative overflow-hidden bg-grid bg-radial-flame pt-20 pb-10 sm:pt-28 sm:pb-32">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg-black" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div>
            {/* <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-flame-primary/30 bg-flame-primary/10 px-4 py-1.5 text-xs font-medium text-flame-bright"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-flame-bright animate-pulse-glow" />
              SCAN. DETECT. BLOCK. PROTECT.
            </motion.div> */}

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="font-heading font-bold leading-[1.05] tracking-tight text-white"
            >
              <StrokeText
                text="THINK BEFORE"
                strokeColor="#ffffff"
                fillColor="#ffffff"
                fillMode="fade"
                ease="sine.inOut"
                strokeWidth={0}
                drawDuration={1.2}
                fillDelay={0.35}
                fontWeight={850}
              />
              <div className="mt-1 flex flex-wrap items-center gap-x-3">
                <StrokeText
                  text="YOU"
                  strokeColor="#ffffff"
                  fillColor="#ffffff"
                  fillMode="fade"
                  ease="sine.inOut"
                  strokeWidth={0}
                  drawDuration={1.2}
                  fillDelay={0.35}
                  fontWeight={850}
                  className="!inline-block !w-auto"
                />
                <ClickSpark sparkColor="#ffffff" className="font-heading text-9xl font-bold text-flame-gradient sm:text-7xl">
                  CLICK.
                </ClickSpark>
              </div>
            </motion.h1>




            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 max-w-xl text-base font-semibold sm:text-lg text-[#F8FAFC]"
            >
              Inspect{" "}
              {/* <TextType
                text="suspicious URLs, files, IP and domains"
                typingSpeed={45}
                pauseDuration={2200}
                cursorCharacter="|"
                className="text-flame-bright"
              /> */}


              {/* The typed word changes width every few frames, which re-wrapped the sentence and made
                  everything below jump. An invisible copy of the longest word holds a fixed box, and
                  the typing text sits on top of it in the same grid cell. */}
              <span className="inline-grid align-baseline text-4xl">
                <span aria-hidden className="invisible col-start-1 row-start-1 whitespace-pre tracking-tight">
                  {"  Domains"}
                  <span className="ml-1">_</span>
                </span>
              <TextType
                as="span"
                text={["  URLs", "  Files", "  IPs", "  Domains"]}
                typingSpeed={75}
                pauseDuration={1500}
                showCursor
                cursorCharacter="_"
                // texts={["Welcome to React Bits! Good to see you!", "Build some amazing experiences!"]}
                deletingSpeed={50}
                // variableSpeedEnabled={false}
                // variableSpeedMin={60}
                // variableSpeedMax={120}
                cursorBlinkDuration={0.5}
                className="col-start-1 row-start-1 text-[#ff5500] text-4xl"
              />
              </span>

              {" "}
              before they become a threat.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-3 max-w-2xl text-sm text-muted/80"
            >
              <BlurText
                text="NIKSCANNER combines threat intelligence, reputation analysis, behavioral scanning and community intelligence to help identify dangerous digital content."
                direction="bottom"
                delay={140}
              />
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              // Mobile: the two primary buttons share a row, the map link spans the full width below.
              className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center"
            >
              <Link href="/scanner/url" className="min-w-0">
                <Button size="lg" className="w-full px-3 text-sm sm:w-auto sm:px-7 sm:text-base">
                  Start Scanning <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/download" className="min-w-0">
                <Button size="lg" variant="outline" className="w-full px-3 text-sm sm:w-auto sm:px-7 sm:text-base">
                  <Download className="h-4 w-4" /> Download App
                </Button>
              </Link>
              {user && (
                <Link href="/threat-intelligence#map" className="col-span-2">
                  <Button size="lg" variant="ghost" className="w-full sm:w-auto">
                    <Map className="h-4 w-4" /> View Live Threat Map
                  </Button>
                </Link>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-full",
                    backendOnline === "online" && "bg-success shadow-[0_0_8px_rgba(34,197,94,0.7)]",
                    backendOnline === "offline" && "bg-danger shadow-[0_0_8px_rgba(239,68,68,0.7)]",
                    backendOnline === "checking" && "animate-pulse bg-muted",
                  )}
                />
                <div>
                  <p className="text-xs font-semibold tracking-wide text-white">
                    {backendOnline === "online" ? "ENGINE ONLINE" : backendOnline === "offline" ? "ENGINE OFFLINE" : "CHECKING ENGINE..."}
                  </p>
                  <p className="text-[11px] text-muted">
                    {backendOnline === "offline" ? "Scanning backend unreachable" : "Real-time protection"}
                  </p>
                </div>
              </div>
              {STATUS_ITEMS.map((item) => (
                <div key={item.title} className="flex items-center gap-2.5">
                  <item.icon className="h-4 w-4 text-muted" />
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
