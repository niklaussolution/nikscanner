"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { SocialLogin } from "@/components/auth/social-login";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = form.get("password");
    const confirm = form.get("confirmPassword");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);
    // Account creation wires into Auth.js's credentials provider + Prisma
    // adapter once DATABASE_URL and NEXTAUTH_SECRET are configured.
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setError("Account creation is not configured in this environment yet.");
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start scanning for free — no credit card required."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-flame-bright hover:text-flame-primary">
            Log in
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
          <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-muted">
            Full name
          </label>
          <Input id="name" name="name" required placeholder="Jane Doe" />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-muted">
            Email
          </label>
          <Input id="email" name="email" type="email" required placeholder="you@company.com" />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-muted">
            Password
          </label>
          <Input id="password" name="password" type="password" required minLength={8} placeholder="••••••••" />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-medium text-muted">
            Confirm password
          </label>
          <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} placeholder="••••••••" />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Creating account..." : "Create Account"}
        </Button>

        <p className="text-center text-[11px] text-muted">
          By signing up you agree to our{" "}
          <Link href="/legal/terms" className="underline hover:text-white">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/legal/privacy" className="underline hover:text-white">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </AuthCard>
  );
}
