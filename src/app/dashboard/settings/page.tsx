"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authedJson } from "@/lib/firebase/api";
import { firebaseAuth } from "@/lib/firebase/client";

export default function SettingsPage() {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "Delete your account? You'll be signed out everywhere (web and mobile). Nothing is erased — sign back in with the same email and reset your password to reactivate and continue.",
    );
    if (!confirmed) return;

    setDeleting(true);
    setError(null);
    try {
      await authedJson("/api/user/deactivate", { method: "POST" });
      await signOut(firebaseAuth);
      router.push("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to deactivate account.");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-white">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white">Delete account</p>
            <p className="text-xs text-muted">
              Signs you out everywhere and blocks access until you reset your password — nothing is deleted.
            </p>
            {error && <p className="mt-1 text-xs text-danger">{error}</p>}
          </div>
          <Button variant="danger" size="sm" onClick={handleDeleteAccount} disabled={deleting}>
            {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
            {deleting ? "Deactivating..." : "Delete Account"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
