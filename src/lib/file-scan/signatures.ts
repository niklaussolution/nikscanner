// Mirrors FileScanner.kt's byte-pattern signature check. The mobile app's real signature
// database (assets/signatures.json) is bundled only inside the Android app — it never had a
// server API and isn't available in this workspace, so we can't fabricate a "known-bad hash
// list" here (this codebase's own philosophy: never present a fake detection as real, see
// src/lib/providers/index.ts's demo-mode comments).
//
// EICAR is the one signature that's genuinely safe to include: the industry-standard antivirus
// test string every AV engine recognizes, published by the European Institute for Computer
// Antivirus Research specifically so security tools can be tested without a real malicious
// sample. Any real signature/hash-list source (once available) plugs in here alongside it.

const EICAR_SIGNATURE = "X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*";

export interface SignatureMatch {
  name: string;
  detail: string;
}

const encoder = new TextEncoder();
const EICAR_BYTES = encoder.encode(EICAR_SIGNATURE);

function containsSubsequence(haystack: Uint8Array, needle: Uint8Array): boolean {
  if (needle.length === 0 || haystack.length < needle.length) return false;
  outer: for (let i = 0; i <= haystack.length - needle.length; i++) {
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) continue outer;
    }
    return true;
  }
  return false;
}

/** Scans a byte buffer for known signatures. Chunk-based callers should pass overlapping
 *  windows themselves (see local-scan.ts) so a signature straddling a chunk boundary isn't
 *  missed — this function itself just checks whatever bytes it's given. */
export function scanForSignatures(bytes: Uint8Array): SignatureMatch[] {
  const matches: SignatureMatch[] = [];
  if (containsSubsequence(bytes, EICAR_BYTES)) {
    matches.push({ name: "EICAR-Test-File", detail: "Matches the EICAR standard antivirus test signature" });
  }
  return matches;
}

export { EICAR_SIGNATURE };
