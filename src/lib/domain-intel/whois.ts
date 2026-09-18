/**
 * Real WHOIS lookups over the raw WHOIS protocol (RFC 3912, TCP port 43).
 * Queries IANA's root WHOIS server for the authoritative server for the
 * domain's TLD, then queries that server directly — the standard two-hop
 * WHOIS algorithm, not a hardcoded per-TLD server table. Parsing is
 * best-effort (WHOIS output format varies by registry); unparsed fields
 * come back null rather than guessed.
 */
import net from "node:net";
import { assertPublicHostname } from "@/lib/security/ssrf";

function queryWhoisServer(server: string, query: string, timeoutMs = 6000): Promise<string> {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: server, port: 43 });
    let data = "";
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error("WHOIS query timed out"));
    }, timeoutMs);

    socket.on("connect", () => socket.write(`${query}\r\n`));
    socket.on("data", (chunk) => {
      data += chunk.toString("utf8");
    });
    socket.on("end", () => {
      clearTimeout(timer);
      resolve(data);
    });
    socket.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

function extractField(raw: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = raw.match(pattern);
    if (match?.[1]) {
      const value = match[1].trim();
      if (value && !/^(redacted|not disclosed|data protected)/i.test(value)) return value;
    }
  }
  return null;
}

export interface WhoisInfo {
  registrar: string | null;
  registrantOrg: string | null;
  createdDate: string | null; // ISO string
}

export async function lookupWhois(domain: string): Promise<WhoisInfo | null> {
  try {
    const tld = domain.split(".").pop();
    if (!tld) return null;

    const referral = await queryWhoisServer("whois.iana.org", tld);
    // IANA's TLD referral uses a "whois:" field; some registrars' own
    // responses instead use "refer:" or "ReferralServer:" when chaining.
    const referredServer =
      referral.match(/^whois:\s*(\S+)/im)?.[1] ??
      referral.match(/refer(?:ralserver)?:\s*(?:whois:\/\/)?(\S+)/im)?.[1] ??
      null;

    let raw = referral;
    if (referredServer) {
      const serverCheck = await assertPublicHostname(referredServer);
      if (serverCheck.allowed) {
        raw = await queryWhoisServer(referredServer, domain);
      }
    }

    const registrar = extractField(raw, [/Registrar:\s*(.+)/i, /Sponsoring Registrar:\s*(.+)/i]);
    const registrantOrg = extractField(raw, [/Registrant Organization:\s*(.+)/i, /org:\s*(.+)/i]);
    const createdRaw = extractField(raw, [/Creation Date:\s*(.+)/i, /created:\s*(.+)/i, /Registered on:\s*(.+)/i, /Registered Date:\s*(.+)/i]);

    let createdDate: string | null = null;
    if (createdRaw) {
      const parsed = new Date(createdRaw);
      if (!Number.isNaN(parsed.getTime())) createdDate = parsed.toISOString();
    }

    if (!registrar && !registrantOrg && !createdDate) return null;
    return { registrar, registrantOrg, createdDate };
  } catch {
    return null;
  }
}
