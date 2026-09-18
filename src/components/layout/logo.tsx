import Link from "next/link";
import { ShieldHalf } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 shrink-0", className)}>
      <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-flame-primary/15 border border-flame-primary/30">
        <ShieldHalf className="h-4.5 w-4.5 text-flame-bright" />
      </span>
      <span className="font-heading text-lg font-bold tracking-tight text-white">
        NIK<span className="text-flame-bright">SCANNER</span>
      </span>
    </Link>
  );
}
