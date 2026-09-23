import net from "node:net";

// Mirrors PhishingHeuristics.kt from the mobile app: no network access, pure signal-based
// scoring on the URL's own structure. Each triggered check contributes points that sum into
// the overall risk score computed by the pipeline.

const HIGH_ABUSE_TLDS = new Set([
  "tk",
  "xyz",
  "click",
  "top",
  "gq",
  "ml",
  "cf",
  "work",
  "live",
  "icu",
  "buzz",
  "cam",
  "cyou",
  "rest",
  "quest",
  "bid",
  "loan",
  "download",
  "stream",
  "gdn",
  "cc",
  "ru",
]);

const BRAND_DOMAINS = [
  "google.com",
  "paypal.com",
  "microsoft.com",
  "apple.com",
  "amazon.com",
  "facebook.com",
  "instagram.com",
  "netflix.com",
  "binance.com",
  "chase.com",
  "wellsfargo.com",
];

const TRACKING_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
  "gclid",
  "msclkid",
  "mc_eid",
];

const CREDENTIAL_PATH_KEYWORDS = ["/login", "/signin", "/verify", "/wallet", "/secure", "/account", "/update", "/confirm", "/reset", "/password"];

const TUNNEL_HOSTS = ["ngrok.io", "ngrok-free.app", "ngrok.app", "trycloudflare.com", "loca.lt", "serveo.net", "localtunnel.me", "pagekite.me"];

