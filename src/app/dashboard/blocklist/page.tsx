"use client";

import { useEffect, useState } from "react";
import { Ban, Copy, Check, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/firebase/auth-context";
import { authedJson } from "@/lib/firebase/api";
import type { BlocklistEntry } from "@/lib/firebase/nikscanner-types";

export default function BlocklistPage() {
  const { user, loading: authLoading } = useAuth();
  const [entries, setEntries] = useState<BlocklistEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;

    authedJson<{ entries: BlocklistEntry[] }>("/api/user/blocklist")
      .then((res) => {
        if (!cancelled) setEntries(res.entries);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load blocklist.");
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  function handleCopy(url: string) {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl((c) => (c === url ? null : c)), 1500);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">My Blocklist</h1>
        <p className="mt-1 text-sm text-muted">URLs you&apos;ve reported and blocked.</p>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {!entries ? (
        <Card>
          <CardContent className="flex items-center justify-center gap-2 py-16 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading blocklist...
          </CardContent>
        </Card>
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <Ban className="h-8 w-8 text-muted" />
            <p className="mt-3 text-sm text-muted">Your blocklist is empty.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {entries.map((b) => (
            <Card key={b.url}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-mono text-sm text-white">{b.url}</p>
                    <Badge variant="danger">{b.category}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted">Blocked {new Date(b.reported_at).toLocaleString()}</p>
                </div>
                <Button variant="ghost" size="sm" aria-label="Copy URL" onClick={() => handleCopy(b.url)}>
                  {copiedUrl === b.url ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
