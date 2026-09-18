import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { IpScannerIntro } from "@/components/scanner-ip/ip-scanner-intro";
import { IpScannerStatusRow } from "@/components/scanner-ip/ip-scanner-status-row";
import { IpScannerWorkspace } from "@/components/scanner-ip/ip-scanner-workspace";
import { scannerTheme } from "@/components/scanner-url/theme";
import { providersFor } from "@/lib/providers";

export const metadata = { title: "IP Scanner" };

export default function IpScannerPage() {
  const providerCount = providersFor("ip").length;

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section
          style={{
            ...scannerTheme,
            backgroundColor: "var(--background)",
            backgroundImage:
              "linear-gradient(to right, var(--border-muted) 1px, transparent 1px), linear-gradient(to bottom, var(--border-muted) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
          className="relative overflow-hidden px-4 pb-24 pt-12 sm:px-6 lg:px-8"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[520px]"
            style={{ background: "radial-gradient(680px circle at 50% 0%, rgba(255,90,0,0.1), transparent 70%)" }}
          />

          <div className="relative z-10 mx-auto max-w-[1500px]">
            <IpScannerIntro />
            <IpScannerStatusRow sourceCount={providerCount} />
            <div className="mt-10">
              <IpScannerWorkspace />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
