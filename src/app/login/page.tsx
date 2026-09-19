"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { Loader2 } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { SocialLogin } from "@/components/auth/social-login";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { firebaseAuth } from "@/lib/firebase/client";
import { firebaseAuthErrorMessage } from "@/lib/firebase/errors";
import { initUserAfterAuth } from "@/lib/firebase/init-user";
import { safeNextPath } from "@/lib/utils";

const googleProvider = new GoogleAuthProvider();

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destination = safeNextPath(searchParams.get("next"));
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    try {
      const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      await initUserAfterAuth(credential.user);
      router.push(destination);
    } catch (err) {
      setError(firebaseAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError(null);
    try {
      const credential = await signInWithPopup(firebaseAuth, googleProvider);
      await initUserAfterAuth(credential.user);
      router.push(destination);
    } catch (err) {
      setError(firebaseAuthErrorMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to your NIKSCANNER account."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-flame-bright hover:text-flame-primary">
            Sign up
          </Link>
        </>
      }
    >
      <SocialLogin onGoogleClick={handleGoogleSignIn} loading={googleLoading} />
      <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-widest text-muted">
        <span className="h-px flex-1 bg-border-subtle" /> or <span className="h-px flex-1 bg-border-subtle" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-muted">
            Email
          </label>
          <Input id="email" name="email" type="email" required placeholder="you@company.com" />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-xs font-medium text-muted">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs text-flame-bright hover:text-flame-primary">
              Forgot password?
            </Link>
          </div>
          <Input id="password" name="password" type="password" required placeholder="••••••••" />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" className="w-full" size="lg" disabled={loading || googleLoading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Signing in..." : "Log In"}
        </Button>
      </form>
    </AuthCard>
  );
}
