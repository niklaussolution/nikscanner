import type { ScanEvidence } from "@/types/scan";
import { isShortenerHost } from "./shorteners";
import { scoreUrlHeuristics } from "./heuristics";
import { resolveRedirectChain, type RedirectHop } from "./redirect-chain";
import { checkBlocklist } from "./blocklist";
import { analyzePageContent } from "./content-analysis";

// Ports the mobile app's UrlScanner.kt pipeline (unmask -> blocklist -> heuristics -> follow
// redirects -> re-check the final destination -> long-chain penalty -> verdict) to the website.

const LONG_CHAIN_HOP_THRESHOLD = 3;
const LONG_CHAIN_PENALTY = 15;
const SHORTENER_RISK_BUMP = 15;
const MALICIOUS_THRESHOLD = 85;
const SUSPICIOUS_THRESHOLD = 45;

/** A blocklist hit "sets" risk to one of two tiers depending on category — malicious/phishing
 *  reports are treated as confirmed-bad (100), tracking/suspicious reports as a lesser signal (70). */
function riskFromCategory(category: string): number {
  return category === "malicious" || category === "phishing" ? 100 : 70;
}

export type UrlPipelineVerdict = "CLEAN" | "SUSPICIOUS" | "MALICIOUS";

export interface UrlPipelineResult {
  score: number;
  verdict: UrlPipelineVerdict;
  evidence: ScanEvidence[];
  unmasked: boolean;
  finalUrl: string;
  redirectChain: RedirectHop[];
  blocklistHit: boolean;
  /** Display name of whoever first reported this URL to the community blocklist — null unless
   *  blocklistHit is true. */
  blockedBy: string | null;
  /** Category to auto-report if the verdict is MALICIOUS and this wasn't already a known
   *  community hit — null when auto-reporting shouldn't happen. */
  autoReportCategory: string | null;
}

