import { scanForSignatures, type SignatureMatch } from "./signatures";
import { walkZipEntries } from "./zip-walk";

// Orchestrates the client-side parts of FileScanner.kt's pipeline that don't need a network
// call: the streaming byte-pattern scan (step 1) and the ZIP-entry scan for archive containers
// (step 2). Runs entirely in the browser — the raw file never leaves the device for this.

const CHUNK_SIZE = 256 * 1024;
const CHUNK_OVERLAP = 4 * 1024;

/** Scans a byte buffer in overlapping chunks so a signature straddling a chunk boundary isn't
 *  missed, without ever materializing more than one chunk at a time. */
function scanBytesInChunks(bytes: Uint8Array): SignatureMatch[] {
  const matches: SignatureMatch[] = [];
  const seen = new Set<string>();
  for (let offset = 0; offset < bytes.length; offset += CHUNK_SIZE) {
    const end = Math.min(bytes.length, offset + CHUNK_SIZE + CHUNK_OVERLAP);
    const chunk = bytes.subarray(offset, end);
    for (const m of scanForSignatures(chunk)) {
      if (!seen.has(m.name)) {
        seen.add(m.name);
        matches.push(m);
      }
    }
  }
  return matches;
}

export interface LocalFileScanResult {
  verdict: "clean" | "detected";
  matches: SignatureMatch[];
  isArchive: boolean;
  entriesScanned: number;
  entriesSkipped: number;
  truncated: boolean;
}

export async function runLocalFileScan(file: File): Promise<LocalFileScanResult> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const matches = scanBytesInChunks(bytes);

  const zip = await walkZipEntries(bytes);
  let entriesScanned = 0;
  let entriesSkipped = 0;

  if (zip.isZip) {
    for (const entry of zip.entries) {
      if (entry.data) {
        entriesScanned += 1;
        for (const m of scanBytesInChunks(entry.data)) {
          if (!matches.some((existing) => existing.name === m.name)) {
            matches.push({ name: m.name, detail: `${m.detail} (inside archive entry "${entry.name}")` });
          }
        }
      } else {
        entriesSkipped += 1;
      }
    }
  }

  return {
    verdict: matches.length > 0 ? "detected" : "clean",
    matches,
    isArchive: zip.isZip,
    entriesScanned,
    entriesSkipped,
    truncated: zip.truncated,
  };
}
