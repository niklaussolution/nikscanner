import { authedJson } from "@/lib/firebase/api";
import { firebaseAuth } from "@/lib/firebase/client";
import { extractEmberNonPeFeatures } from "@/lib/file-scan/ember-features";
import { extractEmberPeFeatures } from "@/lib/file-scan/ember-pe-features";

export type MlVerdict = "clean" | "suspicious" | "malicious";

export type MlScanStatus = "scored" | "not-signed-in" | "unsupported" | "not-a-pe" | "failed";

export interface MlScanResult {
  status: MlScanStatus;
  verdict?: MlVerdict;
  probability?: number;
  detail?: string;
}

const ML_ENDPOINT_BY_EXTENSION: Record<string, string> = {
  ".apk": "/api/ml/scan-apk",
  ".pdf": "/api/ml/scan-pdf",
  ".exe": "/api/ml/scan-pe",
  ".msi": "/api/ml/scan-pe",
};

const PE_EXTENSIONS = new Set([".exe", ".msi"]);

export function supportsMlScan(extension: string): boolean {
  return extension in ML_ENDPOINT_BY_EXTENSION;
}

/** Runs the real EMBER2024 ML classification step, matching the mobile app's on-device
 *  extractors exactly: APK/PDF get the shared 696-float byte-level vector
 *  (ThremberApkFeatureExtractor.kt / ember-features.ts), EXE/MSI get the PE-structure-derived
 *  2568-float vector (PeFeatureExtractor.kt / ember-pe-features.ts). Either way only that small
 *  numeric vector is POSTed onward — the raw file itself never leaves the device. Requires a
 *  signed-in user (the backend's ML endpoints are auth-gated). The file-scan credit itself is
 *  consumed once, up front, by the caller (file-scanner-workspace.tsx) for every file scan
 *  regardless of file type — not here, so a non-ML-eligible file (docx, zip, ...) still counts
 *  against file_scans_allowed the same way a real scan should. */
export async function runMlScan(file: File, extension: string): Promise<MlScanResult> {
  const endpoint = ML_ENDPOINT_BY_EXTENSION[extension];
  if (!endpoint) return { status: "unsupported" };
  if (!firebaseAuth.currentUser) return { status: "not-signed-in" };

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    let features: number[];
    if (PE_EXTENSIONS.has(extension)) {
      const pe = extractEmberPeFeatures(bytes);
      if (!pe.isPe) return { status: "not-a-pe", detail: "File isn't a valid PE — no MZ/PE header found." };
      features = pe.features;
    } else {
      features = extractEmberNonPeFeatures(bytes);
    }

    const result = await authedJson<{ ok: boolean; probability: number; verdict: MlVerdict }>(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ features }),
    });
    return { status: "scored", verdict: result.verdict, probability: result.probability };
  } catch (e) {
    return { status: "failed", detail: e instanceof Error ? e.message : "ML scan failed." };
  }
}
