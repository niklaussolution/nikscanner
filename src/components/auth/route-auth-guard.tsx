"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";

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

  useEffect(() => {
    if (!loading && !user && !publicPath) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, publicPath, pathname, router]);

  if (!publicPath && (loading || !user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-black text-muted">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
