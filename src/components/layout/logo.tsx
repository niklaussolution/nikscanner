// import Link from "next/link";
// import { ShieldHalf } from "lucide-react";
// import { cn } from "@/lib/utils";
// import Image from "next/image";
// import logoImg from '@/app/04-ember-pulse-navbar-logo.png'

// export function Logo({ className }: { className?: string }) {
//   return (
//     <Link href="/" className={cn("flex items-center gap-2 shrink-0", className)}>
//       {/* <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-flame-primary/15 border border-flame-primary/30">
//         <ShieldHalf className="h-4.5 w-4.5 text-flame-bright" />
//       </span> */}
//       {/* <span className="font-heading text-lg font-bold tracking-tight text-white">
//         NIK<span className="text-flame-bright">SCANNER</span>
//       </span> */}

//       <Image src={logoImg} alt="NIKSCANNER" priority className="w-60" />
//     </Link>
//   );
// }




import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import logoImg from "@/app/nikscanner-logo.png";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label="NIKSCANNER home" className={cn("flex items-center gap-2 shrink-0", className)}>
      {/* Icon + "NIKSCANNER" wordmark, both from the source logo file, on every screen size */}
      <Image src={logoImg} alt="NIKSCANNER" priority className="h-7 w-auto sm:h-8 md:h-10" />
    </Link>
  );
}
