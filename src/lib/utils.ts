import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Validates a post-login redirect target from a `?next=` query param — only a same-site
 *  relative path is ever allowed, guarding against open-redirect via an attacker-supplied
 *  `next=https://evil.example` or protocol-relative `next=//evil.example`. */
export function safeNextPath(next: string | null | undefined, fallback = "/"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("://")) return fallback;
  // Browsers treat "\" like "/", so "/\evil.com" means "//evil.com" (another site), and
  // control characters/whitespace can be stripped into the same thing. Allow only paths that
  // still resolve to this site.
  if (/[\\\u0000-\u001f\s]/.test(next)) return fallback;
  try {
    const resolved = new URL(next, "https://nikscanner.invalid");
    if (resolved.origin !== "https://nikscanner.invalid") return fallback;
    return resolved.pathname + resolved.search + resolved.hash;
  } catch {
    return fallback;
  }
}
