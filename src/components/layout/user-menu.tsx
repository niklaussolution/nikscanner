"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { LayoutDashboard, LogOut } from "lucide-react";
import type { User } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import { cn } from "@/lib/utils";

export function UserMenu({ user, className }: { user: User; className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const label = user.displayName || user.email || "Account";
  const initial = label.charAt(0).toUpperCase();

  async function handleLogout() {
    setOpen(false);
    await signOut(firebaseAuth);
    router.push("/");
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-flame-primary/15 text-sm font-semibold text-flame-bright ring-1 ring-inset ring-flame-primary/30 transition-colors hover:bg-flame-primary/25"
        aria-label="Account menu"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border-subtle bg-card-bg p-2 shadow-2xl shadow-black/60">
          <div className="truncate px-3 py-2 text-sm text-white">{label}</div>
          <div className="my-1 h-px bg-border-subtle" />
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:bg-white/5 hover:text-white"
          >
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-muted hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}
