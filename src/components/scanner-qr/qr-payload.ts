export type QrPayloadType = "url" | "wifi" | "contact" | "email" | "phone" | "sms" | "text" | "dangerous";

export const PAYLOAD_TYPE_LABEL: Record<QrPayloadType, string> = {
  url: "URL",
  wifi: "Wi-Fi network",
  contact: "Contact card",
  email: "Email address",
  phone: "Phone number",
  sms: "SMS message",
  text: "Plain text",
  dangerous: "Blocked scheme",
};

const DANGEROUS_SCHEME_RE = /^(javascript|data|file|vbscript):/i;

/**
 * Classifies a decoded QR payload. Only "url" payloads are ever sent to a
 * reputation provider — Wi-Fi credentials, contact cards, SMS bodies, etc.
 * stay entirely local, matching the "never send non-URL payloads to a
 * reputation API" requirement.
 */
export function classifyPayload(value: string): QrPayloadType {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return "url";
  if (DANGEROUS_SCHEME_RE.test(trimmed)) return "dangerous";
  if (/^WIFI:/i.test(trimmed)) return "wifi";
  if (/^BEGIN:VCARD/i.test(trimmed) || /^MECARD:/i.test(trimmed)) return "contact";
  if (/^mailto:/i.test(trimmed)) return "email";
  if (/^tel:/i.test(trimmed)) return "phone";
  if (/^(smsto|sms):/i.test(trimmed)) return "sms";
  return "text";
}

/** Re-validates that a URL is safe to actually open — never trust the classifier result alone at open-time. */
export function isSafeToOpen(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function safeHostname(value: string): string | null {
  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}
