import Link from "next/link";
import { Construction } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ComingSoon({ feature }: { feature: string }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-flame-primary/25 bg-flame-primary/10 text-flame-bright">
        <Construction className="h-6 w-6" />
      </div>
      <h2 className="mt-5 font-heading text-xl font-bold text-white">{feature} is under construction</h2>
      <p className="mt-2 text-sm text-muted">
        This part of NIKSCANNER is still being built. Check back soon, or explore what&apos;s live today.
      </p>
      <Link href="/" className="mt-6">
        <Button variant="outline">Back to Home</Button>
      </Link>
    </div>
  );
}
