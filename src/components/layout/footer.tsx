import Link from "next/link";
import { Logo } from "./logo";
import { GithubIcon, LinkedinIcon, XIcon, YoutubeIcon } from "@/components/ui/social-icons";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "URL Scanner", href: "/scanner/url" },
      { label: "File Scanner", href: "/scanner/file" },
      { label: "Threat Intelligence", href: "/threat-intelligence" },
      { label: "Community", href: "/community" },
      { label: "Leaderboard", href: "/leaderboard" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/legal/privacy" },
      { label: "Terms", href: "/legal/terms" },
      { label: "Responsible Disclosure", href: "/legal/disclosure" },
    ],
  },
];

const SOCIAL = [
  { icon: GithubIcon, href: "https://github.com" },
  { icon: LinkedinIcon, href: "https://linkedin.com" },
  { icon: XIcon, href: "https://x.com" },
  { icon: YoutubeIcon, href: "https://youtube.com" },
];

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-secondary-dark">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted">
              Global threat intelligence and scanning platform. Know before you click.
            </p>
            <div className="mt-5 flex gap-3">
              {SOCIAL.map(({ icon: Icon, href }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-muted transition-colors hover:border-flame-primary/40 hover:text-flame-bright"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold uppercase tracking-widest text-white">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-muted transition-colors hover:text-flame-bright">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border-subtle pt-6 sm:flex-row">
          <p className="text-xs text-muted">© {new Date().getFullYear()} NIKSCANNER. All rights reserved.</p>
          <p className="font-mono text-xs text-muted">SCAN. DETECT. BLOCK. PROTECT.</p>
        </div>
      </div>
    </footer>
  );
}
