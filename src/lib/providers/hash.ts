import { createHash } from "node:crypto";

/** Deterministic 0-1 pseudo-random value derived from a string, used to keep
 * demo-mode provider output stable for a given target instead of flickering
 * randomly between scans. */
export function seededScore(seed: string, salt: string): number {
  const digest = createHash("sha256").update(`${seed}:${salt}`).digest();
  return digest.readUInt32BE(0) / 0xffffffff;
}
