/**
 * Domain hostname validation. Deliberately isomorphic (no Node built-ins)
 * so the same function drives the client-side "validating" state and the
 * server-side gate before any WHOIS/DNS/TLS lookup runs.
 *
 * Uses the WHATWG URL constructor to strip protocol/path/query/credentials
 * and to safely punycode-encode Unicode hostnames, rather than hand-rolled
 * string surgery on a loose regex.
 */

const LABEL_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/i;
const IPV4_RE = /^\d{1,3}(\.\d{1,3}){3}$/;

export interface DomainValidationResult {
  ok: boolean;
  hostname?: string;
  error?: string;
}

function looksLikeIpAddress(hostname: string): boolean {
  if (IPV4_RE.test(hostname)) return true;
  if (hostname.includes(":")) return true; // IPv6 literal (URL wraps these in brackets, hostname keeps the colons)
  return false;
}

export function normalizeAndValidateDomain(input: string): DomainValidationResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: "Enter a domain to scan." };
  if (/\s/.test(trimmed)) return { ok: false, error: "Domain cannot contain spaces." };
  if (/[<>"'`]/.test(trimmed)) return { ok: false, error: "Domain contains invalid characters." };

  let candidate = trimmed;
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return { ok: false, error: "Enter a valid domain." };
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    return { ok: false, error: "Unsupported protocol." };
  }
  if (url.username || url.password) {
    return { ok: false, error: "Enter a root domain without credentials." };
  }
  if (url.pathname && url.pathname !== "/") {
    return { ok: false, error: "Enter a root domain without a path." };
  }
  if (url.search) {
    return { ok: false, error: "Enter a root domain without a query string." };
  }

  const hostname = url.hostname.toLowerCase();
  if (!hostname) return { ok: false, error: "Enter a valid domain." };
  if (looksLikeIpAddress(hostname)) return { ok: false, error: "Enter a domain name, not an IP address." };
  if (hostname.length > 253) return { ok: false, error: "Domain name is too long." };

  const labels = hostname.split(".");
  if (labels.length < 2) return { ok: false, error: "Enter a full domain, e.g. example.com." };

  for (const label of labels) {
    if (label.length === 0 || label.length > 63) {
      return { ok: false, error: "Domain contains a label that's empty or over 63 characters." };
    }
    if (!LABEL_RE.test(label) && !label.startsWith("xn--")) {
      return { ok: false, error: "Domain contains an invalid character." };
    }
  }

  return { ok: true, hostname };
}
