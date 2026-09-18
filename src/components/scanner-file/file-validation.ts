export const ACCEPTED_EXTENSIONS = [".exe", ".apk", ".pdf", ".docx", ".zip", ".js", ".msi"] as const;
export const MAX_FILE_SIZE = 32 * 1024 * 1024;

const MAGIC_BYTES: Record<string, number[][]> = {
  ".pdf": [[0x25, 0x50, 0x44, 0x46]], // %PDF
  ".exe": [[0x4d, 0x5a]], // MZ
  ".msi": [[0xd0, 0xcf, 0x11, 0xe0, 0xe1, 0xa0, 0xb1, 0x1a]], // OLE compound file
  // .zip, .apk, .docx are all zip containers
  ".zip": [
    [0x50, 0x4b, 0x03, 0x04],
    [0x50, 0x4b, 0x05, 0x06],
    [0x50, 0x4b, 0x07, 0x08],
  ],
  ".apk": [
    [0x50, 0x4b, 0x03, 0x04],
    [0x50, 0x4b, 0x05, 0x06],
  ],
  ".docx": [
    [0x50, 0x4b, 0x03, 0x04],
    [0x50, 0x4b, 0x05, 0x06],
  ],
  // .js is plain text — no reliable magic number, skip sniffing
};

export function getExtension(fileName: string): string {
  const idx = fileName.lastIndexOf(".");
  return idx === -1 ? "" : fileName.slice(idx).toLowerCase();
}

export interface FileValidationResult {
  ok: boolean;
  error?: string;
}

export function validateFileMeta(file: File): FileValidationResult {
  const ext = getExtension(file.name);
  if (!ACCEPTED_EXTENSIONS.includes(ext as (typeof ACCEPTED_EXTENSIONS)[number])) {
    return { ok: false, error: `Unsupported file type "${ext || "unknown"}". Accepted: ${ACCEPTED_EXTENSIONS.join(", ")}.` };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, error: `File is ${formatBytes(file.size)}, which exceeds the 32 MB limit.` };
  }
  if (file.size === 0) {
    return { ok: false, error: "File is empty." };
  }
  return { ok: true };
}

/**
 * Extension checks alone are trivially spoofable (rename a .exe to .pdf), so
 * this peeks at the first few bytes for a matching file signature where one
 * exists. It's still a client-side heuristic, not a substitute for real
 * server-side content inspection — but it catches an obviously-mismatched
 * upload before it ever reaches the scan API.
 */
export async function sniffMatchesExtension(file: File): Promise<boolean> {
  const ext = getExtension(file.name);
  const signatures = MAGIC_BYTES[ext];
  if (!signatures) return true; // no known signature for this type (e.g. .js) — nothing to check

  const maxLen = Math.max(...signatures.map((s) => s.length));
  const head = new Uint8Array(await file.slice(0, maxLen).arrayBuffer());
  return signatures.some((sig) => sig.every((byte, i) => head[i] === byte));
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

export async function hashFileSHA256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
