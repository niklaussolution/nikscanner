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
  return next;
}
