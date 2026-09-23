// MurmurHash3 x86_32 (seed 0) + a port of scikit-learn's FeatureHasher hashing trick — used by
// four of EMBER's PE feature blocks (SectionInfo, ImportsInfo, ExportsInfo, RichHeader) to
// compress variable-length string data (section names, imported function names, ...) into a
// fixed-size vector. This is the standard public-domain x86_32 variant by Austin Appleby;
// sklearn's `murmurhash3_bytes_s32` is a thin Cython wrapper around the same reference algorithm
// with seed 0, so this should produce identical hash values for identical input bytes. That said,
// this couldn't be cross-verified against a live sklearn/Python run in this environment — treat
// any PE ML score as needing a real-environment spot-check before relying on it in production.

function rotl32(x: number, r: number): number {
  return (x << r) | (x >>> (32 - r));
}

const C1 = 0xcc9e2d51;
const C2 = 0x1b873593;

/** 32-bit signed MurmurHash3 (x86_32 variant), matching sklearn's murmurhash3_bytes_s32(key, 0). */
export function murmurhash3X86_32(bytes: Uint8Array, seed = 0): number {
  let h1 = seed | 0;
  const len = bytes.length;
  const roundedEnd = len & ~0x3;

  for (let i = 0; i < roundedEnd; i += 4) {
    let k1 = (bytes[i] & 0xff) | ((bytes[i + 1] & 0xff) << 8) | ((bytes[i + 2] & 0xff) << 16) | ((bytes[i + 3] & 0xff) << 24);
    k1 = Math.imul(k1, C1);
    k1 = rotl32(k1, 15);
    k1 = Math.imul(k1, C2);
    h1 ^= k1;
    h1 = rotl32(h1, 13);
    h1 = (Math.imul(h1, 5) + 0xe6546b64) | 0;
  }

  let k1 = 0;
  const tailLen = len & 0x3;
  if (tailLen === 3) k1 ^= (bytes[roundedEnd + 2] & 0xff) << 16;
  if (tailLen >= 2) k1 ^= (bytes[roundedEnd + 1] & 0xff) << 8;
  if (tailLen >= 1) {
    k1 ^= bytes[roundedEnd] & 0xff;
    k1 = Math.imul(k1, C1);
    k1 = rotl32(k1, 15);
    k1 = Math.imul(k1, C2);
    h1 ^= k1;
  }

  h1 ^= len;
  h1 ^= h1 >>> 16;
  h1 = Math.imul(h1, 0x85ebca6b);
  h1 ^= h1 >>> 13;
  h1 = Math.imul(h1, 0xc2b2ae35);
  h1 ^= h1 >>> 16;

  return h1 | 0;
}

function hashString(s: string, seed = 0): number {
  return murmurhash3X86_32(new TextEncoder().encode(s), seed);
}

/** Faithful port of sklearn.feature_extraction.FeatureHasher for the two input modes this
 *  codebase's PE features use: a list of strings (each occurrence contributes +/-1, summed per
 *  index — i.e. a count, not a set) or a list of [name, numericValue] pairs (each contributes
 *  value * sign at the index derived from hashing `name`). */
export function hashStrings(values: string[], nFeatures: number, alternateSign = true): number[] {
  const out = new Array(nFeatures).fill(0);
  for (const v of values) {
    const h = hashString(v);
    const index = Math.abs(h) % nFeatures;
    const sign = alternateSign && h < 0 ? -1 : 1;
    out[index] += sign;
  }
  return out;
}

export function hashPairs(pairs: [string, number][], nFeatures: number, alternateSign = true): number[] {
  const out = new Array(nFeatures).fill(0);
  for (const [name, value] of pairs) {
    const h = hashString(name);
    const index = Math.abs(h) % nFeatures;
    const sign = alternateSign && h < 0 ? -1 : 1;
    out[index] += sign * value;
  }
  return out;
}
