"use client";

import { useEffect, useState } from "react";
import { Trophy, ShieldAlert, Ban, Loader2 } from "lucide-react";
import { updateProfile } from "firebase/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/firebase/auth-context";
import { authedJson } from "@/lib/firebase/api";
import type { PointsResult, RankResult, UserBlocklistResult } from "@/lib/firebase/nikscanner-types";

interface ProfileStats {
  points: number;
  rank: number | null;
  threats: number;
  blocked: number;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) setName(user.displayName ?? "");
  }, [user]);

  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;

    Promise.all([
      authedJson<PointsResult>("/api/points"),
      authedJson<RankResult>("/api/leaderboard/me"),
      authedJson<UserBlocklistResult>("/api/user/blocklist"),
      authedJson<{ scans: { id: string }[] }>("/api/scan/history?severity=threats&limit=200"),
    ])
      .then(([points, rank, blocklist, threats]) => {
        if (cancelled) return;
        setStats({ points: points.points, rank: rank.rank, threats: threats.scans.length, blocked: blocklist.count });
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load profile stats.");
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    try {
      await updateProfile(user, { displayName: name.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  const label = user?.displayName || user?.email || "Account";
  const initial = label.charAt(0).toUpperCase();
  const joined = user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : null;
  const provider = user?.providerData[0]?.providerId === "google.com" ? "Google" : "Email";

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-white">Profile</h1>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center py-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-flame-primary/15 text-2xl font-bold text-flame-bright">
              {initial}
            </div>
            <p className="mt-4 font-heading text-lg font-bold text-white">{label}</p>
            <p className="text-xs text-muted">
              {provider} account{joined ? ` · Joined ${joined}` : ""}
            </p>
            <div className="mt-4 flex gap-2">
              <Badge variant="flame">{stats?.rank ? `Rank #${stats.rank}` : "Unranked"}</Badge>
              <Badge variant="neutral">{stats ? `${stats.points} pts` : "—"}</Badge>
            </div>
            {!stats ? (
              <div className="mt-6 flex items-center gap-2 text-xs text-muted">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading stats...
              </div>
            ) : (
              <div className="mt-6 grid w-full grid-cols-2 gap-2 text-center">
                <div>
                  <p className="font-heading text-lg font-bold text-white">{stats.threats}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted">Threats Found</p>
                </div>
                <div>
                  <p className="font-heading text-lg font-bold text-white">{stats.blocked}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted">Blocked</p>
                </div>
              </div>
            )}
            <div className="mt-5 flex gap-2">
              <Trophy className="h-8 w-8 rounded-lg border border-flame-primary/25 bg-flame-primary/10 p-1.5 text-flame-bright" />
              <ShieldAlert className="h-8 w-8 rounded-lg border border-flame-primary/25 bg-flame-primary/10 p-1.5 text-flame-bright" />
              <Ban className="h-8 w-8 rounded-lg border border-flame-primary/25 bg-flame-primary/10 p-1.5 text-flame-bright" />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">Full Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">Email</label>
                <Input value={user?.email ?? ""} type="email" disabled />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleSave} disabled={saving || !user}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              {saved && <span className="text-xs text-success">Saved.</span>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
