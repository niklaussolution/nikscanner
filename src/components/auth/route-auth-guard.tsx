"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, ShieldOff } from "lucide-react";
import { signOut, sendPasswordResetEmail } from "firebase/auth";
import { useAuth } from "@/lib/firebase/auth-context";
import { authedJson } from "@/lib/firebase/api";
import { firebaseAuth } from "@/lib/firebase/client";
import type { ProfileResult } from "@/lib/firebase/nikscanner-types";

const PUBLIC_EXACT = new Set([
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/pricing",
  "/about",
  "/blog",
  "/contact",
  "/careers",
  "/threat-intelligence",
  "/community",
]);
const PUBLIC_PREFIXES = ["/legal"];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/** Site-wide auth gate: everything except the homepage, auth flows, legal pages and pricing
 *  requires a signed-in user. Client-side only — this app has no server session (Firebase Auth
 *  client SDK only), so gating happens after hydration once useAuth() resolves, same pattern as
 *  the dashboard's own layout guard. */
export function RouteAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const publicPath = isPublicPath(pathname);
  const [deactivated, setDeactivated] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading && !user && !publicPath) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, publicPath, pathname, router]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    authedJson<ProfileResult>("/api/user/profile")
      .then((res) => {
        if (!cancelled) setDeactivated(res.deactivated);
      })
      .catch(() => {
        if (!cancelled) setDeactivated(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!publicPath && (loading || !user || deactivated === null)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-black text-muted">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!publicPath && deactivated) {
    return <DeactivatedAccountScreen email={user?.email ?? null} onReactivated={() => setDeactivated(false)} />;
  }

  return <>{children}</>;
}

/** Blocks access for a deactivated account without deleting anything — the same email can
 *  always get back in by resetting their password, which also clears the hold server-side. */
function DeactivatedAccountScreen({ email, onReactivated }: { email: string | null; onReactivated: () => void }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReset() {
    setSending(true);
    setError(null);
    try {
      if (email) await sendPasswordResetEmail(firebaseAuth, email);
      await authedJson("/api/user/reactivate", { method: "POST" });
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  async function handleSignOut() {
    await signOut(firebaseAuth);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg-black px-4 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-danger/40 bg-danger/10 text-danger">
        <ShieldOff className="h-6 w-6" />
      </span>
      <h1 className="font-heading text-xl font-bold text-white">This account was deactivated</h1>
      <p className="max-w-md text-sm text-muted">
        {email ? <>The account for <span className="font-semibold text-soft-white">{email}</span> was deactivated</> : "This account was deactivated"}, but
        nothing was deleted. Reset your password to reactivate it and continue.
      </p>

      {sent ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-success">Password reset email sent — your account is reactivated.</p>
          <button
            type="button"
            onClick={onReactivated}
            className="rounded-lg bg-flame-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-flame-bright"
          >
            Continue
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleReset}
          disabled={sending || !email}
          className="rounded-lg bg-flame-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-flame-bright disabled:opacity-60"
        >
          {sending ? "Sending..." : "Reset Password & Reactivate"}
        </button>
      )}
      {error && <p className="text-xs text-danger">{error}</p>}

      <button type="button" onClick={handleSignOut} className="text-xs font-medium text-muted underline hover:text-white">
        Sign out
      </button>
    </div>
  );
}
