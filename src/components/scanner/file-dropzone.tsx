"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileText, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const MAX_SIZE_MB = 32;
const SUPPORTED = ["EXE", "APK", "PDF", "DOCX", "ZIP", "JS", "MSI"];

interface FileAnalysis {
  name: string;
  size: number;
  type: string;
  sha256: string;
}

async function hashFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function FileDropzone() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<FileAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setResult(null);

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File exceeds the ${MAX_SIZE_MB}MB limit for this demo environment.`);
      return;
    }

    setAnalyzing(true);
    const sha256 = await hashFile(file);
    // Threat-intel lookup against VIRUSTOTAL_API_KEY / internal hash reputation
    // database wires in server-side once file storage (S3) is configured.
    await new Promise((r) => setTimeout(r, 1200));
    setAnalyzing(false);
    setResult({ name: file.name, size: file.size, type: file.type || "unknown", sha256 });
  }, []);

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-16 text-center transition-colors ${
          dragging ? "border-flame-primary bg-flame-primary/5" : "border-white/15"
        }`}
      >
        <UploadCloud className="h-10 w-10 text-flame-bright" />
        <p className="mt-4 font-heading text-lg font-semibold text-white">Drop a file to analyze</p>
        <p className="mt-1 text-sm text-muted">or</p>
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <Button size="md" className="mt-3" onClick={() => inputRef.current?.click()}>
          Select File
        </Button>
        <p className="mt-4 text-xs text-muted">Max {MAX_SIZE_MB}MB · Supported: {SUPPORTED.join(", ")}</p>
      </div>

      {error && <p className="mt-4 text-sm text-danger">{error}</p>}

      {analyzing && (
        <div className="mt-6 flex items-center gap-3 rounded-lg border border-border-subtle bg-card-bg px-4 py-3 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin text-flame-bright" />
          Computing hashes and checking reputation...
        </div>
      )}

      {result && !analyzing && (
        <div className="mt-6 rounded-xl border border-border-subtle bg-card-bg p-5">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-flame-bright" />
            <div className="min-w-0">
              <p className="truncate font-medium text-white">{result.name}</p>
              <p className="text-xs text-muted">
                {(result.size / 1024).toFixed(1)} KB · {result.type}
              </p>
            </div>
            <Badge variant="neutral" className="ml-auto shrink-0">
              Demo Analysis
            </Badge>
          </div>
          <dl className="mt-4 space-y-2 font-mono text-xs">
            <div className="flex justify-between gap-4 rounded-lg bg-card-elevated px-3 py-2">
              <dt className="text-muted">SHA-256</dt>
              <dd className="truncate text-soft-white">{result.sha256}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-muted">
            Full malware-engine and hash-reputation lookups require VIRUSTOTAL_API_KEY and object storage to be
            configured in production.
          </p>
        </div>
      )}
    </div>
  );
}
