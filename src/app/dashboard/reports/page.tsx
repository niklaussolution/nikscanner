import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileWarning } from "lucide-react";

const REPORTS = [
  { url: "fake-bank-login.com", type: "Phishing", status: "Verified", points: 25 },
  { url: "malware-dropper-x.net", type: "Malware", status: "Verified", points: 50 },
  { url: "sketchy-survey-prize.io", type: "Scam", status: "Under Review", points: 0 },
];

export default function ThreatReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Threat Reports</h1>
          <p className="mt-1 text-sm text-muted">URLs you&apos;ve reported to the community intelligence engine.</p>
        </div>
        <Badge variant="neutral">Demo Data</Badge>
      </div>

      {REPORTS.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <FileWarning className="h-8 w-8 text-muted" />
            <p className="mt-3 text-sm text-muted">You haven&apos;t reported any threats yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {REPORTS.map((r) => (
            <Card key={r.url}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="min-w-0">
                  <p className="truncate font-mono text-sm text-white">{r.url}</p>
                  <p className="text-xs text-muted">{r.type}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={r.status === "Verified" ? "success" : "warning"}>{r.status}</Badge>
                  <span className="text-sm font-semibold text-flame-bright">+{r.points} pts</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
