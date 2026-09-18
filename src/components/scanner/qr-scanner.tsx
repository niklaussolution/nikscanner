"use client";

import { useRef, useState } from "react";
import jsQR from "jsqr";
import { QrCode, UploadCloud, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScanResultPanel } from "./scan-result-panel";
import type { ScanResultPayload } from "@/types/scan";

export function QrScanner() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [decoded, setDecoded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResultPayload | null>(null);

  async function decodeImage(file: File) {
    setError(null);
    setDecoded(null);
    setResult(null);

    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(bitmap, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (!code) {
      setError("Couldn't detect a QR code in that image.");
      return;
    }
    setDecoded(code.data);
    await analyzeDestination(code.data);
  }

  async function analyzeDestination(value: string) {
    const isUrl = /^https?:\/\//i.test(value);
    if (!isUrl) return;

    setScanning(true);
    try {
      const res = await fetch("/api/scan/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType: "url", target: value }),
      });
      const data = await res.json();
      if (res.ok) setResult(data as ScanResultPayload);
    } finally {
      setScanning(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/15 px-6 py-16 text-center">
        <QrCode className="h-10 w-10 text-flame-bright" />
        <p className="mt-4 font-heading text-lg font-semibold text-white">Upload a QR code image</p>
        <p className="mt-1 text-sm text-muted">Camera scanning is available in the NIKSCANNER mobile app.</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) decodeImage(file);
          }}
        />
        <Button size="md" className="mt-4" onClick={() => inputRef.current?.click()}>
          <UploadCloud className="h-4 w-4" /> Select Image
        </Button>
      </div>

      {error && <p className="mt-4 text-sm text-danger">{error}</p>}

      {decoded && (
        <div className="mt-6 rounded-xl border border-border-subtle bg-card-bg p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">Decoded Value</p>
          <p className="mt-2 break-all font-mono text-sm text-white">{decoded}</p>
          {result?.threatLevel === "SAFE" && (
            <Button size="sm" variant="outline" className="mt-4">
              <ShieldCheck className="h-4 w-4" /> Open Safely
            </Button>
          )}
        </div>
      )}

      {scanning && (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin text-flame-bright" /> Analyzing destination...
        </div>
      )}

      {result && !scanning && (
        <div className="mt-6">
          <ScanResultPanel result={result} onRescan={() => decoded && analyzeDestination(decoded)} />
        </div>
      )}
    </div>
  );
}