function registrableLabel(host: string): string {
  const parts = host.split(".");
  return parts.length >= 2 ? parts.slice(-2).join(".") : host;
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

// Common leetspeak/homoglyph digit substitutions used to disguise a brand name in a domain
// label (e.g. "faceb00k" for "facebook"). Applied before both the edit-distance and
// substring brand checks so those substitutions don't defeat detection.
const LEETSPEAK_MAP: Record<string, string> = { "0": "o", "1": "l", "3": "e", "4": "a", "5": "s", "7": "t", "$": "s" };
function deleet(s: string): string {
  return s.replace(/[013457$]/g, (c) => LEETSPEAK_MAP[c] ?? c);
}

const BRAND_NAMES = BRAND_DOMAINS.map((d) => d.replace(/\.[a-z]+$/, ""));

/** Closest known brand domain if `host` is within edit-distance 2 of it but not the real
 *  thing — a typosquat/brand-impersonation signal. Null if no close brand is found. Three
 *  checks, all skipped only when the host's actual registrable domain (last two labels) truly
 *  is the brand's own domain — legitimate subdomains like mail.google.com must never trigger:
 *  1. Whole registrable domain within edit distance 2 (catches "faceboook.com").
 *  2. Brand name glued to generic words in the registrable domain's own label (catches
 *     "facebook-security.com" / "secure-paypal-login.net").
 *  3. Brand name used as a DECOY subdomain of an unrelated domain (catches
 *     "accounts.google.com.evil.tk", where the real domain is evil.tk) — this is exactly the
 *     case #2 must not fire on for a real google.com subdomain, so it only runs once we already
 *     know the registrable domain isn't the brand's.
 *  Leetspeak-normalized throughout. */
function detectTyposquat(host: string): string | null {
  const registrable = registrableLabel(host);
  if (BRAND_DOMAINS.includes(registrable)) return null;

  const candidate = deleet(registrable);
  for (let i = 0; i < BRAND_DOMAINS.length; i++) {
    const distance = levenshtein(candidate, BRAND_DOMAINS[i]);
    if (distance > 0 && distance <= 2) return BRAND_DOMAINS[i];
  }
  for (let i = 0; i < BRAND_NAMES.length; i++) {
    if (candidate.includes(BRAND_NAMES[i])) return BRAND_DOMAINS[i];
  }

  const labels = deleet(host).split(".");
  for (let i = 0; i < BRAND_NAMES.length; i++) {
    if (labels.includes(BRAND_NAMES[i])) return BRAND_DOMAINS[i];
  }
  return null;
}

/** A dotted-quad-looking prefix (e.g. "192.168.1.1.") in front of the real domain — a
 *  deception technique that makes a URL look like it points at a raw IP/internal address at a
 *  glance, when the actual host is whatever follows. */
function hasFakeIpSubdomain(host: string): boolean {
  return /^(\d{1,3}\.){4}/.test(host) && !net.isIP(host);
}

/** Flags punycode/IDN domains as a homograph risk. Real mixed-script (Cyrillic "а" for Latin
 *  "a") detection needs a full Unicode-skeleton comparison; as a practical approximation this
 *  flags any IDN label since `new URL()` already normalizes unicode hosts to their `xn--`
 *  punycode form before heuristics ever see the hostname. */
function isConfusableHost(host: string): boolean {
  return host.split(".").some((label) => label.startsWith("xn--"));
}

function hasTrackingParams(url: URL): boolean {
  return TRACKING_PARAMS.some((p) => url.searchParams.has(p));
}

export interface HeuristicFinding {
  label: string;
  value: string;
  tone: "warn" | "bad";
  points: number;
}

export interface HeuristicResult {
  score: number;
  findings: HeuristicFinding[];
}

export function scoreUrlHeuristics(url: URL): HeuristicResult {
  const findings: HeuristicFinding[] = [];
  const host = url.hostname.toLowerCase();
  const path = url.pathname.toLowerCase();

  if (url.protocol !== "https:") {
    findings.push({
      label: "Connection",
      value: url.protocol === "http:" ? "Plain HTTP, not encrypted" : `Non-standard scheme (${url.protocol})`,
      tone: "warn",
      points: 10,
    });
  }

  if (net.isIP(host)) {
    findings.push({ label: "Host", value: "Raw IP address used instead of a domain", tone: "bad", points: 20 });
  } else if (hasFakeIpSubdomain(host)) {
    findings.push({
      label: "Host",
      value: "Domain is disguised behind a fake IP-address-looking prefix",
      tone: "bad",
      points: 20,
    });
  }

  const tld = host.split(".").pop() ?? "";
  if (HIGH_ABUSE_TLDS.has(tld)) {
    findings.push({ label: "Domain TLD", value: `.${tld} is a high-abuse top-level domain`, tone: "warn", points: 15 });
  }

  if (url.username || url.password) {
    findings.push({ label: "Credentials in URL", value: "URL embeds a username/password", tone: "bad", points: 25 });
  }

  if (isConfusableHost(host)) {
    findings.push({ label: "Homograph domain", value: "Punycode/IDN domain — may be mimicking a trusted brand", tone: "bad", points: 30 });
  }

  const typosquat = detectTyposquat(host);
  if (typosquat) {
    findings.push({ label: "Brand impersonation", value: `Looks like a typosquat of ${typosquat}`, tone: "bad", points: 35 });
  }

  if (hasTrackingParams(url)) {
    findings.push({ label: "Tracking parameters", value: "URL carries ad/click-tracking parameters", tone: "warn", points: 5 });
  }

  const credPathHit = CREDENTIAL_PATH_KEYWORDS.some((k) => path.includes(k));
  if (credPathHit) {
    findings.push({
      label: "Path signals",
      value: "Path contains credential-harvesting keywords (login/verify/wallet/secure...)",
      tone: "warn",
      points: 15,
    });
  }

  if (HIGH_ABUSE_TLDS.has(tld) && credPathHit) {
    findings.push({
      label: "Compound risk",
      value: `A credential-harvesting path on a high-abuse .${tld} domain is a classic phishing pattern`,
      tone: "bad",
      points: 20,
    });
  }

  const isTunnel = TUNNEL_HOSTS.some((t) => host === t || host.endsWith(`.${t}`));
  if (isTunnel) {
    findings.push({
      label: "Hosting",
      value: "Served from a temporary tunnel host (ngrok/Cloudflare Tunnel/...)",
      tone: "bad",
      points: credPathHit ? 35 : 20,
    });
  }

  if (path.includes("/cgi-bin/webscr") && !host.endsWith("paypal.com")) {
    findings.push({
      label: "Phishing template",
      value: "Uses PayPal's classic webscr phishing path on a non-PayPal domain",
      tone: "bad",
      points: 40,
    });
  }

  if (host.split(".").some((label) => label.includes("-"))) {
    findings.push({ label: "Domain structure", value: "Hyphenated domain label", tone: "warn", points: 5 });
  }

  const score = findings.reduce((sum, f) => sum + f.points, 0);
  return { score, findings };
}
