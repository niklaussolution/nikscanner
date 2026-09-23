import { firebaseAuth } from "@/lib/firebase/client";

const NIKSCANNER_API_BASE_URL = process.env.NEXT_PUBLIC_NIKSCANNER_API_BASE_URL || "";

/** Queues a malicious URL to the shared community blocklist, mirroring the mobile app's
 *  auto-report step (a fresh MALICIOUS verdict that isn't already a known community hit gets
 *  queued automatically). No-op for signed-out visitors — the backend's /api/report requires
 *  a Firebase ID token — and non-fatal on failure: the scan result already displayed either way. */
export async function autoReportIfSignedIn(url: string, category: string): Promise<void> {
  const user = firebaseAuth.currentUser;
  if (!user) return;
  try {
    const token = await user.getIdToken();
    await fetch(`${NIKSCANNER_API_BASE_URL.replace(/\/+$/, "")}/api/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ url, category }),
    });
  } catch {
    // Non-fatal — this link just isn't queued to the shared blocklist yet.
  }
}
