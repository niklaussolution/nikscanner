import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FileScannerIntro } from "@/components/scanner-file/file-scanner-intro";
import { FileScannerStatusRow } from "@/components/scanner-file/file-scanner-status-row";
import { FileScannerWorkspace } from "@/components/scanner-file/file-scanner-workspace";
import { scannerTheme } from "@/components/scanner-url/theme";

export const metadata = { title: "File Scanner" };

export default function FileScannerPage() {
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
            <FileScannerIntro />
            <FileScannerStatusRow />
            <div className="mt-10">
              <FileScannerWorkspace />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
