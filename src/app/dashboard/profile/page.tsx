import { Trophy, ShieldCheck, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-white">Profile</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center py-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-flame-primary/15 text-2xl font-bold text-flame-bright">
              N
            </div>
            <p className="mt-4 font-heading text-lg font-bold text-white">niklaus</p>
            <p className="text-xs text-muted">🌍 Global · Joined Sep 2026</p>
            <div className="mt-4 flex gap-2">
              <Badge variant="flame">Rank #148</Badge>
              <Badge variant="neutral">2,310 pts</Badge>
            </div>
            <div className="mt-6 grid w-full grid-cols-3 gap-2 text-center">
              <div>
                <p className="font-heading text-lg font-bold text-white">86</p>
                <p className="text-[10px] uppercase tracking-wider text-muted">Threats</p>
              </div>
              <div>
                <p className="font-heading text-lg font-bold text-white">74</p>
                <p className="text-[10px] uppercase tracking-wider text-muted">Verified</p>
              </div>
              <div>
                <p className="font-heading text-lg font-bold text-white">3</p>
                <p className="text-[10px] uppercase tracking-wider text-muted">Badges</p>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <Trophy className="h-8 w-8 rounded-lg border border-flame-primary/25 bg-flame-primary/10 p-1.5 text-flame-bright" />
              <ShieldCheck className="h-8 w-8 rounded-lg border border-flame-primary/25 bg-flame-primary/10 p-1.5 text-flame-bright" />
              <Award className="h-8 w-8 rounded-lg border border-flame-primary/25 bg-flame-primary/10 p-1.5 text-flame-bright" />
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
                <Input defaultValue="Niklaus" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">Username</label>
                <Input defaultValue="niklaus" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">Email</label>
                <Input defaultValue="niklaus@nikscanner.com" type="email" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">Country</label>
                <Input defaultValue="Global" />
              </div>
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
