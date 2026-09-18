import { PlayCircle } from "lucide-react";

export function PlayStoreButton() {
  const playStoreUrl = process.env.NEXT_PUBLIC_PLAY_STORE_URL;

  if (!playStoreUrl) {
    return (
      <div className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-card-bg px-5 py-3 opacity-70">
        <PlayCircle className="h-8 w-8 text-muted" />
        <div className="text-left">
          <p className="text-[10px] uppercase tracking-wider text-muted">Available on</p>
          <p className="font-heading text-sm font-semibold text-muted">Google Play — Coming Soon</p>
        </div>
      </div>
    );
  }

  return (
    <a
      href={playStoreUrl}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-3 rounded-xl border border-flame-primary/40 bg-card-bg px-5 py-3 transition-colors hover:border-flame-primary/70 hover:bg-card-elevated"
    >
      <PlayCircle className="h-8 w-8 text-flame-bright" />
      <div className="text-left">
        <p className="text-[10px] uppercase tracking-wider text-muted">Download on Google Play</p>
        <p className="font-heading text-sm font-semibold text-white">NIKSCANNER</p>
      </div>
    </a>
  );
}
