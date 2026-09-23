import { assertPublicHostname } from "@/lib/security/ssrf";

// Pure-heuristic (no LLM call) analysis of the final destination page's actual HTML content —
// covers what the structural URL/redirect checks in heuristics.ts and pipeline.ts can't see:
// does the page claim to be a major brand on a domain that isn't theirs, and does it push a
// credential form or an executable download. Streams the response with a hard byte cap so a
// malicious server can't force an unbounded download.

const FETCH_TIMEOUT_MS = 6000;
const MAX_BODY_BYTES = 300 * 1024; // enough for <title> + visible text on essentially any landing page

const BRAND_NAMES = ["google", "paypal", "microsoft", "apple", "amazon", "facebook", "instagram", "netflix", "binance", "chase", "wellsfargo"];

// A title that pairs a brand name with one of these is doing something a reference page never
// does — "PayPal - Wikipedia" and "Amazon.com: Best Sellers" don't say "Sign In" or "Verify",
// but "Netflix - Sign In" does. This is what actually separates an impersonation attempt from a
// legitimate article/store page that happens to name a brand in its own title.
const ACCOUNT_ACTION_PHRASES = ["sign in", "signin", "log in", "login", "verify", "confirm your", "account suspended", "security alert", "update your", "unlock your", "reset your password"];

const EXECUTABLE_EXTENSIONS = [".exe", ".scr", ".apk"];

export interface ContentAnalysisResult {
  fetched: boolean;
  title: string | null;
  /** Brand name found in the page's title/text that the domain doesn't belong to — e.g. a page
   *  titled "Netflix - Sign In" served from a domain that isn't netflix.com. */
  brandMismatch: string | null;
  /** True when the brand appears in the <title> itself — a page's title claiming to BE a brand
   *  ("Netflix - Sign In") is a strong impersonation signal. False means it was only found
   *  somewhere in the body text, which is a much weaker signal on its own: a news article, a
   *  Wikipedia page, or a price-comparison site can legitimately *mention* a dozen brands
   *  without impersonating any of them. */
  brandMismatchInTitle: boolean;
  hasPasswordForm: boolean;
  hasExecutableDownload: boolean;
}

const EMPTY_RESULT: ContentAnalysisResult = {
  fetched: false,
  title: null,
  brandMismatch: null,
  brandMismatchInTitle: false,
  hasPasswordForm: false,
  hasExecutableDownload: false,
};

function extractTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!m) return null;
  const title = m[1].replace(/\s+/g, " ").trim();
  return title ? title.slice(0, 200) : null;
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

function registrableLabel(hostname: string): string {
  const parts = hostname.toLowerCase().split(".");
  return parts.length >= 2 ? parts.slice(-2).join(".") : hostname.toLowerCase();
}

async function readCappedBody(res: Response): Promise<string> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      total += value.length;
      if (total >= MAX_BODY_BYTES) {
        reader.cancel().catch(() => {});
        break;
      }
    }
  }
  return Buffer.concat(chunks.map((c) => Buffer.from(c))).toString("utf-8");
}

/** Fetches and inspects the destination page's actual content — brand-name/domain mismatch,
 *  credential (password) forms, executable download links. Degrades to "not fetched" (never
 *  throws) on any failure — SSRF-blocked host, timeout, non-HTML response, network error — so a
 *  page this can't read just contributes no extra signal instead of failing the whole scan. */
export async function analyzePageContent(url: string): Promise<ContentAnalysisResult> {
  let hostname: string;
  let registrable: string;
  try {
    const parsed = new URL(url);
    hostname = parsed.hostname;
    registrable = registrableLabel(hostname);
  } catch {
    return EMPTY_RESULT;
  }

  const ssrf = await assertPublicHostname(hostname);
  if (!ssrf.allowed) return EMPTY_RESULT;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "manual",
      signal: controller.signal,
      headers: { "User-Agent": "NikScannerBot/1.0 (+https://niklaussolution.com)" },
    });
    if (!res.ok) return EMPTY_RESULT;

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("text/html")) return { ...EMPTY_RESULT, fetched: true };

    const html = await readCappedBody(res);
    const title = extractTitle(html);
    const visibleText = stripTags(html).toLowerCase();
    const titleLower = (title ?? "").toLowerCase();

    const titleHasActionPhrase = ACCOUNT_ACTION_PHRASES.some((p) => titleLower.includes(p));

    let brandMismatch: string | null = null;
    let brandMismatchInTitle = false;
    for (const brand of BRAND_NAMES) {
      if (registrable.includes(brand)) continue;
      // Brand-in-title only counts as the strong signal when paired with an account-action
      // phrase — "Netflix - Sign In", not "PayPal - Wikipedia" or "Amazon.com: Best Sellers".
      if (titleLower.includes(brand) && titleHasActionPhrase) {
        brandMismatch = brand;
        brandMismatchInTitle = true;
        break;
      }
      if (!brandMismatch && (titleLower.includes(brand) || visibleText.includes(brand))) {
        brandMismatch = brand;
      }
    }

    return {
      fetched: true,
      title,
      brandMismatch,
      brandMismatchInTitle,
      hasPasswordForm: /<input[^>]+type\s*=\s*["']?password["']?/i.test(html),
      hasExecutableDownload: EXECUTABLE_EXTENSIONS.some((ext) => new RegExp(`href\\s*=\\s*["'][^"']*\\${ext}(["'?#]|$)`, "i").test(html)),
    };
  } catch {
    return EMPTY_RESULT;
  } finally {
    clearTimeout(timer);
  }
}
