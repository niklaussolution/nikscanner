import { firebaseAuth } from "@/lib/firebase/client";

const NIKSCANNER_API_BASE_URL = process.env.NEXT_PUBLIC_NIKSCANNER_API_BASE_URL || "";

/** Builds an absolute URL against the NIKSCANNER backend (same backend the mobile app uses).
 *  Called directly from the browser — the backend allowlists this site's origin via CORS. */
function nikscannerUrl(path: string): string {
  return `${NIKSCANNER_API_BASE_URL.replace(/\/+$/, "")}${path}`;
}

/** Fetches a NIKSCANNER backend path with the signed-in user's Firebase ID token attached —
 *  throws if nobody's signed in, since every route behind this expects a user. */
export async function authedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error("Not signed in.");
  const token = await user.getIdToken();
  return fetch(nikscannerUrl(path), {
    ...init,
    headers: { ...(init.headers || {}), Authorization: `Bearer ${token}` },
  });
}

export async function authedJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await authedFetch(path, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data as T;
}

/** Unauthenticated fetch against the NIKSCANNER backend (e.g. the public plan catalog). */
export async function publicJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(nikscannerUrl(path), init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data as T;
}