export async function runUrlScanPipeline(rawUrl: string): Promise<UrlPipelineResult> {
  const evidence: ScanEvidence[] = [];
  let risk = 0;
  let blocklistHit = false;

  let entryUrl: URL;
  try {
    entryUrl = new URL(rawUrl);
  } catch {
    return {
      score: 0,
      verdict: "CLEAN",
      evidence: [],
      unmasked: false,
      finalUrl: rawUrl,
      redirectChain: [],
      blocklistHit: false,
      blockedBy: null,
      autoReportCategory: null,
    };
  }

  // Step 1: unmask — flag known shorteners with a small risk bump; the entry link still gets
  // fully heuristic-scored below and the redirect chain always runs, so nothing about the scan
  // is skipped just because the link is masked.
  const isShortener = isShortenerHost(entryUrl.hostname);
  if (isShortener) {
    risk += SHORTENER_RISK_BUMP;
    evidence.push({
      label: "Link shortener",
      value: `${entryUrl.hostname} is a known link shortener — following the real destination below`,
      tone: "warn",
    });
  }

  // Step 2: community blocklist check on the entry URL.
  const entryBlocklist = await checkBlocklist(entryUrl.toString());
  let blockedBy: string | null = null;
  if (entryBlocklist?.hit && entryBlocklist.category) {
    blocklistHit = true;
    blockedBy = entryBlocklist.blockedBy ?? null;
    risk += riskFromCategory(entryBlocklist.category);
    evidence.push({
      label: "Community blocklist",
      value: `Already reported by ${entryBlocklist.blockedBy ?? "a community member"} as ${entryBlocklist.category}`,
      tone: "bad",
    });
  }

  // Step 3: heuristic scoring of the entry URL. Always runs, even for a shortener/tunnel/masked
  // link — the entry link itself can carry its own risk signals (e.g. a tunnel host, a
  // credential-harvesting path) independent of whatever the redirect chain resolves to, so a
  // scan can't skip straight past it.
  const entryHeuristics = scoreUrlHeuristics(entryUrl);
  risk += entryHeuristics.score;
  for (const f of entryHeuristics.findings) evidence.push({ label: f.label, value: f.value, tone: f.tone });

  // Step 4: follow the full redirect chain.
  const chain = await resolveRedirectChain(entryUrl.toString());
  if (chain.looped) evidence.push({ label: "Redirect chain", value: "Redirect loop detected", tone: "bad" });
  if (chain.timedOut) evidence.push({ label: "Redirect chain", value: "A hop in the redirect chain timed out", tone: "warn" });
  if (chain.blockedBySsrf) {
    evidence.push({ label: "Redirect chain", value: "A hop redirected into blocked internal network space", tone: "bad" });
  }
  if (chain.dnsFailed) {
    // A weaker signal than an actual SSRF block — dead/expired domains aren't always
    // malicious, but throwaway phishing infrastructure (temp tunnels, burner domains) often
    // stops resolving shortly after use.
    risk += 10;
    evidence.push({ label: "Redirect chain", value: "One of the hosts in the chain does not resolve", tone: "warn" });
  }
  if (chain.fetchFailed) {
    // The host resolves but refused the connection, dropped it, or failed TLS — distinct from
    // a clean 4xx/5xx response, and worth surfacing rather than silently landing on a `null`
    // status hop with no explanation.
    risk += 10;
    evidence.push({ label: "Redirect chain", value: "A hop's connection failed (refused, dropped, or a TLS error)", tone: "warn" });
  }

  // Step 5: repeat blocklist + heuristic scoring on the final destination, if different.
  let finalCategory: string | null = entryBlocklist?.hit ? entryBlocklist.category ?? null : null;
  if (chain.finalUrl !== entryUrl.toString()) {
    const finalBlocklist = await checkBlocklist(chain.finalUrl);
    if (finalBlocklist?.hit && finalBlocklist.category) {
      blocklistHit = true;
      finalCategory = finalBlocklist.category;
      blockedBy = finalBlocklist.blockedBy ?? blockedBy;
      risk += riskFromCategory(finalBlocklist.category);
      evidence.push({
        label: "Community blocklist",
        value: `Final destination reported by ${finalBlocklist.blockedBy ?? "a community member"} as ${finalBlocklist.category}`,
        tone: "bad",
      });
    }

    try {
      const finalUrlObj = new URL(chain.finalUrl);
      const finalHeuristics = scoreUrlHeuristics(finalUrlObj);
      risk += finalHeuristics.score;
      for (const f of finalHeuristics.findings) {
        evidence.push({ label: `Destination: ${f.label}`, value: f.value, tone: f.tone });
      }
    } catch {
      // Malformed final URL (e.g. a stalled redirect chain) — nothing more to score.
    }
  }

  // Step 5b: inspect the final destination's actual page content — a pure-heuristic reading (no
  // LLM call) of what the structural checks above can't see: does the page claim to be a major
  // brand the domain doesn't belong to, does it push a credential form, does it offer an
  // executable download. Runs on whatever the final URL is, entry or redirected.
  const content = await analyzePageContent(chain.finalUrl);
  if (content.brandMismatch && content.brandMismatchInTitle) {
    // The page's own <title> claims to be a brand it doesn't belong to — a strong signal
    // ("Netflix - Sign In" served from a random domain).
    risk += 40;
    evidence.push({
      label: "Brand impersonation",
      value: `Page title claims to be "${content.brandMismatch}" but the domain isn't theirs (title: "${content.title}")`,
      tone: "bad",
    });
  } else if (content.brandMismatch) {
    // Only found in body text — much weaker on its own (a news article, a Wikipedia page, a
    // price-comparison site can legitimately mention a brand without impersonating it), so this
    // contributes a small amount rather than the full penalty.
    risk += 10;
    evidence.push({
      label: "Page content",
      value: `Page text mentions "${content.brandMismatch}", which isn't this domain's brand`,
      tone: "warn",
    });
  }
  if (content.hasPasswordForm) {
    risk += 10;
    evidence.push({ label: "Page content", value: "Page contains a password login form", tone: "warn" });
  }
  if (content.hasExecutableDownload) {
    risk += 25;
    evidence.push({ label: "Page content", value: "Page links directly to an executable download (.exe/.scr/.apk)", tone: "bad" });
  }

  // Step 6: long-chain penalty — more than 3 hops, and not already blocklisted, is a common
  // evasion pattern on its own.
  if (chain.hopCount > LONG_CHAIN_HOP_THRESHOLD && !blocklistHit) {
    risk += LONG_CHAIN_PENALTY;
    evidence.push({
      label: "Redirect chain",
      value: `${chain.hopCount} redirects followed — unusually long chains are a common evasion pattern`,
      tone: "warn",
    });
  }

  risk = Math.max(0, Math.min(100, Math.round(risk)));

  // Step 7: verdict thresholds.
  const verdict: UrlPipelineVerdict = risk >= MALICIOUS_THRESHOLD ? "MALICIOUS" : risk >= SUSPICIOUS_THRESHOLD ? "SUSPICIOUS" : "CLEAN";

  // Step 8: auto-report eligibility — only for a fresh MALICIOUS verdict, not one that was
  // already a known community hit.
  const autoReportCategory = verdict === "MALICIOUS" && !blocklistHit ? finalCategory ?? "malicious" : null;

  return {
    score: risk,
    verdict,
    evidence,
    unmasked: isShortener,
    finalUrl: chain.finalUrl,
    redirectChain: chain.hops,
    blocklistHit,
    blockedBy,
    autoReportCategory,
  };
}
