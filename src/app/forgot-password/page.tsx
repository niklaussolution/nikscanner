"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { Loader2, MailCheck } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { firebaseAuth } from "@/lib/firebase/client";
import { firebaseAuthErrorMessage } from "@/lib/firebase/errors";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const email = String(new FormData(e.currentTarget).get("email") ?? "");

    try {
      await sendPasswordResetEmail(firebaseAuth, email);
      setSent(true);
    } catch (err) {
      // Don't leak whether an account exists for this email — only surface errors
      // that aren't about account existence (bad email format, network, rate limit).
      const code = (err as { code?: string })?.code;
      if (code === "auth/user-not-found") {
        setSent(true);
      } else {
        setError(firebaseAuthErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <Link href="/login" className="font-medium text-flame-bright hover:text-flame-primary">
          Back to login
        </Link>
      }
    >
      {sent ? (
        <div className="flex flex-col items-center py-4 text-center">
          <MailCheck className="h-10 w-10 text-success" />
          <p className="mt-4 text-sm text-muted">If an account exists for that email, a reset link is on its way.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-muted">
              Email
            </label>
            <Input id="email" name="email" type="email" required placeholder="you@company.com" />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
