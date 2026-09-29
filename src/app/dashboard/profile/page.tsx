"use client";

import { useEffect, useRef, useState } from "react";
import { Trophy, ShieldAlert, Ban, Loader2, Camera, Trash2 } from "lucide-react";
import { updateProfile } from "firebase/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/firebase/auth-context";
import { cn } from "@/lib/utils";
import { authedJson } from "@/lib/firebase/api";
import { COUNTRIES } from "@/lib/data/countries";
import { fileToAvatarDataUrl } from "@/lib/image/avatar";
import { setProfileAvatar, useProfileAvatar } from "@/lib/firebase/use-profile-avatar";
import type { PointsResult, RankResult, UserBlocklistResult, ProfileResult, ProfileUpdateResult, AvatarUpdateResult } from "@/lib/firebase/nikscanner-types";

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
  const [country, setCountry] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { avatar, avatarPublic } = useProfileAvatar();
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Seed the name field once per signed-in user (adjusting state during render, per React's
  // "resetting state when a prop changes" pattern) rather than in an effect.
  const [nameSeededFor, setNameSeededFor] = useState<string | null>(null);
  if (user && nameSeededFor !== user.uid) {
    setNameSeededFor(user.uid);
    setName(user.displayName ?? "");
  }

  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;

    Promise.all([
      authedJson<PointsResult>("/api/points"),
      authedJson<RankResult>("/api/leaderboard/me"),
      authedJson<UserBlocklistResult>("/api/user/blocklist"),
      authedJson<{ scans: { id: string }[] }>("/api/scan/history?severity=threats&limit=200"),
      authedJson<ProfileResult>("/api/user/profile"),
    ])
      .then(([points, rank, blocklist, threats, profile]) => {
        if (cancelled) return;
        setStats({ points: points.points, rank: rank.rank, threats: threats.scans.length, blocked: blocklist.count });
        setCountry(profile.country ?? "");
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load profile stats.");
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  async function updateAvatar(patch: { avatar?: string | null; avatar_public?: boolean }) {
    if (!user) return;
    setAvatarBusy(true);
    setAvatarError(null);
    try {
      const res = await authedJson<AvatarUpdateResult>("/api/user/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      setProfileAvatar(user.uid, { avatar: res.avatar, avatarPublic: res.avatar_public });
    } catch (e) {
      setAvatarError(e instanceof Error ? e.message : "Failed to update profile photo.");
    } finally {
      setAvatarBusy(false);
    }
  }

  async function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;
    try {
      await updateAvatar({ avatar: await fileToAvatarDataUrl(file) });
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Could not read that image.");
    }
  }

  async function handleSave() {
    if (!user) return;
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await updateProfile(user, { displayName: trimmedName });
      // display_name also updates the name shown on the public leaderboard.
      await authedJson<ProfileUpdateResult>("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country, display_name: trimmedName }),
      });
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
            <div className="relative">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element -- user-uploaded data URL
                <img src={avatar} alt="Profile photo" className="h-20 w-20 rounded-full border border-flame-primary/30 object-cover" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-flame-primary/15 text-2xl font-bold text-flame-bright">
                  {initial}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarBusy || !user}
                aria-label={avatar ? "Change profile photo" : "Upload profile photo"}
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-card-bg bg-flame-primary text-white transition-colors hover:bg-flame-bright disabled:opacity-60"
              >
                {avatarBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarFile}
              />
            </div>
            {avatar && (
              <button
                type="button"
                onClick={() => updateAvatar({ avatar: null })}
                disabled={avatarBusy}
                className="mt-2 flex items-center gap-1 text-[11px] text-muted transition-colors hover:text-danger disabled:opacity-60"
              >
                <Trash2 className="h-3 w-3" /> Remove photo
              </button>
            )}
            {avatarError && <p className="mt-2 text-xs text-danger">{avatarError}</p>}
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
            {/* <div className="mt-5 flex gap-2">
              <Trophy className="h-8 w-8 rounded-lg border border-flame-primary/25 bg-flame-primary/10 p-1.5 text-flame-bright" />
              <ShieldAlert className="h-8 w-8 rounded-lg border border-flame-primary/25 bg-flame-primary/10 p-1.5 text-flame-bright" />
              <Ban className="h-8 w-8 rounded-lg border border-flame-primary/25 bg-flame-primary/10 p-1.5 text-flame-bright" />
            </div> */}
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
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={40} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">Email</label>
                <Input value={user?.email ?? ""} type="email" disabled />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">Country</label>
                <Select value={country} onChange={(e) => setCountry(e.target.value)}>
                  <option value="">Not set</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="flex items-start justify-between gap-4 rounded-lg border border-border-subtle p-3">
              <div>
                <p id="avatar-public-label" className="text-sm font-medium text-white">
                  Show my photo on the leaderboard
                </p>
                <p className="text-xs text-muted">
                  {avatar
                    ? "When off, other people see your initials instead of your photo."
                    : "Upload a profile photo first — until then everyone sees your initials."}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={avatarPublic}
                aria-labelledby="avatar-public-label"
                disabled={avatarBusy || !user}
                onClick={() => updateAvatar({ avatar_public: !avatarPublic })}
                className={cn(
                  "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60",
                  avatarPublic ? "bg-flame-primary" : "bg-white/15",
                )}
              >
                <span
                  className={cn(
                    "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                    avatarPublic && "translate-x-5",
                  )}
                />
              </button>
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
