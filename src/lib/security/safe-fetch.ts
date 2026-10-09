import http from "node:http";
import https from "node:https";
import { guardedLookup } from "@/lib/security/ssrf";

export interface SafeResponse {
  status: number;
  ok: boolean;
  headers: { get(name: string): string | null };
  /** Body as UTF-8, truncated at maxBodyBytes. Empty when readBody was false. */
  body: string;
}

/**
 * Minimal GET for user-supplied URLs. Unlike fetch(), every connection resolves through
 * guardedLookup, so the address actually dialed is the one checked against private/internal
 * ranges — closing the DNS-rebinding gap between assertPublicHostname() and the request.
 * Never follows redirects (callers walk the chain themselves, re-checking each hop).
 */
export function safeFetch(
  url: string,
  { timeoutMs, headers = {}, readBody = false, maxBodyBytes = 512 * 1024 }: {
    timeoutMs: number;
    headers?: Record<string, string>;
    readBody?: boolean;
    maxBodyBytes?: number;
  },
): Promise<SafeResponse> {
  return new Promise((resolve, reject) => {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch (e) {
      return reject(e);
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return reject(new Error(`Unsupported protocol ${parsed.protocol}`));
    }
    const client = parsed.protocol === "https:" ? https : http;

    const req = client.request(
      parsed,
      { method: "GET", headers, lookup: guardedLookup, timeout: timeoutMs },
      (res) => {
        const getHeader = (name: string) => {
          const v = res.headers[name.toLowerCase()];
          return Array.isArray(v) ? v.join(", ") : v ?? null;
        };
        const status = res.statusCode ?? 0;
        const done = (body: string) => resolve({ status, ok: status >= 200 && status < 300, headers: { get: getHeader }, body });

        if (!readBody) {
          res.destroy();
          return done("");
        }
        const chunks: Buffer[] = [];
        let total = 0;
        res.on("data", (chunk: Buffer) => {
          chunks.push(chunk);
          total += chunk.length;
          if (total >= maxBodyBytes) res.destroy();
        });
        res.on("close", () => done(Buffer.concat(chunks).subarray(0, maxBodyBytes).toString("utf-8")));
        res.on("error", () => done(Buffer.concat(chunks).toString("utf-8")));
      },
    );
    const timer = setTimeout(() => req.destroy(Object.assign(new Error("Timed out"), { name: "AbortError" })), timeoutMs);
    req.on("timeout", () => req.destroy(Object.assign(new Error("Timed out"), { name: "AbortError" })));
    req.on("error", (e) => {
      clearTimeout(timer);
      reject(e);
    });
    req.on("close", () => clearTimeout(timer));
    req.end();
  });
}
