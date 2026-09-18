import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Webhook, MessageSquare, Mail } from "lucide-react";

const INTEGRATIONS = [
  { icon: Webhook, name: "Webhooks", desc: "Push scan results to your own endpoint in real time.", connected: false },
  { icon: MessageSquare, name: "Slack", desc: "Get high-risk scan alerts posted to a channel.", connected: false },
  { icon: Mail, name: "Email Digest", desc: "Daily summary of threats detected on your account.", connected: true },
];

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">Integrations</h1>
        <p className="mt-1 text-sm text-muted">Connect NIKSCANNER to your existing tools.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {INTEGRATIONS.map((i) => (
          <Card key={i.name}>
            <CardContent className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-flame-primary/25 bg-flame-primary/10 text-flame-bright">
                <i.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-white">{i.name}</p>
                  {i.connected && <Badge variant="success">Connected</Badge>}
                </div>
                <p className="mt-1 text-xs text-muted">{i.desc}</p>
                <Button variant={i.connected ? "outline" : "subtle"} size="sm" className="mt-3">
                  {i.connected ? "Manage" : "Connect"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
