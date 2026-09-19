import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/firebase/auth-context";
import { RouteAuthGuard } from "@/components/auth/route-auth-guard";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nikscanner.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NIKSCANNER — Scan. Detect. Block. Protect.",
    template: "%s — NIKSCANNER",
  },
  description:
    "NIKSCANNER is a global cybersecurity scanning and threat-intelligence platform. Scan URLs, files, domains, IPs, QR codes and devices before they become a threat.",
  keywords: [
    "URL scanner",
    "malware scanner",
    "phishing detection",
    "threat intelligence",
    "cybersecurity platform",
  ],
  openGraph: {
    title: "NIKSCANNER — Scan. Detect. Block. Protect.",
    description:
      "Scan URLs, files, domains, IPs, QR codes and devices before they become a threat.",
    url: siteUrl,
    siteName: "NIKSCANNER",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NIKSCANNER — Scan. Detect. Block. Protect.",
    description:
      "Scan URLs, files, domains, IPs, QR codes and devices before they become a threat.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg-black text-soft-white font-sans">
        <AuthProvider>
          <RouteAuthGuard>{children}</RouteAuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
