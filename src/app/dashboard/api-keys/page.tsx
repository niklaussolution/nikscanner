"use client";

import { useEffect, useState } from "react";
import { KeyRound, Plus, Trash2, Copy, Check, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SafeKey {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  requestCount: number;
  revoked: boolean;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<SafeKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newRawKey, setNewRawKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function loadKeys() {
    setLoading(true);
    const res = await fetch("/api/keys");
    const data = await res.json();
    setKeys(data.keys ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // Fetch-on-mount — loadKeys sets loading/keys state as its data arrives.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadKeys();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    const res = await fetch("/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    const data = await res.json();
    setCreating(false);
    if (res.ok) {
      setNewRawKey(data.rawKey);
      setName("");
      loadKeys();
    }
  }

  async function handleRevoke(id: string) {
    await fetch(`/api/keys/${id}`, { method: "DELETE" });
    loadKeys();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">API Keys</h1>
          <p className="mt-1 text-sm text-muted">Manage keys for programmatic access to the NIKSCANNER API.</p>
        </div>
      </div>

      <Card>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Key name (e.g. Production Server)"
              className="flex-1"
            />
            <Button type="submit" disabled={creating || !name.trim()}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Generate Key
            </Button>
          </form>

          {newRawKey && (
            <div className="mt-4 rounded-lg border border-flame-primary/30 bg-flame-primary/5 p-4">
              <p className="text-xs font-semibold text-flame-bright">
                Copy this key now — it won&apos;t be shown again.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 truncate rounded bg-black/40 px-3 py-2 font-mono text-xs text-white">{newRawKey}</code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(newRawKey);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading keys...
        </div>
      ) : keys.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <KeyRound className="h-8 w-8 text-muted" />
            <p className="mt-3 text-sm text-muted">No API keys yet. Generate one to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {keys.map((k) => (
            <Card key={k.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white">{k.name}</p>
                    {k.revoked && <Badge variant="danger">Revoked</Badge>}
                  </div>
                  <p className="mt-1 font-mono text-xs text-muted">
                    {k.keyPrefix}••••••••••••••• · {k.requestCount} requests · Last used{" "}
                    {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : "never"}
                  </p>
                </div>
                {!k.revoked && (
                  <Button variant="ghost" size="sm" onClick={() => handleRevoke(k.id)}>
                    <Trash2 className="h-4 w-4 text-danger" /> Revoke
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
