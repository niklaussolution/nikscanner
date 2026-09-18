/** Rough homograph/confusable-domain heuristic: non-ASCII or punycode labels. */
export function looksConfusable(hostname: string): boolean {
  return /[^\x00-\x7f]/.test(hostname) || hostname.split(".").some((label) => label.startsWith("xn--"));
}

export function openSafely(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer");
}
