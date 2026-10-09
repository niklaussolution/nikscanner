import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Firebase's Google sign-in opens a popup and watches it; a stricter "same-origin"
          // policy (a common hosting/security-panel default) severs that link, so the popup
          // never completes. This value keeps the page isolated while allowing its own popups.
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          // No other site may embed these pages in a frame (clickjacking on login/payment).
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // The QR scanner needs the camera on this site; nothing needs the mic or location.
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default nextConfig;
