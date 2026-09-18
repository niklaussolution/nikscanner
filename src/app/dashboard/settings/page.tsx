import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TOGGLES = [
  { label: "Email notifications for high-risk scans", desc: "Get notified when a scan you ran returns HIGH_RISK or MALICIOUS." },
  { label: "Weekly threat digest", desc: "A summary of trending threats relevant to your region." },
  { label: "Two-factor authentication", desc: "Require a code from your authenticator app at login." },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-white">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {TOGGLES.map((t, i) => (
            <div key={t.label} className="flex items-center justify-between rounded-lg border border-border-subtle bg-card-elevated px-4 py-3">
              <div>
                <p className="text-sm font-medium text-white">{t.label}</p>
                <p className="text-xs text-muted">{t.desc}</p>
              </div>
              <label className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center">
                <input type="checkbox" defaultChecked={i === 0} className="peer sr-only" />
                <span className="h-6 w-11 rounded-full bg-white/10 transition-colors peer-checked:bg-flame-primary" />
                <span className="absolute left-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white">Delete account</p>
            <p className="text-xs text-muted">Permanently remove your account and all associated data.</p>
          </div>
          <Button variant="danger" size="sm">
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
