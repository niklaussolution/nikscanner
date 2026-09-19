import { firebaseAuth } from "@/lib/firebase/client";
import type { ScanTargetType, ThreatLevel } from "@/types/scan";

const NIKSCANNER_API_BASE_URL = process.env.NEXT_PUBLIC_NIKSCANNER_API_BASE_URL || "";

/** Records a completed scan to the signed-in user's history, powering the dashboard's Scan
 *  History / Threats Report. No-op for signed-out visitors. Best-effort: a logging failure
 *  should never surface as a scan failure to the user. Calls the NIKSCANNER backend directly
 *  (same backend the mobile app uses). */
export async function logScanIfSignedIn(input: {
  target: string;
  targetType: ScanTargetType;
  threatLevel: ThreatLevel;
  score: number;
}): Promise<void> {
  const user = firebaseAuth.currentUser;
  if (!user) return;
  try {
    const token = await user.getIdToken();
    await fetch(`${NIKSCANNER_API_BASE_URL.replace(/\/+$/, "")}/api/scan/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(input),
    });
  } catch {
    // Non-fatal — dashboard history just won't include this one scan.
  }
}
