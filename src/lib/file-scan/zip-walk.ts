// Minimal ZIP central-directory reader + per-entry inflate, for walking into the container
// formats FileScanner.kt treats as ZIP archives (docx/xlsx/pptx/jar/apk/zip): step 1's signature
// scan only sees compressed bytes, so this decompresses each entry and lets the caller re-run
// the same byte-pattern check against the real content — with the same zip-bomb guard the
// mobile app uses (300 entries / 64MB per entry / 256MB total decompressed).

export const ZIP_MAX_ENTRIES = 300;
export const ZIP_MAX_ENTRY_SIZE = 64 * 1024 * 1024;
export const ZIP_MAX_TOTAL_DECOMPRESSED = 256 * 1024 * 1024;

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_DIR_SIGNATURE = 0x02014b50;
const LOCAL_HEADER_SIGNATURE = 0x04034b50;
const EOCD_SEARCH_WINDOW = 65557; // max comment length (65535) + fixed EOCD record size (22)

export interface ZipEntry {
  name: string;
  compressedSize: number;
  uncompressedSize: number;
  compressionMethod: number;
  data: Uint8Array | null;
  skippedReason: "oversized" | "unsupported-method" | "cap-reached" | null;
}

export interface ZipWalkResult {
  isZip: boolean;
  entries: ZipEntry[];
  truncated: boolean;
  totalDecompressedBytes: number;
}

function findEndOfCentralDirectory(bytes: Uint8Array): number {
  const start = Math.max(0, bytes.length - EOCD_SEARCH_WINDOW);
  for (let i = bytes.length - 22; i >= start; i--) {
    if (readU32(bytes, i) === EOCD_SIGNATURE) return i;
  }
  return -1;
}

function readU16(bytes: Uint8Array, offset: number): number {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function readU32(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0;
}

async function inflateRaw(compressed: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([compressed.slice()]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  const chunks: Uint8Array[] = [];
  const reader = stream.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  const total = chunks.reduce((sum, c) => sum + c.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}

/** Reads every ZIP entry's decompressed content, subject to the zip-bomb guards above.
 *  Returns `{ isZip: false }` immediately for a non-ZIP file — checked structurally (a valid
 *  End Of Central Directory record), not by extension, since docx/xlsx/pptx/jar/apk are all
 *  just ZIP containers under another extension. */
export async function walkZipEntries(bytes: Uint8Array): Promise<ZipWalkResult> {
  const eocdOffset = findEndOfCentralDirectory(bytes);
  if (eocdOffset === -1) {
    return { isZip: false, entries: [], truncated: false, totalDecompressedBytes: 0 };
  }

  const totalEntries = readU16(bytes, eocdOffset + 10);
  const centralDirOffset = readU32(bytes, eocdOffset + 16);

  const entries: ZipEntry[] = [];
  let truncated = false;
  let totalDecompressed = 0;
  let cursor = centralDirOffset;

  for (let i = 0; i < totalEntries; i++) {
    if (cursor + 46 > bytes.length || readU32(bytes, cursor) !== CENTRAL_DIR_SIGNATURE) break;

    if (entries.length >= ZIP_MAX_ENTRIES) {
      truncated = true;
      break;
    }

    const compressionMethod = readU16(bytes, cursor + 10);
    const compressedSize = readU32(bytes, cursor + 20);
    const uncompressedSize = readU32(bytes, cursor + 24);
    const nameLength = readU16(bytes, cursor + 28);
    const extraLength = readU16(bytes, cursor + 30);
    const commentLength = readU16(bytes, cursor + 32);
    const localHeaderOffset = readU32(bytes, cursor + 42);
    const name = new TextDecoder().decode(bytes.subarray(cursor + 46, cursor + 46 + nameLength));

    let data: Uint8Array | null = null;
    let skippedReason: ZipEntry["skippedReason"] = null;

    if (uncompressedSize > ZIP_MAX_ENTRY_SIZE) {
      skippedReason = "oversized";
    } else if (totalDecompressed + uncompressedSize > ZIP_MAX_TOTAL_DECOMPRESSED) {
      skippedReason = "cap-reached";
      truncated = true;
    } else if (compressionMethod !== 0 && compressionMethod !== 8) {
      skippedReason = "unsupported-method";
    } else {
      const compressedData = readLocalEntryData(bytes, localHeaderOffset, compressedSize);
      if (compressedData) {
        data = compressionMethod === 0 ? compressedData : await inflateRaw(compressedData).catch(() => null);
        if (data) totalDecompressed += data.length;
        else skippedReason = "unsupported-method";
      } else {
        skippedReason = "unsupported-method";
      }
    }

    entries.push({ name, compressedSize, uncompressedSize, compressionMethod, data, skippedReason });
    cursor += 46 + nameLength + extraLength + commentLength;
  }

  return { isZip: true, entries, truncated, totalDecompressedBytes: totalDecompressed };
}

function readLocalEntryData(bytes: Uint8Array, localHeaderOffset: number, compressedSize: number): Uint8Array | null {
  if (localHeaderOffset + 30 > bytes.length || readU32(bytes, localHeaderOffset) !== LOCAL_HEADER_SIGNATURE) return null;
  const nameLength = readU16(bytes, localHeaderOffset + 26);
  const extraLength = readU16(bytes, localHeaderOffset + 28);
  const dataStart = localHeaderOffset + 30 + nameLength + extraLength;
  if (dataStart + compressedSize > bytes.length) return null;
  return bytes.subarray(dataStart, dataStart + compressedSize);
}
