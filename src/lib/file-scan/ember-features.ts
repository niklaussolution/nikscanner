// Faithful TypeScript port of the non-PE (is_pe=0) subset of thrember's EMBER2024 feature
// vector: GeneralFileInfo(7) + ByteHistogram(256) + ByteEntropyHistogram(256) +
// StringExtractor(177) = 696 floats. This is the exact vector the mobile app's
// ThremberApkFeatureExtractor.kt computes for APK/PDF (is_pe is always 0 for non-PE files —
// none of these four feature blocks touch PE structures at all), and what the backend's
// /api/ml/scan-apk and /api/ml/scan-pdf expect as `{ features: number[696] }`.
//
// Source of truth: https://github.com/FutureComputing4AI/EMBER2024 (src/thrember/features.py),
// the reference "thrember" extractor referenced in the backend's mlApkScanner.js/mlPdfScanner.js
// comments. Ported here so the same vector can be computed client-side in the browser — the raw
// file never leaves the device, only this 696-number array does.

export const EMBER_NON_PE_FEATURE_DIM = 696;

export function shannonEntropyBits(counts: ArrayLike<number>, denominator: number): number {
  let entropy = 0;
  for (let i = 0; i < counts.length; i++) {
    const c = counts[i];
    if (c === 0) continue;
    const p = c / denominator;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

/** size, entropy, is_pe, first 4 bytes. */
export function generalFileInfo(bytes: Uint8Array, isPe: 0 | 1 = 0): number[] {
  const size = bytes.length;
  const counts = new Uint32Array(256);
  for (let i = 0; i < size; i++) counts[bytes[i]]++;
  const entropy = size > 0 ? shannonEntropyBits(counts, size) : 0;
  return [size, entropy, isPe, bytes[0] ?? 0, bytes[1] ?? 0, bytes[2] ?? 0, bytes[3] ?? 0];
}

/** Normalized (sums to 1) count of each byte value 0-255 across the whole file. */
export function byteHistogram(bytes: Uint8Array): number[] {
  const counts = new Float64Array(256);
  for (let i = 0; i < bytes.length; i++) counts[bytes[i]]++;
  const sum = bytes.length || 1;
  return Array.from(counts, (c) => c / sum);
}

const BEH_WINDOW = 2048;
const BEH_STEP = 1024;

/** Coarse 16-bin nibble histogram of a block, plus the entropy bin it falls into (Saxe &
 *  Berlin 2015 windowed byte/entropy histogram — see thrember's ByteEntropyHistogram). */
function entropyBinCounts(block: Uint8Array): { hbin: number; counts: Float64Array } {
  const counts = new Float64Array(16);
  for (let i = 0; i < block.length; i++) counts[block[i] >> 4]++;
  // Matches the reference implementation exactly: the denominator is always the fixed window
  // size, even for the short-file edge case where the "block" is smaller than a full window.
  let entropy = 0;
  for (let i = 0; i < 16; i++) {
    const c = counts[i];
    if (c === 0) continue;
    const p = c / BEH_WINDOW;
    entropy -= p * Math.log2(p);
  }
  entropy *= 2;
  let hbin = Math.floor(entropy * 2);
  if (hbin >= 16) hbin = 15;
  if (hbin < 0) hbin = 0;
  return { hbin, counts };
}

/** 16x16 grid (byte-nibble x local-entropy-bin), flattened and normalized to sum to 1. */
export function byteEntropyHistogram(bytes: Uint8Array): number[] {
  const output: Float64Array[] = Array.from({ length: 16 }, () => new Float64Array(16));

  if (bytes.length < BEH_WINDOW) {
    const { hbin, counts } = entropyBinCounts(bytes);
    for (let j = 0; j < 16; j++) output[hbin][j] += counts[j];
  } else {
    for (let offset = 0; offset + BEH_WINDOW <= bytes.length; offset += BEH_STEP) {
      const { hbin, counts } = entropyBinCounts(bytes.subarray(offset, offset + BEH_WINDOW));
      for (let j = 0; j < 16; j++) output[hbin][j] += counts[j];
    }
  }

  const flat = output.flatMap((row) => Array.from(row));
  const sum = flat.reduce((a, b) => a + b, 0) || 1;
  return flat.map((v) => v / sum);
}

// The exact 77 IOC/keyword regexes from thrember's StringExtractor, translated 1:1 from Python
// to JS syntax (character classes and \b word boundaries behave the same for this ASCII-only
// input). Order here doesn't matter — indices are assigned after sorting keys, matching
// Python's `sorted(self._regexes)`.
const STRING_REGEXES: Record<string, RegExp> = {
  url: /\b(?:http|https|ftp):\/\/[a-zA-Z0-9-._~:?#[\]@!$&'()*+,;=]+/,
  ipv4_addr: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/,
  ipv6_addr:
    /\b(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}\b|\b(?:[A-Fa-f0-9]{1,4}:){1,7}:\b|\b:[A-Fa-f0-9]{1,4}(?::[A-Fa-f0-9]{1,4}){1,6}\b/,
  mac_addr: /\b(?:[0-9A-Fa-f]{2}[:-]){5}(?:[0-9A-Fa-f]{2})\b/,
  // Upstream note: thrember's own "email_addr" regex is a copy-paste bug that actually matches a
  // MAC address again (identical pattern to mac_addr in the reference source) — reproduced
  // as-is so this stays a faithful port of what the model was actually trained against.
  email_addr: /\b(?:[0-9A-Fa-f]{2}[:-]){5}(?:[0-9A-Fa-f]{2})\b/,
  btc_wallet: /[13][a-km-zA-HJ-NP-Z1-9]{25,34}/,
  file_path: /\bC:\//,
  dos_msg: /!This program /,
  registry_key: /\b(?:KHEY_|KHLM|HKCU)/,
  "/dev/": /\/dev\//,
  "/proc/": /\/proc\//,
  "/bin/": /\/bin\//,
  "/usr/": /\/usr\//,
  "/tmp/": /\/tmp\//,
  "/URI": /\/URI/,
  "/FlateDecode": /\/FlateDecode/,
  "/EmbeddedFile": /\/EmbeddedFile/,
  html: /html/i,
  javascript: /javascript/i,
  "<script": /<script/i,
  // Upstream note: the Python source passes ".click" unescaped to re.compile — the leading "."
  // is regex "any character", not a literal dot, so this matches "Xclick" for any X, not just
  // ".click". Reproduced as-is (not "fixed" to \.click) to stay faithful to what the model
  // actually saw during training.
  ".click(": /.click/i,
  onlick: /onclick/i,
  powershell: /powershell/i,
  "Invoke-Expression": /Invoke-Expression/,
  "Invoke-Command": /Invoke-Command/,
  "Start-process": /Start-process/,
  get: /GET \//i,
  post: /POST \//i,
  http: /HTTP\//i,
  "http://": /http:\/\//i,
  "https://": /https:\/\//i,
  ftp: /ftp:/i,
  useragent: /User-Agent/i,
  cookie: /cookie/i,
  internet: /internet/i,
  download: /download/i,
  connect: /connect/i,
  base64: /base64/i,
  base64string: /ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+\//,
  crypt: /crypt/,
  encode: /encode/i,
  decode: /decode/i,
  cache: /cache/i,
  certificate: /certificate/i,
  clipboard: /clipboard/i,
  command: /command/i,
  create: /create/i,
  debug: /debug/i,
  delete: /delete/i,
  desktop: /desktop/i,
  directory: /directory/i,
  disk: /disk/i,
  environment: /environment/i,
  enum: /enum/i,
  exit: /exit/i,
  file: /file/i,
  hostname: /hostname/i,
  install: /install/i,
  hidden: /hidden/i,
  keyboard: /keyboard/i,
  memory: /memory/i,
  module: /module/i,
  mutex: /mutex/i,
  password: /password/i,
  privilege: /privilege/i,
  process: /process/i,
  remote: /remote/i,
  resource: /resource/i,
  security: /security/i,
  service: /service/i,
  shell: /shell/i,
  snapshot: /snapshot/i,
  system: /system/i,
  thread: /thread/i,
  token: /token/i,
  wallet: /wallet/i,
  window: /window/i,
};

const SORTED_REGEX_KEYS = Object.keys(STRING_REGEXES).sort();

/** All consecutive runs of printable ASCII (0x20-0x7f) that are 5+ bytes long. */
function extractPrintableStrings(bytes: Uint8Array): string[] {
  const strings: string[] = [];
  let start = -1;
  for (let i = 0; i <= bytes.length; i++) {
    const printable = i < bytes.length && bytes[i] >= 0x20 && bytes[i] <= 0x7f;
    if (printable && start === -1) {
      start = i;
    } else if (!printable && start !== -1) {
      if (i - start >= 5) strings.push(bytesToAscii(bytes, start, i));
      start = -1;
    }
  }
  return strings;
}

function bytesToAscii(bytes: Uint8Array, start: number, end: number): string {
  let s = "";
  for (let i = start; i < end; i++) s += String.fromCharCode(bytes[i]);
  return s;
}

export function stringFeatures(bytes: Uint8Array): number[] {
  const strings = extractPrintableStrings(bytes);

  let avlength = 0;
  const printableCounts = new Float64Array(96);
  let entropy = 0;
  let printables = 0;

  if (strings.length > 0) {
    let totalLength = 0;
    for (const s of strings) {
      totalLength += s.length;
      for (let i = 0; i < s.length; i++) printableCounts[s.charCodeAt(i) - 0x20]++;
    }
    avlength = totalLength / strings.length;
    printables = totalLength;
    entropy = shannonEntropyBits(printableCounts, printables);
  }

  const stringCounts = new Array(SORTED_REGEX_KEYS.length).fill(0);
  for (const s of strings) {
    for (let i = 0; i < SORTED_REGEX_KEYS.length; i++) {
      if (STRING_REGEXES[SORTED_REGEX_KEYS[i]].test(s)) stringCounts[i] += 1;
    }
  }

  const divisor = printables > 0 ? printables : 1;
  const printableDist = Array.from(printableCounts, (c) => c / divisor);

  return [strings.length, avlength, printables, ...printableDist, entropy, ...stringCounts];
}

/** Computes the exact 696-float non-PE feature vector from raw file bytes. */
export function extractEmberNonPeFeatures(bytes: Uint8Array): number[] {
  const vector = [...generalFileInfo(bytes), ...byteHistogram(bytes), ...byteEntropyHistogram(bytes), ...stringFeatures(bytes)];
  if (vector.length !== EMBER_NON_PE_FEATURE_DIM) {
    throw new Error(`Feature vector length mismatch: got ${vector.length}, expected ${EMBER_NON_PE_FEATURE_DIM}`);
  }
  return vector;
}
