"use client";

import { ImageIcon, RefreshCw, X, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

export function SelectedQrPreview({
  file,
  decoding,
  decoded,
  onReplace,
  onRemove,
  busy,
}: {
  file: File;
  decoding: boolean;
  decoded: boolean;
  onReplace: () => void;
  onRemove: () => void;
  busy: boolean;
}) {
  return (
    <div
      data-file-preview
      className="mt-4 flex flex-col gap-3 rounded-xl border border-[var(--border-muted)] bg-[var(--surface-soft)] p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--orange)]/25 bg-[var(--orange)]/10 text-[var(--orange-light)]">
          <ImageIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[var(--white)]">{file.name}</p>
          <p className="text-xs text-[var(--text-muted)]">{formatBytes(file.size)}</p>
        </div>
        <span
          className={cn(
            "ml-1 flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
            decoded
              ? "border-[var(--safe)]/40 bg-[var(--safe)]/10 text-[var(--safe)]"
              : "border-[var(--border)] bg-black/30 text-[var(--text-muted)]",
          )}
        >
          {decoding ? <LoaderCircle className="h-3 w-3 animate-spin" /> : null}
          {decoding ? "Decoding" : decoded ? "Decoded" : "Pending"}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
        <button
          type="button"
          onClick={onReplace}
          disabled={busy}
          className="flex h-11 min-h-[44px] items-center gap-1.5 rounded-lg border border-[var(--border)] px-3.5 text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)] transition-colors hover:text-[var(--white)] disabled:opacity-50"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Replace
        </button>
        <button
          type="button"
          onClick={onRemove}
          disabled={busy}
          aria-label="Remove QR image"
          className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] transition-colors hover:text-[var(--white)] disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
