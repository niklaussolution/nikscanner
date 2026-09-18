import { Laptop, Smartphone, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayStoreButton } from "@/components/download/play-store-button";

const DEVICES = [
  { name: "Nik's MacBook Pro", type: "Desktop", icon: Laptop, score: 96, lastSeen: "Active now" },
  { name: "Pixel 8", type: "Mobile", icon: Smartphone, score: 88, lastSeen: "2 hours ago" },
];

export default function DevicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Devices</h1>
          <p className="mt-1 text-sm text-muted">Devices protected by NIKSCANNER.</p>
        </div>
        <Badge variant="neutral">Demo Data</Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {DEVICES.map((d) => (
          <Card key={d.name}>
            <CardContent className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-flame-primary/25 bg-flame-primary/10 text-flame-bright">
                <d.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">{d.name}</p>
                <p className="text-xs text-muted">
                  {d.type} · {d.lastSeen}
                </p>
              </div>
              <div className="text-right">
                <p className="flex items-center gap-1 font-heading text-lg font-bold text-success">
                  <ShieldCheck className="h-4 w-4" /> {d.score}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted">Score</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-muted">Add a new device by installing the NIKSCANNER app.</p>
          <PlayStoreButton />
        </CardContent>
      </Card>
    </div>
  );
}
