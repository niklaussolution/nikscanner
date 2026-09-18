"use client";

import { Ban, Copy, RefreshCcw, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const BLOCKED = [
  { url: "invoice-payment-portal.net", reason: "Flagged keywords + community reports", type: "Phishing", date: "2026-09-15", score: 91 },
  { url: "free-gift-card-claim.info", reason: "Suspicious redirect chain", type: "Scam", date: "2026-09-13", score: 78 },
  { url: "update-your-billing.net", reason: "Credential theft pattern", type: "Credential Theft", date: "2026-09-10", score: 84 },
];

export default function BlocklistPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">My Blocklist</h1>
          <p className="mt-1 text-sm text-muted">URLs you&apos;ve blocked from scan results.</p>
        </div>
        <Badge variant="neutral">Demo Data</Badge>
      </div>

      {BLOCKED.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <Ban className="h-8 w-8 text-muted" />
            <p className="mt-3 text-sm text-muted">Your blocklist is empty.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {BLOCKED.map((b) => (
            <Card key={b.url}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-mono text-sm text-white">{b.url}</p>
                    <Badge variant="danger">{b.type}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {b.reason} · Score {b.score} · Blocked {b.date}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" aria-label="Copy URL">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" aria-label="Re-scan">
                    <RefreshCcw className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" aria-label="Remove">
                    <Trash2 className="h-4 w-4 text-danger" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
