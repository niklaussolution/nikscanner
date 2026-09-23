import { authedJson } from "@/lib/firebase/api";
import type { ConsumeCreditResult } from "@/lib/firebase/nikscanner-types";

/** Deducts a scan allowance before a real scan runs — URL scans cost credits (2 each,
 *  server-decided), file scans draw down file_scans_allowed/file_scans_used. The server is the
 *  only source of truth for whether the user actually has the allowance; this never trusts a
 *  locally-cached balance. Callers should treat `allowed: false` as "stop and send the user to
 *  billing," not as an error to retry. */
export async function consumeCredit(type: "url_scan" | "file_scan"): Promise<ConsumeCreditResult> {
  return authedJson<ConsumeCreditResult>("/api/credits/consume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type }),
  });
}
