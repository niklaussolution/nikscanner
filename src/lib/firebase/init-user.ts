import type { User } from "firebase/auth";

const NIKSCANNER_API_BASE_URL = process.env.NEXT_PUBLIC_NIKSCANNER_API_BASE_URL || "";

/**
 * Calls the NIKSCANNER backend directly (same backend the mobile app uses) right after a
 * successful sign-in, matching the mobile app's "call on every sign-in, no-op once credits
 * exist" pattern. Best-effort: a failure here shouldn't block the user from reaching the app —
 * the same call fires again next sign-in.
 */
export async function initUserAfterAuth(user: User): Promise<void> {
  try {
    const idToken = await user.getIdToken();
    await fetch(`${NIKSCANNER_API_BASE_URL.replace(/\/+$/, "")}/api/user/init`, {
      method: "POST",
      headers: { Authorization: `Bearer ${idToken}` },
    });
  } catch {
    // Non-fatal — credits provisioning will retry on the next sign-in.
  }
}
