"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { SocialLogin } from "@/components/auth/social-login";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Auth.js/NextAuth credentials sign-in wires in here once NEXTAUTH_SECRET
    // and a database adapter are configured — see .env.example.
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setError("Authentication is not configured in this environment yet.");
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
      <SocialLogin />
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

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Signing in..." : "Log In"}
        </Button>
      </form>
    </AuthCard>
  );
}
