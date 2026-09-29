import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Firebase's Google sign-in opens a popup and watches it; a stricter "same-origin"
          // policy (a common hosting/security-panel default) severs that link, so the popup
          // never completes. This value keeps the page isolated while allowing its own popups.
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
        ],
      },
    ];
  },
};

export default nextConfig;
