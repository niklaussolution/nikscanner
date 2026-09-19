"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "firebase/auth";
import { Menu, X, ChevronDown, Download } from "lucide-react";
import { Logo } from "./logo";
import { UserMenu } from "./user-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/firebase/auth-context";
import { firebaseAuth } from "@/lib/firebase/client";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  {
    label: "Scanner",
    href: "",
    menu: [
      { label: "URL Scanner", href: "/scanner/url" },
      { label: "File Scanner", href: "/scanner/file" },
      { label: "Domain Scanner", href: "/scanner/domain" },
      { label: "IP Scanner", href: "/scanner/ip" },
      { label: "QR Scanner", href: "/scanner/qr" },
    ],
  },
  { label: "Threat Intelligence", href: "/threat-intelligence" },
  { label: "Community", href: "/community" },
  { label: "Leaderboard", href: "/leaderboard" },
  {
    label: "Developers",
    href: "/developers",
    menu: [
      { label: "API", href: "/api" },
      { label: "Documentation", href: "/docs" },
      { label: "Status", href: "/status" },
    ],
  },
  { label: "Pricing", href: "/pricing" },
];

const AUTH_ONLY_LABELS = new Set(["Leaderboard", "Developers"]);

function isLinkActive(pathname: string, link: (typeof NAV_LINKS)[number]): boolean {
  if (link.href === "/") return pathname === "/";
  if (link.href && (pathname === link.href || pathname.startsWith(`${link.href}/`))) return true;
  return link.menu?.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)) ?? false;
}

export function Navbar({ showLogo = true }: { showLogo?: boolean }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const visibleLinks = NAV_LINKS.filter((link) => !AUTH_ONLY_LABELS.has(link.label) || (!loading && user));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled ? "border-b border-border-subtle bg-black/70 backdrop-blur-xl" : "border-b border-transparent bg-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {showLogo && <Logo />}

        <div className="hidden items-center xl:flex">
          {visibleLinks.map((link) => {
            const active = isLinkActive(pathname, link);
            return (
            <div
              key={link.label}
              className="relative"
              onMouseEnter={() => link.menu && setOpenMenu(link.label)}
              onMouseLeave={() => link.menu && setOpenMenu(null)}
            >
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                  active ? "text-flame-primary" : "text-muted hover:text-white",
                )}
              >
                {link.label}
                {link.menu && <ChevronDown className="h-3.5 w-3.5" />}
                {active && <span aria-hidden className="absolute -bottom-[1px] left-2.5 right-2.5 h-[2px] rounded-full bg-flame-primary" />}
              </Link>
              <AnimatePresence>
                {link.menu && openMenu === link.label && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full w-56 rounded-xl border border-border-subtle bg-card-bg p-2 shadow-2xl shadow-black/60"
                  >
                    {link.menu.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block rounded-lg px-3 py-2 text-sm text-muted hover:bg-white/5 hover:text-white"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            );
          })}
        </div>

        <div className="hidden items-center gap-2 xl:flex">
          {/* <Link href="/download">
            <Button variant="subtle" size="sm">
              <Download className="h-3.5 w-3.5" /> App
            </Button>
          </Link> */}
          {loading ? null : user ? (
            <UserMenu user={user} className="ml-1" />
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="rounded-md p-2 text-white xl:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border-subtle bg-black/95 xl:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {visibleLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  aria-current={isLinkActive(pathname, link) ? "page" : undefined}
                  className={cn(
                    "block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-white/5",
                    isLinkActive(pathname, link) ? "text-flame-primary" : "text-white",
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-3 flex flex-col gap-2 border-t border-border-subtle pt-3">
                {!loading && user ? (
                  <>
                    <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={async () => {
                        await signOut(firebaseAuth);
                        setMobileOpen(false);
                      }}
                    >
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link href="/signup" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full">Get Started</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
