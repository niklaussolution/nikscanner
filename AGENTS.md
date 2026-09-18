# NIKSCANNER

Global cybersecurity scanning & threat-intelligence SaaS. Tagline: "SCAN. DETECT. BLOCK. PROTECT."

## Stack

Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS v4 · Framer Motion · Recharts · Zod · lucide-react

Not yet wired (scaffolded for, see `.env.example`): Prisma + PostgreSQL, Auth.js/NextAuth, Redis, BullMQ, S3, Razorpay.

## Design system

Flame orange (`#FF5A00`) + black (`#050505`) + white, defined as CSS variables/Tailwind v4 `@theme` tokens in
[src/app/globals.css](src/app/globals.css). Fonts: Space Grotesk (headings), Inter (body), JetBrains Mono (code) —
loaded via `next/font/google` in [src/app/layout.tsx](src/app/layout.tsx).

`lucide-react` in this repo is on a version that dropped brand/logo icons (GitHub, X, LinkedIn, YouTube, Slack) —
hand-drawn SVGs for those live in [src/components/ui/social-icons.tsx](src/components/ui/social-icons.tsx). Check
icon existence with `node -e "console.log(!!require('lucide-react').SomeIcon)"` before using a new one.

## Architecture

- `src/components/ui` — shadcn-style primitives (Button, Card, Badge, Input)
- `src/components/scanner` — scan UI (tabs, progress animation, result panel, threat score ring, detection table)
- `src/components/dashboard`, `leaderboard`, `threat-intelligence`, `community`, `developers`, `auth` — feature UI
- `src/lib/providers` — modular threat-intel provider interface (`ScanProvider`), each provider degrades to a
  deterministic demo verdict when its API key env var is unset (never silently fabricates a "real" detection)
- `src/lib/risk-engine` — combines provider verdicts into a 0-100 score / threat level; requires corroboration
  across engines before reaching MALICIOUS
- `src/lib/security/ssrf.ts` — blocks scans against localhost/private/link-local/metadata IP ranges before any
  provider runs (`assertPublicHostname`)
- `src/lib/security/rate-limit.ts` — in-memory sliding-window limiter (swap for Redis in production)
- `src/app/api/scan/url` — the scan endpoint: validate → SSRF check → run providers → risk engine → respond
- `src/app/api/reports/url` — community threat reports go into an in-memory moderation queue
  (`src/lib/moderation/queue.ts`); a single report never flips public reputation
- `src/app/api/keys` — API key generation/listing/revocation; raw key is returned once, only the SHA-256 hash is
  stored (`src/lib/security/api-keys.ts`)
- `prisma/schema.prisma` — full data model for when a real database is wired in

## Conventions

- Marketing/content pages: `<Navbar /> <main> ... </main> <Footer />`, `PageHeader` for the hero band
- Dashboard pages live under `src/app/dashboard/*` and use `DashboardLayout` (sidebar + topbar) automatically
- Anything backed by mock data (dashboard stats, leaderboard, threat feed) shows a "Demo Data" badge — don't remove
  that badge without wiring the real backend
- Run `npm run dev` (dev server config lives in `.claude/launch.json` as `nikscanner-dev`, port 3000)
